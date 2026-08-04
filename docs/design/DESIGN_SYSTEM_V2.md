# InfraGuard v2.0 Enterprise Design System & UX Architecture

> **Core Philosophy:** *Experience First. Zero Backend Rewrite. 100% Presentation & UX Elevate.*  
> InfraGuard v2.0 preserves all Flask backend logic, SNMP telemetry, and discovery engines while establishing a world-class dark mode UX architecture designed for 3-5 year scalability.

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

## 📐 2. Typography, Radii & Motion Scale

### Border Radii Standards
- **Cards & Widgets:** `16px` (`borderRadius: 4`)
- **Buttons & Chips:** `12px` (`borderRadius: 3`)
- **Inputs & Search:** `10px` (`borderRadius: 2.5`)

### Standardized Motion Timings (Framer Motion)
- **Card Hover:** `120ms` (ease-out)
- **Sidebar Collapse/Expand:** `180ms` (ease-in-out)
- **Drawer Slide-In:** `220ms` (cubic-bezier)
- **Modal Dialog Fade:** `250ms` (ease-out)

---

## 🖼️ 3. Iconography & SVG Asset Library

### Icon Standard Rules
Strictly limit icon sets to **Lucide Icons** + **Material Symbols Rounded**. No random third-party SVGs inside application dashboards.

### Vector Infrastructure Assets (`frontend/src/assets/svg/`)
- `router.svg`, `switch.svg`, `server.svg`, `printer.svg`, `camera.svg`, `nas.svg`, `wifi.svg`, `firewall.svg`, `internet.svg`, `cloud.svg`, `rack.svg`

---

## ♿ 4. Accessibility (a11y) & Responsiveness

### Keyboard Navigation Standards
- `Tab` / `Shift+Tab`: Full focus traversal across interactive controls.
- `ESC`: Close `DeviceDrawer`, modals, or active dropdown menus.
- `Enter` / `Space`: Trigger active button actions.
- **Focus Indicator:** Visible 2px focus ring (`outline: 2px solid #2563EB`).

### Screen Resolution Support
Layout scale testing guaranteed across: `1366px`, `1440px`, `1600px`, `1920px`, `2560px` (UltraWide).

---

## 🔔 5. Standardized Application UX States

| State Type | Component Spec | User Experience Action |
| :--- | :--- | :--- |
| **Empty State** | `IGEmptyState.jsx` | Illustrative graphic + *"No Devices Discovered"* + Primary *"Start Scan"* CTA |
| **Error State** | `IGErrorState.jsx` | *"Cannot reach InfraGuard Engine"* + Retry Button + View Logs Link |
| **Skeleton Pulse**| `IGSkeleton.jsx` | Shimmer pulse layout matching card structure (Zero "Loading..." text) |
| **Toast System** | `IGToast.jsx` | Strictly 4 variants: `Success`, `Info`, `Warning`, `Critical` |

---

## 🚀 6. 10-Phase Enterprise Product Roadmap

```text
Phase 1: Enterprise Design System & Tokens       [██████████ 100%]
Phase 2: Dark Dashboard & Executive UX           [██████████  90%]
Phase 3: Devices Table & Drawer Overhaul          [██████████  85%]
Phase 4: Network Map Topology Visualizer          [██████████  80%]
Phase 5: Background Monitoring & Probes           [██████████  50%]
Phase 6: Executive & Technical PDF Reports        [██████████  75%]
Phase 7: Landing & Marketing Website             [██████████  20%]
Phase 8: Real Hardware Vendor Validation          [██████████  50%]
Phase 9: 3-Client SMB Pilot Program              [██████████  10%]
Phase 10: Commercial Release & Deployment         [██████████   0%]
```

---

*Document Updated: 2026-08-04 | Approved by Product Owner & Engineering Director*
