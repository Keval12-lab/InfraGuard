from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .core import get_db_connection


def log_timeline_event(
    event_type: str,
    severity: str,
    title: str,
    description: Optional[str] = None,
    device_id: Optional[int] = None,
    metadata_json: Optional[str] = None
) -> int:
    """
    Logs a unified timeline event into the timeline_events table.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO timeline_events (event_type, severity, device_id, title, description, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (event_type, severity, device_id, title, description, metadata_json, created_at))
    conn.commit()
    event_id = cursor.lastrowid
    conn.close()
    return event_id


def get_timeline_events(
    device_id: Optional[int] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Retrieves chronologically ordered timeline events with flexible filtering.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT t.id, t.event_type, t.severity, t.device_id, t.title, t.description, t.metadata_json, t.created_at, d.ip_address, d.hostname FROM timeline_events t LEFT JOIN devices d ON t.device_id = d.id WHERE 1=1"
    params: List[Any] = []

    if device_id is not None:
        query += " AND t.device_id = ?"
        params.append(device_id)
    if event_type and event_type != "ALL":
        query += " AND t.event_type = ?"
        params.append(event_type)
    if severity and severity != "ALL":
        query += " AND t.severity = ?"
        params.append(severity)

    query += " ORDER BY t.id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def log_terminal_command(
    tool_name: str,
    command_str: str,
    output_text: str,
    duration_ms: float = 0.0,
    asset_id: Optional[int] = None
) -> int:
    """
    Logs a terminal tool execution to the terminal_history table.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    executed_at = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO terminal_history (asset_id, tool_name, command_str, output_text, executed_at, duration_ms)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (asset_id, tool_name, command_str, output_text, executed_at, duration_ms))
    conn.commit()
    history_id = cursor.lastrowid
    conn.close()
    return history_id


def get_terminal_history(limit: int = 50, asset_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Retrieves execution history for the Engineer Workspace terminal.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    if asset_id is not None:
        cursor.execute("""
            SELECT id, asset_id, tool_name, command_str, output_text, executed_at, duration_ms
            FROM terminal_history
            WHERE asset_id = ?
            ORDER BY id DESC LIMIT ?
        """, (asset_id, limit))
    else:
        cursor.execute("""
            SELECT id, asset_id, tool_name, command_str, output_text, executed_at, duration_ms
            FROM terminal_history
            ORDER BY id DESC LIMIT ?
        """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
