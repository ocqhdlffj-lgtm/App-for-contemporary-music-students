function school(over) {
  var s = {
    id: 'u1', name: '가나대학교', type: '4년제', region: '서울',
    deptName: '실용음악과',
    tracks: [{
      id: 'susi', season: '수시', name: '실기전형',
      majors: ['보컬', '기타'],
      quota: { '보컬': 10, '기타': 5 },
      ratio: { '실기': 100, '내신': 0, '수능': 0 },
      minCsat: null,
      practical: { songType: '자유곡' },
      verification: { level: '확인됨' }
    }]
  };
  return Object.assign(s, over || {});
}

T.test('조건이 비면 전부 반환한다', function () {
  var r = PM.filter.apply([school()], PM.filter.DEFAULTS);
  T.eq(r.length, 1);
});

T.test('학교명으로 검색한다', function () {
  T.eq(PM.filter.apply([school()], { q: '가나' }).length, 1);
  T.eq(PM.filter.apply([school()], { q: '없는대' }).length, 0);
});

T.test('4년제/전문대로 거른다', function () {
  T.eq(PM.filter.apply([school()], { type: '전문대' }).length, 0);
  T.eq(PM.filter.apply([school()], { type: '4년제' }).length, 1);
});

T.test('지역으로 거른다', function () {
  T.eq(PM.filter.apply([school()], { region: '경기' }).length, 0);
});

T.test('전공으로 거르면 그 전공을 뽑는 전형만 남는다', function () {
  var s = school();
  s.tracks.push({
    id: 'jeongsi', season: '정시', name: '정시전형', majors: ['작곡'],
    quota: { '작곡': 4 }, ratio: { '실기': 100, '내신': 0, '수능': 0 },
    minCsat: null, practical: { songType: '자유곡' },
    verification: { level: '확인됨' }
  });
  var r = PM.filter.apply([s], { major: '보컬' });
  T.eq(r.length, 1);
  T.eq(r[0].tracks.length, 1);
  T.eq(r[0].tracks[0].id, 'susi');
});

T.test('수시/정시로 거른다', function () {
  T.eq(PM.filter.apply([school()], { season: '정시' }).length, 0);
  T.eq(PM.filter.apply([school()], { season: '수시' }).length, 1);
});

T.test('실기 100% 조건은 ratio.실기가 100인 전형만 남긴다', function () {
  T.eq(PM.filter.apply([school()], { practicalOnly: true }).length, 1);
  var s = school();
  s.tracks[0].ratio = { '실기': 80, '내신': 20, '수능': 0 };
  T.eq(PM.filter.apply([s], { practicalOnly: true }).length, 0);
});

T.test('실기 100% 조건에서 ratio가 null인 전형은 제외된다', function () {
  var s = school();
  s.tracks[0].ratio = null;
  s.tracks[0].verification.level = '부분확인';
  T.eq(PM.filter.apply([s], { practicalOnly: true }).length, 0);
});

T.test('수능최저 없음 조건에서 minCsat이 undefined인 전형은 제외된다', function () {
  var s = school();
  delete s.tracks[0].minCsat;
  s.tracks[0].verification.level = '부분확인';
  T.eq(PM.filter.apply([s], { noMinCsat: true }).length, 0);
});

T.test('수능최저 없음 조건은 minCsat이 null인 전형만 남긴다', function () {
  T.eq(PM.filter.apply([school()], { noMinCsat: true }).length, 1);
  var s = school();
  s.tracks[0].minCsat = '국영수 중 2개 합 7';
  T.eq(PM.filter.apply([s], { noMinCsat: true }).length, 0);
});

T.test('실기 곡 유형으로 거른다', function () {
  T.eq(PM.filter.apply([school()], { songType: '지정곡' }).length, 0);
  T.eq(PM.filter.apply([school()], { songType: '자유곡' }).length, 1);
});

T.test('조건 여러 개는 AND로 동작한다', function () {
  T.eq(PM.filter.apply([school()], { type: '4년제', major: '보컬', practicalOnly: true }).length, 1);
  T.eq(PM.filter.apply([school()], { type: '4년제', major: '작곡' }).length, 0);
});

T.test('원본 학교 객체를 변경하지 않는다', function () {
  var s = school();
  s.tracks.push({
    id: 'jeongsi', season: '정시', name: '정시전형', majors: ['작곡'],
    quota: { '작곡': 4 }, ratio: { '실기': 100, '내신': 0, '수능': 0 },
    minCsat: null, practical: { songType: '자유곡' },
    verification: { level: '확인됨' }
  });
  var r = PM.filter.apply([s], { major: '보컬' });
  T.eq(s.tracks.length, 2);
  T.assert(r[0] !== s, '반환된 학교는 원본과 다른 객체여야 함');
});

T.test('quotaOf는 전공 모집인원을 반환하고 없으면 null이다', function () {
  var t = school().tracks[0];
  T.eq(PM.filter.quotaOf(t, '보컬'), 10);
  T.eq(PM.filter.quotaOf(t, '드럼'), null);
  T.eq(PM.filter.quotaOf({ quota: null }, '보컬'), null);
});

T.test('전공 필터는 원문 전공명이 표준 전공명을 포함하기만 해도 매칭된다', function () {
  var s = school({ tracks: [{
    id: 'susi', season: '수시', name: '실기전형',
    majors: ['재즈기타/관현악', '기악(드럼)', '베이스기타'],
    quota: { '재즈기타/관현악': 7, '기악(드럼)': 6, '베이스기타': 3 },
    ratio: { '실기': 100, '내신': 0, '수능': 0 },
    minCsat: null, practical: { songType: '자유곡' },
    verification: { level: '확인됨' }
  }] });
  T.eq(PM.filter.apply([s], { major: '기타' }).length, 1);
  T.eq(PM.filter.apply([s], { major: '드럼' }).length, 1);
  T.eq(PM.filter.apply([s], { major: '베이스' }).length, 1);
  T.eq(PM.filter.apply([s], { major: '건반' }).length, 0);
});

T.test('전공 필터는 건반↔피아노, 작곡↔편곡을 동의어로 매칭한다', function () {
  var s = school({ tracks: [{
    id: 'susi', season: '수시', name: '실기전형',
    majors: ['재즈피아노', '작편곡'],
    quota: { '재즈피아노': 5, '작편곡': 4 },
    ratio: { '실기': 100, '내신': 0, '수능': 0 },
    minCsat: null, practical: { songType: '자유곡' },
    verification: { level: '확인됨' }
  }] });
  T.eq(PM.filter.apply([s], { major: '건반' }).length, 1);
  T.eq(PM.filter.apply([s], { major: '작곡' }).length, 1);
});

T.test('quotaOf도 부분 일치하는 전공명의 모집인원을 합산해 반환한다', function () {
  var t = {
    quota: { '기악(기타)': 3, '베이스기타': 2, '드럼': 4 }
  };
  T.eq(PM.filter.quotaOf(t, '기타'), 5); // 기악(기타) + 베이스기타 둘 다 "기타"를 포함
  T.eq(PM.filter.quotaOf(t, '드럼'), 4);
});
