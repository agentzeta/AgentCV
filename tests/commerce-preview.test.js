import test from 'node:test';
import assert from 'node:assert/strict';
import { units,validateRequest,fetchQuote,quoteReceipt,invoiceFundingPreview } from '../src/commerce-preview.js';
const a='0x'+'1'.repeat(40),b='0x'+'2'.repeat(40),s='0x'+'3'.repeat(40);
const request=()=>({type:'EXACT_OUTPUT',tokenIn:a,tokenOut:b,swapper:s,tokenInChainId:1,tokenOutChainId:1,amount:'100',slippageTolerance:0.5});
const response=()=>({routing:'CLASSIC',quote:{input:{token:a,amount:'200',maxAmount:'201'},output:{token:b,amount:'100',minimumAmount:'100'},aggregatedOutputs:[{recipient:s,minAmount:'99'}]}});
const clock={observedAt:100,now:101,maxAgeMs:30};
test('net recipient amount prevents invoice shortfall hidden by gross output',()=>{
 const p=invoiceFundingPreview(request(),response(),{...clock,maxInput:'210',invoiceAmount:'100'});
 assert.equal(p.netMinimumOutput,'99'); assert.equal(p.state,'REVIEW_REQUIRED');
 const q=response(); q.quote.aggregatedOutputs[0].minAmount='100';
 assert.equal(invoiceFundingPreview(request(),q,{...clock,maxInput:'210',invoiceAmount:'100'}).state,'WITHIN_TOKEN_BUDGET');
 assert.equal(invoiceFundingPreview(request(),q,{...clock,maxInput:'200',invoiceAmount:'100'}).state,'REVIEW_REQUIRED');
});
test('missing, duplicated, wrong recipient and legacy pre-fee fields fail closed',()=>{
 for(const outputs of [undefined,[],[{recipient:a,minAmount:'100'}],[{recipient:s,minAmount:'100'},{recipient:s,minAmount:'100'}]]) {
 const q=response();q.quote.aggregatedOutputs=outputs;assert.equal(quoteReceipt(request(),q,clock).state,'REVIEW_REQUIRED'); }
});
test('stale, failed, unsupported and unbound quotes require review',()=>{
 assert.equal(quoteReceipt(request(),response(),{...clock,now:130}).state,'REVIEW_REQUIRED');
 for (const mutate of [q=>q.routing='DUTCH_V3',q=>q.quote.txFailureReason='SIMULATION_ERROR',q=>q.quote.input.token=b,q=>q.quote.output.amount='90']) {
 const q=response();mutate(q);assert.equal(quoteReceipt(request(),q,clock).state,'REVIEW_REQUIRED'); }
});
test('integer precision and request limits',()=>{
 assert.equal(units('9007199254740993123'),9007199254740993123n);
 for(const x of [1,'1.0','-1','01','1e6']) assert.throws(()=>units(x));
 assert.throws(()=>validateRequest({...request(),tokenOutChainId:8453}));
 assert.throws(()=>validateRequest({...request(),slippageTolerance:6}));
});
test('API is quote-only, includes analytics header and does not echo credentials',async()=>{
 let seen;
 await fetchQuote(request(),{apiKey:'secret',fetchImpl:async(url,options)=>{seen={url,options};return{ok:true,json:async()=>response()};}});
 assert.equal(seen.url,'https://trade-api.gateway.uniswap.org/v1/quote');
 assert.equal(JSON.parse(seen.options.headers['X-Agent-Info']).decision_origin,'human_mediated');
 await assert.rejects(fetchQuote(request(),{apiKey:'secret',fetchImpl:async()=>({ok:false,status:401})}),/HTTP 401/);
 await assert.rejects(fetchQuote(request(),{}),/required/);
});
