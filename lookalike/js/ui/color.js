(function (LA) {
  var ui = LA.ui;

  // 퍼스널컬러 간이 진단(선택). 건너뛰면 null로 넘긴다.
  // handlers = { onBack(), onDone(personalColor) }
  function render(handlers) {
    var root = ui.el('section', 'color-check');
    root.appendChild(ui.button('back-btn', '← 처음으로', handlers.onBack));
    root.appendChild(ui.el('h2', null, '마지막! 퍼스널컬러 간이 체크'));
    root.appendChild(ui.el('p', 'muted',
      '어울리는 컬러 팔레트를 고르는 데 써요. 전문 진단은 아니고, 모르면 건너뛰어도 돼요.'));

    var answers = {};
    LA.styling.COLOR_QUESTIONS.forEach(function (q, i) {
      var box = ui.el('div', 'question');
      box.appendChild(ui.el('div', 'q-title', (i + 1) + '. ' + q.title));
      box.appendChild(ui.choiceGroup(q.options, null, function (v) { answers[q.key] = v; }));
      root.appendChild(box);
    });

    var row = ui.el('div', 'row-actions');
    row.appendChild(ui.button('btn', '건너뛰기', function () { handlers.onDone(null); }));
    row.appendChild(ui.button('btn primary', '결과 보기', function () {
      handlers.onDone(LA.styling.personalColorOf(answers));
    }));
    root.appendChild(row);
    return root;
  }

  LA.ui.color = { render: render };
})(window.LA);
