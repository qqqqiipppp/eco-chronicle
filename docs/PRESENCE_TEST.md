# 테마별 Presence 구현 및 검증

검증일: 2026-09-24 (한국 시간)

## 이번 변경

- 신규 `js/presence.js`: 테마별 Presence 참가/퇴장, 접속자 목록 및 오류 처리.
- 수정 `index.html`: 기존 Supabase 초기화 다음에 `presence.js`를 불러오는 한 줄 추가.
- 신규 `docs/PRESENCE_TEST.md`: 이 보고서.

앞 단계에서 만들어 둔 `js/supabase.js`와 Supabase CDN 연결은 그대로 사용한다. 기존 게임 JS/CSS, UI 내부 구조, 전투/미니게임 로직, 리소스, 세이브 키 및 저장 구조는 변경하지 않았다. Git에 아직 커밋되지 않은 이전 Supabase 연결 작업도 그대로 보존했다.

## 동작

| 현재 테마 | Presence 채널 |
|---|---|
| forest | eco-forest |
| river | eco-river |
| ocean | eco-ocean |
| city | eco-city |
| air | eco-air |
| climate | eco-climate |

각 페이지는 암호학적 난수로 임시 playerId를 생성한다. 메모리에만 유지하므로 새로고침하면 바뀌며, 같은 저장 캐릭터를 두 탭에서 열어도 ID를 공유하지 않는다. 닉네임은 기존 게임 이름을 읽고, 이름을 정하기 전에는 `여행자-임시ID앞8자리`를 사용한다. 로그인이나 인증된 신원은 아니다.

게임의 `S.themeId`와 `S.name`만 500ms마다 읽는다. 게임 상태에 새 필드를 넣거나 저장하지 않는다. 변동이 없으면 Presence track을 반복 전송하지 않는다. 시작 화면도 기본 forest 상태이므로 임시 닉네임으로 참가한다. 지도/가방을 열거나 같은 테마 내 전투·미니게임으로 들어가는 것은 퇴장으로 취급하지 않는다. 백그라운드 탭도 접속 상태를 유지한다.

Presence에 올리는 애플리케이션 필드는 다음 네 가지뿐이다.

```text
playerId
nickname
theme
joinedAt
```

joinedAt은 해당 채널에 입장한 ISO 시각이다. 구독 성공 후 track하며, SDK가 연결을 복구해 다시 SUBSCRIBED가 되면 다시 track한다. sync 때 최종 Presence 상태를 읽고 playerId 기준으로 중복을 제거한다. 테마가 다른 메타데이터는 표시하지 않는다.

테마 이동 시 기존 세션을 비활성화하고 untrack/removeChannel 후 최신 테마로 참가한다. 이전 채널의 늦은 콜백이 새 채널 상태를 덮어쓰지 않도록 세션을 구분했다. 탭 종료·페이지 이동의 pagehide에서 퇴장하고, 페이지 캐시에서 돌아오는 pageshow는 다시 참가한다. 브라우저 강제 종료나 네트워크 단절은 서버가 연결 종료를 감지하기까지 표시 제거가 지연될 수 있다.

## 콘솔과 디버그 표시

실제 콘솔에서 확인한 예:

```text
[Presence] joined eco-forest
[Presence] online players: 2 (eco-forest)
[Presence] Presence A
[Presence] Presence B
[Presence] leaving eco-forest
[Presence] joined eco-river
[Presence] online players: 1 (eco-river)
[Presence] Presence B
```

화면 오른쪽 위에 작은 `접속 디버그` 패널을 추가했다. 게임의 screen 바깥에 별도로 생성하므로 기존 화면 재렌더링과 분리된다. 포인터 입력을 받지 않아 게임 조작을 가로채지 않는다. 최대 높이가 제한되어 많은 접속자는 패널에서 잘릴 수 있지만 콘솔에는 전체 목록을 출력한다. 이름은 HTML이 아닌 textContent로 표시한다.

