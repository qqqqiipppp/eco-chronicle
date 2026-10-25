/* Transport only: local backup, session and UI live in cloud-sync / cloud-ui. */
(function (root) {
  'use strict';
  var MAX_SAVE_BYTES = 131072, MAX_RESPONSE_BYTES = 524288;
  var errors = new Set(['INVALID_REQUEST','INVALID_CODE','INVALID_SAVE_DATA','INVALID_SAVE_VERSION','INVALID_REVISION',
    'SAVE_TOO_LARGE','NOT_FOUND','REVISION_CONFLICT','SERVER_UNAVAILABLE','UNAUTHORIZED','ORIGIN_NOT_ALLOWED','RATE_LIMITED']);
  function object(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
  function version(value) { return Number.isInteger(value) && value > 0 && value <= 2147483647; }
  function revision(value) { return Number.isSafeInteger(value) && value > 0; }
  function normalizeCode(input) {
    if (typeof input !== 'string' || input.length > 64) return null;
    var raw = input.trim().toUpperCase();
    return /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(raw) && /[A-Z]/.test(raw) && /[2-9]/.test(raw) ? raw : null;
  }
  function failure(error, code, extra) {
    // Student text is deliberately simple; detailed data never goes to the log.
    var message = error === 'REVISION_CONFLICT' ? '다른 기기에서 저장했어요. 다시 불러와 주세요.' :
      error === 'NOT_FOUND' ? '코드를 확인해 주세요. 분실했다면 선생님께 문의하세요.' :
      error === 'RATE_LIMITED' ? '코드를 여러 번 확인했어요. 잠시 기다렸다가 다시 해 주세요. 이 기기 기록은 그대로예요.' :
      error === 'INVALID_CODE' ? '코드를 다시 확인해 주세요.' :
      error === 'UNSUPPORTED_SAVE_VERSION' ? '게임을 새로고침한 뒤 다시 불러와 주세요.' :
      error === 'INVALID_SAVE_DATA' ? '저장 데이터를 확인하지 못했어요.' : '서버에 연결하지 못했어요.';
    if (root.console && root.console.warn) root.console.warn('[CloudSave]', {error:error});
    return Object.assign({ok:false, error:error, message:message}, extra || {});
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function makeClient(options) {
    options = options || {};
    var fetcher = options.fetch || (root.fetch && root.fetch.bind(root));
    var timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0 ? Math.min(options.timeoutMs,12000) : 10000;
    var deviceId, retryAt=0, proofs=new Map();
    function device() {
      if(deviceId)return deviceId;
      try {deviceId=root.localStorage.getItem('eco:cloud:device');} catch(_) {}
      if(!/^[0-9a-f-]{36}$/i.test(deviceId||'')) {
        if(!root.crypto)return 'unavailable';
        var bytes=root.crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
        deviceId=Array.from(bytes,function(n,i){return ([4,6,8,10].includes(i)?'-':'')+n.toString(16).padStart(2,'0');}).join('');
        try {root.localStorage.setItem('eco:cloud:device',deviceId);} catch(_) {}
      }
      return deviceId;
    }
    function configuration() {
      var defaults = root.ecoSupabase && root.ecoSupabase.publicConfig || {};
      var address = options.projectUrl || defaults.projectUrl, key = options.publishableKey || defaults.publishableKey;
      var url = new URL(address);
      if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
        (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname)))) throw new Error('INVALID_CONFIG');
      if (typeof key !== 'string' || !key.startsWith('sb_publishable_')) throw new Error('INVALID_CONFIG');
      var functionName=options.functionName||defaults.studentSaveFunction||'student-save-v2';
      if(!/^[a-z0-9-]+$/.test(functionName))throw new Error('INVALID_CONFIG');
      return {endpoint:url.origin+'/functions/v1/'+functionName, key:key};
    }
    function prepare(data) {
      if (!object(data) || typeof root.migrate !== 'function' || typeof root.newState !== 'function') throw new Error('INVALID_SAVE_DATA');
      var state = root.migrate(clone(data)), allowed = Object.keys(root.newState()).concat(['learning','arcadeRecords']);
      var result = {};
      allowed.forEach(function (key) {
        if (key !== 'scene' && key !== 'modal' && Object.prototype.hasOwnProperty.call(state,key)) result[key] = state[key];
      });
      if (new TextEncoder().encode(JSON.stringify(result)).length > MAX_SAVE_BYTES) throw new Error('SAVE_TOO_LARGE');
      return result;
    }
    async function readResponse(response) {
      var declared = Number(response.headers && response.headers.get('content-length'));
      if (declared > MAX_RESPONSE_BYTES) throw new Error('INVALID_RESPONSE');
      var text;
      if (response.body && response.body.getReader) {
        var reader = response.body.getReader(), chunks = [], size = 0;
        try {
          while (true) {
            var item = await reader.read(); if (item.done) break;
            size += item.value.byteLength;
            if (size > MAX_RESPONSE_BYTES) { await reader.cancel(); throw new Error('INVALID_RESPONSE'); }
            chunks.push(item.value);
          }
          var bytes = new Uint8Array(size), offset = 0;
          chunks.forEach(function (chunk) { bytes.set(chunk,offset); offset += chunk.length; });
          text = new TextDecoder('utf-8',{fatal:true}).decode(bytes);
        } finally { reader.releaseLock(); }
      } else text = await response.text();
      if (new TextEncoder().encode(text).length > MAX_RESPONSE_BYTES) throw new Error('INVALID_RESPONSE');
      var data = JSON.parse(text);
      if (!object(data) || typeof data.ok !== 'boolean') throw new Error('INVALID_RESPONSE');
      return data;
    }
    async function request(action, fields, resumeToken) {
      if(Date.now()<retryAt)return failure('RATE_LIMITED',null,{retryAfter:Math.ceil((retryAt-Date.now())/1000)});
      var config, controller, timer, timedOut = false;
      try { config = configuration(); } catch (_) { return failure('NOT_CONFIGURED', fields.code); }
      if (!fetcher || typeof AbortController === 'undefined') return failure('NETWORK_ERROR', fields.code);
      controller = new AbortController();
      var timeout = new Promise(function (_, reject) { timer = setTimeout(function () {
        timedOut = true; controller.abort(); reject(new Error('TIMEOUT'));
      }, timeoutMs); });
      try {
        return await Promise.race([timeout,(async function () {
          var headers={'Content-Type':'application/json', apikey:config.key,'x-eco-device':device()};
          var proof=resumeToken||proofs.get(fields.code);
          if(typeof proof==='string'&&proof.length<256)headers['x-eco-resume']=proof;
          var response = await fetcher(config.endpoint, {method:'POST', credentials:'omit', cache:'no-store', referrerPolicy:'no-referrer',
            headers:headers, signal:controller.signal,
            body:JSON.stringify(Object.assign({action:action},fields))});
          var data;
          try { data = await readResponse(response); } catch (_) {
            if (timedOut) throw new Error('TIMEOUT');
            return failure('INVALID_RESPONSE',fields.code);
          }
          if (!data.ok) {
            var error = errors.has(data.error) ? data.error : 'SERVER_UNAVAILABLE', extra = {};
            if(error==='RATE_LIMITED'){extra.retryAfter=Math.max(1,Math.min(86400,Number(response.headers.get('Retry-After'))||Number(data.retryAfter)||60));retryAt=Date.now()+extra.retryAfter*1000;}
            if (error === 'REVISION_CONFLICT') {
              if (response.status !== 409 || !revision(data.serverRevision)) return failure('INVALID_RESPONSE',fields.code);
              extra.serverRevision = data.serverRevision;
            }
            return failure(error,fields.code,extra);
          }
          if (!response.ok || !normalizeCode(data.code) || normalizeCode(data.code)!==data.code ||
            (fields.code && data.code!==fields.code) || !revision(data.revision) || !version(data.saveVersion) ||
            typeof data.updatedAt!=='string' || !Number.isFinite(Date.parse(data.updatedAt))) return failure('INVALID_RESPONSE',fields.code);
          if (action !== 'load' && !(action === 'create' && fields.createRequestId) && data.saveVersion !== fields.saveVersion) return failure('INVALID_RESPONSE',fields.code);
          if (action === 'save' && data.revision !== fields.expectedRevision+1) return failure('INVALID_RESPONSE',fields.code);
          if (action === 'create' && !fields.createRequestId && data.revision !== 1) return failure('INVALID_RESPONSE',fields.code);
          if(data.resumeToken!=null&&(typeof data.resumeToken!=='string'||!/^v1\.\d{10}\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(data.resumeToken)))return failure('INVALID_RESPONSE',fields.code);
          if(data.resumeToken)proofs.set(data.code,data.resumeToken);
          return data;
        })()]);
      } catch (_) { return failure(timedOut?'TIMEOUT':'NETWORK_ERROR',fields.code); }
      finally { clearTimeout(timer); }
    }
    return Object.freeze({
      async create(saveData, createRequestId) {
        var data;
        if (createRequestId != null && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(createRequestId)) return failure('INVALID_REQUEST');
        try { data = prepare(saveData); } catch (e) { return failure(e.message==='SAVE_TOO_LARGE'?'SAVE_TOO_LARGE':'INVALID_SAVE_DATA'); }
        var fields = {saveData:data,saveVersion:data.saveVersion};
        if (createRequestId) fields.createRequestId = createRequestId;
        return request('create',fields);
      },
      async load(input, resumeToken) {
        var code = normalizeCode(input); if (!code) return failure('INVALID_CODE');
        var result = await request('load',{code:code},resumeToken); if (!result.ok) return result;
        if (!object(result.saveData) || (result.saveData.saveVersion != null && result.saveData.saveVersion!==result.saveVersion) ||
          (result.saveData.v != null && result.saveData.v!==result.saveVersion)) return failure('INVALID_RESPONSE',code);
        var current = root.CURRENT_SAVE_VERSION || root.SAVE_VERSION;
        if (!current || result.saveVersion > current) return failure('UNSUPPORTED_SAVE_VERSION',code);
        try {
          // Pure migration only: no active game state or local-save writes.
          var source = clone(result.saveData); source.saveVersion = result.saveVersion; source.v = result.saveVersion;
          var state = root.migrate(source);
          return Object.assign({},result,{saveData:state,storedSaveVersion:result.saveVersion,saveVersion:state.saveVersion});
        } catch (_) { return failure('INVALID_SAVE_DATA',code); }
      },
      async save(input, saveData, expectedRevision, resumeToken) {
        var code = normalizeCode(input); if (!code) return failure('INVALID_CODE');
        if (!revision(expectedRevision) || expectedRevision >= Number.MAX_SAFE_INTEGER) return failure('INVALID_REVISION',code);
        var data;
        try { data = prepare(saveData); } catch (e) { return failure(e.message==='SAVE_TOO_LARGE'?'SAVE_TOO_LARGE':'INVALID_SAVE_DATA',code); }
        return request('save',{code:code,saveData:data,saveVersion:data.saveVersion,expectedRevision:expectedRevision},resumeToken);
      },
      normalizeCode:normalizeCode,
      snapshot:prepare
    });
  }
  root.CloudSave = Object.freeze(Object.assign({},makeClient(),{createClient:makeClient}));
})(window);
