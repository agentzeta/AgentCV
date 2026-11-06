// Offline Solidity compile with solc-js. Writes contracts/artifacts/EvalAttestationRegistry.json.
const solc = require('solc');
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'EvalAttestationRegistry.sol'), 'utf8');
const input = {
  language: 'Solidity',
  sources: { 'EvalAttestationRegistry.sol': { content: src } },
  settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'shanghai', outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
const errs = (out.errors || []).filter((e) => e.severity === 'error');
if (errs.length) { console.error(errs.map((e) => e.formattedMessage).join('\n')); process.exit(1); }
const c = out.contracts['EvalAttestationRegistry.sol'].EvalAttestationRegistry;
const artifact = { contractName: 'EvalAttestationRegistry', abi: c.abi, bytecode: '0x' + c.evm.bytecode.object, compiler: 'solc ' + solc.version() };
fs.writeFileSync(path.join(__dirname, 'artifacts', 'EvalAttestationRegistry.json'), JSON.stringify(artifact, null, 2));
console.log('compiled OK with', artifact.compiler, '| abi fns:', artifact.abi.filter((x) => x.type === 'function').length, '| bytecode bytes:', (artifact.bytecode.length - 2) / 2);
