import logging
import json
from typing import Dict, Any, List, Optional
from ..database.db import log_timeline_event, get_timeline_events

logger = logging.getLogger("infraguard.timeline")


def record_event(
    event_type: str,
    severity: str,
    title: str,
    description: Optional[str] = None,
    device_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> int:
    """
    High-level entry point to record a timeline event.
    """
    meta_json = json.dumps(metadata) if metadata else None
    event_id = log_timeline_event(
        event_type=event_type,
        severity=severity,
        title=title,
        description=description,
        device_id=device_id,
        metadata_json=meta_json
    )
    logger.debug(f"[Timeline] Recorded {event_type} event (#{event_id}): {title}")
    return event_id


def fetch_timeline_feed(
    device_id: Optional[int] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Fetches processed timeline events for API responses.
    """
    raw_events = get_timeline_events(
        device_id=device_id,
        event_type=event_type,
        severity=severity,
        limit=limit,
        offset=offset
    )

    processed = []
    for ev in raw_events:
        meta = None
        if ev.get("metadata_json"):
            try:
                meta = json.loads(ev["metadata_json"])
            except Exception:
                meta = None

        processed.append({
            "id": ev["id"],
            "event_type": ev["event_type"],
            "severity": ev["severity"],
            "device_id": ev["device_id"],
            "ip_address": ev.get("ip_address"),
            "hostname": ev.get("hostname"),
            "title": ev["title"],
            "description": ev.get("description"),
            "metadata": meta,
            "created_at": ev["created_at"]
        })

    return {
        "events": processed,
        "count": len(processed),
        "filters": {
            "device_id": device_id,
            "event_type": event_type or "ALL",
            "severity": severity or "ALL"
        }
    }
