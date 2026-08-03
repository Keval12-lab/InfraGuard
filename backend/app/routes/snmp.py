import logging
from flask import Blueprint, jsonify, request
from ..services.snmp_service import run_snmp_discovery
from ..database.db import (
    get_snmp_device,
    get_snmp_interfaces,
    get_snmp_neighbors,
    get_snmp_vlans,
    get_asset_by_id
)

logger = logging.getLogger("infraguard.routes.snmp")
snmp_bp = Blueprint("snmp", __name__, url_prefix="/api/v1/snmp")


@snmp_bp.route("/discover", methods=["POST", "OPTIONS"])
def api_discover_snmp():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    payload = request.json or {}
    device_id = payload.get("device_id")
    community = payload.get("community", "public")
    port = payload.get("port", 161)
    timeout = payload.get("timeout", 1.5)

    if not device_id:
        return jsonify({"status": "error", "message": "Missing device_id"}), 400

    try:
        # Resolve target device IP address from database
        device = get_asset_by_id(device_id)
        if not device:
            return jsonify({"status": "error", "message": "Device not found"}), 404

        ip = device.get("ip_address")
        res = run_snmp_discovery(
            device_id=device_id,
            ip=ip,
            community=community,
            port=int(port),
            timeout=float(timeout)
        )
        return jsonify({"status": "success", "data": res}), 200
    except Exception as e:
        logger.error(f"Error executing SNMP scan on device #{device_id}: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@snmp_bp.route("/device/<int:device_id>", methods=["GET", "OPTIONS"])
def api_get_device(device_id: int):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = get_snmp_device(device_id)
    if not data:
        return jsonify({"status": "error", "message": "No SNMP metadata scanned for this device"}), 404
    return jsonify(data), 200


@snmp_bp.route("/interfaces/<int:device_id>", methods=["GET", "OPTIONS"])
def api_get_interfaces(device_id: int):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = get_snmp_interfaces(device_id)
    return jsonify(data), 200


@snmp_bp.route("/neighbors/<int:device_id>", methods=["GET", "OPTIONS"])
def api_get_neighbors(device_id: int):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = get_snmp_neighbors(device_id)
    return jsonify(data), 200


@snmp_bp.route("/vlans/<int:device_id>", methods=["GET", "OPTIONS"])
def api_get_vlans(device_id: int):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = get_snmp_vlans(device_id)
    return jsonify(data), 200


@snmp_bp.route("/topology", methods=["GET", "OPTIONS"])
def api_get_topology():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    from ..database.db import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch all devices
    cursor.execute("SELECT id, ip_address, hostname, device_type, status, vendor FROM devices")
    devices = [dict(row) for row in cursor.fetchall()]
    
    # Fetch all SNMP links
    cursor.execute("""
        SELECT n.device_id, n.local_port, n.neighbor_name, n.neighbor_port, d.hostname as source_hostname
        FROM snmp_neighbors n
        JOIN devices d ON n.device_id = d.id
    """)
    links = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({
        "devices": devices,
        "links": links
    }), 200
