/* Local-first coordination. No game rules, save schema or multiplayer state here. */
(function (root) {
  'use strict';
  var LINKS = 'echo:__cloud_links', LAST = 'echo:__cloud_last';
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function stable(value) {
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(function (k) {
      return JSON.stringify(k) + ':' + stable(value[k]);
    }).join(',') + '}';
    return JSON.stringify(value);
  }
  function create(options) {
    var api = options.api, storage = options.storage, session = null, listeners = [], memory = {}, timer = null, cacheOwners=new WeakMap();
    var epoch = 0, flight = null, failures = 0, newStudent = false, storageWarning = false, volatile = new Set();
    var defer = options.setTimeout || root.setTimeout.bind(root), cancel = options.clearTimeout || root.clearTimeout.bind(root);
    var debounce = options.debounce == null ? 1500 : options.debounce;
    function get(key) { if(volatile.has(key))return memory[key]||null;try { return storage.getItem(key); } catch (_) { return memory[key] || null; } }
    function read(key, fallback) { try { return JSON.parse(get(key)) || fallback; } catch (_) { return fallback; } }
    var links = read(LINKS, {});
    if (!links || typeof links !== 'object' || Array.isArray(links)) links = {};
    function put(key, data) {
      var value = JSON.stringify(data); memory[key] = value;
      try { storage.setItem(key, value); volatile.delete(key);return true; } catch (_) { volatile.add(key);storageWarning = true; return false; }
    }
    function uuid() {
      if (options.uuid) return options.uuid();
      if (root.crypto.randomUUID) return root.crypto.randomUUID();
      var b = root.crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
      return Array.from(b,function (n,i) { return ([4,6,8,10].includes(i)?'-':'')+n.toString(16).padStart(2,'0'); }).join('');
    }
    function emit(type) { listeners.slice().forEach(function (fn) { try { fn(type || 'state'); } catch (_) {} }); }
    function online() { return options.online ? options.online() : !root.navigator || root.navigator.onLine !== false; }
    function alive(token, link) { return token === epoch && session && session.link === link; }
    function key(link) { return 'echo:cloud:' + link.id; }
    // Retain old device backups, but never accept old codes in the new code-entry UI.
    function legacyCode(code) {return typeof code==='string'&&/^EC-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/.test(code);}
    function validLink(link) {
      return link && typeof link.id === 'string' && /^[0-9a-f-]{36}$/i.test(link.id) && /^EC\d{4}$/.test(link.localCode) &&
        ['local','cache'].includes(link.kind) && (!link.cloudCode || api.normalizeCode(link.cloudCode) === link.cloudCode || legacyCode(link.cloudCode)) &&
        Number.isSafeInteger(link.revision) && link.revision >= 0;
    }
    Object.keys(links).forEach(function (id) { if (!validLink(links[id]) || links[id].id !== id) delete links[id]; });
    function metadata() {
      // Preserve links added by another tab, without adopting its in-flight revision.
      var disk=read(LINKS,{});Object.keys(disk).forEach(function(id){if(!links[id]&&validLink(disk[id]))links[id]=disk[id];});
      return put(LINKS, links);
    }
    function envelope(link, state, pending) {
      return {state:clone(state), savedAt:Date.now(), revision:link.revision, pendingSync:pending,
        cloudCode:link.cloudCode, localCode:link.localCode};
    }
    function persist(link, state, pending) {
      // One latest cache doubles as the pending snapshot; never an unbounded queue.
      link.pendingSync = !!pending;
      var disk = put(key(link), envelope(link,state,pending)); metadata();
      return disk;
    }
    function cached(link) {
      var env = read(key(link), null);
      if (env && env.localCode === link.localCode && env.cloudCode === link.cloudCode && env.state) {
        // The envelope is written before metadata; repair a torn metadata write.
        if (Number.isSafeInteger(env.revision) && env.revision >= link.revision) {
          link.revision = env.revision; link.pendingSync = !!env.pendingSync;
        }
        try { return root.migrate(env.state); } catch (_) { return null; }
      }
      return link.kind === 'local' ? options.localLoad(link.localCode) : null;
    }
    function snapshot(state) { return api.snapshot(state); }
    function equal(a,b) { return stable(snapshot(a)) === stable(snapshot(b)); }
    async function loadServer(code,link) {
      var result=await api.load(code,link&&link.resumeToken);
      if(result.ok&&(!result.saveData||!/^EC\d{4}$/.test(result.saveData.code)||(link&&result.saveData.code!==link.localCode))) {
        return {ok:false,error:'INVALID_SAVE_DATA',message:'저장 기록을 확인하지 못했어요. 이 기기의 기존 기록은 그대로예요.'};
      }
      if(result.ok&&link&&result.resumeToken){link.resumeToken=result.resumeToken;metadata();}
      return result;
    }
    function current(link) {
      var state = options.state();
      return session && session.link === link && state && state.code === link.localCode ? clone(state) : cached(link);
    }
    function schedule(delay) {
      if (timer) cancel(timer);
      timer = null;
      if (!session || session.conflict || session.blocked || !online()) return;
      timer = defer(function () { timer = null; flush(); }, delay == null ? debounce : delay);
    }
    function stop() { if (timer) cancel(timer); timer = null; epoch++; session = null; emit(); }
    function activate(link) {
      stop(); session = {link:link, status:link.pendingSync?'offline':link.cloudCode?'saved':'local', conflict:null};
      put(LAST,link.id); emit();
    }
    function acknowledged(link, result, state) {
      link.revision = result.revision; link.lastSyncedAt = result.updatedAt;
      if(result.resumeToken)link.resumeToken=result.resumeToken;
      var latest = current(link) || state, pending = !equal(latest,state);
      persist(link,latest,pending); session.status = pending?'pending':'saved'; failures = 0; emit();
    }
    function setConflict(link, server) {
      session.conflict = server; session.status = 'conflict'; link.pendingSync = true;
      persist(link,current(link),true); emit('conflict');
    }
    async function flush() {
      if(session&&session.blocked)return {ok:false,error:'INVALID_SAVE_DATA'};
      if (!session || session.conflict || !online()) {if(session&&!session.conflict){session.status='offline';emit();}return {ok:false,error:'OFFLINE',message:'저장 코드를 아직 만들지 못했어요. 인터넷 연결 후 다시 만들 수 있어요.'};}
      // Includes create, save, conflict choices and resume: only one writer per coordinator.
      if (flight) { schedule(debounce); return flight; }
      var link = session.link;
      if (!link.cloudCode && !link.createRequestId) return {ok:false,error:'UNLINKED'};
      if (link.cloudCode && !link.pendingSync) return {ok:true};
      var token = epoch, attempt = current(link);
      if (!attempt) return {ok:false,error:'NO_BACKUP'};
      session.status = 'saving'; emit();
      flight = (async function () {
        var result;
        try {
          if (!link.cloudCode) {
            result = await api.create(attempt,link.createRequestId);
            if (!alive(token,link)) return result;
            if (result.ok) {
              link.cloudCode = result.code; link.revision = result.revision; link.lastSyncedAt = result.updatedAt;
              if(result.resumeToken)link.resumeToken=result.resumeToken;
              // Persist the confirmed code even if the subsequent verification request fails.
              persist(link,current(link),true);
              var server = await loadServer(link.cloudCode,link);
              if (!alive(token,link)) return result;
              if (server.ok) {
                if (server.revision > 1 && !equal(current(link),server.saveData)) setConflict(link,server);
                else acknowledged(link,server,server.saveData);
              } else if(server.error==='NOT_FOUND'){
                session.blocked=true;session.relink=true;session.status='relink';emit('relink');return server;
              } else { session.status = 'offline';if(!networkError(server))session.blocked=true; }
              emit('code');
              return result;
            }
          } else {
            result = await api.save(link.cloudCode,attempt,link.revision,link.resumeToken);
            if (!alive(token,link)) return result;
            if (result.ok) { acknowledged(link,result,attempt); return result; }
            if (result.error === 'REVISION_CONFLICT') {
              var latest = await loadServer(link.cloudCode,link);
              if (!alive(token,link)) return result;
              if (latest.ok) {
                // Lost response: the write succeeded, so do not ask a false conflict question.
                if (equal(latest.saveData,current(link))) { acknowledged(link,latest,latest.saveData); return {ok:true,recovered:true}; }
                setConflict(link,latest); return result;
              } else if(!networkError(latest))session.blocked=true;
            }
          }
          if(result&&result.error==='NOT_FOUND'){
            session.blocked=true;session.relink=true;session.status='relink';emit('relink');return result;
          }
          if(result&&result.retryAfter)session.retryAt=Date.now()+result.retryAfter*1000;
          session.status = 'offline'; failures++; emit(!link.cloudCode?'create-failed':'state'); return result;
        } catch (_) {
          if (alive(token,link)) { session.status = 'offline'; failures++; emit(); }
          return {ok:false,error:'NETWORK_ERROR'};
        }
      })();
      try { return await flight; }
      finally {
        flight = null;
        if (session && !session.conflict && !session.blocked && (session.link.pendingSync || (!session.link.cloudCode && session.link.createRequestId))) {
          schedule(Math.max(session.retryAt-Date.now()||0,failures ? Math.min(60000,5000*Math.pow(2,Math.min(failures-1,4))) : debounce));
        }
      }
    }
    function afterLocal(state) {
      if (!session || state.code !== session.link.localCode) return;
      var link = session.link;
      if(!link.cloudCode&&!link.createRequestId){persist(link,state,false);session.status='local';emit();return;}
      var previous = cached(link), changed = !previous || !equal(previous,state);
      var pending = link.pendingSync || changed;
      persist(link,state,pending);
      if (pending && !session.conflict) { session.status = online()?'pending':'offline'; schedule(); }
      emit();
    }
    function saveLocal(state) {
      if(!state)return null;
      var link=cacheOwners.get(state)||(session&&session.link.kind==='cache'&&state.code===session.link.localCode?session.link:null);
      if(!link||state.code!==link.localCode)return null;
      state.v = root.CURRENT_SAVE_VERSION; state.saveVersion = root.CURRENT_SAVE_VERSION;
      var before = storageWarning; storageWarning = false;
      if(session&&session.link===link)afterLocal(state);
      else {var previous=cached(link);persist(link,state,link.pendingSync||!previous||!equal(previous,state));}
      var mode = storageWarning?'mem':'disk'; storageWarning = before || storageWarning;
      return mode;
    }
    function findLocal(code) { return Object.values(links).find(function (link) { return link.kind==='local' && link.localCode===code; }); }
    function findCloud(code) { return Object.values(links).find(function (link) { return link.cloudCode===code; }); }
    function makeLink(state,kind) {
      var link = {id:uuid(),localCode:state.code,kind:kind,cloudCode:null,revision:0,lastSyncedAt:null,pendingSync:false,createRequestId:null};
      links[link.id] = link; return link;
    }
    function safeResume(state,link) {
      if(!state||!/^EC\d{4}$/.test(state.code)||state.code!==link.localCode)return false;
      activate(link);
      if (options.resume(clone(state)) === false) { stop(); return false; }
      if(link.kind==='cache')cacheOwners.set(options.state(),link);
      return true;
    }
    function networkError(result) { return ['NETWORK_ERROR','TIMEOUT','SERVER_UNAVAILABLE','NOT_CONFIGURED','RATE_LIMITED'].includes(result.error); }
    async function resumeLinked(link, local) {
      if (flight) return {ok:false,error:'BUSY'};
      if (!local) return {ok:false,error:'NO_BACKUP',message:'이 기기에서 저장 기록을 찾지 못했어요.'};
      if(legacyCode(link.cloudCode)) {
        if(!safeResume(local,link))return {ok:false,error:'INVALID_SAVE_DATA'};
        session.blocked=true;session.relink=true;emit('relink');
        return {ok:true,offline:true,legacy:true};
      }
      if (!link.cloudCode) {
        if(!safeResume(local,link))return {ok:false,error:'INVALID_SAVE_DATA'};
        if (link.createRequestId) schedule(0); return {ok:true};
      }
      var token = ++epoch;
      var server = online() ? await loadServer(link.cloudCode,link) : {ok:false,error:'NETWORK_ERROR'};
      if (token !== epoch) return {ok:false,error:'CANCELLED'};
      if (!server.ok) {
        if (!networkError(server)) return server.error==='NOT_FOUND'?Object.assign({},server,{message:'이어하기 코드가 변경되었거나 기록을 사용할 수 없어요. 선생님께 새 코드를 확인해 주세요.'}):server;
        if(!safeResume(local,link))return {ok:false,error:'INVALID_SAVE_DATA'};
        session.status='offline'; emit();
        return {ok:true,offline:true};
      }
      var pending = link.pendingSync;
      if (pending && !equal(local,server.saveData)) {
        if(!safeResume(local,link))return {ok:false,error:'INVALID_SAVE_DATA'};
        if (server.revision !== link.revision) setConflict(link,server); else schedule(0);
      } else {
        link.revision = server.revision; link.lastSyncedAt = server.updatedAt; link.pendingSync=false;
        persist(link,server.saveData,false);if(!safeResume(server.saveData,link))return {ok:false,error:'INVALID_SAVE_DATA'};
      }
      return {ok:true};
    }
    async function resumeLocal(code) {
      if (flight) return {ok:false,error:'BUSY'};
      var state = options.localLoad(code); if (!state) return {ok:false,error:'NOT_FOUND',message:'그 번호의 저장 기록을 찾지 못했어요.'};
      var link = findLocal(code);
      if (link) return resumeLinked(link,state);
      stop();
      if (options.resume(state) === false) return {ok:false,error:'INVALID_SAVE_DATA'};
      link = makeLink(state,'local'); activate(link); persist(link,state,false);
      if (!link.offered) { link.offered = true; metadata(); emit('offer'); }
      return {ok:true};
    }
    async function loadCode(input) {
      if (flight) return {ok:false,error:'BUSY'};
      var code = api.normalizeCode(input); if (!code) return {ok:false,error:'INVALID_CODE',message:'저장 코드를 다시 확인해 주세요.'};
      var link = findCloud(code);
      if (link) return resumeLinked(link,cached(link));
      var token = ++epoch, result = online()?await loadServer(code):{ok:false,error:'NETWORK_ERROR',message:'서버에 연결하지 못했어요.'};
      if (token !== epoch) return {ok:false,error:'CANCELLED'};
      if (!result.ok) return result;
      link = makeLink(result.saveData,'cache'); link.cloudCode=code; link.revision=result.revision; link.lastSyncedAt=result.updatedAt;
      if(result.resumeToken)link.resumeToken=result.resumeToken;
      persist(link,result.saveData,false);if(!safeResume(result.saveData,link))return {ok:false,error:'INVALID_SAVE_DATA'};
      return {ok:true};
    }
    async function promote() {
      var state = options.state(); if (!state || !/^EC\d{4}$/.test(state.code)) return {ok:false,error:'NO_SAVE'};
      if (!session || session.link.localCode !== state.code) {
        var link = findLocal(state.code) || makeLink(state,'local'); activate(link);
      }
      var active = session.link;
      if (active.cloudCode) { emit('code'); return {ok:true}; }
      if (!active.createRequestId) {
        active.createRequestId=uuid();
        // Never start a create that cannot safely be retried after a reload.
        if (!metadata()) { active.createRequestId=null; return {ok:false,error:'STORAGE_FULL',message:'기기 저장 공간을 확인해 주세요. 기존 기록은 그대로예요.'}; }
      }
      persist(active,state,true);
      return flush();
    }
    function backup(link, state, source, revision) {
      var target = 'echo:cloud-conflict:'+link.id, list = read(target,[]);
      if (!Array.isArray(list)) list=[];
      list.push({state:clone(state),source:source,revision:revision,savedAt:Date.now()});
      return put(target,list.slice(-3));
    }
    async function choose(choice) {
      if (!session || !session.conflict || flight) return {ok:false,error:'BUSY'};
      var link=session.link,token=epoch;
      session.status='saving'; emit();
      flight=(async function () {
        var latest=await loadServer(link.cloudCode,link);
        if (!alive(token,link)) return {ok:false,error:'CANCELLED'};
        if (!latest.ok) {session.status='conflict';emit();return latest;}
        var local=current(link);
        if (!backup(link,choice==='server'?local:latest.saveData,choice==='server'?'device':'server',choice==='server'?link.revision:latest.revision)) {
          session.status='conflict';emit();return {ok:false,error:'STORAGE_FULL',message:'안전한 백업을 만들 공간이 부족해요. 기록을 바꾸지 않았어요.'};
        }
        if (choice==='server') {
          // Backup was confirmed on disk before replacing the active state.
          link.revision=latest.revision;link.lastSyncedAt=latest.updatedAt;link.pendingSync=false;
          persist(link,latest.saveData,false); session.conflict=null;
          if (options.resume(clone(latest.saveData)) === false) {setConflict(link,latest);return {ok:false,error:'INVALID_SAVE_DATA'};}
          if(link.kind==='cache')cacheOwners.set(options.state(),link);
          session.status='saved';emit();return {ok:true};
        }
        var saved=await api.save(link.cloudCode,local,latest.revision,link.resumeToken);
        if (!alive(token,link)) return saved;
        if (saved.ok) {session.conflict=null;acknowledged(link,saved,local);return saved;}
        // One deliberate attempt only; a new competing writer needs a fresh choice.
        session.status='conflict';emit();return saved;
      })();
      try {return await flight;} finally {flight=null;if(session&&!session.conflict&&session.link.pendingSync)schedule();}
    }
    var manager = {
      afterLocal:afterLocal,saveLocal:saveLocal,flush:flush,promote:promote,loadCode:loadCode,resumeLocal:resumeLocal,choose:choose,
      resumeEntry:function (id) {var link=links[id];return link?resumeLinked(link,cached(link)):Promise.resolve({ok:false,error:'NOT_FOUND'});},
      entries:function () {return Object.values(links).filter(function (l) {return l.kind==='cache';}).map(function (l) {
        var state=cached(l);return {id:l.id,name:state&&state.name||'이어하기',level:state&&state.lv||1};
      });},
      view:function () {return {active:!!session,code:session&&session.link.cloudCode,revision:session&&session.link.revision,
        pending:!!(session&&session.link.pendingSync),status:session?(session.relink?'relink':session.blocked?'error':session.status):'local',relink:!!(session&&session.relink),storageWarning:storageWarning,
        conflict:session&&session.conflict?{server:clone(session.conflict.saveData),device:current(session.link),updatedAt:session.conflict.updatedAt,
          localSavedAt:read(key(session.link),{}).savedAt}:null};},
      on:function (fn) {listeners.push(fn);return function () {listeners=listeners.filter(function (f) {return f!==fn;});};},
      stop:stop,
      beginNew:function () {stop();newStudent=true;},
      entered:function () {if(newStudent){newStudent=false;promote().then(function(r){if(!r.ok)emit('create-failed');}).catch(function(){emit('create-failed');});}},
      reconnect:function () {failures=0;schedule(0);},
      snapshot:snapshot, equal:equal
    };
    return manager;
  }
  root.EcoCloudSync = {create:create};
  if (!root.CloudSave || !root.Save || !root.resumeSaveState) return;
  var deviceStorage;
  try{deviceStorage=root.localStorage;}catch(_){deviceStorage={getItem:function(){return null;},setItem:function(){throw new Error('Storage unavailable');}};}
  var sync = create({api:root.CloudSave,storage:deviceStorage,state:function () {return root.S;},
    localLoad:function (code) {return root.Save.load(code);},resume:function (state) {
      if(root.CloudUI)root.CloudUI.beforeResume();
      return root.resumeSaveState(state);
    }});
  root.CloudSync=sync;
  Object.defineProperty(root,'CloudSession',{configurable:true,get:function () {return sync.view();}});
  var save=root.Save.save;
  root.Save.save=function () {
    var mode;
    try{mode=sync.saveLocal(root.S);}catch(_){return 'mem';} // Never fall through to a colliding EC slot.
    if(mode) return mode;
    mode=save.apply(this,arguments);
    if(root.S&&mode!=='none')try{sync.afterLocal(root.S);}catch(_){}
    return mode;
  };
  var start=root.startNew,enter=root.enterWorld;
  root.startNew=function () {sync.beginNew();return start.apply(this,arguments);};
  root.enterWorld=function () {var result=enter.apply(this,arguments);sync.entered();return result;};
  root.quickLoad=function (code) {return sync.resumeLocal(code).then(function (r) {
    if(!r.ok&&root.toast)root.toast(r.message||'저장 기록을 불러오지 못했어요.');
    if(r.offline&&root.toast)root.toast('인터넷에 연결되지 않았어요. 이 기기에 저장된 기록으로 이어할게요.');
    return r.ok;
  }).catch(function(){if(root.toast)root.toast('저장 기록을 불러오지 못했어요. 기존 기록은 그대로예요.');return false;});};
  root.addEventListener('online',sync.reconnect);
  root.addEventListener('pagehide',function () {try{if(root.S&&root.S.code)root.Save.save();}catch(_){} });
})(window);
