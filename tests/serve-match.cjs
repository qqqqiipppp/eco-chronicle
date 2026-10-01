// Disposable localhost fixture. No controls or simulated boards ship in index.html.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function fixture(){
  const results={plays:[],shuffles:[],errors:[]};
  addEventListener('error',e=>results.errors.push(e.message));
  addEventListener('unhandledrejection',e=>results.errors.push(String(e.reason)));
  document.addEventListener('DOMContentLoaded',()=>{
    S=Object.assign(newState(),{name:'퍼즐 검증',code:'EC9863',petKey:'earth',scene:'world'});
    applyTheme('forest');Wd.ready=false;render();stopLoop();
    const box=document.createElement('div');box.style='position:fixed;left:4px;top:4px;width:260px;z-index:7000;background:#fff;color:#111;font:12px monospace;padding:8px';
    const output=document.createElement('pre');output.id='match-test-result';output.style='white-space:pre-wrap';
    function move(){for(let a=0;a<36;a++)for(const b of [a%6<5?a+1:-1,a<30?a+6:-1]){
      if(b<0)continue;const copy=Mt.g.slice();[copy[a],copy[b]]=[copy[b],copy[a]];
      if(mtFindMatch(copy).length)return [a,b];
    }return null;}
    const show=()=>output.textContent=JSON.stringify({results,done:Mt?.done,moves:Mt?.moves,busy:Mt?.busy,readyMatches:Mt?mtFindMatch().length:null,validMove:Mt?move():null},null,2);
    function button(label,fn){const b=document.createElement('button');b.textContent=label;b.style='display:block;margin:4px';b.onclick=()=>{fn();show();};box.append(b);}
    const originalShuffle=mtShuffle;
    mtShuffle=function(){
      const before={done:Mt.done,moves:Mt.moves};originalShuffle();
      results.shuffles.push({before,after:{done:Mt.done,moves:Mt.moves},readyMatches:mtFindMatch().length,valid:mtHasValidMove()});
    };
    button('새 퍼즐 테스트',()=>{mountMatch();results.plays.push({readyMatches:mtFindMatch().length,valid:mtHasValidMove()});});
    button('매치 후 교착 테스트',()=>{
      mountMatch();const dead=Array.from({length:36},(_,i)=>(Math.floor(i/6)+2*(i%6))%6);
      Mt.g=dead.slice();Mt.g[0]=Mt.g[1]=Mt.g[2]=0;Mt.moves=29;Mt.busy=true;
      const random=Math.random;let draws=0;Math.random=()=>{
        if(draws<4)return dead[draws++]/6;Math.random=random;return random();
      };
      mtPaint();mtResolve();
    });
    button('안전 생성 테스트',()=>{
      mountMatch();Mt.g=Array.from({length:36},(_,i)=>(Math.floor(i/6)+2*(i%6))%6);
      const random=Math.random;try{Math.random=()=>0;Mt.busy=true;mtResolve();}finally{Math.random=random;}
    });
    box.append(output);document.body.append(box);mountMatch();show();setInterval(show,100);
  });
}
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
  if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
  let data=await fs.readFile(full);
  if(rel==='/index.html')data=Buffer.from(data.toString().replace(/<script defer[^>]*><\/script>/g,'').replace('</body>','<script>('+fixture.toString()+')();</script></body>'));
  res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp'}[path.extname(full)]||'application/octet-stream'});res.end(data);
}catch(e){res.writeHead(404);res.end();}}).listen(0,'127.0.0.1',function(){console.log('Match fixture: http://127.0.0.1:'+this.address().port);});
