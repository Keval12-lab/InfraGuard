import socket
import logging
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor

from ..database.core import get_db_connection

logger = logging.getLogger("infraguard.capabilities")

PORT_PROBES = {
    "has_ssh": 22,
    "has_telnet": 23,
    "has_snmp": 161,
    "has_http": 80,
    "has_https": 443,
    "has_winrm": 5985,
    "has_rdp": 3389,
    "has_smb": 445
}

def probe_port(ip_address: str, port: int, timeout: float = 1.0) -> bool:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((ip_address, port))
        sock.close()
        return result == 0
    except Exception:
        return False

def audit_device_capabilities(device_id: int, ip_address: str) -> dict:
    logger.info(f"[Capability Probe] Auditing device #{device_id} ({ip_address})...")
    capabilities = {}

    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_port = {
            executor.submit(probe_port, ip_address, port): key
            for key, port in PORT_PROBES.items()
        }
        for future in future_to_port:
            key = future_to_port[future]
            try:
                capabilities[key] = 1 if future.result() else 0
            except Exception:
                capabilities[key] = 0

    # Backup is supported if SSH or SNMP or Telnet is accessible
    backup_supported = 1 if (capabilities.get("has_ssh") or capabilities.get("has_snmp") or capabilities.get("has_telnet")) else 0
    capabilities["backup_supported"] = backup_supported

    now_str = datetime.now(timezone.utc).isoformat()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO device_capabilities (
                device_id, has_ssh, has_telnet, has_snmp, has_http, has_https,
                has_winrm, has_rdp, has_smb, backup_supported, last_probed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(device_id) DO UPDATE SET
                has_ssh=excluded.has_ssh,
                has_telnet=excluded.has_telnet,
                has_snmp=excluded.has_snmp,
                has_http=excluded.has_http,
                has_https=excluded.has_https,
                has_winrm=excluded.has_winrm,
                has_rdp=excluded.has_rdp,
                has_smb=excluded.has_smb,
                backup_supported=excluded.backup_supported,
                last_probed_at=excluded.last_probed_at;
        """, (
            device_id,
            capabilities["has_ssh"],
            capabilities["has_telnet"],
            capabilities["has_snmp"],
            capabilities["has_http"],
            capabilities["has_https"],
            capabilities["has_winrm"],
            capabilities["has_rdp"],
            capabilities["has_smb"],
            backup_supported,
            now_str
        ))
        conn.commit()
        conn.close()
        logger.info(f"[Capability Probe] Device #{device_id} capabilities updated successfully.")
    except Exception as e:
        logger.error(f"[Capability Probe] Error persisting capabilities for device #{device_id}: {e}")

    capabilities["device_id"] = device_id
    capabilities["last_probed_at"] = now_str
    return capabilities

def get_device_capabilities(device_id: int) -> dict:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM device_capabilities WHERE device_id = ?", (device_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
    except Exception as e:
        logger.error(f"[Capability Probe] Error reading capabilities for device #{device_id}: {e}")

    return {
        "device_id": device_id,
        "has_ssh": 0,
        "has_telnet": 0,
        "has_snmp": 0,
        "has_http": 0,
        "has_https": 0,
        "has_winrm": 0,
        "has_rdp": 0,
        "has_smb": 0,
        "backup_supported": 0,
        "last_probed_at": None
    }
