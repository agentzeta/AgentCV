import {readProfiles} from '../src/arkiv.js';
// Load .env if present (Node >= 20.12 built-in); real environment variables take precedence.
try{process.loadEnvFile()}catch{}
console.log(JSON.stringify(await readProfiles(),null,2));
