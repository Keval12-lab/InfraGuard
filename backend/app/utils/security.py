import ipaddress
import re
import logging
from typing import Any, Dict, Optional

# Structured Logger
logger = logging.getLogger("infraguard.security")


class SecurityValidationError(Exception):
    """
    Custom exception raised when an input or request fails security verification checks.
    """
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


def validate_ip_address(ip_str: str) -> bool:
    """
    Validates if the provided string is a valid IPv4 or IPv6 address.
    """
    if not ip_str or not isinstance(ip_str, str):
        return False
    try:
        ipaddress.ip_address(ip_str.strip())
        return True
    except ValueError:
        return False


def validate_hostname(hostname: str) -> bool:
    """
    Validates if the provided string is a valid hostname according to RFC 1123.
    """
    if not hostname or not isinstance(hostname, str) or len(hostname) > 253:
        return False
    
    # Remove trailing dot if present
    if hostname.endswith("."):
        hostname = hostname[:-1]
        
    # RFC 1123 hostname validation regex
    hostname_regex = re.compile(
        r"^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?"
        r"(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$"
    )
    return bool(hostname_regex.match(hostname))


def validate_target_address(target: str) -> bool:
    """
    Validates if the target address is either a valid IP address or a valid hostname.
    """
    if not target or not isinstance(target, str):
        return False
    target = target.strip()
    return validate_ip_address(target) or validate_hostname(target)


def validate_mac_address(mac: str) -> bool:
    """
    Validates if the string is a valid MAC address format.
    """
    if not mac or not isinstance(mac, str):
        return False
    mac = mac.strip()
    mac_regex = re.compile(r"^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$|^[0-9a-fA-F]{12}$")
    return bool(mac_regex.match(mac))


def validate_port(port: Any) -> int:
    """
    Validates and parses a network port number. Returns the port if valid, raises ValueError otherwise.
    """
    try:
        port_num = int(port)
        if 1 <= port_num <= 65535:
            return port_num
    except (ValueError, TypeError):
        pass
    raise ValueError(f"Invalid network port: {port}")


def log_security_event(event_name: str, status: str, details: Dict[str, Any], level: str = "INFO"):
    """
    Logs structured security event data as formatted JSON-like fields.
    """
    log_msg = f"[SECURITY EVENT] Name: {event_name} | Status: {status} | Details: {details}"
    if level.upper() == "WARNING":
        logger.warning(log_msg)
    elif level.upper() == "ERROR":
        logger.error(log_msg)
    else:
        logger.info(log_msg)


def enforce_target_validation(target: str, context: str):
    """
    Centralized validation enforcer. Raises SecurityValidationError if target is invalid.
    """
    TargetValidator.validate(target, context)


class TargetValidator:
    @staticmethod
    def validate(target: Any, context: str = "general") -> str:
        """
        Unified validation API. Validates target address (IPv4, IPv6, or Hostname).
        Raises SecurityValidationError if invalid. Returns stripped, validated target.
        """
        if not target or not isinstance(target, str):
            log_security_event(
                event_name="input_validation",
                status="failed",
                details={"context": context, "reason": "empty_or_non_string", "target": str(target)},
                level="WARNING"
            )
            raise SecurityValidationError("Missing or invalid target parameter.")
            
        cleaned_target = target.strip()
        
        # Reject flag injection patterns (inputs starting with hyphen)
        if cleaned_target.startswith("-"):
            log_security_event(
                event_name="flag_injection_attempt",
                status="blocked",
                details={"context": context, "target": cleaned_target},
                level="WARNING"
            )
            raise SecurityValidationError("Command flag injection detected and blocked.")
            
        # Check IP or Hostname formatting
        if validate_ip_address(cleaned_target) or validate_hostname(cleaned_target):
            return cleaned_target
            
        log_security_event(
            event_name="input_validation",
            status="failed",
            details={"context": context, "reason": "invalid_format", "target": cleaned_target},
            level="WARNING"
        )
        raise SecurityValidationError(f"Target address '{cleaned_target}' failed DNS/IP formatting rules.")
