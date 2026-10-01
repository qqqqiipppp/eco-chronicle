// Real data and game functions in an isolated VM; never touches a student's storage.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const before=JSON.parse(read('tests/fixtures/equipment-before-ecotech.json'));
const nodes=new Map(),storage=new Map();let saves=0;
const node=()=>({innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return null;}});
const c={console,Math:Object.create(Math),Date,Map,Set,Uint8Array,performance:{now:()=>0},
  document:{getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],addEventListener(){},createElement:node},
  localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)},
  addEventListener(){},setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},
  requestAnimationFrame(){return 1;},cancelAnimationFrame(){},SPRITES:{},Image:class{},navigator:{}};
c.window=c;vm.createContext(c);
for(const file of ['gear-data','npc-data','map-utils','theme-data','learning-data','equipment-ui','ecotech-exploration','ecotech'])
  vm.runInContext(read('js/'+file+'.js'),c,{filename:file});
const source=read('js/game.js');
vm.runInContext(source.slice(0,source.lastIndexOf('try {\n  S=newState();')),c,{filename:'game.js'});
c.S=c.newState();c.S.petKey='earth';c.S.code='EC_TEST_ECO';c.applyTheme('forest');
for(const fn of ['drawModal','paintHud','paintMood','refreshObjs','toast','playSfx','releaseKeys','ecoTechPaint'])c[fn]=()=>{};
c.autosave=()=>{saves++;c.Save.save();};c.openModal=kind=>{c.S.modal=kind;};
const json=x=>JSON.parse(JSON.stringify(x));
const names=['집게','갈퀴','뜰채','삽','수거망','고압세척기','작업복','안전조끼','방수복','보호복','화학물질용 보호복','안전모','보안경','방진마스크','방독마스크','등산화','장화','안전화','절연장화','준설기','유회수기','폐기물 압축기','전동식 호흡보호구','오일펜스','태양광 랜턴'];
const all=Object.values(c.GEAR_ALL).flat().concat(c.LEGEND_GEAR),old=Object.values(before.gear).flat().concat(before.legend);
assert.deepEqual(all.map(i=>i.name),names);
for(const item of all){
  const was=old.find(i=>i.id===item.id),unchanged={...json(item)};delete unchanged.eduDesc;delete unchanged.shopPrice;unchanged.name=was.name;
  assert.deepEqual(unchanged,was,'stats/effects/icons/price unchanged: '+item.id);
  assert.ok(item.eduDesc.length>25);
  assert.match(c.gearEducation(item),/게임 효과:/);assert.match(c.gearEducation(item),/실제 쓰임:/);
  if(was.desc)assert.ok(c.gearEducation(item).includes(was.desc));
  if(was.price)assert.equal(c.gearShopPrice(item),was.price*1.2);
}
const legacy=c.newState();legacy.code=c.S.code;legacy.petKey='earth';legacy.owned=old.map(i=>i.id);
legacy.gear={weapon:'L1',armor:'L5',helm:'h4',shoes:'L6'};
for(const key of Object.keys(legacy))if(key.startsWith('ecoTech'))delete legacy[key];
c.S=legacy;const stats=json(c.baseStats());c.Save.save();c.S=c.Save.load(legacy.code);
assert.deepEqual(json(c.S.gear),json(legacy.gear));assert.deepEqual(json(c.S.owned),json(legacy.owned));
assert.deepEqual(json(c.baseStats()),stats);assert.deepEqual(json(c.S.ecoTechUnlocked),[]);
assert.equal(c.legendOf('weapon').eff,'bleed');assert.equal(c.legendOf('armor').p,.35);
// Every purchasable item charges only its shop price. No second charge for duplicates.
for(const [slot,items] of Object.entries(c.GEAR_ALL))for(const it of items){
  c.S=c.newState();c.S.petKey='earth';c.S.gold=1000;c.buyGear(slot,it.id);
  assert.equal(c.S.gold,1000-it.shopPrice);assert.equal(c.S.gear[slot],it.id);assert.ok(c.gearNoticeHTML().includes(it.eduDesc));
  c.buyGear(slot,it.id);assert.equal(c.S.gold,1000-it.shopPrice);
  c.S.owned=[];c.S.gold=it.shopPrice-1;c.buyGear(slot,it.id);assert.equal(c.S.owned.length,0);
}
// Force the existing weighted gacha gear path and verify each duplicate conversion.
const legacyGacha=c.GACHA;c.GACHA=[{w:1,type:'gear'}];c.legendReveal=()=>{};
for(const [slot,items] of Object.entries(c.GEAR_ALL))for(const [tier,it] of items.entries()){
  c.S=c.newState();c.S.petKey='earth';c.S.owned=[it.id];c.S.gold=0;c.S.tickets=1;
  const total=items.reduce((sum,_,i)=>sum+(c.GEAR_TIER_W[i]||1),0),start=items.slice(0,tier).reduce((sum,_,i)=>sum+(c.GEAR_TIER_W[i]||1),0);
  const random=[0,1,(Object.keys(c.GEAR_ALL).indexOf(slot)+.1)/4,(start+.1)/total];c.Math.random=()=>random.shift()??.9;c.rollGacha();
  assert.equal(c.S.gold,Math.max(20,Math.round(it.price*.35)),it.id+' duplicate gold');assert.ok(c.gachaResult.includes(it.eduDesc));
}
c.GACHA=legacyGacha;
// Existing drop and legend paths expose education without changing drop selection.
c.S=c.newState();c.S.petKey='earth';c.S.tickets=1;c.Math.random=()=>0;c.rollGacha();
assert.ok(c.gachaResult.includes(c.LEGEND_GEAR[0].eduDesc));assert.ok(c.S.owned.includes('L1'));
c.S.owned=[];const drop=c.rollDrop({boss:true});assert.equal(drop.item.id,'w1');
nodes.set('bResult',node());c.B={drop,hp:60,hpMax:60,sp:25,spMax:25,gaugeGot:0};c.curMon=()=>({name:'test',gold:5,exp:5,after:'test'});c.showWin();
assert.ok(nodes.get('bResult').innerHTML.includes(drop.item.eduDesc));
c.S.gear.weapon='L1';c.showWin();assert.ok(nodes.get('bResult').innerHTML.includes('가방에 보관'));
// All eight add-on quests keep the original NPC data and quest completion untouched.
const npcBefore=read('js/npc-data.js');
for(const t of c.ECO_TECH){
  c.S=c.newState();c.S.code='EC_TEST_ECO';c.S.petKey='earth';c.S.lv=10;c.S.cleared=Array.from(c.THEME_ORDER);c.applyTheme(t.theme);c.S.themeId=t.theme;
  const npc=c.NPC_DATA[t.theme].find(n=>n.id===t.npc);assert.ok(npc);
  c.NQ={n:npc};c.ecoTechOpenQuest(t.id);assert.notEqual(c.S.modal,'ecoQuest','old NPC story must finish first');
  c.S.npcDone=[t.npc];c.ecoTechOpenQuest(t.id);assert.equal(c.S.modal,'ecoQuest');
  c.ecoTechAccept();c.ecoTechAccept();assert.equal(c.S.ecoTechQuests[t.id].surveyed.length,0);
  c.ecoTechClaim();assert.equal(c.S.ecoTechUnlocked.length,0,'cannot claim prematurely');
  const questStats=json(c.baseStats()),oldEconomy=[c.S.gold,c.S.exp,c.S.tickets];
  c.Wd.solid=[];c.ecoTechBuildPoints();
  const points=c.EcoTech.points.filter(p=>p.tech===t.id);
  assert.equal(points.length,t.surveys.length+2,t.id+' all markers placed');
  const gate=points.find(p=>p.kind==='gate'),hidden=points.find(p=>p.kind==='discovery');
  c.Wd.px=gate.x;c.Wd.py=gate.y;c.EcoTech.active=gate.key;c.S.modal='ecoPoint';c.ecoTechPointAction();assert.equal(c.S.ecoTechSites.length,0);
  assert.equal(c.ecoTechVisible(hidden),false);
  if(t.order){
    c.ecoTechOpenQuest(t.id);['소독','여과','침전','응집'].forEach(s=>c.ecoTechChooseStep(s));assert.equal(c.ecoTechQuestReady(t),false);
    t.order.forEach(s=>c.ecoTechChooseStep(s));
  }else{
    for(const p of points.filter(p=>p.kind==='survey')){
      c.Wd.px=p.x;c.Wd.py=p.y;c.EcoTech.active=p.key;c.S.modal='ecoPoint';c.ecoTechPointAction();c.ecoTechPointAction();
    }
    assert.equal(c.S.ecoTechQuests[t.id].surveyed.length,3);
  }
  c.ecoTechOpenQuest(t.id);assert.equal(c.ecoTechQuestReady(t),true);c.ecoTechClaim();c.ecoTechClaim();
  assert.deepEqual(json(c.S.ecoTechUnlocked),[t.id]);assert.deepEqual(json(c.S.npcDone),[npc.id]);
  c.Wd.px=gate.x;c.Wd.py=gate.y;c.EcoTech.active=gate.key;c.S.modal='ecoPoint';c.ecoTechPointAction();c.ecoTechPointAction();
  assert.deepEqual(json(c.S.ecoTechSites),[t.id]);assert.equal(c.ecoTechVisible(hidden),true);
  c.Wd.px=hidden.x;c.Wd.py=hidden.y;c.EcoTech.active=hidden.key;c.ecoTechPointAction();
  assert.deepEqual(json(c.S.ecoTechFindings),[t.id]);
  assert.deepEqual(json(c.baseStats()),questStats);assert.deepEqual([c.S.gold,c.S.exp,c.S.tickets],oldEconomy);
  c.Save.save();c.S=c.Save.load(c.S.code);assert.ok(c.ecoTechHas(t.id));assert.ok(c.S.ecoTechSites.includes(t.id));
  c.stashTheme();assert.ok(!c.THEME_FIELDS.some(k=>k.startsWith('ecoTech')),'techs are global across themes');
  const render=c.render;c.render=()=>{};
  c.enterTheme(t.theme==='forest'?'river':'forest');assert.ok(c.ecoTechHas(t.id));
  c.enterTheme(t.theme);assert.ok(c.ecoTechHas(t.id));assert.ok(c.S.ecoTechFindings.includes(t.id));
  assert.ok(c.S.npcDone.includes(npc.id));c.render=render;
}
assert.equal(read('js/npc-data.js'),npcBefore);
const corrupt={ecoTechUnlocked:['soil','soil','unknown'],ecoTechSites:['soil','water'],ecoTechFindings:['water'],ecoTechQuests:{soil:{accepted:true,surveyed:[0,0,7,-1,'1']}}};
c.ecoTechNormalize(corrupt);assert.deepEqual(json(corrupt.ecoTechUnlocked),['soil']);assert.deepEqual(json(corrupt.ecoTechQuests.soil.surveyed),[0]);assert.deepEqual(json(corrupt.ecoTechFindings),[]);
console.log('PASS: 25 identities/stats/effects, 19 shop-only prices and duplicate payouts, legendary legacy save, acquisition UI, 8 NPC quests, no premature unlock, repeat safety, exploration and persistence. Saves:',saves);
