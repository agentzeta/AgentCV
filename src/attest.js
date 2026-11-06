import { EvalStore } from './eval-store.js';
import { keccak256, stringToHex, isAddress, zeroAddress } from 'viem';

// Canonical, stable payload that an on-chain attestation commits to. Binds the attestation to
// the exact run and its recorded outputs (outputDigest) and benchmark (manifestDigest).
export function canonicalPayload(run) {
  return JSON.stringify({
    id: run.id,
    suiteId: run.suiteId,
    suiteVersion: run.suiteVersion,
    passed: run.passed,
    total: run.total,
    outputDigest: run.outputDigest,
    manifestDigest: run.manifestDigest,
  });
}

// Pure: turn a run record into the arguments EvalAttestationRegistry.attest expects.
export function buildAttestation(run, { agent, uri } = {}) {
  if (!run || !run.id) throw new Error('run not found');
  if (!(run.total > 0) || run.passed > run.total) throw new Error('run has an invalid score');
  const agentAddr = agent && isAddress(agent) ? agent : zeroAddress;
  return {
    runId: run.id,
    runIdHash: keccak256(stringToHex(run.id)),
    agent: agentAddr,
    resultHash: keccak256(stringToHex(canonicalPayload(run))),
    passed: run.passed,
    total: run.total,
    uri: uri || `agentcv://run/${run.id}`,
  };
}

// Async: load a run by id from the eval store and build its attestation.
export async function attestationFor(runId, { storePath, agent, uri } = {}) {
  const file = storePath || process.env.EVAL_STORE_PATH || 'data/eval-runs.jsonl';
  const runs = await new EvalStore(file).all();
  const run = runs.find((r) => r.id === runId);
  if (!run) throw new Error(`no run ${runId} in ${file}`);
  return buildAttestation(run, { agent: agent || process.env.ATTEST_AGENT, uri: uri || process.env.ATTEST_URI });
}
