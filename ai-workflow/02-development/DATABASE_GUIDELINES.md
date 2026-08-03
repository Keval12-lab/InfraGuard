# SQLite Database Guidelines

Database access layer principles:

1. **Connection Lifetime**: Always open connection with `get_db_connection()`, execute statements, commit, and immediately close connection within `finally` or `with` blocks.
2. **Row Factory**: Always set `conn.row_factory = sqlite3.Row` to ensure database lookups yield key-value dictionaries.
3. **No Raw Interpolation**: Always pass SQL params as arguments (`?` placeholders). Never format strings with raw variables inside SQL statements.
4. **Data Isolation**: Never delete seed data. Maintain separate user execution records.
