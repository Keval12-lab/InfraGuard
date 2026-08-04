import hmac
import hashlib
import json
import base64
import time
from flask import Blueprint, request, jsonify
from functools import wraps

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

JWT_SECRET = b"infraguard-secret-key-enterprise-2026"

# Demo Users Store for Pilot Readiness
USERS_DB = {
    "admin@infraguard.local": {
        "password": "AdminPassword123!",
        "name": "Keval (CTO)",
        "role": "Admin"
    },
    "tech@infraguard.local": {
        "password": "TechPassword123!",
        "name": "Junior Technician",
        "role": "Technician"
    }
}

def b64_encode(data_bytes):
    return base64.urlsafe_b64encode(data_bytes).rstrip(b'=').decode('utf-8')

def b64_decode(data_str):
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

def generate_token(email, name, role):
    header = json.dumps({"alg": "HS256", "typ": "JWT"}).encode("utf-8")
    payload = json.dumps({
        "email": email,
        "name": name,
        "role": role,
        "exp": int(time.time()) + 86400
    }).encode("utf-8")

    unsigned_token = f"{b64_encode(header)}.{b64_encode(payload)}"
    signature = hmac.new(JWT_SECRET, unsigned_token.encode("utf-8"), hashlib.sha256).digest()
    return f"{unsigned_token}.{b64_encode(signature)}"

def verify_token(token_str):
    parts = token_str.split(".")
    if len(parts) != 3:
        return None
    
    unsigned_token = f"{parts[0]}.{parts[1]}"
    expected_sig = hmac.new(JWT_SECRET, unsigned_token.encode("utf-8"), hashlib.sha256).digest()
    provided_sig = b64_decode(parts[2])

    if not hmac.compare_digest(expected_sig, provided_sig):
        return None

    payload = json.loads(b64_decode(parts[1]).decode("utf-8"))
    if payload.get("exp", 0) < int(time.time()):
        return None

    return payload

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"status": "error", "message": "Authentication token is missing!"}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({"status": "error", "message": "Token is invalid or expired!"}), 401
        
        return f(payload["email"], *args, **kwargs)
    return decorated

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required."}), 400

    user = USERS_DB.get(email)
    if not user or user["password"] != password:
        return jsonify({"status": "error", "message": "Invalid email or password."}), 401

    token = generate_token(email, user["name"], user["role"])

    return jsonify({
        "status": "success",
        "token": token,
        "user": {
            "email": email,
            "name": user["name"],
            "role": user["role"]
        }
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    user = USERS_DB.get(current_user)
    return jsonify({
        "status": "success",
        "user": {
            "email": current_user,
            "name": user["name"],
            "role": user["role"]
        }
    }), 200
