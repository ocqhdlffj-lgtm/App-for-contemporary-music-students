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
