// Run with node --test tests/sound-settings.test.cjs. No browser or dependencies required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const game = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const audioStart = game.indexOf('var Au =');
const audioEnd = game.indexOf('var ADMIN_PIN', audioStart);
assert.ok(audioStart >= 0 && audioEnd > audioStart, 'game audio section exists');
const audioCode = game.slice(audioStart, audioEnd);
const audioData = fs.readFileSync(path.join(__dirname, '../js/audio-data.js'), 'utf8');

function environment(options = {}) {
  const values = options.values || new Map();
  const writes = [];
  const timers = new Map();
  const instances = [];
  const uiStates = [];
  let timerId = 0;

  class AudioParam {
    constructor(value = 0) { this.value = value; this.events = []; }
    setValueAtTime(value, time) { this.events.push({ type: 'set', value, time }); this.value = value; }
    linearRampToValueAtTime(value, time) { this.events.push({ type: 'linear', value, time }); this.value = value; }
    exponentialRampToValueAtTime(value, time) { this.events.push({ type: 'exponential', value, time }); this.value = value; }
    cancelScheduledValues(time) { this.events.push({ type: 'cancel', time }); }
  }
  class Node {
    constructor(kind) { this.kind = kind; this.connections = []; this.starts = []; this.stops = []; }
    connect(target) { this.connections.push(target); return target; }
    disconnect() { this.connections = []; }
    start(time) { this.starts.push(time); }
    stop(time) { this.stops.push(time); }
    setPeriodicWave(wave) { this.wave = wave; }
  }
  class AudioContext {
    constructor() {
      this.state = 'suspended'; this.currentTime = 12; this.sampleRate = 8000;
      this.destination = new Node('destination'); this.gains = []; this.sources = []; this.resumeCount = 0;
      instances.push(this);
    }
    createGain() {
      const node = new Node('gain'); node.gain = new AudioParam(1); this.gains.push(node); return node;
    }
    createOscillator() {
      const node = new Node('oscillator'); node.frequency = new AudioParam(); this.sources.push(node); return node;
    }
    createBufferSource() { const node = new Node('buffer'); this.sources.push(node); return node; }
    createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
    createPeriodicWave(real, imaginary) { return { real, imaginary }; }
    resume() { this.resumeCount++; this.state = 'running'; return Promise.resolve(); }
  }

  const context = {
    console, Float32Array,
    S: { themeId: 'forest', gauge: 0, cleared: [], modal: null }, B: null, Tw: { on: false },
    $: () => null,
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
  };
  context.window = context;
  if (options.audio !== false) context.AudioContext = AudioContext;
  if (options.audio === 'throws') context.AudioContext = class { constructor() { throw Error('audio unavailable'); } };
  if (options.storage === 'getter-throws') {
    Object.defineProperty(context, 'localStorage', { get() { throw Error('storage blocked'); } });
  } else {
    context.localStorage = {
      getItem(key) {
        if (options.storage === 'throws') throw Error('storage blocked');
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        if (options.storage === 'throws') throw Error('storage full');
        const string = String(value); values.set(key, string); writes.push([key, string]);
      },
    };
  }
  context.ecoSoundSettings = { update() { uiStates.push({ volume: context.Au.masterVolume, muted: context.Au.muted }); } };
  vm.createContext(context);
  vm.runInContext(audioData, context, { filename: 'audio-data.js' });
  vm.runInContext(audioCode, context, { filename: 'game.js audio' });
  return { c: context, values, writes, timers, instances, uiStates };
}

function closeTo(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-12, `${message}: ${actual} should equal ${expected}`);
}

function reaches(node, target, seen = new Set()) {
  if (node === target) return true;
  if (seen.has(node)) return false;
  seen.add(node);
  return node.connections.some(next => reaches(next, target, seen));
}

test('default settings and setting changes keep the existing gesture-based audio startup', () => {
  const e = environment(), { c } = e;
  assert.equal(c.Au.masterVolume, .8);
  assert.equal(c.Au.muted, false);
  assert.equal(c.Au.vol, .55, 'existing mix level stays intact');
  assert.equal(e.instances.length, 0, 'loading settings does not initialize audio');
  c.auSetVolume(.6);
  assert.equal(e.instances.length, 0, 'volume changes do not start audio');
  c.auInit();
  assert.equal(e.instances.length, 1);
  assert.equal(c.Au.ctx.resumeCount, 0, 'initializing audio does not bypass autoplay policy');
  closeTo(c.Au.gain.gain.value, .55 * .6, 'initial master gain');
  c.auResume();
  assert.equal(c.Au.ctx.resumeCount, 1, 'existing resume path still runs');
});

