// Exercises the real world generation and tick collision with isolated memory saves.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const nodes=new Map(),storage=new Map();
const node=()=>({innerHTML:'',textContent:'',clientWidth:1280,clientHeight:720,style:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return null;},querySelectorAll(){return [];}});
const c={console,Math:Object.create(Math),Date,Map,Set,Uint8Array,performance:{now:()=>0},
  document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},querySelectorAll:()=>[],addEventListener(){}},
  localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)},
  setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},
  addEventListener(){},SPRITES:{},Image:class{},navigator:{}};
c.window=c;vm.createContext(c);
for(const f of ['gear-data','npc-data','map-utils','theme-data','learning-data','equipment-ui','ecotech-exploration','ecotech'])vm.runInContext(read('js/'+f+'.js'),c,{filename:f});
const game=read('js/game.js');vm.runInContext(game.slice(0,game.lastIndexOf('try {\n  S=newState();')),c);
for(const f of ['paintMood','refreshObjs','paintNpcs','startLoop','bindControls','bgmUpdate','admBadge','paintHud','drawModal','toast','playSfx','updateGuide','setHeroFacing','setCompanionFacing','syncStride'])c[f]=()=>{};
for(const f of ['heroSprite','npcSVG','battleSpotSVG','bushSVG','campSVG','shopSVG','altarSVG','sp','shadowSprite','petSprite','butterflySVG'])c[f]=()=>'';
c.propGen=()=>()=>'';c.companionFollow=()=>0;c.checkZones=()=>{};c.autosave=()=>c.Save.save();c.openModal=m=>c.S.modal=m;
const json=v=>JSON.parse(JSON.stringify(v)),results=[],questData=JSON.stringify(c.ECO_TECH);
function walk(key,n=120){c.S.modal=null;c.Wd.keys={u:false,d:false,l:false,r:false};c.Wd.keys[key]=true;for(let i=0;i<n;i++)c.tick(16);c.Wd.keys[key]=false;}
for(const theme of ['forest','river','ocean','city','air','climate']){
  c.S=c.newState();Object.assign(c.S,{themeId:theme,code:'EC_EXPLORATION_TEST',petKey:'earth',scene:'world',lv:10});
  c.applyTheme(theme);c.Wd.px=c.SPAWN.x;c.Wd.py=c.SPAWN.y;c.mountWorld();
  const ts=c.ECO_TECH.filter(t=>t.theme===theme);assert.equal(c.EcoTech.rooms.length,ts.length,theme+' all side pockets');
  const originalSolids=json(c.Wd.solid),originalObjects=json(c.OBJS),originalPath=json(c.PATH);
  for(const t of ts){
    const r=c.EcoTech.rooms.find(r=>r.tech===t.id),gate=c.EcoTech.points.find(p=>p.key===t.id+'-gate'),site=c.EcoTech.points.find(p=>p.key===t.id+'-discovery');
    assert.ok(c.ecoRoomContains(r,site.x,site.y));assert.ok(c.ecoRoomPathClear(r));
    assert.ok(!c.ecoRoomContains(r,c.SPAWN.x,c.SPAWN.y));assert.ok(c.OBJS.every(o=>c.ecoRoomDistance(r,o.x,o.y)>o.r+90));
    assert.ok(c.Wd.solid.every(o=>c.ecoRoomDistance(r,o.x,o.y)>o.r));
    c.Wd.px=gate.x;c.Wd.py=gate.y+28;walk('u');assert.ok(c.Wd.py>r.y+r.h,'locked entrance really blocks tick: '+t.id);
    // Acquiring a technology never opens the field barrier on its own.
    c.S.ecoTechUnlocked.push(t.id);c.ecoExplorationSync();assert.equal(r.open,false);
    c.Wd.px=gate.x;c.Wd.py=gate.y+28;walk('u');assert.ok(c.Wd.py>r.y+r.h);
    c.Wd.px=gate.x;c.Wd.py=gate.y;c.EcoTech.active=gate.key;c.S.modal='ecoPoint';c.ecoTechPointAction();assert.equal(r.open,true);
    c.Wd.px=gate.x;c.Wd.py=gate.y+28;walk('u',Math.round((c.Wd.py-site.y)/(.19*16)));assert.ok(c.ecoExplorationInside(t.id,c.Wd.px,c.Wd.py),'opened entrance admits player');
    assert.ok(Math.abs(c.Wd.py-site.y)<25,'reward point requires physically walking inside');
    c.EcoTech.active=site.key;c.S.modal='ecoPoint';c.ecoTechPointAction();assert.ok(c.S.ecoTechFindings.includes(t.id));
    c.Wd.px=r.x+r.w+1;c.Wd.py=site.y;assert.equal(c.ecoTechPointContext(),null,'cannot read the reward through an exterior wall');
    // An opened pocket cannot be bypassed through its side walls.
    c.Wd.px=r.x-24;c.Wd.py=r.y+100;walk('r');assert.ok(c.Wd.px<r.x);
    c.Wd.px=r.x+r.w+24;c.Wd.py=r.y+100;walk('l');assert.ok(c.Wd.px>r.x+r.w);
    c.Wd.px=r.x+100;c.Wd.py=r.y-24;walk('d');assert.ok(c.Wd.py<r.y);
    c.Wd.px=r.gate.x;c.Wd.py=site.y;walk('d',80);assert.ok(c.Wd.py>r.y+r.h,'exit remains usable');
    c.Save.save();c.S=c.Save.load(c.S.code);c.ecoTechBuildPoints();
    assert.ok(c.EcoTech.rooms.find(q=>q.tech===t.id).open);assert.ok(c.S.ecoTechFindings.includes(t.id));
    assert.deepEqual(json(c.Wd.solid),originalSolids);assert.deepEqual(json(c.OBJS),originalObjects);assert.deepEqual(json(c.PATH),originalPath);
    results.push({id:t.id,x:r.x,y:r.y,w:r.w,h:r.h,decor:r.decor.length,entry:true,exit:true,persist:true});
  }
  const geom=json(c.EcoTech.rooms.map(({tech,x,y,w,h})=>({tech,x,y,w,h})));
  c.S.gauge=100;c.mountWorld();assert.deepEqual(json(c.EcoTech.rooms.map(({tech,x,y,w,h})=>({tech,x,y,w,h}))),geom,'stable across purification');
  c.S.cleared=Array.from(c.THEME_ORDER);c.applyTheme(theme);c.mountWorld();
  assert.deepEqual(json(c.EcoTech.rooms.map(({tech,x,y,w,h})=>({tech,x,y,w,h}))),geom,'stable when the final optional NPC appears');
  // Existing positions inside newly-added closed areas can leave without being trapped.
  c.S.ecoTechSites=[];c.ecoExplorationSync();const r=c.EcoTech.rooms[0];c.Wd.px=r.x+120;c.Wd.py=r.y+100;
  walk('d',80);assert.ok(c.Wd.py>r.y+r.h);walk('u',80);assert.ok(c.Wd.py>r.y+r.h,'cannot re-enter after escape');
}
assert.equal(JSON.stringify(c.ECO_TECH),questData,'original quests and education data preserved');
console.log(JSON.stringify(results));console.log('PASS: 8 real generated pockets; unchanged main path/objects/solids; closed and acquired-only blocked; field use opens; reward inside; walls and exit; persistence; purification stability; legacy-position escape.');
