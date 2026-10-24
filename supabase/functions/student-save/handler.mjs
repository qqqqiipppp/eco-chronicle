// Web-standard handler: the very same code runs in Deno and in integration tests.
export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const MAX_SAVE_BYTES = 131072;
export const MAX_REQUEST_BYTES = 262144;
export const STUDENT_FIELDS = new Set(('v saveVersion name code petKey themeId grade hair face outfit skin haircol petStage day water wellDay canLv seeds produce npcDone ecoTechUnlocked ecoTechQuests ecoTechSites ecoTechFindings duelWon shadowWon farm tower lv exp gold gauge hpCur spCur lessonDone quizDone advDone quizIdx quizPicked quizHint quizCorrect quizScored quizWrong retryQueue advIdx advPicked advScored quizContentVersion monIdx battleDone interludePending encounterWon defeatStreak gboard clues boxOpen gatherDone dexBonus crafted potions tickets mats gear owned dex cleared progress learning arcadeRecords').split(' '));
const encoder = new TextEncoder();
export function normalizeCode(input) {
  if (typeof input !== 'string' || input.length > 64) return null;
  const raw = input.trim().toUpperCase();
  if (!/^EC(?:-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}|[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8})$/.test(raw)) return null;
  const compact = raw.replaceAll('-', '');
  return compact.slice(0, 2) + '-' + compact.slice(2, 6) + '-' + compact.slice(6);
}
export function generateCode(random = crypto) {
  let suffix = '';
  // 31 symbols; reject excess byte values rather than introduce modulo bias.
  while (suffix.length < 8) {
    const bytes = random.getRandomValues(new Uint8Array(16));
    for (const byte of bytes) {
      if (byte < Math.floor(256 / ALPHABET.length) * ALPHABET.length) suffix += ALPHABET[byte % ALPHABET.length];
      if (suffix.length === 8) break;
    }
  }
  return 'EC-' + suffix.slice(0, 4) + '-' + suffix.slice(4);
}
export function isObject(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
export function validVersion(value) { return Number.isInteger(value) && value > 0 && value <= 2147483647; }
function mask(code) { return code ? code.slice(0, 5) + '**-****' : undefined; }
export function validateData(data, version) {
  if (!isObject(data) || !Object.keys(data).every(key => STUDENT_FIELDS.has(key))) return 'INVALID_SAVE_DATA';
  if (!validVersion(version)) return 'INVALID_SAVE_VERSION';
  if ((data.saveVersion != null && data.saveVersion !== version) || (data.v != null && data.v !== version)) return 'INVALID_SAVE_VERSION';
  if (encoder.encode(JSON.stringify(data)).length > MAX_SAVE_BYTES) return 'SAVE_TOO_LARGE';
  return null;
}
async function readJson(request) {
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_REQUEST_BYTES)) throw new Error('SAVE_TOO_LARGE');
  if (!request.body) throw new Error('INVALID_REQUEST');
  const reader = request.body.getReader(), chunks = []; let total = 0;
  try {
    while (true) {
      const {done, value} = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) { await reader.cancel(); throw new Error('SAVE_TOO_LARGE'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
  } finally { reader.releaseLock(); }
}
export function createHandler({rpc, publicKeys, allowedOrigins, random = crypto, logger = console}) {
  const keys = new Set((publicKeys || []).filter(Boolean));
  const origins = new Set(allowedOrigins || []);
  return async function handler(request) {
    const origin = request.headers.get('origin');
    const cors = { 'Vary': 'Origin', 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'apikey, content-type, x-client-info', 'Access-Control-Max-Age': '600' };
    if (origin && origins.has(origin)) cors['Access-Control-Allow-Origin'] = origin;
    const reply = (data, status = 200) => new Response(JSON.stringify(data), {status, headers: cors});
    if (origin && !origins.has(origin)) return reply({ok:false, error:'ORIGIN_NOT_ALLOWED'}, 403);
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:cors});
    if (request.method !== 'POST') return reply({ok:false, error:'METHOD_NOT_ALLOWED'}, 405);
    if (!keys.size || !rpc || !origins.size) return reply({ok:false, error:'SERVER_UNAVAILABLE'}, 503);
    if (!keys.has(request.headers.get('apikey'))) return reply({ok:false, error:'UNAUTHORIZED'}, 401);
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return reply({ok:false, error:'INVALID_REQUEST'}, 400);
    let operation, code;
    try {
      let body;
      try { body = await readJson(request); } catch (e) { return reply({ok:false, error:e.message==='SAVE_TOO_LARGE'?'SAVE_TOO_LARGE':'INVALID_REQUEST'}, 400); }
      if (!isObject(body) || !['create', 'load', 'save'].includes(body.action)) return reply({ok:false, error:'INVALID_REQUEST'}, 400);
      operation = body.action;
      if (operation === 'create' && body.createRequestId != null &&
        (typeof body.createRequestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.createRequestId))) return reply({ok:false,error:'INVALID_REQUEST'},400);
      if (operation !== 'create') {
        code = normalizeCode(body.code);
        if (!code) return reply({ok:false, error:'INVALID_CODE'}, 400);
      }
      if (operation !== 'load') {
        const invalid = validateData(body.saveData, body.saveVersion);
        if (invalid) return reply({ok:false, error:invalid}, 400);
      }
      if (operation === 'save' && (!Number.isSafeInteger(body.expectedRevision) || body.expectedRevision < 1 || body.expectedRevision >= Number.MAX_SAFE_INTEGER)) return reply({ok:false, error:'INVALID_REVISION'}, 400);
      let result;
      if (operation === 'create') {
        for (let attempt = 0; attempt < 8; attempt++) {
          code = generateCode(random);
          const args = {p_code:code, p_save_data:body.saveData, p_save_version:body.saveVersion};
          if (body.createRequestId) args.p_create_request_id = body.createRequestId;
          result = await rpc(body.createRequestId ? 'student_save_create_once' : 'student_save_create', args);
          if (result.error !== 'CODE_EXISTS') break;
        }
        if (result.error === 'CODE_EXISTS') return reply({ok:false, error:'SERVER_UNAVAILABLE'}, 503);
      } else if (operation === 'load') {
        result = await rpc('student_save_load', {p_code:code});
      } else {
        result = await rpc('student_save_update', {p_code:code, p_save_data:body.saveData, p_save_version:body.saveVersion, p_expected_revision:body.expectedRevision});
      }
      if (!isObject(result) || typeof result.ok !== 'boolean') throw new Error('INVALID_BACKEND_RESPONSE');
      if (!result.ok) {
        if (result.error === 'REVISION_CONFLICT' && Number.isSafeInteger(result.serverRevision)) return reply({ok:false, error:'REVISION_CONFLICT', serverRevision:result.serverRevision}, 409);
        if (result.error === 'NOT_FOUND') return reply({ok:false, error:'NOT_FOUND'}, 404);
        if (result.error === 'INVALID_REVISION') return reply({ok:false, error:'INVALID_REVISION'}, 400);
        throw new Error('BACKEND_ERROR');
      }
      // No code, nickname, save body, SQL errors or request URLs are dumped to logs.
      return reply(result);
    } catch (_) {
      logger.error('[CloudSave]', {operation, code:mask(code), error:'SERVER_UNAVAILABLE'});
      return reply({ok:false, error:'SERVER_UNAVAILABLE'}, 503);
    }
  };
}
export function createRpc({url, key, fetcher = fetch, timeoutMs = 8000}) {
  return async (name, args) => {
    const controller = new AbortController(); let timer;
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('TIMEOUT')); }, timeoutMs); });
    try {
      const headers = {apikey:key, 'Content-Type':'application/json'};
      if (!key.startsWith('sb_secret_')) headers.Authorization = 'Bearer ' + key;
      return await Promise.race([timeout, (async () => {
        const response = await fetcher(url + '/rest/v1/rpc/' + name, {method:'POST', headers, body:JSON.stringify(args), signal:controller.signal});
        if (!response.ok) throw new Error('BACKEND_ERROR');
        return await response.json();
      })()]);
    } finally { clearTimeout(timer); }
  };
}
