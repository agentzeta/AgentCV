# Two read-only Uniswap product prototypes

1. **QuoteReceipt:** identify recipient net minimum, retain request/response digests, and expose missing, stale or unsupported quote information.
2. **Invoice Funding Preview:** check whether an EXACT_OUTPUT quote's recipient minimum covers an invoice and its input maximum fits a token budget. Gas and balance need separate checks.

Run `node scripts/commerce-demo.js` for synthetic fixtures. For live quote retrieval, supply a valid JSON request using real token addresses, a swapper address and raw token units:

`UNISWAP_API_KEY=... node scripts/commerce-demo.js --live request.json`

Use a secret manager or environment variable; never commit keys. The live path was tested with a mock HTTP transport, not a production API key. No swap, signing, token approval or broadcast is implemented. There is no custody.

The current adapter supports same-chain CLASSIC routing only and conservatively requires one matching recipient in `quote.aggregatedOutputs`. Its `minAmount` is used as the recipient net minimum. It does not silently substitute `output.minimumAmount`, which the current FAQ describes as pre-fee for compatibility. It does not subtract fees again. Older responses and other routes require dedicated adapters. Missing `input.maxAmount` blocks invoice budget approval. A local observation timestamp does not establish provider issuance time or reserve an executable price.

Sources checked 18 November 2026:
- https://developers.uniswap.org/docs/trading/swapping-api/faqs
- https://developers.uniswap.org/docs/api-reference/aggregator_quote
- https://developers.uniswap.org/docs/trading/swapping-api/start-building/agent-attribution

The optional X-Agent-Info header is analytics attribution, not authenticated identity. A request digest is a local record, not a signed provider attestation. An API quote is not a mandate to spend. Before production: validate current response schemas against live routes, handle decimal presentation separately from integer accounting, simulate full transaction effects, authenticate callers, bind authorizations and expiration to requests, review allowances, and test failure/retry paths.

Commercial hypothesis: paid reconciliation and procurement evidence for agent wallet teams. The API itself is not the moat. Neither prototype has customer validation or measured savings yet.
