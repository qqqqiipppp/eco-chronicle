# 미사용 리소스 조사 및 안전 격리 보고서

검사일: 2026-09-23. 영구 삭제 0개. 기존 게임 코드·UI·기능·ID·세이브 키·기존 매니페스트 변경 0개.

## 결과

| 항목 | 결과 |
|---|---:|
| 정리 전 프로젝트 전체 (.git 제외) | 39,243,871 bytes / 39.244 MB |
| 정리 전 .git 포함 | 77,789,457 bytes / 77.789 MB |
| 정리 전 assets | 751개 / 38,199,605 bytes / 38.200 MB |
| 이미지 | 751개 / 38,199,605 bytes |
| 오디오 파일 | 0개 / 0 bytes |
| 기타 assets 리소스 | 0개 |
| A 현재 사용 경로 확인 | 160개 |
| B 미사용 확정 | 233개 |
| C 사용 여부 불확실·보존 | 358개 |
| 동일 SHA-256 중복 후보 | 0개 |
| 격리 이동 | 233개 |
| _unused_assets 총 용량 | 3,116,594 bytes / 3.117 MB |
| 정리 후 assets | 518개 / 35,083,011 bytes / 35.083 MB |
| 향후 격리 폴더를 배포 대상에서 제외할 경우 예상 절감 | 3.117 MB, 원 프로젝트 대비 7.94%, assets 대비 8.16% |
| 이번 작업의 실제 전체 디스크 절감 | 0 bytes (이동만 수행, 보고서만 추가됨) |
| 복구 / 영구 삭제 | 각각 0개 |

MB는 1,000,000 bytes 기준이며 파일 논리 크기를 합산했다. NTFS 할당 크기나 OneDrive 로컬 점유량은 아니다. 현재 격리 폴더도 프로젝트 안에 있으므로 전체 용량 또는 Git 이력 용량이 감소한 것은 아니다. 배포 설정은 변경하지 않았다.

## 검사 범위와 분류 기준

index.html, css 전체, js 17개 전체, asset-manifest.json, docs, README와 기타 추적 파일, assets 전체를 조사했다. 실제 파일 형식은 PNG 653개와 WebP 98개이며 JPG/JPEG/GIF/SVG/MP3/WAV/OGG 및 기타 assets 파일은 없었다. 매니페스트의 모든 원본 해시·크기는 실제 파일과 일치했다. 전체 751개 SHA-256을 비교해 이름이 다른 바이트 동일 파일도 조사했다.

A는 현재 주 렌더링 경로 또는 유효한 동적 조합으로 확인한 매핑의 고유 파일이다. 일반/보스 전투 그림, 전투·미니게임·테마 배경, 시작 화면 제단, 외형 선택의 몸·머리·얼굴·방향 조합, 전투 뒷모습과 정령 조합을 포함한다. 모든 A 파일을 실제 게임 진행으로 하나씩 표시했다는 의미는 아니다. 스모크 테스트 중 실제 게임 이미지 요청은 62개였다.

C는 최종 매핑에 남아 있으나 사용 조건을 충분히 확정하지 않은 파일이다. 구형 대체 몬스터/NPC 매핑, 기타 스프라이트·아이템·오브젝트의 조건부 사용을 포함하며 모두 원위치에 보존했다. 그림이 오래되어 보이거나 실행 중 한 번도 요청되지 않았다는 이유만으로 B로 분류하지 않았다.

B는 단순 문자열 미발견이 아니라 **이미지를 소비하기 전에 같은 SPRITES 키에 새 경로가 무조건 덮어써지는 파일**만 포함한다. index.html 순서대로 sprites → sprite-meta → player-tint → visuals를 별도 JavaScript 컨텍스트에서 실행하고 최종 모든 전역 매핑을 재귀 검사했다. 앞 단계는 데이터/함수 정의이며 이미지 로딩·preload·렌더링 소비가 없다. visuals.js의 15·19·22행 Object.assign은 동기적으로 실행된다. 모든 B의 할당 키는 후속 경로로 교체되며, 다른 최종 전역 객체에도 해당 경로가 남지 않는다. 개별 할당 위치·대체 경로·참조 위치·해시는 quarantine-manifest.json에 기록했다.

## 동적 경로와 소비자 조사

