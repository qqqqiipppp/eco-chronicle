// Exercise the shipped plogging rules without touching a student's save.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const nodes=new Map();let saved=0,exp=0,gauge=0,cancelled=0;
const S={modal:'pang',defeatStreak:0,encounterWon:false,gold:10,monIdx:2};
const c={S,Tw:{on:false},Pg:null,console,Date,Math,Image:class{},
  ECO_ART:{forest:{before:'forest.png',after:'forest.png'}},
  document:{baseURI:'http://localhost/',getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],addEventListener:()=>{},removeEventListener:()=>{}},
  addEventListener:()=>{},removeEventListener:()=>{},performance:{now:()=>10},requestAnimationFrame:()=>1,
  $:id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:''});return nodes.get(id);},
  clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),dist:(x,y,xx,yy)=>Math.hypot(x-xx,y-yy),
  cancelAnimationFrame:()=>{cancelled++;},
  curMon:()=>({gauge:5,gold:19,exp:24,after:'환경을 지켜요.'}),
  addGauge:n=>{gauge+=n;return n;},addExp:n=>{exp+=n;},rollDrop:()=>null,autosave:()=>{saved++;},
  JRO:()=>'',CUR:{name:'강',monsters:[{},{},{},{},{}]},GEAR_LABEL:{},
  miniWin:()=>{},towerRetire:()=>{}}
c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/plogging.js'),'utf8'),c);
function actor(){return {px:100,py:100,face:'south',moving:false,keys:{l:false,r:false,u:false,d:false},target:null,
  trash:[],npcs:[],count:0,hearts:3,maxHearts:3,inv:0,t:0,limit:75000,over:false,
  obstacles:[],off:[],raf:1,message:'',messageUntil:0,seed:1};}
function fieldActor(seed=1){
  const a=c.Pg=actor();a.seed=seed;a.px=340;a.py=550;
  const field=c.pangBuildField();a.obstacles=field.obstacles;a.reach=field.reach;
  a.npcs=c.pangCreateNpcs();return a;
}
function advance(ms){while(ms>0){const dt=Math.min(34,ms);c.pangUpdate(dt);ms-=dt;}}
assert.equal(c.PANG_GOAL,28,'polished collection goal is 28');
assert.equal(c.PANG_INITIAL_TRASH,32,'initial clutter is reduced to 32');
assert.equal(c.PANG_RETRY_BONUS,1,'retry help adds at most one heart');
assert.equal(c.PANG_TRASH_GAP,68,'initial litter is spaced more widely');
assert.equal(c.PANG_LIMIT,75000,'time limit remains unchanged');

let a=c.Pg=actor();
c.pangKey('ArrowRight',true); // Before the intro starts, keys do nothing.
assert.equal(a.keys.r,false);
a.started=true;c.pangKey('ArrowRight',true);
a.trash=[{kind:'bottle',x:116,y:100}];
c.pangUpdate(34);
assert.ok(a.px>100 && a.px<112,'movement uses the existing local step');
assert.equal(a.count,1,'contact collects litter');
assert.equal(a.trash.length,0,'collected litter leaves the field');
c.pangKey('ArrowRight',false);c.pangKey('ArrowUp',true);
const oldY=a.py;c.pangUpdate(34);assert.ok(a.py<oldY,'four-way keyboard control');

// Exercise real round initialization: retries are 3 -> 4 hearts, never 5.
nodes.set('pangCanvas',{getContext:()=>({}),addEventListener:()=>{},removeEventListener:()=>{}});
const originalDraw=c.pangDraw;c.pangDraw=()=>{};
for(const streak of [0,1,2,10]){
  S.defeatStreak=streak;c.mountPang();
  assert.equal(c.Pg.hearts,streak?4:3);assert.equal(c.Pg.maxHearts,streak?4:3);
  assert.equal(c.Pg.limit,75000);assert.equal(c.Pg.npcs.length,6);assert.equal(c.Pg.trash.length,32);
  assert.match(nodes.get('modalHost').innerHTML,/28개/,'intro displays the actual new goal');
}
c.pangStop();c.pangDraw=originalDraw;S.defeatStreak=0;

