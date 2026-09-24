/* Optional, public, theme-scoped Presence. No game/save state is modified. */
(function () {
  'use strict';
  var themes = ['forest', 'river', 'ocean', 'city', 'air', 'climate'];
  var playerId, panel, active = null, busy = false, suspended = false;
  var retryAt = 0, lastOutput = '', lastDisplay = '';

  function updateRemotePlayers(theme, players) {
    try {
      if (window.ecoRemotePlayers) window.ecoRemotePlayers.sync(playerId, theme, players);
    } catch (error) { fail('Remote display failed', error); }
  }

  function look(value) {
    return window.ecoRemotePlayers ? window.ecoRemotePlayers.appearance(value) : {};
  }

  function playerSignature(target) { return target.nickname + JSON.stringify(target.appearance); }

  function show(status, theme, players) {
    var text = '접속 디버그 · ' + (theme ? 'eco-' + theme : '대기') + '\n' + status;
    if (players) text += '\n' + players.map(function (p) {
      return p.nickname + (p.playerId === playerId ? ' (나)' : '');
    }).join('\n');
    if (panel && text !== lastDisplay) { panel.textContent = text; lastDisplay = text; }
  }

  function fail(message, error) {
    console.warn('[Presence] ' + message + (error && error.message ? ': ' + error.message : ''));
  }

  function current() {
    var state = window.S;
    if (!state || themes.indexOf(state.themeId) < 0) return null;
    var name = typeof state.name === 'string' ? state.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24) : '';
    return { theme: state.themeId, nickname: name || '여행자-' + playerId.slice(0, 8),
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
            theme: p.theme, joinedAt: p.joinedAt }, look(p)));
        });
      });
      var list = Array.from(players.values()).sort(function (a, b) { return a.playerId.localeCompare(b.playerId); });
      var signature = session.theme + JSON.stringify(list);
      show('온라인 ' + list.length + '명', session.theme, list);
      updateRemotePlayers(session.theme, list);
      if (window.ecoMovement) window.ecoMovement.members(list);
      if (signature !== lastOutput) {
        lastOutput = signature;
        console.info('[Presence] online players: ' + list.length + ' (eco-' + session.theme + ')');
        list.forEach(function (p) { console.info('[Presence] ' + p.nickname); });
      }
    } catch (error) { fail('Could not read online players', error); }
  }

  async function track(session) {
    if (active !== session || !session.subscribed || session.tracking) return;
    var target = current();
    if (!target || target.theme !== session.theme) return;
    session.tracking = true;
    try {
      var result = await session.channel.track(Object.assign({ playerId: playerId, nickname: target.nickname,
        theme: session.theme, joinedAt: session.joinedAt }, target.appearance));
      if (active !== session) return;
      if (result !== 'ok') throw new Error('track returned ' + result);
      session.nickname = target.nickname;
      session.signature = playerSignature(target);
      session.trackRetryAt = 0;
    } catch (error) {
      if (active !== session) return;
      session.trackRetryAt = Date.now() + 5000;
      show('접속 알림 재시도 중', session.theme);
      fail('Could not publish presence', error);
    } finally { session.tracking = false; }
  }

  async function leave() {
    var previous = active;
    active = null; // Ignore late sync/subscribe/track callbacks from this channel.
    if (window.ecoMovement) window.ecoMovement.detach();
    updateRemotePlayers(null, []);
    lastOutput = '';
    if (!previous) return;
    console.info('[Presence] leaving eco-' + previous.theme);
    // Best effort untrack; channel removal also removes server-side presence.
    try { Promise.resolve(previous.channel.untrack()).catch(function (e) { fail('Untrack failed', e); }); }
    catch (error) { fail('Untrack failed', error); }
    try {
      var result = await previous.client.removeChannel(previous.channel);
      if (result !== 'ok') fail('Channel removal returned ' + result);
    } catch (error) { fail('Channel removal failed', error); }
  }

  async function reconcile() {
    if (busy || suspended) return;
    busy = true;
    try {
      var target = current();
      var connection = window.ecoSupabase;
      var client = connection && connection.client;
      if (active && (!target || target.theme !== active.theme || client !== active.client || active.closed)) {
        show('채널 이동 중', target && target.theme);
        await leave();
      }
      if (suspended) return;
      target = current(); // Theme may have changed again while leave was pending.
      if (!client || !target) {
        show(connection && connection.status === 'failed' ? '연결 불가 · 게임은 계속 가능' : '연결 대기', target && target.theme);
        return;
      }
      if (active) {
        if (active.signature !== playerSignature(target) && Date.now() >= (active.trackRetryAt || 0)) await track(active);
        return;
      }
      if (Date.now() < retryAt) return;
      var session = { client: client, theme: target.theme, nickname: null,
        joinedAt: new Date().toISOString(), subscribed: false, tracking: false, closed: false };
      session.channel = client.channel('eco-' + target.theme, { config: { presence: { key: playerId }, broadcast: { self: false } } });
      active = session;
      show('접속 중', session.theme);
      session.channel.on('presence', { event: 'sync' }, function () { sync(session); });
      if (window.ecoMovement) window.ecoMovement.attach(session.channel, playerId, session.theme, session.joinedAt);
      session.channel.subscribe(function (status, error) {
        if (active !== session || suspended) return;
        session.subscribed = status === 'SUBSCRIBED';
        if (window.ecoMovement) window.ecoMovement.ready(session.subscribed);
        if (session.subscribed) {
          console.info('[Presence] joined eco-' + session.theme);
          // SUBSCRIBED also occurs after transport reconnection: always re-track.
          track(session).catch(function (e) { fail('Track failed', e); });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          session.nickname = null;
          session.signature = null;
          updateRemotePlayers(null, []);
          lastOutput = '';
          show('연결 끊김 · 재접속 대기', session.theme);
          fail(status + ' eco-' + session.theme, error);
          // SDK retries transport errors; recreate explicitly closed channels only.
          if (status === 'CLOSED') { session.closed = true; retryAt = Date.now() + 3000; }
        }
      });
    } catch (error) {
      retryAt = Date.now() + 5000;
      await leave();
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
    panel.setAttribute('aria-label', '테마 접속자 디버그');
    panel.style.cssText = 'position:fixed;right:18px;top:82px;z-index:1000;max-width:180px;max-height:120px;overflow:hidden;pointer-events:none;white-space:pre-line;padding:6px 9px;border-radius:6px;background:rgba(16,35,30,.82);color:#fff;font:11px/1.5 sans-serif;';
    document.body.appendChild(panel); // Outside the game's frequently replaced screen.
    function tick() {
      if (window.ecoRemotePlayers) window.ecoRemotePlayers.refresh();
      reconcile().catch(function (e) { fail('Update failed', e); });
    }
    var poll = setInterval(tick, 500); // Read only theme/name/appearance; never send coordinates.
    window.addEventListener('pagehide', function () {
      suspended = true;
      clearInterval(poll);
      leave().catch(function (e) { fail('Page leave failed', e); });
    });
    window.addEventListener('pageshow', function () {
      suspended = false;
      clearInterval(poll);
      poll = setInterval(tick, 500);
      tick();
    });
    tick();
  } catch (error) { fail('Presence unavailable; game remains independent', error); }
})();
