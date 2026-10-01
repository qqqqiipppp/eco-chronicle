// Exercise real progression, selection and result functions in disposable storage.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const nodes=new Map(),storage=new Map(),messages=[];
const node=()=>({innerHTML:'',textContent:'',style:{},offsetWidth:0,hidden:false,
  classList:{add(){},remove(){},toggle(){}},querySelector(){return null;},querySelectorAll(){return [];},
  addEventListener(){},removeEventListener(){},setAttribute(){}});
const c={console,Math:Object.create(Math),Date,Map,Set,Uint8Array,URL,performance:{now:()=>0},
 document:{baseURI:'http://localhost/',getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],addEventListener(){},removeEventListener(){},createElement:node},
 localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)},
 addEventListener(){},removeEventListener(){},setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},
 requestAnimationFrame(){return 1;},cancelAnimationFrame(){},SPRITES:{},Image:class{},navigator:{}};
c.window=c;vm.createContext(c);
for(const file of ['gear-data','npc-data','map-utils','theme-data','learning-data','equipment-ui','ecotech-exploration','ecotech'])
 vm.runInContext(read('js/'+file+'.js'),c,{filename:file});
const source=read('js/game.js');
vm.runInContext(source.slice(0,source.lastIndexOf('try {\n  S=newState();')),c,{filename:'game.js'});
for(const file of ['encounters','minigame','plogging','animal-care'])vm.runInContext(read('js/'+file+'.js'),c,{filename:file});
for(const id of ['modalHost','pgResult','spResult','mtResult','arcResult','hudHost'])nodes.set(id,node());
for(const fn of ['drawModal','paintHud','paintMood','refreshObjs','playSfx','releaseKeys','showLvUp','stopLoop','closeBattleDom','spDraw'])c[fn]=()=>{};
c.render=()=>{};c.toast=msg=>messages.push(msg);c.closeModal=()=>{c.S.modal=null;};c.wipeIn=fn=>fn();
const json=x=>JSON.parse(JSON.stringify(x));
function reset(){c.S=c.newState();c.S.name='검증';c.S.petKey='earth';c.S.code='EC_TEST_RULES';c.applyTheme('forest');c.Adm.on=false;c.Tw.on=false;c.InterludeRun=null;}
reset();
// Completion is explicit in cleared, rather than a high level or partial progress.
for(let complete=0;complete<6;complete++){
 reset();c.S.lv=10;c.S.cleared=Array.from(c.THEME_ORDER).slice(0,complete);
 for(let i=0;i<6;i++)assert.equal(c.themeOpen(c.THEMES[c.THEME_ORDER[i]]),i<=complete);
 if(complete<5){const blocked=c.THEME_ORDER[complete+1],old=c.S.themeId;c.enterTheme(blocked);assert.equal(c.S.themeId,old);assert.match(messages.at(-1),new RegExp(c.THEMES[c.THEME_ORDER[complete]].name));}
 c.S.lv=1;const last=c.THEME_ORDER[complete];c.enterTheme(last);assert.equal(c.S.themeId,last,'completion opens next region even at Lv1');
 c.enterTheme('forest');assert.equal(c.S.themeId,'forest','revisit allowed');c.enterTheme(last);assert.equal(c.S.themeId,last);
}
reset();c.S.lv=10;c.S.progress.river={gauge:80};assert.equal(c.themeOpen(c.THEMES.ocean),false);
c.S.cleared=['ocean'];assert.equal(c.themeOpen(c.THEMES.city),false,'a missing earlier chapter cannot be skipped');
c.S.cleared=[];c.Adm.on=true;c.enterTheme('climate');assert.equal(c.S.themeId,'climate');c.Adm.on=false;assert.equal(c.themeOpen(c.THEMES.climate),false);
reset();c.S.lv=10;const map=c.pgThemes();assert.doesNotMatch(map,/Lv\.\d+ 필요|레벨이 오르면/);assert.match(map,/river.*잠김/s);
assert.match(c.pgCert(),/정화하면 수료증/);c.pgClear();assert.deepEqual(json(c.S.cleared),[],'certificate/clear routing cannot create a premature flag');
c.S.gauge=100;c.pgClear();assert.deepEqual(json(c.S.cleared),['forest']);assert.equal(c.themeOpen(c.THEMES.river),true);
// Existing flags, current level and cumulative EXP survive actual save/load migration.
reset();c.S.lv=6;c.S.exp=430;c.S.cleared=['forest','river','ocean'];c.S.progress.forest={gauge:100};c.S.themeId='city';
c.Save.save();c.quickLoad(c.S.code);assert.deepEqual(json(c.S.cleared),['forest','river','ocean']);assert.equal(c.S.themeId,'city');assert.equal(c.S.lv,6);assert.equal(c.S.exp,430);
reset();c.S.lv=10;c.S.exp=1300;c.S.themeId='ocean';c.S.gauge=53;c.Save.save();c.quickLoad(c.S.code);
assert.equal(c.S.themeId,'forest');assert.equal(c.S.progress.ocean.gauge,53);assert.equal(c.S.lv,10);assert.equal(c.S.exp,1300);
const old=[0,40,100,180,280,400,560,760,1000,1300],needs=[0,48,120,216,336,480,672,912,1200,1560];
assert.deepEqual(json(c.LEVELS.map(l=>l.need)),needs);
for(let i=1;i<10;i++){
 assert.equal(needs[i],old[i]*1.2);
 for(const delta of [-1,0,1]){reset();c.S.exp=needs[i]+delta;c.addExp(0);assert.equal(c.S.lv,delta<0?i:i+1,`EXP ${c.S.exp}`);}
}
reset();c.S.lv=6;c.S.exp=430;c.addExp(0);assert.equal(c.S.lv,6);assert.equal(c.nextNeed(),672);
assert.match(c.mStatus(),/다음 레벨까지 242/);assert.match(c.mBag(),/다음 레벨까지 242 EXP/);
c.addExp(241);assert.equal(c.S.lv,6);c.addExp(1);assert.equal(c.S.lv,7);assert.equal(c.S.exp,672);
reset();c.S.lv=10;c.S.exp=1300;c.addExp(0);assert.equal(c.S.lv,10);assert.equal(c.nextNeed(),null);
assert.deepEqual(json(c.LEVELS.map(({need,...stats})=>stats)),[
 {lv:1,hp:60,atk:13,def:7,sp:25},{lv:2,hp:70,atk:16,def:9,sp:30},{lv:3,hp:80,atk:19,def:11,sp:35},
 {lv:4,hp:90,atk:22,def:13,sp:40},{lv:5,hp:100,atk:25,def:15,sp:45},{lv:6,hp:110,atk:28,def:17,sp:50},
 {lv:7,hp:124,atk:31,def:19,sp:56},{lv:8,hp:138,atk:34,def:21,sp:62},{lv:9,hp:152,atk:37,def:23,sp:68},{lv:10,hp:168,atk:41,def:26,sp:76}]);