// Adults have a readable preparation, release and recovery; each litter cue is single-shot.
for(const [kind,timing] of Object.entries({
  smoker:{prepare:350,toss:750,release:550,duration:1100,litter:'butt'},
  coffee:{prepare:450,toss:900,release:650,duration:1250,litter:'cup'}
})){
  for(const key of ['prepare','toss','release','duration'])assert.equal(c.PANG_NPC_TIMING[kind][key],timing[key]);
  a=c.Pg=actor();const n={kind,x:600,y:600,vx:40,vy:20,nextDrop:10,period:6200};a.npcs=[n];
  c.pangUpdate(10);const start=a.t;
  const until=elapsed=>advance(elapsed-(a.t-start));
  assert.equal(c.pangNpcAction(n),'prepare');until(timing.prepare-1);assert.equal(c.pangNpcAction(n),'prepare');
  until(timing.prepare);assert.equal(c.pangNpcAction(n),'toss');
  until(timing.release-1);assert.equal(a.trash.length,0,'no litter before the release cue');
  until(timing.release);assert.equal(a.trash.length,1);assert.equal(a.trash[0].kind,timing.litter);
  until(timing.toss-1);assert.equal(c.pangNpcAction(n),'toss');
  until(timing.toss);assert.equal(c.pangNpcAction(n),'recover');
  until(timing.duration-1);assert.equal(c.pangNpcAction(n),'recover');assert.equal(a.trash.length,1,'recovery never duplicates litter');
  assert.equal(n.x,600);assert.equal(n.y,600,'all adult gestures pause patrol');
  until(timing.duration);assert.equal(n.drop,null);assert.equal(c.pangNpcAction(n),'idle');
  c.pangUpdate(34);assert.ok(n.x>600);assert.equal(c.pangNpcAction(n),'walk');
  const litter=a.trash[0];n.x=1000;n.y=1000;a.px=litter.x;a.py=litter.y;
  c.pangUpdate(34);assert.equal(a.count,1);assert.equal(a.hearts,3,kind+' litter is harmless and collectible');
}

a=c.Pg=actor();a.npcs=[{kind:'smoker',x:131,y:100,vx:0,vy:0,nextDrop:10000,period:3000}];
c.pangUpdate(34);assert.equal(a.hearts,3,'foot hitbox does not punish a near miss');
a.npcs[0].x=118;c.pangUpdate(34);assert.equal(a.hearts,2,'foot hitbox punishes body contact');

a=c.Pg=actor();a.npcs=[{kind:'coffee',x:100,y:100,vx:0,vy:0,nextDrop:10000,period:3400}];
c.pangUpdate(34);assert.equal(a.hearts,2,'coffee NPC body contact also costs one heart');
a.px=100;a.py=100;c.pangUpdate(800);assert.equal(a.hearts,2,'continuous contact remains safe during immunity');
a.px=100;a.py=100;c.pangUpdate(100);assert.equal(a.hearts,1,'contact after 900ms can cost one more heart');

a=c.Pg=actor();a.npcs=[{kind:'smoker',x:300,y:300,vx:50,vy:20,nextDrop:10000,period:3000},
  {kind:'coffee',x:600,y:600,vx:-50,vy:-20,nextDrop:10000,period:3400}];
c.pangUpdate(34);
assert.ok(a.npcs[0].x>300 && a.npcs[1].x<600,'both nuisance characters patrol independently');

// The child's three gestures finish in order; litter exists only at the toss cue.
a=c.Pg=actor();const child={kind:'child',x:600,y:600,vx:40,vy:20,nextDrop:10,period:7800};a.npcs=[child];
c.pangUpdate(10);assert.equal(c.pangNpcAction(child),'open');
advance(499);assert.equal(c.pangNpcAction(child),'open');assert.equal(a.trash.length,0);
c.pangUpdate(1);assert.equal(c.pangNpcAction(child),'eat');
advance(599);assert.equal(c.pangNpcAction(child),'eat');assert.equal(a.trash.length,0);
c.pangUpdate(1);assert.equal(c.pangNpcAction(child),'toss');
advance(249);assert.equal(a.trash.length,0,'wrapper is not spawned before the release frame');
c.pangUpdate(1);assert.equal(a.trash.length,1);assert.equal(a.trash[0].kind,'wrapper');
assert.equal(child.x,600);assert.equal(child.y,600,'all child gestures pause movement');
advance(299);assert.equal(a.trash.length,1,'one gesture produces only one wrapper');
assert.ok(child.drop,'toss continues until the final gesture frame');
c.pangUpdate(1);assert.equal(child.drop,null);assert.equal(c.pangNpcAction(child),'idle');
c.pangUpdate(34);assert.ok(child.x>600);assert.equal(c.pangNpcAction(child),'walk','patrol resumes after tossing');
const wrapper=a.trash[0];child.x=1000;child.y=1000;a.px=wrapper.x;a.py=wrapper.y;
c.pangUpdate(34);assert.equal(a.count,1);assert.equal(a.hearts,3,'wrapper collection never costs a heart');

