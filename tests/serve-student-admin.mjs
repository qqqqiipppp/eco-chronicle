import {testSecret} from './helpers/cloud-save-runtime.mjs';
// Local integration environment ONLY. Uses the real pinned SDK and handler, isolated
// PostgreSQL and the signed Auth contract fixture. Never connects to production Auth.
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {Readable} from 'node:stream';import {randomUUID} from 'node:crypto';
import {adminDatabase,adminApi} from './helpers/admin-runtime.mjs';
import {root,game,read} from './helpers/cloud-save-runtime.mjs';
import {createHandler} from '../supabase/functions/student-save/handler.mjs';
const setup=await adminDatabase(),fixture=adminApi(setup),port=54441,origin='http://127.0.0.1:'+port;
const sdk=await(await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.0/dist/umd/supabase.js')).text();
if(!sdk.includes('createClient'))throw Error('Pinned SDK unavailable');
const studentHandler=createHandler({secret:testSecret,rpc:setup.rpc,publicKeys:['sb_publishable_admin_test'],allowedOrigins:[origin]});
const made=await fixture.call({action:'create',name:'관리TEST1',petKey:'earth',createRequestId:randomUUID()});
const g=game(),legacy=g.c.migrate(JSON.parse(read('tests/fixtures/legacy-save/last-week.json')));legacy.name='과거TEST';legacy.code='EC1234';
await setup.db.query('update public.student_saves set save_data=$1,save_version=8 where id=$2',[JSON.stringify({...legacy,v:8,saveVersion:8}),made.id]);
// Fixture credentials below are public test strings, not an actual Auth account/password.
const identities={'teacher@example.invalid':setup.admin,'regular@example.invalid':setup.regular,'disabled@example.invalid':setup.disabled};
function authResponse(id,email){return {access_token:fixture.token(id),token_type:'bearer',expires_in:300,refresh_token:'fixture-refresh-'+id,
  user:{id,aud:'authenticated',role:'authenticated',email,created_at:new Date().toISOString(),app_metadata:{provider:'email'},user_metadata:{}}};}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,origin);
    if(url.pathname==='/qa-supabase.js'){res.writeHead(200,{'Content-Type':'application/javascript'});res.end(sdk);return;}
    if(url.pathname.startsWith('/auth/v1/')){
      let body={};if(req.method==='POST'){let text='';for await(const b of req)text+=b;body=text?JSON.parse(text):{};}
      let response,status=200;
      if(url.pathname==='/auth/v1/token'){
        let id=identities[body.email],email=body.email;
        if(url.searchParams.get('grant_type')==='refresh_token'){id=String(body.refresh_token||'').replace('fixture-refresh-','');email=Object.keys(identities).find(k=>identities[k]===id);}
        if(!email||(url.searchParams.get('grant_type')==='password'&&body.password!=='fixture-password')){status=400;response={error:'invalid_grant',error_description:'Invalid login credentials'};}
        else response=authResponse(id,email);
      }else if(url.pathname==='/auth/v1/logout'){response={};}
      else if(url.pathname==='/auth/v1/user'){
        const verified=await fixture.verifier(String(req.headers.authorization||'').slice(7));if(!verified){status=401;response={error:'invalid token'};}else response=authResponse(verified.id,Object.keys(identities).find(k=>identities[k]===verified.id)).user;
      }else{status=404;response={error:'not found'};}
      res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(response));return;
    }
    if(url.pathname==='/functions/v1/student-admin-v2'||url.pathname==='/functions/v1/student-save-v2'){
      const headers=new Headers(req.headers);headers.set('origin','https://admin.fixture.invalid');
      const request=new Request(origin+url.pathname,{method:req.method,headers,body:Readable.toWeb(req),duplex:'half'});
      const response=await(url.pathname.endsWith('student-admin-v2')?fixture.handler(request):studentHandler(request));
      res.writeHead(response.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    const full=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/admin.html':url.pathname));if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let data=await fs.readFile(full);
    if(full===path.join(root,'admin.html'))data=Buffer.from(data.toString().replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.0/dist/umd/supabase.js','/qa-supabase.js').replace('<body>','<body><p class="card">LOCAL TEST ONLY · 실제 Supabase 관리자 로그인이 아닌 인증 계약 검증 환경입니다.</p>'));
    if(full===path.join(root,'js/admin-config.js'))data=Buffer.from('window.EcoAdminConfig=Object.freeze('+JSON.stringify({projectUrl:origin,publishableKey:'sb_publishable_admin_test'})+');');
    const type={'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'}[path.extname(full)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);
  }catch(_){res.writeHead(500);res.end();}
});
await new Promise(r=>server.listen(port,'127.0.0.1',r));console.log('Local signed-Auth contract admin UI: '+origin+' (isolated TEST database, no production login)');
process.on('SIGINT',async()=>{server.close();await setup.db.close();process.exit();});
