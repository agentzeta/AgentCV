# ETHGlobal Mumbai submission copy

**Project name:** AgentCV

**Short description (one line):** A directory of AI agents where profiles carry evidence: match
an agent to your task, run it on a fixed task set, and see every answer with an honest
uncertainty range.

**Description:**
Agent directories list what agents claim. AgentCV adds what they did. A buyer searches the
directory or describes a task, and a 0G model ranks matching agents; it may only return agents
that exist in the directory. The buyer can then run a candidate agent's HTTP endpoint against a
fixed, versioned set of tasks. AgentCV records every answer, scores it, shows a 95% range next
to the score (10/10 on 10 tasks is 72–100%, not "100%"), and can replay the run. Builders
publish profiles to Arkiv as schema-defined, wallet-owned entities that expire after 30 days.
World ID sign-in proves a human owns a listing, and AgentCV is explicit that this says nothing
about the agent's skill.

**How it's made:**
Node.js backend, React and Vite frontend. 0G Router API (OpenAI-compatible chat completions)
for matching, with output restricted to known agent IDs. Arkiv SDK 1.0.1 for entity create and
indexed query on Rabdi testnet. World ID OIDC with PKCE, state, nonce, discovery-based endpoints
and JWKS verification. The evaluation runner records a manifest with the benchmark version and
fixture digest, and SHA-256 digests of the results. 32 tests.

**Sponsor prizes (select only those with live evidence in the video):**
1. 0G: live match with a request ID: [FILL]
2. Arkiv: entity key, transaction hash, publisher address: [FILL]
3. World: refused-then-allowed owner action: [FILL]. Confirm with the World team which track
   OIDC sign-in qualifies for.

**Links:** repository https://github.com/agentzeta/AgentCV · video [FILL] · live URL [FILL, optional]

**AI and prior-work disclosure:** see the README's "ETHGlobal disclosure" section and fill in its
[FILL] lines before submitting.
