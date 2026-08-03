"""
InfraGuard Infrastructure Intelligence Engine.

Pure rule-based analysis of live SQLite data.
No AI, no LLM, no external APIs.  Every finding is traceable to a
concrete business rule applied against actual device / monitoring records.

────────────────────────────────────────────────────────────────────────
Health Score Formula  (0–100)
────────────────────────────────────────────────────────────────────────
  health_score = (
      WEIGHT_STATUS      * status_score          # device-status ratio
    + WEIGHT_AVAIL        * avg_availability      # running availability %
    + WEIGHT_LATENCY      * latency_score         # inverse latency penalty
    + WEIGHT_PACKET_LOSS  * packet_loss_score     # inverse loss penalty
  )

  Weights:
    STATUS       = 0.40   (40 %)
    AVAILABILITY = 0.30   (30 %)
    LATENCY      = 0.15   (15 %)
    PACKET_LOSS  = 0.15   (15 %)

  status_score      = healthy_count / total  * 100
  avg_availability  = mean(availability_percent) across all devices
  latency_score     = max(0, 100 - mean(latency_ms))   clamped 0–100
  packet_loss_score = max(0, 100 - mean(packet_loss)*5) clamped 0–100
────────────────────────────────────────────────────────────────────────
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from collections import Counter

from ..database.db import get_all_assets, get_monitoring_summary, get_discovery_history

logger = logging.getLogger("infraguard.intelligence")

# ─── Weights ──────────────────────────────────────────────────────────────────
W_STATUS = 0.40
W_AVAIL  = 0.30
W_LAT    = 0.15
W_LOSS   = 0.15

STALE_THRESHOLD_DAYS = 30
HIGH_LATENCY_MS      = 100
HIGH_PACKET_LOSS_PCT = 10.0

CRITICAL_DEVICE_KEYWORDS = ["gateway", "router", "server", "switch", "firewall"]


# ─── Health Score ─────────────────────────────────────────────────────────────

def _calculate_health_score(assets: List[Dict], mon: Dict) -> int:
    """Return an integer health score 0–100."""
    total = len(assets)
    if total == 0:
        return 0

    healthy = mon.get("healthy_count", 0)
    status_score = (healthy / total) * 100.0

    avail_values = [a.get("availability_percent", 100.0) for a in assets]
    avg_avail = sum(avail_values) / len(avail_values)

    avg_lat = mon.get("avg_latency_ms", 0.0)
    latency_score = max(0.0, min(100.0, 100.0 - avg_lat))

    avg_loss = mon.get("avg_packet_loss_percent", 0.0)
    loss_score = max(0.0, min(100.0, 100.0 - avg_loss * 5.0))

    raw = (
        W_STATUS * status_score
        + W_AVAIL * avg_avail
        + W_LAT   * latency_score
        + W_LOSS  * loss_score
    )
    return max(0, min(100, round(raw)))


# ─── Individual detectors ─────────────────────────────────────────────────────

def _detect_duplicate_ips(assets: List[Dict]) -> List[Dict]:
    """Rule: flag any IP address that appears more than once."""
    ip_counts = Counter(a["ip_address"] for a in assets)
    dupes = [ip for ip, cnt in ip_counts.items() if cnt > 1]
    findings = []
    for ip in dupes:
        findings.append({
            "type": "duplicate_ip",
            "severity": "warning",
            "title": "Duplicate IP Address Detected",
            "detail": f"IP address {ip} is registered to multiple asset records.",
            "affected_ip": ip,
            "rule": "Unique IP constraint violation check.",
        })
    return findings


def _detect_stale_assets(assets: List[Dict]) -> List[Dict]:
    """Rule: asset not seen for ≥ STALE_THRESHOLD_DAYS days → Stale."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=STALE_THRESHOLD_DAYS)
    findings = []
    for a in assets:
        last_seen_str = a.get("last_seen") or a.get("last_monitor_time")
        if not last_seen_str:
            continue
        try:
            last_seen = datetime.fromisoformat(last_seen_str)
            if last_seen.tzinfo is None:
                last_seen = last_seen.replace(tzinfo=timezone.utc)
            if last_seen < cutoff:
                days_ago = (datetime.now(timezone.utc) - last_seen).days
                findings.append({
                    "type": "stale_asset",
                    "severity": "info",
                    "title": "Stale Asset Detected",
                    "detail": f"Asset #{a['id']} ({a['ip_address']}) has not been seen for {days_ago} days.",
                    "affected_ip": a["ip_address"],
                    "asset_id": a["id"],
                    "rule": f"No activity in ≥ {STALE_THRESHOLD_DAYS} days.",
                })
        except (ValueError, TypeError):
            pass
    return findings


