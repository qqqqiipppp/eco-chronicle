/* One shared care room for the four short animal welfare stages. */
var Care=null;
// Keep only the previous stage orders in this page session, outside saved game data.
var CareOrderHistory={};
var CARE_SECONDS=17;
var CARE_START_SCORE=35;
var CARE_PASS_SCORE=65;
var CARE_GREAT_SCORE=85;
var CARE_MOTION_SECONDS=1.15;
var CARE_INPUT_QUIET_MS=180;
var CARE_PROP_ART={
  care_fence:'./assets/images/objects/care_fence.svg',
  care_water_tub:'./assets/images/objects/care_water_tub.svg',
  care_feed_trough:'./assets/images/objects/care_feed_trough.svg',
  care_shelter:'./assets/images/objects/care_shelter.svg'
};
var CARE_STAGES=[
  {id:'chick',name:'병아리',place:'포근한 닭장',sprite:'an_chicken_baby',
   lesson:'먹이와 물, 깨끗한 바닥이 필요해요.',
   props:[['care_fence',11,10],['care_feed_trough',26,7],['care_water_tub',76,7],['pr_flower',88,17,2]],
   actions:[['feed','🌾','먹이 주기'],['water','💧','물 주기'],['clean','🧹','바닥 청소'],['rest','⛺','쉼터 만들기'],['watch','👀','살펴보기']],
   needs:[['🌾','먹이가 필요해요.','feed'],['💧','깨끗한 물이 필요해요.','water'],['🧹','바닥을 깨끗하게 해 주세요.','clean']]},
  {id:'calf',name:'송아지',place:'그늘 있는 풀밭',sprite:'an_cow_baby',
   lesson:'송아지도 그늘에서 편히 쉬어야 해요.',
   props:[['care_fence',10,10],['care_feed_trough',25,7],['care_water_tub',74,7],['care_shelter',88,7]],
   actions:[['feed','🌾','건초 주기'],['water','💧','물 주기'],['shade','🌳','그늘 만들기'],['clean','🧹','바닥 청소'],['watch','👀','살펴보기']],
   needs:[['🌾','먹이가 필요해요.','feed'],['💧','깨끗한 물이 필요해요.','water'],['🌳','편히 쉴 그늘이 필요해요.','shade']]},
  {id:'mouse',name:'실험쥐',place:'안전한 돌봄 공간',image:'./assets/images/characters/care_mouse.svg',
   lesson:'숨고 움직일 공간이 있어야 편안해요.',
   props:[['care_water_tub',18,7],['pr_log',72,7,2],['care_shelter',84,7]],
   actions:[['water','💧','물 주기'],['nest','🪹','둥지 재료'],['hide','🏠','은신처 마련'],['feed','🌾','먹이 주기'],['watch','👀','살펴보기']],
   needs:[['💧','깨끗한 물이 필요해요.','water'],['🪹','포근한 둥지 재료가 필요해요.','nest'],['🏠','숨을 곳이 필요해요.','hide']]},
  {id:'crab',name:'투구게',place:'조용한 얕은 물가',seconds:20,image:'./assets/images/characters/care_horseshoe_crab.svg',
   lesson:'동물을 보호하고 회복할 시간을 주어요.',
   props:[['pr_shell',15,9,2],['pr_pond',73,8,2],['pr_reed',88,16,2]],
   actions:[['protect','🛡️','해변 보호'],['recover','🌿','회복 기다리기'],['enough','🤲','필요한 만큼만'],['alternative','💡','대체 방법 찾기'],['more','📦','많이 이용하기']],
   needs:[['🛡️','안전한 해변이 필요해요.','protect'],['🌿','회복할 시간이 필요해요.','recover'],['🤲','필요한 만큼만 이용해요.','enough'],['💡','다른 방법도 살펴봐요.','alternative']]}
];

