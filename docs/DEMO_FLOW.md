# Judge demo flow and contingency tree

1. **Directory** → search an agent → open its evaluation history.
2. **Evaluation** → local example agent starts on 127.0.0.1:4100 → 10 HTTP tasks → observed outputs → run ID → replay.
3. **Arkiv** → publish public listing using demo publisher wallet → display tx hash/entity key → query it back. If testnet unavailable, show local listing only and explicitly mark Arkiv unverified.
4. **0G** → describe hiring task → real model recommends only listed IDs → show provider request ID. If unavailable, use labeled offline fallback.
5. **World** → authenticate owner through OIDC → protected owner action succeeds → log out → same action is rejected. If credentials unavailable, show route code and mark integration unverified.

**Time budget:** 35 s directory, 55 s eval, 35 s Arkiv, 35 s 0G, 30 s World, 10 s close.

**Claims:** The runner executes HTTP requests, not arbitrary code. Its benchmark is small and potentially learnable. No independent claim of model identity, certification, unbiased agent rankings or third-party safety.
