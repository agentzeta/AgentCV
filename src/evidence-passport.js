// Evidence inspection only. Does not authorize execution or attest a remote runtime.
import {createHash, createPublicKey, sign, verify} from 'node:crypto';
import {wilsonInterval} from './evals.js';

const digestPattern = /^[a-f0-9]{64}$/;
const text = (x, name) => {if(typeof x!=='string'||!x.length||x.length>512) throw Error(`Invalid ${name}`);return x;};
export function canonical(value) {
  if(value===null || typeof value==='boolean' || typeof value==='string') return JSON.stringify(value);
  if(typeof value==='number' && Number.isSafeInteger(value)) return JSON.stringify(value);
  if(Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if(value && Object.getPrototypeOf(value)===Object.prototype)
    return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  throw Error('Only plain JSON with safe integer numbers is supported');
}
export const sha256 = value => createHash('sha256').update(canonical(value)).digest('hex');
export function configurationDigest(config) {
  for(const field of ['agentId','deploymentId','controllerKeyId','modelId','modelVersion']) text(config?.[field],field);
  for(const field of ['codeDigest','harnessDigest','memoryPolicyDigest','toolsDigest'])
    if(!digestPattern.test(config?.[field])) throw Error(`Invalid ${field}`);
  if(config.memorySnapshotDigest!==undefined && !digestPattern.test(config.memorySnapshotDigest)) throw Error('Invalid memorySnapshotDigest');
  return sha256(config);
}
export function signEvidence(payload, issuer, privateKey) {
  text(issuer,'issuer');
  const key=createPublicKey(privateKey);
  if(key.asymmetricKeyType!=='ed25519') throw Error('Ed25519 key required');
  const signed={format:'agentcv-evidence-v1',issuer,payload};
  return {...signed,signature:sign(null,Buffer.from(canonical(signed)),privateKey).toString('base64')};
}
export function verifyEvidence(envelope, trustedKeys) {
  try {
    if(envelope?.format!=='agentcv-evidence-v1'||!Object.hasOwn(trustedKeys,envelope.issuer))return false;
    if(typeof envelope.signature!=='string'||!/^([A-Za-z0-9+/]{86}==)$/.test(envelope.signature))return false;
    const key=createPublicKey(trustedKeys[envelope.issuer]);
    if(key.asymmetricKeyType!=='ed25519')return false;
    const signed={format:envelope.format,issuer:envelope.issuer,payload:envelope.payload};
    return verify(null,Buffer.from(canonical(signed)),key,Buffer.from(envelope.signature,'base64'));
  } catch {return false;}
}
function time(value){return Number.isSafeInteger(value)&&value>=0;}
export function inspectEvidence({configuration, envelopes, trustedKeys, revocations, now=Date.now()}) {
  const subjectDigest=configurationDigest(configuration);
  if(!time(now)||!Array.isArray(envelopes)||envelopes.length>1000) throw Error('Invalid inspection input');
  // This is an operator-provided snapshot, not an authenticated revocation network.
  const fresh=revocations && time(revocations.asOf) && time(revocations.validUntil) &&
    revocations.asOf<=now && now<revocations.validUntil && Array.isArray(revocations.ids);
  const rows=[], seen=new Set();
  for(const e of envelopes){
    const p=e?.payload;let state='INVALID';let reason='Invalid signature, issuer or schema';
    if(verifyEvidence(e,trustedKeys) && p && typeof p.id==='string' && typeof p.runId==='string' &&
       digestPattern.test(p.subjectDigest) && typeof p.suiteId==='string' && typeof p.suiteVersion==='string' &&
       digestPattern.test(p.fixtureDigest) && digestPattern.test(p.outputDigest) &&
       Number.isSafeInteger(p.passed)&&Number.isSafeInteger(p.total)&&p.total>0&&p.passed>=0&&p.passed<=p.total &&
       time(p.issuedAt)&&time(p.expiresAt)&&p.issuedAt<p.expiresAt &&
       ['RUNNER_OBSERVED','SELF_REPORTED'].includes(p.evidenceType)) {
      if(p.issuedAt>now){state='FUTURE';reason='Evidence is not yet issued';}
      else if(!fresh){state='STATUS_UNKNOWN';reason='Fresh operator revocation snapshot required';}
      else if(revocations.ids.includes(p.id)){state='REVOKED';reason='Listed in supplied revocation snapshot';}
      else if(now>=p.expiresAt){state='EXPIRED';reason='Evidence expired';}
      else if(p.subjectDigest!==subjectDigest){state='OTHER_CONFIGURATION';reason='Configuration differs; no automatic reputation inheritance';}
      else if(p.evidenceType!=='RUNNER_OBSERVED'){state='SELF_REPORTED';reason='Do not pool with runner-observed evidence';}
      else {state='IN_SCOPE';reason='Signature and declared configuration match; runtime is not attested';}
      const id=e.issuer+'\0'+p.runId;
      if(seen.has(id)){state='DUPLICATE';reason='Issuer/run pair already seen';}else seen.add(id);
    }
    rows.push({id:p?.id??null,issuer:e?.issuer??null,state,reason,
      ...(state==='IN_SCOPE'?{suiteId:p.suiteId,suiteVersion:p.suiteVersion,fixtureDigest:p.fixtureDigest,
        runId:p.runId,issuedAt:p.issuedAt,passed:p.passed,total:p.total,
        interval95:wilsonInterval(p.passed,p.total)}:{})});
  }
  // Keep each issuer/benchmark separate. Never add replayed public fixtures to an effective sample size.
  const latest=new Map();
  for(const row of rows.filter(r=>r.state==='IN_SCOPE')){
    const k=JSON.stringify([row.issuer,row.suiteId,row.suiteVersion,row.fixtureDigest]);
    if(!latest.has(k)||row.issuedAt>latest.get(k).issuedAt)latest.set(k,row);
  }
  return {subjectDigest,configurationAssurance:'DECLARED_NOT_ATTESTED',rows,summaries:[...latest.values()],
    disclaimer:'No execution authority, legal identity, sybil resistance, complete history or universal reputation score. Trusted signers can lie. Wilson intervals require sampling assumptions not established by public fixtures.'};
}
