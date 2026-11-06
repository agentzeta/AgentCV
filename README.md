# AgentCV — AI Agent Resumes & Discovery

**ETHGlobal Mumbai 2026** · Arkiv × World × 0G

A standalone, open-source marketplace for discovering AI agents. Browse profiles, search by skill, get task-based agent recommendations from 0G Private Computer, authenticate human owners with World ID, and publish public agent resumes to Arkiv's Rabdi testnet.

> **Honest status:** The local web app works without credentials. Arkiv, World and 0G integrations are implemented as real SDK/API adapters but have **not** been executed against live sponsor services in this environment. No live transaction hashes, World verifications, 0G request IDs, deployment URL or prize qualification are claimed. The six initial profiles are illustrative.

## Quick start

Requires Node.js 22+.

```bash
npm install
cp .env.example .env
npm test
npm start
```

Open http://localhost:3000. Environment variables are optional for the local directory. Never commit `.env`.

## User flows

1. **Discover:** filter six example agent resumes by skill/category.
2. **Match:** enter a task; 0G Private Computer returns up to three agent IDs and reasons. If no API key, use the separate, explicitly labeled **local demo**.
3. **Publish:** create a profile in server memory; optionally write a 30-day public entity to Arkiv and read it back from Arkiv.
4. **Human owner:** use World OIDC Authorization Code + PKCE; the backend validates a signed ID token before permitting a protected owner action. The World sign-in is not a capability certificate for the listed agent.

## Sponsor integrations

| Sponsor | Implementation | Required to prove qualification |
|---|---|---|
| Arkiv | `src/arkiv.js`, `/api/arkiv/publish`, `/api/arkiv/profiles` | Fund testnet wallet; write an entity; read it from Arkiv; publish wallet address, entity key, query and tx hash |
| World | `src/world.js`, `/auth/world/start`, callback, `/api/world/claim-owner` | Register OIDC client; test success and denied/cancelled path; show validated backend session and protected action |
| 0G | `src/og.js`, `/api/match` | Fund 0G Private Computer API key; run live match; capture real request ID; deploy publicly |

### Arkiv

Get a testnet wallet, tGLM and an Arkiv access key from https://hub.arkiv.network. Set `ARKIV_PRIVATE_KEY` (0x-prefixed) and `ARKIV_ACCESS_KEY` and a strong random `ADMIN_PUBLISH_TOKEN` in `.env`. The browser prompts for this token when publishing. Then:

```bash
npm run arkiv:publish -- atlas
npm run arkiv:read
```

The app's Arkiv **schema** is in `src/arkiv.js` and documented in `arkiv/schema.md`. The query is `publicClient.select({...}).from(AgentProfiles).fetch()`. **Owner note:** the server signs using a single demo publisher wallet. This is not yet per-user wallet custody; do not claim each listing is signed by its human owner.

### World

Register a confidential OIDC client in https://auth.world.org/portal with callback `http://localhost:3000/auth/world/callback` for local testing (or your deployed HTTPS URL). Set `WORLD_CLIENT_ID`, `WORLD_CLIENT_SECRET`, `WORLD_REDIRECT_URI`, and `BASE_URL`. The implementation uses discovery, state, nonce, PKCE S256, code exchange and remote JWKS signature verification. Its default client authentication is `client_secret_basic`; `client_secret_post` is optional. It is an **authentication** integration, not an agent authorization or trust score.

### 0G

Create a key at https://pc.0g.ai, choose a currently available model, set `OG_API_KEY`, `OG_MODEL` and optional `OG_TRUST_MODE=verified`. The API uses `https://router-api.0g.ai/v1/chat/completions`. The 0G response ID is displayed as a request ID; it is **not** represented as independently verified attestation. 0G powers the core task-to-agent matching experience. Without 0G, live AI recommendations stop; the separately labeled offline demo is only a basic keyword suggestion.

## Important limitations

- The project is a hackathon MVP, not a production marketplace. Profile submission is public and unmoderated; new local profiles are ephemeral and disappear on server restart.
- Arkiv publication uses one backend demo wallet. A production version would use wallet-owned submission and spam moderation.
- World login is session-scoped, not cryptographically bound to a particular Arkiv listing. The protected action is a demo action, not proof of agent ownership.
- No payments, autonomous execution, agent risk scores, custom settlement, or proprietary control protocols.
- A live deployed URL, demo video, and actual sponsor transactions are still needed for prize submissions.
- The server-side session store is in-memory and is not suitable for horizontal scaling. Add CSRF protection, persistent storage, rate limiting and abuse controls before production use.

## Run tests

```bash
npm test
```

## Publishing

See `docs/GITHUB_PUBLISH.md`, `docs/PRD.md`, `docs/SPONSOR_CHECKLIST.md`, and `docs/DEMO_SCRIPT.md`.

## AI disclosure

AI assistance was used to draft the code, documentation and test cases during the hackathon. All live integrations must be tested by the team; no fake sponsor evidence should be submitted.

## License

MIT. No Phoenix, CLEAR, ADMIT, AUTH2, or other confidential portfolio code is included.
