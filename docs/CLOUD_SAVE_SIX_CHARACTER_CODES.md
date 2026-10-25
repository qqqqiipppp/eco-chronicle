# 학생용 6자리 클라우드 저장코드 적용 보고

검증일: 2026-10-25 (KST). 로컬 BUILD_VERSION **2026.10.25.1**, SAVE_VERSION **9**.

## 적용 결과와 배포 구분

- 학생/교사 신규 발급·재발급은 `K7M4P2` 형태의 영문 대문자·숫자 혼합 6자리다. 수동 입력은 소문자와 앞뒤 공백을 허용한다.
- 같은 기기는 기존 **이 기기에서 이어하기**에서 학생 기록을 골라 코드 없이 복원한다. 페이지를 열었다고 학생 기록이 자동 실행되지 않는다.
- 학생/관리자 화면에 같은 개인 코드 카드, 복사, 출력 버튼을 제공한다.
- 운영 DB에 아래 두 마이그레이션을 적용했고 `student-save-v2`, `student-admin-v2`가 ACTIVE임을 확인했다.
- Git commit/push 및 GitHub Pages 배포는 하지 않았다. 현재 공개 사이트의 기존 클라이언트가 갑자기 중단되지 않도록 이전 함수 경로는 교체하지 않았다. **새 학생 UI는 로컬 변경이며 아직 Pages에 배포되지 않았다.**

## 코드 발급과 기존 기록 보호

기존 문자 집합 `23456789ABCDEFGHJKMNPQRSTUVWXYZ`를 재사용한다. O/0, I/1 및 L을 제외한다. 서버 Web Crypto의 `getRandomValues`와 rejection sampling으로 편향을 피하고, 숫자와 문자가 모두 들어간 후보만 사용한다. 가능한 코드는 739,205,648개다. DB의 기존 UNIQUE 제약을 유지하며 충돌하면 새 후보로 최대 8회 재시도한다. 난수 생성 실패 시 발급을 실패 처리하고 로컬 기록은 유지한다.

새 화면/새 서버는 기존 `EC-XXXX-XXXX` 코드 수동 입력을 지원하지 않는다. 다만 기존 DB 행을 변환하거나 삭제하지 않도록 DB 제약에는 이전 행 형식도 허용했다. 기존 8자리 연결 메타데이터와 pending 백업도 삭제하지 않는다. 이 기록은 기기에서 계속 플레이할 수 있고, **선생님이 같은 학생 행의 코드를 6자리로 재발급한 후 새 코드로 다시 연결**한다. 미전송 기기 기록은 별도로 보존되며 새 서버 기록에 자동 덮어쓰지 않는다.

다음은 변경하지 않았다.

- 로컬 `EC1234` 번호, `echo:` 키, SAVE_VERSION 9 및 실제 학생 상태 구조
- `createRequestId` 멱등 발급, expectedRevision/CAS, 서버/기기 기록 선택과 충돌 백업
- 1500ms 자동 저장 debounce, 오프라인 pending, 미래 버전 저장 보호
- 레벨·경험치·정령·장비·골드·지역 진행·농장·탑 기록·교육 내용
- 관리자 Auth, `app_admins`, 기존 감사/백업/soft delete·restore 구조

운영 적용 전후 기존 6개 저장 행의 코드·상태·revision·삭제 여부를 합산한 fingerprint가 동일했다. 기존 감사 8건과 백업 6건도 마이그레이션 직후 변하지 않았다. 이후 실제 검사는 새 TEST 행 1건만 사용했다.

## 영속 요청 제한과 복원 증표

새 `student_save_guarded` RPC는 **요청 제한 차감과 기존 저장 RPC를 한 DB 트랜잭션**에서 처리한다. 카운터는 `student_save_rate_limits`에 보관하고 원자적 UPSERT 및 행 잠금으로 동시 요청을 처리한다. 함수 인스턴스 재시작/복수 인스턴스에서도 동일한 카운터를 쓴다. 제한된 요청의 앞선 차감은 되돌리고, 정상 코드 확인은 실패 예산을 차감하지 않는다. 만료 카운터는 인덱스를 사용해 최대 500개씩 `FOR UPDATE SKIP LOCKED`로 정리한다. 학생 기록 DELETE 권한은 여전히 없다.

