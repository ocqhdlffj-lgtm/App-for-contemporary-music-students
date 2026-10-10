(function (LA) {
  // 얼굴 랜드마크(MediaPipe FaceLandmarker 478점) → 특징 벡터.
  // DOM·네트워크를 전혀 모르는 순수 함수만 둔다 — 테스트는 tests/fixtures의
  // 평균 얼굴 좌표만으로 돌아간다.
  //
  // 특징 벡터의 각 축은 -1 ~ +1이고 0이 "평균 얼굴"이다.
  //
  // 평균(BASE.mean)은 두 군데서 왔다. 처음에는 MediaPipe 평균 얼굴 메시(유럽형 3D 모델,
  // 눈이 반쯤 감긴 중립 표정)를 60cm 거리에서 찍었다고 보고 투영한 값을 썼다. 그런데
  // 위키미디어 커먼즈 사진에서 한국 연예인 15명을 직접 재 보니 이 값과 계속 어긋났다
  // (아래 표). 그대로 두면 한국 사용자 대부분이 "둥근 얼굴·동그란 눈·올라간 눈꼬리"로
  // 나온다. 그래서 어긋난 네 항목(얼굴 길이, 눈꼬리, 눈 둥글기, 눈 크기)의 평균을 그
  // 15명의 평균으로 옮겼다. 턱 폭과 입술은 차이가 작아(각각 -0.13, +0.03 기준 단위) 그대로 뒀다.
  //
  //   항목        메시 기준   연예인 15명 평균 (편차)
  //   faceRatio   1.2934     1.166 (0.039)
  //   eyeTilt     1.16°      6.15° (2.63)
  //   eyeOpen     0.2655     0.349 (0.035)
  //   eyeWidth    0.1843     0.192 (0.007)
  //
  // 한계: 15명은 대부분 20~30대 연예인(여성 위주, 화장·보정 사진)이라 일반 인구의
  // 평균이라고 할 수 없고, 사용자 사진은 아직 없다. 표준편차(sd)는 인구 통계로 검증한 값이
  // 아니라 "±2sd면 눈에 띄게 다르다"는 감각으로 잡은 휴리스틱이다(연예인 편차는 더 좁은
  // 집단이라 그대로 쓰지 않았다) — README 참고.

  // MediaPipe face mesh 인덱스. 33/133·263/362는 각 눈의 바깥/안쪽 끝.
  var IDX = {
    top: 10, chin: 152,
    cheekR: 234, cheekL: 454,
    jawR: 172, jawL: 397,
    eyeR: { outer: 33, inner: 133, upper: 159, lower: 145 },
    eyeL: { outer: 263, inner: 362, upper: 386, lower: 374 },
    lipTop: 0, lipBottom: 17, mouthR: 61, mouthL: 291,
    noseTip: 1
  };

  var BASE = {
    faceRatio: { mean: 1.166, sd: 0.07 },  // 얼굴 세로(이마 중앙~턱 끝) / 광대 폭
    jawRatio: { mean: 0.7982, sd: 0.04 },   // 턱각 폭 / 광대 폭
    eyeTilt: { mean: 6.15, sd: 4.0 },      // 눈꼬리 기울기(도). +면 바깥쪽이 올라감
    eyeOpen: { mean: 0.349, sd: 0.045 },   // 눈 세로 / 눈 가로
    eyeWidth: { mean: 0.192, sd: 0.012 },  // 눈 가로 / 광대 폭
    lipRatio: { mean: 0.4021, sd: 0.08 }    // 입술 두께(윗입술 위~아랫입술 아래) / 입 너비
  };

  // 특징 벡터의 축 이름과 원시 측정값의 대응. 순서는 화면·테스트에서 그대로 쓴다.
  var DIMS = ['faceLength', 'jawWidth', 'eyeTilt', 'eyeRound', 'eyeSize', 'lipFull'];
  var RAW_OF = {
    faceLength: 'faceRatio', jawWidth: 'jawRatio', eyeTilt: 'eyeTilt',
    eyeRound: 'eyeOpen', eyeSize: 'eyeWidth', lipFull: 'lipRatio'
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function dist(a, b) { return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])); }

  // 랜드마크를 픽셀 좌표 [x, y]로 바꾼다. MediaPipe 결과({x, y} 0~1)와
  // 테스트 픽스처([x, y] 배열)를 둘 다 받는다. 가로·세로 비율이 다른 사진에서
  // 정규화 좌표를 그대로 쓰면 거리가 찌그러지므로 반드시 픽셀로 환산한다.
  function toPixels(landmarks, width, height) {
    return landmarks.map(function (p) {
      return Array.isArray(p) ? [p[0] * width, p[1] * height] : [p.x * width, p.y * height];
    });
  }

  // 눈꼬리 기울기(도). 화면 y축은 아래가 +이므로 바깥 끝이 안쪽 끝보다
  // 위(y가 작음)에 있으면 +가 되도록 inner.y - outer.y를 쓴다. 가로 성분에
  // 절댓값을 쓰는 건 셀카 좌우 반전 사진에서도 같은 값이 나오게 하기 위함.
  //
  // 고개 기울기(roll)는 따로 보정하지 않는다: 얼굴 전체가 r만큼 돌면 한쪽
  // 눈은 +r, 반대쪽 눈은 -r만큼 기울기가 바뀌므로 두 눈의 평균을 쓰는 순간
  // 정확히 상쇄된다(tests/features.test.js의 회전 테스트로 고정).
  function eyeTiltDeg(P, eye) {
    var o = P[eye.outer], i = P[eye.inner];
    return Math.atan2(i[1] - o[1], Math.abs(o[0] - i[0])) * 180 / Math.PI;
  }

  function center(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }

  // 고개 기울기(roll, 라디안): 두 눈 중심을 잇는 선의 각도. 특징 계산에는
  // 쓰지 않고 "고개가 많이 기울었다" 경고에만 쓴다. 왼쪽에 찍힌 눈을
  // 기준으로 재므로 좌우 반전 사진에서도 부호가 뒤집히지 않는다.
  function rollOf(P) {
    var a = center(P[IDX.eyeR.outer], P[IDX.eyeR.inner]);
    var b = center(P[IDX.eyeL.outer], P[IDX.eyeL.inner]);
    if (a[0] > b[0]) { var t = a; a = b; b = t; }
    return Math.atan2(b[1] - a[1], b[0] - a[0]);
  }

  // 코끝이 양쪽 광대 사이 어디쯤 있는지(0.5 = 정면). 얼굴을 옆으로 돌린
  // 사진은 비율이 크게 틀어지므로 화면에서 경고하는 데 쓴다.
  function yawOf(P) {
    var l = P[IDX.cheekR][0], r = P[IDX.cheekL][0];
    var t = (P[IDX.noseTip][0] - l) / (r - l);
    return t;
  }

  function measure(landmarks, width, height) {
    var P = toPixels(landmarks, width || 1, height || 1);
    var cheek = dist(P[IDX.cheekR], P[IDX.cheekL]);
    var eR = IDX.eyeR, eL = IDX.eyeL;
    var wR = dist(P[eR.outer], P[eR.inner]), wL = dist(P[eL.outer], P[eL.inner]);
    return {
      raw: {
        faceRatio: dist(P[IDX.top], P[IDX.chin]) / cheek,
        jawRatio: dist(P[IDX.jawR], P[IDX.jawL]) / cheek,
        eyeTilt: (eyeTiltDeg(P, eR) + eyeTiltDeg(P, eL)) / 2,
        eyeOpen: (dist(P[eR.upper], P[eR.lower]) / wR + dist(P[eL.upper], P[eL.lower]) / wL) / 2,
        eyeWidth: (wR + wL) / 2 / cheek,
        lipRatio: dist(P[IDX.lipTop], P[IDX.lipBottom]) / dist(P[IDX.mouthR], P[IDX.mouthL])
      },
      pose: { rollDeg: rollOf(P) * 180 / Math.PI, yaw: yawOf(P) }
    };
  }

  // 원시 측정값 → -1~+1 벡터. ±2sd를 ±1로 잡고 그 밖은 잘라낸다.
  function normalize(raw) {
    var v = {};
    DIMS.forEach(function (d) {
      var b = BASE[RAW_OF[d]];
      v[d] = clamp((raw[RAW_OF[d]] - b.mean) / (2 * b.sd), -1, 1);
    });
    return v;
  }

  // 표정 점수(MediaPipe blendshapes, 0~1). 웃으면 눈이 가늘어지고 입이
  // 옆으로 늘어나서 눈 둥글기·입술 두께가 실제보다 작게 측정된다. 이 경우
  // 값을 버리지 않고 "믿기 어려운 축"으로 표시해, 확인 화면에서 사용자가
  // 직접 고르도록 유도한다(값을 임의로 보정하면 근거 없는 숫자가 된다).
  var SMILE_LIMIT = 0.4, BLINK_LIMIT = 0.5;

  function expressionOf(blendshapes) {
    if (!blendshapes) return null;
    function avg(a, b) { return ((blendshapes[a] || 0) + (blendshapes[b] || 0)) / 2; }
    return {
      smile: avg('mouthSmileLeft', 'mouthSmileRight'),
      blink: avg('eyeBlinkLeft', 'eyeBlinkRight')
    };
  }

  // 사진 분석 결과 전체. warnings는 화면에 그대로 보여줄 문장들이다.
  // blendshapes: { 이름: 점수 } (없으면 표정 검사를 건너뛴다)
  function fromLandmarks(landmarks, width, height, blendshapes) {
    if (!landmarks || landmarks.length < 468) throw new Error('랜드마크가 부족합니다');
    var m = measure(landmarks, width, height);
    var warnings = [];
    var unreliable = [];
    if (Math.abs(m.pose.yaw - 0.5) > 0.08) {
      warnings.push('얼굴이 옆으로 돌아가 있어 결과가 부정확할 수 있어요. 정면 사진을 권장해요.');
    }
    if (Math.abs(m.pose.rollDeg) > 20) {
      warnings.push('고개가 많이 기울어 있어요. 똑바로 찍은 사진이면 더 정확해요.');
    }
    var ex = expressionOf(blendshapes);
    if (ex && ex.smile > SMILE_LIMIT) {
      warnings.push('웃는 표정이라 눈이 가늘고 입술이 얇게 측정됐을 수 있어요. 다음 화면에서 직접 확인해 주세요.');
      unreliable.push('eyeRound', 'lipFull');
    }
    if (ex && ex.blink > BLINK_LIMIT) {
      warnings.push('눈을 감고 있거나 찡그린 사진이라 눈 측정이 부정확할 수 있어요.');
      ['eyeRound', 'eyeSize'].forEach(function (d) { if (unreliable.indexOf(d) < 0) unreliable.push(d); });
    }
    return {
      vector: normalize(m.raw), raw: m.raw, pose: m.pose,
      expression: ex, unreliable: unreliable, warnings: warnings
    };
  }

  // 얼굴형은 얼굴 길이·턱 폭 두 축으로만 정한다. 퀴즈의 얼굴형 선택지가
  // profile.js에서 같은 축 값으로 바뀌므로, 이 함수로 되돌리면 원래 선택이
  // 나와야 한다(테스트로 고정).
  function faceShapeOf(v) {
    if (v.faceLength > 0.45) return 'long';
    if (v.jawWidth > 0.45) return 'square';
    if (v.jawWidth < -0.45) return 'heart';
    if (v.faceLength < -0.35) return 'round';
    return 'oval';
  }

  LA.features = {
    IDX: IDX, BASE: BASE, DIMS: DIMS,
    measure: measure, normalize: normalize, fromLandmarks: fromLandmarks,
    expressionOf: expressionOf,
    faceShapeOf: faceShapeOf
  };
})(window.LA);
