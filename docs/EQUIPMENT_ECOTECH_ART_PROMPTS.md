# 장비·생태기술 이미지 제작 기록

작성일: 2026-09-29

내장 `image_gen` 도구로 계열별 소형 투명 PNG 시트와 장소별 닫힘/열림 그림을 제작했습니다. 기존 본편/NPC/환경 오브젝트/플로킹 그래픽을 시각 참고로 사용했습니다. 전설 장비는 투명 여백과 배치를 다시 정리한 최종 편집본을 사용했습니다.

게임에는 개별 PNG 49개만 저장했습니다. SVG로 새 물건을 그리거나 코드로 배경을 지우지 않았습니다. 준비 과정은 원본 alpha를 유지한 자르기·크기 조정·PNG 압축입니다.

최종 저장 위치: `assets/images/gear/` 25개, `assets/images/ecotech/` 8개, `assets/images/ecotech/areas/` 16개. 전체 목록과 검증은 [완료 보고서](EQUIPMENT_ECOTECH_VISUAL_REWORK.md)에 있습니다.

생성 원본 폴더: `C:/Users/guppy/.codex/generated_images/01a0cdcd-d956-7802-8a19-58ad2a99a8f3/`. 원본 시트는 게임에서 로드하지 않습니다.

## 수거 도구 6종

원본: `exec-b1bf90ed-5f30-432f-a74d-9b8f5e9e368b.png`

아래는 최초 제작 지시의 구성 요약이며 원문 프롬프트 복사본은 아닙니다. 3×2 소형 투명 시트에 집게(긴 금속 몸체·주황 손잡이·끝 집게), 갈퀴(목재 자루·여러 갈래), 뜰채(타원형 망·자루), 삽(D형 손잡이·날), 수거망(깊은 망·프레임·손잡이), 고압세척기(황색 본체·바퀴·호스·분사건)를 서로 떨어뜨려 제작했습니다. 본편과 같은 따뜻한 픽셀 RPG 윤곽, 단계별 명암, 읽을 수 있는 실루엣, 실제 alpha 배경을 지정했습니다.

## 기록된 최종 프롬프트

### 방호복 5종

원본: `exec-27e650c2-626e-43b0-a628-1e4899ef83c3.png`

```text
Use case: stylized-concept. ONE small family inventory sprite atlas for Eco Chronicle, warm children's environmental pixel RPG. Genuinely transparent alpha background. Crisp hand-pixelled edges with dark brown/olive outlines, 4-6 stepped shade levels, warm top-left highlights, dense material details readable at 64-96px. Match the attached EXISTING GAME reference: human NPCs, pine trees, rocks and gentle monsters. Not vector, emoji, photo, modern app icon or simple pictogram. Equal square grid cells, objects centered entirely within their own cells with empty gutters, no text/labels/borders/pedestals. Every object distinct and structurally correct. Exactly FIVE protective clothing items in 3 columns × 2 rows on a wide 3:2 canvas; sixth bottom-right cell completely blank transparent. Top-left: navy canvas WORK OVERALLS, sleeves, collar, pockets, knees and small tan stitching. Top-center: orange fluorescent SAFETY VEST, sleeveless, front opening, distinct broad pale reflective stripes and buckle. Top-right: dark teal WATERPROOF WADERS, chest bib, suspenders, rubber shin boots visibly connected, folded waterproof sheen. Bottom-left: cream-gray basic PROTECTIVE COVERALL, full sleeves and trousers, front zip, hood lying folded, simple gloves no respirator. Bottom-center: pale yellow CHEMICAL PROTECTION HOODED FULL-BODY SUIT, enclosed hood with round transparent face visor, sealed zip, green attached chemical gloves and heavy integrated boots; clearly bulkier enclosed silhouette than basic coverall. No mannequin faces, no body inside, garments only, no fantasy armor.
```

### 머리 보호구 4종

원본: `exec-19ccd34a-eba1-4e20-988f-31449e615803.png`

