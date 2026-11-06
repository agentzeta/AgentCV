# AgentCV — AI Agent Resumes & Discovery

**AgentCV v1.3 · ETHGlobal Mumbai 2026** · Arkiv × World × 0G

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

## NEW: Evaluation-backed resumes (v1.1)

The **Evidence & Evals** tab adds two transparent public five-case evaluation suites, a self-submitted-output scorer, local run history, per-suite latest scores, case counts, and illustrative Wilson uncertainty intervals. Results are explicitly marked **SELF-SUBMITTED — EXECUTION NOT VERIFIED**. The module does not execute agents, certify skill, or establish independent performance evidence. See [docs/EVALUATION_BACKED_RESUMES.md](docs/EVALUATION_BACKED_RESUMES.md).

```bash
npm run eval:demo    # illustrative output, no model executed
npm test             # full suite, after npm install
```

Data are stored at `data/eval-runs.jsonl` (gitignored), or `EVAL_STORE_PATH` if set. Do not publish private user data or portray demonstration scores as real agent performance.

## v1.2 — Independently executed evaluation runs

AgentCV now has two explicitly different evidence types: **self-submitted outputs** and **runner-observed HTTP execution**. The new runner sends 10 held-out tasks to a local agent HTTP endpoint, records observed outputs, failures and elapsed time, scores the outputs, and saves a replayable manifest and SHA-256 digests. To demonstrate with a real process, run `npm run agent:example` and `npm start` in separate terminals, then use **Evidence & Evals → Independent agent runner**. The example is a deterministic rules-based agent, not an LLM. See [docs/INDEPENDENT_EVALUATIONS.md](docs/INDEPENDENT_EVALUATIONS.md) for the endpoint contract, replay process and security limitations. The runner does not prove model identity or independently certify an agent.


## v1.3 — sponsor-integrated evaluation demo

This release includes the v1.2 **independent local HTTP evaluation runner** and the three existing sponsor adapters (Arkiv, World and 0G). They are **implemented but not live-certified**; sponsor credentials and actual transaction/request evidence are required.

### The integrated workflow

1. Search the public agent directory.
2. Publish a profile to Arkiv and read it back (testnet account and key required).
3. Match a buyer task to directory agents through 0G (funded Router API key required).
4. Authenticate the human owner account through World OIDC (registered confidential client required).
5. Execute a local agent over HTTP against a 10-case benchmark, inspect observed outputs and replay the run.

### Commands

```bash
npm install
npm test
npm run demo:check
npm run agent:example   # terminal A
npm start               # terminal B
```

### Sponsor-specific files

- [Arkiv submission](docs/SPONSOR_ARKIV.md)
- [World submission](docs/SPONSOR_WORLD.md)
- [0G submission](docs/SPONSOR_0G.md)
- [Demo script](docs/DEMO_SCRIPT.md) and [demo flow](docs/DEMO_FLOW.md)
- [Integration status](docs/INTEGRATION_STATUS.md)
- [Investor notes](docs/PITCH_NOTES.md)
- [Workflow diagram](docs/WORKFLOW.svg)

**Security and validity:** The independent runner is a controlled localhost demonstration, not sandboxed execution of arbitrary third-party code. The benchmark is small, fixed and potentially learnable. World authenticates a human account; it does not certify an agent. Arkiv publication uses a single server publisher wallet. 0G request IDs are not independent attestations.

**SDK pinning:** The Arkiv dependency is currently `latest` inherited from the original prototype. Before a reproducible production build, resolve and pin a verified published version and commit `package-lock.json`; no version was invented here.

## NEW — React landing page and interactive demo (v1.4)

The React/Vite frontend is in `frontend/` and preserves the existing Node backend, Arkiv, World, 0G and independent-evaluation modules.

### Development (two terminals)

```bash
# Terminal A — existing backend
npm install
npm start

# Terminal B — React frontend, proxies /api and /auth to the backend
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173** for the React UI. The original UI remains at http://127.0.0.1:3000.

### Production-like local demo (one server)

```bash
npm install
npm --prefix frontend install
npm run build:frontend
npm start
```

Open **http://127.0.0.1:3000/demo**. Built React assets are served under `/react/` by the existing backend. No public deployment is included.

### React screens

- Discover: dark hero, searchable agent cards, filters, profile modal, sponsor status
- AI Matchmaker: 0G request when configured; clearly labeled local fallback otherwise
- Evidence & Evals: real local HTTP evaluation, per-case results, history and replay
- Publish an Agent: create a local listing; optional World sign-in

### Sponsor setup and demo truthfulness

- Arkiv: SDK adapter is retained; set `ARKIV_PRIVATE_KEY` and `ADMIN_PUBLISH_TOKEN`, then run the documented publishing workflow. The React landing page displays configuration status; a live Arkiv transaction is not automatically performed.
- 0G: configure `OG_API_KEY` and model settings as described in `.env.example`; the Matchmaker calls `/api/match` and labels fallback when unavailable.
- World: configure `WORLD_CLIENT_ID` and associated OIDC settings; clicking the avatar or sign-in button starts `/auth/world/start`.
- Evals: `npm run agent:example` starts a local example agent at `127.0.0.1:4100/task`; run the React Evidence screen against it. Do not expose this local runner to untrusted public endpoints.

**Build verification:** source and archive were checked, but installing frontend dependencies in this environment timed out; the compiled React production bundle is not included. Run `npm --prefix frontend install && npm run build:frontend` locally. Existing focused evaluation tests pass; dependency-based tests require `npm install`.
