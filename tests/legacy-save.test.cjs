// Real Save/migrate/quickLoad code in isolated memory: never accesses a student's browser storage.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const fixture = name => JSON.parse(read('tests/fixtures/legacy-save/' + name + '.json'));

function game() {
  const storage = new Map(), writes = [], removals = [], logs = [], timers = [];
  const controls = { writeDenied: false, readDenied: false };
  const listeners = new Map();
  const context = {
    console: { log(...args) { logs.push(['log', ...args]); }, warn(...args) { logs.push(['warn', ...args]); }, error(...args) { logs.push(['error', ...args]); } },
    Math: Object.create(Math), Date, Map, Set, Uint8Array, performance: { now: () => 0 }, navigator: {},
    document: { getElementById: () => null, querySelectorAll: () => [], querySelector: () => null, addEventListener() {} },
    localStorage: {
      getItem(key) { if (controls.readDenied) throw Error('Storage unavailable'); return storage.get(key) ?? null; },
      setItem(key, value) { if (controls.writeDenied) throw Error('Quota exceeded'); writes.push([key, String(value)]); storage.set(key, String(value)); },
      removeItem(key) { if (controls.writeDenied) throw Error('Quota exceeded'); removals.push(key); storage.delete(key); }
    },
    addEventListener(kind, listener) { listeners.set(kind, listener); },
    setTimeout(callback) { timers.push(callback); return timers.length; }, clearTimeout() {}, setInterval() { return 1; }, clearInterval() {},
    requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, Image: class {}, SPRITES: {},
    ecoAssetUrl: value => value
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['gear-data', 'npc-data', 'map-utils', 'theme-data', 'learning-data', 'equipment-ui', 'ecotech-exploration', 'ecotech', 'tower-elites', 'learning-ui', 'animal-care']) {
    vm.runInContext(read('js/' + file + '.js'), context, { filename: file + '.js' });
  }
  const source = read('js/game.js').replace(/\r\n/g, '\n');
  const startup = source.lastIndexOf('try {\n  S=newState();');
  assert.notEqual(startup, -1, 'isolated harness must exclude only the actual boot block');
  vm.runInContext(source.slice(0, startup), context, { filename: 'game.js' });
  context.S = context.newState();
  context.applyTheme('forest');
  const ui = { rendered: 0, toasts: [] };
  context.render = () => { ui.rendered++; };
  context.toast = message => { ui.toasts.push(message); };
  return { c: context, storage, writes, removals, logs, timers, controls, listeners, ui };
}

const studentFields = ['code', 'name', 'petKey', 'lv', 'exp', 'gold', 'themeId', 'gauge', 'hpCur', 'spCur', 'grade',
  'hair', 'face', 'outfit', 'skin', 'haircol', 'petStage', 'day', 'water', 'wellDay', 'canLv', 'seeds', 'produce',
  'potions', 'tickets', 'cleared', 'owned', 'gear', 'crafted', 'mats', 'dex', 'npcDone', 'duelWon', 'shadowWon',
  'monIdx', 'battleDone', 'clues', 'boxOpen', 'gatherDone', 'gboard', 'farm', 'tower', 'ecoTechUnlocked',
  'ecoTechSites', 'ecoTechFindings', 'ecoTechQuests', 'learning', 'arcadeRecords', 'futureStudentField'];
function retained(before, after, label) {
  if (Array.isArray(before)) {
    assert.ok(Array.isArray(after), label + ' remains a list');
    assert.equal(after.length, before.length, label + ' list length');
    before.forEach((value, index) => retained(value, after[index], label + '[' + index + ']'));
  } else if (before && typeof before === 'object') {
    assert.ok(after && typeof after === 'object', label + ' remains an object');
    for (const key of Object.keys(before)) retained(before[key], after[key], label + '.' + key);
  } else assert.equal(after, before, label);
}
function preserves(before, after) {
  for (const key of studentFields) retained(before[key], after[key], 'student field retained: ' + key);
  for (const theme of Object.keys(before.progress)) {
    for (const key of ['gauge', 'monIdx', 'mats', 'clues', 'crafted', 'dex', 'npcDone', 'futureProgress', 'futureMap']) {
      if (key in before.progress[theme]) assert.deepEqual(plain(after.progress[theme][key]), plain(before.progress[theme][key]), theme + ': ' + key);
    }
  }
}

