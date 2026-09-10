# 실용음악과 입시 요강 앱 — 1단계(데이터 + 웹앱) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 전국 실용음악과 요강을 검색·필터·비교하고 실기고사일 충돌을 경고하는 모바일 우선 웹앱을, 빌드 도구 없이 브라우저에서 바로 열리는 형태로 만든다.

**Architecture:** 순수 정적 파일. 로직(스키마 검증·필터·충돌계산)을 DOM을 모르는 순수 함수로 먼저 만들고 테스트한 뒤, 그 위에 화면을 얹는다. 데이터는 학교당 JSON 1파일이 정본이고, bash 스크립트가 이를 `snapshot.js` 하나로 묶는다. 앱은 http(s)에서는 원격 JSON을 우선 fetch하고, 실패하거나 `file://`이면 캐시 → 스냅샷 순으로 폴백한다.

**Tech Stack:** HTML + CSS + 바닐라 JS(**클래식 스크립트**), bash + awk(스냅샷 빌드), git. npm/Node/Python/번들러 없음.

**Spec:** `docs/superpowers/specs/2026-09-10-practical-music-admissions-design.md`

## Global Constraints

이 절의 규칙은 **모든 태스크의 요구사항에 암묵적으로 포함된다.**

- **ES 모듈 금지, `import`/`export` 금지.** Chrome은 `file://`에서 모듈 스크립트를 CORS로 차단한다. 모든 JS는 클래식 `<script src>`로 로드하고 `window.PM` 네임스페이스에 붙인다.
- **초기 로드 경로에서 `fetch` 의존 금지.** 같은 이유로 `file://`에서는 fetch가 차단된다. `PM.data.load()`는 `location.protocol`이 `http:`/`https:`일 때만 원격을 시도한다.
- **npm 패키지·CDN·외부 폰트 사용 금지.** 의존성 0개를 유지한다.
- **추측값 금지.** 확인되지 않은 값은 반드시 `null`. 화면에는 `미확인`으로 표시한다. 요강에서 확인하지 못한 숫자를 채워 넣지 않는다.
- **요강 PDF 재배포 금지.** `guideUrl`은 링크로만 사용하고 파일을 저장소에 넣지 않는다.
- **면책 문구 상시 노출:** `요강은 변경될 수 있습니다. 지원 전 반드시 입학처 원문을 확인하세요.`
- **하단 광고 자리 50px 예약** — 2단계 AdMob 배너용. 1단계에서는 빈 영역.
- **모바일 우선.** 기준 해상도 360×640에서 가로 스크롤이 없어야 한다.
- **확인 등급 값은 정확히 3개:** `미확인`, `부분확인`, `확인됨`.
- **날짜 형식은 `YYYY-MM-DD` 문자열.** `Date` 객체로 파싱하지 않는다(시간대 오차 방지). 비교는 문자열 비교로 한다.
- 프로젝트 루트: `C:\Users\kki09\Desktop\클로드\pm-admissions`
- 모든 명령은 Git Bash 기준. 브라우저 확인은 Chrome.

## 파일 구조

| 파일 | 책임 |
|---|---|
| `index.html` | 앱 셸, 스크립트 로드 순서 |
| `css/style.css` | 전체 스타일 (모바일 우선) |
| `js/ns.js` | `window.PM` 네임스페이스 생성 |
| `js/schema.js` | 학교 레코드 검증, 학교 확인등급 산출 |
| `js/conflict.js` | 실기고사일 충돌 계산 (순수) |
| `js/filter.js` | 검색·필터 (순수) |
| `js/storage.js` | 찜·메모 localStorage |
| `js/data.js` | 데이터 로드 (원격→캐시→스냅샷) |
| `js/ui/components.js` | 배지·면책바 등 공용 조각 |
| `js/ui/list.js` | 화면1 학교 목록 |
| `js/ui/filterbar.js` | 화면1 필터 UI |
| `js/ui/detail.js` | 화면2 학교 상세 |
| `js/ui/mylist.js` | 화면3 내 지원 리스트 + 충돌 경고 |
| `js/ui/compare.js` | 화면4 비교 |
| `js/app.js` | 부트스트랩, 화면 전환, 상태 |
| `data/schools/<id>.json` | 학교 1곳 정본 데이터 |
| `data/snapshot.js` | 생성물 — 전체 학교 번들 |
| `scripts/build-snapshot.sh` | JSON → snapshot.js 빌드 |
| `tests/runner.js` | 미니 테스트 러너 |
| `tests/*.test.js` | 테스트 |
| `tests/index.html` | 테스트 실행 페이지 |

**스크립트 로드 순서(중요):** `ns.js` → `data/snapshot.js` → `schema.js` → `conflict.js` → `filter.js` → `storage.js` → `data.js` → `ui/*.js` → `app.js`

---

### Task 1: 프로젝트 뼈대와 테스트 러너

**Files:**
- Create: `js/ns.js`
- Create: `tests/runner.js`
- Create: `tests/index.html`
- Create: `tests/runner.test.js`
- Create: `.gitignore`

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces:
  - `window.PM` — 전역 네임스페이스 객체
  - `window.T.test(name, fn)` — 테스트 등록
  - `window.T.assert(cond, msg)` — 참 단언
  - `window.T.eq(actual, expected, msg)` — JSON 직렬화 비교
  - `window.T.throws(fn, msg)` — 예외 발생 단언
  - `window.T.run(containerEl)` — 전체 실행 후 DOM에 결과 렌더, `{passed, failed}` 반환

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/runner.test.js`:

```js
T.test('T.eq는 같은 값을 통과시킨다', function () {
  T.eq({ a: 1 }, { a: 1 });
});

T.test('T.eq는 다른 값에서 예외를 던진다', function () {
  T.throws(function () { T.eq(1, 2); });
});

T.test('PM 네임스페이스가 존재한다', function () {
  T.assert(typeof window.PM === 'object', 'PM이 객체여야 함');
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`을 아직 만들지 않았으므로 먼저 만든다.

`tests/index.html`:

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>pm-admissions 테스트</title>
  <style>
    body { font: 14px/1.6 system-ui, sans-serif; margin: 16px; }
    .pass { color: #17692f; }
    .fail { color: #b3261e; white-space: pre-wrap; }
    #summary { font-weight: 700; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>pm-admissions 테스트</h1>
  <div id="summary"></div>
  <div id="results"></div>

  <script src="../js/ns.js"></script>
  <script src="runner.js"></script>
  <script src="runner.test.js"></script>
  <script>
    T.run(document.getElementById('results'), document.getElementById('summary'));
  </script>
</body>
</html>
```

Run: Chrome에서 `tests/index.html`을 연다.

```bash
start "" "C:\Users\kki09\Desktop\클로드\pm-admissions\tests\index.html"
```

Expected: FAIL — 콘솔에 `T is not defined` (runner.js가 비어 있음)

- [ ] **Step 3: 최소 구현**

`js/ns.js`:

```js
window.PM = window.PM || {};
```

`tests/runner.js`:

```js
(function () {
  var tests = [];

  function stringify(v) {
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }

  window.T = {
    test: function (name, fn) {
      tests.push({ name: name, fn: fn });
    },

    assert: function (cond, msg) {
      if (!cond) throw new Error(msg || 'assertion failed');
    },

    eq: function (actual, expected, msg) {
      var a = stringify(actual);
      var b = stringify(expected);
      if (a !== b) {
        throw new Error((msg ? msg + '\n' : '') +
          '  expected: ' + b + '\n' +
          '  actual:   ' + a);
      }
    },

    throws: function (fn, msg) {
      var threw = false;
      try { fn(); } catch (e) { threw = true; }
      if (!threw) throw new Error(msg || '예외가 발생해야 함');
    },

    run: function (resultsEl, summaryEl) {
      var passed = 0, failed = 0;
      tests.forEach(function (t) {
        var div = document.createElement('div');
        try {
          t.fn();
          passed++;
          div.className = 'pass';
          div.textContent = 'PASS  ' + t.name;
        } catch (e) {
          failed++;
          div.className = 'fail';
          div.textContent = 'FAIL  ' + t.name + '\n' + e.message;
        }
        resultsEl.appendChild(div);
      });
      if (summaryEl) {
        summaryEl.textContent = passed + ' passed, ' + failed + ' failed';
        summaryEl.className = failed ? 'fail' : 'pass';
      }
      return { passed: passed, failed: failed };
    }
  };
})();
```

`.gitignore`:

```
Thumbs.db
desktop.ini
.DS_Store
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `3 passed, 0 failed`

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/ns.js tests/runner.js tests/index.html tests/runner.test.js .gitignore
git commit -m "test: 브라우저 테스트 러너와 PM 네임스페이스 추가"
```

---

### Task 2: 스키마 검증기

이 프로젝트에서 **가장 중요한 코드**다. 100곳을 점진적으로 채우는 동안 잘못된 데이터가 앱에 들어가는 것을 막는 유일한 관문이다.

**Files:**
- Create: `js/schema.js`
- Create: `tests/schema.test.js`
- Modify: `tests/index.html` (스크립트 태그 2줄 추가)

**Interfaces:**
- Consumes: `window.PM` (Task 1)
- Produces:
  - `PM.schema.LEVELS` — `['미확인', '부분확인', '확인됨']` (낮은 순)
  - `PM.schema.validateSchool(school)` → `{ ok: boolean, errors: string[] }`
  - `PM.schema.schoolLevel(school)` → `'미확인'|'부분확인'|'확인됨'` (전형 중 최저)

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/schema.test.js`:

```js
function validSchool() {
  return {
    id: 'test-univ',
    name: '테스트대학교',
    type: '전문대',
    region: '경기',
    deptName: '실용음악과',
    admissionsUrl: 'https://example.ac.kr',
    guideUrl: null,
    tracks: [{
      id: 'susi',
      season: '수시',
      name: '실기우수자전형',
      majors: ['보컬'],
      quota: { '보컬': 12 },
      schedule: { apply: ['2026-09-08', '2026-09-11'], practical: ['2026-10-11'], announce: '2026-11-14' },
      ratio: { '실기': 80, '내신': 20, '수능': 0 },
      minCsat: null,
      practical: {
        songCount: 2, songType: '자유곡', designatedSongs: [],
        accompaniment: 'MR', durationMin: 5, sheetMusicRequired: true, notes: ''
      },
      competition: [],
      verification: { level: '확인됨', checkedAt: '2026-09-10', source: 'https://example.ac.kr/guide' }
    }],
    prepPoints: []
  };
}

T.test('올바른 학교 레코드는 통과한다', function () {
  T.eq(PM.schema.validateSchool(validSchool()).ok, true);
});

T.test('필수 필드가 없으면 실패한다', function () {
  var s = validSchool();
  delete s.name;
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('name') >= 0, 'name 오류가 보고되어야 함');
});

T.test('type은 4년제 또는 전문대만 허용한다', function () {
  var s = validSchool();
  s.type = '대학원';
  T.eq(PM.schema.validateSchool(s).ok, false);
});

T.test('반영비율 합계가 100이 아니면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].ratio = { '실기': 80, '내신': 30, '수능': 0 };
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('100') >= 0, '합계 오류가 보고되어야 함');
});

T.test('날짜 형식이 틀리면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].schedule.practical = ['2026/10/11'];
  T.eq(PM.schema.validateSchool(s).ok, false);
});

T.test('접수 시작이 종료보다 늦으면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].schedule.apply = ['2026-09-11', '2026-09-08'];
  T.eq(PM.schema.validateSchool(s).ok, false);
});

T.test('확인됨인데 필수 항목이 null이면 실패한다', function () {
  var s = validSchool();
  s.tracks[0].ratio = null;
  var r = PM.schema.validateSchool(s);
  T.eq(r.ok, false);
  T.assert(r.errors.join(' ').indexOf('확인됨') >= 0, '거짓 확신이 보고되어야 함');
});

T.test('미확인이면 항목이 null이어도 통과한다', function () {
  var s = validSchool();
  s.tracks[0].ratio = null;
  s.tracks[0].schedule = null;
  s.tracks[0].practical = null;
  s.tracks[0].quota = null;
  s.tracks[0].verification.level = '미확인';
  T.eq(PM.schema.validateSchool(s).ok, true);
});

T.test('학교 등급은 전형 중 최저를 따른다', function () {
  var s = validSchool();
  s.tracks.push(JSON.parse(JSON.stringify(s.tracks[0])));
  s.tracks[1].id = 'jeongsi';
  s.tracks[1].verification.level = '미확인';
  T.eq(PM.schema.schoolLevel(s), '미확인');
});

