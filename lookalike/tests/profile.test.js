(function () {
  var P = LA.profile;

  function fullAnswers(over) {
    var a = { faceShape: 'oval', eyeTilt: 'flat', eyeRound: 'mid', eyeSize: 'mid', lipFull: 'mid' };
    Object.keys(over || {}).forEach(function (k) { a[k] = over[k]; });
    return a;
  }

  T.test('퀴즈 문항에 하나라도 답하지 않으면 예외(빈 답을 평균으로 메우지 않는다)', function () {
    T.throws(function () { P.fromAnswers({ faceShape: 'oval' }); });
    T.throws(function () { P.fromAnswers({}); });
  });

  T.test('퀴즈의 얼굴형 선택은 그대로 다시 분류된다(왕복)', function () {
    Object.keys(P.FACE_SHAPES).forEach(function (shape) {
      var v = P.fromAnswers(fullAnswers({ faceShape: shape }));
      T.eq(LA.features.faceShapeOf(v), shape, shape);
    });
  });

  T.test('퀴즈 문항의 모든 선택지가 변환표에 있다', function () {
    P.QUESTIONS.forEach(function (q) {
      q.options.forEach(function (o) {
        var over = {}; over[q.key] = o.value;
        var v = P.fromAnswers(fullAnswers(over));
        LA.features.DIMS.forEach(function (d) { T.assert(typeof v[d] === 'number', q.key + '=' + o.value); });
      });
    });
  });

  T.test('각 동물상 원형은 자기 자신으로 분류된다', function () {
    P.ANIMAL_KEYS.forEach(function (k) {
      T.eq(P.rankAnimals(P.ANIMALS[k].proto)[0].key, k, k);
    });
  });

  T.test('처진 눈꼬리 + 동그란 눈은 강아지상, 올라간 눈꼬리는 고양이상 계열', function () {
    var dog = P.fromAnswers(fullAnswers({ eyeTilt: 'down', eyeRound: 'high' }));
    T.eq(P.rankAnimals(dog)[0].key, 'dog');
    var cat = P.fromAnswers(fullAnswers({ eyeTilt: 'up', eyeSize: 'high' }));
    T.eq(P.rankAnimals(cat)[0].key, 'cat');
  });

  T.test('동물상 비율은 합이 100이고 내림차순이다', function () {
    var r = P.rankAnimals(P.fromAnswers(fullAnswers({ eyeTilt: 'up' })));
    T.eq(r.reduce(function (s, x) { return s + x.share; }, 0), 100);
    for (var i = 1; i < r.length; i++) T.assert(r[i - 1].distance <= r[i].distance, 'order');
  });

  T.test('특징 설명: 얼굴형 + 눈·입술 4가지', function () {
    var d = P.describe({ faceLength: 0.7, jawWidth: 0, eyeTilt: 0.7, eyeRound: -0.6, eyeSize: 0, lipFull: 0.6 });
    T.eq(d.map(function (t) { return t.label; }),
      ['긴형 얼굴', '올라간 눈꼬리', '가로로 긴 눈', '보통 크기 눈', '도톰한 입술']);
    T.eq(d[3].neutral, true);
  });
})();
