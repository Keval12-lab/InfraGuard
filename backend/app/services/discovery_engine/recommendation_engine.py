from typing import Dict, Any, List

class RecommendationEngine:
    """
    Recommendation Engine: Acts as the IT Troubleshooting Assistant.
    Generates actionable fix suggestions and calculates the overall Network Health Score.
    """
    
    @staticmethod
    def get_troubleshooting(dev: Dict[str, Any]) -> Dict[str, Any]:
        is_reachable = dev.get("reachable", True)
        
        if is_reachable:
            return {
                "status_summary": "Device is online and responding normally.",
                "possible_reasons": [],
                "what_you_can_try": [
                    "No action required. Connection is healthy."
                ]
            }
            
        return {
            "status_summary": "Device is not responding on the network.",
            "possible_reasons": [
                "Device is powered off or sleeping",
                "Network cable is unplugged or Wi-Fi is disconnected",
                "Local firewall is blocking network probes"
            ],
            "what_you_can_try": [
                "Check device power supply and cable",
                "Verify router port or Wi-Fi connection",
                "Try pinging the device again",
                "Run a fresh network scan"
            ]
        }

    @staticmethod
    def calculate_network_health(devices: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not devices:
            return {
                "score": 100,
                "label": "Excellent",
                "summary": "No devices discovered yet."
            }

        total = len(devices)
        online = sum(1 for d in devices if d.get("reachable", True))
        offline = total - online

        # Score calculation formula: 100 base, -15 per offline device
        penalty = offline * 15
        score = max(0, 100 - penalty)

        if score >= 90:
            label = "Excellent"
        elif score >= 70:
            label = "Good"
        elif score >= 50:
            label = "Needs Attention"
        else:
            label = "Critical"

        return {
            "score": score,
            "label": label,
            "summary": f"{online} of {total} devices operational. {offline} offline."
        }
