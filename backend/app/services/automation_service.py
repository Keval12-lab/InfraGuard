import logging
import json
import time
import urllib.request
import threading
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from ..database.db import (
    get_automations,
    get_automation_by_id,
    create_automation_run,
    update_automation_run,
    get_automation_runs_history,
    log_timeline_event
)
from .workspace_service import run_ping_tool
from .discovery_service import execute_subnet_discovery, detect_local_subnet
from .timeline_service import record_event

logger = logging.getLogger("infraguard.automation")


def fetch_all_automations() -> List[Dict[str, Any]]:
    """
    Returns list of automations with parsed tasks.
    """
    autos = get_automations()
    for a in autos:
        if a.get("tasks_json"):
            a["tasks"] = json.loads(a["tasks_json"])
    return autos


def fetch_runs_history() -> List[Dict[str, Any]]:
    """
    Returns lists of executed runs history.
    """
    runs = get_automation_runs_history()
    for r in runs:
        if r.get("results_json"):
            r["results"] = json.loads(r["results_json"])
    return runs


def start_automation_run(automation_id: int) -> int:
    """
    Triggers an automation run in the background.
    """
    auto_meta = get_automation_by_id(automation_id)
    if not auto_meta:
        raise ValueError(f"Automation template #{automation_id} not found.")

    # Create run entry in status RUNNING
    run_id = create_automation_run(automation_id, status="RUNNING")

    # Start execution loop in non-blocking daemon thread
    thread = threading.Thread(target=_execute_automation_loop, args=(run_id, auto_meta))
    thread.daemon = True
    thread.start()

    return run_id


def _execute_automation_loop(run_id: int, auto_meta: Dict[str, Any]):
    """
    Executes the automation task items in a separate background thread.
    """
    start_time = time.time()
    results = []
    status = "SUCCESS"

    tasks = json.loads(auto_meta["tasks_json"])

    # Log start to central timeline
    record_event(
        event_type="DISCOVERY",
        severity="INFO",
        title=f"Automation Engine Initiated: {auto_meta['name']}",
        description=f"Running {len(tasks)} automated health checks/scans in the background."
    )

    for idx, t in enumerate(tasks):
        task_type = t.get("type")
        target = t.get("target")
        label = t.get("label", f"Task #{idx + 1}")

        task_res = {
            "label": label,
            "type": task_type,
            "target": target,
            "success": False,
            "output": "",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        try:
            if task_type == "ping":
                # Run standard ping check
                res = run_ping_tool(target, count=2)
                task_res["success"] = res.get("success", False)
                task_res["output"] = res.get("output", "No response")
            elif task_type == "http":
                # Simple HTTP status check
                try:
                    req = urllib.request.Request(target, headers={'User-Agent': 'InfraGuard-Automation'})
                    with urllib.request.urlopen(req, timeout=4) as response:
                        code = response.status
                        task_res["success"] = (200 <= code < 400)
                        task_res["output"] = f"HTTP request returned status code: {code}"
                except Exception as he:
                    task_res["success"] = False
                    task_res["output"] = f"HTTP check failed: {str(he)}"
            elif task_type == "discovery":
                # Subnet Discovery Scan
                target_cidr = target
                if not target_cidr:
                    det = detect_local_subnet()
                    target_cidr = det.get("detected_cidr") or "192.168.29.0/24"
                
                scan_res = execute_subnet_discovery(target_cidr)
                task_res["success"] = True
                task_res["output"] = f"Subnet sweep completed. Found {len(scan_res.get('devices', []))} active assets."
            else:
                task_res["success"] = False
                task_res["output"] = f"Unsupported task type: {task_type}"

        except Exception as e:
            logger.error(f"Automation execution task error: {e}")
            task_res["success"] = False
            task_res["output"] = f"System Error executing task: {str(e)}"
            status = "FAILED"

        results.append(task_res)
        if not task_res["success"]:
            # One fail doesn't stop, but overall status is warning/fail
            status = "FAILED"

    duration = int(time.time() - start_time)

    # Save to SQLite
    update_automation_run(
        run_id=run_id,
        status=status,
        results_json=json.dumps(results),
        duration_seconds=duration
    )

    # Final event logged to timeline
    record_event(
        event_type="DISCOVERY" if status == "SUCCESS" else "MONITORING",
        severity="SUCCESS" if status == "SUCCESS" else "WARNING",
        title=f"Automation Engine Finished: {auto_meta['name']}",
        description=f"Status: {status} | Processed {len(tasks)} tasks in {duration}s.",
        metadata={
            "run_id": run_id,
            "automation_id": auto_meta["id"],
            "duration_seconds": duration,
            "results": results
        }
    )
