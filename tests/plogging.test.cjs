// Exercise the shipped plogging rules without touching a student's save.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const nodes=new Map();let saved=0,exp=0,gauge=0,cancelled=0;
const S={modal:'pang',defeatStreak:0,encounterWon:false,gold:10,monIdx:2};
const c={S,Tw:{on:false},Pg:null,console,Date,Math,Image:class{},
  document:{baseURI:'http://localhost/',getElementById:id=>nodes.get(id)||null},
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
  off:[],raf:1,message:'',messageUntil:0,seed:1};}

let a=c.Pg=actor();
c.pangKey('ArrowRight',true); // Before the intro starts, keys do nothing.
assert.equal(a.keys.r,false);
a.started=true;c.pangKey('ArrowRight',true);
a.trash=[{kind:'bottle',x:116,y:100,dangerUntil:0}];
c.pangUpdate(34);
assert.ok(a.px>100 && a.px<112,'movement uses the existing local step');
assert.equal(a.count,1,'contact collects litter');
assert.equal(a.trash.length,0,'collected litter leaves the field');
c.pangKey('ArrowRight',false);c.pangKey('ArrowUp',true);
const oldY=a.py;c.pangUpdate(34);assert.ok(a.py<oldY,'four-way keyboard control');

a=c.Pg=actor();a.npcs=[{kind:'smoker',x:100,y:100,vx:0,vy:0,nextDrop:10,period:3000}];
c.pangUpdate(34);
assert.equal(a.trash.length,0,'smoker first pauses before dropping');
assert.equal(a.hearts,2,'collision costs one heart');
c.pangUpdate(34);assert.equal(a.hearts,2,'invulnerability prevents rapid losses');
a.px=300;a.py=100;c.pangUpdate(296);
assert.equal(a.trash[0].kind,'butt','smoker toss frame produces a cigarette butt');
a.npcs[0].x=500;a.npcs[0].y=500;a.px=a.trash[0].x;a.py=a.trash[0].y;a.inv=0;
c.pangUpdate(34);assert.equal(a.count,1,'dropped butt can later be collected');
assert.equal(a.hearts,2,'collecting a butt never costs a heart');

a=c.Pg=actor();a.npcs=[{kind:'coffee',x:600,y:600,vx:0,vy:0,nextDrop:10,period:3400}];
c.pangUpdate(34);assert.equal(a.trash.length,0,'coffee NPC pauses before dropping');
c.pangUpdate(330);assert.equal(a.trash[0].kind,'cup','coffee toss frame produces a cup');
a.px=a.trash[0].x;a.py=a.trash[0].y;c.pangUpdate(34);
assert.equal(a.count,1,'dropped cup can immediately be collected');
assert.equal(a.hearts,3,'collecting a cup never costs a heart');

a=c.Pg=actor();a.npcs=[{kind:'smoker',x:131,y:100,vx:0,vy:0,nextDrop:10000,period:3000}];
c.pangUpdate(34);assert.equal(a.hearts,3,'foot hitbox does not punish a near miss');
a.npcs[0].x=118;c.pangUpdate(34);assert.equal(a.hearts,2,'foot hitbox punishes body contact');

a=c.Pg=actor();a.npcs=[{kind:'smoker',x:300,y:300,vx:50,vy:20,nextDrop:10000,period:3000},
  {kind:'coffee',x:600,y:600,vx:-50,vy:-20,nextDrop:10000,period:3400}];
c.pangUpdate(34);
assert.ok(a.npcs[0].x>300 && a.npcs[1].x<600,'both nuisance characters patrol independently');

a=c.Pg=actor();a.trash=Array.from({length:20},(_,i)=>({kind:'paper',x:100,y:100,dangerUntil:0}));
c.pangUpdate(34);
assert.equal(a.count,20);assert.equal(a.over,true);assert.equal(S.encounterWon,true,'next encounter is unlocked');
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
console.log('PASS: movement, collection, both NPC drops and recollection, invulnerability, success/rewards, time and heart failure');
