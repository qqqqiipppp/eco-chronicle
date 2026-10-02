// Local browser QA only; never loaded by the shipped index.html.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function fixture(){
 const report={errors:[],status:'ready'};
 addEventListener('error',e=>report.errors.push(e.message));
 addEventListener('unhandledrejection',e=>report.errors.push(String(e.reason)));
 addEventListener('DOMContentLoaded',()=>{
  S=Object.assign(newState(),{name:'돌봄 검증',code:'EC9864',petKey:'earth',scene:'world'});Adm.on=true;
  applyTheme('forest');render();stopLoop();
  const panel=document.createElement('details');panel.open=true;panel.style='position:fixed;right:6px;top:6px;z-index:99999;background:#fff;color:#111;max-height:30vh;overflow:auto;width:220px;font:11px monospace;padding:6px';
  const title=document.createElement('summary');title.textContent='돌봄 검증';panel.append(title);
  const out=document.createElement('pre');out.id='care-test-result';out.style='white-space:pre-wrap';
  const show=()=>out.textContent=JSON.stringify(report,null,2);
  function button(label,fn){const b=document.createElement('button');b.textContent=label;b.style='display:block;width:100%;margin:3px 0';b.onclick=()=>Promise.resolve().then(fn).catch(e=>{report.status='FAIL';report.errors.push(e.stack);show();});panel.append(b);}
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const check=(ok,label)=>{if(!ok)throw Error(label);};
  async function until(fn){for(let n=0;n<800;n++){if(fn())return;await sleep(20);}throw Error('timeout');}
  function tap(button){button.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));button.click();}
  function start(){animalCareMount();document.querySelector('[data-care-start]').click();}
  button('관리자 돌봄 실행',()=>admMini('runner'));
  button('동물별 20회 순서 검증',()=>{
   const result=[];
   for(let i=0;i<4;i++){
    const orders=[];for(let n=0;n<20;n++){
     start();careSetStage(Care,i);const order=Care.needs.map(x=>x[2]);
     check(order.length===CARE_STAGES[i].needs.length+3,'+3 events');check(careOrderValid(Care.needs),'adjacency/pattern');
     const counts=CARE_STAGES[i].needs.map(x=>order.filter(k=>k===x[2]).length);check(Math.max(...counts)-Math.min(...counts)<=1,'balance');
     check(!n||order.join()!==orders[n-1].join(),'retry duplicate');orders.push(order);animalCareStop();
    }result.push({animal:CARE_STAGES[i].name,count:20,unique:new Set(orders.map(x=>x.join())).size,orders});
   }report.sequences=result;report.status='sequence PASS';show();start();
  });
  button('실제 25회 자동 플레이',async()=>{
   start();const a=Care,began=performance.now(),records=[],samples=[],seeds={...S.seeds};let previous=performance.now();
   const observer=setInterval(()=>{
    const now=performance.now();samples.push(now-previous);previous=now;
    if(a.motion){const sprite=a.motion.sprite.getBoundingClientRect(),area=document.querySelector('.care-scene').getBoundingClientRect();
     check(sprite.left>=area.left-1&&sprite.right<=area.right+1&&sprite.top>=area.top-1&&sprite.bottom<=area.bottom+1,'clipped sprite');}
   },50);
   report.status='playing';show();
   try{
    while(Care===a){
     if(a.status==='paused'){carePause(a,false);}
     if(a.inputReady){
      const stage=a.stage,prompt=a.prompt,key=a.needs[prompt][2],seconds=a.responseSeconds;
      await sleep(Math.min(900,(a.promptEndsAt-a.elapsed)*1000-50));
      if(Care!==a||a.prompt!==prompt||a.stage!==stage)continue;
      const b=document.querySelector('[data-care-action="'+key+'"]'),before=a.score;tap(b);
      check(a.answered&&a.motion,'reaction starts');check([...document.querySelectorAll('.care-action')].every(x=>x.disabled),'locked');
      for(let n=0;n<10;n++)tap(b);check(a.score===Math.min(100,before+5),'duplicate score');
      records.push({animal:CARE_STAGES[stage].id,prompt,key,seconds,kind:a.motion.kind});
      await until(()=>Care!==a||!a.motion);check(!document.getElementById('careAnimal')||document.getElementById('careAnimal').style.transform==='','return');
     }else await sleep(20);
    }
    const economy=JSON.stringify([S.seeds,S.gold,S.exp]);careFinish(a);check(economy===JSON.stringify([S.seeds,S.gold,S.exp]),'duplicate reward');
    report.play={events:records.length,records,seconds:(performance.now()-began)/1000,score:a.score,result:document.getElementById('modalHost').innerText,seeds:{dandelion:S.seeds.dandelion-(seeds.dandelion||0),daisy:S.seeds.daisy-(seeds.daisy||0)},duplicateReward:false};
    check(records.length===25&&a.score===100,'full play');check(report.play.seeds.dandelion===3&&report.play.seeds.daisy===2,'unchanged seeds');report.status='play PASS';
   }finally{clearInterval(observer);show();}
  });
  button('전체 시간초과 실패',async()=>{
   start();const a=Care,began=performance.now(),economy=JSON.stringify([S.seeds,S.gold]),solace=Math.max(3,Math.round(curMon().exp*.3)),beforeExp=S.exp,beforeStreak=S.defeatStreak;let count=1,token=a.inputToken;
   report.status='timeout playing';show();
   while(Care===a){if(a.status==='paused')carePause(a,false);await sleep(20);if(token!==a.inputToken){token=a.inputToken;count++;}}
   const seconds=(performance.now()-began)/1000;
   check(count===25&&a.score===0,'25 missed events');check(seconds<=77.5,'legacy time cap');check(economy===JSON.stringify([S.seeds,S.gold]),'no failure seeds/gold');
   check(S.exp===beforeExp+solace&&S.defeatStreak===beforeStreak+1,'legacy consolation reward');
   report.failure={count,score:a.score,seconds,result:document.getElementById('modalHost').innerText};report.status='failure PASS';show();
  });
  button('선입력·오답·광클 검증',async()=>{
   start();const a=Care;let b=document.querySelector('.care-action');tap(b);check(a.score===35&&!a.answered,'before display');
   await until(()=>a.inputReady);
   const wrong=[...document.querySelectorAll('.care-action')].find(b=>b.dataset.careAction!==a.needs[a.prompt][2]);tap(wrong);
   const token=a.inputToken;for(const button of document.querySelectorAll('.care-action'))tap(button);check(a.score===33,'first wrong only');
   await until(()=>a.inputToken!==token&&a.inputReady);
   b=document.querySelector('[data-care-action="'+a.needs[a.prompt][2]+'"]');b.click();check(a.score===33,'click without gesture');
   tap(b);check(a.score===38,'fresh gesture');const handled=a.prompt;
   for(let n=0;n<85;n++){for(const button of document.querySelectorAll('.care-action'))tap(button);await sleep(20);}
   check(a.prompt===handled+1&&!a.answered&&!a.inputReady&&a.score===38,'continued spam blocked');
   await until(()=>a.inputReady);report.input='PASS: pre-input, first-wrong-only, missing gesture, motion lock, continuous spam cannot answer next';report.status='input PASS';show();carePause(a,true);
  });
  for(let i=0;i<4;i++)for(const need of CARE_STAGES[i].needs)button(CARE_STAGES[i].name+' '+need[2]+' 모션',async()=>{
   start();careSetStage(Care,i);const a=Care;a.needs[0]=need;a.answered=true;careSetPrompt(a,0);await until(()=>a.inputReady);
   tap(document.querySelector('[data-care-action="'+need[2]+'"]'));
   await until(()=>{if(a.status==='paused')carePause(a,false);return a.motion&&a.motion.age>=(need[2]==='hide'?.8:.55);});
   a.status='paused';report.preview={animal:CARE_STAGES[i].id,action:need[2],motion:a.motion.kind,age:a.motion.age};show();
  });
  panel.append(out);document.body.append(panel);show();
 });
}
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),file=path.resolve(root,'.'+rel);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
 let data=await fs.readFile(file);
 if(rel==='/index.html')data=Buffer.from(data.toString().replace(/<script defer[^>]*><\/script>/g,'').replace('</body>','<script>('+fixture.toString()+')();</script></body>'));
 res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream'});res.end(data);
}catch(e){res.writeHead(404);res.end();}}).listen(Number(process.argv[2])||61410,'127.0.0.1',function(){console.log('Care QA http://127.0.0.1:'+this.address().port);});
