(function (LA) {
  var ui = LA.ui;

  // 첫 화면. settings = { gender: 'F'|'M', scope: 'same'|'all' }.
  // handlers = { onChange(settings), onPhoto(), onQuiz(), onLast: fn|null }
  function render(settings, handlers) {
    var root = ui.el('section', 'home');

    var hero = ui.el('div', 'hero');
    hero.appendChild(ui.el('div', 'hero-emoji', '🐶🐱🦊🐰🐻🦖🦌'));
    hero.appendChild(ui.el('h2', null, '나와 닮은 연예인 + 베스트 스타일링'));
    hero.appendChild(ui.el('p', 'muted',
      '얼굴 특징으로 동물상과 닮은꼴 연예인을 찾고, 내 얼굴형에 맞는 헤어·메이크업·패션·컬러를 함께 추천해요.'));
    root.appendChild(hero);

    var s = { gender: settings.gender, scope: settings.scope };

    var g = ui.el('div', 'setting');
    g.appendChild(ui.el('div', 'setting-title', '스타일링 기준'));
    g.appendChild(ui.choiceGroup([
      { value: 'F', label: '여성 스타일' }, { value: 'M', label: '남성 스타일' }
    ], s.gender, function (v) { s.gender = v; handlers.onChange({ gender: s.gender, scope: s.scope }); }));
    root.appendChild(g);

    var sc = ui.el('div', 'setting');
    sc.appendChild(ui.el('div', 'setting-title', '닮은꼴 찾을 범위'));
    sc.appendChild(ui.choiceGroup([
      { value: 'same', label: '같은 성별 연예인' }, { value: 'all', label: '성별 상관없이' }
    ], s.scope, function (v) { s.scope = v; handlers.onChange({ gender: s.gender, scope: s.scope }); }));
    root.appendChild(sc);

    var actions = ui.el('div', 'start-actions');
    var photo = ui.button('btn primary big', null, handlers.onPhoto);
    photo.appendChild(ui.el('span', 'btn-title', '📷 사진으로 분석하기'));
    photo.appendChild(ui.el('span', 'btn-sub', '정면 셀카 한 장이면 끝'));
    actions.appendChild(photo);
    var quiz = ui.button('btn big', null, handlers.onQuiz);
    quiz.appendChild(ui.el('span', 'btn-title', '✍️ 직접 골라서 찾기'));
    quiz.appendChild(ui.el('span', 'btn-sub', '사진 없이 5문항'));
    actions.appendChild(quiz);
    root.appendChild(actions);

    if (handlers.onLast) {
      root.appendChild(ui.button('link-btn', '지난 결과 다시 보기 →', handlers.onLast));
    }

    root.appendChild(ui.el('p', 'privacy',
      '🔒 사진은 내 기기 안에서만 분석되고 서버로 전송·저장되지 않아요.'));
    return root;
  }

  LA.ui.home = { render: render };
})(window.LA);
