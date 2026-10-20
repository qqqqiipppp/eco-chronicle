// Read image metadata/alpha and render native-resolution review sheets.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const ids=['leftovers','disposables','algae','nightglare','glasswall','powerstrip','poacher','carbon'];
const poses=['idle','attack','special1','special2','hit'];
const out=path.resolve(process.argv[2]||'docs/tower-art-review');
async function run(){
  await fs.mkdir(out,{recursive:true});const audit=[];
  for(const id of ids){
    const base=path.join('assets/images/monsters','tower-'+id+'.webp'),m=await sharp(base).metadata();
    const frames=[],layers=[];
    for(let i=0;i<5;i++){
      const file=path.join('assets/images/monsters/tower-frames',id+'-'+poses[i]+'.png');
      const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      let x0=info.width,y0=info.height,x1=-1,y1=-1,partial=0,opaque=0;
      for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
        const a=data[(y*info.width+x)*4+3];if(a>0&&a<255)partial++;if(a===255)opaque++;
        if(a<20)continue;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
      }
      frames.push({pose:poses[i],png:[info.width,info.height],alpha:[x0,y0,x1,y1],bodyPixels:[x1-x0+1,y1-y0+1],partial,opaque});
      const title=Buffer.from('<svg width="256" height="22"><text x="6" y="16" font-size="12" fill="white">'+id+' / '+poses[i]+'</text></svg>');
      layers.push({input:title,left:i*264,top:0},{input:file,left:i*264,top:24});
    }
    await sharp({create:{width:1320,height:280,channels:4,background:'#273942'}}).composite(layers).png().toFile(path.join(out,id+'-png-frames.png'));
    audit.push({id,strip:[m.width,m.height],frame:[m.width/5,m.height],stripBytes:(await fs.stat(base)).size,decodedBytes:m.width*m.height*4,frames});
  }
  await fs.writeFile(path.join(out,'asset-audit.json'),JSON.stringify(audit,null,2));
  console.log(JSON.stringify(audit.map(({frames,...row})=>({...row,bodyPixels:frames.map(f=>f.bodyPixels)})),null,2));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
