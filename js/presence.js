/* Optional, public, theme-scoped Presence. No game/save state is modified. */
(function () {
  'use strict';
  var themes = ['forest', 'river', 'ocean', 'city', 'air', 'climate'];
  var playerId, panel, active = null, busy = false, suspended = false, disabled = false;
  var retryAt = 0, lastOutput = '', lastDisplay = '';
  var connectionStatus = 'reconnecting', onlineCount = 0, reconnectCount = 0, recovering = false;
  var cleanup = null, retiring = null, removalFlight = null, removalRetryAt = 0, retryStep = 0;
  var config = window.EcoMultiplayerConfig || {};
  var movementEnabled = config.movementEnabled === true;
  var updateInterval = Math.max(10000, Number(config.presenceUpdateIntervalMs) || 10000);
  var hiddenGrace = Math.max(30000, Number(config.hiddenGraceMs) || 30000);
  var hiddenSince = document.hidden ? Date.now() : null, hiddenTimer = null, admittedCode = null;
  var metrics = { presenceTrackCalls: 0, presenceTrackSuccesses: 0, presenceTrackFailures: 0,
    channelJoins: 0, channelLeaves: 0, subscriptions: 0, channelFailures: 0 };

  function backoff(attempt) {
    return Math.min(60000, 5000 * Math.pow(2, Math.min(attempt, 4))) + Math.floor(Math.random() * 1000);
  }

  function debug(message) { if (config.debug) console.info('[Presence] ' + message); }

  function channelCount() {
    var client = window.ecoSupabase && window.ecoSupabase.client;
    try {
      if (client && typeof client.getChannels === 'function') return client.getChannels().filter(function (channel) {
        return /^(realtime:)?eco-(forest|river|ocean|city|air|climate)$/.test(channel.topic || channel.name || '');
      }).length;
    } catch (_) {}
    return active || retiring ? 1 : 0;
  }

  function armHiddenTimer() {
    clearTimeout(hiddenTimer); hiddenTimer = null;
    if (document.hidden && hiddenSince !== null && !suspended) hiddenTimer = setTimeout(function () {
      hiddenTimer = null;
      reconcile().catch(function (error) { fail('Hidden tab cleanup failed', error); });
    }, Math.max(0, hiddenGrace - (Date.now() - hiddenSince)));
  }

  function updateRemotePlayers(theme, players) {
    try {
      if (movementEnabled && window.ecoRemotePlayers) window.ecoRemotePlayers.sync(playerId, theme, players);
    } catch (error) { fail('Remote display failed', error); }
  }

  function look(value) {
    return window.ecoRemotePlayers ? window.ecoRemotePlayers.appearance(value) : {};
  }

  function playerSignature(target) { return target.nickname + JSON.stringify(target.appearance) + JSON.stringify(target.summary); }

  function show(status, theme, players) {
    var labels = { connected: '접속 정보 연결됨', unstable: '연결 불안정', reconnecting: '재연결 중', offline: '오프라인 모드' };
    var text = labels[connectionStatus] + '\n' + status;
    if (players && config.debug) text += '\n' + players.map(function (p) {
      return p.nickname + (p.playerId === playerId ? ' (나)' : '');
    }).join('\n');
    if (panel && text !== lastDisplay) { panel.textContent = text; lastDisplay = text; }
  }

  function fail(message, error) {
    console.warn('[Presence] ' + message + (error && error.message ? ': ' + error.message : ''));
  }

  function current() {
    var state = window.S;
    if (!state || themes.indexOf(state.themeId) < 0 || window.ECO_BOOT_READY === false) return null;
    var name = typeof state.name === 'string' ? state.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24) : '';
    if (!name || typeof state.code !== 'string' || !state.code.trim() ||
        ['earth', 'water', 'fire'].indexOf(state.petKey) < 0 ||
        ['world', 'themes', 'clear', 'cert'].indexOf(state.scene) < 0 ||
        ['cloudload', 'clouddevice'].indexOf(state.modal) >= 0) {
      admittedCode = null;
      return null;
    }
    if (state.code !== admittedCode) {
      if (state.scene !== 'world' || !window.Wd || window.Wd.ready !== true || !document.getElementById('plane')) return null;
      admittedCode = state.code;
    }
    return { theme: state.themeId, nickname: name,
      summary: window.ecoOnlinePlayers ? window.ecoOnlinePlayers.summary(state) : {},
      appearance: look({ hair: state.hair, face: state.face, outfit: state.outfit,
        skin: state.skin, haircol: state.haircol, direction: 'south' }) };
  }

  function sync(session) {
    if (active !== session || !session.subscribed) return;
    try {
      var players = new Map();
      Object.values(session.channel.presenceState()).forEach(function (metas) {
        if (!Array.isArray(metas)) return;
        metas.forEach(function (p) {
          if (!p || p.theme !== session.theme || typeof p.playerId !== 'string' ||
              p.playerId.length > 64 || typeof p.nickname !== 'string' || typeof p.joinedAt !== 'string') return;
          players.set(p.playerId, Object.assign({ playerId: p.playerId, nickname: p.nickname.slice(0, 24),
            theme: p.theme, joinedAt: p.joinedAt }, look(p),
            window.ecoOnlinePlayers ? window.ecoOnlinePlayers.sanitize(p) : {}));
        });
      });
      var list = Array.from(players.values()).sort(function (a, b) { return a.playerId.localeCompare(b.playerId); });
      onlineCount = list.length;
      var signature = session.theme + JSON.stringify(list);
      show('온라인 ' + list.length + '명', session.theme, list);
      updateRemotePlayers(session.theme, list);
      if (window.ecoOnlinePlayers) window.ecoOnlinePlayers.update(playerId, session.theme, list);
      if (movementEnabled && window.ecoMovement) window.ecoMovement.members(list);
      if (signature !== lastOutput) {
        lastOutput = signature;
        debug('online players: ' + list.length + ' (eco-' + session.theme + ')');
      }
    } catch (error) { fail('Could not read online players', error); }
  }

  async function track(session) {
    if (active !== session || !session.subscribed || session.tracking || document.hidden || suspended || disabled) return;
    var target = current();
    if (!target || target.theme !== session.theme) return;
    session.tracking = true;
    session.nextTrackAt = Date.now() + updateInterval;
    metrics.presenceTrackCalls++;
    try {
      var result = await session.channel.track(Object.assign({ playerId: playerId, nickname: target.nickname,
        theme: session.theme, joinedAt: session.joinedAt }, target.appearance, target.summary));
      if (active !== session || !session.subscribed) return;
      if (result !== 'ok') throw new Error('track returned ' + result);
      session.nickname = target.nickname;
      session.signature = playerSignature(target);
      session.trackRetryAt = 0;
      session.trackErrors = 0;
      metrics.presenceTrackSuccesses++;
      retryStep = 0;
      connectionStatus = 'connected';
      sync(session);
    } catch (error) {
      if (active !== session) return;
      metrics.presenceTrackFailures++;
      session.trackErrors = (session.trackErrors || 0) + 1;
      session.trackRetryAt = Date.now() + Math.max(updateInterval, backoff(session.trackErrors - 1));
      connectionStatus = 'unstable';
      show('접속 알림 재시도 중', session.theme);
      fail('Could not publish presence', error);
    } finally { session.tracking = false; }
  }

  async function leave() {
    var previous = active;
    active = null; // Ignore late sync/subscribe/track callbacks from this channel.
    if (window.ecoMovement) window.ecoMovement.detach();
    updateRemotePlayers(null, []);
    if (window.ecoOnlinePlayers) window.ecoOnlinePlayers.update(playerId, null, []);
    lastOutput = '';
    onlineCount = 0;
    if (!previous) return;
    debug('leaving eco-' + previous.theme);
    metrics.channelLeaves++;
    retiring = previous;
    await removeRetiring();
  }

  async function removeRetiring() {
    if (!retiring) return;
    if (removalFlight) return removalFlight;
    var previous = retiring;
    removalFlight = (async function () {
      try {
        // Removing the channel also removes Presence; a separate untrack is redundant.
        var result = await previous.client.removeChannel(previous.channel);
        if (result !== 'ok') throw new Error('Channel removal returned ' + result);
        if (retiring === previous) retiring = null;
      } catch (error) {
        metrics.channelFailures++;
        removalRetryAt = Date.now() + backoff(retryStep++);
        fail('Channel removal failed', error);
      }
    })();
    try { await removalFlight; } finally { removalFlight = null; }
  }

  async function reconcile() {
    if (busy || suspended) return;
    busy = true;
    try {
      if (cleanup) await cleanup;
      if (retiring) {
        if (Date.now() < removalRetryAt) return;
        await removeRetiring();
        if (retiring) return; // Never subscribe a second channel before cleanup succeeds.
      }
      var target = current();
      var connection = window.ecoSupabase;
      var client = connection && connection.client;
      var offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      if (active && (disabled || offline || !target || target.theme !== active.theme || client !== active.client ||
          active.ownerCode !== window.S.code ||
          active.closed || (document.hidden && hiddenSince !== null && Date.now() - hiddenSince >= hiddenGrace))) {
        show('채널 이동 중', target && target.theme);
        await leave();
        if (retiring) return;
      }
      if (suspended || disabled || offline || document.hidden) {
        if (document.hidden && active && active.subscribed) return;
        connectionStatus = 'offline';
        show('온라인 정보 없음', target && target.theme);
        return;
      }
      target = current(); // Theme may have changed again while leave was pending.
      if (!client || !target) {
        connectionStatus = client ? 'reconnecting' : 'offline';
        show(connection && connection.status === 'failed' ? '연결 불가 · 게임은 계속 가능' : '연결 대기', target && target.theme);
        return;
      }
      if (active) {
        if (active.subscribed && active.signature !== playerSignature(target) &&
            Date.now() >= Math.max(active.nextTrackAt || 0, active.trackRetryAt || 0)) await track(active);
        return;
      }
      if (Date.now() < retryAt) return;
      var session = { client: client, theme: target.theme, nickname: null, ownerCode: window.S.code,
        joinedAt: new Date().toISOString(), subscribed: false, tracking: false, closed: false };
      session.channel = client.channel('eco-' + target.theme, { config: { presence: { key: playerId }, broadcast: { self: false } } });
      active = session;
      metrics.channelJoins++;
      connectionStatus = 'reconnecting';
      show('접속 중', session.theme);
      session.channel.on('presence', { event: 'sync' }, function () { sync(session); });
      if (movementEnabled && window.ecoMovement) window.ecoMovement.attach(session.channel, playerId, session.theme, session.joinedAt);
      session.channel.subscribe(function (status, error) {
        if (active !== session || suspended || disabled) return;
        var wasSubscribed = session.subscribed;
        session.subscribed = status === 'SUBSCRIBED';
        if (movementEnabled && window.ecoMovement) window.ecoMovement.ready(session.subscribed);
        if (session.subscribed) {
          if (wasSubscribed) return;
          metrics.subscriptions++;
          retryAt = 0;
          if (recovering) { reconnectCount++; recovering = false; }
          connectionStatus = 'connected';
          show('온라인 확인 중', session.theme);
          debug('joined eco-' + session.theme);
          // SUBSCRIBED also occurs after transport reconnection: always re-track.
          track(session).catch(function (e) { fail('Track failed', e); });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          session.nickname = null;
          session.signature = null;
          updateRemotePlayers(null, []);
          if (window.ecoOnlinePlayers) window.ecoOnlinePlayers.update(playerId, null, []);
          lastOutput = '';
          onlineCount = 0;
          recovering = true;
          connectionStatus = status === 'CHANNEL_ERROR' ? 'unstable' : 'reconnecting';
          show('연결 끊김 · 재접속 대기', session.theme);
          fail(status + ' eco-' + session.theme, error);
          // The SDK owns transport/channel rejoin after ERROR/TIMED_OUT.
          // Only a terminal CLOSED channel is replaced, after removal and backoff.
          if (status === 'CLOSED' && !session.closed) {
            session.closed = true;
            retryAt = Date.now() + backoff(retryStep++);
          }
        }
      });
    } catch (error) {
      metrics.channelFailures++;
      retryAt = Date.now() + backoff(retryStep++);
      await leave();
      connectionStatus = 'unstable';
      show('연결 오류 · 게임은 계속 가능');
      fail('Initialization/update failed', error);
    } finally { busy = false; }
  }

  try {
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    playerId = Array.from(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    panel = document.createElement('aside');
    panel.id = 'ecoPresenceDebug';
    panel.setAttribute('aria-label', '접속 정보 상태');
    panel.style.cssText = 'position:fixed;right:18px;top:82px;z-index:1000;max-width:180px;max-height:120px;overflow:hidden;pointer-events:none;white-space:pre-line;padding:6px 9px;border-radius:6px;background:rgba(16,35,30,.82);color:#fff;font:11px/1.5 sans-serif;';
    document.body.appendChild(panel); // Outside the game's frequently replaced screen.
    window.ecoMultiplayer = {
      disable: function () {
        disabled = true; connectionStatus = 'offline';
        if (window.ecoMovement) window.ecoMovement.ready(false);
        cleanup = leave().catch(function (e) { fail('Disable cleanup failed', e); })
          .finally(function () { cleanup = null; });
        show('온라인 정보 없음', null);
      },
      enable: function () {
        if (!disabled) return;
        disabled = false; retryAt = 0; connectionStatus = 'reconnecting';
        show('접속 중', current() && current().theme);
        reconcile().catch(function (e) { fail('Enable failed', e); });
      },
      getStats: function () {
        var movement = window.ecoMovement && typeof window.ecoMovement.getStats === 'function' && window.ecoMovement.getStats();
        return { theme: active ? active.theme : (current() && current().theme) || null,
          onlinePlayers: onlineCount,
          remotePlayers: window.ecoRemotePlayers && window.ecoRemotePlayers.remotePlayers ?
            Object.keys(window.ecoRemotePlayers.remotePlayers).length : 0,
          movementEnabled: movementEnabled,
          movementIntervalMs: movement ? movement.intervalMs : 0,
          sent: movement ? movement.sent : 0, received: movement ? movement.received : 0,
          ignored: movement ? movement.ignored : 0, failures: movement ? movement.failures : 0,
          requests: movement ? movement.requests : 0,
          presenceTrackCalls: metrics.presenceTrackCalls, presenceTrackSuccesses: metrics.presenceTrackSuccesses,
          presenceTrackFailures: metrics.presenceTrackFailures,
          channelJoins: metrics.channelJoins, channelLeaves: metrics.channelLeaves, subscriptions: metrics.subscriptions,
          activeChannels: channelCount(), channelFailures: metrics.channelFailures,
          reconnectCount: reconnectCount, status: connectionStatus };
      }
    };
    function tick() {
      if (movementEnabled && window.ecoRemotePlayers) window.ecoRemotePlayers.refresh();
      reconcile().catch(function (e) { fail('Update failed', e); });
    }
    var poll = setInterval(tick, 500); // Read only theme/name/appearance; never send coordinates.
    window.addEventListener('pagehide', function () {
      suspended = true;
      clearInterval(poll);
      clearTimeout(hiddenTimer); hiddenTimer = null;
      leave().catch(function (e) { fail('Page leave failed', e); });
    });
    window.addEventListener('pageshow', function () {
      suspended = false;
      hiddenSince = document.hidden ? Date.now() : null;
      armHiddenTimer();
      clearInterval(poll);
      poll = setInterval(tick, 500);
      tick();
    });
    document.addEventListener('visibilitychange', function () {
      hiddenSince = document.hidden ? Date.now() : null;
      armHiddenTimer();
      tick();
    });
    window.addEventListener('offline', function () {
      connectionStatus = 'offline';
      if (window.ecoMovement) window.ecoMovement.ready(false);
      updateRemotePlayers(null, []);
      if (window.ecoOnlinePlayers) window.ecoOnlinePlayers.update(playerId, null, []);
      onlineCount = 0;
      show('온라인 정보 없음', active && active.theme);
      reconcile().catch(function (e) { fail('Offline cleanup failed', e); });
    });
    window.addEventListener('online', function () {
      if (disabled) return;
      retryAt = 0; connectionStatus = 'reconnecting';
      reconcile().catch(function (e) { fail('Reconnect failed', e); });
    });
    armHiddenTimer();
    tick();
  } catch (error) { fail('Presence unavailable; game remains independent', error); }
})();
