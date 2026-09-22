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

  // "YYYY-MM-DD" 두 문자열이 정확히 하루 차이인지 판정한다. 순수 달력 연산이라
  // Date.UTC로 만든 타임스탬프끼리 밀리초 차이만 비교한다 — 이 프로젝트가 금지하는
  // "new Date(문자열)로 로컬 시간대 파싱"과는 다르다(그건 기기 시간대에 따라
  // 날짜가 하루 밀리는 문제가 있어 금지한 것). 여기는 렌더링·저장을 전혀 하지
  // 않고 두 UTC 타임스탬프의 차이만 보므로 시간대 영향이 없다.
  function isNextDay(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    var ta = Date.UTC(+pa[0], +pa[1] - 1, +pa[2]);
    var tb = Date.UTC(+pb[0], +pb[1] - 1, +pb[2]);
    return (tb - ta) === 86400000;
  }

  // 실기고사일 배열을 화면에 표시할 문자열로 바꾼다.
  //
  // 규칙 1(날짜 정확히 2개): 실제 요강 전수를 보면 예외 없이 "그 기간 중
  // 하루를 배정받는" 시작~끝 구간이었다(예: 호원대 "2026.10.01~10.11 중
  // 지원자 배정일"). 서로 무관한 날짜 2개를 담은 사례는 없었으므로 간격과
  // 무관하게 항상 기간으로 표시한다.
  //
  // 규칙 2(3개 이상): 연속된 날짜끼리 묶어 "시작~끝"으로, 묶이지 않는 날은
  // 그대로, 묶음 사이는 콤마로 구분한다. 예: 동아방송예술대 9개 날짜
  // [10-12~10-18, 10-24~10-25]는 1단계·2단계 두 시험 구간이라
  // "10-12 ~ 10-18, 10-24 ~ 10-25"로 표시된다(9개를 그대로 나열하면
  // 두 구간이라는 사실이 묻힌다).
  //
  // ⚠ 주의: 이 표시 규칙은 화면용일 뿐이다. js/conflict.js의 충돌 검사는 여전히
  // 배열의 각 값만 정확히 비교하므로, 기간 내 실제 배정일(예: 10-05)이 다른
  // 학교와 겹쳐도 지금은 감지하지 못한다 — 데이터 모델에 "기간" 개념이 아직
  // 없다는 뜻이며, 추후 스키마 확장이 필요한 별도 과제로 남겨둔다.
  function formatDates(dates) {
    if (!dates || !dates.length) return null;
    if (dates.length === 1) return dates[0];
    if (dates.length === 2) return dates[0] + ' ~ ' + dates[1];

    var sorted = dates.slice().sort();
    var groups = [];
    var run = [sorted[0]];
    for (var i = 1; i < sorted.length; i++) {
      if (isNextDay(sorted[i - 1], sorted[i])) {
        run.push(sorted[i]);
      } else {
        groups.push(run);
        run = [sorted[i]];
      }
    }
    groups.push(run);

    return groups.map(function (g) {
      return g.length >= 2 ? g[0] + ' ~ ' + g[g.length - 1] : g[0];
    }).join(', ');
  }

  PM.ui.el = el;
  PM.ui.badge = badge;
  PM.ui.levelBadge = levelBadge;
  PM.ui.disclaimerBar = disclaimerBar;
  PM.ui.progressText = progressText;
  PM.ui.expansionNotice = expansionNotice;
  PM.ui.formatDates = formatDates;
})(window.PM);