// Exercise the renderer's real row and column choices using each shipped PNG's
// dimensions. Adult sheets have calibrated nonuniform row crops, not five equal rows.
const expectedRows={
  smoker:[[0,309],[309,601],[601,877],[877,1146],[1147,1402]],
  coffee:[[0,292],[292,573],[573,853],[853,1137],[1137,1466]]
};
const originalImage=c.pangImage,originalShadow=c.pangDrawShadow;
c.pangDrawShadow=()=>{};let renderCases=0;
for(const kind of ['smoker','coffee','child']){
  const png=fs.readFileSync(path.resolve(__dirname,'..',c.PANG_NPC_ART[kind]));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','NPC asset is a PNG');
  const img={complete:true,naturalWidth:png.readUInt32BE(16),naturalHeight:png.readUInt32BE(20)};
  if(expectedRows[kind])assert.equal(img.naturalHeight,expectedRows[kind].at(-1)[1]);
  c.pangImage=()=>img;a=c.Pg=actor();a.cx=a.cy=0;a.t=2000;
  const timing=c.PANG_NPC_TIMING[kind];
  const states=kind==='child'?[[0,null,false],[1,null,true],[2,200,false],[3,750,false],[4,1350,false]]:
    [[0,null,false],[1,null,true],[2,timing.prepare/2,false],[3,timing.release,false],[4,(timing.toss+timing.duration)/2,false]];
  for(const [row,elapsed,moving] of states)for(const [col,face] of ['south','north','west','east'].entries()){
    let draw=null;const context={fillRect:()=>{},fillText:()=>{},measureText:()=>({width:100}),drawImage:(...args)=>{draw=args;}};
    const n={kind,x:200,y:200,face,moving,stride:30,drop:elapsed===null?null:{start:a.t-elapsed,spawned:false}};
    c.pangDrawNpc(context,n);assert.ok(draw,'each NPC pose draws an image');
    const crop=expectedRows[kind]?.[row]||[row*img.naturalHeight/5,(row+1)*img.naturalHeight/5];
    assert.equal(draw[1],col*img.naturalWidth/4,'direction selects the correct column');
    assert.ok(Math.abs(draw[2]-crop[0])<1e-8,'action selects the calibrated source row');
    assert.ok(Math.abs(draw[4]-(crop[1]-crop[0]))<1e-8,'source row excludes neighboring sprites');
    const height=kind==='child'?88:104,feet=c.PANG_NPC_FEET[kind]?.[row]?.[col]||.90;
    assert.ok(Math.abs(draw[8]/draw[4]-height/(img.naturalHeight/5))<1e-8,'sprite scale is constant across actions');
    assert.ok(Math.abs(draw[6]+feet*draw[8]-n.y)<1e-8,'shoe anchor stays on the foot collision point');renderCases++;
  }
}
c.pangImage=originalImage;c.pangDrawShadow=originalShadow;
assert.equal(renderCases,60,'all 5 actions x 4 directions x 3 NPC kinds are checked');