```text
Use case: stylized-concept. ONE small family inventory sprite atlas for Eco Chronicle, warm children's environmental pixel RPG. Genuinely transparent alpha background. Crisp hand-pixelled edges with dark brown/olive outlines, 4-6 stepped shade levels, warm top-left highlights, dense material details readable at 64-96px. Match the attached EXISTING GAME reference: human NPCs, pine trees, rocks and gentle monsters. Not vector, emoji, photo, modern app icon or simple pictogram. Equal square grid cells, objects centered entirely within their own cells with empty gutters, no text/labels/borders/pedestals. Every object distinct and structurally correct. Exactly FOUR head safety items in 2 columns × 2 rows. Top-left: yellow CONSTRUCTION HARD HAT with rim, top rib, inner headband seen at lower edge, no face. Top-right: clear wraparound SAFETY GOGGLES with two connected transparent lenses, blue frame, elastic strap curving behind, no face. Bottom-left: off-white cup-shaped PARTICULATE DUST RESPIRATOR MASK, nose clip, soft rim, two elastic head straps, no gas canisters. Bottom-right: charcoal-green HALF-FACE GAS RESPIRATOR, molded rubber central mask, two large circular replaceable side FILTER CARTRIDGES in dusty tan, straps, center exhale valve. Readable distinction goggles/mask/gas filters. No medieval helmets.
```

### 신발 4종

원본: `exec-9fb5e0e2-633a-45f1-8d9b-c402238d4821.png`

```text
Use case: stylized-concept. ONE small family inventory sprite atlas for Eco Chronicle, warm children's environmental pixel RPG. Genuinely transparent alpha background. Crisp hand-pixelled edges with dark brown/olive outlines, 4-6 stepped shade levels, warm top-left highlights, dense material details readable at 64-96px. Match the attached EXISTING GAME reference: human NPCs, pine trees, rocks and gentle monsters. Not vector, emoji, photo, modern app icon or simple pictogram. Equal square grid cells, objects centered entirely within their own cells with empty gutters, no text/labels/borders/pedestals. Every object distinct and structurally correct. Exactly FOUR different pairs of work footwear, each pair fully isolated in one cell of a 2 columns × 2 rows grid. Top-left: brown HIKING BOOTS ankle height, clear crisscross laces, padded cuff, deep sole tread. Top-right: dark forest green WATER RUBBER BOOTS mid-calf tall, smooth waterproof uppers, pale rolled top lip, short practical soles. Bottom-left: charcoal and ochre WORK SAFETY SHOES ankle-low, protective reinforced silver-gray toe cap, laces, broad sturdy sole, visibly shorter than boots. Bottom-right: muted yellow and dark navy ELECTRICALLY INSULATING BOOTS knee tall, seamless rubber uppers, thick layered insulating sole and blue cuff, no metallic parts. Slight 3/4 perspective showing toe and side; warm shading. No sneakers or plate armor.
```

### 전설 환경 장비 6종 최종 재배치

원본: `exec-866d8f30-cf5f-4474-8fee-2875edb042b3.png`

```text
Use case: precise-object-edit. Edit reference Image1 (the existing six legendary environmental equipment sprites) ONLY to fix atlas layout and separation. KEEP all six exact equipment silhouettes/details/colors/pixel shading: dredger, oil skimmer, waste compactor, powered respirator hood+blower, floating oil boom, solar lantern+panel. Re-layout on a wide3:2 transparent canvas with a STRICT3columns×2rows of equal SQUARE cells (1536x1024total,512x512each). Every full multipart icon must be scaled to fit within its own CENTRAL360x360 area with at least70 pixels fully transparent margin on each of4sides. Very strict: no part of a handle/hose/boom/bucket crosses its cell boundary. Grid row1 L1/L2/L3;row2 L4/L5/L6. No lines, labels, colored backdrop, cropped parts or added object. Genuine transparent alpha throughout gutters. Reference Image2 is only game style, preserve Image1artwork identity. Do not draw any of the other existing game assets.
```

### 생태기술 1군

원본: `exec-a6f9caef-3311-4a58-9106-6f7bf92e57ee.png`

```text
Use case: stylized-concept. ONE small family inventory sprite atlas for Eco Chronicle, warm children's environmental pixel RPG. Genuinely transparent alpha background. Crisp hand-pixelled edges with dark brown/olive outlines, 4-6 stepped shade levels, warm top-left highlights, dense material details readable at 64-96px. Match attached EXISTING GAME reference. Equal square grid cells, objects centered entirely within their own cells with empty gutters. NO text/labels/borders/pedestals. Each silhouette structurally correct and very distinct, not vector/emoji/photo/minimal symbol, no fantasy weapons. Exactly FOUR portable ecological investigation tools in 2 columns ×2 rows. Top-left: SOIL pH METER, olive-yellow small handheld rectangular display connected by a short curled cord to a long narrow stainless insertion PROBE, include a tiny loose brown earth clod next to probe tip, green numeric-like display WITHOUT readable text. Top-right: WATER QUALITY TEST METER, teal compact digital reader with broad dark display and slender testing stem, a separate small transparent water SAMPLE VIAL with blue water and cap, visually different from soil unit. Bottom-left: OIL ABSORBENT MATERIAL, two folded soft white rectangular absorbent PADS showing fiber thickness, one white cylindrical absorbent sock/boom in slight curved U, tiny dark amber absorbed patch on one pad, not cleaning sponge on stick. Bottom-right: HAND-CRANK GENERATOR, moss-green rugged small box with prominent metal crank arm and red round handle on side, copper output terminal and coiled short charging lead. Tool only no room. Correct functional shapes, no labels.
```

