(function (LA) {
  var ui = LA.ui;
  var MAX_SIDE = 1024;

  // 분석 결과를 눈으로 확인할 수 있게, 실제로 계산에 쓴 점만 찍는다.
  var SHOWN = (function () {
    var I = LA.features.IDX;
    return [I.top, I.chin, I.cheekR, I.cheekL, I.jawR, I.jawL,
      I.eyeR.outer, I.eyeR.inner, I.eyeR.upper, I.eyeR.lower,
      I.eyeL.outer, I.eyeL.inner, I.eyeL.upper, I.eyeL.lower,
      I.lipTop, I.lipBottom, I.mouthR, I.mouthL];
  })();

  // 큰 사진은 긴 변 1024px로 줄여 그린다 — 분석 속도 때문이며, 랜드마크
  // 모델 입력은 어차피 훨씬 작게 줄여 쓰므로 정확도 손실은 없다.
  function toCanvas(img) {
    var w = img.naturalWidth, h = img.naturalHeight;
    var k = Math.min(1, MAX_SIDE / Math.max(w, h));
    var c = document.createElement('canvas');
    c.width = Math.round(w * k);
    c.height = Math.round(h * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  function drawPoints(canvas, landmarks) {
    var ctx = canvas.getContext('2d');
    var r = Math.max(2, Math.round(canvas.width / 180));
    ctx.fillStyle = '#ff4f8b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, r / 2);
    SHOWN.forEach(function (i) {
      var p = landmarks[i];
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  function readImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('이미지를 열 수 없어요')); };
      img.src = url;
    });
  }

  // handlers = { onBack(), onQuiz(), onDone(analysis) }
  // opts.detector로 가짜 검출기를 넣을 수 있다(테스트용).
  function render(handlers, opts) {
    var detector = (opts && opts.detector) || LA.detector;
    var root = ui.el('section', 'photo');
    root.appendChild(ui.button('back-btn', '← 처음으로', handlers.onBack));
    root.appendChild(ui.el('h2', null, '사진으로 분석하기'));
    root.appendChild(ui.list([
      '정면을 보고, 무표정에 가깝게',
      '앞머리·안경이 눈썹과 눈을 가리지 않게',
      '팔을 쭉 뻗어 찍거나 다른 사람이 찍어 준 사진(너무 가까우면 얼굴이 길어 보여요)',
      '밝은 곳에서, 얼굴이 크게 나오게'
    ], 'tips'));

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.className = 'visually-hidden';
    input.setAttribute('aria-label', '얼굴 사진 선택');
    root.appendChild(input);

    var pick = ui.button('btn primary', '사진 선택하기', function () { input.click(); });
    root.appendChild(pick);

    var stage = ui.el('div', 'stage');
    var status = ui.el('p', 'status');
    status.setAttribute('role', 'status');
    var after = ui.el('div', 'after');
    root.appendChild(stage);
    root.appendChild(status);
    root.appendChild(after);
    root.appendChild(ui.el('p', 'privacy',
      '🔒 사진은 이 기기 안에서만 분석돼요. AI 모델(약 15MB)만 처음 한 번 내려받아요.'));

    function fail(msg, offerQuiz) {
      status.textContent = msg;
      status.className = 'status error';
      pick.disabled = false;
      pick.textContent = '다른 사진 선택하기';
      if (offerQuiz) after.appendChild(ui.button('btn', '✍️ 사진 없이 직접 골라서 찾기', handlers.onQuiz));
    }

    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      pick.disabled = true;
      stage.textContent = '';
      after.textContent = '';
      status.className = 'status';
      status.textContent = 'AI 모델을 준비하는 중… (처음 한 번은 조금 걸려요)';

      var canvas;
      readImage(file).then(function (img) {
        canvas = toCanvas(img);
        stage.appendChild(canvas);
        return detector.load().then(function () {
          status.textContent = '얼굴을 분석하는 중…';
          return detector.detect(canvas);
        }, function (err) {
          err.isLoadError = true;
          throw err;
        });
      }).then(function (found) {
        if (!found) {
          fail('얼굴을 찾지 못했어요. 얼굴이 크게 나온 정면 사진으로 다시 시도해 주세요.', false);
          return;
        }
        var analysis = LA.features.fromLandmarks(found.landmarks, found.width, found.height, found.blendshapes);
        if (found.count > 1) {
          analysis.warnings.unshift('사진에 얼굴이 여러 개 있어요. 가장 크게 인식된 얼굴을 분석했는데, 다르면 한 명만 나온 사진으로 다시 시도해 주세요.');
        }
        drawPoints(canvas, found.landmarks);
        status.textContent = '분석 완료! 분홍 점이 측정에 쓴 위치예요.';
        status.className = 'status ok';
        analysis.warnings.forEach(function (w) { after.appendChild(ui.el('p', 'warning', '⚠ ' + w)); });
        after.appendChild(ui.button('btn primary', '다음 →', function () { handlers.onDone(analysis); }));
        pick.disabled = false;
        pick.textContent = '다른 사진으로 다시';
      }).catch(function (err) {
        if (err && err.isLoadError) {
          fail('AI 모델을 불러오지 못했어요. 인터넷 연결을 확인하거나, 사진 없이 직접 골라서 찾아보세요.', true);
        } else {
          fail('사진을 분석하지 못했어요. 다른 사진으로 다시 시도해 주세요.', true);
        }
      });
    });

    return root;
  }

  LA.ui.photo = { render: render, _toCanvas: toCanvas };
})(window.LA);
