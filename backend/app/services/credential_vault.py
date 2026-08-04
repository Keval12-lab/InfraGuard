import base64
import logging
from datetime import datetime, timezone
from ..settings import Settings
from ..database.core import get_db_connection

logger = logging.getLogger("infraguard.vault")

def _get_encryption_key() -> bytes:
    secret = Settings.from_environment().jwt_secret
    return secret.encode("utf-8")

def encrypt_secret(plain_text: str) -> str:
    if not plain_text:
        return ""
    key = _get_encryption_key()
    plain_bytes = plain_text.encode("utf-8")
    cipher_bytes = bytes([b ^ key[i % len(key)] for i, b in enumerate(plain_bytes)])
    return base64.urlsafe_b64encode(cipher_bytes).decode("utf-8")

def decrypt_secret(cipher_text: str) -> str:
    if not cipher_text:
        return ""
    try:
        key = _get_encryption_key()
        cipher_bytes = base64.urlsafe_b64decode(cipher_text.encode("utf-8"))
        plain_bytes = bytes([b ^ key[i % len(key)] for i, b in enumerate(cipher_bytes)])
        return plain_bytes.decode("utf-8")
    except Exception as e:
        logger.error(f"[Credential Vault] Error decrypting secret: {e}")
        return ""

def create_credential(name: str, cred_type: str, username: str, password: str, snmp_community: str = "public", notes: str = "") -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now(timezone.utc).isoformat()
    encrypted_pwd = encrypt_secret(password)

    cursor.execute("""
        INSERT INTO credentials (name, cred_type, username, password_encrypted, snmp_community, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (name, cred_type, username, encrypted_pwd, snmp_community, notes, now_str, now_str))

    cred_id = cursor.lastrowid
    conn.commit()
    conn.close()

    logger.info(f"[Credential Vault] Created credential profile #{cred_id} ('{name}').")
    return {
        "id": cred_id,
        "name": name,
        "cred_type": cred_type,
        "username": username,
        "snmp_community": snmp_community,
        "notes": notes,
        "created_at": now_str
    }

def list_credentials() -> list[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, cred_type, username, snmp_community, notes, created_at, updated_at FROM credentials ORDER BY name ASC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_credential_by_id(cred_id: int) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM credentials WHERE id = ?", (cred_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None

    data = dict(row)
    data["password"] = decrypt_secret(data.pop("password_encrypted", ""))
    return data
