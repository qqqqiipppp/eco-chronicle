# 배포·Cloud Save·교실 운영 모드 통합 점검

작성: **2026-10-25 (한국 시간)**. 검사는 10월 24일에 시작했고, 중단 후 25일에 배포 상태 재확인과 TEST 데이터 정리를 마쳤다.

- 대상 BUILD_VERSION: **2026.10.24.1** / SAVE_VERSION: **9**
- 운영 사이트: <https://qqqqiipppp.github.io/eco-chronicle/>
- Supabase 프로젝트: `akpkwypxupghvcghywab`
- 제품 코드 변경, commit, push, Pages 배포, migration 실행, Edge Function 재배포: **없음**
- 운영 데이터 변경은 이번에 만든 **TESTK8A / TESTK8B 두 기록에만** 한정했다. 종료 시 모두 soft delete했고 내용·백업·감사 기록을 보존했다.

## 검증 방식 구분

| 표기 | 실제 수행 내용 |
|---|---|
| 운영 Pages | 실제 공개 URL의 HTML/JS/CSS GET, 시작 화면, 관리자 UI, 콘솔 확인 |
| 운영 Supabase + TEST 브라우저 | 독립 로컬 origin 2개에 배포본과 내용이 동일한 게임 코드를 로드. **실제 Supabase SDK·Realtime·student-save** 사용. 모의 Presence/DB가 아님 |
| 운영 SQL/RPC | 계정·권한·상태 조회. 기록은 이번 TEST의 정확한 ID만 조회/변경. 복구·최종 정리는 기존 관리자 RPC 사용 |
| 자동 모의 검사 | 격리된 VM / PostgreSQL에서 제품 함수·저장·관리자·멀티플레이 회귀 검사. 실제 과금·실기기 부하와 구분 |

TEST 브라우저 주소는 `127.0.0.1:54461 / 54462`였다. 학생 저장 HTTP 요청은 로컬 검사 서버가 운영 Edge Function으로 전달했고, Origin은 실제 Pages origin으로 설정했다. 따라서 이 검사를 **Pages 주소 자체에서 두 독립 브라우저로 모든 동작을 수행한 것**으로 표현하지 않는다. 실제 Pages의 CORS 허용은 별도 OPTIONS 요청으로 확인했다. Realtime WebSocket은 실제 SDK가 운영 Supabase에 직접 연결했다.

## A. 로컬 커밋 / 원격 Push / Pages 최신 배포 상태

| 항목 | 결과 |
|---|---|
| 현재 브랜치 | `main` |
| HEAD | `39c7b5633dccdb1eb4f055a52db7c850933e99a0` |
| 마지막 커밋 | `Merge branch 'main' of https://github.com/qqqqiipppp/eco-chronicle` |
| 커밋 시각 | 2026-10-24 20:48:52 +09:00 |
| 실제 원격 main | `git ls-remote`로 확인한 SHA가 HEAD와 동일 |
| 앞섬 / 뒤처짐 | 0 / 0 |
| 점검 시작 작업 트리 | 깨끗함 |
| 점검 후 변경 | 검사용 스크립트·보고서·증빙 파일만 신규 생성. 추적 중인 제품 파일 diff 없음 |

**commit만 하고 push하지 않은 상태가 아니다.** Pages 핵심 파일도 현재 로컬 내용과 일치했다. GitHub Actions의 배포 실행 번호 자체는 별도로 조회하지 않았다.

## B. 실제 배포 BUILD_VERSION

운영 Pages의 `index.html`, `admin.html`, `admin-state.html` **3개**와 그 문서가 직접 참조하는 JS/CSS **48개 고유 URL**을 GET했다.

- 404 및 비정상 HTTP 응답: **0개** — 모두 200.
- `build-version.js` 실제 값: **2026.10.24.1**.
- 로컬 참조 버전: **2026.10.24.1**. CDN은 고정 `supabase-js 2.117.0` 사용.
- 코드 내용 차이: **0개**. 14개 파일은 Windows CRLF/LF 차이만 있어 원시 바이트가 달랐다.
- `index.html` Last-Modified: 2026-10-24 11:49:37 UTC, 즉 한국 시간 20:49:37.
- HTML Cache-Control: `max-age=600`. 이번 검사에서 구버전 응답은 발견하지 않았다. 이미 열려 있는 구버전 탭이 자동 교체된다는 뜻은 아니다.
- 운영 시작 화면 콘솔: `[Supabase] client initialized`, `[Supabase] connection test success`. 재확인 시 error/warn 없음.
- 실제 시작 화면에서 로컬 script 35개, 가로 overflow 없음 확인.

