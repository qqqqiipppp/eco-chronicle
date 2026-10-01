// Exercise the real mount, stage, prompt, answer and timer functions with disposable DOM.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const nodes=new Map(),rewards=[];
function node(){return {innerHTML:'',textContent:'',style:{},hidden:false,buttons:[],
  classList:{add(){},remove(){}},setAttribute(){},addEventListener(){},removeEventListener(){},
  contains(){return true;},querySelectorAll(){return this.buttons;}};}
const controls=node();
Object.defineProperty(controls,'innerHTML',{get(){return this.html||'';},set(html){
  this.html=html;this.buttons=Array.from(html.matchAll(/data-care-action="([^"]+)"/g),match=>
    Object.assign(node(),{dataset:{careAction:match[1]},disabled:false}));
}});
nodes.set('careControls',controls);
const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);};
let seed=90321;
const c={Math:Object.create(Math),URL,SPRITES:{},ECO_SCENES:{forest:{after:'forest.png'},ocean:{after:'ocean.png'}},
  document:{baseURI:'http://localhost/',querySelector:()=>null,addEventListener(){},removeEventListener(){}},
  $:get,sp:()=>'',S:{},Tw:{on:false},arcStop(){},releaseKeys(){},
  requestAnimationFrame:()=>1,cancelAnimationFrame(){},addEventListener(){},removeEventListener(){},
  addSeed:(id,count)=>rewards.push([id,count]),autosave(){c.saves++;},miniWin(){c.wins++;},miniLose(){c.losses++;},
  saves:0,wins:0,losses:0};
c.window=c;c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/animal-care.js'),'utf8'),c);
const original=JSON.stringify(c.CARE_STAGES);
const expected=[['feed','water','clean'],['feed','water','shade'],['water','nest','hide'],['protect','recover','enough','alternative']];
const runs=expected.map(()=>[]),choices=[];
const ids=needs=>Array.from(needs,n=>n[2]);
const buttons=()=>controls.buttons.map(b=>b.dataset.careAction);
const sorted=list=>list.slice().sort();
function checkOrder(order,want,history){
  assert.deepEqual(sorted(order),sorted(want),'all existing entries appear exactly once');
  for(let i=1;i<order.length;i++)assert.notEqual(order[i],order[i-1],'no consecutive duplicate');
  if(history.length)assert.notDeepEqual(order,history.at(-1),'previous full order cannot repeat');
  history.push(order);
}
// Ten complete plays include actual retry mounts and all automatic stage transitions.
for(let run=0;run<10;run++){
  c.animalCareMount();const a=c.Care;
  assert.equal(a.status,'ready');assert.equal(a.score,35);a.status='playing';
  let now=1000;c.careTick(a,now);
  for(let stageIndex=0;stageIndex<4;stageIndex++){
    const stage=c.CARE_STAGES[stageIndex],seconds=stageIndex===3?20:17;
    assert.equal(a.stage,stageIndex);assert.equal(a.elapsed,0);assert.equal(a.status,'playing');
    assert.equal(get('careTimer').textContent,seconds+'초');
    const order=ids(a.needs);checkOrder(order,expected[stageIndex],runs[stageIndex]);
    const actionIds=Array.from(stage.actions,x=>x[0]);
    if(stageIndex===3)checkOrder(buttons(),actionIds,choices);
    else assert.deepEqual(buttons(),actionIds,'other animals keep their button positions');
    const start=now;
    for(let prompt=0;prompt<order.length;prompt++){
      if(prompt){now=start+(seconds/order.length*prompt+0.001)*1000;c.careTick(a,now);}
      assert.equal(a.prompt,prompt);
      assert.equal(get('careNeed').innerHTML,'<span>'+a.needs[prompt][0]+'</span> '+a.needs[prompt][1]);
      const before=a.score,button=controls.buttons.find(b=>b.dataset.careAction===order[prompt]);
      c.careAnswer(a,order[prompt],button);
      assert.equal(a.score,Math.min(100,before+5));assert.equal(a.answered,true);
      c.careAnswer(a,order[prompt],button);assert.equal(a.score,Math.min(100,before+5),'one award per prompt');
    }
    now=start+(seconds+0.001)*1000;c.careTick(a,now);
    assert.equal(a.status,'lesson');assert.equal(a.lessonTime,1.5);
    now+=1501;c.careTick(a,now);
  }
  assert.equal(c.Care,null);assert.equal(a.score,100);
}
assert.equal(c.wins,10);assert.equal(c.saves,10);
assert.deepEqual(rewards,Array.from({length:10},()=>[['dandelion',3],['daisy',2]]).flat());
// Existing wrong/late penalties remain -2, independent of randomized order.
c.animalCareMount();let a=c.Care;a.status='playing';
const wrong=controls.buttons.find(b=>b.dataset.careAction!==a.needs[0][2]);
c.careAnswer(a,wrong.dataset.careAction,wrong);assert.equal(a.score,33);
c.careAnswer(a,wrong.dataset.careAction,wrong);assert.equal(a.score,33);
c.careTick(a,1000);c.careTick(a,18001);assert.equal(a.score,27);assert.equal(a.status,'lesson');
c.animalCareStop();
// Degenerate RNG still terminates and prevents an identical full order on retries.
c.Math.random=()=>0;
for(let i=0;i<4;i++){
  let previous=null,previousActions=null;
  for(let retry=0;retry<10;retry++){
    c.animalCareMount();a=c.Care;if(i)c.careSetStage(a,i);
    const order=ids(a.needs);assert.deepEqual(sorted(order),sorted(expected[i]));
    if(previous)assert.notDeepEqual(order,previous);previous=order;
    if(i===3){const actionOrder=buttons();if(previousActions)assert.notDeepEqual(actionOrder,previousActions);previousActions=actionOrder;}
    c.animalCareStop();
  }
}
assert.equal(JSON.stringify(c.CARE_STAGES),original,'stage data is never mutated');
assert.deepEqual([c.CARE_SECONDS,c.CARE_START_SCORE,c.CARE_PASS_SCORE,c.CARE_GREAT_SCORE],[17,35,65,85]);
for(let i=0;i<4;i++){
  const patterns=new Set(runs[i].map(order=>order.join(' → ')));
  assert.ok(patterns.size>1);
  console.log(c.CARE_STAGES[i].name+': 10 starts, '+patterns.size+' patterns; '+runs[i].map(order=>order.join('/')).join(', '));
}
console.log('Crab choices: 10 starts, '+new Set(choices.map(order=>order.join('/'))).size+' patterns');
console.log('PASS: all needs once, no adjacent duplicates/full-order repeats, correct prompt/answer mapping; timers, score, rewards unchanged.');
