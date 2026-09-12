// task-13 R24: 2026-09-12 기준 65곳(4년제 34 + 전문대 31, 16개 시도)을 admissionsUrl까지
// 실제로 열어 확인했다. 65는 "확인된 하한선"이지, 전국 실용음악과 개설 학교의 전수가
// 아니다 — 배치별 "확인 실패" 학교들은 근거 부족으로 뺀 것일 뿐, 학과가 없다는 증거가
// 아니다. 목록은 계속 늘어날 예정이므로 이 테스트는 완전성을 주장하지 않고, 이미
// 확인된 학교가 실수로 빠지는 회귀만 잡는다.
T.test('학교 수가 검증된 하한선(65) 아래로 떨어지지 않는다', function () {
  T.assert(PM.SNAPSHOT.schools.length >= 65,
    '현재 ' + PM.SNAPSHOT.schools.length + '곳 — 검증된 학교가 하나 이상 유실됨(하한선 65)');
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
