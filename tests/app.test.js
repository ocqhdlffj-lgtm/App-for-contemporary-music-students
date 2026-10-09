function appFbSchools() {
  return [
    { id: 'a', name: '가대', type: '4년제', region: '서울', deptName: '실용음악과', tracks: [] },
    { id: 'b', name: '나대', type: '전문대', region: '경기', deptName: '실용음악과', tracks: [] }
  ];
}

// 회귀 테스트: task-9 브리프의 renderList()는 조건이 바뀔 때마다 #screen 전체를
// 비우고 필터바까지 새로 만들었다. 검색창은 keystroke마다 input 이벤트로 onChange를
// 부르므로, 그 결과 <input name="q">가 매 글자마다 파괴·재생성되어 포커스가 빠지고
// 두 번째 글자부터 입력이 씹혔다(CDP로 실측: activeElement가 BODY로 이동).
// 실제 포커스 이동은 detached DOM 단위 테스트로 재현할 수 없으므로, 그 버그를
// 구조적으로 불가능하게 만드는 성질 — "조건 변경 시 목록만 다시 그려지고
// 검색창 DOM 노드는 재사용된다" — 를 검증한다.
T.test('조건이 바뀌어도 필터바(검색창) DOM 노드는 재사용된다', function () {
  var screen = document.createElement('main');
  screen.id = 'screen';
  var progress = document.createElement('div');
  progress.id = 'progress';
  document.body.appendChild(screen);
  document.body.appendChild(progress);

  try {
    PM.app._state.schools = appFbSchools();
    PM.app._state.criteria = {};
    PM.app._state.dataVersion = '테스트';
    PM.app._renderList();

    var qBefore = screen.querySelector('input[name="q"]');
    T.assert(qBefore, '검색창이 있어야 한다');

    // 실제 타이핑처럼 input 이벤트로 onChange → renderResults 경로를 태운다.
    qBefore.value = '가';
    qBefore.dispatchEvent(new Event('input'));

    var qAfter = screen.querySelector('input[name="q"]');
    T.assert(qAfter === qBefore,
      '검색어 입력으로 조건이 바뀌어도 검색창 DOM 노드가 파괴·재생성되면 안 된다');
    T.eq(qAfter.value, '가');
  } finally {
    document.body.removeChild(screen);
    document.body.removeChild(progress);
  }
});

T.test('#screen을 비우고 다시 진입해도 필터바와 목록이 정상적으로 다시 그려진다', function () {
  var screen = document.createElement('main');
  screen.id = 'screen';
  var progress = document.createElement('div');
  progress.id = 'progress';
  document.body.appendChild(screen);
  document.body.appendChild(progress);

  try {
    PM.app._state.schools = appFbSchools();
    PM.app._state.criteria = {};
    PM.app._state.dataVersion = '테스트';
    PM.app._renderList();

    // Task 11이 하게 될 일: 화면 전환을 위해 #screen을 통째로 비운다.
    screen.textContent = '';
    T.eq(screen.querySelector('input[name="q"]'), null);

    // 목록 화면 진입점을 다시 부르면 재진입 시에도 정상 동작해야 한다.
    PM.app._renderList();

    T.assert(screen.querySelector('input[name="q"]'), '재진입 시 검색창이 다시 그려져야 한다');
    T.assert(screen.querySelector('.list'), '재진입 시 목록이 다시 그려져야 한다');
    T.assert(screen.querySelector('.disclaimer'), '재진입 시 면책 문구가 다시 그려져야 한다');
    T.assert(progress.querySelector('.expansion-notice'),
      '재진입 시 목록이 계속 추가되는 중이라는 고지가 진행률 영역에 다시 그려져야 한다');
  } finally {
    document.body.removeChild(screen);
    document.body.removeChild(progress);
  }
});

