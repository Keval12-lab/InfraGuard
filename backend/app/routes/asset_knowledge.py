import logging
from flask import Blueprint, jsonify, request
from ..services.asset_knowledge_service import (
    fetch_infrastructure_passport,
    save_infrastructure_passport
)

logger = logging.getLogger("infraguard.routes.passport")
passport_bp = Blueprint("passport", __name__, url_prefix="/api/v1/assets")


@passport_bp.route("/<int:device_id>/passport", methods=["GET", "OPTIONS"])
def api_get_passport(device_id: int):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = fetch_infrastructure_passport(device_id)
    if not data:
        return jsonify({"status": "error", "message": f"Asset #{device_id} not found."}), 404

    return jsonify(data), 200


@passport_bp.route("/<int:device_id>/passport", methods=["PUT", "OPTIONS"])
def api_update_passport(device_id: int):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    payload = request.get_json() or {}
    success = save_infrastructure_passport(device_id, payload)
    if not success:
        return jsonify({"status": "error", "message": f"Failed to update passport for asset #{device_id}."}), 500

    updated_passport = fetch_infrastructure_passport(device_id)
    return jsonify({"status": "success", "data": updated_passport}), 200
