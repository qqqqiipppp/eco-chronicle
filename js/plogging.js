/* The existing `pang` encounter ID now plays a self-contained plogging game.
   Only Pg is transient; rewards and saves still use the original game flow. */
var PANG_W=960, PANG_H=540, PANG_FIELD_W=1700, PANG_FIELD_H=1080;
var PANG_GOAL=28, PANG_LIMIT=75000, PANG_INITIAL_TRASH=32, PANG_RETRY_BONUS=1, PANG_TRASH_GAP=68;
var PANG_TRASH=['bottle','can','wrapper','bag','paper','cap'];
var PANG_NPC_ART={smoker:'./assets/images/characters/plogging_smoker_polish_sheet.png',coffee:'./assets/images/characters/plogging_coffee_polish_sheet.png',child:'./assets/images/characters/plogging_child_sheet.png'};
var PANG_NPC_TIMING={smoker:{prepare:350,toss:750,release:550,duration:1100},
  coffee:{prepare:450,toss:900,release:650,duration:1250}};
// Generated art has uneven row spacing: crop at transparent gaps, not through shoes.
var PANG_NPC_ROWS={smoker:[[0,309],[309,601],[601,877],[877,1146],[1147,1402]],
  coffee:[[0,292],[292,573],[573,853],[853,1137],[1137,1466]]};
// Bottom of each pair of shoes within its cell; detached litter is not an anchor.
var PANG_NPC_FEET={smoker:[[.98058,.98058,.98382,.98382],[.98973,.99315,.98973,.99315],
  [.99275,.99275,.99275,.99275],[1,1,1,1],[.98039,.98039,.98431,.98039]],
  coffee:[[.97603,.97603,.97603,.97260],[.97509,.97509,.97509,.96797],
  [.97143,.97143,.97143,.97143],[.97535,.97535,.97535,.97535],[.83283,.83283,.83283,.83283]],
  child:[[.95221,.95221,.95934,.95934],[.94722,.94365,.94365,.94365],
  [.93509,.93509,.93866,.93866],[.91583,.91583,.91940,.91940],[.86805,.86448,.87518,.87518]]};
var PANG_DECOR=[
  ['pr_pine',72,128,126],['pr_round',240,170,126],['pr_rock',400,158,76],
  ['pr_bush',564,181,76],['pr_pine',801,127,132],['pr_flower',947,212,56],
  ['pr_round',1120,154,125],['pr_shroom',1288,242,48],['pr_pine',1545,155,136],
  ['pr_rock',1611,329,72],['pr_bush',175,340,76],['pr_log',705,353,85],
  ['pr_fence',150,438,58],['pr_fence',205,438,58],['pr_fence',1495,442,58],['pr_fence',1550,442,58],
  ['pr_plant',73,689,56],['pr_round',257,795,132],['pr_shroom',419,737,54],
  ['pr_bush',590,890,78],['pr_pine',670,970,134],['pr_rock',943,736,80],
  ['pr_flower',1035,901,56],['pr_round',1188,835,135],['pr_log',1354,769,82],
  ['pr_bush',1495,924,78],['pr_pine',1633,800,136],['pr_plant',329,1022,56],
  ['pr_fence',141,661,58],['pr_fence',197,661,58],
  ['pr_pine',490,530,132],['pr_rock',635,603,94],['pr_log',812,508,110],
  ['pr_fence',1020,581,88],['pr_fence',1100,581,88],['pr_pine',1060,455,130],
  ['pr_round',1290,562,132],['pr_rock',1460,640,88],
  ['pr_fence',340,285,88],['pr_fence',420,285,88],['pr_bush',998,330,98]
];

// Footprints use only solid lower portions: foliage and small flowers remain walkable.
var PANG_FOOTPRINTS={pr_pine:[.22,.18],pr_round:[.22,.16],pr_rock:[.78,.34],
  pr_bush:[.64,.24],pr_log:[.80,.22],pr_fence:[.94,.20]};
var PANG_SCENERY_SLOT={pr_pine:0,pr_round:1,pr_rock:2};
var PANG_SCENERY_FEET={forest:[.98214286,.98125,.96093750],river:[.97916667,.97916667,.94642857],
  ocean:[.97159091,.97159091,.96093750],city:[.97115385,.97115385,.96093750],
  air:[.97794118,.97794118,.96093750],climate:[.98214286,.98214286,.96875]};
