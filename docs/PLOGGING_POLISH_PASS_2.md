# 플로킹을 해보자 — 다듬기 2차

## 목적과 변경 범위

이번 단계는 앞선 난이도 개선 결과를 기준으로 수거 경로의 밀도를 낮추고, 어른 NPC의 버리기 행동을 더 명확하게 보이게 하며, 발과 환경 오브젝트의 접지감을 보정했다. 목표는 초등학생이 규칙을 익히며 도전할 수 있는 약 5/10 수준이다. 이 숫자는 객관적인 난이도 측정값이 아니다. 자동 경로 검사와 실제 플레이 관찰을 함께 사용하되 학생 대상 실측으로 확정하지 않는다.

제품 변경은 `js/plogging.js`와 `js/game.js`의 플로킹 안내 문구 두 곳, 새 어른 NPC 시트 두 개다. `game.js`에서는 안내 문구 외의 게임 로직을 바꾸지 않았다. 기존 조작, 저장·불러오기, 저장 키와 세이브 구조, 다른 미니게임, 전투, 멀티플레이·Supabase·Presence·Broadcast 로직은 유지했다.

## 난이도 변경 전후

| 항목 | 앞선 개선 후 기준 | 이번 단계 |
| --- | --- | --- |
| 수거 목표 | 20개 | 28개 |
| 초기 쓰레기 | 42개 | 32개 |
| 초기 쓰레기 최소 간격 | 34px | 68px |
| 시작점에서 초기 쓰레기 최소 거리 | 100px | 130px |
| 재도전 추가 하트 상한 | +2 | +1 |
| 제한 시간 | 75초 | 75초 유지 |
| 기본 하트 | 3개 | 3개 유지 |
| 플레이어 속도 | 285px/초 | 유지 |
| 방해 NPC | 세 종류 × 두 명, 총 6명 | 유지 |
| NPC 기본 속도·행동 대기 간격 | 기존 값 | 유지 |
| 환경 충돌·수거·기존 보상 흐름 | 앞선 개선 구조 | 유지 |

초기 쓰레기는 필드를 3열×2행으로 나눈 여섯 구역에 6/6/5/5/5/5개씩 배치한다. 한 구역에 몰린 쓰레기를 직선으로 빠르게 수거하는 경로를 줄이고, 장애물과 NPC를 피해 여러 구역으로 이동하도록 조정했다. 일부는 장애물 옆의 안전한 지점을 후보로 삼는다.

NPC 기본 속도는 아저씨 174/188px/초, 아가씨 180/182px/초, 어린이 168/176px/초다. 행동 완료 뒤의 대기 간격은 아저씨 5.6초, 아가씨 6.2초, 어린이 7.8초다. 기존 후반 보정인 40초 이후 속도 1.08배·대기 간격 0.82배는 유지한다. 플레이어 추적 AI를 추가하지 않았다. 어른의 행동 시간이 길어져 대기 간격은 같아도 실제 생성 주기에는 변경된 행동 시간이 포함된다.

## 어른 NPC 에셋과 모션

기존 아저씨·아가씨와 어린이 시트를 먼저 비교했다. 두 어른 모두 기존 얼굴·머리·의상·색상을 유지하고 새 4방향 5행 시트를 만들었다. 아저씨는 회색 섞인 갈색 머리·콧수염·남색 재킷·겨자색 안쪽 옷·어두운 바지, 아가씨는 갈색 포니테일·산호색 카디건·크림색 상의·청록색 긴 치마를 유지한다. 어린이와 비슷한 진한 윤곽선·음영 밀도를 사용했다.

| 신규 파일 | 크기 | 형식 | 용량 |
| --- | --- | --- | --- |
| `assets/images/characters/plogging_smoker_polish_sheet.png` | 1122×1402px | RGBA PNG | 1,463,519 bytes |
| `assets/images/characters/plogging_coffee_polish_sheet.png` | 1073×1466px | RGBA PNG | 1,422,974 bytes |

