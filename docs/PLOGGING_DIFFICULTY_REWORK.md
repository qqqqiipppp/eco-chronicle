# 플로킹을 해보자: 난이도 및 장애물 개선

## 작업 범위

`플로킹을 해보자` 내부에 어린이 방해 NPC와 환경 장애물 충돌을 추가하고, 세 종류의 NPC를 각각 두 명씩 배치했다. 목표는 기존 체감 약 2/10에서 경로 선택과 회피가 필요한 약 5/10 수준으로 조정하는 것이다. 실제 학생의 체감 난이도는 수업 후 관찰이 필요하다.

이번 작업의 제품 변경은 `js/plogging.js`와 신규 `assets/images/characters/plogging_child_sheet.png`이다. 검사 당시 작업 폴더에 존재한 `hero-walk` 에셋 및 `js/game.js`·`js/visuals.js`의 보행 수정은 이전 작업의 변경이다. 이번 난이도 조정에서 멀티플레이, Supabase, Presence, Broadcast, 저장 키·구조, 다른 미니게임, 전투 로직을 변경하지 않았다.

유지한 규칙은 수거 목표 20개, 제한 시간 75초, 기본 하트 3개, 재도전 보정 하트 최대 2개 추가, 플레이어 속도 285px/초다. 기존 성공·실패와 보상 흐름을 유지했다. 하트 감소는 NPC 본체 충돌에서만 발생하며, NPC가 버린 꽁초·컵·과자 비닐은 일반 쓰레기로 안전하게 수거된다.

## 어린이 신규 에셋과 모션

| 항목 | 내용 |
| --- | --- |
| 파일 | `assets/images/characters/plogging_child_sheet.png` |
| 형식 | PNG, RGBA 투명 배경 |
| 크기 / 용량 | 1122×1402px / 1,170,960 bytes (약 1.12MiB) |
| 구성 | 4열×5행, 총 20프레임 |
| 열 순서 | 남쪽 정면 / 북쪽 뒷면 / 서쪽 / 동쪽 |
| 행 순서 | 대기 / 걷기 / 비닐 까기 / 과자 먹기 / 빈 비닐 버리기 |
| 외형 | 짧은 갈색 머리, 주황 상의·크림색 안쪽 옷, 남색 반바지, 양말·갈색 운동화 |
| 표시 크기 | 어린이 72×88px, 어른 86×104px |

기존 아저씨·아가씨 시트와 본편 인간형 NPC를 먼저 확인했다. 큰 머리와 작은 몸, 진한 윤곽선, 부드러운 음영을 유지한 새로운 인간형 어린이이며 점이나 덩어리 형태를 사용하지 않았다. 기존 어른 시트는 그대로 사용한다. 신규 시트는 built-in `image_gen`으로 생성했고 투명 알파를 보존한 원본 PNG를 프로젝트에 복사했다. 별도 리사이즈나 이미지 편집은 하지 않았다. 셀은 이미지 폭÷4, 높이÷5로 읽는다.

걷기는 대기 행과 걷기 행을 실제 이동거리 30px 단위로 번갈아 사용한다. NPC마다 독립적인 `stride`가 있고, 정지 시에는 대기 행으로 돌아간다. 외형 방향은 기존 `south` / `north` / `west` / `east` 값을 사용한다.

어린이 행동은 아래 순서이며, 행동 중 이동은 멈춘다.

| 행동 경과 시간 | 표시 / 처리 |
| --- | --- |
| 0–500ms | 양손으로 과자봉지 뜯기 |
| 500–1100ms | 과자를 입으로 가져가 먹기 |
| 1100–1650ms | 빈 봉지를 아래로 버리기 |
| 1350ms | `wrapper` 쓰레기 한 개 생성 |
| 1650ms 이후 | 이동 재개, 다음 행동 예약 |

아저씨·아가씨의 버리기 행동은 기존 760ms를 유지하며, 330ms 시점에 꽁초 또는 컵을 생성한다. 동일 행동이 두 번 쓰레기를 생성하지 않도록 `drop.spawned`로 보호한다.

## NPC 배치와 이동

총 아저씨 2명, 아가씨 2명, 어린이 2명으로 6명이다. 초기 위치는 필드의 서로 다른 구역에 분산하며, 지정 위치가 막혔으면 주변의 도달 가능한 위치로 보정한다.

