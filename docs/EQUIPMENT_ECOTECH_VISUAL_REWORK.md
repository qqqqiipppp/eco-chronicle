# 장비·생태기술·탐험 구역 시각 개선 보고서

작성일: 2026-09-29

장비 25종·생태기술 8종·탐험 구역 8곳의 그래픽을 적용하고 자동 회귀, 실제 데스크톱 화면, 390×844 좁은 화면 검증을 완료했습니다. 아래 자동 테스트 결과와 실제 화면 검증을 구분하며, Galaxy Tab S5e 실기기 성능을 측정했다고 간주하지 않습니다.

## 작업 범위

기능이 완료된 장비 25종, 생태기술 8종, 생태기술 탐험 구역 8곳에 새 그래픽과 기존 UI에 맞는 표현을 적용했습니다. 장비 데이터, 기술 퀘스트, 사용 조건, 탐험 구역의 좌표 결정 및 충돌, 저장, 메인 진행, 멀티플레이와 미니게임은 변경하지 않았습니다.

새 게임용 PNG는 총 **49개**입니다.

| 종류 | 수 | 최종 크기 | 형식 |
|---|---:|---|---|
| 장비 아이콘 | 25 | 96×96 | 투명 배경 RGBA PNG |
| 생태기술 아이콘 | 8 | 96×96 | 투명 배경 RGBA PNG |
| 탐험 구역 닫힘/열림 이미지 | 16 | 288×288 | 투명 배경 RGBA PNG |

총 파일 용량은 **3,540,103바이트(약 3.38MiB)**입니다. 16개 구역 이미지가 3,123,496바이트, 33개 아이콘이 416,607바이트입니다. 미리보기 및 생성 원본은 게임용 신규 49개에 포함하지 않습니다. 원래 이미지를 영구 삭제하지 않았습니다.

## 본편 화풍 조사와 적용 기준

기존 주인공, 숲·도시 인간형 NPC, 세 정령, 숲 몬스터, 지역 바닥, 나무·바위·통나무·울타리·갈대·건물·태양광 패널, 최근 플로킹 NPC를 참고 자료로 비교했습니다. 가방·상점과 월드의 기존 화면도 변경 전 자료로 남겼습니다.

비교 자료: `ecotech-art-reference.png`, `ecotech-art-reference-hero-scenes.png`, `ecotech-art-reference.json`. 실제 화면 변경 전 자료: `ecotech-visual-before-bag.png`, `ecotech-visual-before-forest.png`.

이 자료들은 프로젝트 밖의 작업 산출물 폴더에 있습니다:

`C:/Users/guppy/.codex/visualizations/2026/09/23/01a0cdcd-d956-7802-8a19-58ad2a99a8f3/`

| 비교 요소 | 새 그래픽에 적용한 기준 |
|---|---|
| 윤곽과 작은 형태 | 기존 인간형 NPC·환경 오브젝트처럼 어두운 안정적인 윤곽을 사용하고, 작은 아이콘에서도 손잡이·망·필터·배관의 실루엣을 구분 |
| 명암과 재질 | 금속의 밝은 면, 천의 접힘, 망의 짜임, 목재와 돌의 면을 구분. 단색 기호나 사진풍을 피함 |
| 색감 | 본편의 녹색·갈색·크림색을 기준으로 장비의 주황색·청색·황색을 제한적으로 사용. 전설 장비에 과한 네온이나 SF 표현을 넣지 않음 |
| 크기와 비율 | 아이콘은 96px 정적 파일로 통일하고 UI에서 주로 64px, 작은 화면에서는 56px로 표시. 기존 슬롯 key와 명목 스프라이트 크기는 유지 |
| 원근 | 월드 시설은 위에서 내부와 바닥을 볼 수 있는 기존 RPG 시점에 맞춤. 바닥 경계는 나무·돌·갈대·시설 벽의 조합으로 표현 |
| 접지감 | 큰 식물·바위·장비·시설 아래에 짧고 옅은 그림자를 그림 자체에 포함. 지속 blur나 새 효과 루프 없이 처리 |
| UI 분위기 | 기존의 어두운 녹색 패널, 크림색 글자, 금색 강조를 유지하고 이름·효과·실제 쓰임을 분리해 읽도록 구성 |