기존 `plogging_smoker_sheet.png`와 `plogging_coffee_sheet.png`는 덮어쓰거나 삭제하지 않았다. 새 PNG는 built-in `image_gen`으로 생성한 결과를 그대로 복사했고, 리사이즈·색상·알파 편집은 하지 않았다. 어린이 기존 시트는 그대로 사용한다.

열 순서는 south / north / west / east다. 어른 행은 대기 / 걷기 / 준비 / 버리기 / 빈손 회복이다. 준비 행에서는 쓰레기를 아직 손에 들고 아래로 내리며, 버리기 행에서는 손이 열리고 쓰레기가 분리된다. 회복 행에서는 손이 비고 팔이 몸 옆으로 돌아온다. 아저씨 첫 출력의 준비 행에 이미 떨어지는 꽁초가 보여, built-in 이미지 편집으로 그 행을 수정했다.

| NPC | 행동 경과 시간 | 상태 | 쓰레기 생성 |
| --- | --- | --- | --- |
| 아저씨 | 0–350ms | 준비 | 없음 |
| 아저씨 | 350–750ms | 버리기 | 550ms에 꽁초 |
| 아저씨 | 750–1100ms | 빈손 회복 | 없음 |
| 아가씨 | 0–450ms | 준비 | 없음 |
| 아가씨 | 450–900ms | 버리기 | 650ms에 컵 |
| 아가씨 | 900–1250ms | 빈손 회복 | 없음 |
| 어린이 | 0–500ms | 비닐 까기 | 없음 |
| 어린이 | 500–1100ms | 과자 먹기 | 없음 |
| 어린이 | 1100–1650ms | 버리기 | 1350ms에 과자 비닐 |

행동 중에는 NPC가 멈추고, 종료 후 기존 순찰을 재개한다. `drop.spawned`로 행동당 한 번만 생성한다. 이동 모션은 기존처럼 이동거리 기준 대기/걷기 프레임을 사용하며, NPC별 별도 애니메이션 루프를 추가하지 않았다. 쓰레기 자체는 계속 안전한 수거 대상이고 NPC 본체 충돌만 하트를 감소시킨다.

세 종류 모두 원본 버리기 자세의 손 위치와 맞춰 south/west에서는 왼쪽, north/east에서는 오른쪽 22px 지점에 쓰레기를 놓는다. 정면 동작의 손과 바닥 쓰레기가 반대쪽에 보이던 문제도 함께 보정했다. 해당 지점이 막혀 있으면 기존 안전 지점 탐색을 사용한다. 걷기는 세 종류 모두 기존 방식의 두 자세를 번갈아 표시하며, 총 20개는 걷기 프레임 수가 아니라 5상태×4방향의 전체 자세 수다.

### 원본 행 간격과 발 앵커 보정

생성 요청은 균등 4열×5행이었으나 실제 결과의 행 간격은 균등하지 않았다. 단순히 높이÷5로 자르면 인접 행의 머리·신발이 섞일 수 있어 원본 행 위치를 고정 메타데이터로 지정했다. 원본 비트맵은 변경하지 않았다.

| 시트 | 원본 행 구간, 시작 포함·끝 제외 |
| --- | --- |
| 아저씨 | [0,309], [309,601], [601,877], [877,1146], [1147,1402] |
| 아가씨 | [0,292], [292,573], [573,853], [853,1137], [1137,1466] |

네 열의 경계에는 alpha>8 픽셀이 없어 옆 열의 손·신발이 넘어오지 않음을 확인했다. 아가씨 행 경계도 투명하다. 아저씨의 마지막 두 행 사이에는 미세한 반투명 외곽이 접해 회복 행을 1147px부터 읽도록 했다. 버리기 행의 신발 끝은 보존한다.

서로 다른 행 높이를 동일한 이미지 픽셀 배율로 표시하고, 각 행·방향의 신발 바닥 비율을 `PANG_NPC_FEET`로 지정한다. 떨어지는 쓰레기의 하단을 캐릭터 발로 오인하지 않도록 한다. 아저씨 이름표는 발 위치에서 134px 위로 올려 머리와 겹치지 않게 했다.

