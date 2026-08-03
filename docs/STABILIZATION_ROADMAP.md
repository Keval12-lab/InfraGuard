# InfraGuard v1.0 Production Stabilization Roadmap

This document outlines the architecture cleanup, file modularization, performance optimization, security hardening, and documentation updates required to bring InfraGuard to an enterprise-grade production standard before its v1.0.0 release.

---

## Phase 1: Project Health Audit Verification

Based on automated audits (`npm run lint`, `npm run typecheck`, `npm run unused`, and `npm run build`), the following health baseline has been established:

- **Linter Status (`npm run lint`):** PASS (0 errors, 443 warnings). The warnings are primarily unused imports/variables and minor import sorting discrepancies.
- **Compiler Status (`npm run build`):** PASS (Frontend built successfully in 24.33s). Emitted a bundle size warning (856.21 kB vendor chunk).
- **Typecheck Status (`npm run typecheck`):** FAIL (Exit code 1). Reported type checking errors on JavaScript files (e.g., implicit `any` parameter types) due to strict-mode checking. This is the baseline for our TypeScript migration.
- **Unused Code Status (`npm run unused`):** FAIL (Exit code 1). Knip identified orphaned files (like `NetworkPage.jsx`) and several unused hooks and services exports.
- **Dependency Audit (`npm audit`):** Checked (2 high-severity vulnerabilities found in dependencies).

---

## Phase 2: Architecture Cleanup & Split Plan

### Monolithic Files Exceeding Standards

The following files exceed the engineering standard limits (maximum 400 lines for frontend, 500 lines for backend):

1.  **`backend/app/database/db.py` (~1200+ lines)**
    - _The Problem:_ Contains SQLite database initialization, table migrations, and every single select/insert/update query for assets, discovery scans, logs, settings, and runbooks.
    - _The Plan:_ Decompose `db.py` into a modular repository layer under `backend/app/database/repositories/`:
      - `db_session.py`: Connection lifecycle and WAL configuration.
      - `assets_repo.py`: Queries regarding discovered devices and hardware monitoring metrics.
      - `discovery_repo.py`: Subnet sweeps and history logs database queries.
      - `runbooks_repo.py`: Runbook templates, actions, and executions.
2.  **`frontend/src/pages/TopologyPage.jsx` (~800+ lines)**
    - _The Problem:_ Combines SVG topology rendering, node drag handlers, canvas zoom/pan mechanics, layout categorization math, side panel drawers, and export actions.
    - _The Plan:_ Split into cohesive sub-components under `frontend/src/components/topology/`:
      - `TopologyCanvas.jsx`: Pure SVG layout rendering and mouse action listeners.
      - `TopologyToolbar.jsx`: Zoom controls, search filter inputs, and export triggers.
      - `TopologySidebar.jsx`: Drawer showing details of selected devices.
      - `useTopologyLayout.js`: Pure mathematical logic for leveling and alignment calculations.

### Duplicated Code Cleanup

- _Identified:_ Platform-specific `ping` subprocess calling is written independently in `discovery_service.py`, `monitoring_service.py`, and `workspace_service.py`.
- _Resolution:_ Extract to `backend/app/services/utils/network_utils.py` containing a unified `PingUtility` class.

---

## Phase 3: Project Cleanup (Unused Files & Exports)

Knip and structural analysis have verified the following items as dead weight. They are earmarked for removal:

| Item   | Type          | Path / Export                        | Proof / Reference                                                |
| :----- | :------------ | :----------------------------------- | :--------------------------------------------------------------- |
| **01** | Unused Page   | `frontend/src/pages/NetworkPage.jsx` | Orphaned file. Route `/network` displays `TopologyPage` instead. |
| **02** | Unused Export | `useRunbooks` default export         | Defined in `useRunbooks.js` but page imports specific mutations. |
| **03** | Unused Export | `apiClient` default export           | Services import Axios directly or use explicit service exports.  |
| **04** | Unused Script | `tools/start-debug.bat`              | Replaced by root monorepo script `npm run dev`.                  |

---

## Phase 4: Performance Review & Optimizations

### 1. Topology Page Drag Latency

- **Reason:** Continuous update of node position states triggers expensive list filtering and coordinates mapping on every frame inside a `useMemo` block.
- **Impact:** Noticeable UI stutter when dragging nodes on larger networks.
- **Optimization:** Implement mouse-move handlers that update the SVG DOM element coordinates directly (`element.setAttribute('cx', ...)`), only writing to React state on drag completion (`mouseup`).
- **Est. Effort:** 4 hours.

### 2. Frontend Initial Load Bundle Size

- **Reason:** Heavy libraries (MUI, React Query) are compiled into a single monolithic 856 kB JS file.
- **Impact:** Delayed first-paint loading times on slow client connections.
- **Optimization:** Enable Vite route split code-splitting (`React.lazy`) and manual Rollup chunk division in `vite.config.js`.
- **Est. Effort:** 2 hours.

