import socket
import ipaddress
import platform
import subprocess
import concurrent.futures
import logging
import os
import statistics
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

try:
    import psutil
    _PSUTIL_AVAILABLE = True
except ImportError:
    _PSUTIL_AVAILABLE = False

from ..config import (
    DISCOVERY_TIMEOUT,
    DISCOVERY_THREADS,
    MAX_SCAN_HOSTS,
    PING_RETRY_COUNT,
)

from .mac_vendor_service import resolve_vendor_by_mac, classify_device
from .discovery_engine.snmp import SNMPDiscovery
from .discovery_engine.confidence_engine import ConfidenceEngine
from .discovery_engine.recommendation_engine import RecommendationEngine
from ..database.db import save_discovery_results

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
            "current_user": _detect_current_user(),
            "internet_connected": _check_internet(),
            "is_loopback": False,
            "message": "Active LAN interface detected successfully."
        }

        os_info = _detect_os_info()
        enriched["os_name"] = os_info.get("os_name")
        enriched["windows_version"] = os_info.get("windows_version")
        enriched["boot_time"] = _detect_boot_time()

        public_ip = _detect_public_ip()
        enriched["public_ip"] = public_ip
        enriched["isp"] = _detect_isp(public_ip)

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
            f"type={enriched['interface_type']} internet={enriched['internet_connected']} "
            f"public_ip={enriched['public_ip']} isp={enriched['isp']}"
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
            lines = result.stdout.splitlines()
            for i, line in enumerate(lines):
                if "Default Gateway" in line:
                    # It might be on the same line after the colon
                    parts = line.split(":")
                    gw = parts[-1].strip() if len(parts) > 1 else ""
                    
                    # If it's empty, or an IPv6 address, check the next line for IPv4
                    if not gw or "%" in gw or ":" in gw:
                        # Try to find a valid IPv4 on the next line
                        if i + 1 < len(lines):
                            next_line_gw = lines[i + 1].strip()
                            if next_line_gw and ":" not in next_line_gw:
                                gw = next_line_gw

                    if gw:
                        try:
                            # Only accept IPv4 gateway for LAN discovery
                            parsed_ip = ipaddress.ip_address(gw)
                            if parsed_ip.version == 4:
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
            lines = result.stdout.splitlines()
            in_dns_section = False
            for line in lines:
                if "DNS Servers" in line or ("DNS" in line and "Server" in line):
                    in_dns_section = True
                    parts = line.split(":")
                    addr = parts[-1].strip() if len(parts) > 1 else ""
                elif in_dns_section and line.startswith(" ") and ":" not in line and line.strip():
                    # Continuation line for DNS
                    addr = line.strip()
                elif in_dns_section and not line.startswith(" ") and line.strip():
                    in_dns_section = False
                    addr = ""
                else:
                    addr = ""

                if addr:
                    try:
                        # Only grab IPv4 DNS
                        parsed_ip = ipaddress.ip_address(addr)
                        if parsed_ip.version == 4 and addr not in dns_list:
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


# ---------------------------------------------------------------------------
# Phase 1 — System Identity helpers
# ---------------------------------------------------------------------------

def _detect_current_user() -> Optional[str]:
    """Returns the logged-in OS username. Returns None on failure."""
    try:
        return os.getlogin()
    except Exception:
        try:
            return os.environ.get("USERNAME") or os.environ.get("USER")
        except Exception as e:
            logger.debug(f"Current user detection failed: {e}")
            return None


def _detect_os_info() -> dict:
    """
    Returns os_name and windows_version (or kernel_version on Linux).
    Always returns a dict with null-safe values.
    """
    try:
        system = platform.system()
        release = platform.release()
        version = platform.version()
        if system == "Windows":
            # e.g. "Windows 11 Pro" from platform.uname
            uname = platform.uname()
            os_name = f"Windows {release}"
            return {"os_name": os_name, "windows_version": version}
        elif system == "Darwin":
            return {"os_name": f"macOS {platform.mac_ver()[0]}", "windows_version": None}
        else:
            return {"os_name": f"Linux {release}", "windows_version": None}
    except Exception as e:
        logger.debug(f"OS info detection failed: {e}")
        return {"os_name": None, "windows_version": None}


