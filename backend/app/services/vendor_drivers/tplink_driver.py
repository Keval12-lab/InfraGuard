from .base_driver import BaseVendorDriver

class TPLinkDriver(BaseVendorDriver):
    @property
    def vendor_name(self) -> str:
        return "TP-Link"

    @property
    def backup_command(self) -> str:
        return "show running-config"

    @property
    def version_command(self) -> str:
        return "show system-info"
