"""
InfraGuard Infrastructure Intelligence API Route.
"""

import logging
from flask import Blueprint, jsonify, request

from ..services.intelligence_service import get_intelligence_summary

logger = logging.getLogger("infraguard.routes.intelligence")
intelligence_bp = Blueprint("intelligence", __name__, url_prefix="/api/v1/intelligence")


@intelligence_bp.route("/summary", methods=["GET", "OPTIONS"])
def intelligence_summary():
    """
    Returns the full intelligence analysis payload:
    health score, findings, critical alerts, warnings, and recommendations.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = get_intelligence_summary()
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        logger.error(f"[Intelligence Error] {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to generate intelligence summary."
        }), 500
