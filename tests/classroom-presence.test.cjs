// Run: node tests/classroom-presence.test.cjs. No browser, dependencies or live Supabase needed.
const assert = require('node:assert/strict');
const { browser, createHub, fixture, flush } = require('./helpers/classroom-realtime.cjs');

const settle = async () => { await flush(); await flush(); };
function peer(id = 'legacy-peer', theme = 'forest') {
  return { playerId: id, nickname: '다른 학생', theme, joinedAt: 'synthetic-session',
    level: 12, spirit: '조약돌 정령', equipment: '잎사귀 검', progress: '푸른 숲 1단계',
    towerBestFloor: 18, towerBestTime: 462 };
}
function assertNoRemote(tab) {
  assert.equal(Object.keys(tab.context.ecoRemotePlayers.remotePlayers).length, 0, 'remote collection stays empty');
  assert.equal(tab.document.querySelectorAll('.eco-remote-player').length, 0, 'no remote actors, labels or shadows');
  assert.equal(tab.document.getElementById('ecoRemoteLayer'), null, 'no remote rendering layer');
  assert.equal(tab.frames.size, 0, 'no interpolation or movement health animation loop');
  assert.ok(tab.document.getElementById('hero'), 'the local actor remains mounted');
}
function assertQuiet(tab) {
  assert.equal(tab.hub.broadcasts.length, 0, 'all Broadcast sends, including legacy requests, stay at zero');
  const movement = tab.context.ecoMovement.getStats();
  assert.equal(movement.sent, 0); assert.equal(movement.requests, 0);
  assert.equal(movement.intervalMs, 0, 'disabled movement has no polling interval');
  assertNoRemote(tab);
}
async function leave(tab) { tab.event('pagehide'); await settle(); }

async function movementOffByDefault() {
  const tab = browser(undefined, 1, { config: false, legacyRemote: true,
    scripts: ['remote-players.js', 'movement.js'] });
  const self = { ...peer('self'), joinedAt: 'self-session' }, other = peer();
  const channel = tab.client.channel('eco-forest');
  const remote = tab.context.ecoRemotePlayers, movement = tab.context.ecoMovement;
  assert.equal(remote.enabled, false, 'remote rendering defaults off without configuration');
  remote.sync('self', 'forest', [self, other]); remote.refresh();
  movement.attach(channel, 'self', 'forest', 'self-session'); movement.ready(true); movement.members([self, other]);
  for (let i = 0; i < 40; i++) {
    tab.context.Wd.px += 10; tab.context.Wd.moving = true;
    channel.receive('world-position-request', other);
    channel.receive('world-position', { ...other, x: 500 + i, y: 600, direction: 'east', moving: true, seq: i + 1 });
    remote.receivePosition({ ...other, x: 500 + i, y: 600, direction: 'east', moving: true, seq: i + 1 });
    await tab.advance(125);
  }
  tab.context.Wd.moving = false; await tab.advance(30000);
  assertQuiet(tab);
  assert.equal(tab.timers.size, 0, 'movement and remote scripts create no timers when disabled');
  assert.equal(tab.observers, 0, 'disabled remote renderer creates no mutation observer');
  assert.equal(tab.context.Wd.px, 700, 'remote transport does not interfere with local world coordinates');
  assert.equal(tab.warnings.length, 0);
}

async function joinOnlyMountedWorld() {
  const state = fixture(); state.scene = 'title';
  const tab = browser(undefined, 1, { state, mounted: false });
  for (const scene of ['title', 'name', 'look', 'story', 'pet', 'guide', 'loading']) {
    state.scene = scene; await tab.advance(1000);
    assert.equal(tab.client.channels.length, 0, scene + ' never joins Presence');
  }
  state.scene = 'world'; await tab.advance(1000);
  assert.equal(tab.client.channels.length, 0, 'world state alone cannot join during mounting');
  tab.mountWorld(); tab.context.Wd.ready = false; await tab.advance(1000);
  assert.equal(tab.client.channels.length, 0, 'uninitialized world does not join');
  tab.context.Wd.ready = true; await tab.advance(500);
  assert.equal(tab.activeChannels.length, 1, 'the mounted, ready world joins once');
  assert.equal(tab.client.tracks.length, 1, 'the initial public summary publishes once');
  assert.equal(tab.context.ecoMultiplayer.getStats().onlinePlayers, 1);
  assertQuiet(tab); await leave(tab);
  assert.equal(tab.activeChannels.length, 0, 'pagehide removes Presence');

  const hidden = browser(undefined, 2, { hidden: true }); await hidden.advance(60000);
  assert.equal(hidden.client.channels.length, 0, 'a new hidden tab does not join');
  hidden.hidden(false); await hidden.advance(500);
  assert.equal(hidden.activeChannels.length, 1, 'first visible world joins'); await leave(hidden);

  for (const missing of ['name', 'code', 'petKey']) {
    const incomplete = fixture(3); incomplete[missing] = '';
    const tab = browser(undefined, 3, { state: incomplete }); await tab.advance(1000);
    assert.equal(tab.client.channels.length, 0, missing + ' is required before admission'); await leave(tab);
  }
}

