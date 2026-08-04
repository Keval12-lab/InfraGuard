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
    
    IF_OIDS = {
        "ifDescr": "1.3.6.1.2.1.2.2.1.2",
        "ifType": "1.3.6.1.2.1.2.2.1.3",
        "ifSpeed": "1.3.6.1.2.1.2.2.1.5",
        "ifPhysAddress": "1.3.6.1.2.1.2.2.1.6",
        "ifAdminStatus": "1.3.6.1.2.1.2.2.1.7",
        "ifOperStatus": "1.3.6.1.2.1.2.2.1.8",
        "ifName": "1.3.6.1.2.1.31.1.1.1.1" # IF-MIB
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
            
        # Phase 3: Interface Discovery (IF-MIB)
        succ, if_descrs, _ = client.walk(self.IF_OIDS["ifDescr"])
        if succ and if_descrs:
            interfaces = {}
            for full_oid, descr in if_descrs.items():
                idx = full_oid.split(".")[-1]
                interfaces[idx] = {
                    "index": int(idx),
                    "description": descr,
                    "name": descr, # Fallback to descr
                    "admin_status": "UNKNOWN",
                    "oper_status": "UNKNOWN",
                    "speed": "UNKNOWN",
                    "mac_address": None,
                    "type": "UNKNOWN"
                }
                
            # Walk ifName
            succ, if_names, _ = client.walk(self.IF_OIDS["ifName"])
            if succ:
                for full_oid, name in if_names.items():
                    idx = full_oid.split(".")[-1]
                    if idx in interfaces:
                        interfaces[idx]["name"] = name

            # Walk ifAdminStatus
            succ, admin_statuses, _ = client.walk(self.IF_OIDS["ifAdminStatus"])
            if succ:
                for full_oid, status in admin_statuses.items():
                    idx = full_oid.split(".")[-1]
                    if idx in interfaces:
                        st = int(status)
                        interfaces[idx]["admin_status"] = "UP" if st == 1 else "DOWN" if st == 2 else "TESTING"

            # Walk ifOperStatus
            succ, oper_statuses, _ = client.walk(self.IF_OIDS["ifOperStatus"])
            if succ:
                for full_oid, status in oper_statuses.items():
                    idx = full_oid.split(".")[-1]
                    if idx in interfaces:
                        st = int(status)
                        interfaces[idx]["oper_status"] = "UP" if st == 1 else "DOWN" if st == 2 else "UNKNOWN"

            # Walk ifSpeed
            succ, speeds, _ = client.walk(self.IF_OIDS["ifSpeed"])
            if succ:
                for full_oid, speed in speeds.items():
                    idx = full_oid.split(".")[-1]
                    if idx in interfaces:
                        sp = int(speed)
                        if sp > 0:
                            if sp == 10000000:
                                interfaces[idx]["speed"] = "10 Mbps"
                            elif sp == 100000000:
                                interfaces[idx]["speed"] = "100 Mbps"
                            elif sp == 1000000000:
                                interfaces[idx]["speed"] = "1 Gbps"
                            elif sp == 10000000000:
                                interfaces[idx]["speed"] = "10 Gbps"
                            else:
                                interfaces[idx]["speed"] = f"{sp} bps"

            # Walk ifPhysAddress
            succ, macs, _ = client.walk(self.IF_OIDS["ifPhysAddress"])
            if succ:
                for full_oid, mac_bytes in macs.items():
                    idx = full_oid.split(".")[-1]
                    if idx in interfaces:
                        # pysnmp may return hex formatting depending on version/value
                        if mac_bytes and mac_bytes.startswith("0x"):
                            hex_str = mac_bytes[2:]
                            if len(hex_str) == 12:
                                interfaces[idx]["mac_address"] = ":".join(hex_str[i:i+2] for i in range(0, 12, 2))
                        elif len(mac_bytes) > 0:
                            interfaces[idx]["mac_address"] = str(mac_bytes)

            # Walk ifType
            succ, types, _ = client.walk(self.IF_OIDS["ifType"])
            if succ:
                for full_oid, t in types.items():
                    idx = full_oid.split(".")[-1]
                    if idx in interfaces:
                        t_val = int(t)
                        if t_val == 6:
                            interfaces[idx]["type"] = "Ethernet"
                        elif t_val == 71:
                            interfaces[idx]["type"] = "WiFi"
                        elif t_val == 24:
                            interfaces[idx]["type"] = "Loopback"
                        elif t_val == 53:
                            interfaces[idx]["type"] = "Virtual"
                        else:
                            interfaces[idx]["type"] = str(t_val)
                            
            result["interfaces"] = list(interfaces.values())
            
        return result
