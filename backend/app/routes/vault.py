from flask import Blueprint, jsonify, request
from ..services.credential_vault import create_credential, list_credentials, get_credential_by_id
from .auth import token_required, admin_required

vault_bp = Blueprint("vault", __name__, url_prefix="/api/v1/vault")

@vault_bp.route("/credentials", methods=["GET"])
@token_required
def get_credentials(current_user):
    try:
        creds = list_credentials()
        return jsonify({
            "status": "success",
            "count": len(creds),
            "credentials": creds
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@vault_bp.route("/credentials", methods=["POST"])
@token_required
@admin_required
def add_credential(current_user):
    data = request.get_json() or {}
    name = data.get("name")
    cred_type = data.get("cred_type", "SSH")
    username = data.get("username")
    password = data.get("password", "")
    snmp_community = data.get("snmp_community", "public")
    notes = data.get("notes", "")

    if not name or not username:
        return jsonify({"status": "error", "message": "Name and username are required."}), 400

    try:
        profile = create_credential(name, cred_type, username, password, snmp_community, notes)
        return jsonify({
            "status": "success",
            "credential": profile
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@vault_bp.route("/credentials/<int:cred_id>", methods=["GET"])
@token_required
def get_single_credential(current_user, cred_id: int):
    cred = get_credential_by_id(cred_id)
    if not cred:
        return jsonify({"status": "error", "message": f"Credential profile #{cred_id} not found."}), 404
    
    # Hide password in normal view API response for security
    cred.pop("password", None)
    return jsonify({
        "status": "success",
        "credential": cred
    }), 200
