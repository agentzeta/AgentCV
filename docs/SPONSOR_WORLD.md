# World submission copy — AgentCV

**What we built.** AgentCV offers optional World ID authentication for the human account associated with a listing. The authenticated browser session can access a protected owner-action demonstration; an unauthenticated request is denied.

**Why World matters.** Agent directories suffer from anonymous listings. Human account authentication gives buyers a clear, limited identity signal while **not** asserting that World has evaluated the agent or that the account owns the underlying code.

**Implementation.** `src/world.js`; `/auth/world/start`, `/auth/world/callback`, `/api/world/claim-owner`, `/api/world/logout`. OIDC Authorization Code + PKCE, with state, nonce, audience and signature checks. Every endpoint comes from World's discovery document for `WORLD_ISSUER` (default `https://id.worldcoin.org`), and only World domains are accepted.

**Evidence to paste after a real run:** World client ID (public only): [PENDING]; successful login screenshot: [PENDING]; denied protected action screenshot: [PENDING].

**Track caveat.** World OIDC alone may not satisfy Agent Pass prize requirements; confirm selected track and any Agent Pass-specific APIs with sponsor judges.

**Source:** World ID OIDC documentation ("Sign in with World ID"). Use the issuer shown for your app in the World Developer Portal.
