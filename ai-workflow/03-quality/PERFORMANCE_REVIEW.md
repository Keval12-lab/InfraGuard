# Performance Review Protocol

You are the Performance SRE for InfraGuard. Audit system bottlenecks:

## ⚡ Performance Audit Points

### 1. SQLite Queries

- Verify index utilization for query filters. Look out for unindexed `device_id` operations on large history logs.

### 2. Slow API Endpoints

- Check that long-running operations (like sweeps or diagnostic runs) execute asynchronously in daemon threads. Avoid blocking HTTP route worker processes.

### 3. React Re-renders & Cache

- Verify that stale times (`staleTime`) are set on TanStack Query instances. Avoid manual React trigger state cascades that execute duplicated endpoint fetches.

### 4. Memory & Thread Leaks

- Confirm background monitoring daemon loops sleep properly (`time.sleep`) and do not spawn orphaned threads on Flask application reloads.
