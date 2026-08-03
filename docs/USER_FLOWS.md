# InfraGuard — End-to-End User Flows & Interaction Specifications

**Version:** 1.0.0  
**Product Area:** End-to-End User Experience & Interface Workflows

---

## 1. Master Navigation & System Architecture Flow

```
+---------------------------------------------------------------------------------------------------------+
|                                    GLOBAL APPLICATION SHELL                                             |
|                                                                                                         |
|   TOPBAR:  [InfraGuard Logo]   [Global Search (Ctrl+K)]   [Scan Status Badge]   [Alerts]   [Theme Toggle]   |
|   SIDEBAR: [Dashboard]  [Discovery]  [Assets Inventory]  [Telemetry]  [Reports & Audit]  [Settings]     |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Core Workflow 1: Executive Dashboard & Daily Monitoring

```
User Lands on Dashboard (/)
   │
   ├── 1. Inspect Top Bar Connection Badge -> Verifies Flask Backend Status (Active / Reconnecting)
   │
   ├── 2. Review Top 6 Metric Cards:
   │      ├── Total Devices Count (e.g. 128)
   │      ├── Online Devices Count (e.g. 124)
   │      ├── Offline Devices Count (e.g. 4) ------> [Click "View Offline Devices"] ──┐
   │      ├── Risk Score (e.g. 12/100 - Low Risk)                                     │
   │      ├── Network Health Index (e.g. 98.4%)                                       │
   │      └── Last Scan Status & Timestamp (e.g. 12 mins ago)                          │
   │                                                                                  │
   ├── 3. View Main Telemetry Graph:                                                  │
   │      ├── Toggles Range: [1h] [24h] [7d]                                          │
   │      └── Hovers over curve -> Tooltip displays Ping (ms) & Loss (%)              │
   │                                                                                  │
   ├── 4. Review Recent Activity Log Stream                                           │
   │                                                                                  │
   └── 5. Primary Call to Action Button:                                              │
          └── [Start Network Discovery] ──────────────────────────────────────────────┼──┐
                                                                                      │  │
                                                                                      v  v
```

---

## 3. Core Workflow 2: Network Discovery & Subnet Scanning

```
                                                                                      │  │
    ┌─────────────────────────────────────────────────────────────────────────────────┘  │
    │                                                                                    │
    v                                                                                    │
[Discovery Page / Modal Wizard] (/discovery)                                             │
   │                                                                                     │
   ├── STEP 1: Define Target Subnet                                                      │
   │      ├── Input: Subnet CIDR (e.g. "192.168.1.0/24") or Select Preset Interface     │
   │      ├── Input: Scan Profile (Quick ICMP Ping vs. Full ARP + SNMP Scan)             │
   │      └── Click Button: [Next: Scan Parameters]                                      │
   │                                                                                     │
   ├── STEP 2: Protocol & Credentials Setup                                              │
   │      ├── Toggle: Enable SNMP Polling (v2c / v3)                                     │
   │      ├── Input: Read Community String (Default: "public")                           │
   │      └── Click Button: [Execute Subnet Discovery]                                   │
   │                                                                                     │
   ├── STEP 3: Live Scan Execution View                                                  │
   │      ├── Radial Progress Indicator: "Scanning... 142 / 254 IPs (56%)"               │
   │      ├── Live Log Stream: "Found 192.168.1.1 (Gateway - Cisco Systems)"              │
   │      └── Animated Pulse Wave & Time Remaining Countdown ("~12 seconds remaining")   │
   │                                                                                     │
   └── STEP 4: Scan Completion & Import Summary                                          │
          ├── Display Results Card: "24 Host IPs Responded, 4 New Assets Discovered"     │
          ├── Action Button A: [View Assets in Inventory] ───────────────────────────────┤
          └── Action Button B: [Save Subnet Schedule]                                    │
                                                                                         │
```

---

## 4. Core Workflow 3: Infrastructure Asset Management & Inspection

```
                                                                                         │
    ┌────────────────────────────────────────────────────────────────────────────────────┘
    │
    v
[Assets & Inventory Page] (/assets)
   │
   ├── 1. Filter & Search Controls:
   │      ├── Search Input: Type IP ("192.168.1.1"), Hostname, or MAC ("AA:BB:CC...")
   │      ├── Status Pills: [All] [Online] [Offline] [Unmanaged]
   │      └── Type Category Pills: [Routers] [Switches] [Servers] [Endpoints] [Printers]
   │
   ├── 2. View Mode Toggle:
   │      ├── [Table View] (Default high-density tabular view)
   │      └── [Grid / Topology View] (Device visual cards with status rings)
   │
   ├── 3. User Clicks Asset Row (e.g. "Core-Switch-01 / 192.168.1.5"):
   │      │
   │      v
   │   [ASSET DETAIL DRAWER] (Slide-over Panel from Right Screen)
   │      ├── Header: Hostname + Status Badge + Quick Refresh Button
   │      ├── Tab 1: Overview & Specs (IP, MAC Address, Hardware Vendor, Firmware)
   │      ├── Tab 2: Response Time Telemetry (Live Ping Graph, Min/Max/Avg Latency)
   │      ├── Tab 3: Port Mapping (Active Interfaces, Speed, Duplex)
   │      └── Action Buttons:
   │             ├── [Execute Manual Ping Diagnostic]
   │             ├── [Copy IP to Clipboard]
   │             └── [Edit Asset Tag / Label]
   │
```

---

## 5. Core Workflow 4: Performance Telemetry & Diagnostic Inspection

```
[Telemetry & Monitoring Page] (/telemetry)
   │
   ├── 1. Select Device or Interface Selector Dropdown
   ├── 2. Real-Time Latency & Packet Loss Multi-Axis Graph (Updates every 15s)
   ├── 3. Threshold Violation Indicator (e.g. Latency > 50ms highlighted in Amber)
   └── 4. Export Telemetry CSV Dataset Button
```

---

## 6. Core Workflow 5: Executive Audit & SLA Report Generation

```
[Reports & Audit Page] (/reports)
   │
   ├── 1. Select Report Template (Uptime SLA, Inventory Audit, Vulnerability Summary)
   ├── 2. Select Date Range (Last 24h, 7 Days, 30 Days, Custom Range)
   ├── 3. Click [Generate Executive PDF Report]
   └── 4. System compiles summary graphics and triggers browser PDF Download (`InfraGuard-SLA-Report.pdf`)
```

---

## 7. Core Workflow 6: Platform Settings & Security Configuration

```
[Settings Page] (/settings)
   │
   ├── Section 1: Subnet Management (Add/Edit default network ranges)
   ├── Section 2: SNMP & Auth Credentials (Encrypted community string store)
   ├── Section 3: Notification Webhooks (Configure Slack / Teams Webhook URLs)
   └── Section 4: Polling Interval Settings (Default 60s ping polling)
```
