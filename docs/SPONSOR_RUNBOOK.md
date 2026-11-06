# Going live: sponsors, on-chain attestation, and deploy

Each step is independent. Do the ones whose prize you're entering, capture the evidence, and put
it in the ETHGlobal form. Nothing here runs automatically — all of it needs your keys.

## 0G — AI matchmaking
1. Get a 0G Compute Router API key.
2. In `.env`: `OG_API_KEY=...` and an available `OG_MODEL` (see the 0G Router models page).
3. `npm start`, open `/demo`, run the AI Matchmaker.
4. **Capture:** the result labelled with the 0G model, and the request ID.

## Arkiv — public agent profiles (Rabdi testnet)
1. Get a testnet wallet, test tokens and an access key from hub.arkiv.network.
2. In `.env`: `ARKIV_PRIVATE_KEY`, `ARKIV_ACCESS_KEY`, `ADMIN_PUBLISH_TOKEN`.
3. `npm run arkiv:publish -- relay` then `npm run arkiv:read`.
4. **Capture:** entity key, transaction hash, publisher address, 30-day expiry.

## World — human owner sign-in (OIDC)
1. Register an app in the World Developer Portal; redirect `http://localhost:3000/auth/world/callback`
   (or your deployed URL + `/auth/world/callback`).
2. In `.env`: `WORLD_CLIENT_ID`, `WORLD_CLIENT_SECRET`, `WORLD_ISSUER`, `WORLD_REDIRECT_URI`.
3. On `/demo`, try the owner action signed out (refused), then sign in and retry (allowed).
4. **Capture:** both states. Ask the World team which track plain OIDC sign-in qualifies for.

## On-chain attestation (optional EVM testnet, e.g. Base Sepolia)
Turns a recorded evaluation into a tamper-evident on-chain record.
1. Fund a testnet key (Base Sepolia faucet). In `.env`: `ATTEST_RPC_URL`, `ATTEST_PRIVATE_KEY`,
   `ATTEST_CHAIN_ID`, `ATTEST_EXPLORER`.
2. `npm run attest:deploy` → prints the contract address + explorer link. Set `ATTEST_CONTRACT`.
3. Run an evaluation in the app, copy its run id, then `npm run attest -- <runId>`.
4. **Capture:** the attestation transaction on the block explorer.

## Deploy the whole demo (finalist requirement: a public link)
Render runs the app and the two demo agents in one service (the eval runner only calls loopback,
so the agents must be co-located):
1. [render.com](https://render.com) → New → Blueprint → pick `agentzeta/AgentCV` → Apply.
2. Open `https://<service>.onrender.com` (lands on the demo).
3. Add any sponsor keys above in the service's Environment tab; set `WORLD_REDIRECT_URI` to the
   Render URL + `/auth/world/callback`. Free plan sleeps when idle — open it before recording.