## 접지 그림자와 환경 오브젝트

NPC 아래 그림자는 작은 64×24px Canvas 한 개에 radial gradient를 만들어 한 판 동안 캐시한다. 중심 alpha 0.30에서 가장자리 투명으로 사라지는 얇고 부드러운 타원이며, 매 프레임 그라디언트나 그림자 DOM을 새로 생성하지 않는다. 어른은 38×10px, 어린이는 30×8px로 표시한다. PNG 자체에는 바닥 그림자를 넣지 않았다.

나무·돌 등의 원본 이미지 아래쪽 투명 여백은 테마별 발 기준 비율로 계산하여 그림자를 실제 밑동에 놓는다. `PANG_SCENERY_FEET`는 forest / river / ocean / city / air / climate별 나무 두 종류와 돌의 비율을 유지하고, 덤불·통나무·울타리는 `PANG_PROP_FEET`를 사용한다. 그림자의 폭은 수관 전체가 아니라 기존 충돌 footprint에 8px만 더하며, 높이는 나무 8px·울타리 5px·기타 10px로 제한한다. 환경 그림자의 opacity도 0.55–0.65로 낮췄다. 무거운 효과나 새로운 렌더링 루프를 추가하지 않았다.

## 충돌과 안전한 스폰 유지

앞선 단계의 캐시된 고형 장애물과 BFS 접근성 검사를 유지한다. 플레이어와 NPC는 발/하단 몸통 기준으로 충돌하고, 최대 6px 이동 단위와 축별 검사로 관통을 막으면서 가장자리 이동을 허용한다. 하트 피해는 900ms 무적과 기존 깜빡임·밀림을 유지한다. 초기 쓰레기와 NPC가 버린 쓰레기는 접근 가능한 지면을 확인하며, 장애물 내부에 생기면 주변 안전 지점을 찾는다.

## 자동 경로·장시간 검사 결과

동일한 자동 경로 정책과 난수 seed로 변경 전후를 비교했다. 이 검사는 제품의 업데이트·수거·피해·종료 함수를 사용한 모의 플레이이며 실제 학생의 판단·터치 조작을 재현한 것은 아니다.

| 검사 | 변경 전 | 변경 후 |
| --- | --- | --- |
| 20 seed 경로 플레이 성공 | 20/20 | 19/20 |
| 성공 실행 평균 완료 시간 | 10.132초 | 18.084초 |
| 변경 후 성공 실행 중앙값 | — | 17.033초 |
| 변경 후 성공 실행 95백분위 | — | 21.533초 |
| 동일하게 성공한 19 seed의 기존 평균 | 10.184초 | 18.084초 |
| 같은 19 seed 완료 시간 증가 | — | 약 77.6% |

변경 후 seed 11에서는 10.7초에 17개 수거 후 하트가 0이 되어 실패했다. 이 결과는 무작정 가까운 쓰레기만 향하는 경로도 NPC를 피해야 한다는 근거이지만, 실제 학생에게 반드시 적절한 난이도라는 의미는 아니다.

추가 보호 접근성 검사에서는 20/20 seed가 완료됐다. 성공 실행마다 NPC가 새로 버린 쓰레기도 수거했다. 초기 쓰레기를 8개만 남긴 재충전 검사(seed 1–3)에서도 NPC가 버린 쓰레기 20–21개를 추가 수거하여 성공했으며 가장 오래 걸린 실행은 36.200초였다. 따라서 초기 배치만 모두 치운 후 새 쓰레기를 수거하는 흐름도 유지된다.

60 seed를 각각 75초 동안 실행한 135,000회 업데이트와 새로 생성된 쓰레기 2,580개 검사에서는 다음을 확인했다.