var PANG_PROP_FEET={pr_bush:.96212121,pr_log:.95192308,pr_fence:.96428571};
function pangBlocked(x,y,obstacles,pad=0){
  if(x<24||x>PANG_FIELD_W-24||y<24||y>PANG_FIELD_H-24)return true;
  return (obstacles||[]).some(o=>x+10+pad>o.left&&x-10-pad<o.right&&y+5+pad>o.top&&y-8-pad<o.bottom);
}
function pangLineClear(x,y,tx,ty,obstacles,pad=0){
  const steps=Math.max(1,Math.ceil(dist(x,y,tx,ty)/6));
  for(let i=0;i<=steps;i++)if(pangBlocked(x+(tx-x)*i/steps,y+(ty-y)*i/steps,obstacles,pad))return false;
  return true;
}
function pangBuildField(){
  const obstacles=PANG_DECOR.flatMap(([key,x,y,size])=>{
    const f=PANG_FOOTPRINTS[key];
    return f?[{left:x-size*f[0]/2,right:x+size*f[0]/2,top:y-size*f[1],bottom:y,key}]:[];
  });
  // A small cached flood fill ensures collectible litter is on reachable ground.
  const step=24,cols=Math.floor((PANG_FIELD_W-48)/step)+1,rows=Math.floor((PANG_FIELD_H-48)/step)+1;
  const open=new Uint8Array(cols*rows),cells=new Uint8Array(cols*rows),indices=[];
  for(let i=0;i<open.length;i++)open[i]=!pangBlocked(24+(i%cols)*step,24+Math.floor(i/cols)*step,obstacles,5);
  const start=Math.round((Pg.py-24)/step)*cols+Math.round((Pg.px-24)/step);
  if(open[start]){cells[start]=1;indices.push(start);}
  for(let head=0;head<indices.length;head++){
    const i=indices[head],cx=i%cols,cy=Math.floor(i/cols);
    [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]].forEach(([nx,ny])=>{
      if(nx<0||nx>=cols||ny<0||ny>=rows)return;
      const j=ny*cols+nx;
      if(open[j]&&!cells[j]&&pangLineClear(24+cx*step,24+cy*step,24+nx*step,24+ny*step,obstacles,5)){
        cells[j]=1;indices.push(j);
      }
    });
  }
  return {obstacles,reach:{step,cols,rows,cells,indices}};
}
function pangAccessible(x,y,pad=5){
  if(pangBlocked(x,y,Pg.obstacles,pad))return false;
  const r=Pg.reach;if(!r)return true;
  const cx=Math.round((x-24)/r.step),cy=Math.round((y-24)/r.step);
  for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
    const nx=cx+ox,ny=cy+oy;
    if(nx>=0&&nx<r.cols&&ny>=0&&ny<r.rows&&r.cells[ny*r.cols+nx]&&
      pangLineClear(x,y,24+nx*r.step,24+ny*r.step,Pg.obstacles,pad))return true;
  }
  return false;
}
function pangFreePoint(x,y,radius=54){
  if(pangAccessible(x,y))return {x,y};
  for(let r=18;r<=radius;r+=18)for(let j=0;j<12;j++){
    const angle=j*Math.PI/6,tx=x+Math.cos(angle)*r,ty=y+Math.sin(angle)*r;
    if(pangAccessible(tx,ty))return {x:tx,y:ty};
  }
  return null;
}
function pangMove(actor,xKey,yKey,dx,dy,npc=null){
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/6));
  let hitX=false,hitY=false;
  const blocked=(x,y)=>pangBlocked(x,y,Pg.obstacles)||(npc&&(Pg.npcs||[]).some(other=>
    other!==npc&&Math.pow((x-other.x)/38,2)+Math.pow((y-other.y)/27,2)<1));
  for(let i=0;i<steps;i++){
    const x=clamp(actor[xKey]+dx/steps,24,PANG_FIELD_W-24);
    if(blocked(x,actor[yKey]))hitX=true;else actor[xKey]=x;
    const y=clamp(actor[yKey]+dy/steps,24,PANG_FIELD_H-24);
    if(blocked(actor[xKey],y))hitY=true;else actor[yKey]=y;
  }
  return {hitX,hitY};
}
function pangCreateNpcs(){
  const specs=[['smoker',510,470,174,.24,2200,5600],['coffee',730,660,180,3.7,3600,6200],
    ['child',980,470,168,-.8,4200,7800],['smoker',1270,730,188,2.8,4800,5600],
    ['coffee',1470,370,182,2.1,5400,6200],['child',320,240,176,.65,3100,7800]];
  return specs.map(([kind,x,y,speed,angle,nextDrop,period],id)=>{
    const p=pangFreePoint(x,y,90);
    if(!p)throw new Error('Plogging NPC spawn has no reachable ground');
    return {id,kind,x:p.x,y:p.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
      nextDrop,period,turnAt:1100+id*240,drop:null,face:'south',moving:false,stride:0};
  });
}
function pangNpcAction(n){
  if(!n.drop)return n.moving?'walk':'idle';
  const elapsed=Pg.t-n.drop.start;
  if(n.kind==='child')return elapsed<500?'open':elapsed<1100?'eat':'toss';
  const timing=PANG_NPC_TIMING[n.kind];
  return elapsed<timing.prepare?'prepare':elapsed<timing.toss?'toss':'recover';
}

