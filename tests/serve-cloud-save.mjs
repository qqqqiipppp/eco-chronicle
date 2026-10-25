import {testSecret} from './helpers/cloud-save-runtime.mjs';
// Real PostgreSQL (WASM) + the deployed Edge handler; no production credentials.
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {Readable} from 'node:stream';
import {root,database} from './helpers/cloud-save-runtime.mjs';
import {createHandler} from '../supabase/functions/student-save/handler.mjs';
const {db,rpc}=await database();let handler;
const configSource=await fs.readFile(path.join(root,'js/supabase.js'),'utf8');
const publicConfig={projectUrl:configSource.match(/var projectUrl = '([^']+)'/)[1],publishableKey:configSource.match(/var publishableKey = '([^']+)'/)[1]};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/functions/v1/student-save-v2'){
      const request=new Request('http://localhost'+req.url,{method:req.method,headers:req.headers,
        ...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})});
      const response=await handler(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    const full=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/tests/cloud-save.html':url.pathname));
    if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let data=await fs.readFile(full);
    if(full===path.join(root,'index.html'))data=Buffer.from(data.toString().replace(/<script defer[^>]*><\/script>/g,'')
      .replace('</body>','<script>window.ecoSupabase={publicConfig:'+JSON.stringify(publicConfig)+'};</script></body>'));
    const type={'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(full)]||'application/octet-stream';
    res.writeHead(200,{'Cache-Control':'no-store','Content-Type':type});res.end(data);
  }catch(_){res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(Number(process.argv[2])||0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
handler=createHandler({secret:testSecret,rpc,publicKeys:['sb_publishable_test_only'],allowedOrigins:[url]});console.log('Cloud QA: '+url);
process.on('SIGINT',async()=>{server.close();await db.close();process.exit();});
