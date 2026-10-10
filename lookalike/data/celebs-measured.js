// 연예인 얼굴 특징 실측값. tools/measure-celebs.html이 위키미디어 커먼즈의 자유 라이선스
// 사진에서 잰 것으로, 사진은 저장하지 않고 측정값과 저작자·라이선스·원문 주소만 담았다.
//
// raw는 한계값(±1)으로 자르기 전의 측정값이다. -1~+1 특징 벡터는 앱이 불러올 때
// js/features.js의 기준값(BASE)으로 계산하므로, 기준값을 고쳐도 이 파일은 그대로 둔다.
//
// 빠진 연예인(jennie, yeji, kang-daniel, baekhyun, lee-joongi, gong-yoo)은 커먼즈에서
// 파일 이름에 이름이 든 정면 무표정 사진을 못 찾아 태그 값을 쓴다. ma-dongseok은 두 사람이
// 함께 찍힌 사진(Lia McHugh & Don Lee) 한 장뿐이라 어느 얼굴을 쟀는지 알 수 없어 뺐다.
// n이 1~2인 연예인은 사진 한 장의 오차가 크다.
window.LA = window.LA || {};

// 실측값을 비교에 쓸지 여부(js/match.js). 끄면 모든 연예인을 인상 태그 값으로 비교한다.
// 기준값(features.js BASE)을 이 측정값에 맞춘 뒤에는, 405가지 얼굴 조합의 1위가 한 명에게
// 쏠리지 않았다(여성 최대 19%, 태그만 쓸 때 21%). 정답 비교 자료는 아직 없다.
window.LA.USE_MEASURED = true;

