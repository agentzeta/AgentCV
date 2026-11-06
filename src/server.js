import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {agents,searchAgents,normalizeAgent} from './catalog.js';
import {matchOn0G,shortlistFallback} from './og.js';
import {publishProfile,readProfiles} from './arkiv.js';
import {startWorld,finishWorld} from './world.js';
import {publicSuites,evaluateSubmission,summarizeAgent} from './evals.js';
import {EvalStore} from './eval-store.js';
import {benchmarkMetadata,executeIndependentRun,replayRun} from './independent-runner.js';
// Load .env if present (Node >= 20.12 built-in); real environment variables take precedence.
try{process.loadEnvFile()}catch{}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const sessions=new Map(),attempts=new Map(),community=[];
const evalStore=new EvalStore(process.env.EVAL_STORE_PATH||path.resolve(process.cwd(),'data/eval-runs.jsonl'));
const cookie=(req)=>Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2));
function session(req,res){let id=cookie(req).agentcv;let s=id&&sessions.get(id);if(!s){id=crypto.randomBytes(32).toString('hex');s={created:Date.now(),world:null};sessions.set(id,s);res.setHeader('Set-Cookie',`agentcv=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${process.env.BASE_URL?.startsWith('https:')?'; Secure':''}`)}return {id,s};}
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));}
async function body(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>16000)throw Error('Request too large')}return JSON.parse(data||'{}')}
export function createServer(){return http.createServer(async(req,res)=>{res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'");const url=new URL(req.url,'http://localhost');const {id,s}=session(req,res);try{
if(req.method==='GET'&&url.pathname==='/api/agents'){return json(res,200,{agents:searchAgents(url.searchParams.get('q')||'',url.searchParams.get('category')||'All',[...agents,...community])})}
if(req.method==='GET'&&url.pathname==='/api/evals/independent/benchmark'){return json(res,200,benchmarkMetadata())}
if(req.method==='POST'&&url.pathname==='/api/evals/independent/run'){
 const b=await body(req);const run=await executeIndependentRun(b,[...agents,...community]);await evalStore.add(run);return json(res,201,{run});}
if(req.method==='POST'&&url.pathname==='/api/evals/independent/replay'){
 const b=await body(req);const prior=(await evalStore.all()).find(r=>r.id===b.runId&&r.evidenceType==='INDEPENDENT_HTTP_EXECUTION');if(!prior)return json(res,404,{error:'Independent run not found'});
 const run=await replayRun(prior,[...agents,...community]);run.replayOf=prior.id;await evalStore.add(run);return json(res,201,{run,previousAccuracy:prior.accuracy});}
if(req.method==='GET'&&url.pathname==='/api/evals/suites'){return json(res,200,{suites:publicSuites()})}
if(req.method==='GET'&&url.pathname==='/api/evals/runs'){const agentId=url.searchParams.get('agentId');const all=await evalStore.all();const selected=agentId?all.filter(r=>r.agentId===agentId):all;return json(res,200,{runs:selected.slice(-100).reverse(),count:selected.length})}
if(req.method==='GET'&&url.pathname==='/api/evals/summary'){const agentId=url.searchParams.get('agentId');if(!agentId)return json(res,400,{error:'agentId required'});return json(res,200,summarizeAgent(agentId,await evalStore.all()))}
if(req.method==='POST'&&url.pathname==='/api/evals/runs'){const payload=await body(req);const record=evaluateSubmission(payload,[...agents,...community]);await evalStore.add(record);return json(res,201,{run:record,disclaimer:'Self-submitted outputs, not independently executed or verified'})}
if(req.method==='GET'&&url.pathname==='/api/status'){return json(res,200,{arkivConfigured:!!process.env.ARKIV_PRIVATE_KEY,worldConfigured:!!process.env.WORLD_CLIENT_ID,ogConfigured:!!process.env.OG_API_KEY,worldAuthenticated:!!s.world,worldSubject:s.world?`${s.world.sub.slice(0,9)}…`:null})}
if(req.method==='POST'&&url.pathname==='/api/match'){const b=await body(req);const task=String(b.task||'').trim();if(!task||task.length>1200)return json(res,400,{error:'Enter a task up to 1200 characters'});if(!process.env.OG_API_KEY)return json(res,503,{error:'0G is not configured; use the local demo suggestions',fallback:shortlistFallback(task,[...agents,...community])});const result=await matchOn0G(task,[...agents,...community]);return json(res,200,result)}
if(req.method==='POST'&&url.pathname==='/api/demo-match'){const b=await body(req);return json(res,200,{recommendations:shortlistFallback(String(b.task||''),[...agents,...community]),provider:'LOCAL DEMO — NOT 0G'})}
if(req.method==='POST'&&url.pathname==='/api/agents'){const a=normalizeAgent(await body(req));community.push(a);return json(res,201,{agent:a,persistence:'local server memory only'})}
if(req.method==='POST'&&url.pathname==='/api/arkiv/publish'){const b=await body(req);const a=[...agents,...community].find(x=>x.id===b.id);if(!a)return json(res,404,{error:'Agent not found'});if(!process.env.ARKIV_PRIVATE_KEY)return json(res,503,{error:'Arkiv not configured'});if(!process.env.ADMIN_PUBLISH_TOKEN||req.headers['x-admin-publish-token']!==process.env.ADMIN_PUBLISH_TOKEN)return json(res,403,{error:'Admin publish token required to spend testnet gas'});const result=await publishProfile(a);return json(res,200,result)}
if(req.method==='GET'&&url.pathname==='/api/arkiv/profiles'){try{return json(res,200,{profiles:await readProfiles()})}catch(e){return json(res,503,{error:`Arkiv unavailable: ${e.message}`})}}
if(req.method==='GET'&&url.pathname==='/auth/world/start'){let attempt;try{attempt=await startWorld()}catch(e){res.writeHead(302,{Location:'/demo?world=failed','Cache-Control':'no-store'});return res.end()}attempts.set(id,attempt);res.writeHead(302,{Location:attempt.url,'Cache-Control':'no-store'});return res.end()}
if(req.method==='GET'&&url.pathname==='/auth/world/callback'){const attempt=attempts.get(id);attempts.delete(id);try{s.world=await finishWorld(Object.fromEntries(url.searchParams),attempt);res.writeHead(302,{Location:'/?world=success'});return res.end()}catch(e){res.writeHead(302,{Location:'/?world=failed'});return res.end()}}
if(req.method==='POST'&&url.pathname==='/api/world/logout'){s.world=null;return json(res,200,{ok:true})}
if(req.method==='POST'&&url.pathname==='/api/world/claim-owner'){if(!s.world)return json(res,403,{error:'World authentication required'});return json(res,200,{ok:true,ownerVerifiedByWorld:true,scope:'This browser session only; not a verified agent credential'})}
if(req.method==='GET'&&(url.pathname==='/demo'||url.pathname==='/demo/'||url.pathname.startsWith('/react/'))){
 const rel=url.pathname==='/demo'||url.pathname==='/demo/'?'index.html':url.pathname.slice('/react/'.length);
 if(rel.includes('..')||rel.startsWith('/'))return json(res,403,{error:'Invalid path'});
 try{const file=path.resolve(root,'react',rel);if(!file.startsWith(path.resolve(root,'react')+path.sep))return json(res,403,{error:'Invalid path'});
 const contents=await fs.readFile(file);const ext=path.extname(file);
 res.writeHead(200,{'Content-Type':ext==='.html'?'text/html; charset=utf-8':ext==='.js'?'text/javascript; charset=utf-8':ext==='.css'?'text/css; charset=utf-8':ext==='.svg'?'image/svg+xml':'application/octet-stream'});return res.end(contents)
 }catch{return json(res,404,{error:'React build missing. Run npm run build:frontend'})}}
if(req.method==='GET'&&(url.pathname==='/'||['/app.js','/styles.css'].includes(url.pathname))){const file=url.pathname==='/'?'index.html':url.pathname.slice(1);const contents=await fs.readFile(path.join(root,file));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8'});return res.end(contents)}return json(res,404,{error:'Not found'});
}catch(e){return json(res,e.message==='Request too large'?413:400,{error:String(e.message).slice(0,250)})}})}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){createServer().listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log(`AgentCV http://localhost:${process.env.PORT||3000}`))}
