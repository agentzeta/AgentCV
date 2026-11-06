# Arkiv submission copy — AgentCV

**What we built.** AgentCV is a searchable public directory for AI agents. Builders can publish an agent resume to Arkiv as a schema-defined, expiring entity and buyers can retrieve listings through an Arkiv query.

**Why Arkiv is essential.** Arkiv is the live searchable public listing layer: `AgentProfiles` has indexed owner, category and agent ID; listings carry a 30-day expiry. AgentCV uses `createEntity`, `select().from().fetch()` and reads entity keys/owner addresses.

**Implementation.** `src/arkiv.js`; `scripts/publish-arkiv.js`, `scripts/read-arkiv.js`; `POST /api/arkiv/publish`, `GET /api/arkiv/profiles`. The demo backend uses one funded publisher wallet, not each user’s own wallet.

**Evidence to paste after a real run:** Rabdi tx hash: [PENDING]; entity key: [PENDING]; wallet: [PENDING]; live query screenshot: [PENDING].

**Source:** https://docs.arkiv.network/writing/create/
