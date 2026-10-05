// Load the real roster and Presence scripts with a small DOM and two shared channels.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, 'js', file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const flush = () => new Promise(resolve => setImmediate(resolve));

class Element {
  constructor(tag, document) {
    this.tagName = tag.toUpperCase();
    this.ownerDocument = document;
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.id = '';
    this.title = '';
    this.text = '';
    this.classList = { add: name => { this.className += ' ' + name; } };
  }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this.replaceChildren(); this.text = String(value); }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  insertBefore(child, before) {
    const index = this.children.indexOf(before);
    if (index < 0) return this.appendChild(child);
    child.parentElement = this;
    this.children.splice(index, 0, child);
    return child;
  }
  replaceChildren(...children) {
    this.children.forEach(child => { child.parentElement = null; });
    this.children = [];
    this.text = '';
    children.forEach(child => this.appendChild(child));
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') this.className = String(value);
    if (name === 'id' || name === 'title') this[name] = String(value);
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  click() { (this.listeners.click || []).forEach(callback => callback()); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const parts = selector.trim().split(/\s+/);
    const matches = (element, part) => part.startsWith('#') ? element.id === part.slice(1)
      : part.startsWith('.') ? element.className.split(/\s+/).includes(part.slice(1))
        : element.tagName === part.toUpperCase();
    const results = [];
    const visit = element => {
      if (matches(element, parts.at(-1))) {
        let ancestor = element.parentElement;
        let index = parts.length - 2;
        while (ancestor && index >= 0) {
          if (matches(ancestor, parts[index])) index--;
          ancestor = ancestor.parentElement;
        }
        if (index < 0) results.push(element);
      }
      element.children.forEach(visit);
    };
    this.children.forEach(visit);
    return results;
  }
  set innerHTML(markup) {
    // Only mount()'s static markup needs parsing. Dynamic text uses textContent.
    this.replaceChildren();
    const stack = [this];
    for (const token of markup.match(/<[^>]+>|[^<]+/g) || []) {
      if (token.startsWith('</')) { stack.pop(); continue; }
      if (!token.startsWith('<')) { stack.at(-1).text += token; continue; }
      const tag = /^<([\w-]+)/.exec(token)[1];
      const element = this.ownerDocument.createElement(tag);
      for (const attr of token.matchAll(/([\w-]+)="([^"]*)"/g)) element.setAttribute(attr[1], attr[2]);
      stack.at(-1).appendChild(element);
      if (!['img', 'input', 'br', 'hr'].includes(tag) && !token.endsWith('/>')) stack.push(element);
    }
  }
}

function createDocument() {
  const document = {
    createElement(tag) { return new Element(tag, document); },
    getElementById(id) { return document.body.id === id ? document.body : document.body.querySelector('#' + id); },
    querySelector(selector) { return document.body.querySelector(selector); },
    querySelectorAll(selector) { return document.body.querySelectorAll(selector); }
  };
  document.body = document.createElement('body');
  const hud = document.createElement('div'); hud.id = 'hudHost';
  const buttons = document.createElement('div'); buttons.className = 'hudbtns';
  hud.appendChild(buttons); document.body.appendChild(hud);
  const modal = document.createElement('div'); modal.id = 'modalHost';
  const sheet = document.createElement('div'); sheet.className = 'sheet';
  modal.appendChild(sheet); document.body.appendChild(modal);
  return document;
}

function createHub() {
  const hub = {
    channels: new Set(), extras: [],
    broadcast() { for (const channel of hub.channels) channel.handlers['presence:sync']?.(); },
    client() {
      const client = {
        tracks: [], removed: 0,
        channel(name, options) {
          const channel = {
            name, key: options.config.presence.key, handlers: {}, self: null,
            on(type, filter, callback) { this.handlers[type + ':' + filter.event] = callback; return this; },
            subscribe(callback) { callback('SUBSCRIBED'); return this; },
            presenceState() {
              const entries = Array.from(hub.channels).filter(peer => peer.name === name && peer.self)
                .map(peer => [peer.key, [peer.self]]);
              entries.push(['external', hub.extras]);
              return Object.fromEntries(entries);
            },
            async track(value) { client.tracks.push(plain(value)); this.self = value; hub.broadcast(); return 'ok'; },
            async untrack() { this.self = null; hub.broadcast(); return 'ok'; }
          };
          hub.channels.add(channel);
          return channel;
        },
        async removeChannel(channel) { client.removed++; hub.channels.delete(channel); hub.broadcast(); return 'ok'; }
      };
      return client;
    }
  };
  return hub;
}