원본 수치: [GET 감사 결과](images/deployment-read-audit.json). 마지막 GET 재확인: 2026-10-25 06:20 UTC, 한국 시간 15:20.

![실제 GitHub Pages 시작 화면](images/deployment-pages-title.jpg)

## C. 개인 플레이 및 Broadcast 0건 결과

운영 Supabase에 연결한 TEST 브라우저에서 다음을 실제로 확인했다.

| 상황 | 결과 |
|---|---|
| 월드 진입 / 정지 / 이동 | `movementEnabled=false`, `sent=0`, `requests=0`, `remotePlayers=0` |
| 원격 캐릭터 DOM | 0개. 본인 캐릭터·정령·기존 NPC 유지 |
| 기존 방향 버튼 1초 누름 | TEST A x=298→495 이동. 네트워크 응답 대기 없음 |
| 숲→강→숲 | 이전 테마 목록에서 제거되고 새 채널 참가. 클라이언트 활성 채널 최대 1개 |
| 숨김 상태 30초 | 숨김 상태/visibility 이벤트를 검사 도구로 모의. **실제 서버 채널**이 제거되어 activeChannels=0 |
| 화면 복귀 | 최신 Presence 재등록, activeChannels=1 |
| 실제 SDK disconnect / connect | 연결 불안정 중 목록 비움 → 같은 채널 복구, subscriptions=2 / reconnectCount=1 / activeChannels=1 |
| 장애 중 개인 저장 | 별도 HTTP 저장 성공, revision=7 / pending=false |

위치뿐 아니라 별도 계측한 **`type: broadcast` 채널 발신도 0건**이었다. SDK의 Presence track 내부 send는 위치 Broadcast로 세지 않았다. 오래된 위치 요청에 대한 응답 0건은 기본 비활성 모듈 자동 검사에서도 확인했다.

이번 작업이 추가한 TEST Realtime 동시 연결은 최대 **2개**다. 기존 접속 1개가 있어 총 온라인 수 3을 관찰한 시점은 있었지만, 그 기존 학생의 저장 기록을 조회하지 않았다. 운영에 모의 30연결을 만들지 않았다. 25/29/30명 검사는 자동 모의 환경에서만 수행했다.

이 getStats 계측은 TEST 브라우저에서 읽은 값이다. 운영 Pages 탭에서 개발자 콘솔을 조작해 읽은 수치와 혼동하지 않는다. Android가 탭 실행을 실제로 동결하는 동작·학교망의 장시간 복구는 미검증이다.

## D. Presence 접속 인원 / 탑 기록 검증

서로 다른 TEST 학생을 사용한 운영 Realtime 목록 결과:

| TEST 학생 | 정령 | 레벨 | 장비 | 진행 | 탑 |
|---|---|---|---|---|---|
| TESTK8A | 조약돌 정령 | Lv.2 | 집게 | 숲 1단계 | 18층 · 07:42 |
| TESTK8B (나) | 물방울 정령 | Lv.1 | 없음 | 숲 1단계 | 기록 없음 |

A의 Lv.1→2, 장비·탑 기록 변경이 B의 실제 목록에 반영됐다. A가 강으로 가면 B의 숲 목록에서 A가 빠졌고 A는 강 채널에서 온라인 1명이 됐다. 최초 track 후 변화가 없는 구간에서는 호출 수 1을 유지했다. 요약 변경·재참가·SDK 재접속 때만 증가했다.

실제 Presence metadata의 **필드명만** 검사했다. 기존 외형/요약 필드와 SDK `presence_ref`를 확인했고, `code/cloudCode/token/password`는 없었다. 개인정보 검출 카운터 0. 전체 Presence 값·다른 학생 세이브·비밀코드 전문은 보고서에 수집하지 않았다.

## E. 클라우드 코드 이어하기와 자동 저장