// The floor item leaves the same side as the sprite's tossing hand: south and
// west use viewer-left, north and east use viewer-right. All twelve releases are
// reachable and harmless to collect through the shipped collection rule.
for(const kind of ['smoker','coffee','child'])for(const face of ['south','north','west','east']){
  a=fieldActor(778);a.npcs=[];const release=kind==='child'?1350:c.PANG_NPC_TIMING[kind].release;
  const n={kind,x:600,y:430,face,vx:face==='west'?-1:face==='east'?1:0,
    vy:face==='north'?-1:face==='south'?1:0,period:7800,nextDrop:1e9,drop:{start:0,spawned:false}};
  a.npcs=[n];a.t=release-34;c.pangUpdate(34);assert.equal(a.trash.length,1,kind+' '+face+' release creates one litter');
  const item=a.trash[0],sign=face==='south'||face==='west'?-1:1;
  assert.equal(item.x,n.x+sign*22,'floor litter matches the tossing hand side');assert.equal(item.y,n.y+9);
  assert.ok(c.pangAccessible(item.x,item.y),'directional release is safe and reachable');
  const far=c.pangFreePoint(1550,950);n.x=far.x;n.y=far.y;a.px=item.x;a.py=item.y;
  c.pangUpdate(34);assert.equal(a.count,1);assert.equal(a.trash.length,0);
  assert.equal(a.hearts,3,'collecting directional litter does not cause damage');
}

// Contact damage and global immunity apply to all three kinds, including two simultaneous contacts.
for(const kind of ['smoker','coffee','child']){
  a=c.Pg=actor();a.npcs=[{kind,x:100,y:100,vx:0,vy:0,nextDrop:1e9,period:7800}];
  c.pangUpdate(16);assert.equal(a.hearts,2,kind+' body costs one heart');assert.equal(a.inv,900);
  assert.equal(nodes.get('pgHearts').textContent,'❤️❤️🖤','heart HUD changes immediately');
  a.npcs.push({kind:'child',x:a.px,y:a.py,vx:0,vy:0,nextDrop:1e9,period:7800});
  c.pangUpdate(16);assert.equal(a.hearts,2,'immunity also prevents a second NPC from causing rapid damage');
}

// Only solid lower footprints collide; the whole tree canopy is not a wall.
a=fieldActor();
assert.ok(a.obstacles.length>25,'solid scenery is cached before a round');
assert.ok(a.reach.indices.length>2000,'the start connects to most of the field');
assert.ok(!a.obstacles.some(o=>['pr_flower','pr_shroom','pr_plant'].includes(o.key)),'small decoration stays passable');
const allObstacles=a.obstacles;
for(const key of ['pr_pine','pr_round','pr_rock','pr_bush','pr_log','pr_fence']){
  const obstacle=allObstacles.find(o=>o.key===key);assert.ok(obstacle,key+' is solid');
  a.obstacles=[obstacle];a.px=obstacle.left-11;a.py=(obstacle.top+obstacle.bottom)/2;
  c.pangMove(a,'px','py',100,0);
  assert.ok(a.px<=obstacle.left-10,key+' blocks horizontal movement');
  assert.ok(!c.pangBlocked(a.px,a.py,a.obstacles),key+' collision leaves feet outside the obstacle');
}
const tree=fieldActor().obstacles.find(o=>o.key==='pr_pine');
assert.equal(c.pangBlocked((tree.left+tree.right)/2,tree.top-20,[tree]),false,'space under the drawn canopy remains walkable');
a=c.Pg=actor();a.obstacles=[{left:150,right:180,top:80,bottom:220}];a.px=130;a.py=100;
c.pangMove(a,'px','py',40,40);
assert.ok(a.px<=140,'movement into the wall is blocked');assert.equal(a.py,140,'free axis slides along a wall');
a.px=139;a.py=100;a.keys.r=true;c.pangUpdate(34);
assert.equal(a.moving,false,'walking animation stops when a solid obstacle prevents all movement');
a.keys.d=true;c.pangUpdate(34);assert.ok(a.py>100,'diagonal keyboard input slides along the free axis');
assert.equal(a.px,139,'diagonal keyboard input does not enter the wall');
a.keys={l:false,r:false,u:false,d:false};
a.px=130;a.py=100;c.pangDamage('조심해요!',110,100);
assert.ok(a.px<=140,'hit knockback cannot push the player into solid scenery');
assert.ok(!c.pangBlocked(a.px,a.py,a.obstacles));
a=c.Pg=actor();a.px=25;a.py=25;c.pangMove(a,'px','py',-300,-300);
assert.equal(a.px,24);assert.equal(a.py,24,'large deltas cannot escape the map');

