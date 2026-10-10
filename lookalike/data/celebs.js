// 닮은꼴 후보 연예인.
//
// ⚠ 이 앱은 연예인 사진을 갖고 있지 않고 얼굴 인식으로 비교하지도 않는다.
// 아래 태그는 "OO상"처럼 매체·커뮤니티에서 흔히 쓰는 인상 분류와 겉으로
// 보이는 특징을 사람이 주관적으로 옮긴 재미용 값이며, 공식 정보가 아니다.
// 사용자의 특징 벡터를 이 태그로 만든 벡터와 비교해 가까운 순서로 보여준다.
//
// 필드
//   animal    필수. js/profile.js의 ANIMALS 키(dog/cat/fox/rabbit/bear/dino/deer).
//             벡터의 출발점이 이 동물상 원형이다.
//   faceShape oval/round/square/long/heart — 있으면 얼굴 길이·턱 축을 덮어쓴다.
//   eyeTilt   up/flat/down, eyeRound·eyeSize·lipFull high/mid/low — 있으면 해당 축을 덮어쓴다.
//             확신이 없는 태그는 비워 두고 동물상 원형 값을 그대로 쓴다.
//   alt       Commons 파일 이름에 쓰이는 다른 표기들(파일 이름에 이 이름이 있어야 본인 사진으로 본다).
//   en        영문 이름. 측정 도구(tools/measure-celebs.html)가 위키미디어 커먼즈 검색에 쓴다.
//   mood      스타일링 화면의 "OO처럼 연출하기"에 쓰는 무드 키(js/styling.js의 MOODS).
//
// 추가·수정 후에는 lookalike/tests/index.html을 열어 검증 테스트가 통과하는지 본다.
window.LA = window.LA || {};
window.LA.CELEBS = [
  // ── 여성 ──
  { id: 'park-boyoung', en: 'Park Bo-young', alt: ['Park Boyoung'], name: '박보영', gender: 'F', job: '배우', animal: 'dog', faceShape: 'round', eyeTilt: 'down', eyeRound: 'high', eyeSize: 'high', mood: 'lovely' },
  { id: 'han-hyojoo', en: 'Han Hyo-joo', alt: ['Han Hyojoo'], name: '한효주', gender: 'F', job: '배우', animal: 'dog', faceShape: 'oval', eyeTilt: 'down', mood: 'pure' },
  { id: 'suzy', en: 'Bae Suzy', alt: ['Suzy', 'Bae Suzy'], name: '수지', gender: 'F', job: '가수·배우', animal: 'dog', faceShape: 'oval', eyeSize: 'high', mood: 'pure' },
  { id: 'jennie', en: 'Jennie Kim', alt: ['Jennie', 'Jennie Kim'], name: '제니', gender: 'F', job: 'BLACKPINK', animal: 'cat', eyeTilt: 'up', mood: 'hip' },
  { id: 'han-yeseul', en: 'Han Ye-seul', alt: ['Han Yeseul'], name: '한예슬', gender: 'F', job: '배우', animal: 'cat', faceShape: 'oval', eyeTilt: 'up', eyeSize: 'high', lipFull: 'high', mood: 'glam' },
  { id: 'lee-hyori', en: 'Lee Hyori', alt: ['Lee Hyori', 'Hyori'], name: '이효리', gender: 'F', job: '가수', animal: 'cat', faceShape: 'oval', eyeTilt: 'up', lipFull: 'high', mood: 'confident' },
  { id: 'yeji', en: 'Hwang Ye-ji', alt: ['Yeji', 'Hwang Yeji'], name: '예지', gender: 'F', job: 'ITZY', animal: 'fox', faceShape: 'heart', eyeTilt: 'up', eyeRound: 'low', mood: 'girlcrush' },
  { id: 'nayeon', en: 'Im Na-yeon', alt: ['Nayeon', 'Im Nayeon'], name: '나연', gender: 'F', job: 'TWICE', animal: 'rabbit', faceShape: 'round', eyeRound: 'high', eyeSize: 'high', mood: 'fresh' },
  { id: 'yoona', en: 'Im Yoon-ah', alt: ['Yoona', 'Im Yoona', 'Yoon-a'], name: '윤아', gender: 'F', job: '소녀시대', animal: 'deer', faceShape: 'oval', eyeSize: 'high', eyeRound: 'high', mood: 'elegant' },
  { id: 'go-ara', en: 'Go Ara', alt: ['Go Ara', 'Ko Ara'], name: '고아라', gender: 'F', job: '배우', animal: 'deer', faceShape: 'oval', eyeSize: 'high', mood: 'natural' },

  // ── 남성 ──
  { id: 'song-joongki', en: 'Song Joong-ki', alt: ['Song Joongki'], name: '송중기', gender: 'M', job: '배우', animal: 'dog', faceShape: 'oval', eyeTilt: 'down', eyeRound: 'high', mood: 'boyish' },
  { id: 'park-bogum', en: 'Park Bo-gum', alt: ['Park Bogum'], name: '박보검', gender: 'M', job: '배우', animal: 'dog', faceShape: 'oval', eyeTilt: 'down', mood: 'clean' },
  { id: 'kang-daniel', en: 'Kang Daniel', alt: ['Kang Daniel'], name: '강다니엘', gender: 'M', job: '가수', animal: 'dog', eyeTilt: 'down', eyeSize: 'mid', mood: 'boyish' },
  { id: 'baekhyun', en: 'Byun Baek-hyun', alt: ['Baekhyun', 'Byun Baekhyun'], name: '백현', gender: 'M', job: 'EXO', animal: 'dog', eyeTilt: 'down', mood: 'boyish' },
  { id: 'jung-haein', en: 'Jung Hae-in', alt: ['Jung Haein', 'Jeong Hae-in'], name: '정해인', gender: 'M', job: '배우', animal: 'dog', faceShape: 'oval', eyeTilt: 'down', mood: 'warm' },
  { id: 'kang-dongwon', en: 'Gang Dong-won', alt: ['Kang Dong-won', 'Kang Dongwon', 'Gang Dongwon'], name: '강동원', gender: 'M', job: '배우', animal: 'cat', eyeTilt: 'up', mood: 'chic' },
  { id: 'lee-joongi', en: 'Lee Joon-gi', alt: ['Lee Joongi', 'Lee Jun-ki', 'Lee Junki'], name: '이준기', gender: 'M', job: '배우', animal: 'fox', faceShape: 'heart', eyeTilt: 'up', eyeRound: 'low', mood: 'charisma' },
  { id: 'jungkook', en: 'Jeon Jung-kook', alt: ['Jungkook', 'Jeon Jungkook'], name: '정국', gender: 'M', job: 'BTS', animal: 'rabbit', eyeRound: 'high', eyeSize: 'high', mood: 'fresh' },
  { id: 'ma-dongseok', en: 'Ma Dong-seok', alt: ['Ma Dongseok', 'Don Lee'], name: '마동석', gender: 'M', job: '배우', animal: 'bear', faceShape: 'square', mood: 'sturdy' },
  { id: 'cho-jinwoong', en: 'Cho Jin-woong', alt: ['Cho Jinwoong', 'Jo Jin-woong', 'Jo Jinwoong'], name: '조진웅', gender: 'M', job: '배우', animal: 'bear', faceShape: 'round', mood: 'sturdy' },
  { id: 'kim-woobin', en: 'Kim Woo-bin', alt: ['Kim Woobin'], name: '김우빈', gender: 'M', job: '배우', animal: 'dino', faceShape: 'long', mood: 'intense' },
  { id: 'gong-yoo', en: 'Gong Yoo', alt: ['Gong Yoo'], name: '공유', gender: 'M', job: '배우', animal: 'dino', faceShape: 'long', eyeTilt: 'down', mood: 'dandy' }
];
