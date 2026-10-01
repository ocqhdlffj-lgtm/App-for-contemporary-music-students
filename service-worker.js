// 오프라인에서도 앱 셸(화면 그리는 코드)은 항상 뜨게 하고, 학교 데이터
// (data/snapshot.js)만 온라인일 때 최신으로 갱신한다. 둘을 같은 전략으로
// 캐싱하면 "새 학교 추가했는데 사용자는 옛날 목록만 본다"가 되거나,
// 반대로 "오프라인에서는 흰 화면만 뜬다"가 되므로 전략을 분리한다.
var SHELL_CACHE = 'pm-shell-v1';
var SHELL_FILES = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './js/ns.js',
  './js/schema.js',
  './js/conflict.js',
  './js/filter.js',
  './js/storage.js',
  './js/data.js',
  './js/ui/components.js',
  './js/ui/list.js',
  './js/ui/filterbar.js',
  './js/ui/detail.js',
  './js/ui/mylist.js',
  './js/ui/compare.js',
  './js/ui/sightreading.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== SHELL_CACHE; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // 학교 데이터: 온라인이면 항상 최신을 받아오고, 실패(오프라인)할 때만
  // 마지막으로 받아둔 캐시로 대체한다 — "확인 수준"이 오래된 채로 고정되는
  // 걸 막기 위함(README의 "목록은 계속 늘어나는 중" 원칙과 동일).
  if (url.indexOf('/data/snapshot.js') >= 0) {
    event.respondWith(
      fetch(event.request).then(function (res) {
        var copy = res.clone();
        caches.open(SHELL_CACHE).then(function (cache) { cache.put(event.request, copy); });
        return res;
      }).catch(function () { return caches.match(event.request); })
    );
    return;
  }

  // 그 외 앱 셸 파일: 캐시 우선, 없으면 네트워크 — 오프라인에서도 화면 자체는
  // 항상 뜨게 하는 것이 목적.
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
