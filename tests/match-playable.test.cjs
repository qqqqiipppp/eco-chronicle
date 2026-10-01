const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/game.js'),'utf8');
const nodes=new Map(),timers=[];
const get=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',style:{},querySelectorAll:()=>[]});return nodes.get(id);};
let seed=83149;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const c={Math:Object.create(Math),S:{defeatStreak:0},$:get,curMon:()=>({name:'test'}),
  playSfx(){},setTimeout:fn=>timers.push(fn),miniWin:()=>c.wins++,miniLose:()=>c.losses++,wins:0,losses:0};
c.Math.random=random;vm.createContext(c);
vm.runInContext(source.slice(source.indexOf('var Mt=null;'),source.indexOf('var Rn=null;')),c);
// Independent oracle: scan complete rows/columns, and swap cloned boards.
function matches(g){
  for(let axis=0;axis<2;axis++)for(let line=0;line<6;line++){
    let previous=-1,run=0;
    for(let step=0;step<6;step++){
      const value=g[axis?step*6+line:line*6+step];
      run=value>=0&&value===previous?run+1:1;previous=value;
      if(value>=0&&run>=3)return true;
    }
  }
  return false;
}
function valid(g){
  for(let a=0;a<36;a++)for(const b of [a%6<5?a+1:-1,a<30?a+6:-1]){
    if(b<0)continue;
    const copy=Array.from(g);[copy[a],copy[b]]=[copy[b],copy[a]];
    if(matches(copy))return true;
  }
  return false;
}
function playable(g){
  assert.equal(g.length,36);assert.ok(Array.from(g).every(v=>Number.isInteger(v)&&v>=0&&v<6));
  assert.equal(matches(g),false,'no ready-made matches');assert.equal(valid(g),true,'at least one valid swap');
  const before=Array.from(g);assert.equal(c.mtHasValidMove(g),true);assert.deepEqual(Array.from(g),before,'move detection restores every tile');
}
for(let i=0;i<1000;i++){
  c.S.defeatStreak=i%4;c.mountMatch();playable(c.Mt.g);
  assert.equal(c.Mt.need,30-(i%4)*4);assert.equal(c.Mt.moves,30+(i%4)*6);assert.equal(c.Mt.done,0);
}
const dead=Array.from({length:36},(_,i)=>(Math.floor(i/6)+2*(i%6))%6);
assert.equal(matches(dead),false);assert.equal(valid(dead),false);
assert.equal(c.mtHasValidMove(dead),false);assert.deepEqual(dead,Array.from({length:36},(_,i)=>(Math.floor(i/6)+2*(i%6))%6));
c.Mt={g:dead.slice(),sel:2,done:4,need:30,moves:29,busy:true,over:false};
c.mtResolve();playable(c.Mt.g);
assert.equal(c.Mt.done,4);assert.equal(c.Mt.moves,29);assert.equal(c.Mt.sel,null);assert.equal(c.Mt.busy,false);
assert.equal(get('mtMsg').textContent,'가능한 조합이 없어 다시 섞어요!');
assert.deepEqual(Array.from(c.Mt.g).sort(),dead.slice().sort(),'normal shuffle preserves tiles');
// Real clear/refill/settle chain: refill the cleared top row into a dead board.
c.Mt={g:dead.slice(),sel:null,done:0,need:30,moves:29,busy:true,over:false};
c.Mt.g[0]=c.Mt.g[1]=c.Mt.g[2]=0;
let draws=0;c.Math.random=()=>draws<4?dead[draws++]/6:random();
c.mtResolve();while(timers.length)timers.shift()();playable(c.Mt.g);
assert.equal(c.Mt.done,4);assert.equal(c.Mt.moves,29);assert.equal(c.Mt.busy,false);
assert.equal(get('mtMsg').textContent,'가능한 조합이 없어 다시 섞어요!');
// Degenerate random sources force both bounded retry limits and safe creation.
for(const value of [0,.999999]){
  let calls=0;c.Math.random=()=>{assert.ok(++calls<10000,'generation must terminate');return value;};
  playable(c.mtCreatePlayableBoard());
  calls=0;c.Mt={g:dead.slice(),done:7,moves:12};c.mtShuffle();playable(c.Mt.g);
  assert.equal(c.Mt.done,7);assert.equal(c.Mt.moves,12);
}
// Finishing a game must use the original result path before shuffling.
c.Mt={g:dead.slice(),done:30,need:30,moves:0,over:false};c.mtResolve();assert.equal(c.wins,1);assert.equal(c.losses,0);
c.Mt={g:dead.slice(),done:29,need:30,moves:0,over:false};c.mtResolve();assert.equal(c.losses,1);
console.log('PASS: 1000 initial boards, 0 dead/ready-match boards; dead-board shuffle, post-clear shuffle, bounded fallbacks, unchanged counters/results.');
