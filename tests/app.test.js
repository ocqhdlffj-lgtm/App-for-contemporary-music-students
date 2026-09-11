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
  } finally {
    document.body.removeChild(screen);
    document.body.removeChild(progress);
  }
});
