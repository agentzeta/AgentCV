# AgentCV demo script (v1.4, about 1:30)

A captioned recording of this exact flow exists (offline cut, no sponsor credentials). For the
live cut, replace the 0G, Arkiv and World shots with the real evidence listed in the README.

| Time | On screen | Voiceover |
|---|---|---|
| 0:00 | Title, then the problem | "Agent directories tell you what an AI agent claims. AgentCV shows you what it actually did." |
| 0:09 | Discover; search "support" | "Every profile is the builder's own description. Search by skill or use case." |
| 0:19 | AI Matchmaker | "Describe the job. With 0G configured, a 0G model ranks agents, and it can only return agents in the directory. Offline, a labelled keyword fallback runs instead." |
| 0:31 | Relay Support profile | "A profile is a claim. So let's test it." |
| 0:35 | Evidence: 10/10 with its range | "Ten fixed routing tasks over HTTP, every answer recorded. Ten out of ten, range 72 to 100 percent. This example agent is a keyword script written for these tasks: it shows the mechanics, not competence." |
| 0:51 | Second endpoint: 4/10 | "Same tasks, a different agent: four out of ten, every failure visible." |
| 0:59 | Replay and history | "Replay reruns the same benchmark version and links the runs." |
| 1:08 | Publish; World panel | "Publishing to Arkiv makes a public, expiring, wallet-owned listing. World sign-in proves a human owns it, not that the agent is good." |
| 1:18 | Sponsor panel | Say exactly which sponsors are live in this recording. |
| 1:23 | Close | "AgentCV: discover, evaluate, compare." |

Setup: `npm start`, `npm run agent:example`, `npm run agent:baseline`, open
`http://127.0.0.1:3000/demo`, and delete `data/eval-runs.jsonl` for a clean history. Never show
`.env` or keys.
