import test from 'node:test';
import assert from 'node:assert/strict';
import { keccak256, stringToHex, zeroAddress } from 'viem';
import { canonicalPayload, buildAttestation } from '../src/attest.js';

const run = { id: 'run-xyz', suiteId: 'routing', suiteVersion: '1', passed: 9, total: 10, outputDigest: 'abc', manifestDigest: 'def' };

test('canonical payload is stable and omits volatile fields', () => {
  const a = canonicalPayload({ ...run, createdAt: 1, results: [1, 2] });
  const b = canonicalPayload({ ...run, createdAt: 999, results: [3] });
  assert.equal(a, b, 'timestamps and raw results do not change the committed hash');
  assert.ok(!a.includes('createdAt'));
});

test('buildAttestation hashes the run id and payload and defaults the agent to zero', () => {
  const at = buildAttestation(run);
  assert.equal(at.runIdHash, keccak256(stringToHex('run-xyz')));
  assert.equal(at.resultHash, keccak256(stringToHex(canonicalPayload(run))));
  assert.equal(at.agent, zeroAddress);
  assert.equal(at.passed, 9);
  assert.equal(at.uri, 'agentcv://run/run-xyz');
});

test('a valid agent address is kept; an invalid one falls back to zero', () => {
  assert.equal(buildAttestation(run, { agent: '0x00000000000000000000000000000000000a9e71' }).agent, '0x00000000000000000000000000000000000a9e71');
  assert.equal(buildAttestation(run, { agent: 'not-an-address' }).agent, zeroAddress);
});

test('an invalid score is rejected before it reaches the chain', () => {
  assert.throws(() => buildAttestation({ ...run, passed: 11, total: 10 }));
  assert.throws(() => buildAttestation({ ...run, total: 0 }));
});
