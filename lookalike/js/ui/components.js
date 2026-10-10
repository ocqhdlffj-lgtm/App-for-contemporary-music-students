(function (LA) {
  LA.ui = LA.ui || {};

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function button(cls, text, onClick) {
    var b = el('button', cls, text);
    b.type = 'button';
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  // 한 문항의 선택지 묶음(라디오처럼 하나만 선택). selected는 현재 값.
  // 버튼에 aria-pressed를 달아 화면 낭독기에서도 선택 상태가 읽히게 한다.
  function choiceGroup(options, selected, onPick) {
    var wrap = el('div', 'choices');
    options.forEach(function (o) {
      var b = button('choice' + (o.value === selected ? ' on' : ''), null, function () {
        Array.prototype.forEach.call(wrap.children, function (x) {
          x.classList.remove('on');
          x.setAttribute('aria-pressed', 'false');
        });
        b.classList.add('on');
        b.setAttribute('aria-pressed', 'true');
        onPick(o.value);
      });
      b.setAttribute('aria-pressed', o.value === selected ? 'true' : 'false');
      b.setAttribute('data-value', o.value);
      b.appendChild(el('span', 'choice-label', o.label));
      if (o.hint) b.appendChild(el('span', 'choice-hint', o.hint));
      wrap.appendChild(b);
    });
    return wrap;
  }

  function chip(text, kind) { return el('span', 'chip' + (kind ? ' ' + kind : ''), text); }

  function list(items, cls) {
    var ul = el('ul', cls || 'plain');
    items.forEach(function (t) { ul.appendChild(el('li', null, t)); });
    return ul;
  }

  function disclaimer() {
    return el('p', 'disclaimer',
      '재미로 보는 결과예요. 연예인 사진과 얼굴을 직접 비교하는 게 아니라, 얼굴 특징을 ' +
      '인상 태그와 비교한 것이며 연예인 태그는 주관적인 분류입니다.');
  }

  LA.ui.el = el;
  LA.ui.button = button;
  LA.ui.choiceGroup = choiceGroup;
  LA.ui.chip = chip;
  LA.ui.list = list;
  LA.ui.disclaimer = disclaimer;
})(window.LA);