// 회귀 방지: PM.data.load()가 아직 끝나기 전에 사용자가 「내 지원 리스트」 탭으로
// 넘어갈 수 있다(Phase 2 안드로이드 웹뷰에서는 원격 fetch가 실제로 걸린다).
// 예전 start()는 (1) 로딩 중에도 state.schools가 []인 채로 mylist 화면을 그려
// 실제 픽이 있어도 "찜한 학교가 없습니다"라는 거짓 안내를 냈고, (2) 로드가 끝나면
// 무조건 renderList()를 불러 탭은 mylist인데 화면은 학교 찾기로 어긋났다.
// PM.data.load를 지연 Promise로 바꿔치기해 이 타이밍을 실제로 재현한다.
T.test('데이터 로딩 중 탭을 바꿔도 로딩이 끝나면 활성 탭과 화면이 일치한다', function (done) {
  var nav = document.createElement('nav');
  nav.className = 'tabs';
  var listBtn = document.createElement('button');
  listBtn.type = 'button';
  listBtn.setAttribute('data-tab', 'list');
  listBtn.className = 'active';
  listBtn.textContent = '학교 찾기';
  var mylistBtn = document.createElement('button');
  mylistBtn.type = 'button';
  mylistBtn.setAttribute('data-tab', 'mylist');
  mylistBtn.textContent = '내 지원 리스트';
  nav.appendChild(listBtn);
  nav.appendChild(mylistBtn);

  var screen = document.createElement('main');
  screen.id = 'screen';
  var progress = document.createElement('div');
  progress.id = 'progress';
  document.body.appendChild(nav);
  document.body.appendChild(screen);
  document.body.appendChild(progress);

  var origLoad = PM.data.load;
  var resolveLoad = null;
  PM.data.load = function () {
    return new Promise(function (resolve) { resolveLoad = resolve; });
  };

  PM.storage._reset();
  PM.storage.addPick('a', 'susi'); // 로딩이 끝나기 전부터 실제 픽이 있는 상태

  function cleanup() {
    PM.data.load = origLoad;
    PM.storage._reset();
    document.body.removeChild(nav);
    document.body.removeChild(screen);
    document.body.removeChild(progress);
    PM.app._state.activeTab = 'list';
    PM.app._state.loaded = false;
    PM.app._state.schools = [];
  }

  try {
    PM.app.start();

    // 로드가 끝나기 전에 「내 지원 리스트」 탭을 누른다.
    mylistBtn.click();

    T.assert(mylistBtn.classList.contains('active'), '탭 클릭 즉시 active 클래스가 옮겨가야 한다');
    T.eq(screen.querySelector('.empty'), null,
      '실제로는 픽이 있으므로 로딩 중에 "찜한 학교가 없습니다"를 보여주면 안 된다(거짓 안내 금지)');
    T.assert(screen.querySelector('.mylist-loading'),
      '로딩 중임을 있는 그대로 알려야 한다');

    // 이제 로드가 끝난다 — 이 시점에 활성 탭은 여전히 mylist다.
    resolveLoad({ schools: [{
      id: 'a', name: '가대', type: '4년제', region: '서울', deptName: '실용음악과',
      tracks: [{
        id: 'susi', season: '수시', name: '전형', majors: ['보컬'], quota: null,
        schedule: { practical: ['2026-10-11'] }, ratio: null, minCsat: null,
        practical: null, competition: [],
        verification: { level: '미확인', checkedAt: '2026-09-10', source: null }
      }],
      prepPoints: []
    }], dataVersion: '테스트', source: 'test' });

    setTimeout(function () {
      var failure = null;
      try {
        T.assert(mylistBtn.classList.contains('active'),
          '로드가 끝난 뒤에도 active 탭은 사용자가 마지막으로 누른 mylist여야 한다');
        T.assert(!listBtn.classList.contains('active'), '두 탭이 동시에 active면 안 된다');
        T.eq(screen.querySelector('.mylist-loading'), null,
          '로드가 끝났으면 로딩 안내는 사라져야 한다');
        T.assert(screen.querySelector('.mylist'),
          '탭(mylist)과 실제로 그려진 화면이 일치해야 한다 — renderList()로 덮이면 안 된다');
        T.assert(screen.querySelector('.pick-row'), '실제 픽이 화면에 반영돼야 한다');
      } catch (e) {
        failure = e;
      }
      // done()은 러너가 뒤따르는 동기 테스트들을 곧바로 이어서 실행하므로, 정리를 반드시
      // done() 전에 해야 한다. 순서가 반대면 이 테스트의 #screen이 DOM에 남은 채로 다음
      // 테스트들이 돌아 document.getElementById('screen')이 엉뚱한 요소를 잡는다.
      cleanup();
      done(failure);
    }, 0);
  } catch (e) {
    cleanup();
    done(e);
  }
});

// 정시 화면: 정시 정보가 있는 학교는 카드로, 없는 학교는 사라지지 않고 "정보 없음"
// 묶음으로 보여야 한다. 그냥 빠지면 "전국에 정시가 없다"는 거짓 신호가 된다.
function jeongsiViewSchools() {
  function track(id, season, name) {
    return {
      id: id, season: season, name: name, majors: ['보컬'], quota: null,
      schedule: { practical: ['2027-01-26'] }, ratio: null, minCsat: null, practical: null,
      competition: [], verification: { level: '부분확인', checkedAt: '2026-10-08', source: null }
    };
  }
  return [
    { id: 'a', name: '가대', type: '4년제', region: '서울', deptName: '실용음악과',
      tracks: [track('susi', '수시', '수시전형'), track('jeongsi', '정시', '정시전형')] },
    { id: 'b', name: '나대', type: '전문대', region: '경기', deptName: '실용음악과',
      tracks: [track('susi', '수시', '수시전형')] }
  ];
}