- 모든 seed에서 초기 쓰레기 32개, 여섯 구역 분포 6/6/5/5/5/5.
- 초기 쓰레기 사이 최소 거리 68.271px.
- 시작점과 초기 쓰레기 최소 거리 131.492px.
- 초기 NPC와 쓰레기 최소 거리 48.786px.
- 접근 불가 쓰레기, 장애물 관통, NPC 겹침, NaN, 필드 밖 위치 모두 0건.

## 업데이트 비용 비교

같은 데스크톱 VM 환경에서 워밍업 후 60 seed, 129,600회 표본으로 짝을 맞춰 비교했다. 아래 값은 Canvas 렌더링·실기기 브라우저·터치 입력 비용을 제외한 업데이트 계산 시간이다.

| 지표 | 변경 전 | 변경 후 |
| --- | --- | --- |
| 평균 업데이트 시간 | 0.040982ms | 0.039182ms |
| 95백분위 업데이트 시간 | 0.05650ms | 0.05670ms |
| 99백분위 업데이트 시간 | 0.08200ms | 0.08190ms |
| 필드 생성 평균 시간 | 8.271275ms | 8.468660ms |

평균 업데이트는 소폭 줄고 필드 생성은 소폭 늘었으나, 두 값 모두 매우 짧고 실행 편차가 포함되므로 의미 있는 성능 변화라고 판단하지 않는다. 성능 개선 폭을 확정하거나 FPS로 환산하지 않는다. 정적 그림자 캐시와 원본 crop 메타데이터가 실기기에서 추가하는 실제 렌더링 비용은 별도 검증 범위다.

## 브라우저 검증

Windows의 Codex in-app browser에서 로컬 테스트 서버와 1280×800 화면 비율로 검증했다. 테스트 버튼은 서버가 테스트 응답에만 삽입하며 제품 `index.html`이나 학생용 화면에는 추가하지 않았다. 관리자 실행은 실제 `admMini('pang')`를 호출하고, 플레이는 실제 `pangUpdate()`와 `pangDraw()`를 사용했다. CDN을 의도적으로 제외해 멀티플레이가 오프라인인 상황에서도 검증했다.

| 확인 항목 | 실제 브라우저 결과 |
| --- | --- |
| 관리자모드 실행, 6명 표시 | 세 종류 각 2명 확인. 첫 실행 하트 3개·초기 쓰레기 32개·목표 28개·시간 75초 |
| 어른 4방향 준비·버리기·회복, 어린이 3단계 행동 | 남/북/서/동 걷기와 행동 자세를 눈으로 확인. 준비→버리기→회복 및 비닐 까기→먹기→버리기 구분 |
| 스프라이트 잘림·인접 행 조각·발 앵커·그림자 | 최종 crop에서 인접 행 조각 없음. 발 위치에 붙는 얕은 그림자와 이름표 위치 확인 |
| NPC 본체 충돌·무적·하트 UI | 아저씨→아가씨→어린이 접촉 시 3→2→1→0 즉시 표시, `조심해요!` 문구·900ms 무적 상태 확인. 지속 겹침 중 추가 피해 방지는 자동 검사 PASS |
| 장애물과 가장자리 이동·안전한 쓰레기 수거 | 나무·돌·울타리 우회와 방향 전환 확인. 실제 생성된 꽁초·컵·과자 비닐을 각각 수거하여 0→1→2→3, 하트 3개 유지 |
| 실제 반복 플레이와 체감 난이도 평가 | 서로 다른 배치 3회 모두 28개 수거 완료. 아래 기록은 브라우저 자동 이동 조작이며 학생의 터치 플레이 난이도 실측은 아님 |
| 성공·시간 초과·하트 소진 결과 | 실제 세 성공 화면, 75초 시간 초과, 0하트 실패 화면 확인. 재도전은 하트 4개. 본편 관문 안내도 28개·추가 하트 +1 표시 |
| 기존 이동·가방·지도·저장·불러오기 | 플로킹 후 본편 이동·가방 열기/닫기·지도와 지역 복귀·`Save.save()`/`Save.load()` PASS. 다른 미니게임 `맑은 물 모으기` 진입 정상 |
| Canvas 렌더링 비용 및 눈에 띄는 정체 | 워밍업 뒤 평균 0.40–0.46ms, p95 0.6ms. 아래 측정 범위와 브라우저 시계 제한 참조 |
| 신규 JavaScript fatal error | 테스트 장면의 수집 오류 0개. 콘솔에는 의도적인 CDN 미로드로 기존 Supabase 오류만 출력 |