async function admissionRetainedAcrossGameScreens() {
  const tab = browser(); await settle();
  tab.document.getElementById('worldRoot').remove(); tab.context.Wd.ready = false;
  for (const scene of ['themes', 'clear', 'cert']) {
    tab.state.scene = scene; await tab.advance(500);
    assert.equal(tab.activeChannels.length, 1, 'admitted student retains Presence in ' + scene);
  }
  tab.state.scene = 'themes';
  tab.context.navigator.onLine = false; tab.event('offline'); await tab.advance(500);
  tab.context.navigator.onLine = true; tab.event('online'); await tab.advance(500);
  assert.equal(tab.activeChannels.length, 1, 'an admitted student can reconnect from the theme menu');
  tab.state.code = 'OTHER-SYNTHETIC-STUDENT'; await tab.advance(500);
  assert.equal(tab.activeChannels.length, 0, 'a changed student identity must first mount its own world');
  tab.state.scene = 'world'; tab.mountWorld(); await tab.advance(500);
  assert.equal(tab.activeChannels.length, 1);
  for (const modal of ['battle', 'bag', 'minigame']) {
    tab.state.modal = modal; await tab.advance(500);
    assert.equal(tab.activeChannels.length, 1, modal + ' retains Presence');
  }
  for (const modal of ['cloudload', 'clouddevice']) {
    tab.state.modal = modal; await tab.advance(500);
    assert.equal(tab.activeChannels.length, 0, modal + ' is excluded from admission');
    tab.state.modal = null; await tab.advance(500);
    assert.equal(tab.activeChannels.length, 1, 'returning to a ready world can admit again');
  }
  tab.state.scene = 'title'; await tab.advance(500);
  assert.equal(tab.activeChannels.length, 0, 'returning to title clears admission');
  tab.state.scene = 'themes'; await tab.advance(500);
  assert.equal(tab.activeChannels.length, 0, 'theme screen alone cannot restore cleared admission');
  await leave(tab);
}

async function summaryCoalescing() {
  const tab = browser(); await settle();
  assert.equal(tab.context.EcoMultiplayerConfig.movementEnabled, false);
  assert.equal(tab.context.EcoMultiplayerConfig.presenceUpdateIntervalMs, 10000);
  assert.equal(tab.context.EcoMultiplayerConfig.hiddenGraceMs, 30000);
  assert.equal(tab.client.tracks.length, 1);
  tab.openRoster();
  const saveCode = tab.state.cloudCode;
  for (let i = 0; i < 18; i++) {
    tab.state.lv++;
    tab.state.tower.best = 20 + i; tab.state.tower.bestTime = 300 + i;
    await tab.advance(500);
  }
  assert.equal(tab.client.tracks.length, 1, 'nine seconds of frequent changes are coalesced');
  await tab.advance(1500);
  assert.equal(tab.client.tracks.length, 2, 'latest public summary is shared at about ten seconds');
  const published = tab.client.tracks.at(-1);
  assert.equal(published.level, tab.state.lv);
  assert.equal(published.towerBestFloor, 37); assert.equal(published.towerBestTime, 317);
  assert.equal(tab.rows[0].querySelector('.eco-online-tower').textContent, '🏰 탑 37층 · 05:17');
  await tab.advance(60000);
  assert.equal(tab.client.tracks.length, 2, 'unchanged summaries never repeat');
  for (let i = 0; i < 25; i++) {
    tab.state.tower.runs++; tab.state.tower.history.push({ floor: i, time: i });
    tab.state.tower.elapsed = i; tab.context.Wd.px++; tab.context.Wd.face = 'east';
    await tab.advance(1000);
  }
  assert.equal(tab.client.tracks.length, 2, 'tower challenge clock/history and local movement never publish');
  tab.state.tower.bestTime = 300; await tab.advance(10500);
  assert.equal(tab.client.tracks.length, 3, 'an actual best-time change is published once');
  assert.equal(tab.client.tracks.at(-1).towerBestTime, 300);
  for (const packet of tab.client.tracks) {
    for (const key of ['cloudCode', 'tower', 'history', 'runs', 'x', 'y', 'moving', 'seq']) {
      assert.ok(!(key in packet), key + ' stays outside public Presence payloads');
    }
  }
  assert.equal(tab.state.cloudCode, saveCode, 'Presence does not mutate the private save code');
  const stats = tab.context.ecoMultiplayer.getStats();
  assert.equal(stats.presenceTrackCalls, tab.client.tracks.length);
  assert.equal(stats.channelJoins, 1); assert.equal(stats.channelLeaves, 0);
  assert.equal(stats.activeChannels, 1); assert.equal(stats.movementEnabled, false);
  assert.equal(stats.sent, 0); assert.equal(stats.requests, 0);
  assertQuiet(tab); await leave(tab);
}