- TEST A: 기존 새 게임 UI의 이름→외형→정령→월드 진입 순서로 진행. 운영 `student-save`에서 코드 발급/revision 1 성공.
- 다른 origin의 TEST 브라우저 B: **첫 시작 localStorage key 수 0** 확인 후 코드만 입력해 A의 이름·Lv.1·골드 60·v9 기록 복원. 이후 재검증 reload 때 cache가 있는 상태와 구분했다.
- 자동 저장 설정: 1,500ms. 실제 TEST 클릭 시각과 save 요청 시각의 차이 **1,503ms** 관찰. 네트워크 응답 완료 시간이 아닌 요청 시작 기준이다.
- 오프라인: 골드 71 변경 후 pending=true / revision 5. 새로고침하고 이 기기 기록으로 이어해 71과 pending을 복원했다.
- 온라인 복귀: revision 6 / pending=false로 저장 완료.
- Realtime만 끊긴 동안에도 골드 72의 저장 HTTP가 성공해 revision 7이 됐다.
- SAVE_VERSION 9 유지 및 구버전 migration은 `legacy-save/cloud-save/cloud-sync` 자동 시험 통과. 실제 기존 학생의 오래된 세이브를 migration하려고 다시 저장하지 않았다.
- 운영 Edge Function: `student-save` v2 ACTIVE / verify_jwt=false, `student-admin` v1 ACTIVE / verify_jwt=true 확인.

## F. 실제 관리자 로그인 및 CRUD

운영 Auth 사용자 수 1, app_admins 1, 활성 관리자 1을 집계로 확인했다. 사용자가 실제 admin.html에서 직접 로그인한 뒤 서버 권한 확인과 TEST 검색이 성공했다. 비밀번호·JWT·세션 저장소는 읽거나 기록하지 않았다.

| 작업 | 결과 / 방식 |
|---|---|
| 목록·검색·상세 | 운영 관리자 UI에서 TESTK8만 검색하고 해당 두 기록만 선택 |
| 편집 | TEST A 골드 60→70, revision 1→2 — 운영 UI |
| 새 학생 | TEST B 생성, revision 1 — 운영 UI |
| JSON export | 버튼 완료 문구 + 운영 EXPORT audit 확인. 다운로드 JSON 파일의 전체 내용은 보고서로 복사하거나 별도 재검사하지 않음 |
| 코드 재발급 | TEST B revision 1→2. 구 코드로 이어하기는 NOT_FOUND 안내, 새 코드는 복원 성공 — 운영 UI + TEST 브라우저 |
| soft delete | TEST B revision 2→3, deleted 상태 — 운영 UI |
| restore | 중단 후 관리자 세션이 없어 **기존 서버 관리자 RPC**로 revision 3→4, deleted_at=null 확인. 기존 학생 load RPC도 ok / revision 4 / v9 확인 |
| 복구 UI 재검증 | 사용자 요청에 따라 생략. 실제 운영 UI에서 restore 버튼까지 통과했다고 주장하지 않음 |
| 최종 TEST 정리 | 같은 관리자 RPC/CAS로 A revision 7→8, B 4→5 soft delete |

최종 두 TEST 모두 `soft_deleted=true`, v9 유지. 관리자 백업 A 2개 / B 4개 보존. 영구 삭제 및 원본 학생 데이터 초기화 없음. SQL/RPC 사용은 이번에 생성한 정확한 두 ID에만 한정했고, 관리자 계정 생성·권한 추가는 하지 않았다.

## G. 보안 / 충돌

### 직접 접근 차단 — 운영 확인

- `student_saves`, `app_admins`, 관리자 backup/audit 테이블: RLS + FORCE RLS 활성.
- anon의 SELECT/INSERT/UPDATE/DELETE 권한 모두 false. authenticated의 직접 SELECT도 false.
- 실제 REST 직접 읽기 `limit=0`: 401. 실제 학생 row를 받지 않았다.
- 관리자 API 무인증 / publishable key만 / 가짜 JWT / 학생 코드 형식의 JWT: 모두 **401**.
- 관리자 RPC 직접 REST 접근: **401**. 학생/관리자 RPC의 anon·authenticated 실행 권한 false.
- 실제 로드 HTML/JS/CSS에서 service_role JWT·sb_secret·DB 접속 비밀번호 패턴: **검출 0**. 공개 publishable key는 정상 사용.