IP·기기 식별값·코드는 서버 HMAC으로 바꾼 후 카운터 식별값으로 사용한다. 카운터에 원문 IP, 코드, 닉네임, 세이브 내용은 넣지 않는다. 요청/오류 로그에도 코드·복원 증표를 출력하지 않는다.

| 구분 | 최종 제한값 |
|---|---|
| 모든 정상/비정상 요청 | 기기 120회/분, IP 3,000회/분 |
| 복원 증표 없는 코드 조회/저장 시도 | 기기 12회/분, 동일 코드 12회/분, IP 300회/분, 전체 600회/분 |
| 코드 확인 실패 | 기기 8회/10분 및 30회/일, 동일 코드 20회/시간 |
| 공유 IP의 확인 실패 | 600회/시간 및 1,200회/일 |
| 전체 확인 실패 | 600회/시간 및 2,000회/일 |
| 신규 발급 | 기기 5회/분 및 20회/시간, IP 300회/시간 및 1,000회/일, 전체 600회/시간 및 3,000회/일 |

시간창은 DB 시간 기준의 고정 구간이다. 구간 경계의 순간적인 버스트가 가능하며 여러 시간 단위 제한을 함께 적용한다. 기기 ID나 IP 하나만 신뢰하지 않고 동일 코드/전체 제한으로 식별값 회전 및 분산 시도를 제한한다. 공격이 계속되면 신규 수동 코드 입력은 일시 제한될 수 있다. 정상 연결된 기기와 로컬 플레이는 계속 사용할 수 있도록 분리했다.

성공한 발급/복원/저장에는 **30일 유효, 코드와 기기에 결합된 HMAC 복원 증표**를 반환한다. 이 증표로 정상 이어하기·자동 저장을 추측 실패 예산과 분리한다. 일반 요청 상한은 계속 적용한다. 코드가 재발급되면 이전 증표로 새 코드에 접근할 수 없다. 증표는 기존 CloudSync 연결 메타데이터에만 보관하며 게임 상태나 Presence에는 넣지 않는다. 별도 UI 설정 키 `eco:cloud:device`에는 무작위 기기 ID만 저장한다.

429 응답은 `Retry-After`와 대기시간을 반환한다. 학생에게 잠시 기다렸다 다시 시도하도록 안내하고 기기 기록을 유지한다. 클라이언트도 서버 대기시간을 지켜 추가 요청을 줄인다. 존재하지 않는 코드·삭제된 기록·폐기된 코드는 같은 NOT_FOUND 흐름으로 처리한다. RLS/FORCE RLS를 유지하고 anon/authenticated의 테이블 및 서버 RPC 접근을 차단했다. 브라우저에는 publishable key만 있다.

## 학생·관리자 UI

기존 학생 모달 안에 큰 고정폭 6자리 코드와 닉네임을 표시한다. 카드에는 게임명, 닉네임, 코드, 다른 기기 이어하기 및 보관/분실 안내만 있다. 모든 값은 DOM textContent로 넣는다. 학생 화면에는 복사·카드 출력·닫기만 추가했다.

관리자는 기존 신규 발급·재발급·코드 보기 흐름에서 학생별 카드를 출력할 수 있다. 기존 서버에는 권한 검증과 감사 기록을 거친 평문 코드 보기 기능이 이미 있었으며 이를 재사용했다. 목록의 마스킹은 6자리 중 4자리를 숨긴다. 재발급은 동일 행에서 기존 코드를 무효화하고 기존 revision/백업/감사 동작을 그대로 따른다.

출력 시 카드만 별도의 임시 영역에 넣고 print CSS로 다른 내용을 숨긴다. 출력 종료/실패 시 임시 카드를 제거한다. OS 인쇄창 호출 후 취소와 복귀를 확인했으며, 실제 종이 출력은 수행하지 않았다.

## 검증 결과

