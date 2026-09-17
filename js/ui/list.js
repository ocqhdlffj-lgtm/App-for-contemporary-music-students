(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  function practicalDates(school) {
    var out = [];
    (school.tracks || []).forEach(function (t) {
      if (t.schedule && Array.isArray(t.schedule.practical)) {
        t.schedule.practical.forEach(function (d) {
          if (out.indexOf(d) < 0) out.push(d);
        });
      }
    });
    return out.sort();
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

    var dates = practicalDates(school);
    var noExamText = (school.tracks || []).length &&
      (school.tracks || []).every(PM.ui.isPracticalConfirmedNone)
      ? '실기 없음' : '실기일 미확인';
    meta.appendChild(el('span', null,
      dates.length ? '실기 ' + dates.join(', ') : noExamText));
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

  PM.ui.list = { render: render };
})(window.PM);
