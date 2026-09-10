T.test('T.eq는 같은 값을 통과시킨다', function () {
  T.eq({ a: 1 }, { a: 1 });
});

T.test('T.eq는 다른 값에서 예외를 던진다', function () {
  T.throws(function () { T.eq(1, 2); });
});

T.test('PM 네임스페이스가 존재한다', function () {
  T.assert(typeof window.PM === 'object', 'PM이 객체여야 함');
});