for (const name of ['last-week', 'september-25']) {
  test(name + ' historical student progress survives a non-mutating, idempotent migration', () => {
    const { c } = game(), before = fixture(name), original = JSON.stringify(before);
    const current = c.migrate(before);
    assert.equal(JSON.stringify(before), original, 'caller-owned legacy data is untouched');
    assert.equal(current.saveVersion, c.SAVE_VERSION);
    assert.equal(current.v, c.SAVE_VERSION);
    preserves(before, current);
    assert.notEqual(current, before);
    assert.deepEqual(plain(c.migrate(current)), plain(current), 'repeat migration has no further changes');
    current.farm.plots[0].stage = 99;
    assert.equal(before.farm.plots[0].stage, 2, 'nested data was cloned');
  });
}

test('versionless earliest save gets complete defaults without discarding old IDs or custom fields', () => {
  const { c } = game();
  const before = { code: 'EC1000', name: '오래된학생', sex: 'f', petKey: 'earth', lv: 4, exp: 251, gold: 88,
    canLv: 2, gear: { weapon: 'retired_weapon' }, owned: ['retired_weapon', 'w1'], futureStudentField: { earned: 12 } };
  const current = c.migrate(before);
  assert.equal(current.hair, 'long');
  assert.equal(current.saveVersion, c.SAVE_VERSION);
  assert.equal(current.v, c.SAVE_VERSION);
  assert.equal(current.code, before.code); assert.equal(current.lv, 4); assert.equal(current.exp, 251);
  assert.equal(current.gear.weapon, 'retired_weapon');
  assert.deepEqual(plain(current.owned), before.owned);
  for (const slot of ['armor', 'helm', 'shoes']) assert.equal(current.gear[slot], null);
  assert.equal(current.farm.plots.length, c.PLOTS); assert.equal(current.farm.pens.length, c.PENS);
  assert.deepEqual(plain(current.tower), { best: 0, bestTime: 0, runs: 0, history: [] });
  assert.deepEqual(plain(current.ecoTechUnlocked), []); assert.deepEqual(plain(current.ecoTechQuests), {});
  assert.deepEqual(plain(current.futureStudentField), before.futureStudentField);
});

