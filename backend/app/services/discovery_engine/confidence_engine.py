from typing import Dict, Any, List, Tuple

class ConfidenceEngine:
    """
    Confidence Engine: Calculates evidence score (0-100%) and generates explicit 
    verification reasons for every discovered device.
    """
    
    @staticmethod
    def evaluate(dev: Dict[str, Any]) -> Tuple[int, str, List[str]]:
        has_icmp = dev.get("reachable", False)
        has_mac = bool(dev.get("mac_address"))
        has_snmp = bool(dev.get("snmp") and dev["snmp"].get("status") == "success")
        vendor = dev.get("vendor", "Unknown")

        reasons: List[str] = []

        if has_icmp:
            reasons.append("✔ Device responded to network probe")
        else:
            reasons.append("✖ Device did not respond to network probe")

        if has_mac:
            reasons.append("✔ Physical MAC Address verified")
        else:
            reasons.append("✖ Physical MAC Address missing")

        if vendor and vendor != "Unknown":
            reasons.append(f"✔ Brand identified ({vendor})")

        if has_snmp:
            reasons.append("✔ System details collected via SNMP")

        if has_icmp and has_mac and has_snmp:
            score = 100
            label = "100% Fully Verified"
        elif has_icmp and has_mac:
            score = 80
            label = "80% Verified by Ping & MAC"
        elif has_icmp:
            score = 40
            label = "40% Limited Information"
        else:
            score = 0
            label = "0% Unverified / Offline"

        return score, label, reasons
