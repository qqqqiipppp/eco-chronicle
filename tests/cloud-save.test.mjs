import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {database,game,student,serve,read,plain,root,testSecret} from './helpers/cloud-save-runtime.mjs';
import {createHandler,createRpc,generateCode,normalizeCode,STUDENT_FIELDS,validateData} from '../supabase/functions/student-save/handler.mjs';
const setup=await database();
test.after(async()=>{await setup.db.close();});
const publicKey='sb_publishable_test_only',origin='https://qqqqiipppp.github.io';
function data(){const g=game();const s=g.c.migrate(student(g.c));delete s.scene;delete s.modal;return plain(s);}
function request(body,extra={}){return new Request('https://example.test/functions/v1/student-save',{method:'POST',headers:{'x-eco-device':crypto.randomUUID(),apikey:publicKey,Origin:origin,'Content-Type':'application/json',...extra.headers},body:JSON.stringify(body)});}
const handler=createHandler({secret:testSecret,rpc:setup.rpc,publicKeys:[publicKey],allowedOrigins:[origin],logger:{error(){}}});
async function call(body){const response=await handler(request(body));return {status:response.status,...await response.json()};}

test('cryptographic codes are unambiguous, unique and server/client normalization agrees',()=>{
  const g=game(),codes=new Set();
  for(let i=0;i<10000;i++){const code=generateCode();assert.match(code,/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);codes.add(code);}
  assert.ok(codes.size>9990);
  for(const value of [' k7m4p2 ','K7M4P2'])assert.equal(normalizeCode(value),g.c.CloudSave.normalizeCode(value));
  for(const value of ['',null,{},'EC1234','EC-0000-OOOO','EC-1111-IIII','EC-LLLL-2222','EC-7K4P2Q9M',"EC-' OR true --"]){assert.equal(normalizeCode(value),null);assert.equal(g.c.CloudSave.normalizeCode(value),null);}
});
test('code generation rejects out-of-range random bytes instead of modulo bias',()=>{
  let count=0;const random={getRandomValues(bytes){if(count++===0)bytes.fill(255);else bytes.set(Array.from({length:16},(_,i)=>i%2?9:0));return bytes;}};
  assert.equal(generateCode(random),'2B2B2B');assert.equal(count,2);
});
test('current student fields are supported without persisting runtime, rules or extra personal fields',async()=>{
  const g=game();for(const key of Object.keys(g.c.newState()).filter(k=>!['scene','modal'].includes(k)))assert.ok(STUDENT_FIELDS.has(key),key);
  for(const key of ['MONSTERS','LEVELS','SPRITES','email','birthDate','phone','guardian','scene','modal'])assert.equal(validateData({[key]:1},9),'INVALID_SAVE_DATA');
  assert.equal(validateData([],9),'INVALID_SAVE_DATA');assert.equal(validateData({},1.5),'INVALID_SAVE_VERSION');
});
test('real PostgreSQL table constraints, RLS and role privileges deny all browser CRUD/RPC',async()=>{
  const {db}=setup;
  assert.equal((await db.query("select has_table_privilege('service_role','public.student_saves','DELETE') as allowed")).rows[0].allowed,false);
  assert.equal((await db.query("select relrowsecurity and relforcerowsecurity as enabled from pg_class where oid='public.student_saves'::regclass")).rows[0].enabled,true);
  for(const role of ['anon','authenticated']){
    for(const privilege of ['SELECT','INSERT','UPDATE','DELETE']){
      assert.equal((await db.query('select has_table_privilege($1, $2, $3) as allowed',[role,'public.student_saves',privilege])).rows[0].allowed,false);
    }
    for(const sql of ['select * from public.student_saves',"insert into public.student_saves(code,save_data,save_version) values('EC-2222-3333','{}',9)",
      "update public.student_saves set save_version=9 where false","delete from public.student_saves where false","select public.student_save_load('EC-2222-3333')"]){
      await assert.rejects(db.transaction(async tx=>{await tx.exec('set local role '+role);return tx.query(sql);}),/permission denied/);
    }
  }
  await assert.rejects(db.query("insert into public.student_saves(code,save_data,save_version) values('EC-0000-OOOO','{}',9)"),/check constraint/);
  await assert.rejects(db.query("insert into public.student_saves(code,save_data,save_version) values('EC-2222-3333','[]',9)"),/check constraint/);
});
test('production handler and SQL create/load/save work over HTTP from two empty client contexts',async()=>{
  const server=await serve(setup.rpc);try{
    const a=game(),b=game(),input=student(a.c),before=JSON.stringify(input);
    a.storage.set('echo:EC9001','untouched-local');a.storage.set('echo:__index','["EC9001"]');a.storage.set('echo:__last','EC9001');
    const localBefore=plain([...a.storage]),stateBefore=JSON.stringify(a.c.S);
    assert.equal(a.cloudFetches,0);assert.equal(b.storage.size,0);
    const config={projectUrl:server.url,publishableKey:publicKey};
    const ca=a.c.CloudSave.createClient(config),cb=b.c.CloudSave.createClient(config);
    const made=await ca.create(input);assert.equal(made.ok,true);assert.equal(made.revision,1);assert.equal(made.saveVersion,9);
    const la=await ca.load(made.code),lb=await cb.load(made.code.toLowerCase().replaceAll('-',''));
    assert.equal(la.ok,true);assert.equal(lb.ok,true);assert.deepEqual(plain(la.saveData),plain(lb.saveData));
    assert.equal(lb.saveData.code,'EC9001','cloud bearer code does not replace the local EC code');
    const changed=plain(la.saveData);changed.gold=321;changed.tower={best:18,bestTime:462,runs:2,history:[]};
    const saved=await ca.save(made.code,changed,la.revision);assert.equal(saved.ok,true);assert.equal(saved.revision,2);
    const stale=await cb.save(made.code,lb.saveData,lb.revision);assert.equal(stale.error,'REVISION_CONFLICT');assert.equal(stale.serverRevision,2);
    const latest=await cb.load(made.code);assert.equal(latest.saveData.gold,321);assert.equal(latest.saveData.tower.best,18);
    assert.deepEqual(plain([...a.storage].filter(([k])=>k!=='eco:cloud:device')),localBefore);assert.equal(b.storage.size,1);assert.equal(JSON.stringify(a.c.S),stateBefore);assert.equal(JSON.stringify(input),before);
    assert.equal(a.logs.length,0);assert.equal(b.logs.length,1);assert.ok(!JSON.stringify(b.logs).includes(made.code));
  }finally{await server.close();}
});
test('atomic expectedRevision guard permits one concurrent winner, never an older overwrite',async()=>{
  const made=await call({action:'create',saveData:data(),saveVersion:9});
  const a=data(),b=data();a.gold=333;b.gold=444;
  const results=await Promise.all([call({action:'save',code:made.code,saveData:a,saveVersion:9,expectedRevision:1}),call({action:'save',code:made.code,saveData:b,saveVersion:9,expectedRevision:1})]);
  assert.equal(results.filter(r=>r.ok).length,1);const conflict=results.find(r=>!r.ok);
  assert.equal(conflict.status,409);assert.equal(conflict.error,'REVISION_CONFLICT');assert.equal(conflict.serverRevision,2);
  const latest=await call({action:'load',code:made.code});assert.equal(latest.revision,2);assert.equal(latest.saveData.gold,results[0].ok?333:444);
});
test('duplicate generated codes retry safely without changing an existing student',async()=>{
  const duplicate='2B2B2B';await setup.rpc('student_save_create',{p_code:duplicate,p_save_data:{name:'reserved'},p_save_version:9});
  let calls=0;const random={getRandomValues(a){a.set(Array.from({length:16},(_,i)=>i%2?9:(calls?1:0)));calls++;return a;}};
  const h=createHandler({secret:testSecret,rpc:setup.rpc,publicKeys:[publicKey],allowedOrigins:[origin],random});
  const result=await(await h(request({action:'create',saveData:{name:'TEST-new'},saveVersion:9}))).json();assert.equal(result.ok,true);assert.notEqual(result.code,duplicate);
  assert.equal((await setup.rpc('student_save_load',{p_code:duplicate})).saveData.name,'reserved');
});
test('soft-deleted rows are invisible to load/save and remain in the database',async()=>{
  const made=await call({action:'create',saveData:data(),saveVersion:9});
  await setup.db.query('update public.student_saves set deleted_at=now() where code=$1',[made.code]);
  for(const action of ['load','save']){const r=await call({action,code:made.code,saveData:data(),saveVersion:9,expectedRevision:1});assert.equal(r.error,'NOT_FOUND');}
  assert.equal((await setup.db.query('select count(*)::int as n from public.student_saves where code=$1',[made.code])).rows[0].n,1);
});
test('invalid code/JSON/version/revision/size and non-JSON requests never reach the database',async()=>{
  let calls=0;const h=createHandler({secret:testSecret,rpc:async()=>{calls++;throw Error('must not call');},publicKeys:[publicKey],allowedOrigins:[origin]});
  for(const body of [{action:'load',code:'EC1234'},{action:'create',saveData:[],saveVersion:9},{action:'create',saveData:{},saveVersion:0},
    {action:'create',saveData:{saveVersion:8},saveVersion:9},{action:'create',saveData:{email:'private@example.test'},saveVersion:9},
    {action:'save',code:'K7M4P2',saveData:{},saveVersion:9,expectedRevision:1.5},
    {action:'create',saveData:{name:'x'.repeat(131073)},saveVersion:9}])assert.equal((await h(request(body))).status,400);
  assert.equal((await h(new Request('https://example.test',{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:'{broken'}))).status,400);
  assert.equal((await h(request({}, {headers:{'Content-Type':'text/plain'}}))).status,400);assert.equal(calls,0);
});
test('CORS/preflight/project-key/config failures fail closed; responses are never cacheable',async()=>{
  const pre=await handler(new Request('https://example.test',{method:'OPTIONS',headers:{Origin:origin}}));assert.equal(pre.status,204);assert.equal(pre.headers.get('Access-Control-Allow-Origin'),origin);
  assert.equal((await handler(request({action:'load',code:'K7M4P2'},{headers:{Origin:'https://other.test'}}))).status,403);
  assert.equal((await handler(request({},{headers:{apikey:'wrong'}}))).status,401);
  const r=await handler(request({action:'load',code:'K7M4P2'}));assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(r.status,404);
  assert.equal((await createHandler({publicKeys:[],allowedOrigins:[],rpc:null})(new Request('https://example.test',{method:'POST'}))).status,503);
});
test('backend exceptions and malformed replies disclose neither student data nor SQL details',async()=>{
  const logs=[],payload=data();payload.name='PRIVATE-STUDENT-MARKER';
  const h=createHandler({secret:testSecret,rpc:async()=>{throw Error('sensitive SQL and PRIVATE-STUDENT-MARKER');},publicKeys:[publicKey],allowedOrigins:[origin],logger:{error(...args){logs.push(args);}}});
  const r=await h(request({action:'save',code:'K7M4P2',saveData:payload,saveVersion:9,expectedRevision:1}));
  assert.deepEqual(await r.json(),{ok:false,error:'SERVER_UNAVAILABLE'});assert.ok(!JSON.stringify(logs).includes('PRIVATE-STUDENT'));assert.ok(!JSON.stringify(logs).includes('K7M4P2'));
});
test('client is inert on load, remembers no code and uses public configuration independently of Presence',async()=>{
  const g=game();assert.equal(g.cloudFetches,0);assert.equal([...g.storage.keys()].filter(k=>k!=='eco:cloud:device').length,0);
  g.c.ecoSupabase={status:'failed',client:null,publicConfig:{projectUrl:'https://example.test',publishableKey:publicKey}};
  const off=g.c.CloudSave.createClient({projectUrl:'https://example.test',publishableKey:'sb_secret_do_not_accept',fetch:()=>{throw Error('never');}});
  assert.equal((await off.create(student(g.c))).error,'NOT_CONFIGURED');assert.equal([...g.storage.keys()].filter(k=>k!=='eco:cloud:device').length,0);
  assert.doesNotMatch(read('js/cloud-save.js'),/\.from\(['"]student_saves|\.channel\(/);
});
test('client uses the existing v9 migration for legacy cloud data and refuses future/inconsistent data',async()=>{
  const g=game(),old=JSON.parse(read('tests/fixtures/legacy-save/last-week.json'));delete old.saveVersion;
  const reply={ok:true,code:'K7M4P2',revision:1,saveVersion:8,updatedAt:new Date().toISOString(),saveData:old};
  const client=g.c.CloudSave.createClient({projectUrl:'https://example.test',publishableKey:publicKey,fetch:async()=>Response.json(reply)});
  const loaded=await client.load(reply.code);assert.equal(loaded.ok,true);assert.equal(loaded.saveVersion,9);assert.equal(loaded.storedSaveVersion,8);assert.equal(loaded.saveData.lv,old.lv);assert.equal(loaded.saveData.tower.best,old.tower.best);
  reply.saveVersion=10;reply.saveData.v=10;assert.equal((await client.load(reply.code)).error,'UNSUPPORTED_SAVE_VERSION');
  reply.saveVersion=9;assert.equal((await client.load(reply.code)).error,'INVALID_RESPONSE');assert.equal([...g.storage.keys()].filter(k=>k!=='eco:cloud:device').length,0);
});
test('client timeouts include response reads and handle offline/invalid responses without changing local saves',async()=>{
  const g=game();g.storage.set('echo:EC9001','original');
  const config={projectUrl:'https://example.test',publishableKey:publicKey,timeoutMs:20};
  const hangs=g.c.CloudSave.createClient({...config,fetch:()=>new Promise(()=>{})});assert.equal((await hangs.load('K7M4P2')).error,'TIMEOUT');
  const offline=g.c.CloudSave.createClient({...config,fetch:async()=>{throw Error('offline private details');}});assert.equal((await offline.load('K7M4P2')).error,'NETWORK_ERROR');
  const bad=g.c.CloudSave.createClient({...config,fetch:async()=>new Response('<html>error</html>')});assert.equal((await bad.load('K7M4P2')).error,'INVALID_RESPONSE');
  const bodyHangs=g.c.CloudSave.createClient({...config,fetch:async()=>new Response(new ReadableStream({start(){}}))});assert.equal((await bodyHangs.load('K7M4P2')).error,'TIMEOUT');
  assert.equal(g.storage.get('echo:EC9001'),'original');assert.ok(!JSON.stringify(g.logs).includes('private details'));
});
test('Edge REST adapter uses only a backend key and has an independent request deadline',async()=>{
  let seen;
  const rpc=createRpc({url:'https://example.test',key:'test-server-token',fetcher:async(url,args)=>{seen={url,args};return Response.json({ok:true});}});
  assert.deepEqual(await rpc('student_save_load',{p_code:'K7M4P2'}),{ok:true});assert.equal(seen.args.headers.Authorization,'Bearer test-server-token');
  assert.ok(!seen.url.includes('EC-'));assert.deepEqual(JSON.parse(seen.args.body),{p_code:'K7M4P2'});
  await assert.rejects(createRpc({url:'https://example.test',key:'test-server-token',timeoutMs:10,fetcher:()=>new Promise(()=>{})})('student_save_load',{}),/TIMEOUT/);
});
test('no credential literals are present and CloudSave remains an opt-in addition',()=>{
  const files=[];function visit(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){if(['.git','node_modules','assets','_unused_assets'].includes(entry.name))continue;const file=path.join(directory,entry.name);if(entry.isDirectory())visit(file);else if(/\.(?:js|mjs|cjs|ts|json|html|md|toml|sql)$/.test(entry.name))files.push(file);}}
  visit(root);
  for(const file of files){const text=fs.readFileSync(file,'utf8');
    assert.doesNotMatch(text,/sb_secret_[A-Za-z0-9_-]{24,}/,file);
    assert.doesNotMatch(text,/postgres(?:ql)?:\/\/[^\s'"/]+:[^\s'"@]+@/,file);
    for(const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){let claims;try{claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());}catch{}assert.notEqual(claims?.role,'service_role',file);}
  }
  const source=read('js/cloud-save.js');assert.doesNotMatch(source,/\.rpc\(|\.channel\(|Save\.save\(/);
  assert.doesNotMatch(read('js/game.js'),/CloudSave\./);
});
