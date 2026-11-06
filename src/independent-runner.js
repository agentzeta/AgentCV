import crypto from 'node:crypto';
import {readFile} from 'node:fs/promises';
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const benchmark={id:'routing-heldout',version:'2026-11-06.1',name:'Customer routing — 10 fixed tasks',cases:[
{id:'h01',input:'Please reverse the charge that appears twice on my card',expected:'billing'},
{id:'h02',input:'My login page freezes after I enter the verification code',expected:'technical'},
{id:'h03',input:'Can your team show me the enterprise pricing tiers?',expected:'sales'},
{id:'h04',input:'I need a corrected receipt for accounting',expected:'billing'},
{id:'h05',input:'The mobile app keeps closing when I upload a photo',expected:'technical'},
{id:'h06',input:'We would like to purchase ten more licenses',expected:'sales'},
{id:'h07',input:'I was charged after cancelling my plan',expected:'billing'},
{id:'h08',input:'The dashboard is returning a 500 error',expected:'technical'},
{id:'h09',input:'Could you prepare a quote for 200 seats?',expected:'sales'},
{id:'h10',input:'The tax amount on my invoice is incorrect',expected:'billing'}]};
export const RUNNER_VERSION='1.0.0';
export function benchmarkMetadata(){return {id:benchmark.id,version:benchmark.version,name:benchmark.name,count:benchmark.cases.length,metric:'exact-match accuracy',fixtureDigest:hash(benchmark.cases),visibility:'public: the tasks and labels are in this repository, so a score on them can be memorized'}}
function safeUrl(endpoint){const url=new URL(endpoint);if(url.protocol!=='http:'||!['127.0.0.1','localhost','::1','[::1]'].includes(url.hostname)||url.username||url.password||url.hash)throw Error('Only loopback HTTP endpoints are permitted by default');return url.toString()}
function normalizeOutput(data){const value=typeof data==='string'?data:data&&typeof data.output==='string'?data.output:null;if(value===null||value.length>2000)throw Error('Agent response must contain an output string <=2000 characters');return value.trim().toLowerCase()}
export async function executeIndependentRun({agentId,endpoint,runLabel=''},validAgents,{fetchImpl=fetch,now=()=>new Date().toISOString()}={}){
 if(!validAgents.some(a=>a.id===agentId))throw Error('Unknown agent');
 if(typeof runLabel!=='string'||runLabel.length>80)throw Error('Invalid run label');
 const target=safeUrl(endpoint);
 const results=[];const startedAt=now();
 for(const c of benchmark.cases){const started=Date.now();let output=null,error=null;
  try{const response=await fetchImpl(target,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({task:c.input,taskId:c.id}),signal:AbortSignal.timeout(4000),redirect:'error'});
   if(!response.ok)throw Error(`Agent returned HTTP ${response.status}`);
   const raw=await response.text();if(raw.length>4000)throw Error('Agent response too large');
   output=normalizeOutput(JSON.parse(raw));
  }catch(e){error=String(e.message||e).slice(0,180)}
  results.push({caseId:c.id,input:c.input,expected:c.expected,actual:output,pass:output===c.expected,error,elapsedMs:Date.now()-started});
 }
 const passed=results.filter(x=>x.pass).length;
 const manifest={benchmarkId:benchmark.id,benchmarkVersion:benchmark.version,fixtureDigest:hash(benchmark.cases),runnerVersion:RUNNER_VERSION,endpoint:target,requestContract:'POST {task,taskId} => {output}',scoring:'trim + lowercase + exact match',startedAt};
 const record={id:crypto.randomUUID(),agentId,suiteId:benchmark.id,suiteVersion:benchmark.version,runLabel:runLabel.trim(),createdAt:now(),metric:'exact-match accuracy',passed,total:results.length,accuracy:passed/results.length,results,manifest,manifestDigest:hash(manifest),outputDigest:hash(results),evidenceType:'INDEPENDENT_HTTP_EXECUTION',executionVerified:true,verificationScope:'Runner observed HTTP responses from a user-specified local agent endpoint; not proof of model identity, independent hosting or resistance to benchmark memorization.'};
 return record;
}
export async function replayRun(record,validAgents,options={}){if(!record?.manifest?.endpoint)throw Error('Run has no replay manifest');if(record.manifest.runnerVersion!==RUNNER_VERSION||record.manifest.fixtureDigest!==hash(benchmark.cases))throw Error('Runner or benchmark version differs; cannot compare replay');return executeIndependentRun({agentId:record.agentId,endpoint:record.manifest.endpoint,runLabel:`replay:${record.id}`},validAgents,options)}
