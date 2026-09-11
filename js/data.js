(function (PM) {
  // 2단계에서 실제 GitHub Pages 주소로 교체한다.
  var REMOTE_URL = 'https://example.invalid/pm-admissions/data/index.json';
  var CACHE_KEY = 'pm.data.v1';

  function defaultReadCache() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function defaultWriteCache(bundle) {
    try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(bundle)); }
    catch (e) { /* 용량 초과·차단 시 무시 — 스냅샷 폴백이 있다 */ }
  }

  function sanitize(bundle) {
    var schools = [];
    ((bundle && bundle.schools) || []).forEach(function (s) {
      var r = PM.schema.validateSchool(s);
      if (r.ok) {
        schools.push(s);
      } else if (window.console && console.warn) {
        console.warn('[pm-admissions] 데이터 건너뜀:',
          (s && s.id) || '(id 없음)', r.errors);
      }
    });
    return {
      schools: schools,
      dataVersion: (bundle && bundle.dataVersion) || '알 수 없음'
    };
  }

  function load(deps) {
    var d = deps || {};
    var protocol = d.protocol || window.location.protocol;
    var fetchFn = d.fetchFn || (window.fetch ? window.fetch.bind(window) : null);
    var readCache = d.readCache || defaultReadCache;
    var writeCache = d.writeCache || defaultWriteCache;
    var snapshot = d.snapshot || PM.SNAPSHOT || { dataVersion: '알 수 없음', schools: [] };

    function fromCacheOrSnapshot() {
      var cached = readCache();
      if (cached && cached.schools && cached.schools.length) {
        var c = sanitize(cached);
        c.source = 'cache';
        return c;
      }
      var s = sanitize(snapshot);
      s.source = 'snapshot';
      return s;
    }

    // file:// 에서는 fetch가 CORS로 차단된다 — 시도조차 하지 않는다.
    var canRemote = (protocol === 'http:' || protocol === 'https:') && !!fetchFn;
    if (!canRemote) {
      return Promise.resolve(fromCacheOrSnapshot());
    }

    return fetchFn(REMOTE_URL)
      .then(function (res) {
        if (!res || !res.ok) throw new Error('HTTP 실패');
        return res.json();
      })
      .then(function (bundle) {
        var r = sanitize(bundle);
        if (r.schools.length === 0) throw new Error('원격 데이터가 비어 있음');
        writeCache(bundle);
        r.source = 'remote';
        return r;
      })
      .catch(function () {
        return fromCacheOrSnapshot();
      });
  }

  PM.data = {
    REMOTE_URL: REMOTE_URL,
    CACHE_KEY: CACHE_KEY,
    load: load
  };
})(window.PM);
