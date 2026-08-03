import os
import sqlite3
import logging

logger = logging.getLogger("infraguard.database")

def resolve_database_path() -> tuple[str, str]:
    configured_path = os.getenv("DATABASE_PATH") or os.getenv("DATABASE_URL")
    if configured_path:
        target_dir = os.path.dirname(configured_path)
        try:
            os.makedirs(target_dir, exist_ok=True)
            print(f"[INFO] Using configured database path: {configured_path}")
            logger.info(f"Using configured database path: {configured_path}")
            return configured_path, target_dir
        except (PermissionError, OSError) as err:
            fallback_dir = os.path.join(os.getcwd(), "instance")
            fallback_path = os.path.join(fallback_dir, "infraguard.db")
            os.makedirs(fallback_dir, exist_ok=True)
            msg = (
                f"[WARNING] Configured database path '{configured_path}' is not writable ({err}).\n"
                f"Falling back to local database: {fallback_path}"
            )
            print(msg)
            logger.warning(msg)
            return fallback_path, fallback_dir
    else:
        fallback_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "instance")
        fallback_path = os.path.join(fallback_dir, "infraguard.db")
        os.makedirs(fallback_dir, exist_ok=True)
        print(f"[INFO] Using local database path: {fallback_path}")
        logger.info(f"Using local database path: {fallback_path}")
        return fallback_path, fallback_dir


DB_PATH, DB_DIR = resolve_database_path()


