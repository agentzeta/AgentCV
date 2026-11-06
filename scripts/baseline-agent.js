import http from 'node:http';
// Demo-only baseline agent for comparisons: a deliberately crude rule
// (billing only when the text says "refund" or "invoice", otherwise technical). Scores 4/10.
const classify = (t) => (/refund|invoice/i.test(t) ? 'billing' : 'technical');
http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/task') { res.writeHead(404); return res.end(); }
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > 4000) { res.writeHead(413); return res.end(); } }
  let body;
  try { body = JSON.parse(raw || '{}'); } catch { res.writeHead(400); return res.end(); }
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ output: classify(String(body.task || '')) }));
}).listen(4101, '127.0.0.1', () => console.log('Baseline agent on http://127.0.0.1:4101/task'));