async function hiddenGraceAndLifecycle() {
  const tab = browser(); await settle();
  const baselineTimers = tab.timers.size, baselineListeners = tab.listenerCount;
  for (let i = 0; i < 4; i++) {
    tab.hidden(true); await tab.advance(10000); tab.hidden(false); await tab.advance(500);
    assert.equal(tab.client.channels.length, 1, 'short hidden periods do not reconnect');
  }
  const hiddenTracks = tab.client.tracks.length;
  tab.hidden(true); tab.state.lv++; await tab.advance(29500);
  assert.equal(tab.activeChannels.length, 1, 'a short hidden period retains the channel');
  assert.equal(tab.client.tracks.length, hiddenTracks, 'hidden tabs never publish metadata changes');
  await tab.advance(1000);
  assert.equal(tab.activeChannels.length, 0, 'thirty seconds hidden leaves the channel');
  await tab.advance(60000);
  assert.equal(tab.activeChannels.length, 0, 'hidden polling never rejoins');
  tab.hidden(false); await tab.advance(500);
  assert.equal(tab.activeChannels.length, 1, 'visibility return rejoins once');
  assert.equal(tab.client.channels.length, 2);
  assert.equal(tab.client.tracks.at(-1).level, tab.state.lv, 'visibility return publishes the current summary');
  assert.equal(tab.timers.size, baselineTimers, 'visibility returns to the original timer count');
  assert.equal(tab.listenerCount, baselineListeners, 'visibility events never duplicate listeners');
  assertQuiet(tab);
  await leave(tab); assert.equal(tab.activeChannels.length, 0);
  await tab.advance(60000); assert.equal(tab.activeChannels.length, 0, 'pagehide cannot accidentally reconnect');
  tab.event('pageshow'); await tab.advance(500);
  assert.equal(tab.activeChannels.length, 1, 'page cache restore joins once');
  assert.equal(tab.timers.size, baselineTimers, 'page cache restore does not add a poll');
  await leave(tab);
}

async function themeAndSdkRecovery() {
  const tab = browser(); await settle();
  const baselineTimers = tab.timers.size, baselineListeners = tab.listenerCount;
  let stale;
  for (let i = 0; i < 20; i++) {
    stale = tab.activeChannels[0]; tab.state.themeId = i % 2 ? 'forest' : 'river'; await tab.advance(500);
    assert.equal(tab.activeChannels.length, 1, 'theme transition retains at most one channel');
    assert.equal(tab.activeChannels[0].name, 'eco-' + tab.state.themeId);
    assert.equal(tab.timers.size, baselineTimers, 'theme transition does not add a timer');
  }
  const current = tab.activeChannels[0], channelCount = tab.client.channels.length;
  stale.status('SUBSCRIBED'); stale.handlers['presence:sync']?.(); await settle();
  assert.equal(tab.activeChannels[0], current, 'late callbacks cannot revive the old channel');
  current.status('CHANNEL_ERROR'); await tab.advance(30000);
  current.status('TIMED_OUT'); await tab.advance(30000);
  assert.equal(tab.client.channels.length, channelCount, 'SDK transport recovery does not create a competing channel');
  assert.equal(tab.activeChannels.length, 1);
  const before = tab.client.tracks.length;
  current.status('SUBSCRIBED'); await settle();
  assert.equal(tab.client.tracks.length, before + 1, 'SDK recovery re-tracks the public summary once');
  assert.equal(tab.context.ecoMultiplayer.getStats().onlinePlayers, 1);
  assert.ok(tab.context.ecoMultiplayer.getStats().reconnectCount >= 1);
  tab.context.navigator.onLine = false; tab.event('offline'); await tab.advance(500);
  assert.equal(tab.activeChannels.length, 0, 'network offline clears the channel');
  tab.context.navigator.onLine = true; tab.event('online'); await tab.advance(500);
  assert.equal(tab.activeChannels.length, 1, 'network online joins one replacement');
  tab.context.ecoMultiplayer.disable(); await settle();
  assert.equal(tab.activeChannels.length, 0, 'the retained emergency switch removes Presence');
  await tab.advance(10000); assert.equal(tab.activeChannels.length, 0, 'disabled Presence stays disabled');
  tab.context.ecoMultiplayer.enable(); await tab.advance(500);
  assert.equal(tab.activeChannels.length, 1, 'the retained enable API joins once');
  assert.equal(tab.client.maxActiveChannels, 1, 'channels never overlap even during a transition');
  assert.equal(tab.listenerCount, baselineListeners);
  assert.equal(tab.timers.size, baselineTimers);
  assertQuiet(tab); await leave(tab);
}

