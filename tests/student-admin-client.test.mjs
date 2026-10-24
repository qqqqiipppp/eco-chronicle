import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {read} from './helpers/cloud-save-runtime.mjs';
function client(fetcher,session={access_token:'signed.test.jwt'},timeoutMs=50){
  const c={AbortController,setTimeout,clearTimeout,TextDecoder,TextEncoder,fetch:fetcher};c.window=c;vm.createContext(c);vm.runInContext(read('js/student-admin-client.js'),c);
  return c.EcoStudentAdminClient.create({auth:{getSession:async()=>({data:{session}})},config:{projectUrl:'https://test.invalid',publishableKey:'public-test-key'},fetcher,timeoutMs});
}
test('admin transport refuses calls without a session',async()=>{
  let calls=0;const r=await client(async()=>{calls++;},null).request('list');assert.equal(r.error,'ADMIN_UNAUTHENTICATED');assert.equal(calls,0);
});
test('admin transport sends JWT in headers only, with no browser credentials/cache/referrer',async()=>{
  let seen;const r=await client(async(url,args)=>{seen={url,args};return Response.json({ok:true,items:[]});}).request('list',{query:'TEST'});
  assert.equal(r.ok,true);assert.equal(seen.args.headers.Authorization,'Bearer signed.test.jwt');assert.ok(!seen.url.includes('jwt'));assert.ok(!seen.args.body.includes('jwt'));
  assert.equal(seen.args.credentials,'omit');assert.equal(seen.args.cache,'no-store');assert.equal(seen.args.referrerPolicy,'no-referrer');
});
test('gateway authentication errors are converted to friendly re-login / permission messages',async()=>{
  for(const [status,error]of[[401,'ADMIN_UNAUTHENTICATED'],[403,'ADMIN_FORBIDDEN']]){
    const r=await client(async()=>new Response('gateway error',{status})).request('list');assert.equal(r.error,error);assert.ok(r.message.length>3);assert.ok(!r.message.includes('gateway'));
  }
});
test('admin request deadline covers stalled response bodies and oversized data fails closed',async()=>{
  const stalled=client(async()=>new Response(new ReadableStream({start(){}})),undefined,10);
  assert.equal((await stalled.request('list')).error,'NETWORK_ERROR');
  assert.equal((await client(async()=>new Response('x'.repeat(524289))).request('get')).error,'NETWORK_ERROR');
});
test('admin conflict message preserves the request revision and never automatically retries a mutation',async()=>{
  let calls=0,body;const r=await client(async(_,args)=>{calls++;body=JSON.parse(args.body);return Response.json({ok:false,error:'ADMIN_REVISION_CONFLICT'},{status:409});}).request('update',{id:'TEST',expectedRevision:5,saveData:{gold:10}});
  assert.equal(calls,1);assert.equal(body.expectedRevision,5);assert.equal(r.error,'ADMIN_REVISION_CONFLICT');assert.ok(r.message.includes('최신 기록'));
});
