/* R43: five monster battles, two separate arcade gates. monIdx only counts monsters. */
var InterludeRun=null;
var ENCOUNTER_ROUTE=['전투 1','미니게임 1','전투 2','전투 3','미니게임 2','전투 4','보스'];
function encounterRouteMarkup(){
 var p=Tw.on?Tw.interludePending:S.interludePending;
 var at=Tw.on?(Tw.floor-1)%7:p?(p.after===0?1:4):[0,2,3,5,6][Math.min(4,S.monIdx)];
 return '<div class="encounter-route" aria-label="진행 순서">'+ENCOUNTER_ROUTE.map((label,i)=>'<span class="'+(i===at?'current':i<at?'complete':'')+'"'+(i===at?' aria-current="step"':'')+'>'+label+'</span>').join('')+'</div>';
}
function makeInterlude(after){return {after:after,mode:after===0?'runner':'timing',done:false,attempts:0};}
function pendingInterlude(){return Tw.on?Tw.interludePending:S.interludePending;}
function advanceEncounter(){
 if(!S.encounterWon)return false;
 const won=S.monIdx;S.encounterWon=false;
 if(won>=CUR.monsters.length-1){S.battleDone=true;autosave();return true;}
 S.monIdx=won+1;
 if(won===0||won===2)S.interludePending=makeInterlude(won);
 autosave();return true;
}
function startEncounter(){
 advanceEncounter();
 if(S.battleDone){leaveBattle();return;}
 if(S.interludePending){closeBattleDom();B=null;S.modal='interlude';drawModal();return;}
 InterludeRun=null;if(curMon().mode==='pang')mountPang();else mountBattle();
}
function mInterlude(){
 var p=pendingInterlude();if(!p)return '';
 var name=p.mode==='runner'?'정화 달리기':'정령 도약';
 return '<div class="mhead"><span>🎮 '+name+(p.done?' 완료!':' 관문')+'</span></div>'+encounterRouteMarkup()+'<div class="card" style="line-height:1.9">'+(p.done?'관문을 통과했어요! 다음 몬스터와 싸울 준비가 되었어요.':'몬스터와 싸운 뒤 잠깐 다른 도전을 해 봐요.<br>'+(p.mode==='runner'?'점프와 슬라이드로 장애물을 피해 끝까지 달려요.':'발판을 딛고 올라가 정상에 도착해요.')+'<br>실패해도 이 관문부터 다시 도전할 수 있어요.')+'</div><button class="btn" onclick="'+(p.done?'continueInterlude()':'launchInterlude()')+'">'+(p.done?'다음 전투로':'도전하기')+'</button><button class="btn sec" onclick="exitInterlude()">'+(Tw.on?'탑 도전 마치기':'마을로 돌아가기')+'</button>';
}
function launchInterlude(){
 var p=pendingInterlude();if(!p)return;if(p.done){continueInterlude();return;}
 closeModal();stopLoop();closeBattleDom();B=null;
 InterludeRun={pending:p,tower:Tw.on,settled:false};
 arcMount(p.mode);
}
function finishInterlude(win,hostId,detail){
 var run=InterludeRun,p=pendingInterlude();
 if(!run||run.pending!==p||run.settled)return;
 run.settled=true;
 if(win){p.done=true;if(Tw.on)Tw.floorCleared=true;}
 else p.attempts=(p.attempts||0)+1;
 autosave();
 var host=$(hostId);if(!host)return;
 host.innerHTML='<div class="back on"><div class="sheet">'+(win?mInterlude():'<div class="mhead"><span>다시 도전해 봐요!</span></div>'+encounterRouteMarkup()+'<div class="card">'+(detail||'조금만 더 연습하면 통과할 수 있어요.')+'<br>다음 도전은 조금 더 쉬워져요. 몬스터 전투 진행은 그대로예요.</div><button class="btn" onclick="launchInterlude()">같은 관문 다시 도전</button><button class="btn sec" onclick="exitInterlude()">'+(Tw.on?'탑 도전 마치기':'마을로 돌아가기')+'</button>')+'</div></div>';
}
function continueInterlude(){
 var p=pendingInterlude();if(!p||!p.done)return;
 InterludeRun=null;
 if(Tw.on){towerNext();return;}
 S.interludePending=null;autosave();closeBattleDom();S.modal=null;stopLoop();wipeIn(mountBattle);
}
function exitInterlude(){InterludeRun=null;if(Tw.on)towerRetire('quit');else leaveBattle();}