| 환경/방식 | 실제 확인한 결과 |
|---|---|
| 격리 PostgreSQL/PGlite + 실제 핸들러 | 저장·동기화·관리자·보안·카드·캐시 관련 **81/81 통과**. 후속 학급 한도 적용 후 재실행 결과다. |
| 격리 동시 요청 | 같은 기기의 잘못된 코드 20개 동시 요청을 두 핸들러에 분산: 8개 NOT_FOUND, 12개 429. 동일 코드/공유 IP/전체 한도, 서명 위조·기기 변경·만료 및 제한 후 정상 증표 이용 검사 통과. |
| 동일 IP 학급 모의 | 학생 30명, 학생마다 오입력 3회(총 90회) 후 발급·정상 복원, 이후 총 **1,200회 저장 모두 성공**. 정상 작업에 429 없음. 실패 카운터에는 의도한 오입력만 집계됐다. |
| 운영 `student-save-v2`, TEST 1건 | 6자리 신규 발급, 별도 기기 ID 복원, revision 1→2 저장, 원 기기 증표 복원, 같은 createRequestId 재시도 확인. 코드/토큰을 출력하지 않았다. |
| 운영 관리자 RPC, TEST 1건만 | 같은 행의 코드 재발급, revision 2→3, 6자리, 이전 코드 NOT_FOUND, 플레이 정보 동일 확인. 이후 TEST만 soft delete(revision 4), 백업 2건/감사 2건 보존 확인. 운영 Auth 로그인 UI 검사는 재수행하지 않았다. |
| 운영 접근 권한 | 새 관리자 함수 무인증 호출 401. anon의 guard 실행, authenticated의 카운터 읽기 차단. 기존 학생 데이터 fingerprint 동일. |
| 실제 브라우저, 서로 다른 2개 origin | 빈 기기에서 새 게임→6자리 카드→다른 기기 소문자/공백 입력으로 복원. 새로고침→학생 선택→코드 없이 복원. 여러 기기 기록 분리, 오프라인 재화 변경/pending→온라인 revision 2 복구 확인. |
| 실제 브라우저 충돌 | 한 기기에 70골드, 다른 기기에 80골드로 충돌. 자동 덮어쓰기 없이 기존 선택 화면 표시, 서버 선택 후 정상 복귀. |
| 실제 브라우저 관리자, 격리 서명 Auth 계약 | TEST 관리자 로그인, 신규 학생 6자리 카드, 복사/출력 버튼, 새로고침 후 관리자 목록 확인. 운영 비밀번호·토큰은 사용/기록하지 않았다. |
| 1024×768 브라우저 iframe | 같은 기기 이어하기 및 카드 버튼/코드 확인. 카드 가로 넘침 없음. Galaxy Tab S5e 실기기 터치·인쇄 검증은 미수행. |
| 교실 운영 모의 브라우저 2개 + 가상 학생 28명 | 목록 30명, 다른 학생 탑 18층·07:42 표시. 이동/지역 변경 후 movementEnabled=false, sent=0, requests=0, 원격 DOM/레코드=0, 각 activeChannels=1. 코드/증표 Presence 노출 검사 0건. 실제 운영 Realtime에 30개 연결을 만들지 않았다. |
| 기존 게임 | 실제 브라우저 이동, 지도, 가방, 일반 전투 화면, 미니게임 진입 확인. 6개 테마, 8종 탑 몬스터, 퍼즐/돌봄/플로킹, 장비/생태기술, 저장 마이그레이션, 사운드 등 기존 자동 회귀 실행. 해당 제품 파일은 수정하지 않았다. |

전체 자동 회귀는 **129개 중 128개 통과, 기존 실패 1개**다. `tests/ecotech-visual.test.cjs`가 `js/game.js`를 과거 아트 작업 당시 고정 해시와 비교하여 중단한다. 현재 HEAD와 작업 파일은 동일하다. 현재 해시 `ebd447…`, 기존 테스트 기준 `60faa7…`로 이번 작업에서 발생한 변경이 아니다. 이 기준 파일이나 게임 코드는 수정하지 않았다. 후속 DB 한도 보완 후 변경 영향이 있는 81개 테스트를 다시 통과했다.

게임 내 오류 수집은 두 저장 브라우저 및 교실 브라우저에서 0건이었다. 다만 브라우저 관찰 도구의 콘솔 수집에는 학생/관리자 탭 최초 생성 시 `MutationObserver.observe` 대상이 Node가 아니라는 오류가 각각 1건 남았다. URL/스택이 제공되지 않아 발생 출처를 확정하지 못했다. 새로고침과 이후 조작에서는 추가 발생이 없었고, 관리자 페이지는 제품의 해당 MutationObserver 코드를 로드하지 않는다. 따라서 전체 콘솔 오류 0건이라고 보고하지 않는다.

