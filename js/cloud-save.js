/* Transport only: local backup, session and UI live in cloud-sync / cloud-ui. */
(function (root) {
  'use strict';
  var MAX_SAVE_BYTES = 131072, MAX_RESPONSE_BYTES = 524288;
  var errors = new Set(['INVALID_REQUEST','INVALID_CODE','INVALID_SAVE_DATA','INVALID_SAVE_VERSION','INVALID_REVISION',
    'SAVE_TOO_LARGE','NOT_FOUND','REVISION_CONFLICT','SERVER_UNAVAILABLE','UNAUTHORIZED','ORIGIN_NOT_ALLOWED']);
  function object(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
  function version(value) { return Number.isInteger(value) && value > 0 && value <= 2147483647; }
  function revision(value) { return Number.isSafeInteger(value) && value > 0; }
  function normalizeCode(input) {
    if (typeof input !== 'string' || input.length > 64) return null;
    var raw = input.trim().toUpperCase();
    if (!/^EC(?:-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}|[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8})$/.test(raw)) return null;
    var compact = raw.replace(/-/g, '');
    return compact.slice(0,2) + '-' + compact.slice(2,6) + '-' + compact.slice(6);
  }
  function failure(error, code, extra) {
    // Student text is deliberately simple; detailed data never goes to the log.
    var message = error === 'REVISION_CONFLICT' ? '다른 기기에서 저장했어요. 다시 불러와 주세요.' :
      error === 'NOT_FOUND' ? '저장 기록을 찾지 못했어요.' :
      error === 'INVALID_CODE' ? '코드를 다시 확인해 주세요.' :
      error === 'UNSUPPORTED_SAVE_VERSION' ? '게임을 새로고침한 뒤 다시 불러와 주세요.' :
      error === 'INVALID_SAVE_DATA' ? '저장 데이터를 확인하지 못했어요.' : '서버에 연결하지 못했어요.';
    if (root.console && root.console.warn) root.console.warn('[CloudSave]', {error:error, code:code?code.slice(0,5)+'**-****':undefined});
    return Object.assign({ok:false, error:error, message:message}, extra || {});
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function makeClient(options) {
    options = options || {};
    var fetcher = options.fetch || (root.fetch && root.fetch.bind(root));
    var timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0 ? Math.min(options.timeoutMs,12000) : 10000;
    function configuration() {
      var defaults = root.ecoSupabase && root.ecoSupabase.publicConfig || {};
      var address = options.projectUrl || defaults.projectUrl, key = options.publishableKey || defaults.publishableKey;
      var url = new URL(address);
      if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
        (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname)))) throw new Error('INVALID_CONFIG');
      if (typeof key !== 'string' || !key.startsWith('sb_publishable_')) throw new Error('INVALID_CONFIG');
      return {endpoint:url.origin+'/functions/v1/student-save', key:key};
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
    async function request(action, fields) {
      var config, controller, timer, timedOut = false;
      try { config = configuration(); } catch (_) { return failure('NOT_CONFIGURED', fields.code); }
      if (!fetcher || typeof AbortController === 'undefined') return failure('NETWORK_ERROR', fields.code);
      controller = new AbortController();
      var timeout = new Promise(function (_, reject) { timer = setTimeout(function () {
        timedOut = true; controller.abort(); reject(new Error('TIMEOUT'));
      }, timeoutMs); });
      try {
        return await Promise.race([timeout,(async function () {
          var response = await fetcher(config.endpoint, {method:'POST', credentials:'omit', cache:'no-store', referrerPolicy:'no-referrer',
            headers:{'Content-Type':'application/json', apikey:config.key}, signal:controller.signal,
            body:JSON.stringify(Object.assign({action:action},fields))});
          var data;
          try { data = await readResponse(response); } catch (_) {
            if (timedOut) throw new Error('TIMEOUT');
            return failure('INVALID_RESPONSE',fields.code);
          }
          if (!data.ok) {
            var error = errors.has(data.error) ? data.error : 'SERVER_UNAVAILABLE', extra = {};
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
      async load(input) {
        var code = normalizeCode(input); if (!code) return failure('INVALID_CODE');
        var result = await request('load',{code:code}); if (!result.ok) return result;
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
      async save(input, saveData, expectedRevision) {
        var code = normalizeCode(input); if (!code) return failure('INVALID_CODE');
        if (!revision(expectedRevision) || expectedRevision >= Number.MAX_SAFE_INTEGER) return failure('INVALID_REVISION',code);
        var data;
        try { data = prepare(saveData); } catch (e) { return failure(e.message==='SAVE_TOO_LARGE'?'SAVE_TOO_LARGE':'INVALID_SAVE_DATA',code); }
        return request('save',{code:code,saveData:data,saveVersion:data.saveVersion,expectedRevision:expectedRevision});
      },
      normalizeCode:normalizeCode,
      snapshot:prepare
    });
  }
  root.CloudSave = Object.freeze(Object.assign({},makeClient(),{createClient:makeClient}));
})(window);
