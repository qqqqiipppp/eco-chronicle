/* Optional world-only Broadcast transport. Never writes game/save state. */
(function () {
  'use strict';
  var active = null, sequence = 0;
  var INTERVAL = 125;
  var stats = { sent: 0, received: 0, ignored: 0, requests: 0, failures: 0 };
  var directions = ['north', 'south', 'east', 'west'];

  function validMember(session, payload) {
    return payload && session.members.has(payload.playerId) &&
      payload.playerId !== session.self && payload.theme === session.theme &&
      session.members.get(payload.playerId) === payload.joinedAt;
  }

  function attach(channel, self, theme, joinedAt) {
    detach();
    var session = { channel: channel, self: self, theme: theme, joinedAt: joinedAt,
      ready: false, members: new Map(), force: true, last: null, inFlight: false,
      retryAt: 0, nextRequest: 0, requestCount: 0 };
    active = session;
    channel.on('broadcast', { event: 'world-position' }, function (message) {
      try {
        if (active !== session || !session.ready) return;
        var p = message.payload;
        if (!validMember(session, p) || !window.ecoRemotePlayers ||
            !window.ecoRemotePlayers.receivePosition(p)) { stats.ignored++; return; }
        stats.received++;
      } catch (error) { warn(error); }
    });
    channel.on('broadcast', { event: 'world-position-request' }, function (message) {
      if (active === session && session.ready && validMember(session, message.payload)) session.force = true;
    });
  }

  function detach() { active = null; }
  function ready(value) {
    if (!active) return;
    active.ready = value;
    active.force = true;
    if (!value) { active.members.clear(); active.last = null; }
  }

  function members(players) {
    var s = active;
    if (!s) return;
    var next = new Map(), added = false;
    players.forEach(function (p) {
      next.set(p.playerId, p.joinedAt);
      if (p.playerId !== s.self && s.members.get(p.playerId) !== p.joinedAt) added = true;
    });
    s.members = next;
    if (added) {
      s.force = true;
      s.requestCount = 0;
      s.nextRequest = Date.now();
    }
  }

  function snapshot(s) {
    var state = window.S, world = window.Wd;
    if (!state || state.themeId !== s.theme) return null;
    if (state.scene !== 'world' || !document.getElementById('plane')) {
      s.wasWorld = false;
      return s.last ? Object.assign({}, s.last, { moving: false }) : null;
    }
    // Capture the final world step once when an overlay opens. Later personal
    // screen changes remain private, even if another subsystem touches Wd.
    if (state.modal && !s.wasWorld) return s.last ? Object.assign({}, s.last, { moving: false }) : null;
    s.wasWorld = !state.modal;
    if (!world || !Number.isFinite(world.px) || !Number.isFinite(world.py) ||
        directions.indexOf(world.face) < 0) return null;
    return { x: Math.round(world.px * 10) / 10, y: Math.round(world.py * 10) / 10,
      direction: world.face, moving: !state.modal && !!world.moving };
  }

  var lastWarning = 0;
  function warn(error) {
    stats.failures++;
    if (Date.now() - lastWarning < 10000) return;
    lastWarning = Date.now();
    console.warn('[Multiplayer] movement unavailable; local game continues:', error.message);
  }

  async function tick() {
    var s = active;
    if (!s || !s.ready || s.inFlight || Date.now() < s.retryAt ||
        s.members.get(s.self) !== s.joinedAt || !window.S || window.S.themeId !== s.theme) return;
    s.inFlight = true;
    try {
      // Finite bootstrap retries recover a position that preceded Presence sync.
      var remotes = window.ecoRemotePlayers && window.ecoRemotePlayers.remotePlayers;
      var missing = remotes && Object.values(remotes).some(function (p) { return p.lastSeq == null; });
      if (missing && s.requestCount < 3 && Date.now() >= s.nextRequest) {
        s.requestCount++;
        s.nextRequest = Date.now() + 750;
        await s.channel.send({ type: 'broadcast', event: 'world-position-request', payload: {
          playerId: s.self, theme: s.theme, joinedAt: s.joinedAt } });
        stats.requests++;
        if (active !== s || !s.ready) return;
      }
      var next = snapshot(s);
      if (!next) return;
      var last = s.last;
      if (!s.force && last && next.x === last.x && next.y === last.y &&
          next.direction === last.direction && next.moving === last.moving) return;
      s.force = false;
      var result = await s.channel.send({ type: 'broadcast', event: 'world-position', payload:
        Object.assign({ playerId: s.self, theme: s.theme, joinedAt: s.joinedAt, seq: ++sequence }, next) });
      if (active !== s || !s.ready) return;
      if (result !== 'ok') throw new Error('Broadcast returned ' + result);
      s.last = next;
      stats.sent++;
    } catch (error) {
      if (active !== s) return;
      s.force = true;
      s.retryAt = Date.now() + 2000;
      warn(error);
    } finally { s.inFlight = false; }
  }

  var timer = setInterval(tick, INTERVAL);
  window.addEventListener('pagehide', function () { clearInterval(timer); detach(); });
  window.addEventListener('pageshow', function () { clearInterval(timer); timer = setInterval(tick, INTERVAL); });
  window.ecoMovement = { attach: attach, detach: detach, ready: ready, members: members,
    getStats: function () { return Object.assign({ intervalMs: INTERVAL,
      onlineRemotePlayers: window.ecoRemotePlayers ? Object.keys(window.ecoRemotePlayers.remotePlayers).length : 0 }, stats); } };
})();
