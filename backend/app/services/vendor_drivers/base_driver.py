from abc import ABC, abstractmethod

class BaseVendorDriver(ABC):
    """
    Abstract Base Class for Multi-Vendor Network Drivers (Cisco, MikroTik, TP-Link, Ruijie, Ubiquiti, Generic).
    """

    @property
    @abstractmethod
    def vendor_name(self) -> str:
        pass

    @property
    @abstractmethod
    def backup_command(self) -> str:
        pass

    @property
    @abstractmethod
    def version_command(self) -> str:
        pass

    def parse_running_config(self, raw_output: str) -> str:
        """
        Strips banners and cleans raw CLI outputs.
        """
        return raw_output.strip()
