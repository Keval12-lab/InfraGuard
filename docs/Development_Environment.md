# Development Environment

## Prerequisites

- Node.js and npm
- Python 3.13+ requested for the project

Current local note: Python 3.13 was not found on this machine during TASK-001 setup. The backend `.venv` currently uses Python 3.12.13.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Setup

From the project root:

```powershell
npm.cmd install
```

Create the backend virtual environment and install Python dependencies:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Run

From the project root:

```powershell
npm.cmd run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
Health API: http://localhost:5000/api/health

## Current Communication Contract

The frontend reads `VITE_API_BASE_URL` and automatically calls `/api/health` using Axios. It displays `Backend Connected ✅` when the backend returns `status: ok`; otherwise it displays `Backend Offline ❌`.
