// Local-only 35-member display/load fixture. Served only with ?load35&no-cdn=1.
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var result = document.createElement('pre');
    result.id = 'load35-result';
    result.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:6000;max-width:55vw;max-height:180px;overflow:auto;background:#fff;color:#000;font:11px monospace;white-space:pre-wrap;';
    var button = document.createElement('button');
    button.id = 'run-load35'; button.textContent = 'run 35 load suite';
    button.style.cssText = 'position:fixed;left:8px;bottom:195px;z-index:6000;';
    document.body.append(result, button);
    var battleButton = document.createElement('button'); battleButton.textContent = 'test battle entry';
    battleButton.style.cssText = 'position:fixed;left:270px;bottom:195px;z-index:6000;';
    battleButton.addEventListener('click', function () { window.admFight(); });
    var miniButton = document.createElement('button'); miniButton.textContent = 'test minigame entry';
    miniButton.style.cssText = 'position:fixed;left:390px;bottom:195px;z-index:6000;';
    miniButton.addEventListener('click', function () { window.admMini('pang'); });
    document.body.append(battleButton, miniButton);
    var data = { status: 'ready', scenarios: {}, errors: [] };
    window.load35Result = data;
    function publish() { result.textContent = JSON.stringify(data, null, 2); }
    function sleep(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
    function countNodes() { return document.getElementsByTagName('*').length; }
    function percentile(sorted, p) { return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : null; }
    function frames(values) {
      var sorted = values.slice().sort(function (a, b) { return a - b; });
      var average = values.reduce(function (sum, n) { return sum + n; }, 0) / (values.length || 1);
      return { samples: values.length, averageFps: Math.round(1000 / average * 10) / 10,
        p95Ms: percentile(sorted, .95), p99Ms: percentile(sorted, .99), over50Ms: values.filter(function (n) { return n > 50; }).length };
    }
    function member(i) {
      return { playerId: i === 0 ? 'sim-self' : 'sim-' + String(i).padStart(2, '0'),
        nickname: i === 0 ? '시험자 (자기)' : '긴 닉네임 시험 플레이어 ' + String(i).padStart(2, '0'),
        theme: 'forest', joinedAt: 'mock-' + i,
        hair: ['messy', 'long', 'pony'][i % 3], face: ['bright', 'bold', 'calm'][Math.floor(i / 3) % 3],
        outfit: ['cloak', 'robe', 'soccer'][Math.floor(i / 9) % 3],
        skin: ['light', 'deep', 'tan'][i % 3], haircol: ['brown', 'red', 'blonde', 'black'][i % 4], direction: 'south',
        spirit: '조약돌 정령', level: i + 1, equipment: '시험용 긴 장비 이름 ' + i, progress: '숲 진행 단계 ' + i };
    }
    var all = Array.from({ length: 35 }, function (_, i) { return member(i); });
    var seq = Object.create(null);
    var showButton = document.createElement('button');
    showButton.textContent = 'show 35 roster';
    showButton.style.cssText = 'position:fixed;left:140px;bottom:195px;z-index:6000;';
    showButton.addEventListener('click', function () {
      window.ecoRemotePlayers.sync('sim-self', 'forest', all);
      window.ecoOnlinePlayers.update('sim-self', 'forest', all);
      window.ecoOnlinePlayers.open();
    });
    document.body.appendChild(showButton);
    function sendPositions(people, step, moving) {
      var accepted = 0, start = performance.now();
      people.forEach(function (p, index) {
        if (p.playerId === 'sim-self') return;
        var i = Number(p.playerId.slice(4));
        seq[p.playerId] = (seq[p.playerId] || 0) + 1;
        var payload = { playerId: p.playerId, theme: 'forest', joinedAt: p.joinedAt, seq: seq[p.playerId],
          x: 210 + (i % 7) * 110 + step * 2, y: 260 + Math.floor(i / 7) * 125 + step,
          direction: ['north', 'south', 'east', 'west'][i % 4], moving: moving };
        if (window.ecoRemotePlayers.receivePosition(payload)) accepted++;
      });
      return { accepted: accepted, processingMs: performance.now() - start };
    }
    button.addEventListener('click', async function () {
      button.disabled = true; data.status = 'running'; publish();
      var remote = window.ecoRemotePlayers, online = window.ecoOnlinePlayers;
      var intervals = [], longTasks = [], remoteFrames = 0, phase = 'initial';
      var burstStart = 0, burstEnd = 0, spacedStart = 0, spacedEnd = 0;
      var originalFrame = window.requestAnimationFrame, last = 0, observing = true;
      window.requestAnimationFrame = function (callback) {
        if (callback && callback.name === 'animate') remoteFrames++;
        return originalFrame.apply(this, arguments);
      };
      var observer = null;
      try { observer = new PerformanceObserver(function (list) { list.getEntries().forEach(function (entry) {
        longTasks.push({ startTime: entry.startTime, duration: entry.duration });
      }); }); observer.observe({ entryTypes: ['longtask'] }); }
      catch (_) { observer = null; }
      function sample(now) { if (last && observing) intervals.push(now - last); last = now; if (observing) originalFrame(sample); }
      originalFrame(sample);
      try {
        var initialNodes = countNodes(), start = performance.now();
        remote.sync('sim-self', 'forest', all); online.update('sim-self', 'forest', all);
        var initialSyncMs = performance.now() - start;
        var first = sendPositions(all, 0, false); remote.refresh();
        await sleep(1200);
        data.scenarios.initial = { members: all.length, remoteRecords: Object.keys(remote.remotePlayers).length,
          remoteDom: document.querySelectorAll('.eco-remote-player').length, initialSyncMs: initialSyncMs,
          initialPositions: first, nodesBefore: initialNodes, nodesAfter: countNodes() };
        phase = 'idle'; var idleBefore = remoteFrames; await sleep(2500);
        data.scenarios.idle = { remoteAnimationFrames: remoteFrames - idleBefore,
          broadcastSent: window.ecoMovement.getStats().sent };
        phase = 'allMoving'; var moves = 0, ms = 0;
        for (var step = 1; step <= 16; step++) {
          var batch = sendPositions(all, step, true); moves += batch.accepted; ms += batch.processingMs;
          await sleep(125);
        }
        data.scenarios.allMoving = { acceptedMessages: moves, processingMs: ms,
          frames: frames(intervals.slice(-150)), remoteAnimationFrames: remoteFrames - idleBefore };
        phase = 'halfMoving'; var half = all.filter(function (_, i) { return i === 0 || i % 2 === 0; }), halfMoves = 0;
        for (var h = 17; h <= 24; h++) { halfMoves += sendPositions(half, h, true).accepted; await sleep(125); }
        data.scenarios.halfMoving = { membersMoving: half.length - 1, acceptedMessages: halfMoves };
        phase = 'settled'; sendPositions(all, 25, false); await sleep(1300);
        var settled = remoteFrames; await sleep(1000);
        data.scenarios.settled = { remoteAnimationFrames: remoteFrames - settled };
        var packet = { playerId: 'sim-01', theme: 'forest', joinedAt: 'mock-1', seq: seq['sim-01'] - 1,
          x: 300, y: 300, direction: 'north', moving: true };
        data.scenarios.validation = { oldSeqRejected: !remote.receivePosition(packet),
          otherThemeRejected: !remote.receivePosition(Object.assign({}, packet, { theme: 'river', seq: 9999 })),
          selfRejected: !remote.receivePosition(Object.assign({}, packet, { playerId: 'sim-self', seq: 9999 })),
          absentRejected: !remote.receivePosition(Object.assign({}, packet, { playerId: 'absent', seq: 9999 })) };
        phase = 'membership'; var reduced = all.filter(function (_, i) { return i < 25; });
        remote.sync('sim-self', 'forest', reduced); online.update('sim-self', 'forest', reduced);
        data.scenarios.tenLeave = { remoteRecords: Object.keys(remote.remotePlayers).length,
          remoteDom: document.querySelectorAll('.eco-remote-player').length };
        remote.sync('sim-self', 'forest', all); online.update('sim-self', 'forest', all);
        sendPositions(all.slice(25), 26, false); remote.refresh();
        data.scenarios.tenJoin = { remoteRecords: Object.keys(remote.remotePlayers).length,
          remoteDom: document.querySelectorAll('.eco-remote-player').length };
        var foreign = Object.assign({}, member(36), { theme: 'river' });
        remote.sync('sim-self', 'forest', all.concat(foreign)); online.update('sim-self', 'forest', all.concat(foreign));
        data.scenarios.themeFilter = { remoteRecords: Object.keys(remote.remotePlayers).length };
        phase = 'roster'; online.open();
        var renderTimes = [], changed = all.map(function (p) { return Object.assign({}, p); });
        for (var n = 0; n < 35; n++) {
          changed[n].level++;
          changed[n].equipment = '새 장비 ' + n;
          changed[n].progress = '숲 변경 단계 ' + n;
          var t = performance.now(); online.update('sim-self', 'forest', changed); renderTimes.push(performance.now() - t);
        }
        var scroll = document.querySelector('.eco-online-scroll'), head = document.querySelector('.eco-online th');
        var rows = document.querySelectorAll('#ecoOnlineRows tr');
        data.scenarios.roster = { rows: rows.length, selfFirst: rows[0]?.textContent.includes('(나)'),
          secondLevel: rows[1]?.textContent, renderTimesMs: { average: renderTimes.reduce(function (a, b) { return a + b; }, 0) / renderTimes.length,
            p95: percentile(renderTimes.slice().sort(function (a, b) { return a - b; }), .95), max: Math.max.apply(null, renderTimes) },
          scrollHeight: scroll?.scrollHeight, clientHeight: scroll?.clientHeight,
          stickyHeader: head && getComputedStyle(head).position,
          withinViewport: !!scroll && scroll.getBoundingClientRect().bottom <= innerHeight };
        window.closeModal();
        await sleep(0); // Isolate the deliberately instantaneous theme burst as its own task.
        phase = 'themeCycles'; var beforeLoops = countNodes(), cycleStart = performance.now();
        burstStart = cycleStart;
        for (var cycle = 0; cycle < 20; cycle++) {
          remote.sync('sim-self', 'river', [{ playerId: 'sim-self', theme: 'river', joinedAt: 'mock-0', nickname: '시험자' }]);
          online.update('sim-self', 'river', []);
          remote.sync('sim-self', 'forest', all);
          online.update('sim-self', 'forest', all);
          sendPositions(all, 100 + cycle, false); remote.refresh();
        }
        burstEnd = performance.now();
        data.scenarios.themeCycles = { cycles: 20, processingMs: burstEnd - cycleStart,
          remoteRecords: Object.keys(remote.remotePlayers).length,
          remoteDom: document.querySelectorAll('.eco-remote-player').length,
          nodesBefore: beforeLoops, nodesAfter: countNodes() };
        phase = 'spacedThemeCycles'; spacedStart = performance.now(); var longestCycle = 0;
        for (var spaced = 0; spaced < 20; spaced++) {
          var oneStart = performance.now();
          remote.sync('sim-self', 'river', [{ playerId: 'sim-self', theme: 'river', joinedAt: 'mock-0', nickname: '시험자' }]);
          remote.sync('sim-self', 'forest', all);
          sendPositions(all, 200 + spaced, false); remote.refresh();
          longestCycle = Math.max(longestCycle, performance.now() - oneStart);
          await sleep(75);
        }
        spacedEnd = performance.now();
        data.scenarios.spacedThemeCycles = { cycles: 20, wallMs: spacedEnd - spacedStart,
          longestCycleMs: longestCycle, remoteRecords: Object.keys(remote.remotePlayers).length,
          remoteDom: document.querySelectorAll('.eco-remote-player').length,
          nodesAfter: countNodes() };
        remote.sync('sim-self', 'forest', [all[0]]); online.update('sim-self', 'forest', [all[0]]);
        data.scenarios.cleanup = { remoteRecords: Object.keys(remote.remotePlayers).length,
          remoteDom: document.querySelectorAll('.eco-remote-player').length, nodes: countNodes() };
        await sleep(100); // Let PerformanceObserver deliver the final theme-cycle entry.
        data.scenarios.frameAll = frames(intervals);
        data.scenarios.longTasks = { supported: !!observer, count: longTasks.length,
          maxMs: longTasks.length ? Math.max.apply(null, longTasks.map(function (entry) { return entry.duration; })) : 0,
          phases: longTasks.map(function (entry) {
            return entry.startTime >= burstStart && entry.startTime <= burstEnd ? 'instantThemeCycles' :
              entry.startTime >= spacedStart && entry.startTime <= spacedEnd ? 'spacedThemeCycles' : 'other';
          }) };
        data.status = 'done';
      } catch (error) { data.status = 'failed'; data.errors.push(error.stack || String(error)); }
      finally { observing = false; if (observer) observer.disconnect(); window.requestAnimationFrame = originalFrame; button.disabled = false; publish(); }
    });
    publish();
  });
})();