내장 `image_gen` 도구로 계열별 소규모 시트와 구역별 닫힘/열림 그림을 제작한 뒤, 각 물건과 장소를 개별 PNG로 분리했습니다. 전설 장비는 형태와 투명 여백을 확인한 수정 원본을 사용했습니다. 준비 도구는 투명 영역 기준 자르기, 크기 조절, 압축만 수행하며 게임에서 로드되지 않습니다. 실제 맵의 기존 NPC·주인공·환경 오브젝트와 나란히 비교했고, 형태가 잘리거나 다른 물건 조각이 섞이는 오류는 발견하지 못했습니다. 제작 프롬프트와 원본 기록은 [이미지 제작 기록](EQUIPMENT_ECOTECH_ART_PROMPTS.md)에 있습니다.

## 장비 25종 교체 목록

모든 파일은 `assets/images/gear/` 아래에 있습니다. ID·이름·슬롯·능력치·가격·`eduDesc`·전설 효과는 기존 데이터와 동일합니다.

| ID | 기존 장비 이름 | 신규 파일 |
|---|---|---|
| w1 | 집게 | w1.png |
| w2 | 갈퀴 | w2.png |
| w3 | 뜰채 | w3.png |
| w4 | 삽 | w4.png |
| w5 | 수거망 | w5.png |
| w6 | 고압세척기 | w6.png |
| a1 | 작업복 | a1.png |
| a2 | 안전조끼 | a2.png |
| a3 | 방수복 | a3.png |
| a4 | 보호복 | a4.png |
| a5 | 화학물질용 보호복 | a5.png |
| h1 | 안전모 | h1.png |
| h2 | 보안경 | h2.png |
| h3 | 방진마스크 | h3.png |
| h4 | 방독마스크 | h4.png |
| s1 | 등산화 | s1.png |
| s2 | 장화 | s2.png |
| s3 | 안전화 | s3.png |
| s4 | 절연장화 | s4.png |
| L1 | 준설기 | L1.png |
| L2 | 유회수기 | L2.png |
| L3 | 폐기물 압축기 | L3.png |
| L4 | 전동식 호흡보호구 | L4.png |
| L5 | 오일펜스 | L5.png |
| L6 | 태양광 랜턴 | L6.png |

일반 장비는 일상 작업 도구의 기본 구조를 강조했습니다. 전설 장비는 준설기의 작업부, 유회수기의 호스·회수 장치, 압축기의 압축 구조, 호흡보호구의 전원부·호스, 오일펜스의 여러 부유 구간, 랜턴의 태양광 패널처럼 전문 장비의 구성을 추가했습니다. 금색 테두리만으로 차이를 만들지 않았습니다.

## 생태기술 8종 교체 목록

모든 파일은 `assets/images/ecotech/` 아래에 있습니다. 기술 ID·이름·NPC·교육 내용·퀘스트 및 사용 데이터는 그대로입니다.

| ID | 기술 이름 | 신규 파일 | 그림의 구분 요소 |
|---|---|---|---|
| soil | 토양 pH 측정기 | soil.png | 흙에 꽂는 프로브, 연결선, 표시부 |
| water | 수질 간이측정기 | water.png | 수질 측정부, 휴대 표시부, 샘플 용기 |
| sorbent | 유흡착재 | sorbent.png | 밝은 흡착 패드와 붐, 기름 흔적 |
| generator | 수동 발전기 | generator.png | 크랭크 손잡이와 발전 본체 |
| dust | 미세먼지 간이측정기 | dust.png | 공기 흡입부, 휴대 본체, 작은 화면 |
| solar | 태양광 충전기 | solar.png | 접이식 패널과 충전 연결부 |
| filter | 휴대용 정수기 | filter.png | 필터·펌프·호스와 소량 물 용기 |
| thermal | 열화상카메라 | thermal.png | 카메라 렌즈·손잡이·온도 분포 화면 |

이모지로 표현하던 주요 기술 아이콘을 새 이미지로 바꿨습니다. 가방의 미획득·조사 중·획득·장소 개방·조사 완료는 기존 저장 상태를 읽어 표시합니다. 새로운 획득 조건이나 공유 데이터는 없습니다.

## 탐험 구역 8곳의 전후

기존 월드 표현은 같은 사각형 SVG 바닥·경계에 지역별 소품을 추가하는 방식이어서 논리적 충돌 사각형이 그대로 테스트 공간처럼 드러났습니다. 새 이미지는 실제 충돌 사각형을 바꾸지 않고 식생·지형·시설의 배치로 경계를 감쌉니다.

