# Eco Chronicle 정적 웹 배포용 R43

기능·디자인 변경 없이 단일 HTML을 외부 이미지/CSS/일반 JS로 분리한 프로젝트입니다.

## GitHub Pages에 올리기

1. eco-chronicle-pages.zip을 압축 해제합니다. ZIP 파일 자체를 업로드하지 않습니다.
2. 내용 전체를 GitHub 저장소 루트에 넣습니다. index.html과 assets, css, js가 같은 위치에 있어야 합니다.
3. 파일이 700개 이상이므로 GitHub Desktop으로 커밋·푸시하면 폴더 구조를 보존하기 편합니다. 웹 업로드는 파일 수를 나눠 진행하세요.
4. Settings → Pages → Build and deployment에서 Deploy from a branch, main, /(root)를 선택하고 저장합니다. 다른 기본 브랜치라면 해당 브랜치를 고릅니다.
5. GitHub에 표시된 사이트 주소를 엽니다. 이후 같은 주소에 수정 사항을 반영하려면 같은 저장소/브랜치를 업데이트합니다.

별도 빌드 명령, API 키, 데이터베이스, Node 서버는 필요 없습니다. 제공된 .nojekyll 파일도 유지하세요. 원본 백업 ZIP은 보관용이며 배포 저장소에 올리지 마세요. 실제 GitHub 배포는 이번 작업에 포함하지 않았습니다.

## 로컬 확인

이 폴더에서 python -m http.server 8000을 실행한 뒤 http://localhost:8000/을 엽니다. 이는 개발 중 확인용으로, 실제 호스팅에 Python이 필요한 것은 아닙니다. 파일 더블클릭 방식은 Canvas 색상 변경 및 저장 공간의 브라우저별 차이가 있어 HTTP(S)로 확인하세요. index.html만 단독 이동하면 실행되지 않습니다.

## 구조

- css/style.css: 원본 스타일 전체
- js/: 일반 스크립트 17개. index.html의 순서를 유지하고 임의로 async나 type=module을 추가하지 마세요.
- js/game.js: 전역 의존성이 많은 기존 엔진을 보존했습니다. 저장/이동/장비 등을 무리하게 재분할하지 않았습니다.
- js/encounters.js, minigame.js, battle-view.js: 진행 구조/미니게임/전투 화면
- js/audio-data.js: 기존 Web Audio 합성 악보와 효과음 데이터
- assets/images/: 원본 바이트의 이미지 751개. 동일 데이터는 해시 파일 하나를 공유합니다.
- asset-manifest.json: 파일 해시, 크기, 경로, 참조 수, 스크립트 순서
- docs/STRUCTURE_REPORT.md: 변경 내역, 크기, 구조, 검증 및 제한
- docs/SAVE_COMPATIBILITY.md: 저장 호환성
- docs/TEST_RESULTS.json: 실제 Chromium 검증 요약

원본에 있던 대체 그림과 불확실한 리소스는 삭제하지 않았습니다. 게임 데이터 식별자와 저장 키는 그대로입니다.

공식 안내:
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
