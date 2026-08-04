import logging

logger = logging.getLogger("infraguard.mac_oui")

# Hardcoded common enterprise OUIs for offline resolution
OUI_DATABASE = {
    # Apple
    "00:50:e4": "Apple",
    "00:03:93": "Apple",
    "00:0a:95": "Apple",
    "00:14:51": "Apple",
    "00:16:cb": "Apple",
    "00:1c:b3": "Apple",
    "00:1e:52": "Apple",
    "00:23:12": "Apple",
    "00:25:00": "Apple",
    "00:26:b0": "Apple",
    "00:0d:93": "Apple",
    "18:af:61": "Apple",
    "28:cf:e9": "Apple",
    "3c:22:fb": "Apple",
    "40:6c:8f": "Apple",
    "78:4f:43": "Apple",
    "a4:c3:61": "Apple",
    "a8:66:7f": "Apple",
    "c4:2c:03": "Apple",
    "d4:dc:cd": "Apple",
    "e4:ce:8f": "Apple",
    "f0:18:98": "Apple",
    "f8:ff:c2": "Apple",
    
    # Dell
    "00:14:22": "Dell",
    "00:15:c5": "Dell",
    "00:18:8b": "Dell",
    "00:19:b9": "Dell",
    "00:1c:23": "Dell",
    "00:1e:4f": "Dell",
    "00:21:70": "Dell",
    "00:22:19": "Dell",
    "00:23:5a": "Dell",
    "00:24:e8": "Dell",
    "00:25:64": "Dell",
    "00:26:b9": "Dell",
    "14:fe:b5": "Dell",
    "18:fb:7b": "Dell",
    "34:17:eb": "Dell",
    "5c:26:0a": "Dell",
    "74:86:7a": "Dell",
    "84:8f:69": "Dell",
    "a4:ba:db": "Dell",
    "b8:ca:3a": "Dell",
    "c8:1f:66": "Dell",
    "d4:be:d9": "Dell",
    "e4:8d:8c": "Dell",
    "f4:8e:38": "Dell",

    # Microsoft
    "00:03:ff": "Microsoft",
    "00:12:5a": "Microsoft",
    "00:15:5d": "Microsoft",
    "00:17:fa": "Microsoft",
    "00:22:48": "Microsoft",
    "00:25:ae": "Microsoft",
    "00:50:f2": "Microsoft",
    "28:18:78": "Microsoft",
    "30:59:b7": "Microsoft",
    "48:86:e8": "Microsoft",
    "58:82:a8": "Microsoft",
    "60:45:bd": "Microsoft",
    "7c:1e:52": "Microsoft",
    "98:5f:d3": "Microsoft",
    "c0:33:5e": "Microsoft",
    "c8:9e:43": "Microsoft",
    "d0:23:db": "Microsoft",

    # HP
    "00:0e:7f": "HP",
    "00:11:0a": "HP",
    "00:12:79": "HP",
    "00:13:21": "HP",
    "00:14:38": "HP",
    "00:15:60": "HP",
    "00:17:a4": "HP",
    "00:18:fe": "HP",
    "00:19:bb": "HP",
    "00:1a:4b": "HP",
    "00:1b:78": "HP",
    "00:1c:c4": "HP",
    "00:1e:0b": "HP",
    "00:21:5a": "HP",
    "00:22:64": "HP",
    "00:23:7d": "HP",
    "00:24:81": "HP",
    "00:25:b3": "HP",
    "00:26:55": "HP",

    # Cisco
    "00:00:0c": "Cisco",
    "00:01:42": "Cisco",
    "00:01:43": "Cisco",
    "00:01:63": "Cisco",
    "00:01:64": "Cisco",
    "00:01:96": "Cisco",
    "00:01:97": "Cisco",
    "00:02:16": "Cisco",
    "00:02:17": "Cisco",
    "00:02:4a": "Cisco",
    "00:02:4b": "Cisco",
    "00:02:7d": "Cisco",
    "00:02:8a": "Cisco",
    "00:02:b9": "Cisco",
    "00:02:fc": "Cisco",

    # Intel
    "00:02:b3": "Intel",
    "00:03:47": "Intel",
    "00:04:23": "Intel",
    "00:0c:f1": "Intel",
    "00:0e:0c": "Intel",
    "00:11:11": "Intel",
    "00:12:f0": "Intel",
    "00:13:e8": "Intel",
    "00:15:00": "Intel",
    "00:16:ea": "Intel",
    "00:18:8b": "Intel",
    "00:19:d1": "Intel",
    "00:1b:21": "Intel",
    "00:1c:c0": "Intel",
    "00:1e:67": "Intel",
    "00:21:5e": "Intel",

    # Raspberry Pi
    "b8:27:eb": "Raspberry Pi",
    "dc:a6:32": "Raspberry Pi",
    "e4:5f:01": "Raspberry Pi",

    # Samsung
    "00:00:f0": "Samsung",
    "00:07:ab": "Samsung",
    "00:09:18": "Samsung",
    "00:12:47": "Samsung",
    "00:15:99": "Samsung",
    "00:1a:8a": "Samsung",
    "00:1c:43": "Samsung",
    "00:1e:e1": "Samsung",

    # Ubiquiti
    "00:15:6d": "Ubiquiti",
    "00:27:22": "Ubiquiti",
    "04:18:d6": "Ubiquiti",
    "18:e8:29": "Ubiquiti",
    "24:5a:4c": "Ubiquiti",
    "44:d9:e7": "Ubiquiti",
    "60:22:32": "Ubiquiti",
    "68:d7:9a": "Ubiquiti",
    "74:83:c2": "Ubiquiti",
    "80:2a:a8": "Ubiquiti",
    "b4:fb:e4": "Ubiquiti",
    "f0:9f:c2": "Ubiquiti",
    "fc:ec:da": "Ubiquiti",

    # Synology
    "00:11:32": "Synology",
    "90:09:d0": "Synology",

    # QNAP
    "00:08:9b": "QNAP",
    "24:5e:be": "QNAP",

    # Routerboard / MikroTik
    "00:0c:42": "MikroTik",
    "4c:5e:0c": "MikroTik",
    "64:d1:54": "MikroTik",
    "cc:2d:e0": "MikroTik",
    "d4:ca:6d": "MikroTik",
    "e4:8d:8c": "MikroTik",

    # Xiaomi
    "00:9e:c8": "Xiaomi",
    "0c:1d:af": "Xiaomi",
    "14:f6:d8": "Xiaomi",
    "18:59:36": "Xiaomi",
    "20:82:c0": "Xiaomi",
    "28:de:65": "Xiaomi",

    # Huawei
    "00:18:82": "Huawei",
    "00:1e:10": "Huawei",
    "00:25:68": "Huawei",
    "00:46:4b": "Huawei",
    "00:e0:fc": "Huawei",
    "04:fe:7f": "Huawei",

    # VMWare
    "00:05:69": "VMWare",
    "00:0c:29": "VMWare",
    "00:1c:14": "VMWare",
    "00:50:56": "VMWare",

    # VirtualBox
    "08:00:27": "VirtualBox",
}

