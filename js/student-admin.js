(function(root){
  'use strict';
  var $=id=>document.getElementById(id),client,api,runtime,student=null,draft=null,epoch=0,offset=0,hasMore=false,busy=false;
  var secret=null,confirmation=null,createRequestId=null,creationName='',creationPet='earth',creationAttempted=false;
  function node(tag,text,cls){var e=document.createElement(tag);if(text!=null)e.textContent=String(text);if(cls)e.className=cls;return e;}
  function note(text,error){$('notice').textContent=text||'';$('notice').className=error?'error':'';}
  function lock(value){busy=value;document.querySelectorAll('button,input,select').forEach(e=>e.disabled=value);$('previous').disabled=value||offset===0;$('next').disabled=value||!hasMore;}
  function clear(){epoch++;student=null;draft=null;secret=null;confirmation=null;createRequestId=null;creationAttempted=false;creationName='';creationPet='earth';offset=0;hasMore=false;
    $('students').replaceChildren();$('detail').replaceChildren(node('p','목록에서 학생을 선택하세요.','muted'));
    $('dialogBody').replaceChildren();if($('confirmDialog').open)$('confirmDialog').close();
    $('workspace').hidden=true;$('logout').hidden=true;$('loginPanel').hidden=false;$('password').value='';$('email').value='';$('query').value='';}
  async function request(action,fields){
    var result=await api.request(action,fields);
    if(['ADMIN_UNAUTHENTICATED','ADMIN_FORBIDDEN'].includes(result.error)){clear();note(result.message,true);client.auth.signOut({scope:'local'}).catch(()=>{});}
    return result;
  }
  async function work(fn){if(busy)return;lock(true);try{return await fn();}catch(_){note('화면을 준비하지 못했습니다. 새로고침해 주세요.',true);}finally{lock(false);}}
  function fmt(seconds){if(!Number.isSafeInteger(seconds)||seconds<0)return '시간 없음';return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
  function date(value){return value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString('ko-KR'):'—';}
  function theme(id){return runtime?.THEMES[id]?.name||id||'—';}
  function button(text,fn,cls){var e=node('button',text,cls);e.type='button';e.addEventListener('click',fn);return e;}
  function json(parent,title,value){var d=node('details');d.append(node('summary',title),node('pre',JSON.stringify(value,null,2)));parent.append(d);}
  async function list(){
    var token=epoch,result=await request('list',{query:$('query').value.trim(),sort:$('sort').value,filter:$('filter').value,limit:25,offset});
    if(token!==epoch)return;if(!result.ok){note(result.message,true);return;}
    hasMore=result.hasMore;$('students').replaceChildren();
    result.items.forEach(s=>{
      var row=button('',()=>work(()=>detail(s.id)),'student-row');row.setAttribute('aria-current',String(student?.id===s.id));
      row.dataset.studentId=s.id;
      row.append(node('strong',typeof s.name==='string'?s.name:'이름 없음'),node('span',s.maskedCode+' · '+(typeof s.localCode==='string'?s.localCode:'번호 없음')),
        node('span','Lv.'+(typeof s.level==='number'?s.level:'—')+' · EXP '+(typeof s.exp==='number'?s.exp:'—')+' · '+theme(s.theme)+' '+(typeof s.gauge==='number'?s.gauge:'—')+'%'),
        node('span','탑 '+(s.towerFloor||0)+'층 · '+fmt(s.towerTime)),node('span','최근 저장 '+date(s.updatedAt)+' · v'+s.saveVersion+' / r'+s.revision,'muted'));
      if(s.deletedAt)row.append(node('span','삭제된 학생','deleted'));$('students').append(row);
    });
    if(!result.items.length)$('students').append(node('p','검색 결과가 없습니다.','muted'));
    $('pageLabel').textContent=(Math.floor(offset/25)+1)+'쪽';$('previous').disabled=offset===0;$('next').disabled=!hasMore;
  }
  async function detail(id){
    var token=epoch,result=await request('get',{id});if(token!==epoch)return;
    if(!result.ok){note(result.message,true);return;}
    student=result.student;secret=null;
    document.querySelectorAll('.student-row').forEach(row=>row.setAttribute('aria-current',String(row.dataset.studentId===student.id)));
    try{draft=runtime.migrate(student.saveData);delete draft.scene;delete draft.modal;}catch(_){draft=null;}
    drawDetail();
  }
  function field(parent,label,value,type,onchange,opts={}){
    var box=node('label',label),input=node('input');input.type=type;input.value=value??'';
    for(var [k,v]of Object.entries(opts))input.setAttribute(k,String(v));
    input.addEventListener('input',()=>onchange(type==='number'?input.valueAsNumber:input.value));box.append(input);parent.append(box);return input;
  }
  function select(parent,label,value,choices,onchange){
    var box=node('label',label),e=node('select');choices.forEach(([id,name])=>{var o=node('option',name);o.value=id;o.selected=String(id)===String(value);e.append(o);});
    e.addEventListener('change',()=>onchange(e.value));box.append(e);parent.append(box);return e;
  }
  function check(parent,label,value,onchange){var box=node('label',null,'check'),input=node('input');input.type='checkbox';input.checked=!!value;input.addEventListener('change',()=>onchange(input.checked));box.append(input,node('span',label));parent.append(box);return input;}
  function section(parent,title){var d=node('details');d.append(node('summary',title));parent.append(d);return d;}
  function grid(parent){var g=node('div',null,'form-grid');parent.append(g);return g;}
  function drawDetail(){
    var host=$('detail');host.replaceChildren();if(!student)return;
    host.append(node('h2',typeof student.saveData.name==='string'?student.saveData.name:'학생 상세'));
    var meta=node('div',null,'detail-meta');meta.append(node('p','기존 번호 '+(student.saveData.code||'—')+' · '+student.maskedCode),
      node('p','생성 '+date(student.createdAt)+' / 최근 저장 '+date(student.updatedAt)),node('p','저장 버전 '+student.saveVersion+' · revision '+student.revision+(student.deletedAt?' · 삭제됨':'')));
    meta.append(button('코드 보기',()=>work(async()=>{var id=student.id,token=epoch,r=await request('get',{id,revealCode:true});if(token!==epoch||!r.ok){if(!r.ok)note(r.message,true);return;}secret=r.student.code;showSecret(secret);}),'secondary'));
    host.append(meta);
    if(student.saveVersion<runtime.CURRENT_SAVE_VERSION)host.append(node('p','이전 버전 기록입니다. 조회로 서버를 변경하지 않습니다. 수정 저장 시 현재 게임 규칙으로 정리합니다.','muted'));
    if(!draft||student.saveVersion>runtime.CURRENT_SAVE_VERSION){host.append(node('p','현재 게임에서 검증할 수 없어 편집을 잠갔습니다. 원본 조회와 백업은 가능합니다.','deleted'));}
    else if(!student.deletedAt){
      var growth=node('div',null,'form-section');growth.append(node('h3','기본 / 성장'));var g=grid(growth);
      field(g,'이름',draft.name,'text',v=>draft.name=v,{maxlength:8});
      field(g,'레벨',draft.lv,'number',v=>draft.lv=v,{min:1,max:runtime.MAX_LV,step:1});
      field(g,'EXP',draft.exp,'number',v=>draft.exp=v,{min:0,step:1});field(g,'골드',draft.gold,'number',v=>draft.gold=v,{min:0,step:1});
      field(g,'회복약',draft.potions,'number',v=>draft.potions=v,{min:0,step:1});field(g,'뽑기권',draft.tickets,'number',v=>draft.tickets=v,{min:0,step:1});host.append(growth);
      regions(host);equipment(host);farm(host);ecotech(host);tower(host);
      json(host,'학습 기록 · 읽기 전용',draft.learning||{});
      var actions=node('div',null,'actions');actions.append(button('변경 내용 확인 후 저장',preview),button('최신 기록 다시 불러오기',()=>work(()=>detail(student.id)),'secondary'));host.append(actions);
    }
    json(host,'전체 저장 JSON · 읽기 전용',student.saveData);
    var tools=node('div',null,'actions');tools.append(button('JSON 백업 다운로드',()=>work(exportStudent),'secondary'));host.append(tools);
    var danger=node('section',null,'danger-zone');danger.append(node('h3','기록 관리'));
    if(student.deletedAt)danger.append(button('삭제 학생 복구',()=>confirm('학생 복구','이 학생 기록을 복구할까요?',()=>mutate('restore'))));
    else{
      danger.append(button('이어하기 코드 재발급',()=>confirm('새 코드 발급','새 코드를 발급하면 이전 이어하기 코드는 더 이상 사용할 수 없습니다.',()=>mutate('rotateCode'),'새 코드 발급'),'secondary'));
      danger.append(node('p','삭제는 되돌릴 수 있는 상태 이동입니다. 영구 삭제 기능은 제공하지 않습니다.','muted'));
      danger.append(button('삭제된 상태로 이동',()=>confirm('학생 기록 삭제','이 학생 기록을 삭제된 상태로 이동할까요? 나중에 복구할 수 있습니다.',()=>mutate('softDelete')),'danger'));
    }host.append(danger);
  }
  function regions(host){
    var box=section(host,'지역 진행'),g=grid(box);
    select(g,'현재 지역',draft.themeId,runtime.THEME_ORDER.map(id=>[id,theme(id)]),v=>{draft.themeId=v;});
    field(g,'현재 지역 정화율',draft.gauge,'number',v=>draft.gauge=v,{min:0,max:100,step:'any'});
    var checks=node('div',null,'check-grid');box.append(checks);
    runtime.THEME_ORDER.forEach(id=>check(checks,theme(id)+' 완료',draft.cleared.includes(id),v=>{draft.cleared=v?[...new Set([...draft.cleared,id])]:draft.cleared.filter(x=>x!==id);}));
    box.append(node('p','앞 지역 미완료 상태에서 뒤 지역을 완료하면 순차 진행과 맞지 않을 수 있습니다. 복구 목적일 때만 확인하여 설정하세요.','muted'));
    [['lessonDone','현재 지역 학습'],['quizDone','현재 지역 퀴즈'],['advDone','현재 지역 생각 넓히기'],['battleDone','현재 지역 전투']].forEach(([k,n])=>check(box,n,draft[k],v=>draft[k]=v));
    for(const id of runtime.THEME_ORDER){if(!draft.progress[id])continue;
      var part=section(box,theme(id)+' 보관 진행'),r=draft.progress[id],rg=grid(part);field(rg,'정화율',r.gauge,'number',v=>r.gauge=v,{min:0,max:100,step:'any'});
      [['lessonDone','학습 완료'],['quizDone','퀴즈 완료'],['advDone','생각 넓히기 완료'],['battleDone','전투 완료']].forEach(([k,n])=>check(part,n,r[k],v=>r[k]=v));
    }
  }
  function equipment(host){
    var box=section(host,'장비 · 보유 / 착용'),known=[];
    for(const slot of Object.keys(runtime.GEAR_ALL)){
      var items=[...runtime.GEAR_ALL[slot],...runtime.LEGEND_GEAR.filter(x=>x.slot===slot)];known.push(...items.map(x=>x.id));
      var part=section(box,runtime.GEAR_LABEL[slot]),choices=items.map(x=>[x.id,x.name]);
      if(draft.gear[slot]&&!choices.some(x=>x[0]===draft.gear[slot]))choices.push([draft.gear[slot],'미등록 기존 장비 (유지)']);
      var equipped=select(part,'착용',draft.gear[slot]||'',[['','없음'],...choices],v=>{draft.gear[slot]=v||null;if(v&&!draft.owned.includes(v))draft.owned.push(v);});
      items.forEach(item=>check(part,item.name+' 보유',draft.owned.includes(item.id),value=>{
        draft.owned=value?[...new Set([...draft.owned,item.id])]:draft.owned.filter(x=>x!==item.id);
        if(!value&&draft.gear[slot]===item.id){draft.gear[slot]=null;equipped.value='';}
      }));
    }
    var legacy=draft.owned.filter(id=>!known.includes(id));if(legacy.length)box.append(node('p','미등록 기존 장비는 유지합니다: '+legacy.join(', '),'muted'));
  }
  function farm(host){
    var box=section(host,'농장');if(!draft.farm){box.append(node('p','아직 농장 기록이 없습니다.','muted'));return;}
    var scroll=node('div',null,'scroll');box.append(scroll);
    draft.farm.plots.forEach((p,i)=>{
      var row=node('div',null,'farm-row');row.append(node('span',(i+1)+'번'));var choices=[['','빈 화단'],...Object.entries(runtime.FLOWERS).map(([id,v])=>[id,v.nm])];
      if(p.seed&&!runtime.FLOWERS[p.seed])choices.push([p.seed,'기존 작물 (유지)']);
      select(row,'작물',p.seed||'',choices,v=>p.seed=v||null);field(row,'성장',p.stage,'number',v=>p.stage=v,{min:0,max:3,step:1});check(row,'물 줌',p.wet,v=>p.wet=v);scroll.append(row);
    });
    draft.farm.pens.forEach((animal,i)=>{
      var row=node('div',null,'farm-row pen-row');row.append(node('span','축사 '+(i+1)));
      var choices=[['','비어 있음'],...Object.entries(runtime.LIVESTOCK).map(([id,v])=>[id,v.nm])];if(animal&&!runtime.LIVESTOCK[animal.kind])choices.push([animal.kind,'기존 가축 (유지)']);
      select(row,'가축',animal?.kind||'',choices,v=>{draft.farm.pens[i]=v?Object.assign({},draft.farm.pens[i]||{age:0,adult:false,fed:false,tick:0},{kind:v}):null;drawDetail();});
      if(animal){field(row,'나이',animal.age,'number',v=>animal.age=v,{min:0,step:1});field(row,'주기',animal.tick,'number',v=>animal.tick=v,{min:0,step:1});check(row,'성체',animal.adult,v=>animal.adult=v);check(row,'먹이',animal.fed,v=>animal.fed=v);}box.append(row);
    });
  }
  function ecotech(host){var box=section(host,'생태기술');runtime.ECO_TECH.forEach(t=>check(box,t.name,draft.ecoTechUnlocked.includes(t.id),v=>{draft.ecoTechUnlocked=v?[...new Set([...draft.ecoTechUnlocked,t.id])]:draft.ecoTechUnlocked.filter(x=>x!==t.id);}));json(box,'조사 / 퀘스트 상세 · 읽기 전용',{quests:draft.ecoTechQuests,sites:draft.ecoTechSites,findings:draft.ecoTechFindings});}
  function tower(host){var box=section(host,'몬스터의 탑'),g=grid(box);field(g,'최고 도달 층',draft.tower.best,'number',v=>draft.tower.best=v,{min:0,step:1});
    field(g,'해당 기록 시간 (분:초)',fmt(draft.tower.bestTime),'text',v=>{var m=/^(\d+):([0-5]\d)$/.exec(v);draft.tower.bestTime=m?Number(m[1])*60+Number(m[2]):NaN;},{pattern:'[0-9]+:[0-5][0-9]'});
    box.append(node('p','최고 층과 그 기록의 시간을 함께 수정하세요. 도전 횟수와 과거 기록은 유지합니다.','muted'));json(box,'도전 이력 · 읽기 전용',{runs:draft.tower.runs,history:draft.tower.history});}
  function normalized(){
    function finite(v){return typeof v==='number'?Number.isFinite(v):Array.isArray(v)?v.every(finite):v&&typeof v==='object'?Object.values(v).every(finite):true;}
    if(!finite(draft)||!Number.isSafeInteger(draft.lv)||!Number.isSafeInteger(draft.exp)||!Number.isSafeInteger(draft.gold)||!Number.isSafeInteger(draft.tower.best)||!Number.isSafeInteger(draft.tower.bestTime))throw Error('Invalid numeric input');
    var state=runtime.migrate(JSON.parse(JSON.stringify(draft)));delete state.scene;delete state.modal;return state;
  }
  function confirm(title,text,fn,label='확인'){if(busy)return;$('dialogTitle').textContent=title;$('dialogBody').replaceChildren(node('p',text));confirmation=fn;$('acceptDialog').hidden=false;$('acceptDialog').textContent=label;$('cancelDialog').textContent='취소';$('confirmDialog').showModal();}
  function showSecret(code){if(!code)return;$('dialogTitle').textContent='이어하기 코드';$('dialogBody').replaceChildren(node('p','이 코드는 학생 기록을 여는 비밀 코드입니다. 학생 본인에게만 전달하세요.'),node('p',code,'secret'));
    $('dialogBody').append(button('코드 복사',async()=>{try{await navigator.clipboard.writeText(code);note('코드를 복사했습니다.');}catch(_){note('코드를 직접 확인해 적어 주세요.');}}));
    confirmation=null;$('acceptDialog').hidden=true;$('cancelDialog').textContent='닫기';if(!$('confirmDialog').open)$('confirmDialog').showModal();}
  function preview(){
    if(busy||!student||!draft)return;var state;try{state=normalized();}catch(_){note('입력 형식을 확인해 주세요.',true);return;}
    var labels={name:'이름',lv:'레벨',exp:'EXP',gold:'골드',potions:'회복약',tickets:'뽑기권',themeId:'현재 지역',gauge:'정화율',cleared:'지역 완료',progress:'지역 진행',owned:'보유 장비',gear:'착용 장비',farm:'농장',ecoTechUnlocked:'생태기술',tower:'탑 기록',lessonDone:'학습',quizDone:'퀴즈',advDone:'생각 넓히기',battleDone:'전투 진행'};
    var changes=[];for(const k of ['name','lv','exp','gold','potions','tickets'])if(JSON.stringify(state[k])!==JSON.stringify(student.saveData[k]))changes.push(labels[k]+': '+student.saveData[k]+' → '+state[k]);
    for(const k of ['themeId','gauge','cleared','progress','owned','gear','farm','ecoTechUnlocked','tower','lessonDone','quizDone','advDone','battleDone'])if(JSON.stringify(state[k])!==JSON.stringify(student.saveData[k]))changes.push(labels[k]+' 변경');
    if(!changes.length){note('변경한 항목이 없습니다.');return;}
    confirm('변경 내용 확인',changes.join('\n'),()=>mutate('update',state));$('acceptDialog').textContent='저장';
  }
  async function mutate(action,state){
    var id=student.id,token=epoch,result=await request(action,{id,expectedRevision:student.revision,confirm:true,...(state?{saveData:state}:{} )});
    if(token!==epoch)return;
    if(!result.ok){note(result.message,true);return;}
    var code=result.code;note(action==='update'?'학생 기록을 수정했습니다.':action==='softDelete'?'학생 기록을 삭제된 상태로 이동했습니다.':action==='restore'?'학생 기록을 복구했습니다.':'새 이어하기 코드를 발급했습니다.');
    await detail(id);await list();if(code)showSecret(code);
  }
  async function exportStudent(){
    var token=epoch,result=await request('export',{id:student.id});if(token!==epoch)return;if(!result.ok){note(result.message,true);return;}
    var s=result.student,blob=new Blob([JSON.stringify({code:s.code,saveVersion:s.saveVersion,revision:s.revision,updatedAt:s.updatedAt,saveData:s.saveData},null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download='student-backup-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);note('학생 기록 백업을 내려받았습니다. 파일의 이어하기 코드를 안전하게 보관하세요.');
  }
  function newStudent(){
    if(!creationAttempted){createRequestId=crypto.randomUUID();creationName='';creationPet='earth';}
    $('dialogTitle').textContent=creationAttempted?'학생 추가 결과 다시 확인':'새 학생 추가';var body=$('dialogBody');body.replaceChildren();
    if(creationAttempted)body.append(node('p','이전 추가 요청의 결과를 다시 확인합니다. 새 기록을 중복 생성하지 않습니다.','muted'));
    var nameInput=field(body,'게임 내 이름',creationName,'text',v=>creationName=v,{maxlength:8});var petInput=select(body,'정령',creationPet,Object.values(runtime.PETS).map(p=>[p.key,p.name]),v=>creationPet=v);
    nameInput.disabled=creationAttempted;petInput.disabled=creationAttempted;
    confirmation=async()=>{
      creationAttempted=true;var token=epoch,result=await request('create',{name:creationName,petKey:creationPet,createRequestId});if(token!==epoch)return;
      if(!result.ok){if(['INVALID_STUDENT_FIELD','INVALID_SAVE_DATA'].includes(result.error))creationAttempted=false;note(result.message,true);return;}
      creationAttempted=false;createRequestId=null;note('새 학생 기록을 만들었습니다.');await detail(result.id);await list();showSecret(result.code);
    };
    $('acceptDialog').hidden=false;$('acceptDialog').textContent='학생 추가';$('cancelDialog').textContent='취소';$('confirmDialog').showModal();
  }
  async function initialize(){
    if(!root.supabase||!root.EcoStudentAdminClient){note('로그인 기능을 불러오지 못했습니다. 인터넷 연결 후 새로고침해 주세요.',true);$('loginButton').disabled=true;return;}
    var frame=$('stateRuntime');frame.src='./admin-state.html?v='+encodeURIComponent(root.BUILD_VERSION||'');
    await new Promise((resolve,reject)=>{var timer=setTimeout(()=>reject(Error('State runtime timeout')),10000);frame.onload=()=>{clearTimeout(timer);resolve();};});
    runtime=frame.contentWindow;if(typeof runtime.newState!=='function'||typeof runtime.migrate!=='function')throw Error('State validation unavailable');
    client=root.supabase.createClient(root.EcoAdminConfig.projectUrl,root.EcoAdminConfig.publishableKey,{auth:{storage:sessionStorage,storageKey:'eco:admin:session',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    api=root.EcoStudentAdminClient.create({auth:client.auth,config:root.EcoAdminConfig});
    client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){clear();}});
    $('loginForm').addEventListener('submit',e=>{e.preventDefault();work(async()=>{
      var result;try{result=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});}finally{$('password').value='';}
      if(result.error){note('로그인 정보를 확인해 주세요.',true);return;}
      $('workspace').hidden=false;$('logout').hidden=false;$('loginPanel').hidden=true;note('관리 권한을 확인합니다.');await list();if(!$('workspace').hidden&&$('notice').textContent==='관리 권한을 확인합니다.')note('학생 기록을 선택해 확인하세요.');
    });});
    $('logout').addEventListener('click',()=>{clear();client.auth.signOut({scope:'local'}).catch(()=>{});note('로그아웃했습니다.');});
    $('searchForm').addEventListener('submit',e=>{e.preventDefault();offset=0;work(list);});
    $('previous').addEventListener('click',()=>{offset=Math.max(0,offset-25);work(list);});$('next').addEventListener('click',()=>{offset+=25;work(list);});
    $('newStudent').addEventListener('click',newStudent);
    $('cancelDialog').addEventListener('click',()=>{if(!busy){$('confirmDialog').close();$('dialogBody').replaceChildren();secret=null;confirmation=null;}});
    $('confirmDialog').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
    $('acceptDialog').addEventListener('click',()=>{var fn=confirmation;if(fn)work(async()=>{$('confirmDialog').close();await fn();});});
    var existing=await client.auth.getSession();if(existing.data?.session){$('workspace').hidden=false;$('logout').hidden=false;$('loginPanel').hidden=true;await work(list);}
  }
  initialize().catch(()=>{clear();note('관리 화면을 준비하지 못했습니다. 새로고침해 주세요.',true);$('loginButton').disabled=true;});
})(window);
