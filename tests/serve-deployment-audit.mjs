// Explicit live-backend TEST-only browser audit. No migrations, administrator credentials, or bulk connections.
// Serves the audited local build on two independent origins. Production HTML itself is never changed.
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';
const root=process.cwd(),ports=[54461,54462],backend='https://akpkwypxupghvcghywab.supabase.co';
const configuration=await fs.readFile('js/supabase.js','utf8'),key=configuration.match(/var publishableKey = '([^']+)'/)[1];
const servers=[],types={'.html':'text/html;charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg'};
for(const port of ports){const server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://127.0.0.1:'+port);
  if(url.pathname==='/__audit/student-save'){
    if(req.method!=='POST'){res.writeHead(405);res.end();return;}
    let text='';for await(const chunk of req){text+=chunk;if(text.length>150000)throw Error('too large');}
    const data=JSON.parse(text);if(!['create','load','save'].includes(data.action))throw Error('action not allowed');
    if(data.action!=='load'&&!/^TESTK8[AB]$/.test(data.saveData?.name))throw Error('TEST students only');
    const response=await fetch(backend+'/functions/v1/student-save',{method:'POST',headers:{apikey:key,Origin:'https://qqqqiipppp.github.io','Content-Type':'application/json'},body:text,signal:AbortSignal.timeout(15000)});
    const result=await response.json();if(result.ok&&result.saveData&&!/^TESTK8[AB]$/.test(result.saveData.name))throw Error('Non-TEST response blocked');
    res.writeHead(response.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(result));return;
  }
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
  if(!full.startsWith(root+path.sep)||rel.split('/').some(x=>x.startsWith('.'))){res.writeHead(403);res.end();return;}
  let data=await fs.readFile(full);
  if(full===path.join(root,'index.html'))data=Buffer.from(data.toString().replace('<head>','<head><script src="/tests/deployment-browser.js"></script>'));
  res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
}catch(_){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"ok":false,"error":"TEST_AUDIT_UNAVAILABLE"}');}});
await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));servers.push(server);}
console.log('LIVE Supabase TEST-only audit: http://127.0.0.1:54461 / http://127.0.0.1:54462; TESTK8A/B only; maximum two TEST sessions.');
process.on('SIGINT',()=>{servers.forEach(server=>server.close());process.exit();});
