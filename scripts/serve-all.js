// One-process start for a hosted demo: the web app plus the two local demo agents the
// evaluation runner calls (the runner only reaches loopback addresses, so the agents must run
// on the same machine). Used by `npm run start:deploy` and render.yaml.
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url));
const kids=['example-agent.js','baseline-agent.js'].map(f=>spawn(process.execPath,[path.join(here,f)],{stdio:'inherit'}));
const stop=()=>{for(const k of kids)k.kill();process.exit(0)};
process.on('SIGTERM',stop);process.on('SIGINT',stop);
process.env.HOST??='0.0.0.0';
const {createServer}=await import('../src/server.js');
const port=Number(process.env.PORT||3000);
createServer().listen(port,process.env.HOST,()=>console.log(`AgentCV on ${process.env.HOST}:${port} (open /demo); demo agents on 127.0.0.1:4100 and :4101`));