// Every usable lower-footprint edge must allow a free diagonal axis to slide.
a=fieldActor();let diagonalCases=0;
for(const o of a.obstacles)for(const sign of [-1,1]){
  const x=o.left-11,y=(o.top+o.bottom)/2,dy=sign*285*34/1000/Math.SQRT2;
  if(c.pangBlocked(x,y,a.obstacles)||c.pangBlocked(x,y+dy,a.obstacles))continue;
  a.px=x;a.py=y;a.keys={l:false,r:true,u:sign<0,d:sign>0};a.inv=1e9;a.trash=[];
  c.pangUpdate(34);assert.ok(!c.pangBlocked(a.px,a.py,a.obstacles),'diagonal feet stay outside scenery');
  assert.ok(sign*(a.py-y)>0,'free diagonal axis moves along scenery');diagonalCases++;
}
assert.ok(diagonalCases>=50,'diagonal sliding is checked across the field, not just one wall');

// A reproduced post-hit position just above a bush is not trapped: down is
// correctly blocked, and one right input clears the footprint for a down input.
a=fieldActor(3);a.npcs=[];a.px=623.2598075563226;a.py=865.1978868533871;a.keys.d=true;
const bushY=a.py;c.pangUpdate(33);assert.equal(a.py,bushY,'the bush blocks a direct downward input');
a.keys.d=false;a.keys.r=true;c.pangUpdate(33);assert.ok(a.moving&&a.px>632,'right input escapes the lower-footprint edge');
a.keys.r=false;a.keys.d=true;c.pangUpdate(33);assert.ok(a.moving&&a.py>874,'down input works after clearing the bush');
assert.ok(!c.pangBlocked(a.px,a.py,a.obstacles),'manual escape remains outside scenery');

// Seeded scattering and NPC litter must stay reachable, outside footprints, and spaced at startup.
for(let seed=1;seed<=20;seed++){
  a=fieldActor(seed);const kinds={smoker:0,coffee:0,child:0};a.npcs.forEach(n=>kinds[n.kind]++);
  assert.deepEqual(kinds,{smoker:2,coffee:2,child:2});assert.equal(a.npcs.length,6);
  for(const n of a.npcs){assert.ok(c.pangAccessible(n.x,n.y),'NPC starts on reachable ground');
    assert.ok(Math.hypot(n.vx,n.vy)<285,'NPC speed stays below the unchanged player speed');}
  c.pangScatter();assert.equal(a.trash.length,32,'seed '+seed+' generates all 32 initial collectibles');
  const sectors=Array(6).fill(0);
  for(const item of a.trash){
    sectors[Math.min(2,Math.floor(item.x/(c.PANG_FIELD_W/3)))+3*Math.min(1,Math.floor(item.y/(c.PANG_FIELD_H/2)))]++;
    assert.ok(!c.pangBlocked(item.x,item.y,a.obstacles,5),'litter is outside solid hitboxes');
    assert.ok(c.pangAccessible(item.x,item.y),'litter is reachable from the spawn');
    assert.ok(Math.hypot(item.x-a.px,item.y-a.py)>=130,'starting litter does not collect itself');
    assert.ok(a.npcs.every(n=>Math.hypot(item.x-n.x,item.y-n.y)>=48),'starting litter is not hidden under an NPC');
  }
  assert.ok(sectors.every(n=>n>=4),'all six field sectors contain initial litter');
  for(let i=0;i<a.trash.length;i++)for(let j=i+1;j<a.trash.length;j++)
    assert.ok(Math.hypot(a.trash[i].x-a.trash[j].x,a.trash[i].y-a.trash[j].y)>=68,'initial litter spacing');
  a.trash=[];
  for(const o of a.obstacles){const item=c.pangTrash('wrapper',(o.left+o.right)/2,(o.top+o.bottom)/2);
    assert.ok(item,'litter falling on scenery finds a nearby safe spot');assert.ok(c.pangAccessible(item.x,item.y));}
}
a=c.Pg=actor();for(let i=0;i<90;i++)c.pangTrash('wrapper',400,400);
assert.equal(a.trash.length,75,'the litter cap remains 75');

