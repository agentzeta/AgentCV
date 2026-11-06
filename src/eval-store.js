import fs from 'node:fs/promises';
import path from 'node:path';
// Single-process append serialization; NOT multi-instance durable storage.
export class EvalStore{
 constructor(file){this.file=file;this.queue=Promise.resolve();}
 async all(){try{const raw=await fs.readFile(this.file,'utf8');return raw.split('\n').filter(Boolean).map(s=>JSON.parse(s))}catch(e){if(e.code==='ENOENT')return [];throw e}}
 async add(record){const task=this.queue.then(async()=>{await fs.mkdir(path.dirname(this.file),{recursive:true});await fs.appendFile(this.file,JSON.stringify(record)+'\n',{encoding:'utf8',mode:0o600});return record});this.queue=task.catch(()=>{});return task;}
}
