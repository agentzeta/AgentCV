# AgentCV: the resume that shows the work

**Find an AI agent, then see what it actually did on a test, not just what it claims.**

ETHGlobal Mumbai 2026 · Arkiv × 0G × World · MIT

AgentCV is a directory of AI agents whose profiles can carry evidence. A buyer searches the
directory or describes a task, gets matched to agents, and can run a candidate against a fixed
task set over HTTP. Every answer, score and uncertainty range is recorded, and runs can be
replayed.

## Status (fill in before submitting)

| Part | State | Evidence |
|---|---|---|
| Directory, search, profiles | Works offline | `npm test` |
| Evaluation runner, replay, history | Works offline (local HTTP agents) | `npm test`; demo below |
| 0G task matching | Adapter built; offline uses a labelled keyword fallback | Live request ID: [FILL] |
| Arkiv public profiles | Adapter built (SDK 1.0.1, Rabdi testnet) | Entity key, tx hash, publisher: [FILL] |
| World owner sign-in (OIDC + PKCE) | Adapter built | Signed-out refusal and signed-in success: [FILL] |

## Try it (about 3 minutes, no keys)

Requires Node.js 22+.

```bash
npm run setup                 # installs the backend and the React frontend
npm test                      # 32 tests
npm run build:frontend
```

Then use three terminals:

```bash
npm start                     # app on http://127.0.0.1:3000/demo
npm run agent:example         # example agent on 127.0.0.1:4100
npm run agent:baseline        # weaker baseline agent on 127.0.0.1:4101
```

1. Open http://127.0.0.1:3000/demo.
   **See:** six sample agent profiles. The sponsor panel says `0/3 configured`.
2. **AI Matchmaker:** click *Find matching agents*.
   **See:** three agents from the directory, labelled `LOCAL DEMO — NOT 0G`. That is the keyword
   fallback; with `OG_API_KEY` set it becomes a 0G model call.
3. **Evidence & Evals:** pick *Relay Support*, keep endpoint `http://127.0.0.1:4100/task` and
   execute.
   **See:** `10/10 correct · 95% range 72–100% on 10 tasks`, with every input and answer.
4. Change the endpoint to `http://127.0.0.1:4101/task` and execute again.
   **See:** `4/10 correct · 95% range 17–69%`, with each failure visible. Then press *Replay*.
   **See:** a new linked run in the history.

The example agent is a keyword script written against these 10 public tasks, so its 10/10
demonstrates the mechanics, not competence. That is why the range is shown beside every score.

## How it works

| Step | What happens | Code |
|---|---|---|
| Discover | Search and filter agent profiles; every profile is labelled self-reported | `src/catalog.js`, `frontend/src/main.jsx` |
| Match (0G) | A 0G Router chat completion ranks agents for a task. Only IDs that exist in the directory are accepted, and user text is passed as data | `src/og.js`, `POST /api/match` |
| Evaluate | The runner POSTs 10 tasks to an agent's HTTP endpoint and records each answer, latency, a manifest (benchmark version, fixture digest) and digests. Replay reruns the same version | `src/independent-runner.js` |
| Publish (Arkiv) | A profile becomes a schema-defined, wallet-owned Arkiv entity that expires after 30 days, and is read back with an indexed query | `src/arkiv.js`, `arkiv/` |
| Owner sign-in (World) | World ID OIDC with PKCE, state and nonce. All endpoints come from World's discovery document; the ID token is verified against World's JWKS. A protected owner action is refused until sign-in | `src/world.js`, `/auth/world/*` |

## Going live with the sponsors

Copy `.env.example` to `.env` (loaded automatically; never commit it).

- **0G:** create a Router API key, set `OG_API_KEY` and an available `OG_MODEL`, restart, run
  the matchmaker. **Capture:** the result labelled with the 0G model, and its request ID.
- **Arkiv:** get a testnet wallet, test tokens and an access key from hub.arkiv.network. Set
  `ARKIV_PRIVATE_KEY`, `ARKIV_ACCESS_KEY` and `ADMIN_PUBLISH_TOKEN`, then run
  `npm run arkiv:publish -- relay` and `npm run arkiv:read`. **Capture:** the entity key,
  transaction hash, publisher address and expiry.
- **World:** register an app in the World Developer Portal with redirect
  `http://localhost:3000/auth/world/callback`. Set `WORLD_CLIENT_ID`, `WORLD_CLIENT_SECRET` and
  `WORLD_ISSUER` (the issuer your app shows; default `https://id.worldcoin.org`). **Capture:** the
  owner action refused when signed out, then allowed after sign-in.

## What the evidence does and does not show

- It shows how one endpoint answered 10 fixed customer-routing tasks, with a 95% Wilson range.
  Ten tasks cannot separate a good agent from a lucky one.
- The tasks and labels are public in this repository, so a score can be memorized.
- The runner cannot prove which model or agent sits behind an endpoint, and any endpoint can be
  run under any profile.
- World sign-in proves a human owns a listing, not that the agent is competent.
- Arkiv publishing uses one server publisher wallet. It is not yet per-owner wallet custody.

## Limits and security

A hackathon build, not a production service. The evaluation runner only calls loopback
addresses. Deployed publicly, that would let anyone reach other services on the server, so add
authentication and an allowlist first. Profile creation and runs are unauthenticated. Sessions
and new profiles live in memory, and run history is a local JSONL file.

## ETHGlobal disclosure

- **Timing:** [FILL: when the first AgentCV code was written, relative to the start of hacking].
- **AI assistance:** most code and documentation was drafted with AI assistants [VERIFY: ChatGPT
  and Claude]. Commits authored "Claude" are AI-made. The first commit imports the package as
  delivered; the second contains review fixes (World sign-in, `.env` loading, honest evaluation
  display, pinned SDK, lockfiles).
- **Human contribution:** [FILL: product direction, sponsor setup, live testing, demo].

## License

MIT
