import { fetchQuote, quoteReceipt, invoiceFundingPreview } from '../src/commerce-preview.js';
import { readFile } from 'node:fs/promises';
const live = process.argv[2] === '--live';
const a='0x'+'1'.repeat(40),b='0x'+'2'.repeat(40),s='0x'+'3'.repeat(40);
const request=live ? JSON.parse(await readFile(process.argv[3],'utf8')) : {
 type:'EXACT_OUTPUT',tokenIn:a,tokenOut:b,swapper:s,tokenInChainId:1,tokenOutChainId:1,amount:'1000000',slippageTolerance:0.5,protocols:['V3']};
const response=live ? await fetchQuote(request,{apiKey:process.env.UNISWAP_API_KEY}) : {
 routing:'CLASSIC',quote:{input:{token:a,amount:'2000000',maxAmount:'2010000'},output:{token:b,amount:'1000000',minimumAmount:'1000000'},aggregatedOutputs:[{recipient:s,minAmount:'1000000'}]}};
console.log(JSON.stringify({mode:live?'LIVE_READ_ONLY':'SYNTHETIC_FIXTURE',receipt:quoteReceipt(request,response),
 ...(live?{}:{invoice:invoiceFundingPreview(request,response,{maxInput:'2100000',invoiceAmount:'1000000'})})},null,2));
