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

## 배치 A(서울) 조사 메모 — 확인 실패 / 제외
- **경희대학교 PostModern음악학과**: 예술·디자인대학이 국제캠퍼스(용인, 경기)에 있어 서울 소재가 아님을 확인 — 서울 배치 제외.
- **명지대학교 아트앤멀티미디어음악전공**: 자연캠퍼스(용인, 경기) 소속으로 확인되어 서울 배치 제외. (같은 재단의 명지전문대학 실용음악과는 서울 서대문구 소재로 별도 등록)
- **중앙대학교 글로벌예술학부 실용음악전공**: 다빈치캠퍼스(안성, 경기) 소속으로 확인되어 서울 배치 제외.
- **서울예술대학교**: 학부 교육과정 전체가 안산캠퍼스(경기)에서 운영됨을 확인. 남산캠퍼스(서울 중구)는 학사학위 전공심화 과정만 운영하여 일반 신입학 대상 서울 소재 학과로 보기 어려워 이번 배치에서 제외.
- **상명대학교**: 서울캠퍼스의 실용음악학전공은 정규 학부가 아닌 미래교육원 학점은행제 과정으로 확인되어 제외.
- **추계예술대학교**: 실용음악학과는 대학원(문화예술경영대학원) 과정만 확인되어 제외 — 학부 과정 확인 실패.
- **한성대학교, 인덕대학교, 동양미래대학교**: 실용음악 계열 학과 개설 여부를 확인할 수 있는 자료를 찾지 못해 제외.
- **정화예술대학교**: 실용음악학부 존재는 확인되나, 정식 인가 전문대학/대학교인지(대학알리미 등록 여부) 확인하지 못해 이번 배치에서는 제외.
