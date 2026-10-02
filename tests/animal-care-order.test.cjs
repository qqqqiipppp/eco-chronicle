// Real care lifecycle, gesture handlers, and motion math with disposable DOM/time.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let now=0,seed=90321;const nodes=new Map(),rewards=[];
function node(){return {innerHTML:'',textContent:'',style:{},hidden:false,buttons:[],dataset:{},handlers:{},clientWidth:144,
 classList:{add(){},remove(){},contains:()=>false},setAttribute(){},
 addEventListener(k,fn){this.handlers[k]=fn;},removeEventListener(k){delete this.handlers[k];},contains:()=>true,
 querySelectorAll(){return this.buttons;},hasAttribute(k){return k==='data-care-action'&&!!this.dataset.careAction;},closest(){return this;}};}
const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);};
const controls=get('careControls');
Object.defineProperty(controls,'innerHTML',{get(){return this.html||'';},set(html){
 this.html=html;this.buttons=Array.from(html.matchAll(/data-care-action="([^"]+)"/g),m=>Object.assign(node(),{dataset:{careAction:m[1]},disabled:true}));
}});
const actor=get('careAnimal'),sprite=node();sprite.classList.contains=k=>k==='care-pixel';actor.querySelector=()=>sprite;
actor.getBoundingClientRect=()=>({left:205,bottom:270,width:190});
actor.parentElement={getBoundingClientRect:()=>({left:0,width:600}),querySelector:()=>Object.assign(node(),{getBoundingClientRect:()=>({left:90,bottom:279,width:74})})};
const c={Math:Object.create(Math),performance:{now:()=>now,timeOrigin:0},URL,SPRITES:{},ECO_SCENES:{forest:{after:'forest.png'},ocean:{after:'ocean.png'}},
 document:{baseURI:'http://localhost/',querySelector:()=>null,addEventListener(){},removeEventListener(){}},
 $:get,sp:()=>'',S:{},Tw:{on:false},arcStop(){},releaseKeys(){},
 requestAnimationFrame:()=>1,cancelAnimationFrame(){},addEventListener(){},removeEventListener(){},
 addSeed:(id,n)=>rewards.push([id,n]),autosave(){c.saves++;},miniWin(){c.wins++;},miniLose(){c.losses++;},saves:0,wins:0,losses:0};
