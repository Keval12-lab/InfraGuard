# Architecture

InfraGuard currently has a runnable React frontend and Flask backend foundation.

## Frontend

The frontend is responsible for UI, routing, page composition, components, charts, tables, and forms.

Current structure:

- `src/App.jsx` defines application routes.
- `src/layout/ApplicationShell.jsx` provides the shared sidebar, topbar, and responsive layout.
- `src/config/navigation.js` defines shell navigation items.
- `src/theme/appTheme.js` defines the shared Material UI theme.
- `src/pages/` contains empty routed pages for future milestones.

## Backend

The backend is responsible for business logic, discovery, scanning, database access, reports, and APIs.

Current backend behavior is limited to `GET /api/health` for development connectivity checks.

No dashboard widgets, database models, network discovery, inventory, reports, authentication, or business logic are implemented.
