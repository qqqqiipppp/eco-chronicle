# 학생 클라우드 세이브 1단계

2026-10-21. 기존 Supabase 프로젝트 `eco-chronicle` (`akpkwypxupghvcghywab`, 서울)에 DB migration과 `student-save` Edge Function v1을 실제 적용했습니다. Git commit/push 및 GitHub Pages 프런트 배포는 하지 않았습니다. 실제 학생 로컬 세이브를 이전·수정·초기화하지 않았습니다.

## 1. DB schema

`public.student_saves`:

| 필드 | 형식/기본값 |
|---|---|
| id | uuid PK, `gen_random_uuid()` |
| code | text UNIQUE NOT NULL, 지정 코드 형식 CHECK |
| save_data | jsonb NOT NULL, object/DB 표현 256KiB 이하 CHECK |
| save_version | integer NOT NULL, 양수 |
| revision | bigint NOT NULL DEFAULT 1, JS 안전 정수 범위 |
| created_at | timestamptz NOT NULL DEFAULT now() |
| updated_at | timestamptz NOT NULL DEFAULT now() |
| deleted_at | timestamptz NULL |

관리자·학생 계정 테이블은 추가하지 않았습니다. `last_loaded_at`은 넣지 않아 읽기 때문에 revision/시간이 변하지 않습니다. 코드 재사용은 UNIQUE 제약으로 막으며, soft-deleted 코드는 새 생성에 재할당하지 않습니다.

실제 서버 migration version/name과 일치하는 파일: `supabase/migrations/20261021090016_student_saves_foundation.sql`.

## 2. RLS와 권한