### 생태기술 2군

원본: `exec-7662a8b8-3aa5-442a-b6e5-cea05666b3b0.png`

```text
Use case: stylized-concept. ONE small family inventory sprite atlas for Eco Chronicle, warm children's environmental pixel RPG. Genuinely transparent alpha background. Crisp hand-pixelled edges with dark brown/olive outlines, 4-6 stepped shade levels, warm top-left highlights, dense material details readable at 64-96px. Match attached EXISTING GAME reference. Equal square grid cells, objects centered entirely within their own cells with empty gutters. NO text/labels/borders/pedestals. Each silhouette structurally correct and very distinct, not vector/emoji/photo/minimal symbol, no fantasy weapons. Exactly FOUR portable ecological tools in 2 columns ×2 rows. Top-left: PARTICULATE AIR METER, warm gray compact handheld device with broad air-intake grill at top, clear tiny green display below, orange side grip, two small vent holes; no phone-app symbols. Top-right: PORTABLE SOLAR CHARGER, THREE hinged small blue solar panels folding like a book, cell grid readable, short USB-like lead to small moss-green battery pack, no lantern. Bottom-left: PORTABLE WATER FILTER, handheld olive cylindrical pump/filter with charcoal pump handle on top, translucent intake hose curving to a small blue water sample and clean output hose into a separate transparent sample bottle, clearly connected filter parts, no water landscape. Bottom-right: THERMAL IMAGING CAMERA, rugged dark-green L-shaped pistol grip instrument, prominent round black infrared lens, rear small SCREEN displaying orange-red-purple stepped heat color patches, brass buttons, no photographic UI labels. All4 recognizable real educational tools. NO backgrounds, font, symbols or extra objects.
```

### 숲 조사 구역

원본: `exec-cc43f2b5-344a-47e8-b7de-903688100b9d.png`

```text
Use case: stylized-concept. Production 2D WORLD SPRITE asset for Eco Chronicle. Use reference ONLY for the warm round hand-pixelled RPG art, thick dark brown/teal outlines, 3-5 stepped shades, soft top-left daylight, small short soft contact shadows under props. Create ONE SMALL TWO-STATE sprite strip: TWO EQUAL SQUARE CELLS horizontally, left CLOSED, right OPEN, identical camera, object positions, scale, footprint and landform; only entry/status detail changes. Real transparent alpha OUTSIDE irregular ground edges AND between cells. Every cell is a small walkable optional place seen at slightly elevated RPG top-down 3/4 angle, NOT an isometric diamond, not a building roof hiding the interior. At final 240x220px it must read clearly alongside an 88px human sprite. Keep middle and center-right interior empty enough for a character and existing investigation marker. Edges made of separate rounded props, never a rectangle, geometric rim, square fence, four identical walls, UI card or flat SVG. No characters, no text/labels/map border/magic barrier/icon badges. Keep a SOUTH ENTRY at BOTTOM CENTER covering the middle40% of width; do not move entry between states. Top/left/right and bottom-corner obstacles roughly follow the square LOGICAL footprint but irregular ground and foliage disguise its shape. Location: secret forest vegetation survey nook. Warm ochre soil broken by leaf litter, one small rounded leafy tree at upper-left, smaller pine and root at upper-right, uneven mossy rocks and fern bushes along sides, short old log lower-left and shrub lower-right. Scattered damaged cracked soil stays damaged in BOTH states. A meandering dirt footpath enters at bottom-center and ends in clear middle/right. CLOSED left: modest two short stakes with a low tan survey ribbon across south entry, worn uncertain trail, no directional sign. OPEN right: ribbon rolled onto side stake leaving middle40% completely clear, three subtle bootprint pairs and small wooden direction stake identify surveyed path; small soil sample at edge. NO planted instant-regrowth. Same exact scene in two cells; only entry ribbon and prints changed.
```