// Simulate one full 75-second round at production frame deltas: six independent patrols,
// scenery avoidance, pair separation, and safe drops with no extra animation loops.
a=fieldActor(8841);a.inv=1e9;a.limit=1e9;
const travel=Array(6).fill(0);let drops=0,minSeparation=Infinity;
for(let elapsed=0;elapsed<75000;elapsed+=34){
  const before=a.npcs.map(n=>({x:n.x,y:n.y}));c.pangUpdate(34);
  for(let i=0;i<a.npcs.length;i++){
    const n=a.npcs[i];travel[i]+=Math.hypot(n.x-before[i].x,n.y-before[i].y);
    assert.ok(!c.pangBlocked(n.x,n.y,a.obstacles),'patrol feet never enter a scenery hitbox');
    assert.ok(n.x>=24&&n.x<=c.PANG_FIELD_W-24&&n.y>=24&&n.y<=c.PANG_FIELD_H-24,'NPC stays in bounds');
    for(let j=i+1;j<a.npcs.length;j++){
      const other=a.npcs[j],separation=Math.pow((n.x-other.x)/38,2)+Math.pow((n.y-other.y)/27,2);
      minSeparation=Math.min(minSeparation,separation);assert.ok(separation>=1-1e-10,'NPC bodies do not collapse together');
    }
  }
  for(const item of a.trash){assert.ok(c.pangAccessible(item.x,item.y),'patrol drops remain collectible');drops++;}
  a.trash=[];a.count=0;
}
assert.ok(travel.every(v=>v>2500),'all six NPCs patrol substantially during a round');
assert.ok(drops>=40,'NPCs keep adding collectible litter');
console.log('75s patrol: travel(px)='+travel.map(Math.round).join(',')+'; drops='+drops+'; min separation='+minSeparation.toFixed(3));

// Six NPCs stay inside the existing single capped simulation/render callback.
a=fieldActor();a.last=0;let scheduled=0;
const originalRaf=c.requestAnimationFrame;c.requestAnimationFrame=()=>++scheduled;c.pangDraw=()=>{};
c.pangStep(1000);assert.equal(a.t,34,'a delayed frame is still capped at 34ms');assert.equal(scheduled,1);
for(let i=1;i<=10;i++)c.pangStep(1000+i*16);
assert.equal(scheduled,11,'one callback is scheduled per frame, independent of NPC count');
c.pangStop();assert.equal(a.raf,null,'round cleanup clears the scheduled frame');
c.requestAnimationFrame=originalRaf;c.pangDraw=originalDraw;

a=c.Pg=actor();a.trash=Array.from({length:20},()=>({kind:'paper',x:100,y:100}));
c.pangUpdate(34);
assert.equal(a.count,20);assert.equal(a.over,false,'the previous 20-item goal no longer finishes the game');
a.trash=Array.from({length:7},()=>({kind:'paper',x:100,y:100}));c.pangUpdate(34);
assert.equal(a.count,27);assert.equal(a.over,false,'goal minus one remains in play');
a.trash=[{kind:'paper',x:100,y:100}];c.pangUpdate(34);
assert.equal(a.count,28);assert.equal(a.over,true);assert.equal(S.encounterWon,true,'next encounter is unlocked');
assert.equal(S.gold,29);assert.equal(exp,24);assert.equal(gauge,5);assert.equal(saved,1,'original reward and save run once');
assert.match(nodes.get('pgResult').innerHTML,/플로킹 성공!/);
c.pangWin();assert.equal(saved,1,'reward cannot be claimed twice');

a=c.Pg=actor();S.encounterWon=false;a.t=74990;
c.pangUpdate(34);assert.equal(a.over,true);assert.equal(S.defeatStreak,1);
assert.match(nodes.get('pgResult').innerHTML,/조금 아쉬워요!/);

a=c.Pg=actor();S.defeatStreak=0;
c.pangDamage('조심해요!',100,100);assert.equal(a.hearts,2);
c.pangDamage('조심해요!',100,100);assert.equal(a.hearts,2);
a.inv=0;c.pangDamage('조심해요!',100,100);a.inv=0;c.pangDamage('조심해요!',100,100);
assert.equal(a.over,true);assert.match(nodes.get('pgResult').innerHTML,/방해를 너무 많이 받았어요!/);
assert.ok(cancelled>=3,'finished games stop their animation frame');