| NPC | 기본 위치 (x, y) | 기본 속도 | 첫 행동 예약 | 다음 행동까지 대기 |
| --- | --- | --- | --- | --- |
| 아저씨 1 | 510, 470 | 174px/초 | 2.2초 | 5.6초 |
| 아가씨 1 | 730, 660 | 180px/초 | 3.6초 | 6.2초 |
| 어린이 1 | 980, 470 | 168px/초 | 4.2초 | 7.8초 |
| 아저씨 2 | 1270, 730 | 188px/초 | 4.8초 | 5.6초 |
| 아가씨 2 | 1470, 370 | 182px/초 | 5.4초 | 6.2초 |
| 어린이 2 | 320, 240 | 176px/초 | 3.1초 | 7.8초 |

다음 행동의 대기시간은 버리기 행동이 끝난 시점부터 계산한다. 따라서 실제 쓰레기 생성 간격에는 행동 시간이 포함된다. 40초 이후에는 대기시간을 0.82배, 이동 속도를 1.08배로 조정한다. 가장 빠른 NPC도 약 203px/초로 플레이어보다 느리다.

NPC는 1.4–3.1초 간격으로 현재 진행 방향을 조금 바꾸며 순찰한다. 플레이어를 추적하지 않는다. 필드 경계, 환경 장애물, 다른 NPC와의 겹침 때문에 이동이 막히면 해당 방향 성분을 반전한다. NPC끼리는 발 위치를 기준으로 가로 반경 38px·세로 반경 27px의 타원 간격을 유지하여 완전히 겹치지 않게 한다.

## 환경 충돌과 이동 처리

필드 장식 41개 중 고형 장애물 35개를 시작 시 한 번 계산해 `Pg.obstacles`에 보관한다. 매 프레임 DOM을 조회하거나 이미지 전체 사각형을 검사하지 않는다.

| 오브젝트 | 충돌 영역 |
| --- | --- |
| `pr_pine` 침엽수 | 폭의 22%, 밑동에서 위로 18% |
| `pr_round` 둥근 나무 | 폭의 22%, 밑동에서 위로 16% |
| `pr_rock` 큰 돌 | 폭의 78%, 아래쪽 34% |
| `pr_bush` 큰 덤불 | 폭의 64%, 아래쪽 24% |
| `pr_log` 쓰러진 통나무 | 폭의 80%, 아래쪽 22% |
| `pr_fence` 울타리 | 폭의 94%, 아래쪽 20% |
| `pr_flower`, `pr_shroom`, `pr_plant` | 작은 장식으로 통과 가능 |

현재 필드에는 벤치·표지판 에셋을 새로 추가하지 않았다. 실제 배치된 나무·돌·통나무·울타리·큰 덤불에 충돌을 적용한다. 나무는 잎 전체를 막지 않아 수관 아래 공간을 지날 수 있다.

플레이어와 NPC의 환경 충돌은 발 위치 기준 가로 ±10px, 위로 8px·아래로 5px인 하단 몸통 영역을 사용한다. 이동은 최대 6px 단위로 나누고 x축과 y축을 각각 검사한다. 한 축이 막히더라도 다른 축은 이동할 수 있어 장애물 가장자리에서 자연스럽게 빠져나갈 수 있다. 필드 경계는 각 방향 24px 안쪽으로 제한한다. 피격 밀림도 같은 충돌 이동 함수를 사용하여 장애물 안으로 밀려 들어가지 않는다.

NPC 본체와 플레이어의 접촉은 중심 간 가로 21px·세로 15px 타원으로 검사한다. 충돌 시 하트 한 개 감소, 900ms 무적, 짧은 깜빡임, 최대 약 27px 밀림, 안내 문구와 하트 UI 갱신이 발생한다. 무적 중 같은 NPC나 다른 NPC와 겹쳐도 추가 감소하지 않는다.

## 쓰레기 생성 안전성

처음 생성하는 쓰레기 42개 중 일부는 고형 장애물 옆을 우선 후보로 사용하여 직선 이동보다 경로 선택이 필요하게 한다. 생성 위치는 장애물 내부 여부, 시작점에서 연결된 지면, 플레이어·다른 쓰레기·NPC와의 초기 간격을 확인한다.

시작할 때 24px 격자와 짧은 구간 충돌 검사로 도달 가능한 영역을 한 번 계산한다. 이후 생성 후보는 이 캐시와 연결되는지 확인한다. 후보가 막혔으면 18px 간격으로 주변 안전 지점을 찾고, 초기 산포에서는 후보 탐색 실패 시 도달 가능 격자에서 다시 찾는다. 버린 쓰레기도 같은 검사를 거치며 안전한 지점이 없으면 생성하지 않는다. 쓰레기 총량 상한은 기존 75개를 유지한다.

