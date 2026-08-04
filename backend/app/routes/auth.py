import os
import hmac
import hashlib
import json
import base64
import time
import logging
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from functools import wraps

from ..settings import Settings
from ..utils.security import log_security_event
from ..database.core import get_db_connection

logger = logging.getLogger("infraguard.auth")
auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

PBKDF2_ITERATIONS = 310000

def get_jwt_secret() -> bytes:
    settings = Settings.from_environment()
    return settings.jwt_secret.encode("utf-8")

def hash_password(password: str, salt: bytes = None) -> tuple[str, str]:
    if salt is None:
        salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, PBKDF2_ITERATIONS)
    return key.hex(), salt.hex()

def verify_password(stored_hash_hex: str, stored_salt_hex: str, password_attempt: str) -> bool:
    salt = bytes.fromhex(stored_salt_hex)
    key_attempt = hashlib.pbkdf2_hmac('sha256', password_attempt.encode('utf-8'), salt, PBKDF2_ITERATIONS)
    return hmac.compare_digest(key_attempt.hex(), stored_hash_hex)

# Pre-hashed OWASP 2026 PBKDF2 (310,000 iterations) user store
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

# --- SQLite Persistent Token Blacklist Helpers ---
def is_token_revoked(token_sig: str) -> bool:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM revoked_tokens WHERE token_signature = ?", (token_sig,))
        row = cursor.fetchone()
        conn.close()
        return row is not None
    except Exception as e:
        logger.error(f"[Auth Security] Error checking revoked token: {e}")
        return False

def revoke_token_db(token_sig: str, email: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT OR REPLACE INTO revoked_tokens (token_signature, user_email, revoked_at)
            VALUES (?, ?, ?)
        """, (token_sig, email, now_str))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"[Auth Security] Error recording token revocation: {e}")

# --- SQLite Brute-Force & Lockout Helpers ---
def check_brute_force_lockout(ip_address: str) -> tuple[bool, int]:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT failed_count, locked_until FROM failed_login_attempts WHERE ip_address = ?", (ip_address,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return False, 0

        locked_until_str = row["locked_until"]
        if locked_until_str:
            locked_until_dt = datetime.fromisoformat(locked_until_str)
            now_dt = datetime.now(timezone.utc)
            if now_dt < locked_until_dt:
                remaining_seconds = int((locked_until_dt - now_dt).total_seconds())
                return True, remaining_seconds

        return False, 0
    except Exception as e:
        logger.error(f"[Auth Security] Error checking lockout: {e}")
        return False, 0

def record_failed_login(ip_address: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        now_dt = datetime.now(timezone.utc)
        now_str = now_dt.isoformat()
        cursor.execute("SELECT failed_count FROM failed_login_attempts WHERE ip_address = ?", (ip_address,))
        row = cursor.fetchone()

        if row:
            new_count = row["failed_count"] + 1
            locked_until = None
            if new_count >= 5:
                # Lock for 15 minutes (900 seconds)
                locked_until = datetime.fromtimestamp(now_dt.timestamp() + 900, timezone.utc).isoformat()
                logger.warning(f"[Security Brute-Force] IP '{ip_address}' exceeded 5 failures. Locked for 15 minutes.")
            
            cursor.execute("""
                UPDATE failed_login_attempts
                SET failed_count = ?, last_failed_at = ?, locked_until = ?
                WHERE ip_address = ?
            """, (new_count, now_str, locked_until, ip_address))
        else:
            cursor.execute("""
                INSERT INTO failed_login_attempts (ip_address, failed_count, last_failed_at, locked_until)
                VALUES (?, 1, ?, NULL)
            """, (ip_address, now_str))

        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"[Auth Security] Error recording failed login: {e}")

def reset_failed_login(ip_address: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM failed_login_attempts WHERE ip_address = ?", (ip_address,))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"[Auth Security] Error resetting failed login: {e}")

# --- JWT Encoding/Decoding ---
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
    parts = token_str.split(".")
    if len(parts) != 3:
        return None

    # Check Persistent DB Blacklist
    if is_token_revoked(parts[2]):
        logger.warning("[Security Auth] Rejected revoked token from persistent SQLite blacklist.")
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
    client_ip = request.remote_addr or "127.0.0.1"

    # Check Brute-Force Lockout
    is_locked, remaining_secs = check_brute_force_lockout(client_ip)
    if is_locked:
        log_security_event(
            event_name="locked_account_attempt",
            status="BLOCKED",
            details={"ip": client_ip, "remaining_seconds": remaining_secs},
            level="WARNING"
        )
        return jsonify({
            "status": "error",
            "message": f"Account temporarily locked due to excessive failed attempts. Try again in {remaining_secs} seconds."
        }), 429

    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required."}), 400

    user = USERS_DB.get(email)
    if not user or not verify_password(user["password_hash"], user["salt"], password):
        record_failed_login(client_ip)
        log_security_event(
            event_name="failed_login_attempt",
            status="FAILED",
            details={"email": email, "ip": client_ip},
            level="WARNING"
        )
        return jsonify({"status": "error", "message": "Invalid email or password."}), 401

    # Reset failure counter on successful auth
    reset_failed_login(client_ip)

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
        parts = token.split(".")
        if len(parts) == 3:
            revoke_token_db(parts[2], current_user.get("email"))
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
