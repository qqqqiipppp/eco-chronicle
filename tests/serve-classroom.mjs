// Local-only browser QA. This fixture has no live mode or external Supabase endpoint.
// Run: node tests/serve-classroom.mjs
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { root, database } from './helpers/cloud-save-runtime.mjs';
import { createHandler } from '../supabase/functions/student-save/handler.mjs';

const ports = [54451, 54452];
const publicKey = 'sb_publishable_classroom_test';
const local = await database(true);
const studentSave = createHandler({ rpc: local.rpc, publicKeys: [publicKey],
  allowedOrigins: ports.map(port => 'http://127.0.0.1:' + port), logger: { error() {} } });
const themes = new Set(['forest', 'river', 'ocean', 'city', 'air', 'climate']);
const channels = new Map();
const synthetic = new Map();
const metrics = { joins: 0, leaves: 0, tracks: 0, broadcasts: 0, broadcastEvents: {},
  privacyViolations: 0, cloudRequests: 0, presencePolls: 0 };
const publicFields = new Set(('playerId nickname theme joinedAt hair face outfit skin haircol direction ' +
  'spirit level equipment progress towerBestFloor towerBestTime').split(' '));
let version = 0;

function snapshot() {
  return { version, channels: [...channels.values()].filter(channel => channel.self).map(channel =>
    ({ name: channel.name, key: channel.key, self: channel.self })),
  synthetic: [...synthetic.entries()].map(([theme, players]) => ({ theme, players })),
  metrics: { ...metrics, activeChannels: channels.size,
    syntheticStudents: [...synthetic.values()].reduce((total, players) => total + players.length, 0) } };
}