test('missing nested fields are merged only for student-state defaults', () => {
  const { c } = game();
  const before = { v: 8, code: 'EC2000', name: '중첩학생', petKey: 'earth',
    farm: { plots: [{ seed: 'rose', stage: 2, customPlant: true }], customFarm: 7 },
    tower: { best: 7, customTower: 9 }, gear: { armor: 'a2' },
    progress: { forest: { gauge: 95, monIdx: 4, mats: { leaf: 2 }, customProgress: 8 } },
    learning: { version: 1, regions: { forest: { answers: { 'forest-1': 1 }, customLearning: 6 } } },
    ecoTechQuests: { soil: { accepted: true, customQuest: 5 } },
    MON_HP_SCALE: 999, THEMES: { forest: { monsters: [{ hp: 999999 }] } } };
  const statics = [c.MON_HP_SCALE, JSON.stringify(c.THEMES), JSON.stringify(c.LEVELS), JSON.stringify(c.LEARNING)];
  const current = c.migrate(before);
  assert.equal(current.farm.plots[0].seed, 'rose'); assert.equal(current.farm.plots[0].stage, 2);
  assert.equal(current.farm.plots[0].wet, false); assert.equal(current.farm.plots[0].customPlant, true);
  assert.equal(current.farm.plots.length, c.PLOTS); assert.equal(current.farm.pens.length, c.PENS);
  assert.equal(current.farm.customFarm, 7);
  assert.equal(current.tower.best, 7); assert.equal(current.tower.bestTime, 0); assert.equal(current.tower.runs, 0);
  assert.deepEqual(plain(current.tower.history), []); assert.equal(current.tower.customTower, 9);
  assert.equal(current.gear.armor, 'a2'); assert.equal(current.gear.weapon, null);
  assert.equal(current.progress.forest.gauge, 95); assert.equal(current.progress.forest.monIdx, 4);
  assert.equal(current.progress.forest.customProgress, 8);
  for (const key of c.THEME_FIELDS) assert.notEqual(current.progress.forest[key], undefined, 'theme default: ' + key);
  const learned = current.learning.regions.forest;
  assert.deepEqual(plain(learned.answers), { 'forest-1': 1 });
  assert.deepEqual(plain(learned.cases), {}); assert.deepEqual(plain(learned.notes), {}); assert.equal(learned.page, 0);
  assert.equal(learned.customLearning, 6);
  assert.deepEqual(plain(current.ecoTechQuests.soil.surveyed), []); assert.equal(current.ecoTechQuests.soil.orderDone, false);
  assert.equal(current.ecoTechQuests.soil.customQuest, 5);
  c.S = current;
  assert.deepEqual([c.MON_HP_SCALE, JSON.stringify(c.THEMES), JSON.stringify(c.LEVELS), JSON.stringify(c.LEARNING)], statics,
    'saved static-looking fields never overwrite live game tables');
});

test('legacy water fallback depends on the saved can level, never the active student', () => {
  const { c } = game();
  c.S.canLv = 0;
  const bigger = c.migrate({ code: 'EC3000', name: '물학생', petKey: 'earth', canLv: 2 });
  assert.equal(bigger.water, c.CANS[2].cap);
  c.S.canLv = 2;
  const smaller = c.migrate({ code: 'EC3001', name: '다른학생', petKey: 'earth', canLv: 0 });
  assert.equal(smaller.water, c.CANS[0].cap);
});

test('Save.load is read-only and can read existing students when writing is unavailable', () => {
  const { c, storage, controls, writes, removals } = game(), before = fixture('last-week');
  const raw = JSON.stringify(before);
  storage.set('echo:' + before.code, raw); storage.set('echo:__index', JSON.stringify([before.code])); storage.set('echo:__last', before.code);
  const snapshot = Array.from(storage);
  controls.writeDenied = true;
  const current = c.Save.load('  ' + before.code.toLowerCase() + '  ');
  assert.ok(current, 'a full/read-only browser store must not block existing saves');
  preserves(before, current);
  assert.equal(c.Save.last(), before.code);
  assert.deepEqual(Array.from(c.Save.index()), [before.code]);
  assert.deepEqual(Array.from(storage), snapshot);
  assert.equal(writes.length, 0); assert.equal(removals.length, 0);
});

test('failed malformed or future-version loads leave the original slot and index unchanged', () => {
  for (const raw of ['{ broken', 'null', '[]', '42', '"bad"',
    JSON.stringify({ saveVersion: 999, v: 8, code: 'EC4000', name: '미래학생' }),
    JSON.stringify({ v: 999, code: 'EC4000', name: '미래학생' })]) {
    const { c, storage, writes, removals, logs } = game();
    storage.set('echo:EC4000', raw); storage.set('echo:__index', '["EC4000"]'); storage.set('echo:__last', 'EC4000');
    const snapshot = Array.from(storage);
    assert.equal(c.Save.load('EC4000'), null, 'unsafe content must not load: ' + raw);
    assert.deepEqual(Array.from(storage), snapshot);
    assert.equal(writes.length, 0); assert.equal(removals.length, 0);
    assert.ok(logs.some(entry => entry[0] === 'error'), 'technical failure is logged');
  }
});