function browser(hub, identity, state) {
  const document = createDocument();
  const timers = new Map(), listeners = {}, warnings = [];
  const client = hub.client();
  let timerId = 0;
  const context = {
    S: state, document, navigator: { onLine: true },
    console: { info() {}, warn(message) { warnings.push(message); } },
    crypto: { getRandomValues(bytes) { return bytes.fill(identity); } },
    THEMES: {
      forest: { name: '푸른 숲', monsters: [{ boss: false }, { boss: true }] },
      river: { name: '맑은 강', monsters: [{ boss: false }] }
    },
    PETS: { earth: {} }, petName: () => '조약돌 정령',
    gearFind: (slot, id) => slot === 'weapon' && id === 'leaf' ? { name: '잎사귀 검' } : null,
    ecoSupabase: { client },
    setInterval(callback, ms) { timers.set(++timerId, { callback, ms }); return timerId; },
    clearInterval(id) { timers.delete(id); },
    addEventListener(name, callback) { listeners[name] = callback; },
    openModal(name) { state.modal = name; }, closeModal() { state.modal = null; }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source('player-list.js'), context, { filename: 'player-list.js' });
  vm.runInContext(source('presence.js'), context, { filename: 'presence.js' });
  return { context, document, timers, listeners, warnings, client, state,
    get rows() { return document.getElementById('ecoOnlineRows').children; } };
}

async function poll(...browsers) {
  for (const browser of browsers) {
    const intervals = Array.from(browser.timers.values()).filter(timer => timer.ms === 500);
    assert.equal(intervals.length, 1, 'Presence keeps its existing single 500 ms poll');
    intervals[0].callback();
  }
  await flush(); await flush();
}

function fixture(name, level, best, bestTime) {
  return { name, lv: level, scene: 'world', modal: null, themeId: 'forest', petKey: 'earth',
    gear: { weapon: 'leaf' }, monIdx: 0, cleared: [],
    tower: { best, bestTime, runs: 4, history: [{ floor: best, time: bestTime }] } };
}
function peer(id, extra = {}) {
  return { playerId: id, nickname: id, theme: 'forest', joinedAt: '2026-10-05T00:00:00.000Z',
    spirit: '조약돌 정령', level: 7, equipment: '잎사귀 검', progress: '푸른 숲 1단계', ...extra };
}
function rowFor(browser, name) { return browser.rows.find(row => row.children[0].textContent.startsWith(name)); }
function towerFor(browser, name) {
  const row = rowFor(browser, name);
  assert.ok(row, name + ' has a roster row');
  assert.equal(row.children.length, 5, 'tower detail preserves the existing five columns');
  const tower = row.children[0].querySelector('.eco-online-tower');
  assert.ok(tower, 'tower detail appears inside the nickname cell');
  return tower;
}
function expectTower(browser, name, record) {
  const tower = towerFor(browser, name);
  assert.equal(tower.textContent, '🏰 탑 ' + record);
  assert.equal(tower.title, '🏰 몬스터의 탑 ' + record);
}
function pair(value) { return [value.towerBestFloor, value.towerBestTime]; }

