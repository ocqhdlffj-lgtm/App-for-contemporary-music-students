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

    var row = el('div', 'filter-row');
    row.appendChild(select('major', '전공', MAJORS, current.major, pick));
    row.appendChild(select('type', '구분', ['4년제', '전문대'], current.type, pick));
    row.appendChild(select('region', '지역', regionsOf(schools), current.region, pick));
    row.appendChild(select('season', '전형', ['수시', '정시'], current.season, pick));
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
