(function () {
  var M = LA.measureTool;

  function page(index, over) {
    var ii = {
      url: 'https://upload.wikimedia.org/x.jpg', thumburl: 'https://upload.wikimedia.org/t.jpg',
      descriptionurl: 'https://commons.wikimedia.org/wiki/File:X.jpg', width: 1200, height: 1600, mime: 'image/jpeg',
      extmetadata: { LicenseShortName: { value: 'CC BY-SA 4.0' }, Artist: { value: '<a href="#">홍길동</a>' } }
    };
    Object.keys(over || {}).forEach(function (k) { ii[k] = over[k]; });
    return { index: index, title: 'File:X' + index + '.jpg', imageinfo: [ii] };
  }

  T.test('라이선스: 자유 라이선스만 통과, NC·ND·불명은 제외', function () {
    ['CC BY 2.0', 'CC BY-SA 4.0', 'CC0', 'Public domain', 'PD-self'].forEach(function (l) {
      T.eq(M.licenseOk(l), true, l);
    });
    ['CC BY-NC 2.0', 'CC BY-ND 4.0', 'Fair use', '', undefined].forEach(function (l) {
      T.eq(M.licenseOk(l), false, String(l));
    });
  });

  T.test('검색 결과: 순서 유지, 작은 사진·비허용 라이선스·gif 제외, 저작자 태그 제거', function () {
    var json = { query: { pages: {
      '11': page(2),
      '12': page(1, { extmetadata: { LicenseShortName: { value: 'CC BY-NC 2.0' }, Artist: { value: 'a' } } }),
      '13': page(3, { width: 300, height: 400 }),
      '14': page(4, { mime: 'image/gif' }),
      '15': page(0)
    } } };
    var c = M.parseCandidates(json);
    T.eq(c.map(function (x) { return x.title; }), ['File:X0.jpg', 'File:X2.jpg']);
    T.eq(c[0].author, '홍길동');
    T.eq(c[0].license, 'CC BY-SA 4.0');
    T.eq(M.parseCandidates({}), []);
  });

  T.test('파일 이름에 연예인 이름이 있는 사진만 본인 후보로 본다(표기 차이는 허용)', function () {
    var c = { en: 'Song Joong-ki', alt: ['Song Joongki'] };
    T.eq(M.titleHasName('File:Song Joong Ki at Battleship Island.jpg', c), true);
    T.eq(M.titleHasName('File:Song Joong-ki 3.jpg', c), true);
    T.eq(M.titleHasName('File:Forencos (8).jpg', c), false);
    T.eq(M.titleHasName('File:Song Hye-kyo.jpg', c), false);
    var json = { query: { pages: { 1: page(0), 2: page(1) } } };
    json.query.pages[1].title = 'File:Song Joong-ki 2016.jpg';
    json.query.pages[2].title = 'File:Forencos (8).jpg';
    T.eq(M.parseCandidates(json, c).map(function (x) { return x.title; }), ['File:Song Joong-ki 2016.jpg']);
    T.eq(M.parseCandidates(json).length, 2, 'celeb 없으면 이름 검사 안 함');
  });

  T.test('검색 주소: 이름을 따옴표로 묶고 비트맵만, CORS용 origin=*', function () {
    var u = M.searchUrl({ en: 'Song Joong-ki' });
    T.assert(u.indexOf('origin=*') >= 0, 'origin');
    T.assert(u.indexOf(encodeURIComponent('"Song Joong-ki" filetype:bitmap')) >= 0, 'query');
  });

  T.test('내보내기: 체크한 성공 사진만 평균, 출처 포함, 사진 없는 사람은 뺀다', function () {
    var v = function (x) { return { faceLength: x, jawWidth: 0, eyeTilt: -x, eyeRound: 0, eyeSize: 0.2, lipFull: 0 }; };
    var celeb = { id: 'a' };
    var results = [
      { celeb: celeb, cands: [
        { ok: true, checked: true, vector: v(0.2), page: 'p1', author: 'A', license: 'CC0' },
        { ok: true, checked: true, vector: v(0.4), page: 'p2', author: 'B', license: 'CC BY 2.0' },
        { ok: true, checked: false, vector: v(0.9), page: 'p3', author: 'C', license: 'CC0' },
        { ok: false, reason: '여러 명', page: 'p4' }
      ] },
      { celeb: { id: 'b' }, cands: [{ ok: false, reason: '얼굴 없음' }] }
    ];
    var text = M.buildExport(results);
    var data = (new Function('window', text + '; return window.LA.CELEB_MEASURED;'))({ LA: {} });
    T.eq(Object.keys(data), ['a']);
    T.eq(data.a.n, 2);
    T.eq(data.a.vector.faceLength, 0.3);
    T.eq(data.a.vector.eyeTilt, -0.3);
    T.eq(data.a.sources.map(function (s) { return s.page; }), ['p1', 'p2']);
  });

  T.test('측정값이 있는 연예인은 태그 값 대신 측정값으로 비교한다', function () {
    var c = LA.CELEBS[0];
    var tagVec = LA.match.celebVector(c);
    var fake = { faceLength: 0.5, jawWidth: -0.5, eyeTilt: 0.5, eyeRound: -0.5, eyeSize: 0.5, lipFull: -0.5 };
    LA.CELEB_MEASURED = {};
    LA.CELEB_MEASURED[c.id] = { vector: fake, n: 1, sources: [] };
    try {
      T.eq(LA.match.celebVector(c), fake);
      var r = LA.match.rank(fake, LA.CELEBS, { gender: 'all', limit: 1 });
      T.eq(r[0].celeb.id, c.id);
      T.eq(r[0].measured, true);
      T.eq(r[0].score, 100);
    } finally { LA.CELEB_MEASURED = {}; }
    T.eq(LA.match.celebVector(c), tagVec, '측정값 없으면 태그 값으로 복귀');
  });

  T.test('깨진 측정값은 무시하고 태그 값을 쓴다', function () {
    var c = LA.CELEBS[0];
    LA.CELEB_MEASURED = {};
    LA.CELEB_MEASURED[c.id] = { vector: { faceLength: 'x' } };
    try { T.eq(LA.match.measuredOf(c), null); } finally { LA.CELEB_MEASURED = {}; }
  });

  T.test('모든 연예인에 영문 이름(측정 도구 검색용)이 있다', function () {
    LA.CELEBS.forEach(function (c) { T.assert(c.en && /^[A-Za-z .'-]+$/.test(c.en), c.id); T.assert(Array.isArray(c.alt), c.id + ' alt'); });
  });
})();
