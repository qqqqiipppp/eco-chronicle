// Local UI-only fixture: old/new CSS, short visible viewport and real game controls.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..'),baseline=fs.readFile(process.argv[2]||path.join(root,'css/style.css'),'utf8');
function fixture(){
  const errors=[],checks=[];let lastPointer=null;
  addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
  document.addEventListener('DOMContentLoaded',()=>{
    S=Object.assign(newState(),{name:'태블릿테스트학생',code:'EC9852',petKey:'earth',scene:'world',lv:10,gold:999999});
    applyTheme('forest');Wd.ready=false;Wd.px=SPAWN.x;Wd.py=SPAWN.y;render();
    const box=document.createElement('details');box.id='hud-test-tools';box.open=true;
    box.style='position:fixed;right:2px;bottom:2px;width:238px;max-height:180px;overflow:auto;z-index:7000;background:white;color:black;font:11px monospace;padding:5px';
    box.innerHTML='<summary>Local viewport checks</summary>';
    const out=document.createElement('pre');out.id='hud-test-results';out.style='white-space:pre-wrap';
    function rect(el){if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};}
    function inside(r){return r&&r.x>=-.5&&r.y>=-.5&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5;}
    function measure(){
      const selectors=['html','body','.device','#screen','.world','#worldRoot','#hudHost','.hud','.pill','.hudbtns','.iconbtn'];
      const styles=Object.fromEntries(selectors.map(sel=>{const el=document.querySelector(sel);if(!el)return [sel,null];const s=getComputedStyle(el);
        return [sel,{rect:rect(el),height:s.height,minHeight:s.minHeight,maxHeight:s.maxHeight,position:s.position,top:s.top,bottom:s.bottom,overflow:s.overflow,padding:s.padding,transform:s.transform,aspectRatio:s.aspectRatio,flex:s.flex,order:s.order,fontSize:s.fontSize}];}));
      const buttons=Array.from(document.querySelectorAll('.hudbtns button')).map(el=>({label:el.textContent.trim(),rect:rect(el),inside:inside(rect(el))}));
      const hud=document.querySelector('.hud'),world=document.getElementById('worldRoot');
      return {viewport:{width:innerWidth,height:innerHeight,visualHeight:visualViewport?.height},styles,buttons,
        hudInside:inside(rect(hud)),worldInside:inside(rect(world)),camera:{width:Wd.vw,height:Wd.vh,clientWidth:world?.clientWidth,clientHeight:world?.clientHeight},
        gauges:Array.from(document.querySelectorAll('.gaugebar,.expbar')).map(el=>({rect:rect(el),inside:inside(rect(el))})),
        pills:Array.from(document.querySelectorAll('.hud .pill')).map(el=>({text:el.textContent.trim(),rect:rect(el),inside:inside(rect(el))})),
        modal:S.modal,scene:S.scene,pointer:lastPointer,hero:{x:Wd.px,y:Wd.py},errors};
    }
    function show(){out.textContent=JSON.stringify({current:measure(),checks},null,2);}
    function button(label,fn){const b=document.createElement('button');b.textContent=label;b.style='margin:2px';b.onclick=()=>{fn();show();};box.append(b);}
    function world(){closeBattleDom();closeModal();B=null;Tw.on=false;S.scene='world';render();}
    function point(x,y){world();Wd.px=x;Wd.py=y;Wd.petX=x-35;Wd.petY=y;tick(0);}
    function walk(key){
      const b=document.querySelector('.dbtn[data-k="'+key+'"]'),r=b.getBoundingClientRect(),before={x:Wd.px,y:Wd.py};
      b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:1,pointerType:'touch',clientX:r.x+r.width/2,clientY:r.y+r.height/2}));
      setTimeout(()=>{b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1,pointerType:'touch'}));checks.push({kind:'touchMove',key,before,after:{x:Wd.px,y:Wd.py},target:rect(b)});show();},500);
    }
    document.addEventListener('pointerdown',e=>{if(e.target.closest('.hudbtns,.dpad,.actbtn'))lastPointer={x:e.clientX,y:e.clientY,target:e.target.textContent.trim(),type:e.pointerType};});
    button('측정',()=>{checks.push({kind:'layout',value:measure()});});
    button('월드 복귀',world);
    button('터치 이동',()=>walk('r'));
    button('NPC 접근 준비',()=>{const n=npcSpots()[0];point(n.x-100,n.y);walk('r');});
    button('가게 앞 준비',()=>{const o=OBJS.find(o=>o.id==='shop');o._in=true;point(o.x,o.y+60);});
    button('전투 확인',()=>{world();admFight();});
    button('퍼즐 확인',()=>{world();admMini('match');});
    button('도구 숨기기',()=>{box.open=false;});
    box.append(out);document.body.append(box);show();setInterval(show,200);
  });
}
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
  if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
  let data=await fs.readFile(full);
  if(rel==='/css/style.css'){
    let css=url.searchParams.has('baseline')?await baseline:data.toString();
    const browserUI=Math.max(0,Math.min(160,Number(url.searchParams.get('browser-ui'))||0));
    // Simulate legacy vh counting the browser chrome outside the visible area.
    if(browserUI)css=css.replace(/\b96vh\b/g,'calc((100vh + '+browserUI+'px) * .96)');
    if(url.searchParams.has('legacy-dvh')){
      css=css.replace('@supports(height:100dvh){:root{--game-viewport-height:100dvh}}','');
      if(browserUI)css=css.replace('--game-viewport-height:100vh','--game-viewport-height:calc(100vh + '+browserUI+'px)');
    }
    data=Buffer.from(css);
  }
  if(rel==='/index.html'){
    let html=data.toString().replace(/<script defer[^>]*><\/script>/g,tag=>tag.includes('player-list.js')?tag:'');
    html=html.replace(/\.\/css\/style\.css(?:\?[^\"]*)?/,source=>{
      const cssUrl=new URL(source,'http://localhost/');
      url.searchParams.forEach((value,key)=>cssUrl.searchParams.set(key,value));
      return './css/style.css?'+cssUrl.searchParams.toString();
    });
    if(url.searchParams.has('legacy-dvh'))html=html.replace('</head>','<script>const nativeSupports=CSS.supports.bind(CSS);CSS.supports=(a,b)=>a==="height"&&b==="100dvh"?false:nativeSupports(a,b);</script></head>');
    data=Buffer.from(html.replace('</body>','<script>('+fixture.toString()+')();</script></body>'));
  }
  res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp'}[path.extname(full)]||'application/octet-stream'});res.end(data);
}catch(e){console.error(e.message);res.writeHead(404);res.end();}}).listen(0,'127.0.0.1',function(){console.log('HUD fixture: http://127.0.0.1:'+this.address().port);});