c.window=c;c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/animal-care.js'),'utf8'),c);
const original=JSON.stringify(c.CARE_STAGES),expected=[['feed','water','clean'],['feed','water','shade'],['water','nest','hide'],['protect','recover','enough','alternative']];
const runs=expected.map(()=>[]),timings=[],windows=[],stageDurations=[],motions=new Set();
const ids=needs=>Array.from(needs,n=>n[2]);
function advance(ms){const end=now+ms;while(now<end){now=Math.min(end,now+10);if(c.Care)c.careTick(c.Care,now);}}
function until(test){for(let n=0;n<10000;n++){if(test())return;advance(10);}throw Error('timeout');}
function start(){c.animalCareMount();c.Care.status='playing';c.careTick(c.Care,now);return c.Care;}
function input(a,key=a.needs[a.prompt][2],override={}){
 const b=controls.buttons.find(b=>b.dataset.careAction===key);
 c.careAnswer(a,key,b,Object.assign({token:a.inputToken,startedAt:now,clickedAt:now},override));return b;
}
function checkSequence(i,order){
 assert.equal(order.length,expected[i].length+3);
 const counts=expected[i].map(key=>order.filter(x=>x===key).length);
 assert(Math.max(...counts)-Math.min(...counts)<=1);
 for(let n=1;n<order.length;n++)assert.notEqual(order[n],order[n-1]);
 for(let size=2;size<=3;size++)for(let n=0;n+2*size<=order.length;n++)assert.notDeepEqual(order.slice(n,n+size),order.slice(n+size,n+size*2));
 if(runs[i].length)assert.notDeepEqual(order,runs[i].at(-1));runs[i].push(order);
}
// 20 actual complete plays regenerate every stage (80 measured sequences).
for(let run=0;run<20;run++){
 const a=start(),begin=now;assert.equal(a.score,35);
 for(let i=0;i<4;i++){
  until(()=>a.stage===i&&a.status==='playing');checkSequence(i,ids(a.needs));const stageStart=now;
  for(let p=0;p<a.needs.length;p++){
   assert.equal(a.prompt,p);assert(!a.inputReady);const pre=a.score;input(a);assert.equal(a.score,pre,'pre-display gesture ignored');
   until(()=>a.inputReady);windows.push(a.responseSeconds);
   advance(Math.min(900+c.Math.random()*600,(a.promptEndsAt-a.elapsed)*1000-40));
   const before=a.score;input(a);assert.equal(a.score,Math.min(100,before+5));assert(a.motion);
   motions.add(c.CARE_STAGES[i].id+':'+a.needs[p][2]+':'+a.motion.kind);
   assert(controls.buttons.every(b=>b.disabled));input(a);assert.equal(a.score,Math.min(100,before+5));
   const token=a.inputToken;advance(400);assert.equal(a.inputToken,token,'no new prompt during action');assert.notEqual(actor.style.transform,'');
   until(()=>!a.motion);assert.equal(actor.style.transform,'');assert.equal(sprite.style.transform,'');
   if(p<a.needs.length-1)assert.equal(a.prompt,p+1);
  }
  assert.equal(a.status,'lesson');stageDurations.push((now-stageStart)/1000);advance(1510);
 }
 assert.equal(c.Care,null);assert.equal(a.score,100);timings.push((now-begin)/1000);
 c.careFinish(a);assert.equal(c.wins,run+1,'no duplicate rewards');
}
assert.equal(c.saves,20);assert.deepEqual(rewards,Array.from({length:20},()=>[['dandelion',3],['daisy',2]]).flat());
for(let i=0;i<4;i++)assert(new Set(runs[i].map(x=>x.join('/'))).size>=7,'enough sequence variety');
// First wrong input consumes the request; cannot rescue it by spraying other buttons.
let a=start();until(()=>a.inputReady);const wrong=controls.buttons.find(b=>b.dataset.careAction!==a.needs[0][2]).dataset.careAction;
input(a,wrong);assert.equal(a.score,33);input(a);assert.equal(a.score,33);assert(controls.buttons.every(b=>b.disabled));
const oldToken=a.inputToken;until(()=>a.inputToken!==oldToken);until(()=>a.inputReady);input(a,undefined,{token:oldToken});assert.equal(a.score,33,'stale token ignored');
input(a,undefined,{startedAt:a.inputOpenedAt-1});assert.equal(a.score,33,'queued old gesture ignored');
// Real pointerdown/click listeners and the quiet-time gate.
let b=controls.buttons.find(b=>b.dataset.careAction===a.needs[a.prompt][2]);const root=get('careRoot');
function dispatch(k,button,stamp=now){root.handlers[k]({target:button,timeStamp:stamp});}
dispatch('click',b);assert.equal(a.score,33,'click without a fresh pointer/key gesture ignored');
dispatch('pointerdown',b);dispatch('click',b);assert.equal(a.score,38);const handled=a.prompt;
for(let n=0;n<85;n++){for(const button of controls.buttons){dispatch('pointerdown',button);dispatch('click',button);}advance(20);}
assert.equal(a.prompt,handled+1);assert(!a.answered&&!a.inputReady,'spam cannot pre-answer the next request');
advance(200);assert(a.inputReady);input(a);assert.equal(a.score,43);
// Pause preserves motion progress and invalidates the pre-pause gesture.
advance(100);const age=a.motion.age,elapsed=a.elapsed;c.carePause(a,true);advance(500);assert.equal(a.motion.age,age);assert.equal(a.elapsed,elapsed);
c.carePause(a,false);advance(40);assert(a.motion.age>age);c.animalCareStop();assert.equal(a.motion,null);assert.equal(Object.keys(root.handlers).length,0);
// All timeouts offer exactly 25 requests; failure/economy stays unchanged.
a=start();let total=1,last=a.inputToken;const began=now;
while(c.Care){advance(10);if(a.inputToken!==last){total++;last=a.inputToken;}}
assert.equal(total,25);assert.equal(c.losses,1);assert.equal(c.saves,20);assert(now-began<=77000,'no longer than legacy 77s');
// Same score thresholds and payouts, including a non-great success.
for(const score of [64,65,84,85]){a=start();a.score=score;const n=rewards.length;c.careFinish(a);c.careFinish(a);assert.equal(rewards.length-n,score<65?0:2);if(score>=65)assert.deepEqual(rewards.slice(-2),[['dandelion',score>=85?3:2],['daisy',score>=85?2:1]]);}
// Constant RNG fallback is bounded and still changes the entire sequence.
c.Math.random=()=>0;for(let i=0;i<4;i++)for(let n=0;n<20;n++){
 a=start();if(i)c.careSetStage(a,i);const order=ids(a.needs);checkSequence(i,order);c.animalCareStop();
}
assert.equal(JSON.stringify(c.CARE_STAGES),original,'species, educational content, actions, and stage data unchanged');
assert.deepEqual([c.CARE_SECONDS,c.CARE_START_SCORE,c.CARE_PASS_SCORE,c.CARE_GREAT_SCORE],[17,35,65,85]);
console.log(JSON.stringify({sequences:runs.map((r,i)=>({animal:c.CARE_STAGES[i].name,count:r.length,unique:new Set(r.map(x=>x.join('/'))).size})),events:[6,6,6,7],motions:[...motions],meanSeconds:timings.reduce((a,b)=>a+b)/timings.length,maxSeconds:Math.max(...timings),meanResponseSeconds:windows.reduce((a,b)=>a+b)/windows.length,maxStageSeconds:Math.max(...stageDurations)},null,2));
console.log('PASS: balanced +3 sequences, no adjacent/ABAB/ABCABC/retry repeats; actual motion/return/pause; first-input-only, stale/queued/held spam rejection; all 25 timeouts, unchanged score thresholds, education and single rewards.');
