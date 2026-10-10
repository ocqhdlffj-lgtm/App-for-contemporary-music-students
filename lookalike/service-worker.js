// 앱 셸은 캐시 우선으로 오프라인에서도 뜨게 한다(직접 선택 모드는 오프라인에서
// 완전히 동작). 사진 분석용 MediaPipe 라이브러리·모델은 다른 출처(CDN)라
// 여기서 캐싱하지 않고 브라우저 HTTP 캐시에 맡긴다.
//
// 같은 출처에 루트의 입시 앱(pm-shell-*)도 있으므로, 정리할 때는 이 앱의
// 접두어(la-shell-)가 붙은 옛 캐시만 지운다.
var PREFIX = 'la-shell-';
var SHELL_CACHE = PREFIX + 'v3';
var SHELL_FILES = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './js/ns.js',
  './js/features.js',
  './js/profile.js',
  './js/styling.js',
  './js/match.js',
  './data/celebs.js',
  './data/celebs-measured.js',
  './js/storage.js',
  './js/detector.js',
  './js/ui/components.js',
  './js/ui/home.js',
  './js/ui/photo.js',
  './js/ui/quiz.js',
  './js/ui/review.js',
  './js/ui/color.js',
  './js/ui/result.js',
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
        keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== SHELL_CACHE; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(SHELL_CACHE).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        return cached || fetch(event.request);
      });
    })
  );
});
