import logging
from flask import Blueprint, jsonify, request
from ..services.automation_service import (
    fetch_all_automations,
    start_automation_run,
    fetch_runs_history
)

logger = logging.getLogger("infraguard.routes.automation")
automation_bp = Blueprint("automation", __name__, url_prefix="/api/v1/automations")


@automation_bp.route("", methods=["GET", "OPTIONS"])
def api_list_automations():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = fetch_all_automations()
    return jsonify(data), 200


@automation_bp.route("/<int:auto_id>/run", methods=["POST", "OPTIONS"])
def api_trigger_run(auto_id: int):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        run_id = start_automation_run(auto_id)
        return jsonify({"status": "success", "run_id": run_id}), 202
    except Exception as e:
        logger.error(f"Error triggering automation #{auto_id}: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@automation_bp.route("/runs", methods=["GET", "OPTIONS"])
def api_get_runs():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = fetch_runs_history()
    return jsonify(data), 200
