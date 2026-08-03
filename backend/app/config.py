import os

# Network Discovery Engine Configuration Constants
DISCOVERY_TIMEOUT = int(os.getenv("DISCOVERY_TIMEOUT", "1000"))  # ms
DISCOVERY_THREADS = int(os.getenv("DISCOVERY_THREADS", "50"))
MAX_SCAN_HOSTS = int(os.getenv("MAX_SCAN_HOSTS", "256"))
PING_RETRY_COUNT = int(os.getenv("PING_RETRY_COUNT", "1"))

# Monitoring Engine Configuration Constants
MONITORING_INTERVAL = int(os.getenv("MONITORING_INTERVAL", "60"))  # seconds
MONITORING_PACKETS = int(os.getenv("MONITORING_PACKETS", "3"))     # packets per check
