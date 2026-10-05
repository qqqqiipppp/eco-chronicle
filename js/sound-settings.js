/* Small sound controls outside the game's replaced screens and saved player state. */
(function () {
  'use strict';
  var frame = document.querySelector('.device');
  if (!frame || typeof Au === 'undefined') return;
  var controls = document.createElement('div');
  controls.className = 'eco-sound-settings';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', '소리 설정');
  controls.innerHTML = '<button id="ecoSoundMute" class="iconbtn" type="button"></button>' +
    '<button id="ecoSoundOpen" class="iconbtn" type="button" aria-expanded="false" aria-controls="ecoSoundPanel">볼륨</button>' +
    '<div id="ecoSoundPanel" class="eco-sound-panel" hidden><div class="eco-sound-label">' +
    '<label for="ecoSoundVolume">볼륨</label><output id="ecoSoundVolumeValue" for="ecoSoundVolume"></output></div>' +
    '<input id="ecoSoundVolume" type="range" min="0" max="100" step="1" value="80" aria-label="볼륨"></div>';
  frame.appendChild(controls);
  var mute = controls.querySelector('#ecoSoundMute');
  var open = controls.querySelector('#ecoSoundOpen');
  var panel = controls.querySelector('#ecoSoundPanel');
  var slider = controls.querySelector('#ecoSoundVolume');
  var value = controls.querySelector('#ecoSoundVolumeValue');

  function update() {
    var percent = Math.round(Au.masterVolume * 100);
    mute.textContent = Au.muted ? '🔇' : (percent <= 35 ? '🔉' : '🔊');
    mute.setAttribute('aria-label', Au.muted ? '소리 켜기' : '소리 끄기');
    mute.setAttribute('aria-pressed', String(!Au.muted));
    mute.title = (Au.muted ? '소리 꺼짐' : '소리 켜짐') + ' · 볼륨 ' + percent + '%';
    slider.value = String(percent);
    slider.setAttribute('aria-valuetext', percent + '%');
    value.textContent = percent + '%';
  }
  function close() { panel.hidden = true; open.setAttribute('aria-expanded', 'false'); }
  mute.addEventListener('click', auToggle);
  open.addEventListener('click', function () {
    panel.hidden = !panel.hidden;
    open.setAttribute('aria-expanded', String(!panel.hidden));
  });
  slider.addEventListener('input', function () { auSetVolume(Number(slider.value) / 100); });
  slider.addEventListener('change', function () { auSetVolume(Number(slider.value) / 100); });
  // Keep native range/keyboard behavior; sound controls must not become game input.
  function unlock() { auResume(); bgmUpdate(); }
  controls.addEventListener('pointerdown', function (event) {
    event.stopPropagation(); releaseKeys(); unlock();
  });
  controls.addEventListener('touchstart', function (event) { event.stopPropagation(); }, { passive: true });
  controls.addEventListener('click', function (event) { event.stopPropagation(); });
  controls.addEventListener('keydown', function (event) {
    event.stopPropagation(); unlock();
    if (event.key === 'Escape') { close(); open.focus(); }
  });
  document.addEventListener('pointerdown', function (event) {
    if (!controls.contains(event.target)) close();
  });
  window.ecoSoundSettings = { update: update };
  update(); // Reading stored settings never starts or resumes audio.
})();
