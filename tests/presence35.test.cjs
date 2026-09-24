// Exercise the real Presence parser/reconcile code with a deterministic 35-member channel.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { webcrypto } = require('node:crypto');

const timers = new Map(), channels = [], listeners = {};
let timerId = 0, remote = null, roster = null, trackCalls = 0, removed = 0, memberCalls = 0, warnings = 0;
let now = 100000;
const state = { themeId: 'forest', name: '나', lv: 5, petKey: 'earth' };
function peer(i, theme = 'forest') {
  return { playerId: `peer-${i}`, nickname: `학생${i}`, theme, joinedAt: `j-${i}`,
    hair: 'messy', face: 'bright', outfit: 'cloak', skin: 'light', haircol: 'brown', direction: 'south',
    spirit: '조약돌 정령', level: i, equipment: '없음', progress: '숲 1단계' };
}
const client = {
  channel(name) {
    const channel = { name, handlers: {}, members: [], self: null, subscribed: null,
      on(type, filter, callback) { this.handlers[type + ':' + filter.event] = callback; return this; },
      presenceState() { return { members: this.members.concat(this.self ? [this.self] : []) }; },
      subscribe(callback) { this.subscribed = callback; callback('SUBSCRIBED'); return this; },
      async track(value) { trackCalls++; this.self = value; this.sync(); return 'ok'; },
      async untrack() { this.self = null; return 'ok'; },
      sync() { this.handlers['presence:sync']?.(); },
      async send() { return 'ok'; }
    };
    channels.push(channel); return channel;
  },
  async removeChannel() { removed++; return 'ok'; }
};
const c = { console: { info() {}, warn() { warnings++; } }, crypto: webcrypto,
  Date: class extends Date { static now() { return now; } },
  navigator: { onLine: true },
  S: state, ecoSupabase: { client },
  ecoRemotePlayers: { appearance: p => p, sync: (self, theme, players) => { remote = { self, theme, players }; }, refresh() {} },
  ecoOnlinePlayers: { summary: () => ({ spirit: '조약돌 정령', level: state.lv, equipment: '없음', progress: '숲 1단계' }),
    sanitize: p => ({ spirit: p.spirit, level: p.level, equipment: p.equipment, progress: p.progress }),
    update: (self, theme, players) => { roster = { self, theme, players }; } },
  ecoMovement: { attach() {}, detach() {}, ready() {}, members() { memberCalls++; } },
  document: { body: { appendChild() {} }, createElement() { return { style: {}, setAttribute() {}, textContent: '' }; } },
  setInterval(callback, ms) { timers.set(++timerId, { callback, ms }); return timerId; },
  clearInterval(id) { timers.delete(id); }, addEventListener(name, callback) { listeners[name] = callback; } };
c.window = c;
vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/presence.js'), 'utf8'), c);
const flush = () => new Promise(resolve => setImmediate(resolve));
async function poll() { for (const item of timers.values()) item.callback(); await flush(); await flush(); }

(async () => {
  await poll();
  let channel = channels.at(-1);
  const peers = Array.from({ length: 34 }, (_, i) => peer(i + 1));
  channel.members = peers.concat(peer(1), peer(99, 'river'));
  channel.sync();
  assert.equal(roster.players.length, 35, '35 unique matching-theme Presence entries');
  assert.equal(new Set(roster.players.map(p => p.playerId)).size, 35, 'no duplicate ID');
  assert.equal(remote.players.filter(p => p.playerId !== remote.self).length, 34);
  assert.equal(c.ecoMultiplayer.getStats().onlinePlayers, 35);
  assert.equal(c.ecoMultiplayer.getStats().theme, 'forest');
  const stableTracks = trackCalls;
  for (let i = 0; i < 20; i++) await poll();
  assert.equal(trackCalls, stableTracks, 'unchanged summary does not re-track');
  channel.members = peers.slice(0, 33); channel.sync();
  assert.equal(roster.players.length, 34, 'one leave removes one');
  channel.members = peers; channel.sync();
  assert.equal(roster.players.length, 35, 'rejoin restores one');
  channel.subscribed('CHANNEL_ERROR');
  assert.equal(roster.players.length, 0, 'disconnect clears roster');
  channel.subscribed('SUBSCRIBED'); await flush();
  assert.equal(roster.players.length, 35, 'reconnect re-tracks');
  for (let i = 0; i < 20; i++) {
    state.themeId = 'river'; await poll();
    assert.equal(roster.theme, 'river');
    assert.equal(roster.players.length, 1);
    state.themeId = 'forest'; await poll();
    channel = channels.at(-1);
    channel.members = peers; channel.sync();
    assert.equal(roster.players.length, 35);
  }
  assert.equal(timers.size, 1, 'one Presence interval after 20 theme cycles');
  assert.equal(channels.length - removed, 1, 'one active channel after theme cycles');
  const old = channels.at(-2), before = memberCalls;
  old.sync();
  assert.equal(memberCalls, before, 'removed channel callback ignored');
  channel = channels.at(-1);
  channel.subscribed('TIMED_OUT');
  assert.equal(remote.players.length, 0, 'timeout clears remote display');
  now += 3100;
  await poll();
  assert.equal(channels.length - removed, 1, 'timeout replaces rather than duplicates a channel');
  assert.equal(c.ecoMultiplayer.getStats().reconnectCount, 2, 'error recovery counted');
  c.ecoMultiplayer.disable(); await flush();
  assert.equal(c.ecoMultiplayer.getStats().status, 'offline');
  assert.equal(remote.players.length, 0, 'emergency switch clears remote display');
  assert.equal(roster.players.length, 0, 'emergency switch clears roster');
  assert.equal(channels.length - removed, 0, 'emergency switch removes channel');
  await poll();
  assert.equal(channels.length - removed, 0, 'disabled polling does not reconnect');
  c.ecoMultiplayer.enable(); await poll();
  assert.equal(channels.length - removed, 1, 'enable restores one channel');
  assert.equal(c.ecoMultiplayer.getStats().status, 'connected');
  c.navigator.onLine = false; listeners.offline(); await poll();
  assert.equal(c.ecoMultiplayer.getStats().status, 'offline');
  assert.equal(remote.players.length, 0, 'network loss clears remote display');
  c.navigator.onLine = true; listeners.online(); await poll();
  assert.equal(channels.length - removed, 1, 'network recovery retains a single channel');
  console.log(JSON.stringify({ presenceMembers: 35, remoteMembers: 34, unchangedTracks: 0,
    themeCycles: 20, activeChannels: channels.length - removed, timers: timers.size,
    expectedDisconnectWarnings: warnings, staleCallbackIgnored: true }));
})().catch(error => { console.error(error); process.exitCode = 1; });
