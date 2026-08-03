import socket
import ipaddress
import platform
import subprocess
import concurrent.futures
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from ..config import (
    DISCOVERY_TIMEOUT,
    DISCOVERY_THREADS,
    MAX_SCAN_HOSTS,
    PING_RETRY_COUNT,
)

logger = logging.getLogger("infraguard.discovery")


def is_private_ip(ip_str: str) -> bool:
    """
    Checks if an IP address is a valid private IPv4 LAN address.
    Excludes loopback (127.x.x.x) and APIPA (169.254.x.x).
    """
    try:
        ip_obj = ipaddress.ip_address(ip_str)
        if ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_multicast or ip_obj.is_reserved:
            return False
        return ip_obj.is_private
    except ValueError:
        return False


def detect_local_subnet() -> Dict[str, Any]:
    """
    Robust local network interface detection.
    Rules:
    - Ignores loopback (127.x.x.x) and APIPA (169.254.x.x).
    - Prefers active private IPv4 LAN networks (192.168.x.x, 10.x.x.x, 172.16.x.x-172.31.x.x).
    - Never defaults to 127.0.0.1/32. If no active adapter is found, returns detected_cidr: None.
    """
    detected_ip: Optional[str] = None

    # Method 1: Active UDP socket connection probe to default route
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        # Connect to public DNS address (does not send packets over wire)
        s.connect(("8.8.8.8", 80))
        sock_ip = s.getsockname()[0]
        s.close()
        if is_private_ip(sock_ip):
            detected_ip = sock_ip
    except Exception as e:
        logger.debug(f"Socket routing probe failed: {e}")

    # Method 2: Hostname IP address resolution fallback
    if not detected_ip:
        try:
            hostname = socket.gethostname()
            addr_info = socket.getaddrinfo(hostname, None, socket.AF_INET, socket.SOCK_STREAM)
            for info in addr_info:
                ip = info[4][0]
                if is_private_ip(ip):
                    detected_ip = ip
                    break
        except Exception as e:
            logger.debug(f"Hostname resolution fallback failed: {e}")

    if not detected_ip or not is_private_ip(detected_ip):
        logger.warning("No active private LAN adapter detected on host system.")
        return {
            "local_ip": None,
            "detected_cidr": None,
            "subnet_mask": None,
            "is_loopback": False,
            "message": "No active LAN adapter detected. Please specify target IPv4 CIDR range manually."
        }

    try:
        ip_obj = ipaddress.ip_interface(f"{detected_ip}/24")
        network = ip_obj.network
        logger.info(f"Detected active local LAN subnet: {network} (Interface IP: {detected_ip})")
        return {
            "local_ip": detected_ip,
            "detected_cidr": str(network),
            "subnet_mask": "255.255.255.0",
            "is_loopback": False,
            "message": "Active LAN interface detected successfully."
        }
    except Exception as e:
        logger.error(f"Error calculating subnet CIDR for {detected_ip}: {e}")
        return {
            "local_ip": detected_ip,
            "detected_cidr": f"{detected_ip}/24",
            "subnet_mask": "255.255.255.0",
            "is_loopback": False,
            "message": "Subnet detected."
        }


def validate_cidr(cidr_str: str) -> tuple[bool, str, int]:
    """
    Validates subnet CIDR format and host limits.
    """
    if not cidr_str or not cidr_str.strip():
        return False, "Missing subnet format. Please enter a valid IPv4 CIDR range. Example: 192.168.29.0/24", 0

    try:
        network = ipaddress.ip_network(cidr_str.strip(), strict=False)
        if network.version != 4:
            return False, "Only IPv4 subnets are supported. Example: 192.168.29.0/24", 0

        num_hosts = network.num_addresses
        if num_hosts > MAX_SCAN_HOSTS:
            return (
                False,
                f"Subnet range is too large (maximum /22 or {MAX_SCAN_HOSTS} hosts). Please use a smaller range such as 192.168.29.0/24.",
                num_hosts,
            )

        return True, "", num_hosts
    except ValueError as e:
        logger.info(f"Invalid CIDR requested '{cidr_str}': {e}")
        return False, "Invalid subnet format. Example: 192.168.29.0/24", 0