def get_db_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Initializes SQLite database tables for devices repository, discovery history, and monitoring history.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")

    # Table 1: devices
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT UNIQUE NOT NULL,
            hostname TEXT,
            device_name TEXT,
            vendor TEXT,
            device_type TEXT,
            status TEXT NOT NULL,
            first_seen TEXT NOT NULL,
            last_seen TEXT NOT NULL,
            last_discovery TEXT NOT NULL,
            discovery_count INTEGER DEFAULT 1,
            latency_ms REAL DEFAULT 0.0,
            packet_loss REAL DEFAULT 0.0,
            availability_percent REAL DEFAULT 100.0,
            last_monitor_time TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    """)

    # Schema Migrations for devices table
    cursor.execute("PRAGMA table_info(devices)")
    columns = [row["name"] for row in cursor.fetchall()]
    
    if "discovery_count" not in columns:
        cursor.execute("ALTER TABLE devices ADD COLUMN discovery_count INTEGER DEFAULT 1;")
    if "latency_ms" not in columns:
        cursor.execute("ALTER TABLE devices ADD COLUMN latency_ms REAL DEFAULT 0.0;")
    if "packet_loss" not in columns:
        cursor.execute("ALTER TABLE devices ADD COLUMN packet_loss REAL DEFAULT 0.0;")
    if "availability_percent" not in columns:
        cursor.execute("ALTER TABLE devices ADD COLUMN availability_percent REAL DEFAULT 100.0;")
    if "last_monitor_time" not in columns:
        cursor.execute("ALTER TABLE devices ADD COLUMN last_monitor_time TEXT;")

    # Table 2: discovery_history
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS discovery_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subnet TEXT NOT NULL,
            total_scanned INTEGER NOT NULL,
            active_found INTEGER NOT NULL,
            unreachable_count INTEGER NOT NULL,
            duration_seconds REAL NOT NULL,
            scanned_at TEXT NOT NULL
        );
    """)

    # Table 3: monitoring_history
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS monitoring_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            latency_ms REAL,
            packet_loss REAL NOT NULL,
            checked_at TEXT NOT NULL,
            FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
        );
    """)

    # Table 4: terminal_history
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS terminal_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER,
            tool_name TEXT NOT NULL,
            command_str TEXT NOT NULL,
            output_text TEXT NOT NULL,
            executed_at TEXT NOT NULL,
            duration_ms REAL DEFAULT 0.0
        );
    """)

    # Table 5: timeline_events
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS timeline_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            device_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            metadata_json TEXT,
            created_at TEXT NOT NULL
        );
    """)

    # Table 6: asset_knowledge (Infrastructure Passport)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS asset_knowledge (
            device_id INTEGER PRIMARY KEY,
            serial_number TEXT,
            firmware_version TEXT,
            building TEXT,
            floor TEXT,
            room TEXT,
            rack TEXT,
            rack_unit TEXT,
            pdu_port TEXT,
            owner TEXT,
            department TEXT,
            purchase_date TEXT,
            warranty_expiry TEXT,
            vendor_contact TEXT,
            amc_contract TEXT,
            notes_md TEXT,
            updated_at TEXT,
            FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
        );
    """)

    # Table 7: asset_attachments
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS asset_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            uploaded_at TEXT NOT NULL,
            FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
        );
    """)

    # Table 8: runbooks
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS runbooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            steps_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
    """)

    # Table 9: runbook_executions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS runbook_executions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            runbook_id INTEGER NOT NULL,
            device_id INTEGER,
            status TEXT NOT NULL,
            current_step_index INTEGER DEFAULT 0,
            answers_json TEXT,
            logs_json TEXT,
            duration_seconds INTEGER DEFAULT 0,
            executed_at TEXT NOT NULL,
            FOREIGN KEY (runbook_id) REFERENCES runbooks (id)
        );
    """)

    # Seed initial runbooks if none exist
    cursor.execute("SELECT COUNT(*) as count FROM runbooks")
    if cursor.fetchone()["count"] == 0:
        import json
        seed_runbooks = [
            {
                "name": "Printer Offline Troubleshooter",
                "description": "Interactive workflow to resolve printer unreachable / offline status using automatic diagnostics.",
                "steps": [
                    {
                        "step_index": 0,
                        "question": "Can we reach the printer over ICMP Ping?",
                        "tool_type": "ping",
                        "instructions": "Execute a quick ICMP ping check to verify basic layer 3 network connectivity.",
                        "choices": [
                            {"label": "Yes (Ping Success)", "next_step": 1},
                            {"label": "No (Ping Fails)", "next_step": 2}
                        ]
                    },
                    {
                        "step_index": 1,
                        "question": "Is Port 9100 (RAW) or Port 631 (IPP) responding?",
                        "tool_type": "port-check",
                        "tool_port": 9100,
                        "instructions": "Verify if the printing server daemon is listening on TCP Port 9100.",
                        "choices": [
                            {"label": "Yes (Port Open)", "next_step": 3},
                            {"label": "No (Port Closed)", "next_step": 4}
                        ]
                    },
                    {
                        "step_index": 2,
                        "question": "Can you ping the local gateway (192.168.29.1)?",
                        "tool_type": "ping",
                        "tool_target": "192.168.29.1",
                        "instructions": "Test subnet gateway connectivity to isolate if the issue is local to the printer or network-wide.",
                        "choices": [
                            {"label": "Yes (Gateway OK)", "next_step": 5},
                            {"label": "No (Gateway Fails)", "next_step": 6}
                        ]
                    },
                    {
                        "step_index": 3,
                        "question": "Protocol active! Check printer local screen for error codes (paper jam, out of ink). Resolved?",
                        "instructions": "Verify physical indicators. If clean, proceed to mark troubleshooting complete.",
                        "choices": [
                            {"label": "Yes, Printer Online", "next_step": 7},
                            {"label": "No, still offline", "next_step": 8}
                        ]
                    },
                    {
                        "step_index": 4,
                        "question": "Print spooler service seems unresponsive. Recommend sending Wake-on-LAN to trigger NIC refresh. Trigger WOL?",
                        "tool_type": "wol",
                        "instructions": "Transmit UDP magic packet broadcast to awaken the device adapter.",
                        "choices": [
                            {"label": "Trigger WOL", "next_step": 7},
                            {"label": "Skip / Manual reboot", "next_step": 8}
                        ]
                    },
                    {
                        "step_index": 5,
                        "question": "Gateway responds. Issue is local to the printer. Check physical power cable and Ethernet port lights. Resolved?",
                        "instructions": "Confirm power cable is seated securely in printer socket.",
                        "choices": [
                            {"label": "Yes, powered on", "next_step": 7},
                            {"label": "No response", "next_step": 8}
                        ]
                    },
                    {
                        "step_index": 6,
                        "question": "Local gateway failed! Core switch port or routing issue. Escalate to senior network team.",
                        "instructions": "Troubleshoot corporate access layer switch.",
                        "choices": [
                            {"label": "Ticket Escalated", "next_step": 8}
                        ]
                    },
                    {
                        "step_index": 7,
                        "question": "Troubleshooting completed. Issue has been resolved successfully!",
                        "instructions": "Logs will be recorded to the timeline audit stream.",
                        "choices": []
                    },
                    {
                        "step_index": 8,
                        "question": "Troubleshooting completed with escalation. Manual technician dispatch recommended.",
                        "instructions": "Dispatched field support ticket.",
                        "choices": []
                    }
                ]
            },
            {
                "name": "Server Offline Recovery",
                "description": "Interactive flowchart to inspect server status, attempt Wake-on-LAN, and verify remote access protocols.",
                "steps": [
                    {
                        "step_index": 0,
                        "question": "Is the server responding to ICMP Ping?",
                        "tool_type": "ping",
                        "instructions": "Confirm if host stack is processing network traffic.",
                        "choices": [
                            {"label": "Yes (Ping OK)", "next_step": 1},
                            {"label": "No (No response)", "next_step": 2}
                        ]
                    },
                    {
                        "step_index": 1,
                        "question": "Is SSH (Port 22) or RDP (Port 3389) responding?",
                        "tool_type": "port-check",
                        "tool_port": 22,
                        "instructions": "Probe remote management ports to test system accessibility.",
                        "choices": [
                            {"label": "Port Open", "next_step": 3},
                            {"label": "Port Closed", "next_step": 4}
                        ]
                    },
                    {
                        "step_index": 2,
                        "question": "Attempt remote wakeup. Transmit Wake-on-LAN command?",
                        "tool_type": "wol",
                        "instructions": "Send network magic packet to restart adapter card.",
                        "choices": [
                            {"label": "Send WOL Packet", "next_step": 5},
                            {"label": "Skip", "next_step": 6}
                        ]
                    },
                    {
                        "step_index": 3,
                        "question": "Host active and manageable. Recovery complete.",
                        "instructions": "No escalation required.",
                        "choices": []
                    },
                    {
                        "step_index": 4,
                        "question": "Firewall blocking or management service crashed. Dispatch engineer console review.",
                        "instructions": "Verify local hypervisor console state.",
                        "choices": []
                    },
                    {
                        "step_index": 5,
                        "question": "WOL packet transmitted successfully. Wait 60s and verify ping response.",
                        "tool_type": "ping",
                        "instructions": "Re-run ping test.",
                        "choices": [
                            {"label": "Host Recovered", "next_step": 3},
                            {"label": "Still Unreachable", "next_step": 6}
                        ]
                    },
                    {
                        "step_index": 6,
                        "question": "Wake-on-LAN failed. Inspect server room power breaker / UPS backup. Escalate ticket.",
                        "instructions": "Create escalation log.",
                        "choices": []
                    }
                ]
            }
        ]

        from datetime import datetime, timezone
        created_at = datetime.now(timezone.utc).isoformat()
        for rb in seed_runbooks:
            cursor.execute("""
                INSERT INTO runbooks (name, description, steps_json, created_at)
                VALUES (?, ?, ?, ?)
            """, (rb["name"], rb["description"], json.dumps(rb["steps"]), created_at))

    # Table 10: automations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS automations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            trigger_type TEXT NOT NULL,
            cron_expression TEXT,
            tasks_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
    """)

    # Table 11: automation_runs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS automation_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            automation_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            results_json TEXT,
            duration_seconds INTEGER DEFAULT 0,
            executed_at TEXT NOT NULL,
            FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE
        );
    """)

    # Seed initial automations if none exist
    cursor.execute("SELECT COUNT(*) as count FROM automations")
    if cursor.fetchone()["count"] == 0:
        import json
        seed_automations = [
            {
                "name": "Morning Health Check",
                "description": "Ping the default gateway, verify external internet access, and audit status of all critical infrastructure devices.",
                "trigger_type": "SCHEDULED",
                "cron_expression": "0 8 * * *",
                "tasks": [
                    {"type": "ping", "target": "192.168.29.1", "label": "Verify Subnet Gateway (192.168.29.1)"},
                    {"type": "ping", "target": "8.8.8.8", "label": "Verify External WAN Link (8.8.8.8)"},
                    {"type": "http", "target": "https://www.google.com", "label": "Verify HTTP/HTTPS Web Resolution"}
                ]
              },
              {
                "name": "Audit New Devices & Inventory",
                "description": "Trigger network discovery to find new devices, update availability metrics, and log details.",
                "trigger_type": "MANUAL",
                "cron_expression": None,
                "tasks": [
                    {"type": "discovery", "target": "192.168.29.0/24", "label": "Perform Active Subnet Scan"}
                ]
              }
        ]
        from datetime import datetime, timezone
        created_at = datetime.now(timezone.utc).isoformat()
        for aut in seed_automations:
            cursor.execute("""
                INSERT INTO automations (name, description, trigger_type, cron_expression, tasks_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (aut["name"], aut["description"], aut["trigger_type"], aut["cron_expression"], json.dumps(aut["tasks"]), created_at))

    # Table 12: snmp_devices
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS snmp_devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER UNIQUE NOT NULL,
            sys_name TEXT,
            sys_desc TEXT,
            sys_uptime INTEGER,
            sys_contact TEXT,
            sys_location TEXT,
            interface_count INTEGER DEFAULT 0,
            snmp_status TEXT NOT NULL,
            last_scanned TEXT NOT NULL,
            FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
        );
    """)

    # Table 13: snmp_interfaces
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS snmp_interfaces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER NOT NULL,
            if_index INTEGER NOT NULL,
            if_name TEXT NOT NULL,
            if_status TEXT NOT NULL,
            if_speed INTEGER DEFAULT 0,
            rx_bytes INTEGER DEFAULT 0,
            tx_bytes INTEGER DEFAULT 0,
            errors INTEGER DEFAULT 0,
            crc INTEGER DEFAULT 0,
            FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
            UNIQUE(device_id, if_index)
        );
    """)

    # Table 14: snmp_neighbors
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS snmp_neighbors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER NOT NULL,
            local_port TEXT NOT NULL,
            neighbor_name TEXT NOT NULL,
            neighbor_port TEXT NOT NULL,
            FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
        );
    """)

    # Table 15: snmp_vlans
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS snmp_vlans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER NOT NULL,
            vlan_id INTEGER NOT NULL,
            vlan_name TEXT NOT NULL,
            FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
            UNIQUE(device_id, vlan_id)
        );
    """)

    conn.commit()
    conn.close()
    logger.info(f"[SQLite Init] Database schema initialized at {DB_PATH}")