(async () => {
  const hub = createHub();
  const alice = browser(hub, 1, fixture('나무', 5, 18, 462));
  const bob = browser(hub, 2, fixture('강물', 40, 11, 79));
  const savedTowers = [plain(alice.state.tower), plain(bob.state.tower)];
  await flush(); await flush();
  for (const tab of [alice, bob]) {
    tab.document.querySelector('.eco-online-button').click();
    assert.equal(tab.state.modal, 'online', 'real online button opens the existing modal');
    assert.deepEqual(tab.document.querySelectorAll('th').map(cell => cell.textContent),
      ['닉네임', '정령', '레벨', '장비', '진행 단계']);
    assert.equal(tab.rows.length, 2);
    assert.equal(tab.document.getElementById('ecoOnlineCount').textContent, '2명 · 푸른 숲');
    assert.ok(tab.rows[0].className.includes('eco-online-me'), 'self remains first even below a peer in level');
    assert.ok(tab.rows[0].children[0].textContent.includes(tab.state.name + ' (나)'));
    assert.equal(tab.document.querySelectorAll('.eco-online-me').length, 1);
    assert.equal(tab.client.tracks.length, 1, 'initial subscription publishes once');
  }
  assert.deepEqual([alice.state.tower, bob.state.tower], savedTowers, 'opening the roster does not change tower saves');
  expectTower(alice, '나무', '18층 · 07:42'); expectTower(bob, '나무', '18층 · 07:42');
  expectTower(alice, '강물', '11층 · 01:19'); expectTower(bob, '강물', '11층 · 01:19');

  const api = alice.context.ecoOnlinePlayers;
  assert.deepEqual(plain(api.summary(alice.state)), { spirit: '조약돌 정령', level: 5,
    equipment: '잎사귀 검', progress: '푸른 숲 1단계', towerBestFloor: 18, towerBestTime: 462 });
  assert.deepEqual(Object.keys(api.sanitize(peer('valid', { towerBestFloor: 18, towerBestTime: 462 }))).sort(),
    ['equipment', 'level', 'progress', 'spirit', 'towerBestFloor', 'towerBestTime'].sort(),
    'only the two numeric record fields extend the existing summary');
  for (const value of [null, undefined, {}, { tower: null }, { tower: {} }]) {
    assert.deepEqual(pair(api.summary(value)), [0, 0], 'missing or legacy save has no tower record');
    assert.deepEqual(pair(api.sanitize(value)), [0, 0], 'missing or legacy Presence has no tower record');
  }
  const invalidPairs = [
    [undefined, 462], [18, undefined], [0, 462], [-1, 462], [18, -1],
    [18.5, 462], [18, 462.5], ['18', 462], [18, '462'],
    [NaN, 462], [18, NaN], [Infinity, 462], [18, Infinity],
    [Number.MAX_SAFE_INTEGER + 1, 462], [18, Number.MAX_SAFE_INTEGER + 1],
    [true, 462], [18, false], [[], 462], [18, {}],
    ['<img src=x onerror=alert(1)>', 462], [18, '<script>alert(1)</script>'],
    [18n, 462], [18, Symbol('time')]
  ];
  for (const [floor, seconds] of invalidPairs) {
    const save = Object.freeze({ tower: Object.freeze({ best: floor, bestTime: seconds }) });
    const packet = Object.freeze({ towerBestFloor: floor, towerBestTime: seconds });
    assert.deepEqual(pair(api.summary(save)), [0, 0], 'invalid saved pair is reset together');
    assert.deepEqual(pair(api.sanitize(packet)), [0, 0], 'invalid remote pair is reset together');
  }
  for (const [floor, seconds] of [[1, 0], [18, 462], [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]]) {
    assert.deepEqual(pair(api.summary({ tower: { best: floor, bestTime: seconds } })), [floor, seconds]);
    assert.deepEqual(pair(api.sanitize({ towerBestFloor: floor, towerBestTime: seconds })), [floor, seconds]);
  }
  for (const [seconds, text] of [[0, '00:00'], [9, '00:09'], [59, '00:59'], [60, '01:00'],
    [462, '07:42'], [3599, '59:59'], [3600, '60:00']]) {
    api.update('format', 'forest', [peer('format', { towerBestFloor: 18, towerBestTime: seconds })]);
    expectTower(alice, 'format', '18층 · ' + text);
  }
  api.update('legacy', 'forest', [peer('legacy')]);
  expectTower(alice, 'legacy', '기록 없음');
  hub.broadcast();

  const unchangedTracks = [alice.client.tracks.length, bob.client.tracks.length];
  for (let i = 0; i < 8; i++) await poll(alice, bob);
  assert.deepEqual([alice.client.tracks.length, bob.client.tracks.length], unchangedTracks,
    'unchanged tower records cause zero additional publishes');

  let before = alice.client.tracks.length;
  alice.state.tower.best = 19; alice.state.tower.bestTime = 600;
  await poll(alice);
  assert.equal(alice.client.tracks.length - before, 1, 'new best floor publishes exactly once');
  assert.deepEqual(pair(alice.client.tracks.at(-1)), [19, 600]);
  expectTower(alice, '나무', '19층 · 10:00'); expectTower(bob, '나무', '19층 · 10:00');
  for (let i = 0; i < 4; i++) await poll(alice, bob);
  assert.equal(alice.client.tracks.length - before, 1, 'settled record does not republish');

  before = alice.client.tracks.length;
  alice.state.tower.bestTime = 599;
  await poll(alice);
  assert.equal(alice.client.tracks.length - before, 1, 'improved time on the same floor publishes exactly once');
  expectTower(alice, '나무', '19층 · 09:59'); expectTower(bob, '나무', '19층 · 09:59');
  const bobBefore = bob.client.tracks.length;
  bob.state.tower.best = 18; bob.state.tower.bestTime = 420;
  await poll(bob);
  assert.equal(bob.client.tracks.length - bobBefore, 1, 'the other client can also publish its record');
  expectTower(alice, '강물', '18층 · 07:00'); expectTower(bob, '강물', '18층 · 07:00');

  before = alice.client.tracks.length;
  alice.state.tower.runs++;
  alice.state.tower.history.unshift({ floor: 3, time: 15 });
  await poll(alice, bob);
  assert.equal(alice.client.tracks.length - before, 0, 'runs and history changes do not re-track');
  for (const packet of [...alice.client.tracks, ...bob.client.tracks]) {
    assert.equal(typeof packet.towerBestFloor, 'number');
    assert.equal(typeof packet.towerBestTime, 'number');
    for (const privateKey of ['tower', 'history', 'runs']) assert.ok(!(privateKey in packet), privateKey + ' stays out of Presence');
  }

  delete alice.state.tower;
  before = alice.client.tracks.length;
  await poll(alice);
  assert.equal(alice.client.tracks.length - before, 1, 'legacy local save publishes the no-record pair');
  expectTower(alice, '나무', '기록 없음'); expectTower(bob, '나무', '기록 없음');
  hub.extras = [peer('legacy'), peer('malicious', {
    nickname: '<img src=x onerror=bad()>', towerBestFloor: '<img src=x>', towerBestTime: -10
  }), peer('wrong-theme', { theme: 'river', towerBestFloor: 50, towerBestTime: 1 })];
  hub.broadcast();
  for (const tab of [alice, bob]) {
    assert.equal(tab.rows.length, 4, 'Presence excludes a member from a different theme');
    expectTower(tab, 'legacy', '기록 없음');
    expectTower(tab, '<img', '기록 없음');
    assert.equal(tab.document.querySelectorAll('img').length, 0, 'hostile nickname and tower data stay literal text');
    assert.equal(tab.document.querySelectorAll('script').length, 0);
    assert.equal(rowFor(tab, 'wrong-theme'), undefined);
  }
  hub.extras = []; hub.broadcast();

  bob.state.themeId = 'river';
  await poll(bob);
  assert.equal(alice.rows.length, 1, 'theme change removes the peer from the old roster');
  assert.equal(bob.rows.length, 1, 'new theme shows only its own members');
  assert.equal(bob.document.getElementById('ecoOnlineCount').textContent, '1명 · 맑은 강');
  expectTower(bob, '강물', '18층 · 07:00');
  bob.state.themeId = 'forest';
  await poll(bob);
  assert.equal(alice.rows.length, 2); assert.equal(bob.rows.length, 2);
  expectTower(alice, '강물', '18층 · 07:00');

  bob.listeners.pagehide();
  await flush(); await flush();
  assert.equal(alice.rows.length, 1, 'departing peer disappears from the other roster');
  assert.equal(rowFor(alice, '강물'), undefined);
  assert.equal(bob.rows[0].children[0].colSpan, 5, 'offline empty state still spans the existing columns');
  assert.ok(bob.rows[0].children[0].textContent.includes('온라인 기능을 사용할 수 없어요'));
  assert.equal(bob.document.querySelectorAll('.eco-online-tower').length, 0);
  alice.listeners.pagehide();
  await flush(); await flush();
  assert.equal(hub.channels.size, 0, 'both departures remove their channels');
  assert.equal(alice.context.ecoMultiplayer.getStats().onlinePlayers, 0);
  assert.equal(bob.context.ecoMultiplayer.getStats().onlinePlayers, 0);
  assert.deepEqual([...alice.warnings, ...bob.warnings], [], 'the real scripts finish without swallowed errors');
  console.log(JSON.stringify({ summary: true, invalidPairs: invalidPairs.length, formats: 7,
    columns: 5, bidirectionalRoster: true, unchangedTracks: 0, bestFloorTracks: 1,
    sameFloorImprovementTracks: 1, historyAndRunsTracks: 0, legacy: true,
    hostileValues: true, themeIsolation: true, departureCleanup: true }));
})().catch(error => { console.error(error); process.exitCode = 1; });