| 구역 | 기존 표현의 문제 | 새 닫힘 상태 | 새 열림 상태 |
|---|---|---|---|
| 숲 · 숨은 식생 조사 구역 | 사각 바닥과 반복 테두리, 단순 식생 기호 | 나무·관목·뿌리·바위·통나무·갈라진 토양으로 둘러싸인 작은 숲 공간 | 훼손된 토양은 유지하고 입구 표시, 발자국과 작은 조사 표지로 진입 경로를 드러냄 |
| 강 · 수변 관찰 통로 | 직사각 물 띠와 단순 경계 | 갈대·물가 돌·수초·탁한 물과 목재 관찰 데크 | 물 상태는 그대로 두고 발판과 조사 동선 표지를 강조 |
| 바다 · 해안 복원 조사 구역 | 단일 어두운 SVG 다각형 기름막 | 해안 바위·모래·얕은 물·불규칙한 기름막과 광택 | 통로의 기름막이 줄고 흡착 붐·사용한 패드·회수 용기·잔류 흔적이 남음 |
| 도시 · 도시 환경 조사실 | 네모 틀에 작은 패널과 문만 배치 | 시설 벽·바닥 타일·배전함·케이블·측정 패널·꺼진 표시등과 닫힌 문 | 표시등과 화면에 전원이 들어오고 기존 조사실 출입문이 열림 |
| 대기 · 바람길 관찰 지점 | 짙은 선으로 그린 스모그와 사각 경계 | 낮은 돌·식생·관측장비·풍향 깃발·희미한 스모그 | 스모그는 유지하면서 바람길 방향 표지와 열린 진입 방향을 드러냄 |
| 기후 · 재생에너지 관측 지점 | 공통 시설 틀과 작은 사각 패널 | 눈·돌·식생 사이의 태양광 패널·전원함·센서·케이블과 꺼진 장치 | 전원함의 표시등·화면이 켜지고 관측 지점 진입 경로가 드러남 |
| 강 · 샘물 생태 조사 구역 | 물 띠와 단일 사각 샘플 표시 | 이끼 낀 돌·작은 샘·습지 식물·샘플 처리 장비 | 작은 용기의 처리된 물과 조사 준비 상태를 표시. 전체 샘이 마법처럼 정화되지는 않음 |
| 기후 · 숨은 단열 점검 구역 | 단순 사각 벽·패널과 공통 문 | 시설 외벽·배관·단열 패널·눈과 기존 점검문 | 작은 패널의 온도 차이와 점검부를 강조하고 기존 출입문을 열음 |

닫힘/열림 파일은 `assets/images/ecotech/areas/` 아래에 있습니다.

| ID | 닫힘 PNG | 열림 PNG |
|---|---|---|
| soil | soil-locked.png | soil-open.png |
| water | water-locked.png | water-open.png |
| sorbent | sorbent-locked.png | sorbent-open.png |
| generator | generator-locked.png | generator-open.png |
| dust | dust-locked.png | dust-open.png |
| solar | solar-locked.png | solar-open.png |
| filter | filter-locked.png | filter-open.png |
| thermal | thermal-locked.png | thermal-open.png |

두 상태의 이미지는 공통 자르기 범위를 사용해 입구가 열릴 때 장소나 이미지 외곽이 이동하지 않도록 했습니다. 실제 구역 크기는 보통240×220, 도시·대기는200×190이며, 이미지를 그 기존 표시 범위에 맞춥니다.

## SVG와 그림자 처리

`js/ecotech-exploration.js`의 개발용 `ecoExplorationSVG()` 표현을 정적 PNG를 선택하는 `ecoExplorationArt()`로 교체했습니다. 제목·입구 상태·기존 근접 조작을 위한 HTML은 유지합니다. 닫힌 장소에서는 개방 상태 이미지도 숨긴 채 준비하고, 현장 사용 후 같은 위치에서 표시 상태를 바꿉니다.

이번 구역 표현에는 공통 사각 SVG 벽이나 장벽 면을 남기지 않았습니다. 생태기술 외의 본편 SVG·스프라이트·맵 구조는 대상 밖입니다. 준비용 미리보기의 SVG 글자 라벨은 게임에 로드하지 않습니다.

