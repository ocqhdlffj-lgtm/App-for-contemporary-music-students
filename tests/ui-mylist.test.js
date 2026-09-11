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
