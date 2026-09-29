// Local-only UI fixture. Controls and test saves are never added to product HTML.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function fixture(){
  const errors=[];addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
  document.addEventListener('DOMContentLoaded',()=>{
    const requested=new URLSearchParams(location.search).get('testCode');
    const code=/^EC\d{4}$/.test(requested||'')?requested:'EC9898',loaded=Save.load(code);
    if(loaded)S=loaded;
    else{
      const old=Object.assign(newState(),{code,name:'생태기술 테스트',petKey:'earth',lv:10,gold:2000,tickets:3,scene:'world',owned:['w1','L1','L4','L6','h1'],gear:{weapon:'L1',armor:'L4',helm:'h1',shoes:'L6'}});
      for(const k of Object.keys(old))if(k.startsWith('ecoTech'))delete old[k];
      S=migrate(old);
    }
    S.scene='world';S.modal=null;applyTheme(S.themeId);Wd.px=SPAWN.x;Wd.py=SPAWN.y;render();
    const box=document.createElement('details');box.open=true;box.id='eco-test-tools';box.style='position:fixed;right:6px;bottom:6px;z-index:6000;background:white;color:black;width:230px;max-height:280px;overflow:auto;padding:6px;font:11px monospace';
    const summary=document.createElement('summary');summary.textContent='test tools';box.append(summary);
    const controls=document.createElement('div');controls.style='display:grid;grid-template-columns:1fr;gap:3px';box.append(controls);
    const output=document.createElement('pre');output.id='eco-test-result';output.hidden=true;box.append(output);document.body.append(box);
    const button=(name,fn)=>{const b=document.createElement('button');b.textContent=name;b.style='height:24px';b.onclick=fn;controls.append(b);};
    button('test shop',()=>openModal('shop'));button('test bag',()=>openModal('bag'));
    button('test visual inventory',()=>{S.owned=Object.values(GEAR_ALL).flat().concat(LEGEND_GEAR).map(it=>it.id);openModal('bag');});
    button('test save/load',()=>{Save.save();const old=JSON.stringify([S.gear,S.owned,S.ecoTechUnlocked,S.ecoTechQuests,S.ecoTechSites,S.ecoTechFindings]);S=Save.load(code);output.dataset.save=old===JSON.stringify([S.gear,S.owned,S.ecoTechUnlocked,S.ecoTechQuests,S.ecoTechSites,S.ecoTechFindings])?'PASS':'FAIL';});
    button('test legendary gacha',()=>{openModal('gacha');S.tickets=Math.max(S.tickets,1);const old=Math.random;Math.random=()=>0;try{rollGacha();}finally{Math.random=old;}});
    button('test boss drop',()=>{closeModal();const old=Math.random;Math.random=()=>0;const drop=rollDrop({boss:true});Math.random=old;const host=document.createElement('div');host.id='bResult';document.getElementById('screen').append(host);B={drop,hp:60,hpMax:60,sp:25,spMax:25,gaugeGot:0};showWin();});
    button('test roster',()=>{closeModal();ecoOnlinePlayers.update('test',S.themeId,[{playerId:'test',nickname:S.name,theme:S.themeId,...ecoOnlinePlayers.summary(S)}]);ecoOnlinePlayers.open();});
    button('test battle',()=>admFight());button('test mini',()=>admMini('pang'));
    button('test restore world',()=>{stopLoop();S=Save.load(code);S.scene='world';S.modal=null;B=null;Pg=null;applyTheme(S.themeId);Wd.px=SPAWN.x;Wd.py=SPAWN.y;document.getElementById('screen').innerHTML='';render();});
    const walkResults=[];let currentTech='soil';
    const entrance=t=>{closeModal();S.lv=10;if(S.themeId!==t.theme)enterTheme(t.theme);currentTech=t.id;
      const r=EcoTech.rooms.find(r=>r.tech===t.id);if(!r){output.dataset.walk='FAIL no room '+t.id;return;}
      Wd.px=r.gate.x;Wd.py=r.gate.y+28;Wd.petX=Wd.px-34;Wd.petY=Wd.py;npcNear();checkZones();};
    for(const t of ECO_TECH){
      button('test entrance '+t.id,()=>entrance(t));
      button('test quest only '+t.id,()=>{
        closeModal();S.lv=10;if(S.themeId!==t.theme)enterTheme(t.theme);S.monIdx=Math.max(S.monIdx,4);
        const n=npcSpots().find(n=>n.id===t.npc);NQ={n,idx:0,picked:null,right:0,gave:false};
        if(!npcDone(n.id)){S.modal='npc';for(let i=0;i<n.q.length;i++){const pool=CUR.quiz.concat(CUR.quizAdv);npcAnswer(pool[n.q[i]%pool.length].a);npcNext();}}
        ecoTechOpenQuest(t.id);ecoTechAccept();
        for(const p of EcoTech.points.filter(p=>p.tech===t.id&&p.kind==='survey')){
          Wd.px=p.x;Wd.py=p.y;S.modal=null;npcNear();checkZones();ecoTechOpenPoint();ecoTechPointAction();
        }
        ecoTechOpenQuest(t.id);if(t.order)t.order.forEach(ecoTechChooseStep);ecoTechClaim();entrance(t);
      });
    }
    button('test walk entry',()=>{
      closeModal();const r=EcoTech.rooms.find(r=>r.tech===currentTech);if(!r)return;
      const start={x:Wd.px,y:Wd.py},open=r.open;output.dataset.walk='RUNNING';
      const oldLabel=document.getElementById('eco-walk-label');if(oldLabel)oldLabel.textContent='RUNNING';releaseKeys();
      // Hold test input in the existing real RAF/tick, without changing the game's release guard.
      const originalTick=tick;let frames=0,done=false;
      const finish=()=>{if(done)return;done=true;tick=originalTick;releaseKeys();const inside=ecoExplorationInside(r.tech,Wd.px,Wd.py),insideBounds=ecoRoomContains(r,Wd.px,Wd.py);
        const result={id:r.tech,open,start,end:{x:Wd.px,y:Wd.py},inside,insideBounds,frames,pass:frames>10&&(open?inside:!insideBounds)};
        walkResults.push(result);output.dataset.walk=(result.pass?'PASS':'FAIL')+' '+r.tech+' '+(open?'open':'locked');
        const label=document.getElementById('eco-walk-label')||document.createElement('div');label.id='eco-walk-label';label.textContent=output.dataset.walk;controls.append(label);
      };
      tick=dt=>{Wd.keys.u=true;frames++;originalTick(dt);if(open?Wd.py<=r.discovery.y+2:frames>=80)finish();};
      setTimeout(finish,6000);
    });
    button('test return current room',()=>{const t=ecoTechById(currentTech);closeModal();enterTheme(t.theme==='forest'?'river':'forest');enterTheme(t.theme);entrance(t);});
    button('test room inspect',()=>{closeModal();npcNear();checkZones();doAction();});
    for(const t of ECO_TECH)button('test NPC '+t.id,()=>{
      closeModal();S.lv=10;enterTheme(t.theme);setTimeout(()=>{S.monIdx=Math.max(S.monIdx,4);const n=npcSpots().find(n=>n.id===t.npc);Wd.px=n.x-55;Wd.py=n.y;talkNpc(n);},650);
    });
    button('test all quests',()=>{
      const results=[];
      for(const t of ECO_TECH){
        closeModal();S.themeId=t.theme;applyTheme(t.theme);document.getElementById('screen').innerHTML='';render();S.monIdx=4;
        const n=npcSpots().find(n=>n.id===t.npc);NQ={n,idx:0,picked:null,right:0,gave:false};
        if(!npcDone(n.id)){
          S.modal='npc';
          for(let i=0;i<n.q.length;i++){const pool=CUR.quiz.concat(CUR.quizAdv);npcAnswer(pool[n.q[i]%pool.length].a);npcNext();}
        }
        ecoTechOpenQuest(t.id);ecoTechAccept();
        for(const p of EcoTech.points.filter(p=>p.tech===t.id&&p.kind==='survey')){Wd.px=p.x;Wd.py=p.y;S.modal=null;npcNear();checkZones();ecoTechOpenPoint();ecoTechPointAction();}
        ecoTechOpenQuest(t.id);if(t.order)t.order.forEach(ecoTechChooseStep);ecoTechClaim();
        const gate=EcoTech.points.find(p=>p.tech===t.id&&p.kind==='gate');
        if(gate){Wd.px=gate.x;Wd.py=gate.y;S.modal=null;npcNear();checkZones();ecoTechOpenPoint();ecoTechPointAction();}
        const site=EcoTech.points.find(p=>p.tech===t.id&&p.kind==='discovery');
        if(site){Wd.px=site.x;Wd.py=site.y;S.modal=null;npcNear();checkZones();ecoTechOpenPoint();ecoTechPointAction();}
        results.push({id:t.id,unlocked:ecoTechHas(t.id),opened:S.ecoTechSites.includes(t.id),found:S.ecoTechFindings.includes(t.id),points:EcoTech.points.length});
      }
      closeModal();output.dataset.quests=JSON.stringify(results);Save.save();
    });
    const pointButtons=document.createElement('div');controls.append(pointButtons);let pointKey='';
    setInterval(()=>{
      const key=JSON.stringify([S.themeId,EcoTech.points.map(p=>p.key)]);
      if(key!==pointKey){pointKey=key;pointButtons.replaceChildren();for(const p of EcoTech.points){
        const b=document.createElement('button');b.textContent='test point '+p.key;b.onclick=()=>{closeModal();Wd.px=p.x;Wd.py=p.y;npcNear();checkZones();doAction();};pointButtons.append(b);
      }}
      output.textContent=JSON.stringify({theme:S.themeId,modal:S.modal,gear:S.gear,owned:S.owned,gold:S.gold,unlocked:S.ecoTechUnlocked,quests:S.ecoTechQuests,sites:S.ecoTechSites,findings:S.ecoTechFindings,rooms:EcoTech.rooms,buildMs:EcoTech.buildMs,barriers:EcoTech.barriers?.length,position:{x:Wd.px,y:Wd.py},walkResults,walk:output.dataset.walk,points:EcoTech.points.map(p=>({key:p.key,x:p.x,y:p.y,visible:ecoTechVisible(p)})),errors,save:output.dataset.save,questTests:output.dataset.quests,summary:ecoOnlinePlayers.summary(S)});
    },250);
  });
}
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
  if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
  let data=await fs.readFile(full);
  if(rel==='/index.html')data=Buffer.from(data.toString().replace(/<script defer src="https:\/\/cdn[^>]+><\/script>/,'').replace('</body>','<script>('+fixture.toString()+')();</script></body>'));
  res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(full)]||'application/octet-stream'});res.end(data);
}catch(e){res.writeHead(404);res.end();}}).listen(Number(process.argv[2])||0,'127.0.0.1',function(){console.log('Ecotech fixture: http://127.0.0.1:'+this.address().port);});
