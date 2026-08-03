import logging
from flask import Blueprint, jsonify, request
from ..services.timeline_service import fetch_timeline_feed, record_event

logger = logging.getLogger("infraguard.routes.timeline")
timeline_bp = Blueprint("timeline", __name__, url_prefix="/api/v1/timeline")


@timeline_bp.route("", methods=["GET", "OPTIONS"])
def api_get_timeline():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    device_id = request.args.get("device_id", type=int)
    event_type = request.args.get("event_type", type=str)
    severity = request.args.get("severity", type=str)
    limit = request.args.get("limit", default=100, type=int)
    offset = request.args.get("offset", default=0, type=int)

    data = fetch_timeline_feed(
        device_id=device_id,
        event_type=event_type,
        severity=severity,
        limit=limit,
        offset=offset
    )

    return jsonify(data), 200


@timeline_bp.route("/event", methods=["POST", "OPTIONS"])
def api_create_timeline_event():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    event_type = data.get("event_type", "NOTE")
    severity = data.get("severity", "INFO")
    title = data.get("title")
    description = data.get("description")
    device_id = data.get("device_id")
    metadata = data.get("metadata")

    if not title:
        return jsonify({"status": "error", "message": "Event title is required."}), 400

    event_id = record_event(
        event_type=event_type,
        severity=severity,
        title=title,
        description=description,
        device_id=device_id,
        metadata=metadata
    )

    return jsonify({"status": "success", "event_id": event_id}), 201