test('live volume updates apply to already scheduled BGM without restarting its track or timer', () => {
  const e = environment(), { c } = e;
  c.bgmUpdate();
  const ctx = c.Au.ctx, voice = c.Au.voice, timer = c.Au.timer;
  const scheduled = ctx.sources.length, position = c.Au.at, current = c.Au.cur;
  assert.ok(scheduled > 0, 'real BGM notes are scheduled');
  assert.ok(ctx.sources.every(source => reaches(source, c.Au.gain)), 'all BGM voices use the master gain');
  const envelopes = ctx.gains.filter(g => g.connections.includes(voice));
  const peaks = envelopes.flatMap(g => g.gain.events.filter(event => event.type === 'linear').map(event => event.value));
  assert.ok(peaks.includes(c.BGM[current].vol), 'lead keeps its existing per-track volume');
  assert.ok(peaks.includes(c.BGM[current].vol * .55), 'bass keeps its existing balance');
  const mixBefore = JSON.stringify(c.BGM);

  c.auSetVolume(.3);
  closeTo(c.Au.gain.gain.value, .55 * .3, 'already playing BGM changes immediately');
  assert.equal(c.Au.voice, voice);
  assert.equal(c.Au.timer, timer);
  assert.equal(c.Au.at, position);
  assert.equal(c.Au.cur, current);
  assert.equal(ctx.sources.length, scheduled, 'adjusting volume does not reschedule notes');
  assert.equal(JSON.stringify(c.BGM), mixBefore, 'track data and per-track volumes stay intact');
});

test('every existing effect, including minigame effects, retains its own level and uses the master gain', () => {
  const e = environment(), { c } = e;
  c.auSetVolume(.2);
  c.auInit();
  const dataBefore = JSON.stringify(c.SFX);
  for (const [name, effects] of Object.entries(c.SFX)) {
    const before = c.Au.ctx.gains.length, sources = c.Au.ctx.sources.length;
    c.playSfx(name);
    const gains = c.Au.ctx.gains.slice(before);
    assert.equal(gains.length, effects.length, name);
    gains.forEach((gain, i) => {
      assert.ok(gain.connections.includes(c.Au.gain), `${name} uses master gain`);
      assert.equal(gain.gain.events[0].value, effects[i].v, `${name} preserves effect level`);
      closeTo(gain.gain.events[0].value * c.Au.gain.gain.value, effects[i].v * .55 * .2, `${name} effective level`);
    });
    assert.ok(c.Au.ctx.sources.slice(sources).every(source => reaches(source, c.Au.gain)), `${name} output graph`);
  }
  assert.equal(JSON.stringify(c.SFX), dataBefore, 'effect data is unchanged');
  const gainsBefore = c.Au.ctx.gains.length;
  c.playSfx('missing-effect');
  assert.equal(c.Au.ctx.gains.length, gainsBefore, 'unknown effects remain harmless');
});

test('mute silences playing BGM and effects immediately, then restores a remembered 30 percent level', () => {
  const e = environment(), { c } = e;
  c.auSetVolume(.3);
  c.bgmUpdate();
  c.playSfx('coin');
  const sources = c.Au.ctx.sources.length;
  c.auToggle();
  assert.equal(c.Au.muted, true);
  assert.equal(c.Au.gain.gain.value, 0, 'scheduled sounds are silenced through their common output');
  assert.equal(c.Au.masterVolume, .3, 'muting keeps slider value');
  assert.equal(e.values.get('eco_volume'), '0.3');
  assert.equal(e.values.get('eco_mute'), '1');
  c.playSfx('coin');
  assert.equal(c.Au.ctx.sources.length, sources, 'muted effects are not scheduled');
  c.auToggle();
  assert.equal(c.Au.muted, false);
  assert.equal(c.Au.masterVolume, .3);
  closeTo(c.Au.gain.gain.value, .55 * .3, 'unmuted output returns to 30 percent');
  assert.equal(e.values.get('eco_mute'), '0');
  assert.ok(c.Au.ctx.sources.length > sources, 'existing BGM restart on unmute is retained');
});

test('moving areas and switching to battle, tower, or farm music retain the master setting', () => {
  const { c } = environment();
  c.auSetVolume(.3);
  for (const [patch, expected] of [
    [{ themeId: 'forest', gauge: 0 }, 'forest_dirty'],
    [{ themeId: 'river', gauge: 0 }, 'river_dirty'],
    [{ themeId: 'river', gauge: 100 }, 'river'],
    [{ themeId: 'ocean', gauge: 0, cleared: ['ocean'] }, 'ocean'],
  ]) {
    Object.assign(c.S, patch); c.bgmUpdate();
    assert.equal(c.Au.cur, expected);
    closeTo(c.Au.gain.gain.value, .55 * .3, expected);
    assert.ok(c.Au.voice.connections.includes(c.Au.gain));
  }
  c.B = {}; c.bgmUpdate(); assert.equal(c.Au.cur, 'battle');
  c.Tw.on = true; c.bgmUpdate(); assert.equal(c.Au.cur, 'tower');
  c.Tw.on = false; c.B = null; c.S.modal = 'farm'; c.bgmUpdate(); assert.equal(c.Au.cur, 'farm');
  closeTo(c.Au.gain.gain.value, .55 * .3, 'special music shares master setting');
  c.auToggle();
  c.S.modal = null; c.S.themeId = 'city'; c.S.cleared = []; c.bgmUpdate();
  assert.equal(c.Au.cur, 'city_dirty');
  assert.equal(c.Au.gain.gain.value, 0, 'area transition stays muted');
});