async function closedChannelBackoff() {
  const tab = browser(); await settle();
  const initial = tab.activeChannels[0]; tab.client.subscriptionStatus = 'CLOSED';
  const began = tab.clock.now(); initial.status('CLOSED');
  await tab.advance(4500);
  assert.equal(tab.client.channels.length, 1, 'a closed channel waits at least five seconds before replacement');
  await tab.advance(205500);
  const attempts = tab.client.channels.slice(1);
  assert.ok(attempts.length >= 5 && attempts.length <= 6, 'bounded backoff limits channel replacement attempts');
  const starts = [began, ...attempts.map(channel => channel.createdAt)];
  const expected = [5000, 10000, 20000, 40000, 60000, 60000];
  for (let i = 1; i < starts.length; i++) {
    const gap = starts[i] - starts[i - 1];
    assert.ok(gap >= expected[i - 1] && gap <= expected[i - 1] + 1500,
      'closed retry ' + i + ' follows capped backoff with at most one second jitter and one poll delay: ' + gap);
  }
  assert.ok(tab.activeChannels.length <= 1, 'failed replacements never overlap channels');
  tab.client.subscriptionStatus = 'SUBSCRIBED'; await tab.advance(62000);
  assert.equal(tab.activeChannels.length, 1, 'a later retry recovers');
  assert.equal(tab.context.ecoMultiplayer.getStats().status, 'connected');
  assert.equal(tab.client.maxActiveChannels, 1);
  assertQuiet(tab); await leave(tab);
}

async function failedRemovalBlocksReplacement() {
  const tab = browser(); await settle();
  const old = tab.activeChannels[0], statsBefore = tab.context.ecoMultiplayer.getStats();
  tab.client.removeFailures = 1; tab.state.themeId = 'river'; await tab.advance(500);
  assert.equal(tab.client.removeAttempts, 1, 'theme transition attempts removal once');
  assert.equal(tab.client.channels.length, 1, 'failed removal blocks immediate replacement');
  assert.equal(tab.activeChannels.length, 1, 'the failed removal leaves only the retiring channel');
  assert.equal(tab.activeChannels[0], old);
  assert.equal(tab.context.ecoMultiplayer.getStats().activeChannels, 1, 'stats include the retained SDK channel');
  assert.equal(tab.context.ecoMultiplayer.getStats().channelFailures, statsBefore.channelFailures + 1);
  old.status('SUBSCRIBED'); old.handlers['presence:sync']?.(); await settle();
  assert.equal(tab.context.ecoMultiplayer.getStats().onlinePlayers, 0, 'retiring channel callbacks stay ignored');
  await tab.advance(4000);
  assert.equal(tab.client.channels.length, 1, 'removal failure follows the retry delay');
  await tab.advance(2500);
  assert.equal(tab.client.removeAttempts, 2, 'the retiring channel removal is retried');
  assert.equal(tab.client.channels.length, 2, 'the new region joins after successful removal');
  assert.equal(tab.activeChannels.length, 1); assert.equal(tab.activeChannels[0].name, 'eco-river');
  assert.equal(tab.client.maxActiveChannels, 1, 'failed cleanup never permits overlapping SDK channels');
  const stats = tab.context.ecoMultiplayer.getStats();
  assert.equal(stats.channelJoins, 2); assert.equal(stats.channelLeaves, 1); assert.equal(stats.activeChannels, 1);
  assert.equal(stats.presenceTrackCalls, 2); assert.equal(stats.presenceTrackSuccesses, 2);
  assert.equal(stats.presenceTrackFailures, 0);
  assertQuiet(tab); await leave(tab);
  assert.equal(tab.context.ecoMultiplayer.getStats().activeChannels, 0);
}

