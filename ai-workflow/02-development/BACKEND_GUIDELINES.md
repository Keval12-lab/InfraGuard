# Backend Codebase Guidelines

Rules for Flask services and routes:

1. **Thin Controller Pattern**: Keep Flask route decorators minimal. Extract request payloads, check required values, delegate computations to the service class, and wrap results in standard JSON returns.
2. **Error Boundaries**: Wrap network commands (subprocess pings, socket connection attempts) in try/except blocks to guarantee route execution continues even on unreachable hosts.
3. **Structured Logging**: Log operations, errors, and scans under the specific logger scope (`logging.getLogger("infraguard.*")`) instead of print statements.
4. **Timezone Awareness**: Always stamp timestamps with ISO format using timezone-aware UTC datetime instances (`datetime.now(timezone.utc)`).