### 수변 관찰 구역

원본: `exec-07de4ae8-d37f-4c7e-9344-de4d3b9e3dfc.png`

```text
Use case: stylized-concept. Production 2D WORLD SPRITE asset for Eco Chronicle. Use reference ONLY for the warm round hand-pixelled RPG art, thick dark brown/teal outlines, 3-5 stepped shades, soft top-left daylight, small short soft contact shadows under props. Create ONE SMALL TWO-STATE sprite strip: TWO EQUAL SQUARE CELLS horizontally, left CLOSED, right OPEN, identical camera, object positions, scale, footprint and landform; only entry/status detail changes. Real transparent alpha OUTSIDE irregular ground edges AND between cells. Every cell is a small walkable optional place seen at slightly elevated RPG top-down 3/4 angle, NOT an isometric diamond, not a building roof hiding the interior. At final 240x220px it must read clearly alongside an 88px human sprite. Keep middle and center-right interior empty enough for a character and existing investigation marker. Edges made of separate rounded props, never a rectangle, geometric rim, square fence, four identical walls, UI card or flat SVG. No characters, no text/labels/map border/magic barrier/icon badges. Keep a SOUTH ENTRY at BOTTOM CENTER covering the middle40% of width; do not move entry between states. Top/left/right and bottom-corner obstacles roughly follow the square LOGICAL footprint but irregular ground and foliage disguise its shape. Location: riverside observation passage. Irregular muted green and cream wet ground, a shallow curving bluish-gray water ribbon at upper-left/back, gray pebbles and lively cattail reeds along sides, wetland plants, a short weathered wooden observation deck entering from bottom-center and curving to empty center-right. NO complete boardwalk rectangle or fence enclosure. CLOSED left: muddy brown tint in water persists, tall reeds crowd entrance edges, low small rope across south access and unmarked planks. OPEN right: exact same cloudy water/reeds unchanged, access rope tied off to side, pale marked plank footsteps and short survey stake point into clear deck. No magical water purification, characters or written signs. Real alpha beyond irregular grass/river edge.
```

### 해안 조사 구역

원본: `exec-e4b6a855-d09b-410d-bf29-12ff02df1223.png`

```text
Use case: stylized-concept. Production 2D WORLD SPRITE asset for Eco Chronicle. Use reference ONLY for the warm round hand-pixelled RPG art, thick dark brown/teal outlines, 3-5 stepped shades, soft top-left daylight, small short soft contact shadows under props. Create ONE SMALL TWO-STATE sprite strip: TWO EQUAL SQUARE CELLS horizontally, left CLOSED, right OPEN, identical camera, object positions, scale, footprint and landform; only entry/status detail changes. Real transparent alpha OUTSIDE irregular ground edges AND between cells. Every cell is a small walkable optional place seen at slightly elevated RPG top-down 3/4 angle, NOT an isometric diamond, not a building roof hiding the interior. At final 240x220px it must read clearly alongside an 88px human sprite. Keep middle and center-right interior empty enough for a character and existing investigation marker. Edges made of separate rounded props, never a rectangle, geometric rim, square fence, four identical walls, UI card or flat SVG. No characters, no text/labels/map border/magic barrier/icon badges. Keep a SOUTH ENTRY at BOTTOM CENTER covering the middle40% of width; do not move entry between states. Top/left/right and bottom-corner obstacles roughly follow the square LOGICAL footprint but irregular ground and foliage disguise its shape. Location: oil-polluted beach restoration survey nook. Rounded blue-teal coastal rocks at upper corners and sides, irregular warm pale sand and a slender crescent of shallow muted aqua water at upper-left, tiny shells and seaweed. A small natural sandy entry from bottom-center into clear center/right, never a framed room. CLOSED left: irregular black/umber oil smear across south entry and nearby shore, small violet/copper oily edge glints, thin contaminated streaks, gray sample crate at right. OPEN right: SAME rocks/sand/water geometry, south entry now MOSTLY cleared with small residual oil marks remaining by side rock, used white absorbent pads stained brown stacked in open collection pail, one rolled absorbent sock near shore, clear sandy bootprints. No complete pristine beach, no magical glow or arrows above ground. Entry width40% remains visually traversable. Include short contact shadows under rocks and pail.
```

### 도시 조사실

원본: `exec-6ca2545f-fd03-4143-9d63-a199cec7ba1a.png`

