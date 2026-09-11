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

      // 결과는 DOM(resultsEl/summaryEl)에 렌더링된다.
      // 실행은 비동기이므로 이 함수는 동기적으로 반환할 값이 없다.
      next();
    }
  };
})();
