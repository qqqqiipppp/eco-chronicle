// Read-only deployment probe by default. --write-test uses synthetic TEST data only.
import {read,game,student,plain} from '../tests/helpers/cloud-save-runtime.mjs';
import {isDeepStrictEqual} from 'node:util';
const source=read('js/supabase.js'),projectUrl=source.match(/var projectUrl = '([^']+)'/)[1],publishableKey=source.match(/var publishableKey = '([^']+)'/)[1];
const headers={apikey:publishableKey,Origin:'https://qqqqiipppp.github.io'};
let edge,table;
try{
  edge=await fetch(projectUrl+'/functions/v1/student-save',{method:'OPTIONS',headers,signal:AbortSignal.timeout(12000)});
  table=await fetch(projectUrl+'/rest/v1/student_saves?select=id&limit=0',{headers,signal:AbortSignal.timeout(12000)});
  let detail={};try{detail=await table.json();}catch{}
  console.log(JSON.stringify({edgeStatus:edge.status,corsOrigin:edge.headers.get('access-control-allow-origin'),tableStatus:table.status,tableError:detail.code||null,tableDirectReadDenied:[401,403].includes(table.status)}));
}catch(_){console.error('Deployment probe: network unavailable');process.exitCode=1;}
if(process.argv.includes('--write-test')){
  if(!edge?.ok || ![401,403].includes(table?.status)){console.error('Write test skipped: function/schema permissions are not ready.');process.exitCode=1;}
  else{
    const a=game(),b=game(),options={projectUrl,publishableKey},ca=a.c.CloudSave.createClient(options),cb=b.c.CloudSave.createClient(options);
    const state=student(a.c);state.name='TEST-CLOUD';
    const created=await ca.create(state);
    if(!created.ok){console.error('Create failed: '+created.error);process.exitCode=1;}
    else{
      const la=await ca.load(created.code),lb=await cb.load(created.code);
      if(!la.ok||!lb.ok)throw Error('Load failed');
      const roundTrip=isDeepStrictEqual(plain(la.saveData),plain(a.c.migrate(state)))&&isDeepStrictEqual(plain(la.saveData),plain(lb.saveData));
      const changed=la.saveData;changed.gold+=5;
      const saved=await ca.save(created.code,changed,la.revision),conflict=await cb.save(created.code,lb.saveData,lb.revision),latest=await cb.load(created.code);
      const passed=roundTrip&&saved.ok&&saved.revision===2&&conflict.error==='REVISION_CONFLICT'&&latest.saveData.gold===185&&a.storage.size===0&&b.storage.size===0;
      console.log(JSON.stringify({passed,code:created.code.slice(0,5)+'**-****',create:created.ok,loadA:la.ok,loadB:lb.ok,
        roundTrip,revision:saved.revision,conflict:conflict.error,latestGold:latest.saveData?.gold,localStorageUntouched:a.storage.size===0&&b.storage.size===0}));
      if(!passed)process.exitCode=1;
    }
  }
}
if(process.argv.includes('--security')){
  const probes=[
    ['insert',projectUrl+'/rest/v1/student_saves',{method:'POST',body:JSON.stringify({code:'INVALID-TEST-CODE',save_data:{},save_version:9})}],
    ['update',projectUrl+'/rest/v1/student_saves?id=is.null',{method:'PATCH',body:JSON.stringify({save_version:9})}],
    ['delete',projectUrl+'/rest/v1/student_saves?id=is.null',{method:'DELETE'}],
    ['directRpc',projectUrl+'/rest/v1/rpc/student_save_load',{method:'POST',body:JSON.stringify({p_code:'EC-ZZZZ-ZZZZ'})}]
  ];
  for(const [operation,url,options] of probes){
    const response=await fetch(url,{...options,headers:{...headers,'Content-Type':'application/json'},signal:AbortSignal.timeout(12000)});
    const denied=[401,403].includes(response.status);console.log(JSON.stringify({operation,status:response.status,denied}));if(!denied)process.exitCode=1;
  }
  for(const [operation,body,expected] of [
    ['missingCode',{action:'load'},400],['malformedCode',{action:'load',code:'EC1234'},400],
    ['notFound',{action:'load',code:'EC-ZZZZ-ZZZZ'},404],['invalidSaveData',{action:'create',saveData:[],saveVersion:9},400]
  ]){
    const response=await fetch(projectUrl+'/functions/v1/student-save',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
    const result=await response.json();console.log(JSON.stringify({operation,status:response.status,error:result.error}));if(response.status!==expected||result.ok!==false)process.exitCode=1;
  }
}
