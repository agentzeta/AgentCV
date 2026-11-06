// Compiles EvalAttestationRegistry.sol and exercises it on an in-process EVM:
// deploy, attest, read back, and both revert guards. No external node or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { VM } from '@ethereumjs/vm';
import { LegacyTransaction } from '@ethereumjs/tx';
import { Account, Address, privateToAddress } from '@ethereumjs/util';
import { keccak256, encodeFunctionData, decodeFunctionResult, toHex, hexToBytes, bytesToHex } from 'viem';
import solc from 'solc';

const SOL = fileURLToPath(new URL('../contracts/EvalAttestationRegistry.sol', import.meta.url));

function compile() {
  const input = {
    language: 'Solidity',
    sources: { 'c.sol': { content: readFileSync(SOL, 'utf8') } },
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'shanghai', outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
  };
  const out = JSON.parse(solc.compile(JSON.stringify(input)));
  const errs = (out.errors || []).filter((e) => e.severity === 'error');
  assert.equal(errs.length, 0, errs.map((e) => e.formattedMessage).join('\n'));
  const c = out.contracts['c.sol'].EvalAttestationRegistry;
  return { abi: c.abi, bytecode: '0x' + c.evm.bytecode.object };
}

const PK = hexToBytes('0x' + '11'.repeat(32));
const AGENT = '0x00000000000000000000000000000000000a9e71';

async function deploy() {
  const { abi, bytecode } = compile();
  const sender = new Address(privateToAddress(PK));
  const vm = await VM.create();
  await vm.stateManager.putAccount(sender, Account.fromAccountData({ balance: 10n ** 20n }));
  let nonce = 0n;
  const send = async (data, to) => {
    const tx = LegacyTransaction.fromTxData({ nonce: nonce++, gasLimit: 3_000_000n, gasPrice: 10n, data: hexToBytes(data), ...(to ? { to } : {}) }).sign(PK);
    return vm.runTx({ tx });
  };
  const dep = await send(bytecode);
  assert.ok(!dep.execResult.exceptionError, 'deploy reverted');
  const addr = dep.createdAddress;
  const view = async (fn, args) => {
    const r = await vm.evm.runCall({ to: addr, caller: sender, data: hexToBytes(encodeFunctionData({ abi, functionName: fn, args })), gasLimit: 5_000_000n });
    assert.ok(!r.execResult.exceptionError, `${fn} reverted`);
    return decodeFunctionResult({ abi, functionName: fn, data: bytesToHex(r.execResult.returnValue) });
  };
  const attest = (runId, passed, total) => send(encodeFunctionData({ abi, functionName: 'attest', args: [runId, AGENT, keccak256(toHex('payload')), passed, total, 'ipfs://demo'] }), addr);
  return { abi, bytecode, addr, sender, view, attest };
}

test('contract compiles to non-trivial bytecode with the expected ABI', () => {
  const { abi, bytecode } = compile();
  const fns = abi.filter((x) => x.type === 'function').map((x) => x.name).sort();
  assert.deepEqual(fns, ['attest', 'count', 'getAttestation', 'isAttested']);
  assert.ok(abi.some((x) => x.type === 'event' && x.name === 'Attested'));
  assert.ok(abi.some((x) => x.type === 'error' && x.name === 'AlreadyAttested'));
  assert.ok(bytecode.length > 1000);
});

test('deploy, attest, and read the attestation back', async () => {
  const { addr, view, attest } = await deploy();
  assert.ok(addr, 'has a deployed address');
  const runId = keccak256(toHex('run-1'));
  const r = await attest(runId, 9, 10);
  assert.equal(r.execResult.logs.length, 1, 'emits exactly one Attested event');
  const got = await view('getAttestation', [runId]);
  assert.equal(Number(got.passed), 9);
  assert.equal(Number(got.total), 10);
  assert.equal(got.resultHash, keccak256(toHex('payload')));
  assert.equal(got.uri, 'ipfs://demo');
  assert.equal(await view('isAttested', [runId]), true);
  assert.equal(await view('isAttested', [keccak256(toHex('never'))]), false);
  assert.equal(Number(await view('count', [])), 1);
});

test('a run can only be attested once', async () => {
  const { attest } = await deploy();
  const runId = keccak256(toHex('run-2'));
  assert.ok(!(await attest(runId, 5, 10)).execResult.exceptionError);
  const second = await attest(runId, 5, 10);
  assert.ok(second.execResult.exceptionError, 'second attestation of the same run reverts');
});

test('passed greater than total is rejected', async () => {
  const { attest } = await deploy();
  const r = await attest(keccak256(toHex('run-3')), 11, 10);
  assert.ok(r.execResult.exceptionError, 'invalid score reverts');
});

test('total of zero is rejected', async () => {
  const { attest } = await deploy();
  const r = await attest(keccak256(toHex('run-4')), 0, 0);
  assert.ok(r.execResult.exceptionError, 'zero total reverts');
});
