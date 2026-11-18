import {generateKeyPairSync} from 'node:crypto';
import {configurationDigest,signEvidence,inspectEvidence} from '../src/evidence-passport.js';
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const config={agentId:'relay',deploymentId:'demo-v1',controllerKeyId:'demo-owner',modelId:'script',modelVersion:'1',codeDigest:'a'.repeat(64),harnessDigest:'b'.repeat(64),memoryPolicyDigest:'c'.repeat(64),toolsDigest:'d'.repeat(64)};
const now=Date.now();
const payload={id:'demo-evaluation',runId:'run-1',subjectDigest:configurationDigest(config),suiteId:'routing',suiteVersion:'1',fixtureDigest:'e'.repeat(64),outputDigest:'f'.repeat(64),passed:8,total:10,issuedAt:now-1000,expiresAt:now+60000,evidenceType:'RUNNER_OBSERVED'};
const envelope=signEvidence(payload,'demo-evaluator',privateKey);
const inspect=c=>inspectEvidence({configuration:c,envelopes:[envelope],trustedKeys:{'demo-evaluator':publicKey.export({type:'spki',format:'pem'})},revocations:{asOf:now-1000,validUntil:now+60000,ids:[]},now});
console.log(JSON.stringify({mode:'SYNTHETIC_DEMO',unchanged:inspect(config),memoryPolicyChanged:inspect({...config,memoryPolicyDigest:'0'.repeat(64)})},null,2));
