import test,{before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';
import {database,testSecret,game,read,student,plain} from './helpers/cloud-save-runtime.mjs';
import {createHandler,generateCode,normalizeCode} from '../supabase/functions/student-save/handler.mjs';
import {createSecurity} from '../supabase/functions/student-save/security.mjs';
let db,h1,h2;const key='sb_publishable_test_only',origin='https://fixture.invalid';
before(async()=>{db=await database(true);h1=handler();h2=handler();});
after(async()=>db.db.close());
beforeEach(async()=>db.db.exec('truncate public.student_save_rate_limits'));
function handler(){return createHandler({rpc:db.rpc,secret:testSecret,publicKeys:[key],allowedOrigins:[origin],logger:{error(){}}});}
async function call(body,{device=randomUUID(),ip='192.0.2.30',token,handler=h1}={}){
  const headers={apikey:key,Origin:origin,'Content-Type':'application/json','x-eco-device':device,'x-forwarded-for':ip};
  if(token)headers['x-eco-resume']=token;
  const r=await handler(new Request(origin,{method:'POST',headers,body:JSON.stringify(body)}));
  return {...await r.json(),status:r.status,retry:r.headers.get('Retry-After')};
}
test('new codes are six mixed characters; old/manual ambiguous codes are rejected',()=>{
  for(const value of ['EC-7K4P-2Q9M','K7M0P2','K7M1P2','K7MOP2','K7MIP2','ABCDEF','234567','K7-M4P2'])assert.equal(normalizeCode(value),null);
  assert.equal(normalizeCode('  k7m4p2  '),'K7M4P2');
  assert.throws(()=>generateCode({getRandomValues(a){return a.fill(0);}}),/RANDOM_UNAVAILABLE/);
});
test('shared persistent limiter applies across cold handlers, not only one instance',async()=>{
  const device=randomUUID();
  const replies=await Promise.all(Array.from({length:20},(_,i)=>call({action:'load',code:'Z9Z9Z9'},{device,handler:i%2?h1:h2})));
  assert.equal(replies.filter(r=>r.status===404).length,8);
  assert.equal(replies.filter(r=>r.status===429).length,12);
  for(const r of replies.filter(r=>r.status===429)){assert.ok(+r.retry>0);assert.equal(+r.retry,r.retryAfter);assert.equal(r.code,undefined);}
});
test('rotating device IDs does not evade a code budget, or shared-IP failure budget',async()=>{
  for(let i=0;i<12;i++)assert.equal((await call({action:'load',code:'Z8Z8Z8'})).status,404);
  assert.equal((await call({action:'load',code:'Z8Z8Z8'})).status,429);
  await db.db.exec('truncate public.student_save_rate_limits');
  const ipHash=(await createSecurity(testSecret).identities(new Request(origin,{headers:{'x-forwarded-for':'192.0.2.30'}}),'')).ip;
  await db.db.query("insert into public.student_save_rate_limits values('fail-ip-hour',$1,floor(extract(epoch from clock_timestamp())/3600)::bigint*3600,598,now()+interval '1 hour')",[ipHash]);
  const replies=[];
  for(let i=0;i<6;i++)replies.push(await call({action:'load',code:generateCode()}));
  assert.equal(replies.filter(r=>r.status===404).length,2);
  assert.equal(replies.filter(r=>r.status===429).length,4);
});
test('distributed identities are bounded by global persistent failure quotas',async()=>{
  // Seed ONLY the isolated DB near a global ceiling, then test different IPs/codes/devices.
  await db.db.query("insert into public.student_save_rate_limits values('fail-global-hour','global',floor(extract(epoch from clock_timestamp())/3600)::bigint*3600,598,to_timestamp((floor(extract(epoch from clock_timestamp())/3600)+1)*3600))");
  const results=[];for(let i=0;i<6;i++)results.push(await call({action:'load',code:generateCode()},{ip:'198.51.100.'+i}));
  assert.equal(results.filter(r=>r.status===404).length,2);assert.equal(results.filter(r=>r.status===429).length,4);
});
test('same-IP classroom: 30 students create/load then 1200 authenticated saves without 429',async()=>{
  const students=await Promise.all(Array.from({length:30},async()=>{
    const device=randomUUID(),g=game(),s=plain(g.c.CloudSave.snapshot(student(g.c)));
    for(let typo=0;typo<3;typo++)assert.equal((await call({action:'load',code:generateCode()},{device})).status,404);
    const made=await call({action:'create',createRequestId:randomUUID(),saveData:s,saveVersion:9},{device});assert.equal(made.ok,true,made.error);
    // Independent new browser enters the code without a proof, then remembers the new proof.
    const loaded=await call({action:'load',code:made.code},{device});assert.equal(loaded.ok,true);
    return {device,code:made.code,token:loaded.resumeToken,rev:loaded.revision,state:s};
  }));
  let writes=0;
  for(let turn=0;turn<40;turn++)await Promise.all(students.map(async s=>{
    s.state.gold++;
    const r=await call({action:'save',code:s.code,expectedRevision:s.rev,saveVersion:9,saveData:s.state},{device:s.device,token:s.token,handler:turn%2?h1:h2});
    assert.equal(r.ok,true);s.rev=r.revision;s.token=r.resumeToken;writes++;
  }));
  assert.equal(writes,1200);
  assert.equal((await db.db.query("select coalesce(sum(hits),0)::int as hits from public.student_save_rate_limits where scope='fail-global-hour'")).rows[0].hits,90,'only the deliberate typos count, not normal saves');
});
test('attack-exhausted guessing budgets do not lock students with valid resume proof',async()=>{
  const device=randomUUID(),made=await call({action:'create',saveData:{name:'TEST'},saveVersion:9},{device});assert.equal(made.ok,true);
  await db.db.query("insert into public.student_save_rate_limits values('fail-ip-hour',$1,floor(extract(epoch from clock_timestamp())/3600)::bigint*3600,600,now()+interval '1 hour')",[(await createSecurity(testSecret).identities(new Request(origin,{headers:{'x-forwarded-for':'192.0.2.30'}}),'')).ip]);
  assert.equal((await call({action:'load',code:generateCode()})).status,429);
  assert.equal((await call({action:'load',code:made.code},{device,token:made.resumeToken,handler:h2})).ok,true);
});
test('resume proof is signed, expiring and bound to the code and device',async()=>{
  let now=Date.now();const sec=createSecurity(testSecret,{now:()=>now});
  const token=await sec.issue('K7M4P2','device-A');assert.equal(await sec.verify(token,'K7M4P2','device-A'),true);
  for(const [t,c,d] of [[token,'K7M4P3','device-A'],[token,'K7M4P2','device-B'],[token.slice(0,-2)+'zz','K7M4P2','device-A']])assert.equal(await sec.verify(t,c,d),false);
  now+=31*86400000;assert.equal(await sec.verify(token,'K7M4P2','device-A'),false);
});
test('general ceilings still limit signed clients, and rate data cannot be read by browsers',async()=>{
  const device=randomUUID(),made=await call({action:'create',saveData:{},saveVersion:9},{device});
  await db.db.query("update public.student_save_rate_limits set hits=120 where scope='request-device'");
  assert.equal((await call({action:'load',code:made.code},{device,token:made.resumeToken})).status,429);
  for(const role of ['anon','authenticated']){
    for(const priv of ['SELECT','INSERT','UPDATE','DELETE'])assert.equal((await db.db.query('select has_table_privilege($1,$2,$3)as ok',[role,'public.student_save_rate_limits',priv])).rows[0].ok,false);
    assert.equal((await db.db.query("select has_function_privilege($1,'public.student_save_guarded(text,text,jsonb,integer,bigint,uuid,text,text,text,boolean)','EXECUTE')as ok",[role])).rows[0].ok,false);
  }
  assert.equal((await db.db.query("select relrowsecurity and relforcerowsecurity as ok from pg_class where oid='public.student_save_rate_limits'::regclass")).rows[0].ok,true);
});
test('legacy linked device records and pending backups survive without accepting old cloud input',async()=>{
  const g=game(),state=student(g.c),id=randomUUID(),old='EC-7K4P-2Q9M',link={id,localCode:state.code,cloudCode:old,kind:'cache',revision:7,pendingSync:true};
  g.storage.set('echo:__cloud_links',JSON.stringify({[id]:link}));g.storage.set('echo:cloud:'+id,JSON.stringify({localCode:state.code,cloudCode:old,state,pendingSync:true,revision:7}));
  const before=g.storage.get('echo:cloud:'+id);let calls=0;
  vm.runInContext(read('js/cloud-sync.js'),g.c);
  const api={...g.c.CloudSave,load:async()=>{calls++;throw Error('must stay local');}};
  const sync=g.c.EcoCloudSync.create({api,storage:g.c.localStorage,state:()=>g.c.S,localLoad:()=>null,resume:s=>{g.c.S=s;return true;},uuid:randomUUID});
  assert.equal(sync.entries().length,1);assert.equal((await sync.resumeEntry(id)).ok,true);assert.equal(sync.view().relink,true);assert.equal(calls,0);
  assert.equal((await sync.loadCode(old)).error,'INVALID_CODE');assert.equal(g.storage.get('echo:cloud:'+id),before);
  assert.equal((await sync.flush()).ok,false);assert.equal(g.c.S.lv,state.lv);assert.equal(g.c.S.tower.best,state.tower.best);
});
test('429 keeps local/pending saves and honors Retry-After without extra network attempts',async()=>{
  const g=game();let calls=0;
  const client=g.c.CloudSave.createClient({projectUrl:origin,publishableKey:key,fetch:async()=>{calls++;return Response.json({ok:false,error:'RATE_LIMITED',retryAfter:90},{status:429,headers:{'Retry-After':'90'}});}});
  const first=await client.load('K7M4P2');assert.equal(first.retryAfter,90);assert.equal((await client.load('K7M4P2')).error,'RATE_LIMITED');assert.equal(calls,1);
  assert.doesNotMatch(JSON.stringify(g.logs),/K7M4P2|resumeToken/);
});
