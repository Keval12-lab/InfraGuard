import logging
from flask import Blueprint, jsonify, request

from ..database.db import get_dashboard_summary

logger = logging.getLogger("infraguard.routes.dashboard")
dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/v1/dashboard")


@dashboard_bp.route("", methods=["GET", "OPTIONS"])
def get_dashboard():
    """
    Returns live summary metrics for the dashboard.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    summary = get_dashboard_summary()
    return jsonify({
        "status": "success",
        "data": summary
    }), 200
