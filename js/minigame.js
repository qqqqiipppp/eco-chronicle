/* Eco Chronicle arcade v25. Deterministic simulation; DOM, rewards and rendering
   are separate so gameplay and lifecycle can be exercised without a browser. */
var Arc=null;
var ARC_W=960, ARC_H=480;
var ARC_THEMES={
 forest:{name:'숲',route:'고목의 회랑',rise:'세계수의 가지',top:'#9fd76b',edge:'#4d6f36',rock:'#334b40',light:'#c4fff0',prop:'pr_pine',tile:'roots',pet:'earth'},
 river:{name:'강',route:'물레방아 수로',rise:'물안개 계곡',top:'#83e9ef',edge:'#497ea0',rock:'#334f6a',light:'#c5f7ff',prop:'pr_reed',tile:'water',pet:'water'},
 ocean:{name:'바다',route:'산호빛 해안',rise:'산호의 첨탑',top:'#ffbc9d',edge:'#9c5d8a',rock:'#494565',light:'#b9fff3',prop:'pr_coral',tile:'coral',pet:'water'},
 city:{name:'도시',route:'정원 도시의 지붕',rise:'태엽 전망대',top:'#edcb83',edge:'#8d8263',rock:'#404b59',light:'#fff0b4',prop:'pr_building',tile:'metal',pet:'earth'},
 air:{name:'하늘',route:'구름다리 항로',rise:'바람의 공중정원',top:'#eef5ff',edge:'#81a4cd',rock:'#536486',light:'#d0faff',prop:'pr_turbine',tile:'cloud',pet:'water'},
 climate:{name:'기후',route:'서리꽃 능선',rise:'균형의 봉우리',top:'#b8f1e8',edge:'#6c9ea2',rock:'#44576b',light:'#e0fff0',prop:'pr_ice',tile:'ice',pet:'fire'}
};
function arcClamp(n,a,b){return Math.max(a,Math.min(b,n));}
function arcRand(seed){return function(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function arcCreate(mode,theme,ease,clean){
 var a={mode:mode,theme:theme,clean:clean||0,ease:arcClamp(ease||0,0,3),status:'ready',time:0,score:0,combo:0,bestCombo:0,energy:40,hearts:4+arcClamp(ease||0,0,2),inv:0,boost:0,flash:0,message:'',msgTime:0,particles:[],coins:[],platforms:[],hazards:[],keys:{},last:0,raf:0,off:[],imgs:{},goal:mode==='runner'?15000:3200,checkpoint:0,cpX:480};
 var random=arcRand(1041+Object.keys(ARC_THEMES).indexOf(theme)*997);
 if(mode==='runner'){
  a.x=140;a.y=398;a.vy=0;a.jumps=0;a.slide=0;a.distance=0;a.speed=255;a.grounded=true;
  // Authored patterns: every dangerous decision is separated by a safe runway.
  for(var x=1050,n=0;x<a.goal-550;x+=900,n++){
   var type=n%5;
   if(type===0||type===3) a.hazards.push({x:x,y:398,w:48,h:type===3?67:48,kind:'ground'});
   if(type===1) a.hazards.push({x:x,y:356,w:108,h:62,kind:'arch'});
   if(type===2){a.platforms.push({x:x-190,y:292,w:290,kind:'normal'});a.platforms.push({x:x+155,y:213,w:245,kind:'normal'});a.hazards.push({x:x+75,y:398,w:48,h:48,kind:'ground'});}
   if(type===4){a.hazards.push({x:x,y:398,w:54,h:55,kind:'break'});a.platforms.push({x:x-190,y:290,w:120,kind:'spring'});}
   for(var j=0;j<7;j++) a.coins.push({x:x-260+j*64,y:type===1?379:(type===2?242-Math.sin(j/6*Math.PI)*75:325-Math.sin(j/6*Math.PI)*58),taken:false});
  }
 }else{
  a.x=480;a.y=100;a.vx=0;a.vy=620;a.camera=0;a.highest=100;a.limit=100;
  a.platforms.push({x:320,y:70,w:320,base:320,kind:'normal',id:0});
  var px=390;
  for(var h=190,i=1;h<=a.goal+250;h+=104,i++){
   px=arcClamp(px+(random()-.5)*360,80,690);
   var kind=i%7===0?'spring':i%6===0?'crumble':i%4===0?'moving':'normal';
   // Safe checkpoints override special platforms every sixth landing.
   if(i%6===0)kind='checkpoint';
   else if(i%5===0)kind='crumble';
   a.platforms.push({x:px,base:px,y:h,w:kind==='checkpoint'?230:160+a.ease*12,kind:kind,id:i,phase:random()*6.28,fall:0});
   a.coins.push({x:px+80,y:h+63,taken:false});
   if(i>7&&i%5===3)a.hazards.push({x:px>400?170:790,y:h+38,w:64,h:60,kind:'fly',phase:i});
  }
 }
 return a;
}
function arcNote(a,text){a.message=text;a.msgTime=1.45;}
function arcParticles(a,x,y,color,count){for(var i=0;i<count;i++)a.particles.push({x:x,y:y,vx:Math.cos(i*2.4)*90,vy:Math.sin(i*2.4)*90,t:.55,c:color});}
function arcCollect(a,c){
 c.taken=true;a.combo++;a.bestCombo=Math.max(a.combo,a.bestCombo);a.score+=80+Math.min(a.combo,20)*10;a.energy=Math.min(100,a.energy+9);
 arcParticles(a,c.x,c.y,ARC_THEMES[a.theme].light,7);
 if(a.combo%10===0)arcNote(a,a.combo+' 연속 정화!');
}
function arcAction(a,action){
 if(!a||a.status!=='playing')return;
 if(action==='jump'&&a.mode==='runner'&&a.jumps<2){a.vy=-(a.jumps===0?630:545);a.jumps++;a.grounded=false;a.slide=0;}
 if(action==='slide'&&a.mode==='runner'&&a.grounded)a.slide=.72;
 if(action==='boost'&&a.energy>=40&&a.boost<=0){a.energy-=40;a.boost=a.mode==='runner'?1.25:.65;if(a.mode!=='runner')a.vy=920;arcNote(a,a.mode==='runner'?'정화 대시!':'정령 도약!');}
}
function arcDamage(a,why){
 if(a.inv>0||a.boost>0)return;
 a.hearts--;a.inv=1.65;a.combo=0;a.flash=.25;arcNote(a,why);
 if(a.hearts<=0)a.status='lost';
}
function arcStep(a,dt){
 if(!a||a.status!=='playing')return;
 dt=arcClamp(dt,0,.035);a.time+=dt;a.inv=Math.max(0,a.inv-dt);a.boost=Math.max(0,a.boost-dt);a.slide=Math.max(0,(a.slide||0)-dt);a.msgTime=Math.max(0,a.msgTime-dt);a.flash=Math.max(0,a.flash-dt);
 if(a.mode==='runner')arcRunStep(a,dt);else arcBounceStep(a,dt);
 a.particles=a.particles.filter(function(p){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;return p.t>0;});
}
function arcRunStep(a,dt){
 var oldY=a.y;
 a.speed=(255+Math.min(a.distance/85,100)-a.ease*13)*(a.boost>0?1.7:1);
 a.distance+=a.speed*dt;a.x=140+a.distance;
 a.vy+=1580*dt;a.y+=a.vy*dt;a.grounded=false;
 for(var p of a.platforms){if(a.vy>=0&&oldY<=p.y+2&&a.y>=p.y&&a.x+16>p.x&&a.x-16<p.x+p.w){a.y=p.y;a.vy=0;a.jumps=0;a.grounded=true;if(p.kind==='spring'){a.vy=-820;a.jumps=1;a.grounded=false;arcNote(a,'스프링 · 높은 길로!');}}}
 if(a.y>=398){a.y=398;a.vy=0;a.jumps=0;a.grounded=true;}
 if(a.keys.slide&&a.grounded)a.slide=Math.max(a.slide,.1);
 var hh=a.slide>0&&a.grounded?29:61;
 for(var o of a.hazards){
  if(o.done||Math.abs(a.x-o.x)>200)continue;
  if(a.x+17>o.x&&a.x-17<o.x+o.w&&a.y>o.y-o.h+5&&a.y-hh<o.y-3){
   if(a.boost>0){o.done=true;o.hitUntil=a.time+.28;a.score+=200;arcParticles(a,o.x,o.y-30,'#ffd784',14);arcNote(a,'정화 돌파 +200');}
   else{arcDamage(a,o.kind==='arch'?'낮게 슬라이드해 보세요!':'점프 또는 대시로 돌파!');o.done=true;}
  }
 }
 for(var c of a.coins){if(!c.taken&&Math.abs(a.x-c.x)<35&&Math.abs(a.y-hh*.5-c.y)<44)arcCollect(a,c);}
 var sector=Math.floor(a.distance/5000);
 if(sector>a.checkpoint){a.checkpoint=sector;a.energy=Math.min(100,a.energy+20);arcNote(a,'구간 '+Math.min(3,sector+1)+' · 속도를 이어가세요!');}
 if(a.distance>=a.goal&&a.status==='playing')a.status='won';
}
function arcBounceStep(a,dt){
 var oldY=a.y,dir=(a.keys.right?1:0)-(a.keys.left?1:0);
 if(a.keys.target!=null)dir=arcClamp((a.keys.target-a.x)/50,-1,1);
 a.vx+=(dir*370-a.vx)*Math.min(1,dt*12);a.x=arcClamp(a.x+a.vx*dt,28,932);
 a.vy-=1500*dt;a.y+=a.vy*dt;
 for(var p of a.platforms){
  if(p.kind==='moving')p.x=p.base+Math.sin(a.time*1.5+p.phase)*65;
  if(p.fall>0)p.fall+=dt;
  if(p.fall>.22)continue;
  if(a.vy<0&&oldY>=p.y&&a.y<=p.y&&a.x+18>p.x&&a.x-18<p.x+p.w){
   a.y=p.y;a.vy=p.kind==='spring'?870:650;
   if(p.kind==='crumble')p.fall=.001;
   // Score only first successful landing on each platform; no idle farming.
   if(!p.landed){p.landed=true;var perfect=Math.abs(a.x-(p.x+p.w/2))<30;
    a.combo=perfect?a.combo+1:0;a.bestCombo=Math.max(a.bestCombo,a.combo);a.score+=perfect?150+a.combo*25:65;
    a.energy=Math.min(100,a.energy+(perfect?10:4));
    if(perfect)arcNote(a,'중앙 착지! ×'+a.combo);
   }
   if(p.kind==='spring')arcNote(a,'스프링 도약!');
   if(p.kind==='checkpoint'&&p.y>a.checkpoint){a.checkpoint=p.y;a.cpX=p.x+p.w/2;a.energy=Math.min(100,a.energy+20);arcNote(a,'쉼터 도착 · 떨어져도 여기서!');}
   break;
  }
 }
 for(var c of a.coins){if(!c.taken&&Math.abs(a.x-c.x)<42&&Math.abs(a.y+28-c.y)<43)arcCollect(a,c);}
 for(var o of a.hazards){var ox=o.x+Math.sin(a.time*1.4+o.phase)*65;if(Math.abs(a.x-ox)<43&&Math.abs(a.y+30-o.y)<44){if(a.boost>0)o.hitUntil=a.time+.28;arcDamage(a,'오염 구름을 피해 이동해요!');}}
 a.highest=Math.max(a.highest,a.y);a.camera=Math.max(a.camera,a.y-260);
 if(a.y<a.camera-70){a.inv=0;a.boost=0;arcDamage(a,'쉼터에서 다시 도약!');if(a.status==='playing'){a.x=a.cpX;a.y=Math.max(100,a.checkpoint+20);a.vy=680;a.vx=0;a.camera=Math.max(0,a.y-210);a.keys.target=null;for(var reset of a.platforms){if(reset.y>a.checkpoint)reset.fall=0;}}}
 if(a.highest>=a.goal&&a.status==='playing')a.status='won';
 if(a.time>=a.limit&&a.status==='playing'){a.status='lost';arcNote(a,'시간이 다 되었어요. 스프링과 도약을 활용해 보세요!');}
}
function arcBind(a,target,event,fn,options){target.addEventListener(event,fn,options);a.off.push(function(){target.removeEventListener(event,fn,options);});}
function arcStop(){
 if(!Arc)return;
 cancelAnimationFrame(Arc.raf);Arc.raf=0;Arc.off.forEach(function(fn){fn();});Arc.off=[];Arc.keys={};Arc.status='closed';Arc=null;
}
function arcHTML(a){
 var runner=a.mode==='runner',t=ARC_THEMES[a.theme],record=S.arcadeRecords&&S.arcadeRecords[a.mode+'_'+a.theme]||0;
 return `<div class="back on arc-back"><section class="sheet arc-sheet" role="dialog" aria-label="${runner?'정화 질주':'정령 바운스'}">
  <header class="arc-header"><div><small>ECO ARCADE · ${t.name}</small><h2>${runner?'정화 질주':'정령 바운스'} <span>${runner?t.route:t.rise}</span></h2></div><button class="arc-icon" id="arcPause" aria-label="일시정지">Ⅱ</button><button class="arc-icon" id="arcExit" aria-label="미니게임 나가기">×</button></header>
  <div class="arc-hud"><span id="arcHearts"></span><span>점수 <b id="arcScore">0</b></span><span id="arcProgress"></span><span id="arcCombo">콤보 0</span></div>
  <div class="arc-track"><i id="arcTrack"></i></div>
  <div class="arc-stage arc-wait"><canvas id="arcCanvas" tabindex="0" width="960" height="480" aria-label="${runner?'점프와 슬라이드로 달리는 정화 코스':'발판을 타고 오르는 정령 코스'}"></canvas>
   <div id="arcOverlay" class="arc-overlay"><div class="arc-intro"><small>${a.clean>=.5?'정화된 지역':'오염된 지역'} · 최고 ${record.toLocaleString()}점</small><h3>${runner?'정화의 빛을 따라 달려요':'하늘 끝 쉼터를 향해!'}</h3>
    <p>${runner?'점프는 두 번! 길게 누르면 더 높이 뜁니다.<br>낮은 장애물은 넘고, 높이 걸린 덩굴은 슬라이드.<br>빛을 모아 대시하면 오염물을 뚫을 수 있어요.':'좌우로 움직이면 발판에서 자동으로 뛰어요.<br>발판 중앙에 착지해 콤보를 쌓고 빛을 모아요.<br>스프링과 정령 도약으로 높은 쉼터에 도전해요.'}</p>
    <div class="arc-legend"><span>${runner?'↑ / Space 점프':'← → / A D 이동'}</span><span>${runner?'↓ / S 슬라이드':'스프링 · 금빛 발판'}</span><span>${runner?'X / Shift 대시':'Space / X 도약'}</span></div>
    <button class="btn" id="arcStart">도전 시작</button></div></div>
   <div id="arcMessage" class="arc-message" aria-live="polite"></div>
  </div>
  <div class="arc-bottom"><div class="arc-energy"><span>정령 에너지 <b id="arcEnergyText">40</b> / 100</span><div><i id="arcEnergy"></i></div></div><small>${runner?'높은 길 = 빛 보너스 · 3구간 완주':'중앙 착지 = 콤보 · 쉼터에서 재출발'}</small></div>
  <div class="arc-controls">${runner?'<button data-act="jump">점프 <small>두 번 가능</small></button><button data-act="slide">슬라이드 <small>누르고 유지</small></button><button data-act="boost" class="arc-boost">정화 대시 <small>에너지 40</small></button>':'<button data-act="left" aria-label="왼쪽으로 이동">◀ <small>왼쪽</small></button><button data-act="right" aria-label="오른쪽으로 이동">▶ <small>오른쪽</small></button><button data-act="boost" class="arc-boost">정령 도약 <small>에너지 40</small></button>'}</div>
  <div id="arcResult"></div></section></div>`;
}
function arcMount(mode){
 arcStop();releaseKeys();
 var tid=Tw.on&&Tw.mon?Tw.mon.themeId:S.themeId;var theme=ARC_THEMES[tid]?tid:'forest';
 var a=arcCreate(mode,theme,Math.min(3,(pendingInterlude()?pendingInterlude().attempts:S.defeatStreak)||0),0);Arc=a;S.modal=mode;
 var host=$('modalHost');if(!host){host=document.createElement('div');host.id='modalHost';document.body.appendChild(host);}host.innerHTML=arcHTML(a);
 var canvas=$('arcCanvas');a.canvas=canvas;a.ctx=canvas.getContext('2d');
 if(!a.ctx){$('arcOverlay').innerHTML='<div class="arc-intro"><h3>그래픽 화면을 열지 못했어요</h3><p>다운로드한 HTML을 Chrome 또는 Safari에서 열어 주세요.</p><button class="btn" onclick="arcExit()">돌아가기</button></div>';return;}
 arcLoadImages(a);
 arcBind(a,$('arcStart'),'click',function(){arcStart();});
 arcBind(a,$('arcPause'),'click',function(){arcPause();});
 arcBind(a,$('arcExit'),'click',function(){arcExit();});
 var actions={ArrowUp:'jump',' ':'jump',KeyW:'jump',ArrowDown:'slide',KeyS:'slide',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',KeyX:'boost',ShiftLeft:'boost',ShiftRight:'boost'};
 function keyAction(e){return actions[e.code]||actions[e.key];}
 arcBind(a,window,'keydown',function(e){if(Arc!==a||e.isComposing)return;if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(!e.repeat)arcPause();return;}var k=keyAction(e);if(!k)return;e.preventDefault();if(a.status!=='playing')return;if(k==='left'||k==='right'){a.keys[k]=true;a.keys.target=null;}else if(!e.repeat){if(k==='slide')a.keys.slide=true;arcAction(a,a.mode==='timing'&&k==='jump'?'boost':k);}});
 arcBind(a,window,'keyup',function(e){var k=keyAction(e);if(!k)return;a.keys[k]=false;if(k==='jump'&&a.mode==='runner'&&a.vy<-330)a.vy=-330;});
 arcBind(a,window,'blur',function(){if(a.status==='playing')arcPause(true);a.keys={};});
 arcBind(a,document,'visibilitychange',function(){if(document.hidden&&a.status==='playing')arcPause(true);});
 host.querySelectorAll('[data-act]').forEach(function(b){var k=b.dataset.act;arcBind(a,b,'pointerdown',function(e){e.preventDefault();if(a.status!=='playing')return;if(b.setPointerCapture)b.setPointerCapture(e.pointerId);a.keys[k]=true;a.keys.target=null;arcAction(a,k);});function up(){a.keys[k]=false;if(k==='jump'&&a.mode==='runner'&&a.vy<-330)a.vy=-330;}arcBind(a,b,'pointerup',up);arcBind(a,b,'pointercancel',up);arcBind(a,b,'lostpointercapture',up);arcBind(a,b,'click',function(e){if(e.detail===0)arcAction(a,k);});});
 function target(e){var r=canvas.getBoundingClientRect();return arcClamp((e.clientX-r.left)*ARC_W/Math.max(1,r.width),25,935);}
 arcBind(a,canvas,'pointerdown',function(e){e.preventDefault();if(a.status!=='playing')return;if(canvas.setPointerCapture)canvas.setPointerCapture(e.pointerId);a.drag=true;if(mode==='runner')arcAction(a,'jump');else a.keys.target=target(e);});
 arcBind(a,canvas,'pointermove',function(e){if(a.drag&&mode==='timing')a.keys.target=target(e);});
 function release(){a.drag=false;a.keys.target=null;if(mode==='runner'&&a.vy<-330)a.vy=-330;}
 arcBind(a,canvas,'pointerup',release);arcBind(a,canvas,'pointercancel',release);arcBind(a,canvas,'lostpointercapture',release);
 arcPaint(a);arcHUD(a);
 function frame(t){if(Arc!==a||a.status==='closed')return;var dt=a.last?(t-a.last)/1000:0;a.last=t;
  if(!document.getElementById('arcCanvas')){arcStop();return;}
  arcStep(a,dt);arcPaint(a);arcHUD(a);
  if(a.status==='won'||a.status==='lost'){arcFinish(a);return;}
  a.raf=requestAnimationFrame(frame);
 }
 a.raf=requestAnimationFrame(frame);
}
function arcStart(){if(!Arc||Arc.status!=='ready')return;Arc.status='playing';Arc.last=0;$('arcOverlay').hidden=true;$('arcCanvas').parentElement.classList.remove('arc-wait');$('arcCanvas').focus();}
function arcPause(force){
 var a=Arc;if(!a||['playing','paused'].indexOf(a.status)<0)return;
 if(a.status==='playing'){a.status='paused';a.keys={};a.drag=false;$('arcCanvas').parentElement.classList.add('arc-wait');$('arcOverlay').hidden=false;$('arcOverlay').innerHTML='<div class="arc-intro"><small>잠깐 쉬어 가요</small><h3>일시정지</h3><p>진행 상황과 남은 시간은 그대로예요.</p><button class="btn" onclick="arcPause()">계속하기</button><button class="btn sec" onclick="arcExit()">마을로 돌아가기</button></div>';}
 else if(!force){a.status='playing';a.last=0;$('arcOverlay').hidden=true;$('arcCanvas').parentElement.classList.remove('arc-wait');}
 $('arcPause').textContent=a.status==='paused'?'▶':'Ⅱ';
}
function arcExit(){arcStop();if(typeof Tw!=='undefined'&&Tw.on){towerRetire('quit');return;}leaveBattle();}
function arcFinish(a){
 if(a.settled||Arc!==a)return;a.settled=true;cancelAnimationFrame(a.raf);a.raf=0;a.off.forEach(function(fn){fn();});a.off=[];a.keys={};
 var success=a.status==='won',score=Math.floor(a.score+a.hearts*300+(success?1000:0));
 var rank=score>=7500?'S':score>=5000?'A':score>=3000?'B':'C';
 S.arcadeRecords=S.arcadeRecords||{};var key=a.mode+'_'+a.theme;S.arcadeRecords[key]=Math.max(S.arcadeRecords[key]||0,score);
 if(success)miniWin('arcResult','<b>'+rank+' 등급 · '+score.toLocaleString()+'점</b> · 최고 콤보 '+a.bestCombo+'<br>'+ARC_THEMES[a.theme].name+' '+(a.mode==='runner'?'3구간 완주':'정상 도착')+' · '+Math.floor(a.time)+'초');
 else miniLose('arcResult',(a.message||'다음에는 더 멀리 갈 수 있어요!')+'<br>'+score.toLocaleString()+'점 · 최고 콤보 '+a.bestCombo,a.mode==='runner'?'retryRunner()':'retryTiming()');
}
function arcHUD(a){
 if(!$('arcScore'))return;
 $('arcScore').textContent=Math.floor(a.score).toLocaleString();$('arcHearts').textContent='♥'.repeat(Math.max(0,a.hearts));
 var progress=a.mode==='runner'?a.distance:a.highest;
 $('arcProgress').textContent=a.mode==='runner'?Math.floor(progress/10)+' / '+a.goal/10+' m':Math.floor(progress/10)+' / '+a.goal/10+' m · '+Math.max(0,Math.ceil(a.limit-a.time))+'초';
 $('arcCombo').textContent='콤보 '+a.combo;$('arcTrack').style.width=arcClamp(progress/a.goal*100,0,100)+'%';
 $('arcEnergyText').textContent=Math.floor(a.energy);$('arcEnergy').style.width=a.energy+'%';
 var boost=document.querySelector('[data-act="boost"]');if(boost){boost.classList.toggle('ready',a.energy>=40);boost.setAttribute('aria-disabled',String(a.energy<40));}
 $('arcMessage').textContent=a.msgTime>0?a.message:'';
}
function arcImage(a,key,src){
 if(!src)return null;if(!a.imgs[key]||a.imgs[key].src!==new URL(src,document.baseURI).href){var img=new Image();img.src=src;a.imgs[key]=img;}return a.imgs[key];
}
function arcLoadImages(a){
 var t=ARC_THEMES[a.theme];
 arcImage(a,'platform',ECO_ARCADE_ART[a.theme].platform);var battleBG=typeof ECO_BATTLE_ART!=='undefined'&&ECO_BATTLE_ART[a.theme];arcImage(a,'before',battleBG||ECO_ARCADE_ART[a.theme].before);arcImage(a,'after',battleBG||ECO_ARCADE_ART[a.theme].after);
 var pk=a.theme+'_'+t.prop;arcImage(a,'prop',SPRITES[pk]||SPRITES[t.prop]);
 a.mobKey=SPRITES[monKey(curMonIdx())]?monKey(curMonIdx()):'mob_'+a.theme+'_0';
 a.mobCombat=typeof ECO_MONSTER_ART!=='undefined'&&ECO_MONSTER_ART[a.mobKey];
 a.mobFrames=a.mobCombat?3:(SPR_FRAMES[a.mobKey]||2);
 arcImage(a,'mob',a.mobCombat||SPRITES[a.mobKey]);arcImage(a,'pet',SPRITES['pet_'+(S.petKey||t.pet)+'_'+petStage()]);
 arcImage(a,'body',heroImg(bodyKey(a.mode==='runner'?'east':'south')));arcImage(a,'head',heroImg(headKey(a.mode==='runner'?'east':'south')));
}
function arcReady(img){return img&&img.complete&&img.naturalWidth>0;}
// Same held poses as monsterIdle36 in ui.css; no stretching or frantic cycling.
function monsterFrameAt(time,frames){
 if(frames!==3)return Math.floor(Math.max(0,time)*2)%(frames||1);
 var phase=((Math.max(0,time)%2.8)/2.8);
 return phase>=.75&&phase<.84?2:phase>=.30&&phase<.45?1:0;
}
function arcDrawSprite(g,img,x,y,w,h,frames,frame){if(!arcReady(img))return false;frames=frames||1;var sw=img.naturalWidth/frames;g.drawImage(img,sw*(frame||0),0,sw,img.naturalHeight,x,y,w,h);return true;}
function arcPlatform(g,x,y,w,t,kind,time,a){
 g.save();g.lineWidth=3;g.strokeStyle='#172d39';g.fillStyle=t.rock;
 var art=a&&a.imgs.platform;
 var textured=arcReady(art);
 if(textured){g.imageSmoothingEnabled=true;g.drawImage(art,x-3,y-12,w+6,65);}else{
 g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.lineTo(x+w-10,y+23);g.lineTo(x+w*.66,y+33);g.lineTo(x+13,y+24);g.closePath();g.fill();g.stroke();
 g.fillStyle=kind==='spring'?'#ffe397':kind==='checkpoint'?'#c9ffe6':t.top;g.fillRect(x+1,y,w-2,8);
 g.fillStyle=t.edge;for(var j=10;j<w-10;j+=29){g.fillRect(x+j,y+12,17,4);g.fillRect(x+j+5,y+20,11,3);}
 if(t.tile==='roots'){g.strokeStyle=t.edge;g.lineWidth=4;for(var r=10;r<w;r+=35){g.beginPath();g.moveTo(x+r,y+17);g.lineTo(x+r+12,y+29);g.lineTo(x+r+8,y+38);g.stroke();}}
 if(t.tile==='water'||t.tile==='ice'){g.fillStyle='#ddffff';for(var r=14;r<w-10;r+=30){g.beginPath();g.moveTo(x+r,y+8);g.lineTo(x+r+8,y+8);g.lineTo(x+r+3,y+22);g.fill();}}
 if(t.tile==='coral'){g.strokeStyle='#f5aeb9';g.lineWidth=3;for(var r=12;r<w;r+=40){g.beginPath();g.moveTo(x+r,y+27);g.lineTo(x+r,y+13);g.moveTo(x+r,y+21);g.lineTo(x+r+7,y+16);g.stroke();}}
 if(t.tile==='metal'){g.fillStyle='#fff3c8';for(var r=12;r<w;r+=40){g.beginPath();g.arc(x+r,y+16,3,0,Math.PI*2);g.fill();}}
 if(t.tile==='cloud'){g.fillStyle='#d4e9ff';for(var r=13;r<w-8;r+=24){g.beginPath();g.arc(x+r,y+22,9,0,Math.PI);g.fill();}}
 }
 if(kind!=='normal'){g.fillStyle=kind==='spring'?'#ffe397':kind==='checkpoint'?'#c9ffe6':kind==='moving'?'#d5f8ff':'#ffc5a3';g.fillRect(x+8,y-1,w-16,3);}
 if(kind==='crumble'){g.strokeStyle='#f0b091';g.lineWidth=2;g.beginPath();g.moveTo(x+w*.4,y);g.lineTo(x+w*.5,y+14);g.lineTo(x+w*.44,y+23);g.stroke();}
 if(kind==='moving'){g.fillStyle='#effcff';g.font='bold 16px sans-serif';g.textAlign='center';g.fillText('↔',x+w/2,y+21);}
 if(kind==='spring'){g.strokeStyle='#ffe797';g.lineWidth=4;g.beginPath();g.moveTo(x+w/2-14,y-4);g.lineTo(x+w/2+14,y-11);g.lineTo(x+w/2-14,y-18);g.lineTo(x+w/2+14,y-25);g.stroke();g.fillStyle='#fff4b2';g.fillRect(x+w/2-22,y-29,44,5);}
 if(kind==='checkpoint'){g.fillStyle='#b4ffe7';g.fillRect(x+12,y-43,3,43);g.beginPath();g.moveTo(x+15,y-43);g.lineTo(x+43,y-34);g.lineTo(x+15,y-24);g.fill();}
 g.restore();
}
function arcGem(g,x,y,t,time){
 g.save();g.translate(x,y+Math.sin(time*4+x)*3);g.fillStyle='#163846';g.beginPath();g.moveTo(0,-15);g.lineTo(11,0);g.lineTo(0,16);g.lineTo(-11,0);g.closePath();g.fill();
 g.fillStyle=t.light;g.beginPath();g.moveTo(0,-11);g.lineTo(8,0);g.lineTo(0,12);g.lineTo(-8,0);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(0,-10);g.lineTo(0,7);g.lineTo(-6,0);g.fill();g.restore();
}
function arcHero(g,a,x,y){
 var dir=a.mode==='runner'?'east':'south';
 // Tinted assets resolve asynchronously. Refresh only when the source changes.
 var b=arcImage(a,'body',heroImg(bodyKey(dir))),h=arcImage(a,'head',heroImg(headKey(dir)));
 g.save();if(a.inv>0&&Math.floor(a.time*12)%2===0)g.globalAlpha=.4;
 var slide=a.mode==='runner'&&a.slide>0&&a.grounded;var size=88;
 g.translate(x,y);if(a.mode==='runner')g.scale(-1,1);
 if(slide){g.translate(0,-12);g.rotate(-1.05);g.translate(0,12);}
 if(a.boost>0){g.strokeStyle='#b2ffe9';g.lineWidth=4;g.beginPath();g.ellipse(0,-39,48,51,0,0,Math.PI*2);g.stroke();}
 var frame=a.status!=='playing'?0:a.mode==='runner'?(a.grounded?1+Math.floor(a.time*13)%8:8):8;
 g.imageSmoothingEnabled=true;
 if(!arcDrawSprite(g,b,-size/2,-size,size,size,9,frame)){g.fillStyle='#96ddbd';g.fillRect(-13,-42,26,36);}
 arcDrawSprite(g,h,-size/2,-size,size,size,1,0);
 g.restore();
}
function arcPaint(a){
 var g=a.ctx;if(!g)return;var t=ARC_THEMES[a.theme],runner=a.mode==='runner';g.clearRect(0,0,960,480);
 var background=a.imgs.before,after=a.imgs.after;
 g.imageSmoothingEnabled=false;g.fillStyle='#243c54';g.fillRect(0,0,960,480);
 var travel=runner?a.distance:a.camera;var offset=(travel*.07)%960;
 function layer(img,alpha){if(!arcReady(img))return;g.globalAlpha=alpha;g.drawImage(img,-offset,0,960,480);g.drawImage(img,960-offset,0,960,480);g.globalAlpha=1;}
 layer(background,1);layer(after,arcClamp(a.clean,0,1));
 // A quiet translucent veil keeps small gameplay objects legible over detailed art.
 g.fillStyle='rgba(13,28,44,.17)';g.fillRect(0,0,960,480);
 var sx=function(x){return runner?x-a.distance:x;};var sy=function(y){return runner?y:430-(y-a.camera);};
 if(runner){
  var scroll=(a.distance*.4)%280;
  for(var j=-1;j<5;j++){g.globalAlpha=.72;arcDrawSprite(g,a.imgs.prop,j*280-scroll,282,110,110,1,0);}g.globalAlpha=1;
  g.fillStyle=t.rock;g.fillRect(0,403,960,77);
  for(var j=-1;j<7;j++)arcPlatform(g,j*180-a.distance%180,398,181,t,'normal',a.time,a);
 }
 for(var p of a.platforms){var px=sx(p.x),py=sy(p.y);if(px+p.w<0||px>960||py<-50||py>530||p.fall>.22)continue;arcPlatform(g,px,py,p.w,t,p.kind,a.time,a);}
 for(var c of a.coins){var cx=sx(c.x),cy=sy(c.y);if(!c.taken&&cx>-30&&cx<990&&cy>-25&&cy<500)arcGem(g,cx,cy,t,a.time);}
 for(var o of a.hazards){if(o.done&&!(o.hitUntil>a.time))continue;var ox=sx(o.x)+(o.kind==='fly'?Math.sin(a.time*1.4+o.phase)*65:0),oy=sy(o.y);if(ox<-140||ox>1060||oy<-90||oy>560)continue;
  g.save();g.strokeStyle='#fff2c6';g.lineWidth=3;
  if(o.kind==='arch'){
   g.fillStyle=t.rock;g.fillRect(ox,oy-o.h,o.w,o.h);g.strokeRect(ox,oy-o.h,o.w,o.h);g.fillStyle=t.top;g.fillRect(ox+2,oy-o.h+2,o.w-4,7);g.fillStyle=t.edge;for(var k=12;k<o.w;k+=24)g.fillRect(ox+k,oy-o.h+15,12,5);
   for(var j=7;j<o.w;j+=18){g.fillStyle='#eaa873';g.beginPath();g.moveTo(ox+j,oy-14);g.lineTo(ox+j+9,oy-14);g.lineTo(ox+j+5,oy);g.fill();}
   g.fillStyle='#fff5d9';g.font='bold 16px sans-serif';g.textAlign='center';g.fillText('↓',ox+o.w/2,oy-23);
  }else{
   var w=o.kind==='fly'?78:o.w+24,hh=o.h+20;
   g.fillStyle='rgba(29,18,39,.7)';g.beginPath();g.ellipse(ox+o.w/2,oy-5,w/2,11,0,0,Math.PI*2);g.fill();
   g.shadowColor='#ffe8b6';g.shadowBlur=4;
   if(!arcDrawSprite(g,a.imgs.mob,ox-12,oy-hh,w,hh,a.mobFrames,arcMonsterPose(a,o))){g.fillStyle='#a462ab';g.fillRect(ox,oy-o.h,o.w,o.h);g.strokeRect(ox,oy-o.h,o.w,o.h);}
   g.shadowBlur=0;
   if(o.kind==='break'){g.strokeStyle='#ffd795';g.strokeRect(ox-5,oy-o.h-5,o.w+10,o.h+5);}
  }g.restore();
 }
 for(var v of a.particles){g.globalAlpha=Math.max(0,v.t/.55);g.fillStyle=v.c;g.fillRect(sx(v.x)-3,sy(v.y)-3,6,6);}g.globalAlpha=1;
 if(a.boost>0){g.strokeStyle='rgba(202,255,239,.6)';g.lineWidth=3;for(var j=0;j<9;j++){g.beginPath();var yy=(j*67+a.time*120)%480;g.moveTo(0,yy);g.lineTo(70+j*9,yy);g.stroke();}}
 arcHero(g,a,runner?140:a.x,sy(a.y));
 // Companion uses the existing evolved-pet art identity, not an emoji.
 var kind=S.petKey||'earth';
 var petx=(runner?140:a.x)-63,pety=(runner&&kind==='earth'?398:sy(a.y))-25;
 if(kind==='water')pety+=Math.sin(a.time*1.12)*1.2;
 var elapsed=Math.max(0,a.time-(a.petRenderTime||a.time));a.petRenderTime=a.time;
 var follow=1-Math.exp(-elapsed/.21);
 if(a.petRenderX==null){a.petRenderX=petx;a.petRenderY=pety;}
 a.petRenderX+=(petx-a.petRenderX)*follow;a.petRenderY+=(pety-a.petRenderY)*follow;
 petx=a.petRenderX;pety=a.petRenderY;
 arcDrawSprite(g,a.imgs.pet,petx-23,pety-23,46,46*(kind==='fire'?1+Math.sin(a.time*1.31)*.006:1),2,0);
 if(!runner){var gy=sy(a.goal);if(gy>-70&&gy<510){g.strokeStyle='#fbe4a3';g.lineWidth=5;g.beginPath();g.ellipse(480,gy-30,64,48,0,0,Math.PI*2);g.stroke();g.fillStyle='#fff4cc';g.font='bold 20px sans-serif';g.textAlign='center';g.fillText('정상의 빛',480,gy-87);}}
 if(runner&&a.goal-a.distance<920){var gx=a.goal-a.distance+140;g.strokeStyle='#fbe4a3';g.lineWidth=7;g.beginPath();g.ellipse(gx,341,38,58,0,0,Math.PI*2);g.stroke();}
 if(a.flash>0){g.fillStyle='rgba(255,132,126,.18)';g.fillRect(0,0,960,480);}
}

function arcMonsterPose(a,o){
 if(!a.mobCombat)return monsterFrameAt(a.time,a.mobFrames);
 if(o.hitUntil>a.time)return 2;if(o.done)return 0;
 var ox=o.x+(o.kind==='fly'?Math.sin(a.time*1.4+(o.phase||0))*65:0);
 return Math.abs(a.x-ox)<180&&Math.abs(a.y-o.y)<130?1:0;
}
