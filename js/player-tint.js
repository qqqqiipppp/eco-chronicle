/* R38: continuous palette transfer. Source sprites stay immutable.
   Interpolated/resampled colors must move with their palette, not remain as speckles. */
var TINT_PALETTES=Object.create(null),TINT_REGIONS=Object.create(null);
function tintFaceRegion(a,key,width){
  if(TINT_REGIONS[key])return TINT_REGIONS[key];
  var count=a.length/4,h=count/width,mask=new Uint8Array(count),out=new Uint8Array(count);
  if(key.endsWith('_north'))return TINT_REGIONS[key]=out;
  var skins=Object.keys(SKIN_MAP.light).map(Number),hairs=Object.keys(HAIR_MAP.brown).map(Number);
  function distance(r,g,b,pal){var best=1e9;for(var c of pal){var d=(r-(c>>16&255))**2+(g-(c>>8&255))**2+(b-(c&255))**2;if(d<best)best=d;}return best;}
  for(var p=0;p<count;p++){var i=p*4,r=a[i],g=a[i+1],b=a[i+2];if(a[i+3]>64&&r>138&&g>90&&r-g>9&&g>b){var ds=distance(r,g,b,skins);if(ds<625&&ds<distance(r,g,b,hairs))mask[p]=1;}}
  var parts=[];
  for(var p=0;p<count;p++)if(mask[p]){var q=[p];mask[p]=0;var minY=h,maxY=0;for(var at=0;at<q.length;at++){var u=q[at],x=u%width,y=Math.floor(u/width);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){var xx=x+dx,yy=y+dy,v=yy*width+xx;if(xx>=0&&xx<width&&yy>=0&&yy<h&&mask[v]){mask[v]=0;q.push(v);}}}parts.push({q:q,minY:minY,maxY:maxY});}
  parts.sort(function(a,b){return b.q.length-a.q.length;});var main=parts[0];
  if(!main||main.q.length<60)return TINT_REGIONS[key]=out;
  var selected=parts.filter(function(c){return c===main||(c.q.length>=Math.max(12,main.q.length*.035)&&c.minY>=main.minY-2&&c.maxY<=main.maxY+3);});
  selected.forEach(function(c){
    var lo=new Int32Array(h).fill(width),hi=new Int32Array(h).fill(-1);
    c.q.forEach(function(p){var y=Math.floor(p/width),x=p%width;lo[y]=Math.min(lo[y],x);hi[y]=Math.max(hi[y],x);});
    for(var y=0;y<h;y++)if(hi[y]>=0)for(var x=Math.max(0,lo[y]-1);x<=Math.min(width-1,hi[y]+1);x++)out[y*width+x]=1;
  });
  return TINT_REGIONS[key]=out;
}
function tintPaletteFor(skin,hair,hasHair){
  var id=skin+'|'+hair+'|'+hasHair;
  if(TINT_PALETTES[id])return TINT_PALETTES[id];
  var map=Object.assign({},SKIN_MAP[skin]||SKIN_MAP.light,hasHair?(HAIR_MAP[hair]||HAIR_MAP.brown):{});
  return TINT_PALETTES[id]=Object.keys(map).map(function(k){var s=Number(k),t=map[k];return {r:s>>16&255,g:s>>8&255,b:s&255,dr:(t>>16&255)-(s>>16&255),dg:(t>>8&255)-(s>>8&255),db:(t&255)-(s&255)};});
}
function tintPixels(a,key,skin,hair,width){
  var hasHair=key.indexOf('head_')===0;
  if(skin==='light'&&(!hasHair||hair==='brown'))return a;
  var faces=hasHair?tintFaceRegion(a,key,width||Math.sqrt(a.length/4)):null;
  var skinPalette=tintPaletteFor(skin,'brown',false),hairPalette=Object.keys(HAIR_MAP[hair]||HAIR_MAP.brown).map(function(k){var s=Number(k),t=(HAIR_MAP[hair]||HAIR_MAP.brown)[k];return {r:s>>16&255,g:s>>8&255,b:s&255,dr:(t>>16&255)-(s>>16&255),dg:(t>>8&255)-(s>>8&255),db:(t&255)-(s&255)};}),cache=Object.create(null);
  for(var i=0;i<a.length;i+=4){
    if(!a[i+3])continue;
    var face=faces&&faces[i/4],palette=hasHair&&!face?hairPalette:skinPalette;
    var r=a[i],g=a[i+1],b=a[i+2],rgb=(r<<16)|(g<<8)|b,cacheKey=rgb+(face?16777216:0),out=cache[cacheKey];
    if(out===undefined){
      // White sclera, black line art and cool clothes are not tint materials.
      if(Math.max(r,g,b)-Math.min(r,g,b)<12||r<g||g<b||r<48){cache[cacheKey]=rgb;continue;}
      var nearest=[];
      for(var p=0;p<palette.length;p++){var c=palette[p],dist=(r-c.r)*(r-c.r)+(g-c.g)*(g-c.g)+(b-c.b)*(b-c.b);nearest.push({c:c,d:dist});}
      nearest.sort(function(a,b){return a.d-b.d;});
      var distance=Math.sqrt(nearest[0].d);
      if(distance>=(face?90:40)){cache[cacheKey]=rgb;continue;}
      var weight=0,dr=0,dg=0,db=0;
      for(var n=0;n<4&&n<nearest.length;n++){var q=nearest[n],w=1/Math.pow(q.d+36,2);weight+=w;dr+=q.c.dr*w;dg+=q.c.dg*w;db+=q.c.db*w;}
      // A soft boundary avoids replacing one pixel but missing its neighbor.
      var near=face?60:20,far=face?90:40;
      var blend=distance<=near?1:1-((distance-near)/(far-near))**2;
      var rr=Math.max(0,Math.min(255,Math.round(r+dr/weight*blend))),gg=Math.max(0,Math.min(255,Math.round(g+dg/weight*blend))),bb=Math.max(0,Math.min(255,Math.round(b+db/weight*blend)));
      out=cache[cacheKey]=(rr<<16)|(gg<<8)|bb;
    }
    a[i]=out>>16&255;a[i+1]=out>>8&255;a[i+2]=out&255;
  }
  return a;
}