function pangHTML(){
  const theme=(S.themeId&&ECO_ART[S.themeId])?S.themeId:'forest';
  const art=ECO_ART[theme][S.gauge>=100?'after':'before'];
  return `<div class="pang" id="pangRoot">
    <div class="pangtop"><strong>🧹 플로킹을 해보자</strong><span class="grow"></span>
      <span>수거 <b id="pgLeft">0</b> / ${PANG_GOAL}개</span>
      <span>⏱ <b id="pgTime">75</b>초</span><span class="hearts" id="pgHearts">❤️❤️❤️</span></div>
    <div class="pangwrap" style="background-image:url('${art}')"><canvas id="pangCanvas" width="${PANG_W}" height="${PANG_H}" aria-label="쓰레기를 줍는 플로킹 필드"></canvas>
      <div class="pang-intro" id="pgIntro"><div class="pang-intro-card"><h2>플로킹을 해보자</h2>
        <p>길에 버려진 쓰레기를 주워 깨끗하게 만들어 보세요!</p>
        <p>나무와 바위를 피해 쓰레기 ${PANG_GOAL}개를 모으세요.<br>돌아다니는 방해 NPC와 부딪히면 하트가 줄어요.<br>NPC가 버린 꽁초·컵·과자봉지도 안전하게 주울 수 있어요!</p>
        <button class="btn" type="button" onclick="pangStart()">시작하기</button></div></div>
      <div class="pang-message" id="pgMessage" aria-live="polite"></div></div>
    <div class="pangctrl"><div class="side" aria-label="이동 버튼">
      <button class="pbtn" type="button" data-p="u" aria-label="위로 이동">▲</button>
      <button class="pbtn" type="button" data-p="l" aria-label="왼쪽으로 이동">◀</button>
      <button class="pbtn" type="button" data-p="d" aria-label="아래로 이동">▼</button>
      <button class="pbtn" type="button" data-p="r" aria-label="오른쪽으로 이동">▶</button></div>
      <small>방향키 · WASD · 화면을 누른 채 이동</small></div><div id="pgResult"></div>
  </div>`;
}

