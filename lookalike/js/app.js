(function (LA) {
  // 화면 흐름: home → (photo → review | quiz) → color → result.
  // 각 화면은 #screen을 비우고 새로 그린다. 화면 전환마다 history에 기록해
  // 안드로이드 뒤로가기·브라우저 뒤로가기가 앱 안에서 동작하게 한다.
  //
  // analysis: 사진 분석 결과(확인 화면에서 사용자가 고치기 전)
  // pending: 사진/퀴즈로 얻은 특징 벡터(퍼스널컬러 체크 전 단계)
  // result:  결과 화면이 그리는 모델 전체. 저장되는 것도 이것뿐이다(사진 없음).
  var state = { screen: 'home', settings: null, analysis: null, pending: null, result: null };

  function host() { return document.getElementById('screen'); }

  function go(name) {
    render(name);
    try { history.pushState({ screen: name }, ''); } catch (e) { /* file:// 등 */ }
  }

  function toast(msg) {
    var t = LA.ui.el('div', 'toast', msg);
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  function share(text) {
    var url = location.href.split('#')[0];
    if (navigator.share) {
      navigator.share({ title: '닮은꼴 스타일', text: text, url: url }).catch(function () {});
      return;
    }
    var full = text + '\n' + url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(function () { toast('결과를 복사했어요!'); },
        function () { window.prompt('아래 내용을 복사해 공유하세요', full); });
    } else {
      window.prompt('아래 내용을 복사해 공유하세요', full);
    }
  }

  function toColor(pending) {
    state.pending = pending;
    go('color');
  }

  var SCREENS = {
    home: function () {
      var last = LA.storage.load();
      return LA.ui.home.render(state.settings, {
        onChange: function (s) { state.settings = s; LA.storage.saveSettings(s); },
        onPhoto: function () { go('photo'); },
        onQuiz: function () { go('quiz'); },
        onLast: last ? function () {
          // 지난 결과도 지금 홈 화면의 설정(스타일 기준·범위)으로 다시 보여준다.
          state.result = Object.assign({}, last, state.settings);
          go('result');
        } : null
      });
    },
    photo: function () {
      return LA.ui.photo.render({
        onBack: function () { go('home'); },
        onQuiz: function () { go('quiz'); },
        onDone: function (a) { state.analysis = a; go('review'); }
      });
    },
    review: function () {
      var a = state.analysis;
      return LA.ui.review.render(a, {
        onBack: function () { go('home'); },
        onDone: function (v) { toColor({ vector: v, warnings: a.warnings, source: 'photo' }); }
      });
    },
    quiz: function () {
      return LA.ui.quiz.render({
        onBack: function () { go('home'); },
        onDone: function (v) { toColor({ vector: v, warnings: [], source: 'quiz' }); }
      });
    },
    color: function () {
      return LA.ui.color.render({
        onBack: function () { go('home'); },
        onDone: function (pc) {
          var p = state.pending;
          state.result = {
            vector: p.vector, warnings: p.warnings, source: p.source,
            gender: state.settings.gender, scope: state.settings.scope,
            personalColor: pc
          };
          LA.storage.save(state.result);
          go('result');
        }
      });
    },
    result: function () {
      return LA.ui.result.render(state.result, {
        onRestart: function () { go('home'); },
        onShare: share
      });
    }
  };

  // 앞 단계 데이터가 없는 화면(새로고침 후 뒤로가기 등)은 홈으로 돌린다.
  function render(name) {
    if (name === 'review' && !state.analysis) name = 'home';
    if (name === 'color' && !state.pending) name = 'home';
    if (name === 'result' && !state.result) name = 'home';
    if (!SCREENS[name]) name = 'home';
    state.screen = name;
    var h = host();
    h.textContent = '';
    h.appendChild(SCREENS[name]());
    window.scrollTo(0, 0);
  }

  function start() {
    state.settings = LA.storage.loadSettings();
    var errors = LA.match.validate(LA.CELEBS);
    if (errors.length && window.console) console.warn('연예인 데이터 오류:', errors);
    window.addEventListener('popstate', function (e) {
      render((e.state && e.state.screen) || 'home');
    });
    try { history.replaceState({ screen: 'home' }, ''); } catch (e) { /* file:// 등 */ }
    render('home');
  }

  LA.app = { start: start, _state: state, _render: render };
})(window.LA);
