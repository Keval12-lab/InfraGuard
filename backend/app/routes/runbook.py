import logging
from flask import Blueprint, jsonify, request
from ..services.runbook_service import (
    fetch_all_runbooks,
    start_runbook_session,
    process_runbook_step,
    fetch_runbook_executions
)

logger = logging.getLogger("infraguard.routes.runbook")
runbook_bp = Blueprint("runbook", __name__, url_prefix="/api/v1/runbooks")


@runbook_bp.route("", methods=["GET", "OPTIONS"])
def api_list_runbooks():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = fetch_all_runbooks()
    return jsonify(data), 200


@runbook_bp.route("/execute", methods=["POST", "OPTIONS"])
def api_start_execution():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    payload = request.get_json() or {}
    runbook_id = payload.get("runbook_id")
    device_id = payload.get("device_id")

    if not runbook_id:
        return jsonify({"status": "error", "message": "runbook_id is required."}), 400

    try:
        session = start_runbook_session(runbook_id, device_id)
        return jsonify(session), 201
    except Exception as e:
        logger.error(f"Error starting runbook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@runbook_bp.route("/execute/<int:exec_id>/step", methods=["POST", "OPTIONS"])
def api_process_step(exec_id: int):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    payload = request.get_json() or {}
    choice_index = payload.get("choice_index")
    notes = payload.get("notes")

    try:
        updated_session = process_runbook_step(exec_id, choice_index, notes)
        return jsonify(updated_session), 200
    except Exception as e:
        logger.error(f"Error processing step for exec #{exec_id}: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@runbook_bp.route("/history", methods=["GET", "OPTIONS"])
def api_get_history():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    history = fetch_runbook_executions()
    return jsonify(history), 200
