// Compose unscaled browser crops and compare source pixels to decoded strips.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const out=path.resolve(process.argv[2]),ids=['leftovers','disposables','algae','nightglare','glasswall','powerstrip','poacher','carbon'];
const poses=['idle','attack','special1','special2','hit'];
async function errors(png,strip,index){
  const a=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const b=await sharp(strip).extract({left:index*a.info.width,top:0,width:a.info.width,height:a.info.height}).ensureAlpha().raw().toBuffer();
  let sum=0,n=0,alpha=0,max=0;
  for(let i=0;i<a.data.length;i+=4){alpha=Math.max(alpha,Math.abs(a.data[i+3]-b[i+3]));if(a.data[i+3]<20)continue;
    for(let k=0;k<3;k++){const d=Math.abs(a.data[i+k]-b[i+k]);sum+=d*d;n++;max=Math.max(max,d);}}
  return {rgbRMSE:Math.sqrt(sum/n),maxRGBError:max,maxAlphaError:alpha};
}
async function run(){
  const rows=JSON.parse(await fs.readFile(path.join(out,'browser-after.json'),'utf8')),quality=[];
  for(const id of ids){
    const layers=[],q=[];
    for(let p=0;p<5;p++){
      const r=rows.find(row=>row.id===id&&Number(row.pose)===p).styles['#bfoeArt .tower-elite-art'].rect;
      const left=Math.max(0,Math.floor(r.x)-5),top=Math.max(0,Math.floor(r.y)),width=Math.min(1280-left,Math.ceil(r.width)+10),height=Math.min(620-top,Math.ceil(r.height)+10);
      const input=await sharp(path.join(out,`after-${id}-${p}.png`)).extract({left,top,width,height}).png().toBuffer();
      layers.push({input,left:p*390,top:22});
      q.push({pose:poses[p],before:await errors(path.join('assets/images/monsters/tower-frames',`${id}-${poses[p]}.png`),path.join(out,`tower-${id}.webp`),p),
        after:await errors(path.join('assets/images/monsters/tower-frames',`${id}-${poses[p]}.png`),path.join('assets/images/monsters',`tower-${id}.webp`),p)});
    }
    await sharp({create:{width:1950,height:412,channels:4,background:'#273942'}}).composite(layers).png().toFile(path.join(out,id+'-browser-frames.png'));
    quality.push({id,frames:q});
  }
  await fs.writeFile(path.join(out,'compression-quality.json'),JSON.stringify(quality,null,2));
  console.log(JSON.stringify(quality.map(q=>({id:q.id,before:q.frames.reduce((n,f)=>n+f.before.rgbRMSE,0)/5,after:q.frames.reduce((n,f)=>n+f.after.rgbRMSE,0)/5})),null,2));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
