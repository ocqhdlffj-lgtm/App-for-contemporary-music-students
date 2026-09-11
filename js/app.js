(function (PM) {
  var state = { schools: [], criteria: {}, dataVersion: '', source: '' };

  function screenEl() { return document.getElementById('screen'); }

  // 목록 호스트만 다시 그린다 — 필터바 DOM에는 손대지 않는다.
  // 검색창은 매 keystroke마다 onChange를 부르므로, 필터바 자체를 다시 만들면
  // <input name="q">가 파괴·재생성되어 타이핑 중 포커스가 날아간다.
  function renderResults(listHost) {
    listHost.textContent = '';

    var shown = PM.filter.apply(state.schools, state.criteria);
    listHost.appendChild(PM.ui.list.render(shown, {
      major: state.criteria.major || '',
      onSelect: function (id) { console.log('선택:', id); }
    }));
    listHost.appendChild(PM.ui.disclaimerBar());

    document.getElementById('progress').textContent =
      PM.ui.progressText(state.schools) + ' · 기준일 ' + state.dataVersion;
  }

  // 목록 화면 진입점. #screen을 비우고 필터바 호스트·목록 호스트를 각각
  // 새로 만든다 — 이후 (Task 11의) 화면 전환이 #screen을 지우고 이 함수를
  // 다시 불러도 두 호스트가 매번 새로 만들어지므로 재진입에 안전하다.
  // 호스트를 모듈 스코프에 캐싱하지 않고 지역 변수 + 클로저로만 참조한다.
  function renderList() {
    var host = screenEl();
    host.textContent = '';

    var filterHost = document.createElement('div');
    var listHost = document.createElement('div');
    host.appendChild(filterHost);
    host.appendChild(listHost);

    // 필터바는 진입 시 한 번만 렌더링한다. 조건이 바뀌어도 이 DOM은
    // 그대로 유지되고, listHost만 다시 그려진다.
    filterHost.appendChild(PM.ui.filterbar.render(state.schools, state.criteria, function (c) {
      state.criteria = c;
      renderResults(listHost);
    }));

    renderResults(listHost);
  }

  function start() {
    PM.data.load().then(function (r) {
      state.schools = r.schools;
      state.dataVersion = r.dataVersion;
      state.source = r.source;
      renderList();
    });
  }

  PM.app = { start: start, _state: state, _renderList: renderList };
})(window.PM);