def _detect_boot_time() -> Optional[str]:
    """
    Returns system boot time as an ISO 8601 UTC string.
    Uses psutil if available (cross-platform); falls back to platform-specific commands.
    """
    try:
        if _PSUTIL_AVAILABLE:
            boot_ts = psutil.boot_time()
            return datetime.fromtimestamp(boot_ts, tz=timezone.utc).isoformat()
        # Linux fallback: /proc/uptime
        if platform.system() != "Windows":
            with open("/proc/uptime", "r") as f:
                uptime_seconds = float(f.read().split()[0])
            boot_ts = time.time() - uptime_seconds
            return datetime.fromtimestamp(boot_ts, tz=timezone.utc).isoformat()
    except Exception as e:
        logger.debug(f"Boot time detection failed: {e}")
    return None


def _detect_public_ip() -> Optional[str]:
    """
    Fetches the public-facing IPv4 address from ipify.org.
    Returns None on timeout or any network failure.
    """
    try:
        url = "https://api.ipify.org?format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "InfraGuard/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            import json
            data = json.loads(resp.read().decode())
            ip = data.get("ip")
            if ip:
                logger.debug(f"Public IP detected: {ip}")
            return ip
    except Exception as e:
        logger.debug(f"Public IP detection failed: {e}")
        return None


