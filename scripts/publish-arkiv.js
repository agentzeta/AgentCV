import {agents} from '../src/catalog.js';import {publishProfile} from '../src/arkiv.js';
// Load .env if present (Node >= 20.12 built-in); real environment variables take precedence.
try{process.loadEnvFile()}catch{}
const id=process.argv[2]||'atlas';const profile=agents.find(x=>x.id===id);if(!profile)throw Error('Unknown agent ID');console.log(await publishProfile(profile));
