import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .core import get_db_connection

logger = logging.getLogger("infraguard.database.assets")


def save_discovery_results(results: Dict[str, Any]) -> int:
    """
    Saves scan history and upserts discovered devices into SQLite database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    subnet = results.get("subnet", "Unknown")
    total_scanned = results.get("total_scanned", 0)
    active_found = results.get("active_found", 0)
    unreachable_count = results.get("unreachable_count", max(0, total_scanned - active_found))
    duration_seconds = results.get("duration_seconds", 0.0)
    scanned_at = results.get("scanned_at") or datetime.now(timezone.utc).isoformat()

    # 1. Insert discovery history record
    cursor.execute("""
        INSERT INTO discovery_history (subnet, total_scanned, active_found, unreachable_count, duration_seconds, scanned_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (subnet, total_scanned, active_found, unreachable_count, duration_seconds, scanned_at))

    history_id = cursor.lastrowid

    # 2. Upsert each discovered device
    devices = results.get("devices", [])
    now_iso = datetime.now(timezone.utc).isoformat()
    upserted_count = 0

    for dev in devices:
        ip = dev.get("ip_address")
        if not ip:
            continue

        hostname = dev.get("hostname") or "Not Available"
        dev_name = dev.get("device_name") or "Not Available"
        vendor = dev.get("vendor") or "Unknown"
        if vendor == "Local Host":
            vendor = "Unknown"
        dev_type = dev.get("device_type") or "Unknown"
        status = dev.get("status") or ("Healthy" if dev.get("reachable", True) else "Offline")
        last_seen = dev.get("last_seen") or dev.get("discovery_timestamp") or now_iso

        # Check existing device
        cursor.execute("SELECT id, discovery_count FROM devices WHERE ip_address = ?", (ip,))
        row = cursor.fetchone()

        if row:
            curr_count = (row["discovery_count"] or 1) + 1
            cursor.execute("""
                UPDATE devices
                SET hostname = ?, device_name = ?, vendor = ?, device_type = ?, status = ?,
                    last_seen = ?, last_discovery = ?, discovery_count = ?, updated_at = ?
                WHERE ip_address = ?
            """, (hostname, dev_name, vendor, dev_type, status, last_seen, scanned_at, curr_count, now_iso, ip))
        else:
            cursor.execute("""
                INSERT INTO devices (
                    ip_address, hostname, device_name, vendor, device_type, status,
                    first_seen, last_seen, last_discovery, discovery_count, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (ip, hostname, dev_name, vendor, dev_type, status, last_seen, last_seen, scanned_at, 1, now_iso, now_iso))

        upserted_count += 1

    conn.commit()
    conn.close()
    logger.info(f"[SQLite Write] Upserted {upserted_count} asset records into devices table (Scan ID: #{history_id}).")
    return history_id


def get_all_assets(
    search: Optional[str] = None,
    status: Optional[str] = None,
    vendor: Optional[str] = None,
    device_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Fetches all asset records with optional filtering.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM devices WHERE 1=1"
    params = []

    if search and search.strip():
        term = f"%{search.strip()}%"
        query += " AND (ip_address LIKE ? OR hostname LIKE ? OR device_name LIKE ? OR vendor LIKE ?)"
        params.extend([term, term, term, term])

    if status and status.strip() and status.upper() != "ALL":
        query += " AND status LIKE ?"
        params.append(f"{status.strip()}%")

    if vendor and vendor.strip() and vendor.upper() != "ALL":
        query += " AND vendor LIKE ?"
        params.append(f"{vendor.strip()}%")

    if device_type and device_type.strip() and device_type.upper() != "ALL":
        query += " AND device_type LIKE ?"
        params.append(f"{device_type.strip()}%")

    query += " ORDER BY last_seen DESC, id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_asset_by_id(asset_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetches a single asset record by primary key ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM devices WHERE id = ?", (asset_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_device_monitoring_status(
    device_id: int,
    status: str,
    latency_ms: Optional[float],
    packet_loss: float,
    last_monitor_time: str
):
    """
    Updates status, latency, packet loss, availability percentage, and last_seen for a monitored asset.
    Calculates running availability_percent from historic monitoring checks.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Calculate availability percent from monitoring_history
    cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status != 'Offline' THEN 1 ELSE 0 END) as online FROM monitoring_history WHERE device_id = ?", (device_id,))
    stats_row = cursor.fetchone()
    total_checks = (stats_row["total"] or 0) + 1
    online_checks = (stats_row["online"] or 0) + (1 if status != "Offline" else 0)
    avail_percent = round((online_checks / total_checks) * 100.0, 1)

    now_iso = datetime.now(timezone.utc).isoformat()

    if status != "Offline":
        cursor.execute("""
            UPDATE devices
            SET status = ?, latency_ms = ?, packet_loss = ?, availability_percent = ?,
                last_seen = ?, last_monitor_time = ?, updated_at = ?
            WHERE id = ?
        """, (status, latency_ms or 0.0, packet_loss, avail_percent, now_iso, last_monitor_time, now_iso, device_id))
    else:
        cursor.execute("""
            UPDATE devices
            SET status = ?, latency_ms = 0.0, packet_loss = ?, availability_percent = ?,
                last_monitor_time = ?, updated_at = ?
            WHERE id = ?
        """, (status, packet_loss, avail_percent, last_monitor_time, now_iso, device_id))

    # Insert into monitoring_history
    cursor.execute("""
        INSERT INTO monitoring_history (device_id, status, latency_ms, packet_loss, checked_at)
        VALUES (?, ?, ?, ?, ?)
    """, (device_id, status, latency_ms or 0.0, packet_loss, last_monitor_time))

    conn.commit()
    conn.close()


