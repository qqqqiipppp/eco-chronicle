// Local, disposable browser QA for the real Web Audio and sound controls.
const http = require('node:http'), fs = require('node:fs/promises'), path = require('node:path');
const root = path.resolve(__dirname, '..');
function fixture() {
  const errors = [];
  addEventListener('error', e => errors.push({ message: e.message, file: e.filename }));
  addEventListener('unhandledrejection', e => errors.push({ message: String(e.reason?.message || e.reason) }));
  document.addEventListener('DOMContentLoaded', () => {
    S = Object.assign(newState(), { name: '소리테스트', code: 'EC9868', petKey: 'earth', lv: 10, scene: 'world' });
    applyTheme('forest'); Wd.px = SPAWN.x; Wd.py = SPAWN.y; Wd.ready = false; render();
    if (new URLSearchParams(location.search).has('clean')) return;
    const box = document.createElement('aside'); box.id = 'sound-qa';
    box.style = 'position:fixed;left:8px;bottom:8px;z-index:5000;background:#fff;color:#111;padding:5px;max-width:650px;font:11px monospace';
    const output = document.createElement('pre'); output.id = 'sound-qa-result';
    output.style = 'white-space:pre-wrap;max-height:110px;overflow:auto;margin:4px 0 0';
    const sounds = [], gains = [], originalSfx = playSfx;
    let analyser = null, attached = null, lastTouch = null;
    playSfx = function (name) {
      sounds.push({ name, master: Au.masterVolume, muted: Au.muted, gain: Au.gain?.gain.value });
      if (sounds.length > 8) sounds.shift(); originalSfx(name);
    };
    function button(label, action) { const b = document.createElement('button'); b.textContent = label; b.onclick = action; box.appendChild(b); }
    function world() { closeModal(); closeBattleDom(); B = null; Tw.on = false; S.scene = 'world'; render(); bgmUpdate(); }
    button('QA world', world);
    button('QA river', () => { world(); Adm.on = true; enterTheme('river'); });
    button('QA forest', () => { world(); Adm.on = true; enterTheme('forest'); });
    button('QA battle', () => { world(); admFight(); });
    button('QA puzzle', () => { world(); admMini('match'); });
    button('QA puzzle move', () => { const move = Mt && mtGetValidMoves(Mt.g)[0]; if (move && !Mt.busy) { mtTap(move[0]); mtTap(move[1]); } });
    button('QA effect', () => { auResume(); playSfx('coin'); });
    button('QA touch slider', () => {
      if (document.getElementById('ecoSoundPanel').hidden) document.getElementById('ecoSoundOpen').click();
      const slider = document.getElementById('ecoSoundVolume'), r = slider.getBoundingClientRect();
      if (!r.width) return;
      const event = { bubbles: true, pointerType: 'touch', pointerId: 97, clientX: r.left + r.width * .2, clientY: r.top + r.height / 2 };
      slider.dispatchEvent(new PointerEvent('pointerdown', event));
      slider.value = '20'; slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new PointerEvent('pointerup', event));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
      lastTouch = { type: 'simulated touch/input/change', percent: 20, x: r.left + r.width * .2, y: r.top + r.height / 2 };
    });
    button('QA save load', () => {
      const before = JSON.stringify(S), mode = Save.save(), loaded = Save.load(S.code);
      output.dataset.save = mode === 'disk' && loaded && loaded.code === S.code && loaded.lv === S.lv && loaded.themeId === S.themeId ? 'PASS' : 'FAIL';
      output.dataset.soundInSave = /"masterVolume"|"eco_volume"|"muted"/.test(before) ? 'FAIL' : 'PASS';
    });
    button('QA hide tools', () => { box.hidden = true; });
    box.appendChild(output); document.body.appendChild(box);
    setInterval(() => {
      if (Au.gain && attached !== Au.gain) {
        attached = Au.gain; analyser = Au.ctx.createAnalyser(); analyser.fftSize = 256;
        Au.gain.connect(analyser); // Read-only meter; no second audible output.
      }
      let rms = 0;
      if (analyser) { const samples = new Float32Array(256); analyser.getFloatTimeDomainData(samples); rms = Math.sqrt(samples.reduce((sum, n) => sum + n * n, 0) / samples.length); }
      const actualGain = Au.gain?.gain.value;
      if (gains.at(-1)?.gain !== actualGain || gains.at(-1)?.muted !== Au.muted) {
        gains.push({ gain: actualGain, master: Au.masterVolume, muted: Au.muted }); if (gains.length > 12) gains.shift();
      }
      output.textContent = JSON.stringify({ master: Au.masterVolume, muted: Au.muted, baseGain: Au.vol,
        actualGain, context: Au.ctx?.state, bgm: Au.cur, rms: +rms.toFixed(6), gains, sounds,
        stored: { volume: localStorage.getItem('eco_volume'), mute: localStorage.getItem('eco_mute') },
        scene: S.scene, modal: S.modal, local: { x: Wd.px, y: Wd.py }, touch: lastTouch,
        settingsCount: document.querySelectorAll('.eco-sound-settings').length,
        save: output.dataset.save || '', soundExcludedFromSave: output.dataset.soundInSave || '', errors });
    }, 100);
  });
}
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    if (url.pathname === '/tablet.html') {
      res.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': 'text/html;charset=utf-8' });
      res.end('<!doctype html><html lang="ko"><meta charset="utf-8"><title>태블릿 소리 설정 QA</title>' +
        '<body style="margin:0;background:#071713"><iframe id="sound-tablet" title="태블릿 소리 설정 화면" ' +
        'width="1024" height="640" style="border:0" src="/' + (url.searchParams.has('clean') ? '?clean=1' : '') + '"></iframe></body></html>'); return;
    }
    const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname), full = path.resolve(root, '.' + rel);
    if (!full.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    let data = await fs.readFile(full);
    if (rel === '/index.html') {
      // Only local response HTML: omit network integrations to isolate audio behavior.
      let html = data.toString().replace(/<script defer[^>]*><\/script>/g, '');
      data = Buffer.from(html.replace('<script src="./js/game.js">', '<script>(' + fixture.toString() + ')();</script><script src="./js/game.js">'));
    }
    res.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': {
      '.html': 'text/html;charset=utf-8', '.js': 'application/javascript;charset=utf-8', '.css': 'text/css',
      '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml'
    }[path.extname(full)] || 'application/octet-stream' }); res.end(data);
  } catch (error) { console.error(error.message); res.writeHead(404); res.end(); }
}).listen(Number(process.argv[2]) || 0, '127.0.0.1', function () { console.log('Sound QA: http://127.0.0.1:' + this.address().port); });
