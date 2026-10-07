(function (LA) {
  // 연예인 사진 측정 도구의 로직. 화면은 measure-celebs.html.
  // 위키미디어 커먼즈 API(origin=*로 CORS 허용)에서 자유 라이선스 사진을
  // 찾고, 사용자 사진과 같은 방식(features.fromLandmarks)으로 잰다.

  var API = 'https://commons.wikimedia.org/w/api.php';
  var MAX_USED = 5;       // 한 명당 평균 낼 최대 사진 수
  var SEARCH_LIMIT = 20;  // 검색 후보 수
  var MIN_SIDE = 400;     // 원본이 이보다 작으면 제외

  // 커먼즈에는 자유 라이선스만 올라오지만, 상업 이용을 막는 NC·ND 계열은
  // 혹시 있어도 쓰지 않는다.
  function licenseOk(name) {
    if (!name) return false;
    if (/\b(NC|ND)\b|non-?commercial|no derivs/i.test(name)) return false;
    return /^(CC[ -]?BY|CC[ -]?0|Public domain|PD|GFDL)/i.test(name);
  }

  function stripTags(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  }

  // API 응답 → 후보 목록(검색 순서 유지). 순수 함수라 테스트할 수 있다.
  function parseCandidates(json) {
    var pages = (json && json.query && json.query.pages) || {};
    return Object.keys(pages).map(function (k) { return pages[k]; })
      .sort(function (a, b) { return (a.index || 0) - (b.index || 0); })
      .map(function (p) {
        var ii = p.imageinfo && p.imageinfo[0];
        if (!ii) return null;
        var meta = ii.extmetadata || {};
        var license = meta.LicenseShortName && meta.LicenseShortName.value;
        if (!/^image\/(jpeg|png)$/.test(ii.mime || '')) return null;
        if (Math.min(ii.width || 0, ii.height || 0) < MIN_SIDE) return null;
        if (!licenseOk(license)) return null;
        return {
          title: p.title, thumb: ii.thumburl || ii.url, page: ii.descriptionurl,
          author: stripTags(meta.Artist && meta.Artist.value), license: license
        };
      }).filter(Boolean);
  }

  function searchUrl(celeb) {
    var q = '"' + celeb.en + '" filetype:bitmap';
    return API + '?action=query&format=json&origin=*&generator=search&gsrnamespace=6' +
      '&gsrlimit=' + SEARCH_LIMIT + '&gsrsearch=' + encodeURIComponent(q) +
      '&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=800' +
      '&iiextmetadatafilter=LicenseShortName|Artist';
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('이미지를 불러오지 못함')); };
      img.src = url;
    });
  }

  // 한 장 측정. 통과 조건은 사용자 사진 분석과 같다: 정면·똑바로·무표정에 가깝게,
  // 얼굴은 한 명만. 통과하지 못하면 이유를 돌려준다.
  function measureOne(cand, detector) {
    return loadImage(cand.thumb).then(function (img) {
      var c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return detector.detect(c);
    }).then(function (found) {
      if (!found) return { ok: false, reason: '얼굴 없음' };
      if (found.count > 1) return { ok: false, reason: '여러 명' };
      var a = LA.features.fromLandmarks(found.landmarks, found.width, found.height, found.blendshapes);
      if (a.warnings.length || a.unreliable.length) return { ok: false, reason: '정면·무표정 아님' };
      return { ok: true, vector: a.vector };
    }).catch(function (e) { return { ok: false, reason: e.message || '실패' }; });
  }

  function average(vectors) {
    var out = {};
    LA.features.DIMS.forEach(function (d) {
      out[d] = Math.round(1000 * vectors.reduce(function (s, v) { return s + v[d]; }, 0) / vectors.length) / 1000;
    });
    return out;
  }

  // results: [{ celeb, cands: [{..., ok, vector, checked}] }] → 내보낼 파일 내용
  function buildExport(results) {
    var data = {};
    results.forEach(function (r) {
      var used = r.cands.filter(function (c) { return c.ok && c.checked; });
      if (!used.length) return;
      data[r.celeb.id] = {
        vector: average(used.map(function (c) { return c.vector; })),
        n: used.length,
        sources: used.map(function (c) { return { page: c.page, author: c.author, license: c.license }; })
      };
    });
    return '// tools/measure-celebs.html이 만든 파일. 사진은 저장하지 않고 측정값과 출처만 담았다.\n' +
      '// 사진은 위키미디어 커먼즈의 자유 라이선스 파일이며, sources에 저작자·라이선스·원문 주소가 있다.\n' +
      'window.LA = window.LA || {};\nwindow.LA.CELEB_MEASURED = ' + JSON.stringify(data, null, 1) + ';\n';
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function start() {
    var listEl = document.getElementById('list');
    var logEl = document.getElementById('log');
    var startBtn = document.getElementById('start');
    var exportBtn = document.getElementById('export');
    var outEl = document.getElementById('out');
    var results = [];

    function renderCeleb(r) {
      var box = el('div', 'celeb');
      var h = el('h3', null, r.celeb.name + ' (' + r.celeb.en + ')');
      var st = el('span', 'st', '');
      h.appendChild(st);
      box.appendChild(h);
      var cands = el('div', 'cands');
      box.appendChild(cands);
      r.ui = { st: st, cands: cands };
      listEl.appendChild(box);
    }

    function renderCands(r) {
      var used = 0;
      r.cands.forEach(function (c) { if (c.ok) used++; });
      r.ui.st.textContent = used ? used + '장 측정 성공' : '쓸 수 있는 사진 없음';
      r.ui.cands.textContent = '';
      r.cands.forEach(function (c) {
        if (!c.tried) return;
        var d = el('div', 'cand' + (c.ok ? '' : ' bad'));
        var img = el('img');
        img.src = c.thumb; img.alt = c.title; img.loading = 'lazy';
        d.appendChild(img);
        if (c.ok) {
          var lab = el('label');
          var cb = document.createElement('input');
          cb.type = 'checkbox'; cb.checked = c.checked;
          cb.addEventListener('change', function () { c.checked = cb.checked; });
          lab.appendChild(cb);
          lab.appendChild(el('span', null, '본인 사진 · ' + c.license));
          d.appendChild(lab);
        } else {
          d.appendChild(el('div', null, '제외: ' + c.reason));
        }
        r.ui.cands.appendChild(d);
      });
    }

    function processCeleb(r) {
      r.ui.st.textContent = '검색 중…';
      return fetch(searchUrl(r.celeb)).then(function (res) { return res.json(); }).then(function (json) {
        r.cands = parseCandidates(json);
        var i = 0, okCount = 0;
        function next() {
          if (i >= r.cands.length || okCount >= MAX_USED) return Promise.resolve();
          var c = r.cands[i++];
          r.ui.st.textContent = '측정 중… (' + i + '/' + r.cands.length + ')';
          return measureOne(c, LA.detector).then(function (m) {
            c.tried = true; c.ok = m.ok; c.reason = m.reason; c.vector = m.vector; c.checked = m.ok;
            if (m.ok) okCount++;
            return next();
          });
        }
        return next();
      }).catch(function () {
        r.cands = r.cands || [];
        r.ui.st.textContent = '검색 실패(인터넷 연결 확인)';
      }).then(function () { if (r.cands.length || r.ui.st.textContent.indexOf('실패') < 0) renderCands(r); });
    }

    startBtn.addEventListener('click', function () {
      startBtn.disabled = true;
      listEl.textContent = '';
      results = LA.CELEBS.filter(function (c) { return c.en; }).map(function (c) { return { celeb: c, cands: [] }; });
      results.forEach(renderCeleb);
      logEl.textContent = 'AI 모델을 준비하는 중… (처음 한 번 약 15MB)';
      LA.detector.load().then(function () {
        var i = 0;
        function next() {
          if (i >= results.length) return Promise.resolve();
          var r = results[i++];
          logEl.textContent = '(' + i + '/' + results.length + ') ' + r.celeb.name;
          return processCeleb(r).then(next);
        }
        return next();
      }).then(function () {
        logEl.textContent = '완료! 사진을 확인하고 "결과 내보내기"를 누르세요.';
        exportBtn.disabled = false;
        startBtn.disabled = false;
      }, function () {
        logEl.textContent = 'AI 모델을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.';
        startBtn.disabled = false;
      });
    });

    exportBtn.addEventListener('click', function () {
      var text = buildExport(results);
      outEl.value = text;
      var dl = document.getElementById('dl');
      dl.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
      dl.hidden = false;
      var n = results.filter(function (r) { return r.cands.some(function (c) { return c.ok && c.checked; }); }).length;
      logEl.textContent = n + '명의 측정값을 내보냈어요.';
    });

    document.getElementById('copy').addEventListener('click', function () {
      outEl.select();
      if (navigator.clipboard) navigator.clipboard.writeText(outEl.value).catch(function () { document.execCommand('copy'); });
      else document.execCommand('copy');
    });
  }

  LA.measureTool = {
    start: start, parseCandidates: parseCandidates, buildExport: buildExport, licenseOk: licenseOk,
    average: average, searchUrl: searchUrl, measureOne: measureOne
  };
})(window.LA);
