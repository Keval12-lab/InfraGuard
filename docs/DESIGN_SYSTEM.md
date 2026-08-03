# InfraGuard — Commercial Product Design Vision & Design System Specifications

**Version:** 1.0.0 (Phase 1 Specification)  
**Product Type:** Enterprise IT Infrastructure & Network Visibility Platform  
**Target Audience:** Network Engineers, System Administrators, IT Directors, Managed Service Providers (MSPs)

---

## 1. Overall Design Philosophy

InfraGuard is designed to bridge the gap between heavy enterprise IT tools (which are often cluttered, slow, and overly complex) and modern cloud SaaS platforms (which are clean, responsive, and intuitive).

### Benchmark Synthesis:

- **Ubiquiti UniFi:** Immersive visual clarity, device topology maps, elegant status badges, and intuitive hardware representation.
- **Cisco Meraki:** High-density enterprise hierarchy, multi-site network management, and robust organizational scoping.
- **Datadog:** Dynamic telemetry, rich contextual data cards, real-time alert correlation, and high metric density without clutter.
- **Grafana:** Purpose-built time-series visualization, panel flexibility, and deep diagnostic drill-downs.
- **Microsoft Intune:** Enterprise compliance status, governance visibility, and policy health tracking.

### The InfraGuard Design Language (IDL):

1. **Intelligent Density:** Provide maximum actionable context per pixel without visual fatigue.
2. **Context-First Health:** Every metric or chart must explain _why_ it matters and _what to do next_.
3. **5-Second Clarity:** Within 5 seconds of looking at any screen, an administrator can answer:
   1. Where am I?
   2. What is happening?
   3. Is everything healthy?
   4. Is there a problem?
   5. What action should I take next?

---

## 2. Product Design Vision

InfraGuard is built to feel **Commercial-Grade, Premium, Modern, and Dependable**. It intentionally avoids generic bootstrap admin aesthetics, crowded hacker dark themes, or portfolio-style layouts.

- **Light & Dark Adaptive Theme:** Engineered with crisp light modes for brightly lit network operations centers (NOCs) and sleek slate-dark modes for low-light environments.
- **Proactive State Guidance:** Empty states do not display blank screens; they serve as educational onboarding launchpads explaining setup time, prerequisites, and expected outcomes.
- **Micro-Guided Workflows:** Network discovery and device diagnostic workflows use progressive disclosure to eliminate cognitive overload.

---

## 3. Information Architecture (IA)

```
InfraGuard Platform Root
├── 1. Overview (Dashboard)
│   ├── Infrastructure Health & SLA Summary
│   ├── Quick Discovery Trigger & Connectivity Monitor
│   ├── Device Status & Distribution Panel
│   ├── Risk & Security Threat Index
│   └── Real-Time Activity Feed & Recommendations
├── 2. Network Discovery (Wizard & Scanner)
│   ├── Active Subnet Scanner
│   ├── Discovery Rule Configuration
│   ├── Real-Time Discovery Progress & Logs
│   └── Unmanaged Device Quarantine & Classification
├── 3. Infrastructure Assets (Inventory)
│   ├── All Discovered Devices (Table / Grid View)
│   ├── Device Topology Map
│   ├── Device Detail Modal / Drawer (Metrics, Ports, History)
│   └── Subnet & VLAN Segmentation View
├── 4. Monitoring & Telemetry
│   ├── Ping Latency & Loss Graphs
│   ├── SNMP Interface Throughput
│   ├── System Resource Utilization (CPU, Memory, Storage)
│   └── Port Status & Interface Mapping
├── 5. Security & Risk Compliance
│   ├── Rogue Device Detections
│   ├── Open Port Vulnerabilities
│   ├── Offline SLA Compliance Tracker
│   └── Credential & Audit Log History
├── 6. Reports & Insights
│   ├── Executive Summary PDF Exporter
│   ├── Network Performance Trend Analysis
│   └── Inventory & Asset Lifecycle Export
└── 7. Settings & Platform Config
    ├── Subnet Profiles & SNMP Community Strings
    ├── Scan Schedules & Polling Intervals
    ├── Notification Channels (Slack, Email, Webhooks)
    └── User Roles & Access Control (RBAC)
```

---

## 4. Dashboard Wireframe & Layout Architecture

