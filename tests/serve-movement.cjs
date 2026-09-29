// Optional local browser fixture: node tests/serve-movement.cjs
// Only response HTML is augmented; product files and real saved games are untouched.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fixtures = {
  A: { name: '플레이어A', code: 'EC9001', hair: 'messy', face: 'bright', outfit: 'cloak', skin: 'light', haircol: 'brown' },
  B: { name: '플레이어B', code: 'EC9002', hair: 'long', face: 'bold', outfit: 'robe', skin: 'deep', haircol: 'red' },
  C: { name: '플레이어C', code: 'EC9003', hair: 'pony', face: 'calm', outfit: 'soccer', skin: 'tan', haircol: 'blonde' },
  D: { name: '플레이어D', code: 'EC9004', hair: 'messy', face: 'calm', outfit: 'robe', skin: 'light', haircol: 'black' },
  E: { name: '플레이어E', code: 'EC9005', hair: 'long', face: 'bright', outfit: 'cloak', skin: 'tan', haircol: 'brown' }
};
function controls() {
  document.addEventListener('DOMContentLoaded', () => {
    let held = null, until = 0;
    const samples = [], frames = [];
    let lastFrame = performance.now();
    function measure(t) { frames.push(t - lastFrame); lastFrame = t; if (frames.length > 600) frames.shift(); requestAnimationFrame(measure); }
    requestAnimationFrame(measure);
    // Exercise the original world movement even if a background tab's RAF is suspended.
    setInterval(() => {
      if (held && performance.now() < until) {
        Wd.keys[held] = true;
        if (document.hidden && S.scene === 'world' && !S.modal) tick(16);
      } else if (held) { Wd.keys[held] = false; held = null; }
    }, 16);
    const box = document.createElement('div');
    box.style = 'position:fixed;bottom:10px;right:10px;z-index:5000;background:white;color:black;font:11px monospace;padding:6px;max-width:600px';
    function button(label, action) { const b = document.createElement('button'); b.textContent = label; b.onclick = action; box.append(b); }
    ['east', 'north', 'west', 'south'].forEach(dir => button('test ' + dir, () => {
      Wd.keys = { u: false, d: false, l: false, r: false };
      held = { east: 'r', west: 'l', north: 'u', south: 'd' }[dir];
      until = performance.now() + (new URLSearchParams(location.search).has('hero-walk') ? 3500 : 1500);
    }));
    button('test simultaneous', () => setTimeout(() => { held = 'r'; until = performance.now() + 2000; }, 6000));
    button('test disconnect', () => window.ecoSupabase.client.realtime.disconnect());
    button('test level', () => admSet('lv', S.lv + 1));
    button('test equip', () => { if (!S.owned.includes('w2')) S.owned.push('w2'); equip('weapon', 'w2'); });
    button('test spirit', () => { S.petKey = 'water'; paintHud(); autosave(); });
    button('test progress', () => admSet('monIdx', Math.min(S.monIdx + 1, CUR.monsters.length - 1)));
    const check = document.createElement('span');
    button('test save/load', () => {
      const before = { code: S.code, name: S.name, theme: S.themeId, level: S.lv };
      const mode = Save.save(), loaded = Save.load(S.code);
      check.textContent = ' save/load ' + (mode === 'disk' && loaded &&
        loaded.code === before.code && loaded.name === before.name &&
        loaded.themeId === before.theme && loaded.lv === before.level ? 'PASS' : 'FAIL');
    });
    box.append(check);
    const output = document.createElement('pre'); output.id = 'movement-test-result';
    output.style = 'white-space:pre-wrap;overflow-wrap:anywhere;max-height:120px;overflow:auto';
    box.append(output); document.body.append(box);
    setInterval(() => {
      const remotes = Object.values(ecoRemotePlayers.remotePlayers).map(p => ({
        name: p.nickname, x: p.position?.x, y: p.position?.y, targetX: p.targetX, targetY: p.targetY,
        direction: p.appearance.direction, moving: p.networkMoving, seq: p.lastSeq, walking: p.element?.classList.contains('walk')
      }));
      if (Wd.moving && remotes.filter(p => p.moving).length === 2) {
        samples.push({ t: Date.now(), x: Wd.px, y: Wd.py, remotes: remotes.map(p => p.name) });
        if (samples.length > 5) samples.shift();
      }
      const sorted = [...frames].sort((a, b) => a - b);
      output.textContent = JSON.stringify({
        local: { name: S.name, x: Wd.px, y: Wd.py, direction: Wd.face, moving: Wd.moving, modal: S.modal },
        samples, stats: ecoMovement.getStats(), remotes,
        frameP95: sorted[Math.floor(sorted.length * .95)]
      });
    }, 100);
  });
}
function plogControls() {
  document.addEventListener('DOMContentLoaded', () => {
    const box=document.createElement('div');
    box.style='position:fixed;left:12px;top:90px;z-index:6000;background:#fff;color:#111;padding:5px;font:11px sans-serif;width:min(540px,calc(100vw - 36px));max-height:230px;overflow:auto;display:flex;flex-wrap:wrap;gap:3px';
    function button(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;box.append(b);}
    let clock=null,lastClock=0,held=null,holdEnd=0,auto=false,route=null,routeItem=null,pendingSeed=null,startSeed='random';
    let previousFrame=0,previousGame=null;const frames=[],drawCosts=[],updateCosts=[],errors=[];
    function sample(list,n){list.push(n);if(list.length>500)list.shift();}
    window.addEventListener('error',e=>errors.push(e.message));
    window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason?.message||e.reason)));
    const originalStep=pangStep,originalUpdate=pangUpdate,originalDraw=pangDraw,originalMount=mountPang;
    mountPang=function(){
      originalMount();
      if(Pg&&S.modal==='pang'&&pendingSeed!==null){
        startSeed=pendingSeed;Pg.seed=pendingSeed;pendingSeed=null;
        Pg.trash=[];Pg.npcs=pangCreateNpcs();pangScatter();pangDraw();
      }else startSeed='random';
    };
    pangStep=function(now){
      if(Pg!==previousGame){previousFrame=0;previousGame=Pg;}
      if(previousFrame)sample(frames,now-previousFrame);previousFrame=now;originalStep(now);
    };
    pangUpdate=function(dt){
      if(held&&Pg&&Pg.t>=holdEnd){Pg.keys[held]=false;held=null;}
      if(auto&&Pg&&!Pg.over)autoTarget();
      const before=performance.now();originalUpdate(dt);sample(updateCosts,performance.now()-before);
    };
    pangDraw=function(){const before=performance.now();originalDraw();sample(drawCosts,performance.now()-before);};
    function ready(){return Pg&&Pg.started&&!Pg.over&&S.modal==='pang';}
    function stopClock(){if(clock)clearInterval(clock);clock=null;lastClock=0;auto=false;route=routeItem=null;}
    function clearKeys(){if(Pg){Pg.keys={l:false,r:false,u:false,d:false};Pg.target=null;}held=null;}
    function pause(){stopClock();clearKeys();if(Pg?.raf){cancelAnimationFrame(Pg.raf);Pg.raf=null;}}
    function playClock(){
      if(!ready())return;
      if(Pg.raf){cancelAnimationFrame(Pg.raf);Pg.raf=null;}
      if(clock)return;
      lastClock=performance.now();
      // The IAB may throttle RAF even while visible. This fixture-only clock uses
      // the shipped update/draw, with every simulation substep at most 34ms.
      clock=setInterval(()=>{
        if(!ready()){stopClock();return;}
        const now=performance.now();let remaining=Math.max(0,now-lastClock);lastClock=now;
        while(remaining>0&&ready()){const dt=Math.min(34,remaining);pangUpdate(dt);remaining-=dt;}
        if(Pg)pangDraw();
      },33);
    }
    function resume(){if(!ready())return;clearKeys();playClock();}
    function resetRound(seed=null){
      pause();frames.length=drawCosts.length=updateCosts.length=0;previousFrame=0;
      pendingSeed=seed;if(seed!==null)S.defeatStreak=0;admMini('pang');
    }
    button('test admin plogging',()=>resetRound());
    button('test reset round',()=>resetRound());
    [1,2,3].forEach(seed=>button('test seed '+seed,()=>resetRound(seed)));
    button('test play clock',playClock);
    button('test pause clock',pause);
    button('test resume',resume);
    button('test production clock',()=>{if(!ready())return;pause();Pg.last=performance.now();Pg.raf=requestAnimationFrame(pangStep);});
    for(const [dir,key] of Object.entries({east:'r',west:'l',north:'u',south:'d'}))button('test pang '+dir,()=>{
      if(!ready())return;auto=false;clearKeys();held=key;holdEnd=Pg.t+1000;Pg.keys[key]=true;playClock();
    });
    button('test pang route',()=>{
      pause();
      if(S.modal==='pang')leaveBattle();
      S.lv=Math.max(S.lv,10);enterTheme('river');
      S.monIdx=2;S.battleDone=false;S.interludePending=null;S.encounterWon=false;
      openModal('meet');
    });
    button('test goal result',()=>{
      if(!Pg||!Pg.started||Pg.over)return;
      auto=false;clearKeys();
      Pg.npcs=[];Pg.trash=[];
      for(let i=Pg.count;i<PANG_GOAL;i++)pangTrash('paper',Pg.px,Pg.py);
      pangUpdate(16);
    });
    button('test time result',()=>{if(Pg&&Pg.started&&!Pg.over){Pg.t=Pg.limit-16;pangUpdate(16);}});
    button('test other mini',()=>{pause();admMini('spheres');});
    function contact(kind){
      if(!ready())return;pause();
      const n=Pg.npcs.find(n=>!kind||n.kind===kind);if(!n)return;
      Pg.px=n.x;Pg.py=n.y;Pg.inv=0;pangUpdate(0);pangDraw();
    }
    button('test npc collision',()=>contact());
    ['smoker','coffee','child'].forEach(kind=>button('test hit '+kind,()=>contact(kind)));
    button('test npc lineup',()=>{
      if(!ready())return;pause();Pg.px=340;Pg.py=550;
      const points=[[210,410],[455,410],[745,410],[210,700],[455,700],[745,700]];
      Pg.npcs.forEach((n,i)=>{
        const p=pangFreePoint(...points[i],90);if(!p)throw new Error('Fixture lineup spot blocked');
        n.x=p.x;n.y=p.y;n.drop=null;n.moving=false;n.face=i%2?'east':'south';n.nextDrop=Pg.t+5000;
      });pangDraw();
    });
    ['south','north','west','east'].forEach(face=>button('test npc '+face,()=>{
      if(!ready())return;pause();
      Pg.npcs.forEach(n=>{
        const speed=Math.hypot(n.vx,n.vy)||170;n.vx=face==='west'?-speed:face==='east'?speed:0;
        n.vy=face==='north'?-speed:face==='south'?speed:0;n.face=face;
      });pangDraw();
    }));
    ['idle','walk'].forEach(action=>button('test npc '+action,()=>{
      if(!ready())return;pause();Pg.npcs.forEach(n=>{n.drop=null;n.moving=action==='walk';n.stride=30;n.nextDrop=Pg.t+5000;});pangDraw();
    }));
    button('test npc toss',()=>{
      if(!ready())return;resume();Pg.npcs.forEach(n=>{n.nextDrop=Pg.t;n.drop=null;});pangUpdate(0);pangDraw();
    });
    function gesture(stage){
      if(!ready())return;pause();
      const elapsed={open:200,eat:750,toss:1350}[stage];
      Pg.npcs.forEach(n=>{
        const timing=PANG_NPC_TIMING[n.kind];
        const adultElapsed=timing?(stage==='toss'?timing.release:stage==='eat'?(timing.prepare+timing.toss)/2:timing.prepare/2):0;
        n.drop={start:Pg.t-(n.kind==='child'?elapsed:adultElapsed),spawned:false};
      });
      pangUpdate(0);pangDraw();
    }
    ['open','eat','toss'].forEach(stage=>button('test child '+stage,()=>gesture(stage)));
    ['prepare','toss','recover'].forEach(stage=>button('test adult '+stage,()=>{
      if(!ready())return;pause();
      Pg.npcs.forEach(n=>{
        const timing=PANG_NPC_TIMING[n.kind];
        if(!timing){n.drop=null;n.nextDrop=Pg.t+5000;return;}
        const elapsed=stage==='prepare'?timing.prepare/2:stage==='toss'?(timing.prepare+timing.toss)/2:(timing.toss+timing.duration)/2;
        n.drop={start:Pg.t-elapsed,spawned:false};
      });pangUpdate(0);pangDraw();
    }));
    button('test npc litter',()=>gesture('toss'));
    function collect(kind){
      if(!ready())return;pause();
      const t=Pg.trash.findLast(item=>kind?item.kind===kind:['butt','cup','wrapper'].includes(item.kind));if(!t)return;
      const placed=[];
      Pg.npcs.forEach(n=>{
        for(const [x,y] of [[1150,230],[1350,230],[1500,230],[1150,940],[1350,940],[1500,940],[850,990]]){
          const p=pangFreePoint(x,y,90);
          if(p&&dist(p.x,p.y,t.x,t.y)>80&&placed.every(other=>dist(p.x,p.y,other.x,other.y)>70)){
            n.x=p.x;n.y=p.y;placed.push(p);n.drop=null;n.nextDrop=Pg.t+5000;break;
          }
        }
      });Pg.px=t.x;Pg.py=t.y;Pg.inv=0;pangUpdate(0);pangDraw();
    }
    button('test collect litter',()=>collect());
    button('test collect butt',()=>collect('butt'));
    button('test collect cup',()=>collect('cup'));
    button('test collect wrapper',()=>collect('wrapper'));
    for(const [label,key] of Object.entries({tree:'pr_pine',rock:'pr_rock',fence:'pr_fence'}))button('test block '+label,()=>{
      if(!ready())return;pause();
      const candidates=Pg.obstacles.filter(o=>o.key===key&&!pangBlocked(o.left-11,(o.top+o.bottom)/2,Pg.obstacles));
      const o=candidates.find(o=>o.left>300&&o.left<1000)||candidates[0];if(!o)return;
      Pg.px=o.left-11;Pg.py=(o.top+o.bottom)/2;Pg.keys.r=true;held='r';holdEnd=Pg.t+1000;playClock();
    });
    // This test-only walker chooses a route around cached obstacles; NPCs are
    // deliberately not predicted or teleported away, so contacts remain visible.
    function gridNode(x,y){
      const r=Pg.reach,cx=Math.round((x-24)/r.step),cy=Math.round((y-24)/r.step);let best=null,bestD=Infinity;
      for(let oy=-2;oy<=2;oy++)for(let ox=-2;ox<=2;ox++){
        const nx=cx+ox,ny=cy+oy,i=ny*r.cols+nx,tx=24+nx*r.step,ty=24+ny*r.step;
        if(nx<0||ny<0||nx>=r.cols||ny>=r.rows||!r.cells[i]||!pangLineClear(x,y,tx,ty,Pg.obstacles,0))continue;
        const d=dist(x,y,tx,ty);if(d<bestD){best=i;bestD=d;}
      }return best;
    }
    function pathTo(item){
      if(pangLineClear(Pg.px,Pg.py,item.x,item.y,Pg.obstacles,5))return [{x:item.x,y:item.y}];
      const r=Pg.reach,start=gridNode(Pg.px,Pg.py),goal=gridNode(item.x,item.y);
      if(start===null||goal===null)return null;
      const parent=new Int32Array(r.cells.length).fill(-1),queue=[start];parent[start]=start;
      for(let head=0;head<queue.length&&parent[goal]===-1;head++){
        const i=queue[head],x=i%r.cols,y=Math.floor(i/r.cols);
        for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
          if(nx<0||ny<0||nx>=r.cols||ny>=r.rows)continue;const j=ny*r.cols+nx;
          if(parent[j]!==-1||!r.cells[j]||!pangLineClear(24+x*r.step,24+y*r.step,24+nx*r.step,24+ny*r.step,Pg.obstacles,5))continue;
          parent[j]=i;queue.push(j);
        }
      }
      if(parent[goal]===-1)return null;
      const nodes=[];for(let i=goal;;i=parent[i]){nodes.push({x:24+(i%r.cols)*r.step,y:24+Math.floor(i/r.cols)*r.step});if(i===start)break;}
      return nodes.reverse().concat({x:item.x,y:item.y});
    }
    function autoTarget(){
      // A body-contact knockback may put the player across a cached route's
      // next segment. Reconnect from the actual foot box; grid edges retain
      // the safer 5px clearance used by the game's reachable-ground cache.
      if(route?.[0]&&!pangLineClear(Pg.px,Pg.py,route[0].x,route[0].y,Pg.obstacles,0)){
        route=null;routeItem=null;Pg.target=null;
      }
      if(!routeItem||!Pg.trash.includes(routeItem)){
        route=null;routeItem=null;
        for(const item of [...Pg.trash].sort((a,b)=>dist(Pg.px,Pg.py,a.x,a.y)-dist(Pg.px,Pg.py,b.x,b.y))){
          const found=pathTo(item);if(found){route=found;routeItem=item;break;}
        }
      }
      if(!route)return;
      while(route.length&&dist(Pg.px,Pg.py,route[0].x,route[0].y)<12)route.shift();
      Pg.keys={l:false,r:false,u:false,d:false};Pg.target=route[0]||{x:routeItem.x,y:routeItem.y};
    }
    button('test route play',()=>{if(!ready())return;clearKeys();playClock();auto=true;route=routeItem=null;});
    button('test stop route',()=>{auto=false;route=routeItem=null;clearKeys();});
    const show=document.createElement('button');show.textContent='test show tools';show.hidden=true;
    show.style='position:fixed;top:4px;left:4px;z-index:6001';document.body.append(show);
    show.onclick=()=>{box.style.display='';show.hidden=true;const world=document.getElementById('movement-test-result')?.parentElement;if(world)world.hidden=false;};
    button('test hide tools',()=>{box.style.display='none';show.hidden=false;const world=document.getElementById('movement-test-result')?.parentElement;if(world)world.hidden=true;});
    const detail=document.createElement('pre');detail.id='plogging-test-result';detail.style='white-space:pre-wrap;overflow-wrap:anywhere;width:100%;margin:3px 0 0';
    box.append(detail);document.body.append(box);
    function performanceSummary(samples){
      const sorted=[...samples].sort((a,b)=>a-b);if(!sorted.length)return null;
      return {average:+(sorted.reduce((sum,n)=>sum+n,0)/sorted.length).toFixed(2),p95:+sorted[Math.floor(sorted.length*.95)].toFixed(2),max:+sorted.at(-1).toFixed(2)};
    }
    setInterval(()=>{
      if(clock&&S.modal!=='pang')stopClock();
      detail.textContent=JSON.stringify(Pg?{
        clock:clock?'fixture 33ms / <=34ms update substeps':'production RAF or paused',auto,
        startSeed,goal:PANG_GOAL,initialTrash:PANG_INITIAL_TRASH,retryBonus:PANG_RETRY_BONUS,
        time:+Pg.t.toFixed(0),x:Math.round(Pg.px),y:Math.round(Pg.py),count:Pg.count,hearts:Pg.hearts,inv:Pg.inv,
        blocked:pangBlocked(Pg.px,Pg.py,Pg.obstacles),trash:Pg.trash.length,
        kinds:Pg.npcs.reduce((all,n)=>(all[n.kind]=(all[n.kind]||0)+1,all),{}),
        npcs:Pg.npcs.map(n=>({kind:n.kind,x:Math.round(n.x),y:Math.round(n.y),action:pangNpcAction(n),face:n.face,blocked:pangBlocked(n.x,n.y,Pg.obstacles)})),
        errors,rafMs:performanceSummary(frames),updateMs:performanceSummary(updateCosts),drawMs:performanceSummary(drawCosts)
      }:{idle:true,errors});
    },200);
  });
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    if (rel === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    const full = path.resolve(root, '.' + rel);
    if (!full.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    let data = await fs.readFile(full);
    if (rel === '/index.html') {
      let html = data.toString();
      const fixture = fixtures[url.searchParams.get('fixture')];
      if (fixture) {
        const dx = fixture === fixtures.B ? 112 : 0, dy = fixture === fixtures.C ? -112 : 0;
        const state = { petKey: fixture === fixtures.B ? 'water' : fixture === fixtures.C ? 'fire' : 'earth',
          lv: fixture === fixtures.B ? 6 : fixture === fixtures.C ? 4 : 5,
          exp: fixture === fixtures.B ? 400 : fixture === fixtures.C ? 200 : 280,
          gear: { weapon: fixture === fixtures.B ? 'w1' : null, armor: fixture === fixtures.C ? 'a2' : null, helm: null, shoes: null },
          monIdx: fixture === fixtures.B ? 1 : fixture === fixtures.C ? 2 : 0, scene: 'world' };
        html = html.replace('<script defer src="https://cdn', '<script>S=Object.assign(newState(),' + JSON.stringify(fixture) +
          ',' + JSON.stringify(state) + ');applyTheme("forest");Wd.px=SPAWN.x+' + dx +
          ';Wd.py=SPAWN.y+' + dy + ';render();</script><script defer src="https://cdn');
      }
      if (url.searchParams.has('no-cdn')) html = html.replace(/<script defer src="https:\/\/cdn[^>]+><\/script>/, '');
      const loadScript = url.searchParams.has('load35') ? '<script defer src="./tests/load35-browser.js"></script>' : '';
      const plogScript = url.searchParams.has('plogging') ? '<script>(' + plogControls.toString() + ')();</script>' : '';
      data = Buffer.from(html.replace('</body>', '<script>(' + controls.toString() + ')();</script>' + loadScript + plogScript + '</body>'));
    }
    res.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': {
      '.html': 'text/html;charset=utf-8', '.js': 'application/javascript;charset=utf-8', '.css': 'text/css',
      '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml'
    }[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  } catch (error) { console.error(req.url, error.message); res.writeHead(404); res.end(); }
});
server.listen(0, '127.0.0.1', () => console.log('Movement fixture: http://127.0.0.1:' + server.address().port));