def _detect_isp(public_ip: Optional[str]) -> Optional[str]:
    """
    Fetches ISP/org name for the given public IP using ipapi.co.
    Only called when public_ip is not None.
    Returns None on timeout or any network failure.
    """
    if not public_ip:
        return None
    try:
        url = f"https://ipapi.co/{public_ip}/org/"
        req = urllib.request.Request(url, headers={"User-Agent": "InfraGuard/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            isp = resp.read().decode().strip()
            # Strip ASN prefix e.g. "AS12345 Reliance Jio" -> "Reliance Jio"
            if isp and " " in isp and isp.split()[0].startswith("AS"):
                isp = " ".join(isp.split()[1:])
            logger.debug(f"ISP detected: {isp}")
            return isp if isp else None
    except Exception as e:
        logger.debug(f"ISP detection failed: {e}")
        return None


# ---------------------------------------------------------------------------
# Phase 2 — Network Quality measurement
# ---------------------------------------------------------------------------

def measure_network_quality(gateway: Optional[str]) -> Dict[str, Any]:
    """
    Measures real-time network quality metrics:
    - gateway_ping_ms
    - internet_ping_ms
    - dns_response_ms
    - packet_loss_pct
    - jitter_ms
    - quality_rating: Excellent / Good / Fair / Poor

    All values return None on failure. Never raises exceptions.
    """
    PING_COUNT = 5
    INTERNET_TARGET = "8.8.8.8"
    DNS_TARGET = "google.com"

    def _ping_rtt(host: str) -> Optional[float]:
        """Single ICMP/TCP ping returning RTT in ms, or None on failure."""
        try:
            start = time.perf_counter()
            sock = socket.create_connection((host, 53), timeout=2)
            sock.close()
            return round((time.perf_counter() - start) * 1000, 2)
        except Exception:
            return None

    def _multi_ping(host: str, count: int) -> List[Optional[float]]:
        return [_ping_rtt(host) for _ in range(count)]

    # Gateway ping (single measurement)
    gateway_ping_ms: Optional[float] = None
    if gateway:
        try:
            gateway_ping_ms = _ping_rtt(gateway)
        except Exception:
            pass

    # Internet multi-ping for packet loss and jitter
    internet_samples = _multi_ping(INTERNET_TARGET, PING_COUNT)
    successful = [r for r in internet_samples if r is not None]
    failed = PING_COUNT - len(successful)

    internet_ping_ms: Optional[float] = round(statistics.mean(successful), 2) if successful else None
    packet_loss_pct: float = round((failed / PING_COUNT) * 100, 1)
    jitter_ms: Optional[float] = (
        round(statistics.stdev(successful), 2) if len(successful) >= 2 else 0.0
    )

    # DNS response time
    dns_response_ms: Optional[float] = None
    try:
        start = time.perf_counter()
        socket.getaddrinfo(DNS_TARGET, None, socket.AF_INET)
        dns_response_ms = round((time.perf_counter() - start) * 1000, 2)
    except Exception as e:
        logger.debug(f"DNS response time measurement failed: {e}")

    # Quality rating
    def _rate(ping: Optional[float], loss: float) -> str:
        if ping is None:
            return "Poor"
        if loss == 0 and ping < 10:
            return "Excellent"
        if loss < 2 and ping < 50:
            return "Good"
        if loss < 5 and ping < 150:
            return "Fair"
        return "Poor"

    quality_rating = _rate(internet_ping_ms, packet_loss_pct)

    logger.info(
        f"Network quality — gateway={gateway_ping_ms}ms internet={internet_ping_ms}ms "
        f"dns={dns_response_ms}ms loss={packet_loss_pct}% jitter={jitter_ms}ms "
        f"rating={quality_rating}"
    )

    return {
        "gateway_ping_ms": gateway_ping_ms,
        "internet_ping_ms": internet_ping_ms,
        "dns_response_ms": dns_response_ms,
        "packet_loss_pct": packet_loss_pct,
        "jitter_ms": jitter_ms,
        "quality_rating": quality_rating,
        "sample_count": PING_COUNT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
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
    Fallback inference if MAC/OUI is not available.
    Returns: (device_name, device_type, vendor)
    """
    host_lower = hostname.lower() if hostname and hostname != "Not Available" else ""
    is_gateway = (ip_str.endswith(".1") or ip_str.endswith(".254"))

    if any(k in host_lower for k in ["macbook", "laptop", "thinkpad", "dell-lap", "surface", "book"]):
        dev_name = hostname if hostname != "Not Available" else f"Laptop ({ip_str})"
        return dev_name, "Laptop (Estimated)", "Unknown"

    if any(k in host_lower for k in ["pc", "desktop", "win", "workstation", "keval", "host"]):
        dev_name = hostname if hostname != "Not Available" else f"Workstation ({ip_str})"
        return dev_name, "Desktop (Estimated)", "Unknown"

    if is_gateway:
        return f"Default Gateway ({ip_str})", "Router (Detected)", "Unknown"

    return hostname if hostname != "Not Available" else "Not Available", "Unknown", "Unknown"


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

    arp_map = get_arp_table()
    for dev in discovered_devices:
        ip = dev["ip_address"]
        hostname = dev["hostname"]
        mac = arp_map.get(ip)
        if mac:
            dev["mac_address"] = mac
            vendor = resolve_vendor_by_mac(mac)
            if vendor != "Unknown":
                dev["vendor"] = vendor
            dev["device_type"] = classify_device(dev["vendor"], hostname, ip)
        else:
            dev["mac_address"] = None

    # Run SNMP Discovery in parallel on discovered devices
    snmp_module = SNMPDiscovery()
    snmp_successes = 0
    snmp_timeouts = 0

    def _run_snmp(dev_dict):
        # We use a short timeout for network scan mapping
        snmp_result = snmp_module.discover(dev_dict["ip_address"], {"snmp_community": "public", "snmp_timeout": 1, "snmp_retries": 1})
        if snmp_result["status"] == "success":
            dev_dict["snmp"] = snmp_result
            
            # Enrich base device info with SNMP System Data
            system_data = snmp_result.get("system", {})
            if system_data.get("hostname"):
                dev_dict["hostname"] = system_data["hostname"]
            if system_data.get("vendor"):
                dev_dict["vendor"] = system_data["vendor"]
                dev_dict["device_type"] = classify_device(system_data["vendor"], system_data["hostname"], dev_dict["ip_address"])
            
            return True
        return False

    if len(discovered_devices) > 0:
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as snmp_exec:
                snmp_futures = [snmp_exec.submit(_run_snmp, dev) for dev in discovered_devices]
                for future in concurrent.futures.as_completed(snmp_futures):
                    if future.result():
                        snmp_successes += 1
                    else:
                        snmp_timeouts += 1
        except Exception as snmp_err:
            logger.warning(f"SNMP thread pool error: {snmp_err}")

    for dev in discovered_devices:
        score, label, reasons = ConfidenceEngine.evaluate(dev)
        dev["confidence_score"] = score
        dev["confidence_label"] = label
        dev["verification_reasons"] = reasons
        dev["troubleshooting"] = RecommendationEngine.get_troubleshooting(dev)

    network_health = RecommendationEngine.calculate_network_health(discovered_devices)

    discovered_devices.sort(key=lambda d: [int(x) for x in d["ip_address"].split(".")])
    end_time = datetime.now(timezone.utc)
    duration_seconds = round((end_time - start_time).total_seconds(), 2)

    logger.info(
        f"[Discovery Completed] Subnet: {network} | Found: {len(discovered_devices)}/{len(target_ips)} hosts | Duration: {duration_seconds}s"
    )

    diagnostics = {
        "icmp": "PASS",
        "arp": "PASS" if len(arp_map) > 0 else "WARNING",
        "mac_lookup": "PASS",
        "snmp": "PASS" if snmp_successes > 0 else ("TIMEOUT" if snmp_timeouts > 0 else "SKIPPED"),
        "asset_sync": "PENDING",
        "stats": {
            "discovered": len(discovered_devices),
            "snmp_success": snmp_successes,
            "snmp_failed": snmp_timeouts
        }
    }

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
        
    final_results = {
        "subnet": str(network),
        "total_scanned": len(target_ips),
        "active_found": len(discovered_devices),
        "unreachable_count": len(target_ips) - len(discovered_devices),
        "duration_seconds": duration_seconds,
        "scanned_at": end_time.isoformat(),
        "network_health": network_health,
        "devices": discovered_devices,
        "diagnostics": diagnostics
    }
    
    try:
        # Automatic Sync to Assets Database
        history_id = save_discovery_results(final_results)
        final_results["history_id"] = history_id
        final_results["diagnostics"]["asset_sync"] = "PASS"
        logger.info(f"Asset Database Synced automatically. History ID: {history_id}")
    except Exception as db_err:
        final_results["diagnostics"]["asset_sync"] = "FAIL"
        logger.error(f"Failed to sync discovery results to asset DB: {db_err}")

    return final_results


def get_demo_discovery_results() -> Dict[str, Any]:
    """
    Returns realistic, clearly labeled Demo Mode discovery results for presentation/interviews.
    Labeled explicitly with is_demo: True and 'DEMO DATA - SIMULATED ENVIRONMENT' banner.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    demo_devices = [
        {
            "ip_address": "192.168.29.1",
            "hostname": "Jio-Fiber-Gateway",
            "mac_address": "A4:91:B1:C2:D3:E4",
            "vendor": "Jio Infocomm",
            "device_type": "Router",
            "reachable": True,
            "latency": 1.45,
            "confidence_score": 100,
            "confidence_label": "100% Fully Verified",
            "verification_reasons": [
                "✔ Device responded to network probe",
                "✔ Physical MAC Address verified",
                "✔ Brand identified (Jio Infocomm)",
                "✔ System details collected via SNMP"
            ],
            "troubleshooting": {
                "status_summary": "Device is online and responding normally.",
                "possible_reasons": [],
                "what_you_can_try": ["No action required. Main router connection is healthy."]
            }
        },
        {
            "ip_address": "192.168.29.105",
            "hostname": "Engineering-Laptop",
            "mac_address": "84:7B:EB:99:88:77",
            "vendor": "Dell Technologies",
            "device_type": "Laptop",
            "reachable": True,
            "latency": 4.12,
            "confidence_score": 80,
            "confidence_label": "80% Verified by Ping & MAC",
            "verification_reasons": [
                "✔ Device responded to network probe",
                "✔ Physical MAC Address verified",
                "✔ Brand identified (Dell Technologies)"
            ],
            "troubleshooting": {
                "status_summary": "Device is online and responding normally.",
                "possible_reasons": [],
                "what_you_can_try": ["No action required. Connection is healthy."]
            }
        },
        {
            "ip_address": "192.168.29.140",
            "hostname": "HP-OfficeJet-Pro",
            "mac_address": "00:1E:0B:44:55:66",
            "vendor": "HP Inc.",
            "device_type": "Printer",
            "reachable": True,
            "latency": 8.35,
            "confidence_score": 80,
            "confidence_label": "80% Verified by Ping & MAC",
            "verification_reasons": [
                "✔ Device responded to network probe",
                "✔ Physical MAC Address verified",
                "✔ Brand identified (HP Inc.)"
            ],
            "troubleshooting": {
                "status_summary": "Device is online and responding normally.",
                "possible_reasons": [],
                "what_you_can_try": ["No action required. Connection is healthy."]
            }
        },
        {
            "ip_address": "192.168.29.182",
            "hostname": "Support-iPhone",
            "mac_address": "DC:A9:04:11:22:33",
            "vendor": "Apple Inc.",
            "device_type": "Mobile",
            "reachable": True,
            "latency": 12.60,
            "confidence_score": 80,
            "confidence_label": "80% Verified by Ping & MAC",
            "verification_reasons": [
                "✔ Device responded to network probe",
                "✔ Physical MAC Address verified",
                "✔ Brand identified (Apple Inc.)"
            ],
            "troubleshooting": {
                "status_summary": "Device is online and responding normally.",
                "possible_reasons": [],
                "what_you_can_try": ["No action required. Connection is healthy."]
            }
        },
        {
            "ip_address": "192.168.29.200",
            "hostname": "Backup-NAS-01",
            "mac_address": "00:11:32:77:88:99",
            "vendor": "Synology Inc.",
            "device_type": "Storage (NAS)",
            "reachable": True,
            "latency": 2.10,
            "confidence_score": 100,
            "confidence_label": "100% Fully Verified",
            "verification_reasons": [
                "✔ Device responded to network probe",
                "✔ Physical MAC Address verified",
                "✔ Brand identified (Synology Inc.)",
                "✔ System details collected via SNMP"
            ],
            "troubleshooting": {
                "status_summary": "Device is online and responding normally.",
                "possible_reasons": [],
                "what_you_can_try": ["No action required. Connection is healthy."]
            }
        },
        {
            "ip_address": "192.168.29.220",
            "hostname": "Lobby-IP-Camera",
            "mac_address": "BC:AD:28:33:44:55",
            "vendor": "Hikvision",
            "device_type": "IP Camera",
            "reachable": False,
            "latency": None,
            "confidence_score": 0,
            "confidence_label": "0% Unverified / Offline",
            "verification_reasons": [
                "✖ Device did not respond to network probe",
                "✖ Physical MAC Address cached from previous scan"
            ],
            "troubleshooting": {
                "status_summary": "Device is not responding on the network.",
                "possible_reasons": [
                    "Camera power supply unplugged or PoE port disabled",
                    "Ethernet cable damaged or disconnected",
                    "Camera IP address changed"
                ],
                "what_you_can_try": [
                    "1. Verify camera power supply / PoE switch port status",
                    "2. Check physical Ethernet cable connection",
                    "3. Run a fresh network scan"
                ]
            }
        }
    ]

    return {
        "is_demo": True,
        "demo_banner": "DEMO DATA - SIMULATED ENVIRONMENT (Never Mixed With Live Scan)",
        "subnet": "192.168.29.0/24 (Simulated)",
        "total_scanned": 254,
        "active_found": 5,
        "unreachable_count": 1,
        "duration_seconds": 0.45,
        "scanned_at": now_iso,
        "network_health": {
            "score": 85,
            "label": "Good",
            "summary": "5 of 6 devices operational. 1 offline camera detected."
        },
        "devices": demo_devices,
        "diagnostics": {
            "icmp": "PASS",
            "arp": "PASS",
            "mac_lookup": "PASS",
            "snmp": "PASS",
            "asset_sync": "PASS",
            "stats": {"discovered": 6, "snmp_success": 2, "snmp_failed": 0}
        }
    }

