function entry(id, dates) {
  return { schoolId: id, trackId: 'susi', schoolName: id, trackName: '수시', dates: dates };
}

T.test('겹치는 날이 없으면 충돌이 없다', function () {
  var r = PM.conflict.find([entry('a', ['2026-10-11']), entry('b', ['2026-10-12'])]);
  T.eq(r.conflicts, []);
});

T.test('같은 날 2건이면 충돌 1건을 반환한다', function () {
  var r = PM.conflict.find([entry('a', ['2026-10-11']), entry('b', ['2026-10-11'])]);
  T.eq(r.conflicts.length, 1);
  T.eq(r.conflicts[0].date, '2026-10-11');
  T.eq(r.conflicts[0].items.length, 2);
});

T.test('같은 날 3건이면 한 충돌에 3건이 묶인다', function () {
  var r = PM.conflict.find([
    entry('a', ['2026-10-11']), entry('b', ['2026-10-11']), entry('c', ['2026-10-11'])
  ]);
  T.eq(r.conflicts.length, 1);
  T.eq(r.conflicts[0].items.length, 3);
});

T.test('실기일이 여러 날인 전형은 각 날짜로 모두 계산한다', function () {
  var r = PM.conflict.find([entry('a', ['2026-10-11', '2026-10-18']), entry('b', ['2026-10-18'])]);
  T.eq(r.conflicts.length, 1);
  T.eq(r.conflicts[0].date, '2026-10-18');
});

T.test('충돌은 날짜 오름차순으로 정렬된다', function () {
  var r = PM.conflict.find([
    entry('a', ['2026-11-02']), entry('b', ['2026-11-02']),
    entry('c', ['2026-10-11']), entry('d', ['2026-10-11'])
  ]);
  T.eq(r.conflicts.map(function (c) { return c.date; }), ['2026-10-11', '2026-11-02']);
});

T.test('날짜 미상 항목은 unknown으로 분리되고 충돌에 안 들어간다', function () {
  var r = PM.conflict.find([entry('a', []), entry('b', ['2026-10-11'])]);
  T.eq(r.conflicts, []);
  T.eq(r.unknown.length, 1);
  T.eq(r.unknown[0].schoolId, 'a');
});

T.test('같은 학교의 같은 전형이 중복 선택돼도 충돌로 세지 않는다', function () {
  var r = PM.conflict.find([entry('a', ['2026-10-11']), entry('a', ['2026-10-11'])]);
  T.eq(r.conflicts, []);
});

T.test('entriesFrom은 선택한 전형만 엔트리로 만든다', function () {
  var schools = [{
    id: 'u1', name: '대학1',
    tracks: [
      { id: 'susi', name: '수시전형', schedule: { practical: ['2026-10-11'] } },
      { id: 'jeongsi', name: '정시전형', schedule: { practical: ['2027-01-05'] } }
    ]
  }];
  var e = PM.conflict.entriesFrom(schools, [{ schoolId: 'u1', trackId: 'jeongsi' }]);
  T.eq(e.length, 1);
  T.eq(e[0].dates, ['2027-01-05']);
  T.eq(e[0].schoolName, '대학1');
});

T.test('entriesFrom은 schedule이 null이면 dates를 빈 배열로 만든다', function () {
  var schools = [{ id: 'u1', name: '대학1', tracks: [{ id: 'susi', name: '수시', schedule: null }] }];
  var e = PM.conflict.entriesFrom(schools, [{ schoolId: 'u1', trackId: 'susi' }]);
  T.eq(e[0].dates, []);
});
