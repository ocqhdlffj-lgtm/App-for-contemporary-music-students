T.test('처음에는 찜 목록이 비어 있다', function () {
  PM.storage._reset();
  T.eq(PM.storage.getPicks(), []);
});

T.test('찜을 추가하고 조회한다', function () {
  PM.storage._reset();
  PM.storage.addPick('u1', 'susi');
  T.eq(PM.storage.getPicks(), [{ schoolId: 'u1', trackId: 'susi' }]);
  T.eq(PM.storage.hasPick('u1', 'susi'), true);
  T.eq(PM.storage.hasPick('u1', 'jeongsi'), false);
});

T.test('같은 찜을 두 번 넣어도 하나만 남는다', function () {
  PM.storage._reset();
  PM.storage.addPick('u1', 'susi');
  PM.storage.addPick('u1', 'susi');
  T.eq(PM.storage.getPicks().length, 1);
});

T.test('찜을 제거한다', function () {
  PM.storage._reset();
  PM.storage.addPick('u1', 'susi');
  PM.storage.addPick('u2', 'susi');
  PM.storage.removePick('u1', 'susi');
  T.eq(PM.storage.getPicks(), [{ schoolId: 'u2', trackId: 'susi' }]);
});

T.test('찜은 새로고침 후에도 남는다(직렬화 왕복)', function () {
  PM.storage._reset();
  PM.storage.addPick('u1', 'susi');
  PM.storage._reloadFromDisk();
  T.eq(PM.storage.getPicks(), [{ schoolId: 'u1', trackId: 'susi' }]);
});

T.test('메모를 저장하고 읽는다', function () {
  PM.storage._reset();
  T.eq(PM.storage.getMemo('u1'), '');
  PM.storage.setMemo('u1', '지정곡 확인 필요');
  T.eq(PM.storage.getMemo('u1'), '지정곡 확인 필요');
});

T.test('저장소가 깨져 있어도 빈 목록으로 동작한다', function () {
  PM.storage._reset();
  PM.storage._writeRaw(PM.storage.KEY, '{{{ 깨진 JSON');
  PM.storage._reloadFromDisk();
  T.eq(PM.storage.getPicks(), []);
});

T.test('getPicks()가 반환한 배열을 수정해도 내부 상태가 손상되지 않는다', function () {
  PM.storage._reset();
  PM.storage.addPick('u1', 'susi');
  var snapshot = PM.storage.getPicks();
  snapshot[0].schoolId = 'x';
  snapshot[0].trackId = 'x';
  snapshot.push({ schoolId: 'z', trackId: 'z' });
  T.eq(PM.storage.getPicks(), [{ schoolId: 'u1', trackId: 'susi' }]);
  T.eq(PM.storage.hasPick('u1', 'susi'), true);
});

T.test('localStorage 접근이 예외를 던져도 메모리 폴백으로 동작한다', function () {
  var owner = window;
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'localStorage')) {
    owner = Object.getPrototypeOf(owner);
  }
  T.assert(owner, 'localStorage 속성을 소유한 객체를 찾지 못함');
  var original = Object.getOwnPropertyDescriptor(owner, 'localStorage');
  try {
    Object.defineProperty(owner, 'localStorage', {
      configurable: true,
      get: function () { throw new Error('localStorage 차단됨(테스트)'); }
    });
    T.throws(function () { window.localStorage.getItem('x'); },
      'localStorage 접근이 예외를 던지지 않음 — 테스트가 폴백 경로를 실제로 타지 못함');

    PM.storage._reset();
    PM.storage.addPick('u1', 'susi');
    T.eq(PM.storage.getPicks(), [{ schoolId: 'u1', trackId: 'susi' }]);
    T.eq(PM.storage.hasPick('u1', 'susi'), true);

    PM.storage._reloadFromDisk();
    T.eq(PM.storage.getPicks(), [{ schoolId: 'u1', trackId: 'susi' }]);
  } finally {
    Object.defineProperty(owner, 'localStorage', original);
  }
  PM.storage._reset();
});
