// 전략: 같은 출처의 모든 GET 요청을 "네트워크 우선, 실패하면 캐시"로 처리한다.
// 온라인이면 코드(JS/CSS/HTML)와 학교 데이터(data/snapshot.js) 모두 항상 최신을
// 받고, 오프라인일 때만 마지막으로 받아둔 캐시로 화면을 띄운다.
//
// 처음에는 앱 셸을 "캐시 우선"으로 저장했는데, 그러면 service-worker.js 자체를
// 고치지 않는 한 설치한 사용자는 코드 수정(필터 버그 수정 등)을 영영 못 받는
// 문제가 있어 바꿨다(로컬에서 디스크에는 새 list.js가 있는데 서비스워커가 붙은
// 브라우저는 옛 코드를 받는 것으로 재현 확인). 캐시 이름을 올려 옛 캐시를 버린다.
var SHELL_CACHE = 'pm-shell-v2';
var SHELL_FILES = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './data/snapshot.js',
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
  var req = event.request;
  if (req.method !== 'GET') return;
  // 구글 폰트 같은 외부 요청은 건드리지 않는다.
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    // no-cache: GitHub Pages의 브라우저 HTTP 캐시(약 10분)에 걸려 낡은 파일을
    // 받지 않도록 매번 서버에 변경 여부를 확인한다(변경 없으면 304로 가볍다).
    fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(SHELL_CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