def query_netbios_name(ip_str: str) -> Optional[str]:
    """
    Layer 2: Attempts NetBIOS Node Status query over UDP port 137 or nbtstat binary.
    """
    try:
        packet = (
            b"\x00\x01\x00\x00\x00\x01\x00\x00\x00\x00\x00\x00"
            b"\x20CKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\x00\x00\x21\x00\x01"
        )
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(0.3)
        sock.sendto(packet, (ip_str, 137))
        data, _ = sock.recvfrom(1024)
        sock.close()
        if len(data) > 57:
            num_names = data[56]
            if num_names > 0 and len(data) >= 57 + 18:
                raw_name = data[57 : 57 + 15].decode("ascii", errors="ignore").strip()
                if raw_name:
                    return raw_name
    except Exception:
        pass

    if platform.system().lower() == "windows":
        try:
            res = subprocess.run(
                ["nbtstat", "-A", ip_str], capture_output=True, text=True, timeout=0.5
            )
            if res.returncode == 0 and res.stdout:
                for line in res.stdout.splitlines():
                    if "<00>" in line and "UNIQUE" in line:
                        parts = line.split()
                        if parts:
                            return parts[0].strip()
        except Exception:
            pass

    return None


def query_mdns_name(ip_str: str) -> Optional[str]:
    """
    Layer 3: Attempts mDNS .local PTR lookup.
    """
    try:
        host = socket.gethostbyaddr(ip_str)[0]
        if host and ".local" in host.lower():
            return host.strip()
    except Exception:
        pass
    return None


def resolve_hostname_layered(ip_str: str) -> str:
    """
    Layered Hostname Resolution:
    1. Reverse DNS (socket.gethostbyaddr)
    2. NetBIOS (Windows / UDP 137)
    3. mDNS / Bonjour
    4. Fallback to 'Not Available' (Never 'Unresolved')
    """
    # 1. Reverse DNS
    try:
        host = socket.gethostbyaddr(ip_str)[0]
        if host and host.strip() and host.lower() != ip_str and not host.startswith("ip-"):
            return host.strip()
    except Exception:
        pass

    # 2. NetBIOS
    netbios = query_netbios_name(ip_str)
    if netbios:
        return netbios

    # 3. mDNS
    mdns = query_mdns_name(ip_str)
    if mdns:
        return mdns

    # 4. Graceful Fallback
    return "Not Available"


def infer_device_info(ip_str: str, hostname: str) -> tuple[str, str, str]:
    """
    Lightweight Device Identification & Vendor Cleanup:
    - Vendor must NEVER display "Local Host" or hostnames. Default to "Unknown".
    - Device type values: Router (Detected), Desktop (Estimated), Laptop (Estimated),
      Mobile (Estimated), Printer (Estimated), Unknown.
    """
    host_lower = hostname.lower() if hostname and hostname != "Not Available" else ""

    # Loopback or self host
    if ip_str == "127.0.0.1":
        dev_name = hostname if hostname != "Not Available" else "Local Workstation"
        return dev_name, "Desktop (Estimated)", "Unknown"

    ip_parts = ip_str.split(".")
    is_gateway = len(ip_parts) == 4 and ip_parts[3] in ("1", "254")

    # Keyword patterns for vendor and device type
    if any(k in host_lower for k in ["router", "gateway", "openwrt", "asus", "netgear", "tplink", "mikrotik", "unifi", "ubnt", "cisco"]):
        vendor = (
            "Cisco" if "cisco" in host_lower else
            "Netgear" if "netgear" in host_lower else
            "TP-Link" if "tplink" in host_lower else
            "ASUS" if "asus" in host_lower else
            "Ubiquiti" if ("ubnt" in host_lower or "unifi" in host_lower) else
            "Unknown"
        )
        dev_name = hostname if hostname != "Not Available" else f"Network Router ({ip_str})"
        return dev_name, "Router (Detected)", vendor

    if any(k in host_lower for k in ["print", "hp", "epson", "canon", "brother", "lexmark", "xerox"]):
        vendor = (
            "HP" if "hp" in host_lower else
            "Epson" if "epson" in host_lower else
            "Canon" if "canon" in host_lower else
            "Brother" if "brother" in host_lower else
            "Unknown"
        )
        dev_name = hostname if hostname != "Not Available" else f"Network Printer ({ip_str})"
        return dev_name, "Printer (Estimated)", vendor

    if any(k in host_lower for k in ["phone", "android", "iphone", "ipad", "galaxy", "pixel", "mobile"]):
        vendor = (
            "Apple" if ("iphone" in host_lower or "ipad" in host_lower) else
            "Samsung" if "galaxy" in host_lower else
            "Google" if "pixel" in host_lower else
            "Unknown"
        )
        dev_name = hostname if hostname != "Not Available" else f"Mobile Device ({ip_str})"
        return dev_name, "Mobile (Estimated)", vendor

    if any(k in host_lower for k in ["macbook", "laptop", "thinkpad", "dell-lap", "surface", "book"]):
        vendor = (
            "Apple" if "macbook" in host_lower else
            "Lenovo" if "thinkpad" in host_lower else
            "Microsoft" if "surface" in host_lower else
            "Dell" if "dell" in host_lower else
            "Unknown"
        )
        dev_name = hostname if hostname != "Not Available" else f"Laptop ({ip_str})"
        return dev_name, "Laptop (Estimated)", vendor

    if any(k in host_lower for k in ["pc", "desktop", "win", "workstation", "keval", "host"]):
        vendor = "Microsoft" if "win" in host_lower else "Unknown"
        dev_name = hostname if hostname != "Not Available" else f"Workstation ({ip_str})"
        return dev_name, "Desktop (Estimated)", vendor

    if is_gateway:
        return f"Default Gateway ({ip_str})", "Router (Detected)", "Unknown"

    dev_type = "Unknown"
    vendor = "Unknown"
    dev_name = hostname if hostname != "Not Available" else "Not Available"

    return dev_name, dev_type, vendor


