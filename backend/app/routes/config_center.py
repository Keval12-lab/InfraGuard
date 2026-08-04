from flask import Blueprint, jsonify, request
from ..services.capability_service import audit_device_capabilities, get_device_capabilities
from ..database.core import get_db_connection
from .auth import token_required, admin_required

config_center_bp = Blueprint("config_center", __name__, url_prefix="/api/v1/config-center")

@config_center_bp.route("/overview", methods=["GET"])
@token_required
def get_config_center_overview(current_user):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT d.id, d.ip_address, d.hostname, d.device_name, d.vendor, d.device_type, d.status,
                   c.has_ssh, c.has_telnet, c.has_snmp, c.has_http, c.has_https, c.has_winrm, c.has_rdp, c.has_smb,
                   c.backup_supported, c.last_probed_at
            FROM devices d
            LEFT JOIN device_capabilities c ON d.id = c.device_id
            ORDER BY d.ip_address ASC
        """)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()

        total_devices = len(rows)
        backup_ready = sum(1 for r in rows if r.get("backup_supported") == 1)
        ssh_ready = sum(1 for r in rows if r.get("has_ssh") == 1)
        snmp_ready = sum(1 for r in rows if r.get("has_snmp") == 1)

        return jsonify({
            "status": "success",
            "summary": {
                "total_devices": total_devices,
                "backup_ready": backup_ready,
                "ssh_ready": ssh_ready,
                "snmp_ready": snmp_ready
            },
            "devices": rows
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@config_center_bp.route("/audit/<int:device_id>", methods=["POST"])
@token_required
def audit_single_device(current_user, device_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT ip_address FROM devices WHERE id = ?", (device_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({"status": "error", "message": f"Device #{device_id} not found."}), 404

        caps = audit_device_capabilities(device_id, row["ip_address"])
        return jsonify({
            "status": "success",
            "capabilities": caps
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
