import test,{before,after} from 'node:test';import assert from 'node:assert/strict';import {randomUUID,webcrypto} from 'node:crypto';import vm from 'node:vm';
import {adminDatabase,adminApi} from './helpers/admin-runtime.mjs';
import {game,plain,read,serve} from './helpers/cloud-save-runtime.mjs';
import catalog from '../supabase/functions/student-admin/catalog.mjs';
import {validateStudent,initialStudent} from '../supabase/functions/student-admin/validation.mjs';
import {createAuthVerifier} from '../supabase/functions/student-admin/handler.mjs';
let db,api;
before(async()=>{db=await adminDatabase();api=adminApi(db);});after(async()=>db.db.close());
const create=(name='TEST-A1',extra={})=>api.call({action:'create',name,petKey:'earth',createRequestId:randomUUID(),...extra});
const get=id=>api.call({action:'get',id});
async function raw(code){return db.rpc('student_save_load',{p_code:code});}
async function change(row,patch){const detail=await get(row.id);return api.call({action:'update',id:row.id,expectedRevision:detail.student.revision,saveData:{...detail.student.saveData,...patch}});}
test('canonical initial state and generated limits/IDs agree with the actual game',()=>{
  const {c}=game(),initial=initialStudent('TEST-A1','earth',webcrypto),expected=c.newState();delete expected.scene;delete expected.modal;expected.name=initial.name;expected.petKey=initial.petKey;expected.code=initial.code;
  assert.deepEqual(plain(initial),plain(expected));assert.equal(catalog.maxLevel,c.MAX_LV);assert.deepEqual(catalog.themes,plain(c.THEME_ORDER));
  for(const slot of Object.keys(c.GEAR_ALL))assert.deepEqual(catalog.gear[slot],[...c.GEAR_ALL[slot],...c.LEGEND_GEAR.filter(x=>x.slot===slot)].map(x=>x.id));
  initial.tower.best=22;assert.equal(c.newState().tower.best,0);assert.equal(validateStudent(expected),null);
});
test('missing, forged, expired, student-code and non-admin JWTs fail before access',async()=>{
  for(const token of [null,'EC-7K4P-2Q9M','sb_publishable_admin_test',api.token(db.admin).slice(0,-5)+'AAAAA',api.token(db.admin,{exp:1}),api.token(db.admin,{iss:'https://wrong.invalid'})])assert.equal((await api.call({action:'list'},token)).status,401);
  assert.equal((await api.call({action:'list'},api.token(db.regular,{user_metadata:{admin:true}}))).status,403);
  assert.equal((await api.call({action:'list'},api.token(db.disabled))).status,403);
  const ok=await api.call({action:'list'});assert.equal(ok.ok,true);
});
test('removing active allowlist permission invalidates the same previously accepted JWT',async()=>{
  const token=api.token(db.admin);assert.equal((await api.call({action:'list'},token)).ok,true);
  await db.db.query('update public.app_admins set disabled_at=now()where user_id=$1',[db.admin]);
  assert.equal((await api.call({action:'list'},token)).status,403);
  await db.db.query('update public.app_admins set disabled_at=null where user_id=$1',[db.admin]);
});
test('all new tables and RPCs deny direct anon/authenticated access; student DELETE stays revoked',async()=>{
  for(const role of ['anon','authenticated'])for(const table of ['app_admins','student_save_admin_backups','student_admin_audit'])for(const priv of ['SELECT','INSERT','UPDATE','DELETE']){
    assert.equal((await db.db.query('select has_table_privilege($1,$2,$3)as allowed',[role,'public.'+table,priv])).rows[0].allowed,false);
  }
  const functions=(await db.db.query("select oid::regprocedure::text as signature,prosecdef from pg_proc where pronamespace='public'::regnamespace and proname like 'student_admin_%'")).rows;
  for(const f of functions){assert.equal(f.prosecdef,false);for(const role of ['anon','authenticated'])assert.equal((await db.db.query('select has_function_privilege($1,$2,$3)as allowed',[role,f.signature,'EXECUTE'])).rows[0].allowed,false);}
  assert.equal((await db.db.query("select has_table_privilege('service_role','public.student_saves','DELETE')as allowed")).rows[0].allowed,false);
});
test('administrator creation uses canonical v9 state, secure code, revision 1 and one idempotent row/audit',async()=>{
  const id=randomUUID(),a=await create('TEST-NEW',{createRequestId:id}),b=await create('TEST-NEW',{createRequestId:id});
  assert.equal(a.ok,true);assert.equal(a.revision,1);assert.equal(b.id,a.id);assert.equal(b.code,a.code);
  const student=await raw(a.code);assert.equal(student.saveData.lv,1);assert.equal(student.saveData.gold,60);assert.equal(student.saveVersion,9);
  assert.match(student.saveData.code,/^EC\d{4}$/);assert.equal(student.saveData.code===a.code,false);
  assert.equal((await db.db.query("select count(*)::int as n from public.student_admin_audit where student_save_id=$1 and action='CREATE'",[a.id])).rows[0].n,1);
});
test('list returns summaries only, normalized partial search, filters, sort and bounded pagination',async()=>{
  const a=await create('목록TEST'),b=await create('정렬TEST');await change(a,{lv:12,exp:2800,tower:{best:18,bestTime:462,runs:1,history:[]}});
  const codeSearch=await api.call({action:'list',query:a.code.toLowerCase().replaceAll('-','').slice(0,7)});assert.ok(codeSearch.items.some(x=>x.id===a.id));
  const list=await api.call({action:'list',query:'TEST',sort:'level',limit:2,offset:0});assert.equal(list.items.length,2);assert.equal(list.hasMore,true);
  assert.ok(list.items[0].level>=list.items[1].level);for(const item of list.items){assert.equal(item.saveData,undefined);assert.equal(item.code,undefined);assert.match(item.maskedCode,/\*\*/);}
  assert.equal((await api.call({action:'list',query:'목록'})).items[0].id,a.id);
  const local=(await raw(a.code)).saveData.code;assert.ok((await api.call({action:'list',query:local})).items.some(x=>x.id===a.id));
  assert.equal((await api.call({action:'list',sort:'updated desc;drop table x'})).status,400);
  assert.equal((await api.call({action:'list',limit:500})).status,400);assert.ok(b.ok);
});
test('detail is read-only, code reveal is explicit and export never changes revision/timestamps',async()=>{
  const made=await create(),before=await raw(made.code),detail=await get(made.id);
  assert.equal(detail.student.code,null);assert.deepEqual(detail.student.saveData,before.saveData);
  const shown=await api.call({action:'get',id:made.id,revealCode:true});assert.equal(shown.student.code,made.code);
  const exported=await api.call({action:'export',id:made.id});assert.equal(exported.student.code,made.code);
  const after=await raw(made.code);assert.equal(after.revision,before.revision);assert.equal(after.updatedAt,before.updatedAt);assert.deepEqual(after.saveData,before.saveData);
  const audit=(await db.db.query('select action,metadata from public.student_admin_audit where student_save_id=$1',[made.id])).rows;
  assert.ok(audit.some(x=>x.action==='EXPORT'));assert.ok(audit.some(x=>x.action==='VIEW_CODE'));assert.ok(!JSON.stringify(audit).includes(made.code));
});
test('updates retain internal code, write backup before CAS and only lightweight audit metadata',async()=>{
  const made=await create(),before=await raw(made.code);const changed=await change(made,{lv:9,exp:1423,gold:845,tower:{best:18,bestTime:462,runs:6,history:[]}});
  assert.equal(changed.ok,true);assert.equal(changed.revision,2);const after=await raw(made.code);assert.equal(after.saveData.lv,9);assert.equal(after.saveData.code,before.saveData.code);
  const backups=(await db.db.query('select revision,save_data from public.student_save_admin_backups where student_save_id=$1',[made.id])).rows;assert.equal(backups.length,1);assert.equal(backups[0].revision,1);assert.deepEqual(backups[0].save_data,before.saveData);
  const audit=(await db.db.query("select metadata from public.student_admin_audit where student_save_id=$1 and action='UPDATE'",[made.id])).rows[0].metadata;
  assert.ok(audit.changedFields.includes('lv'));assert.equal(audit.saveData,undefined);
});
test('malformed, future, oversized, invalid numbers/IDs and new rule fields never damage the database',async()=>{
  const made=await create(),state=(await raw(made.code)).saveData;
  const patches=[{lv:'9'},{lv:-1},{exp:-1},{gold:-1},{exp:Number.MAX_SAFE_INTEGER+1},{saveVersion:10,v:10},{MONSTERS:{}},{owned:['nonexistent']},
    {gear:{...state.gear,weapon:'typo'}},{tower:{best:18,bestTime:0,runs:0,history:[]}},{tower:{best:0,bestTime:60,runs:0,history:[]}},{name:'x'.repeat(131073)}];
  for(const patch of patches){const r=await api.call({action:'update',id:made.id,expectedRevision:1,saveData:{...state,...patch}});assert.equal(r.ok,false,JSON.stringify(Object.keys(patch)));assert.equal(r.status,400);}
  for(const value of [[],null,'broken'])assert.equal((await api.call({action:'update',id:made.id,expectedRevision:1,saveData:value})).status,400);
  assert.equal((await api.call({action:'update',id:made.id,expectedRevision:1.5,saveData:state})).status,400);
  const after=await raw(made.code);assert.equal(after.revision,1);assert.deepEqual(after.saveData,state);
});
test('unknown legacy gear/metadata remain unchanged; new unknown rules are rejected',async()=>{
  const made=await create(),old=(await raw(made.code)).saveData;
  old.owned.push('legacy-sword');old.gear.weapon='legacy-sword';old.legacyRoot={keep:true};
  await db.db.query('update public.student_saves set save_data=$1 where id=$2',[JSON.stringify(old),made.id]);
  const edited=await change(made,{gold:222});assert.equal(edited.ok,true);const after=await raw(made.code);
  assert.deepEqual(after.saveData.legacyRoot,{keep:true});assert.equal(after.saveData.gear.weapon,'legacy-sword');
  assert.equal((await change(made,{legacyRoot:{keep:false}})).status,400);
});
test('soft delete, deleted list and restore preserve state/code and advance revisions',async()=>{
  const made=await create(),before=await raw(made.code);
  assert.equal((await api.call({action:'softDelete',id:made.id,expectedRevision:1})).status,400);
  const removed=await api.call({action:'softDelete',id:made.id,expectedRevision:1,confirm:true});assert.equal(removed.revision,2);
  assert.equal((await raw(made.code)).error,'NOT_FOUND');assert.equal((await db.rpc('student_save_update',{p_code:made.code,p_save_data:before.saveData,p_save_version:9,p_expected_revision:1})).error,'NOT_FOUND');
  assert.ok((await api.call({action:'list',filter:'deleted'})).items.some(x=>x.id===made.id));
  const restored=await api.call({action:'restore',id:made.id,expectedRevision:2});assert.equal(restored.revision,3);
  const after=await raw(made.code);assert.deepEqual(after.saveData,before.saveData);assert.equal(after.code,made.code);
});
test('rotation is atomic, old code/creation receipt are retired, original data and row id persist',async()=>{
  const requestId=randomUUID(),made=await create('ROTATE1',{createRequestId:requestId}),before=await raw(made.code);
  const rotated=await api.call({action:'rotateCode',id:made.id,expectedRevision:1,confirm:true});assert.equal(rotated.ok,true);assert.notEqual(rotated.code,made.code);assert.equal(rotated.id,made.id);assert.equal(rotated.revision,2);
  assert.equal((await raw(made.code)).error,'NOT_FOUND');assert.deepEqual((await raw(rotated.code)).saveData,before.saveData);
  const retry=await db.rpc('student_save_create_once',{p_code:'EC-2222-3333',p_save_data:before.saveData,p_save_version:9,p_create_request_id:requestId});assert.equal(retry.error,'NOT_FOUND');
  assert.equal((await db.db.query('select count(*)::int as n from public.student_saves where create_request_id=$1',[requestId])).rows[0].n,1);
  assert.equal((await db.db.query("select count(*)::int as n from public.student_save_admin_backups where student_save_id=$1 and reason='ROTATE_CODE'",[made.id])).rows[0].n,1);
});
test('CAS protects both student-first and administrator-first writes, with real CloudSync conflict routing',async()=>{
  const made=await create(),state=(await raw(made.code)).saveData;
  await db.rpc('student_save_update',{p_code:made.code,p_save_data:{...state,gold:100},p_save_version:9,p_expected_revision:1});
  const stale=await api.call({action:'update',id:made.id,expectedRevision:1,saveData:{...state,gold:200}});assert.equal(stale.status,409);assert.equal(stale.error,'ADMIN_REVISION_CONFLICT');assert.equal((await raw(made.code)).saveData.gold,100);
  const server=await serve(db.rpc);try{
    const g=game(),c=g.c;c.crypto=webcrypto;c.CloudSave=c.CloudSave.createClient({projectUrl:server.url,publishableKey:'sb_publishable_test_only'});
    c.resumeSaveState=s=>{c.S=c.migrate(s);return true;};vm.runInContext(read('js/cloud-sync.js'),c);await c.CloudSync.loadCode(made.code);
    await change(made,{gold:300});c.S.gold=400;c.Save.save();const result=await c.CloudSync.flush();assert.equal(result.error,'REVISION_CONFLICT');assert.equal(c.CloudSession.status,'conflict');assert.equal((await raw(made.code)).saveData.gold,300);c.CloudSync.stop();
  }finally{await server.close();}
});
test('all stale destructive actions are rejected without extra backups or audits',async()=>{
  const made=await create();await change(made,{gold:99});
  for(const action of ['softDelete','restore','rotateCode'])assert.equal((await api.call({action,id:made.id,expectedRevision:1,confirm:true})).error,'ADMIN_REVISION_CONFLICT');
  assert.equal((await raw(made.code)).revision,2);
  assert.equal((await db.db.query('select count(*)::int as n from public.student_save_admin_backups where student_save_id=$1',[made.id])).rows[0].n,1);
});