function careHTML(){
  return '<div class="back on care-back" id="careRoot"><section class="sheet care-sheet" role="dialog" aria-label="동물 돌봄 대작전">'+
    '<header class="care-head"><div><div class="care-kicker">동물 복지 미니게임</div><h2 class="care-title">동물 돌봄 대작전</h2></div><div class="care-head-right"><span class="care-timer" id="careTimer">17초</span><button type="button" class="care-close" data-care-pause aria-label="일시정지">Ⅱ</button><button type="button" class="care-close" data-care-exit aria-label="나가기">×</button></div></header>'+
    '<div class="care-stagebar" id="careStagebar" aria-label="4단계 진행"></div>'+
    '<div class="care-score"><span>💚 복지 점수</span><div class="care-score-track" role="progressbar" aria-label="복지 점수" aria-valuemin="0" aria-valuemax="100" aria-valuenow="35"><div class="care-score-fill" id="careScoreFill"></div></div><strong class="care-score-num" id="careScoreNum">35</strong></div>'+
    '<div class="care-stage-body" id="careBody"></div><div class="care-controls" id="careControls"></div><div class="care-feedback" id="careFeedback" aria-live="polite"></div>'+
    '<div class="care-lesson" id="careLesson" hidden></div><div id="careResult"></div>'+
    '<div class="care-intro" id="careIntro"><div class="care-intro-card"><small>4마리 · 약 60~75초</small><h3>필요한 돌봄을 골라 주세요!</h3><p>맞게 돌보면 복지 점수가 올라가요.</p><button type="button" class="btn" data-care-start>돌봄 시작</button></div></div>'+
    '</section></div>';
}
function careProps(stage){
  return stage.props.map(function(prop){
    var art=CARE_PROP_ART[prop[0]]?'<img src="'+CARE_PROP_ART[prop[0]]+'" alt="">':sp(prop[0],prop[3]);
    return '<div class="care-prop care-prop-'+prop[0]+'" data-care-prop="'+prop[0]+'" style="left:'+prop[1]+'%;bottom:'+prop[2]+'%">'+art+'</div>';
  }).join('');
}
function careStageMarkup(stage){
  var animal=stage.image?'<img class="care-sprite care-vector" src="'+stage.image+'" alt="">':
    '<div class="care-sprite care-pixel" style="background-image:url(\''+SPRITES[stage.sprite]+'\')"></div>';
  var background=new URL((stage.id==='crab'?ECO_SCENES.ocean:ECO_SCENES.forest).after,document.baseURI).href;
  return '<div class="care-scene care-'+stage.id+'" style="--care-bg:url(\''+background+'\')">'+
    '<div class="care-sky"></div><div class="care-land"></div><div class="care-place">'+careProps(stage)+
    '<div class="care-need-bubble" id="careNeed"></div><div class="care-animal" id="careAnimal">'+animal+'<div class="care-animal-name">'+stage.name+'</div></div></div>'+
    '<div class="care-place-name">'+stage.place+'</div></div>';
}
function careShuffle(items,previous){
  var order=items.slice();
  for(var i=order.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1)),item=order[i];order[i]=order[j];order[j]=item;
  }
  if(order.length>1&&previous&&order.every(function(item,index){return item===previous[index];})){
    var first=Math.floor(Math.random()*order.length);
    var other=(first+1+Math.floor(Math.random()*(order.length-1)))%order.length;
    var swap=order[first];order[first]=order[other];order[other]=swap;
  }
  return order;
}
function careOrderValid(order){
  for(var i=1;i<order.length;i++)if(order[i][2]===order[i-1][2])return false;
  // Reject ABAB and ABCABC chunks, not just identical adjacent requests.
  for(var size=2;size<=3;size++)for(var start=0;start+size*2<=order.length;start++){
    var repeated=true;
    for(var j=0;j<size;j++)if(order[start+j][2]!==order[start+size+j][2])repeated=false;
    if(repeated)return false;
  }
  return true;
}
function careSequence(stage,previous){
  var extras=careShuffle(stage.needs).slice(0,3),bag=stage.needs.concat(extras);
  function same(order){return previous&&order.every(function(n,i){return previous[i]&&n[2]===previous[i][2];});}
  for(var attempt=0;attempt<64;attempt++){
    var order=careShuffle(bag);
    if(careOrderValid(order)&&!same(order))return order;
  }
  // Bounded search also works when a test/device supplies a degenerate RNG.
  var kinds=careShuffle(stage.needs),counts=kinds.map(function(n){return bag.filter(function(b){return b[2]===n[2];}).length;});
  function find(order){
    if(order.length===bag.length)return same(order)?null:order;
    var choices=careShuffle(kinds.map(function(_,i){return i;}));
    for(var c=0;c<choices.length;c++){
      var i=choices[c];if(!counts[i])continue;
      var next=order.concat([kinds[i]]);if(!careOrderValid(next))continue;
      counts[i]--;var result=find(next);counts[i]++;if(result)return result;
    }
    return null;
  }
  return find([]);
}
function careActionsMarkup(stage,actions){
  return (actions||stage.actions).map(function(action){return '<button type="button" class="care-action" data-care-action="'+action[0]+'"><span class="care-action-icon">'+action[1]+'</span><span class="care-action-label">'+action[2]+'</span></button>';}).join('');
}
function careUpdateScore(a){
  a.score=Math.max(0,Math.min(100,a.score));
  var track=document.querySelector('#careRoot .care-score-track');
  if(track)track.setAttribute('aria-valuenow',String(a.score));
  var fill=$('careScoreFill'),num=$('careScoreNum');
  if(fill)fill.style.width=a.score+'%';
  if(num)num.textContent=a.score;
}
function careSetFeedback(message,kind){
  var el=$('careFeedback');if(!el)return;
  el.textContent=message;el.className='care-feedback'+(kind?' is-'+kind:'');
}
function careSetPrompt(a,index){
  if(a.prompt>=0&&!a.answered){a.score-=2;careUpdateScore(a);}
  a.prompt=index;a.answered=false;a.penalized=false;a.inputReady=false;a.gesture=null;
  a.inputToken++;a.promptFrames=0;a.promptShownAt=performance.now();a.phase='prompt';
  var stage=CARE_STAGES[a.stage],seconds=stage.seconds||CARE_SECONDS;
  var nominal=(seconds/stage.needs.length)*(.6+Math.random()*.1);
  // Reserve enough time to show every remaining request AND finish its motion.
  var future=a.needs.length-index-1;
  a.responseSeconds=Math.min(nominal,Math.max(1.2,seconds-a.elapsed-future*2.42-CARE_MOTION_SECONDS-.04));
  a.promptEndsAt=a.elapsed+a.responseSeconds;
  var need=a.needs[index],bubble=$('careNeed');
  if(bubble)bubble.innerHTML='<span>'+need[0]+'</span> '+need[1];
  var controls=$('careControls');
  if(controls)controls.querySelectorAll('.care-action').forEach(function(button){
    button.disabled=true;button.dataset.careToken=String(a.inputToken);button.classList.remove('is-correct','is-wrong');
  });
  careSetFeedback('필요한 돌봄을 골라 주세요.','');
}
function careSetStage(a,index){
  careClearMotion(a);
  a.stage=index;a.elapsed=0;a.prompt=-1;a.answered=false;a.penalized=false;a.status='playing';
  var stage=CARE_STAGES[index];
  var previous=CareOrderHistory[stage.id]||{};
  a.needs=careSequence(stage,previous.needs);
  var actions=stage.id==='crab'?careShuffle(stage.actions,previous.actions):stage.actions;
  CareOrderHistory[stage.id]={needs:a.needs,actions:actions};
  $('careBody').innerHTML=careStageMarkup(stage);
  $('careControls').innerHTML=careActionsMarkup(stage,actions);
  $('careStagebar').innerHTML=CARE_STAGES.map(function(item,i){return '<span class="care-stage-dot'+(i===index?' is-current':i<index?' is-done':'')+'">'+(i+1)+' · '+item.name+'</span>';}).join('');
  $('careLesson').hidden=true;
  $('careTimer').textContent=(stage.seconds||CARE_SECONDS)+'초';
  careSetPrompt(a,0);
}
function careClearMotion(a){
  if(!a.motion)return;
  var m=a.motion;
  m.actor.style.transform='';m.sprite.style.transform='';m.sprite.style.opacity='';m.sprite.style.clipPath='';m.sprite.style.backgroundPosition='';
  if(m.prop)m.prop.classList.remove('is-used');
  a.motion=null;
}
function careBeginMotion(a,key){
  var actor=$('careAnimal'),sprite=actor&&actor.querySelector('.care-sprite');if(!sprite)return false;
  var stage=CARE_STAGES[a.stage],targets={
    chick:{feed:['care_feed_trough','eat'],water:['care_water_tub','drink'],clean:[null,'roam']},
    calf:{feed:['care_feed_trough','eat'],water:['care_water_tub','drink'],shade:['care_shelter','rest']},
    mouse:{water:['care_water_tub','drink'],nest:['pr_log','rest'],hide:['care_shelter','hide']},
    crab:{protect:['pr_reed','rest'],recover:['pr_pond','rest'],enough:['pr_shell','rest'],alternative:['pr_pond','roam']}
  },target=targets[stage.id][key],place=actor.parentElement;
  var prop=target[0]&&place.querySelector('[data-care-prop="'+target[0]+'"]');
  var area=place.getBoundingClientRect(),base=actor.getBoundingClientRect(),dx=stage.id==='chick'?-48:35,dy=0;
  if(prop){
    var p=prop.getBoundingClientRect(),center=p.left+p.width/2-area.left;
    var side=center<area.width/2?1:-1;
    if(target[1]!=='hide'&&target[1]!=='rest')center+=side*sprite.clientWidth*.32;
    center=Math.max(base.width/2+8,Math.min(area.width-base.width/2-8,center));
    dx=center-area.width/2;dy=Math.max(-12,Math.min(8,p.bottom-base.bottom));
    prop.classList.add('is-used');
  }
  a.motion={actor:actor,sprite:sprite,prop:prop,kind:target[1],age:0,dx:dx,dy:dy,face:dx>0?-1:1,lastDraw:-1,stage:stage.id};
  a.phase='motion';return true;
}
function careDrawMotion(a){
  var m=a.motion,age=m.age;if(Math.floor(age*30)===m.lastDraw)return;m.lastDraw=Math.floor(age*30);
  var progress=age/CARE_MOTION_SECONDS,amount=progress<.3?progress/.3:progress>.78?(1-progress)/.22:1;
  amount=Math.max(0,Math.min(1,amount));amount=amount*amount*(3-2*amount);
  var acting=progress>=.3&&progress<=.78,walk=!acting,bob=walk?-Math.abs(Math.sin(age*22))*3:0,angle=0,scale=1,opacity=1;
  if(acting){
    var wave=Math.sin((progress-.3)/.48*Math.PI*4);
    if(m.kind==='eat'||m.kind==='drink'){angle=-(m.kind==='eat'?9:5)*(wave*.5+.5);bob=2*(wave*.5+.5);}
    if(m.kind==='rest'){scale=1-.04*Math.sin((progress-.3)/.48*Math.PI);bob=3;}
    if(m.kind==='hide'){var peek=(progress-.3)/.48;scale=peek<.55?.48:.72;opacity=peek<.55?.22:.85;bob=12;}
    if(m.kind==='roam'){amount+=Math.sin((progress-.3)/.48*Math.PI*2)*.16;bob=-Math.abs(wave)*3;}
  }
  var dx=m.dx*amount,dy=m.dy*amount;
  m.actor.style.transform='translate(calc(-50% + '+dx.toFixed(1)+'px), '+dy.toFixed(1)+'px)';
  var facing=progress>.78?-m.face:m.face;
  m.sprite.style.transform='translateY('+bob.toFixed(1)+'px) scale('+facing*scale+','+scale+') rotate('+angle.toFixed(1)+'deg)';
  m.sprite.style.opacity=String(opacity);
  m.sprite.style.clipPath=acting&&m.kind==='hide'&&progress>.3+.48*.55?'inset(0 55% 0 0)':'';
  if(m.sprite.classList.contains('care-pixel')){
    var frames=m.stage==='chick'?4:2,frame=walk||m.kind==='roam'?Math.floor(age*8)%frames:0;
    m.sprite.style.backgroundPosition=(-frame*m.sprite.clientWidth)+'px bottom';
  }
}
function careAnswer(a,key,button,input){
  if(Care!==a||a.status!=='playing'||a.phase!=='prompt'||!a.inputReady||a.answered||!input)return;
  if(input.token!==a.inputToken||button.dataset.careToken!==String(a.inputToken)||input.startedAt<a.inputOpenedAt||input.clickedAt<a.inputOpenedAt)return;
  // Consume the first valid gesture before any score, DOM, or animation changes.
  a.answered=true;a.inputReady=false;a.gesture=null;
  $('careControls').querySelectorAll('.care-action').forEach(function(b){b.disabled=true;});
  var need=a.needs[a.prompt];
  if(key===need[2]){
    a.score+=5;button.classList.add('is-correct');
    $('careNeed').innerHTML='<span>💚</span> 고마워요!';
    careSetFeedback('✓ 잘 돌봤어요! +5','good');
    if(!careBeginMotion(a,key)){a.phase='resolved';a.promptEndsAt=a.elapsed+.6;}
  }else{
    a.score-=2;a.penalized=true;a.phase='resolved';button.classList.add('is-wrong');
    careSetFeedback('다음에는 필요한 돌봄을 골라 주세요. −2','bad');
  }
  careUpdateScore(a);
}
function careCompleteStage(a){
  if(!a.answered){a.score-=2;careUpdateScore(a);}
  careClearMotion(a);a.inputReady=false;a.gesture=null;
  a.status='lesson';a.lessonTime=1.5;
  var lesson=$('careLesson');
  lesson.hidden=false;
  lesson.innerHTML='<div><small>'+(a.stage+1)+' / 4 · '+CARE_STAGES[a.stage].name+'</small><p>'+CARE_STAGES[a.stage].lesson+'</p></div>';
  $('careControls').querySelectorAll('.care-action').forEach(function(b){b.disabled=true;});
  $('careTimer').textContent='완료';
}
function careTick(a,t){
  if(Care!==a)return;
  var dt=a.last?Math.max(0,(t-a.last)/1000):0;a.last=t;
  if(a.status==='playing'){
    a.elapsed+=dt;
    var stage=CARE_STAGES[a.stage],seconds=stage.seconds||CARE_SECONDS;
    $('careTimer').textContent=Math.max(0,Math.ceil(seconds-a.elapsed))+'초';
    var next=false;
    if(a.motion){
      a.motion.age+=dt;careDrawMotion(a);
      if(a.motion.age>=CARE_MOTION_SECONDS){careClearMotion(a);next=true;}
    }else{
      a.promptFrames++;
      var now=performance.now();
      if(a.phase==='prompt'&&!a.inputReady&&a.promptFrames>=2&&now-a.promptShownAt>=CARE_INPUT_QUIET_MS&&now-a.lastInteractionAt>=CARE_INPUT_QUIET_MS){
        a.inputReady=true;a.inputOpenedAt=now;
        $('careControls').querySelectorAll('.care-action').forEach(function(b){b.disabled=false;});
      }
      if(a.elapsed>=a.promptEndsAt)next=true;
    }
    if(next){
      if(a.prompt+1<a.needs.length)careSetPrompt(a,a.prompt+1);
      else careCompleteStage(a);
    }
  }else if(a.status==='lesson'){
    a.lessonTime-=dt;
    if(a.lessonTime<=0){
      if(a.stage<CARE_STAGES.length-1)careSetStage(a,a.stage+1);
      else {careFinish(a);return;}
    }
  }
  a.raf=requestAnimationFrame(function(now){careTick(a,now);});
}
function carePause(a,force){
  if(Care!==a||['playing','lesson','paused'].indexOf(a.status)<0)return;
  var intro=$('careIntro');
  if(a.status!=='paused'){
    a.inputReady=false;a.gesture=null;
    $('careControls').querySelectorAll('.care-action').forEach(function(b){b.disabled=true;});
    a.resumeStatus=a.status;
    a.status='paused';intro.hidden=false;
    intro.innerHTML='<div class="care-intro-card"><small>잠깐 쉬어 가요</small><h3>일시정지</h3><p>남은 시간은 그대로예요.</p><button type="button" class="btn" data-care-resume>계속하기</button></div>';
  }else if(!force){a.status=a.resumeStatus||'playing';a.last=0;a.promptShownAt=performance.now();a.promptFrames=0;intro.hidden=true;}
  var button=document.querySelector('[data-care-pause]');if(button)button.textContent=a.status==='paused'?'▶':'Ⅱ';
}
function careFinish(a){
  if(Care!==a||a.settled)return;a.settled=true;
  var score=a.score,won=score>=CARE_PASS_SCORE,great=score>=CARE_GREAT_SCORE;
  animalCareStop();
  if(won){
    var dandelion=great?3:2,daisy=great?2:1;
    addSeed('dandelion',dandelion);addSeed('daisy',daisy);autosave();
    miniWin('modalHost','복지 점수 <b>'+score+'점</b> · 농장 씨앗: 민들레 '+dandelion+'개, 데이지 '+daisy+'개');
  }else miniLose('modalHost','복지 점수 '+score+'점 · 65점부터 통과할 수 있어요.','retryRunner()');
}
function animalCareStop(){
  var a=Care;if(!a)return;
  Care=null;cancelAnimationFrame(a.raf);careClearMotion(a);a.gesture=null;a.inputReady=false;
  a.off.forEach(function(fn){fn();});a.off=[];
}
function animalCareMount(){
  arcStop();animalCareStop();releaseKeys();
  S.modal='runner';
  var host=$('modalHost');if(!host){host=document.createElement('div');host.id='modalHost';document.body.appendChild(host);}
  host.innerHTML=careHTML();
  var a={stage:0,elapsed:0,prompt:-1,score:CARE_START_SCORE,answered:false,penalized:false,status:'ready',last:0,lessonTime:0,settled:false,raf:0,off:[],inputToken:0,inputReady:false,lastInteractionAt:0,gesture:null,motion:null};
  Care=a;careSetStage(a,0);a.status='ready';careUpdateScore(a);
  var root=$('careRoot');
  function eventTime(e){return e.timeStamp>1e12?e.timeStamp-performance.timeOrigin:e.timeStamp;}
  function captureGesture(e){
    if(Care!==a)return;
    a.lastInteractionAt=performance.now();a.gesture=null;
    var button=e.target.closest('button');
    if(!button||!root.contains(button)||!button.hasAttribute('data-care-action')||button.disabled)return;
    if(a.status==='playing'&&a.inputReady&&!a.answered&&eventTime(e)>=a.inputOpenedAt)
      a.gesture={button:button,token:a.inputToken,startedAt:eventTime(e)};
  }
  function onClick(e){
    if(Care!==a)return;
    var button=e.target.closest('button');if(!button||!root.contains(button))return;
    if(button.hasAttribute('data-care-start')){a.status='playing';a.last=0;a.promptShownAt=performance.now();a.promptFrames=0;$('careIntro').hidden=true;return;}
    if(button.hasAttribute('data-care-resume')){carePause(a,false);return;}
    if(button.hasAttribute('data-care-pause')){carePause(a,false);return;}
    if(button.hasAttribute('data-care-exit')){animalCareStop();if(Tw.on)towerRetire('quit');else leaveBattle();return;}
    if(button.hasAttribute('data-care-action')){
      var gesture=a.gesture;a.gesture=null;
      if(gesture&&gesture.button===button)careAnswer(a,button.dataset.careAction,button,{token:gesture.token,startedAt:gesture.startedAt,clickedAt:eventTime(e)});
    }
  }
  function onKey(e){
    if(e.code==='Escape'&&Care===a){e.preventDefault();carePause(a,false);}
    if(e.code==='Enter'||e.code==='Space'){
      if(e.repeat){if(e.target.closest('.care-action'))e.preventDefault();return;}
      captureGesture(e);
    }
  }
  function onBlur(){if(Care===a&&['playing','lesson'].includes(a.status))carePause(a,true);}
  function onVisibility(){if(document.hidden)onBlur();}
  root.addEventListener('pointerdown',captureGesture,true);root.addEventListener('click',onClick);window.addEventListener('keydown',onKey);
  window.addEventListener('blur',onBlur);document.addEventListener('visibilitychange',onVisibility);
  a.off.push(function(){root.removeEventListener('pointerdown',captureGesture,true);root.removeEventListener('click',onClick);window.removeEventListener('keydown',onKey);window.removeEventListener('blur',onBlur);document.removeEventListener('visibilitychange',onVisibility);});
  a.raf=requestAnimationFrame(function(now){careTick(a,now);});
}
