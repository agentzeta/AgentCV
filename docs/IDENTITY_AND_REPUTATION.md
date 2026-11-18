# Identity and reputation: inspect the evidence before attaching a score

This extension adds an offline evidence inspector and signed-envelope demo. Run `node scripts/passport-demo.js`. It deliberately does not create a global reputation number or authorize payments.

## Separate claims

| Claim | Present support | Still not established |
| --- | --- | --- |
| Human owner | Existing World browser sign-in | Durable ownership of an agent endpoint |
| Signer | Ed25519 verification against consumer-supplied trusted keys | Legal identity, independence or honesty of evaluator |
| Configuration | Canonical digest of a declared model/code/harness/memory-policy/tool description | Runtime attestation of the endpoint that answered |
| Performance | Signed counts tied to configuration and fixture digests | General competence, safety or unseen-task performance |
| Reputation | Separate per-evaluator, per-benchmark latest observations | Complete history, anti-collusion or sybil resistance |
| Authority | None in this extension | Permission to move money or bind a principal |

The verifier uses operator-supplied trusted keys and a dated revocation snapshot. These must come from trusted administration, not the agent being evaluated. There is no remote status service; a missing or expired snapshot produces STATUS_UNKNOWN. A signed assertion can still be false. The module does not bind the old HTTP runner to a live model or fix the app's existing authentication limitations.

Any configuration change creates a different subject digest. This is conservative exact matching, not a claim that every change invalidates performance. Memory-policy changes are distinguished from an optional memory snapshot. Production evaluation needs an explicit policy for ordinary memory evolution and independently witnessed deployment configuration. That is future work.

Scores are not pooled across issuers or benchmark versions. Replays do not add to a purported independent sample. The latest eligible result per issuer/fixture is shown, including worse results. This cannot prevent a supplier from withholding evidence; completeness requires an independently administered run log and commercial disclosure terms.

## Commercial use

First buyer: an agent marketplace or enterprise procurement team comparing vendors on the same tasks. First deliverable: a paid, bounded evaluation report for one workflow and two declared versions. Charge for evaluator labor, integrations and monitoring; never sell a positive result. Buyer interviews and willingness to pay remain unvalidated.

Future connectors can export the evidence to agent registries. A registry ID, wallet, payment or transaction hash must not silently become a performance endorsement. Uniswap's X-Agent-Info header is analytics-only: https://developers.uniswap.org/docs/trading/swapping-api/start-building/agent-attribution .

This uses standard hashes and Ed25519 signatures. It is not a claim of cryptographic novelty and includes no proprietary deployment-enforcement mechanism. Do not expose the existing demo server publicly without authentication, tenant isolation and a secure evaluation sandbox.
