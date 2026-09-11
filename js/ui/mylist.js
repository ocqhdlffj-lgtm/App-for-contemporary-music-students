(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  function keyOf(e) { return e.schoolId + '::' + e.trackId; }

  function conflictBox(conflicts) {
    var box = el('div', 'conflict');
    box.appendChild(el('div', 'conflict-title',
      '실기고사일이 겹칩니다 — 같은 날은 한 곳만 응시할 수 있습니다'));

    conflicts.forEach(function (c) {
      var line = el('div', 'conflict-line');
      line.appendChild(el('strong', null, c.date));
      var names = c.items.map(function (i) {
        return i.schoolName + '(' + i.trackName + ')';
      }).join(' · ');
      line.appendChild(el('span', null, ' ' + names));
      box.appendChild(line);
    });
    return box;
  }

  function pickRow(entry, conflicted, opts) {
    var r = el('div', 'pick-row' + (conflicted ? ' has-conflict' : ''));

    var name = el('button', 'pick-name',
      entry.schoolName + ' · ' + entry.trackName);
    name.type = 'button';
    name.addEventListener('click', function () {
      if (opts.onSelect) opts.onSelect(entry.schoolId);
    });
    r.appendChild(name);

    r.appendChild(el('span', 'pick-dates',
      entry.dates.length ? entry.dates.join(', ') : '실기일 미확인'));

    if (conflicted) r.appendChild(el('span', 'conflict-tag', '겹침'));

    var rm = el('button', 'remove-btn', '삭제');
    rm.type = 'button';
    rm.addEventListener('click', function () {
      if (opts.onRemove) opts.onRemove(entry.schoolId, entry.trackId);
    });
    r.appendChild(rm);

    return r;
  }

  function render(schools, picks, opts) {
    var o = opts || {};
    var wrap = el('div', 'mylist');
    wrap.appendChild(el('h2', null, '내 지원 리스트'));

    var entries = PM.conflict.entriesFrom(schools, picks || []);
    if (entries.length === 0) {
      wrap.appendChild(el('p', 'empty', '찜한 학교가 없습니다. 학교 상세에서 「찜하기」를 눌러보세요.'));
      return wrap;
    }

    var result = PM.conflict.find(entries);

    if (result.conflicts.length) {
      wrap.appendChild(conflictBox(result.conflicts));
    }

    var conflicted = {};
    result.conflicts.forEach(function (c) {
      c.items.forEach(function (i) { conflicted[keyOf(i)] = true; });
    });

    entries.forEach(function (e) {
      wrap.appendChild(pickRow(e, !!conflicted[keyOf(e)], o));
    });

    if (result.unknown.length) {
      var u = el('div', 'unknown-dates');
      u.appendChild(el('div', null,
        '아래 학교는 실기고사일이 아직 확인되지 않아 충돌 검사에서 빠졌습니다. 입학처 원문을 확인하세요.'));
      result.unknown.forEach(function (e) {
        u.appendChild(el('div', null, '· ' + e.schoolName + ' · ' + e.trackName));
      });
      wrap.appendChild(u);
    }

    return wrap;
  }

  PM.ui.mylist = { render: render };
})(window.PM);
