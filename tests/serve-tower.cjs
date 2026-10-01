// Isolated localhost browser fixture. Never loaded by product index.html.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),rel=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname),full=path.resolve(root,'.'+rel);
  if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(rel==='/favicon.ico'){res.writeHead(204);res.end();return;}
  let data=await fs.readFile(full);
  if(rel==='/index.html')data=Buffer.from(data.toString().replace(/<script defer src="https:\/\/cdn[^>]+><\/script>/,'').replace('</body>','<script src="./tests/tower-browser.js"></script></body>'));
  res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(full)]||'application/octet-stream'});res.end(data);
}catch(e){res.writeHead(404);res.end();}}).listen(Number(process.argv[2])||61408,'127.0.0.1',function(){console.log('Tower fixture: http://127.0.0.1:'+this.address().port+'/?no-cdn=1');});
