(function (PM) {
  PM.ui = PM.ui || {};

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function badge(text, kind) {
    return el('span', 'badge ' + (kind || ''), text);
  }

  function levelBadge(school) {
    var lv = PM.schema.schoolLevel(school);
    return badge(lv, 'level-' + lv);
  }

  function disclaimerBar() {
    return el('div', 'disclaimer',
      '요강은 변경될 수 있습니다. 지원 전 반드시 입학처 원문을 확인하세요.');
  }

  function progressText(schools) {
    var total = (schools || []).length;
    var done = 0;
    (schools || []).forEach(function (s) {
      if (PM.schema.schoolLevel(s) === '확인됨') done++;
    });
    return '세부 확인 ' + done + ' / ' + total + '개교';
  }

  PM.ui.el = el;
  PM.ui.badge = badge;
  PM.ui.levelBadge = levelBadge;
  PM.ui.disclaimerBar = disclaimerBar;
  PM.ui.progressText = progressText;
})(window.PM);
