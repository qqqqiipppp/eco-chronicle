'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
const root=path.resolve(__dirname,'..');
const {stampHtml,stampCss,update}=require('../tools/update-build-version.cjs');
function context(){
  const scope=vm.createContext({URLSearchParams,Set,console});
  vm.runInContext(fs.readFileSync(path.join(root,'js/build-version.js'),'utf8'),scope);
  return scope;
}
function collectAssets(value,out=[],seen=new Set()){
  if(typeof value==='string'&&/(^|\/)assets\//.test(value))out.push(value);
  else if(value&&typeof value==='object'&&!seen.has(value)){
    seen.add(value);Object.values(value).forEach(item=>collectAssets(item,out,seen));
  }
  return out;
}

test('asset query preserves paths, other query values and fragments; external/generated images stay untouched',()=>{
  const c=context(),v=c.BUILD_VERSION;
  assert.equal(c.ecoAssetUrl('./assets/images/monsters/tower-carbon.webp'), './assets/images/monsters/tower-carbon.webp?v='+v);
  assert.equal(c.ecoAssetUrl('../assets/a.png?size=2&v=old#frame'), '../assets/a.png?size=2&v='+v+'#frame');
  const once=c.ecoAssetUrl('./assets/a.png?v=old&v=duplicate');
  assert.equal(c.ecoAssetUrl(once),once);
  assert.equal(new URLSearchParams(once.split('?')[1]).getAll('v').length,1);
  for(const source of ['data:image/png;base64,AA','blob:https://example/a','https://example/assets/a.png','//cdn.example/assets/a.png','plain description','./js/game.js',undefined,null])
    assert.equal(c.ecoAssetUrl(source),source);
});

test('versioning only visits supplied maps and handles shared references and cycles',()=>{
  const c=context(),outside={image:'./assets/outside.png'};
  const shared={image:'./assets/a.png',level:9,description:'학생 기록'},map={shared,again:shared};map.loop=map;
  c.ecoVersionAssets([map]);
  assert.equal(shared.image,'./assets/a.png?v='+c.BUILD_VERSION);
  assert.equal(shared.level,9);assert.equal(shared.description,'학생 기록');
  assert.equal(outside.image,'./assets/outside.png');
});

test('HTML stamping retains script order/defer and leaves CDN unchanged',()=>{
  const html='<link rel="stylesheet" href="./css/style.css?v=old"><script src="./js/first.js"></script><script defer src="https://cdn.example/a.js"></script><script defer src="./js/last.js?other=1#part"></script>';
  const output=stampHtml(html,'release.2');
  assert.equal(output,'<link rel="stylesheet" href="./css/style.css?v=release.2"><script src="./js/first.js?v=release.2"></script><script defer src="https://cdn.example/a.js"></script><script defer src="./js/last.js?other=1&v=release.2#part"></script>');
  assert.equal(stampHtml(output,'release.2'),output);
  const css="a{background:url('../assets/images/objects/campfire-forest.png?v=old')}b{background:url('../assets/unchanged.png')}";
  const next=stampCss(css,'release.2');
  assert.equal(next,"a{background:url('../assets/images/objects/campfire-forest.png?v=release.2')}b{background:url('../assets/unchanged.png')}");
  assert.equal(stampCss(next,'release.2'),next);
});

test('deployed HTML and six CSS campfires share canonical version; referenced local files exist',()=>{
  const c=context(),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const local=[...html.matchAll(/<(?:link|script)\b[^>]*\b(?:src|href)="(\.\/(?:css|js)\/[^\"]+)"[^>]*>/g)].map(match=>match[1]);
  assert.equal(local.length,36);
  const scriptTags=[...html.matchAll(/<script\b([^>]*\bsrc="([^"]+)"[^>]*)>/g)];
  const expected=['boot','build-version','sprites','sprite-meta','player-tint','visuals','audio-data','gear-data','equipment-ui','ecotech-exploration','ecotech','npc-data','map-utils','theme-data','learning-data','learning-ui','learning-diagrams','battle-view','encounters','minigame','tower-elites','animal-care','game','sound-settings','plogging'];
  assert.deepEqual(scriptTags.slice(0,25).map(match=>match[2].split('?')[0]),expected.map(name=>'./js/'+name+'.js'));
  assert.ok(scriptTags.slice(0,25).every(match=>!(/\b(?:async|defer|type)=?/.test(match[1]))));
  assert.ok(scriptTags.slice(25).every(match=>/\bdefer\b/.test(match[1])));
  assert.deepEqual(scriptTags.slice(26).map(match=>match[2].split('?')[0]),['supabase','remote-players','movement','player-list','presence'].map(name=>'./js/'+name+'.js'));
  for(const url of local){
    assert.equal(new URLSearchParams(url.split('?')[1]).get('v'),c.BUILD_VERSION,url);
    assert.ok(fs.existsSync(path.join(root,url.split('?')[0])),url);
  }
  const campfires=[...fs.readFileSync(path.join(root,'css/style.css'),'utf8').matchAll(/url\('([^']*campfire-[^']+)'\)/g)].map(match=>match[1]);
  assert.equal(campfires.length,6);
  campfires.forEach(url=>assert.equal(new URLSearchParams(url.split('?')[1]).get('v'),c.BUILD_VERSION));
  assert.ok(html.indexOf('build-version.js')<html.indexOf('sprites.js'));
  assert.ok(html.indexOf('CARE_STAGES\n]);')<html.indexOf('src="./js/game.js'));
  assert.ok(html.indexOf('ecoVersionAssets([PANG_NPC_ART])')>html.indexOf('src="./js/plogging.js'));
});

test('actual art definitions and overriding gear maps normalize to existing versioned assets',()=>{
  const c=context();
  for(const file of ['sprites','sprite-meta','visuals','gear-data','equipment-ui','tower-elites','animal-care','plogging'])
    vm.runInContext(fs.readFileSync(path.join(root,'js/'+file+'.js'),'utf8'),c,{filename:file+'.js'});
  vm.runInContext('var testedMaps=[SPRITES,ECO_MONSTER_ART,ECO_BOSS_ART,ECO_BATTLE_ART,ECO_ARCADE_ART,ECO_SCENES,ECO_HUMAN,ECO_ART,ECO_NPC,ECO_MON,ECO_WALK,ECO_TOWER_ELITE_ART,CARE_PROP_ART,CARE_STAGES,PANG_NPC_ART];ecoVersionAssets(testedMaps);',c);
  const assets=collectAssets(c.testedMaps);
  assert.ok(assets.length>300,'all live art maps should be covered; counted '+assets.length);
  assets.forEach(url=>{
    assert.equal(new URLSearchParams(url.split('?')[1]).get('v'),c.BUILD_VERSION,url);
    assert.ok(fs.existsSync(path.join(root,url.split('?')[0])),url);
  });
  assert.equal(c.SPRITES.gr_w1,'./assets/images/gear/w1.png?v='+c.BUILD_VERSION);
  assert.equal(c.PANG_NPC_ART.child,'./assets/images/characters/plogging_child_sheet.png?v='+c.BUILD_VERSION);
  assert.equal(vm.runInContext('TOWER_ELITES.find(e=>e.id==="nightglare").hp',c),380);
  assert.equal(c.CARE_STAGES[0].name,'병아리');
});

test('maintenance updater uses one canonical version and a second pass changes no files',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'eco-build-version-test-'));
  try{
    fs.mkdirSync(path.join(temp,'js'));fs.mkdirSync(path.join(temp,'css'));
    fs.writeFileSync(path.join(temp,'js/build-version.js'),"var BUILD_VERSION = 'old';\n");
    fs.writeFileSync(path.join(temp,'index.html'),'<script src="./js/build-version.js"></script><script defer src="https://cdn.example/a.js"></script>');
    fs.writeFileSync(path.join(temp,'css/style.css'),"a{background:url('../assets/images/objects/campfire-forest.png')}");
    assert.deepEqual(update('test.2',temp),{version:'test.2',changed:3});
    assert.deepEqual(update(undefined,temp),{version:'test.2',changed:0});
    const before=fs.readFileSync(path.join(temp,'index.html'),'utf8');
    assert.throws(()=>update("invalid'quote",temp));
    assert.equal(fs.readFileSync(path.join(temp,'index.html'),'utf8'),before);
  }finally{
    assert.equal(path.dirname(path.resolve(temp)),path.resolve(os.tmpdir()));
    assert.ok(path.basename(temp).startsWith('eco-build-version-test-'));
    fs.rmSync(temp,{recursive:true,force:true});
  }
});

test('dynamic ecotech icon and exploration art include version without changing room state',()=>{
  const c=context();
  for(const file of ['ecotech-exploration','ecotech'])vm.runInContext(fs.readFileSync(path.join(root,'js/'+file+'.js'),'utf8'),c);
  assert.ok(c.ecoTechIcon({id:'test'}).includes('test.png?v='+c.BUILD_VERSION));
  const locked=c.ecoExplorationArt({tech:'test',open:false});
  assert.ok(locked.includes('test-locked.png?v='+c.BUILD_VERSION));
  assert.ok(locked.includes('test-open.png?v='+c.BUILD_VERSION));
  const open=c.ecoExplorationArt({tech:'test',open:true});
  assert.ok(open.includes('test-open.png?v='+c.BUILD_VERSION));
  assert.ok(!open.includes('locked.png'));
});
