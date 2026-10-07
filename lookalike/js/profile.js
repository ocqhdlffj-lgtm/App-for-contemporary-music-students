(function (LA) {
  // 특징 벡터 ↔ 사람이 읽는 말. 직접 선택(퀴즈) 답변, 연예인 태그,
  // 사진 분석 결과가 모두 같은 벡터 공간으로 모이도록 변환표를 여기 한 곳에 둔다.

  // 태그 → 축 값. 퀴즈 선택지와 data/celebs.js의 태그가 이 표를 같이 쓴다.
  var FACE_SHAPES = {
    oval: { label: '계란형', faceLength: 0, jawWidth: 0 },
    round: { label: '둥근형', faceLength: -0.6, jawWidth: 0.1 },
    square: { label: '각진형', faceLength: -0.1, jawWidth: 0.7 },
    long: { label: '긴형', faceLength: 0.7, jawWidth: 0.1 },
    heart: { label: '하트형(V라인)', faceLength: 0.1, jawWidth: -0.7 }
  };
  var LEVEL = { high: 0.6, mid: 0, low: -0.6 };
  var TILT = { up: 0.7, flat: 0, down: -0.7 };

  // 퀴즈 문항. value는 위 표의 키, dims는 그 답이 정하는 축.
  var QUESTIONS = [
    {
      key: 'faceShape', title: '얼굴형은 어디에 가까운가요?',
      options: [
        { value: 'oval', label: '계란형', hint: '이마·광대·턱이 고르게 갸름' },
        { value: 'round', label: '둥근형', hint: '세로가 짧고 볼이 동그란 편' },
        { value: 'square', label: '각진형', hint: '턱선이 넓고 또렷한 편' },
        { value: 'long', label: '긴형', hint: '가로보다 세로가 확실히 긴 편' },
        { value: 'heart', label: '하트형', hint: '이마가 넓고 턱이 뾰족한 V라인' }
      ]
    },
    {
      key: 'eyeTilt', title: '눈꼬리는 어느 쪽인가요?',
      options: [
        { value: 'up', label: '올라간 편', hint: '바깥 끝이 위로 향함' },
        { value: 'flat', label: '수평', hint: '안쪽·바깥쪽 높이가 비슷' },
        { value: 'down', label: '처진 편', hint: '바깥 끝이 아래로 향함' }
      ]
    },
    {
      key: 'eyeRound', title: '눈 모양은요?',
      options: [
        { value: 'high', label: '동그란 눈', hint: '세로로 시원하게 열림' },
        { value: 'mid', label: '보통', hint: '' },
        { value: 'low', label: '가로로 긴 눈', hint: '가늘고 길게 뻗음' }
      ]
    },
    {
      key: 'eyeSize', title: '얼굴에 비해 눈 크기는요?',
      options: [
        { value: 'high', label: '크고 또렷한 편', hint: '' },
        { value: 'mid', label: '보통', hint: '' },
        { value: 'low', label: '작고 은은한 편', hint: '' }
      ]
    },
    {
      key: 'lipFull', title: '입술 두께는요?',
      options: [
        { value: 'high', label: '도톰한 편', hint: '' },
        { value: 'mid', label: '보통', hint: '' },
        { value: 'low', label: '얇은 편', hint: '' }
      ]
    }
  ];

  // 동물상 원형. 각 축 값은 "그 상(像)을 떠올릴 때 흔히 말하는 특징"을
  // 벡터로 옮긴 것이다(예: 강아지상 = 처진 눈꼬리 + 동그란 눈).
  var ANIMALS = {
    dog: {
      name: '강아지상', emoji: '🐶',
      desc: '처진 눈꼬리와 동그란 눈매로 순하고 다정한 인상이에요.',
      proto: { faceLength: 0, jawWidth: 0, eyeTilt: -0.7, eyeRound: 0.5, eyeSize: 0.3, lipFull: 0 }
    },
    cat: {
      name: '고양이상', emoji: '🐱',
      desc: '살짝 올라간 눈꼬리와 또렷한 눈으로 도도하고 세련된 인상이에요.',
      proto: { faceLength: 0.1, jawWidth: -0.3, eyeTilt: 0.7, eyeRound: 0.2, eyeSize: 0.4, lipFull: 0 }
    },
    fox: {
      name: '여우상', emoji: '🦊',
      desc: '가로로 길고 올라간 눈매, 갸름한 턱선으로 매혹적이고 도회적인 인상이에요.',
      proto: { faceLength: 0.3, jawWidth: -0.5, eyeTilt: 0.6, eyeRound: -0.6, eyeSize: -0.1, lipFull: -0.2 }
    },
    rabbit: {
      name: '토끼상', emoji: '🐰',
      desc: '크고 동그란 눈과 짧고 동그란 얼굴로 상큼하고 발랄한 인상이에요.',
      proto: { faceLength: -0.3, jawWidth: -0.2, eyeTilt: 0, eyeRound: 0.7, eyeSize: 0.6, lipFull: -0.2 }
    },
    bear: {
      name: '곰상', emoji: '🐻',
      desc: '넉넉한 얼굴선과 은은한 눈매로 듬직하고 포근한 인상이에요.',
      proto: { faceLength: -0.4, jawWidth: 0.6, eyeTilt: -0.2, eyeRound: -0.2, eyeSize: -0.5, lipFull: 0.2 }
    },
    dino: {
      name: '공룡상', emoji: '🦖',
      desc: '긴 얼굴과 뚜렷한 턱선, 시원한 이목구비로 강렬하고 남성적인 인상이에요.',
      proto: { faceLength: 0.6, jawWidth: 0.6, eyeTilt: 0, eyeRound: -0.3, eyeSize: 0, lipFull: 0.4 }
    },
    deer: {
      name: '사슴상', emoji: '🦌',
      desc: '크고 맑은 눈과 갸름하고 긴 얼굴선으로 우아하고 청초한 인상이에요.',
      proto: { faceLength: 0.4, jawWidth: -0.3, eyeTilt: -0.2, eyeRound: 0.4, eyeSize: 0.6, lipFull: 0 }
    }
  };
  var ANIMAL_KEYS = ['dog', 'cat', 'fox', 'rabbit', 'bear', 'dino', 'deer'];

  // 거리 가중치: 인상을 가장 크게 좌우하는 눈꼬리를 무겁게, 사진에서
  // 표정에 따라 잘 흔들리는 입술은 가볍게 본다.
  var WEIGHTS = { faceLength: 1, jawWidth: 1, eyeTilt: 1.4, eyeRound: 1.1, eyeSize: 1, lipFull: 0.6 };

  function distance(a, b) {
    var s = 0;
    LA.features.DIMS.forEach(function (d) {
      var diff = (a[d] || 0) - (b[d] || 0);
      s += WEIGHTS[d] * diff * diff;
    });
    return Math.sqrt(s);
  }

  // 태그 묶음(퀴즈 답 또는 연예인 태그) → 벡터. 없는 태그는 base에서 가져온다.
  function vectorFromTags(tags, base) {
    var v = {};
    LA.features.DIMS.forEach(function (d) { v[d] = base ? base[d] : 0; });
    if (tags.faceShape && FACE_SHAPES[tags.faceShape]) {
      v.faceLength = FACE_SHAPES[tags.faceShape].faceLength;
      v.jawWidth = FACE_SHAPES[tags.faceShape].jawWidth;
    }
    if (tags.eyeTilt && TILT[tags.eyeTilt] != null) v.eyeTilt = TILT[tags.eyeTilt];
    ['eyeRound', 'eyeSize', 'lipFull'].forEach(function (d) {
      if (tags[d] && LEVEL[tags[d]] != null) v[d] = LEVEL[tags[d]];
    });
    return v;
  }

  // 퀴즈는 모든 문항에 답해야 결과를 낸다 — 빈 답을 0(평균)으로 메워버리면
  // 사용자는 답하지 않은 항목이 결과에 반영됐다고 오해한다.
  function fromAnswers(answers) {
    var missing = QUESTIONS.filter(function (q) { return !answers[q.key]; });
    if (missing.length) throw new Error('답하지 않은 문항: ' + missing.map(function (q) { return q.key; }).join(', '));
    return vectorFromTags(answers, null);
  }

  // 가까운 순서로 정렬한 동물상 목록. share는 화면용 비율(합 100)이다.
  function rankAnimals(v) {
    var list = ANIMAL_KEYS.map(function (k) {
      return { key: k, d: distance(v, ANIMALS[k].proto) };
    }).sort(function (a, b) { return a.d - b.d; });
    var ws = list.map(function (x) { return Math.exp(-x.d * x.d / 0.5); });
    var sum = ws.reduce(function (a, b) { return a + b; }, 0) || 1;
    var shares = ws.map(function (w) { return Math.round(100 * w / sum); });
    // 반올림 오차로 합이 100이 아닐 수 있으니 1위에 몰아준다.
    shares[0] += 100 - shares.reduce(function (a, b) { return a + b; }, 0);
    return list.map(function (x, i) {
      return { key: x.key, animal: ANIMALS[x.key], distance: x.d, share: shares[i] };
    });
  }

  // 축 값 → 짧은 설명. neutral이면 "보통"류 문구라 공통점 표시에서는 뺀다.
  function traitOf(dim, value) {
    var T = {
      eyeTilt: ['처진 눈꼬리', '수평 눈매', '올라간 눈꼬리'],
      eyeRound: ['가로로 긴 눈', '균형 잡힌 눈매', '동그란 눈'],
      eyeSize: ['은은한 눈매', '보통 크기 눈', '크고 또렷한 눈'],
      lipFull: ['얇은 입술', '균형 잡힌 입술', '도톰한 입술']
    }[dim];
    var level = value > 0.3 ? 2 : value < -0.3 ? 0 : 1;
    return { dim: dim, level: level, label: T[level], neutral: level === 1 };
  }

  function describe(v) {
    var shape = LA.features.faceShapeOf(v);
    return [{ dim: 'faceShape', level: shape, label: FACE_SHAPES[shape].label + ' 얼굴', neutral: false }]
      .concat(['eyeTilt', 'eyeRound', 'eyeSize', 'lipFull'].map(function (d) { return traitOf(d, v[d]); }));
  }

  // 측정 벡터 → 퀴즈 답 형식. 확인 화면에서 "사진으로는 이렇게 보였어요"를
  // 미리 선택해 두는 데 쓴다. 경계값(±0.3)은 describe()와 같다.
  function answersFromVector(v) {
    function lv(x) { return x > 0.3 ? 'high' : x < -0.3 ? 'low' : 'mid'; }
    return {
      faceShape: LA.features.faceShapeOf(v),
      eyeTilt: v.eyeTilt > 0.3 ? 'up' : v.eyeTilt < -0.3 ? 'down' : 'flat',
      eyeRound: lv(v.eyeRound), eyeSize: lv(v.eyeSize), lipFull: lv(v.lipFull)
    };
  }

  // 사용자가 확인 화면에서 바꾼 문항만 그 답의 값으로 덮어쓴다. 바꾸지 않은
  // 문항은 사진에서 잰 연속값을 그대로 둔다(같은 "보통"이라도 측정값이
  // 더 세밀하므로).
  function applyCorrections(v, answers) {
    var detected = answersFromVector(v);
    var changed = {};
    Object.keys(answers).forEach(function (k) {
      if (answers[k] && answers[k] !== detected[k]) changed[k] = answers[k];
    });
    return vectorFromTags(changed, v);
  }

  LA.profile = {
    QUESTIONS: QUESTIONS, ANIMALS: ANIMALS, ANIMAL_KEYS: ANIMAL_KEYS, FACE_SHAPES: FACE_SHAPES,
    WEIGHTS: WEIGHTS, distance: distance, vectorFromTags: vectorFromTags,
    fromAnswers: fromAnswers, rankAnimals: rankAnimals, describe: describe,
    answersFromVector: answersFromVector, applyCorrections: applyCorrections
  };
})(window.LA);
