import logging
from flask import Blueprint, jsonify, request
from ..services.workspace_service import (
    run_ping_tool,
    run_port_check_tool,
    run_dns_lookup_tool,
    send_wake_on_lan_tool,
)
from ..database.db import get_terminal_history
from ..utils.security import (
    enforce_target_validation,
    validate_port,
    validate_mac_address,
    SecurityValidationError,
)

logger = logging.getLogger("infraguard.routes.workspace")
workspace_bp = Blueprint("workspace", __name__, url_prefix="/api/v1/workspace")


@workspace_bp.route("/tools/ping", methods=["POST", "OPTIONS"])
def api_ping_tool():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    target_ip = data.get("ip") or data.get("target")
    count = int(data.get("count", 4))
    asset_id = data.get("asset_id")

    enforce_target_validation(target_ip, "ping_tool")

    result = run_ping_tool(target_ip=target_ip, count=count, asset_id=asset_id)
    return jsonify(result), 200


@workspace_bp.route("/tools/port-check", methods=["POST", "OPTIONS"])
def api_port_check_tool():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    target_ip = data.get("ip") or data.get("target")
    port = data.get("port")
    asset_id = data.get("asset_id")

    enforce_target_validation(target_ip, "port_check_tool")
    try:
        port_num = validate_port(port)
    except ValueError as e:
        raise SecurityValidationError(str(e))

    result = run_port_check_tool(target_ip=target_ip, port=port_num, asset_id=asset_id)
    return jsonify(result), 200


@workspace_bp.route("/tools/dns-lookup", methods=["POST", "OPTIONS"])
def api_dns_lookup_tool():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    query = data.get("query") or data.get("ip") or data.get("hostname")
    asset_id = data.get("asset_id")

    enforce_target_validation(query, "dns_lookup_tool")

    result = run_dns_lookup_tool(query=query, asset_id=asset_id)
    return jsonify(result), 200


@workspace_bp.route("/tools/wol", methods=["POST", "OPTIONS"])
def api_wol_tool():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    mac = data.get("mac") or data.get("mac_address")
    asset_id = data.get("asset_id")

    if not mac or not validate_mac_address(mac):
        raise SecurityValidationError("Invalid MAC address format. Required: 12 hex characters.")

    result = send_wake_on_lan_tool(mac_address=mac, asset_id=asset_id)
    return jsonify(result), 200


@workspace_bp.route("/history", methods=["GET", "OPTIONS"])
def api_workspace_history():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    asset_id = request.args.get("asset_id", type=int)
    limit = request.args.get("limit", default=50, type=int)

    history = get_terminal_history(limit=limit, asset_id=asset_id)
    return jsonify({"history": history, "count": len(history)}), 200
