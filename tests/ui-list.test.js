function listSchool(id, name, level, quota) {
  return {
    id: id, name: name, type: '4년제', region: '서울', deptName: '실용음악과',
    admissionsUrl: 'https://x.ac.kr',
    tracks: [{
      id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
      quota: quota, schedule: { practical: ['2026-10-11'] },
      ratio: null, minCsat: null, practical: null, competition: [],
      verification: { level: level, checkedAt: '2026-09-10', source: null }
    }],
    prepPoints: []
  };
}

T.test('학교 수만큼 카드를 그린다', function () {
  var el = PM.ui.list.render([listSchool('a', '가대', '미확인', null),
                              listSchool('b', '나대', '미확인', null)], {});
  T.eq(el.querySelectorAll('.card').length, 2);
});

T.test('카드에 학교명과 지역이 들어간다', function () {
  var el = PM.ui.list.render([listSchool('a', '가나대학교', '미확인', null)], {});
  T.assert(el.textContent.indexOf('가나대학교') >= 0, '학교명 표시');
  T.assert(el.textContent.indexOf('서울') >= 0, '지역 표시');
});

T.test('확인 등급 배지를 표시한다', function () {
  var el = PM.ui.list.render([listSchool('a', '가대', '부분확인', null)], {});
  T.assert(el.querySelector('.badge.level-부분확인'), '부분확인 배지 필요');
});

T.test('전공을 고르면 그 전공 모집인원을 보여준다', function () {
  var el = PM.ui.list.render([listSchool('a', '가대', '확인됨', { '보컬': 12 })],
                             { major: '보컬' });
  T.assert(el.textContent.indexOf('12') >= 0, '모집인원 12 표시');
});

T.test('모집인원이 null이면 미확인으로 표시한다', function () {
  var el = PM.ui.list.render([listSchool('a', '가대', '미확인', null)], { major: '보컬' });
  T.assert(el.textContent.indexOf('미확인') >= 0, '미확인 표시');
});

T.test('결과가 없으면 빈 상태 문구를 보여준다', function () {
  var el = PM.ui.list.render([], {});
  T.assert(el.textContent.indexOf('조건에 맞는 학교가 없습니다') >= 0, '빈 상태 문구');
});

T.test('카드를 누르면 onSelect에 학교 id가 전달된다', function () {
  var got = null;
  var el = PM.ui.list.render([listSchool('a', '가대', '미확인', null)],
                             { onSelect: function (id) { got = id; } });
  el.querySelector('.card').click();
  T.eq(got, 'a');
});

T.test('확인됨이면서 실기고사가 없는 전형은 실기 없음으로 표시한다', function () {
  var s = {
    id: 'a', name: '가대', type: '4년제', region: '서울', deptName: '실용음악과',
    admissionsUrl: 'https://x.ac.kr',
    tracks: [{
      id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
      quota: null, schedule: { practical: [] },
      ratio: null, minCsat: null, practical: null, competition: [],
      verification: { level: '확인됨', checkedAt: '2026-09-10', source: 'x' }
    }],
    prepPoints: []
  };
  var el = PM.ui.list.render([s], {});
  T.assert(el.textContent.indexOf('실기 없음') >= 0, '실기 없음 표시 필요');
  T.assert(el.textContent.indexOf('실기일 미확인') < 0, '미확인 문구가 나오면 안 됨');
});

T.test('실기고사일이 확인되지 않은 학교는 여전히 실기일 미확인으로 표시한다', function () {
  var s = {
    id: 'a', name: '가대', type: '4년제', region: '서울', deptName: '실용음악과',
    admissionsUrl: 'https://x.ac.kr',
    tracks: [{
      id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
      quota: null, schedule: null,
      ratio: null, minCsat: null, practical: null, competition: [],
      verification: { level: '미확인', checkedAt: '2026-09-10', source: null }
    }],
    prepPoints: []
  };
  var el = PM.ui.list.render([s], {});
  T.assert(el.textContent.indexOf('실기일 미확인') >= 0, '실기일 미확인 표시 필요');
});

T.test('진행률 문구는 확인됨 학교 수를 센다', function () {
  var s = [listSchool('a', '가대', '확인됨', { '보컬': 1 }),
           listSchool('b', '나대', '미확인', null)];
  T.eq(PM.ui.progressText(s), '세부 확인 1 / 2개교');
});

T.test('면책 문구를 그린다', function () {
  T.assert(PM.ui.disclaimerBar().textContent.indexOf('입학처 원문을 확인') >= 0);
});

T.test('목록이 계속 추가되는 중임을 알리는 문구를 그린다', function () {
  T.assert(PM.ui.expansionNotice().textContent.indexOf('계속 추가') >= 0);
});

T.test('formatDates: 날짜가 정확히 2개면 시작~끝 기간으로 표시한다', function () {
  T.eq(PM.ui.formatDates(['2026-10-01', '2026-10-11']), '2026-10-01 ~ 2026-10-11');
});

T.test('formatDates: 날짜가 3개 이상이면 콤마로 나열한다', function () {
  T.eq(PM.ui.formatDates(['2026-10-08', '2026-10-09', '2026-12-04']),
    '2026-10-08, 2026-10-09, 2026-12-04');
});

T.test('formatDates: 날짜가 1개면 그대로 반환한다', function () {
  T.eq(PM.ui.formatDates(['2026-10-09']), '2026-10-09');
});

T.test('formatDates: 빈 배열이나 없으면 null을 반환한다', function () {
  T.eq(PM.ui.formatDates([]), null);
  T.eq(PM.ui.formatDates(null), null);
});