test('latest saves round-trip without migration drift and keep existing echo index/last keys', () => {
  const { c, storage } = game();
  c.S = c.migrate(fixture('last-week'));
  const expected = plain(c.S);
  assert.equal(c.Save.save(), 'disk');
  assert.equal(c.Save.P, 'echo:'); assert.equal(c.Save.IDX, 'echo:__index');
  assert.equal(c.Save.last(), expected.code);
  assert.deepEqual(Array.from(c.Save.index()), [expected.code]);
  assert.deepEqual(plain(c.Save.load(expected.code)), expected);
  c.Save.save();
  assert.deepEqual(Array.from(c.Save.index()), [expected.code], 'no duplicate index entries');
  assert.equal(JSON.parse(storage.get('echo:' + expected.code)).saveVersion, c.SAVE_VERSION);
});

test('new student saves always carry the current explicit save version', () => {
  const { c, storage } = game();
  c.S = c.newState(); c.S.code = 'EC5000'; c.S.name = '새학생'; c.S.petKey = 'earth';
  assert.equal(c.Save.save(), 'disk');
  const saved = JSON.parse(storage.get('echo:EC5000'));
  assert.equal(saved.saveVersion, c.SAVE_VERSION); assert.equal(saved.v, c.SAVE_VERSION);
  const loaded = c.Save.load('EC5000');
  assert.equal(loaded.name, '새학생'); assert.equal(loaded.code, 'EC5000'); assert.equal(loaded.lv, 1); assert.equal(loaded.exp, 0);
});

test('quickLoad persists a migrated slot only after successful world initialization', () => {
  const { c, storage, writes, ui } = game(), before = fixture('last-week'), raw = JSON.stringify(before);
  storage.set('echo:' + before.code, raw); storage.set('echo:__index', '["' + before.code + '"]'); storage.set('echo:__last', before.code);
  c.Save.load(before.code);
  assert.equal(storage.get('echo:' + before.code), raw, 'preview load does not upgrade the disk');
  assert.equal(writes.length, 0);
  let originalAtRender = false;
  c.render = () => { ui.rendered++; originalAtRender = storage.get('echo:' + before.code) === raw; };
  c.quickLoad(before.code);
  assert.equal(ui.rendered, 1); assert.equal(originalAtRender, true, 'render runs before save overwrite');
  assert.equal(c.S.scene, 'world'); assert.equal(c.S.code, before.code);
  preserves(before, c.S);
  const upgraded = JSON.parse(storage.get('echo:' + before.code));
  assert.equal(upgraded.saveVersion, c.SAVE_VERSION);
  preserves(before, upgraded);
  assert.deepEqual(Array.from(c.Save.index()), [before.code]); assert.equal(c.Save.last(), before.code);
});

test('quickLoad initialization failure restores the active state and leaves every student slot unchanged', () => {
  const { c, storage, logs, ui } = game(), before = fixture('last-week'), raw = JSON.stringify(before);
  storage.set('echo:' + before.code, raw); storage.set('echo:__index', '["' + before.code + '"]'); storage.set('echo:__last', before.code);
  c.S.name = '현재학생'; c.S.code = 'EC6000';
  const active = c.S, snapshot = Array.from(storage);
  c.render = () => { throw Error('Simulated first render failure'); };
  assert.doesNotThrow(() => c.quickLoad(before.code));
  assert.equal(c.S, active, 'failed resume does not replace the active student');
  assert.deepEqual(Array.from(storage), snapshot);
  assert.ok(logs.some(entry => entry[0] === 'error'));
  assert.ok(ui.toasts.some(message => String(message).includes('저장 데이터를 불러오지 못했어요')));
});

test('storage write failure after migration keeps the original disk and a playable loaded student', () => {
  const { c, storage, controls } = game(), before = fixture('last-week'), raw = JSON.stringify(before);
  storage.set('echo:' + before.code, raw); storage.set('echo:__index', '["' + before.code + '"]'); storage.set('echo:__last', before.code);
  controls.writeDenied = true;
  assert.doesNotThrow(() => c.quickLoad(before.code));
  assert.equal(c.S.scene, 'world'); preserves(before, c.S);
  assert.equal(storage.get('echo:' + before.code), raw);
  assert.ok(c.Save.mem && c.Save.mem[before.code], 'existing memory fallback retains the upgraded student');
});