def _detect_high_latency(assets: List[Dict]) -> List[Dict]:
    """Rule: latency > HIGH_LATENCY_MS → Performance Issue."""
    findings = []
    for a in assets:
        lat = a.get("latency_ms", 0.0) or 0.0
        if lat > HIGH_LATENCY_MS:
            findings.append({
                "type": "high_latency",
                "severity": "warning",
                "title": "High Latency Detected",
                "detail": f"Asset #{a['id']} ({a['ip_address']}) reports {lat} ms latency (threshold: {HIGH_LATENCY_MS} ms).",
                "affected_ip": a["ip_address"],
                "asset_id": a["id"],
                "value": lat,
                "rule": f"Latency > {HIGH_LATENCY_MS} ms.",
            })
    return findings


def _detect_high_packet_loss(assets: List[Dict]) -> List[Dict]:
    """Rule: packet_loss > HIGH_PACKET_LOSS_PCT → Network Issue."""
    findings = []
    for a in assets:
        loss = a.get("packet_loss", 0.0) or 0.0
        if loss > HIGH_PACKET_LOSS_PCT:
            findings.append({
                "type": "high_packet_loss",
                "severity": "warning",
                "title": "High Packet Loss Detected",
                "detail": f"Asset #{a['id']} ({a['ip_address']}) reports {loss}% packet loss (threshold: {HIGH_PACKET_LOSS_PCT}%).",
                "affected_ip": a["ip_address"],
                "asset_id": a["id"],
                "value": loss,
                "rule": f"Packet loss > {HIGH_PACKET_LOSS_PCT}%.",
            })
    return findings


def _detect_offline_critical_devices(assets: List[Dict]) -> List[Dict]:
    """Rule: Gateway / Router / Server / Switch / Firewall offline → Critical Alert."""
    findings = []
    for a in assets:
        status = (a.get("status") or "").lower()
        if status not in ("offline", "unreachable"):
            continue
        dev_type = (a.get("device_type") or "").lower()
        dev_name = (a.get("device_name") or "").lower()
        hostname = (a.get("hostname") or "").lower()
        combined = f"{dev_type} {dev_name} {hostname}"
        for kw in CRITICAL_DEVICE_KEYWORDS:
            if kw in combined:
                findings.append({
                    "type": "offline_critical",
                    "severity": "critical",
                    "title": f"Critical Device Offline — {kw.title()}",
                    "detail": f"Asset #{a['id']} ({a['ip_address']}, {a.get('device_name','')}) is offline. "
                              f"Device matched critical keyword '{kw}'.",
                    "affected_ip": a["ip_address"],
                    "asset_id": a["id"],
                    "rule": f"Offline device matching critical keyword: {kw}.",
                })
                break  # one finding per device
    return findings


# ─── Recommendations ──────────────────────────────────────────────────────────

