// Uses the real combat functions in an isolated VM; no browser/student storage.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let tasks=[];
const c={console,Math:Object.create(Math),Date,Map,Set,Uint8Array,performance:{now:()=>0},
  document:{getElementById:()=>null,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},
  addEventListener(){},setTimeout(fn){tasks.push(fn);return tasks.length;},clearTimeout(){},setInterval(){},clearInterval(){},
  requestAnimationFrame(){},cancelAnimationFrame(){},SPRITES:{},Image:class{},navigator:{}};
c.window=c;vm.createContext(c);
for(const file of ['gear-data','npc-data','map-utils','theme-data','learning-data','equipment-ui','ecotech-exploration','ecotech','tower-elites'])vm.runInContext(read('js/'+file+'.js'),c);
const source=read('js/game.js');vm.runInContext(source.slice(0,source.lastIndexOf('try {\n  S=newState();')),c);
const elites=vm.runInContext('TOWER_ELITES',c);
for(const fn of ['playSfx','bgmUpdate','paintBattle','bpop','banim','btag','fx','towerElitePose','showLose','showLvUp','toast'])c[fn]=()=>{};
c.legendOf=()=>null;c.petStrong=()=>false;c.strike=(who,fx,cb)=>cb?.();
c.winBattle=()=>{c.B.over=true;c.B.win=true;};
function flush(){let n=0;while(tasks.length){if(++n>200)throw Error('timer loop');tasks.shift()();}}
function start(id,seed=1){
  tasks=[];let rng=seed;c.Math.random=()=>((rng=(rng*1664525+1013904223)>>>0)/4294967296);
  c.S=c.newState();c.S.petKey='earth';c.S.lv=10;c.S.hpCur=10000;c.S.spCur=50;c.applyTheme('forest');
  const e=elites.find(e=>e.id===id);c.Tw.on=true;c.Tw.floor=e.floor;c.Tw.mon=c.towerEliteMonster(e,'forest');
  c.initBattle();flush();Object.assign(c.B,{hp:10000,hpMax:10000,sp:50,spMax:50,atk:55,def:20,busy:false});return c.B;
}
function act(id='atk'){c.bSkill(id);flush();}
assert.deepEqual(Array.from(elites,e=>e.id),['leftovers','disposables','algae','nightglare','glasswall','powerstrip','poacher','carbon']);
const legacy=[['leftovers',4,108,19,18,20],['disposables',11,222,33,39,48],['algae',18,337,47,60,76],['powerstrip',25,450,60,81,104],['poacher',32,557,73,102,132],['carbon',39,684,87,123,160]];
for(const [id,floor,hp,atk,exp,gold] of legacy){const e=elites.find(e=>e.id===id);assert.deepEqual([e.floor,e.hp,e.atk,e.exp,e.gold],[floor,hp,atk,exp,gold]);}
for(const e of elites){assert.equal(c.floorKind(e.floor),'battle');assert.equal(c.towerEliteForFloor(e.floor).id,e.id);}
let b=start('nightglare');b.ehp=b.ehpMax=100000;
act();assert.equal(b.glare,undefined);assert.equal(b.elite.glare,0);
act();assert.equal(b.elite.glare,2);act();assert.equal(b.elite.glare,1);act();assert.equal(b.elite.glare,0);assert.equal(b.elite.dim,2);
b.sp=0;act();assert.equal(b.sp,1);assert.equal(b.elite.dim,1);act();assert.equal(b.sp,2);assert.equal(b.elite.dim,0);act();assert.equal(b.sp,4);
for(const id of ['nightglare','glasswall']){
  b=start(id);let last=0;
  for(let turn=1;turn<=40;turn++){b.turn=turn;const move=c.towerEliteMove();assert.ok(!(last&&move),'specials separated by a normal turn');last=move;}
}
b=start('glasswall');b.ehp=b.ehpMax=100000;act();act();assert.equal(b.elite.reflection,2);act();assert.equal(b.elite.reflection,1);act();assert.equal(b.elite.reflection,0);assert.equal(b.elite.barrier,2);act();assert.equal(b.elite.barrier,1);act();assert.equal(b.elite.barrier,0);
// Exact damage ratios with rounding, and the reflection chance never causes a miss.
for(const [id,effect,mult] of [['nightglare','glare',.85],['glasswall','barrier',.8],['glasswall','reflection',.75]]){
  b=start(id);b.atk=100;b.edr=0;b.ehp=1000;b.elite[effect]=2;c.Math.random=()=>0;
  c.bSkill('atk');assert.equal(1000-b.ehp,Math.max(1,Math.round(99*mult)));tasks=[];
}
// Paired seeded trials of real bSkill/enemyTurn, same player and decisions for every enemy.
const results=[];
for(const policy of ['basic','mixed'])for(const e of elites){
  let damage=0,turns=0;
  for(let seed=1;seed<=100;seed++){
    b=start(e.id,seed);let n=0;
    while(!b.over&&++n<100)act(policy==='mixed'&&b.sp>=11&&!b.elite.trap?'strike':'atk');
    assert.ok(b.win,e.id+' terminates');damage+=10000-b.hp;turns+=n;
  }
  results.push({policy,id:e.id,damage:damage/100,turns:turns/100});
}
for(const policy of ['basic','mixed']){
  const r=results.filter(r=>r.policy===policy);
  for(let i=1;i<r.length;i++)assert.ok(r[i].damage>r[i-1].damage,JSON.stringify(r));
}
console.log(JSON.stringify(results,null,2));
console.log('PASS: 8 fixed ranks, original six stats/rewards unchanged, tower floors, effect expiry, no adjacent specials, exact damage reductions and SP recovery, seeded real-combat ranking.');