과자 비닐은 기존 `wrapper` 종류와 수거 렌더링을 재사용한다. 쓰레기 자체는 피해 판정에 참여하지 않고, 플레이어와 29px 이내가 되면 수거 개수만 증가한다.

## 자동 검사 결과

자동 검사는 실제 제품의 `pangUpdate`, 생성·충돌·성공·실패 함수를 사용한다.

- 20개 난수 seed에서 초기 쓰레기 42개가 모두 생성되고, 장애물 내부가 아닌 도달 가능 지면에 배치됨을 확인했다.
- 아저씨·아가씨·어린이가 각각 두 명씩 생성됨을 확인했다.
- 어린이의 비닐 까기 → 먹기 → 버리기 순서와 1350ms 생성, 이동 정지·재개를 확인했다.
- NPC 본체 피해, 900ms 무적, 쓰레기의 안전한 수거, 장애물 축별 이동, 관통 방지, 피격 밀림을 검사했다.
- 제품 프레임 제한값인 34ms 단위로 75초 순찰을 모의했다. 6명 각각 총 이동거리 약 10,570–12,639px, 쓰레기 생성 64회였다. NPC 간 최소 정규화 타원 거리 제곱은 1.015로 겹침 금지 경계 1보다 컸다.
- 수거 20개 성공, 시간 초과 실패, 하트 소진 실패, 기존 보상 흐름을 검사했다.
- 별도의 독립 검사로 60개 seed × 75초 × 30Hz, 총 135,000회 갱신을 확인했다. NPC 장애물 침범·상호 겹침·맵 이탈·NaN·접근 불가능한 쓰레기는 0건이었다. 접근 가능 격자는 2,838개, NPC 간 정규 거리 제곱 최솟값은 1.000273이었다.
- 장애물 35곳의 통과 방지와 유효한 시작점 30곳의 축별 미끄러짐을 확인했다. 이어붙인 울타리 내부에 놓인 진단 시작점 5곳은 잘못된 시작점이므로 제외했다. 브라우저 검사 도구도 인접 장애물에 겹치지 않는 출발점을 선택하도록 보정했다.
- `tests/movement.test.cjs`, `tests/presence35.test.cjs`도 통과하여 기존 이동 메시지·Presence 구조의 회귀가 없음을 확인했다.

## 관리자모드 실제 플레이 및 난이도 평가

격리된 localhost 테스트 저장 영역에서 기존 관리자 실행 함수 `admMini('pang')`로 단독 실행했다. 제품 코드와 동일한 캔버스·이동·피해·보상 함수를 사용했다. 자동화 도구의 프레임 제한을 보완하는 시계와 모션 고정·입력 버튼은 테스트 서버 응답에만 포함되며 배포용 게임에는 포함되지 않는다.

| 확인 항목 | 실제 결과 |
| --- | --- |
| 관리자모드 실행 / 6명 표시 | 아저씨·아가씨·어린이 각각 2명. 검사용 2행 배치에서도 별개 캐릭터 6명 표시 확인 |
| 어린이 까기·먹기·버리기 프레임 | 각 동작을 고정해 전신·팔·과자봉지 자세가 서로 다른 것을 직접 확인 |
| 모션과 생성 시점 일치 | 버리기 단계에서 42→48개로 6명의 쓰레기 생성. 어린이 1350ms의 정확한 단발 생성은 자동 검사로 확인 |
| 세 NPC 종류의 충돌·무적·하트 갱신 | 아저씨→아가씨→어린이 본체 접촉마다 3→2→1→0, 하트와 경고 즉시 반영. 900ms 무적은 자동 검사 통과 |
| 나무·돌·통나무·울타리 통과 방지 | 나무·돌·울타리 앞에서 1초 우측 입력해 차단 확인. 통나무·덤불 등 6종 전체는 자동 검사 통과 |
| 장애물 가장자리 축별 이동 | x축 차단 시 y축 이동과 피격 밀림의 장애물 관통 방지 자동 검사 통과 |
| 과자 비닐 포함 쓰레기 안전 수거 | 비닐 수거 0→1개, 하트 3개 유지. 꽁초·컵도 자동 검사로 안전 수거 확인 |
| 성공 / 시간·하트 실패 화면 | 하트 소진·시간 초과 실패 표시와 재도전 하트 4개 확인. 성공 화면은 아래 플레이 결과 참조 |
| 여러 회 실제 플레이 및 변경 전후 체감 난이도 | 아래 3회 경로 수거와 수동 방향·장애물 검증 결과 참조 |
| JavaScript 신규 실행 오류 | 미처리 실행 오류·Promise 오류 0개. no-cdn 시험의 예상 Supabase CDN 경고는 별도 |

