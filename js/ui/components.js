(function (PM) {
  PM.ui = PM.ui || {};

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function badge(text, kind) {
    return el('span', 'badge ' + (kind || ''), text);
  }

  function levelBadge(school) {
    var lv = PM.schema.schoolLevel(school);
    return badge(lv, 'level-' + lv);
  }

  function disclaimerBar() {
    return el('div', 'disclaimer',
      '요강은 변경될 수 있습니다. 지원 전 반드시 입학처 원문을 확인하세요.');
  }

  function progressText(schools) {
    var total = (schools || []).length;
    var done = 0;
    (schools || []).forEach(function (s) {
      if (PM.schema.schoolLevel(s) === '확인됨') done++;
    });
    return '세부 확인 ' + done + ' / ' + total + '개교';
  }

  // progressText가 보여주는 총 학교 수(M)는 검증된 하한선일 뿐, 전국 실용음악과
  // 개설 학교의 전수가 아니다(task-13 R24 조사 결과: 65곳 확인, 그 외는 근거
  // 부족으로 제외한 것이지 실제로 학과가 없다는 뜻이 아니다). progressText만 보면
  // "M개교가 전부"라고 오인해, 목록에 없는 학교를 실제로 학과가 없는 것으로
  // 잘못 판단할 위험이 있다 — 이 함수는 그 오인을 막기 위한 상시 고지다.
  function expansionNotice() {
    return el('div', 'expansion-notice',
      '학교 목록을 계속 추가하는 중입니다. 찾는 학교가 없으면 입학처에서 직접 확인하세요.');
  }

  // 확인됨 등급이면서 schedule.practical이 빈 배열이면 "실기고사가 없다"는
  // 확인된 사실이다 — 날짜를 모른다는 뜻(미확인)과는 다르다. 이 둘을 구분해야
  // list/mylist 화면이 "실기일 미확인"으로 뭉뚱그려 재확인을 요구하지 않는다.
  function isPracticalConfirmedNone(track) {
    return !!(track && track.verification && track.verification.level === '확인됨' &&
      track.schedule && Array.isArray(track.schedule.practical) &&
      track.schedule.practical.length === 0);
  }

  PM.ui.el = el;
  PM.ui.badge = badge;
  PM.ui.levelBadge = levelBadge;
  PM.ui.disclaimerBar = disclaimerBar;
  PM.ui.progressText = progressText;
  PM.ui.expansionNotice = expansionNotice;
  PM.ui.isPracticalConfirmedNone = isPracticalConfirmedNone;
})(window.PM);