| 소비자 | 조사 결과 |
|---|---|
| index.html / img src / picture/source | 17개 일반 스크립트 순차 로드. 게임 img는 매핑 결과를 사용. 별도 picture/source 리소스 없음 |
| CSS url / background-image | 독립적인 외부 파일 URL 없음. JS가 매핑 경로를 background-image로 삽입 |
| 캐릭터 | game.js 511–514의 head/hair/face/direction·body/outfit 조합, battle-view.js의 body_battle 조합 확인 |
| 테마·맵 | ecoSceneryKey의 biome+'_'+key, ECO_ART[theme][phase], ECO_SCENES와 ECO_BATTLE_ART 확인 |
| 몬스터·보스 | monKey의 mob_+theme+index, 탑·대련·그림자 분기와 각 대체 매핑 보존 |
| NPC·퀘스트 | npc-data ID/sp, ECO_HUMAN[n.id], ECO_NPC[n.sp], ECO_WALK와 _w 접미사 확인 |
| 장비·아이템 | gear-data / theme-data 및 shopIcon의 SPRITES[it.ico] 확인. 문자/이모지 아이콘과 파일 경로 구분 |
| 정령·스프라이트 | pet 종류·성장 단계·방향 조합, 농장 동물/꽃/채집 등의 키 소비 조사 |
| new Image / drawImage | makeTintFor, 캔버스 변환, 미니게임 arcImage/arcLoadImages 확인. 최종 매핑 및 변환 data URL 사용 |
| 미니게임 | theme 기반 platform/before/after, prop, mob, pet, body/head 소스 조합 보존 |
| fetch / JSON / preload | 실행 코드에서 외부 JSON/asset-manifest fetch 또는 이미지 일괄 preload 소비 없음. 매니페스트는 원본 변환 기록 |
| Audio / new Audio | 외부 오디오 경로 없음. audio-data.js 악보/SFX와 game.js AudioContext 합성 |
| 문자열 치환 | HTML escape 등과 리소스 키 조합을 구분. 격리된 해시 파일명을 별도 조립하는 소비자 없음 |

## 이동 후 검사와 남아 있는 구형 문자열

보존 파일 518개는 모두 HTTP 로드 및 브라우저 이미지 디코딩을 통과했다. 활성 매핑의 누락 0개, 격리 파일의 실제 게임 요청 0개, 게임 리소스 실패 응답 0개, 확인한 브라우저 오류/경고 로그 0개였다. 모든 격리 파일은 이동 전후 해시가 동일하다.

**원래 JS의 덮어써지는 할당과 기존 asset-manifest.json에는 격리한 233개 파일의 옛 경로 문자열이 남아 있다.** 그 경로를 직접 요청하면 파일이 없다. 게임 실행 중 소비되는 활성 경로의 누락은 아니지만, 단순 문자열/매니페스트 존재 검사는 이를 보고할 수 있다. 코드 최소 변경과 원본 매니페스트 보존을 위해 문자열을 지우거나 격리 폴더 경로로 바꾸지 않았다. 현재 위치는 별도 격리 명세에 기록했다. 향후 스크립트 로드 순서를 바꾸거나 구형 매핑을 다시 사용하는 경우 먼저 해당 파일을 복구해야 한다.

브라우저의 자동 favicon.ico 요청 404 1건이 관찰되었다. 원본 프로젝트에도 없던 파일이며 게임 이미지/사운드 누락이 아니다. 새 오류를 고치기 위한 코드 변경은 하지 않았다. 복구가 필요한 이미지/사운드 오류는 발견되지 않았다.

## 실제 실행 테스트

별도 임시 localhost origin에서 테스트 캐릭터 EC5388로 확인했다. 기존 사용자 세이브는 읽거나 변경하지 않았다.

- 통과: 시작 화면
- 통과: 새 게임 이름 등록
- 통과: 캐릭터 외형/얼굴 선택
- 통과: 정령 선택
- 통과: 숲 월드 진입
- 통과: 키보드 이동: hero left 298px에서 301px로 변화
- 통과: 가방 및 장비 슬롯/아이템 수량 표시
- 통과: 현재 레벨 및 다음 레벨 경험치 표시
- 통과: 테마 지도와 잠금 레벨 표시
- 통과: 월드 캐릭터/NPC/배경/UI 육안 확인
- 통과: 저장 완료 표시
- 통과: 새로고침 후 EC5388 이어하기
- 통과: 불러온 이름/레벨/체력/골드 유지
- 통과: 보존 이미지 518개 브라우저 로드 및 naturalWidth > 0

아래는 미검증이며, 통과했다고 간주하지 않는다.

- 농장/채집 등 실제 맵 이동
- 다른 테마 실제 진입
- 일반 전투 및 보스전 진행
- 미니게임 플레이
- 장비 실제 장착 및 아이템 사용
- 퀘스트 수행/완료
- 레벨 상승/경험치 획득
- 효과음/BGM 청취 및 AudioContext 상태
- 기존 사용자 저장 데이터 직접 불러오기