T.test('전형이 없으면 학교 등급은 미확인이다', function () {
  var s = validSchool();
  s.tracks = [];
  T.eq(PM.schema.schoolLevel(s), '미확인');
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`의 `<script src="runner.test.js"></script>` 앞에 추가:

```html
  <script src="../js/schema.js"></script>
```

그 뒤에 추가:

```html
  <script src="schema.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.schema is undefined`

- [ ] **Step 3: 최소 구현**

`js/schema.js`:

```js
(function (PM) {
  var LEVELS = ['미확인', '부분확인', '확인됨'];
  var TYPES = ['4년제', '전문대'];
  var SEASONS = ['수시', '정시'];
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  // 확인됨 등급이 주장하려면 반드시 값이 있어야 하는 항목
  var REQUIRED_WHEN_CONFIRMED = ['quota', 'schedule', 'ratio', 'practical'];

  function isDate(v) { return typeof v === 'string' && DATE_RE.test(v); }

  function validateTrack(t, i, errors) {
    var at = 'tracks[' + i + ']';

    if (!t || typeof t !== 'object') { errors.push(at + ': 객체가 아님'); return; }
    ['id', 'season', 'name'].forEach(function (k) {
      if (!t[k]) errors.push(at + '.' + k + ': 필수');
    });
    if (t.season && SEASONS.indexOf(t.season) < 0) {
      errors.push(at + '.season: 수시/정시만 허용 (' + t.season + ')');
    }
    if (!Array.isArray(t.majors)) errors.push(at + '.majors: 배열이어야 함');

    var v = t.verification;
    if (!v || LEVELS.indexOf(v.level) < 0) {
      errors.push(at + '.verification.level: ' + LEVELS.join('/') + ' 중 하나여야 함');
      return;
    }
    if (!isDate(v.checkedAt)) errors.push(at + '.verification.checkedAt: YYYY-MM-DD');

    if (t.ratio != null) {
      var sum = 0;
      Object.keys(t.ratio).forEach(function (k) { sum += Number(t.ratio[k]) || 0; });
      if (sum !== 100) errors.push(at + '.ratio: 합계가 100이어야 함 (현재 ' + sum + ')');
    }

    if (t.schedule != null) {
      var s = t.schedule;
      if (s.apply != null) {
        if (!Array.isArray(s.apply) || s.apply.length !== 2 || !s.apply.every(isDate)) {
          errors.push(at + '.schedule.apply: [YYYY-MM-DD, YYYY-MM-DD]');
        } else if (s.apply[0] > s.apply[1]) {
          errors.push(at + '.schedule.apply: 시작이 종료보다 늦음');
        }
      }
      if (s.practical != null) {
        if (!Array.isArray(s.practical) || !s.practical.every(isDate)) {
          errors.push(at + '.schedule.practical: YYYY-MM-DD 배열');
        }
      }
      if (s.announce != null && !isDate(s.announce)) {
        errors.push(at + '.schedule.announce: YYYY-MM-DD');
      }
    }

    // 거짓 확신 차단
    if (v.level === '확인됨') {
      REQUIRED_WHEN_CONFIRMED.forEach(function (k) {
        if (t[k] == null) {
          errors.push(at + ': 확인됨인데 ' + k + '이(가) null — 등급을 낮추거나 값을 채울 것');
        }
      });
      if (!v.source) errors.push(at + ': 확인됨인데 verification.source 없음');
    }
  }

  function validateSchool(school) {
    var errors = [];

    if (!school || typeof school !== 'object') {
      return { ok: false, errors: ['school: 객체가 아님'] };
    }
    ['id', 'name', 'type', 'region', 'deptName', 'admissionsUrl'].forEach(function (k) {
      if (!school[k]) errors.push(k + ': 필수');
    });
    if (school.type && TYPES.indexOf(school.type) < 0) {
      errors.push('type: ' + TYPES.join('/') + '만 허용 (' + school.type + ')');
    }
    if (!Array.isArray(school.tracks)) {
      errors.push('tracks: 배열이어야 함');
    } else {
      school.tracks.forEach(function (t, i) { validateTrack(t, i, errors); });
    }

    return { ok: errors.length === 0, errors: errors };
  }

  function schoolLevel(school) {
    if (!school || !Array.isArray(school.tracks) || school.tracks.length === 0) {
      return '미확인';
    }
    var lowest = LEVELS.length - 1;
    school.tracks.forEach(function (t) {
      var idx = t && t.verification ? LEVELS.indexOf(t.verification.level) : -1;
      if (idx < 0) idx = 0;
      if (idx < lowest) lowest = idx;
    });
    return LEVELS[lowest];
  }

  PM.schema = {
    LEVELS: LEVELS,
    validateSchool: validateSchool,
    schoolLevel: schoolLevel
  };
})(window.PM);
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `13 passed, 0 failed`

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/schema.js tests/schema.test.js tests/index.html
git commit -m "feat: 학교 레코드 스키마 검증기 — 확인됨 등급의 거짓 확신 차단"
```

---

### Task 3: 실기고사일 충돌 계산

앱의 핵심 차별 기능. 순수 함수라 DOM 없이 테스트한다.

**Files:**
- Create: `js/conflict.js`
- Create: `tests/conflict.test.js`
- Modify: `tests/index.html` (스크립트 태그 2줄 추가)

**Interfaces:**
- Consumes: `window.PM` (Task 1)
- Produces:
  - `PM.conflict.entriesFrom(schools, picks)` → `Entry[]`
    - `picks`: `[{schoolId, trackId}]`
    - `Entry`: `{schoolId, trackId, schoolName, trackName, dates: string[]}`
  - `PM.conflict.find(entries)` → `{ conflicts: Conflict[], unknown: Entry[] }`
    - `Conflict`: `{date: string, items: Entry[]}` — 같은 날 2건 이상, 날짜 오름차순
    - `unknown`: 실기일이 비어 있는 항목

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/conflict.test.js`:

```js
function entry(id, dates) {
  return { schoolId: id, trackId: 'susi', schoolName: id, trackName: '수시', dates: dates };
}

T.test('겹치는 날이 없으면 충돌이 없다', function () {
  var r = PM.conflict.find([entry('a', ['2026-10-11']), entry('b', ['2026-10-12'])]);
  T.eq(r.conflicts, []);
});

T.test('같은 날 2건이면 충돌 1건을 반환한다', function () {
  var r = PM.conflict.find([entry('a', ['2026-10-11']), entry('b', ['2026-10-11'])]);
  T.eq(r.conflicts.length, 1);
  T.eq(r.conflicts[0].date, '2026-10-11');
  T.eq(r.conflicts[0].items.length, 2);
});

T.test('같은 날 3건이면 한 충돌에 3건이 묶인다', function () {
  var r = PM.conflict.find([
    entry('a', ['2026-10-11']), entry('b', ['2026-10-11']), entry('c', ['2026-10-11'])
  ]);
  T.eq(r.conflicts.length, 1);
  T.eq(r.conflicts[0].items.length, 3);
});

T.test('실기일이 여러 날인 전형은 각 날짜로 모두 계산한다', function () {
  var r = PM.conflict.find([entry('a', ['2026-10-11', '2026-10-18']), entry('b', ['2026-10-18'])]);
  T.eq(r.conflicts.length, 1);
  T.eq(r.conflicts[0].date, '2026-10-18');
});

T.test('충돌은 날짜 오름차순으로 정렬된다', function () {
  var r = PM.conflict.find([
    entry('a', ['2026-11-02']), entry('b', ['2026-11-02']),
    entry('c', ['2026-10-11']), entry('d', ['2026-10-11'])
  ]);
  T.eq(r.conflicts.map(function (c) { return c.date; }), ['2026-10-11', '2026-11-02']);
});

T.test('날짜 미상 항목은 unknown으로 분리되고 충돌에 안 들어간다', function () {
  var r = PM.conflict.find([entry('a', []), entry('b', ['2026-10-11'])]);
  T.eq(r.conflicts, []);
  T.eq(r.unknown.length, 1);
  T.eq(r.unknown[0].schoolId, 'a');
});

T.test('같은 학교의 같은 전형이 중복 선택돼도 충돌로 세지 않는다', function () {
  var r = PM.conflict.find([entry('a', ['2026-10-11']), entry('a', ['2026-10-11'])]);
  T.eq(r.conflicts, []);
});

T.test('entriesFrom은 선택한 전형만 엔트리로 만든다', function () {
  var schools = [{
    id: 'u1', name: '대학1',
    tracks: [
      { id: 'susi', name: '수시전형', schedule: { practical: ['2026-10-11'] } },
      { id: 'jeongsi', name: '정시전형', schedule: { practical: ['2027-01-05'] } }
    ]
  }];
  var e = PM.conflict.entriesFrom(schools, [{ schoolId: 'u1', trackId: 'jeongsi' }]);
  T.eq(e.length, 1);
  T.eq(e[0].dates, ['2027-01-05']);
  T.eq(e[0].schoolName, '대학1');
});

T.test('entriesFrom은 schedule이 null이면 dates를 빈 배열로 만든다', function () {
  var schools = [{ id: 'u1', name: '대학1', tracks: [{ id: 'susi', name: '수시', schedule: null }] }];
  var e = PM.conflict.entriesFrom(schools, [{ schoolId: 'u1', trackId: 'susi' }]);
  T.eq(e[0].dates, []);
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 추가 — `../js/schema.js` 다음 줄에:

```html
  <script src="../js/conflict.js"></script>
```

`schema.test.js` 다음 줄에:

```html
  <script src="conflict.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.conflict is undefined`

- [ ] **Step 3: 최소 구현**

`js/conflict.js`:

```js
(function (PM) {

  function entriesFrom(schools, picks) {
    var byId = {};
    (schools || []).forEach(function (s) { byId[s.id] = s; });

    var out = [];
    (picks || []).forEach(function (p) {
      var school = byId[p.schoolId];
      if (!school) return;
      var track = (school.tracks || []).filter(function (t) { return t.id === p.trackId; })[0];
      if (!track) return;

      var dates = (track.schedule && Array.isArray(track.schedule.practical))
        ? track.schedule.practical.slice()
        : [];

      out.push({
        schoolId: school.id,
        trackId: track.id,
        schoolName: school.name,
        trackName: track.name,
        dates: dates
      });
    });
    return out;
  }

  function find(entries) {
    var byDate = {};
    var unknown = [];

    (entries || []).forEach(function (e) {
      if (!e.dates || e.dates.length === 0) { unknown.push(e); return; }
      e.dates.forEach(function (d) {
        if (!byDate[d]) byDate[d] = [];
        // 같은 학교+전형이 중복 선택된 경우 한 번만
        var dup = byDate[d].some(function (x) {
          return x.schoolId === e.schoolId && x.trackId === e.trackId;
        });
        if (!dup) byDate[d].push(e);
      });
    });

    var conflicts = Object.keys(byDate)
      .filter(function (d) { return byDate[d].length >= 2; })
      .sort()
      .map(function (d) { return { date: d, items: byDate[d] }; });

    return { conflicts: conflicts, unknown: unknown };
  }

  PM.conflict = { entriesFrom: entriesFrom, find: find };
})(window.PM);
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `22 passed, 0 failed`

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/conflict.js tests/conflict.test.js tests/index.html
git commit -m "feat: 실기고사일 충돌 계산 — 같은 날 2건 이상 경고"
```

---

### Task 4: 검색·필터

**Files:**
- Create: `js/filter.js`
- Create: `tests/filter.test.js`
- Modify: `tests/index.html` (스크립트 태그 2줄 추가)

**Interfaces:**
- Consumes: `window.PM` (Task 1)
- Produces:
  - `PM.filter.DEFAULTS` → 빈 조건 객체
  - `PM.filter.apply(schools, criteria)` → `School[]`
    - 조건에 맞는 **전형만 남긴 학교 사본**을 반환. 남는 전형이 0개면 학교를 제외
    - `criteria`: `{q, type, region, major, season, songType, noMinCsat, practicalOnly}`
    - `noMinCsat`/`practicalOnly`가 `true`면 값이 `null`인 전형은 **제외**한다
  - `PM.filter.quotaOf(track, major)` → `number|null`

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/filter.test.js`:

```js
function school(over) {
  var s = {
    id: 'u1', name: '가나대학교', type: '4년제', region: '서울',
    deptName: '실용음악과',
    tracks: [{
      id: 'susi', season: '수시', name: '실기전형',
      majors: ['보컬', '기타'],
      quota: { '보컬': 10, '기타': 5 },
      ratio: { '실기': 100, '내신': 0, '수능': 0 },
      minCsat: null,
      practical: { songType: '자유곡' },
      verification: { level: '확인됨' }
    }]
  };
  return Object.assign(s, over || {});
}

T.test('조건이 비면 전부 반환한다', function () {
  var r = PM.filter.apply([school()], PM.filter.DEFAULTS);
  T.eq(r.length, 1);
});

T.test('학교명으로 검색한다', function () {
  T.eq(PM.filter.apply([school()], { q: '가나' }).length, 1);
  T.eq(PM.filter.apply([school()], { q: '없는대' }).length, 0);
});

T.test('4년제/전문대로 거른다', function () {
  T.eq(PM.filter.apply([school()], { type: '전문대' }).length, 0);
  T.eq(PM.filter.apply([school()], { type: '4년제' }).length, 1);
});

T.test('지역으로 거른다', function () {
  T.eq(PM.filter.apply([school()], { region: '경기' }).length, 0);
});

T.test('전공으로 거르면 그 전공을 뽑는 전형만 남는다', function () {
  var s = school();
  s.tracks.push({
    id: 'jeongsi', season: '정시', name: '정시전형', majors: ['작곡'],
    quota: { '작곡': 4 }, ratio: { '실기': 100, '내신': 0, '수능': 0 },
    minCsat: null, practical: { songType: '자유곡' },
    verification: { level: '확인됨' }
  });
  var r = PM.filter.apply([s], { major: '보컬' });
  T.eq(r.length, 1);
  T.eq(r[0].tracks.length, 1);
  T.eq(r[0].tracks[0].id, 'susi');
});

T.test('수시/정시로 거른다', function () {
  T.eq(PM.filter.apply([school()], { season: '정시' }).length, 0);
  T.eq(PM.filter.apply([school()], { season: '수시' }).length, 1);
});

T.test('실기 100% 조건은 ratio.실기가 100인 전형만 남긴다', function () {
  T.eq(PM.filter.apply([school()], { practicalOnly: true }).length, 1);
  var s = school();
  s.tracks[0].ratio = { '실기': 80, '내신': 20, '수능': 0 };
  T.eq(PM.filter.apply([s], { practicalOnly: true }).length, 0);
});

T.test('실기 100% 조건에서 ratio가 null인 전형은 제외된다', function () {
  var s = school();
  s.tracks[0].ratio = null;
  s.tracks[0].verification.level = '부분확인';
  T.eq(PM.filter.apply([s], { practicalOnly: true }).length, 0);
});

T.test('수능최저 없음 조건에서 minCsat이 undefined인 전형은 제외된다', function () {
  var s = school();
  delete s.tracks[0].minCsat;
  s.tracks[0].verification.level = '부분확인';
  T.eq(PM.filter.apply([s], { noMinCsat: true }).length, 0);
});

T.test('수능최저 없음 조건은 minCsat이 null인 전형만 남긴다', function () {
  T.eq(PM.filter.apply([school()], { noMinCsat: true }).length, 1);
  var s = school();
  s.tracks[0].minCsat = '국영수 중 2개 합 7';
  T.eq(PM.filter.apply([s], { noMinCsat: true }).length, 0);
});

T.test('실기 곡 유형으로 거른다', function () {
  T.eq(PM.filter.apply([school()], { songType: '지정곡' }).length, 0);
  T.eq(PM.filter.apply([school()], { songType: '자유곡' }).length, 1);
});

T.test('조건 여러 개는 AND로 동작한다', function () {
  T.eq(PM.filter.apply([school()], { type: '4년제', major: '보컬', practicalOnly: true }).length, 1);
  T.eq(PM.filter.apply([school()], { type: '4년제', major: '작곡' }).length, 0);
});

T.test('원본 학교 객체를 변경하지 않는다', function () {
  var s = school();
  PM.filter.apply([s], { major: '보컬' });
  T.eq(s.tracks.length, 1);
});

T.test('quotaOf는 전공 모집인원을 반환하고 없으면 null이다', function () {
  var t = school().tracks[0];
  T.eq(PM.filter.quotaOf(t, '보컬'), 10);
  T.eq(PM.filter.quotaOf(t, '드럼'), null);
  T.eq(PM.filter.quotaOf({ quota: null }, '보컬'), null);
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 `../js/conflict.js` 다음 줄:

```html
  <script src="../js/filter.js"></script>
```

`conflict.test.js` 다음 줄:

```html
  <script src="filter.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.filter is undefined`

- [ ] **Step 3: 최소 구현**

`js/filter.js`:

```js
(function (PM) {

  var DEFAULTS = {
    q: '', type: '', region: '', major: '',
    season: '', songType: '',
    noMinCsat: false, practicalOnly: false
  };

  function quotaOf(track, major) {
    if (!track || !track.quota) return null;
    var v = track.quota[major];
    return (typeof v === 'number') ? v : null;
  }

  function trackMatches(track, c) {
    if (c.major && (track.majors || []).indexOf(c.major) < 0) return false;
    if (c.season && track.season !== c.season) return false;

    if (c.songType) {
      if (!track.practical || track.practical.songType !== c.songType) return false;
    }

    // 미확인(null) 값을 '조건에 맞음'으로 보여주면 오지원으로 이어진다 → 제외
    if (c.practicalOnly) {
      if (!track.ratio || track.ratio['실기'] !== 100) return false;
    }
    if (c.noMinCsat) {
      if (!('minCsat' in track)) return false;
      if (track.minCsat !== null) return false;
    }
    return true;
  }

  function apply(schools, criteria) {
    var c = Object.assign({}, DEFAULTS, criteria || {});
    var q = (c.q || '').trim();

    var out = [];
    (schools || []).forEach(function (s) {
      if (c.type && s.type !== c.type) return;
      if (c.region && s.region !== c.region) return;
      if (q && (s.name || '').indexOf(q) < 0 && (s.deptName || '').indexOf(q) < 0) return;

      var tracks = (s.tracks || []).filter(function (t) { return trackMatches(t, c); });
      if (tracks.length === 0) return;

      var copy = Object.assign({}, s);
      copy.tracks = tracks;
      out.push(copy);
    });
    return out;
  }

  PM.filter = { DEFAULTS: DEFAULTS, apply: apply, quotaOf: quotaOf };
})(window.PM);
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `38 passed, 0 failed`

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/filter.js tests/filter.test.js tests/index.html
git commit -m "feat: 검색·필터 — 미확인 값은 조건 충족으로 취급하지 않음"
```

---

### Task 5: 찜·메모 저장

**Files:**
- Create: `js/storage.js`
- Create: `tests/storage.test.js`
- Modify: `tests/index.html` (스크립트 태그 2줄 추가)

**Interfaces:**
- Consumes: `window.PM` (Task 1)
- Produces:
  - `PM.storage.KEY` → `'pm.picks.v1'`, `PM.storage.MEMO_KEY` → `'pm.memos.v1'`
  - `PM.storage.getPicks()` → `[{schoolId, trackId}]`
  - `PM.storage.addPick(schoolId, trackId)` → `Pick[]` (중복 무시)
  - `PM.storage.removePick(schoolId, trackId)` → `Pick[]`
  - `PM.storage.hasPick(schoolId, trackId)` → `boolean`
  - `PM.storage.getMemo(schoolId)` → `string`
  - `PM.storage.setMemo(schoolId, text)` → `void`
  - `PM.storage._reset()` — 테스트용, 전체 삭제

**참고:** `file://`에서 localStorage가 차단될 수 있으므로 모든 접근을 try/catch로 감싸고 메모리 폴백을 둔다.

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/storage.test.js`:

```js
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
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 `../js/filter.js` 다음 줄:

```html
  <script src="../js/storage.js"></script>
```

`filter.test.js` 다음 줄:

```html
  <script src="storage.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.storage is undefined`

- [ ] **Step 3: 최소 구현**

`js/storage.js`:

```js
(function (PM) {
  var KEY = 'pm.picks.v1';
  var MEMO_KEY = 'pm.memos.v1';

  var memFallback = {};   // localStorage 접근 불가 시
  var picks = [];
  var memos = {};

  function readRaw(k) {
    try { return window.localStorage.getItem(k); }
    catch (e) { return (k in memFallback) ? memFallback[k] : null; }
  }

  function writeRaw(k, v) {
    try { window.localStorage.setItem(k, v); }
    catch (e) { memFallback[k] = v; }
  }

  function parseOr(raw, fallback) {
    if (raw == null) return fallback;
    try {
      var v = JSON.parse(raw);
      return (v && typeof v === 'object') ? v : fallback;
    } catch (e) { return fallback; }
  }

  function reloadFromDisk() {
    var p = parseOr(readRaw(KEY), []);
    picks = Array.isArray(p) ? p : [];
    var m = parseOr(readRaw(MEMO_KEY), {});
    memos = (m && !Array.isArray(m)) ? m : {};
  }

  function savePicks() { writeRaw(KEY, JSON.stringify(picks)); }
  function saveMemos() { writeRaw(MEMO_KEY, JSON.stringify(memos)); }

  function indexOfPick(schoolId, trackId) {
    for (var i = 0; i < picks.length; i++) {
      if (picks[i].schoolId === schoolId && picks[i].trackId === trackId) return i;
    }
    return -1;
  }

  reloadFromDisk();

  PM.storage = {
    KEY: KEY,
    MEMO_KEY: MEMO_KEY,

    getPicks: function () { return picks.slice(); },

    hasPick: function (schoolId, trackId) {
      return indexOfPick(schoolId, trackId) >= 0;
    },

    addPick: function (schoolId, trackId) {
      if (indexOfPick(schoolId, trackId) < 0) {
        picks.push({ schoolId: schoolId, trackId: trackId });
        savePicks();
      }
      return picks.slice();
    },

    removePick: function (schoolId, trackId) {
      var i = indexOfPick(schoolId, trackId);
      if (i >= 0) { picks.splice(i, 1); savePicks(); }
      return picks.slice();
    },

    getMemo: function (schoolId) {
      return typeof memos[schoolId] === 'string' ? memos[schoolId] : '';
    },

    setMemo: function (schoolId, text) {
      memos[schoolId] = String(text == null ? '' : text);
      saveMemos();
    },

    _reset: function () {
      picks = []; memos = {};
      savePicks(); saveMemos();
    },
    _reloadFromDisk: reloadFromDisk,
    _writeRaw: writeRaw
  };
})(window.PM);
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `45 passed, 0 failed`

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/storage.js tests/storage.test.js tests/index.html
git commit -m "feat: 찜·메모 localStorage 저장 (접근 불가 시 메모리 폴백)"
```

---

### Task 6: 스냅샷 빌드 스크립트와 시드 데이터

앞으로 학교 JSON을 계속 추가할 것이므로, **먼저 파이프라인부터 만든다.**

**Files:**
- Create: `scripts/build-snapshot.sh`
- Create: `data/schools/.gitkeep`
- Create: `data/schools/dongah-arts.json`
- Create: `data/schools/howon.json`
- Create: `data/snapshot.js` (생성물 — 커밋한다. `file://`에서 fetch가 막히므로 앱이 이 파일에 의존한다)

**Interfaces:**
- Consumes: 없음
- Produces:
  - `window.PM.SNAPSHOT` → `{dataVersion: string, schools: School[]}`
  - `bash scripts/build-snapshot.sh` → `data/snapshot.js` 재생성

**중요:** 두 학교 JSON은 **실제 요강에서 확인한 값만** 넣는다. 확인 못 한 항목은 `null`로 두고 `verification.level`을 `부분확인` 또는 `미확인`으로 낮춘다. 이 태스크의 목적은 파이프라인 검증이지 데이터 완성이 아니다.

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/snapshot.test.js`:

```js
T.test('스냅샷이 로드되어 있다', function () {
  T.assert(PM.SNAPSHOT && typeof PM.SNAPSHOT === 'object', 'PM.SNAPSHOT 필요');
  T.assert(/^\d{4}-\d{2}-\d{2}$/.test(PM.SNAPSHOT.dataVersion), 'dataVersion은 YYYY-MM-DD');
  T.assert(Array.isArray(PM.SNAPSHOT.schools), 'schools는 배열');
});

T.test('스냅샷에 학교가 1곳 이상 있다', function () {
  T.assert(PM.SNAPSHOT.schools.length >= 1, '학교가 있어야 함');
});

T.test('스냅샷의 모든 학교가 스키마 검증을 통과한다', function () {
  var bad = [];
  PM.SNAPSHOT.schools.forEach(function (s) {
    var r = PM.schema.validateSchool(s);
    if (!r.ok) bad.push((s && s.id ? s.id : '?') + ': ' + r.errors.join('; '));
  });
  T.eq(bad, [], '검증 실패한 학교:\n' + bad.join('\n'));
});

T.test('학교 id가 중복되지 않는다', function () {
  var seen = {}, dup = [];
  PM.SNAPSHOT.schools.forEach(function (s) {
    if (seen[s.id]) dup.push(s.id);
    seen[s.id] = true;
  });
  T.eq(dup, []);
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`의 `../js/ns.js` 다음 줄에 추가:

```html
  <script src="../data/snapshot.js"></script>
```

`storage.test.js` 다음 줄:

```html
  <script src="snapshot.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.SNAPSHOT 필요` (snapshot.js 없음)

- [ ] **Step 3: 최소 구현**

`scripts/build-snapshot.sh`:

```bash
#!/usr/bin/env bash
# data/schools/*.json 을 data/snapshot.js 하나로 묶는다.
# file:// 에서는 fetch가 차단되므로 앱은 이 번들을 로드한다.
set -euo pipefail

cd "$(dirname "$0")/.."

OUT="data/snapshot.js"
VERSION="$(date +%Y-%m-%d)"
COUNT=0

{
  echo "// GENERATED by scripts/build-snapshot.sh — 직접 편집하지 말 것"
  echo "// 정본은 data/schools/*.json 입니다."
  echo "window.PM = window.PM || {};"
  echo "window.PM.SNAPSHOT = {"
  echo "  \"dataVersion\": \"$VERSION\","
  echo "  \"schools\": ["

  first=1
  for f in data/schools/*.json; do
    [ -e "$f" ] || continue
    if [ "$first" -eq 0 ]; then echo ","; fi
    first=0
    cat "$f"
    COUNT=$((COUNT + 1))
  done

  echo ""
  echo "  ]"
  echo "};"
} > "$OUT"

echo "wrote $OUT ($COUNT schools, version $VERSION)"
```

`data/schools/.gitkeep`: 빈 파일

`data/schools/dongah-arts.json` — **아래는 형식 견본이다. 실제 값은 동아방송예술대학교 입학처 요강에서 확인해 채우고, 확인하지 못한 항목은 `null`로 두고 등급을 낮춘다:**

```json
{
  "id": "dongah-arts",
  "name": "동아방송예술대학교",
  "type": "전문대",
  "region": "경기",
  "deptName": "실용음악과",
  "admissionsUrl": "https://ipsi.dima.ac.kr",
  "guideUrl": null,
  "tracks": [
    {
      "id": "susi-1",
      "season": "수시",
      "name": "수시 1차",
      "majors": ["보컬", "기타", "베이스", "드럼", "건반", "작곡"],
      "quota": null,
      "schedule": null,
      "ratio": null,
      "minCsat": null,
      "practical": null,
      "competition": [],
      "verification": {
        "level": "미확인",
        "checkedAt": "2026-09-10",
        "source": null
      }
    }
  ],
  "prepPoints": []
}
```

`data/schools/howon.json` — 같은 형식으로 호원대학교 항목을 만든다:

```json
{
  "id": "howon",
  "name": "호원대학교",
  "type": "4년제",
  "region": "전북",
  "deptName": "실용음악학부",
  "admissionsUrl": "https://ipsi.howon.ac.kr",
  "guideUrl": null,
  "tracks": [
    {
      "id": "susi",
      "season": "수시",
      "name": "실기위주전형",
      "majors": ["보컬", "기타", "베이스", "드럼", "건반", "작곡"],
      "quota": null,
      "schedule": null,
      "ratio": null,
      "minCsat": null,
      "practical": null,
      "competition": [],
      "verification": {
        "level": "미확인",
        "checkedAt": "2026-09-10",
        "source": null
      }
    }
  ],
  "prepPoints": []
}
```

빌드 실행:

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
bash scripts/build-snapshot.sh
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `49 passed, 0 failed`

생성물도 눈으로 확인:

```bash
head -20 data/snapshot.js
```

Expected: `window.PM.SNAPSHOT = {` 로 시작하고 학교 2곳이 들어 있음

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add scripts/build-snapshot.sh data/ tests/snapshot.test.js tests/index.html
git commit -m "feat: 학교 JSON을 snapshot.js로 묶는 빌드 스크립트와 시드 데이터 2곳"
```

---

### Task 7: 데이터 로더 (원격 → 캐시 → 스냅샷)

**Files:**
- Create: `js/data.js`
- Create: `tests/data.test.js`
- Modify: `tests/index.html` (스크립트 태그 2줄 추가)

**Interfaces:**
- Consumes: `PM.SNAPSHOT` (Task 6), `PM.schema.validateSchool` (Task 2)
- Produces:
  - `PM.data.REMOTE_URL` → 원격 index.json 주소 (2단계에서 실제 GitHub Pages 주소로 교체)
  - `PM.data.CACHE_KEY` → `'pm.data.v1'`
  - `PM.data.load(deps)` → `Promise<{schools, dataVersion, source}>`
    - `source`: `'remote' | 'cache' | 'snapshot'`
    - `deps`(테스트 주입용, 선택): `{fetchFn, protocol, readCache, writeCache, snapshot}`
    - **스키마 검증에 실패한 학교는 버리고 콘솔 경고.** 앱 전체를 죽이지 않는다

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/data.test.js`:

```js
function fakeBundle(version, ids) {
  return {
    dataVersion: version,
    schools: ids.map(function (id) {
      return {
        id: id, name: id + '대학교', type: '4년제', region: '서울',
        deptName: '실용음악과', admissionsUrl: 'https://x.ac.kr', guideUrl: null,
        tracks: [{
          id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
          quota: null, schedule: null, ratio: null, minCsat: null,
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
```

**러너에 비동기 지원을 추가해야 한다.** `tests/runner.js`의 `run`을 아래로 교체:

```js
    run: function (resultsEl, summaryEl) {
      var passed = 0, failed = 0, i = 0;

      function report(t, err) {
        var div = document.createElement('div');
        if (err) {
          failed++;
          div.className = 'fail';
          div.textContent = 'FAIL  ' + t.name + '\n' + (err.message || String(err));
        } else {
          passed++;
          div.className = 'pass';
          div.textContent = 'PASS  ' + t.name;
        }
        resultsEl.appendChild(div);
      }

      function finish() {
        if (summaryEl) {
          summaryEl.textContent = passed + ' passed, ' + failed + ' failed';
          summaryEl.className = failed ? 'fail' : 'pass';
        }
      }

      function next() {
        if (i >= tests.length) { finish(); return; }
        var t = tests[i++];
        var settled = false;

        function done(err) {
          if (settled) return;
          settled = true;
          report(t, err);
          next();
        }

        try {
          if (t.fn.length > 0) {
            var timer = setTimeout(function () { done(new Error('타임아웃 2000ms')); }, 2000);
            t.fn(function (err) { clearTimeout(timer); done(err); });
          } else {
            t.fn();
            done(null);
          }
        } catch (e) { done(e); }
      }

      next();
      return { passed: passed, failed: failed };
    }
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 `../js/storage.js` 다음 줄:

```html
  <script src="../js/data.js"></script>
```

`snapshot.test.js` 다음 줄:

```html
  <script src="data.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.data is undefined`

- [ ] **Step 3: 최소 구현**

`js/data.js`:

```js
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
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `54 passed, 0 failed`

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/data.js tests/data.test.js tests/runner.js tests/index.html
git commit -m "feat: 데이터 로더 — 원격→캐시→스냅샷 폴백, 깨진 레코드는 건너뜀"
```

---

### Task 8: 앱 셸과 학교 목록 화면

렌더 함수는 **DOM 요소를 반환하는 순수 함수**로 만들어 테스트 가능하게 한다.

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/ui/components.js`
- Create: `js/ui/list.js`
- Create: `js/app.js`
- Create: `tests/ui-list.test.js`
- Modify: `tests/index.html`

**Interfaces:**
- Consumes: `PM.schema.schoolLevel` (T2), `PM.filter.quotaOf` (T4), `PM.data.load` (T7)
- Produces:
  - `PM.ui.badge(text, kind)` → `HTMLElement` (`kind`: `'level-확인됨'|'level-부분확인'|'level-미확인'|'type'`)
  - `PM.ui.levelBadge(school)` → `HTMLElement`
  - `PM.ui.disclaimerBar()` → `HTMLElement`
  - `PM.ui.progressText(schools)` → `string` — 예: `'세부 확인 3 / 112개교'`
  - `PM.ui.list.render(schools, opts)` → `HTMLElement`
    - `opts`: `{major: string, onSelect: function(schoolId)}`
  - `PM.app.start()` → 부트스트랩

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/ui-list.test.js`:

```js
function listSchool(id, name, level, quota) {
  return {
    id: id, name: name, type: '4년제', region: '서울', deptName: '실용음악과',
    admissionsUrl: 'https://x.ac.kr',
    tracks: [{
      id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
      quota: quota, schedule: { practical: ['2026-10-11'] },
      ratio: null, minCsat: null, practical: null, competition: [],
      verification: { level: level, checkedAt: '2026-09-10', source: null }
    }],
    prepPoints: []
  };
}

T.test('학교 수만큼 카드를 그린다', function () {
  var el = PM.ui.list.render([listSchool('a', '가대', '미확인', null),
                              listSchool('b', '나대', '미확인', null)], {});
  T.eq(el.querySelectorAll('.card').length, 2);
});

T.test('카드에 학교명과 지역이 들어간다', function () {
  var el = PM.ui.list.render([listSchool('a', '가나대학교', '미확인', null)], {});
  T.assert(el.textContent.indexOf('가나대학교') >= 0, '학교명 표시');
  T.assert(el.textContent.indexOf('서울') >= 0, '지역 표시');
});

T.test('확인 등급 배지를 표시한다', function () {
  var el = PM.ui.list.render([listSchool('a', '가대', '부분확인', null)], {});
  T.assert(el.querySelector('.badge.level-부분확인'), '부분확인 배지 필요');
});

T.test('전공을 고르면 그 전공 모집인원을 보여준다', function () {
  var el = PM.ui.list.render([listSchool('a', '가대', '확인됨', { '보컬': 12 })],
                             { major: '보컬' });
  T.assert(el.textContent.indexOf('12') >= 0, '모집인원 12 표시');
});

T.test('모집인원이 null이면 미확인으로 표시한다', function () {
  var el = PM.ui.list.render([listSchool('a', '가대', '미확인', null)], { major: '보컬' });
  T.assert(el.textContent.indexOf('미확인') >= 0, '미확인 표시');
});

T.test('결과가 없으면 빈 상태 문구를 보여준다', function () {
  var el = PM.ui.list.render([], {});
  T.assert(el.textContent.indexOf('조건에 맞는 학교가 없습니다') >= 0, '빈 상태 문구');
});

T.test('카드를 누르면 onSelect에 학교 id가 전달된다', function () {
  var got = null;
  var el = PM.ui.list.render([listSchool('a', '가대', '미확인', null)],
                             { onSelect: function (id) { got = id; } });
  el.querySelector('.card').click();
  T.eq(got, 'a');
});

T.test('진행률 문구는 확인됨 학교 수를 센다', function () {
  var s = [listSchool('a', '가대', '확인됨', { '보컬': 1 }),
           listSchool('b', '나대', '미확인', null)];
  T.eq(PM.ui.progressText(s), '세부 확인 1 / 2개교');
});

T.test('면책 문구를 그린다', function () {
  T.assert(PM.ui.disclaimerBar().textContent.indexOf('입학처 원문을 확인') >= 0);
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 `../js/data.js` 다음 줄:

```html
  <script src="../js/ui/components.js"></script>
  <script src="../js/ui/list.js"></script>
```

`data.test.js` 다음 줄:

```html
  <script src="ui-list.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.ui is undefined`

- [ ] **Step 3: 최소 구현**

`js/ui/components.js`:

```js
(function (PM) {
  PM.ui = PM.ui || {};

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function badge(text, kind) {
    return el('span', 'badge ' + (kind || ''), text);
  }

  function levelBadge(school) {
    var lv = PM.schema.schoolLevel(school);
    return badge(lv, 'level-' + lv);
  }

  function disclaimerBar() {
    return el('div', 'disclaimer',
      '요강은 변경될 수 있습니다. 지원 전 반드시 입학처 원문을 확인하세요.');
  }

  function progressText(schools) {
    var total = (schools || []).length;
    var done = 0;
    (schools || []).forEach(function (s) {
      if (PM.schema.schoolLevel(s) === '확인됨') done++;
    });
    return '세부 확인 ' + done + ' / ' + total + '개교';
  }

  PM.ui.el = el;
  PM.ui.badge = badge;
  PM.ui.levelBadge = levelBadge;
  PM.ui.disclaimerBar = disclaimerBar;
  PM.ui.progressText = progressText;
})(window.PM);
```

`js/ui/list.js`:

```js
(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  function practicalDates(school) {
    var out = [];
    (school.tracks || []).forEach(function (t) {
      if (t.schedule && Array.isArray(t.schedule.practical)) {
        t.schedule.practical.forEach(function (d) {
          if (out.indexOf(d) < 0) out.push(d);
        });
      }
    });
    return out.sort();
  }

  function quotaText(school, major) {
    if (!major) return null;
    var total = null;
    (school.tracks || []).forEach(function (t) {
      var q = PM.filter.quotaOf(t, major);
      if (q != null) total = (total || 0) + q;
    });
    return total == null ? '미확인' : (total + '명');
  }

  function card(school, opts) {
    var c = el('div', 'card');
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');

    var head = el('div', 'card-head');
    head.appendChild(el('span', 'card-name', school.name));
    head.appendChild(PM.ui.badge(school.type, 'type'));
    head.appendChild(PM.ui.levelBadge(school));
    c.appendChild(head);

    var meta = el('div', 'card-meta');
    meta.appendChild(el('span', null, school.region));
    meta.appendChild(el('span', null, school.deptName));

    var q = quotaText(school, opts.major);
    if (q) meta.appendChild(el('span', null, opts.major + ' ' + q));

    var dates = practicalDates(school);
    meta.appendChild(el('span', null,
      dates.length ? '실기 ' + dates.join(', ') : '실기일 미확인'));
    c.appendChild(meta);

    function fire() { if (opts.onSelect) opts.onSelect(school.id); }
    c.addEventListener('click', fire);
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
    });
    return c;
  }

  function render(schools, opts) {
    var o = opts || {};
    var wrap = el('div', 'list');

    if (!schools || schools.length === 0) {
      wrap.appendChild(el('p', 'empty', '조건에 맞는 학교가 없습니다.'));
      return wrap;
    }
    schools.forEach(function (s) { wrap.appendChild(card(s, o)); });
    return wrap;
  }

  PM.ui.list = { render: render };
})(window.PM);
```

`css/style.css`:

```css
:root {
  --bg: #ffffff; --fg: #1b1b1f; --muted: #5f6368;
  --line: #e3e3e7; --accent: #2b5cd9; --warn: #b3261e;
  --ad-h: 50px;
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--fg);
  font: 15px/1.6 system-ui, "Malgun Gothic", sans-serif;
  padding-bottom: calc(var(--ad-h) + 44px);
}
header { padding: 12px 16px; border-bottom: 1px solid var(--line); }
h1 { font-size: 18px; margin: 0; }
#progress { color: var(--muted); font-size: 13px; }
main { padding: 12px 16px; }

.card { border: 1px solid var(--line); border-radius: 10px; padding: 12px; margin-bottom: 10px; cursor: pointer; }
.card:focus { outline: 2px solid var(--accent); }
.card-head { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.card-name { font-weight: 700; }
.card-meta { display: flex; gap: 10px; flex-wrap: wrap; color: var(--muted); font-size: 13px; margin-top: 6px; }

.badge { font-size: 11px; padding: 2px 6px; border-radius: 999px; border: 1px solid var(--line); }
.badge.type { background: #eef2ff; }
.badge.level-확인됨 { background: #e6f4ea; }
.badge.level-부분확인 { background: #fef7e0; }
.badge.level-미확인 { background: #f1f3f4; color: var(--muted); }

.empty { color: var(--muted); text-align: center; padding: 32px 0; }

.disclaimer {
  position: fixed; left: 0; right: 0; bottom: var(--ad-h);
  background: #fff4e5; color: #7a4100; font-size: 12px;
  padding: 8px 16px; border-top: 1px solid var(--line);
}
/* 2단계 AdMob 배너 자리 — 지금은 비워 둔다 */
#ad-slot {
  position: fixed; left: 0; right: 0; bottom: 0;
  height: var(--ad-h); border-top: 1px solid var(--line);
}
```

`index.html`:

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>실용음악과 입시 요강</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <h1>실용음악과 입시 요강</h1>
    <div id="progress"></div>
  </header>
  <main id="screen"></main>
  <div id="ad-slot" aria-hidden="true"></div>

  <script src="js/ns.js"></script>
  <script src="data/snapshot.js"></script>
  <script src="js/schema.js"></script>
  <script src="js/conflict.js"></script>
  <script src="js/filter.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/data.js"></script>
  <script src="js/ui/components.js"></script>
  <script src="js/ui/list.js"></script>
  <script src="js/app.js"></script>
  <script>PM.app.start();</script>
</body>
</html>
```

`js/app.js`:

```js
(function (PM) {
  var state = { schools: [], criteria: {}, dataVersion: '', source: '' };

  function screenEl() { return document.getElementById('screen'); }

  function renderList() {
    var host = screenEl();
    host.textContent = '';
    var shown = PM.filter.apply(state.schools, state.criteria);
    host.appendChild(PM.ui.list.render(shown, {
      major: state.criteria.major || '',
      onSelect: function (id) { console.log('선택:', id); }
    }));
    host.appendChild(PM.ui.disclaimerBar());
    document.getElementById('progress').textContent =
      PM.ui.progressText(state.schools) + ' · 기준일 ' + state.dataVersion;
  }

  function start() {
    PM.data.load().then(function (r) {
      state.schools = r.schools;
      state.dataVersion = r.dataVersion;
      state.source = r.source;
      renderList();
    });
  }

  PM.app = { start: start, _state: state, _renderList: renderList };
})(window.PM);
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `63 passed, 0 failed`

앱도 직접 연다:

```bash
start "" "C:\Users\kki09\Desktop\클로드\pm-admissions\index.html"
```

Expected: 시드 학교 2곳이 카드로 보이고, 하단에 면책 문구가 고정돼 있다. Chrome DevTools의 기기 툴바에서 360×640으로 보아 가로 스크롤이 없어야 한다.

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add index.html css/ js/ui/ js/app.js tests/ui-list.test.js tests/index.html
git commit -m "feat: 앱 셸과 학교 목록 화면 (면책 상시 노출, 광고 자리 예약)"
```

---

### Task 9: 필터 UI

**Files:**
- Create: `js/ui/filterbar.js`
- Create: `tests/ui-filterbar.test.js`
- Modify: `js/app.js`, `index.html`, `tests/index.html`

**Interfaces:**
- Consumes: `PM.filter.DEFAULTS` (T4), `PM.ui.el` (T8)
- Produces:
  - `PM.ui.filterbar.render(schools, criteria, onChange)` → `HTMLElement`
    - `onChange(newCriteria)` — 변경된 **전체 조건 객체**를 넘긴다
  - `PM.ui.filterbar.MAJORS` → `['보컬','기타','베이스','드럼','건반','작곡']`
  - `PM.ui.filterbar.regionsOf(schools)` → `string[]` (중복 제거·정렬)

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/ui-filterbar.test.js`:

```js
function fbSchools() {
  return [
    { id: 'a', name: '가대', type: '4년제', region: '서울', deptName: '실용음악과', tracks: [] },
    { id: 'b', name: '나대', type: '전문대', region: '경기', deptName: '실용음악과', tracks: [] },
    { id: 'c', name: '다대', type: '4년제', region: '서울', deptName: '실용음악과', tracks: [] }
  ];
}

T.test('전공 6종을 노출한다', function () {
  T.eq(PM.ui.filterbar.MAJORS, ['보컬', '기타', '베이스', '드럼', '건반', '작곡']);
});

T.test('지역 목록은 중복 없이 정렬된다', function () {
  T.eq(PM.ui.filterbar.regionsOf(fbSchools()), ['경기', '서울']);
});

T.test('검색어를 입력하면 onChange가 q와 함께 불린다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  var input = el.querySelector('input[name="q"]');
  input.value = '가';
  input.dispatchEvent(new Event('input'));
  T.eq(got.q, '가');
});

T.test('전공을 고르면 onChange가 major와 함께 불린다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  var sel = el.querySelector('select[name="major"]');
  sel.value = '보컬';
  sel.dispatchEvent(new Event('change'));
  T.eq(got.major, '보컬');
});

T.test('수능최저 없음 체크박스가 동작한다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  var cb = el.querySelector('input[name="noMinCsat"]');
  cb.checked = true;
  cb.dispatchEvent(new Event('change'));
  T.eq(got.noMinCsat, true);
});

T.test('실기 100% 체크박스가 동작한다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), PM.filter.DEFAULTS, function (c) { got = c; });
  var cb = el.querySelector('input[name="practicalOnly"]');
  cb.checked = true;
  cb.dispatchEvent(new Event('change'));
  T.eq(got.practicalOnly, true);
});

T.test('기존 조건이 화면에 반영된다', function () {
  var el = PM.ui.filterbar.render(fbSchools(), { major: '드럼', type: '전문대' }, function () {});
  T.eq(el.querySelector('select[name="major"]').value, '드럼');
  T.eq(el.querySelector('select[name="type"]').value, '전문대');
});

T.test('onChange는 기존 조건을 보존한 새 객체를 넘긴다', function () {
  var got = null;
  var el = PM.ui.filterbar.render(fbSchools(), { major: '보컬' }, function (c) { got = c; });
  var cb = el.querySelector('input[name="practicalOnly"]');
  cb.checked = true;
  cb.dispatchEvent(new Event('change'));
  T.eq(got.major, '보컬');
  T.eq(got.practicalOnly, true);
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 `../js/ui/list.js` 다음 줄:

```html
  <script src="../js/ui/filterbar.js"></script>
```

`ui-list.test.js` 다음 줄:

```html
  <script src="ui-filterbar.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.ui.filterbar is undefined`

- [ ] **Step 3: 최소 구현**

`js/ui/filterbar.js`:

```js
(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  var MAJORS = ['보컬', '기타', '베이스', '드럼', '건반', '작곡'];
  var SONG_TYPES = ['자유곡', '지정곡', '혼합'];

  function regionsOf(schools) {
    var seen = {};
    (schools || []).forEach(function (s) { if (s.region) seen[s.region] = true; });
    return Object.keys(seen).sort();
  }

  function select(name, label, options, value, onPick) {
    var wrap = el('label', 'field');
    wrap.appendChild(el('span', 'field-label', label));
    var sel = el('select');
    sel.name = name;
    sel.appendChild(new Option('전체', ''));
    options.forEach(function (o) { sel.appendChild(new Option(o, o)); });
    sel.value = value || '';
    sel.addEventListener('change', function () { onPick(name, sel.value); });
    wrap.appendChild(sel);
    return wrap;
  }

  function checkbox(name, label, checked, onPick) {
    var wrap = el('label', 'check');
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = name;
    cb.checked = !!checked;
    cb.addEventListener('change', function () { onPick(name, cb.checked); });
    wrap.appendChild(cb);
    wrap.appendChild(el('span', null, label));
    return wrap;
  }

  function render(schools, criteria, onChange) {
    var current = Object.assign({}, PM.filter.DEFAULTS, criteria || {});
    var bar = el('div', 'filterbar');

    function pick(name, value) {
      current = Object.assign({}, current);
      current[name] = value;
      if (onChange) onChange(current);
    }

    var q = document.createElement('input');
    q.type = 'search';
    q.name = 'q';
    q.placeholder = '학교명 검색';
    q.className = 'search';
    q.value = current.q || '';
    q.addEventListener('input', function () { pick('q', q.value); });
    bar.appendChild(q);

    var row = el('div', 'filter-row');
    row.appendChild(select('major', '전공', MAJORS, current.major, pick));
    row.appendChild(select('type', '구분', ['4년제', '전문대'], current.type, pick));
    row.appendChild(select('region', '지역', regionsOf(schools), current.region, pick));
    row.appendChild(select('season', '전형', ['수시', '정시'], current.season, pick));
    row.appendChild(select('songType', '실기곡', SONG_TYPES, current.songType, pick));
    bar.appendChild(row);

    var checks = el('div', 'filter-checks');
    checks.appendChild(checkbox('noMinCsat', '수능최저 없음', current.noMinCsat, pick));
    checks.appendChild(checkbox('practicalOnly', '실기 100%', current.practicalOnly, pick));
    bar.appendChild(checks);

    bar.appendChild(el('p', 'filter-note',
      '※ 「수능최저 없음」·「실기 100%」는 확인된 전형만 보여줍니다. 미확인 전형은 제외됩니다.'));

    return bar;
  }

  PM.ui.filterbar = { MAJORS: MAJORS, regionsOf: regionsOf, render: render };
})(window.PM);
```

`css/style.css` 끝에 추가:

```css
.filterbar { margin-bottom: 12px; }
.search { width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 8px; font-size: 15px; }
.filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.field { display: flex; flex-direction: column; font-size: 12px; color: var(--muted); }
.field select { padding: 6px; border: 1px solid var(--line); border-radius: 6px; font-size: 14px; color: var(--fg); }
.filter-checks { display: flex; gap: 14px; margin-top: 8px; }
.check { display: flex; align-items: center; gap: 4px; font-size: 14px; }
.filter-note { font-size: 12px; color: var(--muted); margin: 8px 0 0; }
```

`index.html`의 `js/ui/list.js` 다음 줄에 추가:

```html
  <script src="js/ui/filterbar.js"></script>
```

`js/app.js`의 `renderList`를 아래로 교체:

```js
  function renderList() {
    var host = screenEl();
    host.textContent = '';

    host.appendChild(PM.ui.filterbar.render(state.schools, state.criteria, function (c) {
      state.criteria = c;
      renderList();
    }));

    var shown = PM.filter.apply(state.schools, state.criteria);
    host.appendChild(PM.ui.list.render(shown, {
      major: state.criteria.major || '',
      onSelect: function (id) { console.log('선택:', id); }
    }));
    host.appendChild(PM.ui.disclaimerBar());

    document.getElementById('progress').textContent =
      PM.ui.progressText(state.schools) + ' · 기준일 ' + state.dataVersion;
  }
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `71 passed, 0 failed`

앱에서 직접 확인: `index.html`을 열고 전공/구분을 바꿨을 때 목록이 바뀌는지 본다.

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/ui/filterbar.js css/style.css index.html js/app.js tests/ui-filterbar.test.js tests/index.html
git commit -m "feat: 필터 UI — 전공·구분·지역·전형·실기곡·수능최저·실기100%"
```

---

### Task 10: 학교 상세 화면

**Files:**
- Create: `js/ui/detail.js`
- Create: `tests/ui-detail.test.js`
- Modify: `js/app.js`, `index.html`, `tests/index.html`, `css/style.css`

**Interfaces:**
- Consumes: `PM.ui.el`, `PM.ui.badge` (T8), `PM.storage` (T5)
- Produces:
  - `PM.ui.detail.render(school, opts)` → `HTMLElement`
    - `opts`: `{onBack: fn, onTogglePick: fn(schoolId, trackId)}`
  - `PM.ui.detail.fmt(value, unit)` → `string` — `null`이면 `'미확인'`

**표시 순서(고정):** 실기조건 → 일정 → 반영비율 → 모집인원 → 경쟁률 → prepPoints → 원문 링크

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/ui-detail.test.js`:

```js
function detailSchool(over) {
  var s = {
    id: 'u1', name: '가나대학교', type: '4년제', region: '서울',
    deptName: '실용음악과', admissionsUrl: 'https://x.ac.kr/ipsi', guideUrl: null,
    tracks: [{
      id: 'susi', season: '수시', name: '실기우수자전형',
      majors: ['보컬'], quota: { '보컬': 12 },
      schedule: { apply: ['2026-09-08', '2026-09-11'], practical: ['2026-10-11'], announce: '2026-11-14' },
      ratio: { '실기': 80, '내신': 20, '수능': 0 },
      minCsat: null,
      practical: { songCount: 2, songType: '자유곡', designatedSongs: [], accompaniment: 'MR', durationMin: 5, sheetMusicRequired: true, notes: '' },
      competition: [{ year: 2026, major: '보컬', ratio: 24.5 }],
      verification: { level: '확인됨', checkedAt: '2026-09-10', source: 'https://x.ac.kr/g' }
    }],
    prepPoints: ['자유곡 2곡이므로 대비곡 폭이 중요']
  };
  return Object.assign(s, over || {});
}

T.test('학교명과 전형명을 표시한다', function () {
  var el = PM.ui.detail.render(detailSchool(), {});
  T.assert(el.textContent.indexOf('가나대학교') >= 0);
  T.assert(el.textContent.indexOf('실기우수자전형') >= 0);
});

T.test('실기조건이 일정보다 먼저 나온다', function () {
  var el = PM.ui.detail.render(detailSchool(), {});
  var txt = el.textContent;
  T.assert(txt.indexOf('실기조건') < txt.indexOf('전형일정'), '실기조건이 먼저여야 함');
});

T.test('null 값은 미확인으로 표시한다', function () {
  var s = detailSchool();
  s.tracks[0].ratio = null;
  s.tracks[0].verification.level = '부분확인';
  var el = PM.ui.detail.render(s, {});
  T.assert(el.textContent.indexOf('미확인') >= 0);
});

T.test('수능최저가 null이면 없음으로 표시한다', function () {
  var el = PM.ui.detail.render(detailSchool(), {});
  T.assert(el.textContent.indexOf('수능최저 없음') >= 0);
});

T.test('경쟁률이 비어 있으면 미공개로 표시한다', function () {
  var s = detailSchool();
  s.tracks[0].competition = [];
  var el = PM.ui.detail.render(s, {});
  T.assert(el.textContent.indexOf('미공개') >= 0);
});

T.test('prepPoints는 참고 딱지가 붙은 별도 박스에 들어간다', function () {
  var el = PM.ui.detail.render(detailSchool(), {});
  var box = el.querySelector('.prep');
  T.assert(box, 'prep 박스 필요');
  T.assert(box.textContent.indexOf('공식 요강 아님') >= 0, '참고 딱지 필요');
  T.assert(box.textContent.indexOf('대비곡 폭이 중요') >= 0);
});

T.test('prepPoints가 비면 박스를 그리지 않는다', function () {
  var s = detailSchool();
  s.prepPoints = [];
  T.eq(PM.ui.detail.render(s, {}).querySelector('.prep'), null);
});

T.test('원문 확인 링크는 admissionsUrl로 새 탭에서 열린다', function () {
  var a = PM.ui.detail.render(detailSchool(), {}).querySelector('a.source-link');
  T.eq(a.getAttribute('href'), 'https://x.ac.kr/ipsi');
  T.eq(a.getAttribute('target'), '_blank');
  T.eq(a.getAttribute('rel'), 'noopener noreferrer');
});

T.test('입학처 링크가 없으면 버튼을 비활성화한다', function () {
  var s = detailSchool({ admissionsUrl: '' });
  var el = PM.ui.detail.render(s, {});
  T.eq(el.querySelector('a.source-link'), null);
  T.assert(el.textContent.indexOf('링크 확인 중') >= 0);
});

T.test('찜 버튼을 누르면 onTogglePick이 학교·전형 id로 불린다', function () {
  var got = null;
  var el = PM.ui.detail.render(detailSchool(), {
    onTogglePick: function (sid, tid) { got = [sid, tid]; }
  });
  el.querySelector('.pick-btn').click();
  T.eq(got, ['u1', 'susi']);
});

T.test('fmt는 null을 미확인으로 바꾼다', function () {
  T.eq(PM.ui.detail.fmt(null), '미확인');
  T.eq(PM.ui.detail.fmt(2, '곡'), '2곡');
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 `../js/ui/filterbar.js` 다음 줄:

```html
  <script src="../js/ui/detail.js"></script>
```

`ui-filterbar.test.js` 다음 줄:

```html
  <script src="ui-detail.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.ui.detail is undefined`

- [ ] **Step 3: 최소 구현**

`js/ui/detail.js`:

```js
(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  function fmt(v, unit) {
    if (v == null || v === '') return '미확인';
    return unit ? (v + unit) : String(v);
  }

  function section(title) {
    var s = el('section', 'sec');
    s.appendChild(el('h3', 'sec-title', title));
    return s;
  }

  function row(label, value) {
    var r = el('div', 'row');
    r.appendChild(el('span', 'row-label', label));
    r.appendChild(el('span', 'row-value', value));
    return r;
  }

  function practicalSection(t) {
    var s = section('실기조건');
    var p = t.practical;
    if (!p) { s.appendChild(row('실기조건', '미확인')); return s; }
    s.appendChild(row('곡 수', fmt(p.songCount, '곡')));
    s.appendChild(row('곡 유형', fmt(p.songType)));
    if (p.designatedSongs && p.designatedSongs.length) {
      s.appendChild(row('지정곡', p.designatedSongs.join(', ')));
    }
    s.appendChild(row('반주', fmt(p.accompaniment)));
    s.appendChild(row('실기 시간', fmt(p.durationMin, '분')));
    s.appendChild(row('악보 제출',
      p.sheetMusicRequired == null ? '미확인' : (p.sheetMusicRequired ? '필요' : '불필요')));
    if (p.notes) s.appendChild(row('비고', p.notes));
    return s;
  }

  function scheduleSection(t) {
    var s = section('전형일정');
    var sc = t.schedule;
    if (!sc) { s.appendChild(row('일정', '미확인')); return s; }
    s.appendChild(row('원서접수',
      (sc.apply && sc.apply.length === 2) ? sc.apply[0] + ' ~ ' + sc.apply[1] : '미확인'));
    s.appendChild(row('실기고사',
      (sc.practical && sc.practical.length) ? sc.practical.join(', ') : '미확인'));
    s.appendChild(row('합격발표', fmt(sc.announce)));
    return s;
  }

  function ratioSection(t) {
    var s = section('반영비율');
    if (!t.ratio) {
      s.appendChild(row('반영비율', '미확인'));
    } else {
      Object.keys(t.ratio).forEach(function (k) {
        s.appendChild(row(k, t.ratio[k] + '%'));
      });
    }
    s.appendChild(row('수능최저',
      ('minCsat' in t) ? (t.minCsat === null ? '수능최저 없음' : t.minCsat) : '미확인'));
    return s;
  }

  function quotaSection(t) {
    var s = section('모집인원');
    if (!t.quota) { s.appendChild(row('모집인원', '미확인')); return s; }
    Object.keys(t.quota).forEach(function (m) {
      s.appendChild(row(m, t.quota[m] + '명'));
    });
    return s;
  }

  function competitionSection(t) {
    var s = section('경쟁률');
    if (!t.competition || t.competition.length === 0) {
      s.appendChild(row('경쟁률', '미공개'));
      return s;
    }
    t.competition.slice().sort(function (a, b) { return b.year - a.year; })
      .forEach(function (c) {
        s.appendChild(row(c.year + ' ' + c.major, c.ratio + ' : 1'));
      });
    return s;
  }

  function trackBlock(school, t, opts) {
    var b = el('div', 'track');

    var head = el('div', 'track-head');
    head.appendChild(el('span', 'track-name', t.season + ' · ' + t.name));
    head.appendChild(PM.ui.badge(t.verification.level, 'level-' + t.verification.level));

    var pick = el('button', 'pick-btn',
      PM.storage.hasPick(school.id, t.id) ? '찜 해제' : '찜하기');
    pick.type = 'button';
    pick.addEventListener('click', function () {
      if (opts.onTogglePick) opts.onTogglePick(school.id, t.id);
    });
    head.appendChild(pick);
    b.appendChild(head);

    b.appendChild(practicalSection(t));
    b.appendChild(scheduleSection(t));
    b.appendChild(ratioSection(t));
    b.appendChild(quotaSection(t));
    b.appendChild(competitionSection(t));
    return b;
  }

  function render(school, opts) {
    var o = opts || {};
    var wrap = el('div', 'detail');

    var back = el('button', 'back-btn', '← 목록');
    back.type = 'button';
    back.addEventListener('click', function () { if (o.onBack) o.onBack(); });
    wrap.appendChild(back);

    var head = el('div', 'detail-head');
    head.appendChild(el('h2', null, school.name));
    head.appendChild(PM.ui.badge(school.type, 'type'));
    head.appendChild(el('span', 'muted', school.region + ' · ' + school.deptName));
    wrap.appendChild(head);

    (school.tracks || []).forEach(function (t) {
      wrap.appendChild(trackBlock(school, t, o));
    });

    if (school.prepPoints && school.prepPoints.length) {
      var prep = el('div', 'prep');
      prep.appendChild(el('div', 'prep-tag', '참고 · 공식 요강 아님'));
      var ul = el('ul');
      school.prepPoints.forEach(function (p) { ul.appendChild(el('li', null, p)); });
      prep.appendChild(ul);
      wrap.appendChild(prep);
    }

    if (school.admissionsUrl) {
      var a = el('a', 'source-link', '입학처 원문 확인');
      a.href = school.admissionsUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      wrap.appendChild(a);
    } else {
      wrap.appendChild(el('div', 'source-missing', '입학처 링크 확인 중'));
    }

    return wrap;
  }

  PM.ui.detail = { render: render, fmt: fmt };
})(window.PM);
```

`css/style.css` 끝에 추가:

```css
.detail-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 8px 0 4px; }
.detail-head h2 { font-size: 18px; margin: 0; }
.muted { color: var(--muted); font-size: 13px; }
.back-btn, .pick-btn { background: none; border: 1px solid var(--line); border-radius: 6px; padding: 6px 10px; font-size: 13px; cursor: pointer; }
.track { border: 1px solid var(--line); border-radius: 10px; padding: 12px; margin: 12px 0; }
.track-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.track-name { font-weight: 700; }
.sec { margin-top: 12px; }
.sec-title { font-size: 13px; color: var(--muted); margin: 0 0 4px; }
.row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; border-bottom: 1px dotted var(--line); }
.row-label { color: var(--muted); font-size: 13px; }
.prep { border: 1px dashed #b28900; background: #fffbe6; border-radius: 10px; padding: 12px; margin: 12px 0; }
.prep-tag { font-size: 11px; color: #7a5c00; font-weight: 700; margin-bottom: 6px; }
.prep ul { margin: 0; padding-left: 18px; }
.source-link { display: block; text-align: center; padding: 12px; background: var(--accent); color: #fff; border-radius: 8px; text-decoration: none; margin: 12px 0; }
.source-missing { text-align: center; color: var(--muted); padding: 12px; }
```

`index.html`의 `js/ui/filterbar.js` 다음 줄에 추가:

```html
  <script src="js/ui/detail.js"></script>
```

`js/app.js`에서 `renderList` 안의 `onSelect`를 교체하고 `renderDetail`을 추가:

```js
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
```

`renderList`의 `onSelect`:

```js
      onSelect: renderDetail
```

`PM.app` 노출에 추가:

```js
  PM.app = { start: start, _state: state, _renderList: renderList, _renderDetail: renderDetail };
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `82 passed, 0 failed`

앱에서 카드를 눌러 상세로 들어가고, 「← 목록」으로 돌아오는지 확인.

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/ui/detail.js js/app.js index.html css/style.css tests/ui-detail.test.js tests/index.html
git commit -m "feat: 학교 상세 화면 — 실기조건 우선 배치, prepPoints 시각 분리"
```

---

### Task 11: 내 지원 리스트와 실기일정 충돌 경고

앱의 핵심 차별 기능이 화면에 붙는 태스크.

**Files:**
- Create: `js/ui/mylist.js`
- Create: `tests/ui-mylist.test.js`
- Modify: `js/app.js`, `index.html`, `tests/index.html`, `css/style.css`

**Interfaces:**
- Consumes: `PM.conflict.entriesFrom`, `PM.conflict.find` (T3), `PM.storage` (T5), `PM.ui.el` (T8)
- Produces:
  - `PM.ui.mylist.render(schools, picks, opts)` → `HTMLElement`
    - `opts`: `{onSelect: fn(schoolId), onRemove: fn(schoolId, trackId)}`

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/ui-mylist.test.js`:

```js
function mySchools() {
  function mk(id, name, dates) {
    return {
      id: id, name: name, type: '4년제', region: '서울', deptName: '실용음악과',
      admissionsUrl: 'https://x.ac.kr',
      tracks: [{
        id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
        quota: null, schedule: { practical: dates }, ratio: null, minCsat: null,
        practical: null, competition: [],
        verification: { level: '미확인', checkedAt: '2026-09-10', source: null }
      }],
      prepPoints: []
    };
  }
  return [mk('a', '가대', ['2026-10-11']), mk('b', '나대', ['2026-10-11']),
          mk('c', '다대', ['2026-10-18']), mk('d', '라대', [])];
}

var ALL = [{ schoolId: 'a', trackId: 'susi' }, { schoolId: 'b', trackId: 'susi' },
           { schoolId: 'c', trackId: 'susi' }, { schoolId: 'd', trackId: 'susi' }];

T.test('찜이 없으면 안내 문구를 보여준다', function () {
  var el = PM.ui.mylist.render(mySchools(), [], {});
  T.assert(el.textContent.indexOf('찜한 학교가 없습니다') >= 0);
});

T.test('찜한 학교를 모두 보여준다', function () {
  var el = PM.ui.mylist.render(mySchools(), ALL, {});
  T.eq(el.querySelectorAll('.pick-row').length, 4);
});

T.test('같은 날 실기가 겹치면 경고를 그린다', function () {
  var el = PM.ui.mylist.render(mySchools(), ALL, {});
  var w = el.querySelector('.conflict');
  T.assert(w, '충돌 경고 필요');
  T.assert(w.textContent.indexOf('2026-10-11') >= 0);
  T.assert(w.textContent.indexOf('가대') >= 0 && w.textContent.indexOf('나대') >= 0);
});

T.test('겹치는 학교의 행에 충돌 표시가 붙는다', function () {
  var el = PM.ui.mylist.render(mySchools(), ALL, {});
  T.eq(el.querySelectorAll('.pick-row.has-conflict').length, 2);
});

T.test('겹치지 않으면 경고가 없다', function () {
  var el = PM.ui.mylist.render(mySchools(), [{ schoolId: 'a', trackId: 'susi' },
                                             { schoolId: 'c', trackId: 'susi' }], {});
  T.eq(el.querySelector('.conflict'), null);
});

T.test('실기일 미확인 학교는 별도로 안내한다', function () {
  var el = PM.ui.mylist.render(mySchools(), ALL, {});
  var u = el.querySelector('.unknown-dates');
  T.assert(u, '미확인 안내 필요');
  T.assert(u.textContent.indexOf('라대') >= 0);
});

T.test('삭제 버튼이 onRemove를 호출한다', function () {
  var got = null;
  var el = PM.ui.mylist.render(mySchools(), [{ schoolId: 'a', trackId: 'susi' }],
    { onRemove: function (s, t) { got = [s, t]; } });
  el.querySelector('.remove-btn').click();
  T.eq(got, ['a', 'susi']);
});

T.test('행을 누르면 onSelect가 학교 id로 불린다', function () {
  var got = null;
  var el = PM.ui.mylist.render(mySchools(), [{ schoolId: 'a', trackId: 'susi' }],
    { onSelect: function (id) { got = id; } });
  el.querySelector('.pick-name').click();
  T.eq(got, 'a');
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 `../js/ui/detail.js` 다음 줄:

```html
  <script src="../js/ui/mylist.js"></script>
```

`ui-detail.test.js` 다음 줄:

```html
  <script src="ui-mylist.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.ui.mylist is undefined`

- [ ] **Step 3: 최소 구현**

`js/ui/mylist.js`:

```js
(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;

  function keyOf(e) { return e.schoolId + '::' + e.trackId; }

  function conflictBox(conflicts) {
    var box = el('div', 'conflict');
    box.appendChild(el('div', 'conflict-title',
      '실기고사일이 겹칩니다 — 같은 날은 한 곳만 응시할 수 있습니다'));

    conflicts.forEach(function (c) {
      var line = el('div', 'conflict-line');
      line.appendChild(el('strong', null, c.date));
      var names = c.items.map(function (i) {
        return i.schoolName + '(' + i.trackName + ')';
      }).join(' · ');
      line.appendChild(el('span', null, ' ' + names));
      box.appendChild(line);
    });
    return box;
  }

  function pickRow(entry, conflicted, opts) {
    var r = el('div', 'pick-row' + (conflicted ? ' has-conflict' : ''));

    var name = el('button', 'pick-name',
      entry.schoolName + ' · ' + entry.trackName);
    name.type = 'button';
    name.addEventListener('click', function () {
      if (opts.onSelect) opts.onSelect(entry.schoolId);
    });
    r.appendChild(name);

    r.appendChild(el('span', 'pick-dates',
      entry.dates.length ? entry.dates.join(', ') : '실기일 미확인'));

    if (conflicted) r.appendChild(el('span', 'conflict-tag', '겹침'));

    var rm = el('button', 'remove-btn', '삭제');
    rm.type = 'button';
    rm.addEventListener('click', function () {
      if (opts.onRemove) opts.onRemove(entry.schoolId, entry.trackId);
    });
    r.appendChild(rm);

    return r;
  }

  function render(schools, picks, opts) {
    var o = opts || {};
    var wrap = el('div', 'mylist');
    wrap.appendChild(el('h2', null, '내 지원 리스트'));

    var entries = PM.conflict.entriesFrom(schools, picks || []);
    if (entries.length === 0) {
      wrap.appendChild(el('p', 'empty', '찜한 학교가 없습니다. 학교 상세에서 「찜하기」를 눌러보세요.'));
      return wrap;
    }

    var result = PM.conflict.find(entries);

    if (result.conflicts.length) {
      wrap.appendChild(conflictBox(result.conflicts));
    }

    var conflicted = {};
    result.conflicts.forEach(function (c) {
      c.items.forEach(function (i) { conflicted[keyOf(i)] = true; });
    });

    entries.forEach(function (e) {
      wrap.appendChild(pickRow(e, !!conflicted[keyOf(e)], o));
    });

    if (result.unknown.length) {
      var u = el('div', 'unknown-dates');
      u.appendChild(el('div', null,
        '아래 학교는 실기고사일이 아직 확인되지 않아 충돌 검사에서 빠졌습니다. 입학처 원문을 확인하세요.'));
      result.unknown.forEach(function (e) {
        u.appendChild(el('div', null, '· ' + e.schoolName + ' · ' + e.trackName));
      });
      wrap.appendChild(u);
    }

    return wrap;
  }

  PM.ui.mylist = { render: render };
})(window.PM);
```

`css/style.css` 끝에 추가:

```css
.conflict { border: 2px solid var(--warn); background: #fdeceb; border-radius: 10px; padding: 12px; margin: 12px 0; }
.conflict-title { font-weight: 700; color: var(--warn); margin-bottom: 6px; }
.conflict-line { font-size: 14px; }
.pick-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; }
.pick-row.has-conflict { border-color: var(--warn); }
.pick-name { flex: 1; text-align: left; background: none; border: none; font-size: 15px; padding: 0; cursor: pointer; color: var(--fg); }
.pick-dates { font-size: 13px; color: var(--muted); }
.conflict-tag { font-size: 11px; background: var(--warn); color: #fff; padding: 2px 6px; border-radius: 999px; }
.remove-btn { background: none; border: 1px solid var(--line); border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; }
.unknown-dates { border: 1px solid var(--line); background: #f8f9fa; border-radius: 8px; padding: 10px; font-size: 13px; color: var(--muted); margin-top: 12px; }
nav.tabs { display: flex; border-bottom: 1px solid var(--line); }
nav.tabs button { flex: 1; padding: 10px; background: none; border: none; border-bottom: 2px solid transparent; font-size: 14px; cursor: pointer; color: var(--muted); }
nav.tabs button.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 700; }
```

`index.html` — `<main id="screen">` 앞에 탭을 추가:

```html
  <nav class="tabs">
    <button type="button" data-tab="list" class="active">학교 찾기</button>
    <button type="button" data-tab="mylist">내 지원 리스트</button>
  </nav>
```

그리고 `js/ui/detail.js` 다음 줄에:

```html
  <script src="js/ui/mylist.js"></script>
```

`js/app.js`에 추가하고 `start`를 교체:

```js
  function renderMyList() {
    var host = screenEl();
    host.textContent = '';
    host.appendChild(PM.ui.mylist.render(state.schools, PM.storage.getPicks(), {
      onSelect: renderDetail,
      onRemove: function (sid, tid) { PM.storage.removePick(sid, tid); renderMyList(); }
    }));
    host.appendChild(PM.ui.disclaimerBar());
  }

  function bindTabs() {
    var btns = document.querySelectorAll('nav.tabs button');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(btns, function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        if (b.getAttribute('data-tab') === 'mylist') renderMyList();
        else renderList();
      });
    });
  }

  function start() {
    bindTabs();
    PM.data.load().then(function (r) {
      state.schools = r.schools;
      state.dataVersion = r.dataVersion;
      state.source = r.source;
      renderList();
    });
  }
```

`PM.app` 노출에 `_renderMyList: renderMyList` 추가.

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `90 passed, 0 failed`

앱에서: 학교 2곳을 찜한 뒤 「내 지원 리스트」 탭으로 이동. 실기일이 같으면 빨간 경고가 뜨는지 확인.

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/ui/mylist.js js/app.js index.html css/style.css tests/ui-mylist.test.js tests/index.html
git commit -m "feat: 내 지원 리스트와 실기고사일 충돌 경고"
```

---

### Task 12: 비교 화면

**Files:**
- Create: `js/ui/compare.js`
- Create: `tests/ui-compare.test.js`
- Modify: `js/app.js`, `index.html`, `tests/index.html`, `css/style.css`

**Interfaces:**
- Consumes: `PM.ui.el` (T8), `PM.ui.detail.fmt` (T10)
- Produces:
  - `PM.ui.compare.MAX` → `3`
  - `PM.ui.compare.render(schools, picks, opts)` → `HTMLElement`
    - 앞의 최대 3개 찜을 열로 놓고 항목을 행으로 대조
    - `opts`: `{onSelect: fn(schoolId)}`

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/ui-compare.test.js`:

```js
function cmpSchools() {
  function mk(id, name, songType, ratio) {
    return {
      id: id, name: name, type: '4년제', region: '서울', deptName: '실용음악과',
      admissionsUrl: 'https://x.ac.kr',
      tracks: [{
        id: 'susi', season: '수시', name: '전형', majors: ['보컬'],
        quota: { '보컬': 10 }, schedule: { practical: ['2026-10-11'] },
        ratio: ratio, minCsat: null,
        practical: { songCount: 2, songType: songType, designatedSongs: [], accompaniment: 'MR', durationMin: 5, sheetMusicRequired: true, notes: '' },
        competition: [],
        verification: { level: '확인됨', checkedAt: '2026-09-10', source: 'https://x' }
      }],
      prepPoints: []
    };
  }
  return [mk('a', '가대', '자유곡', { '실기': 100, '내신': 0, '수능': 0 }),
          mk('b', '나대', '지정곡', { '실기': 70, '내신': 30, '수능': 0 }),
          mk('c', '다대', '혼합', { '실기': 60, '내신': 40, '수능': 0 }),
          mk('d', '라대', '자유곡', { '실기': 50, '내신': 50, '수능': 0 })];
}

var CPICKS = [{ schoolId: 'a', trackId: 'susi' }, { schoolId: 'b', trackId: 'susi' },
              { schoolId: 'c', trackId: 'susi' }, { schoolId: 'd', trackId: 'susi' }];

T.test('최대 3개까지만 비교한다', function () {
  T.eq(PM.ui.compare.MAX, 3);
  var el = PM.ui.compare.render(cmpSchools(), CPICKS, {});
  T.eq(el.querySelectorAll('thead th').length, 4); // 항목열 + 3개교
});

T.test('찜이 2개 미만이면 안내 문구를 보여준다', function () {
  var el = PM.ui.compare.render(cmpSchools(), [CPICKS[0]], {});
  T.assert(el.textContent.indexOf('2곳 이상') >= 0);
});

T.test('학교명이 헤더에 들어간다', function () {
  var el = PM.ui.compare.render(cmpSchools(), CPICKS, {});
  T.assert(el.querySelector('thead').textContent.indexOf('가대') >= 0);
});

T.test('실기 곡 유형을 행으로 대조한다', function () {
  var el = PM.ui.compare.render(cmpSchools(), CPICKS, {});
  T.assert(el.textContent.indexOf('자유곡') >= 0 && el.textContent.indexOf('지정곡') >= 0);
});

T.test('null 값은 미확인으로 표시한다', function () {
  var s = cmpSchools();
  s[0].tracks[0].ratio = null;
  s[0].tracks[0].verification.level = '부분확인';
  var el = PM.ui.compare.render(s, CPICKS, {});
  T.assert(el.textContent.indexOf('미확인') >= 0);
});

T.test('4곳을 찜하면 초과분 안내가 뜬다', function () {
  var el = PM.ui.compare.render(cmpSchools(), CPICKS, {});
  T.assert(el.textContent.indexOf('앞의 3곳') >= 0);
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`에 `../js/ui/mylist.js` 다음 줄:

```html
  <script src="../js/ui/compare.js"></script>
```

`ui-mylist.test.js` 다음 줄:

```html
  <script src="ui-compare.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `PM.ui.compare is undefined`

- [ ] **Step 3: 최소 구현**

`js/ui/compare.js`:

```js
(function (PM) {
  PM.ui = PM.ui || {};
  var el = PM.ui.el;
  var MAX = 3;

  var ROWS = [
    { label: '구분',      get: function (s, t) { return s.type; } },
    { label: '지역',      get: function (s, t) { return s.region; } },
    { label: '전형',      get: function (s, t) { return t.season + ' · ' + t.name; } },
    { label: '곡 수',     get: function (s, t) { return t.practical ? PM.ui.detail.fmt(t.practical.songCount, '곡') : '미확인'; } },
    { label: '곡 유형',   get: function (s, t) { return t.practical ? PM.ui.detail.fmt(t.practical.songType) : '미확인'; } },
    { label: '반주',      get: function (s, t) { return t.practical ? PM.ui.detail.fmt(t.practical.accompaniment) : '미확인'; } },
    { label: '실기 비율', get: function (s, t) { return t.ratio ? t.ratio['실기'] + '%' : '미확인'; } },
    { label: '수능최저',  get: function (s, t) { return ('minCsat' in t) ? (t.minCsat === null ? '없음' : t.minCsat) : '미확인'; } },
    { label: '실기고사일', get: function (s, t) { return (t.schedule && t.schedule.practical && t.schedule.practical.length) ? t.schedule.practical.join(', ') : '미확인'; } },
    { label: '모집인원',  get: function (s, t) {
        if (!t.quota) return '미확인';
        return Object.keys(t.quota).map(function (m) { return m + ' ' + t.quota[m]; }).join(', ');
      } }
  ];

  function render(schools, picks, opts) {
    var o = opts || {};
    var wrap = el('div', 'compare');
    wrap.appendChild(el('h2', null, '비교'));

    var entries = [];
    var byId = {};
    (schools || []).forEach(function (s) { byId[s.id] = s; });
    (picks || []).forEach(function (p) {
      var s = byId[p.schoolId];
      if (!s) return;
      var t = (s.tracks || []).filter(function (x) { return x.id === p.trackId; })[0];
      if (t) entries.push({ school: s, track: t });
    });

    if (entries.length < 2) {
      wrap.appendChild(el('p', 'empty', '비교하려면 학교를 2곳 이상 찜해주세요.'));
      return wrap;
    }

    var over = entries.length > MAX;
    var shown = entries.slice(0, MAX);

    var scroller = el('div', 'table-scroll');
    var table = el('table', 'cmp-table');

    var thead = el('thead');
    var hr = el('tr');
    hr.appendChild(el('th', null, '항목'));
    shown.forEach(function (e) {
      var th = el('th');
      var b = el('button', 'cmp-name', e.school.name);
      b.type = 'button';
      b.addEventListener('click', function () { if (o.onSelect) o.onSelect(e.school.id); });
      th.appendChild(b);
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    ROWS.forEach(function (r) {
      var tr = el('tr');
      tr.appendChild(el('th', 'row-label', r.label));
      shown.forEach(function (e) {
        tr.appendChild(el('td', null, String(r.get(e.school, e.track))));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    scroller.appendChild(table);
    wrap.appendChild(scroller);

    if (over) {
      wrap.appendChild(el('p', 'muted',
        '찜한 학교가 ' + entries.length + '곳입니다. 앞의 3곳만 비교합니다.'));
    }
    return wrap;
  }

  PM.ui.compare = { MAX: MAX, render: render };
})(window.PM);
```

`css/style.css` 끝에 추가:

```css
.table-scroll { overflow-x: auto; }
.cmp-table { border-collapse: collapse; width: 100%; font-size: 13px; }
.cmp-table th, .cmp-table td { border: 1px solid var(--line); padding: 8px; text-align: left; vertical-align: top; }
.cmp-table thead th { background: #f8f9fa; white-space: nowrap; }
.cmp-name { background: none; border: none; font-weight: 700; font-size: 13px; cursor: pointer; color: var(--accent); padding: 0; }
```

`index.html` 탭에 버튼 추가:

```html
    <button type="button" data-tab="compare">비교</button>
```

`js/ui/mylist.js` 다음 줄에:

```html
  <script src="js/ui/compare.js"></script>
```

`js/app.js`에 추가하고 `bindTabs`의 분기를 교체:

```js
  function renderCompare() {
    var host = screenEl();
    host.textContent = '';
    host.appendChild(PM.ui.compare.render(state.schools, PM.storage.getPicks(), {
      onSelect: renderDetail
    }));
    host.appendChild(PM.ui.disclaimerBar());
  }
```

`bindTabs` 안:

```js
        var tab = b.getAttribute('data-tab');
        if (tab === 'mylist') renderMyList();
        else if (tab === 'compare') renderCompare();
        else renderList();
```

`PM.app` 노출에 `_renderCompare: renderCompare` 추가.

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: `96 passed, 0 failed`

앱에서 학교 2곳 찜 후 「비교」 탭 확인. 360px 폭에서 표가 **가로 스크롤 컨테이너 안에서만** 움직이고 body는 안 밀리는지 본다.

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add js/ui/compare.js js/app.js index.html css/style.css tests/ui-compare.test.js tests/index.html
git commit -m "feat: 학교 비교 화면 (최대 3곳, 가로 스크롤 격리)"
```

---

### Task 13: 전국 전수 목록 확보

여기부터는 **코드가 아니라 데이터 작업**이다. 스펙 §6의 1차 단계.

**Files:**
- Create: `data/schools/*.json` (전국 실용음악 계열 학과 설치 대학 전수)
- Create: `docs/data-sources.md`
- Modify: `data/snapshot.js` (빌드로 재생성)

**Interfaces:**
- Consumes: Task 2의 스키마, Task 6의 빌드 스크립트
- Produces: 전수 학교 목록. 모든 신규 레코드는 `verification.level = "미확인"`

**규칙:**
- 학교명·구분·지역·학과명·입학처 URL은 **반드시 실제로 확인한 값**만 넣는다
- 세부 항목(`quota`/`schedule`/`ratio`/`practical`)은 전부 `null`, 등급은 `미확인`
- `id`는 영문 소문자 슬러그. 한 번 정하면 바꾸지 않는다(찜 데이터가 id로 저장됨)
- 출처는 `docs/data-sources.md`에 기록한다

- [ ] **Step 1: 실패하는 테스트를 먼저 작성**

`tests/coverage.test.js`:

```js
T.test('학교가 100곳 이상이다', function () {
  T.assert(PM.SNAPSHOT.schools.length >= 100,
    '현재 ' + PM.SNAPSHOT.schools.length + '곳 — 전수 목록이 아직 미완성');
});

T.test('모든 학교에 입학처 URL이 있다', function () {
  var bad = PM.SNAPSHOT.schools
    .filter(function (s) { return !/^https?:\/\//.test(s.admissionsUrl || ''); })
    .map(function (s) { return s.id; });
  T.eq(bad, []);
});

T.test('4년제와 전문대가 모두 포함된다', function () {
  var types = {};
  PM.SNAPSHOT.schools.forEach(function (s) { types[s.type] = true; });
  T.eq(Object.keys(types).sort(), ['4년제', '전문대']);
});

T.test('모든 학교에 전형이 1개 이상 있다', function () {
  var bad = PM.SNAPSHOT.schools
    .filter(function (s) { return !s.tracks || s.tracks.length === 0; })
    .map(function (s) { return s.id; });
  T.eq(bad, []);
});
```

- [ ] **Step 2: 실패를 확인**

`tests/index.html`의 `ui-compare.test.js` 다음 줄:

```html
  <script src="coverage.test.js"></script>
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: FAIL — `현재 2곳 — 전수 목록이 아직 미완성`

- [ ] **Step 3: 데이터 채우기**

전국 실용음악(실용음악과·실용음악학부·실용음악전공·K-POP과 등 동일 계열) 설치 대학을 조사해 학교당 JSON 1개를 만든다. 각 파일은 아래 형태를 지킨다 — **`admissionsUrl`은 실제 확인한 주소여야 하고, 나머지는 `null`로 둔다:**

```json
{
  "id": "<영문-슬러그>",
  "name": "<학교 정식 명칭>",
  "type": "4년제",
  "region": "<시·도>",
  "deptName": "<학과 정식 명칭>",
  "admissionsUrl": "https://<확인한 입학처 주소>",
  "guideUrl": null,
  "tracks": [
    {
      "id": "susi",
      "season": "수시",
      "name": "수시모집",
      "majors": [],
      "quota": null,
      "schedule": null,
      "ratio": null,
      "minCsat": null,
      "practical": null,
      "competition": [],
      "verification": { "level": "미확인", "checkedAt": "<작업일 YYYY-MM-DD>", "source": null }
    }
  ],
  "prepPoints": []
}
```

`docs/data-sources.md`:

```markdown
# 데이터 출처

## 학교 목록
- 대학알리미 (academyinfo.go.kr) — 학과 설치 현황
- 어디가 (adiga.kr) — 전형 정보
- 각 대학 입학처 — 최종 확인

## 원칙
- 요강 PDF 원문은 저장소에 넣지 않는다. 링크로만 연결한다.
- 확인하지 못한 값은 null. 추측해서 채우지 않는다.
- 학교 id는 한 번 정하면 변경하지 않는다(찜 데이터가 id로 저장됨).

## 확인 이력
| 날짜 | 학교 | 확인 항목 | 출처 |
|---|---|---|---|
```

빌드:

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
bash scripts/build-snapshot.sh
```

- [ ] **Step 4: 통과 확인**

Run: Chrome에서 `tests/index.html` 새로고침
Expected: 전체 통과. `snapshot.test.js`의 스키마 검증과 id 중복 검사도 함께 통과해야 한다.

앱에서: 전공·지역 필터를 걸어 목록이 줄어드는지 확인.

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
bash scripts/build-snapshot.sh
git add data/ docs/data-sources.md tests/coverage.test.js tests/index.html
git commit -m "data: 전국 실용음악과 설치 대학 전수 목록 (세부는 미확인 상태)"
```

---

### Task 14: 세부 데이터 채우기 (반복 태스크)

**이 태스크는 한 번에 끝나지 않는다.** 학교 묶음마다 반복 실행한다. 한 번 돌 때마다 커밋 1개가 나오고, 앱은 그 사이에도 계속 동작한다.

**Files:**
- Modify: `data/schools/<id>.json` (이번 회차 대상 학교들)
- Modify: `docs/data-sources.md` (확인 이력 추가)
- Modify: `data/snapshot.js` (빌드로 재생성)

**Interfaces:**
- Consumes: Task 2 스키마, Task 6 빌드 스크립트
- Produces: 없음 (데이터만 변경)

**한 회차 = 학교 5~10곳.** 지원자가 많은 학교부터 내려간다.

- [ ] **Step 1: 대상 학교의 요강 원문을 확인**

각 학교 입학처에서 해당 학년도 모집요강을 연다. 아래를 원문에서 직접 읽는다:
실기 곡 수·곡 유형·지정곡·반주 형태·실기 시간·악보 제출 / 원서접수 기간 ·
실기고사일 · 발표일 / 실기·내신·수능 반영비율 / 수능최저 / 전공별 모집인원 /
공시된 경쟁률.

**읽지 못한 항목은 `null`로 남긴다.** 추측 금지.

- [ ] **Step 2: JSON을 채우고 등급을 올린다**

`quota`·`schedule`·`ratio`·`practical`을 **모두** 채운 전형만 `verification.level`을
`확인됨`으로 올리고 `verification.source`에 확인에 쓴 URL을 적는다.
하나라도 비면 `부분확인`에 머문다. (Task 2의 검증기가 이 규칙을 강제한다.)

`prepPoints`는 채운 데이터에서 도출되는 것만 쓴다. 예: 지정곡이 있으면
"지정곡 사전 확인 필요", 실기 100%면 "내신 부담 없음".

- [ ] **Step 3: 빌드하고 검증**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
bash scripts/build-snapshot.sh
```

Run: Chrome에서 `tests/index.html` 새로고침
Expected: 전체 통과. **`확인됨`인데 필수 항목이 비면 여기서 실패한다** — 실패하면 등급을 낮추거나 값을 채운다.

- [ ] **Step 4: 앱에서 눈으로 확인**

`index.html`을 열고 이번 회차 학교의 상세로 들어가 값이 요강과 맞는지 대조한다.
진행률 문구(`세부 확인 N / M개교`)의 N이 늘었는지 확인한다.

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add data/ docs/data-sources.md
git commit -m "data: <학교명들> 세부 요강 확인"
```

---

### Task 15: 1단계 완료 검수

**Files:**
- Create: `README.md`
- Modify: 검수에서 발견된 문제 파일

**Interfaces:**
- Consumes: 전체
- Produces: 없음 (검수)

- [ ] **Step 1: 스펙 §12 성공 기준을 하나씩 확인**

Chrome DevTools 기기 툴바를 360×640으로 맞추고 `index.html`을 연다.

| 확인 | 방법 | 기대 |
|---|---|---|
| 전수 목록 + 입학처 이동 | 아무 학교나 상세 → 「입학처 원문 확인」 | 실제 입학처가 새 탭에 열림 |
| 필터 조합 | 전공=보컬 + 수능최저 없음 + 실기 100% | 해당 조건 학교만 남음 |
| 충돌 경고 | 실기일이 같은 학교 2곳 찜 → 내 지원 리스트 | 빨간 경고 + 해당 행에 「겹침」 |
| 데이터 정확성 | `확인됨` 학교 3곳을 요강 원문과 대조 | 틀린 값 0 |
| 테스트 | `tests/index.html` | `0 failed` |
| 오프라인 | DevTools Network를 Offline으로 두고 새로고침 | 목록이 그대로 보임 |
| 가로 스크롤 | 360px에서 모든 탭 확인 | body 가로 스크롤 없음 |

- [ ] **Step 2: 발견된 문제를 고친다**

문제가 나오면 해당 파일을 수정하고 `tests/index.html`을 다시 돌린다.

- [ ] **Step 3: README 작성**

`README.md`:

```markdown
# 실용음악과 입시 모집요강 앱

전국 실용음악과의 모집요강을 한 곳에서 검색·필터·비교하고,
실기고사일이 겹치는 조합을 경고하는 앱.

## 실행

빌드 도구가 필요 없다. `index.html`을 브라우저에서 열면 된다.

## 테스트

`tests/index.html`을 브라우저에서 연다. `0 failed`여야 한다.

## 데이터 수정

1. `data/schools/<id>.json` 을 고친다
2. `bash scripts/build-snapshot.sh` 로 `data/snapshot.js` 를 재생성한다
3. `tests/index.html` 을 열어 검증이 통과하는지 본다

`verification.level`을 `확인됨`으로 올리려면 `quota`·`schedule`·`ratio`·`practical`이
모두 채워져 있어야 한다. 검증기가 이를 강제한다. **확인하지 못한 값은 null로 둔다.**

## 구조

- `js/schema.js` · `js/filter.js` · `js/conflict.js` — DOM을 모르는 순수 로직
- `js/ui/*.js` — 화면 (렌더 함수는 DOM 요소를 반환)
- `js/data.js` — 원격 → 캐시 → 스냅샷 폴백
- `data/schools/*.json` — 정본 / `data/snapshot.js` — 생성물

## 제약

- ES 모듈·fetch를 초기 로드에 쓰지 않는다 (`file://`에서 CORS로 차단됨)
- npm 의존성 0개
- 요강 PDF는 재배포하지 않고 입학처 링크로만 연결한다

## 다음 단계

2단계: Node.js + JDK + Android Studio 설치 → Capacitor로 안드로이드 래핑 →
AdMob 연동 → Play 출시. 설계는 `docs/superpowers/specs/` 참고.
```

- [ ] **Step 4: 전체 테스트 최종 실행**

Run: Chrome에서 `tests/index.html`
Expected: `0 failed`

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/kki09/Desktop/클로드/pm-admissions"
git add README.md
git commit -m "docs: README와 1단계 완료 검수"
```

---

## 자체 검토 결과

**스펙 커버리지:**

| 스펙 절 | 담당 태스크 |
|---|---|
| §4 앱/데이터 분리, 폴백 | Task 6, 7 |
| §5.1 스키마 | Task 2, 6 |
| §5.2 verification | Task 2 (거짓 확신 차단 테스트) |
| §5.3 prepPoints 분리 | Task 10 |
| §5.4 파일 구성 | Task 6 |
| §6 점진적 채우기 | Task 13, 14 |
| §7 화면1 목록 | Task 8 |
| §7 필터 | Task 4, 9 |
| §7 화면2 상세 | Task 10 |
| §7 화면3 충돌 | Task 3, 11 |
| §7 화면4 비교 | Task 12 |
| §7 면책·진행률 | Task 8 |
| §7 광고 자리 50px | Task 8 (`--ad-h`) |
| §8 무빌드 구성 | Global Constraints, Task 1 |
| §9 PDF 재배포 금지 | Task 13 규칙, README |
| §10 에러 처리 | Task 7 (sanitize), Task 5 (폴백), Task 10 (null 표시) |
| §11 테스트 | Task 1 러너 + 각 태스크 |
| §12 성공 기준 | Task 15 |

**타입 일관성 확인:** `PM.schema.LEVELS` 값(`미확인`/`부분확인`/`확인됨`)이 Task 2·8·10·12에서 동일. `PM.filter.quotaOf`는 T4 정의 → T8 사용. `PM.conflict.entriesFrom`/`find` 반환 형태는 T3 정의 → T11 사용. `PM.ui.detail.fmt`는 T10 정의 → T12 사용. `PM.storage.hasPick`은 T5 정의 → T10 사용.

**스펙에서 발견해 반영한 누락:** 스펙 §8은 "파일을 브라우저에서 바로 열어 확인"이라고만 적었으나, `file://`에서 ES 모듈과 fetch가 차단된다는 점은 명시되지 않았다. 이 계획의 Global Constraints에 제약으로 못박고, Task 6의 스냅샷 번들과 Task 7의 프로토콜 분기로 해결했다.
