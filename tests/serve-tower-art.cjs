// Local-only visual fixture. Product HTML never loads these controls.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..'),baseline=process.argv[2];
function fixture(){
  const errors=[];let imageInfo=null,selected='leftovers',samples=[];
  addEventListener('error',e=>errors.push(e.message));
  addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
  addEventListener('DOMContentLoaded',()=>{
    if(new URLSearchParams(location.search).has('baseline'))
      Object.keys(ECO_TOWER_ELITE_ART).forEach(id=>ECO_TOWER_ELITE_ART[id]+='?baseline=1');
    const panel=document.createElement('details');panel.id='art-test';panel.open=true;
    panel.style='position:fixed;left:6px;bottom:6px;z-index:9000;width:210px;max-height:180px;overflow:auto;background:#fff;color:#111;font:12px sans-serif;padding:5px';
    panel.innerHTML='<summary>전투 화질 검증</summary>';
    const out=document.createElement('pre');out.id='art-results';out.style='white-space:pre-wrap';
    function rect(el){return el?.getBoundingClientRect().toJSON()||null;}
    function measure(){
      const art=document.querySelector('#bfoeArt .tower-elite-art,#bfoeArt .boss-r41');
      const targets=['#bscene','#bfield','#bfoe','#bfoeArt','#bfoeArt .monster-scale','#bfoeArt .tower-elite-art','#bfoeArt .boss-r41'];
      const styles=Object.fromEntries(targets.map(sel=>{const el=document.querySelector(sel);if(!el)return [sel,null];const s=getComputedStyle(el);
        return [sel,{rect:rect(el),width:s.width,height:s.height,transform:s.transform,filter:s.filter,opacity:s.opacity,
          imageRendering:s.imageRendering,backgroundSize:s.backgroundSize,backgroundPosition:s.backgroundPosition,objectFit:s.objectFit}];}));
      return {id:selected,pose:art?.dataset.pose||'0',viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
        image:imageInfo,styles,errors,samples,canvases:document.querySelectorAll('#bscene canvas').length};
    }
    function show(){out.textContent=JSON.stringify(measure(),null,2);}
    function button(text,fn){const b=document.createElement('button');b.textContent=text;b.style='margin:2px';
      b.onclick=()=>Promise.resolve(fn()).then(show).catch(e=>{errors.push(e.stack||String(e));show();});panel.append(b);}
    async function preview(id){
      closeBattleDom();closeModal();stopLoop();B=null;Tw.on=false;
      S=Object.assign(newState(),{code:'EC_TOWER_ART',name:'화질 검증',petKey:'earth',lv:15,scene:'world'});
      applyTheme('forest');render();stopLoop();selected=id;
      if(id==='reference'){
        Tw.on=true;Tw.floor=7;Tw.mon=Object.assign({},THEMES.forest.monsters[4],{themeId:'forest',idx:4,fixed:true});
        initBattle();mountBattle();
        // Compare the same output footprint as a tower elite, without changing production.
        const scene=document.getElementById('bscene');scene.dataset.rank='mid';sizeBattleView();stopBattleView();
        const foe=document.getElementById('bfoe'),n=parseFloat(foe.style.width)*1.15;
        const x=parseFloat(foe.style.left)-(n-parseFloat(foe.style.width))/2;
        const y=parseFloat(foe.style.bottom)-(n-parseFloat(foe.style.height))*.1;
        Object.assign(foe.style,{width:n+'px',height:n+'px',left:x+'px',bottom:y+'px'});
      }else{
        const e=TOWER_ELITES.find(e=>e.id===id);Tw.on=true;Tw.floor=e.floor;
        Tw.mon=towerEliteMonster(e,'forest');initBattle();mountBattle();
      }
      const art=document.querySelector('#bfoeArt .tower-elite-art,#bfoeArt .boss-r41');
      if(id==='reference')art.style.animation='none';
      const src=getComputedStyle(art).backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];
      const img=new Image();img.src=src;await img.decode();
      await new Promise(resolve=>setTimeout(resolve,700));
      imageInfo={src,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,frameWidth:img.naturalWidth/(id==='reference'?3:5)};
      panel.open=false;show();
    }
    for(const e of TOWER_ELITES)button(e.name,()=>preview(e.id));
    button('기존 숲 보스 비교',()=>preview('reference'));
    ['Idle','Basic Attack','Special 1','Special 2','Hit'].forEach((p,i)=>button(i+' '+p,()=>{towerElitePose(i,600000);panel.open=false;}));
    button('측정',show);
    button('프레임 전환 측정',async()=>{
      samples=[];let last=performance.now();
      for(let i=0;i<100;i++)await new Promise(resolve=>requestAnimationFrame(now=>{
        samples.push(now-last);last=now;towerElitePose(i%5,600000);resolve();
      }));towerElitePose(0,600000);panel.open=false;
    });
    button('도구 숨기기',()=>{panel.open=false;});panel.append(out);document.body.append(panel);
    setInterval(show,250);preview('leftovers');
  });
}
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
  if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
  let data=await fs.readFile(full);
  if(url.searchParams.has('baseline')&&baseline){
    if(rel==='/css/style.css')data=await fs.readFile(path.join(baseline,'baseline-style.css'));
    if(rel==='/js/battle-view.js')data=await fs.readFile(path.join(baseline,'baseline-battle-view.js'));
    if(/^\/assets\/images\/monsters\/tower-[a-z]+\.webp$/.test(rel))data=await fs.readFile(path.join(baseline,path.basename(rel)));
  }
  if(rel==='/index.html'){
    let html=data.toString().replace(/<script defer[^>]*><\/script>/g,'');
    html=html.replace(/\.\/css\/style\.css[^"']*/,'./css/style.css?'+url.searchParams.toString())
      .replace('./js/battle-view.js','./js/battle-view.js?'+url.searchParams.toString());
    data=Buffer.from(html.replace('</body>','<script>('+fixture.toString()+')();</script></body>'));
  }
  res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp'}[path.extname(full)]||'application/octet-stream'});res.end(data);
}catch(e){res.writeHead(404);res.end();}}).listen(0,'127.0.0.1',function(){console.log('Tower art fixture: http://127.0.0.1:'+this.address().port);});
