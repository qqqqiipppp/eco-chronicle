/* Deployment version only. Save schema versions are maintained separately. */
var BUILD_VERSION = '2026.10.07.4';

function ecoAssetUrl(source){
  if(typeof source!=='string'||/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(source))return source;
  var hashAt=source.indexOf('#'),hash=hashAt<0?'':source.slice(hashAt);
  var url=hashAt<0?source:source.slice(0,hashAt),queryAt=url.indexOf('?');
  var path=queryAt<0?url:url.slice(0,queryAt);
  if(!/(^|\/)assets\//.test(path))return source;
  var query=new URLSearchParams(queryAt<0?'':url.slice(queryAt+1));
  query.set('v',BUILD_VERSION);
  return path+'?'+query.toString()+hash;
}

/* Only explicitly supplied artwork maps are visited; game/save objects are not. */
function ecoVersionAssets(maps){
  var seen=new Set();
  function visit(map){
    if(!map||typeof map!=='object'||seen.has(map))return;
    seen.add(map);
    Object.keys(map).forEach(function(key){
      if(typeof map[key]==='string')map[key]=ecoAssetUrl(map[key]);
      else visit(map[key]);
    });
  }
  maps.forEach(visit);
}
