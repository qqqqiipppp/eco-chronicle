const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/game.js'),'utf8');
// Default execution is the full audit; --focused also runs every targeted regression.
const focused=process.argv.includes('--focused'),initialBoards=focused?5:1000,stableRandomBoards=focused?20:5000;
const nodes=new Map(),timers=[];
let timerId=0;
// Small DOM model: real game render/click handlers run here, with element identity preserved.
class Element{
  constructor(tag='div'){
    this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;
    this.dataset={};this.style={};this.listeners={};this.textContent='';this.disabled=false;
    this._html='';this.className='';this.attributes={};
  }
  set innerHTML(value){
    this._html=value;for(const child of this.children)child.parentNode=null;this.children=[];
    if(this.id==='modalHost')for(const match of value.matchAll(/id="([^"]+)"/g)){
      const node=new Element();node.id=match[1];node.parentNode=this;nodes.set(node.id,node);this.children.push(node);
    }
  }
  get innerHTML(){return this._html;}
  appendChild(node){node.parentNode=this;this.children.push(node);return node;}
  append(...children){children.forEach(child=>this.appendChild(child));}
  replaceChildren(...children){this.innerHTML='';this.append(...children);}
  get childElementCount(){return this.children.length;}
  get firstChild(){return this.children[0]||null;}
  get parentElement(){return this.parentNode;}
  get isConnected(){return this.id==='modalHost'||!!this.parentNode?.isConnected;}
  contains(node){return node===this||this.children.some(child=>child.contains(node));}
  querySelectorAll(selector){
    const result=[];for(const child of this.children){
      if(selector==='button'&&child.tagName==='BUTTON')result.push(child);
      result.push(...child.querySelectorAll(selector));
    }return result;
  }
  addEventListener(type,listener){(this.listeners[type]??=[]).push(listener);}
  setAttribute(name,value){this.attributes[name]=String(value);if(name==='class')this.className=String(value);}
  removeAttribute(name){delete this.attributes[name];}
  emit(type,extra={}){
    const event={target:this,currentTarget:this,detail:0,preventDefault(){},stopPropagation(){},...extra};
    if(type==='click')this.onclick?.(event);
    for(const listener of this.listeners[type]||[])listener(event);
  }
  click(){if(!this.disabled)this.emit('click');}
}
const get=id=>{if(!nodes.has(id)){const node=new Element();node.id=id;nodes.set(id,node);}return nodes.get(id);};
let seed=83149;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const c={Math:Object.create(Math),S:{defeatStreak:0,modal:'match'},$:get,curMon:()=>({name:'test'}),
  document:{createElement:tag=>new Element(tag),getElementById:id=>nodes.get(id)||null},
  playSfx(){},setTimeout(fn){const id=++timerId;timers.push({id,fn});return id;},
  clearTimeout(id){const index=timers.findIndex(timer=>timer.id===id);if(index>=0)timers.splice(index,1);},
  miniWin:()=>c.wins++,miniLose:()=>c.losses++,wins:0,losses:0};
