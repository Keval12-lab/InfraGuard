from .base_driver import BaseVendorDriver

class UbiquitiDriver(BaseVendorDriver):
    @property
    def vendor_name(self) -> str:
        return "Ubiquiti"

    @property
    def backup_command(self) -> str:
        return "cat /tmp/system.cfg"

    @property
    def version_command(self) -> str:
        return "ubnt-info"
