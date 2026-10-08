// tools/measure-celebs.html이 만든 파일. 사진은 저장하지 않고 측정값과 출처만 담았다.
// 사진은 위키미디어 커먼즈의 자유 라이선스 파일이며, sources에 저작자·라이선스·원문 주소가 있다.
//
// 빠진 연예인(jennie, yeji, nayeon, kang-daniel, baekhyun, lee-joongi, gong-yoo)은
// 커먼즈에서 파일 이름에 이름이 든 정면 무표정 사진을 못 찾아 태그 값을 쓴다.
// ma-dongseok은 두 사람이 함께 찍힌 사진 한 장뿐이라(어느 얼굴을 쟀는지 알 수 없어서) 뺐다.
//
// 이 값은 대부분 사진 한 장에서 잰 것(n=1)이고, 행사에서 멀리 찍은 사진이라
// 셀카와 얼굴 길이 비율이 다르게 나온다. js/match.js의 MEASURED_WEIGHTS 참고.
window.LA = window.LA || {};

// 실측값을 비교에 쓸지 여부. 기본은 꺼 둔다: 이 데이터(대부분 사진 1장, 행사에서
// 멀리 찍은 사진)로 405가지 얼굴 조합의 여성 1위를 세어 보니 이효리 한 명이 34%를
// 차지했고(태그만 쓸 때 최고 21%), 실측이 더 정확하다는 증거도 없다. 사진을 더 모으거나
// 정답 비교로 확인한 뒤에 true로 바꾼다.
window.LA.USE_MEASURED = false;

