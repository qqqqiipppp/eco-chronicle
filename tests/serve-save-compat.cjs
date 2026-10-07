// Disposable localhost QA. Only synthetic historical fixtures are seeded here.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),requests=[];
const cacheImage='assets/images/objects/0f3f73c7eacc9bc0462dd26c.png';
const oldImage=execFileSync('git',['show','e7bbdd8^:'+cacheImage],{cwd:root});
function fixture(original,kind){
  const errors=[];addEventListener('error',e=>errors.push(e.message));
  addEventListener('unhandledrejection',e=>errors.push(String(e.reason?.message||e.reason)));
  document.addEventListener('DOMContentLoaded',()=>{
    if(kind==='latest'){original=migrate(original);original.code='EC9009';original.name='최신학생';}
    const key='echo:'+original.code;
    const created=!localStorage.getItem(key);
    if(created)localStorage.setItem(key,JSON.stringify(original));
    let index;try{index=JSON.parse(localStorage.getItem('echo:__index')||'[]');}catch(e){index=[];}
    if(!Array.isArray(index))index=[];
    if(!index.includes(original.code))index.push(original.code);
    localStorage.setItem('echo:__index',JSON.stringify(index));
    if(created)localStorage.setItem('echo:__last',original.code);render();
    const box=document.createElement('aside');box.id='save-qa';
    box.style='position:fixed;bottom:4px;left:4px;z-index:10000;max-width:720px;background:#fffffff2;color:#111;padding:4px;font:11px monospace';
    const out=document.createElement('pre');out.id='save-qa-result';out.style='white-space:pre-wrap;max-height:95px;overflow:auto;margin:3px 0';
    const subset=(before,after)=>before===null?after===null:Array.isArray(before)?Array.isArray(after)&&before.every((v,i)=>subset(v,after[i])):
      typeof before==='object'?after&&Object.keys(before).every(k=>subset(before[k],after[k])):before===after;
    const keys=['code','name','lv','exp','gear','owned','seeds','produce','farm','tower','cleared','gold','mats','gauge','ecoTechUnlocked','ecoTechQuests','ecoTechSites','ecoTechFindings','learning','arcadeRecords','futureStudent'];
    let checks={};
    function snapshot(){
      let disk;try{disk=JSON.parse(localStorage.getItem(key));}catch(e){}
      checks={};keys.forEach(k=>{if(original[k]!==undefined)checks[k]=!!S&&subset(original[k],S[k]);});
      const resources=performance.getEntriesByType('resource').filter(e=>e.name.includes(location.host)).map(e=>({url:e.name,transfer:e.transferSize,size:e.decodedBodySize}));
      out.textContent=JSON.stringify({kind,build:typeof BUILD_VERSION==='undefined'?'old-url':BUILD_VERSION,
        code:S.code,scene:S.scene,theme:S.themeId,lv:S.lv,exp:S.exp,saveVersion:S.saveVersion,legacyV:S.v,
        diskVersion:disk?.saveVersion,index:Save.index(),last:Save.last(),preserved:checks,
        tower:S.tower,ecoTech:S.ecoTechUnlocked,errors,cacheScript:window.__cacheScript,
        css:getComputedStyle(document.documentElement).getPropertyValue('--cache-code'),
        currentRules:{elites:TOWER_ELITES.map(e=>[e.id,e.hp,e.atk]),carePrompts:CARE_STAGES.map(s=>careSequence(s).length),
          careMotion:CARE_MOTION_SECONDS,careQuiet:CARE_INPUT_QUIET_MS,matchN:MT_N,matchNeed:Mt?.need},
        latestAssets:[ECO_TOWER_ELITE_ART.nightglare,SPRITES.pr_bush],resources});
    }
    function button(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{fn();snapshot();};box.appendChild(b);}
    function world(){closeModal();closeBattleDom();B=null;Tw.on=false;S.scene='world';render();}
    button('QA snapshot',snapshot);button('QA title',()=>{world();S.scene='title';render();});
    button('QA world',world);button('QA care',()=>{world();admMini('runner');});
    button('QA match',()=>{world();admMini('match');});
    button('QA battle',()=>{world();admFight();});
    button('QA tower preview',()=>{world();const e=towerEliteForFloor(20);B={hp:100,hpMax:100,sp:50,spMax:50,log:[]};out.dataset.towerMonster=JSON.stringify(towerEliteMonster(e,'city'));openModal('tower');});
    button('QA verify storage',()=>{const disk=JSON.parse(localStorage.getItem(key));out.dataset.persisted=JSON.stringify(keys.filter(k=>original[k]!==undefined).every(k=>subset(original[k],disk[k])));});
    button('QA malformed',()=>{const code='EC0000';localStorage.setItem('echo:'+code,'{broken');quickLoad(code);out.dataset.failurePreserved=String(localStorage.getItem('echo:'+code)==='{broken');});
    button('QA hide tools',()=>{box.hidden=true;});
    const old=document.createElement('a');old.textContent='최신 파일로 이동';old.href='/?fixture='+kind;box.appendChild(old);
    const img=document.createElement('img');img.id='cache-probe-image';img.alt='캐시 이미지 확인';img.width=30;img.height=30;
    const src='./assets/images/objects/0f3f73c7eacc9bc0462dd26c.png';
    img.src=typeof ecoAssetUrl==='function'?ecoAssetUrl(src):src;box.appendChild(img);
    box.appendChild(out);document.body.appendChild(box);snapshot();
  });
}
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    if(url.pathname==='/qa/network'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(requests));return;}
    const old=url.pathname==='/cache-old.html';
    const rel=url.pathname==='/'||old?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
    if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let data=await fs.readFile(full);
    if(rel==='/index.html'){
      const kind=url.searchParams.get('fixture')||'last-week';
      const file=kind==='september-25'?'september-25':'last-week';
      const original=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/legacy-save/'+file+'.json'),'utf8'));
      if(kind==='september-25'){delete original.v;delete original.saveVersion;}
      let html=data.toString().replace(/<script defer[^>]*><\/script>/g,'');
      if(old)html=html.replace(/\?v=[^'"<>]+/g,'').replace(/<script src="\.\/js\/build-version\.js"><\/script>/,'');
      const setup='('+fixture.toString()+')('+JSON.stringify(original).replace(/</g,'\\u003c')+','+JSON.stringify(kind)+');';
      html=html.replace(/<script src="\.\/js\/game\.js(?:\?[^"<>]*)?">/,match=>'<script>'+setup+'</script>'+match);
      data=Buffer.from(html);
    }
    if(rel==='/js/animal-care.js')data=Buffer.from(data.toString()+'\nwindow.__cacheScript='+JSON.stringify(url.searchParams.has('v')?'current-url':'old-url')+';');
    if(rel==='/css/style.css')data=Buffer.from(data.toString()+'\n:root{--cache-code:'+ (url.searchParams.has('v')?'current-url':'old-url')+'}');
    let source='current';if(rel==='/'+cacheImage&&!url.searchParams.has('v')){data=oldImage;source='history-before-e7bbdd8';}
    requests.push({url:req.url,bytes:data.length,source});
    const asset=rel!=='/index.html';
    res.writeHead(200,{'Cache-Control':asset?'public,max-age=31536000,immutable':'no-store','Content-Type':{
      '.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css',
      '.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'
    }[path.extname(full)]||'application/octet-stream'});res.end(data);
  }catch(e){console.error(e);res.writeHead(500);res.end();}
}).listen(Number(process.argv[2])||0,'127.0.0.1',function(){console.log('Save/cache QA: http://127.0.0.1:'+this.address().port);});
