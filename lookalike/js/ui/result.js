(function (LA) {
  var ui = LA.ui;

  // 결과에 필요한 계산을 한곳에서. 화면과 공유 문구가 같은 값을 쓰게 한다.
  // model = { vector, gender, scope, personalColor, warnings }
  function compute(model, celebs) {
    var matches = LA.match.rank(model.vector, celebs, {
      gender: model.scope === 'all' ? 'all' : model.gender, limit: 3
    });
    return {
      animals: LA.profile.rankAnimals(model.vector),
      traits: LA.profile.describe(model.vector),
      matches: matches
    };
  }

  function stylingFor(model, match) {
    return LA.styling.recommend({
      vector: model.vector, gender: model.gender,
      personalColor: model.personalColor, celeb: match ? match.celeb : null
    });
  }

  function shareText(model, computed) {
    var top = computed.animals[0].animal;
    var m = computed.matches[0];
    var s = stylingFor(model, m);
    var lines = ['나는 ' + top.emoji + ' ' + top.name + '!'];
    if (m) lines.push('닮은꼴 연예인 1위: ' + m.celeb.name + ' (특징 일치도 ' + m.score + '%)');
    lines.push('베스트 헤어: ' + s.hair.best[0]);
    lines.push('추천 패션: ' + s.fashion.keyword);
    return lines.join('\n');
  }

  function typeCard(computed) {
    var top = computed.animals[0];
    var card = ui.el('div', 'type-card animal-' + top.key);
    card.appendChild(ui.el('div', 'type-emoji', top.animal.emoji));
    var body = ui.el('div', 'type-body');
    body.appendChild(ui.el('div', 'type-kicker', '당신은'));
    body.appendChild(ui.el('h2', 'type-name', top.animal.name));
    body.appendChild(ui.el('p', 'type-desc', top.animal.desc));
    card.appendChild(body);

    var mix = ui.el('div', 'mix');
    computed.animals.slice(0, 3).forEach(function (a) {
      var row = ui.el('div', 'mix-row');
      row.appendChild(ui.el('span', 'mix-label', a.animal.emoji + ' ' + a.animal.name));
      var bar = ui.el('span', 'bar');
      var fill = ui.el('span', 'bar-fill');
      fill.style.width = a.share + '%';
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(ui.el('span', 'mix-pct', a.share + '%'));
      mix.appendChild(row);
    });
    card.appendChild(mix);

    var chips = ui.el('div', 'chips');
    computed.traits.forEach(function (t) { chips.appendChild(ui.chip(t.label, t.neutral ? 'soft' : '')); });
    card.appendChild(chips);
    return card;
  }

  function matchCard(m, rank, selected, onSelect) {
    var b = ui.button('match' + (selected ? ' on' : ''), null, onSelect);
    b.setAttribute('aria-pressed', selected ? 'true' : 'false');
    var animal = LA.profile.ANIMALS[m.celeb.animal];
    b.appendChild(ui.el('span', 'avatar animal-' + m.celeb.animal, animal.emoji));
    var body = ui.el('span', 'match-body');
    var head = ui.el('span', 'match-head');
    head.appendChild(ui.el('span', 'match-rank', rank + '위'));
    head.appendChild(ui.el('span', 'match-name', m.celeb.name));
    head.appendChild(ui.el('span', 'match-job', m.celeb.job));
    body.appendChild(head);
    var bar = ui.el('span', 'bar');
    var fill = ui.el('span', 'bar-fill');
    fill.style.width = m.score + '%';
    bar.appendChild(fill);
    var scoreRow = ui.el('span', 'score-row');
    scoreRow.appendChild(bar);
    scoreRow.appendChild(ui.el('span', 'score', m.score + '%'));
    body.appendChild(scoreRow);
    body.appendChild(ui.el('span', 'match-common',
      m.common.length ? '공통점: ' + m.common.join(' · ') : animal.name + ' 계열'));
    b.appendChild(body);
    return b;
  }

  function section(title, icon) {
    var s = ui.el('div', 'style-sec');
    s.appendChild(ui.el('h3', null, icon + ' ' + title));
    return s;
  }

  function stylingView(model, match) {
    var st = stylingFor(model, match);
    var root = ui.el('div', 'styling');

    var head = ui.el('div', 'styling-head');
    head.appendChild(ui.el('h2', null, '베스트 스타일링'));
    head.appendChild(ui.el('p', 'muted',
      st.faceShapeLabel + ' 얼굴 · ' + LA.profile.ANIMALS[st.animalKey].name + ' 기준' +
      (match ? ' · ' + match.celeb.name + ' 무드 반영' : '')));
    root.appendChild(head);

    if (st.celebLook) {
      var look = ui.el('div', 'celeb-look');
      look.appendChild(ui.el('h3', null, '✨ ' + st.celebLook.title));
      look.appendChild(ui.list(st.celebLook.items, 'checks'));
      if (match) {
        var a = ui.el('a', 'ext-link', match.celeb.name + ' 스타일 사진 검색 ↗');
        a.href = 'https://search.naver.com/search.naver?where=image&query=' +
          encodeURIComponent(match.celeb.name + ' 스타일');
        a.target = '_blank';
        a.rel = 'noopener';
        look.appendChild(a);
      }
      root.appendChild(look);
    }

    var hair = section('헤어', '💇');
    hair.appendChild(ui.el('p', 'why', st.hair.why));
    hair.appendChild(ui.el('div', 'sub', '추천'));
    hair.appendChild(ui.list(st.hair.best, 'checks'));
    hair.appendChild(ui.el('div', 'sub', '피하면 좋은'));
    hair.appendChild(ui.list(st.hair.avoid, 'crosses'));
    root.appendChild(hair);

    var face = section(st.face.title, model.gender === 'M' ? '🧴' : '💄');
    face.appendChild(ui.list(st.face.items, 'dots'));
    root.appendChild(face);

    var fashion = section('패션 · ' + st.fashion.keyword, '👗');
    fashion.appendChild(ui.list(st.fashion.items, 'checks'));
    fashion.appendChild(ui.el('p', 'why', st.fashion.tip));
    root.appendChild(fashion);

    var colors = section(st.colors.title, '🎨');
    var sw = ui.el('div', 'swatches');
    st.colors.swatches.forEach(function (c) {
      var item = ui.el('div', 'swatch');
      var dot = ui.el('span', 'swatch-dot');
      dot.style.background = c.hex;
      item.appendChild(dot);
      item.appendChild(ui.el('span', 'swatch-name', c.name));
      sw.appendChild(item);
    });
    colors.appendChild(sw);
    colors.appendChild(ui.el('p', 'why', st.colors.tip));
    if (!st.colors.diagnosed) {
      colors.appendChild(ui.el('p', 'muted', '퍼스널컬러 체크를 건너뛰어 무난한 뉴트럴 팔레트를 보여드려요.'));
    }
    root.appendChild(colors);

    var acc = section('안경 · 액세서리', '👓');
    acc.appendChild(ui.list(st.accessories.items, 'dots'));
    root.appendChild(acc);

    return root;
  }

  // handlers = { onRestart(), onShare(text) }
  function render(model, handlers, celebs) {
    var computed = compute(model, celebs || LA.CELEBS);
    var root = ui.el('section', 'result');
    var selected = 0;

    root.appendChild(typeCard(computed));
    (model.warnings || []).forEach(function (w) { root.appendChild(ui.el('p', 'warning', '⚠ ' + w)); });

    var matchesBox = ui.el('div', 'matches');
    matchesBox.appendChild(ui.el('h2', null, '닮은꼴 연예인 TOP ' + computed.matches.length));
    matchesBox.appendChild(ui.el('p', 'muted', '눌러서 그 연예인 무드의 스타일링을 볼 수 있어요.'));
    var matchList = ui.el('div', 'match-list');
    matchesBox.appendChild(matchList);
    root.appendChild(matchesBox);

    var stylingHost = ui.el('div');
    root.appendChild(stylingHost);

    function draw() {
      matchList.textContent = '';
      computed.matches.forEach(function (m, i) {
        matchList.appendChild(matchCard(m, i + 1, i === selected, function () {
          selected = i;
          draw();
        }));
      });
      stylingHost.textContent = '';
      stylingHost.appendChild(stylingView(model, computed.matches[selected]));
    }
    draw();

    var actions = ui.el('div', 'row-actions');
    actions.appendChild(ui.button('btn', '처음부터 다시', handlers.onRestart));
    actions.appendChild(ui.button('btn primary', '결과 공유하기', function () {
      handlers.onShare(shareText(model, computed));
    }));
    root.appendChild(actions);
    root.appendChild(ui.el('p', 'disclaimer-inline',
      '스타일링은 얼굴형·인상별로 흔히 쓰는 공식을 바탕으로 한 출발점이에요. 마음에 드는 것부터 가볍게 시도해 보세요.'));
    root.appendChild(ui.disclaimer());
    return root;
  }

  LA.ui.result = { render: render, compute: compute, shareText: shareText };
})(window.LA);
