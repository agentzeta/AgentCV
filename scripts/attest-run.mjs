// Attest one recorded evaluation run on-chain. Reads the run from the eval store, hashes its
// canonical payload, and calls attest() on the deployed registry. Prints the tx + explorer link.
//   ATTEST_RPC_URL=... ATTEST_PRIVATE_KEY=... ATTEST_CONTRACT=0x... node scripts/attest-run.mjs <runId>
import { readFileSync } from 'node:fs';
import { createWalletClient, createPublicClient, http, keccak256, toHex, stringToHex, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { attestationFor } from '../src/attest.js';
try { process.loadEnvFile('.env.x402'); } catch {}
try { process.loadEnvFile(); } catch {}
const { ATTEST_RPC_URL: rpc, ATTEST_PRIVATE_KEY: pk, ATTEST_CONTRACT: addr, ATTEST_EXPLORER: explorer } = process.env;
const runId = process.argv[2];
if (!rpc || !pk || !addr || !runId) { console.error('usage: ATTEST_RPC_URL/ATTEST_PRIVATE_KEY/ATTEST_CONTRACT set; node scripts/attest-run.mjs <runId>'); process.exit(2); }
const art = JSON.parse(readFileSync(new URL('../contracts/artifacts/EvalAttestationRegistry.json', import.meta.url)));
const a = attestationFor(runId); // { runIdHash, agent, resultHash, passed, total, uri }
const account = privateKeyToAccount(pk.startsWith('0x') ? pk : '0x' + pk);
const chain = { id: Number(process.env.ATTEST_CHAIN_ID || 0) || undefined, name: 'evm', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [rpc] } } };
const wallet = createWalletClient({ account, chain, transport: http(rpc) });
const pub = createPublicClient({ chain, transport: http(rpc) });
const hash = await wallet.writeContract({ address: addr, abi: art.abi, functionName: 'attest', args: [a.runIdHash, a.agent, a.resultHash, a.passed, a.total, a.uri] });
await pub.waitForTransactionReceipt({ hash });
console.log(`attested ${a.passed}/${a.total} for run ${runId}`);
console.log('tx:', hash);
if (explorer) console.log(`${explorer}/tx/${hash}`);