- RLS와 FORCE RLS를 켰습니다. 의도적으로 학생용 허용 정책은 없습니다.
- PUBLIC/anon/authenticated의 테이블 권한을 모두 회수했습니다. 기본 권한에 영향을 받지 않도록 service_role 권한도 명시적으로 정리한 후 SELECT/INSERT/UPDATE만 부여했습니다. DELETE는 부여하지 않았습니다.
- SQL RPC 3개는 SECURITY INVOKER, 빈 search_path, service_role EXECUTE 전용입니다. anon/authenticated는 RPC도 직접 호출할 수 없습니다.
- 이 테이블을 Realtime publication에 추가하지 않았습니다. 기존 Presence/Broadcast 설정은 바꾸지 않았습니다.
- 브라우저는 공개 publishable key만 사용합니다. 서버용 키는 Supabase Edge 환경에서만 읽고 파일·브라우저·로그에 값을 출력하지 않습니다. [Supabase 환경변수 문서](https://supabase.com/docs/guides/functions/secrets).

보안 advisor의 이 테이블 `RLS Enabled No Policy` INFO는 **닫힌 저장소 설계상 의도된 상태**입니다. 이를 없애려고 anon 허용 정책을 만들면 안 됩니다. 프로젝트 기존 `rls_auto_enable` 함수에 대한 SECURITY DEFINER 실행 권한 WARN도 관찰됐으며, 이번 새 함수와 무관한 기존 설정은 변경하지 않았습니다. [관련 진단 안내](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).

## 3. 코드 생성

Edge 서버의 `crypto.getRandomValues()`로 8자를 생성합니다. 0/O, 1/I, L을 제외한 31개 문자에서 균등 추출하며, byte 범위 초과는 재추출해 modulo bias를 피합니다. DB UNIQUE 충돌이면 최대 8회 새 코드를 시도합니다. 기존 행을 덮는 upsert는 사용하지 않습니다.

예시 `EC-7K4P-2Q9M`. 소문자/대문자와 하이픈 없는 `ec7k4p2q9m`도 같은 코드로 정규화됩니다. 기존 `EC1234`는 클라우드 접근 코드로 허용하지 않습니다.

이 코드는 학생 저장에 대한 비밀 접근키입니다. publishable key는 학생 인증이 아니며 CORS도 로그인 수단이 아닙니다. 실제 코드 전체나 세이브 JSON을 로그에 남기지 않습니다.

## 4. Edge Function/API

단일 POST 주소: `https://akpkwypxupghvcghywab.supabase.co/functions/v1/student-save`.

| action | 입력 | 처리 |
|---|---|---|
| create | saveData, saveVersion | 서버 코드 생성 → 신규 행, revision 1 |
| load | code | 정확한 코드 + deleted_at IS NULL 조건으로 한 행 반환 |
| save | code, saveData, saveVersion, expectedRevision | revision 조건부 원자 UPDATE, 성공 시 +1 |

모든 필드는 camelCase입니다. 헤더는 `apikey`(기존 publishable key), `Content-Type: application/json`입니다. 함수의 `verify_jwt=false`는 새 함수에만 적용합니다. 본문에서 프로젝트 공개키 확인과 학생 비밀 코드 접근을 수행하며 학생 Auth 계정은 만들지 않습니다. [공식 함수 인증 안내](https://supabase.com/docs/guides/functions/auth).

정상 응답은 `ok/code/revision/saveVersion/updatedAt`, load는 추가 `saveData`입니다. 오류는 짧은 error 코드만 반환합니다. 충돌은 HTTP 409, `REVISION_CONFLICT`, `serverRevision`으로 응답하며 최신 데이터는 덮지 않습니다.

코드·JSON object·버전 정수·revision 안전 범위·128KiB 세이브·256KiB 요청을 검증합니다. 서버는 현재 학생 진행 필드만 받으며 `LEVELS/MONSTERS/SPRITES`, 이메일·전화번호 같은 추가 루트 필드를 받지 않습니다. 학생 표시 이름은 기존 save_data.name만 사용합니다. 퀘스트/농장/학습 등 필요한 중첩 진행은 유지합니다. 전체 치팅 검증 시스템은 아닙니다.

운영 CORS 기본 허용 origin은 `https://qqqqiipppp.github.io`입니다. OPTIONS와 no-store를 사용하며 쿠키에 의존하지 않습니다. 클라이언트 전체 요청/응답 읽기는 10초, 서버 DB RPC 요청은 8초 제한입니다. timeout 뒤 자동 재시도는 하지 않습니다. 저장이 이미 완료됐을 수도 있으므로 다음에는 load로 최신 revision을 확인합니다.

## 5. CloudSave 클라이언트

`js/cloud-save.js`:

```js
const created = await CloudSave.create(S);
// created.code를 사용자가 따로 보관. 기존 S.code를 바꾸지 않습니다.
const loaded = await CloudSave.load(created.code);
const state = loaded.saveData;
state.gold += 5;
const saved = await CloudSave.save(created.code, state, loaded.revision);
if (!saved.ok) console.info(saved.message); // 학생 안내에는 message만 사용
```

메서드는 성공/실패 객체를 반환합니다. 통신은 이 모듈에만 있으며 로드 시 자동 요청·localStorage 접근·S 변경·게임 입력 잠금은 없습니다. `Save.save/load`, migrate, 기존 echo 키는 수정하지 않았습니다.

업로드는 현재 newState 학생 필드와 실제 동적 진행 `learning/arcadeRecords`를 복사·마이그레이션해 만들고 scene/modal은 제외합니다. 원본 S나 기존 슬롯의 미등록 필드를 삭제하지 않습니다. 게임 규칙·UI 정의를 올리지 않습니다. 클라우드 계약 밖의 임의 루트 필드는 업로드하지 않습니다. 향후 새 학생 진행 루트 필드를 추가하면 서버 STUDENT_FIELDS도 함께 갱신해야 하며, 알 수 없는 입력을 서버가 조용히 버리지는 않습니다.

cloud load는 응답 JSON/버전/metadata를 확인한 뒤 기존 `migrate()`를 실행합니다. 반환된 saveData는 현재 SAVE_VERSION 9이며, 원래 서버 버전은 storedSaveVersion에 있습니다. 미래 버전은 거부하고, 현재 데이터를 자동 적용/저장하지 않습니다. 이후 SAVE_VERSION 10/11과 migration을 추가해도 동일 경로를 사용합니다.

클라우드 접근 코드와 기존 로컬 S.code는 별개입니다. 이 단계에서 S.code를 새 코드로 대체하지 않고, Presence로 클라우드 비밀키를 보내지도 않습니다. 기존 EC 코드 자동 이전·자동 동기화·시작 화면 변경은 하지 않았습니다.

## 6–10. 실제 테스트

| 검증 | 결과 |
|---|---|
| 실제 Supabase create | TEST-CLOUD 생성 성공, revision 1, saveVersion 9, 반환 코드 형식 정상 |
| 실제 load A/B | 서로 분리된 JS 실행 환경 2개가 코드만으로 load 성공. B localStorage 비어 있음 |
| 데이터 전체 비교 | migrate된 원본과 A/B 반환 saveData 전체 deep comparison 일치 |
| 실제 save / reload | gold 180→185, revision 1→2, 재로드에서 185 확인 |
| 실제 revision 충돌 | B의 이전 revision 1 저장 → REVISION_CONFLICT/serverRevision 2. A 데이터 유지 |
| 실제 anon 직접 SELECT/INSERT/UPDATE/DELETE | 모두 HTTP 401, 권한 거부 확인 |
| 실제 anon RPC 직접 실행 | HTTP 401 |
| 잘못된/없는 코드 | INVALID_CODE 400 / NOT_FOUND 404 |
| 비정상 JSON 데이터 | INVALID_SAVE_DATA 400 |
| 실제 CORS | GitHub Pages origin OPTIONS 204 및 정확한 Allow-Origin 확인 |
| 서비스 키/DB 비밀번호 | 저장소 실제 credential literal 검사 통과. 개발 PC로 서버 키 값을 가져오거나 저장소에 복사하지 않음 |
| 기존 로컬 저장 | 클라우드 성공/실패/충돌/timeout에도 내용·index·last 불변 검증 |

직접 UPDATE/DELETE 보안 검증은 NOT NULL PK의 `id IS NULL` 조건만 사용해 실제 행에 영향을 줄 수 없게 했고, INSERT 검증도 DB CHECK에 맞지 않는 TEST 코드로 수행했습니다.

실서버 테스트 생성 행은 2개이며 표시 이름은 모두 `TEST-CLOUD`입니다. 테스트 후 이름·테스트 로컬 코드·진행값·생성 날짜를 한정하고 대상 수가 정확히 2개인지 확인해 두 행에만 deleted_at을 설정했습니다. revision/updated_at도 갱신했고, 실제 DB의 동일 load/save RPC에서 모두 NOT_FOUND임을 추가 확인했습니다. 원본 JSON은 남아 있으며 영구 삭제나 실제 학생 행 수정은 하지 않았습니다. 일반 관리자 삭제/복구 API·UI를 구현한 것은 아닙니다.

실제 Chrome 창 제어는 현재 URL을 안전하게 판별할 수 없다는 도구의 차단으로 중단됐습니다. 따라서 **실제 브라우저 2개/context UI 테스트는 미완료**입니다. 위 A/B는 독립 VM 기반 JS 실행 환경 2개와 실제 Supabase HTTPS API를 사용한 검증이며, 실제 브라우저/태블릿 검증으로 표현하지 않습니다.

## 11. 파일

신규:

- `.gitignore` (로컬 환경변수/캐시 제외)
- `supabase/config.toml`
- `supabase/migrations/20261021090016_student_saves_foundation.sql`
- `supabase/functions/student-save/index.ts`, `handler.mjs`
- `js/cloud-save.js`
- `tests/cloud-save.test.mjs`, `tests/helpers/cloud-save-runtime.mjs`
- `tests/cloud-save.html`, `tests/serve-cloud-save.mjs`
- `tools/cloud-save-smoke.mjs`, `tools/install-cloud-save-test-runtime.cjs`
- 이 보고서

수정: `js/supabase.js`(기존 공개 설정 제공만 추가), `index.html`(모듈 로딩 1줄), `js/build-version.js`와 CSS의 배포 버전 query, `tests/cache-version.test.cjs`(추가된 script 수/순서). 배포 버전은 `2026.10.21.1`입니다. game.js/저장 로직/오디오/멀티플레이 로직과 이미지 원본은 변경하지 않았습니다.

## 12. 자동 회귀

클라우드 16개(실제 PostgreSQL WASM에서 SQL/RLS/role/RPC 실행 및 실제 HTTP 사용), 기존 저장 호환성 26개, 캐시 7개, 사운드 10개를 검증했습니다. 별도로 장비·생태기술, 지역 진행/새 게임/로컬 저장·이어하기, 탑 전투/8종 순위, 동물 돌봄, 퍼즐 focused 20보드/1200스왑, movement, Presence35명/테마20회, 접속 인원/탑 기록 테스트도 통과했습니다. 실제 화면을 조작한 회귀라고 주장하지 않습니다.

```text
node tools/install-cloud-save-test-runtime.cjs
node --test tests/cloud-save.test.mjs tests/legacy-save.test.cjs tests/cache-version.test.cjs tests/sound-settings.test.cjs
node tools/cloud-save-smoke.mjs
node tools/cloud-save-smoke.mjs --write-test --security
```

설치 도구는 공식 npm의 버전/무결성이 고정된 PostgreSQL 테스트 엔진만 OS 임시 폴더에 둡니다. 게임·Edge 실행에는 Node 패키지나 빌드가 필요하지 않습니다. --write-test는 실제 TEST 행을 새로 만드는 명시적 진단 옵션이고 자동으로 실행되지 않습니다. 코드 전체·세이브 본문을 출력하지 않습니다.

## 13. Dashboard 및 다음 작업

**현재 프로젝트의 DB/함수 적용은 완료되어 추가 Dashboard 설정이 필요하지 않습니다.** 프런트 파일은 아직 commit/push하지 않았으므로 GitHub Pages의 학생 화면은 기존 배포 상태입니다.

확인 순서: Supabase Dashboard → eco-chronicle → Table Editor의 student_saves/RLS → Edge Functions의 student-save/ACTIVE → deleted_at으로 격리된 TEST-CLOUD 2개 확인. 기존 채널 설정이나 Auth 설정을 바꿀 필요는 없습니다.

실제 브라우저 테스트를 나중에 수행하려면:

1. 로컬에서 `node tests/serve-cloud-save.mjs 54321` 실행.
2. 일반 창과 시크릿 창에서 `http://127.0.0.1:54321/tests/cloud-save.html` 열기. 기본 대상은 로컬 PostgreSQL입니다.
3. A에서 TEST 생성 → 코드 복사, B에서 코드만 입력 후 load → A 골드 +5 저장 → B 이전 revision 저장 충돌 확인.
4. 실제 Supabase 대상으로도 브라우저 검증하려면 Dashboard → Edge Functions → Secrets에서 `CLOUD_SAVE_ALLOWED_ORIGINS`를 `https://qqqqiipppp.github.io,http://127.0.0.1:54321`로 지정하고 같은 함수 소스로 재배포한 뒤, 테스트 페이지 대상을 실제 Supabase로 변경합니다. 개발 origin은 검사 후 제거할 수 있습니다. 학생 코드/서비스 키를 브라우저 설정에 붙이지 않습니다.

새 프로젝트에서 재현할 경우 SQL 파일을 한 번 적용하고, index.ts와 handler.mjs를 함께 새 student-save 함수로 배포합니다. 함수 자체의 공개키/코드 검증을 사용하므로 이 함수만 JWT 검증을 끕니다. 서버 기본 환경변수를 사용하며 서버 키를 GitHub 파일에 넣지 않습니다. 이미 적용된 현재 테이블에 CREATE migration을 다시 실행하거나 DROP해서는 안 됩니다.

향후 2단계에서 자동 이전/정식 이어하기 정책, 3단계에서 관리자 목록·편집·soft delete/복구를 별도로 연결합니다. 모든 향후 관리자 변경도 revision 증가와 updated_at 갱신 규칙을 지켜야 합니다. 학생 API에는 목록·삭제·복구·관리자 권한이 없습니다.
