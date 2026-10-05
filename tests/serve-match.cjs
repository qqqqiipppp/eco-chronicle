// Disposable localhost QA fixture. No test controls or boards ship in index.html.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function fixture(){
  const baseline=new URLSearchParams(location.search).get('baseline')==='1';
  const results={baseline,status:'ready',hint:'No hint feature exists.',starts:0,completed:0,wins:0,losses:0,swaps:0,
    invalidSwaps:0,rapidPairs:0,busyChecks:0,busyHeldDiscardChecks:0,edgeMoves:0,cornerMoves:0,domAudits:0,stableNodeChecks:0,
    domReplacements:0,unlockedHoles:0,maxCascade:0,plays:[],shuffles:[],scenarios:[],errors:[]};
  const error=message=>{if(!results.errors.includes(message))results.errors.push(message);};
  addEventListener('error',e=>error(e.message));addEventListener('unhandledrejection',e=>error(String(e.reason)));
  document.addEventListener('DOMContentLoaded',()=>{
    // Separate local fixture profile. The server removes Supabase and all deferred presence scripts.
    S=Object.assign(newState(),{name:'퍼즐 검증',code:'MATCH_QA_LOCAL_ONLY',petKey:'earth',scene:'world'});
    applyTheme('forest');Wd.ready=false;render();stopLoop();
    const box=document.createElement('details');box.id='match-qa-panel';
    box.style='position:fixed;left:4px;top:4px;max-width:300px;max-height:95vh;overflow:auto;z-index:7000;background:#fff;color:#111;font:12px monospace;padding:6px;border:1px solid #333';
    const summary=document.createElement('summary');summary.textContent='Match QA · ready';box.append(summary);
    const controls=document.createElement('div');box.append(controls);
    const output=document.createElement('pre');output.id='match-test-result';output.style='white-space:pre-wrap;overflow-wrap:anywhere';box.append(output);document.body.append(box);
    let running=false,current=null,paintState=null,paintNodes=null,lastClearDone=0,currentCascade=0;
    const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));const key=pair=>pair[0]+':'+pair[1];
    function validMoves(){
      if(typeof mtGetValidMoves==='function')return mtGetValidMoves();
      // Baseline compatibility only: use the game's scanner on trial boards.
      const moves=[];
      for(let a=0;a<36;a++)for(const b of[a%6<5?a+1:-1,a<30?a+6:-1]){
        if(b<0||Mt.g[a]<0||Mt.g[b]<0||Mt.g[a]===Mt.g[b])continue;
        const copy=Mt.g.slice();[copy[a],copy[b]]=[copy[b],copy[a]];
        if(mtFindMatch(copy).some(i=>i===a||i===b))moves.push([a,b]);
      }return moves;
    }
    function snapshot(){return Mt?{done:Mt.done,need:Mt.need,moves:Mt.moves,busy:Mt.busy,over:Mt.over,
      readyMatches:mtFindMatch().length,validMoves:validMoves(),board:Array.from(Mt.g)}:null;}
    function show(){summary.textContent='Match QA · '+results.status+' · '+results.completed+'/35';output.textContent=JSON.stringify({results,current:snapshot()},null,2);}
    function check(ok,message){if(!ok)error(message);return ok;}
    function audit(){
      const grid=document.getElementById('mtGrid');if(!Mt||!grid)return;
      const nodes=Array.from(grid.querySelectorAll('button'));results.domAudits++;check(nodes.length===36,'DOM tile count is not 36');
      if(paintState===Mt&&paintNodes){results.stableNodeChecks++;if(nodes.some((node,i)=>node!==paintNodes[i])){
        results.domReplacements++;if(!baseline)error('Tile DOM replaced inside one game');
      }}else{paintState=Mt;lastClearDone=0;}
      paintNodes=nodes;
      nodes.forEach((node,i)=>{
        const value=Mt.g[i];check(Number(node.dataset.i)===i,'DOM index mismatch at '+i);
        check(node.textContent===(value<0?'':MT_ICONS[value]),'DOM visible type mismatch at '+i);
        if(!baseline){
          check(Number(node.dataset.type)===value,'DOM data-type mismatch at '+i);
          check(Number(node.dataset.row)===Math.floor(i/6),'DOM row mismatch at '+i);
          check(Number(node.dataset.col)===i%6,'DOM column mismatch at '+i);
          check(node.disabled===!!(Mt.busy||Mt.over||value<0),'DOM disabled/lock mismatch at '+i);
        }
      });
      if(!Mt.busy&&!Mt.over&&Mt.g.some(v=>v<0)){results.unlockedHoles++;error('Input unlocked with board holes');}
      check(document.getElementById('mtDone').textContent===String(Mt.done),'DOM progress counter mismatch');
      check(document.getElementById('mtMove').textContent===String(Mt.moves),'DOM move counter mismatch');
      if(Mt.g.some(v=>v<0)&&Mt.done>lastClearDone){lastClearDone=Mt.done;currentCascade++;results.maxCascade=Math.max(results.maxCascade,currentCascade);}
    }
    const originalPaint=mtPaint;
    mtPaint=function(){const value=originalPaint.apply(this,arguments);audit();show();return value;};
    const originalMount=mountMatch;
    mountMatch=function(){const value=originalMount.apply(this,arguments);results.starts++;
      current={number:results.starts,initialNeed:Mt.need,initialMoves:Mt.moves,outcome:null,swaps:0,cascades:0};results.plays.push(current);
      check(!mtFindMatch().length,'Initial board contains a match');check(validMoves().length>0,'Initial board has no valid move');show();return value;};
    const originalWin=miniWin,originalLose=miniLose;
    miniWin=function(host){if(host==='mtResult'){results.wins++;results.completed++;if(current){current.outcome='win';current.done=Mt.done;current.remaining=Mt.moves;}}
      const value=originalWin.apply(this,arguments);show();return value;};
    miniLose=function(host){if(host==='mtResult'){results.losses++;results.completed++;if(current){current.outcome='loss';current.done=Mt.done;current.remaining=Mt.moves;}}
      const value=originalLose.apply(this,arguments);show();return value;};
    const originalShuffle=mtShuffle;
    mtShuffle=function(){const before={done:Mt.done,moves:Mt.moves};const value=originalShuffle.apply(this,arguments);
      const after={done:Mt.done,moves:Mt.moves},moves=validMoves();results.shuffles.push({before,after,readyMatches:mtFindMatch().length,validMoves:moves.length,executed:false});
      check(before.done===after.done&&before.moves===after.moves,'Shuffle changes counters');check(!mtFindMatch().length&&moves.length>0,'Shuffle leaves an unplayable board');return value;};
    function pointer(node,type,id){const r=node.getBoundingClientRect();node.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:id,pointerType:'touch',isPrimary:id===11,
      clientX:r.left+r.width/2,clientY:r.top+r.height/2,buttons:type==='pointerdown'?1:0}));}
    function tap(node,id=11){pointer(node,'pointerdown',id);pointer(node,'pointerup',id);node.click();}
    function clickPair(pair,rapid=false){
      const nodes=Array.from(document.querySelectorAll('#mtGrid button')),a=nodes[pair[0]],b=nodes[pair[1]];
      if(rapid){pointer(a,'pointerdown',11);pointer(b,'pointerdown',12);pointer(a,'pointerup',11);a.click();
        check(b.isConnected,'Second pressed tile detached by first selection');if(b.isConnected){pointer(b,'pointerup',12);b.click();}results.rapidPairs++;
      }else{tap(a);tap(b);}
    }
    async function settle(state=Mt){const deadline=performance.now()+20000;
      while(Mt===state&&Mt.busy&&!Mt.over&&performance.now()<deadline)await sleep(30);
      check(Mt!==state||!Mt.busy||Mt.over,'Cascade input lock did not release within 20 seconds');
      if(Mt===state&&!Mt.over){audit();check(!mtFindMatch().length,'Ready board still has a match');check(validMoves().length>0,'Ready board has no valid move');}show();}
    const border=i=>i<6||i>=30||i%6===0||i%6===5;const corner=i=>i===0||i===5||i===30||i===35;
    function bestMove(){return validMoves().sort((a,b)=>(b.some(corner)*8+b.some(border)*2)-(a.some(corner)*8+a.some(border)*2))[0];}
    function invalidPair(){const valid=new Set(validMoves().map(key));for(let a=0;a<36;a++)for(const b of[a%6<5?a+1:-1,a<30?a+6:-1])if(b>=0&&!valid.has(key([a,b])))return[a,b];}
    function testInvalid(){const pair=invalidPair();if(!pair)return;const before=snapshot();clickPair(pair);
      check(Mt.moves===before.moves&&Mt.done===before.done&&!Mt.busy,'Invalid swap alters counters or leaves lock');
      check(JSON.stringify(Mt.g)===JSON.stringify(before.board),'Invalid swap changes board');results.invalidSwaps++;}
    async function playMove(pair=bestMove(),rapid=false){
      check(!!pair,'No actual move available');if(!pair)return;
      const state=Mt,before={done:Mt.done,moves:Mt.moves};currentCascade=0;clickPair(pair,rapid);
      check(Mt.busy&&Mt.moves===before.moves-1,'Detector move did not execute through DOM input');if(!Mt.busy)return;
      results.swaps++;if(current)current.swaps++;if(pair.some(border))results.edgeMoves++;if(pair.some(corner))results.cornerMoves++;
      const locked=snapshot(),busyHeld=document.querySelectorAll('#mtGrid button')[0];
      pointer(busyHeld,'pointerdown',14);busyHeld.click();
      check(Mt.done===locked.done&&Mt.moves===locked.moves&&Mt.sel===null,'Input changes state during busy animation');results.busyChecks++;
      await settle(state);check(Mt.done>before.done,'Executed detector move produced no match');
      pointer(busyHeld,'pointerup',14);busyHeld.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));
      check(Mt.sel===null&&Mt.moves===before.moves-1,'Busy-started gesture accepted after animation');results.busyHeldDiscardChecks++;
      if(current)current.cascades=Math.max(current.cascades,currentCascade);
    }
    function fresh(retry=false){S.defeatStreak=0;retry?retryMatch():mountMatch();}
    function fixedPair(){fresh();const random=Math.random;try{Math.random=()=>0;Mt.g=mtCreatePlayableBoard();}finally{Math.random=random;}
      Mt.sel=null;mtPaint();check(validMoves().some(pair=>key(pair)==='1:7'),'Fixture pair [1,7] is invalid');return[1,7];}
    async function autoplay(){const starting=results.completed;results.status='playing 35 rounds';show();
      for(let round=0;round<35;round++){
        fresh();check(Mt.need===30&&Mt.moves===30,'Autoplay changed original goal/move rules');testInvalid();
        let steps=0;while(!Mt.over&&steps++<30){await playMove(bestMove(),steps%2===1);if(results.errors.length)break;}
        check(Mt.over,'Autoplay game did not reach actual result');if(results.errors.length)break;
        results.status='playing 35 rounds · finished '+(round+1);show();await sleep(50);
      }
      results.status='35-round autoplay complete';results.autoplayCompleted=results.completed-starting;check(results.autoplayCompleted>=35,'Fewer than 35 autoplay games completed');show();}
    async function deadlock(fallback=false){fresh();Mt.g=Array.from({length:36},(_,i)=>(Math.floor(i/6)+2*(i%6))%6);Mt.sel=null;Mt.busy=true;mtPaint();
      const random=Math.random;try{if(fallback)Math.random=()=>0;mtResolve();}finally{Math.random=random;}
      await settle();const shuffle=results.shuffles.at(-1);await playMove();if(shuffle)shuffle.executed=Mt.done>0;
      results.scenarios.push({name:fallback?'constant RNG shuffle fallback':'forced deadlock shuffle',actualMoveExecuted:!!shuffle?.executed});}
    async function singleMove(){fresh();Mt.g=Array.from({length:36},(_,i)=>(Math.floor(i/6)+2*(i%6))%6);Mt.g[1]=0;mtPaint();
      const moves=validMoves();check(!mtFindMatch().length&&moves.length===1&&key(moves[0])==='2:3','Single-move board preparation failed');
      await playMove(moves[0],true);results.scenarios.push({name:'only one available move on top edge',actualMoveExecuted:Mt.done>0});}
    async function cascade(){const pair=fixedPair(),random=Math.random,muted=Au.muted;let draws=0;
      // Audio noise also draws random numbers. Isolate only this controlled refill.
      Au.muted=true;
      Math.random=()=>{if(++draws<=12)return 0;Math.random=random;return random();};
      try{await playMove(pair,true);}finally{Math.random=random;Au.muted=muted;}
      check(currentCascade>=2,'Controlled refill did not create multiple cascades');results.scenarios.push({name:'multiple cascades',clearPasses:currentCascade,draws});}
    async function retryLoss(){
      // Need=30/moves=30 cannot naturally lose: every consumed move clears >=3.
      // Prepare only the terminal branch, then use real resolver/result/retry.
      fresh();Mt.moves=0;Mt.done=0;Mt.busy=true;mtPaint();mtResolve();check(Mt.over&&current.outcome==='loss','Prepared failure did not reach actual miniLose');
      retryMatch();check(!Mt.over&&!Mt.busy&&Mt.sel===null,'Actual retry leaves input locked');const eased={need:Mt.need,moves:Mt.moves};await playMove();
      results.scenarios.push({name:'prepared failure and actual retryMatch',eased,actualMoveExecuted:Mt.done>0});}
    async function stale(){const pair=fixedPair();clickPair(pair);await sleep(155);closeModal();applyTheme('river');fresh();const state=Mt;
      await playMove();const after=snapshot();await sleep(650);
      check(Mt===state&&Mt.done===after.done&&Mt.moves===after.moves&&JSON.stringify(Mt.g)===JSON.stringify(after.board),'Old session timer changes remounted puzzle');
      audit();applyTheme('forest');results.scenarios.push({name:'close modal, theme change and remount during cascade',passed:!results.errors.length});}
    async function gestureChecks(){
      const pair=fixedPair(),held=document.querySelectorAll('#mtGrid button')[35];pointer(held,'pointerdown',13);
      await playMove(pair);const before=snapshot();pointer(held,'pointerup',13);held.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));
      check(Mt.sel===null&&Mt.moves===before.moves&&Mt.done===before.done,'Held gesture accepted after board changed');
      const canceled=document.querySelectorAll('#mtGrid button')[0];pointer(canceled,'pointerdown',11);pointer(canceled,'pointercancel',11);
      canceled.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));check(Mt.sel===null,'Canceled gesture accepted as a tile click');
      pointer(canceled,'pointerdown',11);pointer(canceled,'pointerup',11);canceled.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));
      const selected=Mt.sel;canceled.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));check(Mt.sel===selected,'Duplicate click handled twice');
      canceled.click();check(Mt.sel===null,'Keyboard/programmatic click fallback failed');
      results.scenarios.push({name:'held, canceled and duplicate pointer/click gestures',passed:!results.errors.length});}
    function detachBaseline(){const pair=fixedPair(),nodes=Array.from(document.querySelectorAll('#mtGrid button')),a=nodes[pair[0]],b=nodes[pair[1]],before=Mt.moves;
      pointer(a,'pointerdown',11);pointer(b,'pointerdown',12);pointer(a,'pointerup',11);a.click();const connected=b.isConnected;
      if(connected){pointer(b,'pointerup',12);b.click();}results.scenarios.push({name:'second contact survives first selection',pair,secondConnected:connected,swapExecuted:Mt.moves===before-1,
        rule:'Release/click is delivered only if the original second target remains connected.'});
      results.status=baseline?'baseline input reproduction recorded':'fixed input reproduction recorded';show();}
    function button(label,fn){const b=document.createElement('button');b.textContent=label;b.style='display:block;margin:5px 0;width:100%';
      b.onclick=async()=>{if(running)return;running=true;box.open=false;try{await fn();}catch(e){error(e.stack||String(e));results.status='error';}finally{running=false;show();}};controls.append(b);}
    button('Start 35 rounds',autoplay);
    button('Run all extra scenarios',async()=>{results.status='running extra scenarios';await singleMove();await deadlock();await deadlock(true);await cascade();await retryLoss();await stale();await gestureChecks();results.status='extra scenarios complete';});
    button('Single available move',singleMove);
    button('Forced deadlock and real move',()=>deadlock());
    button('Constant RNG fallback and real move',()=>deadlock(true));
    button('Multiple cascade input checks',cascade);
    button('Prepared loss and actual retry',retryLoss);
    button('Close, theme change and remount',stale);
    button('Held, cancel and duplicate gestures',gestureChecks);
    button('Prepare actual tap pair [1,7]',()=>{fixedPair();results.status='pair [1,7] ready for actual browser touches';});
    button('Reproduce overlapping contact',detachBaseline);button('Fresh puzzle',()=>{fresh();results.status='fresh puzzle ready';});
    window.matchQA={results,show,audit,autoplay,deadlock,cascade,retryLoss,stale,gestureChecks,fixedPair,detachBaseline};fresh();show();
  });
}
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
  if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const baseline=url.searchParams.get('baseline')==='1';let data;
  if(baseline&&(rel==='/js/game.js'||rel==='/css/style.css'))data=execFileSync('git',['show','HEAD:'+rel.slice(1)],{cwd:root,maxBuffer:8*1024*1024});else data=await fs.readFile(full);
  if(rel==='/index.html'){
    let html=data.toString().replace(/<script defer[^>]*><\/script>/g,'');
    if(baseline)html=html.replace('./js/game.js','./js/game.js?baseline=1').replace('./css/style.css?','./css/style.css?baseline=1&');
    data=Buffer.from(html.replace('</body>','<script>('+fixture.toString()+')();</script></body>'));
  }
  res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp'}[path.extname(full)]||'application/octet-stream'});res.end(data);
}catch(e){res.writeHead(404);res.end(String(e.message));}}).listen(0,'127.0.0.1',function(){console.log('Match fixture: http://127.0.0.1:'+this.address().port);});
