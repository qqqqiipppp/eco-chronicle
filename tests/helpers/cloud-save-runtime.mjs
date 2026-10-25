import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {fileURLToPath, pathToFileURL} from 'node:url';
import http from 'node:http';
import {Readable} from 'node:stream';
import {webcrypto} from 'node:crypto';
import {createHandler} from '../../supabase/functions/student-save/handler.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const read=file=>fs.readFileSync(path.join(root,file),'utf8');
export const plain=value=>JSON.parse(JSON.stringify(value));
export const testSecret='isolated-test-signing-secret-never-a-live-credential';
export async function database(stage2=false){
  const moduleFile=process.env.CLOUD_SAVE_PGLITE || path.join(os.tmpdir(),'eco-cloud-save-pglite-0.5.10/package/dist/index.js');
  const {PGlite}=await import(pathToFileURL(moduleFile).href);
  const db=new PGlite();
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role; alter default privileges in schema public grant all on tables to anon, authenticated, service_role;');
  await db.exec(read('supabase/migrations/20261021090016_student_saves_foundation.sql'));
  {
    const next=fs.readdirSync(path.join(root,'supabase/migrations')).find(f=>f.endsWith('_student_saves_idempotent_create.sql'));
    await db.exec(read('supabase/migrations/'+next));
  }
  await db.exec('create schema auth;create table auth.users(id uuid primary key);');
  await db.exec(read('supabase/migrations/'+fs.readdirSync(path.join(root,'supabase/migrations')).find(f=>f.endsWith('_student_admin_management.sql'))));
  await db.exec(read('supabase/migrations/'+fs.readdirSync(path.join(root,'supabase/migrations')).find(f=>f.endsWith('_student_saves_six_character_guard.sql'))));
  await db.exec(read('supabase/migrations/'+fs.readdirSync(path.join(root,'supabase/migrations')).find(f=>f.endsWith('_student_save_classroom_budget.sql'))));
  const signatures={student_save_create:['p_code','p_save_data','p_save_version'],student_save_load:['p_code'],student_save_update:['p_code','p_save_data','p_save_version','p_expected_revision']};
  signatures.student_save_create_once=['p_code','p_save_data','p_save_version','p_create_request_id'];
  signatures.student_save_guarded=['p_action','p_code','p_save_data','p_save_version','p_expected_revision','p_create_request_id','p_device','p_ip','p_code_hash','p_trusted'];
  const rpc=(name,args)=>db.transaction(async tx=>{
    if(!signatures[name])throw Error('Unexpected RPC');
    await tx.exec('set local role service_role');
    const params=signatures[name].map(key=>typeof args[key]==='object'&&args[key]!==null?JSON.stringify(args[key]):args[key]);
    const result=await tx.query('select public.'+name+'('+params.map((_,i)=>'$'+(i+1)).join(',')+') as result',params);
    return result.rows[0].result;
  });
  return {db,rpc};
}
export function game(){
  const storage=new Map(),logs=[];let cloudFetches=0;
  const c={crypto:webcrypto,console:{log(){},info(){},error(...a){logs.push(a);},warn(...a){logs.push(a);}},Math,Date,Map,Set,URL,URLSearchParams,Uint8Array,
    TextEncoder,TextDecoder,AbortController,Response,Request,Headers,performance,navigator:{},Image:class{},SPRITES:{},
    document:{getElementById(){return null;},querySelectorAll(){return [];},addEventListener(){}},
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
    addEventListener(){},setTimeout,clearTimeout,setInterval(){return 1;},clearInterval(){},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},
    fetch:(...args)=>{cloudFetches++;return fetch(...args);}};
  c.window=c;vm.createContext(c);
  for(const file of ['student-state','gear-data','npc-data','map-utils','theme-data','learning-data','equipment-ui','ecotech-exploration','ecotech'])vm.runInContext(read('js/'+file+'.js'),c,{filename:file});
  const source=read('js/game.js').replace(/\r\n/g,'\n'),at=source.lastIndexOf('try {\n  S=newState();');
  if(at<0)throw Error('Game boot boundary changed');vm.runInContext(source.slice(0,at),c,{filename:'game.js'});
  c.S=c.newState();c.applyTheme('forest');
  vm.runInContext(read('js/cloud-save.js'),c,{filename:'cloud-save.js'});
  return {c,storage,logs,get cloudFetches(){return cloudFetches;}};
}
export function student(c){const state=c.newState();return Object.assign(state,{name:'클라우드TEST',code:'EC9001',petKey:'earth',lv:4,exp:250,gold:180,learning:{version:1,regions:{forest:{answers:{},cases:{},notes:{a:'환경을 지켜요'},page:0}}}});}
export async function serve(rpc,settings={}){
  let handler;
  const server=http.createServer(async(req,res)=>{
    try{
      if(req.url!=='/functions/v1/student-save-v2'){res.writeHead(404);res.end();return;}
      const request=new Request('http://localhost'+req.url,{method:req.method,headers:req.headers,
        ...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})});
      const response=await handler(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
    }catch(_){res.writeHead(500);res.end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  handler=createHandler({rpc,secret:testSecret,publicKeys:['sb_publishable_test_only'],allowedOrigins:[url,'https://qqqqiipppp.github.io'],logger:{error(){}},...settings});
  return {url,close:()=>new Promise(resolve=>server.close(resolve)),handler};
}