그림자는 PNG 안의 짧은 접지 그림자와 조사 표지의 얇은 타원 CSS 그림자로 구성합니다. 나무·바위·회수통·전원함·관측장비가 바닥에 닿는 부분을 어둡게 하되 크기에 맞춰 옅게 표현합니다. 지속적인 blur·filter·파티클·새 animation loop는 없습니다.

## UI 정리

`js/equipment-ui.js`는 실제 새 장비 이미지를 사용하고 이름, 게임 효과, 전설 특수효과, 교육 설명을 나누어 표시합니다. 가방과 결과 카드에서는 제목 영역에 아이콘을 모아 같은 카드 안에서 큰 아이콘을 중복 표시하지 않습니다. 장착 버튼은 기존 `equip()`을 호출합니다.

`js/ecotech.js`는 기존 획득 상태를 참조하면서 NPC 기술 버튼, 퀘스트 제목, 가방, 현장 조사 화면, 맵의 조사 표지를 새 도구 이미지로 통일했습니다. 월드 표지는 작은 목재 간판·기둥·접지 그림자로 표현합니다. 퀘스트 조사 순서, 보고, 기술 획득, 장소 개방 조작은 바꾸지 않았습니다.

화면 폭600px 이하에서는 아이콘·여백·글자를 줄이고 긴 설명을 줄바꿈합니다. 실제390×844 화면 크기 검증 결과는 아래 표에 기록합니다. Galaxy Tab S5e 실기기 검증과는 구분합니다.

## 유지한 기능과 데이터

변경 전에 `tests/fixtures/ecotech-visual-baseline.json`을 채집했습니다. Git HEAD에는 이전 작업도 포함되므로 이번 시작 시점의 작업 폴더를 기준으로 비교합니다.

- `GEAR_ALL`·`LEGEND_GEAR`의 모든 속성을 일치 검사했습니다. 25개 ID·이름·능력치·기존 가격·shopPrice·eduDesc·ico key·전설 slot/eff/p/desc가 유지됩니다.
- `ECO_TECH` 8개와 `ECO_EXPLORATION` 8개의 모든 데이터를 일치 검사했습니다. NPC 연결, 조사 내용, 획득 조건, 사용 장소와 교육 설명이 유지됩니다.
- 퀘스트, 획득, 현장 사용, 근접 판정, 좌표 결정, 충돌, 저장 정규화에 관련된26개 함수의 소스 SHA256을 일치 검사했습니다.
- 14개 파일 SHA256을 일치 검사해 게임 본체·장비 데이터·관련 기존 시스템이 이번에 바뀌지 않았음을 확인했습니다.

14개 파일: `js/game.js`, `js/gear-data.js`, `js/minigame.js`, `js/plogging.js`, `js/npc-data.js`, `js/map-utils.js`, `js/theme-data.js`, `js/learning-data.js`, `js/supabase.js`, `js/presence.js`, `js/movement.js`, `js/remote-players.js`, `js/player-list.js`, `js/battle-view.js`.

기존 `ecoTechUnlocked`·`ecoTechQuests`·`ecoTechSites`·`ecoTechFindings`를 그대로 사용합니다. 새 세이브 항목은 없습니다. 장소 개방은 기존 `ecoTechSites` 로직으로 판정하며 이미지가 개방 여부를 결정하지 않습니다.

## 자동 회귀 검증 결과

6종 모두 PASS입니다. 최종 이미지 경로 수정 후 장비·탐험·시각 테스트를 다시 실행했습니다. 나머지3종은 관련 제품 파일의 해시가 변하지 않아 앞서 실행한 결과가 유효합니다.

| 테스트 | 결과 | 주요 확인 내용 |
|---|---|---|
| `tests/equipment-ecotech.test.cjs` | PASS | 장비25개, 구매가격19개·중복 보상, 전설 포함 구 세이브, 기존8NPC 퀘스트, 조기 해금 방지, 중복 조작, 140회 저장 |
| `tests/ecotech-exploration.test.cjs` | PASS | 실제 월드 생성으로8구역 구성. 닫힘·기술 획득만으로 진입 불가, 현장 사용, 기존tick으로 입구 이동, 내부 조사, 외벽 너머 조사 방지, 퇴장·저장, 정화·최종NPC 등장 시 위치 유지 |
| `tests/movement.test.cjs` | PASS | 순서·소속·테마 검증, 10명의 독립된 표시 상태, 보간/스냅, 정지 시 전송 억제, 8Hz, 개인 화면, 장애 분리와200ms 저부하 전환 |
| `tests/presence35.test.cjs` | PASS | Presence35명·remote34명, 변화 없는track0, 테마 전환20회 후channel1/timer1, 이전callback 무시 |
| `tests/plogging.test.cjs` | PASS | 목표28·시작32·재도전+1·6NPC, 성인·어린이 동작 상태, 안전한 쓰레기 수거, 75초 순회, 기존 보상/시간/실패 조건 |
| `tests/ecotech-visual.test.cjs` | PASS | 전체 데이터·14파일·26함수 불변, 고유 투명 아이콘33개·서로 다른 구역 이미지16개, PNG decode/CRC/alpha/실제RGBA 중복 검사, 실제 표시 경로, GitHub Pages 파일명 대소문자 |

