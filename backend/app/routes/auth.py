import os
import hmac
import hashlib
import json
import base64
import time
import logging
from flask import Blueprint, request, jsonify
from functools import wraps

from ..settings import Settings
from ..utils.security import log_security_event

logger = logging.getLogger("infraguard.auth")
auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

# In-Memory Token Blacklist for Session Logout Revocation
REVOKED_TOKENS = set()

def get_jwt_secret() -> bytes:
    settings = Settings.from_environment()
    return settings.jwt_secret.encode("utf-8")

def hash_password(password: str, salt: bytes = None) -> tuple[str, str]:
    if salt is None:
        salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return key.hex(), salt.hex()

def verify_password(stored_hash_hex: str, stored_salt_hex: str, password_attempt: str) -> bool:
    salt = bytes.fromhex(stored_salt_hex)
    key_attempt = hashlib.pbkdf2_hmac('sha256', password_attempt.encode('utf-8'), salt, 100000)
    return hmac.compare_digest(key_attempt.hex(), stored_hash_hex)

# Pre-hashed PBKDF2 user store (Zero plaintext passwords!)
_admin_hash, _admin_salt = hash_password("AdminPassword123!")
_tech_hash, _tech_salt = hash_password("TechPassword123!")

USERS_DB = {
    "admin@infraguard.local": {
        "password_hash": _admin_hash,
        "salt": _admin_salt,
        "name": "Keval (CTO)",
        "role": "Admin"
    },
    "tech@infraguard.local": {
        "password_hash": _tech_hash,
        "salt": _tech_salt,
        "name": "Junior Technician",
        "role": "Technician"
    }
}

def b64_encode(data_bytes: bytes) -> str:
    return base64.urlsafe_b64encode(data_bytes).rstrip(b'=').decode('utf-8')

def b64_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

def generate_token(email: str, name: str, role: str) -> str:
    header = json.dumps({"alg": "HS256", "typ": "JWT"}).encode("utf-8")
    payload = json.dumps({
        "email": email,
        "name": name,
        "role": role,
        "exp": int(time.time()) + 86400
    }).encode("utf-8")

    unsigned_token = f"{b64_encode(header)}.{b64_encode(payload)}"
    signature = hmac.new(get_jwt_secret(), unsigned_token.encode("utf-8"), hashlib.sha256).digest()
    return f"{unsigned_token}.{b64_encode(signature)}"

def verify_token(token_str: str) -> dict:
    if token_str in REVOKED_TOKENS:
        logger.warning("[Security Auth] Rejected revoked/blacklisted token attempt.")
        return None

    parts = token_str.split(".")
    if len(parts) != 3:
        return None
    
    unsigned_token = f"{parts[0]}.{parts[1]}"
    expected_sig = hmac.new(get_jwt_secret(), unsigned_token.encode("utf-8"), hashlib.sha256).digest()
    try:
        provided_sig = b64_decode(parts[2])
    except Exception:
        return None

    if not hmac.compare_digest(expected_sig, provided_sig):
        logger.warning("[Security Auth] Invalid signature in token presentation.")
        return None

    try:
        payload = json.loads(b64_decode(parts[1]).decode("utf-8"))
    except Exception:
        return None

    if payload.get("exp", 0) < int(time.time()):
        logger.warning(f"[Security Auth] Token expired for user: {payload.get('email')}")
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
            return jsonify({"status": "error", "message": "Token is invalid, revoked, or expired!"}), 401
        
        request.current_user = payload
        return f(payload, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        payload = getattr(request, "current_user", None)
        if not payload or payload.get("role") != "Admin":
            log_security_event(
                event_name="unauthorized_admin_access_attempt",
                status="BLOCKED",
                details={"path": request.path, "user": payload.get('email') if payload else 'Unknown'},
                level="WARNING"
            )
            return jsonify({"status": "error", "message": "Access forbidden: Requires Admin role."}), 403
        return f(*args, **kwargs)
    return decorated

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required."}), 400

    user = USERS_DB.get(email)
    if not user or not verify_password(user["password_hash"], user["salt"], password):
        log_security_event(
            event_name="failed_login_attempt",
            status="FAILED",
            details={"email": email},
            level="WARNING"
        )
        return jsonify({"status": "error", "message": "Invalid email or password."}), 401

    token = generate_token(email, user["name"], user["role"])
    log_security_event(
        event_name="successful_login",
        status="SUCCESS",
        details={"email": email, "role": user["role"]}
    )

    return jsonify({
        "status": "success",
        "token": token,
        "user": {
            "email": email,
            "name": user["name"],
            "role": user["role"]
        }
    }), 200

@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(current_user):
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        REVOKED_TOKENS.add(token)
        log_security_event(
            event_name="user_logout",
            status="SUCCESS",
            details={"email": current_user.get("email")}
        )

    return jsonify({
        "status": "success",
        "message": "Logged out successfully; session invalidated."
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    return jsonify({
        "status": "success",
        "user": {
            "email": current_user["email"],
            "name": current_user["name"],
            "role": current_user["role"]
        }
    }), 200

@auth_bp.route("/admin-only", methods=["GET"])
@token_required
@admin_required
def admin_only_check(current_user):
    return jsonify({
        "status": "success",
        "message": "Access granted: You have Admin privileges."
    }), 200
