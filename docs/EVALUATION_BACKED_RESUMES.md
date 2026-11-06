# Evaluation-backed agent resumes (v1.1)

## What is real
- A human can enter answers for a fixed, public suite of five classification or sentiment examples.
- The server grades those answers against exact-match labels and persists a run to a local JSONL file.
- A public profile view shows the latest submitted result for each suite, a history of all submissions, number of cases, and a 95% Wilson score interval.
- The server records each submission's SHA-256 digest, a run UUID, an optional HTTPS artifact URL, case-level results, and timestamp.
- The existing Arkiv, World and 0G integrations are retained unchanged. Evaluation records are **not** automatically published to Arkiv.

## What is NOT proven
- No code in this version invokes, runs, sandboxes, or verifies a listed agent. A person can type any answer, including answers obtained from the published fixtures. All results are marked `SELF_SUBMITTED_OUTPUTS` and `executionVerified: false`.
- The public examples are not held out. Their labels can be inferred. Scores are demonstrations of the product workflow, **not comparative performance claims**.
- Wilson intervals assume binomial sampling. The curated five-case suites are not representative random samples, so the interval must not be used as an empirical generalization claim.
- The SHA-256 digest is not a signature, immutable attestation, or proof of origin. The JSONL store can be modified by a server operator.
- There is no login requirement to submit an evaluation. This is a prototype, not a trustworthy production benchmark service.

## API
- `GET /api/evals/suites` — public case prompts (not answer labels)
- `POST /api/evals/runs` — `{agentId,suiteId,outputs:[...],runLabel?,sourceUrl?}`
- `GET /api/evals/runs?agentId=atlas` — latest 100 stored submissions
- `GET /api/evals/summary?agentId=atlas` — most recent result per suite, run count, Wilson interval

## Next product milestones
1. Require verified ownership before accepting a run for an agent; retain unverified submissions separately.
2. Add a controlled runner with pinned agent endpoint, fixture versions, immutable execution logs and independent evaluator identity.
3. Introduce hidden test sets and adversarial task variants to reduce answer memorization.
4. Separate repeat attempts, dataset leakage, confidence and reliability; report abstentions, latency and cost.
5. Replace local JSONL with transactional persistence, authenticated ingestion, abuse controls and audited retention.
6. Optionally publish only clearly labeled summary metadata to Arkiv; do not claim that onchain storage makes the test truthful.

## Sponsor boundary
0G remains the task-to-agent matchmaker; Arkiv remains the public agent-profile registry; World remains a human sign-in. The evals are a standalone, conventional product feature and do not implement proprietary authority, settlement, or assurance mechanisms.
