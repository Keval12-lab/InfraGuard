from abc import ABC, abstractmethod
from typing import Dict, Any

class IDiscoveryModule(ABC):
    """
    Interface for discovery modules (ICMP, ARP, SNMP, etc.).
    """
    
    @abstractmethod
    def get_name(self) -> str:
        """Returns the module name (e.g., 'icmp', 'arp', 'snmp')"""
        pass

    @abstractmethod
    def discover(self, ip: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes discovery on a specific IP.
        context can hold shared state, credentials, or previous module results.
        Returns a dictionary of discovered data or an error state.
        """
        pass
