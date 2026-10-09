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
      entry.dates.length ? PM.ui.formatDates(entry.dates) : '실기일 미확인'));

    if (conflicted) r.appendChild(el('span', 'conflict-tag', '겹침'));

    var rm = el('button', 'remove-btn', '삭제');
    rm.type = 'button';
    rm.addEventListener('click', function () {
      if (opts.onRemove) opts.onRemove(entry.schoolId, entry.trackId);
    });
    r.appendChild(rm);

    return r;
  }

  // 찜한 전형이 데이터 갱신으로 사라진 경우 — 조용히 빼면 "원래 없던 것"처럼 보이므로 알린다.
  function missingBox(missing, opts) {
    var box = el('div', 'unknown-dates missing-picks');
    box.appendChild(el('div', null,
      '찜해 둔 전형 ' + missing.length + '개가 최신 데이터에서 사라져 이 리스트에 나오지 않습니다. 입학처 요강에서 전형이 바뀌었는지 확인하고, 필요하면 다시 찜해 주세요.'));
    missing.forEach(function (p) {
      var row = el('div', 'pick-row');
      row.appendChild(el('span', 'pick-name', p.schoolId + ' · ' + p.trackId));
      var rm = el('button', 'remove-btn', '삭제');
      rm.type = 'button';
      rm.addEventListener('click', function () {
        if (opts.onRemove) opts.onRemove(p.schoolId, p.trackId);
      });
      row.appendChild(rm);
      box.appendChild(row);
    });
    return box;
  }

  function render(schools, picks, opts) {
    var o = opts || {};
    var wrap = el('div', 'mylist');
    wrap.appendChild(el('h2', null, '내 지원 리스트'));

    var entries = PM.conflict.entriesFrom(schools, picks || []);
    var missing = PM.conflict.missingPicks(schools, picks || []);
    if (entries.length === 0 && missing.length) {
      wrap.appendChild(missingBox(missing, o));
      return wrap;
    }
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
      var noExam = result.unknown.filter(function (e) { return e.practicalConfirmedNone; });
      var stillUnknown = result.unknown.filter(function (e) { return !e.practicalConfirmedNone; });

      if (noExam.length) {
        var n = el('div', 'unknown-dates unknown-dates-none');
        n.appendChild(el('div', null, '실기고사가 없는 전형입니다 — 충돌 검사 대상 아님'));
        noExam.forEach(function (e) {
          n.appendChild(el('div', null, '· ' + e.schoolName + ' · ' + e.trackName));
        });
        wrap.appendChild(n);
      }

      if (stillUnknown.length) {
        var u = el('div', 'unknown-dates');
        u.appendChild(el('div', null,
          '아래 학교는 실기고사일이 아직 확인되지 않아 충돌 검사에서 빠졌습니다. 입학처 원문을 확인하세요.'));
        stillUnknown.forEach(function (e) {
          u.appendChild(el('div', null, '· ' + e.schoolName + ' · ' + e.trackName));
        });
        wrap.appendChild(u);
      }
    }

    if (missing.length) wrap.appendChild(missingBox(missing, o));

    return wrap;
  }

  PM.ui.mylist = { render: render };
})(window.PM);
