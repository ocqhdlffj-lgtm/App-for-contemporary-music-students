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
