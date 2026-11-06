import {agents} from '../src/catalog.js';import {publishProfile} from '../src/arkiv.js';
const id=process.argv[2]||'atlas';const profile=agents.find(x=>x.id===id);if(!profile)throw Error('Unknown agent ID');console.log(await publishProfile(profile));
