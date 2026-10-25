/* Local browser QA only. Injected by serve-classroom.mjs, never by production index.html. */
(function () {
  'use strict';
  var rawFetch = window.fetch.bind(window), session = crypto.randomUUID(), sequence = 0, poll = null;
  var channels = [], latest = { version: -1, channels: [], synthetic: [], metrics: {} };
  var errors = [], lastResult = null, output, movingTimer = null;
  var metrics = { sends: 0, sendEvents: {}, trackCalls: 0, channelCreates: 0, channelRemovals: 0,
    privacyViolations: 0, localCloudRequests: 0 };
  window.__classroomOffline = false;

  function safeMessage(value) {
    return String(value || '').replace(/EC-?[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-?[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}/g,
      '[private test code]').replace(/\b(?=[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}\b)(?=[A-Z2-9]*[2-9])[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}\b/g,'[private test code]').slice(0, 220);
  }
  function error(message) { if (errors.length < 30) errors.push(safeMessage(message)); }
  addEventListener('error', function (event) { error(event.message); });
  addEventListener('unhandledrejection', function () { error('Unhandled promise rejection'); });
  try { Object.defineProperty(navigator, 'onLine', { configurable: true, get: function () { return !window.__classroomOffline; } }); }
  catch (_) { error('Local offline simulation is unavailable in this browser'); }
  window.fetch = function (input, init) {
    var address = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (address.origin === location.origin && address.pathname === '/functions/v1/student-save-v2') {
      metrics.localCloudRequests++;
      if (window.__classroomOffline) return Promise.reject(new TypeError('Local QA offline'));
    }
    return rawFetch(input, init);
  };

  function notify() {
    channels.slice().forEach(function (channel) {
      if (channel.joined && channel.healthy) channel.handlers['presence:sync']?.();
    });
  }
  function adopt(value) {
    var changed = value.version !== latest.version;
    latest = value;
    if (changed) notify();
    return value;
  }
  async function request(action, values) {
    var response = await rawFetch('/__classroom/presence', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action: action }, values)), cache: 'no-store', keepalive: true });
    if (!response.ok) throw new Error('Local Presence fixture rejected ' + action);
    return adopt(await response.json());
  }
  function startPoll() {
    if (poll) return;
    poll = setInterval(function () {
      rawFetch('/__classroom/presence?session=' + encodeURIComponent(session), { cache: 'no-store' })
        .then(function (response) { if (!response.ok) throw new Error('Local Presence polling unavailable'); return response.json(); })
        .then(adopt).catch(function () {});
    }, 700);
  }
  function stopPoll() { if (!channels.length && poll) { clearInterval(poll); poll = null; } }
  var client = {
    channel: function (name, options) {
      var channel = {
        id: session + ':' + (++sequence), name: name, topic: 'realtime:' + name,
        key: options && options.config && options.config.presence && options.config.presence.key || session,
        handlers: {}, subscribed: null, joined: false, healthy: true, removed: false,
        on: function (type, filter, callback) { this.handlers[type + ':' + filter.event] = callback; return this; },
        subscribe: function (callback) {
          this.subscribed = callback;
          request('join', { id: this.id, session: session, name: name, key: this.key }).then(function () {
            if (channel.removed) return;
            channel.joined = true; startPoll(); callback('SUBSCRIBED');
          }).catch(function () { if (!channel.removed) callback('CHANNEL_ERROR'); });
          return this;
        },
        presenceState: function () {
          var state = {};
          latest.channels.filter(function (record) { return record.name === name; }).forEach(function (record) {
            (state[record.key] ||= []).push(record.self);
          });
          latest.synthetic.filter(function (group) { return 'eco-' + group.theme === name; }).forEach(function (group) {
            group.players.forEach(function (player) { state[player.playerId] = [player]; });
          });
          return state;
        },
        track: async function (payload) {
          metrics.trackCalls++;
          if (Object.prototype.hasOwnProperty.call(payload, 'cloudCode') || Object.prototype.hasOwnProperty.call(payload, 'code')) {
            metrics.privacyViolations++; throw new Error('Non-public Presence payload');
          }
          await request('track', { id: this.id, payload: payload }); return 'ok';
        },
        untrack: async function () { await request('untrack', { id: this.id }); return 'ok'; },
        send: async function (message) {
          metrics.sends++;
          var event = typeof message.event === 'string' ? message.event : 'unknown';
          metrics.sendEvents[event] = (metrics.sendEvents[event] || 0) + 1;
          // Record counters only. This test hub never needs movement payloads.
          await request('broadcast', { id: this.id, event: event }); return 'ok';
        }
      };
      channels.push(channel); metrics.channelCreates++; return channel;
    },
    removeChannel: async function (channel) {
      await request('leave', { id: channel.id });
      channel.removed = true; channel.joined = false;
      channels = channels.filter(function (current) { return current !== channel; });
      metrics.channelRemovals++; stopPoll(); return 'ok';
    },
    getChannels: function () { return channels.slice(); }
  };
  window.ecoSupabase = { client: client, publicConfig: { projectUrl: location.origin,
    publishableKey: 'sb_publishable_classroom_test' }, status: 'connected' };

  function result(action, value) {
    lastResult = { action: action, ok: value === true || !!(value && value.ok),
      error: value && typeof value.error === 'string' ? safeMessage(value.error) : null,
      revision: value && Number.isInteger(value.revision) ? value.revision : null,
      checks: value && value.checks || null };
    updateOutput();
  }
  function initialized() { return typeof newState === 'function' && typeof enterWorld === 'function' && window.ECO_BOOT_READY !== false; }
  function world() {
    if (!window.S || !S.code) throw new Error('Use TEST student first, or finish normal onboarding');
    if (S.modal) closeModal();
    if (typeof miniStop === 'function') miniStop();
    if (typeof closeBattleDom === 'function') closeBattleDom();
    if (typeof B !== 'undefined') B = null;
    if (typeof Tw !== 'undefined') Tw.on = false;
    S.scene = 'world';
    var screen = document.getElementById('screen');
    if (screen && !document.getElementById('worldRoot')) { Wd.ready = false; screen.innerHTML = ''; }
    render();
    if (!Wd.raf) startLoop();
  }
  function updateOutput() {
    if (!output || !window.S) return;
    var cloud = window.CloudSync ? CloudSync.view() : {};
    var stats = window.ecoMultiplayer ? ecoMultiplayer.getStats() : {};
    var hero = document.getElementById('hero'), plane = document.getElementById('plane');
    output.textContent = JSON.stringify({ fixture: 'LOCAL MOCKS ONLY', scene: S.scene, modal: S.modal, theme: S.themeId,
      name: S.name, level: S.lv, localHero: { mounted: !!hero, x: typeof Wd !== 'undefined' ? Math.round(Wd.px) : null,
        y: typeof Wd !== 'undefined' ? Math.round(Wd.py) : null, direction: typeof Wd !== 'undefined' ? Wd.face : null,
        worldReady: typeof Wd !== 'undefined' && Wd.ready, planeTransform: plane ? plane.style.transform : null },
      remoteActors: document.querySelectorAll('.eco-remote-player').length,
      remoteLabels: document.querySelectorAll('.eco-remote-player .nametag').length,
      remoteShadows: document.querySelectorAll('.eco-remote-player .shadow').length,
      remoteRecords: window.ecoRemotePlayers ? Object.keys(ecoRemotePlayers.remotePlayers).length : null,
      rosterRows: document.querySelectorAll('#ecoOnlineRows tr:not(:has(.eco-online-empty))').length,
      tower: S.tower ? { best: S.tower.best, bestTime: S.tower.bestTime, runs: S.tower.runs } : null,
      presence: stats, clientCounters: metrics, hub: latest.metrics,
      cloud: { status: cloud.status, revision: cloud.revision, pending: cloud.pending,
        conflict: !!cloud.conflict, active: cloud.active, offline: window.__classroomOffline,
        localSlots: window.Save ? Save.index().length : null },
      screen: { width: innerWidth, height: innerHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1 },
      lastResult: lastResult, errors: errors });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var identity = new URLSearchParams(location.search).get('fixture') === 'B' || location.port === '54452' ? 'B' : 'A';
    var box = document.createElement('details'); box.id = 'classroom-qa'; box.open = true;
    box.style.cssText = 'position:fixed;bottom:4px;left:4px;z-index:30000;background:#f5fff8;color:#10251c;' +
      'border:1px solid #448b5b;border-radius:6px;padding:5px;max-width:min(760px,calc(100vw - 20px));font:11px/1.35 monospace';
    var summary = document.createElement('summary'); summary.textContent = 'LOCAL QA ' + identity + ' · mock Presence + local Cloud Save';
    box.appendChild(summary);
    var controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;margin-top:4px'; box.appendChild(controls);
    output = document.createElement('output'); output.id = 'classroom-qa-status';
    output.setAttribute('aria-label', 'Read-only classroom QA state');
    output.style.cssText = 'display:block;white-space:pre-wrap;overflow:auto;max-height:100px;margin-top:4px;word-break:break-word'; box.appendChild(output);
    function button(label, action) {
      var node = document.createElement('button'); node.type = 'button'; node.textContent = label;
      node.style.cssText = 'font:11px sans-serif;min-height:24px;cursor:pointer';
      node.onclick = async function () {
        node.disabled = true;
        try { if (!initialized()) throw new Error('Game is still loading'); await action(); }
        catch (problem) { result(label, { ok: false, error: safeMessage(problem.message) }); }
        finally { node.disabled = false; updateOutput(); }
      };
      controls.appendChild(node);
    }
    button('TEST student ' + identity, function () {
      startNew();
      Object.assign(S, { name: '교실TEST' + identity, code: identity === 'A' ? 'EC9001' : 'EC9002',
        petKey: 'earth', lv: 9, exp: LEVELS[8].need, scene: 'guide', themeId: 'forest' });
      applyTheme('forest'); enterWorld(); result('seed-local-test-student', true);
    });
    button('TEST east 1s', function () { world(); releaseKeys(); Wd.keys.r = true;
      clearTimeout(movingTimer); movingTimer = setTimeout(releaseKeys, 1000); result('east-keys-held', true); });
    button('TEST north 1s', function () { world(); releaseKeys(); Wd.keys.u = true;
      clearTimeout(movingTimer); movingTimer = setTimeout(releaseKeys, 1000); result('north-keys-held', true); });
    button('TEST roster 30', async function () {
      await request('synthetic', { count: 28, theme: S.themeId });
      if (S.modal) closeModal(); ecoOnlinePlayers.open(); result('28-synthetic-plus-two-real-tabs', true);
    });
    button('TEST remove mocks', async function () { await request('synthetic', { count: 0, theme: S.themeId }); result('synthetic-removed', true); });
    button('TEST river', function () {
      world(); if (!S.cleared.includes('forest')) S.cleared.push('forest');
      admGo('river'); result('actual-region-transition-river', true);
    });
    button('TEST forest', function () { world(); admGo('forest'); result('actual-region-transition-forest', true); });
    button('TEST tower record', function () {
      world(); Tw.floor = 18; Tw.t0 = Date.now() - 462000; towerRetire('local QA record');
      result('actual-tower-retire-save', true);
    });
    button('TEST Realtime error', function () {
      client.getChannels().forEach(function (channel) { channel.healthy = false; channel.subscribed?.('CHANNEL_ERROR'); });
      result('mock-sdk-channel-error', true);
    });
    button('TEST Realtime recover', function () {
      client.getChannels().forEach(function (channel) { channel.healthy = true; channel.subscribed?.('SUBSCRIBED'); });
      result('mock-sdk-subscribed', true);
    });
    button('TEST legacy request', function () {
      client.getChannels().forEach(function (channel) { channel.handlers['broadcast:world-position-request']?.({ payload: {
        playerId: 'classroom-synthetic-1', theme: S.themeId, joinedAt: 'local-browser-fixture' } }); });
      result('legacy-request-injected', true);
    });
    button('TEST mini', function () { world(); admMini('timing'); result('actual-admin-mini', true); });
    button('TEST tower', function () { world(); towerStart(); result('actual-tower-start', true); });
    button('TEST fight', function () { world(); admFight(); result('actual-admin-fight', true); });
    button('TEST world', function () { world(); result('return-world', true); });
    button('TEST save + reload', async function () {
      function values() { return JSON.stringify([S.name, S.lv, S.gold, S.tower.best, S.tower.bestTime, S.tower.runs]); }
      var expected = values(), localCode = S.code;
      var mode = Save.save(); await CloudSync.flush();
      var cloudCode = CloudSync.view().code;
      // Follow the title-screen resume path. Cloud caches deliberately are not EC-number slots.
      go('title');
      var resumed = cloudCode ? await CloudSync.loadCode(cloudCode) : await CloudSync.resumeLocal(localCode);
      var unchanged = values() === expected;
      result('actual-save-cloud-resume', { ok: mode === 'disk' && resumed.ok && unchanged,
        error: resumed.error, checks: { mode: mode, resumed: resumed.ok, unchanged: unchanged } });
    });
    button('TEST gold +10 autosave', function () { S.gold += 10; autosave(); result('actual-autosave', true); });
    button('TEST offline', function () { window.__classroomOffline = true; dispatchEvent(new Event('offline')); result('local-fetch-offline', true); });
    button('TEST online', function () { window.__classroomOffline = false; dispatchEvent(new Event('online')); result('local-fetch-online', true); });
    button('TEST cloud flush', async function () { result('actual-cloud-flush', await CloudSync.flush()); });
    button('Hide QA panel', function () { box.open = false; });
    document.body.appendChild(box);
    setInterval(updateOutput, 500); updateOutput();
  });
})();
