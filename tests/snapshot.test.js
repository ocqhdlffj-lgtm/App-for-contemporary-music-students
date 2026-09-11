T.test('스냅샷이 로드되어 있다', function () {
  T.assert(PM.SNAPSHOT && typeof PM.SNAPSHOT === 'object', 'PM.SNAPSHOT 필요');
  T.assert(/^\d{4}-\d{2}-\d{2}$/.test(PM.SNAPSHOT.dataVersion), 'dataVersion은 YYYY-MM-DD');
  T.assert(Array.isArray(PM.SNAPSHOT.schools), 'schools는 배열');
});

T.test('스냅샷에 학교가 1곳 이상 있다', function () {
  T.assert(PM.SNAPSHOT.schools.length >= 1, '학교가 있어야 함');
});

T.test('스냅샷의 모든 학교가 스키마 검증을 통과한다', function () {
  var bad = [];
  PM.SNAPSHOT.schools.forEach(function (s) {
    var r = PM.schema.validateSchool(s);
    if (!r.ok) bad.push((s && s.id ? s.id : '?') + ': ' + r.errors.join('; '));
  });
  T.eq(bad, [], '검증 실패한 학교:\n' + bad.join('\n'));
});

T.test('학교 id가 중복되지 않는다', function () {
  var seen = {}, dup = [];
  PM.SNAPSHOT.schools.forEach(function (s) {
    if (seen[s.id]) dup.push(s.id);
    seen[s.id] = true;
  });
  T.eq(dup, []);
});
