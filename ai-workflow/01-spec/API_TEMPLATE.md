# InfraGuard REST API Standard Contract

Ensure all new endpoint blueprints conform to these structure design patterns.

## 📡 HTTP Endpoint Pattern

- **URL Prefix**: `/api/v1/...`
- **Response Structure**:
  - Success (200/201): `{"status": "success", "data": { ... }}`
  - Error (400/404/500): `{"status": "error", "message": "Detailed error string explanation."}`

## 🔒 Security Requirements

- Parameter validation: Query parameters/payload values must be typed (integer IDs, regex IP/MAC verification).
- Parameterized SQLite queries to enforce zero injection risk.
- Explicit `OPTIONS` response header support for cross-origin compliance.
