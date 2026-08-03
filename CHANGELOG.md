# Changelog

All notable changes to the InfraGuard platform will be documented in this file.

## [1.0.0-RC1] - 2026-08-04

### Added

- Standardized API diagnostic telemetry endpoints (`/api/health`, `/api/version`, `/api/system`).
- Multi-layer input validation and clamping for Workspace Ping diagnostics.
- Support for environment-configurable database paths (`DATABASE_PATH`) targeting Render Persistent Disks.
- Project governance metadata (`SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`).

### Fixed

- Defensive validation handling for null/empty integer input parameters in workspace tools.
- Mermaid diagram syntax formatting in repository documentation.

### Security

- Dynamic CORS whitelist verification middleware.
- Flag injection blocking and target string sanitization via `TargetValidator`.

---

## [0.3.0] - 2026-07-30

- Completed Milestone 3 Dashboard Foundation UI.
- Built welcome section with real-time backend status chip.
- Created six metric summary cards (Total Devices, Online Devices, Offline Devices, Last Scan, Network Health, Risk Score).
- Added Recent Activity panel placeholder ("No scans have been performed yet.").
- Added Quick Actions panel buttons (Start Discovery, View Inventory, Generate Report).
- Ensured responsive grid layout across Desktop, Laptop, and Tablet.

---

## [0.2.0] - 2026-07-21

- Completed Milestone 2 application shell.
- Added shared Material UI theme.
- Added responsive sidebar and topbar layout.
- Added frontend route structure for Dashboard, Assets, Network, Reports, and Settings.
- Added empty page placeholders for future milestones.
- Preserved the existing backend health connectivity check.