일괄 이미지 검사는 캐릭터·몬스터·보스·배경·UI·장비/아이템/퀘스트 연관 매핑·미니게임·테마의 파일 존재/디코딩을 확인하는 검사이고 해당 게임 기능의 전체 진행 테스트는 아니다. 저장 버전·키·코드의 바이트가 그대로임은 별도 검증했다. 기존 docs/TEST_RESULTS.json의 이전 검증을 이번 실행 결과로 재사용하지 않았다.

## 변경 파일과 복구

- 이미지 233개: assets/images/... → _unused_assets/images/... (하위 구조와 파일명 유지).
- 새 감사 문서/도구: REPORT.md, baseline.json, results.json, tests.json, quarantine-manifest.json, verify.cjs, restore.ps1 (모두 docs/asset-audit/).
- 기존 index.html, css, js, asset-manifest.json, README, 기존 docs 변경 0개.
- 개별 이동 파일 전체 목록은 아래에 있으며 원래/현재 경로와 해시는 quarantine-manifest.json 및 results.json에 있다.
- 재검증: 프로젝트 루트에서 node docs/asset-audit/verify.cjs (읽기 전용).
- 전체 복구가 필요할 때: powershell -File docs/asset-audit/restore.ps1. 경로 범위·해시·덮어쓰기 충돌을 먼저 검사하고 이동만 한다. 이번 작업에서는 실행하지 않았다.
- 커밋/푸시/영구 삭제는 수행하지 않았다.

## 미사용 확정 파일 전체 — 큰 용량 순

원래 경로를 기준으로 표시하며 모두 _unused_assets 아래 같은 하위 경로에 보관했다.

