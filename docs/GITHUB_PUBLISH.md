# GitHub publication and deployment

1. Unzip and `cd agentcv`.
2. `npm install && npm test && npm start`.
3. Create an empty public repo at https://github.com/new named `agentcv-mumbai`.
4. Run:

```bash
git init
git add .
git commit -m "Build AgentCV directory and sponsor adapters"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/agentcv-mumbai.git
git push -u origin main
```

5. Verify `.env` and private keys are absent from the repo. Never paste secrets into GitHub issues or demo video.
6. For deployment, create a Node.js web service on Render/Railway/Fly or another Node 22-compatible host. Build command `npm ci`; start command `npm start`; set `BASE_URL` to your HTTPS URL. Configure World callback URL to `https://YOUR_DOMAIN/auth/world/callback` and set matching `WORLD_REDIRECT_URI`.
7. Add sponsor API keys only in hosting provider secret/environment settings. Fund only a dedicated testnet wallet for Arkiv.
8. Run each sponsor's live happy and failure paths. Add actual Arkiv transaction and 0G request ID to README and the submission. Do not publish unverified placeholders as evidence.
9. Add demo video URL, live URL and team contacts to ETHGlobal submission.

**Important:** GitHub publishing is not deployment. Creating the repo does not produce a live app URL. Avoid a single giant late commit if ETHGlobal expects development progression; do not fabricate commits or dates.
