/* Local browser QA only. Test state belongs to the fixture's localhost origin. */
addEventListener('DOMContentLoaded',()=>{
  const report={status:'ready',errors:[],results:[]};
  addEventListener('error',e=>report.errors.push(e.message));
  addEventListener('unhandledrejection',e=>report.errors.push(String(e.reason)));
  const panel=document.createElement('details');panel.id='tower-test';panel.open=true;
  panel.style='position:fixed;right:8px;bottom:8px;z-index:99999;max-height:30vh;width:220px;overflow:auto;background:#fff;color:#111;padding:6px;font:12px sans-serif';
  const title=document.createElement('summary');title.textContent='탑 검증 도구';panel.append(title);
  const out=document.createElement('pre');out.id='tower-test-result';out.style='white-space:pre-wrap';panel.append(out);document.body.append(panel);
  const publish=()=>{out.textContent=JSON.stringify(report,null,2);};
  const check=(ok,msg)=>{if(!ok)throw Error(msg);};
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  async function until(test,label){for(let i=0;i<200;i++){if(test())return;await delay(50);}throw Error('timeout: '+label);}
  function button(text,fn){const b=document.createElement('button');b.textContent=text;b.style='display:block;width:100%;margin:3px 0';b.onclick=()=>Promise.resolve().then(fn).catch(e=>{report.status='FAIL';report.errors.push(e.stack||String(e));publish();});panel.insertBefore(b,out);}
  function reset(){
    closeModal();closeBattleDom();stopLoop();B=null;Tw.on=false;
    S=newState();S.code='EC9796';S.name='탑 검증';S.petKey='earth';S.lv=10;S.gold=1000;
    S.scene='world';applyTheme('forest');S.hpCur=baseStats().hpMax;S.spCur=baseStats().spMax;
    render();stopLoop();
  }
  async function preview(e){
    reset();Tw.on=true;Tw.floor=e.floor;Tw.mon=towerMon(e.floor);Tw.elitePending=true;
    towerEliteGo();await until(()=>B&&!B.busy,'preview');
  }
  button('전체 전투 검증',async()=>{
    report.status='RUNNING';report.results=[];publish();
    for(const id of ['nightglare','glasswall']){
      const e=TOWER_ELITES.find(e=>e.id===id),r={id,checks:[],states:[],poses:[]};
      const pass=(ok,label)=>{check(ok,id+': '+label);r.checks.push(label);};
      reset();Tw.on=true;Tw.floor=e.floor;Tw.t0=Date.now();towerFloor();towerGo();
      await until(()=>B&&!B.busy,'regular battle');
      pass(!Tw.mon.eliteId,'original floor fight retained');B.ehp=1;bSkill('atk');
      await until(()=>document.querySelector('#bResult .sheet'),'regular win');
      pass(Tw.elitePending&&!Tw.floorCleared,'elite pending after regular win');
      towerEliteGo();await until(()=>B&&!B.busy,'elite entry');
      pass(Tw.mon.eliteId===id,'tower elite appears');r.stats={hp:B.ehpMax,atk:B.eatk,dr:B.edr};
      const seen=new Set([0]);
      const observer=new MutationObserver(records=>{for(const rec of records)if(rec.attributeName==='data-pose')seen.add(Number(rec.target.dataset.pose));});
      observer.observe(document.getElementById('bfoeArt'),{subtree:true,attributes:true,attributeFilter:['data-pose']});
      // Keep both actors alive while the real timers, input and renderer run a full cycle.
      Object.assign(B,{hp:10000,hpMax:10000,ehp:10000,ehpMax:10000,atk:20,sp:20,spMax:100});
      for(let i=1;i<=6;i++){
        const sp=B.sp;bSkill('atk');await until(()=>B&&!B.busy,'turn '+i);
        r.states.push({turn:i,spGain:B.sp-sp,glare:B.elite.glare,dim:B.elite.dim,reflection:B.elite.reflection,barrier:B.elite.barrier});
      }
      const a=r.states;
      if(id==='nightglare'){
        pass(a[1].glare===2&&a[2].glare===1&&a[3].glare===0,'glare ends after two player actions');
        pass(a[3].dim===2&&a[4].dim===1&&a[5].dim===0&&a[4].spGain===1&&a[5].spGain===1,'SP reduction exactly two recoveries');
      }else{
        pass(a[1].reflection===2&&a[2].reflection===1&&a[3].reflection===0,'reflection expires');
        pass(a[3].barrier===2&&a[4].barrier===1&&a[5].barrier===0,'barrier expires, no stacking');
      }
      pass(a[0].glare===0&&a[0].reflection===0&&a[2].dim===0&&a[2].barrier===0,'normal turns separate specials');
      r.poses=[...seen].sort();pass([0,1,2,3,4].every(p=>seen.has(p)),'all five frames observed in actual combat: '+r.poses.join(','));observer.disconnect();
      const gold=S.gold,exp=S.exp;B.ehp=1;bSkill('atk');
      await until(()=>document.querySelector('#bResult .sheet'),'elite win');
      pass(B.win&&Tw.floorCleared&&!Tw.elitePending,'elite victory');
      pass(S.gold-gold===e.gold&&S.exp-exp===e.exp,'exact rewards');r.reward={gold:S.gold-gold,exp:S.exp-exp};
      winBattle();pass(S.gold-gold===e.gold,'duplicate reward blocked');
      pass(document.getElementById('bResult').textContent.includes(e.after),'education after victory');
      towerNext();pass(Tw.floor===e.floor+1,'next floor resumes');
      await preview(e);B.hp=1;B.def=0;bSkill('atk');
      await until(()=>!Tw.on&&S.modal==='towerEnd','defeat');pass(Tw.lastReason==='faint','defeat uses existing tower result');
      towerStart();pass(Tw.floor===1&&!Tw.elitePending&&!Tw.eliteStage,'retry starts at first floor');towerGo();
      await until(()=>B&&!B.busy,'retry fight');pass(B.elite===null,'retry has no stale effects');
      towerRetire('quit');report.results.push(r);publish();
    }
    closeModal();openModal('bag');check(document.getElementById('modalHost').textContent.includes('가방'),'bag');closeModal();
    go('themes');check(S.scene==='themes'&&document.getElementById('screen').textContent.includes('숲'),'map');go('world');
    Save.save();const old=JSON.stringify([S.gear,S.owned,S.exp,S.gold,S.themeId]);S=Save.load('EC9796');
    check(old===JSON.stringify([S.gear,S.owned,S.exp,S.gold,S.themeId]),'save/load');
    report.regression=['bag','map','save/load'];report.status=report.errors.length?'FAIL':'PASS';publish();
  });
  for(const id of ['nightglare','glasswall'])button('미리보기 '+id,()=>preview(TOWER_ELITES.find(e=>e.id===id)));
  for(let i=0;i<5;i++)button('프레임 '+i,()=>towerElitePose(i,600000));
  reset();publish();
});
