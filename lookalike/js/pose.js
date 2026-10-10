(function (LA) {
  // 고개 각도 추정과 정면 보정. DOM·네트워크를 모르는 순수 계산이다.
  //
  // MediaPipe가 주는 랜드마크 468개의 (x, y, z)를 기준 얼굴(LA.CANONICAL_3D)에 맞춰 보고,
  // 얼굴이 얼마나 돌아갔는지(회전 행렬)를 구한다. 그 회전을 거꾸로 적용하면 얼굴이 정면을 보는
  // 모습이 되고, 거기서 z를 버린 2D 좌표로 비율을 재면 고개를 돌린 사진도 정면 사진처럼 잴 수 있다.
  //
  // 맞추는 방법은 Horn(1987)의 사원수 방식이다: 두 점 집합의 공분산에서 4x4 대칭행렬을 만들고
  // 가장 큰 고유값의 고유벡터를 회전으로 읽는다. 외부 라이브러리 없이 4x4 야코비 고유값 계산만 쓴다.
  //
  // 좌표 약속: 랜드마크의 x는 가로, y는 아래로 커지고, z는 작을수록 카메라에 가깝다(x와 같은
  // 단위로 정규화돼 있어 이미지 폭을 곱해 쓴다). 기준 얼굴은 y가 위로, z가 보는 사람 쪽으로 커진다.
  // 그래서 관측 좌표를 (x·W, -y·H, -z·W)로 바꿔 두 좌표계를 맞춘다.

  var N_POINTS = 468;

  function hasDepth(landmarks) {
    var p = landmarks && landmarks[0];
    return !!p && !Array.isArray(p) && typeof p.z === 'number' && isFinite(p.z);
  }

  function observed(landmarks, W, H) {
    var out = [];
    for (var i = 0; i < N_POINTS; i++) {
      var p = landmarks[i];
      out.push([p.x * W, -p.y * H, -p.z * W]);
    }
    return out;
  }

  function centroid(A) {
    var c = [0, 0, 0];
    A.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; });
    return [c[0] / A.length, c[1] / A.length, c[2] / A.length];
  }

  // 대칭 4x4의 고유값·고유벡터(야코비 회전). 행렬은 제자리에서 대각화된다.
  function jacobi4(M) {
    var V = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    for (var sweep = 0; sweep < 60; sweep++) {
      var off = 0, i, j, k;
      for (i = 0; i < 4; i++) for (j = i + 1; j < 4; j++) off += M[i][j] * M[i][j];
      if (off < 1e-24) break;
      for (i = 0; i < 3; i++) {
        for (j = i + 1; j < 4; j++) {
          if (Math.abs(M[i][j]) < 1e-300) continue;
          var theta = (M[j][j] - M[i][i]) / (2 * M[i][j]);
          var t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
          var c = 1 / Math.sqrt(t * t + 1), s = t * c;
          for (k = 0; k < 4; k++) {
            var a = M[k][i], b = M[k][j];
            M[k][i] = c * a - s * b; M[k][j] = s * a + c * b;
          }
          for (k = 0; k < 4; k++) {
            var a2 = M[i][k], b2 = M[j][k];
            M[i][k] = c * a2 - s * b2; M[j][k] = s * a2 + c * b2;
          }
          for (k = 0; k < 4; k++) {
            var a3 = V[k][i], b3 = V[k][j];
            V[k][i] = c * a3 - s * b3; V[k][j] = s * a3 + c * b3;
          }
        }
      }
    }
    var best = 0;
    for (var d = 1; d < 4; d++) if (M[d][d] > M[best][best]) best = d;
    return [V[0][best], V[1][best], V[2][best], V[3][best]];
  }

  function quatToMatrix(q) {
    var w = q[0], x = q[1], y = q[2], z = q[3];
    return [
      [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
      [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
      [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]
    ];
  }

  // landmarks: [{x, y, z}] 정규화 좌표(0~1). 기준 얼굴 → 관측 얼굴의 회전·크기·위치를 맞춘다.
  // fit: 맞춘 뒤 남은 오차(얼굴 크기 대비). 0.1 안쪽이면 잘 맞은 것이다.
  function estimate(landmarks, W, H) {
    var C = LA.CANONICAL_3D;
    var O = observed(landmarks, W, H);
    var cc = centroid(C), oc = centroid(O);
    var S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    var i, a, b, cn = 0;
    for (i = 0; i < N_POINTS; i++) {
      var c = [C[i][0] - cc[0], C[i][1] - cc[1], C[i][2] - cc[2]];
      var o = [O[i][0] - oc[0], O[i][1] - oc[1], O[i][2] - oc[2]];
      for (a = 0; a < 3; a++) for (b = 0; b < 3; b++) S[a][b] += c[a] * o[b];
      cn += c[0] * c[0] + c[1] * c[1] + c[2] * c[2];
    }
    var N = [
      [S[0][0] + S[1][1] + S[2][2], S[1][2] - S[2][1], S[2][0] - S[0][2], S[0][1] - S[1][0]],
      [S[1][2] - S[2][1], S[0][0] - S[1][1] - S[2][2], S[0][1] + S[1][0], S[2][0] + S[0][2]],
      [S[2][0] - S[0][2], S[0][1] + S[1][0], -S[0][0] + S[1][1] - S[2][2], S[1][2] + S[2][1]],
      [S[0][1] - S[1][0], S[2][0] + S[0][2], S[1][2] + S[2][1], -S[0][0] - S[1][1] + S[2][2]]
    ];
    var q = jacobi4(N);
    if (q[0] < 0) q = q.map(function (v) { return -v; });
    var R = quatToMatrix(q);

    // 크기: 회전한 기준 얼굴과 관측 얼굴을 가장 잘 겹치는 배율
    var num = 0, rms = 0;
    for (i = 0; i < N_POINTS; i++) {
      var cx = C[i][0] - cc[0], cy = C[i][1] - cc[1], cz = C[i][2] - cc[2];
      var rc = [R[0][0] * cx + R[0][1] * cy + R[0][2] * cz,
        R[1][0] * cx + R[1][1] * cy + R[1][2] * cz,
        R[2][0] * cx + R[2][1] * cy + R[2][2] * cz];
      num += rc[0] * (O[i][0] - oc[0]) + rc[1] * (O[i][1] - oc[1]) + rc[2] * (O[i][2] - oc[2]);
    }
    var scale = num / cn;
    var size = 0;
    for (i = 0; i < N_POINTS; i++) {
      var cx2 = C[i][0] - cc[0], cy2 = C[i][1] - cc[1], cz2 = C[i][2] - cc[2];
      var dx = O[i][0] - oc[0] - scale * (R[0][0] * cx2 + R[0][1] * cy2 + R[0][2] * cz2);
      var dy = O[i][1] - oc[1] - scale * (R[1][0] * cx2 + R[1][1] * cy2 + R[1][2] * cz2);
      var dz = O[i][2] - oc[2] - scale * (R[2][0] * cx2 + R[2][1] * cy2 + R[2][2] * cz2);
      rms += dx * dx + dy * dy + dz * dz;
      size += (O[i][0] - oc[0]) * (O[i][0] - oc[0]) + (O[i][1] - oc[1]) * (O[i][1] - oc[1]) + (O[i][2] - oc[2]) * (O[i][2] - oc[2]);
    }
    var deg = 180 / Math.PI;
    return {
      R: R, scale: scale, center: oc,
      yawDeg: Math.atan2(R[0][2], R[2][2]) * deg,
      pitchDeg: Math.atan2(-R[1][2], Math.sqrt(R[0][2] * R[0][2] + R[2][2] * R[2][2])) * deg,
      rollDeg: Math.atan2(R[1][0], R[1][1]) * deg,
      fit: Math.sqrt(rms / size)
    };
  }

  // 추정한 회전을 거꾸로 적용해 얼굴을 정면으로 돌리고, 그 2D 좌표를 돌려준다.
  // 돌려주는 점은 [x, y] 이고 y는 아래로 커진다(features.js의 측정 코드와 같은 약속).
  function frontal2D(landmarks, W, H, pose) {
    var R = pose.R, oc = pose.center, s = pose.scale;
    var O = observed(landmarks, W, H);
    return O.map(function (p) {
      var x = p[0] - oc[0], y = p[1] - oc[1], z = p[2] - oc[2];
      // R의 전치(= 역회전)를 곱한다
      var qx = (R[0][0] * x + R[1][0] * y + R[2][0] * z) / s;
      var qy = (R[0][1] * x + R[1][1] * y + R[2][1] * z) / s;
      return [qx, -qy];
    });
  }

  LA.pose = { hasDepth: hasDepth, estimate: estimate, frontal2D: frontal2D, N_POINTS: N_POINTS };
})(window.LA);
