/* R40: cinematic monster encounters in all six regions. */
var BATTLE_VIEW_OBSERVER=null;
var BATTLE_PLACES={forest:'메마른 숲',river:'오염된 강변',ocean:'기름에 물든 해안',city:'매연 속 공장 지대',air:'먹구름 속 공중 폐허',climate:'갈라진 빙하'};
function battleThemeId(){return Tw.on&&Tw.mon?Tw.mon.themeId:CUR.id;}
function cinematicBattleView(){return !Duel.on&&!Shadow.on&&typeof ECO_BATTLE_ART!=='undefined'&&!!ECO_BATTLE_ART[battleThemeId()];}
function battleRearHero(size){const bk='body_battle_'+lookOf('outfit','cloak')+'_north',hk=headKey('north');return `<div class="battle-ready-avatar" style="width:${size}px;height:${size}px" aria-label="전투를 준비하는 주인공의 뒷모습"><div class="avatar"><div class="sprite battle-ready-body" data-hero="${bk}" style="background-image:url('${heroImg(bk)}')"></div><div class="sprite head" data-hero="${hk}" style="background-image:url('${heroImg(hk)}')"></div></div></div>`;}
function cinematicBattleLayout(w,h,rank){
 const hero=Math.min(w*.28,h*.38),foe=Math.min(w*(rank==='boss'?.76:rank==='mid'?.70:.64),h*(rank==='boss'?.86:rank==='mid'?.82:.77));
 return {hero,foe,heroX:w*.28-hero/2,heroY:h*.015,foeX:Math.min(w*.64-foe/2,w-foe-w*.015),foeY:h*.12};
}
function stopBattleView(){if(BATTLE_VIEW_OBSERVER){BATTLE_VIEW_OBSERVER.disconnect();BATTLE_VIEW_OBSERVER=null;}window.removeEventListener('resize',sizeBattleView);}
function sizeBattleView(){const scene=$('bscene'),field=$('bfield');if(!scene||!scene.classList.contains('cinematic-battle')||!field)return;const w=field.clientWidth,h=field.clientHeight;if(!w||!h)return;
 const l=cinematicBattleLayout(w,h,scene.dataset.rank),set=(el,x,y,n)=>Object.assign(el.style,{left:x+'px',right:'auto',bottom:y+'px',width:n+'px',height:n+'px'});
 set($('bme'),l.heroX,l.heroY,l.hero);set($('bfoe'),l.foeX,l.foeY,l.foe);scene.style.setProperty('--strike-x',(l.foeX+l.foe/2-l.heroX-l.hero/2)*.14+'px');scene.style.setProperty('--strike-y',-Math.max(12,(l.foeY-l.heroY)*.6)+'px');
}
function startBattleView(){stopBattleView();sizeBattleView();const field=$('bfield');if(!field)return;if(typeof ResizeObserver!=='undefined'){BATTLE_VIEW_OBSERVER=new ResizeObserver(sizeBattleView);BATTLE_VIEW_OBSERVER.observe(field);}window.addEventListener('resize',sizeBattleView);}
