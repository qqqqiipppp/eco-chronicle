// Optional local browser fixture: node tests/serve-movement.cjs
// Only response HTML is augmented; product files and real saved games are untouched.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fixtures = {
  A: { name: '플레이어A', code: 'EC9001', hair: 'messy', face: 'bright', outfit: 'cloak', skin: 'light', haircol: 'brown' },
  B: { name: '플레이어B', code: 'EC9002', hair: 'long', face: 'bold', outfit: 'robe', skin: 'deep', haircol: 'red' },
  C: { name: '플레이어C', code: 'EC9003', hair: 'pony', face: 'calm', outfit: 'soccer', skin: 'tan', haircol: 'blonde' }
};
function controls() {
  document.addEventListener('DOMContentLoaded', () => {
    let held = null, until = 0;
    const samples = [], frames = [];
    let lastFrame = performance.now();
    function measure(t) { frames.push(t - lastFrame); lastFrame = t; if (frames.length > 600) frames.shift(); requestAnimationFrame(measure); }
    requestAnimationFrame(measure);
    // Exercise the original world movement even if a background tab's RAF is suspended.
    setInterval(() => {
      if (held && performance.now() < until) {
        Wd.keys[held] = true;
        if (document.hidden && S.scene === 'world' && !S.modal) tick(16);
      } else if (held) { Wd.keys[held] = false; held = null; }
    }, 16);
    const box = document.createElement('div');
    box.style = 'position:fixed;bottom:10px;right:10px;z-index:5000;background:white;color:black;font:11px monospace;padding:6px;max-width:600px';
    function button(label, action) { const b = document.createElement('button'); b.textContent = label; b.onclick = action; box.append(b); }
    ['east', 'north', 'west', 'south'].forEach(dir => button('test ' + dir, () => {
      Wd.keys = { u: false, d: false, l: false, r: false };
      held = { east: 'r', west: 'l', north: 'u', south: 'd' }[dir]; until = performance.now() + 1500;
    }));
    button('test simultaneous', () => setTimeout(() => { held = 'r'; until = performance.now() + 2000; }, 6000));
    button('test disconnect', () => window.ecoSupabase.client.realtime.disconnect());
    button('test level', () => admSet('lv', S.lv + 1));
    button('test equip', () => { if (!S.owned.includes('w2')) S.owned.push('w2'); equip('weapon', 'w2'); });
    button('test spirit', () => { S.petKey = 'water'; paintHud(); autosave(); });
    button('test progress', () => admSet('monIdx', Math.min(S.monIdx + 1, CUR.monsters.length - 1)));
    const output = document.createElement('pre'); output.id = 'movement-test-result';
    output.style = 'white-space:pre-wrap;overflow-wrap:anywhere;max-height:120px;overflow:auto';
    box.append(output); document.body.append(box);
    setInterval(() => {
      const remotes = Object.values(ecoRemotePlayers.remotePlayers).map(p => ({
        name: p.nickname, x: p.position?.x, y: p.position?.y, targetX: p.targetX, targetY: p.targetY,
        direction: p.appearance.direction, moving: p.networkMoving, seq: p.lastSeq, walking: p.element?.classList.contains('walk')
      }));
      if (Wd.moving && remotes.filter(p => p.moving).length === 2) {
        samples.push({ t: Date.now(), x: Wd.px, y: Wd.py, remotes: remotes.map(p => p.name) });
        if (samples.length > 5) samples.shift();
      }
      const sorted = [...frames].sort((a, b) => a - b);
      output.textContent = JSON.stringify({
        local: { name: S.name, x: Wd.px, y: Wd.py, direction: Wd.face, moving: Wd.moving, modal: S.modal },
        samples, stats: ecoMovement.getStats(), remotes,
        frameP95: sorted[Math.floor(sorted.length * .95)]
      });
    }, 100);
  });
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    if (rel === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    const full = path.resolve(root, '.' + rel);
    if (!full.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    let data = await fs.readFile(full);
    if (rel === '/index.html') {
      let html = data.toString();
      const fixture = fixtures[url.searchParams.get('fixture')];
      if (fixture) {
        const dx = fixture === fixtures.B ? 112 : 0, dy = fixture === fixtures.C ? -112 : 0;
        const state = { petKey: fixture === fixtures.B ? 'water' : fixture === fixtures.C ? 'fire' : 'earth',
          lv: fixture === fixtures.B ? 6 : fixture === fixtures.C ? 4 : 5,
          exp: fixture === fixtures.B ? 400 : fixture === fixtures.C ? 200 : 280,
          gear: { weapon: fixture === fixtures.B ? 'w1' : null, armor: fixture === fixtures.C ? 'a2' : null, helm: null, shoes: null },
          monIdx: fixture === fixtures.B ? 1 : fixture === fixtures.C ? 2 : 0, scene: 'world' };
        html = html.replace('<script defer src="https://cdn', '<script>S=Object.assign(newState(),' + JSON.stringify(fixture) +
          ',' + JSON.stringify(state) + ');applyTheme("forest");Wd.px=SPAWN.x+' + dx +
          ';Wd.py=SPAWN.y+' + dy + ';render();</script><script defer src="https://cdn');
      }
      if (url.searchParams.has('no-cdn')) html = html.replace(/<script defer src="https:\/\/cdn[^>]+><\/script>/, '');
      data = Buffer.from(html.replace('</body>', '<script>(' + controls.toString() + ')();</script></body>'));
    }
    res.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': {
      '.html': 'text/html;charset=utf-8', '.js': 'application/javascript;charset=utf-8', '.css': 'text/css',
      '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml'
    }[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  } catch (error) { console.error(req.url, error.message); res.writeHead(404); res.end(); }
});
server.listen(0, '127.0.0.1', () => console.log('Movement fixture: http://127.0.0.1:' + server.address().port));
