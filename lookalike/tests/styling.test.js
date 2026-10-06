(function () {
  var S = LA.styling;
  var P = LA.profile;

  T.test('퍼스널컬러: 전부 모름이면 null, 동률이면 neutral', function () {
    T.eq(S.personalColorOf({}), null);
    T.eq(S.personalColorOf({ vein: 'skip', metal: 'skip', sun: 'skip' }), null);
    T.eq(S.personalColorOf({ vein: 'warm', metal: 'warm', sun: 'cool' }), 'warm');
    T.eq(S.personalColorOf({ vein: 'cool', metal: 'skip', sun: 'skip' }), 'cool');
    T.eq(S.personalColorOf({ vein: 'warm', metal: 'cool', sun: 'skip' }), 'neutral');
  });

  T.test('모든 얼굴형 × 성별에 헤어 추천·피할 스타일이 있다', function () {
    Object.keys(P.FACE_SHAPES).forEach(function (shape) {
      ['F', 'M'].forEach(function (g) {
        var h = S.HAIR[g][shape];
        T.assert(h && h.why && h.best.length && h.avoid.length, g + '/' + shape);
      });
    });
  });

  T.test('모든 얼굴형 × 동물상 × 성별 조합에서 빈 칸 없이 추천이 나온다', function () {
    Object.keys(P.FACE_SHAPES).forEach(function (shape) {
      P.ANIMAL_KEYS.forEach(function (animal) {
        ['F', 'M'].forEach(function (g) {
          var v = P.vectorFromTags({ faceShape: shape }, P.ANIMALS[animal].proto);
          var r = S.recommend({ vector: v, gender: g, personalColor: null, celeb: null });
          var all = [].concat(r.hair.best, r.hair.avoid, r.face.items, r.fashion.items,
            r.accessories.items, [r.fashion.keyword, r.colors.tip]);
          all.forEach(function (t) {
            T.assert(typeof t === 'string' && t.length > 0 && t.indexOf('undefined') < 0,
              shape + '/' + animal + '/' + g + ': ' + t);
          });
        });
      });
    });
  });

  T.test('여성은 메이크업, 남성은 그루밍 가이드', function () {
    var v = P.ANIMALS.dog.proto;
    T.eq(S.recommend({ vector: v, gender: 'F' }).face.title, '메이크업');
    T.eq(S.recommend({ vector: v, gender: 'M' }).face.title, '그루밍');
  });

  T.test('닮은꼴 연예인의 무드가 "OO처럼 연출하기"에 반영된다', function () {
    var c = LA.CELEBS[0];
    var r = S.recommend({ vector: P.ANIMALS.dog.proto, gender: 'F', celeb: c });
    T.assert(r.celebLook.title.indexOf(c.name) === 0, r.celebLook.title);
    T.assert(r.celebLook.items.length >= 3, 'tips');
    T.eq(S.recommend({ vector: P.ANIMALS.dog.proto, gender: 'F', celeb: null }).celebLook, null);
  });

  T.test('퍼스널컬러를 모르면 뉴트럴 팔레트 + 미진단 표시', function () {
    var v = P.ANIMALS.cat.proto;
    var none = S.recommend({ vector: v, gender: 'F', personalColor: null });
    T.eq(none.colors.diagnosed, false);
    T.eq(none.colors.title, '뉴트럴 베스트 컬러');
    var warm = S.recommend({ vector: v, gender: 'F', personalColor: 'warm' });
    T.eq(warm.colors.diagnosed, true);
    T.eq(warm.colors.title, '웜톤 베스트 컬러');
  });

  T.test('둥근 얼굴 헤어 추천은 세로 라인(정수리 볼륨) 공식을 따른다', function () {
    var v = P.vectorFromTags({ faceShape: 'round' }, P.ANIMALS.rabbit.proto);
    var r = S.recommend({ vector: v, gender: 'F' });
    T.eq(r.faceShape, 'round');
    T.assert(r.hair.best.some(function (t) { return t.indexOf('정수리 볼륨') >= 0; }), 'best');
  });
})();