c.Math.random=random;vm.createContext(c);
vm.runInContext(source.slice(source.indexOf('var Mt=null;'),source.indexOf('var Rn=null;')),c);
const adjacent=[];
for(let a=0;a<36;a++)for(const b of [a%6<5?a+1:-1,a<30?a+6:-1])if(b>=0)adjacent.push([a,b]);
assert.equal(adjacent.length,60);
// Independent oracle scans whole runs instead of using the game's match detector.
function matchIndices(g){
  const hit=new Set();
  for(let axis=0;axis<2;axis++)for(let line=0;line<6;line++){
    let start=0;
    while(start<6){
      const at=step=>axis?step*6+line:line*6+step,value=g[at(start)];let end=start+1;
      while(end<6&&g[at(end)]===value)end++;
      if(value>=0&&end-start>=3)for(let step=start;step<end;step++)hit.add(at(step));
      start=end;
    }
  }return [...hit].sort((a,b)=>a-b);
}
const matches=g=>matchIndices(g).length>0;
function oracleMoves(g){
  const result=[];
  for(const [a,b] of adjacent){
    if(g[a]<0||g[b]<0||g[a]===g[b])continue;
    const copy=Array.from(g);[copy[a],copy[b]]=[copy[b],copy[a]];
    if(matchIndices(copy).some(i=>i===a||i===b))result.push([a,b]);
  }return result;
}
const moveKey=pair=>Array.from(pair).sort((a,b)=>a-b).join(':');
const moveKeys=moves=>Array.from(moves,moveKey).sort();
function playable(g){
  assert.equal(g.length,36);assert.ok(Array.from(g).every(v=>Number.isInteger(v)&&v>=0&&v<6));
  assert.equal(matches(g),false,'no ready-made matches');assert.ok(oracleMoves(g).length,'at least one valid swap');
  const before=Array.from(g);assert.equal(c.mtHasValidMove(g),true);
  assert.deepEqual(moveKeys(c.mtGetValidMoves(g)),moveKeys(oracleMoves(g)));
  assert.deepEqual(Array.from(g),before,'move detection restores every tile');
  // Execute every detected move through the production swap function.
  for(const [a,b] of c.mtGetValidMoves(g)){
    assert.equal(c.mtSwapTiles(a,b,g),true);assert.ok(matchIndices(g).some(i=>i===a||i===b));
    assert.equal(c.mtSwapTiles(b,a,g),true);assert.deepEqual(Array.from(g),before);
  }
}
function domMatchesBoard(){
  const buttons=get('mtGrid').querySelectorAll('button');assert.equal(buttons.length,36);
  buttons.forEach((button,index)=>{
    assert.equal(+button.dataset.i,index);assert.equal(+button.dataset.row,Math.floor(index/6));
    assert.equal(+button.dataset.col,index%6);assert.equal(+button.dataset.type,c.Mt.g[index]);
    assert.equal(button.textContent,c.Mt.g[index]<0?'':c.MT_ICONS[c.Mt.g[index]],`visible tile ${index}`);
    assert.equal(button.disabled,!!(c.Mt.busy||c.Mt.over||c.Mt.g[index]<0));
  });return buttons;
}
function state(g,extra={},fresh=false){
  timers.length=0;c.S.modal='match';c.Math.random=random;
  const values={g:Array.from(g),sel:null,done:0,need:30,moves:30,busy:false,over:false,inputVersion:0,timer:null,...extra};
  if(fresh||!c.Mt)c.Mt=values;else Object.assign(c.Mt,values);
  c.mtPaint();domMatchesBoard();return c.Mt;
}
function drain(){let steps=0;while(timers.length){assert.ok(++steps<500,'cascade must settle');timers.shift().fn();domMatchesBoard();}return steps;}
for(let i=0;i<initialBoards;i++){
  c.S.defeatStreak=i%4;c.mountMatch();playable(c.Mt.g);domMatchesBoard();
  assert.equal(c.Mt.need,30-(i%4)*4);assert.equal(c.Mt.moves,30+(i%4)*6);assert.equal(c.Mt.done,0);
}
// Stable random boards are generated independently, allowing both playable and dead boards.
function stableRandomBoard(){
  const g=[];for(let i=0;i<36;i++){
    const choices=[];for(let tile=0;tile<6;tile++){
      if(i%6>=2&&g[i-1]===tile&&g[i-2]===tile)continue;
      if(i>=12&&g[i-6]===tile&&g[i-12]===tile)continue;
      choices.push(tile);
    }g.push(choices[Math.floor(random()*choices.length)]);
  }return g;
}
let falsePositive=0,falseNegative=0,actualSwaps=0,actualInputs=0;
for(let boardNumber=0;boardNumber<stableRandomBoards;boardNumber++){
  const g=stableRandomBoard(),before=g.slice(),actual=[];assert.equal(matches(g),false);
  for(const [a,b] of adjacent){
    const legal=c.mtSwapTiles(a,b,g);actualSwaps++;
    if(g[a]!==g[b])assert.equal(legal,true,'legal adjacent swap reaches production function');
    const hits=matchIndices(g);
    assert.deepEqual(Array.from(c.mtFindMatch(g)).sort((a,b)=>a-b),hits,'production match detector agrees with independent run scan');
    if(before[a]!==before[b]&&hits.some(i=>i===a||i===b))actual.push([a,b]);
    c.mtSwapTiles(b,a,g);assert.deepEqual(g,before,'production swap reversal');
  }
  const detected=c.mtGetValidMoves(g),expectedKeys=moveKeys(actual),detectedKeys=moveKeys(detected);
  assert.equal(new Set(detectedKeys).size,detectedKeys.length,'no duplicate detected moves');
  falsePositive+=detectedKeys.filter(key=>!expectedKeys.includes(key)).length;
  falseNegative+=expectedKeys.filter(key=>!detectedKeys.includes(key)).length;
  assert.deepEqual(detectedKeys,expectedKeys,`random board ${boardNumber}: exact detector/execution move set`);
  assert.equal(c.mtHasValidMove(g),actual.length>0);assert.deepEqual(g,before);
  for(const [a,b] of detected){
    state(g);const buttons=domMatchesBoard();c.mtTap(a);
    assert.equal(c.Mt.sel,a);assert.deepEqual(domMatchesBoard(),buttons,'first selection keeps pointer target identity');
    c.mtTap(b);actualInputs++;
    assert.equal(c.Mt.busy,true);assert.equal(c.Mt.moves,29);assert.equal(c.Mt.sel,null);
    assert.ok(matchIndices(c.Mt.g).some(i=>i===a||i===b),'actual game input creates endpoint match');
    assert.deepEqual(domMatchesBoard(),buttons,'swap keeps all tile nodes');assert.equal(timers.length,1);
    const lockedBoard=Array.from(c.Mt.g);c.mtTap((b+1)%36);assert.deepEqual(Array.from(c.Mt.g),lockedBoard,'busy input ignored');
    timers.length=0;
  }
}
assert.equal(falsePositive,0);assert.equal(falseNegative,0);
// Full coordinate/index adjacency, including right-edge row-wrap and diagonals.
for(let a=0;a<36;a++)for(let b=0;b<36;b++){
  const expected=Math.abs(Math.floor(a/6)-Math.floor(b/6))+Math.abs(a%6-b%6)===1;
  assert.equal(c.mtIsAdjacent(a,b),expected,`${a}/${b} adjacency`);
}
for(const invalid of [-1,36,1.5,NaN,undefined]){
  assert.equal(c.mtIsAdjacent(invalid,0),false);assert.equal(c.mtIsAdjacent(0,invalid),false);
}
const dead=Array.from({length:36},(_,i)=>(Math.floor(i/6)+2*(i%6))%6);
assert.equal(matches(dead),false);assert.equal(oracleMoves(dead).length,0);
assert.equal(c.mtHasValidMove(dead),false);assert.deepEqual(dead,Array.from({length:36},(_,i)=>(Math.floor(i/6)+2*(i%6))%6));
state(dead);const boundaryBefore=Array.from(c.Mt.g);
for(const [a,b] of [[5,6],[11,12],[0,7],[0,35],[-1,0],[35,36]]){
  assert.equal(c.mtSwapTiles(a,b),false);assert.deepEqual(Array.from(c.Mt.g),boundaryBefore);
  assert.equal(c.mtSwapMatches(a,b).length,0);
}
c.mtTap(5);c.mtTap(6);assert.equal(c.Mt.sel,6);assert.equal(c.Mt.moves,30);assert.equal(c.Mt.busy,false);
// Existing unrelated matches must not validate a swap elsewhere, or a same-type no-op.
const transient=dead.slice();transient[0]=transient[1]=transient[2]=0;
state(transient);assert.deepEqual(moveKeys(c.mtGetValidMoves()),moveKeys(oracleMoves(transient)));
assert.equal(c.mtSwapMatches(34,35).length,0);c.mtTap(34);c.mtTap(35);
assert.deepEqual(Array.from(c.Mt.g),transient);assert.equal(c.Mt.moves,30);assert.equal(c.Mt.busy,false);
c.mtTap(0);c.mtTap(1);assert.deepEqual(Array.from(c.Mt.g),transient);
assert.equal(c.Mt.moves,30);assert.equal(c.Mt.busy,false);assert.equal(timers.length,0);
state(dead);c.Mt.g[0]=-1;c.mtPaint();const emptyBefore=Array.from(c.Mt.g);
assert.equal(c.mtSwapTiles(0,1),false);c.mtTap(0);assert.equal(c.Mt.sel,null);assert.deepEqual(Array.from(c.Mt.g),emptyBefore);
// Speculative detector restores data even when match scanning fails.
state(dead);const originalFind=c.mtFindMatch;
c.mtFindMatch=()=>{throw new Error('scan failure');};
assert.throws(()=>c.mtSwapMatches(0,1),/scan failure/);assert.deepEqual(Array.from(c.Mt.g),dead);
c.mtFindMatch=originalFind;
// Both fingers can be down before the first click: selection must keep the second target alive.
const touchBoard=c.mtCreatePlayableBoard();state(touchBoard,{need:10000});
const [touchA,touchB]=c.mtGetValidMoves()[0],touchNodes=domMatchesBoard();
const held=Array.from({length:36},(_,i)=>i).find(i=>i!==touchA&&i!==touchB);
touchNodes[held].emit('pointerdown',{pointerType:'touch'});
touchNodes[touchA].emit('pointerdown',{pointerType:'touch'});
touchNodes[touchB].emit('pointerdown',{pointerType:'touch'});
touchNodes[touchA].emit('click',{detail:1,pointerType:'touch'});
assert.equal(c.Mt.sel,touchA);assert.deepEqual(domMatchesBoard(),touchNodes);
touchNodes[touchB].emit('click',{detail:1,pointerType:'touch'});
assert.equal(c.Mt.moves,29);assert.equal(c.Mt.busy,true);assert.ok(matches(c.Mt.g));
const busyTouch=(held+1)%36;touchNodes[busyTouch].emit('pointerdown',{pointerType:'touch'});
drain();assert.equal(c.Mt.busy,false);assert.equal(c.Mt.over,false);playable(c.Mt.g);domMatchesBoard();
const afterTouch=Array.from(c.Mt.g);
// A pointer held since the busy phase must not block keyboard activation after settling.
assert.equal(touchNodes[busyTouch].mtGesture,null,'paint discards gestures that began while busy');
touchNodes[busyTouch].click();assert.equal(c.Mt.sel,busyTouch);c.mtTap(busyTouch);assert.equal(c.Mt.sel,null);
touchNodes[held].emit('click',{detail:1,pointerType:'touch'});
touchNodes[busyTouch].emit('click',{detail:1,pointerType:'touch'});
assert.equal(c.Mt.sel,null);assert.equal(c.Mt.moves,29);assert.deepEqual(Array.from(c.Mt.g),afterTouch);
// Cancellation and duplicate click events cannot consume a second move or select another tile.
touchNodes[0].emit('pointerdown',{pointerType:'touch'});touchNodes[0].emit('pointercancel',{pointerType:'touch'});
touchNodes[0].emit('click',{detail:1,pointerType:'touch'});touchNodes[0].emit('click',{detail:1,pointerType:'touch'});
assert.equal(c.Mt.sel,null);assert.equal(c.Mt.moves,29);
touchNodes[0].emit('pointerdown',{pointerType:'touch'});c.mtShuffle();c.mtPaint();playable(c.Mt.g);domMatchesBoard();
touchNodes[0].emit('click',{detail:1,pointerType:'touch'});assert.equal(c.Mt.sel,null);
touchNodes[0].click();assert.equal(c.Mt.sel,0,'keyboard/programmatic activation remains usable');
c.mtTap(0);assert.equal(c.Mt.sel,null);
// A zero-cascade deadlock must shuffle, synchronize DOM, and unlock without altering counters.
state(dead,{sel:2,done:4,need:30,moves:29,busy:true});const shuffleNodes=domMatchesBoard();
c.mtResolve();playable(c.Mt.g);domMatchesBoard();assert.deepEqual(domMatchesBoard(),shuffleNodes);
assert.equal(c.Mt.done,4);assert.equal(c.Mt.moves,29);assert.equal(c.Mt.sel,null);assert.equal(c.Mt.busy,false);
assert.equal(get('mtMsg').textContent,'가능한 조합이 없어 다시 섞어요!');
assert.deepEqual(Array.from(c.Mt.g).sort(),dead.slice().sort(),'normal shuffle preserves tiles');
// Real clear/refill/settle chain: refill the cleared top row into a dead board.
state(transient,{moves:29,busy:true});const cascadeNodes=domMatchesBoard();
let draws=0;c.Math.random=()=>draws<4?dead[draws++]/6:random();
c.mtResolve();domMatchesBoard();assert.ok(c.Mt.g.some(tile=>tile<0));drain();playable(c.Mt.g);
assert.deepEqual(domMatchesBoard(),cascadeNodes,'clear, refill and shuffle preserve button identity');
assert.equal(c.Mt.done,4);assert.equal(c.Mt.moves,29);assert.equal(c.Mt.busy,false);
assert.equal(get('mtMsg').textContent,'가능한 조합이 없어 다시 섞어요!');
// Force two successive clear/refill cycles, then verify the newly shuffled move through real input.
state(transient,{moves:29,busy:true});const multiCascadeNodes=domMatchesBoard();draws=0;
c.Math.random=()=>{const draw=draws++;return draw<4?0:draw<8?dead[draw-4]/6:random();};
c.mtResolve();assert.equal(drain(),4);assert.equal(c.Mt.done,8);assert.equal(c.Mt.moves,29);assert.equal(c.Mt.busy,false);
playable(c.Mt.g);assert.deepEqual(domMatchesBoard(),multiCascadeNodes);
const [afterCascadeA,afterCascadeB]=c.mtGetValidMoves()[0];c.mtTap(afterCascadeA);c.mtTap(afterCascadeB);
assert.equal(c.Mt.busy,true);assert.equal(c.Mt.moves,28);assert.ok(matches(c.Mt.g));domMatchesBoard();timers.length=0;
// Degenerate random sources force both bounded retry limits and safe creation.
for(const value of [0,.999999]){
  let calls=0;c.Math.random=()=>{assert.ok(++calls<10000,'generation must terminate');return value;};
  playable(c.mtCreatePlayableBoard());
  state(dead,{done:7,moves:12,busy:true});calls=0;
  c.Math.random=()=>{assert.ok(++calls<10000,'shuffle must terminate');return value;};
  c.mtResolve();playable(c.Mt.g);domMatchesBoard();
  assert.equal(c.Mt.done,7);assert.equal(c.Mt.moves,12);assert.equal(c.Mt.busy,false);
}
// Stale timers and detached click listeners must never affect a retry session.
state(transient,{busy:true});const oldState=c.Mt,oldButtons=domMatchesBoard();c.mtResolve();
const oldCallbacks=timers.splice(0);assert.ok(oldCallbacks.length);
c.retryMatch();const retryState=c.Mt,retryBoard=Array.from(c.Mt.g),retryButtons=domMatchesBoard();
assert.notEqual(retryState,oldState);assert.notEqual(retryButtons[0],oldButtons[0]);
oldCallbacks.forEach(timer=>timer.fn());oldButtons[0].disabled=false;oldButtons[0].click();c.mtResolve(oldState);
assert.deepEqual(Array.from(c.Mt.g),retryBoard);assert.equal(c.Mt.sel,null);assert.equal(c.Mt.done,0);
assert.equal(c.Mt.busy,false);assert.equal(timers.length,0);domMatchesBoard();
// Closing during either resolver phase cancels pending work; retry creates an unlocked session.
for(const phase of ['clear','refill']){
  state(transient,{busy:true});c.mtResolve();
  if(phase==='refill'){timers.shift().fn();domMatchesBoard();}
  const beforeClose=Array.from(c.Mt.g),doneBefore=c.Mt.done;c.S.modal=null;
  while(timers.length)timers.shift().fn();
  assert.deepEqual(Array.from(c.Mt.g),beforeClose);assert.equal(c.Mt.done,doneBefore);
  c.S.modal='match';c.retryMatch();assert.equal(c.Mt.busy,false);playable(c.Mt.g);domMatchesBoard();
}
// Finishing a game must use original result paths before shuffling, once only.
state(dead,{done:30,need:30,moves:0,busy:true});c.mtResolve();assert.equal(c.wins,1);assert.equal(c.losses,0);
assert.equal(c.Mt.busy,false);c.mtResolve();assert.equal(c.wins,1);
state(dead,{done:29,need:30,moves:0,busy:true});c.mtResolve();assert.equal(c.losses,1);
assert.equal(c.Mt.busy,false);c.mtResolve();assert.equal(c.losses,1);
console.log(JSON.stringify({result:'PASS',mode:focused?'focused':'full',initialBoards,stableRandomBoards,adjacentSwaps:actualSwaps,
  detectorMovesExecutedThroughGameInput:actualInputs,falsePositive,falseNegative,
  checks:['coordinate boundaries','transient unrelated matches','same-type no-op','speculative exception restoration',
    'stable DOM selection/swap/clear/refill/shuffle','zero-cascade unlock','failed swap unlock','deadlock unlock',
    'bounded generation/shuffle fallbacks','retry/stale callbacks','modal close cancellation',
    'overlapping touch targets','held/busy/stale/cancelled/duplicate gestures','keyboard activation after busy-held pointer',
    'keyboard activation','unchanged counters/results']},null,2));
