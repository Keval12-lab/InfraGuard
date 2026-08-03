import socket
import time
import subprocess
import platform
import logging
import re
from typing import Dict, Any, Optional
from ..database.db import log_terminal_command, get_terminal_history
from ..utils.security import enforce_target_validation

logger = logging.getLogger("infraguard.workspace")


def run_ping_tool(target_ip: str, count: int = 4, asset_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Executes ICMP ping diagnostic tool against target IP.
    """
    enforce_target_validation(target_ip, "service_ping_tool")
    start_time = time.time()
    system_os = platform.system().lower()
    
    if system_os == "windows":
        cmd = ["ping", "-n", str(count), target_ip]
    else:
        cmd = ["ping", "-c", str(count), target_ip]

    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=10)
        output_text = res.stdout if res.stdout else res.stderr
        duration_ms = round((time.time() - start_time) * 1000, 2)
        success = res.returncode == 0

        command_str = " ".join(cmd)
        log_terminal_command(
            tool_name="Ping",
            command_str=command_str,
            output_text=output_text,
            duration_ms=duration_ms,
            asset_id=asset_id
        )

        return {
            "success": success,
            "tool": "Ping",
            "command": command_str,
            "target": target_ip,
            "output": output_text,
            "duration_ms": duration_ms
        }
    except Exception as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        err_msg = f"Ping failed: {str(e)}"
        log_terminal_command(tool_name="Ping", command_str=f"ping {target_ip}", output_text=err_msg, duration_ms=duration_ms, asset_id=asset_id)
        return {
            "success": False,
            "tool": "Ping",
            "command": f"ping {target_ip}",
            "target": target_ip,
            "output": err_msg,
            "duration_ms": duration_ms
        }


def run_port_check_tool(target_ip: str, port: int, asset_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Tests TCP socket connectivity on specified port.
    """
    enforce_target_validation(target_ip, "service_port_check_tool")
    start_time = time.time()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2.5)

    known_ports = {
        21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS", 80: "HTTP",
        110: "POP3", 139: "NetBIOS", 443: "HTTPS", 445: "SMB", 1433: "MSSQL",
        3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL", 8080: "HTTP-Alt"
    }
    service_name = known_ports.get(port, "Custom Service")

    try:
        conn_res = sock.connect_ex((target_ip, port))
        sock.close()
        duration_ms = round((time.time() - start_time) * 1000, 2)
        is_open = (conn_res == 0)

        output_text = (
            f"[Port Check] Host: {target_ip} | Port: {port} ({service_name})\n"
            f"Status: {'OPEN' if is_open else 'CLOSED / FILTERED'}\n"
            f"Latency: {duration_ms} ms"
        )
        command_str = f"nc -zv {target_ip} {port}"

        log_terminal_command(tool_name="Port Check", command_str=command_str, output_text=output_text, duration_ms=duration_ms, asset_id=asset_id)

        return {
            "success": is_open,
            "tool": "Port Check",
            "target": target_ip,
            "port": port,
            "service": service_name,
            "status": "OPEN" if is_open else "CLOSED",
            "output": output_text,
            "duration_ms": duration_ms
        }
    except Exception as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        output_text = f"Port check error on {target_ip}:{port} -> {str(e)}"
        log_terminal_command(tool_name="Port Check", command_str=f"nc -zv {target_ip} {port}", output_text=output_text, duration_ms=duration_ms, asset_id=asset_id)
        return {
            "success": False,
            "tool": "Port Check",
            "target": target_ip,
            "port": port,
            "service": service_name,
            "status": "ERROR",
            "output": output_text,
            "duration_ms": duration_ms
        }


def run_dns_lookup_tool(query: str, asset_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Executes DNS forward and reverse resolution for hostname or IP address.
    """
    enforce_target_validation(query, "service_dns_lookup_tool")
    start_time = time.time()
    try:
        # Check if query is IP address or Hostname
        is_ip = False
        try:
            socket.inet_aton(query)
            is_ip = True
        except socket.error:
            is_ip = False

        if is_ip:
            # Reverse DNS lookup
            host_info = socket.gethostbyaddr(query)
            primary_name = host_info[0]
            aliases = host_info[1]
            ip_addresses = host_info[2]
            output_text = (
                f"[DNS Reverse Lookup] IP: {query}\n"
                f"Resolved Hostname: {primary_name}\n"
                f"Aliases: {', '.join(aliases) if aliases else 'None'}"
            )
        else:
            # Forward DNS lookup
            resolved_ip = socket.gethostbyname(query)
            output_text = (
                f"[DNS Forward Lookup] Query: {query}\n"
                f"Resolved IPv4 Address: {resolved_ip}"
            )

        duration_ms = round((time.time() - start_time) * 1000, 2)
        command_str = f"nslookup {query}"
        log_terminal_command(tool_name="DNS Lookup", command_str=command_str, output_text=output_text, duration_ms=duration_ms, asset_id=asset_id)

        return {
            "success": True,
            "tool": "DNS Lookup",
            "query": query,
            "output": output_text,
            "duration_ms": duration_ms
        }
    except Exception as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        output_text = f"[DNS Lookup Failed] Query '{query}' could not be resolved: {str(e)}"
        log_terminal_command(tool_name="DNS Lookup", command_str=f"nslookup {query}", output_text=output_text, duration_ms=duration_ms, asset_id=asset_id)
        return {
            "success": False,
            "tool": "DNS Lookup",
            "query": query,
            "output": output_text,
            "duration_ms": duration_ms
        }


def send_wake_on_lan_tool(mac_address: str, asset_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Sends magic packet over UDP broadcast (port 9) to wake up host.
    """
    start_time = time.time()
    clean_mac = re.sub(r"[^a-fA-F0-9]", "", mac_address)
    if len(clean_mac) != 12:
        return {
            "success": False,
            "tool": "Wake-on-LAN",
            "output": f"Invalid MAC address format '{mac_address}'. Required: 12 hex chars e.g. AA:BB:CC:DD:EE:FF",
            "duration_ms": 0.0
        }

    try:
        mac_bytes = bytes.fromhex(clean_mac)
        magic_packet = b"\xff" * 6 + mac_bytes * 16

        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.sendto(magic_packet, ("255.255.255.255", 9))
        sock.close()

        duration_ms = round((time.time() - start_time) * 1000, 2)
        formatted_mac = ":".join(clean_mac[i:i+2] for i in range(0, 12, 2)).upper()
        output_text = (
            f"[Wake-on-LAN] Magic packet transmitted successfully!\n"
            f"Target MAC: {formatted_mac}\n"
            f"Broadcast Target: 255.255.255.255:9"
        )
        command_str = f"wol {formatted_mac}"
        log_terminal_command(tool_name="Wake-on-LAN", command_str=command_str, output_text=output_text, duration_ms=duration_ms, asset_id=asset_id)

        return {
            "success": True,
            "tool": "Wake-on-LAN",
            "mac": formatted_mac,
            "output": output_text,
            "duration_ms": duration_ms
        }
    except Exception as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        output_text = f"Wake-on-LAN packet failed: {str(e)}"
        log_terminal_command(tool_name="Wake-on-LAN", command_str=f"wol {mac_address}", output_text=output_text, duration_ms=duration_ms, asset_id=asset_id)
        return {
            "success": False,
            "tool": "Wake-on-LAN",
            "output": output_text,
            "duration_ms": duration_ms
        }