8구역의 확정 좌표는 이전 구현과 같습니다.

| ID | x | y | 너비 | 높이 |
|---|---:|---:|---:|---:|
| soil | 2350 | 280 | 240 | 220 |
| water | 630 | 600 | 240 | 220 |
| sorbent | 2390 | 1440 | 240 | 220 |
| generator | 2350 | 880 | 200 | 190 |
| dust | 2270 | 160 | 200 | 190 |
| solar | 2390 | 1400 | 240 | 220 |
| filter | 110 | 1080 | 240 | 220 |
| thermal | 550 | 720 | 240 | 220 |

자동 테스트에서 새로운 JavaScript 예외는 없습니다. Realtime 중단을 의도한 테스트에서는 기존 장애 안내를 출력합니다. Presence 검사의 예상된 끊김 안내는2건이며 새 제품 오류가 아닙니다. `git diff --check`는 PASS입니다. Git LF/CRLF 변환 안내는 내용 검사 오류가 아닙니다.

## 발견한 문제와 수정

새 PNG가 있어도 나중에 로드되는 기존 `visuals.js`가 `SPRITES.gr_*`를 다시 지정해 구 판타지 이미지로 되돌리는 문제를 시각 회귀 테스트에서 검출했습니다.

`equipment-ui.js`의 초기 처리에서25개 `gr_*` 표시 경로만 새 PNG로 다시 설정했습니다. 기존 `ico` key·장비 객체·가격·획득·장착·저장은 바꾸지 않습니다. 테스트는 실제 `sprites.js → visuals.js → equipment-ui.js` 순서로 실행해25개 모두 새 PNG를 참조함을 확인합니다.

실제 화면 검증 중 제목과 상태 표시의 `position:absolute` 규칙이 이전 SVG 스타일 제거와 함께 빠진 문제도 발견했습니다. 이미지가 제목 높이만큼 밀리고 상태 표시가 가운데에 겹쳤습니다. `css/ecotech-world-art.css`의 두 선택자에 해당 위치 규칙만 복구해 해결했습니다. 충돌이나 좌표 데이터는 바꾸지 않았습니다.

현장 사용 후 안내의 기존 `안에 있는 🔎 표지`를 새 도구 표지와 일치하는 `안쪽 조사 표지`로 변경했습니다. 표시 문구만 수정했습니다.

월드 표지판이 캐릭터를 가리던 부분은 CSS로만 줄였습니다. 보드62×47을40×33으로, 보드 안 도구44px을32px로 바꾸고 기둥·그림자도 줄였습니다. 이름띠는 가까이 있을 때만 절대 위치로 표시해 기존 조사 위치를 유지하면서 캐릭터를 덜 가리도록 했습니다.

## 성능과 실기기 검증의 한계

- 아이콘96×96, 구역288×288의 정적 PNG입니다. 거대한 단일 시트나 Base64를 게임에 넣지 않았습니다.
- 기존 HTML 표시 시점에 이미지를 적용하며 매 프레임 DOM을 다시 만드는 새 처리는 없습니다.
- 테마마다 구역은 최대2개입니다. 닫힌2구역과 열림 이미지 준비를 합쳐 최대4장이고, 단순RGBA 확장량은 약1.27MiB입니다. 브라우저 전체 메모리 실측값은 아닙니다.
- 장소 개방 시에만0.22초 불투명도 변화를 적용하며 `prefers-reduced-motion`에서 비활성화합니다.
- 캐시된 기존 좌표·충돌 사각형 구조가 유지됩니다. 새 루프·네트워크 전송·타이머를 추가하지 않았습니다.
- 이미지 준비용 Node.js/Sharp는 개발 보조 도구입니다. GitHub Pages에서 게임을 실행할 때 빌드 의존성으로 사용하지 않습니다.

