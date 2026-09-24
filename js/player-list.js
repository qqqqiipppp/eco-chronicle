/* Read-only, theme-scoped online roster. No game or save state is changed. */
(function () {
  'use strict';
  var roster = [], selfId = null, rosterTheme = null, online = false;
  var fields = ['spirit', 'equipment', 'progress'];

  function clean(value, limit) {
    return typeof value === 'string'
      ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, limit) : '';
  }

  function summary(state) {
    if (!state) return { spirit: '없음', level: 1, equipment: '없음', progress: '정보 없음' };
    var pet = window.PETS && window.PETS[state.petKey];
    var spirit = pet && typeof window.petName === 'function' ? window.petName() : '없음';
    var equipment = '없음';
    ['weapon', 'armor', 'helm', 'shoes'].some(function (slot) {
      var id = state.gear && state.gear[slot];
      var item = id && typeof window.gearFind === 'function' && window.gearFind(slot, id);
      if (!item) return false;
      equipment = item.name;
      return true;
    });
    var theme = window.THEMES && window.THEMES[state.themeId];
    var progress = '정보 없음';
    if (theme) {
      if ((state.cleared || []).indexOf(state.themeId) >= 0) progress = theme.name + ' 정화 완료';
      else if (Array.isArray(theme.monsters) && theme.monsters.length) {
        var index = Math.max(0, Math.min(theme.monsters.length - 1, Number(state.monIdx) || 0));
        progress = theme.name + ' ' + (theme.monsters[index].boss ? '보스' : (index + 1) + '단계');
      } else progress = theme.name;
    }
    return { spirit: clean(spirit, 24) || '없음',
      level: Number.isSafeInteger(state.lv) && state.lv > 0 ? state.lv : 1,
      equipment: clean(equipment, 32) || '없음', progress: clean(progress, 32) || '정보 없음' };
  }

  function sanitize(value) {
    var result = {};
    fields.forEach(function (key) { result[key] = clean(value && value[key], key === 'equipment' ? 32 : 24) || (key === 'progress' ? '정보 없음' : '없음'); });
    result.level = value && Number.isSafeInteger(value.level) && value.level > 0 && value.level < 1000 ? value.level : 1;
    return result;
  }

  function update(id, theme, players) {
    var previous = JSON.stringify([selfId, rosterTheme, online, roster]);
    selfId = id;
    rosterTheme = theme;
    online = !!theme;
    roster = online ? players.filter(function (p) { return p.theme === theme; }).map(function (p) {
      return Object.assign({ playerId: p.playerId, nickname: clean(p.nickname, 24), theme: p.theme }, sanitize(p));
    }) : [];
    if (JSON.stringify([selfId, rosterTheme, online, roster]) !== previous) render();
  }

  function cell(row, label, value) {
    var td = document.createElement('td');
    td.dataset.label = label;
    td.title = value;
    td.textContent = value;
    row.appendChild(td);
  }

  function render() {
    var body = document.getElementById('ecoOnlineRows');
    if (!body) return;
    body.replaceChildren();
    var state = window.S;
    var theme = state && state.themeId;
    var current = online && theme === rosterTheme ? roster.slice() : [];
    var count = document.getElementById('ecoOnlineCount');
    if (count) count.textContent = current.length + '명 · ' + (window.THEMES && window.THEMES[theme] ? window.THEMES[theme].name : '현재 테마');
    if (!current.length) {
      var row = document.createElement('tr'), td = document.createElement('td');
      td.colSpan = 5;
      td.className = 'eco-online-empty';
      td.textContent = online && theme === rosterTheme ? '온라인 정보 없음' : '연결할 수 없습니다';
      row.appendChild(td); body.appendChild(row);
      return;
    }
    current.sort(function (a, b) {
      return (a.playerId === selfId ? -1 : 0) - (b.playerId === selfId ? -1 : 0) ||
        b.level - a.level || a.nickname.localeCompare(b.nickname, 'ko') || a.playerId.localeCompare(b.playerId);
    });
    current.forEach(function (p) {
      var row = document.createElement('tr');
      if (p.playerId === selfId) row.className = 'eco-online-me';
      cell(row, '닉네임', p.nickname + (p.playerId === selfId ? ' (나)' : ''));
      cell(row, '정령', p.spirit);
      cell(row, '레벨', 'Lv. ' + p.level);
      cell(row, '장비', p.equipment);
      cell(row, '진행 단계', p.progress);
      body.appendChild(row);
    });
  }

  function open() {
    if (!window.S || window.S.scene !== 'world' || window.S.modal || typeof window.openModal !== 'function') return;
    window.openModal('online'); // Existing modal blocks world input and Escape closes it.
    mount();
  }

  function mount() {
    if (!window.S || window.S.modal !== 'online') return;
    var sheet = document.querySelector('#modalHost .sheet');
    if (!sheet || sheet.querySelector('.eco-online')) return;
    sheet.classList.add('eco-online-sheet');
    sheet.innerHTML = '<div class="eco-online"><div class="mhead"><span>🌿 현재 접속인원</span><button class="iconbtn eco-online-close" type="button">닫기</button></div>' +
      '<p class="eco-online-sub">같은 지역에 있는 플레이어</p><div id="ecoOnlineCount" class="eco-online-count"></div>' +
      '<div class="eco-online-scroll"><table><thead><tr><th>닉네임</th><th>정령</th><th>레벨</th><th>장비</th><th>진행 단계</th></tr></thead>' +
      '<tbody id="ecoOnlineRows"></tbody></table></div></div>';
    sheet.querySelector('.eco-online-close').addEventListener('click', function () { window.closeModal(); });
    render();
  }

  function ensureButton() {
    var buttons = document.querySelector('#hudHost .hudbtns');
    if (!buttons || buttons.querySelector('.eco-online-button')) return;
    var button = document.createElement('button');
    button.className = 'iconbtn eco-online-button';
    button.type = 'button';
    button.textContent = '접속인원';
    button.addEventListener('click', open);
    buttons.insertBefore(button, buttons.querySelector('#saveDot')?.parentElement || null);
  }

  window.ecoOnlinePlayers = { summary: summary, sanitize: sanitize, update: update, open: open };
  setInterval(function () { ensureButton(); mount(); }, 300);
  ensureButton();
})();
