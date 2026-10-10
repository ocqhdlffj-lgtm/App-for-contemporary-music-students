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

  // 사진에서 직접 잰 값(data/celebs-measured.js)이 있으면 그걸 쓴다. 사용자 사진과 같은
  // 방식으로 잰 값이라, 사람이 붙인 인상 태그보다 근거가 낫다. 없는 연예인만 태그 값으로
  // 대신한다. (정답 비교 자료가 없어 "더 정확하다"고 확인한 것은 아니다 — README 참고.)
  // raw(한계값으로 자르기 전 측정값)가 있으면 지금 기준값(BASE)으로 벡터를 계산한다 —
  // 기준값을 고치면 연예인 벡터도 같이 따라간다. raw가 없는 옛 형식은 vector를 그대로 쓴다.
  function measuredOf(c) {
    if (LA.USE_MEASURED !== true) return null;
    var m = (LA.CELEB_MEASURED || {})[c.id];
    if (!m) return null;
    var v = m.raw ? LA.features.normalize(m.raw) : m.vector;
    if (!v) return null;
    var ok = LA.features.DIMS.every(function (d) { return typeof v[d] === 'number' && isFinite(v[d]); });
    return ok ? v : null;
  }

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
        var d = LA.profile.distance(v, cv);
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

  LA.match = { rank: rank, celebVector: celebVector, measuredOf: measuredOf, scoreOf: scoreOf, commonTraits: commonTraits, validate: validate };
})(window.LA);
