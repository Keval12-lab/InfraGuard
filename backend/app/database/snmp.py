from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .core import get_db_connection


def save_snmp_device(
    device_id: int,
    sys_name: Optional[str],
    sys_desc: Optional[str],
    sys_uptime: Optional[int],
    sys_contact: Optional[str],
    sys_location: Optional[str],
    interface_count: int,
    snmp_status: str
) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    last_scanned = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO snmp_devices (device_id, sys_name, sys_desc, sys_uptime, sys_contact, sys_location, interface_count, snmp_status, last_scanned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(device_id) DO UPDATE SET
            sys_name=excluded.sys_name,
            sys_desc=excluded.sys_desc,
            sys_uptime=excluded.sys_uptime,
            sys_contact=excluded.sys_contact,
            sys_location=excluded.sys_location,
            interface_count=excluded.interface_count,
            snmp_status=excluded.snmp_status,
            last_scanned=excluded.last_scanned
    """, (device_id, sys_name, sys_desc, sys_uptime, sys_contact, sys_location, interface_count, snmp_status, last_scanned))
    conn.commit()
    conn.close()
    return True


def save_snmp_interface(
    device_id: int,
    if_index: int,
    if_name: str,
    if_status: str,
    if_speed: int = 0,
    rx_bytes: int = 0,
    tx_bytes: int = 0,
    errors: int = 0,
    crc: int = 0
) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO snmp_interfaces (device_id, if_index, if_name, if_status, if_speed, rx_bytes, tx_bytes, errors, crc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(device_id, if_index) DO UPDATE SET
            if_name=excluded.if_name,
            if_status=excluded.if_status,
            if_speed=excluded.if_speed,
            rx_bytes=excluded.rx_bytes,
            tx_bytes=excluded.tx_bytes,
            errors=excluded.errors,
            crc=excluded.crc
    """, (device_id, if_index, if_name, if_status, if_speed, rx_bytes, tx_bytes, errors, crc))
    conn.commit()
    conn.close()
    return True


def clear_snmp_interfaces(device_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM snmp_interfaces WHERE device_id = ?", (device_id,))
    conn.commit()
    conn.close()


def save_snmp_neighbor(device_id: int, local_port: str, neighbor_name: str, neighbor_port: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO snmp_neighbors (device_id, local_port, neighbor_name, neighbor_port)
        VALUES (?, ?, ?, ?)
    """, (device_id, local_port, neighbor_name, neighbor_port))
    conn.commit()
    conn.close()
    return True


def clear_snmp_neighbors(device_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM snmp_neighbors WHERE device_id = ?", (device_id,))
    conn.commit()
    conn.close()


def save_snmp_vlan(device_id: int, vlan_id: int, vlan_name: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO snmp_vlans (device_id, vlan_id, vlan_name)
        VALUES (?, ?, ?)
        ON CONFLICT(device_id, vlan_id) DO UPDATE SET
            vlan_name=excluded.vlan_name
    """, (device_id, vlan_id, vlan_name))
    conn.commit()
    conn.close()
    return True


def clear_snmp_vlans(device_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM snmp_vlans WHERE device_id = ?", (device_id,))
    conn.commit()
    conn.close()


def get_snmp_device(device_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM snmp_devices WHERE device_id = ?", (device_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_snmp_interfaces(device_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM snmp_interfaces WHERE device_id = ? ORDER BY if_index ASC", (device_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_snmp_neighbors(device_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM snmp_neighbors WHERE device_id = ?", (device_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_snmp_vlans(device_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM snmp_vlans WHERE device_id = ? ORDER BY vlan_id ASC", (device_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
