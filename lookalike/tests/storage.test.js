(function () {
  var S = LA.storage;

  function reset() {
    try { localStorage.removeItem(S.KEY); localStorage.removeItem(S.SETTINGS_KEY); } catch (e) {}
  }

  T.test('결과 저장·불러오기 왕복', function () {
    reset();
    T.eq(S.load(), null);
    var r = { vector: LA.profile.ANIMALS.fox.proto, gender: 'F', scope: 'same', personalColor: 'cool', warnings: [] };
    S.save(r);
    T.eq(S.load(), r);
    reset();
  });

  T.test('깨진 저장값은 무시한다', function () {
    reset();
    localStorage.setItem(S.KEY, '{not json');
    T.eq(S.load(), null);
    localStorage.setItem(S.KEY, JSON.stringify({ vector: { faceLength: 'x' } }));
    T.eq(S.load(), null);
    reset();
  });

  T.test('설정 기본값은 여성 스타일·같은 성별, 이상한 값은 기본값으로', function () {
    reset();
    T.eq(S.loadSettings(), { gender: 'F', scope: 'same' });
    S.saveSettings({ gender: 'M', scope: 'all' });
    T.eq(S.loadSettings(), { gender: 'M', scope: 'all' });
    localStorage.setItem(S.SETTINGS_KEY, JSON.stringify({ gender: '?', scope: 1 }));
    T.eq(S.loadSettings(), { gender: 'F', scope: 'same' });
    reset();
  });
})();
