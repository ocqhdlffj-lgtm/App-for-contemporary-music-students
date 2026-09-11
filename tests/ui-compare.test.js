function cmpSchools() {
  function mk(id, name, songType, ratio) {
    return {
      id: id, name: name, type: '4년제', region: '서울', deptName: '실용음악과',
      admissionsUrl: 'https://x.ac.kr',
      tracks: [{
        id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
        quota: { '보컬': 10 }, schedule: { practical: ['2026-10-11'] },
        ratio: ratio, minCsat: null,
        practical: { songCount: 2, songType: songType, designatedSongs: [], accompaniment: 'MR', durationMin: 5, sheetMusicRequired: true, notes: '' },
        competition: [],
        verification: { level: '확인됨', checkedAt: '2026-09-10', source: 'https://x' }
      }],
      prepPoints: []
    };
  }
  return [mk('a', '가대', '자유곡', { '실기': 100, '내신': 0, '수능': 0 }),
          mk('b', '나대', '지정곡', { '실기': 70, '내신': 30, '수능': 0 }),
          mk('c', '다대', '혼합', { '실기': 60, '내신': 40, '수능': 0 }),
          mk('d', '라대', '자유곡', { '실기': 50, '내신': 50, '수능': 0 })];
}

var CPICKS = [{ schoolId: 'a', trackId: 'susi' }, { schoolId: 'b', trackId: 'susi' },
              { schoolId: 'c', trackId: 'susi' }, { schoolId: 'd', trackId: 'susi' }];

T.test('최대 3개까지만 비교한다', function () {
  T.eq(PM.ui.compare.MAX, 3);
  var el = PM.ui.compare.render(cmpSchools(), CPICKS, {});
  T.eq(el.querySelectorAll('thead th').length, 4); // 항목열 + 3개교
});

T.test('찜이 2개 미만이면 안내 문구를 보여준다', function () {
  var el = PM.ui.compare.render(cmpSchools(), [CPICKS[0]], {});
  T.assert(el.textContent.indexOf('2곳 이상') >= 0);
});

T.test('학교명이 헤더에 들어간다', function () {
  var el = PM.ui.compare.render(cmpSchools(), CPICKS, {});
  T.assert(el.querySelector('thead').textContent.indexOf('가대') >= 0);
});

T.test('실기 곡 유형을 행으로 대조한다', function () {
  var el = PM.ui.compare.render(cmpSchools(), CPICKS, {});
  T.assert(el.textContent.indexOf('자유곡') >= 0 && el.textContent.indexOf('지정곡') >= 0);
});

T.test('null 값은 미확인으로 표시한다', function () {
  var s = cmpSchools();
  s[0].tracks[0].ratio = null;
  s[0].tracks[0].verification.level = '부분확인';
  var el = PM.ui.compare.render(s, CPICKS, {});
  T.assert(el.textContent.indexOf('미확인') >= 0);
});

T.test('4곳을 찜하면 초과분 안내가 뜬다', function () {
  var el = PM.ui.compare.render(cmpSchools(), CPICKS, {});
  T.assert(el.textContent.indexOf('앞의 3곳') >= 0);
});

// ---- null 감사(audit) 보강 테스트 ----
// 컨테이너(ratio/quota)가 존재해도 그 안의 개별 값이 null일 수 있다 — task-10에서
// t.quota[m] + '명' 형태가 화면에 리터럴 "null명"을 노출시킨 버그를 재발시켰던 패턴과
// 동일하다. ROWS의 '실기 비율'과 '모집인원' 모두 컨테이너 존재 여부만 보고 안의
// 값은 그대로 문자열 접합하면 이 버그가 재현된다.
T.test('ratio 컨테이너는 있지만 실기 값이 null이면 미확인으로 표시되고 "null"이 노출되지 않는다', function () {
  var s = cmpSchools();
  s[0].tracks[0].ratio = { '실기': null, '내신': 0, '수능': 0 };
  var el = PM.ui.compare.render(s, CPICKS, {});
  T.assert(el.textContent.indexOf('미확인') >= 0);
  T.assert(el.textContent.indexOf('null') < 0, '텍스트에 리터럴 null이 노출되면 안 된다');
});

T.test('quota 컨테이너는 있지만 모집인원 값이 null이면 미확인으로 표시되고 "null"이 노출되지 않는다', function () {
  var s = cmpSchools();
  s[0].tracks[0].quota = { '보컬': null };
  var el = PM.ui.compare.render(s, CPICKS, {});
  T.assert(el.textContent.indexOf('미확인') >= 0);
  T.assert(el.textContent.indexOf('null') < 0, '텍스트에 리터럴 null이 노출되면 안 된다');
});

T.test('실기 비율이 실제로 0%이면 미확인이 아니라 0%로 표시된다', function () {
  var s = cmpSchools();
  s[0].tracks[0].ratio = { '실기': 0, '내신': 50, '수능': 50 };
  var el = PM.ui.compare.render(s, CPICKS, {});
  T.assert(el.textContent.indexOf('0%') >= 0);
});

T.test('모집인원이 실제로 0명이면 미확인이 아니라 0명으로 표시된다', function () {
  var s = cmpSchools();
  s[0].tracks[0].quota = { '보컬': 0 };
  var el = PM.ui.compare.render(s, CPICKS, {});
  T.assert(el.textContent.indexOf('보컬 0명') >= 0);
});