test('an unavailable storage API remains safe and does not initialize over a student slot', () => {
  const { c, storage, controls } = game(), before = fixture('last-week');
  storage.set('echo:' + before.code, JSON.stringify(before));
  const snapshot = Array.from(storage), active = c.S;
  controls.readDenied = true; controls.writeDenied = true;
  assert.doesNotThrow(() => c.quickLoad(before.code));
  assert.equal(c.S, active); assert.deepEqual(Array.from(storage), snapshot);
});

test('student sound preference keys remain outside migration and save data', () => {
  const { c, storage } = game();
  storage.set('eco_mute', '1'); storage.set('eco_volume', '0.3');
  c.S = c.migrate(fixture('last-week')); c.Save.save();
  assert.equal(storage.get('eco_mute'), '1'); assert.equal(storage.get('eco_volume'), '0.3');
  const saved = JSON.parse(storage.get('echo:' + c.S.code));
  assert.equal(saved.masterVolume, undefined); assert.equal(saved.muted, undefined);
});

test('an interrupted migration never writes a partially upgraded legacy save', () => {
  const { c, storage, writes, logs } = game(), before = fixture('last-week'), raw = JSON.stringify(before);
  storage.set('echo:' + before.code, raw);
  const active = c.S;
  c.SAVE_MIGRATIONS[8] = value => { value.lv = 1; throw Error('Injected migration failure'); };
  assert.equal(c.quickLoad(before.code), false);
  assert.equal(c.S, active);
  assert.equal(storage.get('echo:' + before.code), raw);
  assert.equal(writes.length, 0);
  assert.ok(logs.some(entry => entry[0] === 'error'));
});

test('a save claiming a different EC slot is safely rejected, without code reassignment', () => {
  const { c, storage, writes } = game(), before = fixture('last-week');
  storage.set('echo:EC9999', JSON.stringify(before));
  const snapshot = Array.from(storage);
  assert.equal(c.Save.load('EC9999'), null);
  assert.deepEqual(Array.from(storage), snapshot);
  assert.equal(writes.length, 0);
});

test('old and newly created students use identical live monster, Tower, care and puzzle rules', () => {
  const { c } = game(), previous = c.migrate(fixture('last-week'));
  previous.CARE_SECONDS = 999; previous.CARE_STAGES = [{ needs: [] }]; previous.MT_N = 100;
  previous.TOWER_ELITES = [{ hp: 9999999 }]; previous.LEVELS = [{ lv: 9, atk: 9999999 }];
  const fresh = c.newState();
  for (const key of ['lv', 'exp', 'petKey', 'gear']) fresh[key] = plain(previous[key]);
  const snapshot = () => {
    c.Math.random = () => .25;
    const board = c.mtCreatePlayableBoard();
    return {
      stats: plain(c.baseStats()), monster: plain(c.monStats(c.THEMES.river.monsters[0])),
      eliteIds: Array.from(vm.runInContext('TOWER_ELITES.map(item=>item.id)', c)),
      careSeconds: c.CARE_SECONDS, careMotion: c.CARE_MOTION_SECONDS,
      careCounts: Array.from(c.CARE_STAGES, stage => c.careSequence(stage, null).length),
      puzzleSize: c.MT_N, validMoves: plain(c.mtGetValidMoves(board)),
      learning: JSON.stringify(c.LEARNING), themes: JSON.stringify(c.THEMES)
    };
  };
  c.S = fresh; const fromFresh = snapshot();
  c.S = previous; const fromLegacy = snapshot();
  assert.deepEqual(fromLegacy, fromFresh);
  assert.deepEqual(fromLegacy.careCounts, [6, 6, 6, 7], 'latest +3 care events apply to resumed students');
  assert.equal(fromLegacy.puzzleSize, 6);
  assert.ok(fromLegacy.validMoves.length > 0);
  assert.ok(fromLegacy.eliteIds.includes('nightglare')); assert.ok(fromLegacy.eliteIds.includes('glasswall'));
});