운영 Supabase Security/Performance Advisor도 확인했다. 새 guard는 SECURITY INVOKER이며 anon/authenticated 실행 권한이 없다. 서비스 전용 테이블의 RLS/no policy INFO는 브라우저 권한을 주지 않는 현재 모델과 일치한다. 신규 만료 인덱스의 unused INFO는 아직 운영에서 만료 정리 쿼리 사용이 관측되지 않았다는 뜻으로 인덱스를 제거하지 않았다.

이전 통합 점검에서도 있었던 `rls_auto_enable()`의 공개 SECURITY DEFINER 실행 경고와 Auth의 유출 비밀번호 보호 비활성 경고는 남아 있다. 전자는 반환형이 `event_trigger`인 기존 함수이며 이번 guard가 아니다. 기존 프로젝트 보안/요금제 설정은 이번 저장코드 작업에서 변경하지 않았다. 별도 검토 사항: [공개 함수 실행 권한 안내](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [유출 비밀번호 보호 안내](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## 변경 파일

신규:

- `js/save-code-card.js`, `css/save-code-card.css`
- `supabase/functions/student-save/security.mjs`
- `supabase/migrations/20261025075744_student_saves_six_character_guard.sql`
- `supabase/migrations/20261025081638_student_save_classroom_budget.sql`
- `tests/cloud-code-security.test.mjs`, `tests/save-code-card.test.mjs`
- 이 보고서

제품 수정:

- `js/cloud-save.js`, `js/cloud-sync.js`, `js/cloud-ui.js`
- `js/student-admin.js`, `js/student-admin-client.js`
- `js/admin-config.js`, `js/supabase.js`
- `supabase/functions/student-save/handler.mjs`, `supabase/functions/student-save/index.ts`, `supabase/config.toml`
- `index.html`, `admin.html` (공통 카드 CSS/JS와 버전)
- `js/build-version.js`, `admin-state.html`, `css/style.css` (기존 버전 관리 도구에 의한 버전 문자열 갱신)

검증 보조 수정:

- `tests/cloud-save.test.mjs`, `tests/cloud-sync.test.mjs`, `tests/cache-version.test.cjs`
- `tests/helpers/cloud-save-runtime.mjs`, `tests/helpers/admin-runtime.mjs`
- `tests/serve-cloud-save.mjs`, `tests/cloud-save.html`, `tests/serve-cloud-sync.mjs`, `tests/cloud-sync-browser.js`
- `tests/serve-student-admin.mjs`, `tests/serve-classroom.mjs`, `tests/classroom-browser.js`

## 배포 전에 남은 작업

1. 로컬 변경을 검토하고 사용자가 commit/push 및 Pages 배포 여부를 결정한다. 새 함수/마이그레이션은 이미 적용되어 있어 다시 적용할 필요가 없다.
2. Pages의 BUILD_VERSION 2026.10.25.1 및 학생/관리자 페이지의 v2 경로 로딩을 확인한다. 현재 운영 페이지를 6자리 UI로 배포했다고 간주하지 않는다.
3. 기존 8자리 코드 학생은 관리자가 같은 행에서 6자리로 재발급하고 개인 카드를 전달한다. 재발급은 플레이 기록을 초기화하지 않는다. 미전송 로컬 기록이 있으면 보존 여부를 먼저 확인한다.
4. 이전 클라이언트 사용이 끝난 뒤 기존 `student-save`/`student-admin` 경로를 폐기하거나 새 구현으로 전환한다. 이전 `student-save`는 기존 8자리 구현으로 남아 있으나 새 6자리 코드를 받아들이는 우회 경로는 아니다. 이전 경로까지 새 보안 체계로 전환 완료했다고 주장하지 않는다.
5. 운영 관리자 브라우저 로그인, Galaxy Tab S5e 실기기, 학교 Wi-Fi와 실제 인쇄를 소수 TEST로 최종 확인한다. 출처 불명 초기 관찰 오류와 과거 아트 고정 해시 테스트는 별도로 확인한다.

이번 변경은 Realtime 채널이나 Presence 필드를 추가하지 않는다. 6자리 저장 및 카운터는 HTTP/DB 작업이며 위치 Broadcast를 재활성화하지 않는다. 실제 월간 Realtime 무료 한도 준수를 이 검사만으로 보장하지 않는다.
