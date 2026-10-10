(function (LA) {
  var ui = LA.ui;

  // 사진 분석 확인 화면. 사진에서 잰 특징을 퀴즈와 같은 문항으로 보여주고,
  // 틀린 것만 고치게 한다. 표정 때문에 믿기 어려운 축은 표시해 둔다.
  // analysis = features.fromLandmarks 결과
  // handlers = { onBack(), onDone(vector) }
  function render(analysis, handlers) {
    var root = ui.el('section', 'review');
    root.appendChild(ui.button('back-btn', '← 처음으로', handlers.onBack));
    root.appendChild(ui.el('h2', null, '사진으로 본 내 얼굴, 맞나요?'));
    root.appendChild(ui.el('p', 'muted',
      '사진 각도·표정·거리 때문에 다르게 보일 수 있어요. 거울을 보고 다른 것만 바꿔 주세요.'));

    analysis.warnings.forEach(function (w) { root.appendChild(ui.el('p', 'warning', '⚠ ' + w)); });
    (analysis.notes || []).forEach(function (n) { root.appendChild(ui.el('p', 'info', 'ℹ ' + n)); });

    var detected = LA.profile.answersFromVector(analysis.vector);
    var answers = {};
    Object.keys(detected).forEach(function (k) { answers[k] = detected[k]; });
    var unreliable = analysis.unreliable || [];

    LA.profile.QUESTIONS.forEach(function (q, i) {
      var box = ui.el('div', 'question' + (unreliable.indexOf(q.key) >= 0 ? ' check-me' : ''));
      var title = ui.el('div', 'q-title', (i + 1) + '. ' + q.title);
      if (unreliable.indexOf(q.key) >= 0) title.appendChild(ui.chip('표정 때문에 확인 필요', 'warn'));
      box.appendChild(title);
      box.appendChild(ui.choiceGroup(q.options, detected[q.key], function (v) { answers[q.key] = v; }));
      root.appendChild(box);
    });

    root.appendChild(ui.button('btn primary', '이대로 결과 보기', function () {
      handlers.onDone(LA.profile.applyCorrections(analysis.vector, answers));
    }));
    return root;
  }

  LA.ui.review = { render: render };
})(window.LA);