test('mid-onboarding students resume their saved step while retaining their assigned EC code', () => {
  for (const step of ['look', 'story', 'pet']) {
    const { c, storage } = game(), interrupted = c.newState();
    Object.assign(interrupted, { v: 8, scene: step, saveVersion: undefined, code: 'EC7010', name: '첫학생', petKey: null, outfit: 'robe' });
    storage.set('echo:' + interrupted.code, JSON.stringify(interrupted));
    assert.equal(c.quickLoad(interrupted.code), true);
    assert.equal(c.S.code, interrupted.code); assert.equal(c.S.scene, step); assert.equal(c.S.outfit, 'robe');
    const upgraded = JSON.parse(storage.get('echo:' + interrupted.code));
    assert.equal(upgraded.code, interrupted.code); assert.equal(upgraded.saveVersion, c.SAVE_VERSION);
  }
});

test('resubmitting a resumed name screen retains the existing assigned EC code', () => {
  const { c, storage } = game();
  c.S = c.newState(); c.S.scene = 'name'; c.S.code = 'EC7020';
  c.document.getElementById = id => id === 'nameInput' ? { value: '계속학생', focus() {} } : null;
  c.makeCode = () => { throw Error('Existing student must never be assigned a replacement code'); };
  assert.doesNotThrow(() => c.submitName());
  assert.equal(c.S.code, 'EC7020'); assert.equal(c.S.name, '계속학생'); assert.equal(c.S.scene, 'look');
  assert.equal(JSON.parse(storage.get('echo:EC7020')).code, 'EC7020');
});

test('legacy completed advanced quizzes infer previously earned rewards before adding defaults', () => {
  const { c } = game();
  const old = { v: 8, code: 'EC7030', name: '퀴즈학생', petKey: 'earth', themeId: 'forest',
    advDone: true, advIdx: 0, advPicked: 0, quizPicked: 0, quizHint: true, gauge: 75, gold: 190, exp: 73,
    progress: { river: { advDone: true, advIdx: 0, advPicked: 0, quizPicked: 0, quizHint: true, gauge: 81 } } };
  const raw = JSON.stringify(old), current = c.migrate(old);
  assert.equal(JSON.stringify(old), raw, 'inference does not mutate the input');
  assert.deepEqual(plain(current.advScored), [0, 1, 2]);
  assert.deepEqual(plain(current.progress.river.advScored), [0, 1, 2]);
  for (const region of [current, current.progress.river]) {
    assert.equal(region.quizPicked, null); assert.equal(region.advPicked, null); assert.equal(region.quizHint, false);
    assert.equal(region.quizContentVersion, 39);
  }
  assert.equal(current.gold, 190); assert.equal(current.exp, 73); assert.equal(current.gauge, 75);
  assert.equal(current.progress.river.gauge, 81);
});

test('legacy partial advanced quizzes infer a correct current answer before invalidating old selectors', () => {
  const { c } = game();
  const old = { v: 8, code: 'EC7040', name: '이어퀴즈', petKey: 'earth', themeId: 'forest',
    advIdx: 1, advPicked: c.THEMES.forest.quizAdv[1].a, quizPicked: 1, quizHint: true,
    progress: { river: { advIdx: 1, advPicked: c.THEMES.river.quizAdv[1].a, quizPicked: 1, quizHint: true } } };
  const current = c.migrate(old);
  assert.deepEqual(plain(current.advScored), [0, 1]);
  assert.deepEqual(plain(current.progress.river.advScored), [0, 1]);
  for (const region of [current, current.progress.river]) {
    assert.equal(region.quizPicked, null); assert.equal(region.advPicked, null); assert.equal(region.quizHint, false);
  }
  assert.deepEqual(plain(c.migrate(current)), plain(current), 'reward inference remains stable on subsequent loads');
});

