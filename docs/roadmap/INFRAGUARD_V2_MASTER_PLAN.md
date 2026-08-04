# InfraGuard v2.0 Master Product & Business Strategy Plan

> **Product Vision:** InfraGuard helps IT teams quickly find network problems, understand why they happened, and know what to do next — using verified information in simple language.

---

## 🚀 15-Phase Product Engineering Roadmap

| Phase | Phase Name | Strategic Focus & Objective | Deliverables / Technologies |
| :---: | :--- | :--- | :--- |
| **01** | **Discovery (100% Verified)** | Discover all subnet devices accurately | ICMP, ARP, NetBIOS, mDNS, SSDP, WSD, SNMP Auto-Detect |
| **02** | **Device Intelligence** | Complete 1-page asset profile | IP, MAC, Brand OUI, Verification Score (★), Health Status |
| **03** | **Troubleshooting Assistant** | Instant root-cause guidance (USP) | "Possible Reasons" + "What You Can Try Next" step cards |
| **04** | **Background Monitoring** | 60-second telemetry polling | Latency, Packet Loss, Response Time, Uptime tracking |
| **05** | **Notification Engine** | Instant incident alerting | Alert stream (Printer Offline, Gateway Down, Latency Spikes) |
| **06** | **Enterprise Reporting** | Separate Executive & Tech PDF reports | ReportLab PDF generator (Executive Summary vs Tech Details) |
| **07** | **Network Map (Topology)** | Clean, hierarchical asset visualizer | React Flow SVG mapping (Internet → Firewall → Switch → Hosts) |
| **08** | **Asset Lifecycle Management**| Hardware passport tracking | Purchase Date, Warranty, Serial Number, Department, QR Codes |
| **09** | **Network History & Timeline** | Audit trail of all network events | Intermittent health event tracking ("Yesterday Offline → Online") |
| **10** | **Health Score System** | Simple 4-tier health scoring | Excellent (90-100), Good (70-89), Needs Attention, Critical |
| **11** | **Multi-Site Management** | Centralized multi-office view | Head Office, Branch Offices, Remote Warehouses |
| **12** | **InfraGuard Beacon** | Lightweight local Windows service | Collector agent sending encrypted telemetry to Cloud API |
| **13** | **Mobile Experience** | On-the-go management app | Instant status check & push alerts for IT Support Engineers |
| **14** | **Security & Trust Boundary** | Enterprise-grade compliance | Rate limiting, CORS origin check, Zero Remote Control policy |
| **15** | **Performance & Scale** | Support 500+ host targets | React memoization, Virtualized lists, SQLite indexed queries |

---

## 🛠️ Open-Source Engine & Dependency Stack

InfraGuard leverages production-ready open-source libraries to maximize reliability:

| Capability Requirement | Open-Source Dependency / Resource |
| :--- | :--- |
| **MAC Vendor Classification** | IEEE OUI Public Database |
| **Public IP Detection** | `ipify` API |
| **ISP & Geo Detection** | `ipapi.co` REST API |
| **UI Components & Icons** | Material-UI (MUI v6) + Lucide Icons |
| **Topology Graph Renderer** | `React Flow` / RAF SVG Engine |
| **Data Visualization & Charts**| `Recharts` Data Visualization Engine |
| **Backend PDF Engine** | Python `ReportLab` |
| **SNMP Telemetry Engine** | `pysnmp` v6.x MIB-II Engine |
| **Local Persistence Database**| `SQLite` (Zero-Config ACID Engine) |

---

## 📊 10-Slide Customer & Recruiter Presentation Deck Outline

```text
Slide 1: Title & Identity
"InfraGuard: Evidence-Based IT Troubleshooting Assistant for SMBs"

Slide 2: The SMB IT Challenge
"IT Support teams waste hours manually guessing network failures without visibility."

Slide 3: The InfraGuard Solution
"Instant device discovery, verified health status, and step-by-step resolution advice."

Slide 4: Product Demo & Core Dashboard
"Simple for users. Powerful behind the scenes. Zero guessed information."

Slide 5: Key Feature Stack
"ICMP/ARP Probes, Star Verification Ratings, Health Timelines, PDF Reporting."

Slide 6: Live Troubleshooting Workflow
"Find Devices ➔ Verify Data ➔ Understand Issue ➔ Apply Fix ➔ Download Report."

Slide 7: Enterprise Reporting & Audits
"Executive Summaries for Managers; In-depth Telemetry for Engineers."

Slide 8: Security & The Beacon Trust Boundary
"Telemetry collection ONLY. Zero remote desk, zero file access, 100% audit transparent."

Slide 9: Deployment Architecture (Cloud + Local Beacon)
"Works 100% offline in local LANs or synced across multiple sites via InfraGuard Beacon."

Slide 10: Pricing, Support & Next Steps
"Starter (20 Devices), Professional (100 Devices), MSP Tier. Contact for Pilot Access."
```

---

## 💼 SMB Business Model & Commercial Tiers

| Tier Name | Capacity Target | Target Market | Core Features Included |
| :--- | :---: | :--- | :--- |
| **Starter** | Up to 20 Devices | Single-Office SMBs | ICMP/ARP Discovery, Device Drawer, Local Diagnostics |
| **Professional** | Up to 100 Devices | Growing Companies | Full SNMP Telemetry, Executive PDF Reports, Health Timelines |
| **MSP / Multi-Site** | Unlimited Sites | Managed Service Providers | InfraGuard Beacon Cloud Sync, Multi-Office Dashboard |

---

## 📈 Product Readiness Audit

- **Product Vision:** ✅ 100%
- **Architecture:** ✅ 95%
- **Backend Foundation:** ✅ 90%
- **UI Design System:** ✅ 85%
- **Discovery Accuracy:** 🟢 85%
- **Real Hardware Validation:** 🟡 50%
- **Monitoring & Alerts:** 🟡 40%
- **Beacon & Cloud:** 🔴 10%

---

*Document Created: 2026-08-04 | Approved by Product Owner & Engineering Lead*
