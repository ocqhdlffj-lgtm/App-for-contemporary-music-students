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
