(function () {
  function click(node) { node.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  function byText(root, sel, text) {
    return Array.prototype.filter.call(root.querySelectorAll(sel), function (n) {
      return n.textContent.indexOf(text) >= 0;
    })[0];
  }

  T.test('퀴즈: 모든 문항에 답하기 전엔 결과 버튼이 꺼져 있다', function () {
    var got = null;
    var root = LA.ui.quiz.render({ onBack: function () {}, onDone: function (v) { got = v; } });
    var submit = byText(root, 'button.btn.primary', '결과 보기');
    T.eq(submit.disabled, true);
    var groups = root.querySelectorAll('.choices');
    T.eq(groups.length, LA.profile.QUESTIONS.length);
    Array.prototype.forEach.call(groups, function (g, i) {
      if (i < groups.length - 1) click(g.querySelector('.choice'));
    });
    T.eq(submit.disabled, true, '마지막 문항 전');
    click(groups[groups.length - 1].querySelector('.choice'));
    T.eq(submit.disabled, false);
    click(submit);
    var expected = {};
    LA.profile.QUESTIONS.forEach(function (q) { expected[q.key] = q.options[0].value; });
    T.eq(got, LA.profile.fromAnswers(expected));
  });

  T.test('선택지는 aria-pressed로 선택 상태를 알린다', function () {
    var picked = [];
    var g = LA.ui.choiceGroup([{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], 'a',
      function (v) { picked.push(v); });
    var bs = g.querySelectorAll('button');
    T.eq(bs[0].getAttribute('aria-pressed'), 'true');
    click(bs[1]);
    T.eq(bs[0].getAttribute('aria-pressed'), 'false');
    T.eq(bs[1].getAttribute('aria-pressed'), 'true');
    T.eq(picked, ['b']);
  });

  T.test('결과: 동물상·TOP3·스타일링 섹션이 그려지고, 다른 연예인을 누르면 무드가 바뀐다', function () {
    var model = { vector: LA.profile.ANIMALS.dog.proto, gender: 'F', scope: 'same', personalColor: 'warm', warnings: [] };
    var root = LA.ui.result.render(model, { onRestart: function () {}, onShare: function () {} });
    T.eq(root.querySelector('.type-name').textContent, '강아지상');
    var cards = root.querySelectorAll('.match');
    T.eq(cards.length, 3);
    var titles = Array.prototype.map.call(root.querySelectorAll('.style-sec h3'), function (h) { return h.textContent; });
    ['헤어', '메이크업', '패션', '웜톤 베스트 컬러', '안경'].forEach(function (t) {
      T.assert(titles.some(function (x) { return x.indexOf(t) >= 0; }), t + ' 섹션 없음: ' + titles.join('|'));
    });
    var second = root.querySelectorAll('.match')[1];
    var name2 = second.querySelector('.match-name').textContent;
    click(second);
    T.assert(root.querySelector('.celeb-look h3').textContent.indexOf(name2) >= 0, '무드 전환');
    T.eq(root.querySelectorAll('.match')[1].getAttribute('aria-pressed'), 'true');
  });

  T.test('결과: 공유 문구에 동물상·1위·베스트 헤어가 들어간다', function () {
    var shared = null;
    var model = { vector: LA.profile.ANIMALS.cat.proto, gender: 'M', scope: 'same', personalColor: null, warnings: [] };
    var root = LA.ui.result.render(model, { onRestart: function () {}, onShare: function (t) { shared = t; } });
    click(byText(root, 'button', '결과 공유하기'));
    T.assert(shared.indexOf('고양이상') >= 0, shared);
    T.assert(shared.indexOf('닮은꼴 연예인 1위: ') >= 0, shared);
    T.assert(shared.indexOf('베스트 헤어: ') >= 0, shared);
  });

  T.test('결과: 사진 경고는 화면에 그대로 보여준다', function () {
    var model = { vector: LA.profile.ANIMALS.fox.proto, gender: 'F', scope: 'all', personalColor: null, warnings: ['정면 사진을 권장해요.'] };
    var root = LA.ui.result.render(model, { onRestart: function () {}, onShare: function () {} });
    T.assert(root.querySelector('.warning').textContent.indexOf('정면 사진') >= 0, 'warning');
  });

  // 가짜 검출기로 사진 화면 전체 흐름(파일 선택 → 분석 → 다음)을 검증한다.
  function photoFlow(detector, check) {
    var events = [];
    var root = LA.ui.photo.render({
      onBack: function () {}, onQuiz: function () { events.push('quiz'); },
      onDone: function (a) { events.push(a); }
    }, { detector: detector });
    document.body.appendChild(root);
    var c = document.createElement('canvas');
    c.width = 40; c.height = 50;
    c.getContext('2d').fillRect(0, 0, 40, 50);
    c.toBlob(function (blob) {
      var input = root.querySelector('input[type=file]');
      var dt = new DataTransfer();
      dt.items.add(new File([blob], 'face.png', { type: 'image/png' }));
      input.files = dt.files;
      input.dispatchEvent(new Event('change'));
      var tries = 0;
      (function wait() {
        var st = root.querySelector('.status');
        if (/ok|error/.test(st.className) || tries++ > 50) {
          try { check(root, events); } finally { root.remove(); }
          return;
        }
        setTimeout(wait, 20);
      })();
    });
  }

  T.test('사진: 얼굴을 찾으면 점을 찍고 "다음"으로 분석 결과를 넘긴다', function (done) {
    var fake = {
      load: function () { return Promise.resolve(); },
      detect: function () {
        var lm = window.LA_FIXTURE_CANONICAL.map(function (p) { return { x: p[0], y: p[1] }; });
        // 픽스처는 정사각 좌표계라 가로세로 1:1로 넘긴다(실제 캔버스 크기와 무관).
        return Promise.resolve({ landmarks: lm, width: 1, height: 1 });
      }
    };
    photoFlow(fake, function (root, events) {
      try {
        T.eq(root.querySelector('.status').className, 'status ok');
        click(byText(root, 'button', '다음'));
        T.eq(events.length, 1);
        T.eq(LA.features.faceShapeOf(events[0].vector), 'oval');
        done();
      } catch (e) { done(e); }
    });
  });

  T.test('사진: 얼굴이 없으면 안내만 하고 넘어가지 않는다', function (done) {
    var fake = { load: function () { return Promise.resolve(); }, detect: function () { return Promise.resolve(null); } };
    photoFlow(fake, function (root, events) {
      try {
        T.eq(root.querySelector('.status').className, 'status error');
        T.assert(root.querySelector('.status').textContent.indexOf('얼굴을 찾지 못했어요') >= 0, 'msg');
        T.eq(events, []);
        done();
      } catch (e) { done(e); }
    });
  });

  T.test('사진: 모델을 못 받으면(오프라인) 직접 선택으로 안내한다', function (done) {
    var fake = { load: function () { return Promise.reject(new Error('offline')); }, detect: function () {} };
    photoFlow(fake, function (root) {
      try {
        T.assert(root.querySelector('.status').textContent.indexOf('AI 모델을 불러오지 못했어요') >= 0, 'msg');
        var quizBtn = byText(root, 'button', '직접 골라서');
        T.assert(!!quizBtn, '직접 선택 버튼');
        done();
      } catch (e) { done(e); }
    });
  });

  T.test('앱: 앞 단계 데이터 없이 결과·컬러 화면으로 가면 홈으로 돌아간다', function () {
    var screen = document.getElementById('screen');
    LA.app._state.settings = { gender: 'F', scope: 'same' };
    LA.app._state.pending = null;
    LA.app._state.result = null;
    LA.app._render('result');
    T.eq(LA.app._state.screen, 'home');
    LA.app._render('color');
    T.eq(LA.app._state.screen, 'home');
    T.assert(!!screen.querySelector('.home'), 'home 화면');
    screen.textContent = '';
  });

  T.test('앱: 퀴즈 → 컬러 건너뛰기 → 결과까지 이어진다', function () {
    var screen = document.getElementById('screen');
    try { localStorage.removeItem(LA.storage.KEY); } catch (e) {}
    LA.app._state.settings = { gender: 'M', scope: 'same' };
    LA.app._render('quiz');
    Array.prototype.forEach.call(screen.querySelectorAll('.choices'), function (g) { click(g.querySelector('.choice')); });
    click(byText(screen, 'button', '결과 보기'));
    T.eq(LA.app._state.screen, 'color');
    click(byText(screen, 'button', '건너뛰기'));
    T.eq(LA.app._state.screen, 'result');
    T.eq(LA.app._state.result.personalColor, null);
    Array.prototype.forEach.call(screen.querySelectorAll('.match'), function (m) {
      var id = LA.CELEBS.filter(function (c) { return c.name === m.querySelector('.match-name').textContent; })[0];
      T.eq(id.gender, 'M');
    });
    T.assert(!!LA.storage.load(), '결과 저장');
    try { localStorage.removeItem(LA.storage.KEY); } catch (e) {}
    screen.textContent = '';
  });
})();
