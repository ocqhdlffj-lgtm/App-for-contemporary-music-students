T.test('학교가 100곳 이상이다', function () {
  T.assert(PM.SNAPSHOT.schools.length >= 100,
    '현재 ' + PM.SNAPSHOT.schools.length + '곳 — 전수 목록이 아직 미완성');
});

T.test('모든 학교에 입학처 URL이 있다', function () {
  var bad = PM.SNAPSHOT.schools
    .filter(function (s) { return !/^https?:\/\//.test(s.admissionsUrl || ''); })
    .map(function (s) { return s.id; });
  T.eq(bad, []);
});

T.test('4년제와 전문대가 모두 포함된다', function () {
  var types = {};
  PM.SNAPSHOT.schools.forEach(function (s) { types[s.type] = true; });
  T.eq(Object.keys(types).sort(), ['4년제', '전문대']);
});

T.test('모든 학교에 전형이 1개 이상 있다', function () {
  var bad = PM.SNAPSHOT.schools
    .filter(function (s) { return !s.tracks || s.tracks.length === 0; })
    .map(function (s) { return s.id; });
  T.eq(bad, []);
});