async function classroomSize(count) {
  const hub = createHub(), tabs = [];
  for (let i = 1; i <= count; i++) tabs.push(browser(hub, i));
  await settle();
  assert.equal(hub.channels.size, count);
  for (const tab of tabs) {
    tab.openRoster(); assert.equal(tab.rows.length, count, count + ' students appear in the real roster');
    assert.equal(tab.context.ecoMultiplayer.getStats().onlinePlayers, count);
    assert.equal(tab.document.getElementById('ecoOnlineCount').textContent, count + '명 · 푸른 숲');
    assert.equal(tab.document.querySelectorAll('.eco-online-me').length, 1);
    assert.equal(tab.rows[0].children[2].textContent, 'Lv. ' + tab.state.lv);
    assert.equal(tab.document.querySelectorAll('.eco-online-tower').length, count);
    assert.equal(tab.client.tracks.length, 1);
    assertQuiet(tab);
  }
  const changed = tabs.at(-1); changed.state.tower.best = 100; changed.state.tower.bestTime = 462;
  await changed.advance(10500);
  assert.equal(changed.client.tracks.length, 2);
  for (const tab of tabs) {
    const row = tab.rows.find(item => item.children[0].textContent.startsWith(changed.state.name + (tab === changed ? ' (나)' : '🏰')));
    assert.ok(row, 'every student sees the updated peer');
    assert.equal(row.querySelector('.eco-online-tower').textContent, '🏰 탑 100층 · 07:42');
    assertQuiet(tab);
  }
  assert.equal(tabs.reduce((total, tab) => total + tab.client.tracks.length, 0), count + 1,
    'one initial track per student plus one coalesced record update');
  hub.extras = [peer('legacy'), peer('legacy'), peer('wrong-theme', 'river')]; hub.sync();
  for (const tab of tabs) {
    assert.equal(tab.rows.length, count + 1, 'Presence parser deduplicates students and excludes other regions');
    const legacy = tab.rows.find(row => row.children[0].textContent.startsWith('다른 학생'));
    assert.equal(legacy.children[2].textContent, 'Lv. 12');
    assert.equal(legacy.querySelector('.eco-online-tower').textContent, '🏰 탑 18층 · 07:42');
    assertQuiet(tab);
    assert.equal(tab.client.maxActiveChannels, 1);
  }
  hub.extras = []; hub.sync();
  for (const tab of tabs) await leave(tab);
  assert.equal(hub.channels.size, 0, 'all synthetic channels are cleaned up');
  return { students: count, broadcastSends: hub.broadcasts.length, initialTracks: count, recordUpdateTracks: 1,
    remoteActors: 0, activeChannelsAfterExit: hub.channels.size };
}

(async () => {
  await movementOffByDefault(); await joinOnlyMountedWorld(); await admissionRetainedAcrossGameScreens();
  await summaryCoalescing(); await hiddenGraceAndLifecycle(); await themeAndSdkRecovery(); await closedChannelBackoff();
  await failedRemovalBlocksReplacement();
  const classrooms = [];
  for (const count of [25, 29, 30]) classrooms.push(await classroomSize(count));
  console.log(JSON.stringify({ defaultMovementDisabled: true, mountedWorldOnly: true,
    coalescedUpdateMs: 10000, hiddenGraceMs: 30000, themeChanges: 20,
    sdkRecoverySingleChannel: true, privateSaveCodeExcluded: true, classrooms,
    legacy29StudentBroadcastModel: { sendsPerSecond: 29 * 5, deliveriesPerSecond: 29 * 5 * 28,
      sendsPlusDeliveriesPerSecond: 29 * 5 * 29 },
    optimizedBroadcastSendsAndDeliveries: 0,
    accountingNote: 'Synthetic client counters and a fanout model; not Supabase billing totals.' }));
})().catch(error => { console.error(error); process.exitCode = 1; });
