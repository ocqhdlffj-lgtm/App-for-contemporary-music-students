(function (LA) {
  var ui = LA.ui;

  // 직접 선택 모드. 모든 문항에 답해야 "결과 보기"가 켜진다.
  // handlers = { onBack(), onDone(vector) }
  function render(handlers) {
    var root = ui.el('section', 'quiz');
    root.appendChild(ui.button('back-btn', '← 처음으로', handlers.onBack));
    root.appendChild(ui.el('h2', null, '내 얼굴 특징 고르기'));
    root.appendChild(ui.el('p', 'muted', '거울을 보면서 가장 가까운 걸 골라 주세요.'));

    var answers = {};
    var submit = ui.button('btn primary', '결과 보기', function () {
      handlers.onDone(LA.profile.fromAnswers(answers));
    });
    submit.disabled = true;

    var questions = LA.profile.QUESTIONS;
    questions.forEach(function (q, i) {
      var box = ui.el('div', 'question');
      box.appendChild(ui.el('div', 'q-title', (i + 1) + '. ' + q.title));
      box.appendChild(ui.choiceGroup(q.options, null, function (v) {
        answers[q.key] = v;
        submit.disabled = questions.some(function (x) { return !answers[x.key]; });
      }));
      root.appendChild(box);
    });

    root.appendChild(submit);
    return root;
  }

  LA.ui.quiz = { render: render };
})(window.LA);
