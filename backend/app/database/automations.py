from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .core import get_db_connection


def get_automations() -> List[Dict[str, Any]]:
    """
    Returns all seeded automation templates.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM automations ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_automation_by_id(auto_id: int) -> Optional[Dict[str, Any]]:
    """
    Gets detailed metadata of a specific automation.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM automations WHERE id = ?", (auto_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def create_automation_run(automation_id: int, status: str = "RUNNING") -> int:
    """
    Creates an execution record for an automation.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    executed_at = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO automation_runs (automation_id, status, results_json, executed_at)
        VALUES (?, ?, '[]', ?)
    """, (automation_id, status, executed_at))
    conn.commit()
    run_id = cursor.lastrowid
    conn.close()
    return run_id


def update_automation_run(run_id: int, status: str, results_json: str, duration_seconds: int) -> bool:
    """
    Saves the final result output, duration, and status.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE automation_runs
        SET status = ?, results_json = ?, duration_seconds = ?
        WHERE id = ?
    """, (status, results_json, duration_seconds, run_id))
    conn.commit()
    conn.close()
    return True


def get_automation_runs_history() -> List[Dict[str, Any]]:
    """
    Returns history of executed automations.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.*, a.name, a.description
        FROM automation_runs r
        JOIN automations a ON r.automation_id = a.id
        ORDER BY r.id DESC
        LIMIT 50
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
