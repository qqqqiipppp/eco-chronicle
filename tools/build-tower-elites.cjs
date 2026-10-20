// Normalize original high-resolution poses once, then pack without resampling.
// Usage: node tools/build-tower-elites.cjs manifest.json
//        node tools/build-tower-elites.cjs --pack-existing
// Manifest: {"leftovers":{"idle":"absolute/source.png", ...}, ...}
const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const ids=['leftovers','disposables','algae','nightglare','glasswall','powerstrip','poacher','carbon'];
const poses=['idle','attack','special1','special2','hit'];
const root=path.resolve(__dirname,'..');
const frameDir=path.join(root,'assets','images','monsters','tower-frames');
const stripDir=path.join(root,'assets','images','monsters');
// Largest measured desktop footprint is 775px; preserve headroom without 2K cells.
const SIZE=832, BASELINE=Math.round(SIZE*235/256), RATIO=SIZE/256;

async function bounds(p){
  const {data,info}=await sharp(p).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=info.width,y0=info.height,x1=-1,y1=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    if(data[(y*info.width+x)*4+3]<20)continue;
    x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
  }
  if(x1<0)throw new Error(`Empty alpha: ${p}`);
  return {width:info.width,height:info.height,x0,y0,x1,y1};
}
async function normalize(id,pose,source,b,scale,anchorX=b.width/2){
  if(!fs.existsSync(source))throw new Error(`Missing source: ${source}`);
  const cropW=b.x1-b.x0+1,cropH=b.y1-b.y0+1;
  if(scale>1)throw new Error(`Source too small for ${SIZE}px frame: ${id}/${pose}. Supply the original PNG; do not upscale a normalized frame.`);
  const w=Math.round(cropW*scale),h=Math.round(cropH*scale);
  const left=Math.round(SIZE/2+(b.x0-anchorX)*scale),top=BASELINE-h;
  if(left<0||top<0||left+w>SIZE||top+h>SIZE)throw new Error(`Frame outside cell: ${id}/${pose}`);
  const resized=await sharp(source).extract({left:b.x0,top:b.y0,width:cropW,height:cropH})
    .resize(w,h,{fit:'fill',kernel:'lanczos3'}).png().toBuffer();
  const output=path.join(frameDir,`${id}-${pose}.png`);
  await sharp({create:{width:SIZE,height:SIZE,channels:4,background:'#00000000'}})
    .composite([{input:resized,left,top}]).png({compressionLevel:9}).toFile(output);
  const a=await bounds(output);
  if(a.x0<4||a.y0<4||a.x1>SIZE-5||a.y1>SIZE-5)throw new Error(`Alpha touches cell border: ${output}`);
  if(Math.abs(a.y1-BASELINE)>2)throw new Error(`Baseline shifted: ${output} y=${a.y1}`);
  return {pose,alpha:[a.x0,a.y0,a.x1,a.y1],bytes:fs.statSync(output).size};
}
async function pack(id){
  const inputs=poses.map(pose=>path.join(frameDir,`${id}-${pose}.png`));
  const metadata=await Promise.all(inputs.map(p=>sharp(p).metadata()));
  const size=metadata[0].width;
  if(metadata.some(m=>m.width!==size||m.height!==size))throw new Error(`Mismatched frame resolutions: ${id}`);
  const layers=inputs.map((input,i)=>({input,left:i*size,top:0}));
  const target=path.join(stripDir,`tower-${id}.webp`);
  await sharp({create:{width:size*poses.length,height:size,channels:4,background:'#00000000'}})
    .composite(layers).webp({lossless:true,alphaQuality:100,effort:6}).toFile(target);
  return {path:target,bytes:fs.statSync(target).size};
}
async function main(){
  if(process.argv[2]==='--pack-existing'){
    const report=[];
    for(const id of ids){
      const frames=[];
      for(const pose of poses){
        const output=path.join(frameDir,`${id}-${pose}.png`);
        if(!fs.existsSync(output))throw new Error(`Missing frame: ${output}`);
        const a=await bounds(output);
        const size=a.width,baseline=Math.round(size*235/256),margin=Math.round(size*4/256);
        if(a.height!==size||a.x0<margin||a.y0<margin||a.x1>size-margin-1||a.y1>size-margin-1||Math.abs(a.y1-baseline)>2)
          throw new Error(`Invalid frame bounds: ${output}`);
        frames.push({pose,alpha:[a.x0,a.y0,a.x1,a.y1],bytes:fs.statSync(output).size});
      }
      report.push({id,frames,strip:await pack(id)});
    }
    console.log(JSON.stringify(report,null,2));
    return;
  }
  if(!process.argv[2])throw new Error('Pass a source manifest or --pack-existing');
  const manifest=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  fs.mkdirSync(frameDir,{recursive:true});
  const report=[];
  for(const id of ids){
    if(!manifest[id])continue;
    const sources=poses.map(p=>typeof manifest[id][p]==='string'?{path:manifest[id][p]}:manifest[id][p]);
    const srcBounds=await Promise.all(sources.map(s=>bounds(s.path)));
    // Optional measured head-to-ground spans compensate for generation zoom;
    // one shared output body scale preserves identity across separately drawn poses.
    if(sources.every(s=>s.bodyHeight>0&&Number.isFinite(s.anchorX))){
      const targetSpan=Math.min(...srcBounds.flatMap((b,i)=>{
        const s=sources[i];return [112*RATIO*s.bodyHeight/(s.anchorX-b.x0),112*RATIO*s.bodyHeight/(b.x1-s.anchorX),215*RATIO*s.bodyHeight/(b.y1-b.y0+1)];
      }));
      const frames=[];
      for(let i=0;i<poses.length;i++)frames.push(await normalize(id,poses[i],sources[i].path,srcBounds[i],targetSpan/sources[i].bodyHeight,sources[i].anchorX));
      report.push({id,targetSpan,frames,strip:await pack(id)});continue;
    }
    const leftExtent=Math.max(...srcBounds.map(b=>b.width/2-b.x0));
    const rightExtent=Math.max(...srcBounds.map(b=>b.x1-b.width/2));
    const maxHeight=Math.max(...srcBounds.map(b=>b.y1-b.y0+1));
    const scale=Math.min(112*RATIO/leftExtent,112*RATIO/rightExtent,215*RATIO/maxHeight);
    const frames=[];
    for(let i=0;i<poses.length;i++)frames.push(await normalize(id,poses[i],sources[i].path,srcBounds[i],scale));
    report.push({id,frames,strip:await pack(id)});
  }
  console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
