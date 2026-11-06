import http from 'node:http';
// Illustrative executable agent. Uses keyword rules written against the 10 public demo tasks, so its 10/10 shows the mechanics, not competence. NOT a language model.
const classify=text=>/refund|charge|charged|receipt|invoice|tax amount/i.test(text)?'billing':/login|freez|crash|error|closing|dashboard/i.test(text)?'technical':'sales';
http.createServer(async(req,res)=>{if(req.method!=='POST'||req.url!=='/task'){res.writeHead(404);return res.end()}
let raw='';for await(const c of req){raw+=c;if(raw.length>4000){res.writeHead(413);return res.end()}}
try{const b=JSON.parse(raw);res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({output:classify(String(b.task||''))}))}catch{res.writeHead(400);res.end()}}).listen(4100,'127.0.0.1',()=>console.log('Example agent on http://127.0.0.1:4100/task'));