function pangRandom(){
  Pg.seed=(Math.imul(Pg.seed,1664525)+1013904223)>>>0;
  return Pg.seed/4294967296;
}
function pangTrash(kind,x,y){
  if(Pg.trash.length>=75)return null;
  const p=pangFreePoint(clamp(x,30,PANG_FIELD_W-30),clamp(y,30,PANG_FIELD_H-30));
  if(!p)return null;
  const item={kind,x:p.x,y:p.y};Pg.trash.push(item);return item;
}
function pangScatter(){
  const solids=PANG_DECOR.filter(d=>PANG_FOOTPRINTS[d[0]]);
  const zoneW=(PANG_FIELD_W-110)/3,zoneH=(PANG_FIELD_H-130)/2;
  for(let i=0;i<PANG_INITIAL_TRASH;i++){
    // Spread a smaller supply across six areas, including reachable obstacle edges.
    const zone=i%6,left=55+(zone%3)*zoneW,top=65+Math.floor(zone/3)*zoneH;
    const inZone=(x,y)=>x>=left&&x<left+zoneW&&y>=top&&y<top+zoneH;
    const nearby=solids.filter(([,x,y])=>inZone(x,y-8));
    const valid=(x,y)=>inZone(x,y)&&pangAccessible(x,y)&&dist(x,y,Pg.px,Pg.py)>=130&&
      Pg.trash.every(t=>dist(x,y,t.x,t.y)>=PANG_TRASH_GAP)&&Pg.npcs.every(n=>dist(x,y,n.x,n.y)>=48);
    let p=null;
    for(let tries=0;tries<40&&!p;tries++){
      let x=left+pangRandom()*zoneW,y=top+pangRandom()*zoneH;
      if(i<16&&tries<3&&nearby.length){
        const [key,ox,oy,size]=nearby[(Math.floor(i/6)+tries)%nearby.length];
        x=ox+((i+tries)%2?1:-1)*(size*PANG_FOOTPRINTS[key][0]/2+32);y=oy-8;
      }
      if(valid(x,y))p={x,y};
    }
    if(!p&&Pg.reach){
      const r=Pg.reach;
      for(const idx of r.indices){
        const x=24+(idx%r.cols)*r.step,y=24+Math.floor(idx/r.cols)*r.step;
        if(valid(x,y)){p={x,y};break;}
      }
    }
    if(p)pangTrash(PANG_TRASH[i%PANG_TRASH.length],p.x,p.y);
  }
}
function pangBind(target,type,handler){
  target.addEventListener(type,handler);
  Pg.off.push(()=>target.removeEventListener(type,handler));
}
function mountPang(){
  pangStop();
  S.modal='pang';
  const host=$('modalHost');if(!host)return;
  host.innerHTML=pangHTML();
  const canvas=$('pangCanvas'),ctx=canvas&&canvas.getContext('2d');
  if(!ctx){$('pgIntro').innerHTML='<div class="pang-intro-card"><h2>화면을 열지 못했어요</h2><button class="btn" onclick="leaveBattle()">돌아가기</button></div>';return;}
  const extra=Math.min(PANG_RETRY_BONUS,S.defeatStreak||0);
  Pg={canvas,ctx,px:340,py:550,face:'south',moving:false,keys:{l:false,r:false,u:false,d:false},target:null,
    trash:[],npcs:[],
    count:0,hearts:3+extra,maxHearts:3+extra,inv:0,t:0,limit:PANG_LIMIT,started:false,over:false,
    raf:null,last:0,off:[],seed:(Date.now()>>>0)||1,imgs:{},trashArt:{},backdrop:null,backdropKey:'',message:'',messageUntil:0,cx:0,cy:0};
  const field=pangBuildField();Pg.obstacles=field.obstacles;Pg.reach=field.reach;
  Pg.npcs=pangCreateNpcs();pangScatter();
  document.querySelectorAll('#pangRoot .pbtn').forEach(b=>{
    const k=b.dataset.p;
    pangBind(b,'pointerdown',e=>{e.preventDefault();if(!Pg||!Pg.started||Pg.over)return;
      b.setPointerCapture?.(e.pointerId);Pg.target=null;Pg.keys[k]=true;});
    const up=()=>{if(Pg)Pg.keys[k]=false;};
    pangBind(b,'pointerup',up);pangBind(b,'pointercancel',up);pangBind(b,'lostpointercapture',up);
  });
  const aim=e=>{
    const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/PANG_W,r.height/PANG_H);
    const ox=(r.width-PANG_W*scale)/2,oy=(r.height-PANG_H*scale)/2;
    Pg.target={x:clamp((e.clientX-r.left-ox)/scale+Pg.cx,24,PANG_FIELD_W-24),
      y:clamp((e.clientY-r.top-oy)/scale+Pg.cy-18,24,PANG_FIELD_H-24)};
  };
  pangBind(canvas,'pointerdown',e=>{if(!Pg||!Pg.started||Pg.over)return;e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);aim(e);});
  pangBind(canvas,'pointermove',e=>{if(Pg&&Pg.started&&e.buttons){e.preventDefault();aim(e);}});
  const stopAim=()=>{if(Pg)Pg.target=null;};
  pangBind(canvas,'pointerup',stopAim);pangBind(canvas,'pointercancel',stopAim);
  pangBind(window,'blur',()=>{if(Pg){Pg.keys={l:false,r:false,u:false,d:false};Pg.target=null;Pg.last=0;}});
  pangBind(document,'visibilitychange',()=>{if(Pg&&document.hidden)Pg.last=0;});
  paintPangHud();pangDraw();
}
function pangStart(){
  if(!Pg||Pg.started||Pg.over)return;
  Pg.started=true;Pg.last=performance.now();$('pgIntro').hidden=true;
  pangNote('쓰레기를 주워 깨끗하게 만들어요!');
  Pg.raf=requestAnimationFrame(pangStep);
}
function pangKey(k,down){
  if(!Pg||!Pg.started||Pg.over)return;
  const map={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d',a:'l',A:'l',d:'r',D:'r',w:'u',W:'u',s:'d',S:'d'};
  if(map[k]){Pg.keys[map[k]]=down;if(down)Pg.target=null;}
}
function pangNote(text){
  if(!Pg)return;
  Pg.message=text;Pg.messageUntil=Pg.t+1500;
  const box=$('pgMessage');if(box)box.textContent=text;
}
function paintPangHud(){
  if(!Pg)return;
  const hearts='❤️'.repeat(Math.max(0,Pg.hearts))+'🖤'.repeat(Math.max(0,Pg.maxHearts-Pg.hearts));
  const values={pgHearts:hearts,pgLeft:String(Pg.count),pgTime:String(Math.max(0,Math.ceil((Pg.limit-Pg.t)/1000)))};
  Object.keys(values).forEach(id=>{const el=$(id);if(el&&el.textContent!==values[id])el.textContent=values[id];});
}
function pangStep(now){
  if(!Pg||S.modal!=='pang'){pangStop();return;}
  const dt=Math.min(34,Math.max(0,now-Pg.last));Pg.last=now;
  if(!Pg.over)pangUpdate(dt);
  if(Pg)pangDraw();
  if(Pg&&!Pg.over)Pg.raf=requestAnimationFrame(pangStep);
}
function pangDamage(reason,x,y){
  if(!Pg||Pg.inv>0||Pg.over)return;
  Pg.hearts--;Pg.inv=900;
  const d=dist(Pg.px,Pg.py,x,y)||1;
  pangMove(Pg,'px','py',(Pg.px===x?1:(Pg.px-x)/d)*27,(Pg.py-y)/d*27);
  pangNote(reason);paintPangHud();
  if(Pg.hearts<=0)pangLose('heart');
}
function pangNpcTouchesHero(a,n){
  const dx=(a.px-n.x)/21,dy=(a.py-n.y)/15;
  return dx*dx+dy*dy<1;
}
function pangUpdate(dt){
  const a=Pg;a.t+=dt;a.inv=Math.max(0,a.inv-dt);
  if(a.t>=a.limit){paintPangHud();if(a.count>=PANG_GOAL)pangWin();else pangLose('time');return;}
  let dx=(a.keys.r?1:0)-(a.keys.l?1:0),dy=(a.keys.d?1:0)-(a.keys.u?1:0);
  if(!dx&&!dy&&a.target){dx=a.target.x-a.px;dy=a.target.y-a.py;if(Math.hypot(dx,dy)<9){a.target=null;dx=dy=0;}}
  const d=Math.hypot(dx,dy),oldX=a.px,oldY=a.py;
  if(d){pangMove(a,'px','py',dx/d*285*dt/1000,dy/d*285*dt/1000);
    a.face=Math.abs(dx)>Math.abs(dy)?(dx>0?'east':'west'):(dy>0?'south':'north');}
  a.moving=dist(oldX,oldY,a.px,a.py)>.01;
  a.npcs.forEach(n=>{
    const oldX=n.x,oldY=n.y;
    if(n.drop){
      const child=n.kind==='child',timing=PANG_NPC_TIMING[n.kind];
      const release=child?1350:timing.release,duration=child?1650:timing.duration;
      if(!n.drop.spawned&&a.t>=n.drop.start+release){
        const item=pangTrash(n.kind==='smoker'?'butt':child?'wrapper':'cup',
          n.x+(n.face==='west'||n.face==='south'?-22:22),n.y+9);
        n.drop.spawned=true;if(item)pangNote('버려진 쓰레기를 다시 주워요!');
      }
      if(a.t>=n.drop.start+duration){n.drop=null;n.nextDrop=a.t+n.period*(a.t>40000?.82:1);}
    }else if(a.t>=n.nextDrop){
      n.drop={start:a.t,spawned:false};
    }else{
      if(a.t>=(n.turnAt||Infinity)){
        const angle=(pangRandom()-.5)*1.4,cos=Math.cos(angle),sin=Math.sin(angle);
        const vx=n.vx,vy=n.vy;n.vx=vx*cos-vy*sin;n.vy=vx*sin+vy*cos;
        n.turnAt=a.t+1400+pangRandom()*1700;
      }
      const speed=a.t>40000?1.08:1;
      if((n.x<=55&&n.vx<0)||(n.x>=PANG_FIELD_W-55&&n.vx>0))n.vx=-n.vx;
      if((n.y<=65&&n.vy<0)||(n.y>=PANG_FIELD_H-65&&n.vy>0))n.vy=-n.vy;
      const hit=pangMove(n,'x','y',n.vx*speed*dt/1000,n.vy*speed*dt/1000,n);
      if(hit.hitX)n.vx=-n.vx;
      if(hit.hitY)n.vy=-n.vy;
      if(hit.hitX||hit.hitY)n.turnAt=a.t+600;
    }
    n.moving=dist(oldX,oldY,n.x,n.y)>.01;
    n.stride=(n.stride||0)+dist(oldX,oldY,n.x,n.y);
    n.face=Math.abs(n.vx)>Math.abs(n.vy)?(n.vx<0?'west':'east'):(n.vy<0?'north':'south');
    if(pangNpcTouchesHero(a,n))pangDamage('조심해요! 방해 인물과 부딪혔어요!',n.x,n.y);
  });
  if(a.over)return;
  for(let i=a.trash.length-1;i>=0;i--){const item=a.trash[i];
    if(dist(a.px,a.py,item.x,item.y)>29)continue;
    a.trash.splice(i,1);a.count++;
    if(a.count%3===0)pangNote(['깨끗해졌어요!','좋아요!','플로킹 성공!','쓰레기 하나 수거!'][Math.floor(a.count/3)%4]);
    paintPangHud();if(a.count>=PANG_GOAL){pangWin();return;}
  }
  if(a.message&&a.t>=a.messageUntil){a.message='';const box=$('pgMessage');if(box)box.textContent='';}
  paintPangHud();
}
function pangImage(key,src){
  if(!src)return null;
  const old=Pg.imgs[key];if(old&&old.src===new URL(src,document.baseURI).href)return old;
  const img=new Image();img.src=src;Pg.imgs[key]=img;return img;
}
function pangDrawHero(c){
  const a=Pg,x=a.px-a.cx,y=a.py-a.cy,dir=a.face,body=pangImage('body',heroImg(bodyKey(dir))),head=pangImage('head',heroImg(headKey(dir)));
  c.save();if(a.inv>0&&Math.floor(a.t/90)%2===0)c.globalAlpha=.42;
  c.fillStyle='rgba(45,39,31,.28)';c.beginPath();c.ellipse(x,y+3,22,6,0,0,Math.PI*2);c.fill();
  if(dir==='east'){c.translate(x,0);c.scale(-1,1);c.translate(-x,0);}
  if(body&&body.complete&&body.naturalWidth){const sw=body.naturalWidth/9,frame=a.moving?1+Math.floor(a.t/105)%8:0;
    c.drawImage(body,sw*frame,0,sw,body.naturalHeight,x-42,y-78,84,84);}
  else{c.fillStyle='#c3dd8b';c.fillRect(x-17,y-38,34,38);c.fillStyle='#f0c394';c.fillRect(x-11,y-54,22,20);}
  if(head&&head.complete&&head.naturalWidth)c.drawImage(head,x-42,y-78,84,84);
  c.restore();
}
function pangDrawShadow(c,x,y,w,h,opacity=1){
  if(!Pg.shadowArt){
    const art=document.createElement('canvas');art.width=64;art.height=24;
    const sc=art.getContext('2d');
    sc.translate(32,12);sc.scale(1,.375);
    const gradient=sc.createRadialGradient(0,0,0,0,0,32);
    gradient.addColorStop(0,'rgba(35,29,22,.30)');
    gradient.addColorStop(.45,'rgba(35,29,22,.19)');
    gradient.addColorStop(1,'rgba(35,29,22,0)');
    sc.fillStyle=gradient;sc.beginPath();sc.arc(0,0,32,0,Math.PI*2);sc.fill();
    Pg.shadowArt=art;
  }
  c.save();c.globalAlpha*=opacity;c.imageSmoothingEnabled=true;
  c.drawImage(Pg.shadowArt,x-w/2,y-h/2,w,h);c.restore();
}
function pangDrawNpc(c,n){
  const x=Math.round(n.x-Pg.cx),y=Math.round(n.y-Pg.cy),child=n.kind==='child';
  if(x<-90||y<-120||x>PANG_W+90||y>PANG_H+90)return;
  const img=pangImage(n.kind+'Sheet',PANG_NPC_ART[n.kind]);
  const col={south:0,north:1,west:2,east:3}[n.face]||0;
  const action=pangNpcAction(n);
  const row=child?({idle:0,walk:Math.floor((n.stride||0)/30)%2,open:2,eat:3,toss:4}[action]):
    ({idle:0,walk:Math.floor((n.stride||0)/30)%2,prepare:2,toss:3,recover:4}[action]);
  pangDrawShadow(c,x,y+1,child?30:38,child?8:10);
  if(img&&img.complete&&img.naturalWidth){
    const rows=PANG_NPC_ROWS[n.kind],sy=rows?rows[row][0]:row*img.naturalHeight/5;
    const sw=img.naturalWidth/4,sh=rows?rows[row][1]-sy:img.naturalHeight/5,w=child?72:86;
    const h=(child?88:104)*sh/(img.naturalHeight/5);
    const feet=PANG_NPC_FEET[n.kind]?.[row]?.[col]||.90;
    c.drawImage(img,col*sw,sy,sw,sh,x-w/2,y-feet*h,w,h);
  }
  const label=n.kind==='smoker'?'꽁초 버리는 아저씨':child?'과자 먹는 어린이':'컵 버리는 아가씨';
  c.font='bold 13px "Do Hyeon",sans-serif';c.textAlign='center';
  const lw=c.measureText(label).width+16;
  const labelY=y-(child?103:n.kind==='smoker'?134:119);
  c.fillStyle='rgba(34,30,38,.86)';c.fillRect(x-lw/2,labelY,lw,22);
  c.fillStyle='#fff4d5';c.fillText(label,x,labelY+16);
}
function pangTrashSprite(kind){
  if(Pg.trashArt[kind])return Pg.trashArt[kind];
  const art=document.createElement('canvas');art.width=48;art.height=48;
  const c=art.getContext('2d');c.lineJoin='round';c.lineCap='round';c.lineWidth=2.2;
  const shape=(pts,fill,stroke='#4c4240')=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}};
  const line=(pts,col,w=1.5)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=col;c.lineWidth=w;c.stroke();};
  if(kind==='bottle'){
    shape([[20,4],[28,4],[28,10],[31,13],[33,36],[29,41],[19,41],[15,36],[17,13],[20,10]],'#82bccc','#3b5f69');
    shape([[19,23],[30,23],[31,32],[17,32]],'#e5eece','#5b7770');
    shape([[20,3],[28,3],[28,8],[20,8]],'#3979a6','#31546b');
    line([[21,12],[19,20],[20,36]],'#d9f5ef',2.5);line([[27,14],[29,20]],'#568eaa');
  }else if(kind==='can'){
    shape([[15,8],[32,8],[34,12],[33,38],[29,41],[18,41],[14,37],[14,12]],'#d6e2df','#53646d');
    shape([[15,19],[33,19],[33,31],[15,31]],'#d75c4d','#783f45');
    line([[18,22],[27,22],[23,28]],'#ffd594',2);line([[18,35],[30,35]],'#f7faf0',2);
    shape([[16,7],[31,7],[34,10],[14,10]],'#abb9ba','#53646d');
    line([[21,9],[27,9]],'#647476',2);
  }else if(kind==='wrapper'){
    shape([[8,15],[13,18],[17,15],[34,15],[38,19],[40,34],[34,31],[31,35],[13,35],[9,31],[6,33]],'#f4bd4d','#855b46');
    shape([[15,18],[32,18],[34,31],[14,31]],'#e56652','#8d483f');
    shape([[19,20],[26,20],[29,25],[26,29],[19,29],[17,25]],'#fce7a7',null);
    line([[10,21],[12,28]],'#fff1b5',2);line([[36,22],[37,29]],'#fff1b5',2);
  }else if(kind==='bag'){
    shape([[7,15],[13,11],[17,17],[30,17],[34,11],[41,15],[37,24],[35,39],[13,41],[10,26]],'#ede3cf','#786c67');
    shape([[11,18],[17,21],[31,21],[37,18],[34,37],[14,38]],'#d4c6b4',null);
    line([[17,23],[16,34],[20,38]],'#fff7e8',2.5);line([[31,23],[32,35]],'#a5988a',2);
    line([[19,14],[29,14]],'#95877c',2);
  }else if(kind==='paper'){
    shape([[12,8],[29,7],[37,15],[35,39],[15,40],[10,33]],'#f9ecd3','#8d7966');
    shape([[29,7],[29,16],[37,15]],'#ddcbb1','#8d7966');
    line([[16,21],[29,21]],'#94a7a1',2);line([[16,26],[31,26]],'#94a7a1',2);line([[16,31],[27,31]],'#94a7a1',2);
    line([[13,36],[17,38],[31,37]],'#fffaf0',1.5);
  }else if(kind==='cap'){
    shape([[9,22],[14,17],[32,17],[39,22],[37,34],[32,38],[15,38],[10,34]],'#477fbe','#344f70');
    shape([[13,19],[34,19],[37,23],[11,23]],'#8bb8df','#344f70');
    line([[14,27],[34,27]],'#a9d3ed',2);line([[17,32],[31,32]],'#2d6093',2);
    [[14,23],[34,23],[13,32],[35,32]].forEach(p=>line([[p[0],p[1]],[p[0]+1,p[1]+2]],'#2d6093',1));
  }else if(kind==='butt'){
    shape([[7,22],[35,19],[36,26],[8,29]],'#eee8d3','#756b5f');
    shape([[27,20],[36,19],[36,26],[28,27]],'#c88351','#895b48');
    line([[11,24],[20,23]],'#ffffff',2);line([[34,20],[37,18]],'#4a4846',2);
  }else if(kind==='cup'){
    shape([[12,13],[36,13],[32,39],[16,39]],'#f2e3ce','#756254');
    shape([[13,22],[35,22],[34,30],[14,30]],'#ad6852','#694b43');
    shape([[10,11],[38,11],[38,15],[10,15]],'#58483e','#433c39');
    shape([[17,7],[31,7],[35,11],[13,11]],'#e5d4bc','#665749');
    line([[19,17],[17,37]],'#fff9e6',2.5);line([[28,33],[31,33]],'#d5a887',2);
  }
  Pg.trashArt[kind]=art;return art;
}
function pangDrawTrash(c,item){
  const x=Math.round(item.x-Pg.cx),y=Math.round(item.y-Pg.cy);
  if(x<-35||y<-45||x>PANG_W+35||y>PANG_H+35)return;
  c.fillStyle='rgba(46,38,30,.23)';c.beginPath();c.ellipse(x,y+10,19,5,0,0,Math.PI*2);c.fill();
  c.drawImage(pangTrashSprite(item.kind),x-24,y-34,48,48);
}
function pangDrawGround(c,a){
  const theme=(S.themeId&&ECO_ART[S.themeId])?S.themeId:'forest';
  const phase=S.gauge>=100?'after':'before';
  const ground=pangImage('ground',ECO_ART[theme][phase]);
  const width=c.canvas.width,height=c.canvas.height;
  c.fillStyle=theme==='forest'?'#a99c70':'#a5a68c';c.fillRect(0,0,width,height);
  if(ground&&ground.complete&&ground.naturalWidth){
    for(let x=Math.floor(a.cx/768)*768;x<a.cx+width;x+=768)
      for(let y=Math.floor(a.cy/768)*768;y<a.cy+height;y+=768)
        c.drawImage(ground,Math.round(x-a.cx),Math.round(y-a.cy),768,768);
  }
  // The main world uses a warm, edged walking route over its illustrated ground.
  c.save();c.translate(-a.cx,-a.cy);
  c.beginPath();c.moveTo(0,453);c.bezierCurveTo(360,475,580,467,850,450);
  c.bezierCurveTo(1180,434,1470,470,1700,458);
  c.lineTo(1700,621);c.bezierCurveTo(1350,621,1130,588,840,608);
  c.bezierCurveTo(540,628,270,614,0,622);c.closePath();
  c.fillStyle='#7e704e';c.fill();
  c.save();c.clip();c.translate(0,5);
  c.fillStyle='#b6a377';c.fillRect(0,440,PANG_FIELD_W,190);
  c.fillStyle='rgba(240,215,157,.27)';
  for(let x=40;x<PANG_FIELD_W;x+=137){c.beginPath();c.ellipse(x,506+(x%4)*23,31,9,-.22,0,Math.PI*2);c.fill();}
  c.fillStyle='rgba(86,75,53,.18)';
  for(let x=80;x<PANG_FIELD_W;x+=191){c.beginPath();c.ellipse(x,545+(x%3)*14,12,5,0,0,Math.PI*2);c.fill();}
  c.restore();c.restore();
}
function pangDrawScenery(c,a){
  PANG_DECOR.forEach(([key,wx,wy,size])=>{
    const x=wx-a.cx,y=wy-a.cy;if(x<-size||x>PANG_W+size||y<-size||y>PANG_H+size)return;
    const src=key==='pr_fence'?SPRITES.pr_fence:ecoScenerySource(key);
    const img=pangImage('scenery:'+key,src);
    if(!img||!img.complete||!img.naturalWidth)return;
    const natural=SPR_SIZE[ecoSceneryKey(key)]||SPR_SIZE[key]||[64,64];
    const h=size*natural[1]/natural[0];
    const footprint=PANG_FOOTPRINTS[key];
    if(footprint){
      const slot=PANG_SCENERY_SLOT[key],feet=slot===undefined?PANG_PROP_FEET[key]:
        (PANG_SCENERY_FEET[S.themeId]||PANG_SCENERY_FEET.forest)[slot];
      pangDrawShadow(c,x+2,y-h*(1-feet)+1,size*footprint[0]+8,
        key==='pr_fence'?5:key==='pr_pine'||key==='pr_round'?8:10,key==='pr_fence'?.55:.65);
    }
    c.drawImage(img,Math.round(x-size/2),Math.round(y-h),size,h);
  });
}
function pangDraw(){
  if(!Pg)return;
  const a=Pg,c=a.ctx;
  a.cx=clamp(a.px-PANG_W/2,0,PANG_FIELD_W-PANG_W);a.cy=clamp(a.py-PANG_H/2,0,PANG_FIELD_H-PANG_H);
  c.imageSmoothingEnabled=true;
  const theme=(S.themeId&&ECO_ART[S.themeId])?S.themeId:'forest';
  const phase=S.gauge>=100?'after':'before',ground=pangImage('ground',ECO_ART[theme][phase]);
  const backdropKey=theme+'|'+phase;
  if(ground&&ground.complete&&ground.naturalWidth&&a.backdropKey!==backdropKey){
    const backing=document.createElement('canvas');backing.width=PANG_FIELD_W;backing.height=PANG_FIELD_H;
    pangDrawGround(backing.getContext('2d'),{cx:0,cy:0});
    a.backdrop=backing;a.backdropKey=backdropKey;
  }
  if(a.backdrop)c.drawImage(a.backdrop,a.cx,a.cy,PANG_W,PANG_H,0,0,PANG_W,PANG_H);
  else pangDrawGround(c,a);
  pangDrawScenery(c,a);
  c.imageSmoothingEnabled=false;
  a.trash.forEach(item=>pangDrawTrash(c,item));
  a.npcs.forEach(n=>pangDrawNpc(c,n));
  pangDrawHero(c);
  c.strokeStyle='#7e704e';c.lineWidth=5;c.strokeRect(-a.cx,-a.cy,PANG_FIELD_W,PANG_FIELD_H);
}
function pangStop(){
  if(!Pg)return;
  if(Pg.raf){cancelAnimationFrame(Pg.raf);Pg.raf=null;}
  (Pg.off||[]).forEach(fn=>fn());Pg.off=[];Pg.keys={l:false,r:false,u:false,d:false};Pg.target=null;
}
function pangWin(){
  if(!Pg||Pg.over||S.modal!=='pang')return;
  Pg.over=true;pangStop();
  if(Tw.on)return miniWin('pgResult',`플로킹 성공! · 수거한 쓰레기 <b>${Pg.count}개</b>`);
  const m=curMon();S.defeatStreak=0;S.encounterWon=true;
  const gaugeGot=addGauge(m.gauge);S.gold+=m.gold;addExp(m.exp);
  const drop=rollDrop(m);autosave();
  const last=S.monIdx>=CUR.monsters.length-1,host=$('pgResult');if(!host)return;
  host.innerHTML=`<div class="back on"><div class="sheet">
    <div class="mhead"><span>🎉 플로킹 성공!</span></div>
    <div class="card">주변이 한결 깨끗해졌어요!<br>작은 실천이 깨끗한 환경을 만들어요.<br>
      수거한 쓰레기: <b>${Pg.count}개</b> · 걸린 시간 <b>${Math.round(Pg.t/1000)}초</b><br>
      정화 게이지 <b style="color:var(--green)">+${gaugeGot}%</b><br>
      골드 <b>+${m.gold}</b> · 경험치 <b>+${m.exp}</b><br>
      ${drop?`장비 획득! <b style="color:var(--gold)">${drop.item.name}</b> (${GEAR_LABEL[drop.slot]}) — 자동 장착`:'장비는 나오지 않았어요'}</div>
    <div class="dialogue"><div class="who">🧚 에코</div>${m.after}</div>
    <div class="note">플로킹은 산책이나 운동을 하며 쓰레기를 줍는 활동이에요.</div>
    ${last?`<button class="btn" onclick="endBattleAll()">${CUR.name}${JRO(CUR.name)} 돌아가기</button>`:
      `<div class="row"><button class="btn" onclick="nextMonster()">계속하기</button>
      <button class="btn sec" onclick="pauseBattle()">💧 나가서 회복하기</button></div>`}
  </div></div>`;
}
function pangLose(reason){
  if(Tw.on){pangStop();towerRetire('faint');return;}
  if(!Pg||Pg.over||S.modal!=='pang')return;
  Pg.over=true;pangStop();
  const m=curMon();S.defeatStreak++;
  const solace=Math.max(3,Math.round(m.exp*.3));addExp(solace);autosave();
  const host=$('pgResult');if(!host)return;
  host.innerHTML=`<div class="back on"><div class="sheet">
    <div class="mhead"><span>💫 조금 아쉬워요!</span></div>
    <div class="dialogue"><div class="who">🧚 에코</div>
      ${reason==='heart'?'방해를 너무 많이 받았어요! 조심해서 다시 플로킹에 도전해 보세요.':'아직 치우지 못한 쓰레기가 남아 있어요.'}<br>
      다시 도전해서 더 깨끗하게 만들어 볼까요?</div>
    <div class="card">수거한 쓰레기: <b>${Pg.count}개</b><br>경험치 <b>+${solace}</b> 얻었어요.<br>
      다시 도전하면 하트 ${3+PANG_RETRY_BONUS}개로 시작해요!</div>
    <div class="row"><button class="btn" onclick="retryPang()">다시 도전</button>
      <button class="btn sec" onclick="respawn()">${CUR.name}${JRO(CUR.name)} 돌아가기</button></div>
  </div></div>`;
}
function retryPang(){pangStop();wipeIn(mountPang);}
