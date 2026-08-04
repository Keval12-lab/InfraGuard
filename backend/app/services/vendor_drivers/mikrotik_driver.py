from .base_driver import BaseVendorDriver

class MikroTikDriver(BaseVendorDriver):
    @property
    def vendor_name(self) -> str:
        return "MikroTik"

    @property
    def backup_command(self) -> str:
        return "/export terse"

    @property
    def version_command(self) -> str:
        return "/system resource print"
