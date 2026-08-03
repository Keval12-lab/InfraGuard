import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from ..database.db import get_asset_passport, upsert_asset_passport, get_timeline_events

logger = logging.getLogger("infraguard.passport")


def fetch_infrastructure_passport(device_id: int) -> Optional[Dict[str, Any]]:
    """
    Assembles complete Infrastructure Passport for an asset.
    """
    passport_data = get_asset_passport(device_id)
    if not passport_data:
        return None

    # Calculate Warranty Status & Days Remaining
    warranty_status = "UNKNOWN"
    days_until_warranty_expiry = None

    warranty_str = passport_data.get("warranty_expiry")
    if warranty_str:
        try:
            w_date = datetime.fromisoformat(warranty_str).replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            diff_days = (w_date - now).days
            days_until_warranty_expiry = diff_days
            if diff_days < 0:
                warranty_status = "EXPIRED"
            elif diff_days <= 90:
                warranty_status = "EXPIRING_SOON"
            else:
                warranty_status = "ACTIVE"
        except Exception:
            warranty_status = "INVALID_DATE"

    # Fetch Asset Specific Timeline
    timeline_events = get_timeline_events(device_id=device_id, limit=20)

    # Generate QR Code Payload String
    ip_addr = passport_data.get("ip_address", "0.0.0.0")
    hostname = passport_data.get("hostname") or "Unknown"
    mac = passport_data.get("mac_address") or "N/A"
    qr_payload = f"INFRAGUARD-PASSPORT:ID={device_id};IP={ip_addr};HOST={hostname};MAC={mac}"

    return {
        "passport": passport_data,
        "warranty_summary": {
            "status": warranty_status,
            "days_remaining": days_until_warranty_expiry,
        },
        "qr_payload": qr_payload,
        "recent_timeline": timeline_events
    }


def save_infrastructure_passport(device_id: int, payload: Dict[str, Any]) -> bool:
    """
    Saves/updates Infrastructure Passport fields.
    """
    return upsert_asset_passport(device_id, payload)
