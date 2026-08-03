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
            "default_gateway": None,
            "primary_dns": None,
            "secondary_dns": None,
            "interface_name": None,
            "interface_type": None,
            "mac_address": None,
            "hostname": None,
            "internet_connected": False,
            "is_loopback": False,
            "message": "No active LAN adapter detected. Please specify target IPv4 CIDR range manually."
        }

    try:
        ip_obj = ipaddress.ip_interface(f"{detected_ip}/24")
        network = ip_obj.network
        logger.info(f"Detected active local LAN subnet: {network} (Interface IP: {detected_ip})")

        enriched = {
            "local_ip": detected_ip,
            "detected_cidr": str(network),
            "subnet_mask": "255.255.255.0",
            "default_gateway": _detect_gateway(),
            "primary_dns": None,
            "secondary_dns": None,
            "interface_name": None,
            "interface_type": None,
            "mac_address": None,
            "hostname": _detect_hostname(),
            "internet_connected": _check_internet(),
            "is_loopback": False,
            "message": "Active LAN interface detected successfully."
        }

        dns_servers = _detect_dns_servers()
        enriched["primary_dns"] = dns_servers[0] if len(dns_servers) > 0 else None
        enriched["secondary_dns"] = dns_servers[1] if len(dns_servers) > 1 else None

        iface_name, iface_type, mac = _detect_interface_info(detected_ip)
        enriched["interface_name"] = iface_name
        enriched["interface_type"] = iface_type
        enriched["mac_address"] = mac

        logger.info(
            f"Subnet enrichment complete — gateway={enriched['default_gateway']} "
            f"dns={enriched['primary_dns']} iface={enriched['interface_name']} "
            f"type={enriched['interface_type']} internet={enriched['internet_connected']}"
        )
        return enriched

    except Exception as e:
        logger.error(f"Error calculating subnet CIDR for {detected_ip}: {e}")
        return {
            "local_ip": detected_ip,
            "detected_cidr": f"{detected_ip}/24",
            "subnet_mask": "255.255.255.0",
            "default_gateway": None,
            "primary_dns": None,
            "secondary_dns": None,
            "interface_name": None,
            "interface_type": None,
            "mac_address": None,
            "hostname": _detect_hostname(),
            "internet_connected": False,
            "is_loopback": False,
            "message": "Subnet detected."
        }


# ---------------------------------------------------------------------------
# Private helper functions for subnet enrichment
# ---------------------------------------------------------------------------

def _detect_gateway() -> Optional[str]:
    """Detect the default gateway using OS-native commands. Returns None on failure."""
    try:
        os_name = platform.system()
        if os_name == "Windows":
            result = subprocess.run(
                ["ipconfig"],
                capture_output=True, text=True, timeout=5
            )
            for line in result.stdout.splitlines():
                if "Default Gateway" in line:
                    parts = line.split(":")
                    if len(parts) == 2:
                        gw = parts[1].strip()
                        if gw and gw not in ("", "None", ":"):
                            try:
                                ipaddress.ip_address(gw)
                                logger.debug(f"Detected gateway (ipconfig): {gw}")
                                return gw
                            except ValueError:
                                pass
        else:
            result = subprocess.run(
                ["ip", "route", "show", "default"],
                capture_output=True, text=True, timeout=5
            )
            for line in result.stdout.splitlines():
                parts = line.split()
                if "via" in parts:
                    idx = parts.index("via")
                    if idx + 1 < len(parts):
                        gw = parts[idx + 1]
                        logger.debug(f"Detected gateway (ip route): {gw}")
                        return gw
    except Exception as e:
        logger.debug(f"Gateway detection failed: {e}")
    return None


