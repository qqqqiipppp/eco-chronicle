/* Authenticated administrator transport; never imported by the student game. */
(function(root){
  'use strict';
  var messages={ADMIN_UNAUTHENTICATED:'로그인이 만료되었습니다. 다시 로그인해 주세요.',ADMIN_FORBIDDEN:'관리자 권한이 없습니다.',
    ADMIN_REVISION_CONFLICT:'학생의 게임 기록이 다른 곳에서 변경되었습니다. 최신 기록을 다시 불러와 주세요.',
    INVALID_STUDENT_FIELD:'입력한 학생 기록을 확인해 주세요.',INVALID_SAVE_DATA:'저장 데이터 형식이 올바르지 않습니다.',
    INVALID_TOWER_RECORD:'탑 최고 층과 해당 기록 시간을 함께 확인해 주세요.',UNSUPPORTED_SAVE_VERSION:'이 게임 버전에서 수정할 수 없는 기록입니다. 새로고침해 주세요.',
    SAVE_TOO_LARGE:'저장 데이터가 허용 크기를 넘었습니다.',NOT_FOUND:'학생 기록을 찾지 못했습니다.',
    INVALID_STUDENT_STATE:'학생의 삭제 상태가 변경되었습니다. 최신 기록을 다시 불러와 주세요.',CONFIRMATION_REQUIRED:'작업 확인이 필요합니다.'};
  function create({auth,config,fetcher=root.fetch.bind(root),timeoutMs=20000}){
    return {async request(action,fields={}){
      var controller=new AbortController(),timer;
      try{
        var session=await auth.getSession(),token=session.data?.session?.access_token;
        if(!token)return {ok:false,error:'ADMIN_UNAUTHENTICATED',message:messages.ADMIN_UNAUTHENTICATED};
        var result=await Promise.race([new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('TIMEOUT'));},timeoutMs);}),
          (async()=>{
            var response=await fetcher(config.projectUrl+'/functions/v1/'+(config.functionName||'student-admin-v2'),{method:'POST',headers:{apikey:config.publishableKey,Authorization:'Bearer '+token,'Content-Type':'application/json'},
              credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal,body:JSON.stringify(Object.assign({action},fields))});
            var reader=response.body?.getReader(),parts=[],length=0,text;
            if(reader){try{while(true){var item=await reader.read();if(item.done)break;length+=item.value.length;if(length>524288){await reader.cancel();throw Error('RESPONSE_TOO_LARGE');}parts.push(item.value);}}
              finally{reader.releaseLock();}var bytes=new Uint8Array(length),at=0;parts.forEach(b=>{bytes.set(b,at);at+=b.length;});text=new TextDecoder().decode(bytes);
            }else{text=await response.text();if(new TextEncoder().encode(text).length>524288)throw Error('RESPONSE_TOO_LARGE');}
            var data;try{data=JSON.parse(text);}catch(_){data={ok:false};}
            if(response.status===401)data={ok:false,error:'ADMIN_UNAUTHENTICATED'};
            else if(response.status===403)data={ok:false,error:'ADMIN_FORBIDDEN'};
            if(typeof data.ok!=='boolean')throw Error('INVALID_RESPONSE');return data;
          })()]);
        if(!result.ok)result.message=messages[result.error]||'작업을 완료하지 못했습니다. 기록을 다시 확인해 주세요.';
        return result;
      }catch(_){return {ok:false,error:'NETWORK_ERROR',message:'서버에 연결하지 못했습니다. 저장 작업이었다면 목록에서 결과를 먼저 확인해 주세요.'};}
      finally{clearTimeout(timer);}
    }};
  }
  root.EcoStudentAdminClient={create};
})(window);