FPS·frame time·실기기 메모리·Galaxy Tab S5e·학교 Wi-Fi 실측은 수행하지 않았습니다. 정적 이미지와 작은 CSS에 한정한 구조상 평가와 실기기 동작 보장을 구분합니다.

## 실제 AFTER 화면·모바일 검증

Codex In-app Browser의 로컬 서버 `tests/serve-ecotech.cjs`로 실제 게임을 실행했습니다. 기존 tick과 현장 사용·조사 버튼을 통해 검증했습니다. 테스트용 번호 EC9901/EC9902를 사용해 일반 플레이어의 저장을 덮어쓰지 않았습니다. 퀘스트 검증 도구는 기존 NPC 문답·조사·보고 함수를 실행하고, 입구 검증 도구는 기존 RAF/tick에 방향 입력을 넣습니다. 열린 구역 안으로 직접 좌표를 옮겨 진입 판정을 대체하지 않았습니다. 이 도구와 수집용 타이머는 로컬 테스트 페이지에만 주입되며 제품 HTML에는 없습니다.

아래 결과는 자동 회귀 테스트와 별도로 확인했습니다. 최종 표지 축소 후 8곳의 닫힘/열림 화면과 실제 진입을 다시 검증했습니다.

| 실제 화면 검증 | 상태 | 최종 결과·캡처 |
|---|---|---|
| 장비25개 이름·이미지 로딩 | PASS | 데스크톱25개 아이콘64px 표시와 새PNG 경로 확인. `ecotech-visual-after-bag.png`, `ecotech-icons-33-preview.png` |
| 생태기술8개 이름·이미지 로딩 | PASS | 8개 실제IMG가 모두 로딩되고 기술 이름 및 획득·개방·조사 상태와 일치. `ecotech-visual-after-mobile-tech.png` |
| 구역8곳 닫힘·열림 상태 | PASS | 각 상태를 실제 맵에서 확인하고 현장 사용으로 개방. 최종16장 `ecotech-visual-after-{ID}-{locked,open}.png` |
| 구역8곳 실제 입구 진입·조사 | PASS | 최종 닫힘 상태에서 기존tick80프레임 동안 진입 차단, 열림 후46~50프레임으로 내부 진입. 8곳 모두 실제 기술 사용과 내부 조사 완료 |
| 상점·장착 상태·저장/새로고침 | PASS | 기본 장비19개 상점 배경 경로가 새gear PNG. 장착L1/L4/h1/L6 및8기술의 해금·개방·조사 기록이 저장·새로고침 후 유지 |
| 좁은 화면 줄바꿈·내부 스크롤 | PASS/기존 한계 | 390×844에서 아이콘56px, 모달310px, 내부308px와scrollWidth308px로 가로 넘침 없음. 기존 멀티플레이 오프라인 표시가 모달 위에 겹치는 현상은 대상 밖으로 남김 |
| 기존 지도·전투·미니게임 진입 | PASS | 지도6지역 정상 표시, 기존 보스 전투 및 플로킹 시작 화면 정상 진입. 전투/미니게임 로직은 변경하지 않음 |
| 예상하지 않은 브라우저JavaScript 오류 | PASS | error/unhandledrejection 수집0, 예상 밖 콘솔 error/warn0. 아래의 의도된CDN 실패 로그6건과 구분 |
| Galaxy Tab S5e 실기기 | 미실시 | 데스크톱이나 화면 크기 모의 검증을 실기기 테스트로 표기하지 않음 |

로컬 검증 서버는 Supabase CDN을 의도적으로 빼고 실행합니다. 브라우저 로드/새로고침6회에 따른 기존 `[Supabase] connection test failed: Supabase CDN unavailable...` 콘솔 error가6건 있습니다. 새 이미지·UI에서 발생한 예외는 아니며, 이 상태에서도 이동·지도·가방·퀘스트·저장·전투·미니게임 진입이 계속 동작했습니다. 실서버 Realtime 재검증은 이번 시각 개편 범위에 포함하지 않았습니다.

최종 실제 입구 이동 결과:

