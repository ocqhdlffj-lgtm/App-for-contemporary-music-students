(function (LA) {
  // 사용자 특징 벡터 ↔ 연예인 태그 벡터 비교. 순수 로직.

  // 가중 거리 → 화면용 "특징 일치도"(%). 거리 0이 100%, 3.2 이상이 0%인
  // 직선이다. 6개 축이 전부 정반대(최대 거리 약 5)일 일은 거의 없고,
  // 동물상이 아예 다른 원형끼리 거리가 대략 1.5~2.5라서 그 구간이
  // 25~55% 정도로 나오도록 잡았다. 얼굴 인식 점수가 아니라 특징 태그끼리의
  // 거리라는 점은 화면 문구로도 밝힌다.
  var ZERO_AT = 3.2;

  function scoreOf(d) {
    return Math.max(0, Math.min(100, Math.round(100 * (1 - d / ZERO_AT))));
  }

  // 사진에서 직접 잰 값(data/celebs-measured.js)이 있으면 그걸 쓴다. 사용자
  // 사진과 같은 방식으로 잰 값이라 인상 태그로 만든 값보다 훨씬 정확하다.
  // 없는 연예인만 태그 값으로 대신한다.
  function measuredOf(c) {
    if (LA.USE_MEASURED !== true) return null;
    var m = (LA.CELEB_MEASURED || {})[c.id];
    if (!m || !m.vector) return null;
    var ok = LA.features.DIMS.every(function (d) { return typeof m.vector[d] === 'number'; });
    return ok ? m.vector : null;
  }

  // 연예인 실측값과 비교할 때의 가중치. 실측 14명 중 얼굴 길이는 12명이 -0.7 이하
  // (6명은 한계값 -1), 눈 둥글기는 10명이 +0.7 이상이었다. 연예인 사진은 행사에서
  // 멀리 찍은 것이라 얼굴이 길게 보이지 않고(비율 1.15 이하), 사용자 셀카는 가까이서
  // 찍어 1.3 근처로 나와 두 값의 기준이 어긋난다. 한쪽으로 몰린 두 축은 비교에서
  // 비중을 낮추고, 거리 영향이 적은 눈꼬리·눈 크기·턱 폭·입술은 그대로 쓴다.
  var MEASURED_WEIGHTS = (function () {
    var w = {};
    Object.keys(LA.profile.WEIGHTS).forEach(function (d) { w[d] = LA.profile.WEIGHTS[d]; });
    w.faceLength = 0.25;
    w.eyeRound = 0.5;
    return w;
  })();

  function celebVector(c) {
    var measured = measuredOf(c);
    if (measured) return measured;
    var animal = LA.profile.ANIMALS[c.animal];
    if (!animal) throw new Error('알 수 없는 동물상: ' + c.animal + ' (' + c.id + ')');
    return LA.profile.vectorFromTags(c, animal.proto);
  }

  // 둘 다 같은 단계로 분류되는 특징만 "공통점"으로 뽑는다. "보통"끼리 같은
  // 건 닮았다고 하기 어려우니 뺀다(얼굴형은 계란형끼리여도 보여준다).
  function commonTraits(a, b) {
    var ta = LA.profile.describe(a), tb = LA.profile.describe(b);
    var out = [];
    ta.forEach(function (t, i) {
      if (t.level === tb[i].level && !t.neutral) out.push(t.label);
    });
    return out;
  }

  // opts.gender: 'F' | 'M' | 'all'. limit 기본 3.
  // 거리가 같으면 데이터 파일 순서를 유지한다(Array.prototype.sort는
  // ES2019부터 안정 정렬이 보장된다).
  function rank(v, celebs, opts) {
    opts = opts || {};
    var g = opts.gender || 'all';
    return celebs
      .filter(function (c) { return g === 'all' || c.gender === g; })
      .map(function (c) {
        var cv = celebVector(c);
        var measured = !!measuredOf(c);
        var d = LA.profile.distance(v, cv, measured ? MEASURED_WEIGHTS : null);
        return { celeb: c, vector: cv, measured: measured, distance: d, score: scoreOf(d), common: commonTraits(v, cv) };
      })
      .sort(function (x, y) { return x.distance - y.distance; })
      .slice(0, opts.limit || 3);
  }

  // 데이터 파일 검증: 필수 필드·허용 값·id 중복. 테스트와 앱 시작 시 둘 다 쓴다.
  function validate(celebs) {
    var errors = [], seen = {};
    var LEVELS = ['high', 'mid', 'low'];
    celebs.forEach(function (c, i) {
      var at = (c.id || '#' + i) + ': ';
      if (!c.id) errors.push(at + 'id 없음');
      else if (seen[c.id]) errors.push(at + 'id 중복');
      seen[c.id] = true;
      if (!c.name) errors.push(at + 'name 없음');
      if (c.gender !== 'F' && c.gender !== 'M') errors.push(at + 'gender는 F/M');
      if (!LA.profile.ANIMALS[c.animal]) errors.push(at + 'animal 값이 잘못됨');
      if (c.faceShape && !LA.profile.FACE_SHAPES[c.faceShape]) errors.push(at + 'faceShape 값이 잘못됨');
      if (c.eyeTilt && ['up', 'flat', 'down'].indexOf(c.eyeTilt) < 0) errors.push(at + 'eyeTilt 값이 잘못됨');
      ['eyeRound', 'eyeSize', 'lipFull'].forEach(function (k) {
        if (c[k] && LEVELS.indexOf(c[k]) < 0) errors.push(at + k + ' 값이 잘못됨');
      });
      if (!LA.styling.MOODS[c.mood]) errors.push(at + 'mood 값이 잘못됨');
    });
    return errors;
  }

  LA.match = { rank: rank, celebVector: celebVector, measuredOf: measuredOf, MEASURED_WEIGHTS: MEASURED_WEIGHTS, scoreOf: scoreOf, commonTraits: commonTraits, validate: validate };
})(window.LA);