### 최종 제품의 브라우저 반복 플레이

| 배치 | 완료 시간 | 수거 | 남은 하트 | 워밍업 후 평균 draw / p95 |
| --- | --- | --- | --- | --- |
| seed 1 | 18.097초 | 28 | 3 | 0.41 / 0.6ms |
| seed 2 | 20.996초 | 28 | 2 | 0.46 / 0.6ms |
| seed 3, 테스트 경로 수정 후 | 16.814초 | 28 | 2 | 0.40 / 0.6ms |

원래 자동 이동 도구는 NPC에게 밀린 뒤에도 이전 경로를 유지해 seed 3에서 장애물 옆에 머물렀다. 그 실행은 35.868초에 6개 수거·하트 소진으로 실패했다. 실제 방향 버튼으로 옆으로 빠져나오는 것이 가능했고, 제품 충돌이 잘못된 것은 아니었다. 테스트 도구만 현재 위치에서 다음 지점으로 가는 길을 재검사하고 막히면 경로를 다시 만들도록 수정했다. 동일한 제품 코드로 seed 3이 위와 같이 완료됐으며, 7가지 프레임 간격 패턴의 자동 검사도 모두 완료했다. 기존 플레이어 이동·충돌 로직은 이 문제 때문에 수정하지 않았다.

목표 증가와 초기 쓰레기 분산으로 이전보다 여러 구역을 돌아다니고 NPC가 새로 버린 쓰레기를 회수하는 판단이 필요해졌다. 직선으로 한 구역을 쓸어담는 방식의 이점이 줄었으며, 자동 경로에서도 일부 접촉 실패가 발생했다. 제한 시간·기본 하트·플레이어 및 NPC 속도를 유지하고 재도전 4하트를 제공하므로 지나친 수치 압박은 피했다. 약 5/10 목표에 접근하도록 조정했지만 학생 대상 실측으로 난이도를 확정한 것은 아니다.

`node tests/plogging.test.cjs`, `node tests/movement.test.cjs`, `node tests/presence35.test.cjs` 모두 PASS이며 수정된 JavaScript 구문 검사도 통과했다. 기존 멀티플레이 제품 파일에는 변경이 없다. 브라우저 콘솔의 기존 Supabase 오류는 `no-cdn=1`로 라이브러리를 제외한 테스트 조건에서 발생한 것으로, 플로킹 실행·본편 이동·저장·다른 미니게임을 중단하지 않았다.

### 성능 측정 범위

브라우저의 원래 `requestAnimationFrame` 간격은 짧은 전경 표본에서 약 16.7–17.8ms였으나 실행 상태에 따라 스케줄링이 변했다. 기능 반복 검증은 테스트 장면의 33ms 시계와 최대 34ms 하위 업데이트를 사용했다. 따라서 완료 시간과 Canvas 함수 비용을 지속적인 게임 FPS 측정값으로 취급하지 않는다. 초기 이미지 로딩·첫 렌더는 위 워밍업 후 draw 수치에서 제외했다. Samsung Galaxy Tab S5e 실기기 측정은 수행하지 않았으며 안정적인 60FPS를 보장한다고 주장하지 않는다.

그림자 텍스처는 64×24px RGBA 기준 약 6KiB 한 개이며 모든 NPC·오브젝트가 재사용한다. NPC 6명은 종류별 이미지 3개를 공유하고 기존 게임 루프에서만 갱신한다. 행·발 메타데이터는 정적 숫자이므로 실행 중 알파 탐색이 없다. 신규 DOM 생성, NPC별 타이머, 이미지별 blur 또는 별도 animation loop를 추가하지 않았다.

## 수정 파일