def _detect_dns_servers() -> List[str]:
    """Detect DNS server addresses from OS configuration. Returns a list (may be empty)."""
    dns_list: List[str] = []
    try:
        os_name = platform.system()
        if os_name == "Windows":
            result = subprocess.run(
                ["ipconfig", "/all"],
                capture_output=True, text=True, timeout=5
            )
            for line in result.stdout.splitlines():
                if "DNS Servers" in line or ("DNS" in line and "Server" in line):
                    parts = line.split(":")
                    if len(parts) >= 2:
                        addr = parts[-1].strip()
                        try:
                            ipaddress.ip_address(addr)
                            if addr not in dns_list:
                                dns_list.append(addr)
                        except ValueError:
                            pass
        else:
            with open("/etc/resolv.conf", "r") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("nameserver"):
                        parts = line.split()
                        if len(parts) == 2:
                            addr = parts[1]
                            try:
                                ipaddress.ip_address(addr)
                                if addr not in dns_list:
                                    dns_list.append(addr)
                            except ValueError:
                                pass
    except Exception as e:
        logger.debug(f"DNS server detection failed: {e}")
    logger.debug(f"Detected DNS servers: {dns_list}")
    return dns_list[:2]


def _detect_interface_info(target_ip: str) -> tuple:
    """
    Returns (interface_name, interface_type, mac_address) for the adapter
    owning target_ip. All values may be None on failure.
    """
    iface_name: Optional[str] = None
    iface_type: Optional[str] = None
    mac_addr: Optional[str] = None
    try:
        os_name = platform.system()
        if os_name == "Windows":
            result = subprocess.run(
                ["ipconfig", "/all"],
                capture_output=True, text=True, timeout=5
            )
            current_adapter: Optional[str] = None
            current_mac: Optional[str] = None
            found_ip = False
            for line in result.stdout.splitlines():
                if line and not line.startswith(" "):
                    if found_ip and current_adapter:
                        break
                    current_adapter = line.strip().rstrip(":")
                    current_mac = None
                    found_ip = False
                elif "Physical Address" in line:
                    parts = line.split(":")
                    if len(parts) >= 2:
                        raw_mac = ":".join(parts[1:]).strip().replace("-", ":")
                        current_mac = raw_mac if raw_mac else None
                elif target_ip in line:
                    found_ip = True
                    if current_adapter:
                        iface_name = current_adapter
                        mac_addr = current_mac
            if iface_name:
                name_lower = iface_name.lower()
                if any(k in name_lower for k in ("wi-fi", "wireless", "wlan", "wifi", "802.11")):
                    iface_type = "Wireless"
                elif any(k in name_lower for k in ("ethernet", "local area", "gigabit")):
                    iface_type = "Ethernet"
                else:
                    iface_type = "Unknown"
        else:
            result = subprocess.run(
                ["ip", "addr", "show"],
                capture_output=True, text=True, timeout=5
            )
            current_iface: Optional[str] = None
            current_mac_l: Optional[str] = None
            for line in result.stdout.splitlines():
                line = line.strip()
                if line and line[0].isdigit():
                    parts = line.split(":")
                    if len(parts) >= 2:
                        current_iface = parts[1].strip()
                        current_mac_l = None
                elif "link/ether" in line:
                    parts = line.split()
                    if len(parts) >= 2:
                        current_mac_l = parts[1]
                elif f"inet {target_ip}" in line and current_iface:
                    iface_name = current_iface
                    mac_addr = current_mac_l
                    name_lower = iface_name.lower()
                    if any(k in name_lower for k in ("wlan", "wlp", "wifi", "wireless")):
                        iface_type = "Wireless"
                    else:
                        iface_type = "Ethernet"
                    break
    except Exception as e:
        logger.debug(f"Interface info detection failed: {e}")
    logger.debug(f"Interface info — name={iface_name} type={iface_type} mac={mac_addr}")
    return iface_name, iface_type, mac_addr


def _detect_hostname() -> Optional[str]:
    """Returns the system hostname. Returns None on failure."""
    try:
        return socket.gethostname()
    except Exception as e:
        logger.debug(f"Hostname detection failed: {e}")
        return None


def _check_internet() -> bool:
    """
    Lightweight internet connectivity check using a non-blocking TCP handshake
    to 8.8.8.8:53 (Google Public DNS). Returns True if reachable within 2s.
    """
    try:
        sock = socket.create_connection(("8.8.8.8", 53), timeout=2)
        sock.close()
        logger.debug("Internet connectivity check: reachable")
        return True
    except Exception as e:
        logger.debug(f"Internet connectivity check failed: {e}")
        return False


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
