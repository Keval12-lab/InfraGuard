# InfraGuard

InfraGuard is a professional IT Infrastructure Visibility Platform for defensive discovery, inventory, monitoring, analysis, and reporting.

## Quick Start

Double-click:

```text
tools\start.bat
```

This starts the Flask backend, starts the React frontend, and opens the browser at http://localhost:5173.

To stop the development servers, double-click:

```text
tools\stop.bat
```

## TASK-001 Status

The development foundation is ready:

- React 19 frontend using Vite and JavaScript
- Material UI installed
- React Router installed
- Axios installed
- Flask backend installed
- Flask-CORS configured
- SQLite available through Python standard library
- Backend virtual environment created at `backend/.venv`
- Health endpoint available at `GET /api/health`

No dashboard, database models, network discovery, inventory, reports, authentication, or business logic have been implemented.

## Local Development

From the project root:

```powershell
npm.cmd install
npm.cmd run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
Health API: http://localhost:5000/api/health

Expected health response:

```json
{
  "status": "ok",
  "message": "InfraGuard Backend Running"
}
```

## Python Runtime Note

TASK-001 requests Python 3.13+. The currently available backend virtual environment is using Python 3.12.13 because a Python 3.13 executable was not found locally.

## Development Rule

Every feature must follow: Research -> Design -> Task Definition -> Implementation -> Review -> Testing -> Documentation -> Merge.