import logging
from flask import Blueprint, jsonify, request

from ..services.discovery_service import detect_local_subnet, execute_subnet_discovery, validate_cidr
from ..database.db import save_discovery_results, get_discovery_history

logger = logging.getLogger("infraguard.routes.discovery")
discovery_bp = Blueprint("discovery", __name__, url_prefix="/api/v1/discovery")


@discovery_bp.route("/detect-subnet", methods=["GET", "OPTIONS"])
def get_detected_subnet():
    """
    Returns auto-detected local network subnet information.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200
    data = detect_local_subnet()
    logger.info(f"Auto-detected subnet request returned: {data.get('detected_cidr')}")
    return jsonify({
        "status": "success",
        "data": data
    })


@discovery_bp.route("/scan", methods=["POST", "OPTIONS"])
def start_discovery_scan():
    """
    Executes subnet discovery for specified CIDR and persists discovered devices to SQLite database.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200
    payload = request.get_json(silent=True) or {}
    cidr = payload.get("subnet")

    if not cidr or not str(cidr).strip():
        logger.warning("Discovery scan requested without 'subnet' payload parameter.")
        return jsonify({
            "status": "error",
            "message": "Missing subnet format. Please enter a valid IPv4 CIDR range. Example: 192.168.29.0/24"
        }), 400

    is_valid, err_msg, _ = validate_cidr(str(cidr))
    if not is_valid:
        logger.warning(f"Invalid CIDR scan attempt: '{cidr}' - {err_msg}")
        return jsonify({
            "status": "error",
            "message": err_msg
        }), 400

    try:
        results = execute_subnet_discovery(str(cidr))
        # Persist results to SQLite database
        save_discovery_results(results)

        return jsonify({
            "status": "success",
            "message": f"Discovery completed for subnet {results['subnet']}. Found {results['active_found']} reachable devices.",
            "data": results
        })
    except Exception as e:
        logger.error(f"Discovery scan failed for subnet {cidr}: {e}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": f"Discovery failed: {str(e)}"
        }), 500


@discovery_bp.route("/history", methods=["GET", "OPTIONS"])
def list_discovery_history():
    """
    Returns history of past discovery scans.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    limit = request.args.get("limit", default=10, type=int)
    history = get_discovery_history(limit=limit)
    return jsonify({
        "status": "success",
        "data": history
    }), 200
