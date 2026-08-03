import logging
from flask import Blueprint, jsonify, request

from ..database.db import (
    get_all_assets,
    get_monitoring_history_by_device,
    get_monitoring_summary,
    get_asset_by_id,
)

logger = logging.getLogger("infraguard.routes.monitoring")
monitoring_bp = Blueprint("monitoring", __name__, url_prefix="/api/v1/monitoring")


@monitoring_bp.route("/status", methods=["GET", "OPTIONS"])
def get_monitoring_status():
    """
    Returns all monitored assets with their current health, latency, and packet loss metrics.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    assets = get_all_assets()
    monitored_list = []
    for a in assets:
        monitored_list.append({
            "id": a["id"],
            "ip_address": a["ip_address"],
            "hostname": a["hostname"],
            "device_name": a["device_name"],
            "vendor": a["vendor"],
            "device_type": a["device_type"],
            "status": a["status"],
            "latency_ms": a.get("latency_ms", 0.0),
            "packet_loss": a.get("packet_loss", 0.0),
            "availability_percent": a.get("availability_percent", 100.0),
            "last_monitor_time": a.get("last_monitor_time"),
            "last_seen": a.get("last_seen"),
        })

    return jsonify({
        "status": "success",
        "data": monitored_list
    }), 200


@monitoring_bp.route("/history/<int:device_id>", methods=["GET", "OPTIONS"])
def get_device_monitoring_history(device_id: int):
    """
    Returns monitoring history checks for a specific asset ID.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    asset = get_asset_by_id(device_id)
    if not asset:
        return jsonify({
            "status": "error",
            "message": f"Asset with ID #{device_id} not found."
        }), 404

    limit = request.args.get("limit", default=50, type=int)
    history = get_monitoring_history_by_device(device_id, limit=limit)

    return jsonify({
        "status": "success",
        "data": {
            "device_id": device_id,
            "ip_address": asset["ip_address"],
            "hostname": asset["hostname"],
            "history": history
        }
    }), 200


@monitoring_bp.route("/summary", methods=["GET", "OPTIONS"])
def get_monitoring_summary_metrics():
    """
    Returns aggregate monitoring summary metrics (Healthy, Warning, Offline, Avg Latency, Avg Packet Loss).
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    summary = get_monitoring_summary()
    return jsonify({
        "status": "success",
        "data": summary
    }), 200
