# InfraGuard Workspace Layout Structure

Directory hierarchy overview:

```
infraguard/
├── ai-workflow/          # Developer prompt methodologies and checklists
├── backend/              # Flask Backend Service
│   ├── app/
│   │   ├── database/     # SQLite migrations, seeds, connection helper
│   │   ├── routes/       # Endpoint Blueprints
│   │   ├── services/     # Pure domain workflows and utilities
│   │   └── settings.py   # Runtime configs
│   └── run.py            # Entry point
└── frontend/             # React + Material UI Client
    ├── src/
    │   ├── components/   # Reusable layout panels, modals, charts
    │   ├── hooks/        # React Query custom hook instances
    │   ├── pages/        # Main route navigation viewport panels
    │   ├── services/     # API request clients (Axios wrappers)
    │   └── App.jsx       # Layout routers and page registrations
```
