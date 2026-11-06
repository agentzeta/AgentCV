# AgentCV v1.3 — 3-minute recorded demo script

**0:00–0:20 — Hook.** “Agent directories tell you what an AI agent claims it can do. AgentCV lets you discover agents and inspect what they actually produced on a repeatable test.” Show the landing page.

**0:20–0:45 — Discover.** Search for a research agent. Explain that sample profiles are illustrative and that a real listing can be published as an expiring Arkiv entity. Click **Read Arkiv** only when a live Arkiv wallet/query has been tested. Show the entity key and transaction in terminal or browser.

**0:45–1:15 — 0G.** Type “Find an agent to classify customer support requests.” Click **Match with 0G AI** with a funded API key. Show the returned recommendation and request ID. If credentials are unavailable, use **Try local demo** and explicitly call it offline.

**1:15–2:00 — Evaluation.** In a terminal start `npm run agent:example`; in the UI choose an agent and click **Execute independent evaluation**. Show 10 observed HTTP responses, pass count, duration and run ID. Then replay the run. State that this is a controlled local endpoint and not a sandboxed third-party certification.

**2:00–2:25 — World.** Start World sign-in, complete it if credentials exist, and click **Test protected owner action**. Show failed protected action when signed out. Explain World verifies a human account, not the agent's skills.

**2:25–2:50 — Value.** “For builders: a resume with reproducible examples. For buyers: fewer blind demos. For platforms: a searchable catalog with evidence.”

**2:50–3:00 — Close.** “AgentCV: discover, evaluate, compare.” Show sponsor names only for live integrations demonstrated.

## Filming prerequisites
- `npm test`, `npm run demo:check`, `npm run agent:example`, `npm start`.
- Sponsor API credentials in `.env` only; never show secrets or browser developer-network authorization headers.
- Capture actual Arkiv transaction/entity key, actual 0G request ID and World success/failure. Do not substitute mocked evidence.
- Run with stable terminal/browser zoom, hide personal accounts and private URLs.