- `js/plogging.js`: 수거 목표·초기 배치·재도전 상한, 어른 행동 시간·에셋 연결, 원본 행 crop·발 앵커, 작은 그림자 캐시와 접지 위치.
- `js/game.js`: 플로킹 안내 문구 두 곳만 변경.
- `assets/images/characters/plogging_smoker_polish_sheet.png`: 새 아저씨 시트.
- `assets/images/characters/plogging_coffee_polish_sheet.png`: 새 아가씨 시트.
- `tests/plogging.test.cjs`: 변경된 목표·배치·모션·스폰·안전성 검사.
- `tests/serve-movement.cjs`: 관리자 테스트 장면의 검증 지원.
- `docs/PLOGGING_POLISH_PASS_2.md`: 이 보고서.

## 부록: 이미지 생성 이력과 정확한 프롬프트

built-in `image_gen`만 사용했다. 성인 원본 시트를 identity target, 어린이 시트를 style reference로 전달했고 `transparent_background: true`를 적용했다. 기존 PNG는 보존했다. 프로젝트의 최종 파일은 생성된 PNG를 그대로 복사한 것이며 외부 이미지 편집·리사이즈를 하지 않았다.

생성 원본:

- 아저씨 1차: `C:\Users\guppy\.codex\generated_images\01a0e73f-0292-72c2-a130-22762c7a8758\exec-6958d5a4-2f57-4ed5-9c93-cf9de1b05a92.png`
- 아저씨 최종: `C:\Users\guppy\.codex\generated_images\01a0e73f-0292-72c2-a130-22762c7a8758\exec-20a25e23-87b3-497c-adeb-346f304b8725.png`
- 아가씨 최종: `C:\Users\guppy\.codex\generated_images\01a0e73f-0292-72c2-a130-22762c7a8758\exec-d3dd1831-e7ff-4f32-987b-219010f5b4cb.png`

### 아저씨 신규 시트 요청

```text
Use case: identity-preserve. Asset type: transparent game sprite sheet.
Edit the middle-aged male NPC from reference image 1 into a NEW production sheet. Reference 1 is identity/clothing target; reference 2 is ONLY a style/grid-density guide showing a child from the same game, do NOT insert the child. Preserve the original man's brown-and-grey hair, grey moustache, kindly middle-aged face, navy blue work jacket with pockets, mustard shirt, dark grey-brown trousers, brown shoes, large rounded head/small chibi body. Same Eco Chronicle warm illustrated pixel-style, crisp dark brown outline and subtle palette shading, face recognizable from original. Keep feet, hands, sleeves, clothes legible at small game size. Neither photorealism nor minimalist icon.
Replace the old 4 by 3 sheet with an EXACT regular 4 COLUMNS by 5 ROWS sheet, twenty complete full-body sprites. Preferred canvas compact around 1120×1400. Equal-sized cells. Generous clear alpha transparent margins inside every cell, no sprite crosses cell. Feet baseline 90 percent down each cell and identical character scale in all cells. Columns left to right SOUTH front, NORTH back, WEST left profile, EAST right profile, repeated in every row. All twenty same man. Keep compact child-reference style density.
Rows top to bottom must be GENUINELY DIFFERENT readable poses:
1 IDLE: stands relaxed, small cigarette butt held at upper chest in his right hand, not smoking it at mouth.
2 WALK: one leg steps forward, opposing arm swing; readable separated legs, retains butt in hand.
3 PREPARE: stops, looks downward, bends right elbow and lowers hand holding butt toward his hip, preparing to flick it; left arm neutral. This must visibly differ from idle and toss.
4 TOSS: right hand opens with wrist flick directed DOWNWARD away from torso; ONE tiny butt just below open fingers falling toward floor, inside own cell. Not a cup. No effect trails. Distinct arm extended pose.
5 RECOVER: right hand now EMPTY returns beside body, both arms relaxed, looking ahead, upright standing. Absolutely no butt in fingers or falling butt in this row. Distinct from idle hand-at-chest pose.
Back view should still show right shoulder/elbow lowering, flick and recovered empty hand. Left/right profiles anatomically consistent, sleeves naturally joined to shoulders. Feet grounded, no twisted limbs.
Transparent alpha background, NO baked ground shadows, NO scene, text, labels, grids, borders, watermark, glow, smoke or extra sprites. Preserve appearance; add only the two required new action poses and organize all twenty frames into the 4×5 equal grid.
```

