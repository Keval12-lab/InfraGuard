from .base_driver import BaseVendorDriver
from .cisco_driver import CiscoDriver
from .mikrotik_driver import MikroTikDriver
from .tplink_driver import TPLinkDriver
from .ubiquiti_driver import UbiquitiDriver
from .generic_driver import GenericDriver

_DRIVERS = {
    "cisco": CiscoDriver(),
    "mikrotik": MikroTikDriver(),
    "tp-link": TPLinkDriver(),
    "tplink": TPLinkDriver(),
    "ubiquiti": UbiquitiDriver(),
    "unifi": UbiquitiDriver()
}

def get_vendor_driver(vendor: str) -> BaseVendorDriver:
    if not vendor:
        return GenericDriver()
    
    key = vendor.strip().lower()
    return _DRIVERS.get(key, GenericDriver())
