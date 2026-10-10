(function () {
  var F = LA.features, P = LA.pose;
  var W = 1000, H = 1000, RAD = Math.PI / 180;

  function mul(A, B) {
    return A.map(function (r) { return [0, 1, 2].map(function (j) { return r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]; }); });
  }
  // 기준 얼굴을 yaw(좌우)·pitch(위아래)·roll(기울기)도만큼 돌려 MediaPipe 형식({x,y,z})으로 만든다.
  // noise는 가로 방향 무작위 오차(픽셀). 같은 입력이면 같은 결과가 나오도록 시드를 고정한다.
  function head(yaw, pitch, roll, noise) {
    var cy = Math.cos(yaw * RAD), sy = Math.sin(yaw * RAD), cx = Math.cos(pitch * RAD), sx = Math.sin(pitch * RAD);
    var cz = Math.cos(roll * RAD), sz = Math.sin(roll * RAD);
    var R = mul([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]], mul([[1, 0, 0], [0, cx, -sx], [0, sx, cx]], [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]));
    var s = 0.045 * W, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; }
    return LA.CANONICAL_3D.map(function (c) {
      var X = 500 + s * (R[0][0] * c[0] + R[0][1] * c[1] + R[0][2] * c[2]) + (noise ? rnd() * noise : 0);
      var Y = 500 + s * (R[1][0] * c[0] + R[1][1] * c[1] + R[1][2] * c[2]);
      var Z = s * (R[2][0] * c[0] + R[2][1] * c[1] + R[2][2] * c[2]);
      return { x: X / W, y: 1 - Y / H, z: -Z / W };
    });
  }
  function near(a, b, eps, msg) { T.assert(Math.abs(a - b) <= eps, (msg || '') + ' expected ~' + b + ' got ' + a); }
  function sameRaw(a, b, eps) { Object.keys(a).forEach(function (k) { near(a[k], b[k], eps, k); }); }
  function direct(lm) { return F.rawFromPixels(lm.map(function (q) { return [q.x * W, q.y * H]; })); }

  T.test('고개 각도 추정: 알려진 좌우·위아래 회전을 되찾는다', function () {
    [[25, 0], [-30, 0], [0, 15], [0, -20]].forEach(function (a) {
      var e = P.estimate(head(a[0], a[1], 0), W, H);
      near(e.yawDeg, a[0], 0.5, 'yaw ' + a);
      near(e.pitchDeg, a[1], 0.5, 'pitch ' + a);
      T.assert(e.fit < 0.01, 'fit ' + e.fit);
    });
  });

  T.test('돌아간 얼굴도 정면으로 보정하면 정면과 같은 측정값이 나온다', function () {
    var frontal = F.measure(head(0, 0, 0), W, H);
    T.eq(frontal.pose.corrected, false, '정면은 보정하지 않는다');
    [[25, 0, 0], [-30, 0, 0], [0, 15, 0], [0, -20, 0], [22, 12, 5], [-18, -10, -4]].forEach(function (a) {
      var lm = head(a[0], a[1], a[2]);
      var m = F.measure(lm, W, H);
      T.eq(m.pose.corrected, true, a.join('/'));
      sameRaw(m.raw, frontal.raw, 0.01);
    });
  });

  T.test('보정이 없으면 같은 얼굴이 각도에 따라 다르게 잰다(보정이 필요한 이유)', function () {
    var frontal = F.measure(head(0, 0, 0), W, H).raw;
    // 좌우로 돌리면 얼굴 세로/가로 비율이 커 보인다
    var turned = direct(head(30, 0, 0));
    T.assert(turned.faceRatio - frontal.faceRatio > 0.1, 'faceRatio ' + turned.faceRatio);
    // 위로 올려다보면 눈꼬리가 3도 이상 올라가 보인다
    var nodded = direct(head(0, 15, 0));
    T.assert(nodded.eyeTilt - frontal.eyeTilt > 3, 'eyeTilt ' + nodded.eyeTilt);
  });

  T.test('정면에 가까운 사진(6도 이하)은 사진에 찍힌 그대로 잰다(연예인 실측과 같은 방식)', function () {
    var lm = head(4, 3, 0);
    var m = F.measure(lm, W, H);
    T.eq(m.pose.corrected, false);
    sameRaw(m.raw, direct(lm), 1e-9);
  });

  T.test('고개를 돌린 사진은 경고 대신 보정 안내, 너무 돌아가면 경고', function () {
    var ok = F.fromLandmarks(head(20, 5, 0), W, H);
    T.eq(ok.warnings, []);
    T.eq(ok.notes.length, 1);
    var bad = F.fromLandmarks(head(40, 0, 0), W, H);
    T.assert(bad.warnings.some(function (w) { return w.indexOf('많이 돌아가') >= 0; }), 'warning');
    var up = F.fromLandmarks(head(0, 35, 0), W, H);
    T.eq(up.warnings.length, 1, '위아래 35도');
  });

  T.test('랜드마크에 약간의 잡음이 있어도 각도 추정이 크게 흔들리지 않는다', function () {
    var e = P.estimate(head(20, 10, 0, 6), W, H);
    near(e.yawDeg, 20, 3, 'yaw');
    near(e.pitchDeg, 10, 3, 'pitch');
    T.assert(e.fit < 0.1, 'fit ' + e.fit);
  });

  T.test('맞춘 오차가 너무 크면 보정하지 않고 그대로 잰다', function () {
    var lm = head(25, 0, 0).map(function (q, i) { return { x: q.x, y: q.y, z: q.z + ((i * 37) % 11 - 5) * 0.02 }; });
    var m = F.measure(lm, W, H);
    T.assert(m.pose.fit > 0.2, 'fit ' + m.pose.fit);
    T.eq(m.pose.corrected, false);
  });

  T.test('z가 없는 좌표([x, y] 배열)는 3D 보정 없이 옛 방식으로 잰다', function () {
    var flat = window.LA_FIXTURE_AVERAGE;
    T.eq(P.hasDepth(flat), false);
    var m = F.measure(flat, 1, 1);
    T.eq(m.pose.corrected, false);
    T.eq(m.pose.yawDeg, undefined);
  });
})();
