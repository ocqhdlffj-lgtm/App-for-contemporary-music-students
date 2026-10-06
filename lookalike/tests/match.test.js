(function () {
  var M = LA.match;

  function find(id) { return LA.CELEBS.filter(function (c) { return c.id === id; })[0]; }

  T.test('연예인 데이터는 검증을 통과한다', function () {
    T.eq(M.validate(LA.CELEBS), []);
  });

  T.test('검증기는 id 중복·잘못된 동물상·무드·태그를 잡는다', function () {
    var base = { id: 'a', name: '가', gender: 'F', animal: 'dog', mood: 'pure' };
    function bad(over) {
      var c = Object.assign({}, base, over);
      return M.validate([c]).length;
    }
    T.eq(M.validate([base, base]).length, 1, '중복');
    T.eq(bad({ animal: 'tiger' }), 1);
    T.eq(bad({ mood: 'nope' }), 1);
    T.eq(bad({ gender: 'X' }), 1);
    T.eq(bad({ eyeTilt: 'sideways' }), 1);
    T.eq(bad({ eyeSize: 'huge' }), 1);
    T.eq(bad({ faceShape: 'triangle' }), 1);
  });

  T.test('성별·후보 수 기준이 3명 이상씩 있다(TOP 3가 항상 채워짐)', function () {
    ['F', 'M'].forEach(function (g) {
      T.assert(LA.CELEBS.filter(function (c) { return c.gender === g; }).length >= 3, g);
    });
  });

  T.test('같은 성별만 고르면 그 성별만 나온다', function () {
    var v = LA.profile.ANIMALS.cat.proto;
    ['F', 'M'].forEach(function (g) {
      var r = M.rank(v, LA.CELEBS, { gender: g });
      T.eq(r.length, 3);
      r.forEach(function (x) { T.eq(x.celeb.gender, g); });
    });
  });

  T.test('연예인 태그와 똑같은 특징이면 그 연예인이 1위·100%', function () {
    var c = find('jennie');
    var r = M.rank(M.celebVector(c), LA.CELEBS, { gender: 'F' });
    T.eq(r[0].celeb.id, 'jennie');
    T.eq(r[0].score, 100);
  });

  T.test('순위는 거리 오름차순(일치도 내림차순)', function () {
    var r = M.rank(LA.profile.ANIMALS.deer.proto, LA.CELEBS, { gender: 'all', limit: 10 });
    for (var i = 1; i < r.length; i++) {
      T.assert(r[i - 1].distance <= r[i].distance, 'distance');
      T.assert(r[i - 1].score >= r[i].score, 'score');
    }
  });

  T.test('일치도는 0~100으로 잘린다', function () {
    T.eq(M.scoreOf(0), 100);
    T.eq(M.scoreOf(100), 0);
  });

  T.test('공통점에는 "보통" 단계끼리 같은 건 넣지 않는다', function () {
    var a = { faceLength: 0, jawWidth: 0, eyeTilt: 0.7, eyeRound: 0, eyeSize: 0, lipFull: 0 };
    T.eq(M.commonTraits(a, a), ['계란형 얼굴', '올라간 눈꼬리']);
  });
})();
