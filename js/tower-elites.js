/* Monster Tower-only opponents. The regional monster records are untouched. */
const TOWER_ELITES = Object.freeze([
  {id:'leftovers', name:'흘러넘치는 잔반통', floor:4, hp:108, atk:19, exp:18, gold:20,
    meet:'먹을 만큼만 담지 않아 잔반이 쌓였어요. 음식물 쓰레기를 줄여야 해요.',
    after:'먹을 만큼만 담아요.', skills:['악취 분출','과식 폭주']},
  {id:'disposables', name:'일회용품 포대', floor:11, hp:222, atk:33, exp:39, gold:48,
    meet:'한 번 쓰고 버린 포장재가 산처럼 쌓였어요. 다시 쓸 수 있는 물건을 골라요.',
    after:'일회용품 사용을 줄여요.', skills:['포장 폭탄','압축 포장']},
  {id:'algae', name:'녹조 라떼', floor:18, hp:337, atk:47, exp:60, gold:76,
    meet:'오염된 물에 녹조가 번졌어요. 깨끗한 물이 있어야 물속 생물이 살아요.',
    after:'깨끗한 물을 지켜요.', skills:['탁수 장막','산소 고갈']},
  {id:'nightglare', name:'인공 백야귀', floor:20, hp:380, atk:52, exp:66, gold:84,
    meet:'밤에도 너무 밝으면 사람과 야생동물이 충분히 쉬기 어려워요.',
    after:'필요하지 않은 조명은 줄이고, 빛이 필요한 곳만 밝혀요.', skills:['눈부신 섬광','밤낮 뒤섞기']},
  {id:'glasswall', name:'착시 유리벽', floor:24, hp:418, atk:50, dr:.13, exp:78, gold:100,
    meet:'투명하거나 반사되는 유리는 새들이 장애물로 알아보기 어려워요.',
    after:'유리창에 무늬나 표시를 만들어 새들이 유리를 알아볼 수 있게 도와요.', skills:['하늘 반사','투명 장벽']},
  {id:'powerstrip', name:'과열된 멀티탭', floor:25, hp:450, atk:60, exp:81, gold:104,
    meet:'쓰지 않는 전기까지 계속 흐르고 있어요. 대기전력을 줄이고 안전하게 써요.',
    after:'사용하지 않는 전기는 꺼요.', skills:['과부하 스파크','대기전력 충전']},
  {id:'poacher', name:'밀렵꾼과 포크레인', floor:32, hp:557, atk:73, exp:102, gold:132,
    meet:'밀렵과 무분별한 개발이 생물의 삶터를 빼앗았어요. 서식지를 지켜요.',
    after:'야생동물의 삶터를 보호해요.', skills:['굴착 돌진','덫 설치']},
  {id:'carbon', name:'탄소 포식자', floor:39, hp:684, atk:87, exp:123, gold:160,
    meet:'화석연료를 먹고 매연과 탄소를 내뿜어요. 에너지를 아끼고 깨끗한 에너지로 바꿔요.',
    after:'화석연료 사용을 줄이고 에너지를 아껴요.', skills:['매연 분출','탄소 축적']}
]);
const ECO_TOWER_ELITE_ART = Object.fromEntries(TOWER_ELITES.map(e=>
  [e.id, `./assets/images/monsters/tower-${e.id}.webp`]));
function towerEliteForFloor(f){ return TOWER_ELITES.find(e=>e.floor===f)||null; }
function towerEliteMonster(e, themeId){
  return {name:e.name,eliteId:e.id,themeId,idx:2,mid:true,mode:'turn',fixed:true,
    ...(e.dr==null?{}:{eliteDr:e.dr}),
    hp:e.hp,atk:e.atk,exp:e.exp,gold:e.gold,gauge:0,meet:e.meet,after:e.after};
}
