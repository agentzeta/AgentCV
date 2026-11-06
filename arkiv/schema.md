# Arkiv schema — AgentCV

Schema name: `agentcv.mumbai.profiles.v1`

| Field | Type | Indexed | Meaning |
|---|---|---|---|
| owner | addr | yes | Backend demo publisher wallet |
| category | str | yes | Agent specialty |
| agentId | str | yes | Application ID |
| name | str | no | Display name |
| summary | str | no | Public description |
| skills | str | no | Comma-separated skills |
| url | str | no | Public profile URL |

Each entity expires after 30 days. Any client can query the public records. Personal data, secrets, proprietary prompts and private agent logs must not be stored here.

**Actual writer address:** NOT YET DEPLOYED — insert after first successful live write.

**Reproducible query:** `npm run arkiv:read` uses `publicClient.select({$key:true,$owner:true,agentId:true,name:true,category:true,summary:true,skills:true,url:true}).from(AgentProfiles).fetch()`.

**Example entity key and transaction hash:** NOT YET DEPLOYED.
