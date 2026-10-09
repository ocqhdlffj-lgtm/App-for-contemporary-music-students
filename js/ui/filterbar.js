(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  var MAJORS = ['보컬', '기타', '베이스', '드럼', '건반', '작곡'];
  var SONG_TYPES = ['자유곡', '지정곡', '혼합'];

  function regionsOf(schools) {
    var seen = {};
    (schools || []).forEach(function (s) { if (s.region) seen[s.region] = true; });
    return Object.keys(seen).sort();
  }

  function select(name, label, options, value, onPick) {
    var wrap = el('label', 'field');
    wrap.appendChild(el('span', 'field-label', label));
    var sel = el('select');
    sel.name = name;
    sel.appendChild(new Option('전체', ''));
    options.forEach(function (o) { sel.appendChild(new Option(o, o)); });
    sel.value = value || '';
    sel.addEventListener('change', function () { onPick(name, sel.value); });
    wrap.appendChild(sel);
    return wrap;
  }

  // 전체/수시/정시 버튼. 필터바 DOM은 조건이 바뀌어도 다시 만들지 않으므로(검색창
  // 포커스 보존), 활성 표시는 버튼 자신이 직접 갱신한다.
  function seasonToggle(value, onPick) {
    var current = value || '';
    var wrap = el('div', 'season-toggle');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', '전형 시기');
    var btns = [];

    function paint() {
      btns.forEach(function (b) {
        var on = b.getAttribute('data-season') === current;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    [['', '전체'], ['수시', '수시'], ['정시', '정시']].forEach(function (o) {
      var b = el('button', 'season-btn', o[1]);
      b.type = 'button';
      b.setAttribute('data-season', o[0]);
      b.addEventListener('click', function () {
        current = o[0];
        paint();
        onPick('season', o[0]);
      });
      btns.push(b);
      wrap.appendChild(b);
    });
    paint();
    return wrap;
  }

  function checkbox(name, label, checked, onPick) {
    var wrap = el('label', 'check');
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = name;
    cb.checked = !!checked;
    cb.addEventListener('change', function () { onPick(name, cb.checked); });
    wrap.appendChild(cb);
    wrap.appendChild(el('span', null, label));
    return wrap;
  }

  function render(schools, criteria, onChange) {
    var current = Object.assign({}, PM.filter.DEFAULTS, criteria || {});
    var bar = el('div', 'filterbar');

    function pick(name, value) {
      current = Object.assign({}, current);
      current[name] = value;
      if (onChange) onChange(current);
    }

    var q = document.createElement('input');
    q.type = 'search';
    q.name = 'q';
    q.placeholder = '학교명 검색';
    q.className = 'search';
    q.value = current.q || '';
    q.addEventListener('input', function () { pick('q', q.value); });
    bar.appendChild(q);

    bar.appendChild(seasonToggle(current.season, pick));

    var row = el('div', 'filter-row');
    row.appendChild(select('major', '전공', MAJORS, current.major, pick));
    row.appendChild(select('type', '구분', ['4년제', '전문대'], current.type, pick));
    row.appendChild(select('region', '지역', regionsOf(schools), current.region, pick));
    row.appendChild(select('songType', '실기곡', SONG_TYPES, current.songType, pick));
    bar.appendChild(row);

    var checks = el('div', 'filter-checks');
    checks.appendChild(checkbox('noMinCsat', '수능최저 없음', current.noMinCsat, pick));
    checks.appendChild(checkbox('practicalOnly', '실기 100%', current.practicalOnly, pick));
    bar.appendChild(checks);

    bar.appendChild(el('p', 'filter-note',
      '※ 「수능최저 없음」·「실기 100%」는 확인된 전형만 보여줍니다. 미확인 전형은 제외됩니다.'));

    return bar;
  }

  PM.ui.filterbar = { MAJORS: MAJORS, regionsOf: regionsOf, render: render };
})(window.PM);
