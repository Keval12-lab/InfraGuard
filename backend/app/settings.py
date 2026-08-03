import os
from dataclasses import dataclass

from dotenv import load_dotenv


import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    app_name: str
    cors_origins: list[str]
    discovery_timeout: int
    discovery_threads: int
    max_scan_hosts: int
    ping_retry_count: int
    security_hsts_enabled: bool
    security_csp: str

    @classmethod
    def from_environment(cls) -> "Settings":
        load_dotenv()
        origins = os.getenv("CORS_ORIGINS", "*")
        if origins == "*":
            origin_list = ["*"]
        else:
            origin_list = [origin.strip() for origin in origins.split(",") if origin.strip()]
            
        hsts_str = os.getenv("SECURITY_HSTS_ENABLED", "true").lower()
        csp_str = os.getenv("SECURITY_CSP", "default-src 'none'; frame-ancestors 'none';")
        
        return cls(
            app_name=os.getenv("APP_NAME", "InfraGuard"),
            cors_origins=origin_list,
            discovery_timeout=int(os.getenv("DISCOVERY_TIMEOUT", "500")),
            discovery_threads=int(os.getenv("DISCOVERY_THREADS", "64")),
            max_scan_hosts=int(os.getenv("MAX_SCAN_HOSTS", "1024")),
            ping_retry_count=int(os.getenv("PING_RETRY_COUNT", "1")),
            security_hsts_enabled=(hsts_str == "true"),
            security_csp=csp_str,
        )