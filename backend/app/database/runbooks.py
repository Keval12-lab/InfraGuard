from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .core import get_db_connection


def get_runbooks() -> List[Dict[str, Any]]:
    """
    Fetches all available interactive troubleshooter runbooks.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM runbooks ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_runbook_by_id(runbook_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetches a single runbook by its ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM runbooks WHERE id = ?", (runbook_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def create_runbook_execution(runbook_id: int, device_id: Optional[int], status: str = "RUNNING") -> int:
    """
    Initializes a new interactive runbook execution trace.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    executed_at = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO runbook_executions (runbook_id, device_id, status, current_step_index, answers_json, logs_json, executed_at)
        VALUES (?, ?, ?, 0, '[]', '[]', ?)
    """, (runbook_id, device_id, status, executed_at))
    conn.commit()
    exec_id = cursor.lastrowid
    conn.close()
    return exec_id


def update_runbook_execution(
    exec_id: int,
    status: str,
    current_step_index: int,
    answers_json: str,
    logs_json: str,
    duration_seconds: int = 0
) -> bool:
    """
    Updates the state, logs, and answers of an active runbook execution.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE runbook_executions
        SET status = ?, current_step_index = ?, answers_json = ?, logs_json = ?, duration_seconds = ?
        WHERE id = ?
    """, (status, current_step_index, answers_json, logs_json, duration_seconds, exec_id))
    conn.commit()
    conn.close()
    return True


def get_runbook_execution(exec_id: int) -> Optional[Dict[str, Any]]:
    """
    Gets detailed information of a runbook execution, including the parent runbook steps.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.*, r.name, r.description, r.steps_json, d.ip_address, d.hostname
        FROM runbook_executions e
        JOIN runbooks r ON e.runbook_id = r.id
        LEFT JOIN devices d ON e.device_id = d.id
        WHERE e.id = ?
    """, (exec_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_runbook_executions_history() -> List[Dict[str, Any]]:
    """
    Returns historical list of all runbook executions.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.*, r.name, d.ip_address, d.hostname
        FROM runbook_executions e
        JOIN runbooks r ON e.runbook_id = r.id
        LEFT JOIN devices d ON e.device_id = d.id
        ORDER BY e.id DESC
        LIMIT 50
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
