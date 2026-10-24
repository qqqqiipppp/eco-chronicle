import {generateCode,createRpc,MAX_REQUEST_BYTES} from '../student-save/handler.mjs';
import {VERSION,object,validateStudent,initialStudent,stable} from './validation.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function createAuthVerifier({url,key,fetcher=fetch,timeoutMs=8000}){
  return async token=>{
    const controller=new AbortController();let timer;
    try{
      return await Promise.race([new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('AUTH_TIMEOUT'));},timeoutMs);}),
        (async()=>{const r=await fetcher(url+'/auth/v1/user',{headers:{apikey:key,Authorization:'Bearer '+token},signal:controller.signal});
          if(!r.ok)return null;const user=await r.json();return UUID.test(user?.id)&&!user.is_anonymous?{id:user.id}:null;})()]);
    }finally{clearTimeout(timer);}
  };
}
async function bodyJson(request){
  if(Number(request.headers.get('content-length'))>MAX_REQUEST_BYTES)throw Error('SAVE_TOO_LARGE');
  const reader=request.body?.getReader();if(!reader)throw Error('INVALID_REQUEST');let size=0;const chunks=[];
  try{while(true){const x=await reader.read();if(x.done)break;size+=x.value.byteLength;if(size>MAX_REQUEST_BYTES){await reader.cancel();throw Error('SAVE_TOO_LARGE');}chunks.push(x.value);}}
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let at=0;for(const b of chunks){bytes.set(b,at);at+=b.length;}return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
export function createAdminHandler({rpc,verifyUser,publicKeys,allowedOrigins,random=crypto,logger=console}){
  const keys=new Set(publicKeys?.filter(Boolean)),origins=new Set(allowedOrigins||[]);
  return async request=>{
    const origin=request.headers.get('origin'),headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin',
      'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Max-Age':'600'};
    if(origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
    const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
    if(origin&&!origins.has(origin))return reply({ok:false,error:'ORIGIN_NOT_ALLOWED'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(request.method!=='POST')return reply({ok:false,error:'METHOD_NOT_ALLOWED'},405);
    if(!rpc||!verifyUser||!keys.size)return reply({ok:false,error:'SERVER_UNAVAILABLE'},503);
    const match=/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(request.headers.get('authorization')||'');
    if(!keys.has(request.headers.get('apikey'))||!match)return reply({ok:false,error:'ADMIN_UNAUTHENTICATED'},401);
    let user,action;
    try{
      user=await verifyUser(match[1]);if(!user||!UUID.test(user.id))return reply({ok:false,error:'ADMIN_UNAUTHENTICATED'},401);
      if(await rpc('student_admin_allowed',{p_admin:user.id})!==true)return reply({ok:false,error:'ADMIN_FORBIDDEN'},403);
      if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return reply({ok:false,error:'INVALID_REQUEST'},400);
      let body;try{body=await bodyJson(request);}catch(e){return reply({ok:false,error:e.message==='SAVE_TOO_LARGE'?'SAVE_TOO_LARGE':'INVALID_REQUEST'},400);}
      if(!object(body)||!['list','get','update','create','softDelete','restore','rotateCode','export'].includes(body.action))return reply({ok:false,error:'INVALID_REQUEST'},400);
      action=body.action;let result;
      if(action==='list'){
        const q=body.query??'',sort=body.sort??'updated',filter=body.filter??'active',limit=body.limit??25,offset=body.offset??0;
        if(typeof q!=='string'||q.length>64||!['updated','name','level','tower','created'].includes(sort)||!['active','deleted','all'].includes(filter)||!Number.isInteger(limit)||limit<1||limit>50||!Number.isInteger(offset)||offset<0||offset>1000000)return reply({ok:false,error:'INVALID_REQUEST'},400);
        result=await rpc('student_admin_list',{p_admin:user.id,p_query:q.trim(),p_sort:sort,p_filter:filter,p_limit:limit,p_offset:offset});
      }else if(action==='create'){
        if(typeof body.name!=='string'||!body.name.trim()||body.name.length>8||!['earth','water','fire'].includes(body.petKey??'earth')||!UUID.test(body.createRequestId))return reply({ok:false,error:'INVALID_STUDENT_FIELD'},400);
        const state=initialStudent(body.name.trim(),body.petKey??'earth',random),invalid=validateStudent(state);
        if(invalid)return reply({ok:false,error:invalid},400);
        for(let i=0;i<8;i++){result=await rpc('student_admin_mutate',{p_admin:user.id,p_action:'CREATE',p_save_data:state,p_save_version:VERSION,p_new_code:generateCode(random),p_changed_fields:['name','petKey'],p_request_id:body.createRequestId});if(result.error!=='CODE_EXISTS')break;}
      }else{
        if(!UUID.test(body.id))return reply({ok:false,error:'INVALID_REQUEST'},400);
        if(action==='get'||action==='export'){
          result=await rpc('student_admin_get',{p_admin:user.id,p_id:body.id,p_reveal:body.revealCode===true,p_export:action==='export'});
        }else{
          if(!Number.isSafeInteger(body.expectedRevision)||body.expectedRevision<1||body.expectedRevision>=Number.MAX_SAFE_INTEGER)return reply({ok:false,error:'INVALID_REVISION'},400);
          if(['softDelete','rotateCode'].includes(action)&&body.confirm!==true)return reply({ok:false,error:'CONFIRMATION_REQUIRED'},400);
          let changed=[],state=null;
          if(action==='update'){
            const old=await rpc('student_admin_get',{p_admin:user.id,p_id:body.id,p_reveal:false,p_export:false});
            if(!old.ok)result=old;
            else{
              if(old.student.saveVersion>VERSION)return reply({ok:false,error:'UNSUPPORTED_SAVE_VERSION'},400);
              const invalid=validateStudent(body.saveData,old.student.saveData);
              if(invalid)return reply({ok:false,error:invalid},400);
              state=body.saveData;changed=Object.keys(state).filter(k=>stable(state[k])!==stable(old.student.saveData[k]));
            }
          }
          if(!result){
            const sqlAction={update:'UPDATE',softDelete:'SOFT_DELETE',restore:'RESTORE',rotateCode:'ROTATE_CODE'}[action];
            for(let i=0;i<(action==='rotateCode'?8:1);i++){
              result=await rpc('student_admin_mutate',{p_admin:user.id,p_action:sqlAction,p_id:body.id,p_expected_revision:body.expectedRevision,
                p_save_data:state,p_save_version:action==='update'?VERSION:null,p_new_code:action==='rotateCode'?generateCode(random):null,p_changed_fields:changed});
              if(result.error!=='CODE_EXISTS')break;
            }
          }
        }
      }
      if(!object(result)||typeof result.ok!=='boolean')throw Error('INVALID_BACKEND_RESPONSE');
      if(result.ok)return reply(result);
      const statuses={ADMIN_FORBIDDEN:403,NOT_FOUND:404,ADMIN_REVISION_CONFLICT:409,INVALID_REVISION:400,INVALID_STUDENT_STATE:409};
      if(statuses[result.error])return reply(result,statuses[result.error]);
      throw Error('BACKEND_FAILURE');
    }catch(_){logger.error('[StudentAdmin]',{action:action||'authenticate',error:'SERVER_UNAVAILABLE'});return reply({ok:false,error:'SERVER_UNAVAILABLE'},503);}
  };
}
export {createRpc};
