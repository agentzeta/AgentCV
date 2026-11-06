# Independent evaluation runner (v1.2)

This feature executes a *real HTTP agent* against 10 fixed customer-routing tasks (public in this repository, so scores can be memorized). Unlike the self-submitted evaluation mode, the runner itself issues each task, receives the response, computes exact-match scores, and persists case-level inputs, outputs, errors, elapsed milliseconds, a benchmark fixture SHA-256, runner version, endpoint, timestamp, manifest digest and output digest. All 10 cases are scored, including failures. Scores do not measure agent safety or broad competence.

## Run locally

```bash
npm install
npm test
npm run agent:example  # terminal A; illustrative rules-based agent
npm start               # terminal B
```

Open http://localhost:3000, choose an agent in Evidence & Evals, use `http://127.0.0.1:4100/task` and click **Execute independent evaluation**. Copy the run ID into the replay field and click **Replay**. The example agent is rule-based, not an LLM. For your own agent, expose a local HTTP endpoint accepting `POST {"task":"...","taskId":"..."}` and returning `{ "output":"billing" }`, `technical`, or `sales`.

## Reproducibility

`GET /api/evals/runs?agentId=...` returns recorded evidence and manifest. `POST /api/evals/independent/replay` with `{ "runId":"..." }` executes the same benchmark version against the recorded endpoint and stores a new run with `replayOf`. Replay compares outputs and scores but cannot guarantee deterministic results. To reproduce the *same software*, additionally pin and independently preserve the evaluated agent's commit/container digest and runtime configuration. The current runner does not attest them.

## Security and validity limits

- Endpoints are restricted to HTTP loopback; do not expose this server to the public internet. The HTTP runner is a demonstration tool, not a secure untrusted-code sandbox.
- The benchmark remains undisclosed through the metadata endpoint until execution, but case labels and inputs are returned in run records. It is not secret after a run and must not be marketed as contamination-proof.
- The runner observes an HTTP response; it cannot prove the agent binary, weights, deployment identity, independence of its operator, or resistance to test memorization.
- Only one process should write the JSONL store. No database transactions, access control or rate limits are provided. Running a publicly exposed service would enable resource exhaustion and benchmark extraction.
- The current UI lists all stored runs. Use synthetic tasks and no secrets. For enterprise use: add authentication, per-user permissions, a task queue, containerized sandboxing, private held-out pools, secret handling, external provenance and controlled publication.
- Results from self-submitted and runner-observed modes must not be pooled into a single unqualified trust score.