## 실제 두 클라이언트 검사

앱 내 브라우저 탭 두 개를 동시에 열어 실제 Supabase Realtime에 연결했다. 서로 다른 브라우저 엔진/기기 간 교차 검증은 하지 않았다.

임시 로컬 서버에서만 `Presence A`, `Presence B`라는 메모리 전용 Lv.5 테스트 캐릭터를 준비했다. 기존 테마 이동 UI로 강에 진입할 수 있도록 한 테스트 초기 상태이며, 프로젝트 파일에 테스트 분기를 추가하지 않았다. 두 캐릭터의 세이브 코드는 비워 기존 저장을 덮어쓰지 않았다. 닉네임 이외의 레벨·경험치·게임 상태를 Presence로 공유하지 않았다.

| 검사 | 관찰 결과 |
|---|---|
| 두 탭의 forest 접속 | 양쪽 모두 `eco-forest / 온라인 2명` |
| 닉네임 상호 표시 | A 화면에 `Presence A (나), Presence B`; B 화면에 `Presence A, Presence B (나)` |
| B의 기존 지도 UI에서 강으로 이동 | A의 forest에는 A만 1명; B는 eco-river에서 B만 1명 |
| B의 기존 지도 UI에서 숲으로 복귀 | A의 forest 목록에 A/B 2명 재표시 |
| B 탭 종료 | A의 forest 목록에서 B 제거, A만 1명 |
| 정상 연결 중 A의 콘솔 오류/경고 | 0개 |
| 작은 디버그 UI | 실제 스크린샷으로 월드/HUD와 함께 표시 확인 |
| Supabase CDN 미로드 | 게임 월드 진입 유지, `연결 불가 · 게임은 계속 가능` 표시 |
| CDN 미로드 상태의 키보드 이동 | hero left 298px → 317px 변화 |
| CDN 미로드 상태의 가방 | 기존 가방 정상 표시 |

CDN 실패는 임시 서버 응답에서만 CDN 태그를 제외해 재현했다. 프로젝트 CDN 설정은 바꾸지 않았다. 이때 이전 Supabase 초기화 파일의 예상 오류 로그는 출력되지만 게임은 계속 작동한다.

## 추가 모의 검사

실제 presence.js를 메모리 내 JavaScript 컨텍스트에서 실행해 아래 11개 검사를 통과했다.

1. track 페이로드가 허용된 네 필드만 포함.
2. Presence key와 임시 playerId 일치.
3. 상태가 같으면 polling만으로 추가 track이 발생하지 않음.
4. 닉네임 변경 시 재전송.
5. 퇴장 대기 중 river → ocean으로 바뀌면 최신 ocean만 참가.
6. 이전 채널의 늦은 SUBSCRIBED 콜백이 재참가하지 않음.
7. 기존 채널 제거 후 새 테마 참가.
8. 중복 playerId 및 다른 테마 메타데이터 분리.
9. pagehide에서 채널 제거.
10. pageshow에서 재참가.
11. 게임 상태 객체에 새 필드를 추가하지 않음.

`node --check js/presence.js` 및 `git diff --check` 통과. 기존 game.js/CSS/assets/asset-manifest에는 이번 변경이 없다. 전투·미니게임의 전체 회귀 플레이, 실제 네트워크 단절/강제 프로세스 종료, 별도 기기 간 접속은 이번에 검사하지 않았다.

## 범위

Broadcast, 캐릭터 표시, 좌표 동기화, remotePlayers, DB 테이블/데이터 변경, Auth, 레벨·장비·퀘스트 공유는 구현하지 않았다. Supabase 대시보드 설정이나 접근 정책도 변경하지 않았다. 기존 공개 채널 설정으로 테스트가 성공했다. 커밋·푸시·배포는 수행하지 않았다.

참고: [Supabase Presence 공식 문서](https://supabase.com/docs/guides/realtime/presence), [removeChannel](https://supabase.com/docs/reference/javascript/removechannel).
