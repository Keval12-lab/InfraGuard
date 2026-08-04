from typing import Dict, Any
from .base import IDiscoveryModule
from .snmp_client import SNMPClient

class SNMPDiscovery(IDiscoveryModule):
    def get_name(self) -> str:
        return "snmp"

    # Standard MIB-II OIDs
    OIDS = {
        "sysDescr": "1.3.6.1.2.1.1.1.0",
        "sysObjectID": "1.3.6.1.2.1.1.2.0",
        "sysUpTime": "1.3.6.1.2.1.1.3.0",
        "sysContact": "1.3.6.1.2.1.1.4.0",
        "sysName": "1.3.6.1.2.1.1.5.0",
        "sysLocation": "1.3.6.1.2.1.1.6.0"
    }

    def discover(self, ip: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes SNMP Phase 1 (Connectivity) and Phase 2 (System Info).
        Follows a standardized enterprise JSON schema that ensures graceful error handling.
        """
        result = {
            "status": "skipped",
            "phase1_connectivity": {
                "reachable": False,
                "version": "v2c",
                "response_time_ms": 0.0
            },
            "system": {
                "hostname": None,
                "vendor": None,
                "model": None,
                "uptime": None,
                "location": None,
                "contact": None,
                "sysObjectID": None,
                "sysDescr": None
            },
            "interfaces": [],
            "neighbors": [],
            "vlan": [],
            "health": {}
        }
        
        # If ICMP didn't respond or wasn't run, we can still try, but it's optional
        community = context.get("snmp_community", "public")
        timeout = context.get("snmp_timeout", 2)
        retries = context.get("snmp_retries", 1)
        
        client = SNMPClient(ip, community=community, timeout=timeout, retries=retries)
        
        # Phase 1: Connectivity Test (Fetch sysName as ping)
        success, val, ms = client.get(self.OIDS["sysName"])
        
        if not success:
            result["status"] = "timeout"
            return result
            
        result["status"] = "success"
        result["phase1_connectivity"]["reachable"] = True
        result["phase1_connectivity"]["response_time_ms"] = round(ms, 2)
        result["system"]["hostname"] = val
        
        # Phase 2: MIB-II System Info
        for key in ["sysDescr", "sysObjectID", "sysUpTime", "sysContact", "sysLocation"]:
            succ, v, _ = client.get(self.OIDS[key])
            if succ:
                result["system"][key] = v
                
        # Basic parsing of sysDescr/sysObjectID for Vendor/Model logic can be added here
        sys_descr = result["system"]["sysDescr"] or ""
        sys_descr_lower = sys_descr.lower()
        if "cisco" in sys_descr_lower:
            result["system"]["vendor"] = "Cisco"
        elif "mikrotik" in sys_descr_lower or "routeros" in sys_descr_lower:
            result["system"]["vendor"] = "MikroTik"
        elif "ubiquiti" in sys_descr_lower:
            result["system"]["vendor"] = "Ubiquiti"
        elif "linux" in sys_descr_lower:
            result["system"]["vendor"] = "Linux Host"
        elif "windows" in sys_descr_lower:
            result["system"]["vendor"] = "Microsoft"
            
        return result
