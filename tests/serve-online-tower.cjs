// Disposable localhost QA: real product Presence/Broadcast and existing towerRetire/Save.
// Response-only controls are never included in the shipped index.html.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function controls() {
  document.addEventListener('DOMContentLoaded', () => {
    const box = document.createElement('aside');
    box.id = 'tower-online-qa';
    box.style = 'position:fixed;bottom:8px;left:8px;z-index:5000;background:#fff;color:#111;padding:6px;font:11px sans-serif;max-width:620px';
    const output = document.createElement('pre');
    output.id = 'tower-online-result';
    output.style = 'white-space:pre-wrap;max-height:110px;overflow:auto;margin:4px 0 0';
    const errors = window.towerQaErrors || [], payloads = [], tracked = new WeakSet();
    let tracks = 0, movementUntil = 0;
    window.addEventListener('unhandledrejection', event => errors.push(String(event.reason?.message || event.reason)));
    function button(label, action) {
      const b = document.createElement('button'); b.textContent = label;
      b.onclick = action; box.appendChild(b);
    }
    function record(floor, seconds) {
      if (S.modal) closeModal();
      Tw.floor = floor; Tw.t0 = Date.now() - seconds * 1000;
      towerRetire('QA 기록 갱신'); // Production comparison, storage and result rendering.
      closeModal();
    }
    button('QA record 18 462', () => record(18, 462));
    button('QA record 7 198', () => record(7, 198));
    button('QA record 18 450', () => record(18, 450));
    button('QA worse record', () => record(2, 30));
    button('QA legacy time', () => { delete S.tower.bestTime; autosave(); });
    button('QA forest', () => { if (S.modal) closeModal(); enterTheme('forest'); });
    button('QA river', () => {
      if (S.modal) closeModal();
      if (!S.cleared.includes('forest')) S.cleared.push('forest'); // Fixture unlock for the real transition.
      enterTheme('river');
    });
    button('QA move east', () => { if (S.modal) closeModal(); movementUntil = performance.now() + 1800; });
    button('QA save load', () => {
      const before = JSON.stringify(S.tower), saved = Save.save(), loaded = Save.load(S.code);
      output.dataset.save = saved === 'disk' && loaded && JSON.stringify(loaded.tower) === before ? 'PASS' : 'FAIL';
    });
    button('QA hide tools', () => { box.hidden = true; });
    box.appendChild(output); document.body.appendChild(box);
    setInterval(() => {
      const moving = performance.now() < movementUntil;
      if (moving) { Wd.keys.r = true; if (document.hidden && S.scene === 'world' && !S.modal) tick(16); }
      else if (Wd.keys.r) Wd.keys.r = false;
      const client = window.ecoSupabase?.client;
      for (const channel of client?.getChannels() || []) {
        if (tracked.has(channel)) continue;
        tracked.add(channel);
        const track = channel.track.bind(channel), send = channel.send.bind(channel);
        channel.track = value => { tracks++; return track(value); };
        channel.send = message => {
          if (message.event === 'world-position') {
            payloads.push(Object.keys(message.payload).sort());
            if (payloads.length > 2) payloads.shift();
          }
          return send(message);
        };
      }
      output.textContent = JSON.stringify({ tower: S.tower, summary: ecoOnlinePlayers.summary(S),
        stats: ecoMultiplayer.getStats(), movement: ecoMovement.getStats(),
        local: { x: Wd.px, y: Wd.py, direction: Wd.face },
        remotes: Object.values(ecoRemotePlayers.remotePlayers).map(p => ({ name: p.nickname,
          x: p.position?.x, y: p.position?.y, seq: p.lastSeq })),
        tracks, movementPayloadKeys: payloads, save: output.dataset.save || '', errors });
    }, 100);
  });
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    if (url.pathname === '/tablet.html') {
      const peer = url.searchParams.get('fixture') === 'B' ? 'B' : 'A';
      res.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': 'text/html;charset=utf-8' });
      res.end('<!doctype html><html lang="ko"><meta charset="utf-8"><title>1024×640 태블릿 QA</title>' +
        '<body style="margin:0;background:#071713"><script>window.addEventListener("error",function(e){' +
        'document.documentElement.dataset.qaError=JSON.stringify({message:e.message,file:e.filename,stack:e.error&&e.error.stack});});</script>' +
        '<iframe id="tablet-game" title="태블릿 게임 화면" ' +
        'width="1024" height="640" style="border:0" src="/?fixture=' + peer + '"></iframe></body></html>');
      return;
    }
    const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const full = path.resolve(root, '.' + rel);
    if (!full.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    let data = await fs.readFile(full);
    if (rel === '/index.html') {
      const peer = url.searchParams.get('fixture') === 'B' ? 'B' : 'A';
      const fixture = { name: '기록테스트' + peer, code: 'EC98' + (peer === 'A' ? '01' : '02'),
        lv: peer === 'A' ? 8 : 7, scene: 'world', themeId: 'forest',
        petKey: peer === 'A' ? 'earth' : 'water' };
      const seed = 'window.towerQaErrors=[];window.addEventListener("error",function(e){towerQaErrors.push({message:e.message,file:e.filename,stack:e.error&&e.error.stack});});' +
        'S=Save.load(' + JSON.stringify(fixture.code) + ')||Object.assign(newState(),' + JSON.stringify(fixture) +
        ');S.scene="world";S.modal=null;applyTheme("forest");Wd.px=SPAWN.x;Wd.py=SPAWN.y;render();';
      data = Buffer.from(data.toString().replace('<script defer src="https://cdn',
        '<script>' + seed + '</script><script defer src="https://cdn')
        .replace('</body>', '<script>(' + controls.toString() + ')();</script></body>'));
    }
    res.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': {
      '.html': 'text/html;charset=utf-8', '.js': 'application/javascript;charset=utf-8', '.css': 'text/css',
      '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml'
    }[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  } catch (error) { console.error(req.url, error.message); res.writeHead(404); res.end(); }
}).listen(Number(process.argv[2]) || 0, '127.0.0.1', function () { console.log('Tower online QA: http://127.0.0.1:' + this.address().port); });
