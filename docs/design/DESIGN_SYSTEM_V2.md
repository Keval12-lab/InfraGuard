# InfraGuard v2.0 Enterprise Design System Specification

> **Core Philosophy:** *Zero Backend Rewrite. 100% Presentation & UX Elevate.*  
> InfraGuard v2.0 preserves all existing Flask backend logic, SNMP telemetry, discovery engine algorithms, and API hooks while completely transforming the visual interface into an enterprise-grade, high-perceived-value dark design system.

---

## 🎨 1. Enterprise Color Tokens & Dark Palette

| Token Name | Hex Code | Purpose & Application |
| :--- | :---: | :--- |
| **`bg-canvas`** | `#09090B` | Primary Application Deep Background |
| **`bg-sidebar`** | `#111827` | Navigation Sidebar & Topbar Background |
| **`bg-card`** | `#161B22` | Dashboard Widget Cards & Modal Background |
| **`border-subtle`** | `#22262D` | Card Borders & Divider Lines |
| **`accent-blue`** | `#2563EB` | Primary Action Buttons & Active State Highlights |
| **`accent-green`** | `#22C55E` | Reachable / Healthy Device Status Badges |
| **`accent-orange`**| `#F59E0B` | Latency Probe Warning / Needs Attention Badges |
| **`accent-red`** | `#EF4444` | Unreachable / Critical Incident Alerts |
| **`text-primary`** | `#F5F5F5` | Primary Headings & Asset Titles |
| **`text-secondary`**| `#A1A1AA` | Secondary Subtitles, MACs, Timestamps, Labels |

---

## 📐 2. Typography, Spacing & Border Radii Rules

### Border Radii Standards
- **Cards & Widgets:** `16px` (`borderRadius: 4`)
- **Buttons & Chips:** `12px` (`borderRadius: 3`)
- **Input Fields & Search:** `10px` (`borderRadius: 2.5`)

### Elevation & Shadows
- **Card Depth:** `0 8px 32px rgba(0, 0, 0, 0.15)`
- **Subtle Glow:** Subtle 1px borders (`#22262D`) without harsh harsh drop-shadows.

### Spacing Scale
Strictly enforce standardized padding/margins: `8px`, `16px`, `24px`, `32px`, `48px`, `64px`.

---

## 🧩 3. Component Architecture & System Layer

```text
frontend/src/
├── theme/
│   ├── palette.js           # #09090B Dark Palette
│   ├── typography.js        # Inter / Geist Font Rules
│   └── components.js        # MUI Overrides (Cards, Chips, Buttons)
├── components/ui/
│   ├── IGCard.jsx           # 16px Radius Container Card
│   ├── IGMetricCard.jsx     # Mini Sparkline Indicator Card
│   ├── IGStatusChip.jsx     # Glowing Status Pills (Healthy / Needs Attention / Offline)
│   ├── IGSkeleton.jsx       # Shimmer Loading Skeleton Pulse
│   └── IGPageHeader.jsx     # Standardized Page Titles & Search Bar
```

---

## 🗓️ 9-Stage Design System Migration Schedule

| Stage | Focus Area | Timeline | Deliverables / Output |
| :---: | :--- | :---: | :--- |
| **Stage 1** | **Design Tokens & Theme** | 2 Days | `#09090B` theme palette, MUI theme overrides, font system |
| **Stage 2** | **Core Component Library** | 5 Days | `IGCard`, `IGMetricCard`, `IGStatusChip`, `IGSkeleton`, `IGDrawer` |
| **Stage 3** | **Dashboard Redesign** | 4 Days | Dark executive dashboard (Network Map, Health Donut, Recent Activity) |
| **Stage 4** | **Discovery & Devices Page**| 3 Days | Enterprise discovery table, 6-tab Device Drawer overhaul |
| **Stage 5** | **Network Map (Topology)** | 2 Days | Hierarchical topology canvas with SVG device node icons |
| **Stage 6** | **Live Monitoring Page** | 3 Days | Real-time latency sparklines & resource metric gauges |
| **Stage 7** | **Reports & Audit Exports** | 2 Days | Executive Manager PDF & Technical Engineer Audit UI |
| **Stage 8** | **Framer Micro-Animations**| 3 Days | Smooth drawer slides, card hover interactions, shimmer loaders |
| **Stage 9** | **Consistency Polish** | 4 Days | 1366px screen audit, zero console warnings, dark mode sanity check |

---

## 🔄 100% Backend & Hook Reuse Guarantee

```text
InfraGuard Backend (100% Intact)
├── Flask REST API Engine       ✅ 0% Rewrite
├── ICMP/ARP Discovery Scanner  ✅ 0% Rewrite
├── SNMP MIB Telemetry Inspector ✅ 0% Rewrite
├── Device Confidence Engine    ✅ 0% Rewrite
└── ReportLab PDF Generator     ✅ 0% Rewrite

Frontend State & Logic (95% Intact)
├── Axios API Client            ✅ 0% Rewrite
├── Device Filter & Search Hooks ✅ 0% Rewrite
└── Redux / Zustand State       ✅ 0% Rewrite
```

---

*Document Created: 2026-08-04 | Approved by Design System Lead & Product Owner*
