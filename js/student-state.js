/* Canonical initial student state; no storage, DOM, network or game rules. */
(function(root){
'use strict';
var VERSION=9;
function create(){
  return {
    v:VERSION, saveVersion:VERSION,
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
    ecoTechUnlocked:[], ecoTechQuests:{}, ecoTechSites:[], ecoTechFindings:[],
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
root.EcoStudentState=Object.freeze({version:VERSION,create:create});
})(globalThis);