---

## Phase 5: Security Review & Hardening Recommendations

1.  **Introduce Authentication (Critical Block):**
    - _Action:_ Set up a Flask blueprint (`/api/v1/auth`) for admin login and issue stateless JWT cookies. Wrap control APIs with a `@jwt_required()` check.
2.  **CORS Domain Whitelisting (High Severity):**
    - _Action:_ Restrict `CORS_ORIGINS` to the frontend staging/production domain rather than `*` wildcard.
3.  **Command Parameter Sanitization (High Severity):**
    - _Action:_ Add validation checks to block command flags in the workspace ping/port tools (e.g., verifying inputs match clean IPv4/domain syntaxes using regex).

---

## Phase 6: Documentation Review

The following documents require correction or expansion for production deployment readiness:

- **`README.md`:** (Outdated) Currently claims no dashboard or discovery functions are built. Update with the full portfolio setup, system details, and screenshots.
- **`LICENSE`:** (Incomplete) Contains placeholders. Standardize under the MIT open-source license.
- **`CHANGELOG.md`:** (Stale) Milestone 4 is marked as unreleased; update to reflect current build completeness.

---

## Phase 7: Final Project Health Scores

Current project scores based on code checks and architecture audit:

- **Architecture Score:** 72/100 (Modular structure, but database and topology components are monolithic).
- **Maintainability Score:** 65/100 (Typecheck fails, large components require refactoring).
- **Performance Score:** 78/100 (SQLite in WAL mode is fast, but frontend topology canvas drags suffer under load).
- **Security Score:** 45/100 (Critical gaps: no authentication, wildcard CORS policy).
- **Developer Experience:** 90/100 (Concurrent servers startup, auto-format on save, and CI configs are fully functional).
- **GitHub Showcase Readiness:** 50/100 (Requires README rewrite and license creation).
- **Deployment Readiness:** 30/100 (Blocked by Vercel serverless database/monitoring thread incompatibility).

---

## Actionable Execution Roadmap

The roadmap is divided into four sequential, independent, and completely reversible execution phases. **No changes will be applied until approved.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                      STABILIZATION ROADMAP PHASES                      │
├────────────────────────────────────────────────────────────────────────┤
│ Phase A: Quick Wins & Security Configuration Whitelist (1 hr)          │
│   - Apply npm audit fixes for dependency security warnings.            │
│   - Restrict CORS origin rules from wildcard to whitelist.             │
│   - Add regex validation to verify target IPs in subprocess tools.      │
├────────────────────────────────────────────────────────────────────────┤
│ Phase B: Project Cleanups & Bundle Code Splitting (2 hrs)              │
│   - Safely remove NetworkPage.jsx and unused script file.              │
│   - Configure Vite code splitting and manual chunks in vite.config.js. │
│   - Add React.lazy route loading to App.jsx.                           │
├────────────────────────────────────────────────────────────────────────┤
│ Phase C: Monolithic Code Refactoring & Splits (6 hrs)                  │
│   - Split TopologyPage.jsx into Canvas, Toolbar, and Sidebar components.│
│   - Split db.py into Session manager and domain-specific Repositories. │
│   - Abstract subprocess ping command calling to NetworkUtils.          │
├────────────────────────────────────────────────────────────────────────┤
│ Phase D: Repository Portfolio Branding & License Update (2 hrs)        │
│   - Rewrite README.md to list current features and screenshots.        │
│   - Create standard MIT License and update CHANGELOG.md metrics.        │
└────────────────────────────────────────────────────────────────────────┘
```

### Review Matrix per Task

| Phase | Task                  | Reason                                       | Risk   | Est. Time | Expected Benefit                     |
| :---- | :-------------------- | :------------------------------------------- | :----- | :-------- | :----------------------------------- |
| **A** | CORS Whitelisting     | Restricts endpoint calls to trusted clients. | Low    | 15 min    | Eliminates cross-origin exploits.    |
| **A** | IP Parameter Checks   | Stops flag injection during subprocess runs. | Low    | 30 min    | Blocks command options manipulation. |
| **B** | Clean Unused Files    | Removes dead code and asset weight.          | Low    | 15 min    | Declutters workspace directory.      |
| **B** | Route Code Splitting  | Decreases JS startup payload sizes.          | Medium | 45 min    | Fast initial page loads on client.   |
| **C** | Split `TopologyPage`  | Reduces component size and drag lag.         | High   | 3 hours   | Drastically improves canvas frames.  |
| **C** | Decompose `db.py`     | Eliminates monolithic 1200+ line repository. | High   | 3 hours   | Simplifies DB migration & debugging. |
| **D** | Update README/License | Fixes inaccurate portfolio info.             | Low    | 1 hour    | Professional recruiter showcase.     |
