// Deploy EvalAttestationRegistry to any EVM testnet with viem. Prints the address + explorer link.
//   ATTEST_RPC_URL=https://sepolia.base.org ATTEST_PRIVATE_KEY=0x... [ATTEST_EXPLORER=https://sepolia.basescan.org] node scripts/deploy-attestation.mjs
import { readFileSync } from 'node:fs';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
try { process.loadEnvFile('.env.x402'); } catch {}
try { process.loadEnvFile(); } catch {}
const { ATTEST_RPC_URL: rpc, ATTEST_PRIVATE_KEY: pk, ATTEST_EXPLORER: explorer } = process.env;
if (!rpc || !pk) { console.error('set ATTEST_RPC_URL and ATTEST_PRIVATE_KEY'); process.exit(2); }
const art = JSON.parse(readFileSync(new URL('../contracts/artifacts/EvalAttestationRegistry.json', import.meta.url)));
const account = privateKeyToAccount(pk.startsWith('0x') ? pk : '0x' + pk);
const chain = { id: Number(process.env.ATTEST_CHAIN_ID || 0) || undefined, name: 'evm', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [rpc] } } };
const wallet = createWalletClient({ account, chain, transport: http(rpc) });
const pub = createPublicClient({ chain, transport: http(rpc) });
console.log('deploying from', account.address, '...');
const hash = await wallet.deployContract({ abi: art.abi, bytecode: art.bytecode });
const receipt = await pub.waitForTransactionReceipt({ hash });
console.log('contract:', receipt.contractAddress);
console.log('tx      :', hash);
if (explorer) { console.log('address :', `${explorer}/address/${receipt.contractAddress}`); console.log('deploy  :', `${explorer}/tx/${hash}`); }
console.log('\nSet ATTEST_CONTRACT=' + receipt.contractAddress + ' to attest runs against it.');
