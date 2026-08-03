# InfraGuard — Commercial Technical Architecture Specification

**Version:** 1.0.0  
**Product Area:** System Architecture, Component Hierarchy, Data Flow & Security Model

---

## 1. High-Level System Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    BROWSER CLIENT                                     |
|   React 19 SPA + Vite + Material UI v7 + Emotion + Axios + Recharts Data Vis          |
+---------------------------------------------------------------------------------------+
                                           │  ▲
                                HTTP / REST│  │ JSON API
                                           ▼  │
+---------------------------------------------------------------------------------------+
|                                  FLASK BACKEND ENGINE                                 |
|   Flask 3.x WSGI + RESTful Controllers + Network Scanning Core (Scapy/Socket/ICMP)    |
|   Background Thread Scheduler (APScheduler) + Event Telemetry Engine                  |
+---------------------------------------------------------------------------------------+
                                           │  ▲
                                 SQLAlchemy│  │ SQLite / PostgreSQL
                                           ▼  │
+---------------------------------------------------------------------------------------+
|                               PERSISTENCE & STORAGE                                   |
|   Relational DB: `infraguard.db` (Devices, Scans, Telemetry, AuditLogs, Settings)      |
+---------------------------------------------------------------------------------------+
```

---

## 2. Directory & Repository Structure

```
InfraGuard Repository Root
├── ai/                              # Project Constitution, Task Board, Coding Standards
│   ├── PROJECT_CONSTITUTION.md
│   ├── CODING_STANDARDS.md
│   └── TASK_BOARD.md
├── docs/                            # System Architecture & Design Documentation
│   ├── Architecture.md
│   ├── DESIGN_SYSTEM.md
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── USER_FLOWS.md
│   ├── FEATURE_SPECIFICATIONS.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── IMPLEMENTATION_PLAN.md
├── backend/                         # Flask Python Service Core
│   ├── app/
│   │   ├── __init__.py              # Application Factory
│   │   ├── config.py                # System Environment Configuration
│   │   ├── models/                  # SQLAlchemy Relational Models
│   │   │   ├── device.py
│   │   │   ├── discovery.py
│   │   │   ├── telemetry.py
│   │   │   └── setting.py
│   │   ├── routes/                  # API Endpoint Controllers
│   │   │   ├── health.py
│   │   │   ├── discovery.py
│   │   │   ├── devices.py
│   │   │   ├── telemetry.py
│   │   │   └── reports.py
│   │   └── services/                # Business Logic & Network Engine
│   │       ├── ping_scanner.py      # Async ICMP/ARP Engine
│   │       ├── snmp_service.py      # SNMP v2c/v3 Querier
│   │       ├── telemetry_poller.py  # Background Telemetry Worker
│   │       └── oui_lookup.py        # MAC Vendor Resolver
│   ├── run.py                       # Backend Entry Point
│   └── requirements.txt             # Python Dependencies
└── frontend/                        # React 19 Frontend Web App
    ├── index.html                   # HTML Entry Point
    ├── vite.config.js               # Vite + React Plugin Setup
    ├── package.json                 # Frontend Node Dependencies
    └── src/
        ├── main.jsx                 # React Entry Point (Root DOM Mount)
        ├── App.jsx                  # App Router & ThemeProvider Container
        ├── index.css                # Global CSS Design Tokens & Utilities
        ├── components/              # Modular UI Components
        │   ├── common/              # StatusChips, ActionButtons, SearchInput
        │   ├── dashboard/           # SummaryCards, TelemetryGraph, ActivityFeed
        │   ├── discovery/           # DiscoveryWizard, LiveScanProgress
        │   ├── assets/              # AssetTable, AssetDrawer, AssetFilter
        │   └── telemetry/           # LatencyChart, LossChart
        ├── layout/                  # Shell Components
        │   ├── ApplicationShell.jsx # Topbar + Sidebar Navigation Container
        │   ├── Topbar.jsx           # Application Header & Connection Monitor
        │   └── Sidebar.jsx          # Primary Navigation Dock
        ├── pages/                   # Route Page Components
        │   ├── DashboardPage.jsx
        │   ├── DiscoveryPage.jsx
        │   ├── AssetsPage.jsx
        │   ├── TelemetryPage.jsx
        │   ├── ReportsPage.jsx
        │   └── SettingsPage.jsx
        ├── services/                # API Client Layer (Axios Instances)
        │   ├── api.js               # Axios Base Instance & Interceptors
        │   ├── deviceService.js
        │   ├── discoveryService.js
        │   └── telemetryService.js
        └── theme/                   # Material UI Theme Definition
            ├── appTheme.js          # Material UI Theme Palette & Tokens
            └── components.js        # MUI Component Overrides
```

---

## 3. Data Schema & Relational Models

```sql
-- Devices Entity Table
CREATE TABLE devices (
    id VARCHAR(36) PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    mac_address VARCHAR(17),
    hostname VARCHAR(255),
    vendor VARCHAR(128),
    device_type VARCHAR(64) DEFAULT 'UNKNOWN',
    status VARCHAR(32) DEFAULT 'OFFLINE',
    latency_ms FLOAT,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subnet Scan History Table
CREATE TABLE discovery_scans (
    id VARCHAR(36) PRIMARY KEY,
    subnet_cidr VARCHAR(32) NOT NULL,
    scan_status VARCHAR(32) NOT NULL, -- 'RUNNING', 'COMPLETED', 'FAILED'
    total_ips_scanned INT DEFAULT 0,
    active_hosts_found INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Telemetry Time-Series Metric Table
CREATE TABLE telemetry_metrics (
    id BIGINT PRIMARY KEY AUTOINCREMENT,
    device_id VARCHAR(36) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latency_ms FLOAT,
    packet_loss_pct FLOAT DEFAULT 0.0,
    FOREIGN KEY(device_id) REFERENCES devices(id) ON DELETE CASCADE
);
```

---

## 4. API Strategy & Endpoint Contracts

All API endpoints strictly conform to standard REST guidelines and return structured JSON responses:

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

- `GET /api/health` — System & DB Health Verification
- `GET /api/v1/dashboard/summary` — Aggregate metrics for 6 summary cards
- `POST /api/v1/discovery/scan` — Initiate subnet scan (`{ "subnet": "192.168.1.0/24" }`)
- `GET /api/v1/discovery/status/:scan_id` — Live status of active discovery scan
- `GET /api/v1/devices` — Filtered asset inventory list (`?status=ONLINE&type=ROUTER`)
- `GET /api/v1/devices/:id` — Single asset detail & inspection payload
- `GET /api/v1/telemetry/:device_id?range=24h` — Time-series latency dataset for graphing

---

## 5. Background Jobs & Telemetry Scheduler

- **Engine:** Python `APScheduler` running in background thread alongside Flask backend.
- **Polling Loop:** Executes every 60 seconds across all registered devices in `devices` table.
- **State Transition Logic:**
  - Performs 3-packet ICMP ping per host.
  - If response received -> updates `last_seen`, `latency_ms`, sets `status = "ONLINE"`.
  - If 3 consecutive cycles fail -> updates `status = "OFFLINE"`, triggers state-change event log.

---

## 6. Security, Authentication & Deployment

- **CORS Protection:** Restricted explicitly to frontend client origin (`localhost:5173`).
- **Input Sanitization:** Subnet CIDR and IP inputs sanitized before sub-process execution to prevent command injection.
- **Deployment Packaging:** Production bundle built via `vite build` served directly via Flask static hosting or NGINX reverse proxy.
