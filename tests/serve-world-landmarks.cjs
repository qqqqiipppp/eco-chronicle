// Local-only controls around the unmodified full game for six-region artwork verification.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function fixture(){
 const errors=[],checks=[];
 addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 document.addEventListener('DOMContentLoaded',()=>{
  const box=document.createElement('details');box.open=true;box.id='landmark-test-tools';
  box.style='position:fixed;right:2px;bottom:2px;z-index:7000;background:#fff;color:#111;width:174px;max-height:220px;overflow:auto;padding:5px;font:11px monospace';
  box.innerHTML='<summary>Local artwork checks</summary>';document.body.append(box);
  const output=document.createElement('pre');output.id='landmark-test-results';output.style='white-space:pre-wrap';box.append(output);
  const show=()=>output.textContent=JSON.stringify({errors,checks,theme:S.themeId,modal:S.modal},null,2);
  function button(text,fn){const b=document.createElement('button');b.textContent=text;b.style='display:block;width:100%';b.onclick=()=>{fn();show();};box.insertBefore(b,output);}
  function clean(){stopLoop();releaseKeys();closeBattleDom();closeModal();B=null;Tw.on=false;S.modal=null;}
  function region(id){clean();Adm.on=false;S=Object.assign(newState(),{name:'이미지 확인',code:'EC9874',petKey:'earth',scene:'world',cleared:THEME_ORDER.slice(),themeId:id});
   applyTheme(id);Wd.ready=false;Wd.px=SPAWN.x;Wd.py=SPAWN.y;document.getElementById('screen').innerHTML='';render();}
  function focus(id){clean();if(S.scene!=='world'){S.scene='world';Wd.ready=false;document.getElementById('screen').innerHTML='';render();}
   const o=OBJS.find(o=>o.id===id);Wd.px=o.x;Wd.py=o.y+110;Wd.petX=Wd.px-35;Wd.petY=Wd.py;Wd.near=o;Nd.near=null;
   // Stop motion while the true world layers are inspected at this camera position.
   stopLoop();const wrap=document.getElementById('worldRoot');
   Wd.cx=Math.max(0,Math.min(W-wrap.clientWidth,o.x-wrap.clientWidth/2));Wd.cy=Math.max(0,Math.min(H-wrap.clientHeight,o.y-wrap.clientHeight/2));
   document.getElementById('plane').style.transform='translate('+(-Math.round(Wd.cx))+'px,'+(-Math.round(Wd.cy))+'px)';
   document.getElementById('hero').style.left=Wd.px+'px';document.getElementById('hero').style.top=Wd.py+'px';
  }
  for(const id of THEME_ORDER)button('지역 '+THEMES[id].name,()=>region(id));
  for(const [id,name] of [['npc','배우는 샘'],['tower','몬스터 탑'],['altar','정화의 제단'],['farm','나만의 농장'],['mon','오염 지대'],['shop','가게'],['bush','열매밭']])button('보기 '+name,()=>focus(id));
  button('실제 상호작용',()=>{const id=Wd.near?.id;doAction();checks.push({theme:S.themeId,id,modal:S.modal});});
  button('정화된 제단',()=>{S.gauge=100;refreshObjs();focus('altar');});
  button('시작 화면',()=>{clean();S.scene='title';render();});
  button('레이아웃 검사',()=>{
   const items=OBJS.filter(o=>['npc','tower','altar','farm','mon','shop','bush'].includes(o.id)).map(o=>{
    const art=document.getElementById('wart-'+o.id),label=document.getElementById('mk-'+o.id),a=art.getBoundingClientRect(),b=label.getBoundingClientRect();
    return {id:o.id,width:a.width,height:a.height,labelGap:Math.round((a.top-b.bottom)*10)/10,
     grounded:Math.abs(a.bottom-document.getElementById('wobj-'+o.id).getBoundingClientRect().bottom)<0.1,
     loaded:Array.from(art.querySelectorAll('img')).every(img=>img.complete&&img.naturalWidth>0),
     overlap:a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top};
   });checks.push({theme:S.themeId,layout:items});
  });
  show();
 });
}
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
 if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
 let data=await fs.readFile(full);
 if(rel==='/index.html')data=Buffer.from(data.toString().replace('</body>','<script>('+fixture.toString()+')();</script></body>'));
 res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(full)]||'application/octet-stream'});res.end(data);
}catch(e){res.writeHead(404);res.end();}}).listen(Number(process.argv[2])||8769,'127.0.0.1',function(){console.log('World artwork fixture: http://127.0.0.1:'+this.address().port);});
