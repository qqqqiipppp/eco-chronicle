# 진행·미니게임·경험치 수정 검증

검증일: 2026-10-01. 학생 저장과 분리된 메모리 저장 및 localhost 테스트 저장에서 확인했습니다.

## 지역 해금과 저장

- 기존 조건: `themeOpen`과 `enterTheme`가 `S.lv >= levelGate`만 검사했습니다. 지도와 클리어 안내도 같은 레벨 조건을 사용했습니다.
- 수정 조건: `S.cleared`에 앞 지역들이 순서대로 완료되어 있어야 다음 지역에 접근할 수 있습니다. 순서는 숲 → 강 → 바다 → 도시 → 대기 → 기후입니다. 열린 이전 지역은 재방문할 수 있습니다.
- `themeOpen`, `enterTheme`, 지도, 다음 지역 안내에서 레벨 기반 해금을 제거했습니다. `levelGate` 데이터는 기존 데이터 호환을 위해 남겼지만 이동 조건에서 사용하지 않습니다.
- 완료 판정은 기존 `S.cleared`를 사용합니다. 새 완료 기록은 정화 100% 및 현재 지역 접근 조건을 만족할 때만 생성합니다. 수료증의 돌아가기 경로로 미완료 지역이 완료 처리되는 우회도 막았습니다.
- 새 저장 필드는 추가하지 않았습니다. 기존 `cleared`, `progress`, `lv`, `exp`는 유지합니다. 과거 레벨 해금으로 잠긴 지역에 서 있는 저장은 그 지역 진행을 `progress`에 보관하고 마지막으로 열린 지역에서 이어갑니다.
- 관리자 이동은 기존 런타임 `Adm.on`에서만 모든 지역을 허용합니다.
- 브라우저/자동검사: Lv10·완료 없음, 완료 지역 1~5개, Lv1·완료 기록 있음, 이전 지역 재방문, 관리자 이동, 수료증 우회 방지, 저장/불러오기를 확인했습니다.

## 확인한 기존 미니게임

| ID | 이름 | 진입 함수 | 테마 제한 | 일반 전투 / 탑 | 결과·보상 처리 |
|---|---|---|---|---|---|
| `pang` | 플로킹 | `mountPang` | 없음: 테마별 배경 및 소품 지원 | 모두 사용 | `pangWin/Lose` → 관문에서는 공통 결과 처리, 일반 몬스터 슬롯의 기존 보상 유지 |
| `spheres` | 정화 구슬 | `mountSphere` | 없음: 6개 테마 스킨 | 모두 사용 | `spCheckWin/spMove/시간 종료` → `miniWin/Lose` |
| `timing` | 정령 바운스 | `mountTiming` → `arcMount('timing')` | 없음: 6개 테마 지원 | 모두 사용 | `arcFinish` → `miniWin/Lose`, 기존 점수 기록 유지 |
| `match` | 정화 퍼즐 | `mountMatch` | 없음: 공용 퍼즐 | 모두 사용 | `mtWin/Lose` → `miniWin/Lose` |
| `runner` | 동물 돌봄 대작전 | `mountRunner` → `animalCareMount` | 없음: 공용 4단계 | 모두 사용 | `careFinish` → `miniWin/Lose`, 기존 씨앗 보상 유지 |

수학은 기존 채집 활동의 문제 풀이이므로 전투 관문 후보에 넣지 않았습니다. 교체 이전 달리기 구현은 현재 활성 게임으로 집계하지 않았습니다.

숲에서 두 종류만 반복되던 원인은 `makeInterlude`가 첫 관문을 `runner`, 두 번째 관문을 `timing`으로 고정하고, `launchInterlude`도 두 종류만 실행했기 때문입니다. 탑도 같은 함수를 사용했습니다.

새 선택 방식은 일반 전투·탑이 공유하는 세션 내 shuffle bag입니다. 5종을 섞어 한 번씩 사용한 뒤 다시 섞고, 사이클 경계에서도 직전 종류를 피합니다. 재도전은 이미 선택한 관문을 유지합니다. 기존 플로킹 몬스터 슬롯도 같은 순환을 사용합니다. 목표량·시간·난이도·성공/실패 조건·몬스터 수치·게임별 보상 수치는 수정하지 않았습니다.

## 실제 브라우저 선택 기록

아래는 실제 `advanceEncounter`와 `towerGo` 선택 경로를 테스트 상태에서 반복 실행한 기록입니다.

