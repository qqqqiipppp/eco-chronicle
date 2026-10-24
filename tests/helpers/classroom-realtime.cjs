// Offline browser/Realtime simulation. All channels, clocks and students are synthetic.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const plain = value => JSON.parse(JSON.stringify(value));
const flush = () => new Promise(resolve => setImmediate(resolve));

class Element {
  constructor(tag, document) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = document;
    this.children = []; this.parentElement = null; this.style = {}; this.dataset = {};
    this.attributes = {}; this.listeners = {}; this.className = ''; this.id = ''; this.text = '';
    this.classList = {
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/), ...names])].join(' ').trim(); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); },
      toggle: (name, on) => { if (on) this.classList.add(name); else this.classList.remove(name); },
      contains: name => this.className.split(/\s+/).includes(name)
    };
  }
  get parentNode() { return this.parentElement; }
  get isConnected() { return this === this.ownerDocument.body || !!this.parentElement?.isConnected; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this.replaceChildren(); this.text = String(value); }
  append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
  appendChild(child) { child.remove(); child.parentElement = this; this.children.push(child); return child; }
  insertBefore(child, before) {
    if (!before || !this.children.includes(before)) return this.appendChild(child);
    child.remove(); child.parentElement = this; this.children.splice(this.children.indexOf(before), 0, child); return child;
  }
  remove() {
    if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    this.parentElement = null;
  }
  replaceChildren(...children) {
    this.children.forEach(child => { child.parentElement = null; }); this.children = []; this.text = '';
    children.forEach(child => this.appendChild(child));
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') this.className = String(value);
    if (name === 'id' || name === 'title') this[name] = String(value);
    if (name.startsWith('data-')) this.dataset[name.slice(5)] = String(value);
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  click() { (this.listeners.click || []).forEach(callback => callback({ target: this })); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const results = new Set();
    for (const group of selector.split(',')) {
      const parts = group.trim().split(/\s+/);
      const matches = (element, part) => {
        const id = /#([\w-]+)/.exec(part), classes = [...part.matchAll(/\.([\w-]+)/g)];
        const tag = /^([\w-]+)/.exec(part);
        return (!id || element.id === id[1]) && (!tag || element.tagName === tag[1].toUpperCase()) &&
          classes.every(match => element.classList.contains(match[1]));
      };
      const visit = element => {
        if (matches(element, parts.at(-1))) {
          let ancestor = element.parentElement, index = parts.length - 2;
          while (ancestor && index >= 0) { if (matches(ancestor, parts[index])) index--; ancestor = ancestor.parentElement; }
          if (index < 0) results.add(element);
        }
        element.children.forEach(visit);
      };
      this.children.forEach(visit);
    }
    return [...results];
  }
  set innerHTML(markup) {
    this.replaceChildren();
    const stack = [this];
    for (const token of markup.match(/<[^>]+>|[^<]+/g) || []) {
      if (token.startsWith('</')) { stack.pop(); continue; }
      if (!token.startsWith('<')) { stack.at(-1).text += token; continue; }
      const element = this.ownerDocument.createElement(/^<([\w-]+)/.exec(token)[1]);
      for (const attr of token.matchAll(/([\w-]+)="([^"]*)"/g)) element.setAttribute(attr[1], attr[2]);
      stack.at(-1).appendChild(element);
      if (!['img', 'input', 'br', 'hr'].includes(element.tagName.toLowerCase()) && !token.endsWith('/>')) stack.push(element);
    }
  }
}

function documentFixture() {
  const listeners = {};
  const document = {
    hidden: false, visibilityState: 'visible', listeners,
    createElement: tag => new Element(tag, document),
    getElementById: id => document.body.querySelector('#' + id),
    querySelector: selector => document.body.querySelector(selector),
    querySelectorAll: selector => document.body.querySelectorAll(selector),
    addEventListener(name, callback) { (listeners[name] ||= []).push(callback); },
    removeEventListener(name, callback) { listeners[name] = (listeners[name] || []).filter(item => item !== callback); },
    dispatch(name) { (listeners[name] || []).forEach(callback => callback({ type: name })); }
  };
  document.body = document.createElement('body');
  for (const [id, childClass] of [['screen', ''], ['hudHost', 'hudbtns'], ['modalHost', 'sheet']]) {
    const node = document.createElement('div'); node.id = id;
    if (childClass) { const child = document.createElement('div'); child.className = childClass; node.appendChild(child); }
    document.body.appendChild(node);
  }
  return document;
}

