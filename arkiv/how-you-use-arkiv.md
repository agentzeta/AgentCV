# Arkiv implementation

`src/arkiv.js` defines a schema, indexed owner/category/agentId, 30-day expiry, and SDK create/read operations. `src/server.js` exposes the write and read to the UI. The `Read Arkiv` button displays actual query results; it does not silently substitute local profiles when unavailable. Live execution pending credentials and funding.
