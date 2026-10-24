/* Student wording and the existing modal host. Secrets appear only on explicit code screens. */
(function (root) {
  'use strict';
  if (!root.CloudSync) return;
  var sync=root.CloudSync, notice=null, busy=false, lastFocus=null;
  function escape(value) {return root.esc(String(value==null?'':value));}
  function message(text) {var el=document.getElementById('ecoCloudMessage');if(el)el.textContent=text;}
  function error(result) {
    if(result.error==='BUSY')return '저장 중이에요. 잠시 후 다시 해 주세요.';
    return result.message || (result.error==='NOT_FOUND'?'저장 기록을 찾지 못했어요.':'서버에 연결하지 못했어요. 이 기기 기록은 그대로예요.');
  }
  function show(kind) {
    if(busy||!root.S||(root.S.modal&&!root.S.modal.startsWith('cloud')))return;
    lastFocus=document.activeElement;
    root.openModal('cloud'+kind);mount(kind);
  }
  function close() {
    if(busy)return;
    root.closeModal();if(lastFocus&&lastFocus.isConnected)lastFocus.focus();
  }
  function button(text,fn,secondary) {
    var el=document.createElement('button');el.type='button';el.className='btn'+(secondary?' sec':'');el.textContent=text;
    el.addEventListener('click',fn);return el;
  }
  function summary(state) {
    if(!state)return '기록을 확인할 수 없어요.';
    var theme=root.THEMES[state.themeId];
    return '레벨 '+state.lv+' · '+(theme?theme.name:'현재 지역')+' · 탑 '+(state.tower&&state.tower.best||0)+'층';
  }
  async function run(fn) {
    if(busy)return;busy=true;lock();
    var result;
    try{result=await fn();}catch(_){result={ok:false};}
    busy=false;lock();
    if(!result.ok)message(error(result));
    if(result.offline&&root.toast)root.toast('인터넷에 연결되지 않았어요. 이 기기에 저장된 기록으로 이어할게요.');
    pump();return result;
  }
  function lock() {document.querySelectorAll('.eco-cloud-sheet button,.eco-cloud-sheet input').forEach(function(el){el.disabled=busy;});}
  function mount(kind) {
    var sheet=document.querySelector('#modalHost .sheet');if(!sheet)return;
    if(root.S.modal&&root.S.modal.startsWith('cloud'))root.S.modal='cloud'+kind;
    sheet.classList.add('eco-cloud-sheet');sheet.replaceChildren();
    var head=document.createElement('div');head.className='mhead';
      var title=document.createElement('span');title.textContent=kind==='relink'?'이어하기 코드 확인':kind==='code'?'내 이어하기 코드':kind==='load'?'저장 코드로 이어하기':kind==='device'?'이 기기에서 이어하기':kind==='conflict'?'저장 기록 확인':'다른 기기에서도 이어하기';
    head.appendChild(title);head.appendChild(button('닫기',close,true));sheet.appendChild(head);
    var body=document.createElement('div');body.className='col';sheet.appendChild(body);
    var msg=document.createElement('p');msg.id='ecoCloudMessage';msg.className='eco-cloud-message';msg.setAttribute('role','status');sheet.appendChild(msg);
    if(kind==='relink'){
      body.appendChild(document.createTextNode('이어하기 코드가 변경되었거나 기록을 사용할 수 없어요. 선생님께 새 코드를 확인해 주세요. 이 기기의 아직 보내지 못한 기록은 그대로 보관해요.'));
      body.appendChild(button('새 코드 입력',function(){show('load');}));
      body.appendChild(button('이 기기에서 계속하기',close,true));
    } else if(kind==='load') {
      var input=document.createElement('input');input.className='namefield eco-cloud-input';input.placeholder='EC-XXXX-XXXX';input.maxLength=16;
      input.setAttribute('aria-label','이어하기 코드');input.autocomplete='off';input.spellcheck=false;
      body.appendChild(input);
      var load=function(){run(async function(){var r=await sync.loadCode(input.value);if(r.ok){notice=null;}return r;});};
      input.addEventListener('keydown',function(e){if(e.key==='Enter')load();});body.appendChild(button('이어하기',load));input.focus();
    } else if(kind==='device') {
      var codes=root.Save.index().slice().reverse();
      codes.forEach(function(code){var state=root.Save.load(code);if(!state)return;
        body.appendChild(button((state.name||code)+' · Lv. '+state.lv+' ('+code+')',function(){run(function(){return sync.resumeLocal(code);});}));
      });
      sync.entries().forEach(function(entry){body.appendChild(button(entry.name+' · Lv. '+entry.level,function(){run(function(){return sync.resumeEntry(entry.id);});}));});
      if(!body.children.length)message('이 기기에 저장된 기록이 없어요.');
    } else if(kind==='code') {
      var view=sync.view();
      if(view.code) {
        var code=document.createElement('strong');code.className='eco-cloud-code';code.textContent=view.code;body.appendChild(code);
        var note=document.createElement('p');note.className='note';note.textContent='다른 기기에서도 이 코드로 이어할 수 있어요. 이 코드는 내 게임 기록을 여는 코드예요. 다른 친구에게 알려주지 마세요.';body.appendChild(note);
        body.appendChild(button('코드 복사',async function(){try{await navigator.clipboard.writeText(view.code);message('코드를 복사했어요.');}catch(_){message('코드를 보고 직접 적어 주세요.');}}));
        body.appendChild(button('확인했어요',close,true));
        if(view.status==='error')message('기록 확인이 필요해요. 게임을 새로고침해 주세요.');
      } else promotion(body);
    } else if(kind==='offer') promotion(body);
    else if(kind==='conflict') {
      var conflict=sync.view().conflict;
      if(!conflict){close();return;}
      message('다른 기기에서도 게임 기록이 저장되었어요. 이어할 기록을 골라 주세요.');
      [['server','서버에 있는 기록',conflict.server],['device','이 기기의 기록',conflict.device]].forEach(function(item){
        var card=document.createElement('div');card.className='card eco-cloud-summary';
        var label=document.createElement('b');label.textContent=item[1];card.appendChild(label);
        var line=document.createElement('div');line.textContent=summary(item[2]);card.appendChild(line);
        var date=document.createElement('div'),time=item[0]==='server'?conflict.updatedAt:conflict.localSavedAt;
        date.textContent='마지막 저장: '+(time?new Date(time).toLocaleString('ko-KR'):'이 기기의 최근 기록');card.appendChild(date);
        body.appendChild(card);
        body.appendChild(button(item[0]==='server'?'서버 기록으로 이어하기':'이 기기 기록 사용하기',function(){run(async function(){
          var r=await sync.choose(item[0]==='server'?'server':'device');if(r.ok){notice=null;if(root.S.modal&&root.S.modal.startsWith('cloud'))root.closeModal();}return r;
        });},item[0]==='device'));
      });
    }
    lock();
  }
  function promotion(body) {
    var p=document.createElement('p');p.className='note';p.textContent='다른 기기에서도 이어할 수 있게 저장 코드를 만들 수 있어요.';body.appendChild(p);
    body.appendChild(button('저장 코드 만들기',function(){run(async function(){var r=await sync.promote();if(r.ok){notice=null;mount(sync.view().conflict?'conflict':'code');}return r;});}));
  }
  function pump() {
    var view=sync.view(),state=root.S;
    if(!state)return;
    var buttons=document.querySelector('#hudHost .hudbtns');
    if(buttons&&!buttons.querySelector('.eco-cloud-menu')) {
      var group=document.createElement('span');group.className='eco-cloud-menu';
      var menu=button('내 이어하기 코드',function(){var v=sync.view();show(v.relink?'relink':v.conflict?'conflict':'code');},true);menu.className='iconbtn';group.appendChild(menu);
      var status=document.createElement('small');status.className='eco-cloud-status';status.setAttribute('role','status');group.appendChild(status);buttons.appendChild(group);
    }
    var statusEl=document.querySelector('.eco-cloud-status');
    var label=view.storageWarning?'⚠️ 기기 저장 공간 확인':view.status==='saved'?'☁️ 저장됨':view.status==='saving'?'☁️ 저장 중…':
      view.status==='conflict'||view.status==='error'||view.status==='relink'?'⚠️ 저장 확인 필요':view.status==='offline'?'☁️ 오프라인 저장':view.status==='pending'?'☁️ 저장 대기':'이 기기에 저장';
    if(statusEl&&statusEl.textContent!==label)statusEl.textContent=label;
    if(!busy&&notice==='code'&&state.modal==='cloudoffer'){notice=null;mount('code');return;}
    if(busy||state.scene!=='world'||state.modal)return;
    if(notice){var next=notice;notice=null;show(next);}
  }
  sync.on(function(type){
    if(type==='code')notice=sync.view().conflict?'conflict':'code';else if(type==='offer'||type==='create-failed')notice='offer';else if(type==='conflict')notice='conflict';else if(type==='relink')notice='relink';pump();
    if(type==='create-failed')message('저장 코드를 아직 만들지 못했어요. 인터넷 연결 후 다시 만들 수 있어요.');
  });
  var draw=root.drawModal,paint=root.paintHud,render=root.render,closed=root.closeModal;
  root.drawModal=function(){var r=draw.apply(this,arguments);if(root.S.modal&&root.S.modal.startsWith('cloud'))mount(root.S.modal.slice(5));return r;};
  root.paintHud=function(){var r=paint.apply(this,arguments);pump();return r;};
  root.render=function(){var r=render.apply(this,arguments);pump();return r;};
  root.closeModal=function(){var r=closed.apply(this,arguments);pump();return r;};
  root.CloudUI={load:function(){show('load');},device:function(){show('device');},code:function(){show('code');},beforeResume:function(){
    var host=document.getElementById('modalHost');
    // Title modals live outside the replaced game screen. Remove that stale host.
    if(host&&root.S.modal&&root.S.modal.startsWith('cloud'))host.remove();
  }};
  document.addEventListener('keydown',function(e){if(busy&&root.S.modal&&root.S.modal.startsWith('cloud')&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();}},true);
  pump();
})(window);
