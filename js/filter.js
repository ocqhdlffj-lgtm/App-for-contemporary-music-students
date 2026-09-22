(function (PM) {

  var DEFAULTS = {
    q: '', type: '', region: '', major: '',
    season: '', songType: '',
    noMinCsat: false, practicalOnly: false
  };

  // 학교마다 전공명을 표기하는 방식이 제각각이라("재즈기타/관현악", "기악(기타)",
  // "베이스기타", "작편곡", "재즈피아노" 등) 필터의 6개 표준 전공명과 문자열이
  // 정확히 일치하는 경우가 드물다. 그래서 정확히 일치(===)가 아니라 표준
  // 전공명이 원문 전공명 문자열에 부분 포함되는지로 판정한다. 건반↔피아노,
  // 작곡↔편곡처럼 표준명과 원문 표기가 아예 다른 동의어만 별도로 등록한다.
  var MAJOR_ALIASES = {
    '건반': ['건반', '피아노'],
    '작곡': ['작곡', '편곡']
  };

  function majorMatches(rawMajor, filterMajor) {
    if (!rawMajor) return false;
    var needles = MAJOR_ALIASES[filterMajor] || [filterMajor];
    for (var i = 0; i < needles.length; i++) {
      if (rawMajor.indexOf(needles[i]) >= 0) return true;
    }
    return false;
  }

  function quotaOf(track, major) {
    if (!track || !track.quota) return null;
    var keys = Object.keys(track.quota).filter(function (k) { return majorMatches(k, major); });
    if (!keys.length) return null;
    var sum = 0, found = false;
    keys.forEach(function (k) {
      if (typeof track.quota[k] === 'number') { sum += track.quota[k]; found = true; }
    });
    return found ? sum : null;
  }

  function trackMatches(track, c) {
    if (c.major && !(track.majors || []).some(function (m) { return majorMatches(m, c.major); })) return false;
    if (c.season && track.season !== c.season) return false;

    if (c.songType) {
      if (!track.practical || track.practical.songType !== c.songType) return false;
    }

    // 미확인(null) 값을 '조건에 맞음'으로 보여주면 오지원으로 이어진다 → 제외
    if (c.practicalOnly) {
      if (!track.ratio || track.ratio['실기'] !== 100) return false;
    }
    if (c.noMinCsat) {
      if (!('minCsat' in track)) return false;
      if (track.minCsat !== null) return false;
    }
    return true;
  }

  function apply(schools, criteria) {
    var c = Object.assign({}, DEFAULTS, criteria || {});
    var q = (c.q || '').trim();

    var out = [];
    (schools || []).forEach(function (s) {
      if (c.type && s.type !== c.type) return;
      if (c.region && s.region !== c.region) return;
      if (q && (s.name || '').indexOf(q) < 0 && (s.deptName || '').indexOf(q) < 0) return;

      var tracks = (s.tracks || []).filter(function (t) { return trackMatches(t, c); });
      if (tracks.length === 0) return;

      // 얕은 복사: copy.tracks는 새 배열이지만 그 원소(전형 객체)는
      // 원본 데이터와 같은 참조를 공유한다. 호출자는 반환된 전형을
      // 읽기 전용으로만 다루고 절대 변경해서는 안 된다.
      var copy = Object.assign({}, s);
      copy.tracks = tracks;
      out.push(copy);
    });
    return out;
  }

  PM.filter = { DEFAULTS: DEFAULTS, apply: apply, quotaOf: quotaOf, majorMatches: majorMatches };
})(window.PM);
