import logging
from flask import Blueprint, jsonify, request

from ..database.db import get_all_assets, get_asset_by_id

logger = logging.getLogger("infraguard.routes.assets")
assets_bp = Blueprint("assets", __name__, url_prefix="/api/v1/assets")


@assets_bp.route("", methods=["GET", "OPTIONS"])
def list_assets():
    """
    Returns list of all infrastructure assets with optional filtering.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    search = request.args.get("search")
    status = request.args.get("status")
    vendor = request.args.get("vendor")
    device_type = request.args.get("device_type")

    assets = get_all_assets(
        search=search,
        status=status,
        vendor=vendor,
        device_type=device_type
    )

    return jsonify({
        "status": "success",
        "data": assets
    }), 200


@assets_bp.route("/<int:asset_id>", methods=["GET", "OPTIONS"])
def get_single_asset(asset_id: int):
    """
    Returns a single asset record by ID.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    asset = get_asset_by_id(asset_id)
    if not asset:
        return jsonify({
            "status": "error",
            "message": f"Asset with ID {asset_id} not found."
        }), 404

    return jsonify({
        "status": "success",
        "data": asset
    }), 200
