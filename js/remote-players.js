/* Display-only actors. Nothing here is part of S, collision, or saving. */
(function () {
  'use strict';
  var remotePlayers = Object.create(null);
  var localId = null, theme = null, layer = null;
  var animation = null, lastFrame = 0;
  var defaults = { hair: 'messy', face: 'bright', outfit: 'cloak', skin: 'light', haircol: 'brown' };

  function appearance(value) {
    value = value || {};
    var result = {};
    Object.keys(defaults).forEach(function (key) {
      var choices = window.LOOKS && window.LOOKS[key];
      result[key] = choices && choices.some(function (choice) { return choice[0] === value[key]; }) ? value[key] : defaults[key];
    });
    result.direction = ['north', 'south', 'east', 'west'].indexOf(value.direction) >= 0 ? value.direction : 'south';
    return result;
  }

  function remove(id) {
    var player = remotePlayers[id];
    if (player && player.element) player.element.remove();
    delete remotePlayers[id];
  }

  function clear() {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
    Object.keys(remotePlayers).forEach(remove);
    if (layer) layer.remove();
    layer = null;
  }

  // Local test placement only. Replace this policy when movement sync is introduced.
  // Existing records retain their position when other participants arrive/leave.
  function temporaryPosition() {
    var spawn = window.SPAWN, width = window.W, height = window.H;
    if (!spawn || !Number.isFinite(width) || !Number.isFinite(height)) return null;
    var candidates = [], spacing = 112;
    for (var dx = -Math.ceil(width / spacing); dx <= Math.ceil(width / spacing); dx++) {
      for (var dy = -Math.ceil(height / spacing); dy <= Math.ceil(height / spacing); dy++) {
        var x = spawn.x + dx * spacing, y = spawn.y + dy * spacing;
        if (x < 56 || x > width - 56 || y < 112 || y > height - 40) continue;
        candidates.push({ x: x, y: y, distance: dx * dx + dy * dy });
      }
    }
    candidates.sort(function (a, b) { return a.distance - b.distance || b.x - a.x || a.y - b.y; });
    function apart(point, other, radius) { return Math.hypot(point.x - other.x, point.y - other.y) >= radius; }
    return candidates.find(function (point) {
      return apart(point, spawn, 100) &&
        Object.values(remotePlayers).every(function (p) { return !p.position || apart(point, p.position, spacing); }) &&
        (window.OBJS || []).every(function (o) { return apart(point, o, (o.r || 0) + 88); }) &&
        ((window.Wd && window.Wd.solid) || []).every(function (o) { return apart(point, o, (o.r || 0) + 55); }) &&
        ((window.Nd && window.Nd.spots) || []).every(function (n) { return apart(point, n, 90); });
    }) || null;
  }

  function setPosition(player, position) {
    player.position = { x: position.x, y: position.y };
    if (!player.element) return;
    player.element.style.left = position.x + 'px';
    player.element.style.top = position.y + 'px';
    player.element.style.zIndex = Math.floor(position.y) + 1;
  }

  function receivePosition(p) {
    var player = p && remotePlayers[p.playerId];
    if (!player || p.playerId === localId || p.theme !== theme || !window.S ||
        window.S.themeId !== theme || p.joinedAt !== player.joinedAt ||
        !Number.isSafeInteger(p.seq) || p.seq < 1 || (player.lastSeq != null && p.seq <= player.lastSeq) ||
        !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.y < 0 || p.x > window.W || p.y > window.H ||
        typeof p.moving !== 'boolean' || ['north', 'south', 'east', 'west'].indexOf(p.direction) < 0) return false;
    var first = player.lastSeq == null;
    player.lastSeq = p.seq;
    player.targetX = p.x; player.targetY = p.y;
    player.networkMoving = p.moving;
    player.appearance.direction = p.direction;
    if (first || !player.position || Math.hypot(player.position.x - p.x, player.position.y - p.y) > 240) {
      setPosition(player, { x: p.x, y: p.y });
    }
    if (player.element) paint(player);
    scheduleAnimation();
    return true;
  }

  function scheduleAnimation() {
    if (animation !== null) return;
    lastFrame = performance.now();
    animation = requestAnimationFrame(animate);
  }

  function animate(now) {
    animation = null;
    try {
      if (!window.S || window.S.themeId !== theme || window.S.scene !== 'world' || !layer || layer.hidden) return;
      var dt = Math.min(100, Math.max(0, now - lastFrame));
      lastFrame = now;
      var alpha = 1 - Math.exp(-dt / 65), pending = false;
      Object.values(remotePlayers).forEach(function (p) {
        if (p.lastSeq == null || !p.position || !p.element) return;
        var dx = p.targetX - p.position.x, dy = p.targetY - p.position.y;
        var distance = Math.hypot(dx, dy);
        var x = distance < 0.4 ? p.targetX : p.position.x + dx * alpha;
        var y = distance < 0.4 ? p.targetY : p.position.y + dy * alpha;
        var travel = Math.hypot(x - p.position.x, y - p.position.y);
        if (travel) setPosition(p, { x: x, y: y });
        if (typeof window.syncStride === 'function') {
          p.animationState = p.animationState || {};
          window.syncStride(p.element, p.animationState, p.networkMoving ? travel : 0);
        }
        if (distance >= 0.4) pending = true;
      });
      if (pending) animation = requestAnimationFrame(animate);
    } catch (error) { console.warn('[RemotePlayers] movement display unavailable:', error.message); }
  }

  function paint(player) {
    var look = player.appearance;
    var signature = JSON.stringify(look);
    player.label.textContent = player.nickname;
    if (player.artSignature === signature) return;
    var direction = window.sideDir(look.direction);
    var bodyKey = 'body_' + look.outfit + '_' + direction;
    var headKey = window.customHeadKey(look.hair, look.face, look.direction);
    [ [player.body, bodyKey], [player.head, headKey] ].forEach(function (part) {
      // Reuse the existing per-palette tint cache/refresh hook, never data-hero
      // (which refreshes using the LOCAL player's skin and hair colour).
      part[0].dataset.npcTint = part[1] + '|' + look.skin + '_' + look.haircol;
      part[0].style.backgroundImage = 'url("' + window.npcTint(part[1], look.skin, look.haircol) + '")';
    });
    player.flip.classList.toggle('flip', look.direction === 'east');
    player.artSignature = signature;
  }

  function create(player) {
    var node = document.createElement('div');
    node.className = 'actor eco-remote-player';
    node.dataset.remotePlayerId = player.playerId;
    node.style.cssText = 'width:88px;height:88px;pointer-events:none;user-select:none;';
    var shadow = document.createElement('div'); shadow.className = 'shadow';
    var flip = document.createElement('div'); flip.className = 'flipwrap';
    flip.style.cssText = 'width:88px;height:88px;';
    var avatar = document.createElement('div'); avatar.className = 'avatar';
    avatar.style.cssText = 'width:100%;height:100%;animation:none;';
    var body = document.createElement('div'); body.className = 'sprite';
    var head = document.createElement('div'); head.className = 'sprite head';
    var label = document.createElement('div'); label.className = 'nametag';
    avatar.append(body, head); flip.appendChild(avatar); node.append(shadow, flip, label);
    Object.assign(player, { element: node, flip: flip, body: body, head: head, label: label, artSignature: null });
    paint(player);
    layer.appendChild(node);
    setPosition(player, player.position);
  }

  function refresh() {
    try {
      var state = window.S;
      if (!state || state.themeId !== theme) { clear(); return; }
      var plane = document.getElementById('plane');
      if (!plane || state.scene !== 'world') {
        if (layer) layer.remove();
        layer = null;
        return;
      }
      if (!layer || layer.parentNode !== plane) {
        if (layer) layer.remove();
        layer = document.createElement('div');
        layer.id = 'ecoRemoteLayer';
        layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        plane.appendChild(layer);
      }
      // Do not draw on battle, minigame, farm, or modal overlays.
      layer.hidden = !!state.modal;
      Object.values(remotePlayers).forEach(function (player) {
        if (!player.position) player.position = temporaryPosition();
        if (!player.position) return;
        if (!player.element || player.element.parentNode !== layer) create(player);
        else paint(player);
      });
      if (!layer.hidden && Object.values(remotePlayers).some(function (p) { return p.lastSeq != null; })) scheduleAnimation();
    } catch (error) { console.warn('[RemotePlayers] display unavailable:', error.message); }
  }

  function sync(self, currentTheme, players) {
    localId = self;
    if (theme !== currentTheme) { clear(); theme = currentTheme; }
    var keep = new Set();
    players.forEach(function (p) {
      if (p.playerId === localId || p.theme !== theme) return;
      keep.add(p.playerId);
      var player = remotePlayers[p.playerId];
      if (player && player.joinedAt !== p.joinedAt) { remove(p.playerId); player = null; }
      if (!player) player = remotePlayers[p.playerId] = { playerId: p.playerId, position: null, element: null };
      player.nickname = p.nickname;
      player.theme = p.theme;
      player.joinedAt = p.joinedAt;
      var direction = player.lastSeq != null && player.appearance.direction;
      player.appearance = appearance(p);
      if (direction) player.appearance.direction = direction;
    });
    Object.keys(remotePlayers).forEach(function (id) { if (!keep.has(id)) remove(id); });
    refresh();
  }

  window.ecoRemotePlayers = { remotePlayers: remotePlayers, appearance: appearance,
    sync: sync, refresh: refresh, temporaryPosition: temporaryPosition, setPosition: setPosition,
    receivePosition: receivePosition };
  // A map is rebuilt when returning from the theme menu. Remount the same records.
  var screen = document.getElementById('screen');
  if (screen) new MutationObserver(refresh).observe(screen, { childList: true, attributes: true, attributeFilter: ['data-scene'] });
})();
