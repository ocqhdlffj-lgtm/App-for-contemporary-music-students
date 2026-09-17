function validSchool() {
  return {
    id: 'test-univ',
    name: '테스트대학교',
    type: '전문대',
    region: '경기',
    deptName: '실용음악과',
    admissionsUrl: 'https://example.ac.kr',
    guideUrl: null,
    tracks: [{
      id: 'susi',
      season: '수시',
      name: '실기우수자전형',
      majors: ['보컬'],
      quota: { '보컬': 12 },
      schedule: { apply: ['2026-09-08', '2026-09-11'], practical: ['2026-10-11'], announce: '2026-11-14' },
      ratio: { '실기': 80, '내신': 20, '수능': 0 },
      minCsat: null,
      practical: {
        songCount: 2, songType: '자유곡', designatedSongs: [],
        accompaniment: 'MR', durationMin: 5, sheetMusicRequired: true, notes: ''
      },
      competition: [],
      verification: { level: '확인됨', checkedAt: '2026-09-10', source: 'https://example.ac.kr/guide' }
    }],
    prepPoints: []
  };
}

T.test('올바른 학교 레코드는 통과한다', function () {
  T.eq(PM.schema.validateSchool(validSchool()).ok, true);
});

T.test('필수 필드가 없으면 실패한다', function () {
  var s = validSchool();
  delete s.name;
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('name') >= 0, 'name 오류가 보고되어야 함');
});

T.test('type은 4년제 또는 전문대만 허용한다', function () {
  var s = validSchool();
  s.type = '대학원';
  T.eq(PM.schema.validateSchool(s).ok, false);
});

T.test('반영비율 합계가 100이 아니면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].ratio = { '실기': 80, '내신': 30, '수능': 0 };
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('100') >= 0, '합계 오류가 보고되어야 함');
});

T.test('날짜 형식이 틀리면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].schedule.practical = ['2026/10/11'];
  T.eq(PM.schema.validateSchool(s).ok, false);
});

T.test('접수 시작이 종료보다 늦으면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].schedule.apply = ['2026-09-11', '2026-09-08'];
  T.eq(PM.schema.validateSchool(s).ok, false);
});

T.test('확인됨인데 필수 항목이 null이면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].ratio = null;
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('확인됨') >= 0, '거짓 확신이 보고되어야 함');
});

T.test('미확인이면 항목이 null이어도 통과한다', function () {
  var s = validSchool();
  s.tracks[0].ratio = null;
  s.tracks[0].schedule = null;
  s.tracks[0].practical = null;
  s.tracks[0].quota = null;
  delete s.tracks[0].minCsat;
  s.tracks[0].verification.level = '미확인';
  T.eq(PM.schema.validateSchool(s).ok, true);
});

T.test('학교 등급은 전형 중 최저를 따른다', function () {
  var s = validSchool();
  s.tracks.push(JSON.parse(JSON.stringify(s.tracks[0])));
  s.tracks[1].id = 'jeongsi';
  s.tracks[1].verification.level = '미확인';
  T.eq(PM.schema.schoolLevel(s), '미확인');
});

T.test('전형이 없으면 학교 등급은 미확인이다', function () {
  var s = validSchool();
  s.tracks = [];
  T.eq(PM.schema.schoolLevel(s), '미확인');
});

T.test('확인됨인데 quota가 빈 객체면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].quota = {};
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('quota') >= 0, 'quota 오류가 보고되어야 함');
});

T.test('확인됨인데 schedule이 빈 객체면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].schedule = {};
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('schedule') >= 0, 'schedule 오류가 보고되어야 함');
});

T.test('확인됨인데 practical이 빈 객체면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].practical = {};
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('practical') >= 0, 'practical 오류가 보고되어야 함');
});

T.test('확인됨인데 실기고사일(schedule.practical)이 없으면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].schedule = { apply: ['2026-09-08', '2026-09-11'], announce: '2026-11-14' };
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('practical') >= 0, 'schedule.practical 오류가 보고되어야 함');
});

T.test('반영비율에 숫자가 아닌 값이 있으면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].ratio = { '실기': 100, '내신': 'garbage', '수능': 0 };
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('내신') >= 0, '숫자가 아닌 항목 이름이 보고되어야 함');
});

T.test('미확인 전형이 minCsat: null을 가지면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].verification.level = '미확인';
  s.tracks[0].minCsat = null;
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('minCsat') >= 0, 'minCsat 오류가 보고되어야 함');
});

T.test('미확인 전형이 minCsat 키 자체가 없으면 통과한다', function () {
  var s = validSchool();
  s.tracks[0].verification.level = '미확인';
  delete s.tracks[0].minCsat;
  T.eq(PM.schema.validateSchool(s).ok, true);
});

T.test('미확인이면 빈 객체여도 통과한다', function () {
  var s = validSchool();
  s.tracks[0].quota = {};
  s.tracks[0].schedule = {};
  s.tracks[0].practical = {};
  delete s.tracks[0].minCsat;
  s.tracks[0].verification.level = '미확인';
  T.eq(PM.schema.validateSchool(s).ok, true);
});
