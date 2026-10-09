(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  // 카드에 보여줄 실기일 문자열. 전형별로 먼저 표시 문자열을 만든 뒤 합친다.
  // 모든 전형의 날짜를 한 배열로 합쳐 formatDates에 넘기면, 수시1차 10-17과
  // 수시2차 12-03처럼 서로 무관한 두 날짜가 "정확히 2개"라는 이유로
  // "10-17 ~ 12-03"이라는 존재하지 않는 기간으로 보인다.
  function practicalText(school) {
    var parts = [];
    (school.tracks || []).forEach(function (t) {
      var d = (t.schedule && Array.isArray(t.schedule.practical))
        ? t.schedule.practical.slice().sort() : [];
      if (!d.length) return;
      var text = PM.ui.formatDates(d);
      if (!parts.some(function (p) { return p.text === text; })) {
        parts.push({ first: d[0], text: text });
      }
    });
    parts.sort(function (a, b) { return a.first < b.first ? -1 : (a.first > b.first ? 1 : 0); });
    return parts.map(function (p) { return p.text; }).join(', ');
  }

  function quotaText(school, major) {
    if (!major) return null;
    var total = null;
    (school.tracks || []).forEach(function (t) {
      var q = PM.filter.quotaOf(t, major);
      if (q != null) total = (total || 0) + q;
    });
    return total == null ? '미확인' : (total + '명');
  }

  function card(school, opts) {
    var c = el('div', 'card');
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');

    var head = el('div', 'card-head');
    head.appendChild(el('span', 'card-name', school.name));
    head.appendChild(PM.ui.badge(school.type, 'type'));
    head.appendChild(PM.ui.levelBadge(school));
    c.appendChild(head);

    var meta = el('div', 'card-meta');
    meta.appendChild(el('span', null, school.region));
    meta.appendChild(el('span', null, school.deptName));

    var q = quotaText(school, opts.major);
    if (q) meta.appendChild(el('span', null, opts.major + ' ' + q));

    var datesText = practicalText(school);
    var noExamText = (school.tracks || []).length &&
      (school.tracks || []).every(PM.schema.isPracticalConfirmedNone)
      ? '실기 없음' : '실기일 미확인';
    meta.appendChild(el('span', null, datesText ? '실기 ' + datesText : noExamText));
    c.appendChild(meta);

    function fire() { if (opts.onSelect) opts.onSelect(school.id); }
    c.addEventListener('click', fire);
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
    });
    return c;
  }

  function render(schools, opts) {
    var o = opts || {};
    var wrap = el('div', 'list');

    if (!schools || schools.length === 0) {
      wrap.appendChild(el('p', 'empty', '조건에 맞는 학교가 없습니다.'));
      return wrap;
    }
    schools.forEach(function (s) { wrap.appendChild(card(s, o)); });
    return wrap;
  }

  // 선택한 전형 시기(예: 정시)의 정보가 아직 없는 학교 목록. 목록에서 그냥 빠지면
  // "그 시기 전형이 없는 학교"로 읽히므로 별도 묶음으로 보여준다.
  function renderMissing(schools, opts) {
    var o = opts || {};
    var season = o.season || '';
    var wrap = el('div', 'missing');
    wrap.appendChild(el('h3', 'missing-title', season + ' 정보 없음 (' + schools.length + '곳)'));
    wrap.appendChild(el('p', 'muted',
      '아직 ' + season + ' 요강을 확인하지 못한 학교입니다. ' + season +
      ' 전형이 없다는 뜻이 아니니 입학처에서 직접 확인하세요.'));
    schools.forEach(function (s) {
      var row = el('button', 'missing-row');
      row.type = 'button';
      row.appendChild(el('span', 'missing-name', s.name));
      row.appendChild(PM.ui.badge(s.type, 'type'));
      row.appendChild(el('span', 'muted', s.region + ' · ' + s.deptName));
      row.addEventListener('click', function () { if (o.onSelect) o.onSelect(s.id); });
      wrap.appendChild(row);
    });
    return wrap;
  }

  PM.ui.list = { render: render, renderMissing: renderMissing };
})(window.PM);
