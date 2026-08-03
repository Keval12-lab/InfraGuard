# InfraGuard — Step-by-Step Commercial Implementation Plan

**Version:** 1.0.0  
**Product Area:** Milestone Breakdown, Delivery Schedule & Git Verification Roadmap

---

## Overview & Execution Strategy

The implementation of InfraGuard is structured into sequential, independently deployable 2–4 hour engineering milestones. Every milestone delivers testable functionality, maintains strict repository quality standards, and ends with a Git verification checkpoint.

---

## Milestone Index Summary

- **Milestone 4 (M4): Network Discovery Engine** — ICMP/ARP Subnet Scanner API & Discovery Wizard UI.
- **Milestone 5 (M5): Asset Inventory & Inspection Drawer** — Device Repository, Data Tables, and Side Inspection Panel.
- **Milestone 6 (M6): Telemetry Polling & Live Data Visualization** — Time-series background poller and Latency/Loss Charts.
- **Milestone 7 (M7): Alerting Engine & Risk Index** — Rule-based event logs, alert sidebar, and health score calculations.
- **Milestone 8 (M8): Executive Reports & Audit Exporter** — PDF/CSV SLA generator and audit trail logger.
- **Milestone 9 (M9): Enterprise Design System Polish & Theme Refinement** — Component token unification, dark mode polish, and UX accessibility audit.

---

## Detailed Milestone Specifications

### Milestone 4: Network Discovery Engine (Subnet Scanner & Wizard)

- **Estimated Duration:** 3–4 Hours
- **Goal:** Enable users to scan any `/24` IPv4 subnet, view live progress, discover active host IPs, and store host records in database.
- **Files to Create / Modify:**
  - `backend/app/services/ping_scanner.py` (Async ping scanner service)
  - `backend/app/routes/discovery.py` (Subnet scan API endpoints)
  - `frontend/src/components/discovery/DiscoveryWizard.jsx` (4-Step modal wizard UI)
  - `frontend/src/components/discovery/LiveScanProgress.jsx` (Animated scan progress ring)
  - `frontend/src/pages/DiscoveryPage.jsx` (Subnet manager & scan trigger page)
- **Verification:**
  1. Trigger POST `/api/v1/discovery/scan` with payload `{ "subnet": "127.0.0.1/32" }` -> Returns 200 OK with scan ID.
  2. Complete scan in Discovery Wizard UI -> Displays discovered active hosts.
- **Git Commit Format:** `feat(discovery): implement ICMP subnet scanner and discovery wizard UI`
- **Future Scope:** Support for SNMP v3 community string discovery.

---

### Milestone 5: Asset Inventory & Inspection Drawer

- **Estimated Duration:** 3 Hours
- **Goal:** Provide a high-density, searchable inventory table with filtering by device type and an interactive side inspection panel.
- **Files to Create / Modify:**
  - `backend/app/routes/devices.py` (Device REST APIs: List, Search, Filter, Detail)
  - `frontend/src/components/assets/AssetTable.jsx` (MUI Data Table with sort & pagination)
  - `frontend/src/components/assets/AssetFilterBar.jsx` (Search & status pills filter)
  - `frontend/src/components/assets/AssetDetailDrawer.jsx` (Side inspection drawer UI)
  - `frontend/src/pages/AssetsPage.jsx` (Assets inventory container page)
- **Verification:**
  1. Navigate to `/assets` -> Displays table of discovered devices.
  2. Click any device row -> Opens right drawer displaying MAC, Vendor, and Ping history.
- **Git Commit Format:** `feat(assets): add asset inventory table, filter controls, and inspection drawer`
- **Future Scope:** Visual topology node map view.

---

### Milestone 6: Real-Time Telemetry & Live Data Visualization

- **Estimated Duration:** 3–4 Hours
- **Goal:** Background polling of active host IPs every 60s, storing time-series metric records, and rendering smooth interactive latency graphs.
- **Files to Create / Modify:**
  - `backend/app/services/telemetry_poller.py` (APScheduler background poller)
  - `backend/app/routes/telemetry.py` (Telemetry historical metric REST API)
  - `frontend/src/components/telemetry/LatencyChart.jsx` (Recharts interactive line chart)
  - `frontend/src/pages/TelemetryPage.jsx` (Telemetry monitoring view)
  - `frontend/src/pages/DashboardPage.jsx` (Connect real-time latency chart widget)
- **Verification:**
  1. Background service logs periodic ping telemetry.
  2. Dashboard latency chart updates automatically with time-series data.
- **Git Commit Format:** `feat(telemetry): implement background ping poller and latency chart component`
- **Future Scope:** Interface bandwidth throughput monitoring via SNMP.

---

### Milestone 7: Alerting Engine & Risk Index Calculation

- **Estimated Duration:** 2–3 Hours
- **Goal:** Detect host state transitions (`ONLINE` -> `OFFLINE`), calculate aggregate Network Health Index & Risk Score, and present interactive alert side panel.
- **Files to Create / Modify:**
  - `backend/app/services/alert_engine.py` (State change event evaluator)
  - `backend/app/routes/dashboard.py` (Calculates Health & Risk index payload)
  - `frontend/src/components/dashboard/AlertPanel.jsx` (Real-time risk & event stream card)
  - `frontend/src/components/dashboard/SummaryCards.jsx` (Connect dynamic health indicators)
- **Verification:**
  1. Mark host offline -> Alert side panel displays critical event notice.
  2. Risk score updates dynamically on Dashboard.
- **Git Commit Format:** `feat(alerts): add event alert engine and risk index calculation`
- **Future Scope:** Slack & Microsoft Teams Webhook notifications.

---

### Milestone 8: Executive Reports & Audit PDF Exporter

- **Estimated Duration:** 2–3 Hours
- **Goal:** Enable administrators to generate and download executive SLA compliance summary reports in PDF and CSV formats.
- **Files to Create / Modify:**
  - `backend/app/services/report_generator.py` (PDF report compiler engine)
  - `backend/app/routes/reports.py` (Report generation & download endpoint)
  - `frontend/src/pages/ReportsPage.jsx` (Report template selector & download button UI)
- **Verification:**
  1. Click "Generate Executive PDF" on `/reports` -> Initiates PDF download (`InfraGuard-SLA-Report.pdf`).
- **Git Commit Format:** `feat(reports): implement executive SLA report generator and PDF download`
- **Future Scope:** Automated weekly email SLA summary scheduler.

---

### Milestone 9: Design System Polish, Theme Refinement & Accessibility

- **Estimated Duration:** 2–3 Hours
- **Goal:** Harmonize global CSS design tokens, polish light/dark slate mode transitions, enforce Material Symbols icons, and verify WCAG 2.1 AA keyboard accessibility.
- **Files to Create / Modify:**
  - `frontend/src/index.css` (Design tokens & global utility classes)
  - `frontend/src/theme/appTheme.js` (MUI palette overrides & responsive typography)
  - `frontend/src/layout/ApplicationShell.jsx` (Refine topbar connection pulse & mobile drawer)
- **Verification:**
  1. Full keyboard `Tab` traversal across all pages shows blue focus outline ring.
  2. Zero visual contrast or layout shift bugs during viewport resize.
- **Git Commit Format:** `style(design-system): polish design tokens, dark mode palette, and accessibility`
- **Future Scope:** Customizable UI widget dashboard layout editor.
