from .base_driver import BaseVendorDriver

class GenericDriver(BaseVendorDriver):
    @property
    def vendor_name(self) -> str:
        return "Generic"

    @property
    def backup_command(self) -> str:
        return "show running-config"

    @property
    def version_command(self) -> str:
        return "show version"
