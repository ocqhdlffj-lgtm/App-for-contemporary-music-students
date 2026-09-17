function fakeBundle(version, ids) {
  return {
    dataVersion: version,
    schools: ids.map(function (id) {
      return {
        id: id, name: id + '대학교', type: '4년제', region: '서울',
        deptName: '실용음악과', admissionsUrl: 'https://x.ac.kr', guideUrl: null,
        tracks: [{
          id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
          quota: null, schedule: null, ratio: null,
          practical: null, competition: [],
          verification: { level: '미확인', checkedAt: '2026-09-10', source: null }
        }],
        prepPoints: []
      };
    })
  };
}

function okFetch(bundle) {
  return function () {
    return Promise.resolve({ ok: true, json: function () { return Promise.resolve(bundle); } });
  };
}

function failFetch() {
  return function () { return Promise.reject(new Error('network down')); };
}

T.test('file:// 에서는 원격을 시도하지 않고 스냅샷을 쓴다', function (done) {
  var called = false;
  PM.data.load({
    protocol: 'file:',
    fetchFn: function () { called = true; return failFetch()(); },
    readCache: function () { return null; },
    writeCache: function () {},
    snapshot: fakeBundle('2026-09-10', ['a'])
  }).then(function (r) {
    T.eq(called, false, 'fetch를 호출하면 안 됨');
    T.eq(r.source, 'snapshot');
    T.eq(r.schools.length, 1);
    done();
  }).catch(done);
});

T.test('http에서 원격 성공 시 remote를 쓰고 캐시에 저장한다', function (done) {
  var saved = null;
  PM.data.load({
    protocol: 'https:',
    fetchFn: okFetch(fakeBundle('2026-09-20', ['a', 'b'])),
    readCache: function () { return null; },
    writeCache: function (v) { saved = v; },
    snapshot: fakeBundle('2026-09-10', ['a'])
  }).then(function (r) {
    T.eq(r.source, 'remote');
    T.eq(r.dataVersion, '2026-09-20');
    T.eq(r.schools.length, 2);
    T.assert(saved && saved.dataVersion === '2026-09-20', '캐시에 저장되어야 함');
    done();
  }).catch(done);
});

T.test('원격 실패 시 캐시를 쓴다', function (done) {
  PM.data.load({
    protocol: 'https:',
    fetchFn: failFetch(),
    readCache: function () { return fakeBundle('2026-09-15', ['a', 'b', 'c']); },
    writeCache: function () {},
    snapshot: fakeBundle('2026-09-10', ['a'])
  }).then(function (r) {
    T.eq(r.source, 'cache');
    T.eq(r.schools.length, 3);
    done();
  }).catch(done);
});

T.test('원격도 캐시도 없으면 스냅샷을 쓴다', function (done) {
  PM.data.load({
    protocol: 'https:',
    fetchFn: failFetch(),
    readCache: function () { return null; },
    writeCache: function () {},
    snapshot: fakeBundle('2026-09-10', ['a'])
  }).then(function (r) {
    T.eq(r.source, 'snapshot');
    done();
  }).catch(done);
});

T.test('스키마 위반 학교는 버리고 나머지는 살린다', function (done) {
  var b = fakeBundle('2026-09-10', ['a', 'b']);
  delete b.schools[0].name;            // 깨진 레코드
  PM.data.load({
    protocol: 'file:',
    fetchFn: failFetch(),
    readCache: function () { return null; },
    writeCache: function () {},
    snapshot: b
  }).then(function (r) {
    T.eq(r.schools.length, 1);
    T.eq(r.schools[0].id, 'b');
    done();
  }).catch(done);
});

T.test('캐시가 비어있지 않아도 전부 스키마 위반이면 스냅샷으로 폴백한다', function (done) {
  var badCache = fakeBundle('2026-09-15', ['a', 'b', 'c']);
  badCache.schools.forEach(function (s) { delete s.name; });   // 전부 깨진 레코드
  PM.data.load({
    protocol: 'https:',
    fetchFn: failFetch(),
    readCache: function () { return badCache; },
    writeCache: function () {},
    snapshot: fakeBundle('2026-09-10', ['a'])
  }).then(function (r) {
    T.eq(r.source, 'snapshot');
    T.eq(r.schools.length, 1);
    T.eq(r.schools[0].id, 'a');
    done();
  }).catch(done);
});
