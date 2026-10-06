(function (LA) {
  // 사진 → 얼굴 랜드마크. MediaPipe FaceLandmarker를 "사진으로 분석"을 눌렀을
  // 때만 CDN에서 불러온다(약 15MB, 최초 1회). 첫 화면 로딩과 직접 선택 모드는
  // 이 파일의 네트워크 의존성과 무관하게 항상 동작한다.
  //
  // 분석은 전부 브라우저 안(WebAssembly)에서 일어나고 사진은 어디에도
  // 전송되지 않는다. 네트워크로 받는 것은 라이브러리 코드와 모델 파일뿐이다.
  //
  // vision_bundle.js는 전역 Vision을 만드는 IIFE 빌드라서 ES 모듈 없이
  // 클래식 <script>로 불러올 수 있다(이 프로젝트의 "클래식 스크립트만" 원칙).
  var VERSION = '1.0.1';
  var LIB = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@' + VERSION;
  var MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

  var pending = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.crossOrigin = 'anonymous';
      s.onload = resolve;
      s.onerror = function () { reject(new Error('스크립트를 불러오지 못했습니다: ' + src)); };
      document.head.appendChild(s);
    });
  }

  // 같은 세션에서 두 번 눌러도 모델은 한 번만 만든다. 실패하면 캐시를 비워
  // 다음 시도(네트워크 복구 후)에 다시 받게 한다.
  function load() {
    if (pending) return pending;
    pending = (window.Vision ? Promise.resolve() : loadScript(LIB + '/vision_bundle.js'))
      .then(function () { return window.Vision.FilesetResolver.forVisionTasks(LIB + '/wasm'); })
      .then(function (fileset) {
        return window.Vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
          runningMode: 'IMAGE',
          numFaces: 1
        });
      });
    pending.catch(function () { pending = null; });
    return pending;
  }

  // canvas(또는 img) → { landmarks, width, height } | null(얼굴 없음)
  function detect(source) {
    return load().then(function (landmarker) {
      var r = landmarker.detect(source);
      var faces = (r && r.faceLandmarks) || [];
      if (!faces.length) return null;
      return {
        landmarks: faces[0],
        width: source.width || source.naturalWidth,
        height: source.height || source.naturalHeight
      };
    });
  }

  LA.detector = { load: load, detect: detect, VERSION: VERSION, LIB: LIB, MODEL: MODEL };
})(window.LA);
