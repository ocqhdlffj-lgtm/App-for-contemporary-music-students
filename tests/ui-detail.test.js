function detailSchool(over) {
  var s = {
    id: 'u1', name: '가나대학교', type: '4년제', region: '서울',
    deptName: '실용음악과', admissionsUrl: 'https://x.ac.kr/ipsi', guideUrl: null,
    tracks: [{
      id: 'susi', season: '수시', name: '실기우수자전형',
      majors: ['보컬'], quota: { '보컬': 12 },
      schedule: { apply: ['2026-09-08', '2026-09-11'], practical: ['2026-10-11'], announce: '2026-11-14' },
      ratio: { '실기': 80, '내신': 20, '수능': 0 },
      minCsat: null,
      practical: { songCount: 2, songType: '자유곡', designatedSongs: [], accompaniment: 'MR', durationMin: 5, sheetMusicRequired: true, notes: '' },
      competition: [{ year: 2026, major: '보컬', ratio: 24.5 }],
      verification: { level: '확인됨', checkedAt: '2026-09-10', source: 'https://x.ac.kr/g' }
    }],
    prepPoints: ['자유곡 2곡이므로 대비곡 폭이 중요']
  };
  return Object.assign(s, over || {});
}

T.test('학교명과 전형명을 표시한다', function () {
  var el = PM.ui.detail.render(detailSchool(), {});
  T.assert(el.textContent.indexOf('가나대학교') >= 0);
  T.assert(el.textContent.indexOf('실기우수자전형') >= 0);
});

T.test('실기조건이 일정보다 먼저 나온다', function () {
  var el = PM.ui.detail.render(detailSchool(), {});
  var txt = el.textContent;
  T.assert(txt.indexOf('실기조건') < txt.indexOf('전형일정'), '실기조건이 먼저여야 함');
});

T.test('null 값은 미확인으로 표시한다', function () {
  var s = detailSchool();
  s.tracks[0].ratio = null;
  s.tracks[0].verification.level = '부분확인';
  var el = PM.ui.detail.render(s, {});
  T.assert(el.textContent.indexOf('미확인') >= 0);
});

T.test('수능최저가 null이면 없음으로 표시한다', function () {
  var el = PM.ui.detail.render(detailSchool(), {});
  T.assert(el.textContent.indexOf('수능최저 없음') >= 0);
});

T.test('경쟁률이 비어 있으면 미공개로 표시한다', function () {
  var s = detailSchool();
  s.tracks[0].competition = [];
  var el = PM.ui.detail.render(s, {});
  T.assert(el.textContent.indexOf('미공개') >= 0);
});

T.test('prepPoints는 참고 딱지가 붙은 별도 박스에 들어간다', function () {
  var el = PM.ui.detail.render(detailSchool(), {});
  var box = el.querySelector('.prep');
  T.assert(box, 'prep 박스 필요');
  T.assert(box.textContent.indexOf('공식 요강 아님') >= 0, '참고 딱지 필요');
  T.assert(box.textContent.indexOf('대비곡 폭이 중요') >= 0);
});

T.test('prepPoints가 비면 박스를 그리지 않는다', function () {
  var s = detailSchool();
  s.prepPoints = [];
  T.eq(PM.ui.detail.render(s, {}).querySelector('.prep'), null);
});

T.test('원문 확인 링크는 admissionsUrl로 새 탭에서 열린다', function () {
  var a = PM.ui.detail.render(detailSchool(), {}).querySelector('a.source-link');
  T.eq(a.getAttribute('href'), 'https://x.ac.kr/ipsi');
  T.eq(a.getAttribute('target'), '_blank');
  T.eq(a.getAttribute('rel'), 'noopener noreferrer');
});

T.test('입학처 링크가 없으면 버튼을 비활성화한다', function () {
  var s = detailSchool({ admissionsUrl: '' });
  var el = PM.ui.detail.render(s, {});
  T.eq(el.querySelector('a.source-link'), null);
  T.assert(el.textContent.indexOf('링크 확인 중') >= 0);
});

T.test('찜 버튼을 누르면 onTogglePick이 학교·전형 id로 불린다', function () {
  var got = null;
  var el = PM.ui.detail.render(detailSchool(), {
    onTogglePick: function (sid, tid) { got = [sid, tid]; }
  });
  el.querySelector('.pick-btn').click();
  T.eq(got, ['u1', 'susi']);
});

T.test('fmt는 null을 미확인으로 바꾼다', function () {
  T.eq(PM.ui.detail.fmt(null), '미확인');
  T.eq(PM.ui.detail.fmt(2, '곡'), '2곡');
});

T.test('반영비율 중 일부가 null이면 미확인으로 표시하고 null%을 노출하지 않는다', function () {
  var s = detailSchool();
  s.tracks[0].ratio = { '실기': 80, '내신': null, '수능': 20 };
  var el = PM.ui.detail.render(s, {});
  var txt = el.textContent;
  T.assert(txt.indexOf('미확인') >= 0, '미확인이 표시되어야 함');
  T.assert(txt.indexOf('null%') === -1, 'null%이 노출되면 안 됨');
});

T.test('모집인원 중 일부가 null이면 미확인으로 표시하고 null명을 노출하지 않는다', function () {
  var s = detailSchool();
  s.tracks[0].quota = { '보컬': null };
  var el = PM.ui.detail.render(s, {});
  var txt = el.textContent;
  T.assert(txt.indexOf('미확인') >= 0, '미확인이 표시되어야 함');
  T.assert(txt.indexOf('null명') === -1, 'null명이 노출되면 안 됨');
});

T.test('경쟁률의 ratio가 null이면 미확인으로 표시하고 null : 1을 노출하지 않는다', function () {
  var s = detailSchool();
  s.tracks[0].competition = [{ year: 2026, major: '보컬', ratio: null }];
  var el = PM.ui.detail.render(s, {});
  var txt = el.textContent;
  T.assert(txt.indexOf('미확인') >= 0, '미확인이 표시되어야 함');
  T.assert(txt.indexOf('null : 1') === -1, 'null : 1이 노출되면 안 됨');
});