```
+-----------------------------------------------------------------------------------------------+
| TOPBAR: [Logo: InfraGuard] | [Search Devices, IPs, MACs...] | [Scan Status] [Alerts (3)] [Profile]  |
+-----------------------------------------------------------------------------------------------+
| SIDEBAR     | BREADCRUMB: Dashboard / Network Overview                                        |
|             | HEADER: Network Operations Center Overview       [Start Network Discovery]      |
| [Overview]  +---------------------------------------------------------------------------------+
| [Discovery] | WELCOME / STATUS BANNER: Backend Active | Subnet Scan Scheduled (in 12 mins)       |
| [Assets]    +-----------------------------------+---------------------------------------------+
| [Telemetry] | SUMMARY CARDS (Grid: 6 Columns)   |                                             |
| [Security]  | [Total Devices] [Online] [Offline]| [Risk Score] [Network Health] [Last Scan]   |
| [Reports]   +-----------------------------------+---------------------------------------------+
| [Settings]  | MAIN PERFORMANCE CHART            | RISK & ALERTS SIDE PANEL                    |
|             | Ping Latency & Throughput (24h)   | • 2 Offline Switches (High Priority)        |
|             | [ Live Trend Graph Placeholder ]  | • 1 Unrecognized IP Detected (Warning)      |
|             +-----------------------------------+---------------------------------------------+
|             | RECENT ACTIVITY & TELEMETRY       | QUICK ACTIONS & RECOMMENDATIONS             |
|             | • 10:14:02 - Router-01 Ping 2ms   | • Run Subnet Discovery Scan                 |
|             | • 10:12:45 - Switch-04 Link Down  | • Configure SNMP Credentials                |
+-------------+-----------------------------------+---------------------------------------------+
```

---

## 5. Sidebar Structure & Navigation Hierarchy

### Primary Navigation Items (Left Dock):

1. **Dashboard** (`/`) — `dashboard` (Icon) — Real-time health, SLA, and primary KPIs.
2. **Network Discovery** (`/discovery`) — `radar` (Icon) — Interactive scanner, subnet manager, and active discovery wizard.
3. **Assets & Inventory** (`/assets`) — `inventory_2` (Icon) — Categorized hardware inventory, IP/MAC tracking, and topology map.
4. **Monitoring & Telemetry** (`/telemetry`) — `monitoring` (Icon) — Real-time ping latency, loss metrics, and bandwidth throughput.
5. **Reports & Audit** (`/reports`) — `assessment` (Icon) — Executive PDF export, uptime SLA analysis, and audit trails.
6. **Platform Settings** (`/settings`) — `settings` (Icon) — Credentials, notification webhooks, scan intervals, and system logs.

---

## 6. Navigation Flow

```
[Dashboard] ---> (Click Device Card) ---> [Assets Detail Drawer]
     |
     +-------> (Click "Start Discovery") ---> [Discovery Modal Wizard]
     |                                               |
     |                                               v
     |                                      [Live Scanner Progress]
     |                                               |
     |                                               v
     +<------- (Scan Finished) <---------- [Inventory Results Table]
```

---

## 7. Design Tokens

### Global Spatial Scale (4px / 8px Grid Base):

- `space-xxs`: 4px
- `space-xs`: 8px
- `space-sm`: 12px
- `space-md`: 16px
- `space-lg`: 24px
- `space-xl`: 32px
- `space-xxl`: 48px

### Elevation & Shadows:

- `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- `shadow-glow-success`: `0 0 12px rgba(16, 185, 129, 0.25)`
- `shadow-glow-error`: `0 0 12px rgba(239, 68, 68, 0.25)`

### Border Radius:

- `radius-sm`: 6px
- `radius-md`: 10px
- `radius-lg`: 16px
- `radius-full`: 9999px

---

## 8. Color Palette System

```
┌────────────────────────────────────────────────────────────────────────┐
│ INFRAGUARD COLOR PALETTE SPECIFICATION                                 │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│ Token Role           │ Light Mode (Hex)     │ Slate Dark Mode (Hex)    │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ Primary (Brand Cyan) │ #0284C7 (Sky 600)    │ #38BDF8 (Sky 400)        │
│ Background           │ #F8FAFC (Slate 50)   │ #0F172A (Slate 900)      │
│ Surface (Cards/Paper)│ #FFFFFF (White)      │ #1E293B (Slate 800)      │
│ Border               │ #E2E8F0 (Slate 200)  │ #334155 (Slate 700)      │
│ Text Primary         │ #0F172A (Slate 900)  │ #F8FAFC (Slate 50)       │
│ Text Secondary       │ #64748B (Slate 500)  │ #94A3B8 (Slate 400)      │
│ Status Success       │ #10B981 (Emerald 500)│ #34D399 (Emerald 400)    │
│ Status Warning       │ #F59E0B (Amber 500)  │ #FBBF24 (Amber 400)      │
│ Status Error / Critical│ #EF4444 (Red 500)  │ #F87171 (Red 400)        │
│ Status Neutral       │ #64748B (Slate 500)  │ #64748B (Slate 500)      │
└──────────────────────┴──────────────────────┴──────────────────────────┘
```

---

## 9. Typography System

**Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`  
**Monospace Font (IPs, MACs, Logs):** `JetBrains Mono`, `Fira Code`, `Consolas`, `monospace`