test('unknown legacy materials remain saved but do not crash bag, field, crafting or shop rendering', () => {
  const { c, storage } = game();
  c.S = c.migrate(fixture('last-week')); c.applyTheme(c.S.themeId);
  const known = Object.keys(c.CUR.mats)[0]; c.S.mats[known] = 4;
  const before = plain(c.S), field = { innerHTML: '' };
  c.document.getElementById = id => id === 'finfo' ? field : null;
  for (const renderer of ['mBag', 'mCraft', 'mShop']) {
    let html;
    assert.doesNotThrow(() => { html = c[renderer](); }, renderer + ' with unknown saved material IDs');
    assert.ok(html.includes(c.CUR.mats[known].name), renderer + ' still displays recognized material');
    assert.ok(!html.includes('future_mat')); assert.ok(!html.includes('mat_legacy'));
    assert.ok(!html.includes('undefined')); assert.ok(!html.includes('NaN'));
  }
  assert.doesNotThrow(() => c.fPaintHud());
  assert.ok(field.innerHTML.includes(c.CUR.mats[known].ico));
  assert.ok(!field.innerHTML.includes('undefined'));
  assert.deepEqual(plain(c.S), before, 'presentation filtering never deletes saved inventory');
  c.Save.save();
  const saved = JSON.parse(storage.get('echo:' + c.S.code));
  assert.equal(saved.mats.future_mat, 3); assert.equal(saved.mats.mat_legacy, 6);
  assert.equal(saved.mats[known], 4); assert.ok(saved.owned.includes('retired_gear'));
  assert.ok(saved.ecoTechUnlocked.includes('old_technology'));
});

test('attempting to sell an unknown legacy material does not spend inventory or alter gold', () => {
  const { c } = game();
  c.S = c.migrate(fixture('last-week')); c.applyTheme(c.S.themeId);
  const before = plain(c.S);
  assert.doesNotThrow(() => c.sellMat('future_mat'));
  assert.doesNotThrow(() => c.sellMat('mat_legacy'));
  assert.deepEqual(plain(c.S), before);
});

test('a partial failed world mount cancels its loop, rebuilds the previous screen and restores its position', () => {
  const { c, storage } = game(), legacy = fixture('last-week');
  storage.set('echo:' + legacy.code, JSON.stringify(legacy));
  const diskBefore = Array.from(storage);
  c.S.name = '기존화면'; c.S.code = 'EC7050'; c.S.scene = 'world';
  const previous = c.S, screen = { innerHTML: 'ORIGINAL' }, cancelled = [];
  c.document.getElementById = id => id === 'screen' ? screen : null;
  const expectedWorld = { px: 111, py: 222, petX: 77, petY: 228, trail: [{ x: 111, y: 222 }] };
  Object.assign(c.Wd, plain(expectedWorld));
  c.cancelAnimationFrame = handle => cancelled.push(handle);
  let rendered = 0;
  c.render = () => {
    if (++rendered === 1) {
      screen.innerHTML = 'PARTIAL'; c.Wd.raf = 99; c.Wd.keys.r = true;
      throw Error('Injected partially mounted world');
    }
    assert.equal(c.S, previous);
    assert.equal(c.CUR.id, 'forest');
    assert.equal(screen.innerHTML, '', 'partial target world DOM is removed before rebuilding');
    screen.innerHTML = 'RESTORED';
  };
  assert.equal(c.quickLoad(legacy.code), false);
  assert.equal(rendered, 2); assert.equal(screen.innerHTML, 'RESTORED');
  assert.deepEqual(cancelled, [99]); assert.equal(c.Wd.raf, null);
  for (const key of Object.keys(expectedWorld)) assert.deepEqual(plain(c.Wd[key]), expectedWorld[key], 'restored position: ' + key);
  assert.ok(Object.values(c.Wd.keys).every(value => value === false));
  assert.equal(c.S, previous); assert.deepEqual(Array.from(storage), diskBefore);
});

