// Optional TEST dependency only. Never needed by GitHub Pages or the Edge Function.
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const version='0.5.10',integrity='tXc/25U3ulOkiRQuTFdwIv+JhBqtMdAF7Gvo6CfZZWtSB4+hgC4Wr2vwK5ngvvN5PJfAAEGIsfyCVy1JhCOBYw==';
(async()=>{
  const base=path.resolve(os.tmpdir(),'eco-cloud-save-pglite-'+version),modulePath=path.join(base,'package','dist','index.js');
  try{const pkg=JSON.parse(await fs.readFile(path.join(base,'package','package.json'),'utf8'));
    if(pkg.name==='@electric-sql/pglite'&&pkg.version===version){console.log(modulePath);return;}}catch{}
  const response=await fetch('https://registry.npmjs.org/@electric-sql/pglite/-/pglite-'+version+'.tgz',{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('Test dependency download failed');
  const bytes=Buffer.from(await response.arrayBuffer());
  if(crypto.createHash('sha512').update(bytes).digest('base64')!==integrity)throw Error('Test dependency integrity mismatch');
  await fs.mkdir(base,{recursive:true});const archive=path.join(base,'pglite.tgz');await fs.writeFile(archive,bytes);
  execFileSync('tar.exe',['-xzf',archive,'-C',base]);console.log(modulePath);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
