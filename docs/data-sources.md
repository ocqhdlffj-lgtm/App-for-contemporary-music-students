# 데이터 출처

## 학교 목록
- 대학알리미 (academyinfo.go.kr) — 학과 설치 현황
- 어디가 (adiga.kr) — 전형 정보
- 각 대학 입학처 — 최종 확인

## 원칙
- 요강 PDF 원문은 저장소에 넣지 않는다. 링크로만 연결한다.
- 확인하지 못한 값은 null. 추측해서 채우지 않는다.
- 학교 id는 한 번 정하면 변경하지 않는다(찜 데이터가 id로 저장됨).

## 확인 이력
| 날짜 | 학교 | 확인 항목 | 출처 |
|---|---|---|---|
| 2026-09-11 | 홍익대학교 (hongik) | 실용음악전공 실재, 소속(공연예술학부, 대학로캠퍼스), 입학처 URL 해석 확인 | music.hongik.ac.kr (title: 실용음악전공), admission.hongik.ac.kr → www.hongik.ac.kr/kr/admission/undergraduate-admission.do (200) |
| 2026-09-11 | 서경대학교 (seokyeong) | 실용음악학부 실재, 입학처 URL 해석 확인 | cm.skuniv.ac.kr (title: 서경대학교 실용음악학부), go.skuniv.ac.kr (200, 서경대학교 입학처) |
| 2026-09-11 | 동덕여자대학교 (dongduk) | 실용음악전공 실재(공연예술대학), 입학처 URL 해석 확인 | www.dongduk.ac.kr/www/contents/perfmce03-01.do, ipsi.dongduk.ac.kr (200, NetFUNNEL 대기열 페이지 — /ipsi/main/index.do로 연결되는 정상 입학처 도메인) |
| 2026-09-11 | 성신여자대학교 (sungshin) | 현대실용음악학과 실재, 입학처 URL 해석 확인 | www.sungshin.ac.kr/ctpmusic/index.do (title: 현대실용음악학과), ipsi.sungshin.ac.kr → /main/ (200, title: 성신여자대학교 입학안내) |
| 2026-09-11 | 백석예술대학교 (baekseok-arts) | 실용음악과 실재(음악학부), 지역(서울 서초구), 구분(전문대), 입학처 URL 해석 확인 | www.bau.ac.kr/practical/index.do (title: 음악학부 실용음악), www.bau.ac.kr/admission/index.do (200, 백석예술대학교) — 4년제 백석대학교(천안, bu.ac.kr)와 혼동 주의 |
| 2026-09-11 | 한양여자대학교 (hanyang-women) | 실용음악과 실재, 지역(서울 성동구), 구분(전문대), 입학처 URL 해석 확인 | www.hywoman.ac.kr/dept/music.html (title: 한양여자대학교, 실용음악과), admission.hywoman.ac.kr (200, 한양여자대학교) — www.hywoman.ac.kr 루트/hyw_admission 경로는 SSO 리다이렉트 루프로 접근 불가하여 admission.hywoman.ac.kr을 대체로 사용 |
| 2026-09-11 | 숭의여자대학교 (soongeui-women) | 실용음악과(K-POP 아티스트 전공 포함) 실재, 지역(서울 중구), 구분(전문대), 입학처 URL 해석 확인 | www.sewu.ac.kr/applied_music/index.do, www.sewu.ac.kr/admission/index.do (200, 숭의여자대학교) |
| 2026-09-11 | 명지전문대학 (myongji-college) | 실용음악과 실재(예술·건강학부), 지역(서울 서대문구), 구분(전문대), 입학처 URL 해석 확인 | sileum.mjc.ac.kr → mjcIntro.do, ipsi.mjc.ac.kr → mjcIntro.do (200, title: 명지전문대학) — 4년제 명지대학교(용인 자연캠퍼스, mju.ac.kr)의 아트앤멀티미디어음악전공과는 별개 기관 |
| 2026-09-11 | 협성대학교 (hyupsung) | 음악학부 실용음악전공 실재, 지역(화성), 구분(4년제), 입학처 URL 확인 | www.uhs.ac.kr/uhs/3751/subview.do (본문에 실용음악전공/실용음악연주 텍스트), iphak.uhs.ac.kr (200, title: 협성대학교) |
| 2026-09-11 | 성결대학교 (sungkyul) | 실용음악과 실재, 지역(안양), 구분(4년제), 입학처 URL 해석 확인 | www.sungkyul.ac.kr/appliedmusic/index.do (title: 실용음악과), ipsi.sungkyul.ac.kr → JS(TControl, uway 플랫폼) 리다이렉트 체인을 /enter/resultPage → /intro까지 직접 따라가 최종 200, title: 성결대학교 입학처 확인 |
| 2026-09-11 | 경희대학교 (kyunghee-global) | PostModern음악학과 실재(예술·디자인대학, 국제캠퍼스), 지역(용인), 구분(4년제), 입학처 URL 해석 확인 | and.khu.ac.kr (본문에 PostModern/포스트모던/국제캠퍼스 텍스트), iphak.khu.ac.kr → JS(uway) 리다이렉트를 intro.html까지 따라가 200, title: 경희대학교 입학처 |
| 2026-09-11 | 명지대학교 (myongji-univ) | 아트앤멀티미디어음악학부 실재(건반음악·보컬뮤직·작곡전공), 자연캠퍼스(용인) 소속 확인, 구분(4년제) | WebFetch로 www.mju.ac.kr/mjukr/10245/subview.do 확인(자연캠퍼스 창조예술관 2층, 경기도 용인시 처인구 명지로 116) — curl은 mju.ac.kr 접속 자체가 차단되어 WebFetch로 교차 확인. ipsi.mju.ac.kr → iphak.mju.ac.kr/main/index.php (200, title: 명지대학교 입학처 메인페이지) |
| 2026-09-11 | 중앙대학교 (cau-davinci) | 글로벌예술학부 실용음악전공 실재, 다빈치캠퍼스(안성) 소속 확인, 구분(4년제) | globalarts.cau.ac.kr (200, title: 중앙대학교 글로벌예술학부), admission.cau.ac.kr (200, title: 중앙대학교) |
| 2026-09-11 | 용인대학교 (yongin-univ) | 실용음악과 실재(보컬/기악/작곡 모집단위 확인), 지역(용인), 구분(4년제) | www.yongin.ac.kr/cmn/wvtex/nibr/colDept/COL_DEPT_00000000009/colDeptMain.do (본문에 실용음악 텍스트), ipsi.yongin.ac.kr (200, title: 용인대학교 입학) |
| 2026-09-11 | 평택대학교 (ptu) | 실용음악학과 실재(보컬/기악/뮤직프로덕션 통합선발), 지역(평택), 구분(4년제) | www.ptu.ac.kr/www/652/subview.do (본문에 실용음악 텍스트), entrance.ptu.ac.kr (200, title: PYEONGTAEK UNIVERSITY) |
| 2026-09-11 | 안양대학교 (anyang-univ) | 실용음악과 실재(교수진 소개 페이지로 확인, 예술대학 소속, 안양캠퍼스 문화관), 지역(안양), 구분(4년제) | www.anyang.ac.kr/practical/professor/introduction-of-faculty-members.do (200, title: 교수진 소개 \| 실용음악과), enter.anyang.ac.kr → JS(uway) 리다이렉트를 intro까지 따라가 200, title: 안양대학교 |
| 2026-09-11 | 여주대학교 (yeoju) | 실용음악과(3년제) 실재, 지역(여주), 구분(전문대) | ipsi.yit.ac.kr → /ipsi/index.do (200, title: 여주대학교 입학안내) |
| 2026-09-11 | 김포대학교 (gimpo) | 실용음악과(3년제) 실재(한류문화관광학부 K-POP계열), 지역(김포), 구분(전문대) — 공식 도메인은 ukp.ac.kr(김포대학교 글로벌캠퍼스)이며 gimpo.ac.kr/kimpo.ac.kr이 아님을 확인 | ukp.ac.kr/department/한류문화관광학부/k-pop계열/실용음악과 (200, title: 실용음악과(3년제) \| 김포대학교 글로벌캠퍼스), ukp.ac.kr 메인이 곧 입학안내 페이지(200, title: 2027학년도 입시_김포대학교 입학안내) |
| 2026-09-11 | 경복대학교 (kbu) | 실용음악학과 실재, 남양주캠퍼스(본교) 소속 확인, 지역(경기), 구분(전문대) | info.kbu.ac.kr/pm/Main.do (본문에 실용음악/남양주 텍스트), www.kbu.ac.kr (200, 본문에 경복 텍스트) — ipsi.kbu.ac.kr은 연결 실패(HTTP 000)로 미사용 |
| 2026-09-11 | 부천대학교 (bucheon) | 실용음악전공 실재(보컬/작곡/컴퓨터음악/피아노/드럼/베이스/관악기), 지역(부천), 구분(전문대) | dept.pcu.ac.kr/dept/musicstar/sub02/sub020101.jsp (200, title: 실용음악전공소개), ipsi.bc.ac.kr → /ipsi/intro.do (200, title: 부천대학교 입학홈페이지) — 주의: ipsi.pcu.ac.kr은 배재대학교(다른 학교) 수험생서비스로 리다이렉트되어 사용하지 않음 |
| 2026-09-11 | 신안산대학교 (shinansan) | 실용음악과 실재, 지역(안산), 구분(전문대) | www.sau.ac.kr/apm/index.do (200, title: 실용음악과), apply.sau.ac.kr (200, title: 신안산대학교 입학안내) |
| 2026-09-11 | 연성대학교 (yeonsung) | K-POP과 실재(2022 신설, 보컬/댄스/퍼포먼스/미디씽어송라이터/랩), 지역(안양), 구분(전문대) | dept.yeonsung.ac.kr/kpop/index.do (200, title: 연성대학교 K-POP과), www.yeonsung.ac.kr/ipsi/... → dept.yeonsung.ac.kr/ipsi/... (200, title: 연성대학교 입학안내) |
| 2026-09-11 | 용인예술과학대학교 (ysc) | 실용음악과 실재(구 용인송담대학교, 3년제, K-POP 보컬 특화), 지역(용인), 구분(전문대) | dept.ysc.ac.kr/vocal/ (200, title: 실용음악과, 본문에 용인예술과학 텍스트), ipsi.ysc.ac.kr (200, title: 용인예술과학대학교 대표홈페이지) |
| 2026-09-11 | 경민대학교 (kyungmin) | 실용음악과 실재, 지역(의정부), 구분(전문대) | www.kyungmin.ac.kr (본문에 실용음악 텍스트), iphak.kyungmin.ac.kr/music (200, title: 경민대학교 입학홈페이지 — 학과 전용 입학 페이지) |
| 2026-09-11 | 두원공과대학교 (doowon) | 실용음악과 실재, 안성·파주 두 캠퍼스 모두 경기도 소재 확인, 구분(전문대) | www.doowon.ac.kr/kr/801/subview.do (title: 학과소개, 본문에 실용음악/안성/파주 텍스트), www.doowon.ac.kr/kr/690/subview.do (200, title: 입학안내) — 루트 도메인은 NetFUNNEL 대기열을 거쳐 /sites/kr/index.do로 연결됨을 확인 |
| 2026-09-11 | 동원대학교 (dongwon) | 실용음악과 실재(보컬/기악/작곡), 지역(광주), 구분(전문대) | www.tw.ac.kr/univ/majorInfo.do?miIdx=41&menuId=2136 (200, title: 실용음악과 \| 예체능계열 \| 학과소개 \| 동원대학교), ipsi.tw.ac.kr (200, title: 동원대학교 입학정보홈페이지) |
| 2026-09-11 | 국제대학교 (kookje) | 엔터테인먼트학부 K-POP전공 실재(3년제), 지역(평택), 구분(전문대) — 서울 강남구 소재의 별개 기관인 국제예술대학교(kua.ac.kr)와 혼동 주의 | dept.kookje.ac.kr/entertainment/ (200, title: 국제대학교 엔터테인먼트학부, 본문에 K-POP전공 텍스트), ipsi.kookje.ac.kr (200, title: 국제대학교) |
| 2026-09-11 | 오산대학교 (osan) | 보컬·K-POP콘텐츠과 실재(3년제), 지역(오산), 구분(전문대) | iphak.osan.ac.kr/?menuno=490&d_no=128 (200, 본문에 "보컬·K-POP콘텐츠과" 반복 확인), iphak.osan.ac.kr (200, title: 오산대학교 입학메인페이지 \| 오산대학교 입학지원센터) |
| 2026-09-11 | 재능대학교 (jei) | 실용음악과 실재(보컬/기악/싱어송라이터/작곡·컴퓨터음악), 지역(인천), 구분(전문대) | apply.jeiu.ac.kr:4443/apply/ (200, title: 재능대학교 입학안내, 본문에 실용음악/재능대 텍스트) |
| 2026-09-11 | 경인여자대학교 (kiwu) | 실용음악과(주간, 2013 개설) 실재, 지역(인천), 구분(전문대) — 공식 도메인은 kiwu.ac.kr이며 ico.ac.kr이 아님을 확인(ico.ac.kr은 접속 실패) | www.kiwu.ac.kr/ko/cms/FR_CON/index.do?MENU_ID=30 (본문에 실용음악과 텍스트), start.kiwu.ac.kr (200, EUC-KR 디코딩 후 title: 경인여자대학교 입학홈페이지) |

