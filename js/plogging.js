/* The existing `pang` encounter ID now plays a self-contained plogging game.
   Only Pg is transient; rewards and saves still use the original game flow. */
var PANG_W=960, PANG_H=540, PANG_FIELD_W=1700, PANG_FIELD_H=1080;
var PANG_GOAL=20, PANG_LIMIT=75000;
var PANG_TRASH=['bottle','can','wrapper','bag','paper','cap'];
var PANG_NPC_ART={smoker:'./assets/images/characters/plogging_smoker_sheet.png',coffee:'./assets/images/characters/plogging_coffee_sheet.png'};
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
  ['pr_fence',141,661,58],['pr_fence',197,661,58]
];

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
        <p>이동하며 다양한 쓰레기를 모으세요.<br>쓰레기를 버리는 사람과 부딪히면 하트가 줄어요.<br>제한 시간 안에 최대한 많은 쓰레기를 수거해 보세요!</p>
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
  if(Pg.trash.length>=75)return;
  Pg.trash.push({kind:kind,x:clamp(x,30,PANG_FIELD_W-30),y:clamp(y,30,PANG_FIELD_H-30)});
}
function pangScatter(){
  for(let i=0;i<42;i++){
    let x,y,tries=0;
    do{x=55+pangRandom()*(PANG_FIELD_W-110);y=65+pangRandom()*(PANG_FIELD_H-130);tries++;}
    while(tries<15 && (dist(x,y,Pg.px,Pg.py)<65 || Pg.trash.some(t=>dist(x,y,t.x,t.y)<34)));
    pangTrash(PANG_TRASH[i%PANG_TRASH.length],x,y);
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
  const extra=Math.min(2,S.defeatStreak||0);
  Pg={canvas,ctx,px:340,py:550,face:'south',moving:false,keys:{l:false,r:false,u:false,d:false},target:null,
    trash:[],npcs:[{kind:'smoker',x:480,y:470,vx:54,vy:27,nextDrop:2300,period:3000,turnAt:1400,drop:null},
      {kind:'coffee',x:790,y:690,vx:-48,vy:33,nextDrop:3400,period:3400,turnAt:1900,drop:null}],
    count:0,hearts:3+extra,maxHearts:3+extra,inv:0,t:0,limit:PANG_LIMIT,started:false,over:false,
    raf:null,last:0,off:[],seed:(Date.now()>>>0)||1,imgs:{},trashArt:{},backdrop:null,backdropKey:'',message:'',messageUntil:0,cx:0,cy:0};
  pangScatter();
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
  Pg.px=clamp(Pg.px+(Pg.px===x?1:(Pg.px-x)/d)*27,24,PANG_FIELD_W-24);
  Pg.py=clamp(Pg.py+(Pg.py-y)/d*27,24,PANG_FIELD_H-24);
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
  const d=Math.hypot(dx,dy);a.moving=d>0;
  if(d){a.px=clamp(a.px+dx/d*285*dt/1000,24,PANG_FIELD_W-24);
    a.py=clamp(a.py+dy/d*285*dt/1000,24,PANG_FIELD_H-24);
    a.face=Math.abs(dx)>Math.abs(dy)?(dx>0?'east':'west'):(dy>0?'south':'north');}
  a.npcs.forEach(n=>{
    if(n.drop){
      if(!n.drop.spawned&&a.t>=n.drop.start+330){
        pangTrash(n.kind==='smoker'?'butt':'cup',n.x+(n.face==='west'?-22:22),n.y+9);
        n.drop.spawned=true;pangNote('버려진 쓰레기를 다시 주워요!');
      }
      if(a.t>=n.drop.start+760){n.drop=null;n.nextDrop=a.t+n.period*(a.t>40000?.82:1);}
    }else if(a.t>=n.nextDrop){
      n.drop={start:a.t,spawned:false};
    }else{
      if(a.t>=(n.turnAt||Infinity)){
        const angle=(pangRandom()-.5)*1.4,cos=Math.cos(angle),sin=Math.sin(angle);
        const vx=n.vx,vy=n.vy;n.vx=vx*cos-vy*sin;n.vy=vx*sin+vy*cos;
        n.turnAt=a.t+1400+pangRandom()*1700;
      }
      const speed=a.t>40000?1.23:1;
      n.x+=n.vx*speed*dt/1000;n.y+=n.vy*speed*dt/1000;
      if(n.x<55||n.x>PANG_FIELD_W-55)n.vx=-n.vx;
      if(n.y<65||n.y>PANG_FIELD_H-65)n.vy=-n.vy;
      n.x=clamp(n.x,55,PANG_FIELD_W-55);n.y=clamp(n.y,65,PANG_FIELD_H-65);
    }
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
function pangDrawNpc(c,n){
  const x=Math.round(n.x-Pg.cx),y=Math.round(n.y-Pg.cy),man=n.kind==='smoker';
  if(x<-90||y<-120||x>PANG_W+90||y>PANG_H+90)return;
  const img=pangImage(n.kind+'Sheet',PANG_NPC_ART[n.kind]);
  const col={south:0,north:1,west:2,east:3}[n.face]||0;
  const dropTime=n.drop?Pg.t-n.drop.start:-1;
  const row=n.drop?(dropTime>=170&&dropTime<650?2:0):
    (Pg.started&&(n.vx||n.vy)&&Math.floor(Pg.t/170)%2?1:0);
  c.fillStyle='rgba(45,39,31,.28)';c.beginPath();c.ellipse(x,y+3,20,6,0,0,Math.PI*2);c.fill();
  if(img&&img.complete&&img.naturalWidth){
    const sw=img.naturalWidth/4,sh=img.naturalHeight/3;
    c.drawImage(img,col*sw,row*sh,sw,sh,x-43,y-101,86,104);
  }
  const label=man?'꽁초 버리는 아저씨':'컵 버리는 아가씨';
  c.font='bold 13px "Do Hyeon",sans-serif';c.textAlign='center';
  const lw=c.measureText(label).width+16;
  c.fillStyle='rgba(34,30,38,.86)';c.fillRect(x-lw/2,y-119,lw,22);
  c.fillStyle='#fff4d5';c.fillText(label,x,y-103);
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
      다음에는 하트를 하나 더 드릴게요!</div>
    <div class="row"><button class="btn" onclick="retryPang()">다시 도전</button>
      <button class="btn sec" onclick="respawn()">${CUR.name}${JRO(CUR.name)} 돌아가기</button></div>
  </div></div>`;
}
function retryPang(){pangStop();wipeIn(mountPang);}