추가로 실제 캔버스에서 서로 다른 쓰레기 배치의 세 라운드를 완료했다. 시험용 경로 선택기는 장애물만 우회하며 NPC를 예측하거나 치우지 않는다. 위치 순간이동이나 점수 증가 조작 없이 기존 `target` 이동과 수거 판정을 사용했다.

| 경로 수거 라운드 | 성공 시간 | 수거 | 남은 하트 |
| --- | ---: | ---: | ---: |
| 1 | 7.861초 | 20개 | 3개 |
| 2 | 9.220초 | 20개 | 2개 |
| 3 | 12.215초 | 20개 | 3개 |

별도 수동 방향 입력 검증에서 우측 1초 이동 중 수거와 NPC 접촉을 확인했다. 나무·돌·울타리 앞에선 우측 입력을 유지해도 통과하지 않았으며, 울타리 앞 12초 대기 중 수거는 0개였다. 길을 고르지 않는 입력과 장애물을 우회하는 플레이의 차이를 확인했다. 초반부터 NPC가 몰려 하트가 전부 사라지는 상황은 세 경로 플레이에서 없었다.

기존 두 명과 통과 가능한 장식 중심의 약 2/10 구성에서, 여섯 명·35개 고형 장애물·우회·주변 쓰레기 배치로 중간 난도의 회피 게임을 목표로 조정했다. 개발 판단은 목표 약 5/10에 맞춘 구성이나, 세 성공 기록은 전체 쓰레기 위치를 아는 시험용 경로 선택기의 결과다. 학생의 수동 플레이 시간이나 성공률을 뜻하지 않는다. 실제 초등학생의 체감 난이도 5/10을 실측·확정한 결과는 아니다.

미니게임 종료 후 가방·지도 진입, 저장/불러오기 `PASS`, 다른 미니게임 `새싹 모으기` 진입을 확인했다. 실사용 저장 영역과 별개 localhost의 시험용 플레이어를 사용했다.

## 성능과 검증 한계

기존 단일 게임 루프 안에서 6명만 갱신한다. NPC별 animation loop나 반복 DOM 생성은 추가하지 않았다. 장애물과 접근 가능 영역은 시작 시 캐시하며, 충돌은 작은 사각형·타원 계산이다. 화면 밖 NPC·쓰레기는 그리지 않는다. 배경과 쓰레기 그림은 기존 캐시를 재사용한다.

동일 데스크톱 Node VM에서 5회 × 75초 × 30Hz를 비교했다. 각 회차 첫 3초를 제외한 10,800개 표본이며 캔버스 그리기를 포함하지 않는 논리 비용이다.

| 논리 갱신 비용 | 이전 2명 | 현재 6명 + 장애물 |
| --- | ---: | ---: |
| 평균 | 0.01337ms | 0.04607ms |
| p95 | 0.02050ms | 0.08170ms |
| p99 | 0.03840ms | 0.14450ms |

평균 증가량은 약 0.0327ms/회다. 필드 캐시 생성은 게임 시작 시 한 번, 평균 10.10ms·최대 15.26ms였다.

브라우저 세 경로 플레이의 제품 갱신 평균은 0.05–0.07ms, p95는 0.1ms였다. 캔버스 그리기 평균은 0.52–0.53ms, p95는 0.7–1.7ms였다. 첫 그리기는 14.6–21.5ms로 이후보다 길었다. 시험 장면은 최근 최대 500개 비용 표본을 보관한다. 자동 경로 선택의 비용은 제품 갱신 측정 앞에서 실행되므로 이 수치에 포함되지 않는다.

Codex in-app browser의 `requestAnimationFrame`은 테스트 중 약 1Hz로 제한되기도 하고 활성 상태에서는 16–17ms 간격을 보이기도 했다. 따라서 혼합 표본을 실제 게임 FPS로 보고하지 않는다. 관리자 테스트 장면의 33ms 시계를 이용해 제품의 렌더링·기능을 확인했으며, 데스크톱 캔버스 비용만으로 Galaxy Tab S5e 성능을 판단하지 않는다. Galaxy Tab S5e 실기기 측정은 수행하지 않았고 안정적인 60FPS를 보장한 결과가 아니다.