test('volume and mute survive reload independently without changing existing save keys', () => {
  const save = '{"themeId":"river","level":8}';
  const values = new Map([['echo:student-save', save], ['eco_mute', '1']]);
  const e = environment({ values });
  assert.equal(e.c.Au.muted, true, 'existing mute setting is honored');
  e.c.auSetVolume(.3);
  e.c.auInit();
  assert.equal(e.c.Au.gain.gain.value, 0, 'volume adjustment while muted keeps output silent');
  const reloaded = environment({ values });
  assert.equal(reloaded.c.Au.masterVolume, .3);
  assert.equal(reloaded.c.Au.muted, true);
  reloaded.c.auToggle();
  closeTo(reloaded.c.Au.gain.gain.value, .55 * .3, 'reloaded muted setting restores remembered volume');
  const onReload = environment({ values });
  assert.equal(onReload.c.Au.masterVolume, .3);
  assert.equal(onReload.c.Au.muted, false);
  assert.equal(values.get('echo:student-save'), save);
  assert.ok([...e.writes, ...reloaded.writes].every(([key]) => key === 'eco_volume' || key === 'eco_mute'));
});

test('zero and full volume persist and do not act as the mute toggle', () => {
  const e = environment(), { c } = e;
  c.auInit();
  c.auSetVolume(0);
  assert.equal(c.Au.masterVolume, 0);
  assert.equal(c.Au.muted, false);
  assert.equal(c.Au.gain.gain.value, 0);
  assert.equal(environment({ values: e.values }).c.Au.masterVolume, 0, 'stored zero is not replaced by default');
  c.auToggle(); c.auToggle();
  assert.equal(c.Au.masterVolume, 0);
  assert.equal(c.Au.gain.gain.value, 0);
  c.auSetVolume(1);
  assert.equal(c.Au.gain.gain.value, .55);
  assert.equal(environment({ values: e.values }).c.Au.masterVolume, 1);
  c.auSetVolume(-2); assert.equal(c.Au.masterVolume, 0);
  c.auSetVolume(2); assert.equal(c.Au.masterVolume, 1);
  c.auSetVolume(.6);
  for (const invalid of [NaN, Infinity, -Infinity]) {
    c.auSetVolume(invalid);
    assert.equal(c.Au.masterVolume, .6, 'non-finite changes do not corrupt current volume');
    closeTo(c.Au.gain.gain.value, .55 * .6, 'output stays finite');
  }
});

test('malformed saved volumes fall back safely and valid saved values take priority', () => {
  for (const value of ['', ' ', 'NaN', 'Infinity', '-Infinity', '-.1', '1.1', 'null', '{}', 'loud']) {
    const { c } = environment({ values: new Map([['eco_volume', value], ['eco_mute', '1']]) });
    assert.equal(c.Au.masterVolume, .8, `invalid stored volume ${JSON.stringify(value)}`);
    assert.equal(c.Au.muted, true, 'invalid volume does not erase stored mute');
  }
  for (const value of ['0', '0.3', '1']) {
    const { c } = environment({ values: new Map([['eco_volume', value], ['eco_mute', '0']]) });
    assert.equal(c.Au.masterVolume, Number(value));
    assert.equal(c.Au.muted, false);
  }
});

test('blocked storage and unsupported audio do not break the settings or gameplay audio functions', () => {
  for (const storage of ['throws', 'getter-throws']) {
    const { c } = environment({ storage });
    assert.equal(c.Au.masterVolume, .8);
    assert.doesNotThrow(() => { c.auSetVolume(.3); c.bgmUpdate(); c.auToggle(); c.auToggle(); c.playSfx('coin'); });
    assert.equal(c.Au.masterVolume, .3);
    closeTo(c.Au.gain.gain.value, .55 * .3, 'blocked storage keeps session setting');
  }
  for (const audio of [false, 'throws']) {
    const { c } = environment({ audio });
    assert.doesNotThrow(() => { c.auSetVolume(.3); c.auToggle(); c.auToggle(); c.auResume(); c.bgmUpdate(); c.playSfx('coin'); });
    assert.equal(c.Au.ctx, null);
    assert.equal(c.Au.masterVolume, .3);
    assert.equal(c.Au.muted, false);
  }
});

test('UI refresh observes updated volume and mute state', () => {
  const e = environment(), { c } = e;
  c.auSetVolume(.3);
  assert.deepEqual(e.uiStates.at(-1), { volume: .3, muted: false });
  c.auToggle();
  assert.deepEqual(e.uiStates.at(-1), { volume: .3, muted: true });
  c.auToggle();
  assert.deepEqual(e.uiStates.at(-1), { volume: .3, muted: false });
  delete c.ecoSoundSettings;
  assert.doesNotThrow(() => c.auRefreshSettings(), 'audio remains usable before the settings UI loads');
});