## 배치 A(서울) 조사 메모 — 확인 실패 / 제외
- **경희대학교 PostModern음악학과**: 예술·디자인대학이 국제캠퍼스(용인, 경기)에 있어 서울 소재가 아님을 확인 — 서울 배치 제외.
- **명지대학교 아트앤멀티미디어음악전공**: 자연캠퍼스(용인, 경기) 소속으로 확인되어 서울 배치 제외. (같은 재단의 명지전문대학 실용음악과는 서울 서대문구 소재로 별도 등록)
- **중앙대학교 글로벌예술학부 실용음악전공**: 다빈치캠퍼스(안성, 경기) 소속으로 확인되어 서울 배치 제외.
- **서울예술대학교**: 학부 교육과정 전체가 안산캠퍼스(경기)에서 운영됨을 확인. 남산캠퍼스(서울 중구)는 학사학위 전공심화 과정만 운영하여 일반 신입학 대상 서울 소재 학과로 보기 어려워 이번 배치에서 제외.
- **상명대학교**: 서울캠퍼스의 실용음악학전공은 정규 학부가 아닌 미래교육원 학점은행제 과정으로 확인되어 제외.
- **추계예술대학교**: 실용음악학과는 대학원(문화예술경영대학원) 과정만 확인되어 제외 — 학부 과정 확인 실패.
- **한성대학교, 인덕대학교, 동양미래대학교**: 실용음악 계열 학과 개설 여부를 확인할 수 있는 자료를 찾지 못해 제외.
- **정화예술대학교**: 실용음악학부 존재는 확인되나, 정식 인가 전문대학/대학교인지(대학알리미 등록 여부) 확인하지 못해 이번 배치에서는 제외.