1. assets/images/monsters/54744c8a553d229194ecc5b1.png — 158.831 kB (158,831 bytes)
2. assets/images/monsters/94bc669e5fbd49be266b9f40.png — 154.660 kB (154,660 bytes)
3. assets/images/monsters/52b977a32fa8a92b698b5978.png — 147.247 kB (147,247 bytes)
4. assets/images/monsters/f117769b1f214a4e62e288e9.png — 140.980 kB (140,980 bytes)
5. assets/images/monsters/01d795d92b52dafd648022b6.png — 138.257 kB (138,257 bytes)
6. assets/images/monsters/9c6f9c264f549b4fda2b16b3.png — 136.471 kB (136,471 bytes)
7. assets/images/monsters/c41e8c8f029b423348a650c4.png — 136.031 kB (136,031 bytes)
8. assets/images/monsters/bd426a8af42c373480da6cb1.png — 132.523 kB (132,523 bytes)
9. assets/images/monsters/4f12da9c1b7a3e861c572f86.png — 131.048 kB (131,048 bytes)
10. assets/images/monsters/df4b383d08ce0432b997c7a0.png — 127.180 kB (127,180 bytes)
11. assets/images/monsters/fb30aadbb1c74c7a91d8daae.png — 126.931 kB (126,931 bytes)
12. assets/images/monsters/3fe87788f811ff45bb8a7d5a.png — 126.885 kB (126,885 bytes)
13. assets/images/monsters/aac246379e8e6ef881c6aefd.png — 122.072 kB (122,072 bytes)
14. assets/images/monsters/cf4717217e918e5c4ff6dc6b.png — 118.953 kB (118,953 bytes)
15. assets/images/monsters/0287334bf56f81fdc706a9a6.png — 115.983 kB (115,983 bytes)
16. assets/images/monsters/21ac2c3f45309a5fa0337eb3.png — 111.162 kB (111,162 bytes)
17. assets/images/monsters/9920e5c84dc14da96702bd11.png — 109.404 kB (109,404 bytes)
18. assets/images/monsters/d02c0507766f5f9c84258513.png — 106.150 kB (106,150 bytes)
19. assets/images/monsters/fb2ee67eacf8879af7bf1e08.png — 106.001 kB (106,001 bytes)
20. assets/images/monsters/72ef69af7dc453e842d2edc7.png — 103.387 kB (103,387 bytes)
21. assets/images/monsters/0c8a9b2fa2ef3740d34bd749.png — 96.289 kB (96,289 bytes)
22. assets/images/monsters/25426ac7548e59c55649674d.png — 96.021 kB (96,021 bytes)
23. assets/images/monsters/623ad4713c7bf53d293a8516.png — 81.606 kB (81,606 bytes)
24. assets/images/monsters/32740d03f3575d29c8523a10.png — 75.491 kB (75,491 bytes)
25. assets/images/objects/45b37c4bb75db6c8aef7f711.png — 4.034 kB (4,034 bytes)
26. assets/images/objects/631cc8c48b017b671f94c73a.png — 3.476 kB (3,476 bytes)
27. assets/images/objects/b8f095705eaf64782c51a171.png — 3.157 kB (3,157 bytes)
28. assets/images/backgrounds/39196824fb75a4c8d2c0708c.png — 3.109 kB (3,109 bytes)
29. assets/images/objects/1316fb0768172b4b6e6dd4ea.png — 2.994 kB (2,994 bytes)
30. assets/images/objects/8f487763add1be7d0a04d09e.png — 2.862 kB (2,862 bytes)
31. assets/images/monsters/0384f1ffdb7f32e3055a4c00.png — 2.659 kB (2,659 bytes)
32. assets/images/objects/e13eb31d9185730fdf71c130.png — 2.650 kB (2,650 bytes)
33. assets/images/objects/dbae372d051a847049b06462.png — 2.631 kB (2,631 bytes)
34. assets/images/objects/22f3dee1ff8e0407d3925b87.png — 2.590 kB (2,590 bytes)
35. assets/images/objects/bbb97f8ac39a48eb9b4a8c75.png — 2.424 kB (2,424 bytes)
36. assets/images/monsters/76f97fd496d961d9170933f4.png — 2.379 kB (2,379 bytes)
37. assets/images/objects/a18e636284c7e2499888e02d.png — 2.351 kB (2,351 bytes)
38. assets/images/objects/bcdd33c625b9d97fa7b66bc2.png — 2.329 kB (2,329 bytes)
39. assets/images/objects/8fdc0372fdd0750baac544ac.png — 2.285 kB (2,285 bytes)
40. assets/images/objects/08281168d0126dc9ca9386a5.png — 2.279 kB (2,279 bytes)
41. assets/images/monsters/4190213800fd481957c6c901.png — 2.208 kB (2,208 bytes)
42. assets/images/objects/a3917aecdb138e2de795ab6c.png — 2.207 kB (2,207 bytes)
43. assets/images/objects/9691b52a62d2bdee43eccd16.png — 2.175 kB (2,175 bytes)
44. assets/images/objects/29b81fb614e347d0543b8e53.png — 2.146 kB (2,146 bytes)
45. assets/images/objects/f93d248cacd834b36929be3a.png — 2.141 kB (2,141 bytes)
46. assets/images/objects/aac9915dc174ac15624b8c66.png — 2.101 kB (2,101 bytes)
47. assets/images/objects/fda0577fe3561c42db2e2c68.png — 2.092 kB (2,092 bytes)
48. assets/images/monsters/7686c10985cbf8106dc928f0.png — 1.986 kB (1,986 bytes)
49. assets/images/objects/bfdeee8a53cb5fdbea61f295.png — 1.977 kB (1,977 bytes)
50. assets/images/monsters/d76bf8ed1b22c5ecfcedd90b.png — 1.919 kB (1,919 bytes)
51. assets/images/objects/3436c327e048e685260c0253.png — 1.911 kB (1,911 bytes)
52. assets/images/objects/fc63d291bb2db78fe0aff4a5.png — 1.911 kB (1,911 bytes)
53. assets/images/monsters/c0b1903623c8a7d7811358df.png — 1.890 kB (1,890 bytes)
54. assets/images/objects/963087c8e8a1b73f7fb023fc.png — 1.885 kB (1,885 bytes)
55. assets/images/monsters/d9fde2e7b3e6d2d144c3821e.png — 1.882 kB (1,882 bytes)
56. assets/images/monsters/6a0d13abbb394d5a3213829d.png — 1.874 kB (1,874 bytes)
57. assets/images/monsters/0465270038194d9f351feed5.png — 1.871 kB (1,871 bytes)
58. assets/images/monsters/c38af55e6dd4642c483ee122.png — 1.851 kB (1,851 bytes)
59. assets/images/monsters/48216774302ce2c55a621659.png — 1.844 kB (1,844 bytes)
60. assets/images/monsters/0e8bf226d7681a61afe99195.png — 1.835 kB (1,835 bytes)
61. assets/images/monsters/1018185d3678cdba817d1307.png — 1.781 kB (1,781 bytes)
62. assets/images/monsters/808d1033d0e83569b726b0fc.png — 1.767 kB (1,767 bytes)
63. assets/images/monsters/8746f1fd72f28644f6cec0d4.png — 1.751 kB (1,751 bytes)
64. assets/images/monsters/d792f8c9ca8cc28ab1b405fe.png — 1.737 kB (1,737 bytes)
65. assets/images/characters/8e000a21befd83dc81ae7848.png — 1.727 kB (1,727 bytes)
66. assets/images/monsters/4355143b1c58da9648efaa6f.png — 1.720 kB (1,720 bytes)
67. assets/images/monsters/3c2944d9e8038f773cfe9637.png — 1.718 kB (1,718 bytes)
68. assets/images/monsters/a48a80cc12cf5fc2243ee0de.png — 1.706 kB (1,706 bytes)
69. assets/images/monsters/23e00901a6c1d48e70ce6a5c.png — 1.699 kB (1,699 bytes)
70. assets/images/monsters/5ea9348006a583851a69e8d4.png — 1.690 kB (1,690 bytes)
71. assets/images/characters/dd44bda2537ebd4c59490426.png — 1.684 kB (1,684 bytes)
72. assets/images/characters/e820e21d90ce7a04c437328f.png — 1.680 kB (1,680 bytes)
73. assets/images/characters/79a0b7d2ec9eb53f11646ddb.png — 1.675 kB (1,675 bytes)
74. assets/images/characters/20f7ac52c02593f709c10237.png — 1.656 kB (1,656 bytes)
75. assets/images/monsters/8cec7150530a5f6d6c80b89e.png — 1.645 kB (1,645 bytes)
76. assets/images/objects/295e8f6da8d1bf5c053dae1d.png — 1.642 kB (1,642 bytes)
77. assets/images/objects/2c521ec94eb674d6cbdf9e2a.png — 1.636 kB (1,636 bytes)
78. assets/images/objects/84b688cf9b8f171dce6e1db3.png — 1.612 kB (1,612 bytes)
79. assets/images/characters/5e6dc0983be4a6c7a025becb.png — 1.605 kB (1,605 bytes)
80. assets/images/characters/ea7ef4c7e30b0cc7be54c161.png — 1.595 kB (1,595 bytes)
81. assets/images/monsters/db271a5e642986d2387a4935.png — 1.584 kB (1,584 bytes)
82. assets/images/characters/14c9016de3b0cd15b3fe4fce.png — 1.574 kB (1,574 bytes)
83. assets/images/monsters/f8b30def6ea15e5178289322.png — 1.550 kB (1,550 bytes)
84. assets/images/monsters/bb9c8820f62cc0a2754ec5b1.png — 1.542 kB (1,542 bytes)
85. assets/images/monsters/a36d1bf1d04779a2993a2fdb.png — 1.538 kB (1,538 bytes)
86. assets/images/monsters/1151a677237b9c318f83548b.png — 1.535 kB (1,535 bytes)
87. assets/images/monsters/843fb1209f728572b97f3b4b.png — 1.533 kB (1,533 bytes)
88. assets/images/characters/96dc2361eeaa821a8774d47b.png — 1.526 kB (1,526 bytes)
89. assets/images/characters/6ad49a257fdd063c72270c9f.png — 1.508 kB (1,508 bytes)
90. assets/images/objects/0b824b633009ea8f7bb07751.png — 1.497 kB (1,497 bytes)
91. assets/images/objects/e907b7bf45218023676fe800.png — 1.493 kB (1,493 bytes)
92. assets/images/characters/dd3c4da2f619d55dbea87de0.png — 1.488 kB (1,488 bytes)
93. assets/images/characters/97a0d35bd9c52f403eab57ee.png — 1.483 kB (1,483 bytes)
94. assets/images/characters/35796fab24a5f8f3089b566b.png — 1.464 kB (1,464 bytes)
95. assets/images/characters/07520418baca7ca683aa4bae.png — 1.456 kB (1,456 bytes)
96. assets/images/characters/33205ecfdb28899f37fe1f00.png — 1.449 kB (1,449 bytes)
97. assets/images/objects/d6709413cb7e5e89e07deae7.png — 1.423 kB (1,423 bytes)
98. assets/images/objects/e4bf36ce123ada19e5543118.png — 1.414 kB (1,414 bytes)
99. assets/images/characters/7e92762528dd447f38919838.png — 1.410 kB (1,410 bytes)
100. assets/images/characters/fb2ec0f4e6ebb8dca939d7ed.png — 1.404 kB (1,404 bytes)
101. assets/images/characters/e54f682ee18c6e61f9f63e57.png — 1.372 kB (1,372 bytes)
102. assets/images/objects/de0e07b31ef09a4a11c0c364.png — 1.283 kB (1,283 bytes)
103. assets/images/monsters/d3dbe01a3291dad96a6a0c08.png — 1.249 kB (1,249 bytes)
104. assets/images/objects/c86adc670ec33bef30861965.png — 1.171 kB (1,171 bytes)
105. assets/images/monsters/4a69c9fb7b0386c72b362215.png — 1.103 kB (1,103 bytes)
106. assets/images/objects/89ead50704f0d16aafdc9a18.png — 1.099 kB (1,099 bytes)
107. assets/images/characters/eae47f8aa4f2b4b2506de086.png — 1.064 kB (1,064 bytes)
108. assets/images/objects/ed6039c31ae37f43314d26a9.png — 1.044 kB (1,044 bytes)
109. assets/images/characters/5aedf10b80dcf50155a876d3.png — 0.919 kB (919 bytes)
110. assets/images/characters/573e8e668ce5ccbc49cdd0a1.png — 0.891 kB (891 bytes)
111. assets/images/characters/87b09071bfacad786a37d4ee.png — 0.868 kB (868 bytes)
112. assets/images/objects/48e8c083386c0047db4dc426.png — 0.853 kB (853 bytes)
113. assets/images/objects/fd5fffbca591a759c0212134.png — 0.825 kB (825 bytes)
114. assets/images/objects/23fdc459ed0db140c58042a3.png — 0.814 kB (814 bytes)
115. assets/images/objects/f69c1be6140568ada7bf74a5.png — 0.802 kB (802 bytes)
116. assets/images/objects/0b714941fd7a1af6948ca5c7.png — 0.770 kB (770 bytes)
117. assets/images/characters/81c2f9adae4d0c87435568fe.png — 0.767 kB (767 bytes)
118. assets/images/objects/de244e53dace4bc8cd37fa5f.png — 0.767 kB (767 bytes)
119. assets/images/objects/9c01aa1e65232a7efee1e104.png — 0.751 kB (751 bytes)
120. assets/images/objects/5a2752a9f54a954b0b80b6f3.png — 0.739 kB (739 bytes)
121. assets/images/objects/fd64ef72fd42d29279a53d39.png — 0.733 kB (733 bytes)
122. assets/images/objects/5e5b7d1f4fb7273e88404c73.png — 0.718 kB (718 bytes)
123. assets/images/objects/ad4462e15bd7da46abd24e47.png — 0.703 kB (703 bytes)
124. assets/images/objects/00f2af9f69959abff5b30e07.png — 0.699 kB (699 bytes)
125. assets/images/objects/19b79fb75fdb74fe749a8ad4.png — 0.695 kB (695 bytes)
126. assets/images/characters/b2a253a6e4aed6da70a32cd4.png — 0.688 kB (688 bytes)
127. assets/images/objects/f2b2df7e7ba30cb824cec5b2.png — 0.687 kB (687 bytes)
128. assets/images/objects/5c8fa3f1fb7944d2600e6fd1.png — 0.686 kB (686 bytes)
129. assets/images/objects/3f9bbdc5ef6428c36d48baf4.png — 0.680 kB (680 bytes)
130. assets/images/objects/fa11e1d67cf554e071f2f6f3.png — 0.675 kB (675 bytes)
131. assets/images/objects/658bf10a8088aab70646a4bb.png — 0.668 kB (668 bytes)
132. assets/images/objects/c52c786fff8f9ac1eb3fe9da.png — 0.647 kB (647 bytes)
133. assets/images/characters/e59e4386a6e1f4d0d300eb07.png — 0.629 kB (629 bytes)
134. assets/images/objects/f7adb3ec6ed4d4db75053eff.png — 0.619 kB (619 bytes)
135. assets/images/characters/6669aa05960b971bc3926f78.png — 0.615 kB (615 bytes)
136. assets/images/objects/0e3d339d51a580182d35c5ce.png — 0.597 kB (597 bytes)
137. assets/images/objects/2824b9d1a56460b54a88c4cd.png — 0.584 kB (584 bytes)
138. assets/images/objects/6cb8afce37008c4d38651dd0.png — 0.584 kB (584 bytes)
139. assets/images/objects/ecc57a9997ef4eb1e0c8ee84.png — 0.581 kB (581 bytes)
140. assets/images/objects/43dc10668abbcc41042cc222.png — 0.580 kB (580 bytes)
141. assets/images/characters/fba5955fb9d9cbb29b9eceb8.png — 0.572 kB (572 bytes)
142. assets/images/characters/a1079dd8e247d8bdb5746295.png — 0.562 kB (562 bytes)
143. assets/images/objects/7110a1cbb9b1060d79199044.png — 0.561 kB (561 bytes)
144. assets/images/objects/8da9aba4039bc10515eb8e7e.png — 0.555 kB (555 bytes)
145. assets/images/objects/68f27c054773c14544714f38.png — 0.549 kB (549 bytes)
146. assets/images/objects/9ad884e2895316c238314133.png — 0.546 kB (546 bytes)
147. assets/images/objects/c5020cb9fafb0b36f1df8da7.png — 0.546 kB (546 bytes)
148. assets/images/characters/ae978470367bf7be6ab71660.png — 0.542 kB (542 bytes)
149. assets/images/characters/c98f756ff125ad67e4e15867.png — 0.537 kB (537 bytes)
150. assets/images/objects/ac0e73bdc6c6ee615e47ee01.png — 0.532 kB (532 bytes)
151. assets/images/objects/008fd9ed306fcd20b5f332be.png — 0.521 kB (521 bytes)
152. assets/images/objects/16b0fde49d1f1ae4dfdb4640.png — 0.519 kB (519 bytes)
153. assets/images/characters/ecf40cf9f2464e99022cfe37.png — 0.515 kB (515 bytes)
154. assets/images/characters/8324e0235b07120287995b49.png — 0.510 kB (510 bytes)
155. assets/images/characters/622cfc798e26eff542c7691c.png — 0.491 kB (491 bytes)
156. assets/images/objects/a7dbb552d969aeb537e5eb0a.png — 0.486 kB (486 bytes)
157. assets/images/characters/e768f7301b00c13d3cd3f33b.png — 0.479 kB (479 bytes)
158. assets/images/objects/4eefd2a16cc969ef9bde4212.png — 0.479 kB (479 bytes)
159. assets/images/characters/bd418e1734e4d9371d50bba6.png — 0.473 kB (473 bytes)
160. assets/images/characters/77c1af732bc650e21f865720.png — 0.468 kB (468 bytes)
161. assets/images/objects/6fb1959f8e21733639f0bbd8.png — 0.468 kB (468 bytes)
162. assets/images/objects/08bd930a2a401b2586ad1d86.png — 0.465 kB (465 bytes)
163. assets/images/objects/ae84b7aab2160803a087fe2e.png — 0.461 kB (461 bytes)
164. assets/images/characters/a95d3a573ac30147781de9cb.png — 0.455 kB (455 bytes)
165. assets/images/objects/633c7288668a1003fe92f8d6.png — 0.455 kB (455 bytes)
166. assets/images/objects/b5479ee7e98a190414e6198f.png — 0.454 kB (454 bytes)
167. assets/images/objects/cdbf18a2c8076753ab60fa1a.png — 0.453 kB (453 bytes)
168. assets/images/objects/41fc4695315b537b478069db.png — 0.452 kB (452 bytes)
169. assets/images/objects/242e28e90611b547d19c2320.png — 0.450 kB (450 bytes)
170. assets/images/objects/ebcfdbf332c8b12e0f8bb677.png — 0.450 kB (450 bytes)
171. assets/images/characters/c5589b4b45d66372c65e38f6.png — 0.447 kB (447 bytes)
172. assets/images/objects/8d07f6f457888eb71b181e27.png — 0.444 kB (444 bytes)
173. assets/images/objects/9e3f7eeda3719a2b5a99d5e2.png — 0.442 kB (442 bytes)
174. assets/images/objects/963446d43da9f96af1479599.png — 0.438 kB (438 bytes)
175. assets/images/objects/f09893b8122a937ff86cc3e7.png — 0.435 kB (435 bytes)
176. assets/images/characters/8424864d880755d83ad6430a.png — 0.434 kB (434 bytes)
177. assets/images/characters/c8e2602f1b7587653e7a8995.png — 0.433 kB (433 bytes)
178. assets/images/objects/3411469d283a5d7d70266cbc.png — 0.430 kB (430 bytes)
179. assets/images/objects/4cef6aa041ebfff20a08968f.png — 0.422 kB (422 bytes)
180. assets/images/objects/30a91abdcaad831cdfb92209.png — 0.414 kB (414 bytes)
181. assets/images/objects/d64a304ddcbc70a6d038a175.png — 0.414 kB (414 bytes)
182. assets/images/objects/25c491303656a580e6eafc43.png — 0.409 kB (409 bytes)
183. assets/images/objects/5f584616cc27e4b3487efa42.png — 0.404 kB (404 bytes)
184. assets/images/objects/402809f781a7e0d73a5b86b5.png — 0.398 kB (398 bytes)
185. assets/images/objects/c03595cf864d98a24ca023aa.png — 0.397 kB (397 bytes)
186. assets/images/objects/33008342c883aa113e5a75c7.png — 0.396 kB (396 bytes)
187. assets/images/objects/89eb5679d816d7fd36ae1404.png — 0.393 kB (393 bytes)
188. assets/images/characters/c3732e53a04be7961a151e57.png — 0.391 kB (391 bytes)
189. assets/images/objects/72dbb9787b0f02ae12904c9a.png — 0.389 kB (389 bytes)
190. assets/images/objects/01ce91b80448f86dd2fd5856.png — 0.388 kB (388 bytes)
191. assets/images/objects/7b727e5c8a2d545bd1f48c81.png — 0.386 kB (386 bytes)
192. assets/images/objects/cc14075db4237ba257dd6e08.png — 0.386 kB (386 bytes)
193. assets/images/objects/d4a04cf5d60ceb3463a892b4.png — 0.385 kB (385 bytes)
194. assets/images/objects/63736620fffbca56bae076b5.png — 0.381 kB (381 bytes)
195. assets/images/objects/27329068d9d1ebd3bced1c3b.png — 0.380 kB (380 bytes)
196. assets/images/objects/98ddeff041f41b6f3905d806.png — 0.377 kB (377 bytes)
197. assets/images/characters/ab6287fd41c7fa140366c21f.png — 0.376 kB (376 bytes)
198. assets/images/objects/edc5a4c8b3c8648f7244f2e0.png — 0.376 kB (376 bytes)
199. assets/images/objects/7eea05e472b77b908dbe25ea.png — 0.375 kB (375 bytes)
200. assets/images/objects/f3f98ae6d12f24f26ce552fa.png — 0.372 kB (372 bytes)
201. assets/images/objects/063d3362e236f06aa24bfeca.png — 0.370 kB (370 bytes)
202. assets/images/objects/5e505d9bd69fb9116b84933e.png — 0.369 kB (369 bytes)
203. assets/images/objects/a62203945f67d17d1eb92a26.png — 0.366 kB (366 bytes)
204. assets/images/characters/2149b2ea7d41fee17f7b6e23.png — 0.364 kB (364 bytes)
205. assets/images/objects/b5fdb66066716bdd40ecfaaa.png — 0.364 kB (364 bytes)
206. assets/images/objects/eba411cd39c9f5a355a3d801.png — 0.361 kB (361 bytes)
207. assets/images/objects/f0a9a9164fa115a93a775957.png — 0.354 kB (354 bytes)
208. assets/images/objects/1fc99689bdd804d21bc0a79b.png — 0.347 kB (347 bytes)
209. assets/images/objects/5d0b670a5448ddc1501f9c7f.png — 0.347 kB (347 bytes)
210. assets/images/objects/bf3bb5a859c0ffb98f0988af.png — 0.346 kB (346 bytes)
211. assets/images/objects/eacb9173dfbf69788d0e658c.png — 0.345 kB (345 bytes)
212. assets/images/objects/0bc2025a2949790b5563058d.png — 0.344 kB (344 bytes)
213. assets/images/objects/178d86e7fe84bf56ecf5ba31.png — 0.341 kB (341 bytes)
214. assets/images/characters/2f694ba3b64e1e7fce144366.png — 0.339 kB (339 bytes)
215. assets/images/objects/b911605a0856d5026e889f24.png — 0.320 kB (320 bytes)
216. assets/images/objects/217fbc097cee28b3be58fe21.png — 0.312 kB (312 bytes)
217. assets/images/objects/5085d9e4d606377603735b54.png — 0.304 kB (304 bytes)
218. assets/images/objects/b2b39dea9f18f567758e81de.png — 0.302 kB (302 bytes)
219. assets/images/objects/5e3c41aec4020d4caa2e43da.png — 0.292 kB (292 bytes)
220. assets/images/objects/242ff6e7fe2511b929672b87.png — 0.291 kB (291 bytes)
221. assets/images/objects/691f40dfd2dc11905778bf6c.png — 0.289 kB (289 bytes)
222. assets/images/objects/f094d8ae23cfa512111026a8.png — 0.289 kB (289 bytes)
223. assets/images/objects/fc3f30d8a1466eb0a7ee8733.png — 0.289 kB (289 bytes)
224. assets/images/characters/30bb90e99a6e6fdb980a5dfc.png — 0.280 kB (280 bytes)
225. assets/images/objects/865ea1e453427779fe270499.png — 0.278 kB (278 bytes)
226. assets/images/objects/9795b4b12c83289d2421920b.png — 0.276 kB (276 bytes)
227. assets/images/objects/2643dcd7b6500aedda9810d8.png — 0.267 kB (267 bytes)
228. assets/images/objects/244f656ed2f745144a5921b3.png — 0.266 kB (266 bytes)
229. assets/images/objects/e72a41035ff70ff86d7addaf.png — 0.263 kB (263 bytes)
230. assets/images/objects/6ddce2e72ea0c449df510559.png — 0.250 kB (250 bytes)
231. assets/images/objects/9a1d2d350cfda29256dd028d.png — 0.247 kB (247 bytes)
232. assets/images/objects/c3bb2f75e3c06e4477e1afb1.png — 0.218 kB (218 bytes)
233. assets/images/objects/1121d6201c2bd82d994a5b7d.png — 0.192 kB (192 bytes)