async function bodyJson(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32768) throw new Error('Fixture request too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json;charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

async function realtime(req, res, url) {
  if (req.method === 'GET') {
    metrics.presencePolls++;
    const session = url.searchParams.get('session');
    for (const channel of channels.values()) if (channel.session === session) channel.seenAt = Date.now();
    json(res, 200, snapshot()); return;
  }
  if (req.method !== 'POST') { json(res, 405, { error: 'METHOD_NOT_ALLOWED' }); return; }
  const input = await bodyJson(req);
  if (input.action === 'synthetic') {
    if (!themes.has(input.theme)) { json(res, 400, { error: 'INVALID_THEME' }); return; }
    const count = Math.max(0, Math.min(28, Number.isInteger(input.count) ? input.count : 0));
    synthetic.set(input.theme, Array.from({ length: count }, (_, index) => ({
      playerId: 'classroom-synthetic-' + (index + 1), nickname: '모의 학생 ' + String(index + 1).padStart(2, '0'),
      theme: input.theme, joinedAt: 'local-browser-fixture', hair: 'messy', face: 'bright', outfit: 'cloak',
      skin: 'light', haircol: 'brown', direction: 'south', spirit: '조약돌 정령',
      level: 2 + index, equipment: '없음', progress: input.theme === 'forest' ? '푸른 숲 1단계' : input.theme,
      towerBestFloor: index + 1, towerBestTime: 60 + index * 5
    })));
    version++; json(res, 200, snapshot()); return;
  }
  if (typeof input.id !== 'string' || input.id.length > 128) { json(res, 400, { error: 'INVALID_CHANNEL' }); return; }
  if (input.action === 'join') {
    if (!/^eco-(forest|river|ocean|city|air|climate)$/.test(input.name) ||
        typeof input.key !== 'string' || typeof input.session !== 'string') {
      json(res, 400, { error: 'INVALID_CHANNEL' }); return;
    }
    if (!channels.has(input.id)) {
      channels.set(input.id, { name: input.name, key: input.key.slice(0, 64), session: input.session.slice(0, 80),
        self: null, seenAt: Date.now() }); metrics.joins++; version++;
    }
  } else if (input.action === 'leave') {
    if (channels.delete(input.id)) { metrics.leaves++; version++; }
  } else if (input.action === 'track') {
    const channel = channels.get(input.id), payload = input.payload;
    if (!channel || !payload || typeof payload !== 'object' || Array.isArray(payload)) {
      json(res, 400, { error: 'INVALID_TRACK' }); return;
    }
    if (Object.keys(payload).some(key => !publicFields.has(key))) {
      metrics.privacyViolations++; json(res, 400, { error: 'NON_PUBLIC_PRESENCE_FIELD' }); return;
    }
    channel.self = payload; channel.seenAt = Date.now(); metrics.tracks++; version++;
  } else if (input.action === 'untrack') {
    const channel = channels.get(input.id);
    if (channel) { channel.self = null; channel.seenAt = Date.now(); version++; }
  } else if (input.action === 'broadcast') {
    metrics.broadcasts++;
    const event = typeof input.event === 'string' ? input.event.slice(0, 64) : 'unknown';
    metrics.broadcastEvents[event] = (metrics.broadcastEvents[event] || 0) + 1;
  } else { json(res, 400, { error: 'UNKNOWN_ACTION' }); return; }
  json(res, 200, snapshot());
}

const types = { '.html': 'text/html;charset=utf-8', '.js': 'application/javascript;charset=utf-8',
  '.css': 'text/css;charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.woff2': 'font/woff2' };
const servers = [];
for (const port of ports) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1:' + port);
      if (url.pathname === '/functions/v1/student-save') {
        metrics.cloudRequests++;
        const request = new Request(url, { method: req.method, headers: req.headers,
          ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Readable.toWeb(req), duplex: 'half' }) });
        const response = await studentSave(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer())); return;
      }
      if (url.pathname === '/__classroom/presence') { await realtime(req, res, url); return; }
      if (url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
      if (url.pathname === '/tablet.html') {
        const identity = url.searchParams.get('fixture') === 'B' || port === ports[1] ? 'B' : 'A';
        res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' });
        res.end('<!doctype html><html lang="ko"><meta charset="utf-8"><title>Classroom QA tablet ' + identity + '</title>' +
          '<body style="margin:0;background:#10251c"><iframe id="tablet-game" title="1024×640 실제 게임" ' +
          'width="1024" height="640" style="border:0;display:block" src="/index.html?fixture=' + identity + '"></iframe></body></html>'); return;
      }
      const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
      const full = path.resolve(root, '.' + rel);
      if (!full.startsWith(root + path.sep) || rel.split('/').some(part => part.startsWith('.'))) {
        res.writeHead(403); res.end(); return;
      }
      let data = await fs.readFile(full);
      if (full === path.join(root, 'index.html')) {
        const markup = data.toString('utf8')
          .replace(/<script\b[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js[^>]*><\/script>/g, '')
          .replace(/<script\b[^>]*src="\.\/js\/supabase\.js[^>]*><\/script>/g, '')
          .replace('<head>', '<head><script src="/tests/classroom-browser.js"></script>');
        data = Buffer.from(markup);
      }
      res.writeHead(200, { 'Content-Type': types[path.extname(full)] || 'application/octet-stream', 'Cache-Control': 'no-store',
        'Content-Security-Policy': "connect-src 'self'" });
      res.end(data);
    } catch (_) { if (!res.headersSent) res.writeHead(503); res.end('Local classroom fixture unavailable'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  servers.push(server);
}

// A crashed/closed QA tab cannot leave a synthetic record forever.
const cleanup = setInterval(() => {
  let changed = false;
  for (const [id, channel] of channels) if (Date.now() - channel.seenAt > 120000) {
    channels.delete(id); metrics.leaves++; changed = true;
  }
  if (changed) version++;
}, 10000);
console.log('Classroom browser QA: http://127.0.0.1:54451 / http://127.0.0.1:54452');
console.log('Local mocks only: shared in-memory PostgreSQL + HTTP Presence hub. Tablet: /tablet.html');
async function close() {
  clearInterval(cleanup);
  for (const server of servers) server.close();
  await local.db.close(); process.exit();
}
process.on('SIGINT', close); process.on('SIGTERM', close);
