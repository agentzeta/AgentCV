# AI usage (ETHGlobal attribution)

ETHGlobal asks teams to document where and how AI was used. This is that record.

| Commit | Files | Tool | Human role |
|---|---|---|---|
| Import AgentCV v1.0 | everything in that commit: `src/`, `public/`, `scripts/`, `tests/`, `docs/`, `arkiv/`, `README.md`, `.env.example`, `.github/` | [VERIFY: AI assistant used, e.g. ChatGPT] | Chose the product and the three sponsors; directed scope; reviewed |
| Import AgentCV v1.4 | added `src/evals.js`, `src/eval-store.js`, `src/independent-runner.js`, `frontend/`, `scripts/*-demo.js`, `scripts/example-agent.js`, `docs/*` updates, `tests/evals.test.js`, `tests/independent-runner.test.js` | [VERIFY: same assistant] | Asked for evaluation-backed resumes and the React demo; reviewed |
| Review fixes | `src/world.js`, `src/og.js`, `src/server.js`, `src/independent-runner.js`, `frontend/src/main.jsx`, `scripts/baseline-agent.js`, `scripts/*arkiv.js`, `tests/catalog.test.js`, `package.json`, lockfiles, CI, `README.md`, `docs/DEMO_SCRIPT.md`, `docs/SUBMISSION.md` | Claude (Anthropic) | Requested an adversarial code review; approved the fixes |
| Sponsor documentation | `README.md` (sponsor section), this file | Claude (Anthropic) | Requested |

**Human work to record before submitting** (judges look for meaningful human contribution):

- [FILL: live sponsor setup: World app registration, Arkiv wallet funding, 0G key]
- [FILL: debugging you did on the live integrations, and what you changed]
- [FILL: product decisions, e.g. why evaluation-backed resumes, why these three sponsors]
- [FILL: the demo video, narrated in your own voice]

**Prompts and specs:** `docs/PRD.md` is the product spec. [FILL: add the prompts you gave the AI
tools to `docs/prompts/`, as ETHGlobal asks for planning artifacts when AI is used.]