window.LA.CELEB_MEASURED = {
 "park-boyoung": {
  "vector": { "faceLength": -0.791, "jawWidth": -0.018, "eyeTilt": 0.667, "eyeRound": 0.929, "eyeSize": 0.781, "lipFull": -0.482 },
  "n": 4,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Park_Bo-young_at_the_2025_Marie_Claire_Asia_Star_Awards.png", "author": "Marie Claire Korea", "license": "CC BY-SA 4.0" },
   { "page": "https://commons.wikimedia.org/wiki/File:Park_Bo-young_in_June_2025.jpg", "author": "Selfiepod", "license": "CC BY 4.0" },
   { "page": "https://commons.wikimedia.org/wiki/File:Park_Boyoung_at_Hi-Five_GV,_13_June_2025_02.jpg", "author": "Selfiepod", "license": "CC BY 4.0" },
   { "page": "https://commons.wikimedia.org/wiki/File:Park_Boyoung_at_Hi-Five_GV,_13_June_2025_01.jpg", "author": "Selfiepod", "license": "CC BY 4.0" }
  ]
 },
 "han-hyojoo": {
  "vector": { "faceLength": -0.306, "jawWidth": -0.07, "eyeTilt": 0.562, "eyeRound": 1, "eyeSize": 0.337, "lipFull": 0.29 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Han_Hyo-Joo_in_2013.jpg", "author": "wasabcon", "license": "CC BY 4.0" }
  ]
 },
 "suzy": {
  "vector": { "faceLength": -1, "jawWidth": -0.068, "eyeTilt": 0.611, "eyeRound": 0.579, "eyeSize": 0.462, "lipFull": -0.436 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Bae_Suzy_at_OB_Beer_Hanmac_%27As_Smooth_As_Possible%27_campaign,_3_April_2024_04.jpg", "author": "K-POPIT 케이팝잇 (TV10)", "license": "CC BY 3.0" }
  ]
 },
 "han-yeseul": {
  "vector": { "faceLength": -0.74, "jawWidth": -0.419, "eyeTilt": 0.954, "eyeRound": 1, "eyeSize": 0.471, "lipFull": -0.421 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Han_Ye-seul_in_February_2024.png", "author": "TV10", "license": "CC BY 3.0" }
  ]
 },
 "lee-hyori": {
  "vector": { "faceLength": -0.811, "jawWidth": -0.257, "eyeTilt": -0.209, "eyeRound": -0.173, "eyeSize": 0.482, "lipFull": 1 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Lee_Hyori_at_SBS_Inkigayo_in_2007_03.jpg", "author": "미디어몽구", "license": "CC BY 2.0 kr" }
  ]
 },
 "yoona": {
  "vector": { "faceLength": -0.964, "jawWidth": -0.401, "eyeTilt": 0.904, "eyeRound": 1, "eyeSize": 0.421, "lipFull": -0.177 },
  "n": 2,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:YOONA_(%EC%9C%A4%EC%95%84)_-_BALANCE_GAME_-_MARIE_CLAIRE_KOREA_-_2022.06.29.jpg", "author": "Marie Claire Korea", "license": "CC BY 3.0" },
   { "page": "https://commons.wikimedia.org/wiki/File:Yoona_in_Marie_Claire_Korea_in_Sep_2021_(8).png", "author": "Marie Claire Korea", "license": "CC BY 3.0" }
  ]
 },
 "go-ara": {
  "vector": { "faceLength": -1, "jawWidth": -0.577, "eyeTilt": 1, "eyeRound": 1, "eyeSize": 0.573, "lipFull": 0.441 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Go_Ara_in_December_2020.png", "author": "Marie Claire Korea", "license": "CC BY 3.0" }
  ]
 },
 "song-joongki": {
  "vector": { "faceLength": -1, "jawWidth": 0.034, "eyeTilt": 0.024, "eyeRound": 0.613, "eyeSize": 0.121, "lipFull": 1 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Song_Joong-ki_at_the_The_Innocent_Man_production_presentation07.jpg", "author": "Rokiei", "license": "CC BY 2.0 kr" }
  ]
 },
 "park-bogum": {
  "vector": { "faceLength": -1, "jawWidth": 0.188, "eyeTilt": 0.294, "eyeRound": 1, "eyeSize": -0.315, "lipFull": 0.278 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Park_Bo-gum_%EB%B0%95%EB%B3%B4%EA%B2%80_%E6%9C%B4%E5%AF%B6%E5%8A%8D_for_The_North_Face_in_November_2025_7.png", "author": "티비텐 TV10", "license": "CC BY 4.0" }
  ]
 },
 "jung-haein": {
  "vector": { "faceLength": -0.813, "jawWidth": 0.039, "eyeTilt": 0.588, "eyeRound": 0.991, "eyeSize": -0.105, "lipFull": -0.337 },
  "n": 3,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Jung_Hae-in_%EC%A0%95%ED%95%B4%EC%9D%B8_in_October_2022.jpg", "author": "Marie Claire Korea", "license": "CC BY 3.0" },
   { "page": "https://commons.wikimedia.org/wiki/File:Jung_Hae-in_%EC%A0%95%ED%95%B4%EC%9D%B8_2024_03.jpg", "author": "티비텐", "license": "CC BY 3.0" },
   { "page": "https://commons.wikimedia.org/wiki/File:Jung_Hae-in_at_Bvlgari_event_in_March_2025_02.jpg", "author": "K-POPIT 케이팝잇", "license": "CC BY 3.0" }
  ]
 },
 "kang-dongwon": {
  "vector": { "faceLength": -1, "jawWidth": -0.015, "eyeTilt": 0.83, "eyeRound": 0.775, "eyeSize": 0.401, "lipFull": 0.19 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Gang_Dong-won_(%EA%B0%95%EB%8F%99%EC%9B%90)_at_the_production_briefing_session_for_the_film_%22The_Plot%22_(%EC%84%A4%EA%B3%84%EC%9E%90)_on_April_29,_2024.png", "author": "K-POPIT 케이팝잇", "license": "CC BY 3.0" }
  ]
 },
 "jungkook": {
  "vector": { "faceLength": -1, "jawWidth": -0.204, "eyeTilt": 0.994, "eyeRound": 1, "eyeSize": 0.012, "lipFull": -0.644 },
  "n": 1,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Jung_Kook_of_BTS,_February_12,_2026_(4).png", "author": "TV10", "license": "CC BY 4.0" }
  ]
 },
 "cho-jinwoong": {
  "vector": { "faceLength": -0.855, "jawWidth": 0.312, "eyeTilt": 0.448, "eyeRound": 0.451, "eyeSize": -0.03, "lipFull": -0.834 },
  "n": 2,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:ChoJin-woong_at_news_conference_of_movie_%EC%82%AC%EB%83%A5.jpg", "author": "Shane981128", "license": "CC BY-SA 4.0" },
   { "page": "https://commons.wikimedia.org/wiki/File:Actor_Cho_Jin-woong_arrives_at_the_red_carpet_event_of_the_Pifan_in_Bucheon_on_July_17,_2014.jpg", "author": "https://www.flickr.com/photos/koreanet", "license": "CC BY-SA 2.0" }
  ]
 },
 "kim-woobin": {
  "vector": { "faceLength": -0.435, "jawWidth": -0.058, "eyeTilt": 0.631, "eyeRound": 0.801, "eyeSize": 0.428, "lipFull": -0.61 },
  "n": 2,
  "sources": [
   { "page": "https://commons.wikimedia.org/wiki/File:Kim_Woo-bin_in_March_2024.jpg", "author": "K-POPIT 케이팝잇", "license": "CC BY 3.0" },
   { "page": "https://commons.wikimedia.org/wiki/File:Kim_Woo-bin_in_2026.png", "author": "K-POPIT 케이팝잇", "license": "CC BY 4.0" }
  ]
 }
};