window.LA.CELEB_MEASURED = {
 "park-boyoung": {
  "raw": {
   "faceRatio": 1.1698,
   "jawRatio": 0.7911,
   "eyeTilt": 6.998,
   "eyeOpen": 0.3614,
   "eyeWidth": 0.1987,
   "lipRatio": 0.3968
  },
  "n": 6,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Park_Boyoung_at_Hi-Five_GV,_13_June_2025_02.jpg",
    "author": "Selfiepod",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Park_Boyoung_at_Hi-Five_GV,_13_June_2025_01.jpg",
    "author": "Selfiepod",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Park_Bo-young_in_June_2025.jpg",
    "author": "Selfiepod",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Park_Bo-young_at_the_2025_Marie_Claire_Asia_Star_Awards.png",
    "author": "Marie Claire Korea",
    "license": "CC BY-SA 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:20210527_Park_Bo-young_%EB%B0%95%EB%B3%B4%EC%98%81_Greetings_for_Viu_(1).jpg",
    "author": "Viu Indonesia",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:20210527_Park_Bo-young_%EB%B0%95%EB%B3%B4%EC%98%81_Greetings_for_Viu_(2).jpg",
    "author": "Viu Indonesia",
    "license": "CC BY 3.0"
   }
  ]
 },
 "han-hyojoo": {
  "raw": {
   "faceRatio": 1.2505,
   "jawRatio": 0.7926,
   "eyeTilt": 5.6517,
   "eyeOpen": 0.3732,
   "eyeWidth": 0.1924,
   "lipRatio": 0.4486
  },
  "n": 1,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Han_Hyo-Joo_in_2013.jpg",
    "author": "wasabcon",
    "license": "CC BY 4.0"
   }
  ]
 },
 "suzy": {
  "raw": {
   "faceRatio": 1.1548,
   "jawRatio": 0.7835,
   "eyeTilt": 6.7326,
   "eyeOpen": 0.3466,
   "eyeWidth": 0.1986,
   "lipRatio": 0.4333
  },
  "n": 4,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Bae_Suzy_at_OB_Beer_Hanmac_%27As_Smooth_As_Possible%27_campaign,_3_April_2024_04.jpg",
    "author": "K-POPIT 케이팝잇 (TV10)",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Bae_Suzy_at_2014_K-Pop_Awards_red_carpet_03.jpg",
    "author": "Idol Story",
    "license": "CC BY 2.0 kr"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Bae_Suzy_at_Premier_for_Suzy%3F_Suzy%3F,_22._Nov._2015_08.jpg",
    "author": "wooyeon724",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Suzy_on_16_December_2013_02.jpg",
    "author": "Suzyhome",
    "license": "CC BY 4.0"
   }
  ]
 },
 "han-yeseul": {
  "raw": {
   "faceRatio": 1.1898,
   "jawRatio": 0.7647,
   "eyeTilt": 8.7879,
   "eyeOpen": 0.3615,
   "eyeWidth": 0.1956,
   "lipRatio": 0.3347
  },
  "n": 1,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Han_Ye-seul_in_February_2024.png",
    "author": "TV10",
    "license": "CC BY 3.0"
   }
  ]
 },
 "lee-hyori": {
  "raw": {
   "faceRatio": 1.1799,
   "jawRatio": 0.7776,
   "eyeTilt": -0.5128,
   "eyeOpen": 0.2499,
   "eyeWidth": 0.1959,
   "lipRatio": 0.6569
  },
  "n": 1,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Lee_Hyori_at_SBS_Inkigayo_in_2007_03.jpg",
    "author": "미디어몽구",
    "license": "CC BY 2.0 kr"
   }
  ]
 },
 "nayeon": {
  "raw": {
   "faceRatio": 1.1859,
   "jawRatio": 0.7749,
   "eyeTilt": 7.8778,
   "eyeOpen": 0.3729,
   "eyeWidth": 0.2026,
   "lipRatio": 0.4639
  },
  "n": 5,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:20230817_Im_Nayeon_for_Pearly_Gates_Korea_01.png",
    "author": "Pearly Gates Korea",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:18092026_NAYEON_Rocca_PhotoCall_4.jpg",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:20250417_Im_Nayeon_03.jpg",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:20230310_Im_Nayeon_09.png",
    "author": "Marie Claire Korea",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:18092026_NAYEON_Rocca_PhotoCall_3.jpg",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 4.0"
   }
  ]
 },
 "yoona": {
  "raw": {
   "faceRatio": 1.1642,
   "jawRatio": 0.7784,
   "eyeTilt": 8.8431,
   "eyeOpen": 0.3755,
   "eyeWidth": 0.1976,
   "lipRatio": 0.3556
  },
  "n": 4,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:YOONA_(%EC%9C%A4%EC%95%84)_-_BALANCE_GAME_-_MARIE_CLAIRE_KOREA_-_2022.06.29.jpg",
    "author": "Marie Claire Korea",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Yoona_in_Marie_Claire_Korea_in_Sep_2021_(8).png",
    "author": "Marie Claire Korea",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:20260922_Yoona_(3).jpg",
    "author": "sublimitas viii",
    "license": "CC BY-SA 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Yoona_in_Marie_Claire_Korea_in_Sep_2021_(10).png",
    "author": "Marie Claire Korea",
    "license": "CC BY 3.0"
   }
  ]
 },
 "go-ara": {
  "raw": {
   "faceRatio": 1.135,
   "jawRatio": 0.7521,
   "eyeTilt": 9.5362,
   "eyeOpen": 0.3841,
   "eyeWidth": 0.1981,
   "lipRatio": 0.4727
  },
  "n": 1,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Go_Ara_in_December_2020.png",
    "author": "Marie Claire Korea",
    "license": "CC BY 3.0"
   }
  ]
 },
 "song-joongki": {
  "raw": {
   "faceRatio": 1.1131,
   "jawRatio": 0.7964,
   "eyeTilt": 2.8502,
   "eyeOpen": 0.3378,
   "eyeWidth": 0.1827,
   "lipRatio": 0.4781
  },
  "n": 3,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Song_Joong-ki_at_the_The_Innocent_Man_production_presentation07.jpg",
    "author": "Rokiei",
    "license": "CC BY 2.0 kr"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Song_Joong_Ki_Blue_Dragon.jpg",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Song_Joong-ki_at_the_The_Innocent_Man_production_presentation15.jpg",
    "author": "Rokiei",
    "license": "CC BY 2.0 kr"
   }
  ]
 },
 "park-bogum": {
  "raw": {
   "faceRatio": 1.1355,
   "jawRatio": 0.8109,
   "eyeTilt": 3.7029,
   "eyeOpen": 0.3508,
   "eyeWidth": 0.1785,
   "lipRatio": 0.3974
  },
  "n": 3,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Park_Bo-gum_%EB%B0%95%EB%B3%B4%EA%B2%80_%E6%9C%B4%E5%AF%B6%E5%8A%8D_for_The_North_Face_in_November_2025_7.png",
    "author": "티비텐 TV10",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Park_Bo-gum_%EB%B0%95%EB%B3%B4%EA%B2%80_%E6%9C%B4%E5%AF%B6%E5%8A%8D_for_The_North_Face_in_November_2025_12.png",
    "author": "티비텐 TV10",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Park_Bo-gum_%EB%B0%95%EB%B3%B4%EA%B2%80_%E6%9C%B4%E5%AF%B6%E5%8A%8D_hosting_the_2022_Republic_of_Korea_Navy_Patriotic_Concert_3.png",
    "author": "케이스타나우 KstarNOW",
    "license": "CC BY 4.0"
   }
  ]
 },
 "jung-haein": {
  "raw": {
   "faceRatio": 1.1795,
   "jawRatio": 0.8013,
   "eyeTilt": 5.8586,
   "eyeOpen": 0.3601,
   "eyeWidth": 0.1818,
   "lipRatio": 0.3482
  },
  "n": 3,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jung_Hae-in_%EC%A0%95%ED%95%B4%EC%9D%B8_in_October_2022.jpg",
    "author": "Marie Claire Korea",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jung_Hae-in_%EC%A0%95%ED%95%B4%EC%9D%B8_2024_03.jpg",
    "author": "티비텐",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jung_Hae-in_at_Bvlgari_event_in_March_2025_02.jpg",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 3.0"
   }
  ]
 },
 "kang-dongwon": {
  "raw": {
   "faceRatio": 1.1238,
   "jawRatio": 0.797,
   "eyeTilt": 7.7963,
   "eyeOpen": 0.3353,
   "eyeWidth": 0.1939,
   "lipRatio": 0.4325
  },
  "n": 1,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Gang_Dong-won_(%EA%B0%95%EB%8F%99%EC%9B%90)_at_the_production_briefing_session_for_the_film_%22The_Plot%22_(%EC%84%A4%EA%B3%84%EC%9E%90)_on_April_29,_2024.png",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 3.0"
   }
  ]
 },
 "jungkook": {
  "raw": {
   "faceRatio": 1.1497,
   "jawRatio": 0.7849,
   "eyeTilt": 7.2106,
   "eyeOpen": 0.3859,
   "eyeWidth": 0.1899,
   "lipRatio": 0.3204
  },
  "n": 6,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jung_Kook_of_BTS,_February_12,_2026_(4).png",
    "author": "TV10",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jungkook_at_Gaon_Chart_Music_Awards,_22_February_2017_02.png",
    "author": "Divine Treasure",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jungkook_at_Gaon_Chart_Music_Awards,_22_February_2017_01.png",
    "author": "Divine Treasure",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jung_Kook_of_BTS,_February_12,_2026_(7).png",
    "author": "Marie Claire Korea",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jung_Kook_of_BTS,_February_12,_2026_(1).png",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Jung_Kook_of_BTS,_February_12,_2026_(3).png",
    "author": "TV10",
    "license": "CC BY 4.0"
   }
  ]
 },
 "cho-jinwoong": {
  "raw": {
   "faceRatio": 1.125,
   "jawRatio": 0.8232,
   "eyeTilt": 4.7413,
   "eyeOpen": 0.3061,
   "eyeWidth": 0.1836,
   "lipRatio": 0.2672
  },
  "n": 2,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:ChoJin-woong_at_news_conference_of_movie_%EC%82%AC%EB%83%A5.jpg",
    "author": "Shane981128",
    "license": "CC BY-SA 4.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Actor_Cho_Jin-woong_arrives_at_the_red_carpet_event_of_the_Pifan_in_Bucheon_on_July_17,_2014.jpg",
    "author": "https://www.flickr.com/photos/koreanet",
    "license": "CC BY-SA 2.0"
   }
  ]
 },
 "kim-woobin": {
  "raw": {
   "faceRatio": 1.2325,
   "jawRatio": 0.7936,
   "eyeTilt": 6.2064,
   "eyeOpen": 0.3376,
   "eyeWidth": 0.1946,
   "lipRatio": 0.3045
  },
  "n": 2,
  "sources": [
   {
    "page": "https://commons.wikimedia.org/wiki/File:Kim_Woo-bin_in_March_2024.jpg",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 3.0"
   },
   {
    "page": "https://commons.wikimedia.org/wiki/File:Kim_Woo-bin_in_2026.png",
    "author": "K-POPIT 케이팝잇",
    "license": "CC BY 4.0"
   }
  ]
 }
};