test('unknown regional metadata survives actual forest/river travel while normal progress updates', () => {
  const { c, storage } = game(), legacy = fixture('last-week');
  legacy.themeId = 'forest';
  legacy.progress.river.futureTrip = { earned: 19, memo: 'river metadata' };
  c.S = c.migrate(legacy); c.applyTheme('forest');
  const forestMetadata = plain(c.S.progress.forest.futureProgress);
  const riverMetadata = plain(c.S.progress.river.futureTrip);
  c.S.gauge = 92; c.S.monIdx = 4; c.S.mats = { forest_legacy: 9 };
  c.enterTheme('river');
  assert.equal(c.S.themeId, 'river'); assert.equal(c.S.gauge, 72); assert.equal(c.S.monIdx, 3);
  assert.equal(c.S.progress.forest.gauge, 92); assert.equal(c.S.progress.forest.monIdx, 4);
  assert.deepEqual(plain(c.S.progress.forest.futureProgress), forestMetadata);
  c.S.gauge = 78; c.S.monIdx = 4; c.S.mats.river_legacy = 7;
  c.enterTheme('forest');
  assert.equal(c.S.themeId, 'forest'); assert.equal(c.S.gauge, 92); assert.equal(c.S.monIdx, 4);
  assert.deepEqual(plain(c.S.mats), { forest_legacy: 9 });
  assert.equal(c.S.progress.river.gauge, 78); assert.equal(c.S.progress.river.monIdx, 4);
  assert.equal(c.S.progress.river.mats.river_legacy, 7);
  assert.deepEqual(plain(c.S.progress.river.futureTrip), riverMetadata);
  assert.deepEqual(plain(c.S.progress.forest.futureProgress), forestMetadata);
  c.S.gauge = 99; c.S.monIdx = 5; c.stashTheme();
  assert.equal(c.Save.save(), 'disk');
  const reloaded = c.Save.load(c.S.code);
  assert.equal(reloaded.gauge, 99); assert.equal(reloaded.monIdx, 5);
  assert.equal(reloaded.progress.forest.gauge, 99); assert.equal(reloaded.progress.forest.monIdx, 5);
  assert.deepEqual(plain(reloaded.progress.forest.futureProgress), forestMetadata);
  assert.deepEqual(plain(reloaded.progress.river.futureTrip), riverMetadata);
  assert.equal(reloaded.progress.river.mats.river_legacy, 7);
  assert.deepEqual(plain(reloaded.progress.future_region), legacy.progress.future_region);
  assert.ok(storage.has('echo:' + legacy.code));
});

test('null known regional progress becomes complete safe defaults while unknown regional values remain untouched', () => {
  const { c } = game();
  const old = { v: 8, code: 'EC7060', name: '빈지역학생', petKey: 'earth', themeId: 'forest', gauge: 37,
    cleared: ['forest'], progress: { forest: null, river: null, future_region: null } };
  const current = c.migrate(old), base = c.newState();
  for (const id of ['forest', 'river']) {
    assert.ok(current.progress[id] && typeof current.progress[id] === 'object');
    for (const key of c.THEME_FIELDS) assert.deepEqual(plain(current.progress[id][key]), plain(base[key]), id + ' default: ' + key);
  }
  assert.equal(current.progress.future_region, null);
  assert.equal(old.progress.forest, null); assert.equal(old.progress.river, null);
  assert.equal(current.gauge, 37, 'global current-region progress is retained');
  c.S = current; c.applyTheme('forest');
  assert.doesNotThrow(() => c.enterTheme('river'));
  assert.equal(c.S.gauge, 0); assert.equal(c.S.themeId, 'river');
  assert.doesNotThrow(() => c.enterTheme('forest'));
  assert.equal(c.S.gauge, 37); assert.equal(c.S.themeId, 'forest');
});
