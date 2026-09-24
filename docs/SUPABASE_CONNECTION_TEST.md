# Supabase 최소 연결 테스트

검증일: 2026-09-23

## 변경 파일

- `js/supabase.js` 신규: 클라이언트 생성, 비파괴 연결 검사, 콘솔 결과/오류 출력.
- `index.html` 수정: 기존 `game.js` 뒤에 CDN과 로컬 초기화 파일을 불러오는 두 줄만 추가.
- `docs/SUPABASE_CONNECTION_TEST.md` 신규: 이번 검증 기록.

기존 게임 JavaScript/CSS, 리소스, 세이브 버전·키·구조, asset-manifest.json은 수정하지 않았다. 패키지 설치, 빌드 설정, 커밋, 푸시, 배포는 수행하지 않았다.

## 연결 방식

Supabase JS **2.117.0** UMD 파일을 jsDelivr CDN에서 불러온다. 버전을 고정했고 두 스크립트는 `defer`로 순서를 유지한다. 기존 게임은 그 전에 실행되며 Supabase의 완료를 기다리지 않는다. 일반 정적 HTML과 상대 경로이므로 Node.js 빌드 없이 GitHub Pages에서 사용할 수 있다. 실제 GitHub Pages 배포는 이번에 수행하지 않았다.

- Project URL: `https://akpkwypxupghvcghywab.supabase.co`
- 제공받은 브라우저용 publishable key만 사용했다. secret/service_role 키와 데이터베이스 비밀번호는 사용하지 않았다.
- 클라이언트: `window.ecoSupabase.client`
- 상태: `window.ecoSupabase.status` (`initializing`, `testing`, `connected`, `failed`)
- 실패 정보: `window.ecoSupabase.error` (HTTP 상태 및 오류 메시지)

SDK의 세션 영속화·자동 토큰 갱신·URL 세션 감지를 모두 껐다. 로그인/회원가입/Auth API 호출, 기존 localStorage 읽기·쓰기, Realtime 채널 연결은 추가하지 않았다.

## 비파괴 검사

`client.storage.listBuckets({ limit: 1 })` 한 번으로 이 공개 클라이언트에 보이는 Storage 버킷 메타데이터를 읽는다. 파일 내용이나 게임 테이블을 조회하지 않으며, 생성·업로드·INSERT·UPDATE·DELETE·스키마 변경은 없다. 목록 내용과 키를 콘솔에 출력하지 않는다. 보이는 버킷이 없어 빈 배열이어도 정상이다.

성공은 **SDK 초기화 및 공개 키로 Storage API에 접근하는 읽기 요청 성공**을 의미한다. DB 테이블 권한이나 Realtime/Presence 연결까지 검증했다는 뜻은 아니다. 향후 접근 정책 변경으로 이 요청이 거부되어도 게임은 계속 실행된다.

검사는 페이지 로드마다 1회 수행한다. 12초가 지나면 대기를 끝내고 실패를 기록한다. 이 시간 제한은 진행 중인 SDK 네트워크 요청 자체를 취소하지는 않으며, 늦게 도착한 결과로 성공 상태를 덮어쓰지 않는다.

## 실제 브라우저 결과

임시 로컬 서버 `http://127.0.0.1:60138/`에서 앱 내 브라우저로 확인했다. 기존 사용자 저장과 분리된 임시 포트에서 테스트 캐릭터 `연결검증 / EC0856`을 사용했다.

실제 콘솔 출력:

```text
[Supabase] client initialized
[Supabase] connection test success
```

초기 접속과 새로고침 모두 위 두 메시지가 출력되었다. 별도 읽기 전용 HTTP 확인에서도 Storage 응답은 `200`, 본문은 `[]`였다.

| 검사 | 결과 |
|---|---|
| 기존 게임 시작·이름 등록·외형·정령 선택 | 통과 |
| 숲 월드·캐릭터·NPC·배경·HUD 표시 | 통과, 스크린샷 확인 |
| 기존 캐릭터 키보드 이동 | 통과, hero의 left 298px → 314px |
| 가방 UI와 닫기 | 통과 |
| 기존 저장 버튼 | 저장 완료 EC0856 표시 |
| 새로고침 후 기존 불러오기 입력 | EC0856 입력 후 월드 진입 |
| 저장 값 유지 | 이름·Lv.1·HP 60/60·골드 60 유지 |
| Supabase 초기화·연결 콘솔 | 성공 |
| 정상 실행 중 새 콘솔 오류/경고 | 0개 |
| 게임 로컬 리소스 HTTP 실패 | 0개 |
| SDK가 없을 때 게임 시작·이어하기 | 통과 |

CDN 실패 검사는 임시 서버의 응답에서만 CDN 태그를 제외해 수행했다. 프로젝트 파일에 테스트 분기를 넣지 않았다. 해당 화면의 예상 콘솔 오류는 다음과 같으며 게임은 정상 진입했다.

```text
[Supabase] connection test failed: Supabase CDN unavailable. Check network, CSP, or CDN loading. Check URL, network/CORS, CDN initialization, and project availability.
```

추가로 메모리 내 JavaScript 컨텍스트에서 성공·CDN 누락·초기화 예외·HTTP 401·403·네트워크 거부·시간초과·잘못된 URL·잘못된 키 9개 시나리오를 모의 검사했고 모두 예상 상태로 종료했다. 실제 키를 바꾸거나 서버 정책을 바꿔 장애를 만들지는 않았다. `node --check js/supabase.js`, `git diff --check`도 통과했다. Node는 개발 검증에만 사용했으며 배포/게임 실행 의존성이 아니다.

전투·보스전·미니게임의 전체 회귀 플레이는 이번 범위에서 수행하지 않았다. 기존 사용자 실제 세이브를 직접 열지 않았으며 저장 코드는 변경하지 않았다.

## 발견 및 해결한 문제

조사 단계에서 REST 루트 `/rest/v1/`의 API 문서 조회가 HTTP 401 `Secret API key required`를 반환했다. 이 주소는 공개 키 연결 검사에 적합하지 않아 사용하지 않았다. secret key를 도입하지 않고 공개 키로 성공하는 Storage 메타데이터 읽기로 검사 방식을 바꿨다. 최종 코드에는 해당 REST 루트 요청이 없다.

네트워크/CORS 실패는 브라우저가 상세 원인을 가릴 수 있어 콘솔에서 가능한 원인을 함께 안내한다. HTTP 상태를 받으면 401은 키·프로젝트 URL, 403은 접근 정책 확인을 안내한다. 모든 실패는 이 파일 안에서 처리하고 게임 상태나 UI를 바꾸지 않는다.

## 다음 단계에서 Presence를 하려면

아직 구현하지 않았다. 다음 작업 전에 방/테마별 채널 구분, 임시 참가자 식별자와 공개할 최소 정보, 공개/비공개 채널 및 접근 정책을 결정해야 한다. 이후 별도 모듈에서 구독 성공 확인, 입장/퇴장/재연결 처리, track/untrack, 두 브라우저 간 Presence 검증을 추가하면 된다. 위치 동기화·캐릭터 표시·DB 저장은 각각 별도 범위로 정해야 한다.

## 참고한 공식 문서

- [Supabase JS CDN 설치](https://supabase.com/docs/reference/javascript/installing)
- [클라이언트 초기화](https://supabase.com/docs/reference/javascript/initializing)
- [Storage listBuckets](https://supabase.com/docs/reference/javascript/file-buckets-listbuckets)
