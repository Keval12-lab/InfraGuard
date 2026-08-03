from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .core import get_db_connection


def get_asset_passport(device_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetches full passport metadata (technical, physical, business, notes) for a device.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT d.*, k.serial_number, k.firmware_version, k.building, k.floor, k.room, k.rack,
               k.rack_unit, k.pdu_port, k.owner, k.department, k.purchase_date, k.warranty_expiry,
               k.vendor_contact, k.amc_contract, k.notes_md, k.updated_at as passport_updated_at
        FROM devices d
        LEFT JOIN asset_knowledge k ON d.id = k.device_id
        WHERE d.id = ?
    """, (device_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def upsert_asset_passport(device_id: int, data: Dict[str, Any]) -> bool:
    """
    Upserts physical location, business, warranty, and documentation metadata into asset_knowledge.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    updated_at = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO asset_knowledge (
            device_id, serial_number, firmware_version, building, floor, room, rack,
            rack_unit, pdu_port, owner, department, purchase_date, warranty_expiry,
            vendor_contact, amc_contract, notes_md, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(device_id) DO UPDATE SET
            serial_number=excluded.serial_number,
            firmware_version=excluded.firmware_version,
            building=excluded.building,
            floor=excluded.floor,
            room=excluded.room,
            rack=excluded.rack,
            rack_unit=excluded.rack_unit,
            pdu_port=excluded.pdu_port,
            owner=excluded.owner,
            department=excluded.department,
            purchase_date=excluded.purchase_date,
            warranty_expiry=excluded.warranty_expiry,
            vendor_contact=excluded.vendor_contact,
            amc_contract=excluded.amc_contract,
            notes_md=excluded.notes_md,
            updated_at=excluded.updated_at
    """, (
        device_id,
        data.get("serial_number"),
        data.get("firmware_version"),
        data.get("building"),
        data.get("floor"),
        data.get("room"),
        data.get("rack"),
        data.get("rack_unit"),
        data.get("pdu_port"),
        data.get("owner"),
        data.get("department"),
        data.get("purchase_date"),
        data.get("warranty_expiry"),
        data.get("vendor_contact"),
        data.get("amc_contract"),
        data.get("notes_md"),
        updated_at
    ))
    conn.commit()
    conn.close()
    return True