// Real world/tower selection paths, four complete cycles each, using a reproducible RNG.
let seed=90321;c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
c.EncounterMiniCycle={pool:'',bag:[],last:null};
const pool=json(c.availableEncounterMinis());assert.deepEqual(pool,['pang','spheres','timing','match','runner']);
const world=[];reset();
for(let i=0;i<20;i++){c.S.monIdx=i%2?2:0;c.S.encounterWon=true;c.advanceEncounter();world.push(c.S.interludePending.mode);c.S.interludePending=null;}
const tower=[];c.Tw.on=true;
for(let f=1;tower.length<20;f++)if(c.floorKind(f)==='mini'){
 c.Tw.floor=f;c.Tw.floorCleared=false;c.Tw.interludePending=null;c.Tw.mon=c.towerMon(f);c.towerGo();
 const pending=c.Tw.interludePending;tower.push(pending.mode);c.towerGo();assert.equal(c.Tw.interludePending,pending,'reopening does not redraw');
}
function checkCycles(list){for(let i=0;i<list.length;i+=5)assert.deepEqual(list.slice(i,i+5).sort(),pool.slice().sort());}
checkCycles(world);checkCycles(tower);const both=world.concat(tower);
for(let i=1;i<both.length;i++)assert.notEqual(both[i],both[i-1],'no repetition, including cycle/context boundaries');
// Every real launcher is dispatched, while real finish handlers settle each gate.
const mounted=[],realEntries={};
c.mountBattle=()=>{mounted.push('battle');};
for(const [id,meta] of Object.entries(c.ENCOUNTER_MINIS)){realEntries[meta.entry]=c[meta.entry];c[meta.entry]=()=>{mounted.push(id);c.S.modal=id;};}
function finish(mode,win){
 if(mode==='pang'){c.Pg={over:false,off:[],count:28,t:1000};win?c.pangWin():c.pangLose('time');}
 else if(mode==='match'){c.Mt={over:false,done:30,moves:20};win?c.mtWin():c.mtLose();}
 else if(mode==='spheres'){
  c.Sp={over:false,N:2,cells:[{x:0,y:0,state:'clean'},{x:1,y:0,state:win?'clean':'bad'}],hearts:1,px:0,py:0,t0:Date.now(),tick:1};
  win?c.spCheckWin():c.spMove('r');
 }else if(mode==='timing'){
  c.Arc={mode,theme:'forest',status:win?'won':'lost',score:0,hearts:3,bestCombo:0,time:1,off:[],keys:{},raf:1};c.arcFinish(c.Arc);
 }else{c.Care={score:win?100:0,settled:false,raf:1,off:[]};c.careFinish(c.Care);}
}
for(const inTower of [false,true])for(const mode of pool)for(const win of [false,true]){
 reset();c.Tw.on=inTower;c.Tw.floor=2;c.Tw.mon=c.towerMon(2);c.Tw.floorCleared=false;c.S.monIdx=1;
 const p={after:0,mode,done:false,attempts:0};if(inTower)c.Tw.interludePending=p;else c.S.interludePending=p;
 c.launchInterlude();assert.equal(mounted.at(-1),mode);const economy=[c.S.gold,c.S.exp,c.S.gauge];finish(mode,win);
 assert.equal(p.done,win);assert.equal(p.attempts,win?0:1);assert.deepEqual([c.S.gold,c.S.exp,c.S.gauge],economy,'gates do not add monster rewards');
 if(mode==='runner'&&win)assert.deepEqual(json(c.S.seeds),{dandelion:3,daisy:2});
 if(win){c.continueInterlude();if(inTower)assert.equal(c.Tw.floor,3);else{assert.equal(c.S.interludePending,null);assert.equal(c.S.monIdx,1);}}
 else{const bag=json(c.EncounterMiniCycle.bag);c.launchInterlude();assert.equal(mounted.at(-1),mode);assert.deepEqual(json(c.EncounterMiniCycle.bag),bag);}
}
// Existing pending runner/timing saves remain playable; no rotation field is saved.
assert.ok(!Object.keys(c.S).some(k=>/Cycle|Rotation|MiniBag/.test(k)));
// A former fixed pang monster can use any game and grants the same monster reward once.
reset();c.applyTheme('river');c.S.themeId='river';c.S.monIdx=2;c.rollDrop=()=>null;
c.startEncounter();assert.ok(pool.includes(mounted.at(-1)));const m=c.curMon(),gold=c.S.gold,exp=c.S.exp;
c.miniWin('modalHost','검증');assert.equal(c.S.encounterWon,true);assert.equal(c.S.gold,gold+m.gold);assert.equal(c.S.exp,exp+m.exp);
c.advanceEncounter();assert.equal(c.S.monIdx,3);assert.equal(c.S.gold,gold+m.gold);
assert.equal(c.PANG_GOAL,28);assert.equal(c.PANG_LIMIT,75000);assert.equal(c.CARE_SECONDS,17);assert.equal(c.CARE_PASS_SCORE,65);
console.log('World 20:',world.join(' → '));console.log('Tower 20:',tower.join(' → '));
console.log('PASS: sequential travel/revisits/admin, legacy saves and EXP edges, 40 balanced selections, all 5 launch/result/retry paths in world and tower, unchanged stats and rewards.');
