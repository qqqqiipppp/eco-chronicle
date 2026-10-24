import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {randomUUID,webcrypto} from 'node:crypto';
import {game,student,database,serve,read,plain} from './helpers/cloud-save-runtime.mjs';
let setup,server;
before(async()=>{setup=await database(true);server=await serve(setup.rpc);});
after(async()=>{await server.close();await setup.db.close();});
function client(config={}){
  const g=game(),c=g.c;let online=true,seq=0;const timers=new Map();
  vm.runInContext(read('js/cloud-sync.js'),c);
  const base=c.CloudSave.createClient({projectUrl:server.url,publishableKey:'sb_publishable_test_only'});
  let api=Object.assign({},base,config.api||{});
  function build(){return c.EcoCloudSync.create({api,storage:c.localStorage,state:()=>c.S,localLoad:code=>c.Save.load(code),
    resume:state=>{c.S=c.migrate(state);return true;},uuid:randomUUID,online:()=>online,
    setTimeout:(fn,ms)=>{timers.set(++seq,{fn,ms});return seq;},clearTimeout:id=>timers.delete(id)});}
  let sync=build();
  return {g,c,base,api,timers,get sync(){return sync;},setOnline:value=>online=value,
    restart(){sync.stop();sync=build();return sync;},
    local(state){c.S=state;c.Save.save();sync.afterLocal(c.S);},
    async legacy(){c.S=student(c);c.Save.save();return sync.resumeLocal(c.S.code);}};
}
async function linked(){const x=client();await x.legacy();assert.equal((await x.sync.promote()).ok,true);return x;}
test('idempotent create retries and concurrent retries return exactly one code/row without rewriting data',async()=>{
  const a=client(),state=student(a.c),id=randomUUID();
  const results=await Promise.all([a.base.create(state,id),a.base.create({...state,gold:777},id)]);
  assert.ok(results.every(r=>r.ok));assert.equal(results[0].code,results[1].code);
  assert.equal((await setup.db.query('select count(*)::int as n from public.student_saves where create_request_id=$1',[id])).rows[0].n,1);
  const loaded=await a.base.load(results[0].code);assert.equal(loaded.saveData.gold,state.gold);
  const updated=await a.base.save(results[0].code,{...state,gold:801},1);
  const retried=await a.base.create(state,id);assert.equal(retried.revision,updated.revision);
  assert.equal((await a.base.load(results[0].code)).saveData.gold,801);
});
test('legacy promotion keeps original slot byte-for-byte; secrets stay out of student data and ordinary keys',async()=>{
  const a=client();await a.legacy();const before=a.g.storage.get('echo:EC9001');
  const result=await a.sync.promote();assert.equal(result.ok,true);
  assert.equal(a.g.storage.get('echo:EC9001'),before);assert.equal(a.c.S.code,'EC9001');
  assert.equal(a.c.S.cloudCode,undefined);const v=a.sync.view();assert.equal(v.revision,1);
  assert.equal(JSON.stringify(a.c.S).includes(v.code),false);
  assert.ok([...a.g.storage.keys()].every(k=>!k.includes(v.code)));
  const loaded=await a.base.load(v.code);assert.ok(a.sync.equal(loaded.saveData,a.c.S));
});
test('new student creation failure preserves local progress/request id, then resumes one creation after reload',async()=>{
  const a=client();await a.legacy();let lose=true;
  a.api.create=async(...args)=>{const r=await a.base.create(...args);return lose?{ok:false,error:'TIMEOUT'}:r;};
  const first=await a.sync.promote();assert.equal(first.ok,false);assert.equal(a.sync.view().code,null);
  const id=Object.values(JSON.parse(a.g.storage.get('echo:__cloud_links')))[0].createRequestId;
  assert.ok(id);a.c.S.gold=250;a.local(a.c.S);a.restart();lose=false;
  await a.sync.resumeLocal('EC9001');await a.sync.flush();await a.sync.flush();
  assert.equal((await setup.db.query('select count(*)::int as n from public.student_saves where create_request_id=$1',[id])).rows[0].n,1);
  assert.equal((await a.base.load(a.sync.view().code)).saveData.gold,250);
});
test('empty other device loads same progress, isolates colliding S.code and keeps local index intact',async()=>{
  const a=await linked(),b=client(),code=a.sync.view().code;
  b.g.storage.set('echo:EC9001','other-student-untouched');b.g.storage.set('echo:__index','["EC9001"]');
  assert.equal((await b.sync.loadCode(code.toLowerCase().replaceAll('-',''))).ok,true);
  assert.equal(b.c.S.code,'EC9001');assert.ok(a.sync.equal(a.c.S,b.c.S));
  b.c.S.gold=555;assert.equal(b.sync.saveLocal(b.c.S),'disk');await b.sync.flush();
  assert.equal(b.g.storage.get('echo:EC9001'),'other-student-untouched');
  assert.equal(b.g.storage.get('echo:__index'),'["EC9001"]');
  assert.equal((await b.base.load(code)).saveData.gold,555);
});
test('many local saves debounce into latest snapshot; unchanged saves do not dirty and at most one server writer',async()=>{
  const a=await linked();let calls=0,active=0,max=0;
  a.api.save=async(...args)=>{calls++;active++;max=Math.max(max,active);try{return await a.base.save(...args);}finally{active--;}};
  a.local(a.c.S);assert.equal(a.sync.view().pending,false);
  for(let i=0;i<12;i++){a.c.S.gold=300+i;a.local(a.c.S);}
  assert.equal(calls,0);assert.equal(a.timers.size,1);assert.equal([...a.timers.values()][0].ms,1500);
  await Promise.all([a.sync.flush(),a.sync.flush(),a.sync.flush()]);
  assert.equal(calls,1);assert.equal(max,1);assert.equal(a.sync.view().pending,false);
  assert.equal((await a.base.load(a.sync.view().code)).saveData.gold,311);
});
test('a local change during in-flight write is retained and sent once afterward',async()=>{
  const a=await linked();let release;const gate=new Promise(r=>release=r);
  a.api.save=async(...args)=>{await gate;return a.base.save(...args);};
  a.c.S.gold=501;a.local(a.c.S);const saving=a.sync.flush();
  a.c.S.gold=502;a.local(a.c.S);release();await saving;
  assert.equal(a.sync.view().pending,true);assert.equal(a.sync.view().revision,2);
  await a.sync.flush();assert.equal(a.sync.view().pending,false);
  assert.equal((await a.base.load(a.sync.view().code)).saveData.gold,502);
});
test('offline progress survives reload in one cache and synchronizes on reconnect with latest revision',async()=>{
  const a=await linked(),b=client(),code=a.sync.view().code;await b.sync.loadCode(code);b.setOnline(false);
  b.c.S.gold=700;b.sync.saveLocal(b.c.S);assert.equal((await b.sync.flush()).ok,false);
  assert.equal(b.sync.view().pending,true);b.restart();
  assert.equal((await b.sync.loadCode(code)).offline,true);assert.equal(b.c.S.gold,700);
  b.setOnline(true);await b.sync.flush();assert.equal(b.sync.view().pending,false);
  assert.equal((await a.base.load(code)).saveData.gold,700);
  assert.equal([...b.g.storage.keys()].filter(k=>k.startsWith('echo:cloud:')).length,1);
});
test('a new offline device fails safely without inventing progress or a character',async()=>{
  const a=client();a.setOnline(false);const before=JSON.stringify(a.c.S);
  assert.equal((await a.sync.loadCode('EC-7K4P-2Q9M')).ok,false);assert.equal(JSON.stringify(a.c.S),before);
});
test('linked local resume reads newer server, preserves internal code and migrates via current rules',async()=>{
  const a=await linked(),code=a.sync.view().code,serverState=(await a.base.load(code)).saveData;
  serverState.gold=890;await a.base.save(code,serverState,1);a.restart();
  assert.equal((await a.sync.resumeLocal('EC9001')).ok,true);assert.equal(a.c.S.gold,890);assert.equal(a.sync.view().revision,2);
});
test('lost save response is reconciled by stable data equality without conflict UI or another overwrite',async()=>{
  const a=await linked();let lose=true,conflicts=0;
  a.sync.on(type=>{if(type==='conflict')conflicts++;});
  a.api.save=async(...args)=>{const r=await a.base.save(...args);if(lose){lose=false;return {ok:false,error:'TIMEOUT'};}return r;};
  a.c.S.gold=667;a.local(a.c.S);assert.equal((await a.sync.flush()).ok,false);
  assert.equal(a.sync.view().revision,1);assert.equal(a.sync.view().pending,true);
  assert.equal((await a.sync.flush()).recovered,true);assert.equal(a.sync.view().revision,2);
  assert.equal(a.sync.view().pending,false);assert.equal(conflicts,0);
});
test('real two-device conflict never overwrites automatically; server choice backs up latest local changes',async()=>{
  const a=await linked(),b=client(),code=a.sync.view().code;await b.sync.loadCode(code);
  a.c.S.gold=601;a.local(a.c.S);await a.sync.flush();b.c.S.gold=602;b.sync.saveLocal(b.c.S);
  assert.equal((await b.sync.flush()).error,'REVISION_CONFLICT');assert.equal(b.sync.view().status,'conflict');
  assert.equal((await a.base.load(code)).saveData.gold,601);
  b.c.S.gold=603;b.sync.saveLocal(b.c.S);
  assert.equal((await b.sync.choose('server')).ok,true);assert.equal(b.c.S.gold,601);assert.equal(b.sync.view().pending,false);
  const backup=JSON.parse([...b.g.storage].find(([k])=>k.startsWith('echo:cloud-conflict:'))[1]);assert.equal(backup.at(-1).state.gold,603);
});
test('device choice explicitly uses freshly loaded revision and backs up server; repeated competing write stops',async()=>{
  const a=await linked(),b=client(),code=a.sync.view().code;await b.sync.loadCode(code);
  a.c.S.gold=610;a.local(a.c.S);await a.sync.flush();b.c.S.gold=620;b.sync.saveLocal(b.c.S);await b.sync.flush();
  a.c.S.gold=611;a.local(a.c.S);await a.sync.flush();
  assert.equal((await b.sync.choose('device')).ok,true);assert.equal((await a.base.load(code)).saveData.gold,620);
  const backup=JSON.parse([...b.g.storage].find(([k])=>k.startsWith('echo:cloud-conflict:'))[1]);assert.equal(backup.at(-1).state.gold,611);
});
test('storage quota during promotion prevents server create and never alters the old student slot',async()=>{
  const a=client();await a.legacy();const original=a.g.storage.get('echo:EC9001');let calls=0;
  a.c.localStorage.setItem=()=>{throw Error('QuotaExceededError');};a.api.create=async()=>{calls++;return {ok:false};};
  assert.equal((await a.sync.promote()).error,'STORAGE_FULL');assert.equal(calls,0);
  assert.equal(a.g.storage.get('echo:EC9001'),original);
});
test('storage quota blocks a destructive conflict choice when its backup cannot be confirmed',async()=>{
  const a=await linked(),b=client();await b.sync.loadCode(a.sync.view().code);
  a.c.S.gold=1;a.local(a.c.S);await a.sync.flush();b.c.S.gold=2;b.sync.saveLocal(b.c.S);await b.sync.flush();
  b.c.localStorage.setItem=()=>{throw Error('full');};
  assert.equal((await b.sync.choose('server')).error,'STORAGE_FULL');assert.equal(b.c.S.gold,2);
});
test('malformed idempotency identifiers are rejected; anon cannot invoke the new RPC',async()=>{
  const a=client();assert.equal((await a.base.create(student(a.c),'bad')).error,'INVALID_REQUEST');
  for(const role of ['anon','authenticated'])await assert.rejects(setup.db.transaction(async tx=>{
    await tx.exec('set local role '+role);return tx.query("select public.student_save_create_once('EC-2222-3333','{}',9,$1)",[randomUUID()]);
  }),/permission denied/);
});
test('a failed game resume reports failure and cannot silently claim a successful load',async()=>{
  const a=await linked(),b=game();b.c.crypto=webcrypto;
  b.c.CloudSave=b.c.CloudSave.createClient({projectUrl:server.url,publishableKey:'sb_publishable_test_only'});
  b.c.resumeSaveState=()=>false;vm.runInContext(read('js/cloud-sync.js'),b.c);
  assert.equal((await b.c.CloudSync.loadCode(a.sync.view().code)).error,'INVALID_SAVE_DATA');
  assert.equal(b.c.CloudSession.active,false);assert.equal(b.c.S.code,'');
});
test('installed Save.save hook writes imported backups without touching colliding legacy slots, including storage failure',async()=>{
  const a=await linked(),b=game();b.c.crypto=webcrypto;
  b.c.CloudSave=b.c.CloudSave.createClient({projectUrl:server.url,publishableKey:'sb_publishable_test_only'});
  b.c.resumeSaveState=state=>{b.c.S=state;b.c.Save.save();return true;};
  vm.runInContext(read('js/cloud-sync.js'),b.c);b.storage.set('echo:EC9001','another-original-student');
  await b.c.CloudSync.loadCode(a.sync.view().code);b.c.S.gold=456;
  assert.equal(b.c.Save.save(),'disk');assert.equal(b.storage.get('echo:EC9001'),'another-original-student');
  await b.c.CloudSync.flush();assert.equal((await a.base.load(a.sync.view().code)).saveData.gold,456);
  b.c.localStorage.setItem=()=>{throw Error('full');};b.c.S.gold=457;
  assert.equal(b.c.Save.save(),'mem');assert.equal(b.storage.get('echo:EC9001'),'another-original-student');
  await b.c.CloudSync.flush();assert.equal((await a.base.load(a.sync.view().code)).saveData.gold,457);
  b.c.CloudSync.stop();
  b.c.S.gold=458;assert.equal(b.c.Save.save(),'mem');
  assert.equal(b.storage.get('echo:EC9001'),'another-original-student','even unload after session stop cannot escape its cloud cache');
});
test('conflict backups are bounded at three per student across repeated choices',async()=>{
  const a=await linked(),b=client(),code=a.sync.view().code;await b.sync.loadCode(code);
  for(let i=0;i<5;i++){
    let serverState=(await a.base.load(code)).saveData;serverState.gold=1000+i;
    let rev=(await a.base.load(code)).revision;await a.base.save(code,serverState,rev);
    b.c.S.gold=2000+i;b.sync.saveLocal(b.c.S);await b.sync.flush();assert.ok(b.sync.view().conflict);
    await b.sync.choose('device');
  }
  const backups=JSON.parse([...b.g.storage].find(([k])=>k.startsWith('echo:cloud-conflict:'))[1]);assert.equal(backups.length,3);
});
test('clean and pending linked startups do not fallback over a missing server record',async()=>{
  const a=await linked(),code=a.sync.view().code,before=a.g.storage.get('echo:EC9001');
  await setup.db.query('update public.student_saves set deleted_at=now() where code=$1',[code]);a.restart();
  assert.equal((await a.sync.resumeLocal('EC9001')).error,'NOT_FOUND');assert.equal(a.sync.view().active,false);
  assert.equal(a.g.storage.get('echo:EC9001'),before);
});
test('an inconsistent internal code from the server cannot overwrite a different existing student slot',async()=>{
  const a=await linked(),code=a.sync.view().code,original=a.g.storage.get('echo:EC9001');
  const changed=student(a.c);changed.code='EC1234';await a.base.save(code,changed,1);
  a.g.storage.set('echo:EC1234','other-student-preserved');a.restart();
  assert.equal((await a.sync.resumeLocal('EC9001')).error,'INVALID_SAVE_DATA');
  assert.equal(a.g.storage.get('echo:EC9001'),original);assert.equal(a.g.storage.get('echo:EC1234'),'other-student-preserved');
});
test('a future-version create recovery cannot down-save newer server progress',async()=>{
  const a=client();await a.legacy();
  a.api.create=async(...args)=>{
    const result=await a.base.create(...args);
    const future={...plain(a.c.S),v:10,saveVersion:10,futureProgress:{keep:true}};
    await setup.rpc('student_save_update',{p_code:result.code,p_save_data:future,p_save_version:10,p_expected_revision:1});
    return result;
  };
  await a.sync.promote();assert.equal((await a.sync.flush()).error,'INVALID_SAVE_DATA');
  const row=await setup.rpc('student_save_load',{p_code:a.sync.view().code});
  assert.equal(row.saveVersion,10);assert.equal(row.saveData.futureProgress.keep,true);
});
