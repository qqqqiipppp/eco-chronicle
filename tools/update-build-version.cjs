// Optional release maintenance: node tools/update-build-version.cjs [2026.10.07.2]
// The deployed game remains ordinary HTML/CSS/JS and needs no build command.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const versionPattern=/var BUILD_VERSION = '([^']+)';/;

function versionUrl(source,version){
  const hashAt=source.indexOf('#'),hash=hashAt<0?'':source.slice(hashAt);
  const url=hashAt<0?source:source.slice(0,hashAt),queryAt=url.indexOf('?');
  const pathname=queryAt<0?url:url.slice(0,queryAt);
  const query=new URLSearchParams(queryAt<0?'':url.slice(queryAt+1));
  query.set('v',version);
  return pathname+'?'+query.toString()+hash;
}
function stampHtml(html,version){
  return html.replace(/<(?:link|script)\b[^>]*>/gi,tag=>tag.replace(/\b(src|href)=(['"])(\.\/(?:css|js)\/[^'"]+)\2/i,
    (attribute,name,quote,url)=>name+'='+quote+versionUrl(url,version)+quote));
}
function stampCss(css,version){
  return css.replace(/url\((['"])(\.\.\/assets\/images\/objects\/campfire-[a-z]+\.png(?:\?[^'"#]*)?(?:#[^'"]*)?)\1\)/g,
    (value,quote,url)=>'url('+quote+versionUrl(url,version)+quote+')');
}
function update(version,projectRoot=root){
  const versionFile=path.join(projectRoot,'js/build-version.js');
  let source=fs.readFileSync(versionFile,'utf8');
  const match=source.match(versionPattern);
  if(!match)throw new Error('Canonical BUILD_VERSION was not found.');
  version=version||match[1];
  if(!/^[a-z\d][a-z\d._-]*$/i.test(version))throw new Error('Use letters, numbers, dots, underscores or hyphens for BUILD_VERSION.');
  source=source.replace(versionPattern,"var BUILD_VERSION = '"+version+"';");
  const index=path.join(projectRoot,'index.html'),css=path.join(projectRoot,'css/style.css');
  const updates=[[versionFile,source],[index,stampHtml(fs.readFileSync(index,'utf8'),version)],
    [css,stampCss(fs.readFileSync(css,'utf8'),version)]];
  let changed=0;
  for(const [file,next] of updates)if(fs.readFileSync(file,'utf8')!==next){fs.writeFileSync(file,next);changed++;}
  return {version,changed};
}
if(require.main===module){
  try{const result=update(process.argv[2]);console.log('BUILD_VERSION '+result.version+': '+result.changed+' files updated.');}
  catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={versionUrl,stampHtml,stampCss,update};
