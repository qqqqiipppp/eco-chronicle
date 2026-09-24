// Run with node tests/movement.test.cjs. No dependencies or live service required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function environment() {
  let now = 100000, id = 0;
  const frames = new Map(), timers = new Map();
  class Element {
    constructor() { this.style = {}; this.dataset = {}; this.children = []; this.classes = new Set();
      this.classList = { toggle: (c, on) => on ? this.classes.add(c) : this.classes.delete(c), add: c => this.classes.add(c) }; }
    append(...nodes) { nodes.forEach(n => { n.parentNode = this; this.children.push(n); }); }
    appendChild(n) { this.append(n); }
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(n => n !== this); this.parentNode = null; }
    querySelector() { return null; }
  }
  const plane = new Element(), screen = new Element();
  const context = { console, Map, Set, Date: { now: () => now }, performance: { now: () => now },
    document: { getElementById: id => id === 'plane' ? plane : id === 'screen' ? screen : null, createElement: () => new Element() },
    MutationObserver: class { observe() {} },
    requestAnimationFrame: f => { frames.set(++id, f); return id; }, cancelAnimationFrame: i => frames.delete(i),
    setInterval: (f, ms) => { timers.set(++id, { f, ms }); return id; }, clearInterval: i => timers.delete(i),
    setTimeout, clearTimeout,
    addEventListener() {}, S: { themeId: 'forest', scene: 'world', modal: null },
    Wd: { px: 300, py: 500, face: 'south', moving: false }, W: 2500, H: 2200,
    SPAWN: { x: 300, y: 500 }, OBJS: [], Nd: { spots: [] },
    LOOKS: {}, sideDir: d => d === 'east' ? 'west' : d, customHeadKey: (h, f, d) => `${h}_${f}_${d}`,
    npcTint: key => key, syncStride: (el, state, travel) => { state.moving = travel > .001; }
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['remote-players.js', 'movement.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), context);
  return { c: context, timers, frames,
    advance(ms = 16) { now += ms; const batch = [...frames.values()]; frames.clear(); batch.forEach(f => f(now)); },
    async poll(ms = 125) { now += ms; for (const timer of timers.values()) await timer.f(); }
  };
}

(async () => {
  const e = environment(), { c } = e, r = c.ecoRemotePlayers;
  const self = { playerId: 'self', theme: 'forest', joinedAt: 's1', nickname: 'Me' };
  const peer = { playerId: 'peer', theme: 'forest', joinedAt: 'p1', nickname: 'Peer' };
  r.sync('self', 'forest', [self, peer]);
  assert.equal(Object.keys(r.remotePlayers).length, 1);
  const message = { playerId: 'peer', theme: 'forest', joinedAt: 'p1', x: 500, y: 600, direction: 'east', moving: true, seq: 101 };
  assert.equal(r.receivePosition(message), true);
  assert.equal(r.remotePlayers.peer.position.x, 500, 'first packet snaps');
  for (const patch of [{ seq: 100 }, { seq: 101 }, { playerId: 'self' }, { playerId: 'absent' },
    { theme: 'river' }, { joinedAt: 'old' }, { x: NaN }, { x: Infinity }, { x: -1 }, { x: 99999 },
    { direction: 'invalid' }, { moving: 'yes' }, { seq: 1.5 }]) {
    assert.equal(r.receivePosition({ ...message, ...patch }), false, JSON.stringify(patch));
  }
  r.receivePosition({ ...message, seq: 102, x: 550 });
  e.advance();
  assert.ok(r.remotePlayers.peer.position.x > 500 && r.remotePlayers.peer.position.x < 550, 'interpolation');
  for (let i = 0; i < 60; i++) e.advance();
  assert.equal(r.remotePlayers.peer.position.x, 550);
  r.receivePosition({ ...message, seq: 103, x: 1200, moving: false });
  assert.equal(r.remotePlayers.peer.position.x, 1200, 'large correction snaps');
  e.advance();
  assert.equal(r.remotePlayers.peer.animationState.moving, false);
  r.sync('self', 'forest', [self]);
  assert.equal(r.receivePosition({ ...message, seq: 104 }), false, 'late packet cannot resurrect');
  r.sync('self', 'forest', [self, { ...peer, joinedAt: 'p2' }]);
  assert.equal(r.receivePosition({ ...message, seq: 105 }), false, 'old membership cannot move new actor');

  const ten = Array.from({ length: 10 }, (_, i) => ({ ...peer, playerId: `p${i}` }));
  r.sync('self', 'forest', [self, ...ten]);
  ten.forEach((p, i) => r.receivePosition({ ...message, ...p, seq: 1, x: 500 + i * 100 }));
  ten.forEach((p, i) => r.receivePosition({ ...message, ...p, seq: 2, x: 550 + i * 100 }));
  for (let i = 0; i < 60; i++) e.advance();
  assert.equal(Object.keys(r.remotePlayers).length, 10);
  ten.forEach((p, i) => assert.equal(r.remotePlayers[p.playerId].position.x, 550 + i * 100));
  assert.equal(e.frames.size, 0, 'settled actors do not keep a frame loop running');
  r.refresh();
  assert.equal(e.frames.size, 0, 'Presence refresh does not wake stationary actors');

  const sent = [], handlers = {};
  let fail = false;
  const channel = { on(type, filter, handler) { handlers[filter.event] = handler; },
    async send(msg) { if (fail) throw Error('simulated offline'); sent.push(msg); return 'ok'; } };
  const movement = c.ecoMovement;
  r.sync('self', 'forest', [self, peer]);
  movement.attach(channel, 'self', 'forest', 's1'); movement.ready(true); movement.members([self, peer]);
  await e.poll();
  handlers['world-position']({ payload: message });
  assert.equal(movement.getStats().received, 1);
  handlers['world-position']({ payload: { ...message, seq: 100 } });
  assert.equal(movement.getStats().ignored, 1);
  await e.poll();
  const before = sent.length;
  for (let i = 0; i < 40; i++) await e.poll();
  assert.equal(sent.length, before, 'stationary for 5 seconds: zero extra packets');
  for (let i = 0; i < 8; i++) { c.Wd.px += 20; c.Wd.moving = true; await e.poll(); }
  assert.equal(sent.length - before, 8, '8 positions per simulated second');
  assert.deepEqual(Object.keys(sent.at(-1).payload).sort(), ['direction', 'joinedAt', 'moving', 'playerId', 'seq', 'theme', 'x', 'y']);
  c.Wd.px += 3; c.S.modal = 'bag'; await e.poll();
  assert.equal(sent.at(-1).payload.moving, false, 'personal screen sends one stop');
  assert.equal(sent.at(-1).payload.x, c.Wd.px, 'final world step is retained at modal entry');
  const paused = sent.length; c.Wd.px += 500; await e.poll();
  assert.equal(sent.length, paused, 'personal mode position never sent');
  c.S.modal = null; await e.poll();
  assert.equal(sent.at(-1).payload.x, c.Wd.px);
  const saved = JSON.stringify(c.S);
  fail = true; c.Wd.px++; await e.poll(); const failures = movement.getStats().failures;
  for (let i = 0; i < 8; i++) await e.poll();
  assert.equal(movement.getStats().failures, failures, 'failure retry backoff');
  assert.equal(JSON.stringify(c.S), saved, 'network never changes save state');
  movement.ready(false); const count = sent.length; await e.poll(3000);
  assert.equal(sent.length, count, 'no send on disconnected channel');
  movement.detach(); handlers['world-position']({ payload: { ...message, seq: 999 } });
  assert.equal(r.remotePlayers.peer.lastSeq, 101, 'old channel callback ignored');
  const load = environment(), lc = load.c;
  const thirtyFour = Array.from({ length: 34 }, (_, i) => ({ ...peer, playerId: `load-${i}` }));
  lc.ecoRemotePlayers.sync('self', 'forest', [self, ...thirtyFour]);
  const loadSent = [];
  const loadChannel = { on() {}, async send(msg) { loadSent.push(msg); return 'ok'; } };
  lc.ecoMovement.attach(loadChannel, 'self', 'forest', 's1');
  lc.ecoMovement.ready(true);
  lc.ecoMovement.members([self, ...thirtyFour]);
  assert.equal(Object.keys(lc.ecoRemotePlayers.remotePlayers).length, 34);
  assert.equal(lc.ecoMovement.getStats().intervalMs, 200, '35 members activate 5Hz');
  assert.equal([...load.timers.values()].filter(t => t.ms === 200).length, 1, 'one movement interval');
  for (let i = 0; i < 5; i++) { lc.Wd.px += 2; await load.poll(200); }
  assert.equal(loadSent.filter(m => m.event === 'world-position').length, 5, 'five changed positions per second');
  const stationary = loadSent.filter(m => m.event === 'world-position').length;
  for (let i = 0; i < 5; i++) await load.poll(200);
  assert.equal(loadSent.filter(m => m.event === 'world-position').length, stationary, 'low mode stays silent while stationary');
  lc.Wd.cx = 0; lc.Wd.cy = 0; lc.Wd.vw = 600; lc.Wd.vh = 500;
  lc.ecoRemotePlayers.receivePosition({ ...message, playerId: 'load-0', joinedAt: 'p1', seq: 1, x: 1500, y: 1500 });
  lc.ecoRemotePlayers.receivePosition({ ...message, playerId: 'load-0', joinedAt: 'p1', seq: 2, x: 1510, y: 1510 });
  assert.equal(lc.ecoRemotePlayers.remotePlayers['load-0'].position.x, 1510, 'offscreen actor snaps without animation');
  console.log('PASS: ordering, validation, membership, 10 actors, interpolation/snap, idle suppression, 8Hz, personal screens, failure/backoff, state isolation');
})().catch(error => { console.error(error); process.exitCode = 1; });
