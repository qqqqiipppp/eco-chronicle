// Disposable localhost browser fixture; none of these controls ship in index.html.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function fixture(){
 const errors=[],results={};
 addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 document.addEventListener('DOMContentLoaded',()=>{
  const box=document.createElement('details');box.id='rules-test-tools';box.open=true;
  box.style='position:fixed;right:4px;bottom:4px;z-index:7000;background:#fff;color:#111;width:245px;max-height:240px;overflow:auto;padding:8px;font:12px monospace';
  box.innerHTML='<summary>Local verification</summary>';document.body.append(box);
  const output=document.createElement('pre');output.id='rules-test-result';output.style='white-space:pre-wrap';box.append(output);
  const show=()=>{output.textContent=JSON.stringify({results,errors,theme:S.themeId,lv:S.lv,exp:S.exp,cleared:S.cleared},null,2);};
  const check=(ok,msg)=>{if(!ok)throw Error(msg);};
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function clean(){stopLoop();closeBattleDom();InterludeRun=null;Tw.on=false;B=null;S.modal=null;}
  function reset(n=0){clean();Adm.on=false;document.body.classList.remove('admin-active');document.getElementById('admBadge')?.remove();S=Object.assign(newState(),{code:'EC9876',name:'진행 검증',petKey:'earth',lv:10,exp:1300,scene:'world',cleared:THEME_ORDER.slice(0,n)});applyTheme('forest');Wd.ready=false;Wd.px=SPAWN.x;Wd.py=SPAWN.y;document.getElementById('screen').innerHTML='';render();}
  function button(name,fn){const b=document.createElement('button');b.textContent=name;b.style='display:block;width:100%;margin:3px 0';b.onclick=async()=>{try{await fn();show();}catch(e){results.failure=e.message;show();throw e;}};box.insertBefore(b,output);}
  button('Lv10 · no clear · map',()=>{reset();go('themes');});
  button('Forest clear · map',()=>{reset(1);go('themes');});
  button('Three clear · map',()=>{reset(3);go('themes');});
  button('Legacy Lv6 EXP430 · status',()=>{reset(3);S.lv=6;S.exp=430;Save.save();quickLoad(S.code);check(S.lv===6&&S.exp===430,'legacy level changed');openStatus();results.legacy='Lv6 EXP430 kept; next 672';});
  button('Travel/save/EXP checks',()=>{
   for(let n=0;n<6;n++){reset(n);for(let i=0;i<6;i++)check(themeOpen(THEMES[THEME_ORDER[i]])===(i<=n),'unlock '+n+'/'+i);S.lv=1;enterTheme(THEME_ORDER[n]);check(S.themeId===THEME_ORDER[n],'Lv1 completed travel');enterTheme('forest');check(S.themeId==='forest','revisit');}
   reset();S.lv=10;enterTheme('river');check(S.themeId==='forest','Lv10 bypass');pgCert();pgClear();check(!S.cleared.length,'certificate bypass');
   Adm.on=true;enterTheme('climate');check(S.themeId==='climate','admin travel');Adm.on=false;
   reset(3);S.lv=6;S.exp=430;Save.save();quickLoad(S.code);check(S.lv===6&&S.exp===430&&S.cleared.join('|')==='forest|river|ocean','legacy save');
   for(let i=1;i<LEVELS.length;i++)for(const delta of [-1,0,1]){S.lv=1;S.exp=LEVELS[i].need+delta;addExp(0);check(S.lv===(delta<0?i:i+1),'EXP boundary '+i+'/'+delta);}
   results.rules='PASS: 6 unlock sets, revisits/admin, premature clear blocked, legacy save, 27 EXP boundaries';reset();go('themes');
  });
  button('World/Tower 20 selections',()=>{
   reset();EncounterMiniCycle={pool:'',bag:[],last:null};const world=[],tower=[],floors=[];
   for(let i=0;i<20;i++){S.monIdx=i%2?2:0;S.encounterWon=true;advanceEncounter();world.push(S.interludePending.mode);S.interludePending=null;}
   Tw.on=true;for(let f=1;tower.length<20;f++)if(floorKind(f)==='mini'){Tw.floor=f;Tw.floorCleared=false;Tw.interludePending=null;Tw.mon=towerMon(f);towerGo();tower.push(Tw.interludePending.mode);floors.push(f);}
   const all=world.concat(tower);for(let i=1;i<all.length;i++)check(all[i]!==all[i-1],'consecutive duplicate');
   for(const list of [world,tower])for(let i=0;i<20;i+=5)check(new Set(list.slice(i,i+5)).size===5,'cycle duplicate');
   results.selection={world,tower,floors,worldCounts:Object.fromEntries(availableEncounterMinis().map(id=>[id,world.filter(x=>x===id).length])),towerCounts:Object.fromEntries(availableEncounterMinis().map(id=>[id,tower.filter(x=>x===id).length]))};clean();S.scene='world';render();
  });
  function openGate(mode,tower=false){reset();stopLoop();S.monIdx=1;Tw.on=tower;Tw.floor=2;Tw.mon=towerMon(2);Tw.floorCleared=false;const p={after:0,mode,done:false,attempts:0};if(tower)Tw.interludePending=p;else S.interludePending=p;launchInterlude();return p;}
  function complete(mode,won){
   if(mode==='pang'){Pg.count=PANG_GOAL;won?pangWin():pangLose('time');}
   else if(mode==='match'){Mt.done=Mt.need;won?mtWin():mtLose();}
   else if(mode==='spheres'){if(won){Sp.cells.forEach(cell=>cell.state='clean');spCheckWin();}else{Sp.sec=0;Sp.over=true;miniLose('spResult','시간이 다 됐어요.','retrySphere()');}}
   else if(mode==='timing'){Arc.status=won?'won':'lost';arcFinish(Arc);}
   else{Care.score=won?100:0;careFinish(Care);}
  }
  for(const mode of ['pang','spheres','timing','match','runner'])button('Show '+mode,()=>openGate(mode));
  button('All five real launch/result checks',async()=>{
   const checks=[];
   for(const tower of [false,true])for(const mode of availableEncounterMinis())for(const won of [false,true]){
    const p=openGate(mode,tower);await pause(120);const economy=[S.gold,S.exp,S.gauge];complete(mode,won);
    check(p.done===won&&p.attempts===(won?0:1),'result '+mode);check(economy.join('|')===[S.gold,S.exp,S.gauge].join('|'),'gate rewards '+mode);
    if(won){continueInterlude();await pause(700);check(tower?Tw.floor===3:S.modal==='battle','next combat '+mode);}
    else{check(tower?Tw.on&&!Tw.floorCleared:S.monIdx===1,'failure advances');launchInterlude();check(pendingInterlude()===p,'retry changes gate');}
    checks.push({path:tower?'tower':'world',mode,result:won?'win':'lose',pass:true});clean();
   }
   results.games=checks;reset();show();
  });
  button('Restore ordinary world',()=>reset());
  reset();show();
 });
}
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
 if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
 let data=await fs.readFile(full);
 if(rel==='/index.html')data=Buffer.from(data.toString().replace('</body>','<script>('+fixture.toString()+')();</script></body>'));
 res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(full)]||'application/octet-stream'});res.end(data);
}catch(e){res.writeHead(404);res.end();}}).listen(Number(process.argv[2])||8767,'127.0.0.1',function(){console.log('Progression fixture: http://127.0.0.1:'+this.address().port);});
