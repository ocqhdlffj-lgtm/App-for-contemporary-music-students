(function (LA) {
  // 마지막 결과만 이 기기에 저장한다. 사진은 절대 저장하지 않는다 — 저장되는
  // 건 특징 벡터(숫자 6개)와 설정값뿐이다. 사생활 보호 창 등에서 localStorage가
  // 막혀 있으면 조용히 저장을 건너뛴다(앱 동작에는 지장 없음).
  var KEY = 'la-last-result-v1';

  function save(result) {
    try { localStorage.setItem(KEY, JSON.stringify(result)); } catch (e) { /* 저장 불가 환경 */ }
  }

  function load() {
    try {
      var r = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!r || !r.vector) return null;
      var ok = LA.features.DIMS.every(function (d) { return typeof r.vector[d] === 'number'; });
      return ok ? r : null;
    } catch (e) { return null; }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) { /* 저장 불가 환경 */ }
  }

  // 홈 화면의 스타일링 기준·찾을 범위. 값이 이상하면 기본값을 쓴다.
  var SETTINGS_KEY = 'la-settings-v1';
  var DEFAULT_SETTINGS = { gender: 'F', scope: 'same' };

  function loadSettings() {
    try {
      var s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') || {};
      return {
        gender: s.gender === 'M' ? 'M' : 'F',
        scope: s.scope === 'all' ? 'all' : 'same'
      };
    } catch (e) { return { gender: DEFAULT_SETTINGS.gender, scope: DEFAULT_SETTINGS.scope }; }
  }

  function saveSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ gender: s.gender, scope: s.scope })); } catch (e) { /* 저장 불가 환경 */ }
  }

  LA.storage = {
    save: save, load: load, clear: clear, KEY: KEY,
    loadSettings: loadSettings, saveSettings: saveSettings, SETTINGS_KEY: SETTINGS_KEY
  };
})(window.LA);
