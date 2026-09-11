(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  function fmt(v, unit) {
    if (v == null || v === '') return '미확인';
    return unit ? (v + unit) : String(v);
  }

  function section(title) {
    var s = el('section', 'sec');
    s.appendChild(el('h3', 'sec-title', title));
    return s;
  }

  function row(label, value) {
    var r = el('div', 'row');
    r.appendChild(el('span', 'row-label', label));
    r.appendChild(el('span', 'row-value', value));
    return r;
  }

  function practicalSection(t) {
    var s = section('실기조건');
    var p = t.practical;
    if (!p) { s.appendChild(row('실기조건', '미확인')); return s; }
    s.appendChild(row('곡 수', fmt(p.songCount, '곡')));
    s.appendChild(row('곡 유형', fmt(p.songType)));
    if (p.designatedSongs && p.designatedSongs.length) {
      s.appendChild(row('지정곡', p.designatedSongs.join(', ')));
    }
    s.appendChild(row('반주', fmt(p.accompaniment)));
    s.appendChild(row('실기 시간', fmt(p.durationMin, '분')));
    s.appendChild(row('악보 제출',
      p.sheetMusicRequired == null ? '미확인' : (p.sheetMusicRequired ? '필요' : '불필요')));
    if (p.notes) s.appendChild(row('비고', p.notes));
    return s;
  }

  function scheduleSection(t) {
    var s = section('전형일정');
    var sc = t.schedule;
    if (!sc) { s.appendChild(row('일정', '미확인')); return s; }
    s.appendChild(row('원서접수',
      (sc.apply && sc.apply.length === 2) ? sc.apply[0] + ' ~ ' + sc.apply[1] : '미확인'));
    s.appendChild(row('실기고사',
      (sc.practical && sc.practical.length) ? sc.practical.join(', ') : '미확인'));
    s.appendChild(row('합격발표', fmt(sc.announce)));
    return s;
  }

  function ratioSection(t) {
    var s = section('반영비율');
    if (!t.ratio) {
      s.appendChild(row('반영비율', '미확인'));
    } else {
      Object.keys(t.ratio).forEach(function (k) {
        s.appendChild(row(k, fmt(t.ratio[k], '%')));
      });
    }
    s.appendChild(row('수능최저',
      ('minCsat' in t) ? (t.minCsat === null ? '수능최저 없음' : t.minCsat) : '미확인'));
    return s;
  }

  function quotaSection(t) {
    var s = section('모집인원');
    if (!t.quota) { s.appendChild(row('모집인원', '미확인')); return s; }
    Object.keys(t.quota).forEach(function (m) {
      s.appendChild(row(m, fmt(t.quota[m], '명')));
    });
    return s;
  }

  function competitionSection(t) {
    var s = section('경쟁률');
    if (!t.competition || t.competition.length === 0) {
      s.appendChild(row('경쟁률', '미공개'));
      return s;
    }
    t.competition.slice().sort(function (a, b) { return b.year - a.year; })
      .forEach(function (c) {
        s.appendChild(row(fmt(c.year) + ' ' + fmt(c.major),
          (c.ratio == null || c.ratio === '') ? '미확인' : (c.ratio + ' : 1')));
      });
    return s;
  }

  function trackBlock(school, t, opts) {
    var b = el('div', 'track');

    var head = el('div', 'track-head');
    head.appendChild(el('span', 'track-name', t.season + ' · ' + t.name));
    head.appendChild(PM.ui.badge(t.verification.level, 'level-' + t.verification.level));

    var pick = el('button', 'pick-btn',
      PM.storage.hasPick(school.id, t.id) ? '찜 해제' : '찜하기');
    pick.type = 'button';
    pick.addEventListener('click', function () {
      if (opts.onTogglePick) opts.onTogglePick(school.id, t.id);
    });
    head.appendChild(pick);
    b.appendChild(head);

    b.appendChild(practicalSection(t));
    b.appendChild(scheduleSection(t));
    b.appendChild(ratioSection(t));
    b.appendChild(quotaSection(t));
    b.appendChild(competitionSection(t));
    return b;
  }

  function render(school, opts) {
    var o = opts || {};
    var wrap = el('div', 'detail');

    var back = el('button', 'back-btn', '← 목록');
    back.type = 'button';
    back.addEventListener('click', function () { if (o.onBack) o.onBack(); });
    wrap.appendChild(back);

    var head = el('div', 'detail-head');
    head.appendChild(el('h2', null, school.name));
    head.appendChild(PM.ui.badge(school.type, 'type'));
    head.appendChild(el('span', 'muted', school.region + ' · ' + school.deptName));
    wrap.appendChild(head);

    (school.tracks || []).forEach(function (t) {
      wrap.appendChild(trackBlock(school, t, o));
    });

    if (school.prepPoints && school.prepPoints.length) {
      var prep = el('div', 'prep');
      prep.appendChild(el('div', 'prep-tag', '참고 · 공식 요강 아님'));
      var ul = el('ul');
      school.prepPoints.forEach(function (p) { ul.appendChild(el('li', null, p)); });
      prep.appendChild(ul);
      wrap.appendChild(prep);
    }

    if (school.admissionsUrl) {
      var a = el('a', 'source-link', '입학처 원문 확인');
      a.href = school.admissionsUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      wrap.appendChild(a);
    } else {
      wrap.appendChild(el('div', 'source-missing', '입학처 링크 확인 중'));
    }

    return wrap;
  }

  PM.ui.detail = { render: render, fmt: fmt };
})(window.PM);