def _generate_recommendations(
    assets: List[Dict],
    findings: List[Dict],
    discovery_history: List[Dict],
) -> List[Dict]:
    """
    Generate recommendations ONLY from detected conditions.
    Never output generic advice.
    """
    recs: List[Dict] = []
    types_found = {f["type"] for f in findings}

    if "stale_asset" in types_found:
        count = sum(1 for f in findings if f["type"] == "stale_asset")
        recs.append({
            "priority": "medium",
            "title": "Remove Stale Assets",
            "detail": f"{count} asset(s) have not been seen for over {STALE_THRESHOLD_DAYS} days. "
                      "Consider removing them or running a new discovery scan to re-validate.",
        })

    if "high_latency" in types_found:
        count = sum(1 for f in findings if f["type"] == "high_latency")
        recs.append({
            "priority": "high",
            "title": "Investigate High Latency",
            "detail": f"{count} asset(s) exceed {HIGH_LATENCY_MS} ms latency. "
                      "Check network congestion, switch port configuration, or cable quality.",
        })

    if "high_packet_loss" in types_found:
        count = sum(1 for f in findings if f["type"] == "high_packet_loss")
        recs.append({
            "priority": "high",
            "title": "Review Packet Loss",
            "detail": f"{count} asset(s) exceed {HIGH_PACKET_LOSS_PCT}% packet loss. "
                      "Inspect switch buffers, duplex mismatches, or wireless interference.",
        })

    if "offline_critical" in types_found:
        recs.append({
            "priority": "critical",
            "title": "Restore Critical Infrastructure",
            "detail": "One or more gateway / router / server devices are offline. "
                      "Immediate investigation is required to restore network connectivity.",
        })

    if "duplicate_ip" in types_found:
        recs.append({
            "priority": "medium",
            "title": "Resolve Duplicate IP Conflicts",
            "detail": "Duplicate IP addresses detected in the asset repository. "
                      "This may indicate DHCP misconfiguration or manual IP conflicts.",
        })

    # Discovery freshness
    if not discovery_history:
        recs.append({
            "priority": "low",
            "title": "Run Network Discovery",
            "detail": "No discovery scans have been recorded. "
                      "Run a network discovery scan to populate the asset repository.",
        })
    elif len(discovery_history) > 0:
        latest = discovery_history[0]
        scanned_at = latest.get("scanned_at", "")
        try:
            scan_dt = datetime.fromisoformat(scanned_at)
            if scan_dt.tzinfo is None:
                scan_dt = scan_dt.replace(tzinfo=timezone.utc)
            age_hours = (datetime.now(timezone.utc) - scan_dt).total_seconds() / 3600
            if age_hours > 24:
                recs.append({
                    "priority": "low",
                    "title": "Schedule Discovery Rescan",
                    "detail": f"Last discovery was {round(age_hours)} hours ago. "
                              "Run a fresh scan to ensure the asset inventory is current.",
                })
        except (ValueError, TypeError):
            pass

    return recs


# ─── Public API ───────────────────────────────────────────────────────────────

def get_intelligence_summary() -> Dict[str, Any]:
    """
    Main entry point.  Returns the complete intelligence analysis payload
    using real SQLite data and documented business rules.
    """
    assets = get_all_assets()
    mon = get_monitoring_summary()
    history = get_discovery_history(limit=10)

    if not assets:
        return {
            "health_score": 0,
            "health_label": "No Data",
            "total_assets": 0,
            "findings": [],
            "critical_alerts": [],
            "warnings": [],
            "info": [],
            "recommendations": [{
                "priority": "low",
                "title": "Run Network Discovery",
                "detail": "Run your first network discovery to generate infrastructure insights.",
            }],
        }

    # Run all detectors
    findings = []
    findings += _detect_duplicate_ips(assets)
    findings += _detect_stale_assets(assets)
    findings += _detect_high_latency(assets)
    findings += _detect_high_packet_loss(assets)
    findings += _detect_offline_critical_devices(assets)

    # Classify
    critical_alerts = [f for f in findings if f["severity"] == "critical"]
    warnings        = [f for f in findings if f["severity"] == "warning"]
    info            = [f for f in findings if f["severity"] == "info"]

    # Health score
    score = _calculate_health_score(assets, mon)
    if score >= 90:
        label = "Excellent"
    elif score >= 75:
        label = "Good"
    elif score >= 50:
        label = "Fair"
    elif score >= 25:
        label = "Poor"
    else:
        label = "Critical"

    # Recommendations (driven only by findings + discovery freshness)
    recs = _generate_recommendations(assets, findings, history)

    logger.info(
        f"[Intelligence] Score: {score} ({label}) | "
        f"Criticals: {len(critical_alerts)} | Warnings: {len(warnings)} | "
        f"Info: {len(info)} | Recommendations: {len(recs)}"
    )

    return {
        "health_score": score,
        "health_label": label,
        "total_assets": len(assets),
        "findings": findings,
        "critical_alerts": critical_alerts,
        "warnings": warnings,
        "info": info,
        "recommendations": recs,
    }