```text
Use case: stylized-concept. Production transparent WORLD SPRITE for Eco Chronicle. Match existing supplied warm round dense hand-pixelled RPG reference: dark brown/teal outline, 3-5 stepped shades, daylight top-left, short subtle ground shadows. ONE SMALL TWO-STATE strip, TWO equal square cells horizontally LEFT closed/RIGHT open, identical camera, geometry, scale, prop positions. Genuine transparent alpha outside irregular edges and between cells. View slightly elevated top-down 3/4, not isometric diamond, no roof over walkable area. Final240x220or200x190 pixels beside88px human. Center and center-right must be clear walkable space. South bottom-center40% width is the exact entry in both states. No characters/text/labels/UI badge/modern signage/neon/magic/rectangular boundary. Different height objects along edges disguise rectangular logical footprint. Location urban environmental investigation annex. NOT a square test pen. Small CUTAWAY warm gray stone/cream-brick workshop wing with partial high back wall with gently sloped blue-gray roof eave only at rear, visible floor, short return wall at left, right side machinery alcove. Irregular city paving tiles and little weeds beyond edges. Cable runs down left wall to low green electrical cabinet, environmental instrument panel mounted high rear-right. Door frame sits south bottom-center, floor beyond is empty. LEFT: two dark green door leaves CLOSED, cabinet lamp dark, panel screen dark. RIGHT: SAME twin leaves OPEN swung to each side leaving central40% entry clear, small olive-green indicator lamp on, pale cream panel screen lit with simple pixel data lines NO text; floor cable same. The cutaway floor and sidewall architecture makes an actual enterable room without solid roof or massive facade hiding the character. Short soft shadows beneath wall, meter and door.
```

### 바람길 관찰 지점

원본: `exec-4e9f1bae-331f-4132-a3ee-cdb8db13a81f.png`

```text
Use case: stylized-concept. Production transparent WORLD SPRITE for Eco Chronicle. Match existing supplied warm round dense hand-pixelled RPG reference: dark brown/teal outline, 3-5 stepped shades, daylight top-left, short subtle ground shadows. ONE SMALL TWO-STATE strip, TWO equal square cells horizontally LEFT closed/RIGHT open, identical camera, geometry, scale, prop positions. Genuine transparent alpha outside irregular edges and between cells. View slightly elevated top-down 3/4, not isometric diamond, no roof over walkable area. Final240x220or200x190 pixels beside88px human. Center and center-right must be clear walkable space. South bottom-center40% width is the exact entry in both states. No characters/text/labels/UI badge/modern signage/neon/magic/rectangular boundary. Different height objects along edges disguise rectangular logical footprint. Location open-air wind observation clearing, NO room walls or fence. Muted sandy-gray ground with scattered green wind-bent grasses, short weathered stone fragments and low planter blocks at far corners, two small wind-monitor posts to sides, rear wind direction vane, one thin pale gray-blue smog ribbon over FAR TOP only, not covering the walkable middle. CLOSED left: small low survey cord between side posts at south entry, wind indicator flag relaxed/ambiguous, no directional path. OPEN right: exact smog STILL PRESENT, cord tied off leaving central40%clear, cream cloth observation flag pointing to right, small wooden direction stake and subtle pale bootprint path into middle. Low plants and stone clutter form irregular edge, no square outline, large smoke layer, futuristic fan, UI symbols or arrows floating overhead.
```

### 재생에너지 관측 지점

원본: `exec-0e5e6979-71c4-4fc2-a5b9-a8a2cb9f2118.png`

```text
Use case: stylized-concept. Production transparent WORLD SPRITE for Eco Chronicle. Match existing supplied warm round dense hand-pixelled RPG reference: dark brown/teal outline, 3-5 stepped shades, daylight top-left, short subtle ground shadows. ONE SMALL TWO-STATE strip, TWO equal square cells horizontally LEFT closed/RIGHT open, identical camera, geometry, scale, prop positions. Genuine transparent alpha outside irregular edges and between cells. View slightly elevated top-down 3/4, not isometric diamond, no roof over walkable area. Final240x220or200x190 pixels beside88px human. Center and center-right must be clear walkable space. South bottom-center40% width is the exact entry in both states. No characters/text/labels/UI badge/modern signage/neon/magic/rectangular boundary. Different height objects along edges disguise rectangular logical footprint. Location renewable-energy observation station in a quiet frosty climate landscape. Irregular pale stone/gravel pad edged by small rocks, frost-tipped scrub plants and a few small snow clumps; never a rectangular rim. At back-left a two-panel blue solar array on tilted low steel frame, at back-right slender climate sensor/weather mast with small wind cups, to left side small muted green battery/control box joined by visible short cables lying at edge. Walkable middle/right stays empty. Entry bottomcenter has tiny practical short gate between two low posts. LEFT: gate closed, controller lamp dark, small instrument screen dark. RIGHT: SAME gate swung aside atpost leaving center40% clear, green controller status dot and warm pale instrument screen active, short surveyed path of flat stepping stones. Solar panels and all snow/vegetation unchanged. It is a humble environmental education station, NO glowing neon SF building, huge platform or square border.
```

