# Eco Chronicle 구조 정리 완료 보고서

R43 게임의 기능·디자인·전투 구조를 유지하며 GitHub Pages용 멀티파일 프로젝트로 변환했습니다. 원본 HTML을 별도 백업 ZIP에 보존했습니다. 로그인·Supabase·멀티플레이·서비스 워커·번들러는 추가하지 않았습니다.

## 결과

| 항목 | 결과 |
|---|---:|
| 변경 전 HTML | 54,078,898바이트 · 54.079MB · 51.574MiB |
| 변경 후 index.html | 1,678바이트 · 약 1.64KiB |
| HTML 크기 감소 | 99.99690% |
| 배포 폴더 전체 파일 | 776개 · 문서/설정/검증 요약 포함 |
| 이미지 | 751개 |
| 오디오 바이너리 파일 | 0개 |
| JavaScript | 17개 |
| CSS | 1개 |
| 기존 이미지 data URI 삽입 | 881건 |
| 중복 삽입 통합 | 130건 |
| 가장 큰 배포 파일 | 814,160바이트 · 1MB 미만 |

MB는 1,000,000바이트, MiB는 1,048,576바이트 기준입니다. 배포 파일 전체는 약 39.24MB입니다. HTML만 1.6KB가 되었으며 전체 게임 용량이 1.6KB라는 뜻은 아닙니다. 원본 백업과 ZIP 자체는 배포 폴더 파일 수에 포함하지 않았습니다.

이미지는 재인코딩·축소 없이 원본 PNG/WebP 바이트를 추출했습니다. SHA-256이 같은 데이터만 파일 하나로 통합했습니다. 사용 여부가 확실하지 않은 리소스와 기존 대체 그래픽도 보존했습니다. 파일 해시/크기/참조 수는 asset-manifest.json에 있습니다.

음원 data URI는 없었습니다. 기존 사운드는 Web Audio로 악보와 효과음을 합성하므로 audio-data.js에 데이터를 보존하고 재생 로직을 유지했습니다. 임의로 MP3로 바꾸거나 비어 있는 audio 폴더를 만들지 않았습니다.

## 실제 파일 구조

| 경로 | 내용 |
|---|---|
| index.html | 루트 진입 HTML, 외부 CSS/JS 연결 |
| css/style.css | 원본 스타일 전체 |
| js/ | 일반 스크립트 17개 |
| assets/images/characters/ | 주인공·NPC·펫 등 263개 |
| assets/images/monsters/ | 몬스터 이미지 143개 |
| assets/images/backgrounds/ | 배경 이미지 32개 |
| assets/images/objects/ | 오브젝트·기타 이미지 313개 |
| asset-manifest.json | 파일 경로·해시·크기·참조 수·로드 순서 |
| .nojekyll | 정적 파일 배포 설정 |
| README.md | 실행/배포 안내 |
| docs/STRUCTURE_REPORT.md | 이 보고서 |
| docs/SAVE_COMPATIBILITY.md | 저장 호환성 및 주소 변경 안내 |
| docs/TEST_RESULTS.json | Chromium 검증 요약 |

JS 로딩 순서:

- `js/boot.js`
- `js/sprites.js`
- `js/sprite-meta.js`
- `js/player-tint.js`
- `js/visuals.js`
- `js/audio-data.js`
- `js/gear-data.js`
- `js/npc-data.js`
- `js/map-utils.js`
- `js/theme-data.js`
- `js/learning-data.js`
- `js/learning-ui.js`
- `js/learning-diagrams.js`
- `js/battle-view.js`
- `js/encounters.js`
- `js/minigame.js`
- `js/game.js`

game.js의 전역 의존성이 많은 이동·저장·장비·일부 UI를 무리하게 재분할하지 않았습니다. ES module, async로 변환하지 않았습니다. 자료 및 기능별 파일로 분리하되 기존 함수 이름과 실행 순서를 유지했습니다. 데이터 ID·장비 ID·스테이지 ID·SAVE_VERSION·저장 키를 변경하지 않았습니다.

## 발견한 오류와 수정

| 발견한 문제 | 원인 | 수정 |
|---|---|---|
| 파일 분리 후 일부 테마 초기화 실패 | 단일 script에서 먼저 인식되던 mkObjs 함수가 테마 데이터보다 나중에 선언됨 | 본문 변경 없이 map-utils.js로 옮겨 테마 데이터 앞에서 선언 |
| 시작 화면 배경 404 | 외부 CSS에서 사용자 정의 속성의 URL이 css/ 기준으로 해석됨 | 해당 배경 속성 URL을 document.baseURI 기준으로 계산 |
| 미니게임 이미지 캐시 재사용 실패 가능성 | Image.src는 절대 URL, 입력 값은 상대 URL | 동일 기준으로 URL을 해석하여 비교 |