### 아저씨 준비 행 수정 요청

```text
Use case: precise-object-edit. The image is an exact 4-column by 5-row transparent character sprite sheet. Fix ONLY the THIRD ROW from the top (four prepare poses), preserving every other row, columns, sprite scale, colors, face identity and exact canvas layout.
In row 3 the man must STILL HOLD the cigarette butt between his fingers at HIP height while preparing to discard it. No detached/falling object beneath his hand in row 3. Show his elbow bent and hand nearer his hip, wrist closed with butt clearly pinched. The third row must look clearly different from the FOURTH row where the empty hand is extended and a detached butt falls. South/north/west/east directions must remain as current. Retain same navy jacket, mustard shirt, moustache, graying hair and chibi proportions. Preserve row 1 idle, row 2 walk, row 4 toss, row 5 recover exactly. Transparent alpha, no ground shadows, no text, no background. Four equally spaced columns and five equally spaced rows, twenty complete frames.
```

### 아가씨 신규 시트 요청

```text
Use case: identity-preserve. Asset type: transparent game sprite sheet.
Edit the young woman from reference image 1 into a NEW production sheet. Reference 1 is identity/clothing target; reference 2 is ONLY a style/grid-density guide showing the child from the same game, do NOT insert the child. Preserve her chestnut brown hair with a long ponytail and bangs, large dark expressive eyes and kindly face, coral pink cardigan, cream shirt, teal long skirt, dark brown shoes, large rounded head/small chibi body. Same Eco Chronicle warm illustrated pixel-style, crisp dark brown outline and soft palette shading, recognizable original woman. Keep sleeves/hands/clothes legible at small game size. Neither photorealism nor minimalist icon.
Replace the old 4 by 3 sheet with an EXACT regular 4 COLUMNS by 5 ROWS sheet, twenty complete full-body sprites. Preferred compact canvas around1120×1400. Equal-sized cells, generous transparent margins in every cell, no parts cross cells. Feet baseline 90 percent down each cell, identical character/head scale in all cells. Columns left to right SOUTH front, NORTH back, WEST left profile, EAST right profile, repeated in every row. All twenty same woman. Match child-reference style density.
Rows top to bottom must be GENUINELY DIFFERENT readable poses:
1 IDLE: standing relaxed, one white disposable coffee cup with dark brown sleeve and lid held at chest height in right hand.
2 WALK: clear stepping pose, skirt moves minimally and one shoe forward/opposing elbow swing; still holding cup.
3 PREPARE: she stops and looks down, bends right elbow and lowers CLOSED GRIP holding the intact upright cup beside HIP, preparing to discard it. Cup is STILL IN her hand. No detached/falling cup in this row. Clearly different from idle cup at chest and toss open hand.
4 TOSS: releases that cup DOWNWARD: right arm reaches a little out and down, fingers visibly OPEN AND EMPTY, ONE disposable cup below fingertips tilted falling toward ground in same cell; no effect trails. Not two cups.
5 RECOVER: BOTH hands EMPTY, right hand returns relaxed beside cardigan/skirt, upright looks ahead. No cup in hands or beside/under her. Distinct from idle. Back view must show prepare lowered elbow/cup, toss extended hand and recovered relaxed hands.
Anatomically consistent left/right profiles; sleeves naturally joined to shoulders; shoes fully within cell. No twisted arms. Preserve her proportions and clothing.
Transparent alpha background. NO baked ground shadow, NO scenery, text, labels, grids, borders, watermark, glow or extra sprites. Preserve original identity and improve action clarity in organized4×5 equal grid.
```

