import time
import logging
from typing import Dict, Any, Optional

try:
    from pysnmp.hlapi import getCmd, SnmpEngine, CommunityData, UdpTransportTarget, ContextData, ObjectType, ObjectIdentity
    PYSNMP_AVAILABLE = True
except ImportError:
    PYSNMP_AVAILABLE = False

logger = logging.getLogger("infraguard.snmp_client")

class SNMPClient:
    """
    Wrapper for pysnmp to abstract library implementation details.
    Ensures that if the library changes in the future, only this wrapper needs updates.
    """
    def __init__(self, ip: str, community: str = "public", port: int = 161, timeout: int = 2, retries: int = 1):
        self.ip = ip
        self.community = community
        self.port = port
        self.timeout = timeout
        self.retries = retries
        
        if PYSNMP_AVAILABLE:
            self.engine = SnmpEngine()
            self.community_data = CommunityData(self.community, mpModel=1) # v2c
            self.transport = UdpTransportTarget((self.ip, self.port), timeout=self.timeout, retries=self.retries)
            self.context = ContextData()

    def get(self, oid: str) -> tuple[bool, Any, float]:
        """
        Fetches a single OID.
        Returns (success, value, response_time_ms)
        """
        if not PYSNMP_AVAILABLE:
            return False, None, 0.0
            
        start_time = time.time()
        try:
            errorIndication, errorStatus, errorIndex, varBinds = next(
                getCmd(self.engine, self.community_data, self.transport, self.context, ObjectType(ObjectIdentity(oid)))
            )
            elapsed_ms = (time.time() - start_time) * 1000.0
            
            if errorIndication or errorStatus:
                logger.debug(f"SNMP get error for {self.ip} at {oid}: {errorIndication or errorStatus}")
                return False, None, elapsed_ms
                
            if varBinds:
                # Extract value
                val = varBinds[0][1]
                return True, str(val), elapsed_ms
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000.0
            logger.debug(f"SNMP wrapper exception for {self.ip} at {oid}: {e}")
            return False, None, elapsed_ms
            
        return False, None, (time.time() - start_time) * 1000.0