확인된 제품 실행 오류는 0개다. `no-cdn=1`로 Supabase를 의도적으로 제외한 페이지 로드에서는 기존 `[Supabase] ... CDN unavailable` 메시지가 출력됐으며, 그 상태에서도 미니게임과 저장 기능은 정상 동작했다. 제품 로직의 새 오류와 구분한다. 검증 도중 발견한 두 문제는 시험 장면의 인접 울타리 내부 출발점과 인라인 CSS 때문에 숨김이 적용되지 않는 도구 패널이었다. 각각 안전한 출발점 선택과 도구 패널 표시 속성으로 시험 코드에서만 수정했다.

## 변경 파일

- `js/plogging.js`: 어린이 2명 및 총 6명 배치, 행동·속도·간격 조정, 환경 충돌과 축별 이동, 접근 가능한 쓰레기 생성, 시작 안내.
- `assets/images/characters/plogging_child_sheet.png`: 신규 어린이 20프레임 시트.
- `tests/plogging.test.cjs`: 6명 순찰·어린이 행동·장애물·스폰·기존 결과 자동 검사.
- `docs/PLOGGING_DIFFICULTY_REWORK.md`: 이 보고서.
- `tests/serve-movement.cjs`: 플로킹 관리자 실행·동작 고정·입력·충돌·실제 경로 플레이·비용 측정 도구. 배포용 HTML은 변경하지 않았다.

## 부록: 어린이 에셋 최종 생성 프롬프트

도구: built-in `image_gen`, `transparent_background: true`.

```text
Use case: stylized-concept. Asset type: production-ready transparent sprite sheet for the Eco Chronicle educational JRPG minigame.
Create ONE coherent human child NPC sheet. The child is elementary-school age, short chestnut brown hair, large head with expressive dark eyes and tiny nose, warm orange cardigan or short-sleeve jacket over a cream shirt, navy shorts, socks and brown sneakers, carrying one small unbranded yellow-orange snack wrapper. A human with recognizable hair, face, hands, clothing and shoes; neither a dot/blob nor stick figure.
Style: match a warm cozy RPG chibi illustrated pixel-style character: head about half total height, small rounded body, bold dark brown outlines, soft limited-palette cel shadows plus subtle painterly pixel texture; crisp sprite edges, detailed but friendly. Think the same sprite family as a middle-aged mustached man in a navy jacket and a young ponytailed woman in coral cardigan, full-body human sprites. No modern 3D, no minimalist icon.
Exact layout: a regular 4 COLUMN × 5 ROW sheet, twenty full-body child frames, NO extra sprites. Entire canvas transparent alpha. Each cell is equal width and equal height. All four columns have the same scale and all five rows have the same ground baseline within each cell, feet aligned at about 90% cell height. Every frame centered within its own cell with generous transparent margin (at least 10% left/right/top), no part crosses a cell boundary. Do not draw grid lines.
Columns from LEFT TO RIGHT: facing SOUTH/front, NORTH/back, WEST/left profile, EAST/right profile. This column order is repeated in every row.
Rows from TOP TO BOTTOM:
ROW 1 IDLE: calm standing, unopened snack wrapper held at waist, both feet on ground.
ROW 2 WALK: clearly stepping with alternate leg forward and opposing arm swing, bag still held; left and right profile legs visibly separated, front/back readable. Same appearance.
ROW 3 OPEN WRAPPER: stops, looks toward hands, both hands at chest pull apart the top of the little snack wrapper, unmistakable opening pose.
ROW 4 EAT: holds opened wrapper low with one hand, other hand with a small snack raised to mouth, unmistakable eating pose; even north/back shows bent elbow/hand near face.
ROW 5 TOSS EMPTY WRAPPER: open empty hand extended slightly downward to release wrapper; a single crumpled empty yellow-orange wrapper just below the hand falling downward toward the ground, still within cell. Short light harmless littering action, no extra effects, no text or motion labels.
Identity locked across all 20 frames: same hair, same colors, same outfit, same small young child proportions. Cell spacing precise, no background, no scenery, no labels, no text, no borders, no watermarks, no ground shadows that join adjacent frames. This child will be drawn slightly smaller than the adult NPCs; produce the complete 20-frame grid.
```
