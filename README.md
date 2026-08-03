# InfraGuard

InfraGuard is an enterprise-grade, high-performance IT Infrastructure Visibility Platform designed for defensive asset discovery, structured inventory management, real-time status monitoring, network topology tracing, interactive troubleshooter runbooks, and automated health audits.

---

## 🚀 Key Capabilities

- **Defensive Network Discovery:** Scan subnets, discover active network entities, and auto-detect vendor types with zero-overhead ICMP/ARP diagnostics.
- **Infrastructure Passports:** Store physical configurations (building, room, rack, unit slot) and business parameters (owner, AMC contract, warranty, technical contact) for each hardware unit.
- **Interactive Runbooks:** Establish branching troubleshooter templates to guide operators through manual and automated recovery sequences (e.g. Ping tests, TCP port probes, Wake-on-LAN packets).
- **Structured Audit Logging:** Maintain SIEM-ready audit streams logging system-wide alerts, authentication logs, and console commands.
- **60FPS Modular Topology View:** Pan, zoom, and inspect network layouts smoothly. Built with isolated React Hooks managing viewport transformations and an optimized rendering layer utilizing `window.requestAnimationFrame` to directly update SVG DOM components, eliminating React state lag during node drag interactions.
- **Enterprise Database Facade:** SQLite persistent storage refactored into domain-separated repositories (Assets, SNMP, Runbooks, Automations, Passports) beneath a clean proxy API.

---

## 🏛️ System Architecture

The diagram below outlines the runtime data flow and separation of concerns inside the InfraGuard codebase:

```mermaid
graph TD
    subgraph UI Layer (React 19)
        A[Dashboard & Viewports] -->|Calls Hooks| B[useTopologySelection]
        A -->|Calls Hooks| C[useViewport]
        A -->|Calls Hooks| D[useTopologyInteraction]
        D -->|RAF Direct DOM Update| E[SVG Canvas Render]
    end

    subgraph Service API Layer (Flask)
        B & C & D -->|HTTP REST Requests| F[Flask API Blueprints]
        F -->|Request Origin Verification| G[CORS Middleware]
    end

    subgraph Database Layer (SQLite)
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
- Python 3.12+ (or Python 3.13+)

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

To run python database verification suites:

```powershell
backend\.venv\Scripts\python.exe tests/test_db_split.py
```

---

## 🌐 Production Deployment

### Backend Deployment (Render)

1.  Connect your GitHub repository to your Render dashboard.
2.  Create a new **Web Service**.
3.  Set the environment settings:
    - **Runtime:** `Python`
    - **Build Command:** `pip install -r backend/requirements.txt`
    - **Start Command:** `gunicorn --chdir backend app:app`
4.  Configure Environment Variables:
    - `FLASK_ENV=production`
    - `CORS_WHITELIST=https://your-frontend.vercel.app`

### Frontend Deployment (Vercel)

1.  Connect your GitHub repository to your Vercel project dashboard.
2.  Set the project settings:
    - **Framework Preset:** `Vite`
    - **Root Directory:** `frontend`
    - **Build Command:** `npm run build`
    - **Output Directory:** `dist`
3.  Configure Environment Variables:
    - `VITE_API_URL=https://your-backend.onrender.com`

---

## 📜 License

Distributed under the MIT License. See [LICENSE](file:///e:/Development/Projects/InfraGuard/LICENSE) for details.