// Reuse the browser fixture's actual obstacle-only route walker. This is a rule
// and reachability simulation, not a measurement of children's manual difficulty.
const fixtureSource=fs.readFileSync(path.join(__dirname,'serve-movement.cjs'),'utf8');
vm.runInContext('let route=null,routeItem=null;'+fixtureSource.slice(
  fixtureSource.indexOf('    function gridNode'),fixtureSource.indexOf("    button('test route play")),c);
function routeRound(seed,protectedMode=false,initialLimit=32,pattern=[1000/30]){
  a=fieldActor(seed);a.started=true;a.inv=protectedMode?1e9:0;c.pangScatter();a.trash=a.trash.slice(0,initialLimit);
  S.defeatStreak=0;S.encounterWon=false;
  const initial=new Set(a.trash),initialCount=a.trash.length;let stuck=0,deadlocks=0,frame=0;
  vm.runInContext('route=null;routeItem=null;',c);
  while(!a.over&&a.t<c.PANG_LIMIT){
    const x=a.px,y=a.py,dt=pattern[frame++%pattern.length];c.autoTarget();c.pangUpdate(dt);
    assert.ok(!c.pangBlocked(a.px,a.py,a.obstacles),'route feet stay outside scenery');
    if(a.target&&Math.hypot(a.px-x,a.py-y)<.01){stuck+=dt;if(stuck>=2000&&stuck-dt<2000)deadlocks++;}
    else stuck=0;
  }
  const fromNPC=a.count-(initialCount-a.trash.filter(item=>initial.has(item)).length);
  return {seed,time:+(a.t/1000).toFixed(3),count:a.count,hearts:a.hearts,win:a.count>=c.PANG_GOAL,deadlocks,fromNPC};
}
const normalRoutes=[],protectedRoutes=[];
for(let seed=1;seed<=20;seed++){
  const normal=routeRound(seed),protectedResult=routeRound(seed,true);
  assert.equal(normal.deadlocks,0,'normal route has no two-second movement deadlock');
  assert.equal(protectedResult.deadlocks,0);assert.ok(protectedResult.win,'goal is reachable with NPC litter and no body-contact penalty');
  normalRoutes.push(normal);protectedRoutes.push(protectedResult);
}
const wins=normalRoutes.filter(r=>r.win),times=wins.map(r=>r.time).sort((x,y)=>x-y);
assert.ok(wins.length>=18,'obstacle-only walker can finish most seeds with the normal three hearts');
assert.ok(wins.every(r=>r.fromNPC>0),'normal route uses collectable NPC litter');
const refillRoutes=[1,2,3].map(seed=>routeRound(seed,true,8));
assert.ok(refillRoutes.every(r=>r.win&&r.fromNPC>=20&&r.deadlocks===0),'continuous NPC litter can replenish a sparse field to the full goal');
// These frame patterns reproduced a stale-route stall after an NPC knocked the
// test walker toward the bush. Replanning from the actual foot box must recover.
const variableRoutes=[[32],[33],[34],[33,34,32],[34,34,1],[32.5,33.7],[34,14]].map(pattern=>({
  pattern,...routeRound(3,false,32,pattern)
}));
assert.ok(variableRoutes.every(r=>r.win&&r.deadlocks===0),'the test walker recovers after knockback at variable frame intervals');
console.log('30Hz obstacle-only routes: '+JSON.stringify({
  normal:normalRoutes,protectedWins:protectedRoutes.filter(r=>r.win).length,
  meanWinSeconds:+(times.reduce((sum,n)=>sum+n,0)/times.length).toFixed(3),
  medianWinSeconds:times[Math.floor(times.length*.5)],p95WinSeconds:times[Math.floor(times.length*.95)],
  sparseFieldRefill:refillRoutes,variableFrameSeed3:variableRoutes
}));
console.log('PASS: goal28/initial32/retry+1; adult prepare/toss/recover and child open/eat/toss; 6 NPCs; safe litter over20 seeds; '+diagonalCases+' diagonal edges; 75s patrol; unchanged rewards/time/heart failure');
