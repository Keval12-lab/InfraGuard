from .base_driver import BaseVendorDriver

class CiscoDriver(BaseVendorDriver):
    @property
    def vendor_name(self) -> str:
        return "Cisco"

    @property
    def backup_command(self) -> str:
        return "show running-config"

    @property
    def version_command(self) -> str:
        return "show version"
