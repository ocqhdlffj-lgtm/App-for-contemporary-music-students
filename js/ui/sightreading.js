(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  // 8마디(2단×4마디) 코드 초견 연습용 진행. 실제 시험 기출이 아니라 연습을 위해
  // 자체 구성한 진행이다 — 이 점을 화면에도 항상 밝힌다(prep 계열 문구와 동일 원칙).
  var SHEETS = [
    {
      tag: '다이아토닉 순환 · 완전종지',
      bars: ['C', 'G', 'Am', 'Em', 'F', 'Dm', 'G', 'C'],
      note: '전부 C장조 다이아토닉 3화음만으로 구성. 마지막 ii-V-I(Dm-G-C)에서 확실히 종지되어 한 바퀴 돌았다는 감각을 익히기 좋은 기본 진행 — 12키 전환 연습을 이 진행부터 시작할 것.'
    },
    {
      tag: '캐논 진행 · 슬래시 코드',
      bars: ['C', 'G/B', 'Am7', 'Em/G', 'F', 'C/E', 'Dm7', 'G7'],
      note: '베이스가 C-B-A-G-F-E-D-G로 계단식 하행. 코드 이름이 안 외워져도 베이스 라인만 따라가면 절반은 맞힐 수 있는 대표적 진행.'
    },
    {
      tag: '세컨더리 도미넌트',
      bars: ['C', 'E7', 'Am7', 'A7', 'Dm7', 'G7', 'F', 'C'],
      note: 'E7(2마디)과 A7(4마디)은 다이아토닉에 없는 임시 도미넌트. E7의 3음(G#)과 A7의 3음(C#)을 놓치면 다음 마이너 코드로 못 넘어가니 그 두 음만 따로 짚는 연습을 먼저.'
    },
    {
      tag: '3–6–2–5 턴어라운드',
      bars: ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Em7', 'Am7', 'Dm7', 'G7'],
      note: '같은 ii–V(Dm7–G7)가 두 번 반복되는 재즈 스탠다드형 턴어라운드. 미디·작곡 전공 초견에서 "잡히면 순식간에 끝나고 안 잡히면 끝까지 헤매는" 유형으로 자주 언급됨.'
    },
    {
      tag: '모달 인터체인지',
      bars: ['C', 'Fm/A♭', 'C/G', 'G7', 'Am', 'F', 'B♭', 'C'],
      note: '2마디 Fm(동주 단조에서 빌려온 코드)에서 순간적으로 어두워졌다가 3마디에서 바로 장조로 복귀. 7마디 B♭(♭VII)도 같은 원리. 두 코드의 손 모양을 F·B♭ 메이저와 구분해 따로 연습.'
    },
    {
      tag: '하행 스케일형 · 완전종지',
      bars: ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Fmaj7', 'Em7', 'Dm7', 'Cmaj7'],
      note: '1~4마디(I-vi-ii-V)와 5~8마디(IV-iii-ii-I)가 한 계단씩 내려오는 대칭 구조. 8마디에서 Cmaj7로 완전히 종지되므로 진행이 어디서 끝나는지 몸으로 익히기 좋음.'
    },
    {
      tag: '5도권 순환 · 완전종지',
      bars: ['Em7', 'A7', 'Dm7', 'G7', 'Cmaj7', 'Fmaj7', 'G7', 'Cmaj7'],
      note: '베이스가 E-A-D-G-C-F-G-C로 5도씩 계속 내려가다 5마디에서 한 번 C에 도착하고, 6~8마디(IV-V-I)로 다시 한 번 종지. 슬래시 코드 없이 근음만 봐도 되니 순수 5도권 감각부터 잡는 용도.'
    },
    {
      tag: '텐션 · sus 코드',
      bars: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7sus4', 'G7', 'Am7', 'D7/F#'],
      note: '1~4마디는 다이아토닉 7th를 순서대로 오르는 스케일형 진행. 5마디 sus4는 3음이 4음으로 대체된 형태라 6마디에서 3음(B)으로 해결되는 긴장·해소 관계를 느끼며 연주.'
    },
    {
      tag: '단조 · 완전종지',
      bars: ['Am', 'Dm', 'E7', 'Am', 'F', 'Dm', 'E7', 'Am'],
      note: 'A단조(화성단음계) 기본 진행 — i-iv-V-i가 두 번 반복. 3·7마디 E7의 3음(G#)이 화성단음계 특유의 증2도 느낌을 만드는 핵심 음이라 놓치지 않게 별도 연습.'
    },
    {
      tag: 'CCM · 워십형',
      bars: ['C', 'Em7', 'F', 'G7', 'Am7', 'F', 'G7', 'C'],
      note: 'I-iii-IV-V(절반 종지)로 한 번, vi-IV-V-I(완전 종지)로 다시 한 번 — 워십·CCM 편곡에서 가장 많이 쓰이는 4+4 구조. 3음 위주 보이싱을 자연스럽게 이어 붙이는 연습에 적합.'
    },
    {
      tag: 'F장조 ii–V–I · 조옮김용',
      bars: ['Fmaj7', 'B♭maj7', 'Am7', 'D7', 'Gm7', 'C7', 'Fmaj7', 'Fmaj7'],
      note: '지금까지는 전부 C장조였다면 이번엔 F장조로 이동 — D7(V/ii, 세컨더리 도미넌트)에서 Gm7으로 이어지는 손 모양을 새로 익힐 것. 이 진행이 편해지면 위 8개를 전부 F·G·D장조로도 옮겨 연습.'
    }
  ];

  function measure(chordName) {
    var m = el('div', 'sr-measure');
    m.appendChild(el('div', 'sr-chordname', chordName));
    var lines = el('div', 'sr-stafflines');
    for (var i = 0; i < 5; i++) lines.appendChild(el('i'));
    m.appendChild(lines);
    m.appendChild(el('div', 'sr-rest', '\u{1D13B}'));
    return m;
  }

  function system(bars4, withClef) {
    var s = el('div', 'sr-system');
    var clefbox = el('div', 'sr-clefbox');
    if (withClef) {
      clefbox.appendChild(el('span', 'sr-clef', '\u{1D11E}'));
      var ts = el('span', 'sr-timesig');
      ts.appendChild(el('span', null, '4'));
      ts.appendChild(el('span', null, '4'));
      clefbox.appendChild(ts);
    }
    s.appendChild(clefbox);
    bars4.forEach(function (name) { s.appendChild(measure(name)); });
    return s;
  }

  function sheet(n, data) {
    var s = el('section', 'sr-sheet');
    var head = el('div', 'sr-sheet-head');
    head.appendChild(el('span', 'sr-sheet-num', '<' + n + '>'));
    head.appendChild(el('span', 'sr-sheet-tag', data.tag));
    s.appendChild(head);
    s.appendChild(system(data.bars.slice(0, 4), true));
    s.appendChild(system(data.bars.slice(4, 8), false));
    s.appendChild(el('p', 'sr-caption', data.note));
    return s;
  }

  function render() {
    var wrap = el('div', 'sightreading');
    wrap.appendChild(el('h2', null, '코드 초견 연습장'));
    wrap.appendChild(el('p', 'muted',
      '8마디(2단×4마디)씩 총 ' + SHEETS.length + '개 진행. 코드 네임만 보고 바로 화음을 짚어내는 훈련용 자료입니다.'));
    wrap.appendChild(el('div', 'sr-howto',
      '연습법 — 정한 템포(♩=80부터)로 한 번에 끝까지 짚고, 막히면 처음부터 다시. 12키로 옮겨 치는 것까지 되면 실전 대응력이 붙습니다. 슬래시 코드(예: G/B)는 베이스음을 먼저 짚고 위에 코드를 얹으세요.'));

    SHEETS.forEach(function (data, i) { wrap.appendChild(sheet(i + 1, data)); });

    wrap.appendChild(el('p', 'sr-footnote',
      '⚠ 실제 학교 기출이 아니라 연습용으로 직접 구성한 진행입니다 — 학교마다 실제 시험 코드는 다릅니다.'));
    return wrap;
  }

  PM.ui.sightreading = { render: render, SHEETS: SHEETS };
})(window.PM);