### 샘물 조사 구역

원본: `exec-04041278-44e7-4bde-8004-95a36df608ec.png`

```text
Use case: stylized-concept. Production transparent WORLD SPRITE for Eco Chronicle. Match supplied existing warm round hand-pixelled RPG props: dark brown/teal outline, 3-5 stepped shades, daylight top-left, short subtle ground shadows. ONE small TWO-STATE strip, TWO equal square cells horizontally LEFT closed/RIGHT open, identical camera, geometry, scale, prop positions. Genuine transparent alpha outside irregular edges and between cells. Elevated top-down3/4, NOT isometric diamond or roof covering walkable interior. Final240x220px next to88px human. Center and center-right interior must be clear. South bottom-center40% width exact entry bothstates. NO characters/text/labels/UI badge/modern neon/magic/square boundary/four matching walls. Keep edgeobjects roughly in square logical footprint disguised by irregular landscaping. Location tiny spring ecology survey grove. Distinct from river deck: a small round natural SPRING pool at upper-left among mossy round stones, slightly cloudy sage-blue water in both states, dense soft ferns, water plants and modest leafy shrub along sides, an old root at lower-left and small pebbles at lower-right. Irregular damp tan soil footpath enters bottom-center into empty middle/right. A small wooden sampling table to back-right holds two glass sample jars and a slim portable olive filter pump with clearly connected short hose. CLOSED left: low discreet survey ribbon across entry between two short stakes, sample jar contains cloudy olive water, no ready marker. OPEN right: identical whole spring water color and ferns unchanged, ribbon tied off aside leaving central40% clear, ONE small sample jar on table contains pale blue treated water, little folded cream sampling cloth, subtle bootprint route. Do not purify the entire spring or invent a drink-safe certification badge. Small shadows under jars/table/stones.
```

### 단열 점검 구역

원본: `exec-06c2150e-b0da-40f1-b213-5bbaa9b72615.png`

```text
Use case: stylized-concept. Production transparent WORLD SPRITE for Eco Chronicle. Match supplied existing warm round hand-pixelled RPG props: dark brown/teal outline, 3-5 stepped shades, daylight top-left, short subtle ground shadows. ONE small TWO-STATE strip, TWO equal square cells horizontally LEFT closed/RIGHT open, identical camera, geometry, scale, prop positions. Genuine transparent alpha outside irregular edges and between cells. Elevated top-down3/4, NOT isometric diamond or roof covering walkable interior. Final240x220px next to88px human. Center and center-right interior must be clear. South bottom-center40% width exact entry bothstates. NO characters/text/labels/UI badge/modern neon/magic/square boundary/four matching walls. Keep edgeobjects roughly in square logical footprint disguised by irregular landscaping. Location existing insulated research facility inspection access, distinct from city brick room. Irregular frost-gray gravel with snow clumps and cool green low scrub at edges. An L-shaped partial pale plaster research wall at rear/left with blue insulated panels, exposed short curved pipe with tan insulation wrapping, thin seams between existing wall panels, small service access cover at rear-right, simple metal tool shelf at farleft. Middle/right floor visible and empty. South bottom-center has an EXISTING plain blue-gray inspection double door between low wall piers from the start, no complete rectangular facade. CLOSED left: closed door blends into wall panels, muted uniform gray panel color, no magic barrier. OPEN right: SAME physical wall/pipe/door inexactposition, door leaves folded to sides leaving center40%entryclear, one SMALL panel at far rear-right has gentle stepped purple/orange/ochre thermal color patches revealing heat difference; inspection seam highlighted with ochre edging, modest wooden survey stake. Temperature visualization restricted to this small panel, no giant overlay/neon glow/external camera UI, don't create/remove walls. Shadows short soft and consistent.
```