위 세 가지는 파일 분리에 따른 최소 호환성 수정입니다. 리소스 주소는 소스에 상대경로로 기록하고 실행 중 현재 문서 주소로 해석합니다. 특정 컴퓨터나 서버 주소를 하드코딩하지 않았습니다. 피부색/머리색 변경 후 Canvas가 실행 중 생성하는 data URL은 정적 내장 이미지가 아니므로 원본 기능 그대로 유지합니다.

## 기능 검증

실제 headless Chromium 153.0.8010.0 및 로컬 HTTP 정적 서버에서 저장소 하위경로를 재현했습니다.

- 통과: 테마/몬스터/아이템/NPC/레벨/외형/사운드 데이터 및 저장 키 원본과 동일
- 통과: 시작 화면 원본 대비 픽셀 차이 0
- 통과: 원본 저장 로드: 장비 및 진행 관문 유지
- 통과: 저장·새로고침·불러오기: 골드/경험치 유지
- 통과: 실제 UI: 이름·외형·짙은 피부·정령 선택·월드 진입
- 통과: 키보드 캐릭터 이동 및 방향/걷기
- 통과: 가방·장비 장착·경험치·레벨 상승
- 통과: NPC 퀴즈 퀘스트 수행·완료·보상
- 통과: 농장/채집 맵 진입 및 복귀
- 통과: 여섯 테마 이동·일반 몬스터 전투·공격 시 체력 감소·보스 표시
- 통과: 두 미니게임 시작·일시정지·실패·재도전·승리 후 실제 전투 연결
- 통과: 상대경로 이미지 캐시 재사용
- 통과: 실제 AudioContext running, BGM 예약, SFX 호출
- 통과: 751개 외부 이미지 전부 HTTP 로드와 decode 통과
- 통과: 저장소 하위경로 /eco-chronicle/ 및 index.html 직접 진입
- 통과: 390×844 모바일 크기 시작 화면 표시
- 통과: 처리되지 않은 브라우저 오류 0, 정적 파일 실패 응답 0

원본 백업 SHA-256과 이미지 751개 바이트 해시를 확인했습니다. 추출 URL을 다시 data URI로 되돌리고 위 세 최소 수정을 역변환하면 JavaScript가 원본과 정확히 일치합니다. CSS 역시 원본과 정확히 일치합니다. 모든 외부 JS의 문법 검사를 통과했습니다.

브라우저 검증 후 작업 공간 정리로 임시 파일이 사라져, 보존된 동일 R43 원본에서 같은 분리본을 복구했습니다. 복구 후 원본 SHA, 이미지 해시, JS/CSS 역복원 일치, 문법 검사를 다시 확인했습니다. 위 기능 검증 결과는 그 이전에 실제로 수행한 브라우저 검사 결과입니다.

실제 휴대폰/Safari/Firefox 및 공개 GitHub Pages 주소는 아직 검사하지 않았습니다. 소리는 AudioContext 실행과 예약/호출을 확인했으며 음질 청취 검사는 하지 않았습니다. 한국어 시스템 폰트는 사용자 기기 환경을 따르며 원본에 없던 웹폰트를 추가하지 않았습니다.

## 배포 시 필요한 사항

1. 배포 ZIP을 압축 해제하고 **내용 전체**를 저장소 루트에 올립니다. index.html만 또는 ZIP 자체만 올리면 실행되지 않습니다.
2. 파일이 700개 이상이므로 GitHub Desktop으로 커밋/푸시하는 방식이 편합니다. 웹 업로드 시 파일 수를 나누고 폴더 구조를 유지하세요.
3. Settings → Pages → Deploy from a branch → main → /(root)로 설정합니다. 다른 브랜치라면 해당 브랜치를 선택합니다.
4. 별도 빌드 명령·서버·API 키·DB는 필요 없습니다. 실제 저장소 생성/배포는 이번 작업에 포함하지 않았습니다.

원본 HTML은 25MiB보다 크므로 별도 원본 백업 ZIP은 배포 저장소에 넣지 마세요. 배포 프로젝트의 개별 파일은 모두 1MB 미만입니다.

## 저장 데이터 제한

같은 origin의 원본 저장 불러오기 및 새로고침 후 유지 검증을 통과했습니다. 다만 file: 로컬 게임에서 https: GitHub Pages로 이동하면 origin이 달라져 기존 저장이 자동으로 옮겨지지는 않습니다. 키를 유지해도 브라우저의 저장 공간은 별개입니다. 기존 게임 파일과 기존 브라우저 데이터를 보관하세요. 프로그램 백업은 사용자 플레이 기록의 백업이 아닙니다. 자세한 안내는 SAVE_COMPATIBILITY.md에 있습니다.

## 원본 확인값

SHA-256: `d38da899ea45f2eaf4a77839d234cd26f388b2cefe08d228ece5c671c7baf30d`

## 공식 문서

- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
