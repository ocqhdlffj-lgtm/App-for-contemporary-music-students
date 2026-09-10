(function (PM) {

  var DEFAULTS = {
    q: '', type: '', region: '', major: '',
    season: '', songType: '',
    noMinCsat: false, practicalOnly: false
  };

  function quotaOf(track, major) {
    if (!track || !track.quota) return null;
    var v = track.quota[major];
    return (typeof v === 'number') ? v : null;
  }

  function trackMatches(track, c) {
    if (c.major && (track.majors || []).indexOf(c.major) < 0) return false;
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

      var copy = Object.assign({}, s);
      copy.tracks = tracks;
      out.push(copy);
    });
    return out;
  }

  PM.filter = { DEFAULTS: DEFAULTS, apply: apply, quotaOf: quotaOf };
})(window.PM);
