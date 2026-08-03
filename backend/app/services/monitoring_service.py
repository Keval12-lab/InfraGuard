import time
import re
import socket
import platform
import threading
import subprocess
import concurrent.futures
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple

from ..config import MONITORING_INTERVAL, MONITORING_PACKETS
from ..database.db import (
    get_all_assets,
    update_device_monitoring_status,
)
from ..utils.security import validate_target_address

logger = logging.getLogger("infraguard.monitoring")

_monitoring_thread: Optional[threading.Thread] = None
_monitoring_started: bool = False
_thread_lock = threading.Lock()


def ping_and_measure_quality(ip_str: str, packets: int = MONITORING_PACKETS) -> Tuple[str, Optional[float], float]:
    """
    Pings an IP address measuring round-trip latency (ms) and packet loss (%).
    Applies business rules:
    - Healthy: Reachable, Latency < 100ms, Packet loss < 10%
    - Warning: Reachable, Latency >= 100ms OR Packet loss >= 10%
    - Offline: Unreachable / 100% packet loss
    """
    if not validate_target_address(ip_str):
        logger.warning(f"[Security Warning] Blocked invalid monitor target IP/hostname: '{ip_str}'")
        return "Offline", 0.0, 100.0

    system_os = platform.system().lower()
    if system_os == "windows":
        cmd = ["ping", "-n", str(packets), "-w", "1000", ip_str]
    else:
        cmd = ["ping", "-c", str(packets), "-W", "1", ip_str]

    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=(packets * 1.5) + 1.0)
        output = res.stdout or ""

        if res.returncode != 0 and "Received = 0" in output:
            return "Offline", 0.0, 100.0

        # Parse Packet Loss
        loss = 100.0
        loss_match = re.search(r"(\d+)%\s*(?:packet\s*)?loss", output, re.IGNORECASE)
        if loss_match:
            loss = float(loss_match.group(1))

        # Parse Latency
        latency: Optional[float] = None
        if system_os == "windows":
            lat_match = re.search(r"Average\s*=\s*(\d+)ms", output, re.IGNORECASE)
            if lat_match:
                latency = float(lat_match.group(1))
        else:
            lat_match = re.search(r"rtt min/avg/max/mdev = [\d\.]+/([\d\.]+)/", output)
            if lat_match:
                latency = float(lat_match.group(1))

        if loss >= 100.0 or latency is None:
            return "Offline", 0.0, 100.0

        # Apply Business Rules
        if latency >= 100.0 or loss >= 10.0:
            status = "Warning"
        else:
            status = "Healthy"

        return status, latency, loss
    except Exception as e:
        logger.debug(f"Ping quality measurement exception for {ip_str}: {e}")
        return "Offline", 0.0, 100.0


def run_monitoring_cycle():
    """
    Executes a single monitoring cycle across all stored assets in SQLite.
    """
    start_time = datetime.now(timezone.utc)
    try:
        assets = get_all_assets()
        if not assets:
            logger.info("[Monitoring Cycle] No stored assets found in repository to check.")
            return

        logger.info(f"[Monitoring Cycle] Starting health check for {len(assets)} stored assets.")
        now_iso = start_time.isoformat()
        updated_count = 0

        def check_asset(asset: Dict[str, Any]):
            asset_id = asset["id"]
            ip = asset["ip_address"]
            status, latency, loss = ping_and_measure_quality(ip)
            update_device_monitoring_status(
                device_id=asset_id,
                status=status,
                latency_ms=latency,
                packet_loss=loss,
                last_monitor_time=now_iso
            )
            logger.info(
                f"[Device Updated] Asset #{asset_id} ({ip}) -> Status: {status} | Latency: {latency or 0}ms | Loss: {loss}%"
            )
            return asset_id

        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(check_asset, a) for a in assets]
            for future in concurrent.futures.as_completed(futures):
                try:
                    future.result()
                    updated_count += 1
                except Exception as e:
                    logger.error(f"[Monitoring Error] Error monitoring individual asset: {e}")

        logger.info(f"[SQLite Write] Recorded monitoring check for {updated_count} devices into monitoring_history.")
    except Exception as e:
        logger.error(f"[Monitoring Error] Failed executing monitoring cycle: {e}")


def monitoring_background_loop():
    """
    Continuous background loop running monitoring cycles every MONITORING_INTERVAL seconds.
    """
    logger.info(f"[Monitoring Started] Background monitoring loop initiated (Interval: {MONITORING_INTERVAL}s).")
    while True:
        try:
            run_monitoring_cycle()
        except Exception as e:
            logger.error(f"[Monitoring Error] Exception inside background loop: {e}")
        time.sleep(MONITORING_INTERVAL)


def start_monitoring_engine():
    """
    Starts the background monitoring engine daemon thread if not already running.
    Prevents duplicate background threads.
    """
    global _monitoring_thread, _monitoring_started
    with _thread_lock:
        if _monitoring_started:
            logger.debug("[Monitoring] Background monitoring thread already active.")
            return

        _monitoring_started = True
        _monitoring_thread = threading.Thread(
            target=monitoring_background_loop,
            name="InfraGuard-Monitoring-Engine",
            daemon=True
        )
        _monitoring_thread.start()
        logger.info("[Monitoring Started] Monitoring daemon thread spawned successfully.")
