# InfraGuard System Context File

Welcome to the unified single point of truth for InfraGuard v2.

## 🌟 Project Vision & Philosophy

InfraGuard is a **Unified IT Infrastructure & Network Visibility Platform** designed for Network Administrators, IT Support Engineers, and MSPs.
The platform's philosophy is:

- **Fast, Minimal, Premium UI**: Modern sleek aesthetics, curated dark mode backgrounds (`#0B0F19`), responsive views, Outfit/Inter typography, and smooth transitions.
- **Rule-Based Engine**: Strictly deterministic alerts, anomalies, and insights. Zero third-party LLM wrapper integrations.
- **Local SQLite Data Only**: Real physical device statistics, pings, subnet scans, and database histories. No simulated or mock data values.

## 📁 Repository Structure

```
infraguard/
├── ai-workflow/          # Prompt templates and qa verification protocols
├── backend/              # Flask Backend Service
│   ├── app/
│   │   ├── database/     # SQLite schemas, seeds, connection utilities
│   │   ├── routes/       # API Blueprint route definitions
│   │   ├── services/     # Core domain business workflows
│   │   └── settings.py   # App parameters
│   └── run.py            # Flask runner
└── frontend/             # React + Material UI Client
    ├── src/
    │   ├── components/   # Modular dialogs, panels, cards
    │   ├── hooks/        # React Query query/mutation definitions
    │   ├── pages/        # Viewport route endpoints
    │   ├── services/     # API request endpoints
    │   └── App.jsx       # Layout registry
```

## 📡 API Contract Standards

- Prefix: `/api/v1/...`
- **Response Format**:
  - Success (200/201): `{"status": "success", "data": { ... }}`
  - Error (400/500): `{"status": "error", "message": "Detailed error string explanation."}`
- **OPTIONS Support**: Blueprints must explicitly support `OPTIONS` requests for CORS compliance.

## 🗄️ Database Standards

- Database: SQLite (`db.py`).
- Parameterized queries only (`?` placeholders) to eliminate security vulnerabilities.
- Connections must be safely committed and closed in the local query function.
- Row output factory set to `sqlite3.Row` to guarantee key-value dictionary returns.

## 🎨 UI Guidelines

- Framework: React + Material UI (MUI).
- Style overrides: Styled with Outfit / Inter fonts and custom gradients.
- Interactive Feedback: Provide explicit loading spinners (`CircularProgress` or `Skeleton` panels) during async actions.
- Empty states: Gracefully handle absent metrics or search returns.

---

### 🛠️ Developer Prompt Workflows

Use the prompt files inside the `ai-workflow/` folder when building features, reviewing PRs, auditing security, checking performance, or verifying quality releases.