일반 전투 20회:

1. match → runner → timing → pang → spheres
2. runner → pang → timing → match → spheres
3. pang → timing → match → runner → spheres
4. timing → runner → spheres → match → pang

몬스터의 탑 20회:

1. runner → timing → pang → spheres → match
2. timing → spheres → runner → pang → match
3. spheres → match → timing → runner → pang
4. match → timing → pang → runner → spheres

확인한 탑 관문 층: 2, 5, 9, 12, 16, 19, 23, 26, 30, 33, 37, 40, 44, 47, 51, 54, 58, 61, 65, 68.

두 경로 모두 각 종류 4회, 사이클 내 중복 0회, 연속 중복 0회였습니다. 두 경로를 이어 선택한 경계에서도 중복이 없었습니다.

실제 브라우저에서 5종의 진입 함수와 성공·실패 결과 함수를 양쪽 경로에서 실행한 20개 경우를 검증했습니다. 결과 검증은 테스트 도구로 완료/실패 조건을 설정해 실행했습니다. 성공 후 다음 전투 또는 다음 층 연결, 실패 후 같은 관문 재도전, 몬스터 EXP·골드·정화 보상 중복 지급 없음, 돌봄의 기존 씨앗 보상을 확인했습니다.

## 경험치

| 레벨 | 기존 누적 EXP | 수정 누적 EXP |
|---|---:|---:|
| 1 | 0 | 0 |
| 2 | 40 | 48 |
| 3 | 100 | 120 |
| 4 | 180 | 216 |
| 5 | 280 | 336 |
| 6 | 400 | 480 |
| 7 | 560 | 672 |
| 8 | 760 | 912 |
| 9 | 1000 | 1200 |
| 10 | 1300 | 1560 |

Lv2~10은 모두 정확히 1.2배입니다. 각 기준의 바로 전/동일/바로 후 27개 경계값을 검사했습니다. 기존 Lv6 / EXP430은 그대로 유지되고 Lv7 기준 672까지 242 EXP가 남습니다. 기존 Lv10 / EXP1300도 Lv10을 유지합니다. 레벨업 함수는 기존처럼 올라가는 방향으로만 작동합니다.

HUD·상태창·가방은 LEVELS를 사용합니다. 상태창의 현재 레벨 EXP 구간과 남은 EXP 표시를 HUD·가방과 일치시켰습니다. MAX_LV, 스킬 습득 레벨, HP·공격·방어·SP, 모든 EXP 보상은 유지했습니다.

## 회귀 검증과 파일

통과한 검사:

- `tests/progression-rotation.test.cjs`: 순차 이동/기존 저장/EXP 경계값, 일반·탑 각각 20회 선택, 5종 성공·실패·재도전·보상.
- `tests/plogging.test.cjs`: 목표·시간·하트·동작·성공/실패·보상.
- `tests/equipment-ecotech.test.cjs`: 장비 25종 수치/효과, NPC 퀘스트 8종, 보상·저장·재방문.
- `tests/ecotech-exploration.test.cjs`: 탐험 공간 8곳, 진입·차단·발견·진행 저장.
- `tests/movement.test.cjs`, `tests/presence35.test.cjs`: 이동 및 35명 접속 상태 회귀.
- 실제 브라우저: 진행/저장/EXP/5종 결과 연결 검사 통과. Supabase 연결 성공 및 숲 채널 접속 확인. 최종 탭의 JavaScript/콘솔 오류 기록 0건.
- 변경 JavaScript 문법 및 diff 공백 검사 통과.

별도 `ecotech-visual.test.cjs`는 시각 작업 중 게임 소스의 바이트 단위 변경을 금지하는 이전 작업용 검사입니다. 이번 진행 로직 변경의 통과 기준으로 적용하지 않았습니다. 실행 시 첫 장비 파일 해시 검사에서 Windows 줄바꿈 차이로 중단되었으며, 줄바꿈을 제외한 장비 파일 내용은 기존 HEAD와 동일함을 확인했습니다. 장비·생태기술의 실제 데이터/로직 회귀 검사는 위와 같이 통과했습니다.

제품 수정 파일: `js/game.js`, `js/encounters.js`, `js/plogging.js`, `css/style.css`.

검증 파일: `tests/progression-rotation.test.cjs`, `tests/serve-progression.cjs`, `tests/equipment-ecotech.test.cjs`(지역 왕복 검사 준비 상태에 완료 기록 추가), 이 보고서.
