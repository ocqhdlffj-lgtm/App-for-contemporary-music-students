(function () {
  var F = LA.features;
  var CANON = window.LA_FIXTURE_CANONICAL;

  function copy(pts) { return pts.map(function (p) { return [p[0], p[1]]; }); }
  function near(a, b, eps, msg) {
    T.assert(Math.abs(a - b) <= eps, (msg || '') + ' expected ~' + b + ' got ' + a);
  }
  function sameVector(a, b, eps) {
    F.DIMS.forEach(function (d) { near(a[d], b[d], eps, d); });
  }

  T.test('평균 얼굴 메시는 모든 특징이 0(평균)이고 계란형이다', function () {
    var r = F.fromLandmarks(CANON, 1, 1);
    F.DIMS.forEach(function (d) { near(r.vector[d], 0, 0.02, d); });
    T.eq(F.faceShapeOf(r.vector), 'oval');
    T.eq(r.warnings, []);
  });

  T.test('세로로 늘린 얼굴은 긴형이 된다', function () {
    var r = F.fromLandmarks(CANON, 1, 1.15);
    T.assert(r.vector.faceLength > 0.45, 'faceLength ' + r.vector.faceLength);
    T.eq(F.faceShapeOf(r.vector), 'long');
  });

  T.test('가로로 넓힌 얼굴은 둥근형이 된다', function () {
    var r = F.fromLandmarks(CANON, 1.12, 1);
    T.assert(r.vector.faceLength < -0.35, 'faceLength ' + r.vector.faceLength);
    T.eq(F.faceShapeOf(r.vector), 'round');
  });

  T.test('고개를 기울인 사진도 같은 특징이 나온다(두 눈 평균으로 roll 상쇄)', function () {
    var a = 15 * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var rotated = CANON.map(function (p) {
      var x = p[0] - 0.5, y = p[1] - 0.5;
      return [0.5 + x * c - y * s, 0.5 + x * s + y * c];
    });
    var base = F.fromLandmarks(CANON, 1, 1);
    var r = F.fromLandmarks(rotated, 1, 1);
    sameVector(r.vector, base.vector, 0.01);
    near(r.pose.rollDeg, 15, 0.5, 'roll');
  });

  T.test('좌우 반전(셀카) 사진도 같은 특징이 나온다', function () {
    var mirrored = CANON.map(function (p) { return [1 - p[0], p[1]]; });
    sameVector(F.fromLandmarks(mirrored, 1, 1).vector, F.fromLandmarks(CANON, 1, 1).vector, 1e-9);
  });

  T.test('눈꼬리를 올리면 eyeTilt가 +, 내리면 -가 된다', function () {
    var I = F.IDX;
    var up = copy(CANON), down = copy(CANON);
    var dy = 0.012;
    [I.eyeR.outer, I.eyeL.outer].forEach(function (i) { up[i][1] -= dy; down[i][1] += dy; });
    T.assert(F.fromLandmarks(up, 1, 1).vector.eyeTilt > 0.3, 'up');
    T.assert(F.fromLandmarks(down, 1, 1).vector.eyeTilt < -0.3, 'down');
  });

  T.test('MediaPipe 형식({x,y} 0~1)과 사진 비율을 픽셀로 환산해 쓴다', function () {
    // 같은 얼굴을 가로 800 × 세로 1000 사진에 찍었다고 보고 정규화 좌표로 바꾼다.
    var W = 800, H = 1000;
    var norm = CANON.map(function (p) { return { x: p[0] * 600 / W, y: p[1] * 600 / H }; });
    sameVector(F.fromLandmarks(norm, W, H).vector, F.fromLandmarks(CANON, 1, 1).vector, 1e-9);
  });

  T.test('얼굴을 옆으로 돌린 사진이면 경고한다', function () {
    var turned = copy(CANON);
    var I = F.IDX;
    var w = turned[I.cheekL][0] - turned[I.cheekR][0];
    turned[I.noseTip][0] += w * 0.15;
    T.eq(F.fromLandmarks(turned, 1, 1).warnings.length, 1);
  });

  T.test('특징 값은 -1~+1을 벗어나지 않는다', function () {
    var r = F.fromLandmarks(CANON, 1, 3);
    F.DIMS.forEach(function (d) { T.assert(r.vector[d] >= -1 && r.vector[d] <= 1, d); });
  });

  T.test('랜드마크가 모자라면 예외', function () {
    T.throws(function () { F.fromLandmarks(CANON.slice(0, 100), 1, 1); });
    T.throws(function () { F.fromLandmarks(null, 1, 1); });
  });
})();
