# InfraGuard Implementation Rules

Strict rules for implementing logic in the codebase:

1. **No External Calls during Scans**: Subnet sweeps and ping sweeps must execute using local OS commands. Do not invoke external web APIs.
2. **Synchronous Thread Protection**: Background tasks (like the monitoring loop) must be wrapped in try/catch blocks and run on a daemon thread to avoid main thread execution blockages.
3. **TanStack Query Integrations**: Avoid using plain fetch inside components. Maintain clean hook queries in `frontend/src/hooks/` and mutate queries on request modification.
4. **Zero LLM Dependency**: All alert mechanisms, suggestions, and recommendations must run strictly on deterministic, rule-based database logic.