## 배치 B(경기·인천) 조사 메모 — 확인 실패 / 제외
- **경기대학교 실용음악학과**: 학과 사무실이 서울캠퍼스 본관1층(전화 02-390-5224)에 있음을 학과 홈페이지(www.kyonggi.ac.kr/u_music)에서 직접 확인 — 수원캠퍼스가 아닌 서울 소재 학과로 판단되어 경기·인천 배치에서 제외(서울 배치에도 미포함 상태이므로 이후 서울 쪽 보정 시 검토 필요).
- **안산대학교**: 입학안내 학과 전체 목록(iphak.ansan.ac.kr/iphak/dept_type1_total)을 확인한 결과 음악/실용음악 관련 학과가 존재하지 않음을 확인 — 동일 지역의 신안산대학교(shinansan)와는 별개 학교로, 안산대는 실용음악 계열 학과 자체가 없어 제외.
- **강남대학교**: 음악학과(musicdpt.kangnam.ac.kr)는 피아노·성악·관현악 중심의 클래식 음악학과로 확인되어 실용음악 계열이 아니므로 제외.
- **청강문화산업대학교**: 공연예술스쿨에 뮤지컬연기·연극영상연기·연출극작·무대미술 전공은 확인되었으나 실용음악/대중음악/K-POP 계열 학과의 존재를 뒷받침하는 자료를 찾지 못해 제외.
- **계원예술대학교**: 융합예술과 등 15개 학과 존재는 확인되었으나 실용음악 또는 대중음악 계열 학과명을 확인하지 못해 제외 — adiga.kr 검색에서도 관련 결과를 찾지 못함.
- **대림대학교**: 방송음향기술과(dept.daelim.ac.kr/bsm)는 확인되었으나 이는 실용음악과가 아닌 방송음향기술 계열 학과이며, 실용음악 계열 학과 개설 근거를 찾지 못해 제외. (검색 중 발견한 "2026년 대학 순위" 게시물은 조작된 수치로 보이는 커뮤니티 글로 신뢰할 수 없어 근거로 사용하지 않음)
- **신경대학교**: 실용음악 계열 학과 개설 여부를 뒷받침하는 자료를 찾지 못해 제외.
- **국제예술대학교(kua.ac.kr)**: 실용음악과가 존재하나 서울 강남구 소재로 확인되어 경기·인천 배치 대상이 아님 — 평택 소재의 별개 기관인 국제대학교(kookje.ac.kr, 본 배치에 kookje로 등록)와 혼동하지 않도록 주의.
- **인하공업전문대학**: 실용음악 계열 학과 개설을 뒷받침하는 자료를 찾지 못해 제외.
- **유한대학교, 을지대학교(성남캠퍼스), 동서울대학교**: 실용음악 계열 학과 개설 여부를 확인할 자료를 찾지 못해 제외. 시간 제약상 학과 목록 전체를 대학알리미에서 대조하지는 못했다.
