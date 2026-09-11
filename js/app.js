(function (PM) {
  // activeTab: 현재 활성 탭 키('list'/'mylist'/...). 탭 버튼의 active 클래스와
  // 이 값은 항상 같은 소스(bindTabs의 클릭 핸들러)에서만 갱신되므로 서로 어긋날 수 없다.
  // loaded: PM.data.load()가 아직 해결되지 않은 동안은 false — 그 사이 state.schools는
  // 빈 배열이므로, 이 값을 확인하지 않고 내 지원 리스트를 그리면 "찜한 학교가 없습니다"라는
  // 거짓 안내가 나갈 수 있다(실제로는 데이터가 아직 안 왔을 뿐).
  var state = { schools: [], criteria: {}, dataVersion: '', source: '', activeTab: 'list', loaded: false };

  function screenEl() { return document.getElementById('screen'); }

  // 목록 호스트만 다시 그린다 — 필터바 DOM에는 손대지 않는다.
  // 검색창은 매 keystroke마다 onChange를 부르므로, 필터바 자체를 다시 만들면
  // <input name="q">가 파괴·재생성되어 타이핑 중 포커스가 날아간다.
  function renderResults(listHost) {
    listHost.textContent = '';

    var shown = PM.filter.apply(state.schools, state.criteria);
    listHost.appendChild(PM.ui.list.render(shown, {
      major: state.criteria.major || '',
      onSelect: renderDetail
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

  // 상세 화면 진입점. #screen을 비우고 학교 하나의 상세 정보를 그린다.
  // Task 11의 화면 전환(#screen 비우고 진입점 재호출)에도 안전하도록
  // 모듈 스코프 DOM 참조를 두지 않고 매번 screenEl()로 다시 찾는다.
  function renderDetail(schoolId) {
    var school = state.schools.filter(function (s) { return s.id === schoolId; })[0];
    if (!school) { renderList(); return; }

    var host = screenEl();
    host.textContent = '';
    host.appendChild(PM.ui.detail.render(school, {
      onBack: renderList,
      onTogglePick: function (sid, tid) {
        if (PM.storage.hasPick(sid, tid)) PM.storage.removePick(sid, tid);
        else PM.storage.addPick(sid, tid);
        renderDetail(sid);
      }
    }));
    host.appendChild(PM.ui.disclaimerBar());
  }

  // 내 지원 리스트 화면 진입점. renderDetail과 마찬가지로 매번 screenEl()로
  // #screen을 다시 찾고 통째로 비운 뒤 새로 그린다 — 탭 전환으로 반복 재진입해도 안전하다.
  //
  // state.loaded가 아직 false인 동안(= PM.data.load()가 진행 중인 동안)에는
  // state.schools가 빈 배열이다. 이 상태에서 그냥 PM.ui.mylist.render를 부르면
  // PM.conflict.entriesFrom([], picks)가 모든 픽을 못 찾아 entries가 0개가 되고,
  // 실제로는 픽이 있는데도 "찜한 학교가 없습니다"라는 거짓 안내가 나간다 — 이 화면의
  // 존재 이유(안전 신호를 거짓으로 주지 않는 것)를 정면으로 위배하므로, 그 대신
  // 로딩 중임을 있는 그대로 알린다.
  function renderMyList() {
    var host = screenEl();
    host.textContent = '';
    if (!state.loaded) {
      host.appendChild(PM.ui.el('div', 'mylist-loading', '학교 데이터를 불러오는 중입니다. 잠시만 기다려주세요.'));
      host.appendChild(PM.ui.disclaimerBar());
      return;
    }
    host.appendChild(PM.ui.mylist.render(state.schools, PM.storage.getPicks(), {
      onSelect: renderDetail,
      onRemove: function (sid, tid) { PM.storage.removePick(sid, tid); renderMyList(); }
    }));
    host.appendChild(PM.ui.disclaimerBar());
  }

  // 탭 이름 → 화면 진입점. Task 12가 탭을 추가할 때는 이 표에 항목 하나만
  // 더하면 되고, bindTabs 자체를 손댈 필요가 없다.
  var screens = {
    list: renderList,
    mylist: renderMyList
  };

  // 탭 버튼의 active 클래스와 state.activeTab은 이 핸들러 하나에서만 함께
  // 갱신된다 — 두 값을 따로 갱신하는 경로가 없으므로 "탭은 내 지원 리스트인데
  // 화면은 학교 찾기"처럼 어긋날 수 없다.
  function bindTabs() {
    var btns = document.querySelectorAll('nav.tabs button');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(btns, function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        state.activeTab = b.getAttribute('data-tab');
        (screens[state.activeTab] || renderList)();
      });
    });
  }

  // PM.data.load()는 원격 fetch가 실제로 걸리는 Phase 2(안드로이드 웹뷰)에서는
  // 눈에 띄게 오래 걸릴 수 있다. 그 사이 사용자가 탭을 눌러 다른 화면으로
  // 이동해 있을 수 있으므로, 로드가 끝난 뒤에는 무조건 renderList()가 아니라
  // "그 시점에 활성화된 탭"을 다시 그린다 — 그래야 탭과 화면이 항상 일치한다.
  function start() {
    bindTabs();
    PM.data.load().then(function (r) {
      state.schools = r.schools;
      state.dataVersion = r.dataVersion;
      state.source = r.source;
      state.loaded = true;
      (screens[state.activeTab] || renderList)();
    });
  }

  PM.app = {
    start: start, _state: state,
    _renderList: renderList, _renderDetail: renderDetail, _renderMyList: renderMyList
  };
})(window.PM);
