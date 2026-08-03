import logging
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from ..database.db import (
    get_runbooks,
    get_runbook_by_id,
    create_runbook_execution,
    update_runbook_execution,
    get_runbook_execution,
    get_runbook_executions_history,
    get_asset_passport
)
from .workspace_service import run_ping_tool, run_port_check_tool, send_wake_on_lan_tool
from .timeline_service import record_event

logger = logging.getLogger("infraguard.runbook")


def fetch_all_runbooks() -> List[Dict[str, Any]]:
    """
    Returns list of runbooks with steps parsed.
    """
    books = get_runbooks()
    for b in books:
        if b.get("steps_json"):
            b["steps"] = json.loads(b["steps_json"])
    return books


def start_runbook_session(runbook_id: int, device_id: Optional[int]) -> Dict[str, Any]:
    """
    Starts an interactive runbook execution trace.
    """
    exec_id = create_runbook_execution(runbook_id, device_id)
    exec_data = get_runbook_execution(exec_id)
    
    # Parse JSON properties
    if exec_data:
        exec_data["steps"] = json.loads(exec_data["steps_json"])
        exec_data["answers"] = json.loads(exec_data["answers_json"])
        exec_data["logs"] = json.loads(exec_data["logs_json"])

    return exec_data


def process_runbook_step(exec_id: int, choice_index: Optional[int], notes: Optional[str] = None) -> Dict[str, Any]:
    """
    Processes the selection made by the user, runs automated workspace tool triggers,
    and advances the troubleshooter to the next node.
    """
    exec_data = get_runbook_execution(exec_id)
    if not exec_data:
        raise ValueError(f"Execution #{exec_id} not found.")

    steps = json.loads(exec_data["steps_json"])
    answers = json.loads(exec_data["answers_json"])
    logs = json.loads(exec_data["logs_json"])
    current_index = exec_data["current_step_index"]

    current_node = next((s for s in steps if s["step_index"] == current_index), None)
    if not current_node:
        raise ValueError(f"Step index {current_index} not found in runbook.")

    # Record User Notes if any
    if notes:
        logs.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": "engineer_note",
            "message": f"Technician Note: {notes}"
        })

    next_step_index = current_index
    status = "RUNNING"

    # Process choice and get next target step index
    if choice_index is not None and "choices" in current_node and len(current_node["choices"]) > choice_index:
        selected_choice = current_node["choices"][choice_index]
        answers.append({
            "step_index": current_index,
            "question": current_node["question"],
            "selected_label": selected_choice["label"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        next_step_index = selected_choice["next_step"]
    elif not current_node.get("choices"):
        # Terminal step reached
        status = "COMPLETED"

    # If the NEXT node requests an automated Workspace Diagnostic Tool: run it!
    next_node = next((s for s in steps if s["step_index"] == next_step_index), None)
    automated_tool_output = None

    if next_node and next_node.get("tool_type") and status == "RUNNING":
        tool = next_node["tool_type"]
        device_id = exec_data["device_id"]
        
        # Get target IP
        target_ip = next_node.get("tool_target")
        target_mac = None
        if not target_ip and device_id:
            device_passport = get_asset_passport(device_id)
            if device_passport:
                target_ip = device_passport.get("ip_address")
                target_mac = device_passport.get("mac_address")

        if not target_ip:
            target_ip = "127.0.0.1"

        logs.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": "auto_tool_start",
            "message": f"Launching automated Workspace tool: {tool.upper()} for destination: {target_ip}..."
        })

        try:
            if tool == "ping":
                res = run_ping_tool(target_ip, count=2)
                automated_tool_output = res.get("output", "")
                success = res.get("success", False)
            elif tool == "port-check":
                port = next_node.get("tool_port", 80)
                res = run_port_check_tool(target_ip, port)
                automated_tool_output = res.get("output", "")
                success = res.get("success", False)
            elif tool == "wol":
                mac = target_mac or "AA:BB:CC:DD:EE:FF"
                res = send_wake_on_lan_tool(mac)
                automated_tool_output = res.get("output", "")
                success = res.get("success", False)
            else:
                automated_tool_output = "Unknown workspace diagnostic tool requested."
                success = False

            logs.append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "type": "auto_tool_result",
                "message": f"Tool Output:\n{automated_tool_output}",
                "success": success
            })
        except Exception as te:
            logger.error(f"Error executing runbook auto tool: {te}")
            logs.append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "type": "auto_tool_error",
                "message": f"Failed to execute diagnostic: {str(te)}"
            })

    # If the next node has no choices left, mark complete
    if next_node and not next_node.get("choices"):
        status = "COMPLETED"

    # Calculate duration
    start_time = datetime.fromisoformat(exec_data["executed_at"]).replace(tzinfo=timezone.utc)
    duration_sec = int((datetime.now(timezone.utc) - start_time).total_seconds())

    # Save update
    update_runbook_execution(
        exec_id=exec_id,
        status=status,
        current_step_index=next_step_index,
        answers_json=json.dumps(answers),
        logs_json=json.dumps(logs),
        duration_seconds=duration_sec
    )

    # Auto-log completed execution to the Timeline Engine!
    if status == "COMPLETED":
        record_event(
            event_type="WORKSPACE",
            severity="SUCCESS" if "resolved" in next_node["question"].lower() or "complete" in next_node["question"].lower() else "WARNING",
            title=f"Troubleshooter Runbook Completed: {exec_data['name']}",
            description=f"Runbook session #{exec_id} resolved with status node: '{next_node['question']}'. Consumed {duration_sec}s.",
            device_id=exec_data["device_id"],
            metadata={
                "runbook_id": exec_data["runbook_id"],
                "exec_id": exec_id,
                "duration_seconds": duration_sec,
                "last_step": next_node["question"]
            }
        )

    # Return refreshed execution trace
    refreshed = get_runbook_execution(exec_id)
    if refreshed:
        refreshed["steps"] = json.loads(refreshed["steps_json"])
        refreshed["answers"] = json.loads(refreshed["answers_json"])
        refreshed["logs"] = json.loads(refreshed["logs_json"])
        if automated_tool_output:
            refreshed["automated_tool_output"] = automated_tool_output
    return refreshed


def fetch_runbook_executions() -> List[Dict[str, Any]]:
    """
    Returns history feed of runbook executions.
    """
    hist = get_runbook_executions_history()
    for h in hist:
        h["answers"] = json.loads(h["answers_json"]) if h.get("answers_json") else []
        h["logs"] = json.loads(h["logs_json"]) if h.get("logs_json") else []
    return hist