### 수정 충돌 — 운영 TEST 확인

관리자 수정으로 revision 2가 된 뒤, revision 1을 가진 학생이 골드 61을 보내자 `REVISION_CONFLICT`로 거부됐다. 서버 값 70을 덮어쓰지 않았고, 서버/기기 기록 선택 화면이 나왔다. 서버 기록 선택 후 골드 70·revision 2로 복원됐다. 관리자 수정 전 백업 행도 존재했다. 클라이언트 충돌 backup 실패 보호·선택·재시도는 자동 시험에서 추가 검증했다.

### 남은 보안 권고 — 수정하지 않음

Supabase Security Advisor에서 다음을 확인했다.

1. `rls_auto_enable()`의 anon/authenticated SECURITY DEFINER EXECUTE 경고. 반환형은 `event_trigger`이며, 일반적인 학생 CRUD RPC가 아니다. 실제 악용/학생 데이터 노출은 재현하지 않았다. 공개 EXECUTE 필요성을 별도 검토할 것. [공식 점검 안내](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
2. Leaked Password Protection 비활성 경고. 현재 Free 요금제의 지원 범위를 확인하고 가능한 방어 설정을 검토할 것. [공식 비밀번호 보호 안내](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
3. 네 테이블의 RLS no-policy INFO는 브라우저 직접 접근을 막고 서버 API만 사용하는 현재 설계와 일치한다. 이를 없애려고 공개 정책을 추가하지 않았다.

## H. 기존 게임 회귀

전체 자동 회귀 **116/116 통과**, fail 0. 실행 시간 약 67.85초. 제품 함수와 격리 DB를 사용했으며 운영 학생 데이터를 시험 입력으로 쓰지 않았다.

| 대상 | 확인 방식 / 범위 |
|---|---|
| 지역 이동·로컬 이동 | 운영 Supabase TEST 브라우저에서 숲↔강·방향 버튼, 자동 progression 검사 |
| 전투·8종 상위 중간보스 | 실제 전투 함수 VM: 8종 순위·층 배치·특수효과·종료·중첩 제한·피해/SP 계산 검사. 8전투를 운영 UI에서 모두 수동 완주하지는 않음 |
| 정화 퍼즐 | 실제 playable/swap 코드 자동 검사 포함. 운영 UI 30판 재실행은 이번 검사에서 하지 않음 |
| 동물 돌봄 | 순서·모션 상태·입력 잠금 자동 검사 |
| 플로킹 | 충돌·NPC 행동·난이도/상태 자동 검사 |
| 장비·생태기술 | 실제 데이터·진행·저장 자동 검사, 대표 장비의 운영 Presence 표시 |
| 농장 | 세이브 호환·관리자 validation 자동 검사. 실 브라우저에서 재배/축산 전체 한 주기는 미검증 |
| 탑 기록 | 운영 목록 18층·07:42 표시와 자동 전투/기록 검사 |
| 사운드 | 전체 볼륨·mute·저장 자동 검사. 태블릿 스피커로 실제 청취는 미검증 |
| 가로 화면 | TEST 게임 iframe **1024×640**, 가로 overflow=false, 캐릭터·방향 버튼 표시. 운영 시작 화면은 1280×720에서 재확인 |

운영 Pages 초기 콘솔 error 0, TEST 브라우저의 제품 error 배열 0을 확인했다. 의도적인 SDK disconnect의 CHANNEL_ERROR 및 구 코드 거부 경고는 정상 실패 경로다. 자동화 도구 자체의 클릭/iframe 읽기 오류는 제품 JavaScript 오류로 합산하지 않았다.

**Galaxy Tab S5e 실기기, 학교 Wi-Fi, 실제 25~30대 동시 부하/FPS는 미검증**이다. 가로 크기 렌더링 확인을 실기기 성능 보장으로 표현하지 않는다.

## I. 현재 Supabase 사용량 및 제한 경고

- 지난 주기 **5,667,208건**, 무료 한도 **2,000,000건**, 최대 동시 29명은 사용자 제공 이력이다. 이번에 과거 청구 집계를 다시 조회하지 않았다.
- 현재 조직 Free plan, 프로젝트 ACTIVE_HEALTHY는 MCP로 확인했다. **정상 health가 사용량 제한 해제를 의미하지 않는다.**
- Usage 대시보드는 별도 Supabase 플랫폼 로그인을 요구했다. 사용자가 현재 사용량/제한 경고를 미확인으로 보고하도록 선택했다.
- 따라서 현재 과금 집계, 결제 주기 사용량, **2026-10-25 제한 경고의 존속·해제 여부는 모두 미확인**이다.
- 관찰한 위치 Broadcast 0건은 이 버전의 TEST 클라이언트 발신에 관한 결과다. 구버전 학생 탭·Presence fanout·재접속·다른 사용을 포함한 월 메시지 총량이 200만 이하라고 보장하지 않는다.

29명 전원 5Hz 이동의 기존 모델은 145 send/s + 4,060 delivery/s = 약 4,205건/s였다. 새 클라이언트의 해당 위치 성분은 0이다. Presence 수업당 2~5만 건 같은 수치는 시나리오 추정이며 이번 실측 청구량이 아니다. [메시지 집계 공식 안내](https://supabase.com/docs/guides/platform/manage-your-usage/realtime-messages)

## J. 발견된 문제와 해결 우선순위

| 우선순위 | 항목 | 판단 / 권고 |
|---|---|---|
| 운영 전 최우선 | 10월 25일 제한 경고·현재 Usage 미확인 | 프로젝트 소유자가 대시보드에서 확인. 해제됐다고 추정하지 말 것 |
| 운영 전 | 기존에 열린 구버전 탭 | 새로 열어 BUILD_VERSION 확인. 위치 전송이 남을 수 있음 |
| 검증 보완 | 실기기·학교망·모든 미니게임 수동 완주 | 대표 S5e 1대에서 저장/복구와 터치를 확인한 후 수업 운영 |
| 보안 검토 | Advisor 경고 2종 | 공개 event-trigger EXECUTE 필요성과 비밀번호 보호 정책 검토. 이번 작업에서 권한/스키마 수정 없음 |
| 확인 범위 제한 | restore UI·JSON 파일 재검사 | 서버 restore/load 및 export audit는 성공. UI 재검증 생략·파일 내용 미검사는 별도 표시 |

확인한 핵심 경로에서 제품 수정이 필요한 치명적 오류는 재현하지 않았다. 이 결과를 모든 기능·기기·월 사용량 검증 완료로 확대하지 않는다.

## K. 배포/수업 전에 추가로 필요한 작업

1. **현재 빌드는 이미 Pages에 배포돼 있다. 이 점검을 이유로 재배포할 필요는 없다.**
2. 소유자가 Supabase Usage/제한 경고를 직접 확인해야 한다. [조직 Usage](https://supabase.com/dashboard/org/zfqtluqsezfulznlaxuo/usage)
3. 수업 기기는 최신 페이지를 새로 열고 BUILD_VERSION을 확인한다. 학생의 사이트 데이터/저장소는 삭제하지 않는다.
4. S5e 1대에서 방향키·코드 이어하기·오프라인 복원·소리·필수 미니게임을 실제 터치로 짧게 점검한다.
5. 수업 후 Broadcast/Presence/Channel Join 지표와 Usage를 분리해 확인한다. 비용 제한 판단에는 getStats가 아닌 실제 Usage를 사용한다.
6. 이번 TEST 두 개는 soft delete 완료. 이후 재검증한다면 기존 학생 대신 새 TEST 식별자를 사용하고 동일하게 정리한다.

### 이번 점검 산출물

- 이 보고서, `docs/images/deployment-read-audit.json`, `deployment-regression-summary.json`, `deployment-pages-title.jpg`
- `tests/deployment-read-audit.mjs` — 공개 배포 파일 GET만 수행
- `tests/serve-deployment-audit.mjs`, `tests/deployment-browser.js`, `tests/deployment-tablet.html` — 명시적으로 실행하는 TEST 검사 도구. **실제 운영 Supabase를 사용하므로 평상시 자동 실행하지 않는다.** 제품 index에는 포함되지 않는다.

검사 도구의 초기 send 계측은 Presence 내부 send까지 포함했으므로 `type: broadcast`만 세도록 보정 후 다시 확인했다. 제품 movement/presence 로직 수정은 없었다. TEST 비밀코드 전문·관리자 자격증명은 산출물에 넣지 않았다.