def get_monitoring_history_by_device(device_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Returns monitoring history records for a specified device_id.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM monitoring_history
        WHERE device_id = ?
        ORDER BY id DESC
        LIMIT ?
    """, (device_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_monitoring_summary() -> Dict[str, Any]:
    """
    Returns monitoring summary metrics across all devices.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as cnt FROM devices WHERE status IN ('Healthy', 'ONLINE', 'HEALTHY')")
    healthy_cnt = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM devices WHERE status LIKE 'Warning%'")
    warning_cnt = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM devices WHERE status IN ('Offline', 'OFFLINE', 'UNREACHABLE')")
    offline_cnt = cursor.fetchone()["cnt"]

    cursor.execute("SELECT AVG(latency_ms) as avg_lat FROM devices WHERE status != 'Offline' AND latency_ms > 0")
    avg_lat_row = cursor.fetchone()
    avg_latency = round(avg_lat_row["avg_lat"], 2) if avg_lat_row and avg_lat_row["avg_lat"] is not None else 0.0

    cursor.execute("SELECT AVG(packet_loss) as avg_loss FROM devices")
    avg_loss_row = cursor.fetchone()
    avg_loss = round(avg_loss_row["avg_loss"], 1) if avg_loss_row and avg_loss_row["avg_loss"] is not None else 0.0

    conn.close()

    return {
        "healthy_count": healthy_cnt,
        "warning_count": warning_cnt,
        "offline_count": offline_cnt,
        "avg_latency_ms": avg_latency,
        "avg_packet_loss_percent": avg_loss
    }


def get_discovery_history(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Fetches recent discovery history scans.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM discovery_history ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_dashboard_summary() -> Dict[str, Any]:
    """
    Fetches aggregate summary metrics from SQLite for the Dashboard.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM devices")
    total_assets = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as online FROM devices WHERE status IN ('Healthy', 'ONLINE', 'HEALTHY', 'Warning')")
    online_assets = cursor.fetchone()["online"]

    cursor.execute("SELECT COUNT(*) as offline FROM devices WHERE status IN ('Offline', 'OFFLINE', 'UNREACHABLE')")
    offline_assets = cursor.fetchone()["offline"]

    cursor.execute("SELECT * FROM discovery_history ORDER BY id DESC LIMIT 1")
    latest_scan_row = cursor.fetchone()
    latest_scan = dict(latest_scan_row) if latest_scan_row else None

    if total_assets > 0:
        health_ratio = round((online_assets / total_assets) * 100)
        health_score = f"{health_ratio}%"
        risk_level = "Low" if health_ratio >= 80 else ("Medium" if health_ratio >= 50 else "High")
    else:
        health_score = "Awaiting Scan"
        risk_level = "Awaiting Scan"

    cursor.execute("SELECT * FROM discovery_history ORDER BY id DESC LIMIT 5")
    recent_history = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "total_assets": total_assets,
        "online_assets": online_assets,
        "offline_assets": offline_assets,
        "last_discovery": latest_scan["scanned_at"] if latest_scan else None,
        "health_score": health_score,
        "risk_level": risk_level,
        "recent_discovery": latest_scan,
        "recent_activity": recent_history
    }