| Type Style        | Font Size | Weight         | Line Height | Tracking | Usage                          |
| :---------------- | :-------- | :------------- | :---------- | :------- | :----------------------------- |
| **Display 1**     | 32px      | 700 (Bold)     | 40px        | -0.02em  | Main Page Titles               |
| **Heading 1**     | 24px      | 600 (SemiBold) | 32px        | -0.01em  | Section Headers / Modal Titles |
| **Heading 2**     | 18px      | 600 (SemiBold) | 24px        | -0.005em | Card Titles / Subsections      |
| **Body Large**    | 16px      | 400 (Regular)  | 24px        | 0em      | Primary Paragraphs / Lead text |
| **Body Standard** | 14px      | 400 (Regular)  | 20px        | 0em      | Default Text / Table Cells     |
| **Caption**       | 12px      | 500 (Medium)   | 16px        | +0.01em  | Subtitles / Secondary Labels   |
| **Code / IP**     | 13px      | 500 (Medium)   | 18px        | 0em      | IP Addresses, MAC Addresses    |

---

## 10. Component Library Specifications

### A. Status Chips (Badges):

- **Online/Healthy:** Soft Emerald background (`rgba(16, 185, 129, 0.1)`) + Emerald text (`#10B981`) + 6px solid pulsing dot.
- **Offline/Critical:** Soft Red background (`rgba(239, 68, 68, 0.1)`) + Red text (`#EF4444`) + 6px solid red dot.
- **Unmanaged/Warning:** Soft Amber background (`rgba(245, 158, 11, 0.1)`) + Amber text (`#F59E0B`).

### B. Action Buttons:

- **Primary Action:** Solid Primary Cyan background with subtle hover lift and micro-shadow.
- **Secondary Action:** Outlined slate border with soft background tint on hover.
- **Danger Action:** Soft Red text with destructive action confirmation step.

### C. Search & Filter Bar:

- Global search input with instant keyboard shortcut trigger (`Ctrl + K` / `Cmd + K`), clearing button, and category filters (All, Routers, Switches, Servers, Printers).

---

## 11. Dashboard Layout Specifications

- **Grid:** 12-column responsive layout with 24px gutters.
- **Summary Row:** 6 summary cards across top row (2 columns each on desktop; 6 columns on mobile).
- **Middle Row:** Main Performance & Latency Telemetry Graph (8 columns) + Risk & Alert Summary Panel (4 columns).
- **Bottom Row:** Live Activity Stream (8 columns) + Quick Action Recommendations (4 columns).

---

## 12. Card Specifications

Every card features:

1. **Header:** Title + Help Tooltip Icon (`info` symbol) explaining what the card measures.
2. **Primary Metric Display:** Prominent value (e.g., `128` or `99.8%`).
3. **Contextual Delta/Caption:** E.g., `+4 devices discovered this week` or `-- (Not scanned yet)`.
4. **Action Link:** Secondary textual action (e.g., `"View all offline devices →"`).

---

## 13. Data Visualization & Chart Specifications

- **Ping Latency & Packet Loss:** Dual-axis line chart with smooth bezier curves, subtle area gradient fill (`rgba(2, 132, 199, 0.15)`), interactive crosshair tooltip, and 15-minute polling intervals.
- **Device Type Distribution:** Donut chart with legend metrics showing total count per hardware tier (Network, Server, Endpoint, IoT).

---

## 14. Table Specifications

