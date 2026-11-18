import { createHash } from 'node:crypto';
const address = /^0x[0-9a-fA-F]{40}$/;
export function units(value) {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value)) throw new Error('Amounts must be unsigned integer strings');
  return BigInt(value);
}
export function validateRequest(r) {
  if (!r || !['EXACT_INPUT', 'EXACT_OUTPUT'].includes(r.type)) throw new Error('Unsupported quote type');
  for (const key of ['tokenIn','tokenOut','swapper']) if (!address.test(r[key])) throw new Error(`Invalid ${key}`);
  if (!Number.isSafeInteger(r.tokenInChainId) || r.tokenInChainId <= 0 || r.tokenInChainId !== r.tokenOutChainId) throw new Error('Only same-chain quotes supported');
  if (units(r.amount) <= 0n) throw new Error('Amount must be positive');
  if (!Number.isFinite(r.slippageTolerance) || r.slippageTolerance < 0 || r.slippageTolerance > 5) throw new Error('Slippage must be between 0 and 5 percent');
  return r;
}
// Read-only: no approval, Permit2, wallet signing, swap or broadcast endpoint.
export async function fetchQuote(request, { apiKey, fetchImpl = fetch } = {}) {
  validateRequest(request);
  if (!apiKey) throw new Error('UNISWAP_API_KEY is required for live quotes');
  const response = await fetchImpl('https://trade-api.gateway.uniswap.org/v1/quote', {
    method:'POST', redirect:'error', signal:AbortSignal.timeout(12000),
    headers:{'Content-Type':'application/json', 'x-api-key':apiKey,
      'X-Agent-Info':JSON.stringify({decision_origin:'human_mediated',integration_name:'agentcv-commerce-preview',integration_version:'0.1.0'})},
    body:JSON.stringify(request)
  });
  if (!response.ok) throw new Error(`Quote API returned HTTP ${response.status}`);
  return response.json();
}
export function quoteReceipt(request, response, { observedAt = Date.now(), maxAgeMs = 30000, now = Date.now() } = {}) {
  validateRequest(request);
  if (![observedAt,maxAgeMs,now].every(Number.isSafeInteger) || maxAgeMs <= 0 || observedAt < 0 || now < observedAt) throw new Error('Invalid observation clock');
  const q = response?.quote;
  const warnings=[];
  let state='REVIEW_REQUIRED';
  let netMinimumOutput=null;
  // This adapter deliberately supports CLASSIC routing only. Other routes need distinct semantics.
  if (response?.routing !== 'CLASSIC' || !q) warnings.push('Unsupported routing or missing quote');
  else {
    const output = q.output;
    const input = q.input;
    const bound = input?.token?.toLowerCase() === request.tokenIn.toLowerCase()
      && output?.token?.toLowerCase() === request.tokenOut.toLowerCase();
    if (!bound) warnings.push('Quote token binding missing or mismatched');
    if (q.txFailureReason) warnings.push('Quote reports transaction simulation failure');
    if (now - observedAt >= maxAgeMs) warnings.push('Local quote observation is stale');
    const recipients = Array.isArray(q.aggregatedOutputs) ? q.aggregatedOutputs : [];
    // Current API FAQ: recipient aggregated minimum is net of integrator fees.
    // Do not substitute the legacy pre-fee output.minimumAmount or subtract fees twice.
    const owned = recipients.filter(o => o.recipient?.toLowerCase() === request.swapper.toLowerCase());
    if (owned.length !== 1) warnings.push('Cannot identify one recipient net minimum');
    else {
      try { netMinimumOutput=units(owned[0].minAmount).toString(); }
      catch { warnings.push('Invalid recipient minimum amount'); }
    }
    if (request.type === 'EXACT_INPUT') {
      try { if (units(input?.amount) !== units(request.amount)) warnings.push('Input amount differs from request'); }
      catch { warnings.push('Missing input amount'); }
    } else {
      try { if (units(output?.amount) !== units(request.amount)) warnings.push('Output amount differs from request'); }
      catch { warnings.push('Missing output amount'); }
    }
    if (!warnings.length) state='PREVIEW_AVAILABLE';
  }
  return {schema:'agentcv-quote-receipt-v1',state,observedAt,maxAgeMs,
    requestDigest:createHash('sha256').update(JSON.stringify(request)).digest('hex'),
    responseDigest:createHash('sha256').update(JSON.stringify(response)).digest('hex'),
    netMinimumOutput,warnings,
    assurance:'Local read-only preview. Digests identify bytes; they are not provider signatures or execution guarantees. Quote is not permission to spend. Gas is separate.'};
}
export function invoiceFundingPreview(request,response,{maxInput,invoiceAmount,...clock}) {
  if (request.type !== 'EXACT_OUTPUT') throw new Error('Invoice preview requires EXACT_OUTPUT');
  const receipt=quoteReceipt(request,response,clock);
  const budget=units(maxInput), invoice=units(invoiceAmount);
  let inputMaximum=null;
  try { inputMaximum=units(response.quote.input.maxAmount).toString(); }
  catch { receipt.warnings.push('Provider input maximum absent; cannot compare budget'); }
  const funded=receipt.state==='PREVIEW_AVAILABLE' && inputMaximum!==null && BigInt(inputMaximum)<=budget
    && receipt.netMinimumOutput!==null && BigInt(receipt.netMinimumOutput)>=invoice;
  return {...receipt,state:funded?'WITHIN_TOKEN_BUDGET':'REVIEW_REQUIRED',inputMaximum,maxInput,invoiceAmount,
    gasBudgetChecked:false,balanceChecked:false,authorizationChecked:false,
    assurance:'Token-budget preview only. Recipient net minimum must cover invoice. Gas, balance, approval, authority and execution remain unchecked.'};
}
