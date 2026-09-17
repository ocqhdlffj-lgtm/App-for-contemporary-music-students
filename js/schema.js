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

    // 미확인 등급은 minCsat 키 자체를 가질 수 없음 — 추측 금지.
    // 필터/상세 화면은 'minCsat' in t 로 존재 여부를 판단하므로,
    // 값이 null이어도 키가 있으면 "확인됨: 수능최저 없음"으로 오인된다.
    if (v.level === '미확인' && 'minCsat' in t) {
      errors.push(at + ': 미확인 전형은 minCsat을 가질 수 없음(추측 금지) — 확인 안 됐으면 키 자체를 생략할 것');
    }

    if (t.ratio != null) {
      var sum = 0;
      var ratioInvalid = false;
      Object.keys(t.ratio).forEach(function (k) {
        var n = Number(t.ratio[k]);
        if (!isFinite(n)) {
          errors.push(at + '.ratio.' + k + ': 숫자가 아님 (' + t.ratio[k] + ')');
          ratioInvalid = true;
        } else {
          sum += n;
        }
      });
      if (!ratioInvalid && sum !== 100) errors.push(at + '.ratio: 합계가 100이어야 함 (현재 ' + sum + ')');
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

    // 거짓 확신 차단 — 빈 객체({})는 null과 마찬가지로 값이 없는 것으로 취급한다
    if (v.level === '확인됨') {
      REQUIRED_WHEN_CONFIRMED.forEach(function (k) {
        var val = t[k];
        if (val == null || typeof val !== 'object' || Object.keys(val).length === 0) {
          errors.push(at + ': 확인됨인데 ' + k + '이(가) 비어 있음 — 등급을 낮추거나 값을 채울 것');
        }
      });
      if (t.schedule != null && typeof t.schedule === 'object') {
        if (t.schedule.apply == null) {
          errors.push(at + ': 확인됨인데 schedule.apply가 없음');
        }
        if (t.schedule.practical == null) {
          errors.push(at + ': 확인됨인데 schedule.practical(실기고사일)이 없음 — 실기고사일 충돌 확인 불가');
        }
      }
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