- **Header:** Sticky header with subtle border divider, sortable column triggers (`swap_vert` icon).
- **Row Structure:**
  - Col 1: Status Dot + Device Hostname
  - Col 2: IP Address (Monospace font + Copy-to-clipboard button)
  - Col 3: MAC Address & Vendor
  - Col 4: Device Type Chip
  - Col 5: Last Seen / Uptime Duration
  - Col 6: Quick Action Menu (Ping, Port Scan, Detail Drawer)
- **Hover State:** Soft background highlight (`rgba(2, 132, 199, 0.04)`) with interactive action icons on row hover.

---

## 15. Discovery Wizard UX

```
Step 1: Subnet Definition -> Step 2: Credentials & Protocol -> Step 3: Scan Execution & Progress -> Step 4: Review & Import
```

- **Step 1:** Enter IP Range / Subnet CIDR (e.g. `192.168.1.0/24`) with automatic local subnet detection helper.
- **Step 2:** Choose Ping / ICMP, ARP, or SNMP v2c/v3 community string profile.
- **Step 3:** Live animated radial progress ring showing scanned IPs (`45 / 254 IPs`), active count, and estimated time remaining (`~18s`).
- **Step 4:** Summary breakdown of new devices found vs. existing devices updated, with bulk import options.

---

## 16. Asset Inventory UX

- **Filter Bar:** Quick filtering by status (Online, Offline, Pending), Subnet, Device Type, and Manufacturer.
- **View Switcher:** Table View vs. Visual Topology Grid View.
- **Side Inspection Drawer:** Clicking any row opens a slide-over panel from the right displaying:
  - Hardware details (Vendor, Model, MAC, OS)
  - Open Ports & Response Time History
  - Custom tags & administrative notes

---

## 17. Reports UX

- **Executive Summary Generator:** One-click generation of PDF/CSV audit reports.
- **Configurable Date Ranges:** Last 24 Hours, 7 Days, 30 Days, Custom Range.
- **Export Contents:** Network Uptime SLA, Device Availability Breakdown, Risk Audit Log, Unmanaged IPs summary.

---

## 18. Responsive Strategy

- **Desktop (`>= 1280px`):** Full 12-column grid, permanent sidebar navigation, extended telemetry graphs.
- **Tablet (`768px - 1279px`):** Collapsible icon-only sidebar drawer, 2x3 summary card grid, stacked charts.
- **Mobile (`< 768px`):** Off-canvas slide-out navigation menu, single-column summary cards, simplified table views with horizontal scroll.

---

## 19. Accessibility Strategy (WCAG 2.1 AA Compliant)

- **Contrast Ratios:** Minimum 4.5:1 text-to-background contrast ratio for standard text; 3:1 for large display headers.
- **Keyboard Navigation:** Complete `Tab` and `Shift + Tab` focus traversal across all controls, buttons, forms, and tables with visible blue focus rings (`outline: 2px solid #0284C7`).
- **Screen Reader Support:** Semantic HTML5 landmarks (`<main>`, `<nav>`, `<header>`, `aria-expanded`, `aria-label`, `aria-describedby`).

---

## 20. Future Scalability Strategy

- **Multi-Tenant / MSP Support:** Infrastructure architecture designed for multi-site switching (e.g., Organization -> Site -> Subnet).
- **Extensible Sensor Integration:** Modular telemetry cards ready for agent-based metrics (CPU, Memory, Storage) in future releases.
- **Alert Webhooks:** Pluggable notification channel engine for Slack, PagerDuty, Microsoft Teams, and custom HTTP webhooks.

---

## 21. Design Decisions & Rationale

1. **Why Sky Cyan & Slate Neutral Palette?**  
   _Dark hacker themes cause visual fatigue during long monitoring shifts, while pure white templates feel unpolished. Slate neutrals combined with Sky Cyan provide high contrast, high clarity, and an undeniable enterprise SaaS aesthetic._

2. **Why 5-Second Clarity Over Density Chaos?**  
   _IT Administrators and Network Engineers under stress during outages need instant answers, not complex math. By organizing visual hierarchy around 5 core questions, InfraGuard reduces mean time to resolution (MTTR)._

3. **Why Material Symbols Only (No Emojis)?**  
   _System emojis render inconsistently across Windows, macOS, Linux, and Android. Material Symbols provide standardized vector clarity, scalable sizing, and professional consistency across all commercial environments._