def resolve_vendor_by_mac(mac_address: str) -> str:
    if not mac_address:
        return "Unknown"
    
    mac_lower = mac_address.lower().replace("-", ":")
    parts = mac_lower.split(":")
    if len(parts) >= 3:
        oui = ":".join(parts[:3])
        if oui in OUI_DATABASE:
            return OUI_DATABASE[oui]
            
    return "Unknown"

def classify_device(vendor: str, hostname: str = "", ip_str: str = "") -> str:
    """
    Classify device based on vendor, hostname, and IP context.
    Returns the device type string.
    """
    vendor_lower = vendor.lower()
    host_lower = hostname.lower() if hostname else ""
    
    # 1. Vendor heuristics
    if "apple" in vendor_lower:
        if any(k in host_lower for k in ["macbook", "mac", "mini", "imac"]):
            return "Mac"
        return "iPhone / iPad"
    
    if "microsoft" in vendor_lower or "dell" in vendor_lower or "hp" in vendor_lower or "lenovo" in vendor_lower or "intel" in vendor_lower:
        if "server" in host_lower:
            return "Server"
        return "Desktop"
    
    if "vmware" in vendor_lower or "virtualbox" in vendor_lower:
        return "Virtual Machine"
        
    if "synology" in vendor_lower or "qnap" in vendor_lower:
        return "NAS"
        
    if "raspberry" in vendor_lower:
        return "IoT Device"
        
    if "cisco" in vendor_lower or "mikrotik" in vendor_lower or "ubiquiti" in vendor_lower:
        return "Network Device"
        
    if "samsung" in vendor_lower or "xiaomi" in vendor_lower or "huawei" in vendor_lower:
        return "Mobile Device"
        
    if "brother" in vendor_lower or "epson" in vendor_lower or "canon" in vendor_lower or "hp" in vendor_lower:
        if "print" in host_lower or "prn" in host_lower:
            return "Printer"

    # 2. Hostname heuristics
    if any(k in host_lower for k in ["ap", "wifi", "wireless"]):
        return "Access Point"
    if any(k in host_lower for k in ["switch", "sw-"]):
        return "Switch"
    if any(k in host_lower for k in ["router", "rtr", "gateway", "gw-"]):
        return "Router"
    if any(k in host_lower for k in ["cam", "camera", "cctv"]):
        return "IP Camera"
    if any(k in host_lower for k in ["print"]):
        return "Printer"
    if any(k in host_lower for k in ["linux", "ubuntu", "debian", "centos", "redhat"]):
        return "Linux Host"
        
    return "Unknown"
