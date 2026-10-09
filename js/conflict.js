(function (PM) {

  function entriesFrom(schools, picks) {
    var byId = {};
    (schools || []).forEach(function (s) { byId[s.id] = s; });

    var out = [];
    (picks || []).forEach(function (p) {
      var school = byId[p.schoolId];
      if (!school) return;
      var track = (school.tracks || []).filter(function (t) { return t.id === p.trackId; })[0];
      if (!track) return;

      var dates = (track.schedule && Array.isArray(track.schedule.practical))
        ? track.schedule.practical.slice()
        : [];

      out.push({
        schoolId: school.id,
        trackId: track.id,
        schoolName: school.name,
        trackName: track.name,
        dates: dates,
        practicalConfirmedNone: PM.schema.isPracticalConfirmedNone(track)
      });
    });
    return out;
  }

  function find(entries) {
    var byDate = {};
    var unknown = [];

    (entries || []).forEach(function (e) {
      if (!e.dates || e.dates.length === 0) { unknown.push(e); return; }
      e.dates.forEach(function (d) {
        if (!byDate[d]) byDate[d] = [];
        // 같은 학교+전형이 중복 선택된 경우 한 번만
        var dup = byDate[d].some(function (x) {
          return x.schoolId === e.schoolId && x.trackId === e.trackId;
        });
        if (!dup) byDate[d].push(e);
      });
    });

    var conflicts = Object.keys(byDate)
      .filter(function (d) { return byDate[d].length >= 2; })
      .sort()
      .map(function (d) { return { date: d, items: byDate[d] }; });

    return { conflicts: conflicts, unknown: unknown };
  }

  // 찜해 둔 전형이 데이터 갱신으로 사라졌는지(학교·전형 id 불일치) 찾는다.
  // entriesFrom은 이런 픽을 조용히 버리므로, 호출 쪽이 사용자에게 알릴 수 있게 따로 돌려준다.
  function missingPicks(schools, picks) {
    var byId = {};
    (schools || []).forEach(function (s) { byId[s.id] = s; });
    return (picks || []).filter(function (p) {
      var school = byId[p.schoolId];
      return !school || !(school.tracks || []).some(function (t) { return t.id === p.trackId; });
    });
  }

  PM.conflict = { entriesFrom: entriesFrom, find: find, missingPicks: missingPicks };
})(window.PM);
