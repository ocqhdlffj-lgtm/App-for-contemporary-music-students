function mySchools() {
  function mk(id, name, dates) {
    return {
      id: id, name: name, type: '4년제', region: '서울', deptName: '실용음악과',
      admissionsUrl: 'https://x.ac.kr',
      tracks: [{
        id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
        quota: null, schedule: { practical: dates }, ratio: null, minCsat: null,
        practical: null, competition: [],
        verification: { level: '미확인', checkedAt: '2026-09-10', source: null }
      }],
      prepPoints: []
    };
  }
  return [mk('a', '가대', ['2026-10-11']), mk('b', '나대', ['2026-10-11']),
          mk('c', '다대', ['2026-10-18']), mk('d', '라대', [])];
}

var ALL = [{ schoolId: 'a', trackId: 'susi' }, { schoolId: 'b', trackId: 'susi' },
           { schoolId: 'c', trackId: 'susi' }, { schoolId: 'd', trackId: 'susi' }];

T.test('찜이 없으면 안내 문구를 보여준다', function () {
  var el = PM.ui.mylist.render(mySchools(), [], {});
  T.assert(el.textContent.indexOf('찜한 학교가 없습니다') >= 0);
});

T.test('찜한 학교를 모두 보여준다', function () {
  var el = PM.ui.mylist.render(mySchools(), ALL, {});
  T.eq(el.querySelectorAll('.pick-row').length, 4);
});

T.test('같은 날 실기가 겹치면 경고를 그린다', function () {
  var el = PM.ui.mylist.render(mySchools(), ALL, {});
  var w = el.querySelector('.conflict');
  T.assert(w, '충돌 경고 필요');
  T.assert(w.textContent.indexOf('2026-10-11') >= 0);
  T.assert(w.textContent.indexOf('가대') >= 0 && w.textContent.indexOf('나대') >= 0);
});

T.test('겹치는 학교의 행에 충돌 표시가 붙는다', function () {
  var el = PM.ui.mylist.render(mySchools(), ALL, {});
  T.eq(el.querySelectorAll('.pick-row.has-conflict').length, 2);
});

T.test('겹치지 않으면 경고가 없다', function () {
  var el = PM.ui.mylist.render(mySchools(), [{ schoolId: 'a', trackId: 'susi' },
                                             { schoolId: 'c', trackId: 'susi' }], {});
  T.eq(el.querySelector('.conflict'), null);
});

T.test('실기일 미확인 학교는 별도로 안내한다', function () {
  var el = PM.ui.mylist.render(mySchools(), ALL, {});
  var u = el.querySelector('.unknown-dates');
  T.assert(u, '미확인 안내 필요');
  T.assert(u.textContent.indexOf('라대') >= 0);
});

T.test('확인됨+실기고사 없음 전형은 별도의 중립 안내로 분리된다', function () {
  var schools = mySchools();
  // 'd'(라대)는 dates: [] — 확인됨으로 바꿔 "확인된 실기 없음" 케이스로 만든다
  schools[3].tracks[0].verification.level = '확인됨';
  var el = PM.ui.mylist.render(schools, ALL, {});

  var none = el.querySelector('.unknown-dates-none');
  T.assert(none, '실기 없음 중립 안내 박스가 필요함');
  T.assert(none.textContent.indexOf('라대') >= 0, '라대가 중립 안내에 있어야 함');
  T.assert(none.textContent.indexOf('충돌 검사 대상 아님') >= 0);

  var stillUnknown = el.querySelectorAll('.unknown-dates:not(.unknown-dates-none)');
  T.eq(stillUnknown.length, 0, '진짜 미확인 항목이 없으면 기존 경고 박스는 없어야 함');
});

T.test('삭제 버튼이 onRemove를 호출한다', function () {
  var got = null;
  var el = PM.ui.mylist.render(mySchools(), [{ schoolId: 'a', trackId: 'susi' }],
    { onRemove: function (s, t) { got = [s, t]; } });
  el.querySelector('.remove-btn').click();
  T.eq(got, ['a', 'susi']);
});

T.test('행을 누르면 onSelect가 학교 id로 불린다', function () {
  var got = null;
  var el = PM.ui.mylist.render(mySchools(), [{ schoolId: 'a', trackId: 'susi' }],
    { onSelect: function (id) { got = id; } });
  el.querySelector('.pick-name').click();
  T.eq(got, 'a');
});

// 회귀 방지: 지금까지의 픽스처 학교는 전부 트랙이 하나뿐이라, 렌더링 쪽에서
// 충돌 여부를 (실수로) schoolId만으로 재키잉해도 통과해버린다. 실제로는 같은
// 학교라도 서로 다른 전형(수시/정시 등)에 각각 지원할 수 있고, 그 두 전형이
// 같은 날짜에 겹치면 여전히 "한 곳만 응시 가능"한 진짜 충돌이다
// (js/conflict.js의 find()는 schoolId+trackId로 dedup하므로 이 둘을 구분해서
// 남긴다 — 렌더링이 그 판정을 그대로 반영하는지 확인한다).
function mkTwoTrackSchool() {
  function track(id, name, date) {
    return {
      id: id, season: id === 'susi' ? '수시' : '정시', name: name, majors: ['보컬'],
      quota: null, schedule: { practical: [date] }, ratio: null, minCsat: null,
      practical: null, competition: [],
      verification: { level: '미확인', checkedAt: '2026-09-10', source: null }
    };
  }
  return {
    id: 'e', name: '마대', type: '4년제', region: '서울', deptName: '실용음악과',
    admissionsUrl: 'https://x.ac.kr',
    tracks: [track('susi', '수시전형', '2026-11-01'), track('jeongsi', '정시전형', '2026-11-01')],
    prepPoints: []
  };
}

T.test('같은 학교라도 전형이 다르면 같은 날짜 충돌로 표시된다', function () {
  var picks = [{ schoolId: 'e', trackId: 'susi' }, { schoolId: 'e', trackId: 'jeongsi' }];
  var el = PM.ui.mylist.render([mkTwoTrackSchool()], picks, {});

  var w = el.querySelector('.conflict');
  T.assert(w, '같은 학교라도 전형이 다르면 충돌 경고가 필요하다');
  T.assert(w.textContent.indexOf('수시전형') >= 0 && w.textContent.indexOf('정시전형') >= 0,
    '충돌 문구에 두 전형 이름이 모두 나와야 한다');
  T.eq(el.querySelectorAll('.pick-row.has-conflict').length, 2);
});
