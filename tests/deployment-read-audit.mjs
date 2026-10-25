// GET-only deployed asset audit. Never reads student records or authentication storage.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base='https://qqqqiipppp.github.io/eco-chronicle/';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const documents=['index.html','admin.html','admin-state.html'];
const assets=new Map(),rows=[];
async function read(url){const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});return {response,bytes:Buffer.from(await response.arrayBuffer())};}
for(const file of documents){
  const {response,bytes}=await read(base+file),html=bytes.toString();
  rows.push({file,status:response.status,localMatch:hash(bytes)===hash(await fs.readFile(file)),textMatch:html.replace(/\r\n/g,'\n')===(await fs.readFile(file,'utf8')).replace(/\r\n/g,'\n'),etag:response.headers.get('etag'),lastModified:response.headers.get('last-modified'),cacheControl:response.headers.get('cache-control')});
  for(const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)){
    const url=new URL(match[1],base).href;if(/\.(?:js|css)(?:\?|$)/.test(url))assets.set(url,true);
  }
}
for(const url of assets.keys()){
  const {response,bytes}=await read(url),local=url.startsWith(base)?decodeURIComponent(new URL(url).pathname.slice(new URL(base).pathname.length)):null;
  const text=bytes.toString(),secretPatterns=[/sb_secret_[A-Za-z0-9_-]+/,/postgres(?:ql)?:\/\/[^\s'"<>]+:[^\s'"<>]+@/,/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/];
  // JWT candidates are inspected locally; never print any token or matched secret.
  let serviceRole=false;for(const jwt of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[])try{if(JSON.parse(Buffer.from(jwt.split('.')[1],'base64url')).role==='service_role')serviceRole=true;}catch{}
  rows.push({file:local||url,status:response.status,version:new URL(url).searchParams.get('v'),localMatch:local?hash(bytes)===hash(await fs.readFile(local)):null,textMatch:local?text.replace(/\r\n/g,'\n')===(await fs.readFile(local,'utf8')).replace(/\r\n/g,'\n'):null,bytes:bytes.length,secretSuspect:secretPatterns.slice(0,2).some(pattern=>pattern.test(text))||serviceRole,
    ...(local==='js/build-version.js'?{build:text.match(/BUILD_VERSION\s*=\s*'([^']+)'/)?.[1]}:{}),
    ...(local==='js/game.js'?{saveVersion:text.match(/SAVE_VERSION\s*=\s*(\d+)/)?.[1]}:{})});
}
const report={at:new Date().toISOString(),site:base,documents:documents.length,uniqueDependencies:assets.size,non200:rows.filter(row=>row.status!==200).length,byteDifferences:rows.filter(row=>row.localMatch===false).length,textDifferences:rows.filter(row=>row.textMatch===false).length,secretSuspects:rows.filter(row=>row.secretSuspect).map(row=>row.file),rows};
await fs.writeFile('docs/images/deployment-read-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,rows:rows.filter(row=>row.status!==200||row.localMatch===false||row.build||row.saveVersion)}));
