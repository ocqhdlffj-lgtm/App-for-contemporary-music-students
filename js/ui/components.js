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

  // 실기고사일 배열을 화면에 표시할 문자열로 바꾼다. 실제 요강 전수를 보면
  // 날짜가 정확히 2개인 경우는 예외 없이 "그 기간 중 하루를 배정받는" 시작~끝
  // 구간이었다(예: 호원대 "2026.10.01~10.11 중 지원자 배정일"). 서로 무관한
  // 날짜 2개를 담은 사례는 없었다. 반면 3개 이상은 수시1차/2차처럼 완전히 별도인
  // 다회차 시험일 목록이라 콤마 나열이 맞다. 날짜 1개는 그대로 보여준다.
  // ⚠ 주의: 이 표시 규칙은 화면용일 뿐이다. js/conflict.js의 충돌 검사는 여전히
  // 배열의 각 값만 정확히 비교하므로, 기간 내 실제 배정일(예: 10-05)이 다른
  // 학교와 겹쳐도 지금은 감지하지 못한다 — 데이터 모델에 "기간" 개념이 아직
  // 없다는 뜻이며, 추후 스키마 확장이 필요한 별도 과제로 남겨둔다.
  function formatDates(dates) {
    if (!dates || !dates.length) return null;
    if (dates.length === 2) return dates[0] + ' ~ ' + dates[1];
    return dates.join(', ');
  }

  PM.ui.el = el;
  PM.ui.badge = badge;
  PM.ui.levelBadge = levelBadge;
  PM.ui.disclaimerBar = disclaimerBar;
  PM.ui.progressText = progressText;
  PM.ui.expansionNotice = expansionNotice;
  PM.ui.formatDates = formatDates;
})(window.PM);
