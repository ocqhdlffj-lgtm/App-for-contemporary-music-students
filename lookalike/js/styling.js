(function (LA) {
  // 베스트 스타일링 추천. 순수 로직 — 입력(특징 벡터·성별·퍼스널컬러·
  // 닮은꼴 연예인)만 보고 화면에 그릴 문장 묶음을 돌려준다.
  //
  // 규칙의 근거는 흔히 쓰는 얼굴형별 헤어·안경 공식(둥근형은 세로 라인,
  // 각진형은 곡선 등)과 동물상별 이미지 연출 관행이다. 정답이 아니라
  // 출발점이라는 점은 화면 하단 문구로 밝힌다.

  var HAIR = {
    F: {
      oval: {
        why: '이마·광대·턱 비율이 고른 얼굴형이라 대부분의 스타일이 잘 어울려요.',
        best: ['쇄골 기장 레이어드 C컬', '이마를 드러낸 긴 웨이브', '턱선 보브 단발'],
        avoid: ['얼굴을 다 가리는 무거운 일자 앞머리 — 장점인 균형감이 가려져요']
      },
      round: {
        why: '세로 라인을 만들고 볼 옆을 살짝 가리면 얼굴이 갸름해 보여요.',
        best: ['정수리 볼륨을 살린 롱 레이어드', '광대를 살짝 덮는 사이드뱅', '쇄골 아래 S컬 웨이브'],
        avoid: ['턱선에서 끝나는 동그란 단발', '두꺼운 풀뱅', '옆으로 넓게 퍼지는 볼륨']
      },
      square: {
        why: '각진 턱선을 부드러운 곡선으로 감싸 주는 게 핵심이에요.',
        best: ['턱선 아래로 떨어지는 굵은 웨이브', '얼굴선을 따라 흐르는 레이어드컷', '시스루뱅으로 이마 라인 완화'],
        avoid: ['턱선 길이 일자 단발', '얼굴을 다 드러낸 올백 포니테일']
      },
      long: {
        why: '세로 길이를 나눠 주고 옆 볼륨을 더하면 비율이 좋아 보여요.',
        best: ['시스루뱅·풀뱅으로 이마 길이 분할', '옆 볼륨을 살린 중단발 C컬', '턱선 보브 단발'],
        avoid: ['정수리 볼륨을 높게 띄우는 스타일', '가운데 가르마 긴 생머리']
      },
      heart: {
        why: '넓은 이마는 덜어 주고 갸름한 턱 주변에 볼륨을 주면 균형이 맞아요.',
        best: ['턱선~어깨 기장 C컬 단발', '사이드 가르마 + 시스루뱅', '아래쪽에 볼륨을 준 히피펌'],
        avoid: ['정수리 볼륨 업스타일', '귀 위로 짧은 숏컷']
      }
    },
    M: {
      oval: {
        why: '균형 잡힌 얼굴형이라 이마를 드러내 장점을 살리기 좋아요.',
        best: ['애즈펌', '포마드·가르마 스타일', '리프컷'],
        avoid: ['얼굴을 다 덮는 무거운 바가지 머리']
      },
      round: {
        why: '정수리를 세우고 옆을 정리해 세로 라인을 만드는 게 포인트예요.',
        best: ['투블럭 + 업스타일(포마드)', '한쪽 이마를 드러낸 쉼표머리', '정수리 볼륨 가르마펌'],
        avoid: ['옆머리 볼륨이 큰 스타일', '이마를 다 덮는 일자 앞머리']
      },
      square: {
        why: '앞·옆머리에 곡선을 주면 각진 턱선이 부드러워 보여요.',
        best: ['옆선을 덮는 리프컷', '웨이브 가르마펌', '자연스러운 쉼표머리'],
        avoid: ['짧은 스포츠머리', '옆을 바짝 친 각진 투블럭']
      },
      long: {
        why: '앞머리로 세로 길이를 끊고 옆 볼륨을 주면 얼굴이 짧아 보여요.',
        best: ['앞머리를 내린 댄디컷', '시스루 댄디펌', '옆 볼륨 애즈펌'],
        avoid: ['높게 세운 올백', '정수리만 띄운 스타일']
      },
      heart: {
        why: '좁은 턱 쪽으로 시선이 가도록 옆·아래 볼륨을 주는 게 좋아요.',
        best: ['옆 볼륨 리프컷', '내린 앞머리 + 볼륨펌', '가르마 애즈펌'],
        avoid: ['옆을 너무 짧게 친 투블럭', '정수리만 높게 세운 스타일']
      }
    }
  };

  var MAKEUP = {
    eyeTilt: {
      up: '아이라인: 점막을 채우고 꼬리를 위로 2~3mm 빼는 캣라인으로 눈매를 살려요.',
      flat: '아이라인: 점막만 채우고 꼬리는 짧게 — 또렷하지만 과하지 않게.',
      down: '아이라인: 꼬리를 살짝 아래로 빼는 강아지 라인으로 순한 매력을 극대화해요.'
    },
    eyeRound: {
      high: '섀도: 애교살을 펄로 밝혀 동그란 눈매를 강조해요.',
      mid: '섀도: 아이홀에 브라운 한 톤을 넓게 펴 주세요.',
      low: '섀도: 언더 눈꼬리 삼각존에 음영을 넣어 긴 눈에 깊이를 더해요.'
    },
    lipFull: {
      high: '립: MLBB 컬러를 입술 전체에 채워 도톰함을 고급스럽게.',
      mid: '립: 글로시 틴트로 생기만 더해도 충분해요.',
      low: '립: 안쪽을 진하게 채운 그라데이션 + 윤곽 1mm 오버립.'
    },
    blush: {
      dog: '블러셔: 애플존에 동그랗게 — 사랑스러움이 살아나요.',
      rabbit: '블러셔: 애플존에 동그랗게 — 사랑스러움이 살아나요.',
      cat: '블러셔: 광대 위에서 관자놀이 쪽 사선으로 — 세련된 윤곽.',
      fox: '블러셔: 광대 위에서 관자놀이 쪽 사선으로 — 세련된 윤곽.',
      deer: '블러셔: 눈 밑에서 광대까지 넓고 연하게 — 맑은 생기.',
      bear: '블러셔: 볼 중앙에 은은하게, 쉐딩은 턱선에만 살짝.',
      dino: '블러셔: 사선으로 길게, 콧대 하이라이트로 이목구비를 강조해요.'
    }
  };

  var GROOMING = {
    eyeTilt: {
      up: '눈썹: 꼬리 잔털을 정리해 날렵한 눈매 라인을 살려요.',
      flat: '눈썹: 일자 결로 정리해 깔끔하게.',
      down: '눈썹: 결을 위로 빗어 자연스럽게 — 순한 인상과 잘 맞아요.'
    },
    base: '피부: 톤업 선크림이나 비비로 피부결만 정리해도 인상이 맑아져요.',
    lip: '입술: 무색 립밤으로 각질만 정리해도 얼굴이 생기 있어 보여요.',
    animal: {
      dog: '눈가: 컨실러로 다크서클만 가려도 맑은 눈매가 살아나요.',
      rabbit: '눈가: 컨실러로 다크서클만 가려도 맑은 눈매가 살아나요.',
      deer: '눈가: 컨실러로 다크서클만 가려도 맑은 눈매가 살아나요.',
      cat: '쉐딩: 광대 아래를 아주 얇게 — 날렵한 턱선이 강조돼요.',
      fox: '쉐딩: 광대 아래를 아주 얇게 — 날렵한 턱선이 강조돼요.',
      bear: '수염: 면도 라인을 깔끔하게 — 듬직함이 정돈돼 보여요.',
      dino: '수염: 면도 라인을 깔끔하게 — 시원한 턱선이 살아나요.'
    }
  };

  var FASHION = {
    dog: {
      keyword: '소프트 캐주얼',
      F: ['파스텔 톤 니트·카디건', '플리츠 스커트 + 로퍼', '부드러운 소재의 셔츠 원피스'],
      M: ['오버핏 니트·후드', '연청 데님 + 화이트 스니커즈', '체크 셔츠 레이어드'],
      tip: '부드러운 소재와 둥근 실루엣이 순한 인상과 잘 맞아요.'
    },
    cat: {
      keyword: '시크 모던',
      F: ['블랙 슬림 원피스', '크롭 테일러드 재킷', '레더 스커트 + 앵클부츠'],
      M: ['블랙 터틀넥', '테일러드 재킷 + 슬랙스', '모노톤 셋업'],
      tip: '모노톤과 선명한 라인으로 도도한 눈매를 살려요.'
    },
    fox: {
      keyword: '도회적 무드',
      F: ['실키한 슬립 드레스', '하이웨이스트 와이드 슬랙스', '골드 포인트 액세서리'],
      M: ['단추 하나 푼 실크 셔츠', '롱 코트 + 슬림 슬랙스', '첼시 부츠'],
      tip: '광택 있는 소재와 긴 실루엣이 매혹적인 눈매와 잘 어울려요.'
    },
    rabbit: {
      keyword: '상큼 발랄',
      F: ['카라 블라우스', 'A라인 미니스커트', '원색 포인트 가방'],
      M: ['스트라이프 셔츠', '컬러 맨투맨', '밝은 컬러 스니커즈'],
      tip: '밝은 컬러 하나를 포인트로 넣으면 생기가 살아나요.'
    },
    bear: {
      keyword: '포근 내추럴',
      F: ['오버핏 코트', '롱 플리츠 스커트', '어스톤 니트'],
      M: ['워크 재킷', '오버핏 셔츠 + 와이드 팬츠', '어스톤 니트'],
      tip: '여유 있는 핏과 브라운·카키 계열로 듬직함을 멋으로 바꿔요.'
    },
    dino: {
      keyword: '시원한 스트릿',
      F: ['오버사이즈 셔츠', '와이드 데님', '볼캡 + 청키 스니커즈'],
      M: ['레더·블루종 재킷', '와이드 카고 팬츠', '레이어드 티셔츠'],
      tip: '볼륨감 있는 아이템이 시원한 이목구비와 균형을 맞춰요.'
    },
    deer: {
      keyword: '우아 내추럴',
      F: ['롱 원피스', '린넨 셔츠 + 와이드 팬츠', '뉴트럴 톤 트렌치코트'],
      M: ['린넨 셔츠', '니트 베스트 레이어드', '베이지 슬랙스'],
      tip: '흐르는 소재와 뉴트럴 톤으로 맑고 우아한 분위기를 살려요.'
    }
  };

  var COLORS = {
    warm: {
      title: '웜톤 베스트 컬러',
      swatches: [
        { name: '코랄', hex: '#FF7F6B' }, { name: '피치', hex: '#FFB38A' },
        { name: '카멜', hex: '#C19A6B' }, { name: '올리브', hex: '#808C4A' },
        { name: '아이보리', hex: '#F6EEDC' }, { name: '브릭', hex: '#B5543C' }
      ],
      tip: '코랄·오렌지 브라운 계열 메이크업과 골드 액세서리가 얼굴을 환하게 해요.'
    },
    cool: {
      title: '쿨톤 베스트 컬러',
      swatches: [
        { name: '라벤더', hex: '#B6A6E0' }, { name: '로즈핑크', hex: '#E4789E' },
        { name: '네이비', hex: '#233A6B' }, { name: '차콜', hex: '#3F4148' },
        { name: '퓨어화이트', hex: '#FAFAFF' }, { name: '버건디', hex: '#7A1F3D' }
      ],
      tip: '로즈·플럼 계열 메이크업과 실버 액세서리가 피부를 맑아 보이게 해요.'
    },
    neutral: {
      title: '뉴트럴 베스트 컬러',
      swatches: [
        { name: '오프화이트', hex: '#F4F1EA' }, { name: '베이지', hex: '#E5D3B3' },
        { name: '그레이지', hex: '#A79E94' }, { name: '데님블루', hex: '#4A6FA5' },
        { name: '소프트블랙', hex: '#2B2B2E' }, { name: '더스티로즈', hex: '#C98B8B' }
      ],
      tip: '웜·쿨 신호가 섞여 있어요. 너무 쨍하지 않은 중간 톤이 무난해요.'
    }
  };

  var ACCESSORIES = {
    oval: { glasses: '웰링턴·보스턴 등 대부분의 프레임', F: '드롭 귀걸이로 포인트를 줘도 좋아요', M: '볼캡·버킷햇 모두 잘 어울려요' },
    round: { glasses: '각진 스퀘어·웰링턴 프레임', F: '세로로 긴 드롭 귀걸이', M: '챙이 단단한 볼캡' },
    square: { glasses: '둥근 라운드·보스턴 프레임', F: '동그란 링·후프 귀걸이', M: '둥근 버킷햇' },
    long: { glasses: '세로 폭이 넓은 오버사이즈 프레임', F: '볼드한 스터드·짧은 후프 귀걸이', M: '챙 넓은 버킷햇·비니로 길이 분할' },
    heart: { glasses: '아래쪽이 넓거나 하금테·무테 프레임', F: '물방울(티어드롭) 귀걸이', M: '너무 깊게 눌러쓰지 않는 볼캡' }
  };

  // 연예인의 분위기 키 → "OO처럼 연출하기" 팁. data/celebs.js의 mood가 이 키를 쓴다.
  var MOODS = {
    lovely: { label: '러블리', tips: ['코랄·핑크 블러셔를 동그랗게', '리본·프릴 같은 사랑스러운 디테일 하나', '웃는 눈매가 살아나는 옅은 아이라인'] },
    pure: { label: '청순', tips: ['피부는 촉촉하게, 색조는 최소로', '화이트·아이보리 셔츠', '자연스러운 생머리나 굵은 C컬'] },
    hip: { label: '힙', tips: ['오버핏과 크롭을 섞은 믹스매치', '볼드한 액세서리·볼캡으로 포인트', '눈꼬리 라인을 살짝 길게'] },
    glam: { label: '화려', tips: ['광택 있는 소재나 선명한 컬러 하나', '풍성한 웨이브 헤어', '립 컬러를 존재감 있게'] },
    confident: { label: '당당·건강미', tips: ['윤기 있는 건강한 피부 표현', '몸선이 드러나는 심플한 핏', '자신감 있는 표정과 큰 웃음'] },
    girlcrush: { label: '걸크러시', tips: ['블랙·레더 아이템', '또렷하게 뺀 아이라인', '포니테일이나 스트레이트 헤어'] },
    fresh: { label: '상큼', tips: ['밝은 원색 포인트 하나', '글로시한 입술과 맑은 눈가', '캐주얼한 스니커즈 룩'] },
    elegant: { label: '우아', tips: ['트렌치·롱 기장처럼 흐르는 실루엣', '진주·골드 같은 은은한 액세서리', '단정한 웨이브 헤어'] },
    natural: { label: '내추럴', tips: ['린넨·코튼 같은 자연 소재', '톤온톤 뉴트럴 컬러', '힘을 뺀 자연스러운 헤어'] },
    boyish: { label: '소년미', tips: ['깔끔한 셔츠나 니트에 화이트 스니커즈', '내린 앞머리와 자연스러운 볼륨', '피부 톤만 맑게 정리'] },
    clean: { label: '청량', tips: ['화이트·하늘색 셔츠', '이마를 살짝 드러낸 가르마', '맑은 피부 표현'] },
    warm: { label: '훈훈', tips: ['베이지·브라운 니트', '부드러운 웨이브 펌', '편안한 미소'] },
    chic: { label: '시크', tips: ['블랙·차콜 모노톤', '군더더기 없는 실루엣', '정돈된 눈썹과 여유 있는 표정'] },
    charisma: { label: '카리스마', tips: ['롱 코트·블랙 셔츠', '이마를 드러낸 넘김 머리', '날렵한 눈매를 살리는 눈썹 정리'] },
    sturdy: { label: '듬직', tips: ['워크웨어·데님 재킷', '짧고 단정한 헤어', '깔끔하게 다듬은 수염 라인'] },
    intense: { label: '강렬', tips: ['레더 재킷·와이드 팬츠', '짧게 정리한 업 스타일', '이목구비를 살리는 또렷한 눈썹'] },
    dandy: { label: '댄디', tips: ['니트 + 슬랙스 + 코트', '가르마 댄디 헤어', '부드러운 미소'] }
  };

  // 퍼스널컬러 간이 진단. 흔히 쓰는 셀프 체크 3문항이며 전문 진단을 대신하지 않는다.
  var COLOR_QUESTIONS = [
    { key: 'vein', title: '손목 안쪽 혈관 색은?', options: [
      { value: 'warm', label: '초록빛' }, { value: 'cool', label: '파랗거나 보랏빛' }, { value: 'skip', label: '잘 모르겠어요' }] },
    { key: 'metal', title: '더 잘 어울리는 액세서리는?', options: [
      { value: 'warm', label: '골드' }, { value: 'cool', label: '실버' }, { value: 'skip', label: '둘 다 / 모름' }] },
    { key: 'sun', title: '햇볕에 오래 있으면?', options: [
      { value: 'warm', label: '금방 갈색으로 그을려요' }, { value: 'cool', label: '빨갛게 달아올라요' }, { value: 'skip', label: '잘 모르겠어요' }] }
  ];

  // 'warm' | 'cool' | 'neutral'(동률) | null(전부 모름 — 판단 근거 없음)
  function personalColorOf(answers) {
    var warm = 0, cool = 0;
    COLOR_QUESTIONS.forEach(function (q) {
      if (answers[q.key] === 'warm') warm++;
      else if (answers[q.key] === 'cool') cool++;
    });
    if (!warm && !cool) return null;
    if (warm === cool) return 'neutral';
    return warm > cool ? 'warm' : 'cool';
  }

  function levelKey(v) { return v > 0.3 ? 'high' : v < -0.3 ? 'low' : 'mid'; }
  function tiltKey(v) { return v > 0.3 ? 'up' : v < -0.3 ? 'down' : 'flat'; }

  // input: { vector, gender: 'F'|'M', personalColor, celeb }
  function recommend(input) {
    var v = input.vector;
    var g = input.gender === 'M' ? 'M' : 'F';
    var shape = LA.features.faceShapeOf(v);
    var animalKey = LA.profile.rankAnimals(v)[0].key;
    var hair = HAIR[g][shape];
    var fashion = FASHION[animalKey];
    var acc = ACCESSORIES[shape];

    var face = g === 'F'
      ? { title: '메이크업', items: [
          MAKEUP.eyeTilt[tiltKey(v.eyeTilt)], MAKEUP.eyeRound[levelKey(v.eyeRound)],
          MAKEUP.blush[animalKey], MAKEUP.lipFull[levelKey(v.lipFull)]] }
      : { title: '그루밍', items: [
          GROOMING.eyeTilt[tiltKey(v.eyeTilt)], GROOMING.base,
          GROOMING.animal[animalKey], GROOMING.lip] };

    var pc = input.personalColor;
    var colors = COLORS[pc] || COLORS.neutral;

    var out = {
      faceShape: shape,
      faceShapeLabel: LA.profile.FACE_SHAPES[shape].label,
      animalKey: animalKey,
      hair: { why: hair.why, best: hair.best.slice(), avoid: hair.avoid.slice() },
      face: face,
      fashion: { keyword: fashion.keyword, items: fashion[g].slice(), tip: fashion.tip },
      colors: {
        title: colors.title, swatches: colors.swatches.slice(), tip: colors.tip,
        diagnosed: !!COLORS[pc]
      },
      accessories: { items: ['안경: ' + acc.glasses, (g === 'F' ? '귀걸이: ' : '모자: ') + acc[g]] },
      celebLook: null
    };

    if (input.celeb && MOODS[input.celeb.mood]) {
      var m = MOODS[input.celeb.mood];
      out.celebLook = { title: input.celeb.name + '처럼 · ' + m.label + ' 무드', items: m.tips.slice() };
    }
    return out;
  }

  LA.styling = {
    MOODS: MOODS, COLOR_QUESTIONS: COLOR_QUESTIONS, HAIR: HAIR,
    personalColorOf: personalColorOf, recommend: recommend
  };
})(window.LA);
