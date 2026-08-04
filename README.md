# InfraGuard

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.12+-3776AB.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![Flask](https://img.shields.io/badge/Flask-3.x-000000.svg)
![Release](https://img.shields.io/badge/Release-v1.0.1-green.svg)

> **"InfraGuard helps IT support engineers quickly find device and network problems, explains what was verified, and provides practical next steps in simple language—without overwhelming users with networking jargon."**

InfraGuard is an evidence-based IT Infrastructure Visibility and Troubleshooting Platform designed for small and medium businesses. Its primary objective is to help IT support engineers and system administrators manage their networks without requiring deep networking expertise. The platform prioritizes accuracy, simplicity, security, and actionable insights over feature quantity. 

**Simple for users. Powerful behind the scenes.**

---

## ❓ Why InfraGuard?

Most monitoring tools tell you: *"There is a problem."*

**InfraGuard tells you:**
- **Why** it happened.
- **What evidence** was used to verify it.
- **What you can try next** to fix it.

---

## 🎯 Core Philosophy & Principles

1. **Evidence Over Assumptions:** Never show data that cannot be verified. We never fabricate topology switches or guess offline statuses. Every node is backed by ICMP/ARP/SNMP evidence.
2. **Simplicity First:** End-users are IT support engineers, not software developers. The UI uses plain, human language (e.g., "Find Devices" instead of "ICMP Subnet Discovery").
3. **Progressive Disclosure:** Display the minimal required information (Device Name, Status, IP, Brand) by default. Hide advanced evidence (OID, Interfaces, Topology) inside detail drawers.
4. **Troubleshooting First & Fix Suggestions (USP):** The goal is not just inventory, it's finding root causes and offering next steps. (e.g., Laptop Offline -> "Possible Reason: Wi-Fi disconnected" -> "What You Can Try: Check Wi-Fi connection, Scan again").
5. **Actionable UI:** Never show a warning without telling the user what to do next. Every screen must answer exactly one question.
6. **Backend-Only Intelligence:** All complex logic (Risk Engine, Classification, Correlation, SNMP rules) lives purely in the backend. The frontend is strictly for presentation.
7. **Never Guess:** **If information cannot be verified, it will be marked as "Not Available" instead of showing incorrect data.** We do not guess status or fabricate switches.

---

## ⭐ Highlights & Capabilities

- **Defensive Network Discovery:** Subnet scanner detecting active network entities with zero-overhead ICMP/ARP probes.
- **Optimized Topology Visualization:** Responsive pan-and-zoom layout engine using isolated React hooks and `window.requestAnimationFrame` DOM state commits.
- **Infrastructure Passports:** Structured physical location tags (building, rack, slot) and contract parameters (AMC, warranty, lifecycle).
- **Interactive Troubleshooter Runbooks:** Sequence-guided diagnostic templates (Ping probes, TCP socket checks, Wake-on-LAN broadcasts).
- **Modular Database Facade:** Clean repository pattern separating domain modules (Assets, SNMP, Runbooks, Passports) behind `database/db.py`.
- **Production Diagnostic Telemetry:** Standardized `/api/health`, `/api/version`, and `/api/system` telemetry endpoints with CORS protection.

| Module                      | Status | Core Capability                                          |
| :-------------------------- | :----: | :------------------------------------------------------- |
| **Dashboard**               |   ✅   | System summary metrics & quick actions                   |
| **Network Identity**        |   ✅   | Hostname, OS, user, boot time, public IP & ISP detection |
| **Network Quality**         |   ✅   | Latency, jitter, DNS timing, packet loss & quality score |
| **Network Discovery**       |   ✅   | Subnet entity discovery via ICMP/ARP probes              |
| **Asset Inventory**         |   ✅   | Hardware configuration & passport location tags          |
| **Topology Mapping**        |   ✅   | Interactive RAF-driven SVG graph rendering               |
| **Engineer Workspace**      |   ✅   | ICMP ping, TCP port probe & WOL diagnostics              |
| **SNMP Inspector**          |   ✅   | Interface, neighbor & VLAN telemetry                     |
| **Runbooks**                |   ✅   | Guided diagnostic recovery sequences                     |
| **SIEM Timeline Log**       |   ✅   | System audit event stream                                |

---

## 🏢 Enterprise Features

| Capability | Status |
| :--- | :---: |
| Automatic Network Identity Detection | ✅ |
| Automatic LAN Subnet Detection | ✅ |
| Public IP Detection | ✅ |
| ISP Detection | ✅ |
| OS & Boot Time Detection | ✅ |
| Network Quality Analysis (Latency / Jitter / DNS) | ✅ |
| Packet Loss Detection | ✅ |
| Device Discovery via ICMP/ARP | ✅ |
| Infrastructure Asset Inventory | ✅ |
| Infrastructure Passports (Rack / Room / Contract) | ✅ |
| Interactive Network Topology Map | ✅ |
| SNMP Device Inspection | ✅ |
| Troubleshooter Runbooks | ✅ |
| PDF Report Generation | ✅ |
| SIEM-Ready Audit Timeline | ✅ |
| REST API Backend | ✅ |
| Production Deployment (Render + Vercel) | ✅ |

## 🏛️ System Architecture

The diagram below outlines the runtime data flow and separation of concerns inside the InfraGuard codebase:

```mermaid
graph TD
    subgraph UI ["UI Layer (React 19)"]
        A[Dashboard & Viewports] -->|Calls Hooks| B[useTopologySelection]
        A -->|Calls Hooks| C[useViewport]
        A -->|Calls Hooks| D[useTopologyInteraction]
        D -->|RAF Direct DOM Update| E[SVG Canvas Render]
    end

    subgraph Service ["Service API Layer (Flask)"]
        B & C & D -->|HTTP REST Requests| F[Flask API Blueprints]
        F -->|Request Origin Verification| G[CORS Middleware]
    end

    subgraph Database ["Database Layer (SQLite)"]
        F -->|Facade Calls| H[database/db.py proxy]
        H -->|Queries| I[core.py]
        H -->|Queries| J[assets.py]
        H -->|Queries| K[snmp.py]
        H -->|Queries| L[passport.py]
        H -->|Queries| M[runbooks.py]
        H -->|Queries| N[automations.py]
        H -->|Queries| O[timeline.py]
    end
```

---

## 🛠️ Local Development & Setup

### Prerequisites

- Node.js 20+
- Python 3.12+

### 1. Project Installation

Install all root workspace and sub-workspace dependencies in one command:

```powershell
npm install
```

### 2. Running the Platform

Start the frontend (Vite) and backend (Flask) development servers concurrently:

```powershell
npm run dev
```

- **Frontend Webapp:** `http://localhost:5173`
- **Backend Server:** `http://localhost:5000`
- **API Health Monitor:** `http://localhost:5000/api/health`

### 3. Alternative Launch Scripts (Windows)

Double-click files located in the `tools` directory to execute background tasks:

- `tools\start.bat` - Starts dev servers and opens the browser.
- `tools\stop.bat` - Cleanly stops all active dev servers.

---

## 🧪 Verification Gates

Verify codestyle and build status before committing logic changes:

```powershell
# Format codebase using Prettier
npm run format

# Run ESLint validation checks
npm run lint

# Run Vite frontend production build check
npm run build:frontend

# Run full project verify pipeline
npm run verify
```

To run python database and endpoint verification suites:

```powershell
backend\.venv\Scripts\python.exe tests/test_db_split.py
backend\.venv\Scripts\python.exe tests/test_endpoints.py
```

---

## 🌐 Production Deployment

### Backend Deployment (Render)

1. Connect your GitHub repository to your Render dashboard.
2. Create a new **Web Service**.
3. Set the environment settings:
   - **Runtime:** `Python`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `gunicorn --chdir backend app:app` (or `gunicorn --chdir backend "app:create_app()"`)
4. Configure Environment Variables:
   - `FLASK_ENV=production`
   - `DATABASE_PATH=/opt/infraguard/instance/infraguard.db`
   - `CORS_WHITELIST=https://your-frontend.vercel.app`
5. Attach a 1 GB Persistent Volume mounted at `/opt/infraguard/instance`.

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to your Vercel project dashboard.
2. Set the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Configure Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com`

---

## 📌 Known Limitations & Roadmap

- **Database Engine**: SQLite is used by default for single-node deployments. PostgreSQL storage adapter support is planned for v1.1.
- **Authentication**: Role-Based Access Control (RBAC) and JWT user sessions are scheduled for the v1.1 milestone.

---

## 🔗 Live Demo

> **Deployment Status:** Release Candidate `v1.0.0-RC1` ready for production deployment. Live URLs will be updated post-hosting.

- **Frontend Webapp:** _Deployment Pending_
- **Backend Base API:** _Deployment Pending_
- **API Telemetry & Diagnostics:**
  - Health Audit: `/api/health`
  - Release Version: `/api/version`
  - System Diagnostics: `/api/system`

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