test('rotated code blocks old CloudSync writes without discarding local pending progress; new code resumes separately',async()=>{
  const made=await create(),server=await serve(db.rpc);
  try{
    const g=game(),c=g.c;c.crypto=webcrypto;c.CloudSave=c.CloudSave.createClient({projectUrl:server.url,publishableKey:'sb_publishable_test_only'});
    c.resumeSaveState=s=>{c.S=c.migrate(s);return true;};vm.runInContext(read('js/cloud-sync.js'),c);await c.CloudSync.loadCode(made.code);
    const rotated=await api.call({action:'rotateCode',id:made.id,expectedRevision:1,confirm:true});
    c.S.gold=987;c.Save.save();assert.equal((await c.CloudSync.flush()).error,'NOT_FOUND');assert.equal(c.CloudSync.view().relink,true);
    assert.equal(c.CloudSync.view().pending,true);assert.equal(c.S.gold,987);
    const pending=[...g.storage.entries()].filter(([k])=>k.startsWith('echo:cloud:')).map(([,v])=>v);assert.ok(pending.some(v=>JSON.parse(v).state.gold===987));
    assert.equal((await c.CloudSync.loadCode(rotated.code)).ok,true);assert.equal(c.CloudSync.view().relink,false);assert.equal(c.S.gold,(await raw(rotated.code)).saveData.gold);
    assert.ok([...g.storage.entries()].filter(([k])=>k.startsWith('echo:cloud:')).some(([,v])=>JSON.parse(v).state.gold===987));c.CloudSync.stop();
  }finally{await server.close();}
});
test('backup retention is exactly ten and never removes student saves or audit history',async()=>{
  const made=await create();for(let i=0;i<14;i++)assert.equal((await change(made,{gold:i})).ok,true);
  assert.equal((await db.db.query('select count(*)::int as n from public.student_save_admin_backups where student_save_id=$1',[made.id])).rows[0].n,10);
  assert.equal((await db.db.query('select count(*)::int as n from public.student_admin_audit where student_save_id=$1',[made.id])).rows[0].n,15);assert.equal((await raw(made.code)).ok,true);
});
test('code collision rollback leaves the old row, backups and audit unchanged',async()=>{
  const a=await create(),b=await create(),before=await raw(a.code);
  const collision=await db.rpc('student_admin_mutate',{p_admin:db.admin,p_action:'ROTATE_CODE',p_id:a.id,p_expected_revision:1,p_new_code:b.code});
  assert.equal(collision.error,'CODE_EXISTS');assert.deepEqual(await raw(a.code),before);
  assert.equal((await db.db.query('select count(*)::int as n from public.student_save_admin_backups where student_save_id=$1',[a.id])).rows[0].n,0);
});
test('backup storage failure rolls back the original edit and its audit',async()=>{
  const made=await create('BACKFAIL'),before=await raw(made.code);
  await db.db.exec("alter table public.student_save_admin_backups add constraint test_backup_failure check(save_data->>'name'<>'BACKFAIL')");
  try{assert.equal((await change(made,{gold:999})).status,503);assert.deepEqual(await raw(made.code),before);}
  finally{await db.db.exec('alter table public.student_save_admin_backups drop constraint test_backup_failure');}
});
test('future-version rows are viewable/exportable but never down-saved by an older admin',async()=>{
  const made=await create(),state=(await raw(made.code)).saveData;await db.db.query('update public.student_saves set save_version=10,save_data=$1 where id=$2',[JSON.stringify({...state,saveVersion:10,v:10}),made.id]);
  assert.equal((await get(made.id)).student.saveVersion,10);
  assert.equal((await api.call({action:'update',id:made.id,expectedRevision:1,saveData:state})).error,'UNSUPPORTED_SAVE_VERSION');
  assert.equal((await raw(made.code)).saveVersion,10);
});
test('Auth verification deadline and CORS fail closed; diagnostics contain neither token nor data',async()=>{
  const verify=createAuthVerifier({url:'https://fixture.invalid',key:'test',fetcher:()=>new Promise(()=>{}),timeoutMs:10});await assert.rejects(verify('a.b.c'),/AUTH_TIMEOUT/);
  assert.equal((await api.call({action:'list'},api.token(db.admin),{Origin:'https://evil.invalid'})).status,403);
  assert.equal((await api.call({action:'deleteAll'})).status,400);assert.equal((await api.call({action:'listAll'})).status,400);
  assert.ok(!JSON.stringify(api.logs).includes('Bearer'));assert.ok(!JSON.stringify(api.logs).includes('BACKFAIL'));
});
