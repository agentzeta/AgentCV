import crypto from 'node:crypto';

// Transparent task-output evaluations; no model is executed by this module.
export const suites = Object.freeze([
 {id:'classification',name:'Customer request routing',category:'Operations',cases:[
  {id:'c1',input:'I need a refund for a duplicate charge',expected:'billing'},
  {id:'c2',input:'The application crashes at login',expected:'technical'},
  {id:'c3',input:'How do I upgrade my subscription?',expected:'sales'},
  {id:'c4',input:'My invoice has the wrong company name',expected:'billing'},
  {id:'c5',input:'I cannot reset my password',expected:'technical'}]},
 {id:'sentiment',name:'Customer feedback sentiment',category:'Language',cases:[
  {id:'s1',input:'The support team solved my problem quickly',expected:'positive'},
  {id:'s2',input:'The app crashes every time I open it',expected:'negative'},
  {id:'s3',input:'The meeting is scheduled for Friday',expected:'neutral'},
  {id:'s4',input:'I love the new interface',expected:'positive'},
  {id:'s5',input:'This update made everything slower',expected:'negative'}]}
]);
const suitesById=new Map(suites.map(s=>[s.id,s]));
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function getSuite(id){return suitesById.get(id)}
export function publicSuites(){return suites.map(s=>({id:s.id,name:s.name,category:s.category,count:s.cases.length,metric:'exact-match accuracy',cases:s.cases.map(c=>({id:c.id,input:c.input}))}))}
export function evaluateSubmission({agentId,suiteId,outputs,runLabel='',sourceUrl=''},validAgents){
 if(typeof agentId!=='string'||!validAgents.some(a=>a.id===agentId))throw Error('Unknown agent');
 const suite=getSuite(suiteId);if(!suite)throw Error('Unknown evaluation suite');
 if(!Array.isArray(outputs)||outputs.length!==suite.cases.length||outputs.some(x=>typeof x!=='string'||x.length>100))throw Error('Provide one string output per test case');
 if(typeof runLabel!=='string'||runLabel.length>80)throw Error('Invalid run label');
 if(typeof sourceUrl!=='string'||sourceUrl.length>300||sourceUrl&&(!/^https:\/\//.test(sourceUrl)))throw Error('Source URL must be HTTPS');
 const results=suite.cases.map((c,i)=>({caseId:c.id,expected:c.expected,actual:outputs[i].trim().toLowerCase(),pass:outputs[i].trim().toLowerCase()===c.expected}));
 const passed=results.filter(r=>r.pass).length,n=results.length;
 const now=new Date().toISOString();
 const record={id:crypto.randomUUID(),agentId,suiteId,suiteVersion:1,runLabel:runLabel.trim(),sourceUrl,createdAt:now,metric:'exact-match accuracy',passed,total:n,accuracy:passed/n,results,submissionHash:digest({agentId,suiteId,outputs}),evidenceType:'SELF_SUBMITTED_OUTPUTS',executionVerified:false};
 return record;
}
export function wilsonInterval(successes,n,z=1.96){if(!Number.isInteger(n)||n<=0||successes<0||successes>n)throw Error('Invalid counts');const p=successes/n,den=1+z*z/n,center=(p+z*z/(2*n))/den,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return [Math.max(0,center-half),Math.min(1,center+half)];}
export function summarizeAgent(agentId,runs){const matching=runs.filter(r=>r.agentId===agentId);const bySuite=Object.fromEntries([...new Set(matching.map(r=>r.suiteId))].map(id=>{const subset=matching.filter(r=>r.suiteId===id).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));const latest=subset.at(-1);return [id,{latestRunId:latest.id,accuracy:latest.accuracy,passed:latest.passed,total:latest.total,interval95:wilsonInterval(latest.passed,latest.total),runCount:subset.length,latestAt:latest.createdAt,evidenceType:latest.evidenceType,executionVerified:latest.executionVerified===true,evidenceType:latest.evidenceType}]}));return {agentId,runCount:matching.length,suites:bySuite,disclaimer:'Self-submitted outputs scored against public fixtures. No execution or agent identity verification. Intervals describe binomial uncertainty only; cases are not a representative benchmark sample.'};}
