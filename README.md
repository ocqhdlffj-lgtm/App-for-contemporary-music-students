# 실용음악과 입시 모집요강 앱

전국 실용음악과의 모집요강을 한 곳에서 검색·필터·비교하고,
실기고사일이 겹치는 조합을 경고하는 앱.

## 실행

빌드 도구가 필요 없다. `index.html`을 브라우저에서 열면 된다.

로컬 서버가 있으면(선택) `bash scripts/dev-server.ps1`로 미리보기 가능. Node/Python
없이 .NET HttpListener만 쓰는 개발 편의 도구이며 앱 본체와는 무관하다.

## 테스트

`tests/index.html`을 브라우저에서 연다. `0 failed`여야 한다.

Chrome이 설치돼 있으면 `bash scripts/run-tests.sh`로 헤드리스 실행도 가능하다
(브라우저 프리뷰가 `file://`에서 JS를 실행하지 않는 환경에서 이 방법으로 검증했다).

## 데이터 수정

1. `data/schools/<id>.json` 을 고친다
2. `bash scripts/build-snapshot.sh` 로 `data/snapshot.js` 를 재생성한다
3. `tests/index.html` 을 열어(또는 `run-tests.sh`) 검증이 통과하는지 본다

`verification.level`을 `확인됨`으로 올리려면 `quota`·`schedule`·`ratio`·`practical`이
모두 채워져 있어야 한다(각각 비어있지 않은 객체, `schedule.apply`·`schedule.practical`
필수). 검증기(`js/schema.js`)가 이를 강제한다. **확인하지 못한 값은 null로 둔다 — 추측 금지.**

전형별 확인 수준은 3단계다:
- `미확인` — 아직 세부 요강을 조사하지 못함
- `부분확인` — 일부만 확인, 나머지는 원문이 불명확하거나 공개되지 않음
- `확인됨` — 실기조건·일정·반영비율·모집인원을 전부 원문에서 확인

## 현재 데이터 현황 (2026-09-17 기준)

- 전국 63개교, `확인됨` 38곳 · `부분확인` 11곳 · `미확인` 14곳
  (학교 등급은 그 학교의 전형 중 최저 등급을 따른다 — `js/schema.js`의
  `schoolLevel`)
- `미확인` 14곳 중 9곳은 학과가 실재(했)지만 최근 모집단위에서 빠졌거나
  스코프(대중음악 실기 전형)에서 벗어난 것으로 조사되어 `prepPoints`에
  경위를 남겨뒀다. 나머지 5곳(부산예술대학교, 우송정보대학, 용인대학교,
  용인예술과학대학교, 유원대학교)은 아직 세부 조사를 시작하지 못한
  순수 미확인 스텁이다. 학교 측 확인 후 존치 여부를 재검토할 것.
- 목록은 계속 늘어나는 중이며 완전하다고 주장하지 않는다(`tests/coverage.test.js`
  참고 — 검증된 학교 수가 실수로 줄어드는 회귀만 잡는다).
- `docs/data-sources.md`에 학교별 확인 이력(날짜·출처 URL·확인 방법)이 전부 기록돼 있다.

## 구조

- `js/schema.js` · `js/filter.js` · `js/conflict.js` — DOM을 모르는 순수 로직
- `js/ui/*.js` — 화면 (렌더 함수는 DOM 요소를 반환)
- `js/data.js` — 원격 → 캐시 → 스냅샷 폴백
- `data/schools/*.json` — 정본 / `data/snapshot.js` — 생성물

## 제약

- ES 모듈·fetch를 초기 로드에 쓰지 않는다 (`file://`에서 CORS로 차단됨) —
  모든 JS는 클래식 `<script>` 태그로 로드된다
- npm 의존성 0개
- 요강 PDF는 재배포하지 않고 입학처 링크로만 연결한다
- 학교 존재 여부·수치가 불확실하면 목록에서 빼는 대신 낮은 확인 등급과
  경고 문구로 정직하게 표시한다(단, 애초에 존재한 적 없는 학과는 제외 —
  `docs/data-sources.md`에 두 건의 삭제 사례가 기록돼 있다)

## 다음 단계

2단계: Node.js + JDK + Android Studio 설치 → Capacitor로 안드로이드 래핑 →
AdMob 연동 → Play 출시. 설계는 `docs/superpowers/specs/` 참고.

세부 요강 채우기(Task 14)는 계속 진행 중인 반복 작업이다 — 남은 `미확인`/
`부분확인` 학교를 마저 조사하거나, 시간이 지나 학년도가 바뀐 데이터를
갱신하려면 `docs/superpowers/plans/`의 Task 14 브리프를 참고해 같은 절차
(원문 확인 → 정식 반영비율표 우선 → 불확실하면 null)를 반복하면 된다.
