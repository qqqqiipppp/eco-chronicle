// Developer-only browser fixture. Two ports provide genuinely separate storage origins.
// --live forwards unchanged student requests to the real Edge Function, with public keys only.
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {Readable} from 'node:stream';
import {root,database} from './helpers/cloud-save-runtime.mjs';
import {createHandler} from '../supabase/functions/student-save/handler.mjs';
const live=process.argv.includes('--live'),ports=[54431,54432];
const config=await fs.readFile(path.join(root,'js/supabase.js'),'utf8');
const cloudUrl=config.match(/var projectUrl = '([^']+)'/)[1],publicKey=config.match(/var publishableKey = '([^']+)'/)[1];
const local=live?null:await database(true),handler=local?createHandler({rpc:local.rpc,publicKeys:[publicKey],allowedOrigins:ports.map(p=>'http://127.0.0.1:'+p)}):null;
const servers=[];
for(const port of ports){
  const server=http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/functions/v1/student-save'){
        const request=new Request((live?cloudUrl:'http://localhost')+url.pathname,{method:req.method,
          headers:{apikey:publicKey,'Content-Type':'application/json'},...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})});
        const response=live?await fetch(request):await handler(request);
        res.writeHead(response.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(Buffer.from(await response.arrayBuffer()));return;
      }
      if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
      const full=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/tests/cloud-sync.html':url.pathname));
      if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
      let data=await fs.readFile(full);
      if(full===path.join(root,'index.html')){
        const bootstrap=`<script>
        window.ecoSupabase={publicConfig:{projectUrl:location.origin,publishableKey:${JSON.stringify(publicKey)}},status:'failed',client:null};
        window.__qaOffline=false;window.__qaLoseNext=null;
        Object.defineProperty(navigator,'onLine',{get:function(){return !window.__qaOffline;}});
        var qaFetch=window.fetch.bind(window);window.fetch=async function(url,init){
          if(String(url).includes('/functions/v1/student-save')){
            if(window.__qaOffline)throw new TypeError('QA offline');
            var action=JSON.parse(init.body).action,response=await qaFetch(url,init);
            if(action===window.__qaLoseNext){window.__qaLoseNext=null;await response.text();throw new TypeError('QA response lost');}return response;
          }return qaFetch(url,init);
        };</script>`;
        const capture=`<script>window.__qaErrors=[];addEventListener('error',function(e){window.__qaErrors.push({message:e.message,file:e.filename,line:e.lineno});});addEventListener('unhandledrejection',function(){window.__qaErrors.push({message:'Unhandled promise rejection'});});</script>`;
        data=Buffer.from(data.toString().replace('<head>','<head>'+capture+bootstrap).replace(/<script defer src="https:\/\/cdn[^>]*><\/script>/,'')
          .replace(/<script defer src="\.\/js\/supabase.js[^>]*><\/script>/,''));
      }
      const type={'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(full)]||'application/octet-stream';
      res.writeHead(200,{'Cache-Control':'no-store','Content-Type':type});res.end(data);
    }catch(_){res.writeHead(503);res.end();}
  });
  await new Promise(r=>server.listen(port,'127.0.0.1',r));servers.push(server);
}
console.log('Cloud stage 2 browser QA: '+ports.map(p=>'http://127.0.0.1:'+p).join(' / ')+' ('+(live?'real Supabase via local proxy':'local PostgreSQL')+')');
process.on('SIGINT',async()=>{servers.forEach(s=>s.close());if(local)await local.db.close();process.exit();});