def ping_host(ip_str: str, timeout_ms: int = DISCOVERY_TIMEOUT) -> Optional[Dict[str, Any]]:
    """
    Pings a single IP host address using OS ping binary.
    Returns device dictionary if reachable, None if unreachable.
    """
    system_os = platform.system().lower()
    if system_os == "windows":
        cmd = ["ping", "-n", str(PING_RETRY_COUNT), "-w", str(timeout_ms), ip_str]
    else:
        cmd = ["ping", "-c", str(PING_RETRY_COUNT), "-W", "1", ip_str]

    try:
        res = subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=(timeout_ms / 1000.0) + 0.5,
        )
        if res.returncode == 0:
            now_iso = datetime.now(timezone.utc).isoformat()
            hostname = resolve_hostname_layered(ip_str)
            dev_name, dev_type, vendor = infer_device_info(ip_str, hostname)

            return {
                "ip_address": ip_str,
                "hostname": hostname,
                "device_name": dev_name,
                "vendor": vendor,
                "device_type": dev_type,
                "reachable": True,
                "status": "Healthy",
                "last_seen": now_iso,
                "discovery_timestamp": now_iso,
            }
    except Exception as e:
        logger.debug(f"Ping probe timeout or error for {ip_str}: {e}")

    return None


def execute_subnet_discovery(
    cidr_str: str, max_workers: int = DISCOVERY_THREADS
) -> Dict[str, Any]:
    """
    Scans specified subnet for active hosts using thread pool executor.
    Logs: Discovery Started, Discovery Completed, Duration, Errors, SQLite Writes.
    Never exposes stack traces to user.
    """
    start_time = datetime.now(timezone.utc)
    logger.info(f"[Discovery Started] Target Subnet: {cidr_str} with {max_workers} threads.")

    is_valid, err_msg, total_hosts = validate_cidr(cidr_str)
    if not is_valid:
        logger.warning(f"[Discovery Error] Validation failed for CIDR '{cidr_str}': {err_msg}")
        raise ValueError(err_msg)

    network = ipaddress.ip_network(cidr_str.strip(), strict=False)
    target_ips = [str(ip) for ip in network.hosts()]

    discovered_devices: List[Dict[str, Any]] = []

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_ip = {executor.submit(ping_host, ip): ip for ip in target_ips}
            for future in concurrent.futures.as_completed(future_to_ip):
                try:
                    device = future.result()
                    if device:
                        discovered_devices.append(device)
                except Exception as e:
                    logger.warning(f"Error probing IP target: {e}")
    except Exception as e:
        logger.error(f"[Discovery Error] Thread pool execution failed: {e}")
        raise RuntimeError("Network discovery scan encountered an internal execution error.")

    discovered_devices.sort(key=lambda d: [int(x) for x in d["ip_address"].split(".")])
    end_time = datetime.now(timezone.utc)
    duration_seconds = round((end_time - start_time).total_seconds(), 2)

    logger.info(
        f"[Discovery Completed] Subnet: {network} | Found: {len(discovered_devices)}/{len(target_ips)} hosts | Duration: {duration_seconds}s"
    )

    try:
        from .timeline_service import record_event
        record_event(
            event_type="DISCOVERY",
            severity="INFO" if len(discovered_devices) > 0 else "WARNING",
            title=f"Network Discovery Completed ({network})",
            description=f"Scanned {len(target_ips)} host targets in {duration_seconds}s. Found {len(discovered_devices)} active infrastructure endpoints.",
            metadata={"subnet": str(network), "active_found": len(discovered_devices), "total_scanned": len(target_ips)}
        )
    except Exception as te:
        logger.warning(f"Failed to record discovery timeline event: {te}")

    return {
        "subnet": str(network),
        "total_scanned": len(target_ips),
        "active_found": len(discovered_devices),
        "unreachable_count": len(target_ips) - len(discovered_devices),
        "duration_seconds": duration_seconds,
        "scanned_at": end_time.isoformat(),
        "devices": discovered_devices,
    }