| 구역 | 닫힘 입력 프레임 | 닫힘 진입 | 열림 입력 프레임 | 열림 진입·조사 |
|---|---:|---|---:|---|
| soil | 80 | 차단 | 50 | PASS |
| water | 80 | 차단 | 50 | PASS |
| sorbent | 80 | 차단 | 50 | PASS |
| generator | 80 | 차단 | 46 | PASS |
| dust | 80 | 차단 | 46 | PASS |
| solar | 80 | 차단 | 50 | PASS |
| filter | 80 | 차단 | 50 | PASS |
| thermal | 80 | 차단 | 50 | PASS |

이 수치는 실제 입력을 준 프레임 수이며 FPS 측정값이 아닙니다. 자동 회귀 테스트에서는 실제 진입 후 퇴장, 외벽 너머 조사 방지, 재진입, 정화 전후 위치 유지도 검사했습니다.

캡처와 수집 결과는 위의 프로젝트 밖 산출물 폴더에 보존했습니다.

- 변경 전: `ecotech-visual-before-bag.png`, `ecotech-visual-before-forest.png`.
- 가방 전후: `ecotech-visual-before-after-bag.png`.
- 숲 전후: `ecotech-visual-before-after-forest.png`.
- 8곳 닫힘/열림 비교: `ecotech-visual-world-comparison.png`.
- 원래 게임 맥락을 포함한16장: `ecotech-visual-after-{soil,water,sorbent,generator,dust,solar,filter,thermal}-{locked,open}.png`.
- 상점: `ecotech-visual-after-shop.png`.
- 390×844: `ecotech-visual-after-mobile-shop.png`, `ecotech-visual-after-mobile-bag.png`, `ecotech-visual-after-mobile-tech.png`.
- 기존 기능: `ecotech-visual-regression-battle.png`, `ecotech-visual-regression-plogging.png`.
- 원본 수집: `ecotech-visual-browser-results.json`, `ecotech-visual-browser-console.json`.

![숲 개선 전후](C:/Users/guppy/.codex/visualizations/2026/09/23/01a0cdcd-d956-7802-8a19-58ad2a99a8f3/ecotech-visual-before-after-forest.png)

![가방 개선 전후](C:/Users/guppy/.codex/visualizations/2026/09/23/01a0cdcd-d956-7802-8a19-58ad2a99a8f3/ecotech-visual-before-after-bag.png)

## 이번 변경 파일과 이전 작업 구분

이번 제품 변경:

- `assets/images/gear/` 새PNG25개.
- `assets/images/ecotech/` 새 아이콘PNG8개.
- `assets/images/ecotech/areas/` 새PNG16개.
- `js/sprites.js`: 장비 기존 `gr_*` key 표시 경로를 새PNG로 교체.
- `js/equipment-ui.js`: 새 장비 이미지의 최종 표시 경로와 카드 표현 정리.
- `js/ecotech.js`: 도구 이미지와 기존 상태에 따른HTML표현 정리.
- `js/ecotech-exploration.js`: 구역SVG표현을PNG로 교체. 좌표·충돌 함수 유지.
- `css/ecotech.css`: 장비·기술 카드와 조사 표지 스타일.
- `css/ecotech-world-art.css`: 신규. 구역 이미지·제목·상태와 짧은 표시 효과.
- `index.html`: 구역 표시CSS로드1줄 추가.

이번 검증·준비 파일:

- `tests/prepare-ecotech-icons.cjs`, `tests/prepare-ecotech-areas.cjs`: 이미지 준비용이며 게임은 로드하지 않음.
- `tests/ecotech-visual.test.cjs`, `tests/fixtures/ecotech-visual-baseline.json`: 시각 리소스와 기능 불변 검사.
- `tests/serve-ecotech.cjs`: 로컬 검증용25장비 가방 버튼 추가. 제품 게임에는 로드하지 않음.
- `docs/EQUIPMENT_ECOTECH_VISUAL_REWORK.md`: 본 보고서.
- `docs/EQUIPMENT_ECOTECH_ART_PROMPTS.md`: 이미지 제작 기록.

이번 시작 시점에 주인공 보행·플로킹·장비/기술 구현·탐험 개방의 이전 작업이 미커밋 상태로 존재했습니다. Git 변경 목록에 나오는 `js/game.js`·`js/gear-data.js`·`js/plogging.js`·`js/visuals.js` 등을 이번 새 기능 변경으로 취급하지 않습니다. 이번 기준 해시로 앞의14파일 불변을 검사했으며 이전 변경을 되돌리지 않았습니다. 커밋·push·배포는 이번 작업에 포함하지 않았습니다.
