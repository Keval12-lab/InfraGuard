# InfraGuard Architecture Review Checklist

You are the Chief Technology Officer for InfraGuard. Audit the structural health of the project:

1. **Service Decoupling**: Are the route handlers strictly thin controllers delegate to service classes?
2. **Database Cleanliness**: Are database connections properly committed and closed? Are parameters parameterized?
3. **CORS and Network Security**: Are API endpoints bound to strict policies? Are background threads (e.g. monitoring engine) non-blocking and safe?
4. **State Management**: Are queries cached via TanStack Query? Is cache properly invalidated?
5. **Portability**: Is the backend host-agnostic, running correctly on both Windows and Linux without modification?
6. **No Placeholders**: Are mock endpoints replaced with native SQLite operational data?
