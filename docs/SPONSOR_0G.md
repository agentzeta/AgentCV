# 0G submission copy — AgentCV

**What we built.** The AgentCV AI Matchmaker takes a natural-language task and recommends up to three existing agents by calling a 0G Private Computer model through its Router API. Recommendations are validated against the actual directory to reject invented IDs.

**Why 0G matters.** 0G provides the live inference for semantic task-to-agent matching, a primary user feature distinct from the offline keyword demo. The API request includes only public profile descriptions and the user's submitted task.

**Implementation.** `src/og.js`; `POST /api/match`; `OG_API_KEY`, `OG_MODEL`, `OG_TRUST_MODE`. The response ID is displayed; it is not claimed to be a verified hardware attestation.

**Evidence to paste after a real run:** 0G model: [PENDING]; request ID: [PENDING]; trust mode: [PENDING]; live response screenshot: [PENDING].

**Source:** https://build.0g.ai/compute
