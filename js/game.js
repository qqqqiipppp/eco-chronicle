var ECO_BUILD_ID='R43';

/*__NPC_DATA__*/
/*__GEAR_ALL__*/
var LEGEND_RATE = 0.03;   // 전설 전체 등장 확률 (여섯 종을 통틀어 3%)
/*__LEGEND_GEAR__*/
/*__BGM__*/
/*__SFX__*/
/*__SPR_SIZE__*/
var SKIN_MAP = {"light": {11770242: 11770242, 13611412: 13611412, 15518632: 15518632, 16769979: 16769979, 16775373: 16775373, 16777180: 16777180, 10517860: 10517860, 12226930: 12226930, 13936000: 13936000, 15645328: 15645328, 16764576: 16764576, 16769199: 16769199, 9727830: 9727830, 11239522: 11239522, 12817005: 12817005, 14395004: 14395004, 15841675: 15841675, 16763545: 16763545, 11435384: 11435384, 13275529: 13275529, 15181210: 15181210, 16759469: 16759469, 16764606: 16764606, 16769229: 16769229}, "warm": {11770242: 10847337, 13611412: 12556663, 15518632: 14331526, 16769979: 16041110, 16775373: 16767399, 16777180: 16772021, 10517860: 9465169, 12226930: 10911067, 13936000: 12423014, 15645328: 14000756, 16764576: 15447427, 16769199: 16696977, 9727830: 8609606, 11239522: 9923918, 12817005: 11369559, 14395004: 12815715, 15841675: 14196850, 16763545: 15446143, 11435384: 11104617, 13275529: 12812919, 15181210: 14652550, 16759469: 16427158, 16764606: 16759719, 16769229: 16764085}, "tan": {11770242: 9267790, 13611412: 10713688, 15518632: 12225378, 16769979: 13737583, 16775373: 15184255, 16777180: 16433804, 10517860: 7820604, 12226930: 9003331, 13936000: 10252106, 15645328: 11566933, 16764576: 12947811, 16769199: 14131568, 9727830: 6965298, 11239522: 8016695, 12817005: 9133629, 14395004: 10382663, 15841675: 11697748, 16763545: 12881505, 11435384: 9920342, 13275529: 11431266, 15181210: 13073517, 16759469: 14650748, 16764606: 16097419, 16769229: 16756889}, "deep": {11770242: 6899765, 13611412: 7885626, 15518632: 9002560, 16769979: 10251595, 16775373: 11566681, 16777180: 12750438, 10517860: 5519143, 12226930: 6307626, 13936000: 7161646, 15645328: 8213558, 16764576: 9462851, 16769199: 10581072, 9727830: 4795936, 11239522: 5452834, 12817005: 6175268, 14395004: 7161388, 15841675: 8345145, 16763545: 9463109, 11435384: 7882048, 13275529: 9064520, 15181210: 10377807, 16759469: 11692123, 16764606: 13073001, 16769229: 14256503}};
var HAIR_MAP = {"brown": {5584420: 5584420, 6438439: 6438439, 7292202: 7292202, 8344114: 8344114, 9593407: 9593407, 10711628: 10711628, 4138778: 4138778, 4729884: 4729884, 5320989: 5320989, 6241316: 6241316, 7359280: 7359280, 8477244: 8477244, 7425845: 7425845, 8543034: 8543034, 9725760: 9725760, 11040587: 11040587, 12355673: 12355673, 13605222: 13605222}, "black": {5584420: 3222067, 6438439: 3616569, 7292202: 4076863, 8344114: 4866121, 9593407: 5984086, 10711628: 7036515, 4138778: 2235430, 4729884: 2432809, 5320989: 2695724, 6241316: 3418932, 7359280: 4471361, 8477244: 5458254, 7425845: 4669515, 8543034: 5327189, 9725760: 6050654, 11040587: 7037035, 12355673: 8221050, 13605222: 9339272}, "blonde": {5584420: 10124355, 6438439: 11702091, 7292202: 13345619, 8344114: 14989407, 9593407: 16436334, 10711628: 16768635, 4138778: 8085294, 4729884: 9334066, 5320989: 10583095, 6241316: 12029248, 7359280: 13344846, 8477244: 14594139, 7425845: 11376743, 8543034: 13152373, 9725760: 15059332, 11040587: 16769428, 12355673: 16774821, 13605222: 16777139}, "red": {5584420: 8602410, 6438439: 9915437, 7292202: 11359793, 8344114: 12805178, 9593407: 14185800, 10711628: 15435092, 4138778: 6565661, 4729884: 7615775, 5320989: 8600609, 6241316: 9848872, 7359280: 11098165, 8477244: 12281665, 7425845: 10379072, 8543034: 11955528, 9725760: 13663311, 11040587: 15371611, 12355673: 16752745, 13605222: 16756855}};
/*__SPR_FRAMES__*/
var SOLID_PROPS = {"rock": {"r": 22, "dy": 12}, "trash": {"r": 20, "dy": 8}, "ice": {"r": 21, "dy": 8}, "stump": {"r": 17, "dy": 6}, "building": {"r": 22, "dy": 4}, "stack": {"r": 29, "dy": 0}, "bin": {"r": 21, "dy": 6}, "coral": {"r": 20, "dy": 4}};
var SOLID_ARTS = {"rock": {"r": 22, "dy": 12}, "stump": {"r": 17, "dy": 6}, "log": {"r": 26, "dy": 14}, "pine": {"r": 30, "dy": 6}, "round": {"r": 26, "dy": 6}, "bush": {"r": 31, "dy": 10}, "ice": {"r": 21, "dy": 8}, "coral": {"r": 20, "dy": 4}, "chest": {"r": 25, "dy": 2}};
/*__SPRITES__*/


/* ==========================================================
   에코 크로니클 (Echo Chronicle) v8
   ----------------------------------------------------------
   구조
     1) 전역 규칙   — 레벨/스킬/스케일링 (모든 테마 공통)
     2) THEMES      — 테마별 데이터 (숲 완성 · 나머지 5개 준비중)
     3) 상태 S      — 저장 대상 (localStorage)
   새 테마를 추가하려면 THEMES 에 항목 하나만 채우면 된다.
   그래픽: Kenney (kenney.nl) CC0 픽셀아트 기반
   ========================================================== */

/* ==========================================================
   1) 전역 규칙
   ========================================================== */
var LEVELS = [
  {lv:1, need:0,   hp:60,  atk:13, def:7,  sp:25},
  {lv:2, need:40,  hp:70,  atk:16, def:9,  sp:30},
  {lv:3, need:100, hp:80,  atk:19, def:11, sp:35},
  {lv:4, need:180, hp:90,  atk:22, def:13, sp:40},
  {lv:5, need:280, hp:100, atk:25, def:15, sp:45},
  {lv:6, need:400, hp:110, atk:28, def:17, sp:50},
  {lv:7, need:560, hp:124, atk:31, def:19, sp:56},
  {lv:8, need:760, hp:138, atk:34, def:21, sp:62},
  {lv:9, need:1000,hp:152, atk:37, def:23, sp:68},
  {lv:10,need:1300,hp:168, atk:41, def:26, sp:76}
];
var MAX_LV = LEVELS.length;

/* 공통 스킬 (정령 고유 스킬은 PETS 안에 따로 있다) */
var SKILLS = [
  {id:'atk',  name:"기본 공격",  sp:0,  lv:1, desc:"기력 없이 공격해요"},
  {id:'guard',name:"방어 태세",  sp:5,  lv:2, desc:"이번 공격을 절반만 맞아요"},
  {id:'ult',  name:"속성 필살기",sp:14, lv:3, desc:"아주 세게 공격해요"},
  {id:'heal', name:"회복",       sp:15, lv:4, desc:"체력을 회복해요"},
  {id:'strike',name:"정화의 강타",sp:11, lv:7, desc:"기력을 조금 쓰고 세게 때려요"},
  {id:'mend',  name:"큰 회복",   sp:24, lv:9, desc:"체력을 많이 회복해요"}
];

/* 정령(펫) — Lv1부터 쓰는 고유 스킬을 각자 하나씩 갖는다 */
/* 정령 진화 — 단계마다 모습과 이름이 바뀐다 */
var PET_STAGE_NAMES = {
  earth:["조약돌 정령","바위 정령","다이아몬드 정령"],
  water:["물방울 정령","소용돌이 정령","폭포 정령"],
  fire: ["불씨 정령","불꽃 정령","태양 정령"]
};
function petStage(){ return Math.max(0, Math.min(2, (S&&S.petStage)||0)); }
function petName(){
  const k=(S&&S.petKey)||'earth';
  return (PET_STAGE_NAMES[k]||PET_STAGE_NAMES.earth)[petStage()];
}
var PETS = {
  earth:{key:'earth',name:"땅정령",main:"#8fae52",dark:"#5f7a34",desc:"잘 버티는 튼튼한 친구",
    strongIn:["숲","도시"],filter:"hue-rotate(42deg) saturate(1.25)",
    skill:{id:'p_earth',name:"대지의 은총",sp:6,lv:1,kind:'heal70',
           plain:"공격하면서 <b>체력을 회복해요</b>",
           tip:"맞아서 아플 때 쓰면 좋아요",
           desc:"공격 ×0.8 + 받은 피해의 70% 회복",
           line:"흙의 기운이 상처를 감싼다"}},
  water:{key:'water',name:"물정령",main:"#4ac6ff",dark:"#1f7fb8",desc:"잘 피하는 날쌘 친구",
    strongIn:["강","바다"],filter:"hue-rotate(150deg) saturate(1.5) brightness(1.05)",
    skill:{id:'p_water',name:"물의 장막",sp:6,lv:1,kind:'evade',
           plain:"공격하면서 <b>다음 공격을 피해요</b>",
           tip:"센 공격이 올 것 같을 때 쓰면 좋아요",
           desc:"공격 ×0.8 + 다음 공격 1회 회피",
           line:"물의 장막이 몸을 감쌌다"}},
  fire: {key:'fire', name:"불정령",main:"#ff7a4a",dark:"#c44a22",desc:"힘이 센 씩씩한 친구",
    strongIn:["대기","기후·에너지"],filter:"hue-rotate(-40deg) saturate(1.6) brightness(1.05)",
    skill:{id:'p_fire',name:"불꽃 일격",sp:6,lv:1,kind:'atk15',
           plain:"<b>아주 세게 공격해요</b>",
           tip:"빨리 끝내고 싶을 때 쓰면 좋아요",
           desc:"공격 ×1.5",
           line:"불꽃이 확 타올랐다"}}
};

/* 몬스터 스케일링 — 활동 순서와 무관하게 난이도를 일정하게 유지 */
var MON_HP_SCALE  = 0.34;
var MON_ATK_SCALE = 0.14;
/* 몬스터 방어력 — 레벨과 무관한 '비율 감소'.
   뺄셈식으로 하면 저레벨에선 0이 되고 고레벨에선 폭주해 마지막 장이 클리어 불가가 된다. */
var MON_DR_BASE = 0.06;     // 일반 몬스터: 받는 피해 6% 감소
                            // (0.09 이상이면 마지막 장이 기본공격만으로 클리어 불가)
var MON_DR_MID  = 0.11;     // 중간보스
var MON_DR_BOSS = 0.14;     // 우두머리
var MON_ATK_BUFF = 1.00;    // 공격력 배수 (1.0 초과 시 마지막 장이 클리어 불가가 되어 유지)
var AFFINITY = 1.25;   // 친화 테마 공격 보너스
var SP_REGEN = 2;      // 매 턴 SP 자동 회복
var BLESS_STEP = 0.15, BLESS_MAX = 4;   // 에코의 가호(연패 안전장치) 최대 +60%

/* 뽑기 — 테마 공통 규칙, 재료/장비는 현재 테마 것을 쓴다 */
var GACHA_OLD = [
  {w:26,type:'gold',amt:30,  txt:"골드 30"},
  {w:20,type:'gold',amt:60,  txt:"골드 60"},
  {w:18,type:'mat', slot:3,  amt:2, txt:"재료 ×2"},
  {w:14,type:'mat', slot:2,  amt:2, txt:"재료 ×2"},
  {w:10,type:'mat', slot:4,  amt:3, txt:"재료 ×3"},
  {w:7, type:'gear',slot:'weapon',idx:1},
  {w:5, type:'gear',slot:'armor', idx:1}
];

/* 뽑기 비율 — 재료 60 · 골드 30 · 일반 장비 9 · 전설 1 */
var GACHA = [
  {w:17, type:'mat',  amt:2},
  {w:18, type:'mat',  amt:3},
  {w:15, type:'mat',  amt:4},
  {w:9,  type:'gold', amt:30,  txt:"골드 30"},
  {w:7,  type:'gold', amt:60,  txt:"골드 60"},
  {w:4,  type:'gold', amt:120, txt:"골드 120"},
  {w:9,  type:'gear'},
  {w:20, type:'miss'}
];
/* 꽝일 때 나오는 말 — 기죽지 않게 응원으로 */
var MISS_TXT = [
  "아쉬워요! 다음엔 좋은 게 나올 거예요",
  "이번엔 빈손이네요… 한 번 더!",
  "앗, 빠져나갔어요!",
  "다음 뽑기를 노려 봐요",
  "괜찮아요, 아직 기회가 남았어요"
];
/* 장비 등급별 비중 — 낮은 등급이 흔하고 높을수록 드물다 */
var GEAR_TIER_W = [40, 26, 17, 10, 5, 2];

var POTION_PRICE = 30;   // 상점 회복약 (반복 구매 가능)

/* ==========================================================
   2) 테마 데이터
   ---------------------------------------------------------
   새 테마 추가 체크리스트
     name/icon/chapter/levelGate/ready
     arena  : 전투 배경 색
     map    : w,h,spawn,path,objs
     lesson : NPC 학습 자료 (배열)
     quiz / quizAdv
     monsters : 5마리 (mode:'turn' | 'pang')
     mats / recipes / creatures / gear
     gather : objs(채집 지점) + clues(단서 3개) + lockCode
   ========================================================== */
/*__THEMES__*/

/* ==========================================================
   맵 만들기 도우미 — 6개 지점 배치는 같고 이름만 테마마다 다르다
   caps 순서: 배움터 · 오염지대 · 채집터 · 제작터 · 가게 · 제단
   ========================================================== */


/* ==========================================================
   제2장 💧 강 — 낙동강 (교과서 «1. 물 문제» 기반)
   ========================================================== */

var THEME_ORDER = ['forest','river','ocean','city','air','climate'];

/* 현재 테마 — 모든 게임 코드는 CUR 을 통해 데이터를 읽는다 */
var CUR = THEMES.forest;
function useTheme(id){ CUR = THEMES[id] || THEMES.forest; }

/* ==========================================================
   3) 상태
   ========================================================== */
var SAVE_VERSION = 8;
var S = null;

function newState(){
  return {
    v:SAVE_VERSION,
    scene:'title',
    name:"", code:"",
    petKey:null,
    themeId:'forest',

    grade:5,               // 초등 학년 (4~6) — 수학 문제 난이도
    hair:'messy', face:'bright', outfit:'cloak', skin:'light', haircol:'brown',  // 겉모습
    petStage:0,            // 정령 진화 단계 (0·1·2)
    day:1,                 // '하루' — 채집을 마치거나 몬스터를 정화하면 넘어간다
    water:5, wellDay:0, canLv:0,    // \ubb3c\ud1b5 \u00b7 \uc6b0\ubb3c\uc744 \ub9c8\uc9c0\ub9c9\uc73c\ub85c \uc4f4 \ub0a0
    seeds:{}, produce:{},  // 씨앗 · 거둔 산물 (지역이 바뀌어도 유지된다)
    npcDone:[],            // 이야기를 마친 NPC
    duelWon:[],            // 겨루기에서 이긴 NPC
    shadowWon:false,       // 나 자신을 이겼는가
    farm:null,             // 화단 12칸 + 축사 6칸
    tower:{best:0,bestTime:0,runs:0,history:[]},   // 몬스터의 탑 내 기록
    lv:1, exp:0, gold:60,
    gauge:0, hpCur:60, spCur:25,

    /* 학습 · 퀴즈 */
    lessonDone:false, quizDone:false, advDone:false,
    quizIdx:0, quizPicked:null, quizHint:false, quizCorrect:0,
    quizScored:[],          // 정화 게이지를 이미 받은 문항 (재도전 시 중복 지급 방지)
    quizWrong:[],           // 아직 못 맞힌 문항 번호
    retryQueue:null,        // 재도전 중일 때 남은 문항 번호 목록
    advIdx:0, advPicked:null, advScored:[], quizContentVersion:39,

    /* 전투 */
    monIdx:0, battleDone:false, interludePending:null, encounterWon:false, defeatStreak:0,

    /* 채집 */
    gboard:null,            // {objs:{id:남은횟수}, met:[생물id]}
    clues:{},               // {c1:7, ...} 찾아낸 단서
    boxOpen:false,
    gatherDone:false,
    dexBonus:false,         // 도감 완성 보너스 지급 여부

    /* 소지품 */
    crafted:{}, potions:0, tickets:0,
    mats:{}, gear:{weapon:null,armor:null,helm:null,shoes:null},
    owned:[], dex:[],

    cleared:[],             // 클리어한 테마 id 목록
    progress:{},            // 테마별 진행 보관 {themeId:{...}}
    modal:null
  };
}

/* 월드 런타임 (저장 안 함) */
var Wd = {
  px:0, py:0, cx:0, cy:0,
  keys:{u:false,d:false,l:false,r:false},
  face:'south', moving:false,
  petX:0, petY:0, trail:[],
  near:null, ready:false, vw:900, vh:600, raf:null
};
var B = null;      // 전투 런타임
var Pg = null;     // 팡팡 런타임

/* ==========================================================
   유틸
   ========================================================== */
var $ = id => document.getElementById(id);
var clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
var dist=(x1,y1,x2,y2)=>Math.hypot(x1-x2,y1-y2);
var rnd=(a,b)=>a+Math.random()*(b-a);

/* 한글 조사 자동 선택 — 테마/몬스터 이름이 바뀌어도 문장이 자연스럽게 */
function hasJong(w){
  w=String(w||''); if(!w) return false;
  const c=w.charCodeAt(w.length-1);
  if(c<0xAC00||c>0xD7A3) return false;
  return (c-0xAC00)%28!==0;
}
function J(w,withJong,without){ return hasJong(w)?withJong:without; }   // J("숲","이","가") → "이"
function JRO(w){                                                        // 로 / 으로 (ㄹ 받침은 '로')
  w=String(w||''); const c=w.charCodeAt(w.length-1);
  if(c<0xAC00||c>0xD7A3) return '로';
  const j=(c-0xAC00)%28;
  return (j===0||j===8)?'로':'으로';
}

/* 사용자 입력(이름)은 반드시 이걸 거쳐서 화면에 넣는다 */
function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function NAME(){ return esc(S.name); }

function toast(msg){
  const t=$('toast'); if(!t) return;
  t.innerHTML=msg; t.classList.add('on');
  clearTimeout(window._tt); window._tt=setTimeout(()=>t.classList.remove('on'),2000);
}

function lvInfo(lv){ return LEVELS[clamp(lv,1,MAX_LV)-1]; }
function gearList(slot){
  return (GEAR_ALL[slot]||[]).concat(LEGEND_GEAR.filter(i=>i.slot===slot));
}
function isLegend(id){ return LEGEND_GEAR.some(i=>i.id===id); }
/* 지금 낀 장비의 특수 효과 (없으면 null) */
function legendOf(slot){
  const it=gearFind(slot, (S.gear||{})[slot]);
  return (it && it.eff) ? it : null;
}
function gearFind(slot,id){ return gearList(slot).find(i=>i.id===id) || null; }
/* 장비 그림 한 칸 */
function gearIco(it,box){
  box=box||34;
  if(!it || !SPRITES[it.ico]) return '';
  return `<div style="width:${box}px;height:${box}px;image-rendering:pixelated;
    background-repeat:no-repeat;background-position:0 0;background-size:100% 100%;
    background-image:url('${SPRITES[it.ico]}')"></div>`;
}

function baseStats(){
  const L=lvInfo(S.lv), g=S.gear||{};
  const wep=gearFind('weapon',g.weapon), arm=gearFind('armor',g.armor);
  const hel=gearFind('helm',g.helm),     sho=gearFind('shoes',g.shoes);
  return {
    hpMax:L.hp,
    atk:L.atk + (wep?wep.atk:0),
    def:L.def + (arm?arm.def:0) + (hel?hel.def:0),
    spMax:L.sp + (sho?sho.sp:0)
  };
}
function petStrong(){ return PETS[S.petKey].strongIn.includes(CUR.name); }
function nextNeed(){ return S.lv>=MAX_LV? null : LEVELS[S.lv].need; }

/* 공통 스킬 + 정령 고유 스킬을 합쳐서 순서대로 돌려준다 */
function activeSkills(){
  const p=PETS[S.petKey];
  const list=SKILLS.slice();
  if(p && p.skill) list.splice(1,0,Object.assign({pet:true},p.skill));
  return list;
}

function monStats(m){
  if(m && m.fixed) return {hp:m.hp, atk:m.atk,
    dr: m.boss ? MON_DR_BOSS : (m.mid ? MON_DR_MID : MON_DR_BASE)};
  var k = S.lv - 1;
  return {
    hp : Math.round(m.hp  * (1 + MON_HP_SCALE  * k)),
    atk: Math.round(m.atk * (1 + MON_ATK_SCALE * k) * MON_ATK_BUFF),
    dr : m.boss ? MON_DR_BOSS : (m.mid ? MON_DR_MID : MON_DR_BASE)
  };
}
function addExp(n){
  S.exp+=n;
  let up=false;
  while(S.lv<MAX_LV && S.exp>=LEVELS[S.lv].need){ S.lv++; up=true; }
  if(up){
    S.hpCur=baseStats().hpMax;
    showLvUp();
    const sk=activeSkills().find(s=>s.lv===S.lv && !s.pet);
    setTimeout(()=>{ if(sk) toast(`새 스킬 <b>${sk.name}</b>${J(sk.name,'을','를')} 배웠어요!`); },1500);
  }
  return up;
}
function showLvUp(){
  const el=$('lvup'); if(!el) return;
  el.textContent="LEVEL UP!  Lv."+S.lv;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
}
function addGauge(n){
  const before=S.gauge;
  S.gauge=clamp(S.gauge+n,0,100);
  if(S.gauge!==before) paintMood();
  return S.gauge-before;
}
function addMat(id,n){ S.mats[id]=(S.mats[id]||0)+n; }
function matCount(id){ return S.mats[id]||0; }

/* 도감을 다 채우면 보너스 (게이지 여유분 겸 수집 동기) */
function checkDexBonus(){
  if(S.dexBonus) return;
  if(S.dex.length < CUR.creatures.length) return;
  S.dexBonus=true;
  const g=addGauge(5); addExp(12);
  setTimeout(()=>toast(`📔 도감 완성! 정화 +${g}% · EXP +12`),700);
}

/* ==========================================================
   저장 / 불러오기  —  localStorage (서버 없이 차시 간 이어하기)
   ========================================================== */
var Save = {
  P:'echo:',
  IDX:'echo:__index',
  ok(){
    try{ localStorage.setItem('echo:__t','1'); localStorage.removeItem('echo:__t'); return true; }
    catch(e){ return false; }
  },
  index(){
    try{ return JSON.parse(localStorage.getItem(this.IDX)||'[]'); }catch(e){ return []; }
  },
  _pushIndex(code){
    const i=this.index();
    if(!i.includes(code)){ i.push(code); try{ localStorage.setItem(this.IDX,JSON.stringify(i)); }catch(e){} }
  },
  save(){
    if(!S || !S.code) return 'none';
    const json=JSON.stringify(S);
    if(this.ok()){
      try{
        localStorage.setItem(this.P+S.code, json);
        localStorage.setItem('echo:__last', S.code);
        this._pushIndex(S.code);
        return 'disk';
      }catch(e){ /* 용량 초과 등 → 메모리로 폴백 */ }
    }
    this.mem=this.mem||{}; this.mem[S.code]=json;
    return 'mem';
  },
  load(code){
    code=String(code||'').trim().toUpperCase();
    let json=null;
    if(this.ok()){ try{ json=localStorage.getItem(this.P+code); }catch(e){} }
    if(!json && this.mem && this.mem[code]) json=this.mem[code];
    if(!json) return null;
    try{
      const o=JSON.parse(json);
      return migrate(o);
    }catch(e){ return null; }
  },
  last(){
    if(!this.ok()) return null;
    try{ return localStorage.getItem('echo:__last'); }catch(e){ return null; }
  },
  wipeAll(){
    if(!this.ok()) return;
    this.index().forEach(c=>{ try{ localStorage.removeItem(this.P+c); }catch(e){} });
    try{ localStorage.removeItem(this.IDX); localStorage.removeItem('echo:__last'); }catch(e){}
    this.mem={};
  }
};

/* 예전 저장본을 최신 형태로 맞춰준다 (필드가 늘어나도 안 깨지게) */
function migrate(o){
  normalizeQuizProgress(o,THEMES[o.themeId]||THEMES.forest);
  if(o.progress)Object.keys(o.progress).forEach(id=>{if(THEMES[id]&&o.progress[id])normalizeQuizProgress(o.progress[id],THEMES[id]);});
  if(o && o.spCur==null) o.spCur = 25;
  // 예전 저장(성별)을 새 겉모습으로 옮긴다
  if(o && o.sex && !o.hair) o.hair = (o.sex==='f') ? 'long' : 'messy';
  const base=newState();
  for(const k in base) if(!(k in o)) o[k]=base[k];
  if(!o.mats) o.mats={};
  if(!Array.isArray(o.quizScored)) o.quizScored=[];
  if(!Array.isArray(o.quizWrong))  o.quizWrong=[];
  if(!Array.isArray(o.cleared))    o.cleared=[];
  if(!o.clues) o.clues={};
  if(!o.grade) o.grade=5;
  if(!o.hair) o.hair='messy';
  if(!o.outfit) o.outfit='cloak';
  if(!o.skin) o.skin='light';
  if(!o.haircol) o.haircol='brown';
  if(!['bright','calm','smile','bold'].includes(o.face)) o.face='bright';
  delete o.sex;
  if(typeof o.petStage!=='number') o.petStage=0;
  if(typeof o.day!=='number') o.day=1;
  if(!o.seeds) o.seeds={};
  if(!o.produce) o.produce={};
  if(typeof o.canLv!=='number') o.canLv=0;
  if(typeof o.water!=='number') o.water=canCap();
  if(typeof o.wellDay!=='number') o.wellDay=0;
  if(!Array.isArray(o.npcDone)) o.npcDone=[];
  if(!Array.isArray(o.duelWon)) o.duelWon=[];
  if(typeof o.shadowWon!=='boolean') o.shadowWon=false;
  if(!o.gear) o.gear={};
  ['weapon','armor','helm','shoes'].forEach(k=>{ if(o.gear[k]===undefined) o.gear[k]=null; });
  // 예전 저장의 장비 번호가 새 목록에 없으면 벗긴다
  ['weapon','armor','helm','shoes'].forEach(k=>{
    if(o.gear[k] && !(GEAR_ALL[k]||[]).some(i=>i.id===o.gear[k])) o.gear[k]=null;
  });
  if(Array.isArray(o.owned)) o.owned=o.owned.filter(id=>
    Object.keys(GEAR_ALL).some(k=>GEAR_ALL[k].some(i=>i.id===id)));
  if(!o.farm) o.farm=newFarm();
  if(!o.tower) o.tower={best:0,bestTime:0,runs:0,history:[]};
  if(!Array.isArray(o.tower.history)) o.tower.history=[];
  if(!o.progress) o.progress={};
  o.v=SAVE_VERSION;
  return o;
}

/* 중요한 일이 끝날 때마다 조용히 자동 저장 */
function autosave(){
  if(!S || !S.code) return;
  Save.save();
  const dot=$('saveDot');
  if(dot){ dot.classList.remove('on'); void dot.offsetWidth; dot.classList.add('on'); }
}
function doSave(){
  const mode=Save.save();
  if(mode==='disk')      toast(`저장 완료! 내 번호 <b>${S.code}</b><br><span style="font-size:11px">다음 시간에 이 번호로 이어서 해요</span>`);
  else if(mode==='mem')  toast(`저장했어요 (이 브라우저는 저장 공간이 막혀 있어요)<br>번호 <b>${S.code}</b>`);
  else                   toast("아직 저장할 것이 없어요");
}

function makeCode(){
  const used=Save.index();
  for(let t=0;t<200;t++){
    let n=""; for(let i=0;i<4;i++) n+=Math.floor(Math.random()*10);
    const c="EC"+n;
    if(!used.includes(c)) return c;
  }
  return "EC"+Date.now().toString().slice(-4);
}

/* 오래된 태블릿 브라우저용: canvas roundRect 폴리필 */
if(typeof CanvasRenderingContext2D!=='undefined' && !CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    r=Math.min(r||0,w/2,h/2);
    this.beginPath();
    this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r);
    this.arcTo(x+w,y+h,x,y+h,r); this.arcTo(x,y+h,x,y,r);
    this.arcTo(x,y,x+w,y,r); this.closePath();
    return this;
  };
}
/* ==========================================================
   스프라이트 렌더
   ========================================================== */
/* 고를 수 있는 겉모습 */
var LOOKS = {
  face: [['bright','맑은 눈'],['calm','또렷한 눈'],['smile','초롱한 눈'],['bold','도도한 눈']],
  hair: [['skin','비대칭 롱프린지'],['messy','스타 스파이크'],['bob','워리어 테일'],['long','트윈 브레이드'],['pony','플라워 보브'],['afro','하이 번']],
  outfit: [['cloak','청회색 여행복'],['robe','태권도복'],['overall','멜빵바지'],['soccer','노란 트레이닝복'],['suit','정장'],['dino','축구 유니폼']],
  skin: [['light','밝은','#fcd8b2'],['warm','중간','#e8ba8e'],['tan','갈색','#c69468'],['deep','짙은','#926444']],
  haircol: [['brown','갈색','#764a2c'],['black','검정','#423842'],['blonde','금발','#d8ae58'],['red','빨강','#b85c34']],
};
function lookOf(k,d){ return (S&&S[k]) || d; }
function sideDir(dir){ return (dir==='east'||dir==='west')?'west':dir; }
function customHeadKey(h,f,dir){ return 'head_'+h+'_'+f+'_'+sideDir(dir); }
function headKey(dir){ return customHeadKey(lookOf('hair','messy'),lookOf('face','bright'),dir); }
function bodyKey(dir){ return 'body_'+lookOf('outfit','cloak')+'_'+sideDir(dir); }

/* ---- 피부색·머리색 즉석 교체 ----
   스프라이트는 기준색으로 구워 두고, 캔버스에서 색만 바꿔 캐시한다.
   (조합이 576가지라 미리 그려 두면 용량이 감당이 안 된다) */
var TINT={}, TINT_BUSY={};
function tintTag(){ return lookOf('skin','light')+'_'+lookOf('haircol','brown'); }
function heroImg(key){
  const tk=key+'|'+tintTag();
  if(TINT[tk]) return TINT[tk];
  makeTint(key,tk);
  return SPRITES[key]||'';
}
function makeTint(key,tk){
  makeTintFor(key,tk,lookOf('skin','light'),lookOf('haircol','brown'));
}
function makeTintFor(key,tk,skin,hc){
  if(TINT_BUSY[tk]||!SPRITES[key]) return;
  const cv=document.createElement('canvas');
  const g=cv.getContext&&cv.getContext('2d');
  if(!g){ TINT[tk]=SPRITES[key]; return; }        // 캔버스가 없으면 기준색 그대로
  TINT_BUSY[tk]=1;
  const img=new Image();
  img.onload=()=>{
    try{
      cv.width=img.width; cv.height=img.height;
      g.drawImage(img,0,0);
      const d=g.getImageData(0,0,cv.width,cv.height), a=d.data;
      tintPixels(a,key,skin,hc,cv.width);
      g.putImageData(d,0,0);
      TINT[tk]=cv.toDataURL();
    }catch(e){ TINT[tk]=SPRITES[key]; }
    TINT_BUSY[tk]=0;
    refreshHeroArt();
  };
  img.onerror=()=>{ TINT[tk]=SPRITES[key]; TINT_BUSY[tk]=0; };
  img.src=SPRITES[key];
}
function refreshHeroArt(){
  document.querySelectorAll('[data-hero]').forEach(el=>{
    el.style.backgroundImage=`url('${heroImg(el.dataset.hero)}')`;
  });
  document.querySelectorAll('[data-npc-tint]').forEach(el=>{
    const src=TINT[el.dataset.npcTint];
    if(src)el.style.backgroundImage=`url('${src}')`;
  });
  if(RN_FRAMES && $('rnBody')) rnMakeFrames();
}
/* 걷는 동안 머리는 한 번도 안 움직인다 → 머리는 1장, 몸통만 9프레임 */
function heroSprite(dir,size,tagIds){
  size=size||48;
  dir=dir||'south';
  const flip=(dir==='east')?' flip':'';   // 원본은 서쪽을 본다 → 동쪽일 때만 반전
  const bk=bodyKey(dir), hk=headKey(dir);
  return `<div class="flipwrap${flip}"${tagIds?' id="heroFlip"':''} style="width:${size}px;height:${size}px">
    <div class="avatar" style="width:100%;height:100%">
      <div class="sprite"${tagIds?' id="heroBody"':''} data-hero="${bk}"
           style="background-image:url('${heroImg(bk)}')"></div>
      <div class="sprite head"${tagIds?' id="heroHead"':''} data-hero="${hk}"
           style="background-image:url('${heroImg(hk)}')"></div>
    </div></div>`;
}
// 방향 전환 시 DOM을 다시 만들지 않고 배경만 교체 → 걷기 애니메이션 끊김·잔상 방지
function setHeroFacing(dir){
  const bd=$('heroBody'), hd=$('heroHead'), fl=$('heroFlip');
  if(!bd||!hd||!fl) return;
  const bk=bodyKey(dir), hk=headKey(dir);
  bd.dataset.hero=bk; hd.dataset.hero=hk;
  bd.style.backgroundImage=`url('${heroImg(bk)}')`;
  hd.style.backgroundImage=`url('${heroImg(hk)}')`;
  fl.classList.toggle('flip', dir==='east');
}
function companionKey(type,stage,dir){
  const base='pet_'+type+'_'+stage;
  const suffix=(dir==='east'||dir==='west')?'_west':(dir==='north'?'_north':'');
  return SPRITES[base+suffix]?base+suffix:base;
}
function petSprite(pet,size,stage){
  size=size||64;
  const st=(stage==null)?petStage():stage,key=companionKey(pet.key,st,'south');
  return `<div class="companion-facing" style="width:${size}px;height:${size}px"><div class="pxa companion-art companion-${pet.key}" data-sprite="${key}" style="width:${size}px;height:${size}px;background-image:url('${SPRITES[key]}');background-size:200% 100%;background-position:0 0"></div></div>`;
}
function setCompanionFacing(dir){
  const host=$('pet'),art=host&&host.querySelector('.companion-art'),turn=host&&host.querySelector('.companion-facing');
  if(!art||!turn)return;
  const key=companionKey(S.petKey,petStage(),dir);
  if(art.dataset.sprite!==key){art.style.backgroundImage=`url('${SPRITES[key]}')`;art.dataset.sprite=key;}
  turn.style.transform=dir==='east'?'scaleX(-1)':'scaleX(1)';
  turn.dataset.facing=dir;
}
// Follow the leader's recent route at a fixed distance, rather than a fixed left offset.
function companionFollow(w,x,y,dt){
  const ms=Math.min(Math.max(dt,0),50),lag=46;
  if(!w.trail||!w.trail.length){
    w.trail=[{x:w.petX,y:w.petY},{x:x,y:y}];
    w.petFacing=w.face||w.petFacing||'south';
    w.petStride=0;
  }
  let last=w.trail[w.trail.length-1];
  if(Math.hypot(x-last.x,y-last.y)>180){
    // A map change must not drag a companion across the whole map.
    const facing=w.face||'south',v={east:[1,0],west:[-1,0],north:[0,-1],south:[0,1]}[facing];
    w.petX=x-v[0]*lag;w.petY=y-v[1]*lag;w.petFacing=facing;
    w.trail=[{x:w.petX,y:w.petY},{x:x,y:y}];w.petStride=0;
    return 0;
  }
  if(Math.hypot(x-last.x,y-last.y)>=2)w.trail.push({x:x,y:y});
  const route=w.trail.concat([{x:x,y:y}]);
  let remaining=lag,target=route[0];
  for(let i=route.length-1;i>0;i--){
    const a=route[i],b=route[i-1],length=Math.hypot(a.x-b.x,a.y-b.y);
    if(length>=remaining&&length>0){
      const f=remaining/length;target={x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};break;
    }
    remaining-=length;
  }
  // Keep a bounded route history (about 160px), including a segment behind the target.
  let history=0;
  for(let i=w.trail.length-1;i>0;i--){
    history+=Math.hypot(w.trail[i].x-w.trail[i-1].x,w.trail[i].y-w.trail[i-1].y);
    if(history>160){w.trail.splice(0,i-1);break;}
  }
  const dx=target.x-w.petX,dy=target.y-w.petY,gap=Math.hypot(dx,dy);
  const travel=gap>.6?Math.min(gap*(1-Math.exp(-ms/120)),160*ms/1000):0;
  if(travel>0){w.petX+=dx/gap*travel;w.petY+=dy/gap*travel;}
  w.petStride=(w.petStride||0)+travel;
  if(travel>.08){
    // Hysteresis around diagonals prevents left/back flicker.
    if(Math.abs(dx)>Math.abs(dy)*1.2)w.petFacing=dx<0?'west':'east';
    else if(Math.abs(dy)>Math.abs(dx)*1.2)w.petFacing=dy<0?'north':'south';
  }
  return travel>.08?Math.sin(w.petStride*.17)*.5:0;
}
function ecoSceneryKey(key){
  const biome=(S.modal==='farm'||S.modal==='field')?'forest':(S.themeId||'forest');
  const themed=biome+'_'+key;
  return (typeof ECO_DETAIL_KEYS!=='undefined'&&ECO_DETAIL_KEYS[themed])?themed:key;
}
function ecoScenerySource(key){return SPRITES[ecoSceneryKey(key)];}
function pxImg(src,w,h,cls){
  return `<img class="pxi ${cls||''}" src="${src}" style="width:${w}px;height:${h}px" alt="">`;
}
/* 여러 프레임 스프라이트를 돌린다 (n = 프레임 수) */
function spa(key,n,dur,cls){
  const d=SPR_SIZE[key]; if(!d) return '';
  const factor=(typeof ECO_OBJECT_KEYS!=='undefined'&&ECO_OBJECT_KEYS[key])?1:2;
  const fw=d[0]/n*factor, h=d[1]*factor;
  const delay=(-Math.random()*dur).toFixed(2);
  return `<div class="pxa ${cls||''}" style="width:${fw}px;height:${h}px;
    background-image:url('${SPRITES[key]}');background-size:${n*100}% 100%;
    animation:fr${n} ${dur}s steps(${n}) infinite;animation-delay:${delay}s"></div>`;
}
/* 바람에 흔들리는 소품 — 위상을 어긋나게 해야 자연스럽다 */
function spSway(key){
  const d=SPR_SIZE[ecoSceneryKey(key)]; if(!d) return '';
  const factor=(typeof ECO_OBJECT_KEYS!=='undefined'&&ECO_OBJECT_KEYS[key])?1:2;
  const simple=typeof ECO_SCENERY_KEYS!=='undefined'&&ECO_SCENERY_KEYS[ecoSceneryKey(key)];
  return `<img class="pxi sway ${simple?'eco-scenery-r37':''}" src="${ecoScenerySource(key)}" style="width:${d[0]*factor}px;height:${d[1]*factor}px;
    animation-delay:${(-Math.random()*3.8).toFixed(2)}s" alt="">`;
}
/* 픽셀 스프라이트를 정수 배율로 키워 보여준다 */
function sp(key,scale){
  const src=ecoScenerySource(key); if(!src) return '';
  const d=SPR_SIZE[ecoSceneryKey(key)]||[32,32];
  scale=(scale||2)/((typeof ECO_OBJECT_KEYS!=='undefined'&&ECO_OBJECT_KEYS[key])?2:1);
  const simple=typeof ECO_SCENERY_KEYS!=='undefined'&&ECO_SCENERY_KEYS[ecoSceneryKey(key)];
  return pxImg(src, d[0]*scale, d[1]*scale,simple?'eco-scenery-r37':'');
}

/* ---- 배경 소품 ---- */
function treeTall(){    return sp('pr_pine'); }
function treeRound(){   return spSway('pr_round'); }
function deadTreeSVG(){ return sp('pr_dead'); }
function stumpSVG(){    return sp('pr_stump'); }
function logSVG(){      return sp('pr_log'); }
function rockSVG(){     return sp('pr_rock'); }
function shroomImg(){   return sp('pr_shroom'); }
function plantImg(){    return spSway('pr_plant'); }
function flowerSVG(){   return spSway('pr_flower'); }
function trashSVG(){    return sp('pr_trash'); }
function reedSVG(){     return spSway('pr_reed'); }
function waveSVG(){     return spa('pr_wave',2,1.5); }
function shellSVG(){    return sp('pr_shell'); }
function coralSVG(){    return sp('pr_coral'); }
function buildingSVG(){ return sp('pr_building'); }
function stackSVG(){    return sp('pr_stack'); }
function binSVG(){      return sp('pr_bin'); }
function turbineSVG(){  return sp('pr_turbine'); }
function panelSVG(){    return sp('pr_panel'); }
function iceSVG(){      return sp('pr_ice'); }
function moundSVG(){    return sp('pr_mound'); }
function pondSVG(){     return sp('pr_pond'); }
function burrowSVG(){   return sp('pr_burrow'); }
function trackSVG(){    return sp('pr_track'); }
function butterflySVG(){
  const key='critter_'+(S.themeId||'forest');
  if(typeof ECO_DETAIL_KEYS!=='undefined'&&ECO_DETAIL_KEYS[key]) return `<div class="eco-butterfly" style="background-image:url('${SPRITES[key]}')"></div>`;
  return sp('critter');
}
function chestSVG(open){return sp(open?'pr_chest_open':'pr_chest'); }
function bushSVG(){     return sp('obj_gather'); }

/* ---- 월드 거점 ---- */
function npcSVG(){       return sp('obj_npc'); }
function campSVG(){      return spa('obj_craft',3,.42); }
function shopSVG(){      return sp('obj_shop'); }
function altarSVG(on){   return on?spa('obj_altar_on',2,1.1):sp('obj_altar'); }

/* ---- 몬스터 — 테마별 색이 다른 스프라이트를 쓴다 ---- */
function curMonIdx(){
  return Math.min(S?S.monIdx:0, CUR.monsters.length-1);
}
function monKey(i){
  if(Shadow.on) return null;
  if(Duel.on) return null;                  // 대련 상대는 NPC 그림을 쓴다
  if(Tw.on && Tw.mon){
    const tk='mob_'+Tw.mon.themeId+'_'+Tw.mon.idx;
    if(SPRITES[tk]) return tk;
  }
  const k='mob_'+((CUR&&CUR.id)||'forest')+'_'+i;
  return SPRITES[k]?k:'mob_forest_0';
}
/* 몸이 일렁이는 2프레임 + 숨쉬기를 함께 돌린다 */
function monsterSVG(i,size,cls){
  if(Shadow.on||Duel.on) return monsterArtBase(i,size,cls);
  const m=(Tw.on&&Tw.mon)||CUR.monsters[i]||{};
  const rank=m.boss?'boss':m.mid?'mid':'normal';
  return `<div class="monster-readable monster-${rank}" style="width:${size||64}px;height:${size||64}px"><div class="monster-scale">${monsterArtBase(i,size,cls)}</div></div>`;
}
function monsterArtBase(i,size,cls){
  size=size||64;
  if(Shadow.on){                            // 나 자신은 흑백으로
    return `<div style="width:${size}px;height:${size}px;display:flex;
      align-items:flex-end;justify-content:center" class="${cls||''}">
      <div style="transform:scale(${(size/88).toFixed(2)});transform-origin:bottom center">
        ${shadowSprite(88)}</div></div>`;
  }
  if(Duel.on && Duel.npc){                  // 대련 상대는 NPC 모습 그대로
    return `<div style="width:${size}px;height:${size}px;display:flex;
      align-items:flex-end;justify-content:center" class="${cls||''}">
      <div style="transform:scale(${(size/88).toFixed(2)});transform-origin:bottom center">
        ${npcArt(Duel.npc)}</div></div>`;
  }
  if(typeof ECO_MONSTER_ART!=='undefined' && ECO_MONSTER_ART[monKey(i)]) return `<div class="boss-r41 monster-r42 ${cls||''}" data-monster-key="${monKey(i)}" data-poses="idle,attack,hit" style="width:${size}px;height:${size}px;background-image:url('${ECO_MONSTER_ART[monKey(i)]}')"></div>`;
  if(typeof ECO_BOSS_ART!=='undefined' && ECO_BOSS_ART[monKey(i)]) return `<div class="boss-r41 ${cls||''}" data-boss-key="${monKey(i)}" data-poses="idle,attack,hit" style="width:${size}px;height:${size}px;background-image:url('${ECO_BOSS_ART[monKey(i)]}')"></div>`;
  if(typeof ECO_DETAIL_KEYS!=='undefined' && ECO_DETAIL_KEYS[monKey(i)] && monKey(i).startsWith('mob_')) return `<div class="eco-mon-art eco-mon-strip monster-r36 ${cls||''}" data-monster-key="${monKey(i)}" data-frames="${SPR_FRAMES[monKey(i)]||3}" style="width:${size}px;height:${size}px;background-image:url('${SPRITES[monKey(i)]}')"></div>`;
  if(typeof ECO_MON!=='undefined' && ECO_MON[monKey(i)]) return `<div class="eco-mon-art ${cls||''}" style="width:${size}px;height:${size}px;background-image:url('${ECO_MON[monKey(i)]}')"></div>`;
  return `<div class="pxa ${cls||''}" style="width:${size}px;height:${size}px;
    background-image:url('${SPRITES[monKey(i)]}');background-size:200% 100%;
    animation:fr2 .9s steps(2) infinite, mbr 2.6s ease-in-out infinite"></div>`;
}
function battleSpotSVG(i,col){
  return `<div style="position:relative;width:104px;height:96px">
    <div style="position:absolute;left:0;bottom:0">${sp('obj_battle')}</div>
    <div style="position:absolute;left:50%;bottom:28px;transform:translateX(-50%)">${monsterSVG(i,64)}</div>
  </div>`;
}

function arenaBG(){
  if(cinematicBattleView())return `<div class="battle-arena-bg" data-theme="${battleThemeId()}" data-phase="before" style="background-image:url('${ECO_BATTLE_ART[battleThemeId()]}')"></div><div class="battle-arena-shade"></div>`;
  if(typeof ECO_ART!=='undefined'){
    const g=clamp(S.gauge/100,0,1), art=typeof ECO_SCENES!=='undefined'?ECO_SCENES[CUR.id]:ECO_ART[CUR.id];
    return `<div class="eco-arena scenery-r37" data-phase="before" style="background-image:url('${art.before}')"></div><div class="eco-arena scenery-r37" data-phase="after" style="background-image:url('${art.after}');clip-path:circle(${Math.ceil(g*150)}% at 50% 70%)"></div><div class="eco-arena-shade"></div>`;
  }
  const a=CUR.arena||{sky:"linear-gradient(180deg,#243a22,#4a6b38)",far:"#1d2f1c",ground:"linear-gradient(180deg,#54733c,#3b5528)"};
  let far='';
  for(let i=0;i<9;i++){
    const x=i*12-4, h=42+((i*37)%40), w=17+((i*23)%12);
    far+=`<div style="position:absolute;left:${x}%;bottom:0;width:${w}%;height:${h}%;
      background:${a.far};border-radius:50% 50% 8% 8%/62% 62% 8% 8%;opacity:${.5+(i%3)*.15}"></div>`;
  }
  return `<div class="bsky" id="bsky" style="background:${a.sky}"></div>
    <div class="bfar">${far}</div>
    <div class="bground" style="background:${a.ground};box-shadow:inset 0 6px 18px rgba(0,0,0,.3)"></div>`;
}

/* 채집 보드 그림 선택기 — 새 테마는 여기에 종류만 추가하면 된다 */
function gatherArt(kind){
  switch(kind){
    case 'pine':   return sp('pr_pine');
    case 'round':  return sp('pr_round');
    case 'bush':   return sp('pr_bush');
    case 'mound':  return sp('pr_mound');
    case 'pond':   return sp('pr_pond');
    case 'rock':   return sp('pr_rock');
    case 'log':    return sp('pr_log');
    case 'burrow': return sp('pr_burrow');
    case 'stump':  return sp('pr_stump');
    case 'track':  return sp('pr_track');
    default:       return sp('pr_rock');
  }
}

function propGen(kind){
  return ({pine:treeTall, round:treeRound, rock:rockSVG, log:logSVG, shroom:shroomImg,
    plant:plantImg, dead:deadTreeSVG, trash:trashSVG, flower:flowerSVG,
    reed:reedSVG, wave:waveSVG, shell:shellSVG, building:buildingSVG, stack:stackSVG,
    turbine:turbineSVG, panel:panelSVG, ice:iceSVG, coral:coralSVG, bin:binSVG,
    mound:moundSVG, pond:pondSVG, stump:stumpSVG})[kind] || rockSVG;
}

var W, H, OBJS, PATH, SPAWN;



/* ==========================================================
   맵 위의 NPC — 테마마다 10명
     말을 걸면 퀴즈를 낸다 (한 명당 1~2문제)
     일부는 성격에 맞는 재료를 먼저 부탁한다
     퀴즈를 다 풀면 그 지역 사람들과 이야기를 마친 것
   ========================================================== */
function npcList(){ return (NPC_DATA[S.themeId] || NPC_DATA.forest); }
/* 몇 번째 NPC가 몇 마리를 요구하는지 */
var NPC_GATE = {3:2, 8:4};
/* 테마마다 2번째 NPC가 겨루기를 청한다 */
var NPC_DUEL = 2;
function npcIsDuel(i){ return i===NPC_DUEL; }
function duelWon(id){ return (S.duelWon||[]).indexOf(id)>=0; }
function npcNeed(i){ return NPC_GATE[i] || 0; }
function npcLocked(i){ return (S.monIdx||0) < npcNeed(i); }
function npcDone(id){ return (S.npcDone||[]).indexOf(id)>=0; }
function npcLeft(){ return npcList().filter(n=>!npcDone(n.id)).length; }

/* 지도 위에 고르게 흩되, 거점·길과 겹치지 않게 민다 */
/* 어떤 자리가 얼마나 여유로운지 — 값이 클수록 좋다 */
function spotScore(x, y, placed){
  let sc = 1e9;
  for(const o of OBJS)   sc = Math.min(sc, dist(x,y,o.x,o.y) - (o.r + 60));
  for(const o of placed) sc = Math.min(sc, dist(x,y,o.x,o.y) - 210);
  if(Wd.solid) for(const o of Wd.solid) sc = Math.min(sc, dist(x,y,o.x,o.y) - (o.r + 30));
  for(let i=0;i<PATH.length;i++){                    // 길 한가운데도 피한다
    const a=PATH[i], b=PATH[(i+1)%PATH.length];
    const L=dist(a.x,a.y,b.x,b.y); if(!L) continue;
    const t=clamp(((x-a.x)*(b.x-a.x)+(y-a.y)*(b.y-a.y))/(L*L),0,1);
    sc = Math.min(sc, dist(x,y,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t) - 40);
  }
  return sc;
}
function npcSpots(){
  if(Nd.spots && Nd.themeId===S.themeId) return Nd.spots;
  const list=npcList(), out=[];
  const grid=[[.16,.30],[.30,.62],[.16,.82],[.44,.24],[.44,.84],
              [.60,.46],[.72,.22],[.72,.74],[.88,.40],[.88,.68]];
  list.forEach((n,i)=>{
    const [fx,fy]=grid[i%grid.length];
    let best=null, bestSc=-1e9;
    for(let k=0; k<48; k++){                         // 제 구역 안에서 후보를 훑는다
      const a=k*2.4, r=(k===0)?0:(50+k*9);
      const x2=clamp(Math.round(W*fx+Math.cos(a)*r), 90, W-90);
      const y2=clamp(Math.round(H*fy+Math.sin(a)*r), 180, H-90);
      const sc=spotScore(x2,y2,out);
      if(sc>bestSc){ bestSc=sc; best={x:x2,y:y2}; }
      if(sc>40) break;                               // 충분히 넉넉하면 그만 찾는다
    }
    const x=best.x, y=best.y;
    const o=Object.assign({}, n, {x:x, y:y, need:npcNeed(i), i:i, duel:npcIsDuel(i)});
    if(npcCanWalk(n) && !o.duel && !o.need){        // 겨루기·잠긴 NPC 는 제자리를 지킨다
      o.walk=true; o.hx=x; o.hy=y; o.tx=x; o.ty=y; o.wait=Math.random()*120; o.flip=false;
    }
    out.push(o);
  });
  Nd.spots=out; Nd.themeId=S.themeId;
  return out;
}
var Nd={spots:null, themeId:null, near:null};
/* 걷는 그림이 있는 NPC 는 자기 자리 둘레를 천천히 돈다 */
function npcCanWalk(n){ return !!(n.sp && ((typeof ECO_WALK!=='undefined'&&ECO_WALK[n.sp]) || SPRITES[n.sp+'_w'])); }
function npcStepAll(dt){
  const L=$('npcLayer'); if(!L) return;
  npcSpots().forEach(n=>{
    if(!n.walk) return;
    const el=$('npc-'+n.id); if(!el) return;
    const me=dist(Wd.px,Wd.py,n.x,n.y);
    if(me<140 || S.modal){                                   // 주인공이 오면 멈춰 서서 바라본다
      if(me<140 && Math.abs(Wd.px-n.x)>8){
        n.flip=Wd.px>n.x;
        el.querySelectorAll('.npcsp,.eco-npc-visual').forEach(art=>{art.style.transform=n.flip?'scaleX(-1)':'';});
      }
      if(n.moving){ n.moving=false; el.classList.remove('walking'); }
      return;
    }
    if(n.wait>0){ n.wait-=dt*.06;
      if(n.moving){ n.moving=false; el.classList.remove('walking'); }
      return; }
    // 다른 NPC 와 너무 가까워지면 목적지를 다시 고른다
    for(const m of Nd.spots){
      if(m===n) continue;
      if(dist(n.x,n.y,m.x,m.y)<110){ n.wait=0; n.tx=n.hx; n.ty=n.hy; break; }
    }
    const dx=n.tx-n.x, dy=n.ty-n.y, d=Math.hypot(dx,dy);
    if(d<3){
      // 거점·소품과 겹치지 않는 곳만 목적지로 삼는다
      for(let k=0;k<12;k++){
        const a=Math.random()*6.28, r=50+Math.random()*90;
        const nx=clamp(n.hx+Math.cos(a)*r, 90, W-90);
        const ny=clamp(n.hy+Math.sin(a)*r, 180, H-90);
        const far=Nd.spots.every(m=>m===n || dist(nx,ny,m.x,m.y)>140);
        if((spotScore(nx,ny,[])>10 && far) || k===11){ n.tx=nx; n.ty=ny; break; }
      }
      n.wait=60+Math.random()*180;
      return;
    }
    const sp3=.03*dt;
    const mx=Math.min(sp3,d),oldX=n.x,oldY=n.y;
    const safe=(x,y)=>!hitSolid(Wd.solid,x,y) && OBJS.every(o=>dist(x,y,o.x,o.y)>o.r+20) && Nd.spots.every(o=>o===n||dist(x,y,o.x,o.y)>50);
    const nx=n.x+dx/d*mx,ny=n.y+dy/d*mx;
    if(safe(nx,n.y))n.x=nx;
    if(safe(n.x,ny))n.y=ny;
    const travel=Math.hypot(n.x-oldX,n.y-oldY);
    if(travel<.001){n.wait=25;n.tx=n.hx;n.ty=n.hy;n.moving=false;el.classList.remove('walking');return;}
    n.stride=(n.stride||0)+travel;
    const animated=el.querySelector('.eco-npc-walk');
    if(animated)animated.style.backgroundPosition=(Math.floor(n.stride/6)%4*100/3)+'% 0';
    if(Math.abs(dx)>2) n.flip = dx>0;
    if(!n.moving){ n.moving=true; el.classList.add('walking'); }
    el.style.left=Math.round(n.x)+'px';
    el.style.top=Math.round(n.y)+'px';
    el.style.zIndex=Math.floor(n.y);
    el.style.transform='translate(-50%,-100%)';
    el.querySelectorAll('.npcsp,.eco-npc-visual').forEach(sp=>{        // 그림만 뒤집는다
      sp.style.transform = n.flip ? 'scaleX(-1)' : '';
    });
  });
}

/* 사람 NPC는 주인공 레이어를 조합해 만든다 (그림을 따로 굽지 않는다) */
function npcArt(n){
  if(typeof ECO_HUMAN!=='undefined' && ECO_HUMAN[n.id]) return `<div class="eco-npc-visual"><div class="eco-npc-art" style="background-image:url('${ECO_HUMAN[n.id]}')"></div></div>`;
  if(typeof ECO_NPC!=='undefined' && ECO_NPC[n.sp]) return `<div class="eco-npc-visual"><div class="eco-npc-art" style="background-image:url('${ECO_NPC[n.sp]}')"></div>${typeof ECO_WALK!=='undefined'&&ECO_WALK[n.sp]?`<div class="eco-npc-walk" style="background-image:url('${ECO_WALK[n.sp]}')"></div>`:''}</div>`;
  if(n.sp){
    const wk=n.walk && SPRITES[n.sp+'_w'];
    return `<div class="npcsp anim2 idle" style="background-image:url('${SPRITES[n.sp]}')"></div>`
      + (wk?`<div class="npcsp anim2 walkart" style="background-image:url('${SPRITES[n.sp+'_w']}')"></div>`:'');
  }
  const [hair,outfit,skin,hc,acc]=n.look;
  const hk='head_'+hair+'_south', bk='body_'+outfit+'_south';
  return `<div class="npchuman">
    <div class="npclayer body" data-npc-tint="${bk}|${skin}_${hc}" style="background-image:url('${npcTint(bk,skin,hc)}')"></div>
    <div class="npclayer head" data-npc-tint="${hk}|${skin}_${hc}" style="background-image:url('${npcTint(hk,skin,hc)}')"></div>
    ${acc!=='none'?`<div class="npclayer head" style="background-image:url('${SPRITES['acc_'+acc]}')"></div>`:''}
  </div>`;
}
function npcTint(key,skin,hc){
  const tk=key+'|'+skin+'_'+hc;
  if(TINT[tk]) return TINT[tk];
  makeTintFor(key,tk,skin,hc);
  return SPRITES[key]||'';
}

function paintNpcs(){
  const L=$('npcLayer'); if(!L) return;
  L.innerHTML=npcSpots().map(n=>`
    <div class="npc ${npcDone(n.id)?'done':''}" id="npc-${n.id}"
         style="left:${n.x}px;top:${n.y}px;z-index:${Math.floor(n.y)}">
      ${npcArt(n)}
      <div class="npctag">${n.nm}</div>
      <div class="npcmk">${npcDone(n.id)?'✅':(npcLocked(n.i)?'🔒':(n.duel?'⚔️':'❓'))}</div>
    </div>`).join('');
}
function npcNear(){
  let best=null, bd=96;
  npcSpots().forEach(n=>{ const d=dist(Wd.px,Wd.py,n.x,n.y); if(d<bd){ bd=d; best=n; } });
  if(best!==Nd.near){
    document.querySelectorAll('#npcLayer .npc').forEach(e=>e.classList.remove('near'));
    Nd.near=best;
    if(best){ const el=$('npc-'+best.id); if(el) el.classList.add('near'); }
  }
}

/* ---- 대화 ---- */
var NQ={n:null, idx:0, picked:null, right:0};

/* 농장과 채집터에 서 있는 사람들 (지역이 바뀌어도 같다) */
var SIDE_NPC = {
  farm: [
    {id:'farm_a', nm:"밀짚모자 농부", role:"이 밭을 오래 일궜다",
     look:['messy','overall','tan','black','straw'],
     tip:"꽃은 <b>물을 준 날</b>에만 자라요.<br>하루는 채집을 마치거나 몬스터를 정화하면 지나가요.",
     item:'fl_dandelion', ask:"<b>민들레</b> 한 송이만 주면, 씨앗을 나눠 줄게.",
     give:{seed:'sunflower', n:2}},
    {id:'farm_log', nm:"재배일지 선생님", role:"밭을 매일 기록한다",
     look:['long','robe','light','brown','glasses'], journal:true,
     tip:"", item:null, ask:null, give:null},
    {id:'farm_b', nm:"떠돌이 상인", role:"진귀한 씨앗을 판다",
     look:['bob','robe','warm','blonde','none'],
     tip:"가축은 <b>먹이를 준 날</b>에만 산물을 내요.<br>원숭이에게 바나나를 주면 대신 돌봐 줘요.",
     item:'egg', ask:"<b>달걀</b> 하나면 귀한 씨앗과 바꿔 드리죠.",
     give:{seed:'hydrangea', n:1}},
  ],
  field: [
    {id:'field_a', nm:"채집 안내인", role:"도구 쓰는 법을 안다",
     look:['pony','cloak','light','brown','cap'],
     tip:"채집 지점마다 <b>맞는 도구</b>가 달라요.<br>도구가 맞으면 수학 문제가 나와요.",
     item:null, ask:null, give:{gold:20}},
    {id:'field_b', nm:"자연 관찰자", role:"작은 생물을 기록한다",
     look:['long','robe','deep','black','glasses'],
     tip:"돋보기로 <b>숨은 단서 3개</b>를 찾으면<br>비밀 상자의 자물쇠를 열 수 있어요.",
     item:null, ask:null, give:{gold:25}},
  ]
};
function sideNpc(where){ return SIDE_NPC[where] || []; }
function talkSide(n){
  releaseKeys(); playSfx('talk');
  NQ={n:n, idx:0, picked:null, right:0, gave:false, side:true};
  S.modal='sideNpc'; drawModal();
}
/* ---- 재배일지 ---- */
var JRN = 'plot';
function jrnTab(t){ JRN=t; drawModal(); }
function jrnStage(pl){
  if(!pl.seed) return {t:'빈 화단', ico:'pr_plot', n:-1};
  const names=['씨앗','새싹','봉오리','활짝 폈어요'];
  const ico = pl.stage===0 ? 'fl_seed'
            : pl.stage===1 ? 'fl_sprout'
            : 'fl_'+pl.seed+(pl.stage===2?'_bud':'_full');
  return {t:names[pl.stage], ico:ico, n:pl.stage};
}
function mJournal(){
  const F=farmData();
  const head=`<div class="mhead"><span>📔 재배일지</span>
      <span style="font-size:12px;color:var(--gold)">${S.day}일째</span></div>
    <div class="lookrow" style="justify-content:center">
      ${[['plot','밭 상태'],['how','키우는 법'],['book','꽃 도감']].map(([k,nm])=>
        `<div class="tool ${JRN===k?'on':''}" onclick="jrnTab('${k}')"><div class="tn">${nm}</div></div>`).join('')}
    </div>`;

  if(JRN==='how'){
    return head+`<div class="card" style="font-size:13px;line-height:2">
      <b style="color:var(--gold)">① 심기</b> — 빈 화단에서 🌰 씨앗 심기<br>
      <b style="color:var(--gold)">② 물 주기</b> — 🚿 를 누르면 <b>바로 한 단계</b> 자라요<br>
      <b style="color:var(--gold)">③ 물 채우기</b> — 물통이 비면 밖에서 채워 와요<br>
      <b style="color:var(--gold)">④ 수확</b> — 활짝 피면 ✂️ 로 거둬요
    </div>
    <div class="card" style="font-size:13px;line-height:1.9">
      💧 지금 물통은 <b>${canInfo().nm}</b> · <b>${canCap()}칸</b>이에요.<br>      ${canLv()<CANS.length-1?`🪣 가판대에서 <b>${CANS[canLv()+1].nm}</b>(${CANS[canLv()+1].cap}칸)로 바꿀 수 있어요<br>`:''}
      🧺 채집을 마치면 <b>+${canInfo().gather}</b> · ⚔️ 몬스터를 정화하면 <b>+${canInfo().battle}</b><br>
      🪣 하루에 한 번 우물에서 <b>+${CAN_WELL}</b><br>
      <span style="opacity:.8">물은 아껴 써야 해요. 어디에 줄지 골라 보세요.</span>
    </div>
    <div class="note">씨앗은 가판대에서 사거나, 채집할 때 가끔 주울 수 있어요 🌰</div>
    <button class="btn" onclick="sideBack()">알겠어요</button>`;
  }

  if(JRN==='book'){
    const rows=Object.entries(FLOWERS).map(([k,f])=>{
      const have=(S.seeds[k]||0), got=(S.produce['fl_'+k]||0);
      return `<div class="row" style="align-items:center;gap:8px;font-size:12.5px">
        ${shopIcon('fl_'+k+'_full',32)}
        <div style="flex:1">${f.nm}
          <span style="opacity:.6">· ${f.days}일 · ${f.price}골드</span></div>
        <div style="width:86px;text-align:right;opacity:${have||got?1:.4}">
          씨앗 ${have} · 거둠 ${got}</div></div>`;
    }).join('');
    return head+`<div style="max-height:44vh;overflow-y:auto">${rows}</div>
      <div class="note">자라는 날이 길수록 비싸게 팔려요</div>
      <button class="btn" onclick="sideBack()">닫기</button>`;
  }

  // 밭 상태
  const cells=F.plots.map((pl,i)=>{
    const st=jrnStage(pl);
    const wet = pl.seed && pl.stage<3;
    return `<div style="text-align:center;padding:4px 2px;border-radius:8px;
        background:${pl.seed?(pl.stage>=3?'rgba(246,201,79,.18)':'rgba(255,255,255,.05)'):'transparent'}">
      <div style="display:flex;justify-content:center">${shopIcon(st.ico,34)}</div>
      <div style="font-size:10px;margin-top:2px">${pl.seed?FLOWERS[pl.seed].nm:'-'}</div>
      <div style="font-size:10px;color:${pl.stage>=3&&pl.seed?'var(--gold)':'rgba(251,246,234,.6)'}">
        ${st.t}</div>
      ${wet?`<div style="font-size:11px">💧${3-pl.stage}</div>`:'<div style="height:14px"></div>'}
    </div>`;
  }).join('');
  const planted=F.plots.filter(p=>p.seed).length;
  const dry=F.plots.filter(p=>p.seed&&!p.wet&&p.stage<3).length;
  const ripe=F.plots.filter(p=>p.seed&&p.stage>=3).length;
  return head+`
    <div class="card" style="font-size:13px;line-height:1.9">
      심은 화단 <b>${planted}</b> / 12
      ${ripe?` · <b style="color:var(--gold)">${ripe}칸 수확할 수 있어요 ✂️</b>`:''}
      ${dry?`<br><b style="color:${canLeft()?'var(--gold)':'var(--danger)'}">${dry}칸이 더 자랄 수 있어요 · 물통 💧${canLeft()}/${canCap()}</b>`
           :(planted?'<br><span style="color:var(--green)">모두 활짝 폈어요 🌸</span>':'')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;
      background:rgba(24,20,34,.3);padding:6px;border-radius:10px">${cells}</div>
    <div class="note">💧 옆 숫자 = 활짝 피기까지 물을 줄 횟수</div>
    <button class="btn" onclick="sideBack()">닫기</button>`;
}

function mSideNpc(){
  const n=NQ.n; if(!n) return '';
  if(n.journal) return mJournal();
  const done=npcDone(n.id);
  const head=`<div class="mhead"><span>${n.nm}</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">${n.role}</span></div>`;
  const body=`<div class="encounter">${npcArt(n)}</div>
    <div class="dialogue"><div class="who">💬 ${n.nm}</div>${n.tip}</div>`;
  if(done || !n.item){
    return head+body+(done?'':`<div class="note">알려 줘서 고마워요!</div>`)
      +`<button class="btn" onclick="${done?'sideBack()':'sideTake()'}">${done?'돌아가기':'고맙습니다'}</button>`;
  }
  const have=itemCount(n.item);
  return head+body+`
    <div class="card" style="font-size:13px">${n.ask}<br>
      가진 것: <b style="color:${have?'var(--gold)':'var(--danger)'}">${itemInfo(n.item).nm} ${have}개</b></div>
    <button class="btn ${have?'':'sec'}" onclick="${have?'sideTake()':''}">
      ${have?'건네주기':'아직 없어요'}</button>
    <button class="btn sec" onclick="sideBack()">나중에</button>`;
}
function sideTake(){
  const n=NQ.n;
  if(n.item){
    if(itemCount(n.item)<1) return;
    if(S.produce && S.produce[n.item]!=null) S.produce[n.item]--;
    else if(S.mats) S.mats[n.item]--;
  }
  if(!S.npcDone) S.npcDone=[];
  if(!npcDone(n.id)) S.npcDone.push(n.id);
  const g=n.give||{};
  let msg=[];
  if(g.seed){ addSeed(g.seed, g.n||1); msg.push(`${FLOWERS[g.seed].nm} 씨앗 ${g.n||1}개`); }
  if(g.gold){ S.gold+=g.gold; msg.push(`${g.gold}골드`); }
  autosave(); sideBack(); paintHud();
  toast(msg.length? `${msg.join(' · ')}를 받았어요 🎁` : "고마워요!");
}
function sideBack(){
  if(NQ.n && String(NQ.n.id).slice(0,4)==='farm') rBack();
  else fBack();
}
function talkNpc(n){
  releaseKeys(); playSfx('talk');
  if(n.need && npcLocked(n.i)){
    toast(`${n.nm}${J(n.nm,'은','는')} 아직 마음을 열지 않았어요 🔒<br>`
      + `이 지역 몬스터를 <b>${n.need}마리</b> 정화하면 이야기해 줘요 (지금 ${S.monIdx||0}마리)`);
    return;
  }
  NQ={n:n, idx:0, picked:null, right:0, gave:false};
  S.modal='npc'; drawModal();
}
function mNpc(){
  const n=NQ.n; if(!n) return '';
  const pool=(CUR.quiz||[]).concat(CUR.quizAdv||[]);
  const done=npcDone(n.id);
  const head=`<div class="mhead"><span>${n.nm}</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">${n.role}</span></div>`;
  if(done&&!NQ.practice){
    return head+`<div class="encounter">${npcArt(n)}</div>
      <div class="dialogue">고마워요! 배운 내용을 다시 연습해 볼까요?</div>
      <button class="btn" onclick="npcPractice()">퀴즈 다시 연습하기</button>
      <button class="btn" onclick="closeModal()">돌아가기</button>`;
  }
  // 겨루기를 청하는 NPC — 이기기 전에는 퀴즈로 넘어가지 않는다
  if(n.duel && !duelWon(n.id)){
    return head+`<div class="encounter">${npcArt(n)}</div>
      <div class="dialogue"><div class="who">⚔️ ${n.nm}</div>
        말로만 지키겠다는 사람은 많았지.<br>
        <b>네게 정말 지킬 힘이 있는지</b> 내가 보아야겠다.<br>
        <span style="opacity:.75">한 판 겨루자. 다치지 않게 봐줄 테니 걱정 말고.</span></div>
      <div class="card" style="font-size:12.5px;line-height:1.8">
        내 체력 <b>${S.hpCur} / ${baseStats().hpMax}</b> · 기력 <b>${S.spCur}</b><br>
        <span style="opacity:.7">져도 잃는 것은 없어요. 다시 도전할 수 있어요.</span>
      </div>
      <button class="btn" onclick="startDuel()">겨뤄 보기</button>
      <button class="btn sec" onclick="closeModal()">다음에요</button>`;
  }
  // 재료를 부탁하는 NPC
  if(n.item && !NQ.gave && !NQ.practice){
    const have=itemCount(n.item);
    return head+`<div class="encounter">${npcArt(n)}</div>
      <div class="dialogue">${n.ask}</div>
      <div class="card" style="font-size:13px">
        가진 것: <b style="color:${have?'var(--gold)':'var(--danger)'}">${itemInfo(n.item).nm} ${have}개</b>
        ${have?'':'<br><span style="opacity:.7">농장에서 기르거나 가판대에서 살 수 있어요</span>'}
      </div>
      <button class="btn ${have?'':'sec'}" onclick="${have?'npcGive()':''}">
        ${have?'건네주기':'아직 없어요'}</button>
      <button class="btn sec" onclick="closeModal()">나중에</button>`;
  }
  const q=pool[n.q[NQ.idx] % pool.length];
  const picked=NQ.picked;
  const opts=q.o.map((t,i)=>{
    let cls='';
    if(picked!=null) cls = (i===q.a)?' on' : (i===picked?' bad':'');
    return `<button class="btn sec${cls}" style="text-align:left"
      onclick="npcAnswer(${i})" ${picked!=null?'disabled':''}>${i+1}. ${t}</button>`;
  }).join('');
  return head+`<div class="encounter" style="padding-bottom:2px">${npcArt(n)}</div>
    <div class="card" style="font-size:14.5px;line-height:1.7">${q.q}</div>
    <div style="font-size:11.5px;opacity:.6;text-align:right">문제 ${NQ.idx+1} / ${n.q.length}</div>
    ${opts}
    ${picked!=null
      ? `<div class="note">${picked===q.a?'✅ 정답!':'❌ 아쉬워요'} ${q.e}</div>
         <button class="btn" onclick="${picked===q.a?'npcNext()':'npcRetry()'}">${picked!==q.a?'↻ 이 문제 다시 풀기':NQ.idx+1<n.q.length?'다음 문제':'이야기 마치기'}</button>`
      : `<div class="note">💡 ${q.h||'천천히 생각해 보세요'}</div>`}`;
}
/* ---- 대련 ---- */
var Duel={on:false, npc:null};
function duelFoe(n){
  const st=baseStats();
  const mid=(CUR.monsters||[])[2] || {};        // 미니게임 단계(중간 몬스터) 만큼
  return {
    name:n.nm, kind:'duel', duelSp:n.sp||null, duelLook:n.look||null,
    hp: Math.round(st.hpMax*1.15 + 40),
    atk: Math.round(st.atk*0.82),
    exp: 26, gold: 30, gauge: 6,
    mode:'turn', fixed:true, mid:true, boss:false,
    pat:'def', patName:"기 겨루기", patRate:.25,
    meet:`${n.nm}${J(n.nm,'이','가')} 자세를 잡았다!`,
    after:"좋아, 네게는 지킬 힘이 있구나."
  };
}
function startDuel(){
  releaseKeys();
  Duel={on:true, npc:NQ.n};
  Duel.mon=duelFoe(NQ.n);
  closeModal(); stopLoop();
  wipeIn(mountBattle);
}
function duelEnd(win){
  const n=Duel.npc;
  Duel.on=false;
  if(win){
    if(!S.duelWon) S.duelWon=[];
    if(!duelWon(n.id)) S.duelWon.push(n.id);
    autosave();
  }
  closeBattleDom&&closeBattleDom();
  const host=$('bResult'); if(host) host.innerHTML='';
  B=null;
  S.scene='world';
  render();
  NQ={n:n, idx:0, picked:null, right:0, gave:false};
  S.modal = win ? 'duelWin' : 'duelLose';
  drawModal();
  if(!Wd.raf) startLoop();
}
function mDuelWin(){
  const n=Duel.npc||NQ.n;
  return `<div class="mhead"><span>⚔️ ${n.nm}${J(n.nm,'과','와')}의 겨루기</span></div>
    <div class="encounter">${npcArt(n)}</div>
    <div class="dialogue"><div class="who">${n.nm}</div>
      좋아, 네게는 지킬 힘이 있구나.<br>
      이제 내가 아는 것을 알려 주지.</div>
    <button class="btn" onclick="S.modal='npc';drawModal()">이야기 듣기</button>`;
}
function mDuelLose(){
  const n=Duel.npc||NQ.n;
  return `<div class="mhead"><span>⚔️ 아직은 이르구나</span></div>
    <div class="encounter" style="opacity:.8">${npcArt(n)}</div>
    <div class="dialogue"><div class="who">${n.nm}</div>
      힘을 더 기르고 오너라.<br>
      몬스터를 정화하고 장비를 갖추면 달라질 게다.</div>
    <button class="btn" onclick="closeModal()">돌아가기</button>`;
}
function itemCount(k){
  if(!k) return 0;
  if(S.produce && S.produce[k]!=null) return S.produce[k];
  if(S.mats && S.mats[k]!=null) return S.mats[k];
  return 0;
}
function npcGive(){
  const n=NQ.n, k=n.item;
  if(itemCount(k)<1) return;
  if(S.produce && S.produce[k]!=null) S.produce[k]--;
  else if(S.mats) S.mats[k]--;
  NQ.gave=true; autosave(); drawModal();
  toast(`${itemInfo(k).nm}${J(itemInfo(k).nm,'을','를')} 건넸어요 🎁`);
}
function npcPractice(){NQ.idx=0;NQ.picked=null;NQ.right=0;NQ.practice=true;drawModal();}
function npcRetry(){NQ.picked=null;drawModal();}
function npcAnswer(i){const pool=CUR.quiz.concat(CUR.quizAdv),q=NQ.n&&pool[NQ.n.q[NQ.idx]%pool.length];if(NQ.picked!==null||!q||!Number.isInteger(i)||i<0||i>=q.o.length)return;NQ.picked=i;drawModal();}
function npcNext(){
  const n=NQ.n;
  const pool=(CUR.quiz||[]).concat(CUR.quizAdv||[]);
  const q=pool[n.q[NQ.idx] % pool.length];
  if(!q||NQ.picked!==q.a)return;
  NQ.right++;
  NQ.idx++; NQ.picked=null;
  if(NQ.idx<n.q.length){ drawModal(); return; }
  if(NQ.practice||npcDone(n.id)){toast('연습을 마쳤어요. 보상은 처음 한 번만 받아요.');closeModal();return;}
  // 이야기 끝 — 보상
  if(!S.npcDone) S.npcDone=[];
  if(!npcDone(n.id)) S.npcDone.push(n.id);
  const g=addGauge(NQ.right*3);
  const gold=6+NQ.right*4, exp=5+NQ.right*4;
  S.gold+=gold; addExp(exp); S.tickets++;
  autosave();
  NQ.reward={g:g, gold:gold, exp:exp};      // 그리기 전에 먼저 담는다
  S.modal='npcEnd'; drawModal();
  paintHud();
}
function mNpcEnd(){
  const n=NQ.n, r=NQ.reward||{g:0,gold:0,exp:0};
  const left=npcLeft();
  return `<div class="mhead"><span>🗣️ ${n.nm}와의 이야기 끝!</span></div>
    <div class="card" style="font-size:13.5px;line-height:1.9;text-align:center">
      맞힌 문제 <b style="color:var(--gold)">${NQ.right} / ${n.q.length}</b><br>
      정화 <b style="color:var(--green)">+${r.g}%</b> · 골드 <b>+${r.gold}</b> · 경험치 <b>+${r.exp}</b><br>
      🎁 뽑기권 <b>+1</b>
    </div>
    <div class="note">${left? `이 지역에 아직 <b>${left}명</b>이 더 있어요` : '이 지역 사람들과 모두 이야기했어요! 🎉'}</div>
    <button class="btn" onclick="closeModal()">돌아가기</button>`;
}


/* ==========================================================
   소리 — 악보와 효과음 자료를 그 자리에서 연주한다.
   음악 파일을 담지 않아 용량이 거의 늘지 않고 저작권 문제도 없다.
   ========================================================== */
var Au = {ctx:null, gain:null, on:true, vol:.55, cur:null, timer:null, at:0, muted:false};
var NOTE_PC = {C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};

function auInit(){
  if(Au.ctx) return Au.ctx;
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    Au.ctx = new AC();
    Au.gain = Au.ctx.createGain();
    Au.gain.gain.value = Au.muted ? 0 : Au.vol;
    Au.gain.connect(Au.ctx.destination);
  }catch(e){ Au.ctx=null; }
  return Au.ctx;
}
function auResume(){
  const c=auInit(); if(!c) return;
  if(c.state==='suspended') c.resume();
}
function noteHz(n){
  if(n==='.'||n==='-') return 0;
  const pc=NOTE_PC[n.slice(0,-1)], oc=+n.slice(-1);
  if(pc===undefined) return 0;
  return 440*Math.pow(2,(pc+(oc-4)*12-9)/12);
}
/* 사각파는 기본 파형에 없으므로 듀티를 가진 주기 파형을 만들어 쓴다 */
var _waveCache={};
function squareWave(duty){
  const key='d'+duty;
  if(_waveCache[key]) return _waveCache[key];
  const N=32, re=new Float32Array(N), im=new Float32Array(N);
  for(let k=1;k<N;k++){
    re[k]=0;
    im[k]=(2/(k*Math.PI))*Math.sin(Math.PI*k*duty);
  }
  const w=Au.ctx.createPeriodicWave(re,im);
  _waveCache[key]=w;
  return w;
}

/* ---- 효과음 ---- */
function playSfx(name){
  if(!Au.on||Au.muted) return;
  const c=auInit(); if(!c||!SFX[name]) return;
  const t0=c.currentTime+.005;
  SFX[name].forEach(p=>{
    const g=c.createGain();
    g.connect(Au.gain);
    g.gain.setValueAtTime(p.v, t0+p.t);
    g.gain.exponentialRampToValueAtTime(.0008, t0+p.t+p.d);
    if(p.w==='nz'){
      const n=Math.max(1,Math.floor(c.sampleRate*p.d));
      const b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
      for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.4);
      const src=c.createBufferSource(); src.buffer=b;
      src.connect(g); src.start(t0+p.t);
    } else {
      const o=c.createOscillator();
      if(p.w==='tri') o.type='triangle';
      else o.setPeriodicWave(squareWave(p.duty||.5));
      o.frequency.setValueAtTime(p.f0, t0+p.t);
      if(p.f1!==p.f0) o.frequency.linearRampToValueAtTime(p.f1, t0+p.t+p.d);
      o.connect(g); o.start(t0+p.t); o.stop(t0+p.t+p.d+.02);
    }
  });
}

/* ---- 배경음악 ---- */
function bgmCut(){
  if(Au.timer){ clearTimeout(Au.timer); Au.timer=null; }
  if(Au.voice){                                    // 예약된 음까지 한 번에 끊는다
    const v=Au.voice, c=Au.ctx;
    try{
      v.gain.cancelScheduledValues(c.currentTime);
      v.gain.setValueAtTime(v.gain.value, c.currentTime);
      v.gain.linearRampToValueAtTime(0, c.currentTime+.12);
      setTimeout(()=>{ try{ v.disconnect(); }catch(e){} }, 300);
    }catch(e){ try{ v.disconnect(); }catch(e2){} }
    Au.voice=null;
  }
  Au.at=0;
}
function bgmPlay(key){
  if(Au.cur===key) return;
  bgmCut();
  Au.cur=key;
  if(!BGM[key]) return;
  const c=auInit(); if(!c) return;
  Au.voice=c.createGain();
  Au.voice.gain.value=1;
  Au.voice.connect(Au.gain);
  bgmLoop();
}
function bgmStop(){
  Au.cur=null;
  bgmCut();
}
/* 한 바퀴씩 미리 예약하고, 끝나기 전에 다음 바퀴를 잇는다 */
function bgmLoop(){
  const key=Au.cur, tk=BGM[key];
  if(!tk || !Au.voice) return;
  const c=Au.ctx;
  const step=60/tk.bpm/4;
  const cells0=tk.t[0].p.split(/\s+/).filter(Boolean);
  const bars=cells0.length;
  const start=Math.max(c.currentTime+.06, Au.at||0);

  if(Au.on && !Au.muted){
    tk.t.forEach(tr=>{
      const cells=tr.p.split(/\s+/).filter(Boolean);
      if(tr.r==='drum'){
        cells.forEach((cc,i)=>{
          if(cc!=='x'&&cc!=='s'&&cc!=='h') return;
          const t=start+i*step;
          const dur=step*(cc==='x'?1.6:(cc==='s'?1.1:.45));
          const g=c.createGain(); g.connect(Au.voice||Au.gain);
          const lv=cc==='x'?.5:(cc==='s'?.34:.14);
          g.gain.setValueAtTime(lv,t);
          g.gain.exponentialRampToValueAtTime(.0008,t+dur);
          if(cc==='x'){
            const o=c.createOscillator(); o.type='sine';
            o.frequency.setValueAtTime(105,t);
            o.frequency.exponentialRampToValueAtTime(42,t+dur);
            o.connect(g); o.start(t); o.stop(t+dur+.02);
          } else {
            const n=Math.max(1,Math.floor(c.sampleRate*dur));
            const b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
            const pw=cc==='s'?2.2:4.5;
            for(let i2=0;i2<n;i2++) d[i2]=(Math.random()*2-1)*Math.pow(1-i2/n,pw);
            const src=c.createBufferSource(); src.buffer=b;
            src.connect(g); src.start(t);
          }
        });
        return;
      }
      let i=0;
      while(i<cells.length){
        const cc=cells[i];
        if(cc==='.'||cc==='-'){ i++; continue; }
        let hold=1;
        while(i+hold<cells.length && cells[i+hold]==='-') hold++;
        const f=noteHz(cc);
        if(f>0){
          const t=start+i*step, dur=step*hold;
          const g=c.createGain(); g.connect(Au.voice||Au.gain);
          const lv=tk.vol*(tr.r==='bass'?.55:1);
          g.gain.setValueAtTime(0,t);
          g.gain.linearRampToValueAtTime(lv,t+.012);
          g.gain.exponentialRampToValueAtTime(.0008,t+dur*.98);
          const o=c.createOscillator();
          if(tr.r==='bass') o.type='triangle';
          else o.setPeriodicWave(squareWave(tk.duty));
          o.frequency.setValueAtTime(f,t);
          o.connect(g); o.start(t); o.stop(t+dur+.02);
        }
        i+=hold;
      }
    });
  }
  const len=bars*step;
  Au.at=start+len;
  Au.timer=setTimeout(bgmLoop, Math.max(80,(len-.35)*1000));
}

/* 지금 있는 곳에 맞는 곡을 고른다 */
function bgmPick(){
  if(typeof Tw!=='undefined' && Tw.on) return 'tower';
  if(typeof B!=='undefined' && B) return 'battle';
  if(S && S.modal==='farm') return 'farm';
  if(!S || !S.themeId) return 'forest';
  const clean=(S.gauge||0)>=100 || (S.cleared||[]).includes(S.themeId);
  return S.themeId + (clean ? '' : '_dirty');
}
function bgmUpdate(){
  const k=bgmPick();
  if(k!==Au.cur) bgmPlay(k);
}
function auToggle(){
  Au.muted=!Au.muted;
  if(Au.gain) Au.gain.gain.value = Au.muted?0:Au.vol;
  try{ localStorage.setItem('eco_mute', Au.muted?'1':'0'); }catch(e){}
  const b=$('muteBtn'); if(b) b.textContent = Au.muted?'🔇':'🔊';
  if(!Au.muted){ auResume(); Au.cur=null; bgmUpdate(); }
}
try{ Au.muted = localStorage.getItem('eco_mute')==='1'; }catch(e){}


/* ==========================================================
   관리자 모드 — 만든 사람이 직접 돌려 보며 버그를 찾기 위한 것
   번호를 넣어야 열리고, 켜져 있으면 화면 위에 늘 표시된다.
   ========================================================== */
var ADMIN_PIN = '4828';
var Adm = {pin:'', on:false};

function admOpen(){ Adm.pin=''; S.modal='admin'; drawModal(); }
function admKey(d){
  if(d==='c'){ Adm.pin=''; }
  else if(d==='b'){ Adm.pin=Adm.pin.slice(0,-1); }
  else if(Adm.pin.length<6){ Adm.pin+=d; }
  drawModal();
  if(Adm.pin.length===4) setTimeout(admTry,180);
}
function admTry(){
  if(Adm.pin!==ADMIN_PIN){
    Adm.pin='';
    drawModal();
    toast('번호가 달라요');
    return;
  }
  admApply();
}
function mAdmin(){
  const dots=[0,1,2,3].map(i=>`<span style="display:inline-block;width:16px;height:16px;
    border-radius:50%;margin:0 5px;background:${i<Adm.pin.length?'var(--gold)':'rgba(251,246,234,.22)'}"></span>`).join('');
  const keys=[1,2,3,4,5,6,7,8,9,'c',0,'b'].map(k=>`
    <button class="btn sec" style="flex:0 0 30%;padding:14px 0;font-size:18px;margin:2px"
      onclick="admKey('${k}')">${k==='c'?'✕':(k==='b'?'←':k)}</button>`).join('');
  return `<div class="mhead"><span>🔧 관리자 모드</span></div>
    <div class="card" style="text-align:center;padding:14px">
      <div style="font-size:13px;opacity:.75">관리자 번호를 입력하세요</div>
      <div style="margin:12px 0">${dots}</div>
    </div>
    <div class="row" style="flex-wrap:wrap;justify-content:center">${keys}</div>
    <button class="btn sec" onclick="closeModal()">돌아가기</button>`;
}

/* 켜면 게임 전체를 열어 둔다 */
function admApply(){
  Adm.on = true;
  if(!S || !S.code){                       // 제목 화면에서 켰다면 판을 새로 만든다
    S = newState();
    S.name = '관리자'; S.grade = 5; S.code = makeCode();
    S.petKey = 'earth'; S.petStage = 2;
    applyTheme('forest');
  }
  S.lv = MAX_LV; S.exp = LEVELS[MAX_LV-1].need;
  S.gold = 999999; S.tickets = 99;
  S.hpCur = baseStats().hpMax; S.spCur = baseStats().spMax;

  // 장비 전부 (전설 포함) — 가장 좋은 것으로 착용
  S.owned = [];
  ['weapon','armor','helm','shoes'].forEach(sl=>{
    const list = gearList(sl);
    list.forEach(i=>S.owned.push(i.id));
    const best = (GEAR_ALL[sl]||[]).slice(-1)[0];
    if(best) S.gear[sl] = best.id;
  });

  // 모든 지역 정화 완료 + 퀘스트 완료
  S.cleared = THEME_ORDER.slice();
  S.progress = S.progress || {};
  THEME_ORDER.forEach(id=>{
    const npc = (NPC_DATA[id]||[]).map(n=>n.id);
    const duel = (NPC_DATA[id]||[]).filter((n,i)=>npcIsDuel(i)).map(n=>n.id);
    S.progress[id] = Object.assign({}, S.progress[id], {
      gauge:100, lessonDone:true, quizDone:true, advDone:true,
      quizScored:[], quizWrong:[], retryQueue:[],
      monIdx:5, battleDone:true, gatherDone:true, boxOpen:true,
      clues:{}, gboard:null, mats:{}, dex:[], dexBonus:0, crafted:[],
      npcDone:npc
    });
    (THEMES[id].gather.clues||[]).forEach(c=>{ S.progress[id].clues[c.id]=true; });
    S.duelWon = (S.duelWon||[]).concat(duel);
  });
  // 지금 있는 지역에도 그대로 반영
  const cur = S.progress[S.themeId] || {};
  THEME_FIELDS.forEach(k=>{ if(cur[k]!==undefined) S[k]=cur[k]; });
  S.npcDone = (NPC_DATA[S.themeId]||[]).map(n=>n.id);
  ['farm_a','farm_b','field_a','field_b'].forEach(id=>{
    if(!S.npcDone.includes(id)) S.npcDone.push(id);
  });

  // 농장도 열어 둔다
  S.farm = newFarm();
  S.farm.pens[0] = {kind:'monkey', age:9, adult:true, fed:true, tick:0};
  Object.keys(FLOWERS).forEach(k=>addSeed(k,9));
  Object.keys(PRODUCE).forEach(k=>addProduce(k,20));
  S.day = 20;
  S.tower = {best:0, bestTime:0, runs:0, history:[]};

  autosave();
  closeModal();
  S.scene = 'world';
  const sc=$('screen'); if(sc) sc.innerHTML='';
  render();
  admBadge();
  toast('🔧 <b>관리자 모드</b>가 켜졌어요<br>모든 지역·장비·퀘스트가 열렸습니다');
}

/* 켜져 있음을 늘 보이게 */
function admBadge(){
  if(!Adm.on) return;
  let b=$('admBadge');
  if(!b){
    b=document.createElement('div');
    b.id='admBadge';
    b.style.cssText='position:fixed;left:8px;top:8px;z-index:9999;pointer-events:auto;'
      +'background:rgba(212,64,64,.92);color:#fff;font-size:11px;padding:3px 8px;'
      +'border-radius:8px;font-family:sans-serif;cursor:pointer';
    b.textContent='🔧 관리자 · '+ECO_BUILD_ID;
    b.onclick=admPanel;
    document.body.appendChild(b);
  }
}
/* 검사할 때 쓰는 도구 상자 */
function admPanel(){ S.modal='adminPanel'; drawModal(); }
function mAdminPanel(){
  return `<div class="mhead"><span>🔧 관리자 도구</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">Lv${S.lv} · 🪙${S.gold}</span></div>
    <div class="note">버그를 찾기 위한 화면이에요. 아이들에게는 보이지 않습니다.</div>
    <div class="row"><button class="btn sec" onclick="admGo('forest')">숲</button>
      <button class="btn sec" onclick="admGo('river')">강</button>
      <button class="btn sec" onclick="admGo('ocean')">바다</button></div>
    <div class="row"><button class="btn sec" onclick="admGo('city')">도시</button>
      <button class="btn sec" onclick="admGo('air')">대기</button>
      <button class="btn sec" onclick="admGo('climate')">기후</button></div>
    <div class="row"><button class="btn sec" onclick="admSet('gauge',0)">정화 0%</button>
      <button class="btn sec" onclick="admSet('gauge',100)">정화 100%</button>
      <button class="btn sec" onclick="admHeal()">체력 회복</button></div>
    <div class="row"><button class="btn sec" onclick="admMon(-1)">◀ 몬스터</button>
      <button class="btn sec" onclick="admMon(1)">몬스터 ▶</button>
      <button class="btn sec" onclick="admFight()">전투 시작</button></div>
    <div class="admin-monster-preview">${monsterSVG(curMonIdx(),76)}</div>
    <div class="note">지금 상대: ${curMon()?curMon().name:'-'} (${curMonIdx()+1}/${CUR.monsters.length})</div>
    <div style="font-size:12px;color:var(--gold);margin-top:2px">미니게임 바로 열기</div>
    <div class="row"><button class="btn sec" onclick="admMini('pang')">🧹 플로킹</button>
      <button class="btn sec" onclick="admMini('spheres')">🔵 칸 채우기</button>
      <button class="btn sec" onclick="admMini('timing')">✦ 정령 바운스</button></div>
    <div class="row"><button class="btn sec" onclick="admMini('match')">🧩 정화 퍼즐</button>
      <button class="btn sec" onclick="admMini('runner')">➜ 정화 질주</button>
      <button class="btn sec" onclick="admMini('math')">➗ 수학</button></div>
    <div class="row"><button class="btn sec" onclick="admReset()">퀘스트 되돌리기</button>
      <button class="btn sec" onclick="admOff()">관리자 끄기</button></div>
    <button class="btn" onclick="closeModal()">닫기</button>`;
}
/* 미니게임을 곧바로 연다 — 검증용 */
function admMini(mode){
  closeModal();
  if(mode==='math'){                       // 수학은 채집터 안에 있다
    if(S.scene!=='world'){ toast('마을에서 눌러 주세요'); return; }
    enterField();
    setTimeout(()=>{
      const n=(Fd.nodes||[]).find(x=>x.k==='obj');
      if(!n){ toast('채집 지점을 찾지 못했어요'); return; }
      Fd.px=n.x; Fd.py=n.y+40;
      pickTool(n.d.tool); fAct();
    }, 700);
    return;
  }
  stopLoop();
  wipeIn(()=>launchMini(mode));
}
function admGo(id){ closeModal(); enterTheme(id); }
function admSet(k,v){ S[k]=v; autosave(); drawModal(); paintHud(); refreshObjs(); paintMood(); bgmUpdate(); }
function admHeal(){ const st=baseStats(); S.hpCur=st.hpMax; S.spCur=st.spMax; autosave(); drawModal(); paintHud(); }
function admMon(d){ S.interludePending=null;S.encounterWon=false;S.battleDone=false;S.monIdx=clamp((S.monIdx||0)+d,0,CUR.monsters.length-1); autosave(); drawModal(); refreshObjs(); }
function admFight(){ S.interludePending=null;S.encounterWon=false;S.battleDone=false;closeModal();stopLoop();wipeIn(mountBattle); }
function admReset(){
  S.npcDone=[]; S.duelWon=[]; S.gatherDone=false; S.boxOpen=false; S.clues={};
  S.lessonDone=false; S.gboard=null; S.monIdx=0;
  autosave(); drawModal(); refreshObjs(); paintNpcs();
  toast('이 지역 퀘스트를 되돌렸어요');
}
function admOff(){
  Adm.on=false;
  const b=$('admBadge'); if(b) b.remove();
  closeModal();
  toast('관리자 모드를 껐어요');
}


/* ==========================================================
   마지막 상대 — ??? (나 자신)
   여섯 지역을 모두 되살리면 나타난다.
   아무도 보지 않아도 약속을 지키는 것, 그것이 마지막 시험이다.
   ========================================================== */
var Shadow = {on:false};

/* 흑백으로 바꾼 내 모습 — 색만 지우고 형태는 그대로 */
function shadowSprite(size){
  size = size || 88;
  const bk=bodyKey('south'), hk=headKey('south');
  return `<div class="shadowFig" style="width:${size}px;height:${size}px">
    <div class="avatar" style="width:100%;height:100%">
      <div class="sprite" style="background-image:url('${heroImg(bk)}')"></div>
      <div class="sprite head" style="background-image:url('${heroImg(hk)}')"></div>
    </div></div>`;
}

function allThemesClear(){
  if(!S) return false;                       // 판이 만들어지기 전에도 불린다
  return THEME_ORDER.every(id => (S.cleared||[]).includes(id));
}
function shadowBeaten(){ return !!(S && S.shadowWon); }

/* 마지막 상대의 능력치 — 풀템 기준 이길 확률이 30% 정도가 되게 잡았다 */
function shadowFoe(){
  const st=baseStats();
  return {
    name:"???", kind:'shadow', fixed:true, mode:'turn', boss:true, mid:false,
    hp:  Math.round(st.hpMax*3.25 + 165),
    atk: Math.round(st.atk*0.93 + 8),
    exp: 200, gold: 400, gauge: 0,
    pat:'def', patName:"거울처럼 따라하기", patRate:.28,
    meet:"거울 속의 내가 걸어 나온다…",
    after:"이제 알겠지. 지켜보는 사람이 없어도 지켜야 한다는 걸."
  };
}
function startShadow(){
  releaseKeys();
  Shadow={on:true, mon:shadowFoe()};
  closeModal(); stopLoop();
  wipeIn(mountBattle);
}
function shadowEnd(win){
  Shadow.on=false;
  if(win) S.shadowWon=true;
  autosave();
  closeBattleDom&&closeBattleDom();
  const host=$('bResult'); if(host) host.innerHTML='';
  B=null;
  S.scene='world';
  render();
  if(!Wd.raf) startLoop();
  S.modal = win ? 'shadowWin' : 'shadowLose';
  drawModal();
}

function mShadowMeet(){
  return `<div class="mhead"><span>???</span></div>
    <div class="encounter">
      <div class="shadowGlow">${shadowSprite(120)}</div>
      <div class="mon" style="margin-top:6px">???</div>
    </div>
    <div class="dialogue"><div class="who">???</div>
      여섯 곳을 모두 되살렸구나.<br>
      하지만 아직 한 사람이 남았다.<br>
      <b>바로 너 자신이다.</b></div>
    <div class="card" style="font-size:12.5px;line-height:1.8">
      아주 강한 상대예요. 장비를 갖추고 오세요.<br>
      <span style="opacity:.75">져도 잃는 것은 없어요. 몇 번이든 다시 도전할 수 있어요.</span>
    </div>
    <div class="row">
      <button class="btn" onclick="startShadow()">맞선다</button>
      <button class="btn sec" onclick="closeModal()">아직은</button>
    </div>`;
}
function mShadowWin(){
  return `<div class="mhead"><span>✨ 마지막 약속</span></div>
    <div class="encounter"><div class="shadowFade">${shadowSprite(110)}</div></div>
    <div class="dialogue"><div class="who">???</div>
      잘했다. 이제 알겠지.</div>
    <div class="card" style="font-size:14px;line-height:2;text-align:center">
      환경을 지키는 일에서<br>
      가장 어려운 상대는 <b style="color:var(--gold)">나 자신</b>이에요.<br><br>
      <span style="opacity:.9">아무도 보지 않을 때에도<br>
      쓰레기를 줍고, 불을 끄고, 물을 아끼는 것.</span><br><br>
      <b style="color:var(--green)">약속을 지키는 사람이<br>세상을 바꿉니다.</b>
    </div>
    <div class="note">골드 +400 · 경험치 +200</div>
    <button class="btn" onclick="closeModal()">약속할게요</button>`;
}
function mShadowLose(){
  return `<div class="mhead"><span>아직은 이르구나</span></div>
    <div class="encounter" style="opacity:.75">${shadowSprite(110)}</div>
    <div class="dialogue"><div class="who">???</div>
      나를 이기는 건 쉽지 않지.<br>
      장비를 갖추고, 힘을 기르고 다시 오너라.<br>
      <span style="opacity:.8">나는 늘 여기 있을 테니.</span></div>
    <button class="btn" onclick="closeModal()">다시 도전할게요</button>`;
}

/* ==========================================================
   몬스터의 탑 — 한 층씩 올라가며 겨루는 도전 모드
     7층 주기: 전투1 → 달리기 → 전투2 → 전투3 → 도약 → 전투4 → 보스
     쓰러지면 1층부터 다시 — 기록(층·시간)만 남는다
   ========================================================== */
var Tw={on:false, floor:1, t0:0, mon:null, quizIdx:0, tries:0, best:0};

function towerPool(){
  const pool=[];
  THEME_ORDER.forEach(id=>{
    (THEMES[id].monsters||[]).forEach((m,i)=>pool.push({m:m, themeId:id, idx:i}));
  });
  return pool;
}
/* 층이 오를수록 세진다 */
function towerMon(f){
  const slot=(f-1)%7, themeId=THEME_ORDER[Math.floor((f-1)/7)%THEME_ORDER.length];
  const idx=[0,0,1,2,2,3,4][slot],m=THEMES[themeId].monsters[idx],boss=slot===6;
  return Object.assign({},m,{hp:Math.round((36+f*15)*(boss?1.5:1)),atk:Math.round((10+f*1.9)*(boss?1.3:1)),exp:6+f*3,gold:4+f*4,gauge:0,mode:'turn',fixed:true,boss:boss,mid:idx===2,themeId:themeId,idx:idx,meet:f+'층 — '+m.name+' 등장!'});
}
function towerQuiz(){
  const pool=[];
  THEME_ORDER.forEach(id=>{
    (THEMES[id].quiz||[]).forEach(q=>pool.push(q));
    (THEMES[id].quizAdv||[]).forEach(q=>pool.push(q));
  });
  return pool;
}
function floorKind(f){return [1,4].includes((f-1)%7)?'mini':'battle';}

function towerDraw(){
  const n=towerQuiz().length;
  if(!Tw.deck || !Tw.deck.length){ Tw.deck=shuffled(n, Date.now()); Tw.deckAt=0; }
  if(Tw.deckAt>=Tw.deck.length){ Tw.deck=shuffled(n, Date.now()+7); Tw.deckAt=0; }
  return Tw.deck[Tw.deckAt++];
}
function towerTime(){ return Math.max(0, Math.round((Date.now()-Tw.t0)/1000)); }
function fmtTime(sec){
  const m=Math.floor(sec/60), s2=sec%60;
  return `${m}분 ${String(s2).padStart(2,'0')}초`;
}

/* ---- 기록판 (이 태블릿에 저장된다) ---- */
/* 친구 기록을 옮겨 담는 짧은 코드 */

/* ---- 흐름 ---- */
function enterTower(){
  releaseKeys();
  S.modal='tower'; drawModal();
}
function shuffled(n, seed){
  const a=[]; for(let i=0;i<n;i++) a.push(i);
  let r=seed>>>0;
  for(let i=n-1;i>0;i--){
    r=(r*1664525+1013904223)>>>0;
    const j=r%(i+1); const t=a[i]; a[i]=a[j]; a[j]=t;
  }
  return a;
}
function towerStart(){
  setTimeout(bgmUpdate,60);
  InterludeRun=null;Tw.interludePending=null;Tw.floorCleared=false;Tw.quizPassed=false;Tw.on=true; Tw.floor=1; Tw.t0=Date.now(); Tw.tries=0;
  Tw.deck=shuffled(towerQuiz().length, Date.now());   // 이번 도전에 쓸 문제 순서
  Tw.deckAt=0;
  const st=baseStats();
  S.hpCur=st.hpMax; S.spCur=st.spMax;      // 시작할 때 가득 채워 준다
  towerFloor();
}
function towerFloor(){
  Tw.mon=towerMon(Tw.floor);
  S.modal='towerFloor'; drawModal();
}
function towerGo(){
  if(Tw.floorCleared){towerNext();return;}
  closeModal();stopLoop();
  if(floorKind(Tw.floor)==='mini'){
    if(!Tw.interludePending)Tw.interludePending=makeInterlude((Tw.floor-1)%7===1?0:2);
    S.modal='interlude';drawModal();return;
  }
  wipeIn(mountBattle);
}
function towerNext(){
  if(!Tw.floorCleared)return;
  Tw.floorCleared=false;Tw.interludePending=null;InterludeRun=null;Tw.quizPassed=false;
  Tw.floor++;if(Tw.floor>Tw.best)Tw.best=Tw.floor;
  closeBattleDom();B=null;towerFloor();
}
function towerRetire(reason){
  InterludeRun=null;Tw.interludePending=null;Tw.floorCleared=false;
  const floor=Tw.floor, t=towerTime();
  Tw.on=false;
  setTimeout(bgmUpdate,120);
  if(!S.tower) S.tower={best:0,bestTime:0,runs:0,history:[]};
  if(!Array.isArray(S.tower.history)) S.tower.history=[];
  S.tower.runs=(S.tower.runs||0)+1;
  Tw.newBest = (floor>S.tower.best) || (floor===S.tower.best && t<S.tower.bestTime);
  if(Tw.newBest){ S.tower.best=floor; S.tower.bestTime=t; }
  S.tower.history.unshift({floor:floor, time:t});
  S.tower.history=S.tower.history.slice(0,5);
  autosave();
  Tw.lastFloor=floor; Tw.lastTime=t; Tw.lastReason=reason;
  closeBattleDom&&closeBattleDom();
  const host=$('bResult'); if(host) host.innerHTML='';
  B=null;
  S.scene='world';
  const sc=$('screen'); if(sc && !$('worldRoot')) sc.innerHTML='';
  render();
  S.modal='towerEnd'; drawModal();
  if(!Wd.raf) startLoop();          // 탑에 들어갈 때 멈춘 월드 루프를 다시 돌린다
}

/* ---- 화면 ---- */
function showTowerWin(){
  const m=curMon(), host=$('bResult'); if(!host) return;
  S.hpCur=Math.max(1,B.hp); S.spCur=B.sp;
  autosave();
  host.innerHTML=`<div class="back on"><div class="sheet">
    <div class="mhead"><span>🗼 ${Tw.floor}층 통과!</span>
      <span style="font-size:12px;color:var(--gold)">⏱ ${fmtTime(towerTime())}</span></div>
    <div class="card" style="font-size:13.5px;line-height:1.9">
      ${m.name}${J(m.name,'을','를')} 이겼어요<br>
      골드 <b>+${m.gold}</b> · 경험치 <b>+${m.exp}</b><br>
      남은 체력 <b>${S.hpCur}</b>
    </div>
    ${Tw.floor%7===0?'<div class="note">7층 보스 관문을 넘어 체력을 조금 되찾았어요 💚</div>':''}
    <div class="row">
      <button class="btn" onclick="towerNext()">${Tw.floor+1}층으로</button>
      <button class="btn sec" onclick="towerRetire('quit')">여기서 그만두기</button>
    </div>
  </div></div>`;
}
function mTower(){
  const T=S.tower||{best:0,bestTime:0,runs:0,history:[]};
  const hist=(T.history||[]);
  const rows = hist.length ? hist.map((r,i)=>`
    <div class="row" style="align-items:center;gap:8px;font-size:13px;padding:2px 6px">
      <div style="width:44px;opacity:.6">${i===0?'가장 최근':(i+1)+'번째 전'}</div>
      <div style="flex:1;text-align:right;color:var(--gold)">${r.floor}층</div>
      <div style="opacity:.7;width:78px;text-align:right">${fmtTime(r.time)}</div>
    </div>`).join('')
    : `<div class="note">아직 도전한 적이 없어요. 첫 도전을 해 보세요!</div>`;
  return `<div class="mhead"><span>🗼 몬스터의 탑</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">도전 ${T.runs||0}번</span></div>
    <div class="card" style="text-align:center;padding:14px 12px">
      <div style="font-size:12px;opacity:.7">내 최고 기록</div>
      <div style="font-family:'Do Hyeon',sans-serif;font-size:32px;color:var(--gold)">${T.best||0}층</div>
      ${T.best?`<div style="font-size:12.5px;opacity:.8">⏱ ${fmtTime(T.bestTime||0)}</div>`:''}
    </div>
    <div class="card" style="font-size:13px;line-height:1.9">
      한 층씩 올라가며 몬스터와 겨뤄요.<br>
      전투 1 → 미니게임 1 → 전투 2 → 전투 3 → 미니게임 2 → 전투 4 → 보스<br>
      올라갈수록 몬스터가 세져요. <b style="color:var(--danger)">쓰러지면 1층부터 다시!</b><br>
      <span style="opacity:.75">전투 승리 시 체력과 기력을 조금 회복해요. 7층 단위로 다음 지역에 도전해요.</span>
    </div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:13.5px;color:var(--gold)">📜 최근 도전</div>
    ${rows}
    <button class="btn" onclick="towerStart()">🗼 도전하기</button>
    <button class="btn sec" onclick="closeModal()">돌아가기</button>`;
}
function mTowerFloor(){
  const f=Tw.floor, kind=floorKind(f), m=Tw.mon;
  const st=baseStats();
  const label = kind==='mini' ? '🎮 미니게임 층'
              : kind==='quiz' ? '📘 퀴즈 층 — 문제를 맞혀야 올라가요'
              : '⚔️ 대결 층';
  return `<div class="mhead"><span>🗼 ${f}층</span>
      <span style="font-size:12px;color:var(--gold)">⏱ ${fmtTime(towerTime())}</span></div>
    ${encounterRouteMarkup()}
    <div class="encounter">
      <div style="filter:drop-shadow(0 6px 8px rgba(0,0,0,.5))">${monsterSVG(0,132)}</div>
      <div class="mon" style="margin-top:6px">${kind==='mini'?((f-1)%7===1?'정화 달리기':'정령 도약'):m.name}</div>
      <div class="note" style="margin-top:2px">${label}${kind==='mini'?'<br>통과하면 다음 몬스터와 싸워요.':`<br>체력 ${m.hp} · 공격 ${m.atk}`}</div>
    </div>
    <div class="card" style="font-size:13px;line-height:1.8">
      내 체력 <b style="color:${S.hpCur/st.hpMax<=.35?'var(--danger)':'var(--green)'}">${S.hpCur} / ${st.hpMax}</b>
      · 기력 <b>${S.spCur}</b>
    </div>
    <div class="row">
      <button class="btn" onclick="towerGo()">올라간다</button>
      <button class="btn sec" onclick="towerRetire('quit')">여기서 그만두기</button>
    </div>`;
}
function mTowerQuiz(){
  const q=towerQuiz()[Tw.quizIdx];
  const picked=Tw.quizPicked;
  const opts=q.o.map((t,i)=>{
    let cls='';
    if(picked!=null) cls = (i===q.a) ? ' on' : (i===picked ? ' bad' : '');
    return `<button class="btn sec${cls}" style="text-align:left"
      onclick="towerAnswer(${i})" ${picked!=null?'disabled':''}>${i+1}. ${t}</button>`;
  }).join('');
  return `<div class="mhead"><span>📘 ${Tw.floor}층 관문</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">맞혀야 올라갈 수 있어요</span></div>
    <div class="card" style="font-size:14.5px;line-height:1.7">${q.q}</div>
    ${opts}
    ${picked!=null ? `<div class="note">${picked===q.a?'✅ 정답!':'❌ 아쉬워요'} ${q.e}</div>
      <button class="btn" onclick="${picked===q.a?'towerQuizPass()':'towerQuizFail()'}">
        ${picked===q.a?'올라가기':'같은 문제 다시 풀기'}</button>`
    : `<div class="note">💡 ${q.h||'천천히 생각해 보세요'}</div>`}`;
}
function towerAnswer(i){const q=towerQuiz()[Tw.quizIdx];if(Tw.quizPicked!=null||!q||!Number.isInteger(i)||i<0||i>=q.o.length)return;Tw.quizPicked=i;drawModal();}
function towerQuizPass(){if(Tw.quizPicked!==towerQuiz()[Tw.quizIdx].a)return;Tw.quizPassed=true;towerGo();}
function towerQuizFail(){if(Tw.quizPicked==null||Tw.quizPicked===towerQuiz()[Tw.quizIdx].a)return;Tw.quizTry++;Tw.quizPicked=null;drawModal();}
function mTowerEnd(){
  const f=Tw.lastFloor||1, t=Tw.lastTime||0;
  const T=S.tower||{best:0,bestTime:0};
  const why = Tw.lastReason==='quiz' ? '퀴즈를 넘지 못했어요'
            : Tw.lastReason==='quit' ? '스스로 내려왔어요' : '쓰러졌어요';
  return `<div class="mhead"><span>🗼 도전 끝!</span></div>
    <div class="card" style="text-align:center;padding:16px 12px">
      <div style="font-family:'Do Hyeon',sans-serif;font-size:30px;color:var(--gold)">${f}층</div>
      <div style="font-size:13px;margin-top:4px">⏱ ${fmtTime(t)} · ${why}</div>
      ${Tw.newBest ? `<div class="note" style="margin-top:6px;color:var(--gold)">🎉 새 기록이에요!</div>`
                   : `<div class="note" style="margin-top:6px">내 최고 기록은 <b>${T.best}층</b> (${fmtTime(T.bestTime||0)})</div>`}
    </div>
    <div class="row">
      <button class="btn" onclick="closeModal();enterTower()">다시 도전</button>
      <button class="btn sec" onclick="closeModal()">그만하기</button>
    </div>`;
}
/* 여러 개를 한꺼번에 붙여넣어도 다 받아 준다 (단톡방에서 긁어오면 여러 줄이다) */

/* 한 번 눌러 카톡·메모로 보내기 (안 되면 클립보드에 복사) */

/* 링크(#r=코드)로 열면 친구 기록이 저절로 들어온다 */

/* ==========================================================
   나만의 농장 — 화단(꽃) + 축사(가축)
   '하루'는 시계가 아니라 행동으로 넘어간다: 채집 마치기 / 몬스터 정화
   ========================================================== */
var PLOTS = 12, PENS = 6;

var FLOWERS = {
  dandelion:{nm:"민들레",   days:1, price:6,  seed:4},
  daisy:    {nm:"데이지",   days:2, price:10, seed:6},
  tulip:    {nm:"튤립",     days:2, price:12, seed:8},
  cosmos:   {nm:"코스모스", days:3, price:16, seed:10},
  morning:  {nm:"나팔꽃",   days:3, price:18, seed:12},
  lavender: {nm:"라벤더",   days:3, price:20, seed:14},
  sunflower:{nm:"해바라기", days:4, price:26, seed:16},
  rose:     {nm:"장미",     days:4, price:30, seed:20},
  lily:     {nm:"백합",     days:5, price:32, seed:22},
  hydrangea:{nm:"수국",     days:5, price:34, seed:24}
};
var LIVESTOCK = {
  chicken:{nm:"닭",     grow:2, prod:'egg',     cyc:1, price:8,  cost:60},
  turkey: {nm:"칠면조", grow:3, prod:'feather', cyc:2, price:14, cost:90},
  monkey: {nm:"원숭이", grow:3, prod:null,      cyc:0, price:0,  cost:320, keeper:3},
  cow:    {nm:"젖소",   grow:5, prod:'milk',    cyc:2, price:20, cost:140},
  sheep:  {nm:"양",     grow:4, prod:'wool',    cyc:3, price:22, cost:120},
  pig:    {nm:"돼지",   grow:4, prod:'truffle', cyc:3, price:26, cost:160}
};
var PRODUCE = {
  egg:{nm:"달걀",ico:'it_egg'}, milk:{nm:"우유",ico:'it_milk'},
  wool:{nm:"양털",ico:'it_wool'}, feather:{nm:"깃털",ico:'it_feather'},
  truffle:{nm:"송로버섯",ico:'it_truffle'}, banana:{nm:"바나나",ico:'it_banana'}
};
/* 물통 — 물을 주면 그 자리에서 한 단계 자란다 */

/* 물통 안내 문구 */
var T_NOWHERE = "물을 줄 곳이 없어요";
var T_EMPTY   = "물통이 비었어요 💧<br>채집을 마치거나 몬스터를 정화하면 물이 채워져요";
var T_WELL    = "우물에서";
var T_FULL    = "이미 기운이 가득해요";
var T_RESTED  = "제단의 빛이 몸을 감쌌어요 ✨<br>체력과 기력을 모두 되찾았어요";

/* ==========================================================
   캐릭터 상태창 — 능력치를 보고 장비를 바꿔 낀다
   ========================================================== */
var StatSlot = null;
function openStatus(){ StatSlot=null; openModal('status'); }
function statBar(now, max, col){
  const pct=Math.max(0,Math.min(100, Math.round(now/Math.max(1,max)*100)));
  return `<div style="height:9px;border-radius:99px;background:rgba(24,20,34,.45);overflow:hidden">
    <div style="width:${pct}%;height:100%;background:${col};border-radius:99px"></div></div>`;
}
function mStatus(){
  const st=baseStats(), L=lvInfo(S.lv);
  const need=nextNeed();
  const prev=(S.lv>1)?LEVELS[S.lv-2].need:0;
  const expNow=Math.max(0,S.exp-prev), expNeed=need?need-prev:1;
  const bare={hpMax:L.hp, atk:L.atk, def:L.def, spMax:L.sp};
  const slots=['weapon','armor','helm','shoes'].map(sl=>{
    const it=gearFind(sl, S.gear[sl]);
    return `<div class="eqSlot ${StatSlot===sl?'on':''}" onclick="statPick('${sl}')">
      <div class="eqBox">${it?gearIco(it,38):'<span style="opacity:.35;font-size:20px">＋</span>'}</div>
      <div class="eqLab">${GEAR_LABEL[sl]}</div>
      <div class="eqName">${it?it.name:'없음'}</div></div>`;
  }).join('');
  let picker='';
  if(StatSlot){
    const list=gearList(StatSlot).filter(i=>S.owned.includes(i.id));
    picker = `<div class="card" style="padding:10px">
      <div style="font-size:12.5px;color:var(--gold);margin-bottom:6px">${GEAR_LABEL[StatSlot]} 고르기</div>
      ${list.length ? list.map(i=>{
        const on=(S.gear[StatSlot]===i.id);
        const val=i.atk?('공격 +'+i.atk):(i.def?('방어 +'+i.def):('기력 +'+i.sp));
        const leg=isLegend(i.id);
        return `<div class="eqRow ${on?'on':''}" onclick="statWear('${StatSlot}','${i.id}')">
          ${gearIco(i,30)}
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;${leg?'color:var(--gold)':''}">${leg?'✨ ':''}${i.name}</div>
            <div style="font-size:11px;opacity:.7">${val}${leg&&i.desc?' · '+i.desc:''}</div></div>
          ${on?'<span class="chip" style="flex:0 0 auto">착용 중</span>':''}</div>`;
      }).join('') : '<div class="note">가진 것이 없어요. 상점이나 뽑기로 구해 보세요.</div>'}
      <button class="btn sec" onclick="statPick(null)">닫기</button></div>`;
  }
  const row=(nm,now,base,ico)=>{
    const plus=now-base;
    return `<div class="stRow"><span class="stIco">${ico}</span><span class="stNm">${nm}</span>
      <b class="stNum">${now}</b>${plus>0?`<span class="stPlus">+${plus}</span>`:''}</div>`;
  };
  return `<div class="mhead"><span>🧍 ${S.name||'모험가'}</span>
      <span style="font-size:12px;color:var(--gold)">Lv.${S.lv}${S.lv>=MAX_LV?' (최고)':''}</span></div>
    <div class="card" style="display:flex;gap:12px;align-items:center;padding:12px">
      <div style="flex:0 0 auto">${heroSprite('south',80)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:11.5px;opacity:.75">체력</div>
        ${statBar(S.hpCur, st.hpMax, 'var(--danger)')}
        <div style="font-size:12px;margin:2px 0 6px">${S.hpCur} / ${st.hpMax}</div>
        <div style="font-size:11.5px;opacity:.75">기력</div>
        ${statBar(S.spCur, st.spMax, '#6fb6e8')}
        <div style="font-size:12px;margin-top:2px">${S.spCur} / ${st.spMax}</div></div></div>
    <div class="card" style="padding:10px 12px">
      <div style="font-size:11.5px;opacity:.75">경험치</div>
      ${statBar(expNow, expNeed, 'var(--gold)')}
      <div style="font-size:12px;margin-top:3px">
        ${need ? `${expNow} / ${expNeed} · 다음 레벨까지 ${expNeed-expNow}` : '최고 레벨에 닿았어요'}</div></div>
    <div class="card" style="padding:10px 12px">
      ${row('공격', st.atk, bare.atk, '⚔️')}
      ${row('방어', st.def, bare.def, '🛡️')}
      ${row('최대 체력', st.hpMax, bare.hpMax, '❤️')}
      ${row('최대 기력', st.spMax, bare.spMax, '💧')}
      <div class="note" style="margin-top:4px">노란 숫자는 장비로 오른 만큼이에요</div></div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:13.5px;color:var(--gold)">장비</div>
    <div class="eqGrid">${slots}</div>
    ${picker}
    <div class="card" style="font-size:12.5px;line-height:1.9">
      🪙 골드 <b>${S.gold}</b> · 🎁 뽑기권 <b>${S.tickets}</b>장 · 🧪 회복약 <b>${S.potions}</b>개</div>
    <button class="btn sec" onclick="closeModal()">닫기</button>`;
}
function statPick(sl){ StatSlot = (StatSlot===sl) ? null : sl; drawModal(); }
function statWear(sl, id){
  if(!S.owned.includes(id)) return;
  S.gear[sl] = (S.gear[sl]===id) ? null : id;
  const st=baseStats();
  S.hpCur=Math.min(S.hpCur, st.hpMax);
  S.spCur=Math.min(S.spCur, st.spMax);
  autosave(); drawModal(); paintHud();
  playSfx('talk');
}

function mAltar(){
  const st=baseStats();
  const full = S.hpCur>=st.hpMax && S.spCur>=st.spMax;
  const ready = S.gauge>=100;
  return `<div class="mhead"><span>✨ 정화의 제단</span>
      <span style="font-size:12px;color:var(--gold)">정화 ${S.gauge}%</span></div>
    <div class="card" style="text-align:center;padding:14px">
      <div style="font-size:40px">✨</div>
      <div class="note" style="margin-top:4px">
        제단의 빛이 지친 몸을 달래 줘요.<br>언제든 들러 쉬어 갈 수 있어요.</div>
      <div style="font-size:13px;margin-top:10px">
        체력 <b style="color:${S.hpCur<st.hpMax?'var(--danger)':'var(--green)'}">${S.hpCur} / ${st.hpMax}</b>
        · 기력 <b>${S.spCur} / ${st.spMax}</b></div>
    </div>
    <button class="btn ${full?'sec':''}" onclick="${full?'':'altarRest()'}">
      ${full?'이미 기운이 가득해요':'🛌 휴식하기'}</button>
    ${ready
      ? `<button class="btn" onclick="closeModal();go('clear')">🌱 이 지역 되살리기</button>`
      : `<div class="note">정화를 100% 채우면 이곳에서 지역을 되살릴 수 있어요 (지금 ${S.gauge}%)</div>`}
    <button class="btn sec" onclick="closeModal()">돌아가기</button>`;
}
function altarRest(){
  const st=baseStats();
  if(S.hpCur>=st.hpMax && S.spCur>=st.spMax){ toast(T_FULL); return; }
  S.hpCur=st.hpMax; S.spCur=st.spMax;
  autosave(); paintHud(); drawModal();
  playSfx('purify');
  toast(T_RESTED);
}
var T_POOR    = "골드가 모자라요";
function T_CAN_UP(nm, cap){
  return "<b>"+nm+"</b>을 손에 넣었어요! 🪣<br>이제 물을 <b>"+cap+"칸</b>까지 담아요";
}
var T_FROM_GATHER = "채집을 마쳐서";
var T_FROM_BATTLE = "몬스터를 정화해서";
function T_BLOOM(nm){ return nm+"이 활짝 폈어요! 🌸 거둘 수 있어요"; }
function T_DROP(st){
  const n=["씨앗","새싹","봉오리"][st]||"";
  return "물을 줬어요 💧 ("+n+") · 물통 "+S.water+"/"+canCap();
}
function T_WATERED(n, bloom, left){
  return "화단 "+n+"칸에 물을 줬어요 💧"
    + (bloom? "<br>🌸 "+bloom+"칸이 활짝 폈어요!" : "")
    + "<br>물통 "+S.water+"/"+canCap()
    + (left>0 ? " · "+left+"칸이 남았어요" : "");
}
/* 물통 등급 — 가판대에서 바꾼다 */
var CANS = [
  {lv:0, nm:"낡은 물뿌리개", cap:5,  gather:5,  battle:3, price:0,   ico:'it_can0'},
  {lv:1, nm:"튼튼한 물통",   cap:8,  gather:8,  battle:5, price:220, ico:'it_can1'},
  {lv:2, nm:"커다란 물지게", cap:12, gather:12, battle:7, price:520, ico:'it_can2'}
];
function canLv(){ return clamp((S&&S.canLv)||0, 0, CANS.length-1); }
function canInfo(){ return CANS[canLv()]; }
function canCap(){ return canInfo().cap; }
var CAN_GATHER = 5;        // 채집을 마치면
var CAN_BATTLE = 3;        // 몬스터를 정화하면
var CAN_WELL   = 2;        // 하루에 한 번 우물에서
function canLeft(){ return (S && typeof S.water==='number') ? S.water : 0; }
function canAdd(n, why){
  if(!S) return 0;
  const before=canLeft();
  S.water=Math.min(canCap(), before+n);
  const got=S.water-before;
  if(got>0 && why) setTimeout(()=>toast('\ud83d\udca7 '+why+' \ubb3c +'+got
    +'<br>\ubb3c\ud1b5 '+S.water+'/'+canCap()), 1500);
  return got;
}
var BANANA_COST = 12;      // 원숭이 간식 — 상점에서 산다

function newFarm(){
  return {
    plots:Array.from({length:PLOTS},()=>({seed:null,stage:0,wet:false})),
    pens: Array.from({length:PENS}, ()=>null)
  };
}
function farmData(){ if(!S.farm) S.farm=newFarm(); return S.farm; }
/* 농장은 사육사(원숭이)를 들여야 열린다 */
function farmOpen(){
  const F=farmData();
  return F.pens.some(a=>a && a.kind==='monkey');
}
function addSeed(k,n){ S.seeds[k]=(S.seeds[k]||0)+n; }
function addProduce(k,n){ S.produce[k]=(S.produce[k]||0)+n; }

/* 하루가 지나간다 — 물 준 꽃이 자라고, 배부른 가축이 산물을 낸다 */
function advanceDay(){
  if(!S || !S.farm) return '';
  S.day++;
  const F=S.farm; let grown=0, got={};
  if(S.wellDay!==S.day){ S.wellDay=S.day; canAdd(CAN_WELL, T_WELL); }
  // 원숭이는 다른 가축을 대신 먹인다 (한 마리가 3마리씩)
  let care=0;
  F.pens.forEach(a=>{ if(a && a.kind==='monkey' && a.adult && a.fed) care+=LIVESTOCK.monkey.keeper; });
  F.pens.forEach(a=>{
    if(!a) return;
    a.age++;
    if(!a.adult && a.age>=LIVESTOCK[a.kind].grow) a.adult=true;
    const L=LIVESTOCK[a.kind];
    if(!a.fed && care>0 && a.kind!=='monkey'){ a.fed=true; care--; }
    if(a.adult && a.fed && L.prod){
      a.tick=(a.tick||0)+1;
      if(a.tick>=L.cyc){ a.tick=0; addProduce(L.prod,1); got[L.prod]=(got[L.prod]||0)+1; }
    }
    a.fed=false;
  });
  autosave();
  const parts=[];
  void grown;
  if(false) parts.push(`🌱 꽃 ${grown}칸이 자랐어요`);
  const pl=Object.entries(got).map(([k,v])=>`${PRODUCE[k].nm} ${v}`).join(' · ');
  if(pl) parts.push(`🧺 ${pl}`);
  return parts.length ? `<b>${S.day}일째</b><br>${parts.join('<br>')}` : `<b>${S.day}일째</b>가 되었어요`;
}


/* 원 안으로 들어가는지 — 벽을 따라 미끄러지도록 x·y 를 따로 본다 */
/* 사람과 부딪히는지 — 말은 걸 수 있게 반지름은 몸통 정도만 */
function hitNpc(x, y, skip){
  if(!Nd.spots) return false;
  for(const n of Nd.spots){
    if(n===skip) continue;
    if(dist(x, y, n.x, n.y) < 26) return true;
  }
  return false;
}
function hitSolid(list,x,y){
  if(!list) return false;
  for(const o of list){
    if(o.phase==='pollLayer' && S.gauge>=95) continue;
    if(o.phase==='lifeLayer' && S.gauge<=5) continue;
    if(dist(x,y,o.x,o.y)<o.r) return true;
  }
  return false;
}
/* 어쩌다 소품 안에 들어갔다면 판정을 잠시 끈다 (영영 갇히는 것 방지) */
function solidCheck(list,cx,cy){
  return hitSolid(list,cx,cy) ? (()=>false) : ((x,y)=>hitSolid(list,x,y));
}
var MAP_SCALE = 1.75;              // 원래 1560x1000 → 2730x1750
var PROP_SCALE = 1.85;             // R37: 이동 공간을 넓게 보이도록 배경 소품 밀도 약 23% 감소
var _bigMap = {};

/* 테마 지도를 한 번만 키워 두고 다시 쓴다 (원본 자료는 건드리지 않는다) */
function bigMap(id){
  if(_bigMap[id]) return _bigMap[id];
  const m=THEMES[id].map, k=MAP_SCALE, R=v=>Math.round(v*k);
  const out={
    w:R(m.w), h:R(m.h),
    spawn:{x:R(m.spawn.x), y:R(m.spawn.y)},
    path:m.path.map(pt=>({x:R(pt.x), y:R(pt.y)})),
    objs:m.objs.map(o=>Object.assign({}, o, {x:R(o.x), y:R(o.y)}))
  };
  _bigMap[id]=out;
  return out;
}
/* 농장·탑 자리 — 기존 거점에서 가장 멀리 떨어진 곳을 고른다 */
function freeSpot(objs, w, h, taken){
  const cands=[[.24,.30],[.24,.70],[.50,.18],[.50,.82],[.76,.30],[.76,.70],[.38,.50],[.62,.50]];
  let best=null, bestD=-1;
  cands.forEach(([fx,fy])=>{
    const x=Math.round(w*fx), y=Math.round(h*fy);
    let d=1e9;
    objs.concat(taken).forEach(o=>{ d=Math.min(d, dist(x,y,o.x,o.y)-(o.r||70)); });
    if(d>bestD){ bestD=d; best={x:x,y:y}; }
  });
  return best;
}
function applyTheme(id){
  useTheme(id);
  const m=bigMap(id);
  W=m.w; H=m.h;
  OBJS=m.objs.map(o=>Object.assign({}, o));
  // 농장과 탑은 모든 지역에 같은 방식으로 붙인다
  const f=freeSpot(OBJS, W, H, []);
  OBJS.push({id:'farm', x:f.x, y:f.y, type:'farm', cap:"나만의 농장",
             tip:"들어가기", r:70, c:'246,201,79', icon:'🌻'});
  const t=freeSpot(OBJS, W, H, [Object.assign({r:150}, f)]);
  OBJS.push({id:'tower', x:t.x, y:t.y, type:'tower', cap:"몬스터의 탑",
             tip:"도전하기", r:70, c:'150,120,220', icon:'🗼'});
  if(allThemesClear()){                       // 모든 곳을 되살리면 마지막 상대가 선다
    const sh=freeSpot(OBJS, W, H, [Object.assign({r:170}, f), Object.assign({r:170}, t)]);
    OBJS.push({id:'shadow', x:sh.x, y:sh.y, type:'shadow',
               cap: shadowBeaten() ? "또 하나의 나" : "???",
               tip: shadowBeaten() ? "다시 만나기" : "마주하기",
               r:70, c:'150,150,170', icon:'❓'});
  }
  PATH=m.path; SPAWN=m.spawn;
  OBJS.forEach(o=>o._in=false);
  if(typeof Nd!=='undefined') Nd.spots=null;
  if(typeof Au!=='undefined' && Au.cur) bgmStop();
}
applyTheme('forest');

/* 땅 배경 — 테마가 'grass'면 픽셀 타일, 아니면 CSS 배경 */
function groundStyle(state){
  if(typeof ECO_ART!=='undefined'){
    const phase=state||(S&&S.gauge>=100?'after':'before');
    const theme=(S.modal==='farm'||S.modal==='field')?'forest':CUR.id;
    return `background-image:url('${ECO_ART[theme][phase]}');background-size:768px 768px;background-repeat:repeat`;
  }
  const t=(CUR.world&&CUR.world.tile)||'tile_grass';
  const src=SPRITES[t]||SPRITES.tile_grass;
  return `background-image:url('${src}');background-size:96px 96px`;
}

/* A continuous, readable path follows the existing route exactly. */
function worldPathSVG(){
  const colors={forest:['#98845b','#bca577','#8a9760','#ddc58d'],river:['#8a947d','#b9b497','#6f9f92','#d4d5a5'],ocean:['#97885e','#c8b780','#b19864','#f3d89a'],city:['#686f7b','#a4a3a2','#667990','#d8d9d6'],air:['#797589','#a9a3b9','#8c8fae','#d9dcef'],climate:['#8b8d91','#bdbbb0','#8baec2','#e7f2f2']}[CUR.id];
  const d=PATH.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ');
  const stroke=(edge,fill)=>`<path d="${d}" stroke="${edge}" stroke-width="66"/><path d="${d}" stroke="${fill}" stroke-width="58"/>`;
  return `<svg class="eco-path-r37" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${stroke(colors[0],colors[1])}<g id="pathRecovered" opacity="${clamp(S.gauge/100,0,1)}">${stroke(colors[2],colors[3])}</g></g></svg>`;
}

/* ==========================================================
   테마 이동 — 레벨/골드/회복약은 이어지고, 지역별 진행은 따로 보관된다
   ========================================================== */
var THEME_FIELDS=['gauge','lessonDone','quizDone','advDone','quizIdx','quizPicked','quizHint',
  'quizScored','quizWrong','retryQueue','advIdx','advPicked','advScored','quizContentVersion','monIdx','battleDone','interludePending','encounterWon',
  'gboard','clues','boxOpen','gatherDone','dexBonus','crafted','mats','dex','npcDone'];

function stashTheme(){
  if(!S.progress) S.progress={};
  const o={};
  THEME_FIELDS.forEach(k=>{ o[k]=S[k]; });
  S.progress[S.themeId]=o;
}
function themeOpen(t){ return !!(t && t.ready && S.lv>=t.levelGate); }

function enterTheme(id){
  const t=THEMES[id];
  if(!t){ return; }
  if(!t.ready){ toast("아직 준비 중인 지역이에요"); return; }
  if(S.lv<t.levelGate){ toast(`${t.icon} ${t.name}${JRO(t.name)} 가려면 <b>Lv.${t.levelGate}</b>가 필요해요`); return; }
  if(id===S.themeId){ S.scene='world'; Wd.ready=false; render(); return; }

  stashTheme();
  S.themeId=id;
  applyTheme(id);
  const saved=S.progress[id], base=newState();
  if(saved)normalizeQuizProgress(saved,t);
  THEME_FIELDS.forEach(k=>{ S[k] = saved && saved[k]!==undefined ? saved[k] : base[k]; });
  normalizeQuizProgress(S,t);
  const st0=baseStats(); S.hpCur=st0.hpMax; S.spCur=st0.spMax;
  S.modal=null; lessonPage=0; B=null; Pg=null;
  Wd.px=SPAWN.x; Wd.py=SPAWN.y; Wd.trail=[];
  Wd.petX=SPAWN.x-34; Wd.petY=SPAWN.y+6; Wd.ready=false;
  autosave();

  S.scene='world';
  const sc=$('screen'); if(sc) sc.innerHTML='';   // 월드를 새 테마로 다시 짓는다
  render();
  setTimeout(()=>{
    if(!tryEvolve()) toast(`${t.icon} 제${t.chapter}장 <b>${t.title}</b> 시작!`);
  },450);
}

/* 앞 지역을 정화하고 3번째·5번째 지역에 들어서면 정령이 자란다 */
function tryEvolve(){
  const i=THEME_ORDER.indexOf(S.themeId);
  const want = i>=4 ? 2 : (i>=2 ? 1 : 0);
  if(want<=S.petStage) return false;
  const prev=THEME_ORDER[i-1];
  if(!prev || !S.cleared.includes(prev)) return false;   // 앞 지역을 마쳐야 한다
  evolveFrom = S.petStage;
  S.petStage = want;
  autosave();
  S.modal='evolve'; drawModal();
  return true;
}
var evolveFrom = 0;
function closeEvolve(){
  closeModal();
  const el=$('pet'); if(el) el.innerHTML=petSprite(PETS[S.petKey]);
  paintHud();
  const t=THEMES[S.themeId];
  if(t) toast(`${t.icon} 제${t.chapter}장 <b>${t.title}</b> 시작!`);
}
function mEvolve(){
  const pet=PETS[S.petKey];
  const before=PET_STAGE_NAMES[pet.key][evolveFrom];
  return `<div class="mhead"><span>✨ 정령이 자랐어요!</span></div>
    <div class="card" style="text-align:center;padding:16px 12px">
      <div style="display:flex;align-items:center;justify-content:center;gap:14px">
        <div style="opacity:.55">${petSprite(pet,64,evolveFrom)}</div>
        <div style="font-size:24px;color:var(--gold)">➡</div>
        <div style="filter:drop-shadow(0 0 12px rgba(246,201,79,.85))">${petSprite(pet,88)}</div>
      </div>
      <div style="margin-top:10px;font-family:'Do Hyeon',sans-serif;font-size:15px">
        <span style="opacity:.6">${before}</span> → <b style="color:var(--gold)">${petName()}</b>
      </div>
    </div>
    <div class="note">함께 지역을 되살린 만큼 정령도 힘이 자랐어요.</div>
    <button class="btn" onclick="closeEvolve()">좋아!</button>`;
}

/* ==========================================================
   화면 라우팅
   ========================================================== */
function go(scene){ S.scene=scene; render(); }

function render(){
  releaseKeys();
  const sc=$('screen');
  sc.dataset.scene=S.scene;
  if(typeof ECO_ART!=='undefined')sc.style.setProperty('--ui-terrain',`url('${new URL(ECO_ART.forest.after,document.baseURI).href}')`);
  if(S.scene==='world'){
    if(!$('worldRoot')){ sc.innerHTML=worldHTML(); mountWorld(); }
    paintHud(); return;
  }
  stopLoop();
  let body='';
  if(S.scene==='title')       body=pgTitle();
  else if(S.scene==='name')   body=pgName();
  else if(S.scene==='look')   body=pgLook();
  else if(S.scene==='story')  body=pgStory();
  else if(S.scene==='pet')    body=pgPet();
  else if(S.scene==='guide')  body=pgGuide();
  else if(S.scene==='clear')  body=pgClear();
  else if(S.scene==='cert')   body=pgCert();
  else if(S.scene==='themes') body=pgThemes();
  sc.innerHTML = body + `<div id="toast" class="toast"></div><div id="lvup" class="lvup"></div>`;
  if(S.scene==='name'){
    const f=$('nameInput');
    if(f){ f.focus(); f.addEventListener('keydown',e=>{ if(e.key==='Enter') submitName(); }); }
  }
  if(S.scene==='title'){
    const f=$('codeInput');
    if(f) f.addEventListener('keydown',e=>{ if(e.key==='Enter') openLoad(); });
  }
}

/* ---------- 타이틀 ---------- */
function pgTitle(){
  const last=Save.last();
  const warn = Save.ok()? '' :
    `<div class="note" style="color:var(--danger)">이 브라우저는 저장 공간이 막혀 있어요.<br>시크릿 모드를 끄면 이어하기가 됩니다.</div>`;
  return `<div class="page"><div class="inner" style="justify-content:center;flex:1">
    <div class="title-emblem" aria-hidden="true"><img src="${SPRITES.obj_altar}" alt=""></div>
    <h1 class="title">에코 크로니클</h1>
    <div class="sub">Echo Chronicle · 6개 지역을 되살리는 환경 정화 모험</div>
    <div class="build-label">${ECO_BUILD_ID} · 전투와 미니게임 모험</div>
    <div style="height:6px"></div>
    <div class="col">
      <button class="btn" onclick="startNew()">새로 시작하기</button>
      ${last?`<button class="btn sec" onclick="quickLoad('${esc(last)}')">이어하기 (${esc(last)})</button>`:''}
    </div>
    <div class="card" style="margin-top:4px">
      <div style="font-size:12.5px;color:rgba(251,246,234,.7);margin-bottom:6px;text-align:center">다른 번호로 이어하기</div>
      <div class="row">
        <input class="namefield" id="codeInput" maxlength="6" placeholder="EC0000" style="flex:1;text-align:center;letter-spacing:3px">
        <button class="btn sec" style="flex:0 0 auto;padding:12px 18px" onclick="openLoad()">불러오기</button>
      </div>
    </div>
    ${warn}
    <div class="note" style="margin-top:4px">태블릿은 가로로 놓고 해요 📱</div>
    <div style="text-align:center;margin-top:2px">
      <button class="tinybtn" onclick="admOpen()" style="opacity:.55">🔧 관리자 모드</button>
    </div>
  </div></div>`;
}
function startNew(){ S=newState(); applyTheme('forest'); go('name'); }
function quickLoad(code){
  const raw=Save.load(code);
  if(!raw){ toast("그 번호를 찾지 못했어요"); return; }
  S=raw; S.modal=null;
  applyTheme(S.themeId||'forest');
  if(!S.name||!S.petKey){ go('name'); return; }
  S.scene='world'; Wd.ready=false;
  Wd.px=SPAWN.x; Wd.py=SPAWN.y; Wd.trail=[];
  Wd.petX=SPAWN.x-34; Wd.petY=SPAWN.y+6;
  render(); setTimeout(()=>toast(`${NAME()} 님, 다시 오셨군요! 🌿`),300);
}
function openLoad(){
  const f=$('codeInput'); if(!f) return;
  const v=f.value.trim().toUpperCase();
  if(!v){ toast("번호를 입력해 주세요"); return; }
  quickLoad(v);
}

/* ---------- 이름 입력 ---------- */
function pgName(){
  return `<div class="page"><div class="inner" style="justify-content:center;flex:1">
    <div style="text-align:center;font-size:44px">📖</div>
    <h1 class="title" style="font-size:26px">이름 정하기</h1>
    <div class="dialogue">
      <div class="who">🧚 에코</div>
      안녕하세요! 저는 정령 <b>에코</b>예요.<br>
      당신을 뭐라고 부를까요?
    </div>
    <input class="namefield" id="nameInput" maxlength="8" placeholder="이름 또는 별명">
    <div class="dialogue">몇 학년인가요?<br>학년에 맞는 <b>수학 문제</b>로 재료를 모으게 돼요 🧮</div>
    <div class="toolbar">${[4,5,6].map(g=>`<div class="tool gradebtn ${g===gradePick?'on':''}" data-g="${g}" onclick="setGrade(${g})">
        <div class="ti">${g}</div><div class="tn">초등 ${g}학년</div></div>`).join('')}</div>
    <button class="btn" onclick="submitName()">등록하기</button>
    <div class="note">별명을 써도 좋아요 (8자까지)</div>
  </div></div>`;
}
var gradePick=5;
function setGrade(g){
  gradePick=g;
  document.querySelectorAll('.gradebtn').forEach(b=>b.classList.toggle('on', +b.dataset.g===g));
}
function submitName(){
  const f=$('nameInput'); if(!f) return;
  const v=f.value.trim();
  if(!v){ toast("이름을 입력해 주세요"); f.focus(); return; }
  if(v.length>8){ toast("8자 이내로 입력해 주세요"); return; }
  S.name=v; S.grade=gradePick; S.code=makeCode();
  autosave();
  go('look');
}

/* ---------- 스토리 ---------- */
/* 캐릭터 꾸미기 — 헤어 6 · 얼굴 4 · 옷 6 · 피부 4 · 머리색 4 (2,304가지) */
function lookPreview(){return ['south','west','north'].map(d=>heroSprite(d,88)).join('');}
function setLook(k,v){
  if(!LOOKS[k]||!LOOKS[k].some(it=>it[0]===v)) return;
  S[k]=v; autosave(); RN_FRAMES=null;
  const el=$('lookStage'); if(el) el.innerHTML=lookPreview();
  document.querySelectorAll('.lookrow[data-k="'+k+'"] .tool')
    .forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  document.querySelectorAll('.head-choice').forEach(b=>{
    const key=customHeadKey(b.dataset.hair||lookOf('hair','messy'),b.dataset.face||lookOf('face','bright'),'south');
    b.dataset.hero=key; b.style.backgroundImage=`url('${heroImg(key)}')`;
  });
  refreshHeroArt();
}
function lookRow(k, cells){
  return `<div class="lookrow" data-k="${k}">${cells}</div>`;
}
function pgLook(){
  const hair=LOOKS.hair.map(([v,nm])=>`
    <div class="tool ${lookOf('hair','messy')===v?'on':''}" data-v="${v}" onclick="setLook('hair','${v}')">
      <div class="hp head-choice" data-hair="${v}" data-hero="${customHeadKey(v,lookOf('face','bright'),'south')}" style="background-image:url('${heroImg(customHeadKey(v,lookOf('face','bright'),'south'))}')"></div>
      <div class="tn">${nm}</div></div>`).join('');
  const face=LOOKS.face.map(([v,nm])=>`
    <button type="button" class="tool ${lookOf('face','bright')===v?'on':''}" data-v="${v}" onclick="setLook('face','${v}')">
      <div class="hp head-choice" data-face="${v}" data-hero="${customHeadKey(lookOf('hair','messy'),v,'south')}" style="background-image:url('${heroImg(customHeadKey(lookOf('hair','messy'),v,'south'))}')"></div>
      <div class="tn">${nm}</div></button>`).join('');
  const outfit=LOOKS.outfit.map(([v,nm])=>`
    <div class="tool ${lookOf('outfit','cloak')===v?'on':''}" data-v="${v}" onclick="setLook('outfit','${v}')">
      <div class="op" data-hero="body_${v}_south" style="background-image:url('${heroImg('body_'+v+'_south')}')"></div>
      <div class="tn">${nm}</div></div>`).join('');
  const swatch=(k,def)=>LOOKS[k].map(([v,nm,c])=>`
    <div class="tool ${lookOf(k,def)===v?'on':''}" data-v="${v}" onclick="setLook('${k}','${v}')">
      <div class="sw" style="background:${c}"></div><div class="tn">${nm}</div></div>`).join('');
  return `<div class="page"><div class="inner" style="justify-content:flex-start;flex:1;gap:10px">
    <h1 class="title" style="font-size:24px;margin:0">캐릭터 꾸미기</h1>
    <div id="lookStage" style="display:flex;justify-content:center;height:124px">${lookPreview()}</div>
    <div class="dialogue" style="margin:0">마음에 드는 모습으로 바꿔 보세요 ✨</div>
    <div class="looklabel">머리 모양</div>${lookRow('hair',hair)}
    <div class="looklabel">얼굴</div>${lookRow('face',face)}
    <div class="looklabel">옷</div>${lookRow('outfit',outfit)}
    <div class="looklabel">피부색</div>${lookRow('skin',swatch('skin','light'))}
    <div class="looklabel">머리색</div>${lookRow('haircol',swatch('haircol','brown'))}
    <button class="btn" onclick="go('story')">이 모습으로 시작!</button>
  </div></div>`;
}
function pgStory(){
  return `<div class="page"><div class="inner">
    <div class="mhead" style="justify-content:center">2030년, 아픈 지구</div>
    <div class="dialogue"><div class="who">🧚 에코</div>
      사람들이 나무를 베고 쓰레기를 버렸어요.<br>
      숲과 바다가 병들었고, 저 같은 <b>정령</b>들도 힘을 잃었어요.
    </div>
    <div class="dialogue"><div class="who">🧚 에코</div>
      <b>${NAME()}</b> 님, 저와 함께 <b>숲</b>부터 되살려 주세요!
    </div>
    <div class="card" style="text-align:center">
      <div style="font-size:12px;color:rgba(251,246,234,.65);margin-bottom:6px">나의 번호</div>
      <div class="codebox">${esc(S.code)}</div>
      <div class="note" style="margin-top:8px">이 번호를 적어 두세요.<br>다음 시간에 이어서 할 수 있어요.</div>
    </div>
    <button class="btn" onclick="go('pet')">정령 고르러 가기</button>
  </div></div>`;
}

/* ---------- 정령 선택 ---------- */
function pgPet(){
  const cards=Object.values(PETS).map(p=>`
    <div class="petcard ${S.petKey===p.key?'on':''}" onclick="pickPet('${p.key}')">
      <div class="av">${heroSpritePreview(p)}${petSprite(p,44,0)}</div>
      <div class="nm">${p.name}</div>
      <div class="ds">${p.desc}</div>
      <div class="tag" style="background:rgba(246,201,79,.2);color:var(--gold)">✨ ${p.skill.name}</div>
      <div class="ds" style="font-size:11.5px;line-height:1.5">${p.skill.plain}</div>
      <div class="ds" style="font-size:10.5px;opacity:.7">${p.skill.tip}</div>
      <div class="tag">${p.strongIn.join("·")}에서 힘이 세져요</div>
    </div>`).join('');
  return `<div class="page"><div class="inner">
    <div class="dialogue"><div class="who">🧚 에코</div>
      같이 갈 친구를 골라 주세요.<br>정령마다 <b>처음부터 쓰는 고유 기술</b>이 달라요!
    </div>
    <div class="petgrid">${cards}</div>
    <div class="note">이번에는 <b>숲</b>이라서 땅정령이 조금 더 힘이 세요.<br>다음 지역에서는 다른 정령이 활약해요!</div>
    <button class="btn" ${S.petKey?'':'disabled'} onclick="go('guide')">이 정령과 함께하기</button>
  </div></div>`;
}
function heroSpritePreview(p){
  return `<div style="width:88px;height:88px">${heroSprite('south',88)}</div>`;
}
function pickPet(k){ S.petKey=k; render(); }

/* ---------- 조작 안내 ---------- */
function pgGuide(){
  const p=PETS[S.petKey];
  const spots=CUR.map.objs.map(o=>{
    const d={lesson:'이야기 듣고 퀴즈 풀기',battle:'오염 몬스터와 싸우기',gather:'도구로 재료 모으기',
             craft:'재료로 물건 만들기',shop:'장비·회복약 사기',altar:'제단에서 쉬어 가기'}[o.type]||'';
    return `<div class="itemrow" style="padding:8px 10px">
      <div class="ico">${o.icon}</div>
      <div class="tx"><b>${o.cap}</b><small>${d}</small></div></div>`;
  }).join('');
  return `<div class="page"><div class="inner">
    <div class="dialogue"><div class="who">🧚 에코</div>
      <b>${p.name}</b>${J(p.name,'이','가')} 함께 가기로 했어요!<br>${CUR.name}${JRO(CUR.name)} 들어가 볼까요?
    </div>
    <div class="card">
      <div style="font-family:'Do Hyeon',sans-serif;font-size:15px;color:var(--gold);margin-bottom:8px">이렇게 해요</div>
      <div style="font-size:14px;line-height:2.1">
        <b>①</b> 버튼으로 걸어다녀요 <span style="opacity:.6">(◀▶▲▼ · 키보드도 됨)</span><br>
        <b>②</b> <span style="color:var(--gold)">빛나는 동그라미</span> 안으로 들어가요<br>
        <b>③</b> 활동을 하면 숲이 깨끗해져요<br>
        <b>④</b> <b>100%</b>가 되면 제단으로 가요
      </div>
    </div>
    <div class="card" style="border-color:var(--gold)">
      <div style="font-family:'Do Hyeon',sans-serif;font-size:14px;color:var(--gold);margin-bottom:5px">${p.name}의 고유 기술 · ${p.skill.name}</div>
      <div style="font-size:13.5px">${p.skill.plain} <span style="opacity:.6">(기력 ${p.skill.sp})</span><br><span style="font-size:12px;opacity:.75">${p.skill.tip}</span></div>
    </div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:14px;color:var(--gold)">숲에 있는 곳들</div>
    <div class="col">${spots}</div>
    <button class="btn" onclick="enterWorld()">숲으로 출발!</button>
  </div></div>`;
}
function enterWorld(){
  S.hpCur=baseStats().hpMax;
  Wd.px=SPAWN.x; Wd.py=SPAWN.y; Wd.petX=SPAWN.x-34; Wd.petY=SPAWN.y+6;
  Wd.trail=[]; Wd.ready=false;
  autosave();
  go('world');
}

/* ==========================================================
   월드 (탑다운)
   ========================================================== */
/* A fixed, small decorative layer: no timers, hit boxes or random rerenders. */
function ecoAtmosphereHTML(){
  let particles='';
  for(let i=0;i<24;i++){
    const phase=i<12?'polluted':'renewed';
    particles+=`<i class="eco-mote ${phase}" style="left:${5+(i*37)%90}%;top:${12+(i*23)%72}%;--drift:${i%2?24:-24}px;--duration:${7+i%6}s;--delay:-${i*1.7}s"></i>`;
  }
  return `<div class="eco-atmosphere" aria-hidden="true">${particles}</div>`;
}
function worldHTML(){
  let stripes=''; for(let i=0;i<9;i++) stripes+=`<div class="st" style="top:${i*(100/9)}%"></div>`;
  return `
  <div class="world" id="worldRoot">
    <div class="plane" id="plane" style="width:${W}px;height:${H}px">
      <div class="ground" id="ground" style="${groundStyle('before')}"></div>
      <div class="ground eco-restored" id="restoredGround" style="${groundStyle('after')}"></div>
      <div id="dirtLayer"></div>
      <div id="propLayer"></div>
      <div id="pollLayer"></div>
      <div id="lifeLayer"></div>
      <div id="objLayer"></div>
      <div id="npcLayer"></div>
      <div id="critLayer"></div>
      <div class="actor" id="pet"></div>
      <div class="actor" id="hero"></div>
    </div>
    ${ecoAtmosphereHTML()}
    <div class="eco-status" id="ecoStatus" role="status" aria-live="polite"></div>
    <div class="haze" id="haze"></div>
    <div class="rays" id="rays"></div>
    <div class="sun" id="sun"></div>
    <div class="vig"></div>
    <div class="guide" id="guide"><div class="g1">➤</div><div class="g2"></div></div>
    <div class="ctrl">
      <div class="dpad">
        <button class="dbtn u" data-k="u">▲</button>
        <button class="dbtn d" data-k="d">▼</button>
        <button class="dbtn l" data-k="l">◀</button>
        <button class="dbtn r" data-k="r">▶</button>
      </div>
      <button class="actbtn" id="actBtn">상호작용</button>
      <button class="tinybtn" id="muteBtn" onclick="auToggle()"
        style="position:absolute;right:10px;top:-40px;z-index:30">🔊</button>
    </div>
  </div>
  <div id="hudHost"></div>
  <div id="fieldHost"></div>
  <div id="farmHost"></div>
  <div id="modalHost"></div>
  <div class="wipe" id="wipe"><div class="flash"></div>${stripes}</div>
  <div id="toast" class="toast"></div>
  <div id="lvup" class="lvup"></div>`;
}

function paintHud(){
  const host=$('hudHost'); if(!host) return;
  const st=baseStats();
  const need=nextNeed();
  const prev=LEVELS[S.lv-1].need;
  const expPct = need===null?100:clamp((S.exp-prev)/(need-prev)*100,0,100);
  const hpPct  = clamp(S.hpCur/st.hpMax*100,0,100);
  host.innerHTML=`<div class="hud">
    <div class="pill">🧑 ${NAME()}</div>
    <div class="pill">Lv.${S.lv}</div>
    <div class="pill"><span style="width:9px;height:9px;border-radius:50%;background:${PETS[S.petKey].main};display:inline-block"></span>${petName()}</div>
    <div class="pill" style="${S.hpCur/st.hpMax<=.3?'color:#ffb0b0':''}">❤️ ${S.hpCur}/${st.hpMax}</div>
    <div class="pill">🪙 ${S.gold}</div>
    <div class="grow">
      <div class="gaugebar"><div class="f" style="width:${S.gauge}%"></div><span>${CUR.icon} ${CUR.name} 정화 ${S.gauge}%</span></div>
      <div class="expbar"><div class="f" style="width:${expPct}%"></div></div>
    </div>
    <div class="hudbtns">
      <button class="iconbtn" onclick="openStatus()">나</button>
      <button class="iconbtn" onclick="openModal('bag')">가방</button>
      <button class="iconbtn" onclick="openModal('dex')">도감</button>
      <button class="iconbtn" onclick="go('themes')">지도</button>
      <button class="iconbtn" onclick="doSave()">저장<span id="saveDot"></span></button>
    </div>
  </div>`;
  void hpPct;
}

function mountWorld(){
  let seed=Array.from(CUR.id).reduce((n,c)=>Math.imul(n,31)+c.charCodeAt(0),4096)>>>0;
  const artRandom=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const root=$('worldRoot');
  Wd.vw=root.clientWidth||900; Wd.vh=root.clientHeight||600;
  if(!window._rz){ window._rz=true; window.addEventListener('resize',()=>{
    const r=document.getElementById('worldRoot');
    if(r){ Wd.vw=r.clientWidth||900; Wd.vh=r.clientHeight||600; }
  }); }

  $('dirtLayer').innerHTML=worldPathSVG();

  const blocked=(x,y)=>{
    for(const o of OBJS) if(dist(x,y,o.x,o.y)<o.r+52) return true;
    for(let i=0;i<PATH.length;i++){
      const a=PATH[i],b=PATH[(i+1)%PATH.length];
      const L=dist(a.x,a.y,b.x,b.y); if(!L) continue;
      const t=clamp(((x-a.x)*(b.x-a.x)+(y-a.y)*(b.y-a.y))/(L*L),0,1);
      if(dist(x,y,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)<48) return true;
    }
    return false;
  };
  Wd.solid=[];                      // 통과할 수 없는 소품 (바위·건물 등)
  const place=(gen,count,layer,cls,kind)=>{
    const sd=SOLID_PROPS[kind];
    let html='',tries=0,n=0;
    while(n<count && tries<count*40){
      tries++;
      const x=40+artRandom()*(W-80), y=90+artRandom()*(H-130);
      if(blocked(x,y)) continue;
      if(sd && dist(x,y-sd.dy,SPAWN.x,SPAWN.y)<sd.r+70) continue;    // 시작 지점 비우기
      if(sd && Wd.solid.some(o=>dist(x,y-sd.dy,o.x,o.y)<sd.r+o.r+10)) continue;
      html+=`<div class="${cls}" style="left:${x}px;top:${y}px;z-index:${Math.floor(y)}">${gen()}</div>`;
      if(sd) Wd.solid.push({x:x, y:y-sd.dy, r:sd.r,phase:layer.id});
      n++;
    }
    layer.innerHTML+=html;
  };
  // 소품 구성은 테마 데이터(CUR.world)에서 읽는다 — 새 테마는 목록만 바꾸면 된다
  const WD=CUR.world||{props:[],poll:[],life:[]};
  const layers=[[WD.props,$('propLayer')],[WD.poll,$('pollLayer')],[WD.life,$('lifeLayer')]];
  layers.forEach(([list,layer])=>{
    (list||[]).forEach(([kind,n])=>{
      const cnt=Math.round(n*PROP_SCALE);
      if(cnt>0) place(propGen(kind), cnt, layer, 'prop', kind);
    });
  });

  let cr='';
  for(let i=0;i<8;i++){
    cr+=`<div class="critter" style="left:${120+artRandom()*(W-240)}px;top:${140+artRandom()*(H-260)}px;animation-delay:-${(artRandom()*5).toFixed(2)}s">${butterflySVG()}</div>`;
  }
  $('critLayer').innerHTML=cr;

  $('objLayer').innerHTML=OBJS.map(o=>{
    let art='';
    if(o.type==='lesson') art=npcSVG();
    else if(o.type==='battle') art=battleSpotSVG(curMonIdx(),CUR.moncol);
    else if(o.type==='farm')   art=sp('obj_farm');
    else if(o.type==='tower')  art=sp('obj_tower');
    else if(o.type==='shadow') art=shadowSprite(84);
    else if(o.type==='gather') art=bushSVG();
    else if(o.type==='craft') art=campSVG();
    else if(o.type==='shop') art=shopSVG();
    else art=altarSVG(S.gauge>=100);
    const z=Math.floor(o.y);
    return `<div class="beam" id="beam-${o.id}" style="left:${o.x}px;top:${o.y+10}px;z-index:${z-3};
        background:linear-gradient(180deg,rgba(${o.c},0) 0%,rgba(${o.c},.5) 60%,rgba(${o.c},.85) 100%)"></div>
      <div class="zone" id="zone-${o.id}" style="left:${o.x}px;top:${o.y}px;width:${o.r*2}px;height:${o.r*2}px;
        background:radial-gradient(circle,rgba(${o.c},.08) 35%,rgba(${o.c},.5) 78%,rgba(${o.c},.85) 100%);
        box-shadow:0 0 40px rgba(${o.c},.75);z-index:${z-2}"></div>
      <div class="zring" id="ring-${o.id}" style="left:${o.x}px;top:${o.y}px;width:${o.r*2.2}px;height:${o.r*2.2}px;
        border-color:rgba(${o.c},.9);z-index:${z-1}"></div>
      <div class="wobj" id="wobj-${o.id}" style="left:${o.x}px;top:${o.y}px;z-index:${z}">
        <div class="tip">${o.tip}</div><div class="wart" id="wart-${o.id}">${art}</div></div>
      <div class="marker" id="mk-${o.id}" style="left:${o.x}px;top:${o.y-74}px;z-index:${z+40};color:rgb(${o.c})">
        <div class="bub" style="background:rgb(${o.c})">${o.icon}</div>
        <div class="pin"></div>
        <div class="nm">${o.cap}</div>
      </div>`;
  }).join('');

  $('hero').innerHTML=`<div class="shadow"></div>${heroSprite('south',88,true)}<div class="nametag">${NAME()}</div>`;
  $('pet').innerHTML=petSprite(PETS[S.petKey]);

  // 마지막 상대가 나타날 조건이 되었는데 목록에 없으면 다시 세운다
  if(allThemesClear() && !OBJS.some(o=>o.type==='shadow')) applyTheme(S.themeId);
  bindControls();
  paintMood();
  refreshObjs();
  paintNpcs();
  startLoop();
  bgmUpdate();
  admBadge();
  Wd.ready=true;
}

function bindControls(){
  document.querySelectorAll('.dbtn').forEach(b=>{
    const k=b.dataset.k;
    const on=e=>{
      e.preventDefault(); Wd.keys[k]=true;
      try{ b.setPointerCapture(e.pointerId); }catch(err){}    // 손가락을 붙잡는다
    };
    const off=()=>{Wd.keys[k]=false;};
    b.addEventListener('lostpointercapture',off);
    b.addEventListener('pointerdown',on);
    b.addEventListener('pointerup',off);
    b.addEventListener('pointerleave',off);
    b.addEventListener('pointercancel',off);
  });
  $('actBtn').addEventListener('click',doAction);
  const mb=$('muteBtn'); if(mb) mb.textContent = Au.muted?'🔇':'🔊';
  if(!window._kb){
    window._kb=true;
    const map={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r',W:'u',S:'d',A:'l',D:'r'};
    // 글자 입력 중에는 이동키로 가로채지 않는다
    const typing=()=>{
      const el=document.activeElement;
      return el && (el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable);
    };
    document.addEventListener('keydown',e=>{
      if(typing()) return;
      if(S && S.modal==='field' && map[e.key]){ Fd.keys[map[e.key]]=true; e.preventDefault(); }
      if(S && S.modal==='farm'  && map[e.key]){ Rd.keys[map[e.key]]=true; e.preventDefault(); }
      if(S && S.scene==='world' && !S.modal && map[e.key]){ Wd.keys[map[e.key]]=true; e.preventDefault(); }
      if(S && S.modal==='pang'){ pangKey(e.key,true); return; }
      if(e.key===' '||e.key==='Enter'){
        if(S&&S.modal==='field'){ e.preventDefault(); fAct(); }
        else if(S&&S.modal==='farm'){ e.preventDefault(); rAct(); }
        else if(S&&S.scene==='world'&&!S.modal){ e.preventDefault(); doAction(); }
      }
      if(e.key==='Escape'){
        if(S&&S.modal==='field'){ leaveField(); return; }
        if(S&&S.modal==='farm'){ leaveFarm(); return; }
        if(S&&S.modal&&S.modal!=='battle'&&S.modal!=='pang') closeModal();
      }
    });
    document.addEventListener('keyup',e=>{
      if(map[e.key]){ Wd.keys[map[e.key]]=false; Fd.keys[map[e.key]]=false; Rd.keys[map[e.key]]=false; }
      if(S && S.modal==='pang') pangKey(e.key,false);
    });
    // 창을 벗어나면 눌린 키를 모두 놓는다 (계속 걷는 버그 방지)
    window.addEventListener('blur',releaseKeys);
    if(!window._upGuard){
      window._upGuard=true;
      ['pointerdown','keydown','touchstart'].forEach(ev=>
        window.addEventListener(ev,()=>{ auResume(); bgmUpdate(); },{once:false}));
      // 버튼 위가 아닌 곳에서 손을 떼도(모달이 덮은 경우 포함) 반드시 잡는다
      ['pointerup','pointercancel','touchend','touchcancel','mouseup']
        .forEach(ev=>window.addEventListener(ev,releaseKeys,true));
    }
  }
}

function paintMood(){
  const g=clamp(S.gauge/100,0,1);
  const restored=$('restoredGround');
  if(restored){
    const center=OBJS.find(o=>o.type==='altar')||{x:W/2,y:H/2};
    const radius=Math.hypot(Math.max(center.x,W-center.x),Math.max(center.y,H-center.y));
    restored.style.opacity=1;
    restored.style.clipPath=`circle(${Math.ceil(radius*g)}px at ${center.x}px ${center.y}px)`;
    restored.dataset.recovery=String(g);
  }
  const status=$('ecoStatus'); if(status){
    status.textContent=CUR.name+' · '+(g>=1?'정화 완료':g===0?'정화 전':'회복 중')+' · '+Math.round(g*100)+'%';
    status.dataset.phase=g>=1?'after':g===0?'before':'healing';
  }
  const root=$('worldRoot'); if(root){root.style.setProperty('--eco-recovery',g);root.dataset.theme=CUR.id;root.dataset.phase=g>=1?'after':g===0?'before':'healing';}
  const gr=$('ground'); if(gr) gr.style.filter='none';
  const path=$('pathRecovered'); if(path) path.setAttribute('opacity',String(g));
  const hz=$('haze'); if(hz) hz.style.opacity=(1-g)*.18;
  const ry=$('rays'); if(ry) ry.style.opacity=g*.10;
  const sn=$('sun'); if(sn) sn.style.opacity=g*.25;
  const pol=$('pollLayer'); if(pol) pol.style.opacity=1-g;
  const lif=$('lifeLayer'); if(lif) lif.style.opacity=g;
  document.querySelectorAll('.critter').forEach(c=>{
    c.style.opacity = g>.35 ? clamp((g-.35)/.4,0,1) : 0;
  });
  const alt=$('wart-altar');
  if(alt) alt.innerHTML=altarSVG(S.gauge>=100);
}

function objDone(o){
  if(o.type==='lesson') return S.lessonDone;
  if(o.type==='battle') return S.battleDone;
  if(o.type==='shadow') return shadowBeaten();
  if(o.type==='farm'||o.type==='tower') return false;   // 농장·탑은 언제든 다시
  if(o.type==='gather') return S.gatherDone;
  if(o.type==='craft')  return Object.keys(S.crafted).length>=CUR.recipes.length;
  return false;
}
function refreshObjs(){
  OBJS.forEach(o=>{
    const done=objDone(o);
    const w=$('wobj-'+o.id), z=$('zone-'+o.id), r=$('ring-'+o.id), b=$('beam-'+o.id), mk=$('mk-'+o.id);
    const hide = done && o.type!=='shop';
    if(w) w.classList.toggle('done',done);
    if(z) z.classList.toggle('off',hide);
    if(r) r.classList.toggle('off',hide);
    if(b) b.classList.toggle('off',hide);
    if(mk){
      const bub=mk.querySelector('.bub');
      if(done && o.type!=='shop'){ if(bub){ bub.textContent='✅'; bub.style.background='#6b7a6b'; } mk.style.opacity='.5'; }
      else { if(bub){ bub.textContent=o.icon; bub.style.background='rgb('+o.c+')'; } mk.style.opacity='1'; }
    }
    const wa=$('wart-'+o.id);
    if(o.type==='battle' && wa && !done)
      wa.innerHTML=battleSpotSVG(curMonIdx(),CUR.moncol);
    if(o.type==='altar' && wa)
      wa.innerHTML=altarSVG(S.gauge>=100);
  });
  paintHud();
}

function updateGuide(){
  const g=$('guide'); if(!g) return;
  let target=null, best=1e9;
  for(const o of OBJS){
    if(objDone(o)) continue;
    if(o.type==='shop') continue;
    if(o.type==='altar' && S.gauge<100) continue;
    const d=dist(Wd.px,Wd.py,o.x,o.y);
    if(d<best){ best=d; target=o; }
  }
  if(!target){ g.classList.remove('on'); return; }
  const sx=target.x-Wd.cx, sy=target.y-Wd.cy;
  const pad=54;
  const onScreen = sx>pad && sx<Wd.vw-pad && sy>pad && sy<Wd.vh-pad;
  if(onScreen){ g.classList.remove('on'); return; }
  const cx=Wd.vw/2, cy=Wd.vh/2;
  let vx=sx-cx, vy=sy-cy;
  const k=Math.min((cx-pad)/Math.max(1,Math.abs(vx)),(cy-pad)/Math.max(1,Math.abs(vy)));
  const gx=cx+vx*k, gy=cy+vy*k;
  const ang=Math.atan2(vy,vx)*180/Math.PI;
  g.style.left=gx+'px'; g.style.top=gy+'px';
  g.querySelector('.g1').style.transform=`rotate(${ang}deg)`;
  g.querySelector('.g2').textContent=target.cap;
  g.classList.add('on');
}

function stopLoop(){ if(Wd.raf){ cancelAnimationFrame(Wd.raf); Wd.raf=null; } }
function startLoop(){
  stopLoop();
  let last=performance.now();
  const step=t=>{
    const dt=Math.min(34,t-last); last=t;
    tick(dt);
    Wd.raf=requestAnimationFrame(step);
  };
  Wd.raf=requestAnimationFrame(step);
}

function syncStride(el,state,travel){
  const walking=travel>.001;
  state.moving=walking;
  el.classList.toggle('walk',walking);
  el.classList.add('stride-driven');
  state.stride=(state.stride||0)+travel;
  const frame=walking?1+Math.floor(state.stride/12)%8:0;
  const body=el.querySelector('.sprite:not(.head)'), avatar=el.querySelector('.avatar');
  if(body) body.style.backgroundPosition=(frame*12.5)+'% 0';
  if(avatar) avatar.style.transform=walking?'translateY('+([0,-1,-2,-1,0,-1,-2,-1][frame-1])+'px)':'';
}

function tick(dt){
  const hero=$('hero'); if(!hero) return;
  const sp=.19*dt;
  const oldX=Wd.px,oldY=Wd.py;
  let dx=0,dy=0;
  if(!S.modal){
    if(Wd.keys.l) dx-=1;
    if(Wd.keys.r) dx+=1;
    if(Wd.keys.u) dy-=1;
    if(Wd.keys.d) dy+=1;
  }
  const moving = dx!==0||dy!==0;
  if(moving){
    const len=Math.hypot(dx,dy);
    dx=dx/len*sp; dy=dy/len*sp;
    const wx=clamp(Wd.px+dx,30,W-30), wy=clamp(Wd.py+dy,110,H-30);
    const solid=solidCheck(Wd.solid,Wd.px,Wd.py);
    const stuckInNpc=hitNpc(Wd.px,Wd.py);      // 이미 겹쳐 있으면 빠져나갈 수 있게
    const hit=(x,y)=> solid(x,y) || (!stuckInNpc && hitNpc(x,y));
    if(!hit(wx,Wd.py)) Wd.px=wx;      // 가로만 먼저
    if(!hit(Wd.px,wy)) Wd.py=wy;      // 세로는 따로 → 벽 타기
    let nf=Wd.face;
    const ax=Math.abs(dx), ay=Math.abs(dy);
    const horizNow=(Wd.face==='east'||Wd.face==='west');
    if(horizNow ? (ay>ax*1.3) : (ax>ay*1.3)) nf = (ax>ay) ? (dx<0?'west':'east') : (dy<0?'north':'south');
    else nf = horizNow ? (dx<0?'west':(dx>0?'east':Wd.face)) : (dy<0?'north':(dy>0?'south':Wd.face));
    if(nf!==Wd.face){ Wd.face=nf; setHeroFacing(nf); }
  }
  syncStride(hero,Wd,Math.hypot(Wd.px-oldX,Wd.py-oldY));
  npcStepAll(dt);
  npcNear();

  const petStep=companionFollow(Wd,Wd.px,Wd.py,dt);
  setCompanionFacing(Wd.petFacing||Wd.face||'south');

  hero.style.left=Math.round(Wd.px)+'px'; hero.style.top=Math.round(Wd.py)+'px'; hero.style.zIndex=Math.floor(Wd.py)+1;
  const pet=$('pet');
  pet.style.left=Wd.petX.toFixed(2)+'px'; pet.style.top=(Wd.petY+(S.petKey==='earth'?petStep:0)).toFixed(2)+'px'; pet.style.zIndex=Math.floor(Wd.petY);

  const tx=clamp(Wd.px-Wd.vw/2,0,Math.max(0,W-Wd.vw));
  const ty=clamp(Wd.py-Wd.vh/2,0,Math.max(0,H-Wd.vh));
  Wd.cx+=(tx-Wd.cx)*.12; Wd.cy+=(ty-Wd.cy)*.12;
  $('plane').style.transform=`translate(${-Math.round(Wd.cx)}px,${-Math.round(Wd.cy)}px)`;

  checkZones();
  updateGuide();
}

function checkZones(){
  let near=null,nd=1e9;
  OBJS.forEach(o=>{
    const d=dist(Wd.px,Wd.py,o.x,o.y);
    const inside = d<o.r;
    if(!S.modal && inside && !o._in){
      if(o.type!=='altar' && !objDone(o)) trigger(o);
    }
    o._in=inside;
    if(inside && d<nd){ nd=d; near=o; }
  });
  document.querySelectorAll('.wobj').forEach(e=>e.classList.remove('near'));
  const btn=$('actBtn');
  if(near){
    const w=$('wobj-'+near.id); if(w) w.classList.add('near');
    Wd.near=near;
    const showBtn = near.type==='altar' || near.type==='shop' || objDone(near);
    if(showBtn){
      btn.classList.add('on');
      btn.textContent = (objDone(near)&&near.type!=="shop"&&near.type!=="altar")
        ? (near.type==="lesson" ? "샘물 마시기" : "다시 보기") : near.tip;
    } else btn.classList.remove('on');
  }else{
    Wd.near=null; btn.classList.remove('on');
  }
  if(Nd.near && !S.modal){                       // 거점이 없어도 NPC가 있으면 말을 건다
    btn.classList.add('on');
    const nm=Nd.near.nm;
    btn.textContent = npcDone(Nd.near.id) ? `${nm}${J(nm,'과','와')} 다시 이야기`
                                          : `${nm}${J(nm,'과','와')} 이야기`;
  }
}

function trigger(o){
  Wd.keys={u:false,d:false,l:false,r:false};
  if(o.type==='lesson'){ lessonPage=lessonBook().page||0;openModal('lesson'); }   // 퀴즈는 NPC들이 낸다
  else if(o.type==='battle') openModal('meet');      // 바로 싸우지 않고 먼저 물어본다
  else if(o.type==='gather') enterField();
  else if(o.type==='farm')   enterFarm();
  else if(o.type==='tower')  enterTower();
  else if(o.type==='shadow'){ releaseKeys(); S.modal='shadowMeet'; drawModal(); }
  else if(o.type==='craft')  openModal('craft');
  else if(o.type==='shop')   openModal('shop');
}
function doAction(){
  const o=Wd.near;
  if(Nd.near && (!o || dist(Wd.px,Wd.py,Nd.near.x,Nd.near.y) < dist(Wd.px,Wd.py,o.x,o.y))){
    talkNpc(Nd.near); return;
  }
  if(!o) return;
  if(o.type==='altar'){ releaseKeys(); openModal('altar'); return; }
  if(o.type==='shop'){ openModal('shop'); return; }
  if(objDone(o)){
    if(o.type==='lesson') openModal('spring');
    else if(o.type==='gather') enterField();
    else if(o.type==='farm')  enterFarm();
    else if(o.type==='tower') enterTower();
    else if(o.type==='shadow'){ releaseKeys(); S.modal='shadowMeet'; drawModal(); }
    else if(o.type==='craft') openModal('craft');
    else if(o.type==='battle') toast("이 지역의 몬스터는 모두 정화했어요");
    return;
  }
  trigger(o);
}

/* ==========================================================
   포켓몬식 스트라이프 전환
   ========================================================== */
function wipeIn(cb){
  const w=$('wipe');
  if(!w){ cb&&cb(); return; }
  w.classList.remove('out'); w.classList.add('on');
  setTimeout(()=>{ cb&&cb(); }, 480);
  setTimeout(()=>{ w.classList.add('out'); }, 640);
  setTimeout(()=>{ w.classList.remove('on','out'); }, 1080);
}

/* ==========================================================
   마주침 → 동의 → 전투장 입장
   ========================================================== */
function curMon(){
  if(Shadow.on && Shadow.mon) return Shadow.mon;   // 마지막 상대는 나 자신
  if(Duel.on && Duel.mon) return Duel.mon;  // 대련 중에는 NPC 가 상대다
  if(Tw.on && Tw.mon) return Tw.mon;      // 탑에서는 층 몬스터가 상대다
  return CUR.monsters[clamp(S.monIdx,0,CUR.monsters.length-1)];
}

function mMeet(){
  if(S.encounterWon)advanceEncounter();
  if(S.interludePending)return mInterlude();
  if(S.battleDone)return '<div class=card>이 지역의 몬스터를 모두 정화했어요!</div><button class=btn onclick="closeModal()">돌아가기</button>';
  const m=curMon();
  const st=baseStats();
  const ms=monStats(m);
  const plogging=m.mode==='pang';
  const lowHp = S.hpCur/st.hpMax <= .35;
  const kindTxt = m.boss? '<span style="color:var(--danger)">최종 보스</span>'
                : m.mid ? '<span style="color:var(--gold)">중간 보스</span>'
                : `${curMonIdx()+1}번째 몬스터`;
  return `<div class="mhead"><span>❗ 무언가와 마주쳤다</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">${curMonIdx()+1} / ${CUR.monsters.length}</span></div>
    ${encounterRouteMarkup()}
    <div class="encounter">
      <div style="filter:drop-shadow(0 6px 8px rgba(0,0,0,.5))">${monsterSVG(curMonIdx(),132)}</div>
      <div class="mon" style="margin-top:6px">${m.name}</div>
      <div class="note" style="margin-top:2px">${plogging?'플로킹 관문 · 쓰레기 20개 수거':`${kindTxt} · 체력 ${ms.hp} · 공격 ${ms.atk}`}</div>
    </div>
    <div class="dialogue"><div class="who">🧚 에코</div>${m.meet}<br>
      ${plogging?'플로킹으로 주변을 깨끗하게 만들어 볼까요?':'싸우러 <b>들어갈까요?</b>'}</div>
    ${!plogging&&lowHp?`<div class="hpwarn">⚠️ 지금 체력이 <b>${S.hpCur} / ${st.hpMax}</b> 예요.<br>
        <b>배우는 샘</b>에서 샘물을 마시거나 <b>가게</b>에서 회복약을 사면 좋아요.</div>`:''}
    ${S.defeatStreak>0?`<div class="note" style="color:var(--gold)">${plogging?`다시 도전하면 하트 +${Math.min(2,S.defeatStreak)}`:`🧚 에코의 도움 +${Math.round(Math.min(S.defeatStreak,BLESS_MAX)*BLESS_STEP*100)}% 를 받고 들어가요`}</div>`:''}
    <div class="row">
      <button class="btn" onclick="acceptBattle()">${plogging?'🧹 플로킹 시작':'⚔️ 들어간다'}</button>
      <button class="btn sec" onclick="declineBattle()">지금은 그냥 지나간다</button>
    </div>`;
}
function declineBattle(){
  closeModal();
  toast("언제든 다시 오면 돼요");
}
function acceptBattle(){
  closeModal();stopLoop();wipeIn(startEncounter);
}
/* Turn-based battles */
function initBattle(){
  playSfx('encount'); setTimeout(bgmUpdate,340);
  const st=baseStats();
  const m=curMon();
  const ms=monStats(m);
  const startSp = (S.spCur==null) ? st.spMax : clamp(S.spCur,0,st.spMax);
  B={ hp:S.hpCur, hpMax:st.hpMax, sp:startSp, spMax:st.spMax,
      atk:st.atk, def:st.def, eatk:ms.atk, edr:ms.dr, ehp:ms.hp, ehpMax:ms.hp,
      guard:false, evade:false, defDown:0, turn:1,
      bless:Math.min(S.defeatStreak,BLESS_MAX)*BLESS_STEP,
      lastTaken:0, log:`오염 지대에 <b>${m.name}</b>${J(m.name,'이','가')} 나타났다!`,
      over:false, win:false, busy:true, drop:null, gaugeGot:0, solace:0,
      stun:0, bleed:0, bleedLeft:0, bleedUsed:0, usedFree:false };
}

function mountBattle(){
  stopBattleView();
  initBattle();
  S.modal='battle';
  const m=curMon();
  const host=$('modalHost'); if(!host) return;
  host.innerHTML=`
  <div class="bscene ${cinematicBattleView()?'cinematic-battle':''}" id="bscene" data-rank="${m.boss?'boss':m.mid?'mid':'normal'}">
    ${arenaBG()}
    <div class="bfield" id="bfield">
      ${cinematicBattleView()?`<div class="battle-location">${BATTLE_PLACES[battleThemeId()]} · 오염 지대</div>`:''}
      <div class="bactor foe enter-foe" id="bfoe">
        <div class="art" id="bfoeArt">${monsterSVG(curMonIdx(),132,cinematicBattleView()?"":"mobIn")}<div class="bshadow"></div></div>
      </div>
      <div class="bactor me enter-me" id="bme">
        <div class="art">${cinematicBattleView()?battleRearHero(132):heroSprite('east',132)}<div class="bshadow"></div></div>
      </div>
      <div class="plate foe" id="plateFoe">
        <div class="pnm"><span>${m.name}</span><span class="plv">${m.boss?'BOSS':''}</span></div>
        <div class="pbar"><div class="f" id="foeHp" style="width:100%"></div></div>
        <div class="pnum" id="foeNum">HP ${B.ehp} / ${B.ehpMax}</div>
      </div>
      <div class="plate me" id="plateMe">
        <div class="pnm"><span>${NAME()}</span><span class="plv">Lv.${S.lv}</span></div>
        <div class="pbar"><div class="f" id="meHp" style="width:100%"></div></div>
        <div class="psp"><div class="f" id="meSp" style="width:100%"></div></div>
        <div class="pnum" id="meNum">HP ${B.hp} / ${B.hpMax} · SP ${B.sp}</div>
        <div class="badge" id="meBadge" style="display:none"></div>
      </div>
      <div class="btag" id="btag"></div>
    </div>
    <div class="bui">
      <div class="blog" id="bLog"></div>
      <div class="bskills" id="bSkills"></div>
      <div class="brow2" id="bExtra"></div>
    </div>
    <div id="bResult"></div>
  </div>`;
  if(cinematicBattleView())startBattleView();
  paintBattle();
  // 입장 연출이 끝나면 조작 가능
  setTimeout(()=>{ if(B){ B.busy=false; paintBattle(); } },620);
}

function paintBattle(){
  if(!B || S.modal!=='battle') return;
  const m=curMon();
  const fPct=clamp(B.ehp/B.ehpMax*100,0,100);
  const mPct=clamp(B.hp/B.hpMax*100,0,100);
  const cls=p=>p<=25?'f low':p<=50?'f mid':'f';
  const fh=$('foeHp'), mh=$('meHp'), ms=$('meSp');
  if(fh){ fh.style.width=fPct+'%'; fh.className=cls(fPct); }
  if(mh){ mh.style.width=mPct+'%'; mh.className=cls(mPct); }
  if(ms) ms.style.width=clamp(B.sp/B.spMax*100,0,100)+'%';
  const fn=$('foeNum'), mn=$('meNum');
  if(fn) fn.textContent=`HP ${Math.max(0,B.ehp)} / ${B.ehpMax}`;
  if(mn) mn.textContent=`HP ${Math.max(0,B.hp)} / ${B.hpMax} · SP ${B.sp}`;

  const bd=$('meBadge');
  if(bd){
    let t='';
    if(B.evade) t='🛡 회피 준비';
    else if(B.guard) t='🛡 방어';
    else if(petStrong()) t='🌟 속성 +25%';
    if(t){ bd.textContent=t; bd.style.display=''; } else bd.style.display='none';
  }
  const lg=$('bLog');
  if(lg){
    let extra='';
    if(B.bless>0) extra+=`<br><span style="color:var(--gold);font-size:12px">🧚 에코의 도움 +${Math.round(B.bless*100)}%</span>`;
    if(B.defDown>0) extra+=`<br><span style="color:var(--danger);font-size:12px">포자 때문에 약해졌어요 (${B.defDown}턴 남음)</span>`;
    lg.innerHTML=B.log+extra;
  }
  const sk=$('bSkills');
  if(sk){
    sk.innerHTML=activeSkills().map(s=>{
      const locked=S.lv<s.lv, noSp=B.sp<s.sp;
      const hi=(s.id==='ult'&&petStrong())||s.pet;
      return `<button class="skl ${hi?'hi':''}" ${locked||noSp||B.busy||B.over?'disabled':''} onclick="bSkill('${s.id}')">
        <b>${locked?'🔒 '+s.name:s.name}</b>
        <small>${locked?`Lv.${s.lv}부터 쓸 수 있어요`:(s.sp?`기력 ${s.sp} · `:'')+s.desc}</small></button>`;
    }).join('');
  }
  const ex=$('bExtra');
  if(ex){
    ex.innerHTML=
      (S.potions>0?`<button class="btn sec" ${B.busy||B.over?'disabled':''} onclick="bPotion()">🧪 회복약 (${S.potions})</button>`:'')
      + `<button class="btn sec" ${B.busy||B.over?'disabled':''} onclick="bFlee()">🏃 도망가기</button>`;
  }
}

function bpop(who,txt,cls){
  const f=$('bfield'); if(!f) return;
  const host=$(who==='me'?'bme':'bfoe'); if(!host) return;
  const d=document.createElement('div');
  d.className='bpop '+(cls||''); d.textContent=txt;
  const r=host.getBoundingClientRect(), fr=f.getBoundingClientRect();
  d.style.left=(r.left-fr.left+r.width*.5-14)+'px';
  d.style.top =(r.top -fr.top -14)+'px';
  f.appendChild(d);
  if(cls!=='heal') sparks(f, r.left-fr.left+r.width*.5, r.top-fr.top+r.height*.45, 8,
                          who==='me'?'#ffd0c0':'#fff2b8');
  setTimeout(()=>d.remove(),950);
}
function banim(who,cls,ms){
  const el=$(who==='me'?'bme':'bfoe'); if(!el) return;
  el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls),ms||380);
  if(cls==='hurt2'){ flashArt(who); playSfx(who==='foe'?'hit':'hurt'); }
}
/* 대상 한가운데에 효과를 띄운다 */
function fx(who,kind){
  const f=$('bfield'), host=$(who==='me'?'bme':'bfoe');
  if(!f||!host) return;
  const r=host.getBoundingClientRect(), fr=f.getBoundingClientRect();
  const d=document.createElement('div');
  d.className='fx '+kind;
  d.style.left=(r.left-fr.left+r.width*.5)+'px';
  d.style.top =(r.top -fr.top +r.height*.45)+'px';
  f.appendChild(d);
  setTimeout(()=>d.remove(),620);
}
/* 내지르는 동작이 닿는 순간에 맞춰 피해를 보여준다 */
function strike(atk,kind,onHit){
  banim(atk, atk==='me'?'lungeMe':'lungeFoe', 520);
  setTimeout(()=>{
    if(!B||B.over&&atk==='foe') return;
    const tgt = atk==='me' ? 'foe' : 'me';
    banim(tgt,'hurt2');
    fx(tgt,kind);
    bshake();
    if(onHit) onHit();
  },185);
}
/* 타격 순간의 흰 섬광 */
function flashArt(who){
  const el=$(who==='me'?'bme':'bfoe');
  const art=el&&el.querySelector('.pxa,.sprite,.art');
  if(!art) return;
  art.classList.add('hitflash');
  setTimeout(()=>art.classList.remove('hitflash'),460);
}
function bshake(){
  const s=$('bscene'); if(!s) return;
  s.classList.add('shakeAll');
  setTimeout(()=>s.classList.remove('shakeAll'),270);
}
function btag(txt){
  const t=$('btag'); if(!t) return;
  t.textContent=txt; t.classList.add('on');
  setTimeout(()=>t.classList.remove('on'),1000);
}

function bSkill(id){
  if(!B||B.busy||B.over) return;
  const s=activeSkills().find(x=>x.id===id);
  const ls=legendOf('shoes');
  const canFree = ls && ls.eff==='free' && !B.usedFree && s.sp>0;
  if(!s || S.lv<s.lv || (B.sp<s.sp && !canFree)) return;
  B.busy=true;
  if(B.sp<s.sp || (canFree && s.sp>=11)){        // 기력이 모자라거나 비싼 기술일 때 쓴다
    if(canFree){ B.usedFree=true; btag('꼬질꼬질한 운동화! 기력 0'); }
    else B.sp-=s.sp;
  } else B.sp-=s.sp;
  const m=curMon();
  const pet=PETS[S.petKey];

  /* --- 비공격 스킬 --- */
  if(id==='guard'){
    B.guard=true; B.log=`${NAME()}${J(S.name,'이','가')} <b>방어 태세</b>를 취했다!`;
    fx('me','fxShield');
    paintBattle(); setTimeout(enemyTurn,520); return;
  }
  if(id==='heal' || id==='mend'){
    const h=Math.round(B.hpMax*(id==='mend'?.55:.3));
    B.hp=Math.min(B.hpMax,B.hp+h);
    B.log=`${NAME()}${J(S.name,'이','가')} <b>회복</b>했다! HP +${h}`;
    bpop('me','+'+h,'heal');
    const bf=$('bfield'), bm=$('bme');
    if(bf&&bm){ const r=bm.getBoundingClientRect(), fr=bf.getBoundingClientRect();
      sparks(bf, r.left-fr.left+r.width*.5, r.top-fr.top+r.height*.5, 10, '#c8f0a0'); }
    paintBattle(); setTimeout(enemyTurn,560); return;
  }

  /* --- 공격 스킬 (정령 고유 기술은 '공격 + 특수 효과') --- */
  let mult=1.0, tagTxt='', side='';
  if(id==='ult'){ mult = S.lv>=5?2.0:1.8; tagTxt='속성 필살기!'; }
  else if(id==='strike'){ mult=1.55; tagTxt='정화의 강타!'; }
  else if(id==='p_fire'){ mult=1.5; tagTxt='불꽃 일격!'; }
  else if(id==='p_water'){
    mult=0.8; tagTxt='물의 장막!'; B.evade=true;
    side=` — ${pet.skill.line}. <b>다음 공격 1회를 피한다!</b>`;
  }
  else if(id==='p_earth'){
    mult=0.8; tagTxt='대지의 은총!';
    const h=Math.max(6,Math.round(B.lastTaken*0.7));
    B.hp=Math.min(B.hpMax,B.hp+h);
    bpop('me','+'+h,'heal');
    side=` — ${pet.skill.line}. HP <b>+${h}</b> 회복!`;
  }

  let dmg=Math.round((B.atk*mult*(1+B.bless)) + (Math.random()*4-1));
  const strong=petStrong();
  if(strong) dmg=Math.round(dmg*AFFINITY);
  const resisted = m.pat==='resist' && B.turn%3===0;
  if(resisted) dmg=Math.round(dmg*.5);
  dmg=Math.max(1, Math.round(dmg*(1-(B.edr||0))));   // 몬스터 방어력만큼 피해 감소
  B.ehp-=dmg;

  // 전설 무기 효과
  const lw=legendOf('weapon');
  let legendNote='';
  if(lw && B.ehp>0){
    if(lw.eff==='stun' && Math.random()<lw.p){
      B.stun=1; legendNote=` <b style="color:var(--gold)">기절!</b>`;
      fx('foe','fxBurst');
    } else if(lw.eff==='doom' && !m.boss && Math.random()<lw.p){
      B.ehp=0; legendNote=` <b style="color:var(--gold)">단숨에 정화!</b>`;
      fx('foe','fxBurst');
    } else if(lw.eff==='bleed' && Math.random()<lw.p){
      B.bleed=Math.max(B.bleed||0,
        Math.min(Math.round(B.atk*0.45), Math.round(B.ehpMax*0.06)));
      if((B.bleedUsed||0) < 6){                       // 한 판에 여섯 턴까지만
        B.bleedLeft = Math.max(B.bleedLeft||0, 3);
      }
      legendNote=` <b style="color:var(--gold)">출혈!</b>`;
    }
  }

  const big=(id==='ult'||id==='p_fire');
  strike('me', big?'fxBurst':'fxSlash', ()=>bpop('foe','-'+dmg, big?'crit':''));
  if(tagTxt) btag(tagTxt);

  B.log = `${NAME()}의 <b>${s.name}</b>! ${dmg}의 피해`
    + (strong?` <span style="color:var(--green)">(속성 보너스)</span>`:'')
    + (side?`<span style="color:var(--gold)">${side}</span>`:'')
    + (resisted?` <span style="color:var(--danger)">— ${m.name}${J(m.name,'이','가')} 정화 저항으로 피해를 줄였다!</span>`:'')
    + legendNote;
  paintBattle();

  setTimeout(()=>{
    if(!B || B.over) return;          // 도망·부활 등으로 전투를 떠난 뒤면 무시
    if(B.ehp<=0){ winBattle(); return; }
    enemyTurn();
  },480);
}

function bPotion(){
  if(!B||S.potions<=0||B.busy||B.over) return;
  S.potions--; const h=Math.round(B.hpMax*.2);
  B.hp=Math.min(B.hpMax,B.hp+h);
  B.log=`회복약을 마셨다! HP +${h}`;
  bpop('me','+'+h,'heal');
  B.busy=true; paintBattle();
  setTimeout(enemyTurn,560);
}

function bFlee(){
  if(!B||B.busy||B.over) return;
  S.hpCur=Math.max(1,B.hp); S.spCur=B.sp;   // 포기해도 직전 상태 그대로 유지
  B.over=true;
  toast("숲으로 돌아왔어요. 언제든 다시 도전할 수 있어요");
  leaveBattle();
}

function enemyTurn(){
  if(!B||B.over) return;
  const m=curMon();

  // 출혈은 상대 차례가 오기 전에 먼저 깎는다
  if(B.bleed>0 && (B.bleedLeft||0)>0){
    B.bleedLeft--; B.bleedUsed=(B.bleedUsed||0)+1;
    if(B.bleedLeft<=0) B.bleed=0;
    B.ehp-=B.bleed;
    bpop('foe','-'+B.bleed,'crit');
    if(B.ehp<=0){
      B.log=`출혈로 ${m.name}${J(m.name,'이','가')} 정화되었다!`;
      paintBattle(); winBattle(); return;
    }
  }
  // 기절하면 한 턴을 건너뛴다
  if(B.stun>0){
    B.stun--;
    B.log=`${m.name}${J(m.name,'은','는')} <b>기절</b>해서 움직이지 못했다!`;
    btag('기절!');
    B.turn++; B.sp=Math.min(B.spMax,B.sp+SP_REGEN);
    B.busy=false; paintBattle(); return;
  }

  if(B.evade){
    B.evade=false;
    B.log=`${m.name}의 공격! 하지만 <b>물의 장막</b>에 막혀 빗나갔다!`;
    banim('foe','lungeFoe'); bpop('me','MISS','miss'); btag('회피 성공!');
    B.turn++; B.sp=Math.min(B.spMax,B.sp+SP_REGEN);
    B.busy=false; paintBattle(); return;
  }

  let dmg=B.eatk+Math.floor(Math.random()*3)-1;
  let note='';
  if(m.pat && m.patRate && Math.random()<m.patRate){
    if(m.pat==='sp'){ B.sp=Math.max(0,B.sp-5); note=` <b>${m.patName}!</b> SP -5`; }
    else if(m.pat==='def'){ B.defDown=2; note=` <b>${m.patName}!</b> 방어력 감소`; }
    else if(m.pat==='heavy'){ dmg=Math.round(dmg*1.3); note=` <b>${m.patName}!</b>`; }
  }
  let def=B.def;
  if(B.defDown>0) def=Math.round(def*.8);
  dmg=Math.max(1,dmg-Math.floor(def*.4));
  if(B.guard){ dmg=Math.round(dmg*.5); note+=' (방어로 절반 감소)'; B.guard=false; }

  // 전설 방어구 효과
  const la=legendOf('armor');
  if(la && la.eff==='dodge' && Math.random()<la.p){
    B.log=`${m.name}의 공격! 하지만 <b>투명 망토</b>에 스쳐 지나갔다!`;
    banim('foe','lungeFoe'); bpop('me','MISS','miss'); btag('회피!');
    B.turn++; B.sp=Math.min(B.spMax,B.sp+SP_REGEN);
    B.busy=false; paintBattle(); return;
  }
  let reflect=0;
  if(la && la.eff==='thorn' && Math.random()<la.p){
    reflect=dmg; note+=` <b style="color:var(--gold)">가시 반사!</b>`;
  }
  B.hp-=dmg; B.lastTaken=dmg;
  if(reflect>0){
    B.ehp-=reflect;
    setTimeout(()=>{ if(B&&!B.over) bpop('foe','-'+reflect,'crit'); },260);
  }
  if(B.defDown>0) B.defDown--;
  B.sp=Math.min(B.spMax,B.sp+SP_REGEN);

  strike('foe','fxClaw', ()=>bpop('me','-'+dmg));
  if(B.ehp<=0){
    setTimeout(()=>{ if(B&&!B.over){ B.log='가시에 되돌아온 피해로 정화되었다!'; winBattle(); } },520);
    return;
  }
  B.log=`${m.name}의 공격! ${dmg}의 피해${note}`;
  B.turn++;
  paintBattle();

  setTimeout(()=>{
    if(!B || B.over) return;
    if(B.hp<=0){
      B.hp=0; B.over=true; B.win=false;
      S.defeatStreak++;
      B.solace=Math.max(3,Math.round(m.exp*0.3));
      addExp(B.solace);
      banim('me','faint',800);
      setTimeout(()=>{ if(B && B.over && !B.win) showLose(); },700);
    } else { B.busy=false; }
    paintBattle();
  },480);
}

function winBattle(){
  if(!B||B.over)return;
  const m=curMon();
  B.over=true; B.win=true; B.busy=true;
  S.defeatStreak=0;
  S.hpCur=Math.max(1,B.hp); S.spCur=B.sp;
  B.gaugeGot = (Tw.on||Duel.on||Shadow.on) ? 0 : addGauge(m.gauge);
  S.gold+=m.gold; addExp(m.exp);
  if(!Tw.on && Math.random()<(m.boss?1:(m.mid?0.5:0.3))){
    S.tickets++;                              // 정화하면 자주 뽑기권이 나온다
    setTimeout(()=>toast('🎁 뽑기권을 얻었어요!'), 1900);
  }
  if(Tw.on){                                  // 층을 넘을 때마다 숨을 돌린다
    const st0=baseStats();
    S.hpCur=Math.min(st0.hpMax, S.hpCur+Math.round(st0.hpMax*.12));
    S.spCur=Math.min(st0.spMax, S.spCur+Math.round(st0.spMax*.25));
    if(B) B.hp=S.hpCur;
  }
  if(Tw.on && Tw.floor%7===0){                     // 5층마다 숨 돌리기 (많이는 아니다)
    const st=baseStats();
    S.hpCur=Math.min(st.hpMax, S.hpCur+Math.round(st.hpMax*.15));
    B.hp=S.hpCur;
  }
  B.drop=rollDrop(m);
  if(Tw.on)Tw.floorCleared=true;
  else if(!Duel.on&&!Shadow.on)S.encounterWon=true;
  autosave();
  banim('foe','faint',800);
  playSfx('purify');
  canAdd(canInfo().battle, T_FROM_BATTLE);
  const dayMsg=advanceDay();
  if(dayMsg) setTimeout(()=>toast(dayMsg),2600);
  const fa=$('bfoeArt'); const fi=fa&&fa.querySelector('.pxa');
  if(fi) fi.classList.add('mobOut');
  const bf=$('bfield');
  if(bf && fa){
    const r=fa.getBoundingClientRect(), fr=bf.getBoundingClientRect();
    sparks(bf, r.left-fr.left+r.width*.5, r.top-fr.top+r.height*.5, 14, '#eaffd0');
  }
  btag(`${m.name} 정화!`);
  setTimeout(()=>{ if(B && B.win) showWin(); },780);
}
function rollDrop(m){
  const rate=m.boss?1:(m.mid?0.6:0.15);
  if(Math.random()>=rate) return null;
  const slots=['weapon','armor','helm','shoes'];
  const slot=slots[Math.floor(Math.random()*slots.length)];
  const list=gearList(slot);
  // 아직 없는 것 중 가장 낮은 등급을 준다
  const item=list.find(i=>!S.owned.includes(i.id));
  if(!item) return null;
  if(S.owned.includes(item.id)) return null;
  S.owned.push(item.id);
  if(!S.gear[slot]) S.gear[slot]=item.id;
  return {slot,item};
}

function showWin(){
  if(!B) return;
  if(Shadow.on) return shadowEnd(true);
  if(Duel.on) return duelEnd(true);
  if(Tw.on) return showTowerWin();
  const m=curMon();
  const last=S.monIdx>=CUR.monsters.length-1;
  const host=$('bResult'); if(!host) return;
  autosave();
  host.innerHTML=`<div class="back on"><div class="sheet">
    <div class="mhead"><span>🎉 ${m.name} 정화 완료!</span></div>
    <div class="card"><div style="font-size:13.5px;line-height:1.9">
      정화 게이지 <b style="color:var(--green)">+${B.gaugeGot}%</b><br>
      골드 <b>+${m.gold}</b> · 경험치 <b>+${m.exp}</b><br>
      ${B.drop?`장비 획득! <b style="color:var(--gold)">${B.drop.item.name}</b> (${GEAR_LABEL[B.drop.slot]}) — 자동 장착`
              :'<span style="opacity:.6">장비는 나오지 않았어요</span>'}
    </div></div>
    <div class="card" style="text-align:center;font-size:13px">
      남은 체력 <b style="color:${B.hp<=B.hpMax*0.35?'var(--danger)':'var(--cream)'}">${Math.max(0,B.hp)} / ${B.hpMax}</b>
      · 기력 <b>${B.sp} / ${B.spMax}</b>
      ${B.hp<=B.hpMax*0.35?'<br><span style="color:var(--danger)">체력이 얼마 없어요! 돌아가서 회복하는 게 좋아요</span>':''}
    </div>
    <div class="dialogue"><div class="who">🧚 에코</div>${m.after}</div>
    ${last
      ? `<button class="btn" onclick="endBattleAll()">${CUR.name}${JRO(CUR.name)} 돌아가기</button>`
      : `<div class="row">
           <button class="btn" onclick="nextMonster()">다음 관문으로</button>
           <button class="btn sec" onclick="pauseBattle()">💧 나가서 회복하기</button>
         </div>`}
  </div></div>`;
}
function showLose(){
  if(!B) return;
  if(Shadow.on){ S.hpCur=Math.max(1,Math.round(baseStats().hpMax*.4)); shadowEnd(false); return; }
  if(Duel.on){ S.hpCur=Math.max(1,Math.round(baseStats().hpMax*.4)); duelEnd(false); return; }
  if(Tw.on){ towerRetire('faint'); return; }
  const host=$('bResult'); if(!host) return;
  autosave();
  const nb=Math.round(Math.min(S.defeatStreak,BLESS_MAX)*BLESS_STEP*100);
  host.innerHTML=`<div class="back on"><div class="sheet">
    <div class="mhead"><span>💫 정신을 잃었다…</span></div>
    <div class="dialogue"><div class="who">🧚 에코</div>
      괜찮아요! 다시 하면 돼요.<br>샘으로 돌아가서 힘을 채우고 또 도전해요! 💪</div>
    <div class="card" style="font-size:13px;line-height:1.9">
      경험치 <b>+${B.solace||0}</b> 얻었어요<br>
      다음에는 <b style="color:var(--gold)">에코의 도움 +${nb}%</b>를 받아요!
    </div>
    <div class="note">모은 것은 그대로 있어요.<br><b>퀴즈</b>를 풀거나 <b>장비</b>를 사면 훨씬 쉬워져요!</div>
    <button class="btn" onclick="respawn()">세이브 포인트로 돌아가기</button>
  </div></div>`;
}

function nextMonster(){
  if(!S.encounterWon)return;
  advanceEncounter();closeBattleDom();B=null;wipeIn(startEncounter);
}
function pauseBattle(){
  if(!S.encounterWon)return;
  advanceEncounter();leaveBattle();toast('통과한 전투는 저장됐어요. 다음 관문부터 이어가요.');
}
function endBattleAll(){
  if(!S.encounterWon&&!S.battleDone)return;
  S.battleDone=true;S.encounterWon=false;S.interludePending=null;
  S.monIdx=CUR.monsters.length-1;leaveBattle();
}
function respawn(){
  const st0=baseStats();
  S.hpCur=st0.hpMax; S.spCur=st0.spMax;
  Wd.px=SPAWN.x; Wd.py=SPAWN.y; Wd.trail=[];
  Wd.petX=SPAWN.x-34; Wd.petY=SPAWN.y+6;
  leaveBattle();
  toast("세이브 포인트로 돌아왔어요 · HP 완전 회복");
}
function closeBattleDom(){
  stopBattleView();
  arcStop();
  const h=$('modalHost'); if(h) h.innerHTML='';
}
function leaveBattle(){
  InterludeRun=null;
  setTimeout(()=>{ if(S.scene==='world' && $('worldRoot') && !Wd.raf) startLoop(); }, 520);
  setTimeout(()=>{ if(!B) bgmUpdate(); },380);
  pangStop(); miniStop();
  B=null; Pg=null;
  S.modal=null;
  wipeIn(()=>{
    closeBattleDom();
    OBJS.forEach(o=>o._in=false);
    refreshObjs(); paintMood(); paintHud();
    startLoop();
  });
  autosave();
}

/* Plogging replaces the pang minigame; implementation: js/plogging.js. */

/* ==========================================================
   미니게임 공용 층
   - 소닉3&너클즈 「블루 스피어」 차용 → 정화 구슬 (spheres)
   - 미니게임천국식 한 손 조작 타이밍 게임 → 딱 맞춰 멈추기 (timing)
   - 플로킹(pang) 내부 ID를 유지한다
   ========================================================== */

/* 테마별 미니게임 겉모습 */
var MINI_SKIN = {
  forest : {sphere:{good:'🌿',bad:'🔥',name:'새싹'},   timing:{ico:'🌰',name:'도토리 떨어뜨리기', target:'바구니'}},
  river  : {sphere:{good:'💧',bad:'🛢️',name:'맑은 물'}, timing:{ico:'🐟',name:'물고기 건져 올리기', target:'그물'}},
  ocean  : {sphere:{good:'🐚',bad:'🕸️',name:'조개'},   timing:{ico:'🐢',name:'거북이 길 터주기', target:'바닷길'}},
  city   : {sphere:{good:'♻️',bad:'🗑️',name:'재활용'}, timing:{ico:'📦',name:'분리배출 하기',    target:'분리수거함'}},
  air    : {sphere:{good:'☁️',bad:'💨',name:'맑은 공기'},timing:{ico:'🎈',name:'풍선 띄우기',     target:'맑은 하늘'}},
  climate: {sphere:{good:'🌱',bad:'☄️',name:'새 생명'}, timing:{ico:'⚡',name:'전기 모으기',      target:'배터리'}}
};
function miniSkin(){ return MINI_SKIN[S.themeId] || MINI_SKIN.forest; }

/* 어떤 미니게임을 쓸지 — 몬스터의 mode 값 그대로 */
function isMini(m){ return !!m && !!m.mode && m.mode!=='turn'; }
function launchMini(mode){
  if(mode==='spheres') return mountSphere();
  if(mode==='timing')  return mountTiming();
  if(mode==='match')   return mountMatch();
  if(mode==='runner')  return mountRunner();
  return mountPang();
}

/* 미니게임 공용 결과 처리 (플로킹의 pangWin과 같은 보상 규칙) */
function miniWin(hostId, extraLine){
  if(InterludeRun)return finishInterlude(true,hostId,extraLine);
  const m=curMon();
  if(Tw.on){
    S.gold+=m.gold; addExp(m.exp);
    const st=baseStats();
    S.hpCur=Math.min(st.hpMax, S.hpCur+Math.round(st.hpMax*.15));
    autosave();
    const host0=$(hostId);
    if(host0) host0.innerHTML=`<div class="back on"><div class="sheet">
      <div class="mhead"><span>🎮 ${Tw.floor}층 통과!</span>
        <span style="font-size:12px;color:var(--gold)">⏱ ${fmtTime(towerTime())}</span></div>
      <div class="card" style="font-size:13.5px;line-height:1.9">
        골드 <b>+${m.gold}</b> · 경험치 <b>+${m.exp}</b><br>
        체력을 조금 되찾았어요 (${S.hpCur})
      </div>
      <button class="btn" onclick="towerNext()">${Tw.floor+1}층으로</button>
      <button class="btn sec" onclick="towerRetire('quit')">여기서 그만두기</button>
    </div></div>`;
    return;
  }
  S.defeatStreak=0;
  const gaugeGot=addGauge(m.gauge);
  S.gold+=m.gold; addExp(m.exp);
  const drop=rollDrop(m);
  autosave();
  const last=S.monIdx>=CUR.monsters.length-1;
  const host=$(hostId); if(!host) return;
  host.innerHTML=`<div class="back on"><div class="sheet">
    <div class="mhead"><span>🎉 ${m.name} 정화 완료!</span></div>
    <div class="card"><div style="font-size:13.5px;line-height:1.9">
      ${extraLine?extraLine+'<br>':''}
      정화 게이지 <b style="color:var(--green)">+${gaugeGot}%</b><br>
      골드 <b>+${m.gold}</b> · 경험치 <b>+${m.exp}</b><br>
      ${drop?`장비 획득! <b style="color:var(--gold)">${drop.item.name}</b> (${GEAR_LABEL[drop.slot]}) — 자동 장착`
            :'<span style="opacity:.6">장비는 나오지 않았어요</span>'}
    </div></div>
    <div class="dialogue"><div class="who">🧚 에코</div>${m.after}</div>
    ${last?`<button class="btn" onclick="endBattleAll()">${CUR.name}${JRO(CUR.name)} 돌아가기</button>`
          :`<div class="row">
              <button class="btn" onclick="nextMonster()">다음 관문으로</button>
              <button class="btn sec" onclick="pauseBattle()">💧 나가서 회복하기</button>
            </div>`}
  </div></div>`;
}
function miniLose(hostId, why, retryFn){
  if(InterludeRun)return finishInterlude(false,hostId,why);
  if(Tw.on){ towerRetire('faint'); return; }
  S.defeatStreak++;
  const m=curMon();
  const solace=Math.max(3,Math.round(m.exp*0.3));
  addExp(solace); autosave();
  const host=$(hostId); if(!host) return;
  const bless=Math.min(S.defeatStreak,BLESS_MAX)*BLESS_STEP;
  host.innerHTML=`<div class="back on"><div class="sheet">
    <div class="mhead"><span>💫 아쉬워요!</span></div>
    <div class="dialogue"><div class="who">🧚 에코</div>${why}<br>괜찮아요, 다시 하면 돼요! 💪</div>
    <div class="card" style="font-size:13px;line-height:1.9">
      경험치 <b>+${solace}</b> 얻었어요<br>
      다시 도전하면 <b>더 쉬워져요</b> (에코의 도움 +${Math.round(bless*100)}%)
    </div>
    <div class="row">
      <button class="btn" onclick="${retryFn}">다시 도전</button>
      <button class="btn sec" onclick="respawn()">${CUR.name}${JRO(CUR.name)} 돌아가기</button>
    </div>
  </div></div>`;
}


/* ==========================================================
   미니게임 · 정화 맞추기 (애니팡 방식)
     같은 쓰레기 3개를 나란히 맞춰 치운다.
     정해진 수만큼 치우면 몬스터가 정화된다.
   ========================================================== */
var Mt=null;
var MT_ICONS=['🥤','🧴','🛍️','🔋','🥫','🧻'];
var MT_N=6;

function mtHTML(){
  const m=curMon();
  return `<div class="back on"><div class="sheet" style="max-width:460px">
    <div class="mhead"><span>🧩 ${m.name}</span>
      <span style="font-size:12px;color:rgba(251,246,234,.65)">같은 쓰레기 3개를 맞춰 치워요</span></div>
    <div class="card" style="padding:8px 10px">
      <div class="chips" style="justify-content:space-between">
        <span class="chip">치운 쓰레기 <b id="mtDone">0</b> / <b id="mtNeed">0</b></span>
        <span class="chip">남은 손길 <b id="mtMove">0</b></span>
      </div>
      <div class="bar" style="margin-top:6px"><div class="fill" id="mtBar" style="width:0%"></div></div>
    </div>
    <div id="mtGrid" style="display:grid;gap:4px;margin:8px auto;width:100%;max-width:340px;
      grid-template-columns:repeat(${MT_N},1fr)"></div>
    <div class="note" id="mtMsg">붙어 있는 둘을 차례로 눌러 자리를 바꿔요</div>
    <div id="mtResult"></div>
  </div></div>`;
}
function mountMatch(){
  S.modal='match';
  const host=$('modalHost'); if(!host) return;
  host.innerHTML=mtHTML();
  const ease=Math.min(3,S.defeatStreak);
  Mt={g:[], sel:null, need:30-ease*4, done:0, moves:30+ease*6, over:false, busy:false};
  do { mtFill(); } while(mtFindMatch().length);
  $('mtNeed').textContent=Mt.need;
  mtPaint();
}
function mtFill(){
  Mt.g=[];
  for(let i=0;i<MT_N*MT_N;i++) Mt.g.push(Math.floor(Math.random()*MT_ICONS.length));
}
function mtAt(r,c){ return (r<0||c<0||r>=MT_N||c>=MT_N)?-1:Mt.g[r*MT_N+c]; }
function mtSet(r,c,v){ Mt.g[r*MT_N+c]=v; }
/* 세 개 이상 이어진 자리를 모두 찾는다 */
function mtFindMatch(){
  const hit=new Set();
  for(let r=0;r<MT_N;r++) for(let c=0;c<MT_N-2;c++){
    const v=mtAt(r,c);
    if(v>=0 && v===mtAt(r,c+1) && v===mtAt(r,c+2)){
      let c2=c; while(mtAt(r,c2)===v && c2<MT_N){ hit.add(r*MT_N+c2); c2++; }
    }
  }
  for(let c=0;c<MT_N;c++) for(let r=0;r<MT_N-2;r++){
    const v=mtAt(r,c);
    if(v>=0 && v===mtAt(r+1,c) && v===mtAt(r+2,c)){
      let r2=r; while(mtAt(r2,c)===v && r2<MT_N){ hit.add(r2*MT_N+c); r2++; }
    }
  }
  return [...hit];
}
function mtPaint(){
  const g=$('mtGrid'); if(!g) return;
  g.innerHTML=Mt.g.map((v,i)=>{
    const on=(Mt.sel===i);
    return `<button class="btn sec" data-i="${i}" style="padding:0;aspect-ratio:1;font-size:22px;
      display:flex;align-items:center;justify-content:center;
      ${on?'outline:3px solid var(--gold);transform:scale(.92)':''}
      ${v<0?'opacity:0':''}">${v<0?'':MT_ICONS[v]}</button>`;
  }).join('');
  g.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>mtTap(+b.dataset.i)));
  const d=$('mtDone'), mv=$('mtMove'), bar=$('mtBar');
  if(d) d.textContent=Mt.done;
  if(mv) mv.textContent=Mt.moves;
  if(bar) bar.style.width=Math.min(100,Math.round(Mt.done/Mt.need*100))+'%';
}
function mtTap(i){
  if(!Mt||Mt.over||Mt.busy) return;
  if(Mt.sel===null){ Mt.sel=i; mtPaint(); return; }
  if(Mt.sel===i){ Mt.sel=null; mtPaint(); return; }
  const r1=Math.floor(Mt.sel/MT_N), c1=Mt.sel%MT_N, r2=Math.floor(i/MT_N), c2=i%MT_N;
  if(Math.abs(r1-r2)+Math.abs(c1-c2)!==1){ Mt.sel=i; mtPaint(); return; }
  const a=Mt.g[Mt.sel], b=Mt.g[i];
  Mt.g[Mt.sel]=b; Mt.g[i]=a;
  if(!mtFindMatch().length){                  // 안 맞으면 되돌린다
    Mt.g[Mt.sel]=a; Mt.g[i]=b;
    Mt.sel=null; mtPaint();
    const msg=$('mtMsg'); if(msg) msg.textContent='그렇게는 치울 수 없어요';
    return;
  }
  Mt.sel=null; Mt.moves--;
  Mt.busy=true; mtPaint();
  setTimeout(mtResolve,140);
}
/* 지우고 → 떨어뜨리고 → 또 맞으면 반복 */
function mtResolve(){
  const hit=mtFindMatch();
  if(!hit.length){
    Mt.busy=false;
    if(Mt.done>=Mt.need){ mtWin(); return; }
    if(Mt.moves<=0){ mtLose(); return; }
    mtPaint(); return;
  }
  hit.forEach(i=>{ Mt.g[i]=-1; });
  Mt.done+=hit.length;
  playSfx('hit');
  mtPaint();
  setTimeout(()=>{
    for(let c=0;c<MT_N;c++){
      let write=MT_N-1;
      for(let r=MT_N-1;r>=0;r--){
        const v=mtAt(r,c);
        if(v>=0){ mtSet(write,c,v); write--; }
      }
      for(let r=write;r>=0;r--) mtSet(r,c,Math.floor(Math.random()*MT_ICONS.length));
    }
    mtPaint();
    setTimeout(mtResolve,150);
  },180);
}
function mtWin(){
  if(Mt.over) return;
  Mt.over=true;
  miniWin('mtResult',`치운 쓰레기 <b>${Mt.done}개</b> · 남은 손길 <b>${Mt.moves}</b>`);
}
function mtLose(){
  if(Mt.over) return;
  Mt.over=true;
  miniLose('mtResult','쓰레기를 다 치우지 못했어요.','retryMatch()');
}
function retryMatch(){ const h=$('mtResult'); if(h) h.innerHTML=''; mountMatch(); }


/* ==========================================================
   미니게임 · 달려서 넘기 (쿠키런 방식)
     오염물을 뛰어넘으며 끝까지 달린다.
     두 번까지 연달아 뛸 수 있다.
   ========================================================== */
var Rn=null;
var RN_W=560, RN_H=210, RN_GY=168;      // 바닥 높이

/* 달릴 때 쓸 그림을 미리 잘라 둔다 (배경 배율에 기대지 않는다) */
var RN_FRAMES = null;
function rnMakeFrames(){
  const bsrc = heroImg(bodyKey('east')), hsrc = heroImg(headKey('east'));
  const source = bsrc+'|'+hsrc;
  if(RN_FRAMES && RN_FRAMES.source===source) return;
  const frames = {run:[], jump:null, source};
  RN_FRAMES = frames;
  const mk = (frame)=>{
    const c = document.createElement('canvas');
    c.width = 44; c.height = 44;
    const g = c.getContext('2d');
    if(!g) return '';
    g.imageSmoothingEnabled = false;
    const bi = new Image(), hi = new Image();
    bi.onload = ()=>{
      g.translate(44, 0); g.scale(-1, 1);      // 오른쪽을 보도록 뒤집는다
      const fw = bi.width / 9;
      g.drawImage(bi, frame*fw, 0, fw, bi.height, 0, 0, 44, 44);
      hi.onload = ()=>{
        if(RN_FRAMES!==frames) return;
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = 'high';
        g.drawImage(hi, 0, 0, 44, 44);
        const url = c.toDataURL();
        if(frame===8) frames.jump = url; else frames.run[frame] = url;
        rnPaintHero();
      };
      hi.src = hsrc;
    };
    bi.src = bsrc;
    return '';
  };
  for(let i=1; i<=8; i++) mk(i);
}
/* 지금 자세에 맞는 그림을 얹는다 */
function rnPaintHero(){
  const el = $('rnBody');
  if(!el || !RN_FRAMES) return;
  const idx = (Rn && Rn.y<0) ? 8 : ((Math.floor((Rn?Rn.x:0)/26)%8)+1);
  const url = (idx===8 ? RN_FRAMES.jump : RN_FRAMES.run[idx]);
  if(url) el.style.backgroundImage = `url('${url}')`;
}

// runner mode keeps existing encounters and reward routing.
function mountRunner(){ arcMount('runner'); }
function retryRunner(){ mountRunner(); }
function rnStop(){ arcStop(); }

/* 정화 구슬: 기존 퍼즐 유지 */
var Sp=null;

function sphereHTML(){
  const sk=miniSkin().sphere;
  return `<div class="mini" id="miniRoot">
    <div class="mini-top">
      <div class="mini-title">✨ ${sk.name} 모으기</div>
      <div class="mini-stat"><span id="spLeft"></span>
        <span id="spTime">⏱ <b id="spSec">?</b>초</span><span id="spHeart"></span></div>
    </div>
    <div class="mini-stage"><div class="sp-grid" id="spGrid"></div></div>
    <div class="mini-help" id="spHelp">${sk.good} 칸을 모두 밟으면 이겨요 · ${sk.bad} 는 밟지 마세요!<br>
      시간 안에 끝내야 해요 ⏱</div>
    <div class="mini-ctrl">
      <div class="dpad2">
        <button class="dbtn2 u" data-s="u">▲</button>
        <button class="dbtn2 d" data-s="d">▼</button>
        <button class="dbtn2 l" data-s="l">◀</button>
        <button class="dbtn2 r" data-s="r">▶</button>
      </div>
    </div>
    <div id="spResult"></div>
  </div>`;
}

function mountSphere(){
  S.modal='spheres';
  const host=$('modalHost'); if(!host) return;
  host.innerHTML=sphereHTML();

  // 연패할수록 판이 작아지고 하트가 늘어난다 (에코의 도움)
  const ease=Math.min(3,S.defeatStreak);
  const N=Math.max(5, 7-Math.floor(ease/2));          // 7×7 → 최소 5×5
  const hearts=3+ease;
  const badRate=Math.max(0.06, 0.14-ease*0.03);

  const cells=[];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){
    cells.push({x,y,state: Math.random()<badRate?'bad':'good'});
  }
  const start=cells[Math.floor(cells.length/2)];
  start.state='clean';                                 // 시작 칸은 안전

  Sp={N,cells,hearts,maxHearts:hearts,px:start.x,py:start.y,over:false,inv:0,t0:Date.now(),
      sec: 45+ease*10, tick:null};
  const myTick=setInterval(()=>{
    if(!Sp || Sp.over || Sp.tick!==myTick){ clearInterval(myTick); return; }
    Sp.sec--;
    const el=$('spSec');
    if(el){
      el.textContent=Sp.sec;
      el.style.color = Sp.sec<=10 ? 'var(--danger)' : '';
    }
    if(Sp.sec<=0){
      clearInterval(myTick); Sp.over=true;
      miniLose('spResult','시간이 다 됐어요.','retrySphere()');
    }
  },1000);
  Sp.tick=myTick;
  { const el=$('spSec'); if(el) el.textContent=Sp.sec; }

  document.querySelectorAll('.dbtn2').forEach(b=>{
    b.addEventListener('pointerdown',e=>{ e.preventDefault(); spMove(b.dataset.s); });
  });
  if(!window._spKey){
    window._spKey=true;
    document.addEventListener('keydown',e=>{
      if(S.modal!=='spheres'||!Sp||Sp.over) return;
      const k={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r'}[e.key];
      if(k){ e.preventDefault(); spMove(k); }
    });
  }
  spDraw();
  spCheckWin();
}

function spCell(x,y){ return Sp.cells.find(c=>c.x===x&&c.y===y); }

function spMove(dir){
  if(!Sp||Sp.over) return;
  let nx=Sp.px, ny=Sp.py;
  if(dir==='u') ny--; else if(dir==='d') ny++;
  else if(dir==='l') nx--; else if(dir==='r') nx++;
  if(nx<0||ny<0||nx>=Sp.N||ny>=Sp.N){ spCheckWin(); return; }
  Sp.px=nx; Sp.py=ny;

  const c=spCell(nx,ny);
  if(c.state==='good'){ c.state='clean'; }
  else if(c.state==='bad'){
    c.state='clean';                       // 밟으면 사라져서 같은 칸에 계속 당하지 않는다
    Sp.hearts--;
    const g=$('spGrid'); if(g){ g.classList.add('shake'); setTimeout(()=>g.classList.remove('shake'),240); }
    if(Sp.hearts<=0){ Sp.over=true; spDraw();
      if(Sp && Sp.tick){ clearInterval(Sp.tick); Sp.tick=null; }
      miniLose('spResult','오염에 너무 많이 부딪혔어요.','retrySphere()'); return; }
  }
  if(spCheckWin()) return;
  spDraw();
}

function spCheckWin(){
  if(!Sp||Sp.over) return false;
  if(Sp.cells.some(c=>c.state==='good')) return false;
  Sp.over=true; spDraw();
  const sec=Math.round((Date.now()-Sp.t0)/1000);
  if(Sp && Sp.tick){ clearInterval(Sp.tick); Sp.tick=null; }
  miniWin('spResult',`남은 하트 <b>${Sp.hearts}</b> · 걸린 시간 <b>${sec}초</b>`);
  return true;
}

function spDraw(){
  const g=$('spGrid'); if(!g||!Sp) return;
  const sk=miniSkin().sphere;
  g.style.gridTemplateColumns=`repeat(${Sp.N},1fr)`;
  g.innerHTML=Sp.cells.map(c=>{
    const me=(c.x===Sp.px&&c.y===Sp.py);
    let cls='sp-c '+c.state+(me?' me':'');
    let inner = c.state==='good'?sk.good : (c.state==='bad'?sk.bad:'');
    if(me) inner=`<span class="sp-me">${heroSprite(Wd.face||'south',44)}</span>`;
    return `<div class="${cls}">${inner}</div>`;
  }).join('');
  const left=Sp.cells.filter(c=>c.state==='good').length;
  const L=$('spLeft'); if(L) L.innerHTML=`남은 ${sk.good} <b>${left}</b>개`;
  const H=$('spHeart'); if(H) H.innerHTML='❤️'.repeat(Math.max(0,Sp.hearts));
}
function retrySphere(){
  if(Sp&&Sp.tick){ clearInterval(Sp.tick); Sp.tick=null; }
  const h=$('spResult'); if(h) h.innerHTML='';
  wipeIn(mountSphere);
}

/* ==========================================================
   미니게임 ② 딱 맞춰 멈추기  (미니게임천국식 한 손 조작)
   좌우로 움직이는 바늘을 초록 칸에서 멈춘다. 3번 성공하면 승리.
   ========================================================== */
var Tm=null;
function mountTiming(){ arcMount('timing'); }
function retryTiming(){ mountTiming(); }
function miniStop(){
  arcStop();
  if(Sp&&Sp.tick) clearInterval(Sp.tick);
  Sp=null; Tm=null;
}

var GEAR_LABEL = {weapon:"무기",armor:"갑옷",helm:"투구",shoes:"신발"};

/* ==========================================================
   모달 공통
   ========================================================== */
function openModal(kind){
  arcStop();
  releaseKeys();
  S.modal=kind;
  drawModal();
}
/* 눌린 채 남은 방향키를 모두 비운다 (양쪽이 눌려 서로 상쇄되면 아예 못 움직인다) */
function releaseKeys(){
  if(typeof Wd!=='undefined' && Wd.keys) Wd.keys={u:false,d:false,l:false,r:false};
  if(typeof Fd!=='undefined' && Fd.keys) Fd.keys={u:false,d:false,l:false,r:false};
  if(typeof Rd!=='undefined' && Rd.keys) Rd.keys={u:false,d:false,l:false,r:false};
}
function closeModal(){
  arcStop();
  releaseKeys();
  S.modal=null;
  if(S.scene==='title'){
    const h=$('modalHost');
    if(h && !$('worldRoot')) h.innerHTML='';
  }
  const h=$('modalHost'); if(h) h.innerHTML='';
  refreshObjs(); paintMood(); autosave();
}
function drawModal(){
  // 어떤 경로로 돌아오든 월드가 멈춰 있으면 다시 돌린다
  if(S && S.scene==='world' && $('worldRoot') && typeof Wd!=='undefined' && !Wd.raf) startLoop();
  if(S && S.modal && S.modal!=='field' && S.modal!=='farm') releaseKeys();
  let host=$('modalHost');
  if(!host){                       // 제목 화면처럼 자리가 없으면 만들어 붙인다
    host=document.createElement('div');
    host.id='modalHost';
    document.body.appendChild(host);
  }
  if(S.modal==='battle'||S.modal==='pang') return;   // 전투는 자체 DOM을 쓴다
  if(S.modal==='field') return;                      // 채집 필드도 자체 DOM을 쓴다
  if(S.modal==='farm')  return;                      // 농장도 자체 DOM을 쓴다
  let inner='';
  switch(S.modal){
    case 'meet':   inner=mMeet(); break;
    case 'interlude': inner=mInterlude(); break;
    case 'lesson': inner=mLesson(); break;
    case 'spring': inner=mSpring(); break;
    case 'quiz':   inner=mQuiz(); break;
    case 'adv':    inner=mAdv(); break;
    case 'evolve': inner=mEvolve(); break;
    case 'rplant': inner=mPlant(); break;
    case 'rshop':  inner=mRShop(); break;
    case 'rsell':  inner=mSell(); break;
    case 'npc':        inner=mNpc(); break;
    case 'npcEnd':     inner=mNpcEnd(); break;
    case 'sideNpc':    inner=mSideNpc(); break;
    case 'shadowMeet': inner=mShadowMeet(); break;
    case 'shadowWin':  inner=mShadowWin(); break;
    case 'shadowLose': inner=mShadowLose(); break;
    case 'duelWin':    inner=mDuelWin(); break;
    case 'duelLose':   inner=mDuelLose(); break;
    case 'admin':      inner=mAdmin(); break;
    case 'adminPanel': inner=mAdminPanel(); break;
    case 'tower':      inner=mTower(); break;
    case 'towerFloor': inner=mTowerFloor(); break;
    case 'towerQuiz':  inner=mTowerQuiz(); break;
    case 'towerEnd':   inner=mTowerEnd(); break;
    case 'fmath':  inner=mFMath(); break;
    case 'clue':   inner=mClue(); break;
    case 'lock':   inner=mLock(); break;
    case 'craft':  inner=mCraft(); break;
    case 'shop':   inner=mShop(); break;
    case 'bag':    inner=mBag(); break;
    case 'status': inner=mStatus(); break;
    case 'altar':  inner=mAltar(); break;
    case 'dex':    inner=mDex(); break;
    case 'gacha':  inner=mGacha(); break;
    default: inner='';
  }
  host.innerHTML=`<div class="back on"><div class="sheet">${inner}</div></div>`;
}

/* ==========================================================
   학습 / 샘물
   ========================================================== */
var lessonPage=0;
function mLesson(){ return mInquiryLesson(); }
function finishLesson(){
  if(!S.lessonDone&&!lessonReady()){lessonNextUnsolved();return;}
  lessonPage=0;
  if(S.lessonDone){ closeModal(); return; }
  S.lessonDone=true;
  const g=addGauge(10);                      // 배운 값은 여기서 준다
  addExp(12); S.gold+=10; autosave();
  closeModal(); paintHud(); refreshObjs(); paintMood();
  toast(`${CUR.name}에 대해 배웠어요 📘<br>정화 +${g}% · 골드 +10 · 경험치 +12`);
}

/* 배우는 샘 재방문 — 무료 회복 + 복습 */
function mSpring(){
  const st=baseStats();
  const full=S.hpCur>=st.hpMax && (S.spCur==null||S.spCur>=st.spMax);
  return `<div class="mhead"><span>💧 에코의 샘</span></div>
    <div class="dialogue"><div class="who">🧚 에코</div>
      맑은 샘물이 솟아나요.<br>마시면 힘이 다시 차올라요!</div>
    <div class="card" style="text-align:center;font-size:13.5px">
      지금 체력 <b>${S.hpCur} / ${st.hpMax}</b> · 기력 <b>${S.spCur==null?st.spMax:S.spCur} / ${st.spMax}</b>
    </div>
    <div class="col">
      <button class="btn" ${full?'disabled':''} onclick="drinkSpring()">${full?'이미 힘이 가득해요':'💧 샘물 마시기 (체력·기력 완전 회복)'}</button>
      <button class="btn sec" onclick="S.modal='lesson';lessonPage=0;drawModal()">📖 이야기 다시 듣기</button>
      <button class="btn sec" onclick="openModal('quiz')">✏️ 퀴즈 이어 풀기 · 다시 연습</button>
      ${S.quizWrong.length?`<button class="btn sec" onclick="startRetry()">✏️ 못 맞힌 문제 ${S.quizWrong.length}개 다시 풀기</button>`:''}
      <button class="btn sec" onclick="startAdv()">✨ 생각 넓히기 · ${S.advDone?'다시 연습':'이어서 풀기'}</button>
      <button class="btn sec" onclick="closeModal()">${CUR.name}${JRO(CUR.name)} 돌아가기</button>
    </div>`;
}
function drinkSpring(){
  const st0=baseStats();
  S.hpCur=st0.hpMax; S.spCur=st0.spMax;
  toast("샘물을 마셨어요! 체력과 기력이 가득 찼어요 💧");
  paintHud(); drawModal(); autosave();
}

/* ==========================================================
   퀴즈 — 틀린 문제는 언제든 다시 풀 수 있다
   ========================================================== */
// R39: each region keeps its own once-only rewards and retry state.
function normalizeQuizProgress(o,t){
 const Q=t.quiz||[],A=t.quizAdv||[];
 const clean=(a,n)=>Array.from(new Set(Array.isArray(a)?a.filter(x=>Number.isInteger(x)&&x>=0&&x<n):[]));
 o.quizScored=clean(o.quizScored,Q.length);o.quizWrong=clean(o.quizWrong,Q.length).filter(i=>!o.quizScored.includes(i));
 if(o.quizDone)Q.forEach((q,i)=>{if(!o.quizScored.includes(i)&&!o.quizWrong.includes(i))o.quizWrong.push(i);});
 o.quizIdx=Number.isInteger(o.quizIdx)?Math.max(0,Math.min(Q.length-1,o.quizIdx)):0;
 o.advIdx=Number.isInteger(o.advIdx)?Math.max(0,Math.min(A.length-1,o.advIdx)):0;
 if(!Array.isArray(o.advScored))o.advScored=o.advDone?A.map((q,i)=>i):A.map((q,i)=>i).filter(i=>i<o.advIdx||(i===o.advIdx&&o.advPicked===A[i].a));
 o.advScored=clean(o.advScored,A.length);
 o.retryQueue=clean(o.retryQueue,Q.length);if(!o.retryQueue.length)o.retryQueue=null;
 if(o.quizContentVersion!==39){o.quizPicked=null;o.advPicked=null;o.quizHint=false;o.quizContentVersion=39;}
 const qi=o.retryQueue?o.retryQueue[0]:o.quizIdx;
 if(!Number.isInteger(o.quizPicked)||!Q[qi]||o.quizPicked<0||o.quizPicked>=Q[qi].o.length)o.quizPicked=null;
 if(!Number.isInteger(o.advPicked)||!A[o.advIdx]||o.advPicked<0||o.advPicked>=A[o.advIdx].o.length)o.advPicked=null;
}
function qCorrect(){return S.quizScored.length;}
function currentQuizIndex(){return S.retryQueue&&S.retryQueue.length?S.retryQueue[0]:S.quizIdx;}
function mQuiz(){normalizeQuizProgress(S,CUR);return S.retryQueue?mQuizQ(S.retryQueue[0],true):S.quizDone?mQuizEnd():mQuizQ(S.quizIdx,false);}
function quizChoices(q,p,fn){return q.o.map((t,i)=>`<button type="button" class="opt${p!==null?(i===q.a?' ok':i===p?' no':''):''}" onclick="${fn}(${i})" ${p!==null?'disabled':''}>${i+1}. ${t}</button>`).join('');}
function mQuizQ(idx,retry){
 const Q=CUR.quiz,q=Q[idx],answered=S.quizPicked!==null,right=S.quizPicked===q.a;
 return `<div class="mhead"><span>📖 ${retry?'다시 연습하기':CUR.name+' 퀴즈'}</span><span>${retry?'남은 '+S.retryQueue.length+'문제':(idx+1)+' / '+Q.length}</span></div>
 <div class="dialogue">${q.q}</div><p class="note">틀려도 괜찮아요. 설명을 읽고 바로 다시 풀 수 있어요.</p>
 ${S.quizHint?`<div class="card"><b>💡 힌트</b><br>${q.h}</div>`:''}<div class="col">${quizChoices(q,S.quizPicked,'answerQuiz')}</div>
 ${answered?`<div class="card" role="status"><b>${right?'잘 찾았어요!':'함께 다시 생각해 봐요.'}</b><br>${q.e}</div>
 ${right?'':`<button class="btn" onclick="retryQuizCurrent()">↻ 이 문제 다시 풀기</button>`}
 <button class="btn ${right?'':'sec'}" onclick="nextQuiz()">${!right?'이 문제는 나중에 풀기':retry?'계속하기':idx===Q.length-1?'퀴즈 마치기':'다음 문제'}</button>`:
 `<button class="btn sec" onclick="useHint()" ${S.quizHint?'disabled':''}>💡 힌트 보기 · 무료</button>`}
 <button class="btn sec" onclick="autosave();closeModal()">저장하고 나가기</button>`;
}
function useHint(){if(S.quizHint)return;S.quizHint=true;autosave();drawModal();}
function retryQuizCurrent(){if(S.quizPicked===null||S.quizPicked===CUR.quiz[currentQuizIndex()].a)return;S.quizPicked=null;S.quizHint=true;autosave();drawModal();}
function answerQuiz(i){
 if(S.quizPicked!==null)return;const idx=currentQuizIndex(),q=CUR.quiz[idx];
 if(!q||!Number.isInteger(i)||i<0||i>=q.o.length)return;S.quizPicked=i;
 if(i===q.a){S.quizWrong=S.quizWrong.filter(x=>x!==idx);if(!S.quizScored.includes(idx)){S.quizScored.push(idx);const g=addGauge(3);S.gold+=5;addExp(6);toast(`정답! 정화 +${g}% · 골드 +5 · EXP +6`);}else toast('정답! 보상은 문제마다 한 번 받아요.');}
 else{if(!S.quizWrong.includes(idx))S.quizWrong.push(idx);toast('설명을 읽고 ‘이 문제 다시 풀기’를 눌러 보세요.');}
 autosave();drawModal();paintHud();
}
function nextQuiz(){
 if(S.quizPicked===null)return;
 if(S.retryQueue&&S.retryQueue.length){S.retryQueue.shift();if(!S.retryQueue.length)S.retryQueue=null;}
 else if(S.quizIdx<CUR.quiz.length-1)S.quizIdx++;else S.quizDone=true;
 S.quizPicked=null;S.quizHint=false;autosave();drawModal();refreshObjs();
}
function startRetry(all=false){normalizeQuizProgress(S,CUR);const queue=all?CUR.quiz.map((q,i)=>i):S.quizWrong.slice();if(!queue.length)return;S.retryQueue=queue;S.quizPicked=null;S.quizHint=false;S.modal='quiz';autosave();drawModal();}
function mQuizEnd(){const left=S.quizWrong.length;return `<div class="mhead"><span>📖 ${left?'차근차근 다시 해 봐요':'퀴즈 완료!'}</span></div>
 <div class="card">${CUR.quiz.length}문제 중 ${qCorrect()}문제를 맞혔어요.${left?'<br>남은 '+left+'문제는 언제든 다시 풀 수 있어요.':''}</div>
 <div class="col">${left?`<button class="btn" onclick="startRetry()">↻ 남은 ${left}문제 다시 풀기</button>`:''}
 <button class="btn sec" onclick="startRetry(true)">모든 문제 다시 연습하기</button>
 <button class="btn sec" onclick="startAdv()">✨ 생각 넓히기 · ${S.advDone?'다시 연습':'생활 속 3문제'}</button>
 <p class="note">힌트는 무료예요. 틀려도 골드는 줄지 않고, 보상은 한 번만 받아요.</p>
 <button class="btn sec" onclick="closeModal()">돌아가기</button></div>`;}
function startAdv(){normalizeQuizProgress(S,CUR);if(S.advDone){S.advIdx=0;S.advPicked=null;}S.modal='adv';autosave();drawModal();}
function mAdv(){const A=CUR.quizAdv,q=A[S.advIdx],answered=S.advPicked!==null,right=S.advPicked===q.a;return `<div class="mhead"><span>✨ 생각 넓히기</span><span>${S.advIdx+1} / ${A.length}</span></div>
 <div class="dialogue">${q.q}</div><div class="note">💡 ${q.h}</div><div class="col">${quizChoices(q,S.advPicked,'answerAdv')}</div>
 ${answered?`<div class="card" role="status">${q.e}</div><button class="btn" onclick="${right?'nextAdv()':'retryAdv()'}">${right?(S.advIdx===A.length-1?'마치기':'다음 문제'):'↻ 이 문제 다시 풀기'}</button>`:''}
 <button class="btn sec" onclick="autosave();closeModal()">저장하고 나가기</button>`;}
function retryAdv(){if(S.advPicked===null||S.advPicked===CUR.quizAdv[S.advIdx].a)return;S.advPicked=null;autosave();drawModal();}
function answerAdv(i){const q=CUR.quizAdv[S.advIdx];if(S.advPicked!==null||!q||!Number.isInteger(i)||i<0||i>=q.o.length)return;S.advPicked=i;
 if(i===q.a&&!S.advScored.includes(S.advIdx)){S.advScored.push(S.advIdx);S.gold+=15;addExp(10);toast('정답! 골드 +15 · EXP +10');}else toast(i===q.a?'정답! 연습도 잘했어요.':'설명을 읽고 같은 문제를 다시 풀어 보세요.');autosave();drawModal();paintHud();}
function nextAdv(){if(S.advPicked!==CUR.quizAdv[S.advIdx].a)return;
 if(S.advIdx<CUR.quizAdv.length-1){S.advIdx++;S.advPicked=null;}
 else{if(!S.advDone){S.advDone=true;const g=addGauge(5);toast(`생각 넓히기 완료! 정화 +${g}%`);}S.modal='quiz';refreshObjs();}autosave();drawModal();paintHud();}

/* ==========================================================
   채집 — 도구를 골라 알맞은 곳에 쓰는 탐험 (+ 숨은 단서 · 비밀 상자)
   ========================================================== */
var TOOLS=[
  {id:'shake',ico:'🤲',nm:'흔들기'},
  {id:'dig',  ico:'⛏️',nm:'캐기'},
  {id:'scoop',ico:'🪣',nm:'물뜨기'},
  {id:'look', ico:'🔍',nm:'살펴보기'}
];
function ensureBoard(){
  if(!S.gboard || S.gboard.themeId!==CUR.id) resetBoard(false);
}
function resetBoard(repeat){
  const uses={};
  CUR.gather.objs.forEach(o=>uses[o.id]=repeat?1:o.uses);
  S.gboard={themeId:CUR.id, uses, tool:'shake', repeat:!!repeat};
}
function boardLeft(){
  const gb=S.gboard; if(!gb) return 0;
  return CUR.gather.objs.reduce((a,o)=>a+(gb.uses[o.id]||0),0);
}
function pickTool(t){ S.gboard.tool=t; fPaintTools(); fNear(); }

/* ==========================================================
   학년별 수학 문제 — 채집할 때 하나씩 푼다
   ========================================================== */
function mRi(a,b){ return a+Math.floor(Math.random()*(b-a+1)); }
function mPick(a){ return a[Math.floor(Math.random()*a.length)]; }
function mGcd(a,b){ while(b){ const t=a%b; a=b; b=t; } return a; }
function mFmt(n){ return String(Math.round(n*1000)/1000); }
function mQ(q,a,h,e){ return {q:q, a:mFmt(a), h:h, e:e}; }
function mWa(n){ return "1367800".indexOf(String(n).slice(-1))>=0 ? '과' : '와'; }
function mBlank(q){ return q+'<br><span style="font-size:16px">□에 알맞은 수는?</span>'; }

var MATH = {
 4:[
  ()=>{const a=mRi(125,879),b=mRi(125,879);
    return mQ(`${a} + ${b} = ?`, a+b, "일의 자리부터 차례로 더해요", `받아올림에 주의해서 더하면 ${a+b}이에요.`);},
  ()=>{const a=mRi(420,980),b=mRi(115,399);
    return mQ(`${a} - ${b} = ?`, a-b, "일의 자리부터 차례로 빼요", `받아내림에 주의해서 빼면 ${a-b}이에요.`);},
  ()=>{const a=mRi(112,489),b=mRi(3,9);
    return mQ(`${a} × ${b} = ?`, a*b, "각 자리에 곱한 값을 더해요", `${a}×${b}=${a*b}`);},
  ()=>{const a=mRi(13,48),b=mRi(12,39);
    return mQ(`${a} × ${b} = ?`, a*b, `${a}×${b%10}과 ${a}×${Math.floor(b/10)*10}을 더해요`, `${a}×${b}=${a*b}`);},
  ()=>{const b=mRi(3,9),m=mRi(12,49);
    return mQ(`${b*m} ÷ ${b} = ?`, m, `${b}단 곱셈을 떠올려요`, `${b}×${m}=${b*m} 이므로 몫은 ${m}이에요.`);},
  ()=>{const d=mRi(6,12),x=mRi(1,d-2),y=mRi(1,d-x);
    return mQ(mBlank(`${x}/${d} + ${y}/${d} = □/${d}`), x+y, "분모가 같으면 분자끼리 더해요",
      `${x}+${y}=${x+y} 이므로 ${x+y}/${d}예요.`);},
  ()=>{const a=mRi(35,80),b=mRi(35,80);
    return mQ(`삼각형의 두 각이 ${a}°, ${b}°일 때<br>나머지 한 각은 몇 도일까요?`, 180-a-b,
      "삼각형 세 각의 합은 180°예요", `180-${a}-${b}=${180-a-b}도`);},
  ()=>{let a=mRi(11,89),b=mRi(11,89); if(a%10===0)a++; if(b%10===0)b++;
    return mQ(`${(a/10).toFixed(1)} + ${(b/10).toFixed(1)} = ?`, (a+b)/10, "소수점끼리 줄을 맞춰 더해요",
      `${(a/10).toFixed(1)}+${(b/10).toFixed(1)}=${((a+b)/10).toFixed(1)}`);}
 ],
 5:[
  ()=>{const f=mRi(2,9),a=f*mRi(2,6),b=f*mRi(2,6),g=mGcd(a,b);
    return mQ(`${a}${mWa(a)} ${b}의 최대공약수는?`, g, "두 수를 모두 나누는 가장 큰 수예요",
      `공약수 중 가장 큰 수는 ${g}이에요.`);},
  ()=>{const a=mRi(3,12),b=mRi(3,12),g=mGcd(a,b);
    return mQ(`${a}${mWa(a)} ${b}의 최소공배수는?`, a*b/g, "두 수의 배수를 나란히 써 봐요", `${a}×${b}÷${g}=${a*b/g}`);},
  ()=>{let a=mRi(2,7),b=mRi(2,7); if(a===b) b++;
    return mQ(mBlank(`1/${a} + 1/${b} = □/${a*b}`), a+b, `분모를 ${a*b}로 통분해요`,
      `${b}/${a*b}+${a}/${a*b}=${a+b}/${a*b}`);},
  ()=>{const d=mRi(3,9),x=mRi(1,d-1),k=mRi(2,7);
    return mQ(`${x}/${d} × ${d*k} = ?`, x*k, "분모와 자연수를 약분해요", `${d*k}÷${d}=${k}, ${x}×${k}=${x*k}`);},
  ()=>{let a=mRi(11,49); if(a%10===0)a++; const b=mRi(3,9);
    return mQ(`${(a/10).toFixed(1)} × ${b} = ?`, a*b/10, "자연수처럼 곱한 뒤 소수점을 찍어요",
      `${a}×${b}=${a*b} → 소수 한 자리이므로 ${(a*b/10).toFixed(1)}`);},
  ()=>{const a=mRi(4,20),b=mRi(4,20),c=mRi(4,20); let d=mRi(4,20);
    while((a+b+c+d)%4) d++;
    const sum=a+b+c+d;
    return mQ(`${a}, ${b}, ${c}, ${d}의 평균은?`, sum/4, "모두 더한 뒤 4로 나눠요", `${sum}÷4=${sum/4}`);},
  ()=>{const a=mRi(4,15),b=mRi(4,15);
    return mQ(`가로 ${a}cm, 세로 ${b}cm인<br>직사각형의 넓이는? (cm²)`, a*b, "가로 × 세로", `${a}×${b}=${a*b}cm²`);},
  ()=>{const a=mRi(3,12)*2,b=mRi(3,14);
    return mQ(`밑변 ${a}cm, 높이 ${b}cm인<br>삼각형의 넓이는? (cm²)`, a*b/2, "밑변 × 높이 ÷ 2", `${a}×${b}÷2=${a*b/2}cm²`);},
  ()=>{const b=mRi(3,9),c=mRi(2,7),a=b*c+mRi(5,40);
    return mQ(`${a} - ${b} × ${c} = ?`, a-b*c, "곱셈을 먼저 계산해요", `${b}×${c}=${b*c}, ${a}-${b*c}=${a-b*c}`);}
 ],
 6:[
  ()=>{const d=mRi(5,11),k=mRi(2,6),x=mRi(1,d-1);
    return mQ(mBlank(`${x*k}/${d} ÷ ${k} = □/${d}`), x, "분자를 자연수로 나눠요", `${x*k}÷${k}=${x} 이므로 ${x}/${d}예요.`);},
  ()=>{const q=mRi(9,12),r=mRi(1,2),k=mRi(2,4);
    return mQ(`${r*k}/${q} ÷ ${r}/${q} = ?`, k, "분모가 같으면 분자끼리 나눠요", `${r*k}÷${r}=${k}`);},
  ()=>{const x=mRi(2,9); let k=mRi(2,9); if((x*k)%10===0) k=3;
    return mQ(`${(x*k/10).toFixed(1)} ÷ ${(x/10).toFixed(1)} = ?`, k, "두 수에 똑같이 10을 곱해 자연수로 만들어요",
      `${x*k}÷${x}=${k}`);},
  ()=>{const n=mRi(2,10)*20,pc=mPick([5,10,25,50]);
    return mQ(`${n}의 ${pc}%는 얼마일까요?`, n*pc/100, `${pc}% = ${pc}/100 이에요`, `${n}×${pc}÷100=${n*pc/100}`);},
  ()=>{const a=mRi(2,9),b=mRi(2,9),k=mRi(2,6);
    return mQ(mBlank(`${a} : ${b} = ${a*k} : □`), b*k, `${a}에 ${k}를 곱했어요`, `${b}×${k}=${b*k}`);},
  ()=>{const d=mRi(2,12)*2;
    return mQ(`지름이 ${d}cm인 원의 둘레는?<br>(원주율 3.14, 단위 cm)`, 3.14*d, "원주 = 지름 × 원주율",
      `${d}×3.14=${mFmt(3.14*d)}cm`);},
  ()=>{const r=mRi(2,10);
    return mQ(`반지름이 ${r}cm인 원의 넓이는?<br>(원주율 3.14, 단위 cm²)`, 3.14*r*r, "넓이 = 반지름 × 반지름 × 원주율",
      `${r}×${r}×3.14=${mFmt(3.14*r*r)}cm²`);},
  ()=>{const a=mRi(3,12),b=mRi(3,12),c=mRi(3,12);
    return mQ(`가로 ${a}cm, 세로 ${b}cm, 높이 ${c}cm인<br>직육면체의 부피는? (cm³)`, a*b*c, "가로 × 세로 × 높이",
      `${a}×${b}×${c}=${a*b*c}cm³`);},
  ()=>{const v=mRi(3,15),t=mRi(2,6);
    return mQ(`${v*t}km를 ${t}시간 동안 갔다면<br>속력은 몇 km/h일까요?`, v, "속력 = 거리 ÷ 시간", `${v*t}÷${t}=${v}km/h`);}
 ]
};
function mathGen(g){
  const list = MATH[g] || MATH[5];
  return list[Math.floor(Math.random()*list.length)]();
}


/* ==========================================================
   농장 화면 — 채집터와 같은 방식(자체 DOM + 자체 루프)으로 만든다
   ========================================================== */
var RW=1240, RH=780;
var Rd={px:0,py:0,cx:0,cy:0,solid:[],keys:{u:false,d:false,l:false,r:false},
        face:'north',moving:false,near:null,raf:null,vw:900,vh:600,spots:[]};

/* 가축이 뛰노는 울타리 마당 */
var YARD={x0:720, y0:390, x1:1180, y1:620};   // 아래에 지나갈 길을 남긴다
var GATE={x:900, w:112};        // 아래쪽 울타리에 난 문 (이 구간만 지나갈 수 있다)
function inGate(x){ return x>GATE.x-GATE.w/2 && x<GATE.x+GATE.w/2; }

function farmFencePanel(x1,y1,x2,y2,endPost){
 const vertical=Math.abs(y2-y1)>Math.abs(x2-x1),left=Math.min(x1,x2)-12,top=Math.min(y1,y2)-48;
 const width=Math.abs(x2-x1)+24,height=Math.abs(y2-y1)+60,ax=x1-left,ay=y1-top,bx=x2-left,by=y2-top;
 function rail(ox,oy){return `<path d="M${ax+ox} ${ay+oy} L${bx+ox} ${by+oy}" stroke="#493226" stroke-width="10"/><path d="M${ax+ox} ${ay+oy-1} L${bx+ox} ${by+oy-1}" stroke="#b68a55" stroke-width="6"/><path d="M${ax+ox} ${ay+oy-3} L${bx+ox} ${by+oy-3}" stroke="#e0b97c" stroke-width="1.5"/>`;}
 function post(x,y){return `<ellipse cx="${x+3}" cy="${y+2}" rx="10" ry="3" fill="#342e24" opacity=".3"/><path d="M${x-6} ${y} V${y-39} L${x} ${y-44} L${x+7} ${y-39} V${y}Z" fill="#ad7d47" stroke="#513727" stroke-width="2"/><path d="M${x-3} ${y-37}V${y-3}" stroke="#e7c38b" stroke-width="2"/><path d="M${x+4} ${y-36}V${y-2}" stroke="#7a5434" stroke-width="2"/><circle cx="${x}" cy="${y-29}" r="1.7" fill="#544335"/><circle cx="${x}" cy="${y-13}" r="1.7" fill="#544335"/>`;}
 let art=vertical?rail(-4,-19)+rail(4,-19):rail(0,-14)+rail(0,-31);
 if(!vertical)art+=`<path d="M${ax+6} ${ay-16} L${bx-6} ${by-29}" stroke="#765036" stroke-width="4"/>`;
 art+=post(ax,ay);if(endPost)art+=post(bx,by);
 return `<svg class="farm-fence" aria-hidden="true" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="position:absolute;left:${left}px;top:${top}px;z-index:${Math.floor(Math.max(y1,y2))};pointer-events:none">${art}</svg>`;
}
function farmFenceRun(x1,y1,x2,y2,solid){
 const length=Math.hypot(x2-x1,y2-y1),count=Math.max(1,Math.ceil(length/70));let html='';
 for(let i=0;i<count;i++)html+=farmFencePanel(x1+(x2-x1)*i/count,y1+(y2-y1)*i/count,x1+(x2-x1)*(i+1)/count,y1+(y2-y1)*(i+1)/count,i===count-1);
 if(solid){const n=Math.ceil(length/22);for(let i=0;i<=n;i++)Rd.solid.push({x:x1+(x2-x1)*i/n,y:y1+(y2-y1)*i/n-5,r:12});}
 return html;
}
function farmGateClear(kind,x,y){
 const key=ecoSceneryKey('pr_'+kind),d=SPR_SIZE[key]||[80,80];
 const factor=(typeof ECO_OBJECT_KEYS!=='undefined'&&ECO_OBJECT_KEYS['pr_'+kind])?1:2;
 const half=d[0]*factor/2+20,height=d[1]*factor+12;
 return !(x+half>GATE.x-GATE.w/2-54&&x-half<GATE.x+GATE.w/2+54&&y>YARD.y1-65&&y-height<RH);
}
function livestockName(a){return a.kind==='chicken'&&!a.adult?'병아리':LIVESTOCK[a.kind].nm+(a.adult?'':' 새끼');}

function farmSpots(){
  const L=[];
  for(let i=0;i<PLOTS;i++){                        // 화단 2줄
    L.push({k:'plot', i:i, x:120+(i%6)*96, y:300+Math.floor(i/6)*120});
  }
  L.push({k:'stall', i:0, x:250, y:600});          // 가판대
  sideNpc('farm').forEach((n,i)=>{
    const spot = n.journal ? {x:660, y:360}            // 화단 바로 옆
                           : {x:150+i*230, y:560};
    L.push(Object.assign({k:'npc', i:i, npc:n}, spot));
  });
  Rd.npcSolid=sideNpc('farm').map((n,i)=>
    n.journal ? {x:660, y:354, r:26} : {x:150+i*230, y:554, r:26});
  Rd.npcSolid.push({x:250, y:594, r:40});          // 가판대
  if(!farmOpen()) Rd.npcSolid.push({x:GATE.x, y:YARD.y1+28, r:46});   // 잠긴 문
  return L;
}
function yardPoint(){
  return {x: YARD.x0+30+Math.random()*(YARD.x1-YARD.y0>0 ? (YARD.x1-YARD.x0-60) : 60),
          y: YARD.y0+30+Math.random()*(YARD.y1-YARD.y0-50)};
}
/* 우리에 있는 가축마다 마당 안 제 위치와 목적지를 준다 */
function rInitHerd(){
  const F=farmData();
  Rd.herd=[];
  F.pens.forEach((a,i)=>{
    if(!a) return;
    const p=yardPoint(), q=yardPoint();
    Rd.herd.push({i:i, x:p.x, y:p.y, tx:q.x, ty:q.y, wait:Math.random()*90, flip:false});
  });
}
/* 느릿느릿 목적지로 걸어가고, 닿으면 잠시 쉬었다 새 목적지를 고른다 */
function rHerdTick(dt){
  const F=farmData(), layer=$('rherdLayer');
  if(!layer) return;
  Rd.herd.forEach(h=>{
    const a=F.pens[h.i];
    if(!a) return;
    h.walking=false;
    const prevX=h.x,prevY=h.y;
    if(h.wait>0){ h.wait-=dt*.06; }
    else {
      const dx=h.tx-h.x, dy=h.ty-h.y, d=Math.hypot(dx,dy);
      if(d<3){ const q=yardPoint(); h.tx=q.x; h.ty=q.y; h.wait=40+Math.random()*140; }
      else {
        const sp3=.035*dt;
        h.x+=dx/d*sp3; h.y+=dy/d*sp3;
        h.x=clamp(h.x, YARD.x0+22, YARD.x1+8);        // 문으로도 나가지 못한다
        h.y=clamp(h.y, YARD.y0+34, YARD.y1+16);
        if(Math.abs(dx)>2) h.flip = dx>0;
        h.walking=true;
      }
    }
    const el=$('rh-'+h.i);
    if(el){
      el.classList.toggle('moving', !!h.walking);
      el.style.left=Math.round(h.x)+'px';
      el.style.top=Math.round(h.y)+'px';
      el.style.zIndex=Math.floor(h.y);
      el.style.transform='translate(-50%,-100%)';
      const art=el.querySelector('.anim');
      if(art){
        art.style.transform=h.flip?'scaleX(-1)':'';
        h.stride=(h.stride||0)+Math.hypot(h.x-prevX,h.y-prevY);
        const frames=Number(art.dataset.frames)||2;
        const frame=h.walking?(frames===4?[1,2,3,2][Math.floor(h.stride/7)%4]:Math.floor(h.stride/9)%frames):0;
        art.style.backgroundPositionX=(frame*100/Math.max(1,frames-1))+'%';
      }
    }
  });
}
function rPaintHerd(){
  const layer=$('rherdLayer'); if(!layer) return;
  const F=farmData();
  layer.innerHTML=Rd.herd.map(h=>{
    const a=F.pens[h.i]; if(!a) return '';
    const L2=LIVESTOCK[a.kind];
    const lab=livestockName(a)+(a.fed?' · 배불러요':'');
    const mk = a.fed ? (a.kind==='monkey'?'🐵':'') : '🍽';
    return `<div class="fnode herd" id="rh-${h.i}"
        style="left:${Math.round(h.x)}px;top:${Math.round(h.y)}px;z-index:${Math.floor(h.y)}">
      ${animSprite('an_'+a.kind+'_'+(a.adult?'adult':'baby'))}
      <div class="flab">${lab}</div>${mk?`<div class="fmk">${mk}</div>`:''}</div>`;
  }).join('');
}

function enterFarm(){
  farmData();
  stopLoop();
  S.modal='farm';
  wipeIn(mountFarm);
}
function leaveFarm(){
  rStop(); S.modal=null; bgmStop();
  wipeIn(()=>{
    const h=$('farmHost'); if(h) h.innerHTML='';
    refreshObjs(); paintMood(); paintHud(); startLoop();
  });
  autosave();
}
function rBack(){
  releaseKeys();
  S.modal='farm';
  const h=$('modalHost'); if(h) h.innerHTML='';
  rPaint();
}

function mountFarm(){
  const host=$('farmHost'); if(!host) return;
  Rd.spots=farmSpots();
  Rd.px=RW/2; Rd.py=RH-70; Rd.face='north'; Rd.moving=false; Rd.near=null;
  Rd.keys={u:false,d:false,l:false,r:false};
  host.innerHTML=`
  <div class="fscene" id="farmScene">
    <div class="fplane" id="rplane" style="width:${RW}px;height:${RH}px">
      <div class="ground" style="${groundStyle()};filter:saturate(.95) brightness(1.02)"></div>
      <div id="rpropLayer"></div>
      <div id="ryardLayer"></div>
      <div id="rspotLayer"></div>
      <div id="rherdLayer"></div>
      <div class="actor" id="rhero"><div class="shadow"></div>${heroSprite('north',88)}</div>
    </div>
    <div class="ftop"><div class="finfo chips" id="rinfo"></div></div>
    <div class="fexit" id="rexit"></div>
    <div class="ctrl">
      <div class="dpad">
        <button class="dbtn u" data-rk="u">▲</button>
        <button class="dbtn d" data-rk="d">▼</button>
        <button class="dbtn l" data-rk="l">◀</button>
        <button class="dbtn r" data-rk="r">▶</button>
      </div>
      <button class="actbtn" id="rActBtn">살펴보기</button>
    </div>
  </div>`;

  Rd.solid=[];
  const fy=YARD.y1+34,right=YARD.x1+30,gl=GATE.x-GATE.w/2,gr=GATE.x+GATE.w/2;
  let yard=farmFenceRun(YARD.x0,YARD.y0,right,YARD.y0,true);
  yard+=farmFenceRun(YARD.x0,YARD.y0,YARD.x0,fy,true);
  yard+=farmFenceRun(right,YARD.y0,right,fy,true);
  yard+=farmFenceRun(YARD.x0,fy,gl,fy,true);
  yard+=farmFenceRun(gr,fy,right,fy,true);
  if(!farmOpen())yard+=farmFenceRun(gl,fy,gr,fy,true);
  yard+=`<div class="farm-gate-path" style="left:${gl+16}px;top:${fy-18}px;width:${GATE.w-32}px"></div>`;
  yard+=`<div class="farm-gate-sign" style="left:${gr+12}px;top:${fy+13}px;z-index:${fy+14}">${farmOpen()?'마당 입구':'🔒 마당 입구'}</div>`;
  yard+=`<div class="prop" style="left:${YARD.x0+60}px;top:${fy}px;z-index:${fy}">${sp('pr_trough')}</div>`;
  $('ryardLayer').innerHTML=yard;
  let html=farmFenceRun(40,200,RW-30,200,false);
  const rnd=()=>Math.random();
  [['round',5],['pine',4],['flower',8],['plant',6],['rock',3]].forEach(([kind,n])=>{
    const gen=propGen(kind), sd=SOLID_PROPS[kind];
    let put=0,tries=0;
    while(put<n && tries<n*40){
      tries++;
      const x=60+rnd()*(RW-120), y=250+rnd()*(RH-300);
      if(!farmGateClear(kind,x,y)) continue;
      if(Rd.spots.some(t=>dist(x,y,t.x,t.y)<110)) continue;
      if(x>YARD.x0-40 && x<YARD.x1+70 && y>YARD.y0-40 && y<YARD.y1+70) continue;   // 마당 비우기
      if(dist(x,y,RW/2,RH-70)<110) continue;
      html+=`<div class="prop" style="left:${x}px;top:${y}px;z-index:${Math.floor(y)}">${gen()}</div>`;
      if(sd) Rd.solid.push({x:x,y:y-sd.dy,r:sd.r});
      put++;
    }
  });
  $('rpropLayer').innerHTML=html;

  rInitHerd();
  rPaint();
  if(!farmOpen()) setTimeout(()=>toast(
    "농장을 맡아 줄 <b>사육사 원숭이</b>가 필요해요 🐵<br>가판대에서 데려오면 농장이 열려요"),900);
  document.querySelectorAll('#farmScene .dbtn').forEach(b=>{
    const k=b.dataset.rk;
    b.addEventListener('pointerdown',e=>{
      e.preventDefault(); Rd.keys[k]=true;
      try{ b.setPointerCapture(e.pointerId); }catch(err){}
    });
    ['pointerup','pointercancel','lostpointercapture','pointerleave']
      .forEach(ev=>b.addEventListener(ev,()=>{ Rd.keys[k]=false; }));
  });
  $('rActBtn').addEventListener('click',rAct);
  rStart();
  bgmUpdate();
  toast(`🌻 ${S.day}일째 · 내 농장에 왔어요`);
}

/* ---- 그리기 ---- */
function plotArt(pl){
  if(!pl.seed) return sp('pr_plot');
  if(pl.stage===0) return sp('fl_seed');
  if(pl.stage===1) return sp('fl_sprout');
  return sp(pl.stage===2 ? 'fl_'+pl.seed+'_bud' : 'fl_'+pl.seed+'_full');
}
/* 두 칸짜리 스트립을 한 프레임만 보여 준다 (걸을 때만 CSS 로 넘긴다) */
function animSprite(key){
  const d=SPR_SIZE[key]||[72,36],n=SPR_FRAMES[key]||2;
  const hd=['an_monkey_adult','an_monkey_baby','an_chicken_baby'].includes(key),factor=hd?.5:2;
  return `<div class="anim${hd?' animal-hd':''}" data-frames="${n}" style="width:${d[0]/n*factor}px;height:${d[1]*factor}px;background-image:url('${SPRITES[key]}');background-size:${n*100}% 100%"></div>`;
}
function rPaint(){
  const L=$('rspotLayer'); if(!L) return;
  const F=farmData();
  L.innerHTML=Rd.spots.map(t=>{
    let art='', lab='', mark='';
    if(t.k==='plot'){
      const pl=F.plots[t.i];
      art=plotArt(pl);
      lab = !pl.seed ? '빈 화단'
          : (pl.stage>=3 ? FLOWERS[pl.seed].nm+' · 다 폈어요'
                         : FLOWERS[pl.seed].nm+' · '+['씨앗','새싹','봉오리'][pl.stage]);
      if(pl.seed && pl.stage<3) mark = '💧'+(3-pl.stage);
      if(pl.seed && pl.stage>=3) mark='✨';
    } else if(t.k==='npc'){
      art=npcArt(t.npc); lab=t.npc.nm;
      mark = t.npc.journal ? '📔' : (npcDone(t.npc.id)?'✅':'💬');
    } else { art=sp('obj_shop'); lab='가판대'; mark='💰'; }
    return `<div class="fnode" id="rs-${t.k}-${t.i}"
        style="left:${t.x}px;top:${t.y}px;z-index:${Math.floor(t.y)}">
      ${art}<div class="flab">${lab}</div>${mark?`<div class="fmk">${mark}</div>`:''}</div>`;
  }).join('');
  rPaintHerd();
  rPaintHud();
}
function rPaintHud(){
  const el=$('rinfo');
  if(el){
    const F=farmData();
    const seeds=Object.entries(S.seeds).filter(([k,v])=>v>0)
      .reduce((a,[k,v])=>a+v,0);
    const prod=Object.entries(S.produce).filter(([k,v])=>v>0)
      .map(([k,v])=>`<span class="chip">${itemInfo(k).nm} ${v}</span>`).join('');
    const bloom=F.plots.filter(p=>p.seed&&p.stage>=3).length;
    el.innerHTML=`<span class="chip farm-build">${ECO_BUILD_ID}</span><span class="chip">📅 ${S.day}일째</span><span class="chip" style="${canLeft()?'':'background:rgba(212,64,64,.32)'}">💧 ${canLeft()}/${canCap()}</span>
      <span class="chip">🌰 씨앗 ${seeds}</span>
      <span class="chip">🌸 수확 가능 ${bloom}</span>
      <span class="chip">🐔 우리 ${F.pens.filter(Boolean).length}/${PENS}</span>
      ${farmOpen()?'':'<span class="chip" style="background:rgba(246,201,79,.25)">🐵 사육사를 데려오세요</span>'}
      <span class="chip">🪙 ${S.gold}</span>${prod}`;
  }
  const ex=$('rexit');
  if(ex) ex.innerHTML=`<button class="tinybtn" onclick="rWaterAll()">🚿 물주기 (💧${canLeft()})</button>
    <button class="tinybtn" onclick="leaveFarm()">🚪 나가기</button>`;
}

/* ---- 루프 ---- */
function rStart(){
  rStop();
  const root=$('farmScene'); if(!root) return;
  Rd.vw=root.clientWidth||900; Rd.vh=root.clientHeight||600;
  Rd.cx=clamp(Rd.px-Rd.vw/2,0,Math.max(0,RW-Rd.vw));
  Rd.cy=clamp(Rd.py-Rd.vh/2,0,Math.max(0,RH-Rd.vh));
  let last=performance.now();
  const step=t=>{ const dt=Math.min(34,t-last); last=t; rTick(dt); Rd.raf=requestAnimationFrame(step); };
  Rd.raf=requestAnimationFrame(step);
}
function rStop(){ if(Rd.raf){ cancelAnimationFrame(Rd.raf); Rd.raf=null; } }
function rFacing(dir){
  const h=$('rhero'); if(!h) return;
  const fl=h.querySelector('.flipwrap'); if(!fl) return;
  const bd=h.querySelector('.sprite:not(.head)'), hd=h.querySelector('.sprite.head');
  const bk=bodyKey(dir), hk=headKey(dir);
  if(bd){ bd.dataset.hero=bk; bd.style.backgroundImage=`url('${heroImg(bk)}')`; }
  if(hd){ hd.dataset.hero=hk; hd.style.backgroundImage=`url('${heroImg(hk)}')`; }
  fl.classList.toggle('flip', dir==='east');
}
function rTick(dt){
  const hero=$('rhero'); if(!hero) return;
  const sp2=.19*dt;
  const oldX=Rd.px,oldY=Rd.py;
  let dx=0,dy=0;
  if(S.modal==='farm'){
    if(Rd.keys.l) dx-=1; if(Rd.keys.r) dx+=1;
    if(Rd.keys.u) dy-=1; if(Rd.keys.d) dy+=1;
  }
  const moving=dx!==0||dy!==0;
  if(moving){
    const len=Math.hypot(dx,dy); dx=dx/len*sp2; dy=dy/len*sp2;
    const nx=clamp(Rd.px+dx,30,RW-30), ny=clamp(Rd.py+dy,230,RH-25);
    const solid=solidCheck(Rd.solid.concat(Rd.npcSolid||[]),Rd.px,Rd.py);
    if(!solid(nx,Rd.py)) Rd.px=nx;
    if(!solid(Rd.px,ny)) Rd.py=ny;
    const ax=Math.abs(dx), ay=Math.abs(dy);
    const nf = ax>ay ? (dx<0?'west':'east') : (dy<0?'north':'south');
    if(nf!==Rd.face){ Rd.face=nf; rFacing(nf); }
  }
  syncStride(hero,Rd,Math.hypot(Rd.px-oldX,Rd.py-oldY));
  hero.style.left=Math.round(Rd.px)+'px';
  hero.style.top=Math.round(Rd.py)+'px';
  hero.style.zIndex=Math.floor(Rd.py)+1;
  const tx=clamp(Rd.px-Rd.vw/2,0,Math.max(0,RW-Rd.vw));
  const ty=clamp(Rd.py-Rd.vh/2,0,Math.max(0,RH-Rd.vh));
  Rd.cx+=(tx-Rd.cx)*.12; Rd.cy+=(ty-Rd.cy)*.12;
  const pl=$('rplane');
  if(pl) pl.style.transform=`translate(${-Math.round(Rd.cx)}px,${-Math.round(Rd.cy)}px)`;
  rHerdTick(dt);
  rNear();
}
function rNear(){
  let best=null,bd=92;
  Rd.spots.forEach(t=>{ const d=dist(Rd.px,Rd.py,t.x,t.y); if(d<bd){ bd=d; best=t; } });
  Rd.herd.forEach(h=>{                       // 돌아다니는 가축도 대상이 된다
    const d=dist(Rd.px,Rd.py,h.x,h.y);
    if(d<bd){ bd=d; best={k:'pen', i:h.i, x:h.x, y:h.y}; }
  });
  const id = best ? (best.k==='pen' ? 'rh-'+best.i : 'rs-'+best.k+'-'+best.i) : null;
  if(!best || !Rd.nearId || Rd.nearId!==id){
    document.querySelectorAll('#rspotLayer .fnode,#rherdLayer .fnode')
      .forEach(e=>e.classList.remove('near'));
    Rd.near=best; Rd.nearId=id;
    if(id){ const el=$(id); if(el) el.classList.add('near'); }
  } else { Rd.near=best; }
  const btn=$('rActBtn'); if(!btn) return;
  if(best && S.modal==='farm'){
    btn.classList.add('on');
    btn.textContent=rActLabel(best);
  } else btn.classList.remove('on');
}
function rActLabel(t){
  const F=farmData();
  if(t.k==='npc') return (t.npc.journal?'📔 ':'💬 ')+t.npc.nm;
  if(t.k==='stall') return '🛒 가판대';
  if(t.k==='plot'){
    const pl=F.plots[t.i];
    if(!pl.seed) return '🌰 씨앗 심기';
    if(pl.stage>=3) return '✂️ 수확하기';
    return canLeft()>0 ? ('🚿 물 주기 (💧'+canLeft()+')') : '💧 물이 없어요';
  }
  const a=F.pens[t.i];
  if(!a) return '빈 우리';
  return a.fed ? '배불러요' : '🍽 먹이 주기';
}

/* ==========================================================
   채집 필드 — 캐릭터가 걸어다니며 모으는 별도의 맵
   ========================================================== */
var FW=1300, FH=820;

/* 창고에는 꽃(fl_*)과 가축 산물이 섞여 들어간다 → 이름·값·그림 조회를 한 군데로 모은다 */
/* 스프라이트를 원래 비율 그대로 상자 안에 넣는다 (flex 가 가로만 줄이는 것을 막는다) */
function shopIcon(key, box){
  const d=SPR_SIZE[key]||[24,24];
  const n=(typeof SPR_FRAMES!=='undefined' && SPR_FRAMES[key]) || 1;
  const fw=d[0]/n;                                  // 한 칸의 가로
  const k=box/Math.max(fw,d[1]);
  const w2=Math.round(fw*k), h2=Math.round(d[1]*k);
  return `<div style="flex:0 0 ${box}px;width:${box}px;height:${box}px;
      display:flex;align-items:center;justify-content:center">
    <div style="width:${w2}px;height:${h2}px;image-rendering:pixelated;background-repeat:no-repeat;
      background-image:url('${SPRITES[key]}');background-position:0 0;
      background-size:${n*100}% 100%"></div></div>`;
}
function itemInfo(k){
  if(k.slice(0,3)==='fl_'){
    const f=FLOWERS[k.slice(3)];
    if(f) return {nm:f.nm, price:f.price, ico:'fl_'+k.slice(3)+'_full'};
  }
  const pd=PRODUCE[k];
  if(pd){
    const a=Object.values(LIVESTOCK).find(x=>x.prod===k);
    return {nm:pd.nm, price:a?a.price:5, ico:pd.ico};
  }
  return {nm:k, price:5, ico:'it_egg'};
}

/* ---- 농장 상호작용 ---- */
function rAct(){
  if(S.modal!=='farm') return;
  releaseKeys();
  const t=Rd.near; if(!t) return;
  const F=farmData();
  if(t.k==='npc'){ talkSide(t.npc); return; }
  if(t.k==='stall'){ rShopTab='seed'; S.modal='rshop'; drawModal(); return; }
  if(t.k==='plot'){
    if(!farmOpen()){
      toast("아직 농장이 열리지 않았어요<br>가판대에서 <b>사육사 원숭이</b>를 데려오세요 🐵"); return;
    }
    const pl=F.plots[t.i];
    if(!pl.seed){
      if(!Object.values(S.seeds).some(v=>v>0)){
        toast("씨앗이 없어요<br>가판대에서 살 수 있어요 🛒"); return;
      }
      rPlotIdx=t.i; S.modal='rplant'; drawModal(); return;
    }
    if(pl.stage>=3){ rHarvest(t.i); return; }
    if(canLeft()<1){ toast(T_EMPTY); return; }
    S.water--; pl.stage++;
    rPaint(); autosave();
    sparks($('rspotLayer'), t.x, t.y-30, 6, '#9fd8ff');
    toast(pl.stage>=3 ? T_BLOOM(FLOWERS[pl.seed].nm) : T_DROP(pl.stage));
    return;
  }
  // 우리
  const a=F.pens[t.i];
  if(!a){ toast("빈 우리예요<br>가판대에서 가축을 데려올 수 있어요 🛒"); return; }
  if(a.fed){ toast(`${livestockName(a)}${J(livestockName(a),'은','는')} 배가 불러요`); return; }
  if(a.kind==='monkey'){
    if((S.produce.banana||0)<1){ toast("바나나가 없어요<br>가판대에서 살 수 있어요 🍌"); return; }
    S.produce.banana--;
  }
  a.fed=true; playSfx('an_'+a.kind); rPaintHerd(); rPaintHud(); autosave();
  sparks($('rspotLayer'), t.x, t.y-30, 6, '#ffe6a0');
  toast(a.kind==='monkey' ? "원숭이가 바나나를 먹었어요 🍌<br>내일 다른 가축을 대신 돌봐 줘요"
                          : `${livestockName(a)}에게 먹이를 줬어요 🍽`);
}

function rWaterAll(){
  const F=farmData();
  const need=F.plots.filter(pl=>pl.seed && pl.stage<3);
  if(!need.length){ toast(T_NOWHERE); return; }
  if(canLeft()<1){ toast(T_EMPTY); return; }
  let n=0, bloom=0;
  for(const pl of need){
    if(canLeft()<1) break;
    S.water--; pl.stage++; n++;
    if(pl.stage>=3) bloom++;
  }
  rPaint(); autosave();
  toast(T_WATERED(n, bloom, need.length-n));
}

function rHarvest(i){
  const F=farmData(), pl=F.plots[i];
  if(!pl.seed || pl.stage<3) return;
  const key=pl.seed, f=FLOWERS[key];
  addProduce('fl_'+key,1);
  pl.seed=null; pl.stage=0; pl.wet=false;
  rPaint(); autosave();
  const t=Rd.spots.find(x=>x.k==='plot'&&x.i===i);
  if(t) sparks($('rspotLayer'), t.x, t.y-30, 9, '#ffd6f0');
  toast(`${f.nm}${J(f.nm,'을','를')} 거뒀어요! 🌸<br>가판대에 팔면 ${f.price}골드`);
}

/* ---- 씨앗 고르기 ---- */
var rPlotIdx=0;
function mPlant(){
  const list=Object.entries(FLOWERS).filter(([k])=> (S.seeds[k]||0)>0);
  if(!list.length) return `<div class="mhead"><span>🌰 씨앗 심기</span></div>
    <div class="note">가진 씨앗이 없어요. 가판대에서 사 보세요.</div>
    <button class="btn" onclick="rBack()">돌아가기</button>`;
  const cells=list.map(([k,f])=>`
    <div class="tool" onclick="rPlant('${k}')">
      ${shopIcon('fl_'+k+'_full', 44)}
      <div class="tn">${f.nm}</div>
      <div class="tn" style="color:var(--gold)">${S.seeds[k]}개 · ${f.days}일</div></div>`).join('');
  return `<div class="mhead"><span>🌰 무엇을 심을까요?</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">물을 주면 하루에 한 단계씩 자라요</span></div>
    <div class="lookrow" style="flex-wrap:wrap">${cells}</div>
    <button class="btn sec" onclick="rBack()">그만두기</button>`;
}
function rPlant(k){
  if((S.seeds[k]||0)<1) return;
  S.seeds[k]--;
  const pl=farmData().plots[rPlotIdx];
  pl.seed=k; pl.stage=0; pl.wet=false;
  autosave(); rBack();
  toast(`${FLOWERS[k].nm} 씨앗을 심었어요 🌰<br>물을 주면 자라요`);
}

/* ---- 가판대: 사고팔기 ---- */
var rShopTab='seed';
function rTab(t){ rShopTab=t; drawModal(); }
function mRShop(){
  const tabs=[['seed',"씨앗"],['animal',"가축"],['can',"물통"],['sell',"팔기"]].map(([k,nm])=>
    `<div class="tool ${rShopTab===k?'on':''}" onclick="rTab('${k}')"><div class="tn">${nm}</div></div>`).join('');
  let body='';
  if(!farmOpen()){
    const a=LIVESTOCK.monkey;
    return `<div class="mhead"><span>🛒 농장 가판대</span>
        <span style="font-size:12px;color:var(--gold)">🪙 ${S.gold}</span></div>
      <div class="card" style="text-align:center;padding:14px 12px">
        <div style="display:flex;justify-content:center">${shopIcon('an_monkey_adult',72)}</div>
        <div style="font-family:'Do Hyeon',sans-serif;font-size:16px;margin-top:6px">사육사 원숭이</div>
        <div class="note" style="margin-top:4px">농장을 맡아 줄 친구예요.<br>
          바나나를 주면 다음 날 다른 가축 ${a.keeper}마리를 대신 돌봐 줘요.</div>
      </div>
      <div class="note">원숭이를 데려와야 화단과 마당을 쓸 수 있어요.</div>
      <button class="btn ${S.gold<a.cost?'sec':''}" onclick="rBuyAnimal('monkey')">
        ${a.cost}골드에 데려오기</button>
      <button class="btn sec" onclick="rBack()">닫기</button>`;
  }
  if(rShopTab==='seed'){
    body=Object.entries(FLOWERS).map(([k,f])=>`
      <div class="row" style="align-items:center;gap:8px">
        ${shopIcon('fl_'+k+'_full', 38)}
        <div style="flex:1">${f.nm} <span style="opacity:.6;font-size:11px">${f.days}일 · 팔면 ${f.price}골드</span></div>
        <button class="btn ${S.gold<f.seed?'sec':''}" style="flex:0 0 auto;padding:6px 10px"
          onclick="rBuySeed('${k}')">${f.seed}골드</button></div>`).join('');
    body+=`<div class="row" style="align-items:center;gap:8px">
        ${shopIcon('it_banana', 38)}
        <div style="flex:1">바나나 <span style="opacity:.6;font-size:11px">원숭이 간식</span></div>
        <button class="btn ${S.gold<BANANA_COST?'sec':''}" style="flex:0 0 auto;padding:6px 10px"
          onclick="rBuyBanana()">${BANANA_COST}골드</button></div>`;
  } else if(rShopTab==='can'){
    const cur=canLv();
    body=CANS.map((c,i)=>{
      const owned=i<=cur, next=(i===cur+1);
      return `<div class="row" style="align-items:center;gap:8px">
        ${shopIcon(c.ico,38)}
        <div style="flex:1">${c.nm}
          <span style="opacity:.6;font-size:11px">${c.cap}칸 · 채집 +${c.gather} · 정화 +${c.battle}</span></div>
        ${owned
          ? `<span class="chip" style="flex:0 0 auto">${i===cur?'쓰는 중':'가지고 있어요'}</span>`
          : next
            ? `<button class="btn ${S.gold<c.price?'sec':''}" style="flex:0 0 auto;padding:6px 10px"
                 onclick="buyCan(${i})">${c.price}골드</button>`
            : `<span class="chip" style="flex:0 0 auto;opacity:.5">🔒</span>`}
      </div>`;
    }).join('');
    body+=`<div class="note">물통을 키우면 한 번에 더 많은 화단을 돌볼 수 있어요 💧</div>`;
  } else if(rShopTab==='animal'){
    body=Object.entries(LIVESTOCK).map(([k,a])=>`
      <div class="row" style="align-items:center;gap:8px">
        ${shopIcon('an_'+k+'_baby', 42)}
        <div style="flex:1">${livestockName({kind:k,adult:false})} <span style="opacity:.6;font-size:11px">${
          a.prod ? `${a.grow}일 뒤 ${PRODUCE[a.prod].nm} (${a.cyc}일마다)` : '다른 가축을 대신 돌봐요'}</span></div>
        <button class="btn ${S.gold<a.cost?'sec':''}" style="flex:0 0 auto;padding:6px 10px"
          onclick="rBuyAnimal('${k}')">${a.cost}골드</button></div>`).join('');
  } else {
    const items=[];
    Object.entries(S.produce||{}).forEach(([k,v])=>{
      if(v<1 || k==='banana') return;             // 바나나는 간식이라 안 판다
      const it=itemInfo(k);
      items.push([k, it.nm, it.price, it.ico, v]);
    });
    body = items.length ? items.map(([k,nm,pr,ico,v])=>`
      <div class="row" style="align-items:center;gap:8px">
        ${shopIcon(ico, 38)}
        <div style="flex:1">${nm} <span style="opacity:.6;font-size:11px">${v}개 · 개당 ${pr}골드</span></div>
        <button class="btn" style="flex:0 0 auto;padding:6px 10px"
          onclick="sellOpen('${k}')">팔기</button></div>`).join('')
      : `<div class="note">아직 팔 것이 없어요. 꽃을 거두거나 가축을 돌봐 보세요.</div>`;
  }
  return `<div class="mhead"><span>🛒 농장 가판대</span>
      <span style="font-size:12px;color:var(--gold)">🪙 ${S.gold}</span></div>
    <div class="lookrow">${tabs}</div>
    <div style="max-height:46vh;overflow-y:auto">${body}</div>
    <button class="btn sec" onclick="rBack()">닫기</button>`;
}
function buyCan(i){
  const c=CANS[i];
  if(!c || i!==canLv()+1) return;
  if(S.gold<c.price){ toast(T_POOR); return; }
  playSfx('spend');
  S.gold-=c.price; S.canLv=i;
  S.water=Math.min(canCap(), S.water+2);      // 새 물통에 조금 담아 준다
  autosave(); drawModal(); paintHud();
  toast(T_CAN_UP(c.nm, c.cap));
}
function rBuySeed(k){
  playSfx('spend');
  if(!farmOpen()){ toast("먼저 <b>사육사 원숭이</b>를 데려오세요 🐵"); return; }
  const f=FLOWERS[k];
  if(S.gold<f.seed){ toast("골드가 모자라요"); return; }
  S.gold-=f.seed; addSeed(k,1); autosave(); drawModal(); paintHud();
  toast(`${f.nm} 씨앗을 샀어요 🌰`);
}
function rBuyBanana(){
  if(!farmOpen()){ toast("먼저 <b>사육사 원숭이</b>를 데려오세요 🐵"); return; }
  if(S.gold<BANANA_COST){ toast("골드가 모자라요"); return; }
  S.gold-=BANANA_COST; addProduce('banana',1); autosave(); drawModal(); paintHud();
  toast("바나나를 샀어요 🍌");
}
function rBuyAnimal(k){
  const a=LIVESTOCK[k], F=farmData();
  playSfx('spend');
  if(k!=='monkey' && !farmOpen()){
    toast("먼저 <b>사육사 원숭이</b>를 데려와야 해요 🐵"); return;
  }
  const slot=F.pens.findIndex(x=>!x);
  if(slot<0){ toast("우리가 다 찼어요"); return; }
  if(S.gold<a.cost){ toast("골드가 모자라요"); return; }
  S.gold-=a.cost;
  F.pens[slot]={kind:k, age:0, adult:false, fed:false, tick:0};
  const q=yardPoint(), q2=yardPoint();
  Rd.herd.push({i:slot, x:q.x, y:q.y, tx:q2.x, ty:q2.y, wait:0, flip:false});
  rPaintHerd(); autosave(); drawModal(); paintHud();
  if(k==='monkey' && F.pens.filter(x=>x&&x.kind==='monkey').length===1){
    rStop(); mountFarm();                          // 문이 열리도록 마당을 다시 짓는다
    rPaint();
    toast("사육사 원숭이가 왔어요! 🐵<br><b>농장이 열렸어요</b> — 이제 씨앗과 가축을 살 수 있어요");
  } else {
    toast(`${livestockName({kind:k,adult:false})}${J(livestockName({kind:k,adult:false}),'을','를')} 데려왔어요!<br>먹이를 주면 ${a.grow}일 뒤 어른이 돼요`);
  }
}
/* 몇 개를 팔지 고르는 창 */
var SELL={k:null, n:1};
function sellOpen(k){
  SELL={k:k, n:1};
  S.modal='rsell'; drawModal();
}
function sellSet(n){
  const have=S.produce[SELL.k]||0;
  SELL.n=clamp(n,1,have);
  drawModal();
}
function mSell(){
  const k=SELL.k, have=S.produce[k]||0, it=itemInfo(k);
  if(have<1) return `<div class="note">팔 것이 없어요.</div>
    <button class="btn sec" onclick="rBack()">닫기</button>`;
  const n=clamp(SELL.n,1,have);
  return `<div class="mhead"><span>${it.nm} 팔기</span>
      <span style="font-size:12px;color:var(--gold)">🪙 ${S.gold}</span></div>
    <div class="card" style="text-align:center;padding:12px">
      <div style="display:flex;justify-content:center">${shopIcon(it.ico,56)}</div>
      <div style="font-size:12.5px;opacity:.8;margin-top:4px">개당 ${it.price}골드 · 가진 것 ${have}개</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px">
        <button class="btn sec" style="flex:0 0 auto;padding:6px 14px;font-size:18px"
          onclick="sellSet(${n-1})">−</button>
        <div style="font-family:'Do Hyeon',sans-serif;font-size:30px;min-width:64px">${n}<span
          style="font-size:14px;opacity:.7">개</span></div>
        <button class="btn sec" style="flex:0 0 auto;padding:6px 14px;font-size:18px"
          onclick="sellSet(${n+1})">＋</button>
      </div>
      <div class="row" style="justify-content:center;margin-top:8px">
        <button class="btn sec" style="flex:0 0 auto;padding:5px 12px" onclick="sellSet(1)">1개</button>
        <button class="btn sec" style="flex:0 0 auto;padding:5px 12px" onclick="sellSet(${Math.max(1,Math.floor(have/2))})">절반</button>
        <button class="btn sec" style="flex:0 0 auto;padding:5px 12px" onclick="sellSet(${have})">전부</button>
      </div>
      <div style="margin-top:10px;font-size:15px">받을 돈
        <b style="color:var(--gold);font-size:20px">${it.price*n}</b> 골드</div>
    </div>
    <button class="btn" onclick="rSell('${k}',${n})">이만큼 팔기</button>
    <button class="btn sec" onclick="S.modal='rshop';drawModal()">돌아가기</button>`;
}
function rSell(k,n){
  const have=S.produce[k]||0;
  n=Math.min(n,have);
  if(n<1) return;
  const unit=itemInfo(k).price;
  S.produce[k]=have-n;
  S.gold+=unit*n;
  playSfx('coin');
  autosave();
  S.modal='rshop'; drawModal(); paintHud();
  toast(`${itemInfo(k).nm} ${n}개를 팔고 <b>${unit*n}골드</b>를 받았어요 🪙`);
}

var Fd={px:0,py:0,cx:0,cy:0,solid:[],keys:{u:false,d:false,l:false,r:false},
        face:'north',moving:false,near:null,raf:null,vw:900,vh:600,nodes:[]};

function fpx(p){ return 110 + p/100*(FW-220); }
function fpy(p){ return 200 + p/100*(FH-300); }

function fNodeList(){
  const G=CUR.gather, L=[];
  G.objs.forEach(o=>L.push({k:'obj', id:o.id, x:fpx(o.x), y:fpy(o.y), d:o}));
  G.clues.forEach(c=>L.push({k:'clue',id:c.id, x:fpx(c.x), y:fpy(c.y), d:c}));
  L.push({k:'box', id:'box', x:fpx(G.box.x), y:fpy(G.box.y), d:G.box});
  return L;
}
function fNodeDone(n){
  if(n.k==='npc') return npcDone(n.npc.id);
  if(n.k==='obj')  return (S.gboard.uses[n.id]||0)<=0;
  if(n.k==='clue') return !!S.clues[n.id];
  return S.boxOpen;
}
function fNodeArt(n){
  if(n.k==='npc') return npcArt(n.npc); return n.k==='box' ? chestSVG(S.boxOpen) : gatherArt(n.d.art); }
function fNodeLabel(n){
  if(n.k==='npc') return n.npc.nm;
  if(n.k==='obj'){ const l=S.gboard.uses[n.id]||0; return n.d.cap + (l ? ' · '+l : ' · 끝'); }
  if(n.k==='clue') return (S.clues[n.id]?'✅ ':'') + n.d.cap;
  return S.boxOpen ? '✅ 열린 상자' : n.d.cap;
}
function fNodeMark(n){
  if(n.k==='npc') return npcDone(n.npc.id)?'✅':'💬';
  if(n.k==='clue') return S.clues[n.id] ? '' : '❔';
  if(n.k==='box')  return S.boxOpen ? '' : '🔒';
  return '';
}

function enterField(){
  ensureBoard();
  stopLoop();
  S.modal='field';
  wipeIn(mountField);
}
function leaveField(){
  fStop();
  S.modal=null;
  wipeIn(()=>{
    const h=$('fieldHost'); if(h) h.innerHTML='';
    refreshObjs(); paintMood(); paintHud(); startLoop();
  });
  autosave();
}
/* 수학·단서·자물쇠 창을 닫고 필드로 돌아온다 */
function fBack(){
  releaseKeys();
  S.modal='field';
  const h=$('modalHost'); if(h) h.innerHTML='';
  fPaintNodes(); fPaintHud();
}

function mountField(){
  const host=$('fieldHost'); if(!host) return;
  ensureBoard();                       // 넘어오는 사이에 비워졌을 수 있다
  if(!S.gboard) return;
  Fd.nodes=fNodeList();
  Fd.px=FW/2; Fd.py=FH-70; Fd.face='north'; Fd.moving=false; Fd.near=null;
  Fd.keys={u:false,d:false,l:false,r:false};
  host.innerHTML=`
  <div class="fscene" id="fscene">
    <div class="fplane" id="fplane" style="width:${FW}px;height:${FH}px">
      <div class="ground" style="${groundStyle()};filter:saturate(.8) brightness(.9)"></div>
      <div id="fpropLayer"></div>
      <div id="fnodeLayer"></div>
      <div class="actor" id="fhero"><div class="shadow"></div>${heroSprite('north',88)}</div>
    </div>
    <div class="ftop">
      <div class="toolbar" id="ftools"></div>
      <div class="finfo chips" id="finfo"></div>
    </div>
    <div class="fexit" id="fexit"></div>
    <div class="ctrl">
      <div class="dpad">
        <button class="dbtn u" data-fk="u">▲</button>
        <button class="dbtn d" data-fk="d">▼</button>
        <button class="dbtn l" data-fk="l">◀</button>
        <button class="dbtn r" data-fk="r">▶</button>
      </div>
      <button class="actbtn" id="fActBtn">모으기</button>
    </div>
  </div>`;

  /* 배경 소품 — 채집 지점과 겹치지 않게 흩뿌린다 */
  let html='';
  Fd.solid=[];
  ((CUR.world&&CUR.world.props)||[]).forEach(([kind,n])=>{
    const gen=propGen(kind);
    const sd=SOLID_PROPS[kind];
    let put=0, tries=0;
    while(put<n && tries<n*30){
      tries++;
      const x=40+Math.random()*(FW-80), y=210+Math.random()*(FH-250);
      if(Fd.nodes.some(nd=>dist(x,y,nd.x,nd.y)<115)) continue;
      if(sd && dist(x,y-sd.dy,FW/2,FH-70)<sd.r+80) continue;          // 시작 지점 비우기
      if(sd && Fd.solid.some(o=>dist(x,y-sd.dy,o.x,o.y)<sd.r+o.r+10)) continue;
      html+=`<div class="prop" style="left:${x}px;top:${y}px;z-index:${Math.floor(y)}">${gen()}</div>`;
      if(sd) Fd.solid.push({x:x, y:y-sd.dy, r:sd.r});
      put++;
    }
  });
  $('fpropLayer').innerHTML=html;

  // 부피가 있는 채집 지점도 통과할 수 없게 한다
  Fd.nodes.forEach(n=>{
    const art = (n.k==='box') ? 'chest' : (n.d && n.d.art);
    const sd = SOLID_ARTS[art];
    if(sd) Fd.solid.push({x:n.x, y:n.y-sd.dy, r:sd.r*0.8});
  });
  sideNpc('field').forEach((n,i)=>{                 // 채집터에도 사람이 둘 있다
    const x=240+i*320, y=250;
    Fd.nodes.push({k:'npc', id:'np'+i, x:x, y:y, npc:n});
    Fd.solid.push({x:x, y:y-6, r:26});
  });

  fPaintNodes(); fPaintTools(); fPaintHud();

  document.querySelectorAll('#fscene .dbtn').forEach(b=>{
    const k=b.dataset.fk;
    const on=e=>{
      e.preventDefault(); Fd.keys[k]=true;
      try{ b.setPointerCapture(e.pointerId); }catch(err){}
    };
    const off=()=>{ Fd.keys[k]=false; };
    b.addEventListener('pointerdown',on);
    ['pointerup','pointercancel','lostpointercapture','pointerleave']
      .forEach(ev=>b.addEventListener(ev,off));
  });
  $('fActBtn').addEventListener('click',fAct);
  fStart();
  toast("방향키로 걸어가서 <b>모으기</b>를 눌러요 🧺");
}

function fPaintNodes(){
  const L=$('fnodeLayer'); if(!L) return;
  L.innerHTML=Fd.nodes.map(n=>{
    const mk=fNodeMark(n);
    return `<div class="fnode ${fNodeDone(n)?'spent':''}" id="fn-${n.id}"
        style="left:${n.x}px;top:${n.y}px;z-index:${Math.floor(n.y)}">
      ${fNodeArt(n)}<div class="flab">${fNodeLabel(n)}</div>
      ${mk?`<div class="fmk">${mk}</div>`:''}</div>`;
  }).join('');
  Fd.near=null;
}
function fPaintTools(){
  const el=$('ftools'); if(!el) return;
  el.innerHTML=TOOLS.map(t=>`<div class="tool ${S.gboard.tool===t.id?'on':''}" onclick="pickTool('${t.id}')">
      <div class="ti">${t.ico}</div><div class="tn">${t.nm}</div></div>`).join('');
}
function fPaintHud(){
  const info=$('finfo');
  const left=boardLeft();
  if(info){
    const bag=Object.entries(S.mats).filter(([k,v])=>v>0)
      .map(([k,v])=>`<span class="chip">${CUR.mats[k].ico} ${v}</span>`).join('');
    const cl=CUR.gather.clues.filter(c=>S.clues[c.id]).length;
    info.innerHTML=`<span class="chip">🧺 남은 ${left}곳</span>
      <span class="chip">🔍 단서 ${cl}/3</span>${bag}`;
  }
  const ex=$('fexit');
  if(ex){
    let extra='';
    if(left===0 && !S.gatherDone)
      extra=`<button class="tinybtn" style="background:var(--gold);color:#3a2b0a" onclick="finishGather()">🧺 채집 마치기 (정화 +15%)</button>`;
    else if(left===0 && S.gatherDone)
      extra=`<button class="tinybtn" onclick="regrow()">🌱 다시 자라기</button>`;
    ex.innerHTML=extra+`<button class="tinybtn" onclick="leaveField()">🚪 나가기</button>`;
  }
}

function fStart(){
  fStop();
  const root=$('fscene'); if(!root) return;
  Fd.vw=root.clientWidth||900; Fd.vh=root.clientHeight||600;
  Fd.cx=clamp(Fd.px-Fd.vw/2,0,Math.max(0,FW-Fd.vw));
  Fd.cy=clamp(Fd.py-Fd.vh/2,0,Math.max(0,FH-Fd.vh));
  let last=performance.now();
  const step=t=>{ const dt=Math.min(34,t-last); last=t; fTick(dt); Fd.raf=requestAnimationFrame(step); };
  Fd.raf=requestAnimationFrame(step);
}
function fStop(){ if(Fd.raf){ cancelAnimationFrame(Fd.raf); Fd.raf=null; } }
/* 채집 필드 주인공도 머리·몸통 2겹이라 둘 다 갈아 끼워야 한다 */
function fFacing(dir){
  const h=$('fhero'); if(!h) return;
  const fl=h.querySelector('.flipwrap'); if(!fl) return;
  const bd=h.querySelector('.sprite:not(.head)'), hd=h.querySelector('.sprite.head');
  const bk=bodyKey(dir), hk=headKey(dir);
  if(bd){ bd.dataset.hero=bk; bd.style.backgroundImage=`url('${heroImg(bk)}')`; }
  if(hd){ hd.dataset.hero=hk; hd.style.backgroundImage=`url('${heroImg(hk)}')`; }
  fl.classList.toggle('flip', dir==='east');
}
function fTick(dt){
  const hero=$('fhero'); if(!hero) return;
  const sp=.19*dt;
  const oldX=Fd.px,oldY=Fd.py;
  let dx=0,dy=0;
  if(S.modal==='field'){
    if(Fd.keys.l) dx-=1;
    if(Fd.keys.r) dx+=1;
    if(Fd.keys.u) dy-=1;
    if(Fd.keys.d) dy+=1;
  }
  const moving = dx!==0||dy!==0;
  if(moving){
    const len=Math.hypot(dx,dy); dx=dx/len*sp; dy=dy/len*sp;
    const nx=clamp(Fd.px+dx,30,FW-30), ny=clamp(Fd.py+dy,175,FH-25);
    const fhit=solidCheck(Fd.solid,Fd.px,Fd.py);
    if(!fhit(nx,Fd.py)) Fd.px=nx;
    if(!fhit(Fd.px,ny)) Fd.py=ny;
    const ax=Math.abs(dx), ay=Math.abs(dy);
    const nf = ax>ay ? (dx<0?'west':'east') : (dy<0?'north':'south');
    if(nf!==Fd.face){ Fd.face=nf; fFacing(nf); }
  }
  syncStride(hero,Fd,Math.hypot(Fd.px-oldX,Fd.py-oldY));
  hero.style.left=Math.round(Fd.px)+'px';
  hero.style.top=Math.round(Fd.py)+'px';
  hero.style.zIndex=Math.floor(Fd.py)+1;

  const tx=clamp(Fd.px-Fd.vw/2,0,Math.max(0,FW-Fd.vw));
  const ty=clamp(Fd.py-Fd.vh/2,0,Math.max(0,FH-Fd.vh));
  Fd.cx+=(tx-Fd.cx)*.12; Fd.cy+=(ty-Fd.cy)*.12;
  const pl=$('fplane');
  if(pl) pl.style.transform=`translate(${-Math.round(Fd.cx)}px,${-Math.round(Fd.cy)}px)`;

  fNear();
}
function fNear(){
  let best=null, bd=88;
  Fd.nodes.forEach(n=>{
    const d=dist(Fd.px,Fd.py,n.x,n.y);
    if(d<bd){ bd=d; best=n; }
  });
  if(best!==Fd.near){
    document.querySelectorAll('#fnodeLayer .fnode').forEach(e=>e.classList.remove('near'));
    Fd.near=best;
    if(best){ const el=$('fn-'+best.id); if(el) el.classList.add('near'); }
  }
  const btn=$('fActBtn'); if(!btn) return;
  if(best && S.modal==='field'){
    btn.classList.add('on');
    if(best.k==='npc')       btn.textContent = '💬 '+best.npc.nm;
    else if(best.k==='box')  btn.textContent = S.boxOpen ? '열어 본 상자' : '🔒 상자 열기';
    else if(best.k==='clue') btn.textContent = S.clues[best.id] ? '단서 다시 보기' : '살펴보기';
    else if(fNodeDone(best)) btn.textContent = '다 모았어요';
    else {
      const t=TOOLS.find(t=>t.id===S.gboard.tool);
      btn.textContent = t ? t.ico+' '+t.nm : '모으기';
    }
  } else btn.classList.remove('on');
}

function fAct(){
  if(S.modal!=='field') return;
  releaseKeys();
  if(Fd.near && Fd.near.k==='npc'){ talkSide(Fd.near.npc); return; }
  const n=Fd.near; if(!n) return;
  const G=CUR.gather;

  /* 비밀 상자 */
  if(n.k==='box'){
    if(S.boxOpen){ toast("이미 열어본 상자예요"); return; }
    if(!G.clues.every(c=>S.clues[c.id])){
      toast("먼저 <b>숨은 단서 3개</b>를 모두 찾아야 해요<br>🔍 살펴보기로 찾아보세요"); return;
    }
    lockInput=''; S.modal='lock'; drawModal(); return;
  }

  /* 숨은 단서 */
  if(n.k==='clue'){
    if(S.clues[n.id]){ clueView=n.id; S.modal='clue'; drawModal(); return; }
    if(S.gboard.tool!=='look'){ toast("숨은 것은 🔍 <b>살펴보기</b>로 찾아요"); return; }
    S.clues[n.id]=true;
    fPaintNodes(); fPaintHud(); autosave();
    clueView=n.id; S.modal='clue'; drawModal(); return;
  }

  /* 채집 지점 — 도구가 맞으면 수학 문제가 나온다 */
  const o=n.d;
  if((S.gboard.uses[o.id]||0)<=0){ toast("여기는 더 모을 게 없어요"); return; }
  if(o.tool!==S.gboard.tool){
    const t=TOOLS.find(t=>t.id===o.tool);
    toast(`${o.no} <span style="opacity:.7">(${t?t.ico+' '+t.nm:''})</span>`);
    return;
  }
  fAskMath(n.id);
}

/* 지정한 위치에서 입자를 흩뿌린다 */
function sparks(host,x,y,n,color){
  if(!host) return;
  for(let i=0;i<(n||6);i++){
    const d=document.createElement('div');
    d.className='spark';
    const a=Math.random()*Math.PI*2, r=18+Math.random()*24;
    d.style.left=x+'px'; d.style.top=y+'px';
    d.style.setProperty('--dx',(Math.cos(a)*r).toFixed(1)+'px');
    d.style.setProperty('--dy',(Math.sin(a)*r-14).toFixed(1)+'px');
    if(color) d.style.background=color;
    d.style.animationDelay=(Math.random()*.12).toFixed(2)+'s';
    host.appendChild(d);
    setTimeout(()=>d.remove(),900);
  }
}
function fpop(id,txt){
  const host=$('fnodeLayer'), el=$('fn-'+id);
  if(!host||!el) return;
  const d=document.createElement('div');
  d.className='fpop'; d.innerHTML=txt;
  d.style.left=el.style.left;
  d.style.top=(parseFloat(el.style.top)-54)+'px';
  host.appendChild(d);
  sparks(host, parseFloat(el.style.left), parseFloat(el.style.top)-26, 7);
  setTimeout(()=>d.remove(),1000);
}

/* 실제 수확 — 문제를 맞힌 뒤에 불린다 */
function fHarvest(id, amt){
  const gb=S.gboard, o=CUR.gather.objs.find(x=>x.id===id);
  if(!o) return;
  const left=gb.uses[o.id]||0;
  if(left<=0) return;
  gb.uses[o.id]=left-1;
  addMat(o.mat,amt);

  /* 자연에서 재료를 모으면 체력·기력이 조금씩 회복된다 */
  const stG=baseStats();
  const hpUp=Math.min(stG.hpMax-S.hpCur, 5);
  const spUp=Math.min(stG.spMax-(S.spCur==null?stG.spMax:S.spCur), 4);
  if(hpUp>0) S.hpCur+=hpUp;
  if(spUp>0) S.spCur=(S.spCur==null?stG.spMax:S.spCur)+spUp;

  /* 흙과 풀숲을 뒤지다 보면 꽃씨가 딸려 나온다 (30% · 두 배로 캤으면 45%) */
  let seedMsg='';
  if(Math.random() < (amt>1 ? .45 : .30)){
    const keys=Object.keys(FLOWERS);
    const sk=keys[Math.floor(Math.random()*keys.length)];
    addSeed(sk,1);
    seedMsg=`<br>🌰 <b>${FLOWERS[sk].nm} 씨앗</b>을 주웠어요!`;
  }

  const M=CUR.mats[o.mat];
  let msg=`${o.ok} ${M.ico} ${M.name} ×${amt}`;
  if(hpUp>0||spUp>0) msg+=`<br><span style="opacity:.85">${hpUp>0?`체력 +${hpUp}`:''}${(hpUp>0&&spUp>0)?' · ':''}${spUp>0?`기력 +${spUp}`:''}</span>`;

  /* 생물 만나기 — 처음 캐는 곳에서는 반드시 만난다 (도감 완성 보장) */
  if(o.creature && !S.dex.includes(o.creature)){
    const cr=CUR.creatures.find(x=>x.id===o.creature);
    if(cr){
      S.dex.push(cr.id); S.tickets++; addExp(5);
      msg+=`<br>${cr.ico} <b>${cr.name}</b>${J(cr.name,'을','를')} 만났어요! 도감 등록 · 뽑기권 +1`;
      checkDexBonus();
    }
  }
  msg+=seedMsg;
  fPaintNodes(); fPaintHud(); paintHud(); autosave();
  fpop(id,`${M.ico} +${amt}`);
  toast(msg);
}

/* ---- 수학 문제 창 ---- */
var FM=null;
function fAskMath(id){
  FM={id:id, p:mathGen(S.grade||5), inp:'', wrong:0};
  S.modal='fmath'; drawModal();
}
function mFMath(){
  const p=FM.p;
  let pad='';
  [1,2,3,4,5,6,7,8,9,'.',0,'←'].forEach(k=>{ pad+=`<button onclick="fmKey('${k}')">${k}</button>`; });
  const help = FM.wrong===0
    ? `<div class="note">${p.h}</div>`
    : FM.wrong===1
      ? `<div class="note" style="color:var(--gold)">💡 ${p.h}</div>`
      : `<div class="card" style="font-size:13.5px;line-height:1.8">📘 풀이 — ${p.e}<br>
          정답은 <b style="color:var(--gold)">${p.a}</b> 예요.</div>`;
  return `<div class="mhead"><span>🧮 ${S.grade||5}학년 수학</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">맞히면 재료를 얻어요</span></div>
    <div class="mathq">${p.q}</div>
    <div class="mathin" id="fmDisp">${FM.inp||'?'}</div>
    <div class="keypad">${pad}</div>
    ${help}
    <div class="row">
      <button class="btn sec" onclick="fBack()">그만두기</button>
      ${FM.wrong>=2
        ? `<button class="btn" onclick="fmGiveUp()">풀이 보고 모으기</button>`
        : `<button class="btn" onclick="fmCheck()">확인</button>`}
    </div>`;
}
function fmKey(k){
  if(!FM) return;
  if(k==='←')      FM.inp=FM.inp.slice(0,-1);
  else if(k==='.'){ if(FM.inp && FM.inp.indexOf('.')<0) FM.inp+='.'; }
  else if(FM.inp.length<7) FM.inp+=k;
  drawModal();
}
function fmCheck(){
  if(!FM) return;
  if(!FM.inp){ toast("답을 입력해 주세요"); return; }
  if(mFmt(Number(FM.inp))===FM.p.a){
    const id=FM.id, amt = FM.wrong===0 ? 2 : 1;
    FM=null; fBack(); fHarvest(id,amt);
    return;
  }
  FM.wrong++; FM.inp='';
  drawModal();
  const d=$('fmDisp'); if(d){ d.classList.add('bad'); setTimeout(()=>d.classList.remove('bad'),320); }
  toast(FM.wrong>=2 ? "괜찮아요! 풀이를 보고 다시 해봐요" : "조금 아쉬워요. 다시 계산해 볼까요?");
}
function fmGiveUp(){
  if(!FM) return;
  const id=FM.id; FM=null; fBack(); fHarvest(id,1);
}

var clueView=null;
function mClue(){
  const c=CUR.gather.clues.find(x=>x.id===clueView);
  if(!c) return `<button class="btn" onclick="fBack()">돌아가기</button>`;
  const revealed = S.clues['#'+c.id];
  return `<div class="mhead"><span>🔍 ${c.cap}</span>
      <span style="font-size:12px;color:var(--gold)">${c.slot}번째 숫자</span></div>
    <div class="dialogue">${c.q}</div>
    <div class="card" style="text-align:center;font-size:26px;line-height:1.5;letter-spacing:2px">${c.ico.repeat(c.n)}</div>
    <div class="note">직접 세어 보세요! 이 숫자가 상자 자물쇠의 <b>${c.slot}번째</b> 숫자예요.</div>
    ${revealed?`<div class="card" style="text-align:center;color:var(--gold);font-size:22px;font-family:'Do Hyeon',sans-serif">${c.n}</div>`:''}
    <div class="row">
      ${revealed?'':`<button class="btn sec" ${S.gold<20?'disabled':''} onclick="revealClue('${c.id}')">🙈 답 보기 (20골드)</button>`}
      <button class="btn" onclick="fBack()">채집터로 돌아가기</button>
    </div>`;
}
function revealClue(id){
  if(S.gold<20) return;
  S.gold-=20; S.clues['#'+id]=true;
  drawModal(); paintHud(); fPaintHud();
}

var lockInput='';
function mLock(){
  const G=CUR.gather;
  const slots=G.clues.slice().sort((a,b)=>a.slot-b.slot);
  const disp=(lockInput+'___').slice(0,3).split('').join(' ');
  const hint=slots.map(c=>`<div class="cs got">${c.slot}번째<br><span style="font-size:14px">${c.ico.repeat(c.n)}</span></div>`).join('');
  let pad='';
  for(let i=1;i<=9;i++) pad+=`<button onclick="lockKey('${i}')">${i}</button>`;
  pad+=`<button onclick="lockKey('back')">←</button><button onclick="lockKey('0')">0</button><button onclick="lockKey('ok')">✔</button>`;
  return `<div class="mhead"><span>🔒 ${G.box.cap}</span></div>
    <div class="dialogue"><div class="who">🧚 에코</div>${G.box.intro}</div>
    <div class="clueslot">${hint}</div>
    <div class="lockdisp" id="lockDisp">${disp}</div>
    <div class="keypad">${pad}</div>
    <button class="btn sec" onclick="fBack()">나중에 열기</button>`;
}
function lockKey(k){
  if(k==='back'){ lockInput=lockInput.slice(0,-1); drawModal(); return; }
  if(k==='ok'){ tryLock(); return; }
  if(lockInput.length>=3) return;
  lockInput+=k;
  drawModal();
  if(lockInput.length===3) setTimeout(tryLock,260);
}
function tryLock(){
  const G=CUR.gather;
  const code=G.clues.slice().sort((a,b)=>a.slot-b.slot).map(c=>String(c.n)).join('');
  if(lockInput!==code){
    const d=$('lockDisp'); if(d){ d.classList.add('bad'); setTimeout(()=>d.classList.remove('bad'),320); }
    toast("자물쇠가 열리지 않아요. 단서를 다시 세어 봐요!");
    lockInput=''; setTimeout(drawModal,340);
    return;
  }
  S.boxOpen=true;
  const g=addGauge(5); addExp(15); S.tickets+=2; S.gold+=40;
  fBack(); paintHud(); autosave();
  setTimeout(()=>toast(`🔓 ${G.box.open}<br>정화 +${g}% · 뽑기권 ×2 · 골드 +40 · EXP +15`),200);
}

function finishGather(){
  if(S.gatherDone) return;
  S.gatherDone=true;
  const g=addGauge(15); addExp(8); S.gold+=10;
  toast(`채집 완료! 정화 +${g}% · 골드 +10 · EXP +8 · 뽑기권 +1`);
  S.tickets++;
  canAdd(canInfo().gather, T_FROM_GATHER);
  const dm=advanceDay();
  if(dm) setTimeout(()=>toast(dm),2200);
  fPaintHud(); refreshObjs(); paintHud(); autosave();
}
function regrow(){
  resetBoard(true);
  toast("🌱 숲이 다시 자랐어요");
  fPaintNodes(); fPaintTools(); fPaintHud();
}

/* ==========================================================
   제작
   ========================================================== */
function mCraft(){
  const R=CUR.recipes;
  const rows=R.map(r=>{
    const done=!!S.crafted[r.id];
    const can=Object.entries(r.need).every(([k,v])=>matCount(k)>=v);
    const needTxt=Object.entries(r.need).map(([k,v])=>
      `<span style="color:${matCount(k)>=v?'var(--green)':'var(--danger)'}">${CUR.mats[k].ico}${CUR.mats[k].name} ${matCount(k)}/${v}</span>`).join(' · ');
    return `<div class="itemrow">
      <div class="ico">${r.ico}</div>
      <div class="tx"><b>${r.name}</b><small>${r.desc}<br>${needTxt}</small></div>
      <button ${done||!can?'disabled':''} onclick="craft('${r.id}')">${done?'완료':'제작'}</button>
    </div>`;
  }).join('');
  const bag=Object.entries(S.mats).filter(([k,v])=>v>0)
    .map(([k,v])=>`<span class="chip">${CUR.mats[k].ico} ${CUR.mats[k].name} ${v}</span>`).join('')
    || '<span class="chip dim">재료 없음 — 채집터에서 모아요</span>';
  const n=Object.keys(S.crafted).length;
  const short = R.some(r=>!S.crafted[r.id] && !Object.entries(r.need).every(([k,v])=>matCount(k)>=v));
  return `<div class="mhead"><span>🔥 제작 모닥불</span>
      <span style="font-size:12px;color:rgba(251,246,234,.6)">${n} / ${R.length} 완성</span></div>
    <div class="chips">${bag}</div>
    <div class="col">${rows}</div>
    ${short?`<div class="note">재료가 모자라면 <b>채집터</b>에서 더 모아요 🧺</div>`:''}
    <button class="btn sec" onclick="closeModal()">${CUR.name}${JRO(CUR.name)} 돌아가기</button>`;
}
function craft(id){
  const r=CUR.recipes.find(x=>x.id===id);
  if(!r||S.crafted[id]) return;
  if(!Object.entries(r.need).every(([k,v])=>matCount(k)>=v)) return;
  Object.entries(r.need).forEach(([k,v])=>{ S.mats[k]-=v; });
  S.crafted[id]=true;
  const g=addGauge(r.gauge); addExp(10);
  let extra='';
  if(r.give==='potion'){ S.potions++; extra=' · 회복약 1개'; }
  if(r.give==='ticket'){ S.tickets++; extra=' · 뽑기권 1장'; }
  toast(`${r.ico} <b>${r.name}</b> 완성! 정화 +${g}%${extra}`);
  drawModal(); refreshObjs(); paintHud(); autosave();
}

/* ==========================================================
   상점 / 뽑기
   ========================================================== */
function mShop(){
  const gearRows=Object.entries(GEAR_ALL).map(([slot,list])=>
    list.map(it=>{
      const owned=S.owned.includes(it.id);
      const eq=S.gear[slot]===it.id;
      const stat = it.atk?`공격 +${it.atk}`: it.def?`방어 +${it.def}`:`기력 +${it.sp}`;
      void stat;
      return `<div class="itemrow">
        <div class="ico" style="display:flex;align-items:center;justify-content:center">${gearIco(it,32)}</div>
        <div class="tx"><b>${it.name}</b><small>${GEAR_LABEL[slot]} · ${stat}</small></div>
        ${owned
          ? `<button ${eq?'disabled':''} onclick="equip('${slot}','${it.id}')">${eq?'장착중':'장착'}</button>`
          : `<button ${S.gold<it.price?'disabled':''} onclick="buyGear('${slot}','${it.id}')">${it.price}G</button>`}
      </div>`;
    }).join('')).join('');
  const sellRows=Object.entries(S.mats).filter(([k,v])=>v>0).map(([k,v])=>
    `<div class="itemrow"><div class="ico">${CUR.mats[k].ico}</div>
      <div class="tx"><b>${CUR.mats[k].name}</b><small>보유 ${v}개 · 개당 ${CUR.mats[k].price}G</small></div>
      <button onclick="sellMat('${k}')">1개 팔기</button></div>`).join('')
    || `<div class="note">팔 수 있는 재료가 없어요</div>`;
  return `<div class="mhead"><span>🛒 떠돌이 상인</span><span style="font-size:13px">🪙 ${S.gold}</span></div>
    <div class="dialogue"><div class="who">🧑‍🌾 상인</div>
      어서 오게! 좋은 물건이 많다네.<br>안 쓰는 재료는 내가 사 주지.</div>
    <div class="itemrow" style="border-color:var(--green)">
      <div class="ico">🧪</div>
      <div class="tx"><b>회복약</b><small>전투 중에 마시면 HP 40% 회복 · 보유 ${S.potions}개</small></div>
      <button ${S.gold<POTION_PRICE?'disabled':''} onclick="buyPotion()">${POTION_PRICE}G</button>
    </div>
    <div class="itemrow" style="border-color:var(--gold)">
      <div class="ico">🎁</div>
      <div class="tx"><b>정화의 뽑기</b><small>보유 뽑기권 ${S.tickets}장 · 1장으로 무작위 보상 (한 장 30골드)</small></div>
      <button ${S.tickets<=0?'disabled':''} onclick="openModal('gacha')">뽑기</button>
    </div>
    <div class="itemrow">
      <div class="ico">🎫</div>
      <div class="tx"><b>뽑기권 구입</b><small>골드로 뽑기권을 살 수 있어요</small></div>
      <button ${S.gold<50?'disabled':''} onclick="buyTicket()">50G</button>
    </div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:14px;color:var(--gold);margin-top:4px">장비</div>
    <div class="col">${gearRows}</div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:14px;color:var(--gold);margin-top:4px">재료 판매</div>
    <div class="col">${sellRows}</div>
    <button class="btn sec" onclick="closeModal()">나가기</button>`;
}
function buyGear(slot,id){
  const it=gearFind(slot,id);
  if(it && S.gold>=it.price && !S.owned.includes(it.id)) playSfx('spend');
  if(!it||S.gold<it.price||S.owned.includes(id)) return;
  S.gold-=it.price; S.owned.push(id); S.gear[slot]=id;
  toast(`${it.name} 구입 & 장착!`);
  drawModal(); paintHud(); autosave();
}
function equip(slot,id){ S.gear[slot]=id; toast("장착했어요"); drawModal(); paintHud(); autosave(); }
function sellMat(k){
  if(matCount(k)<=0) return;
  S.mats[k]--; S.gold+=CUR.mats[k].price;
  toast(`${CUR.mats[k].name} 판매 · 골드 +${CUR.mats[k].price}`);
  drawModal(); paintHud();
}
function buyTicket(){
  if(S.gold<50) return;
  S.gold-=50; S.tickets++;
  toast("뽑기권 1장 구입!"); drawModal(); paintHud(); autosave();
}
function buyPotion(){
  if(S.gold<POTION_PRICE) return;
  S.gold-=POTION_PRICE; S.potions++;
  toast("회복약 1개 구입! 전투 중에 쓸 수 있어요");
  drawModal(); paintHud(); autosave();
}

var gachaResult=null;
var gachaMiss=false;
/* 전설 획득 연출 */
function legendReveal(it, worn, curName){
  const host=document.createElement('div');
  host.id='legendFx';
  host.innerHTML=`
    <div class="lgBack"></div>
    <div class="lgRays"></div>
    ${Array.from({length:18},(_,i)=>{
      const a=(i/18)*360, d=90+Math.random()*130;
      return `<div class="lgSpark" style="--a:${a}deg;--d:${d}px;
        animation-delay:${(Math.random()*.4).toFixed(2)}s"></div>`;
    }).join('')}
    <div class="lgCard">
      <div class="lgTag">전설</div>
      <div class="lgIco">${shopIcon(it.ico, 92)}</div>
      <div class="lgName">${it.name}</div>
      <div class="lgDesc">${it.desc}</div>
      <div class="lgStat">${it.atk?('공격 +'+it.atk):(it.def?('방어 +'+it.def):('기력 +'+it.sp))}</div>
      ${worn ? '<div class="lgWear">바로 장착했어요</div>'
             : '<div class="lgWear off">지금 낀 '+curName+'보다 기본 능력이 낮아 가방에 넣었어요<br>'
               + '효과를 쓰려면 상점에서 바꿔 끼세요</div>'}
      <button class="btn" onclick="legendClose()">좋아!</button>
    </div>`;
  document.body.appendChild(host);
  playSfx('purify');
  setTimeout(()=>playSfx('coin'), 280);
  setTimeout(()=>playSfx('encount'), 560);
}
function legendClose(){
  const h=$('legendFx'); if(h) h.remove();
}

function mGacha(){
  if(!gachaResult){
    return `<div class="mhead"><span>🎁 정화의 뽑기</span><span style="font-size:12px">보유 ${S.tickets}장</span></div>
      <div class="card" style="text-align:center;padding:30px">
        <div style="font-size:56px">🎁</div>
        <div class="note" style="margin-top:8px">무엇이 나올까요?</div>
      </div>
      <div class="row">
        <button class="btn" ${S.tickets<=0?'disabled':''} onclick="rollGacha()">뽑기!</button>
        <button class="btn sec" onclick="gachaResult=null;openModal('shop')">돌아가기</button>
      </div>`;
  }
  return `<div class="mhead"><span>🎁 결과</span></div>
    <div class="card" style="text-align:center;padding:26px">
      <div style="font-size:52px">${gachaMiss?'💨':'✨'}</div>
      <div style="font-family:'Do Hyeon',sans-serif;font-size:21px;color:var(--gold);margin-top:6px">${gachaResult}</div>
    </div>
    <div class="row">
      <button class="btn" ${S.tickets<=0?'disabled':''} onclick="rollGacha()">한 번 더 (${S.tickets}장)</button>
      <button class="btn sec" onclick="gachaResult=null;openModal('shop')">돌아가기</button>
    </div>`;
}
function rollGacha(){
  if(S.tickets<=0) return;
  S.tickets--;
  const total=GACHA.reduce((a,b)=>a+b.w,0);
  let r=Math.random()*total, hit=GACHA[0];
  for(const g of GACHA){ if(r<g.w){ hit=g; break; } r-=g.w; }
  // 전설은 무엇이 뽑혔든 상관없이 매번 굴린다 (다 합쳐 3%)
  const legendPool=LEGEND_GEAR.filter(i=>!S.owned.includes(i.id));
  if(legendPool.length && Math.random()<LEGEND_RATE){
    const it=legendPool[Math.floor(Math.random()*legendPool.length)];
    S.owned.push(it.id);
    const cur=gearFind(it.slot, S.gear[it.slot]);
    const val=o=>o?(o.atk||o.def||o.sp||0):-1;
    const wear = val(it)>=val(cur);
    if(wear) S.gear[it.slot]=it.id;
    gachaResult=`✨ <b style="color:var(--gold)">전설 · ${it.name}</b><br>
      <span style="font-size:12px">${it.desc}</span>`
      + (wear ? '' : `<br><span style="font-size:11.5px;opacity:.75">
          지금 낀 ${cur.name}보다 기본 능력이 낮아 가방에 넣었어요<br>
          효과를 쓰고 싶으면 상점에서 바꿔 끼세요</span>`);
    drawModal(); paintHud(); autosave();
    legendReveal(it, wear, cur?cur.name:'');
    toast(`✨ 전설 장비 <b>${it.name}</b>!`);
    return;
  }

  let txt=hit.txt||'';
  if(hit.type==='miss'){
    gachaResult='<span style="color:rgba(251,246,234,.75)">'
      + MISS_TXT[Math.floor(Math.random()*MISS_TXT.length)] + '</span>';
    gachaMiss=true;
    drawModal(); paintHud(); autosave();
    return;
  }
  gachaMiss=false;
  if(hit.type==='gold'){ S.gold+=hit.amt; }
  else if(hit.type==='mat'){
    const keys=Object.keys(CUR.mats);
    const k=keys[Math.floor(Math.random()*keys.length)];
    addMat(k,hit.amt);
    txt=`${CUR.mats[k].ico} ${CUR.mats[k].name} ×${hit.amt}`;
  }
  else if(hit.type==='gear'){
    const slots=['weapon','armor','helm','shoes'];
    const sl = slots[Math.floor(Math.random()*slots.length)];
    const list = GEAR_ALL[sl] || [];
    if(!list.length){ S.gold+=40; txt='골드 40'; }
    else {
      // 등급을 비중대로 고른다 (낮은 등급일수록 흔하다)
      let tot=0;
      for(let i=0;i<list.length;i++) tot += (GEAR_TIER_W[i]||1);
      let r=Math.random()*tot, idx=0;
      for(let i=0;i<list.length;i++){
        const wgt=(GEAR_TIER_W[i]||1);
        if(r<wgt){ idx=i; break; }
        r-=wgt;
      }
      const it=list[idx];
      txt=it.name;
      if(!S.owned.includes(it.id)){
        S.owned.push(it.id);
        // 지금 낀 것보다 좋을 때만 갈아 낀다
        const cur=gearFind(sl, S.gear[sl]);
        const val=o=>o?(o.atk||o.def||o.sp||0):-1;
        if(val(it)>val(cur)) S.gear[sl]=it.id;
      } else {
        const back=Math.max(20, Math.round((it.price||60)*0.35));
        S.gold+=back;
        txt=`${it.name} (이미 있어 골드 ${back}으로 바꿨어요)`;
      }
    }
  }
  gachaResult=txt;
  drawModal(); paintHud(); autosave();
}

/* ==========================================================
   가방 / 도감
   ========================================================== */
function mBag(){
  const st=baseStats();
  const gearTxt=['weapon','armor','helm','shoes'].map(slot=>{
    const it=gearFind(slot, S.gear[slot]);
    return `<div class="chip" style="display:inline-flex;align-items:center;gap:4px;
        ${it?'':'opacity:.45'}">${it?gearIco(it,22):''}
      <span>${it?it.name:GEAR_LABEL[slot]+' 없음'}</span></div>`;
  }).join('');
  const bag=Object.entries(S.mats).filter(([k,v])=>v>0)
    .map(([k,v])=>`<span class="chip">${CUR.mats[k].ico} ${CUR.mats[k].name} ${v}</span>`).join('') || '<span class="chip dim">재료 없음</span>';
  const skills=activeSkills().map(s=>
    `<span class="chip ${S.lv>=s.lv?'':'dim'}" ${s.pet?'style="border-color:var(--gold);color:var(--gold)"':''}>${S.lv>=s.lv?'':'🔒 '}${s.name}</span>`).join('');
  const need=nextNeed();
  return `<div class="mhead"><span>🎒 ${NAME()}의 가방</span><span style="font-size:12px">번호 ${esc(S.code)}</span></div>
    <div class="card">
      <div style="font-size:13.5px;line-height:2">
        레벨 <b>Lv.${S.lv}</b> ${need!==null?`<span style="opacity:.6">(다음 레벨까지 ${need-S.exp} EXP)</span>`:'<span style="opacity:.6">(최대)</span>'}<br>
        체력 <b>${S.hpCur} / ${st.hpMax}</b> · 공격 <b>${st.atk}</b> · 방어 <b>${st.def}</b> · SP <b>${st.spMax}</b><br>
        골드 <b>${S.gold}</b> · 뽑기권 <b>${S.tickets}</b>장 · 회복약 <b>${S.potions}</b>개
      </div>
    </div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:13.5px;color:var(--gold)">장착 중</div>
    <div class="chips">${gearTxt}</div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:13.5px;color:var(--gold)">배운 기술 <span style="font-size:11px;opacity:.7">(노란색 = ${PETS[S.petKey].name} 고유)</span></div>
    <div class="chips">${skills}</div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:13.5px;color:var(--gold)">재료</div>
    <div class="chips">${bag}</div>
    <div style="font-family:'Do Hyeon',sans-serif;font-size:13.5px;color:var(--gold)">수학 문제 학년 <span style="font-size:11px;opacity:.7">(채집할 때 나와요)</span></div>
    <div class="toolbar">${[4,5,6].map(g=>`<div class="tool ${S.grade===g?'on':''}" onclick="changeGrade(${g})">
        <div class="ti">${g}</div><div class="tn">초등 ${g}학년</div></div>`).join('')}</div>
    <button class="btn sec" onclick="closeModal()">닫기</button>`;
}
function changeGrade(g){
  S.grade=g; drawModal(); autosave();
  toast(`초등 ${g}학년 문제로 바뀌었어요 🧮`);
}
function mDex(){
  const rows=CUR.creatures.map(c=>{
    const got=S.dex.includes(c.id);
    return `<div class="itemrow" style="${got?'':'opacity:.45'}">
      <div class="ico">${got?c.ico:'❓'}</div>
      <div class="tx"><b>${got?c.name:'???'}</b><small>${got?`${c.role} · ${c.note}`:'아직 만나지 못했어요'}</small></div>
    </div>`;
  }).join('');
  const all=S.dex.length>=CUR.creatures.length;
  return `<div class="mhead"><span>📔 정화 도감</span><span style="font-size:12px">${S.dex.length} / ${CUR.creatures.length}</span></div>
    <div class="dialogue"><div class="who">🧚 에코</div>
      만난 동물이 여기에 기록돼요.<br>
      ${all?'모두 만났어요! 정화 <b>+5%</b>를 받았어요 🎉':'모두 모으면 정화 <b>+5%</b> 보너스를 줄게요!'}</div>
    <div class="col">${rows}</div>
    <button class="btn sec" onclick="closeModal()">닫기</button>`;
}

/* ==========================================================
   클리어 / 여정 지도 / 수료증
   ========================================================== */
function pgClear(){
  if(!S.cleared.includes(CUR.id)){ S.cleared.push(CUR.id); autosave(); }
  const nx = CUR.next ? THEMES[CUR.next] : null;
  const allDone = THEME_ORDER.every(id=>S.cleared.includes(id));
  const canGo = nx && themeOpen(nx);
  return `<div class="page"><div class="inner" style="justify-content:center;flex:1">
    <div style="text-align:center;font-size:60px">${CUR.icon}✨</div>
    <h1 class="title" style="font-size:28px">${CUR.name}${J(CUR.name,'이','가')} 되살아났어요!</h1>
    <div class="dialogue"><div class="who">🧚 에코</div>
      해냈어요, <b>${NAME()}</b> 님! ${CUR.name}${J(CUR.name,'이','가')} 다시 살아났어요.<br>
      ${allDone
        ? '<b>여섯 지역을 모두 되살렸어요.</b> 정령들의 힘이 하나로 모였어요! 🌍'
        : (nx
            ? (canGo
                ? `다음은 <b>${nx.name}</b>이에요. 준비됐나요? ${nx.icon}`
                : `다음은 <b>${nx.name}</b>이에요. <b>Lv.${nx.levelGate}</b>가 되면 갈 수 있어요. ${nx.icon}`)
            : '고생 많았어요!')}
    </div>
    <div class="card">
      <div style="font-size:13.5px;line-height:2">
        정화 게이지 <b style="color:var(--green)">${S.gauge}%</b> 달성<br>
        레벨 <b>Lv.${S.lv}</b> · 누적 경험치 <b>${S.exp}</b><br>
        퀴즈 정답 <b>${qCorrect()} / ${CUR.quiz.length}</b>${S.advDone?' · 생각 넓히기 완료':''}<br>
        도감 등록 <b>${S.dex.length} / ${CUR.creatures.length}</b>종 · 보유 골드 <b>${S.gold}</b><br>
        비밀 상자 <b>${S.boxOpen?'열었어요 🔓':'못 열었어요 🔒'}</b><br>
        되살린 지역 <b>${S.cleared.length} / ${THEME_ORDER.length}</b>곳
      </div>
    </div>
    <div class="col">
      ${canGo?`<button class="btn" onclick="enterTheme('${nx.id}')">${nx.icon} 제${nx.chapter}장 «${nx.title}» 으로 떠나기</button>`:''}
      <button class="btn ${canGo?'sec':''}" onclick="go('cert')">🏅 수료증 받기</button>
      <button class="btn sec" onclick="go('themes')">🗺️ 정화사의 여정 보기</button>
      <button class="btn sec" onclick="S.scene='world';Wd.ready=false;render()">${CUR.name} 더 둘러보기</button>
    </div>
  </div></div>`;
}

function pgThemes(){
  const rows = THEME_ORDER.map(id=>{
    const t=THEMES[id];
    const done=S.cleared.includes(id);
    const here=(id===S.themeId);
    const open=themeOpen(t);
    const state = done ? '<span style="color:var(--green)">✅ 정화 완료</span>'
      : here ? '<span style="color:var(--gold)">📍 지금 여기</span>'
      : open ? '<span style="color:var(--gold)">▶ 들어갈 수 있어요</span>'
      : (t.ready ? `<span style="opacity:.7">🔒 Lv.${t.levelGate} 필요</span>`
                 : '<span style="opacity:.7">🚧 준비 중</span>');
    const pr=S.progress&&S.progress[id];
    const gg = here ? S.gauge : (pr?pr.gauge:0);
    return `<div class="themecard ${t.ready?'':'lock'}">
      <div class="ti">${t.icon}</div>
      <div class="tx" style="flex:1">
        <b>제${t.chapter}장 · ${t.name}</b>
        <small>${t.title} · ${state}${gg?` · 정화 ${gg}%`:''}</small>
      </div>
      ${(open&&!here)?`<button onclick="enterTheme('${id}')">${done?'다시 가기':'출발'}</button>`:''}
      ${here?`<button onclick="S.scene='world';Wd.ready=false;render()">돌아가기</button>`:''}
    </div>`;
  }).join('');
  const allDone = THEME_ORDER.every(id=>S.cleared.includes(id));
  return `<div class="page"><div class="inner">
    <h1 class="title" style="font-size:24px">🗺️ 정화사의 여정</h1>
    <div class="dialogue"><div class="who">🧚 에코</div>
      ${allDone
        ? '<b>여섯 지역을 모두 되살렸어요!</b> 지구의 균형이 돌아왔어요. 정말 대단해요 🌍'
        : '여섯 지역을 모두 되살리면 지구의 균형이 돌아와요.<br>레벨이 오르면 새 지역이 열려요!'}
    </div>
    <div class="col">${rows}</div>
    <div class="note">레벨·골드·회복약은 지역이 바뀌어도 이어져요.<br>지역별 진행 상황은 따로 저장되니 언제든 다시 갈 수 있어요.</div>
    <div class="row">
      <button class="btn sec" onclick="S.scene='world';Wd.ready=false;render()">지금 지역으로</button>
      <button class="btn sec" onclick="go('cert')">🏅 수료증</button>
    </div>
  </div></div>`;
}

function pgCert(){
  const d=new Date();
  const ymd=`${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
  return `<div class="page"><div class="inner">
    <div class="cert">
      <h2>환 경 정 화 사 수 료 증</h2>
      <div style="font-size:12px;color:#7a6a4a">제 ${esc(S.code)} 호</div>
      <div class="nm">${NAME()}</div>
      <p>
        위 사람은 「에코 크로니클」 제${CUR.chapter}장 <b>${CUR.title}</b>에서<br>
        ${CUR.name} 생태계의 구조와 환경 오염 문제를 배우고,<br>
        정화 활동을 성실히 수행하여 ${CUR.name}${J(CUR.name,'을','를')} 완전히 되살렸으므로<br>
        이 수료증을 수여합니다.
      </p>
      <p style="font-size:12.5px;color:#5c5040">
        정화 달성 ${S.gauge}% · 레벨 Lv.${S.lv} · 퀴즈 ${qCorrect()}/${CUR.quiz.length}문항 정답<br>
        생물 도감 ${S.dex.length}/${CUR.creatures.length}종 등록${S.boxOpen?' · 비밀 상자 해제':''}
      </p>
      <div class="seal">${ymd}<br><b>정령 에코 · 에코 크로니클 운영진</b> 🌿</div>
    </div>
    <div class="row noprint">
      <button class="btn" onclick="window.print()">인쇄 / PDF 저장</button>
      <button class="btn sec" onclick="go('clear')">돌아가기</button>
    </div>
    <div class="note noprint">인쇄 창에서 '대상'을 <b>PDF로 저장</b>으로 바꾸면 파일로 보관할 수 있어요.</div>
  </div></div>`;
}

/* ==========================================================
   시작
   ========================================================== */
window.addEventListener('beforeunload',()=>{ try{ if(S&&S.code) Save.save(); }catch(e){} });
document.addEventListener('visibilitychange',()=>{ if(document.hidden) try{ if(S&&S.code) Save.save(); }catch(e){} });

try {
  S=newState();
  applyTheme('forest');
  render();
  window.ECO_BOOT_READY=true;
} catch(error) {
  if(window.ecoBootFailure)window.ecoBootFailure(error);
  else throw error;
}
