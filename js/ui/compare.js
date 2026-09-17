(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;
  var fmt = PM.ui.detail.fmt;
  var MAX = 3;

  // 컨테이너(ratio/quota 등)가 존재해도 그 안의 개별 값은 null일 수 있다.
  // task-10에서 t.quota[m] + '명' 형태가 화면에 리터럴 "null명"을 노출시켰던
  // 버그와 동일한 패턴이므로, 컨테이너 유무만 보고 안의 값을 그대로 문자열
  // 접합하지 않는다 — 모든 값은 PM.ui.detail.fmt를 거친다. fmt(0, ...)은
  // '0...'을 그대로 돌려주므로(진짜 0을 미확인으로 뭉개지 않음) falsy 체크
  // 대신 안전하다.
  var ROWS = [
    { label: '구분',      get: function (s, t) { return s.type; } },
    { label: '지역',      get: function (s, t) { return s.region; } },
    { label: '전형',      get: function (s, t) { return t.season + ' · ' + t.name; } },
    { label: '곡 수',     get: function (s, t) { return t.practical ? fmt(t.practical.songCount, '곡') : '미확인'; } },
    { label: '곡 유형',   get: function (s, t) { return t.practical ? fmt(t.practical.songType) : '미확인'; } },
    { label: '반주',      get: function (s, t) { return t.practical ? fmt(t.practical.accompaniment) : '미확인'; } },
    { label: '실기 비율', get: function (s, t) { return t.ratio ? fmt(t.ratio['실기'], '%') : '미확인'; } },
    { label: '수능최저',  get: function (s, t) { return ('minCsat' in t) ? (t.minCsat === null ? '없음' : t.minCsat) : '미확인'; } },
    { label: '실기고사일', get: function (s, t) { return (t.schedule && t.schedule.practical && t.schedule.practical.length) ? PM.ui.formatDates(t.schedule.practical) : '미확인'; } },
    { label: '모집인원',  get: function (s, t) {
        if (!t.quota) return '미확인';
        var keys = Object.keys(t.quota);
        if (!keys.length) return '미확인';
        return keys.map(function (m) { return m + ' ' + fmt(t.quota[m], '명'); }).join(', ');
      } }
  ];

  function render(schools, picks, opts) {
    var o = opts || {};
    var wrap = el('div', 'compare');
    wrap.appendChild(el('h2', null, '비교'));

    var entries = [];
    var byId = {};
    (schools || []).forEach(function (s) { byId[s.id] = s; });
    (picks || []).forEach(function (p) {
      var s = byId[p.schoolId];
      if (!s) return;
      var t = (s.tracks || []).filter(function (x) { return x.id === p.trackId; })[0];
      if (t) entries.push({ school: s, track: t });
    });

    if (entries.length < 2) {
      wrap.appendChild(el('p', 'empty', '비교하려면 학교를 2곳 이상 찜해주세요.'));
      return wrap;
    }

    var over = entries.length > MAX;
    var shown = entries.slice(0, MAX);

    var scroller = el('div', 'table-scroll');
    var table = el('table', 'cmp-table');

    var thead = el('thead');
    var hr = el('tr');
    hr.appendChild(el('th', null, '항목'));
    shown.forEach(function (e) {
      var th = el('th');
      var b = el('button', 'cmp-name', e.school.name);
      b.type = 'button';
      b.addEventListener('click', function () { if (o.onSelect) o.onSelect(e.school.id); });
      th.appendChild(b);
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    ROWS.forEach(function (r) {
      var tr = el('tr');
      tr.appendChild(el('th', 'row-label', r.label));
      shown.forEach(function (e) {
        tr.appendChild(el('td', null, String(r.get(e.school, e.track))));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    scroller.appendChild(table);
    wrap.appendChild(scroller);

    if (over) {
      wrap.appendChild(el('p', 'muted',
        '찜한 학교가 ' + entries.length + '곳입니다. 앞의 3곳만 비교합니다.'));
    }
    return wrap;
  }

  PM.ui.compare = { MAX: MAX, render: render };
})(window.PM);
