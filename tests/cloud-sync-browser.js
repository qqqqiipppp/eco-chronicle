/* Never loaded by production index.html. TEST data and fault injection only. */
(function(){
  var frame=document.getElementById('game');
  function game(){return frame.contentWindow;}
  document.getElementById('legacy').onclick=async function(){
    var c=game(),old=await (await fetch('/tests/fixtures/legacy-save/last-week.json')).json();
    old.code='EC1234';old.name='기존TEST';
    c.localStorage.setItem('echo:EC1234',JSON.stringify(old));
    var index=c.Save.index();if(!index.includes('EC1234'))index.push('EC1234');
    c.localStorage.setItem('echo:__index',JSON.stringify(index));c.localStorage.setItem('echo:__last','EC1234');c.go('title');
  };
  document.getElementById('gold').onclick=function(){var c=game();c.S.gold+=10;c.autosave();};
  document.getElementById('offline').onclick=function(){game().__qaOffline=true;};
  document.getElementById('online').onclick=function(){var c=game();c.__qaOffline=false;c.dispatchEvent(new Event('online'));};
  document.getElementById('retry').onclick=function(){game().CloudSync.flush();};
  document.getElementById('lostSave').onclick=function(){game().__qaLoseNext='save';};
  document.getElementById('lostCreate').onclick=function(){game().__qaLoseNext='create';};
  document.getElementById('title').onclick=function(){var c=game();c.Save.save();c.CloudSync.stop();c.go('title');};
  document.getElementById('bag').onclick=function(){game().openModal('bag');};
  document.getElementById('map').onclick=function(){game().go('themes');};
  setInterval(function(){try{
    var c=game(),v=c.CloudSync.view(),s=c.S;
    document.getElementById('qaStatus').textContent=JSON.stringify({scene:s.scene,modal:s.modal,name:s.name,localCode:s.code,lv:s.lv,exp:s.exp,gold:s.gold,
      gear:s.gear,gauge:s.gauge,farm:s.farm,ecoTechUnlocked:s.ecoTechUnlocked,learning:s.learning,tower:s.tower,
      status:v.status,revision:v.revision,pending:v.pending,conflict:!!v.conflict,offline:c.__qaOffline,
      localSlots:c.Save.index().length,cacheEntries:c.CloudSync.entries().length,errors:c.__qaErrors||[]},null,0);
  }catch(_){}},250);
})();