function createClock() {
  let now = 100000, nextId = 0;
  const timers = new Map(), frames = new Map();
  const schedule = (callback, ms, interval) => {
    const id = ++nextId;
    timers.set(id, { callback, ms, interval, next: now + Math.max(1, Number(ms) || 0) }); return id;
  };
  return {
    timers, frames, now: () => now,
    setInterval: (callback, ms) => schedule(callback, ms, true), clearInterval: id => timers.delete(id),
    setTimeout: (callback, ms) => schedule(callback, ms, false), clearTimeout: id => timers.delete(id),
    requestAnimationFrame(callback) { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
    async advance(ms) {
      const until = now + ms;
      for (;;) {
        const next = [...timers.entries()].filter(([, timer]) => timer.next <= until)
          .sort((a, b) => a[1].next - b[1].next || a[0] - b[0])[0];
        if (!next) break;
        const [id, timer] = next; now = timer.next;
        if (timer.interval) timer.next += Math.max(1, timer.ms); else timers.delete(id);
        await timer.callback(); await flush();
      }
      now = until; await flush(); await flush();
    }
  };
}

function createHub() {
  const hub = {
    channels: new Set(), broadcasts: [], extras: [],
    sync() { for (const channel of [...hub.channels]) channel.handlers['presence:sync']?.(); },
    client() {
      const client = {
        channels: [], tracks: [], removed: 0, removeAttempts: 0, removeFailures: 0,
        maxActiveChannels: 0, subscriptionStatus: 'SUBSCRIBED', now: () => 0,
        getChannels() { return this.channels.filter(channel => hub.channels.has(channel)); },
        channel(name, options = { config: { presence: { key: 'test' } } }) {
          const channel = {
            name, key: options.config.presence.key, createdAt: client.now(), handlers: {}, self: null, statusCallback: null,
            on(type, filter, callback) { this.handlers[type + ':' + filter.event] = callback; return this; },
            subscribe(callback) { this.statusCallback = callback; callback(client.subscriptionStatus); return this; },
            status(value) { this.statusCallback?.(value); },
            presenceState() {
              const records = [...hub.channels].filter(peer => peer.name === name && peer.self)
                .map(peer => [peer.key, [peer.self]]);
              records.push(['external', hub.extras]); return Object.fromEntries(records);
            },
            async track(value) { client.tracks.push(plain(value)); this.self = plain(value); hub.sync(); return 'ok'; },
            async untrack() { this.self = null; hub.sync(); return 'ok'; },
            async send(message) { hub.broadcasts.push(plain(message)); return 'ok'; },
            receive(event, payload) { this.handlers['broadcast:' + event]?.({ payload }); }
          };
          client.channels.push(channel); hub.channels.add(channel);
          client.maxActiveChannels = Math.max(client.maxActiveChannels, client.channels.filter(item => hub.channels.has(item)).length);
          return channel;
        },
        async removeChannel(channel) {
          client.removeAttempts++;
          if (client.removeFailures > 0) { client.removeFailures--; return 'error'; }
          client.removed++; hub.channels.delete(channel); channel.self = null; hub.sync(); return 'ok';
        }
      };
      return client;
    }
  };
  return hub;
}

function fixture(identity = 1) {
  return { name: '학생' + identity, code: 'SYNTHETIC-STUDENT-' + identity, lv: identity + 1, scene: 'world', modal: null, themeId: 'forest',
    petKey: 'earth', gear: { weapon: 'leaf' }, monIdx: 0, cleared: [], hair: 'messy', face: 'bright',
    outfit: 'cloak', skin: 'light', haircol: 'brown', cloudCode: 'PRIVATE-SAVE-CODE',
    tower: { best: identity + 2, bestTime: 60 + identity, runs: 1, history: [] } };
}

function browser(hub = createHub(), identity = 1, options = {}) {
  const document = documentFixture(), clock = createClock(), listeners = {}, warnings = [];
  const client = hub.client(), state = options.state || fixture(identity);
  client.now = clock.now;
  if (options.hidden) { document.hidden = true; document.visibilityState = 'hidden'; }
  let observers = 0;
  const context = {
    S: state, document, navigator: { onLine: true }, performance: { now: clock.now },
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [clock.now()])); } static now() { return clock.now(); } },
    console: { info() {}, warn(...args) { warnings.push(args.map(String).join(' ')); } },
    crypto: { getRandomValues(bytes) { return bytes.fill(identity); } },
    THEMES: Object.fromEntries(['forest', 'river', 'ocean', 'city', 'air', 'climate'].map(id =>
      [id, { name: id === 'forest' ? '푸른 숲' : id === 'river' ? '맑은 강' : id, monsters: [{ boss: false }, { boss: true }] }])),
    PETS: { earth: {} }, petName: () => '조약돌 정령',
    gearFind: (slot, id) => slot === 'weapon' && id === 'leaf' ? { name: '잎사귀 검' } : null,
    Wd: { ready: false, px: 300, py: 500, face: 'south', moving: false }, W: 2500, H: 2200,
    SPAWN: { x: 300, y: 500 }, OBJS: [], Nd: { spots: [] }, LOOKS: {},
    sideDir: direction => direction === 'east' ? 'west' : direction,
    customHeadKey: (hair, face, direction) => `${hair}_${face}_${direction}`, npcTint: value => value,
    syncStride() {}, ecoSupabase: { client },
    setInterval: clock.setInterval, clearInterval: clock.clearInterval,
    setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    requestAnimationFrame: clock.requestAnimationFrame, cancelAnimationFrame: clock.cancelAnimationFrame,
    MutationObserver: class { observe() { observers++; } disconnect() { observers--; } },
    addEventListener(name, callback) { (listeners[name] ||= []).push(callback); },
    removeEventListener(name, callback) { listeners[name] = (listeners[name] || []).filter(item => item !== callback); },
    openModal(name) { state.modal = name; }, closeModal() { state.modal = null; }
  };
  context.window = context;
  const mountWorld = () => {
    if (!document.getElementById('worldRoot')) {
      const world = document.createElement('div'); world.id = 'worldRoot';
      const plane = document.createElement('div'); plane.id = 'plane';
      const hero = document.createElement('div'); hero.id = 'hero'; hero.className = 'actor';
      plane.appendChild(hero); world.appendChild(plane); document.getElementById('screen').appendChild(world);
    }
    document.getElementById('screen').dataset.scene = state.scene; context.Wd.ready = true;
  };
  if (options.mounted !== false) mountWorld();
  if (options.legacyRemote) {
    const layer = document.createElement('div'); layer.id = 'ecoRemoteLayer';
    const actor = document.createElement('div'); actor.className = 'actor eco-remote-player';
    for (const className of ['shadow', 'nametag']) { const child = document.createElement('div'); child.className = className; actor.appendChild(child); }
    layer.appendChild(actor); document.getElementById('plane').appendChild(layer);
  }
  vm.createContext(context);
  const scripts = options.scripts || ['player-list.js', 'remote-players.js', 'movement.js', 'presence.js'];
  for (const file of [...(options.config === false ? [] : ['multiplayer-config.js']), ...scripts]) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), context, { filename: file });
  }
  return { context, state, document, client, hub, clock, timers: clock.timers, frames: clock.frames, warnings,
    mountWorld, advance: clock.advance,
    get observers() { return observers; },
    get rows() { return document.getElementById('ecoOnlineRows')?.children || []; },
    get activeChannels() { return client.channels.filter(channel => hub.channels.has(channel)); },
    get listenerCount() { return Object.values(listeners).concat(Object.values(document.listeners)).reduce((sum, items) => sum + items.length, 0); },
    event(name) { (listeners[name] || []).forEach(callback => callback({ type: name })); document.dispatch(name); },
    hidden(value) { document.hidden = value; document.visibilityState = value ? 'hidden' : 'visible'; this.event('visibilitychange'); },
    openRoster() { context.ecoOnlinePlayers.open(); }
  };
}

module.exports = { browser, createHub, fixture, flush, plain };
