# API

## Health Check

`GET /api/health`

Expected response:

```json
{
  "status": "ok",
  "message": "InfraGuard Backend Running"
}
```

This endpoint exists only to verify that the frontend and backend can communicate during development.

No product API, dashboard, inventory, authentication, reports, or business logic has been implemented.