function withScreen(fn) {
  var screen = document.createElement('main');
  screen.id = 'screen';
  var progress = document.createElement('div');
  progress.id = 'progress';
  document.body.appendChild(screen);
  document.body.appendChild(progress);
  try { fn(screen); } finally {
    document.body.removeChild(screen);
    document.body.removeChild(progress);
  }
}

T.test('정시 화면: 정시 정보가 없는 학교는 사라지지 않고 "정보 없음" 묶음에 보인다', function () {
  withScreen(function (screen) {
    PM.app._state.schools = jeongsiViewSchools();
    PM.app._state.criteria = { season: '정시' };
    PM.app._state.dataVersion = '테스트';
    PM.app._renderList();

    var cards = screen.querySelectorAll('.card');
    T.eq(cards.length, 1);
    T.assert(cards[0].textContent.indexOf('가대') >= 0, '정시 정보가 있는 학교만 카드로');
    var missing = screen.querySelector('.missing');
    T.assert(missing, '정보 없는 학교 묶음이 있어야 함');
    T.assert(missing.textContent.indexOf('나대') >= 0, '정시 정보 없는 학교가 묶음에 보여야 함');
    T.assert(screen.textContent.indexOf('2곳 중 1곳') >= 0, '정시 수집 현황이 실제 수치로 보여야 함');
  });
});

T.test('수시 화면에서는 정시 수집 현황 고지를 띄우지 않는다', function () {
  withScreen(function (screen) {
    PM.app._state.schools = jeongsiViewSchools();
    PM.app._state.criteria = { season: '수시' };
    PM.app._state.dataVersion = '테스트';
    PM.app._renderList();
    T.eq(screen.querySelector('.season-notice'), null);
    T.eq(screen.querySelector('.missing'), null);
  });
});

T.test('정시 화면에서 전공 같은 세부 조건을 켜면 정보 없는 학교는 묶음 대신 안내문으로 제외를 알린다', function () {
  withScreen(function (screen) {
    PM.app._state.schools = jeongsiViewSchools();
    PM.app._state.criteria = { season: '정시', major: '보컬' };
    PM.app._state.dataVersion = '테스트';
    PM.app._renderList();

    T.eq(screen.querySelector('.missing'), null);
    var hint = screen.querySelector('.missing-hint');
    T.assert(hint, '제외했다는 안내문이 있어야 함');
    T.assert(hint.textContent.indexOf('1곳') >= 0, '제외된 학교 수가 안내돼야 함');
  });
});

T.test('정시 버튼을 누르면 필터바를 다시 만들지 않고 목록만 정시 기준으로 바뀐다', function () {
  withScreen(function (screen) {
    PM.app._state.schools = jeongsiViewSchools();
    PM.app._state.criteria = {};
    PM.app._state.dataVersion = '테스트';
    PM.app._renderList();

    var bar = screen.querySelector('.filterbar');
    T.eq(screen.querySelectorAll('.card').length, 2);
    screen.querySelector('.season-btn[data-season="정시"]').click();

    T.assert(screen.querySelector('.filterbar') === bar, '필터바 DOM은 재사용돼야 함');
    T.eq(screen.querySelectorAll('.card').length, 1);
    T.assert(screen.querySelector('.missing'), '정보 없는 학교 묶음이 나타나야 함');
  });
});

T.test('진행률은 고른 시기 전형만 기준으로 센다(정시를 고르면 정시 정보가 있는 학교만 분모)', function () {
  withScreen(function (screen) {
    PM.app._state.schools = jeongsiViewSchools();
    PM.app._state.dataVersion = '테스트';
    var progress = document.getElementById('progress');

    PM.app._state.criteria = { season: '정시' };
    PM.app._renderList();
    T.assert(progress.textContent.indexOf('정시 세부 확인 0 / 1개교') >= 0,
      '정시 화면의 진행률은 정시 정보가 있는 1개교 기준이어야 함: ' + progress.textContent);

    PM.app._state.criteria = { season: '수시' };
    PM.app._renderList();
    T.assert(progress.textContent.indexOf('수시 세부 확인 0 / 2개교') >= 0, '수시 화면은 2개교 기준');

    PM.app._state.criteria = {};
    PM.app._renderList();
    T.assert(progress.textContent.indexOf('세부 확인 0 / 2개교') >= 0
      && progress.textContent.indexOf('수시 세부') < 0 && progress.textContent.indexOf('정시 세부') < 0,
      '전체 화면은 시기 접두어 없이 전체 학교 기준');
  });
});
