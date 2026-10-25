/* Audit UI only, injected by serve-deployment-audit.mjs. Uses real Supabase SDK / Presence. */
(function(){'use strict';
  var initialStorage=localStorage.length,rawFetch=fetch.bind(window),output,history=[],errors=[],last=null;
  var counts={cloudRequests:0,trackCalls:0,broadcasts:0,privacyViolations:0},online=true,hidden=false;
  function safe(value){return String(value||'').replace(/EC-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}/g,'[private TEST code]');}
  addEventListener('error',event=>errors.push(safe(event.message)));addEventListener('unhandledrejection',()=>errors.push('Unhandled rejection'));
  Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>online});
  window.fetch=function(input,init){var url=new URL(typeof input==='string'?input:input.url,location.href);
    if(url.pathname==='/functions/v1/student-save'){
      counts.cloudRequests++;if(!online)return Promise.reject(new TypeError('Audit offline'));
      var requestedAt=Date.now();return rawFetch('/__audit/student-save',init).then(async response=>{var result=await response.clone().json().catch(()=>({}));
        history.push({requestedAt:requestedAt,at:Date.now(),action:JSON.parse(init.body).action,ok:result.ok,error:result.error,revision:result.revision});return response;});
    }return rawFetch(input,init);};
  addEventListener('load',()=>{
    var client=window.ecoSupabase?.client;if(client){var channel=client.channel.bind(client);client.channel=function(){var ch=channel(...arguments),track=ch.track.bind(ch),send=ch.send.bind(ch);
      ch.track=function(payload){counts.trackCalls++;if(Object.keys(payload).some(key=>/cloudcode|^code$|token|password/i.test(key)))counts.privacyViolations++;return track(...arguments);};
      ch.send=function(message){if(message?.type==='broadcast')counts.broadcasts++;return send(...arguments);};return ch;};}
    var box=document.createElement('details');box.open=true;box.id='deploymentAudit';box.style.cssText='position:fixed;bottom:3px;left:3px;z-index:50000;background:#fffde9;color:#152e24;max-width:min(780px,95vw);padding:5px;font:11px monospace;border:1px solid #638b50';
    box.innerHTML='<summary>LIVE TEST AUDIT · 운영 Supabase · TESTK8A/B 전용</summary>';var buttons=document.createElement('div');buttons.style.cssText='display:flex;flex-wrap:wrap;gap:3px';box.append(buttons);
    output=document.createElement('output');output.id='deploymentAuditState';output.style.cssText='display:block;max-height:95px;overflow:auto;word-break:break-all';box.append(output);
    function own(){if(!/^TESTK8[AB]$/.test(window.S?.name))throw Error('TEST student required');}
    function button(text,fn,needsOwn=true){var b=document.createElement('button');b.textContent=text;b.onclick=async()=>{b.disabled=true;var at=Date.now();try{if(needsOwn)own();await fn();last={action:text,at:at,ok:true};}catch(e){last={action:text,at:at,ok:false,error:safe(e.message)};}finally{b.disabled=false;update();}};buttons.append(b);}
    button('TEST summary',()=>{S.lv=2;S.exp=LEVELS[1].need;var gear=GEAR_ALL.weapon[0];if(!S.owned.includes(gear.id))S.owned.push(gear.id);S.gear.weapon=gear.id;S.tower.best=18;S.tower.bestTime=462;autosave();paintHud();});
    button('TEST gold +1',()=>{S.gold++;autosave();paintHud();});
    button('TEST river',()=>{if(S.modal)closeModal();if(!S.cleared.includes('forest'))S.cleared.push('forest');admGo('river');});
    button('TEST forest',()=>{if(S.modal)closeModal();admGo('forest');});
    button('TEST disconnect',()=>ecoSupabase.client.realtime.disconnect());
    button('TEST reconnect',()=>ecoSupabase.client.realtime.connect());
    button('TEST offline',()=>{online=false;dispatchEvent(new Event('offline'));},false);
    button('TEST online',()=>{online=true;dispatchEvent(new Event('online'));},false);
    button('TEST hide 30s',()=>{hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});document.dispatchEvent(new Event('visibilitychange'));});
    button('TEST visible',()=>{hidden=false;document.dispatchEvent(new Event('visibilitychange'));});
    button('TEST mini',()=>{if(S.modal)closeModal();admMini('timing');});
    button('TEST fight',()=>{if(S.modal)closeModal();admFight();});
    button('TEST world',()=>{if(S.modal)closeModal();miniStop();closeBattleDom();B=null;Tw.on=false;S.scene='world';if(!document.getElementById('worldRoot'))Wd.ready=false;render();});
    button('Hide audit',()=>box.open=false,false);
    function update(){if(!output||!window.S)return;var cloud=window.CloudSync?.view()||{},channels=window.ecoSupabase?.client?.getChannels()||[];
      var keys=[...new Set(channels.flatMap(ch=>Object.values(ch.presenceState()).flatMap(a=>a.flatMap(p=>Object.keys(p)))))];
      output.textContent=JSON.stringify({source:'audited local build + LIVE Supabase',initialStorageKeys:initialStorage,build:BUILD_VERSION,saveVersion:SAVE_VERSION,
        scene:S.scene,modal:S.modal,name:/^TESTK8[AB]$/.test(S.name)?S.name:'not-test',level:S.lv,gold:S.gold,theme:S.themeId,
        tower:{best:S.tower?.best,time:S.tower?.bestTime},local:{x:Math.round(Wd.px),y:Math.round(Wd.py),direction:Wd.face,hero:!!document.getElementById('hero')},
        remoteDom:document.querySelectorAll('.eco-remote-player').length,stats:window.ecoMultiplayer?.getStats(),counts:counts,presenceKeys:keys,
        cloud:{status:cloud.status,revision:cloud.revision,pending:cloud.pending,conflict:!!cloud.conflict},history:history.slice(-8),hiddenSimulated:hidden,last:last,errors:errors,
        viewport:{width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1}});}
    document.body.append(box);setInterval(update,500);update();
  });
})();
