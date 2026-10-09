function fbSchools() {
  return [
    { id: 'a', name: '가대', type: '4년제', region: '서울', deptName: '실용음악과', tracks: [] },
    { id: 'b', name: '나대', type: '전문대', region: '경기', deptName: '실용음악과', tracks: [] },
    { id: 'c', name: '다대', type: '4년제', region: '서울', deptName: '실용음악과', tracks: [] }
  ];
}

T.test('전공 6종을 노출한다', function () {
  T.eq(PM.ui.filterbar.MAJORS, ['보컬', '기타', '베이스', '드럼', '건반', '작곡']);
});

T.test('지역 목록은 중복 없이 정렬된다', function () {
  T.eq(PM.ui.filterbar.regionsOf(fbSchools()), ['경기', '서울']);
});

T.test('검색어를 입력하면 onChange가 q와 함께 불린다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  var input = el.querySelector('input[name="q"]');
  input.value = '가';
  input.dispatchEvent(new Event('input'));
  T.eq(got.q, '가');
});

T.test('전공을 고르면 onChange가 major와 함께 불린다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  var sel = el.querySelector('select[name="major"]');
  sel.value = '보컬';
  sel.dispatchEvent(new Event('change'));
  T.eq(got.major, '보컬');
});

T.test('수능최저 없음 체크박스가 동작한다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  var cb = el.querySelector('input[name="noMinCsat"]');
  cb.checked = true;
  cb.dispatchEvent(new Event('change'));
  T.eq(got.noMinCsat, true);
});

T.test('실기 100% 체크박스가 동작한다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  var cb = el.querySelector('input[name="practicalOnly"]');
  cb.checked = true;
  cb.dispatchEvent(new Event('change'));
  T.eq(got.practicalOnly, true);
});

T.test('기존 조건이 화면에 반영된다', function () {
  var el = PM.ui.filterbar.render(fbSchools(), { major: '드럼', type: '전문대' }, function () {});
  T.eq(el.querySelector('select[name="major"]').value, '드럼');
  T.eq(el.querySelector('select[name="type"]').value, '전문대');
});

T.test('전형 시기 버튼(전체·수시·정시)을 그리고 기본은 전체가 활성이다', function () {
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function () {});
  var btns = el.querySelectorAll('.season-btn');
  T.eq(btns.length, 3);
  T.eq(Array.prototype.map.call(btns, function (b) { return b.textContent; }), ['전체', '수시', '정시']);
  T.eq(el.querySelector('.season-btn.active').textContent, '전체');
});

T.test('정시 버튼을 누르면 onChange가 season=정시로 불리고 그 버튼이 활성화된다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  el.querySelector('.season-btn[data-season="정시"]').click();
  T.eq(got.season, '정시');
  T.eq(el.querySelector('.season-btn.active').textContent, '정시');
  T.eq(el.querySelectorAll('.season-btn.active').length, 1);
});

T.test('전체 버튼을 누르면 시기 조건이 빈 값으로 돌아간다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), { season: '정시' }, function (c) { got = c; });
  T.eq(el.querySelector('.season-btn.active').textContent, '정시');
  el.querySelector('.season-btn[data-season=""]').click();
  T.eq(got.season, '');
  T.eq(el.querySelector('.season-btn.active').textContent, '전체');
});

T.test('예전의 "정시 데이터 미수집" 고정 문구는 더 이상 그리지 않는다', function () {
  // 정시 정보가 일부 학교에 들어간 뒤로는 사실이 아니다 — 수집 현황은 목록 쪽에서 실제 수치로 알린다.
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function () {});
  T.assert(el.textContent.indexOf('수집되지 않았') < 0, '거짓이 된 고정 문구가 남아 있으면 안 됨');
});

T.test('onChange는 기존 조건을 보존한 새 객체를 넘긴다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), { major: '보컬' }, function (c) { got = c; });
  var cb = el.querySelector('input[name="practicalOnly"]');
  cb.checked = true;
  cb.dispatchEvent(new Event('change'));
  T.eq(got.major, '보컬');
  T.eq(got.practicalOnly, true);
});
