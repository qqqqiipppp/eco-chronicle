// Resize/crop generated transparent artwork; preserve legacy sprite paths and frame layout.
const fs=require('node:fs/promises'),path=require('node:path');
const sharp=require(require.resolve('sharp',{paths:[process.env.NODE_PATH||'',
  'C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules']}));
const source=process.argv[2];if(!source)throw Error('Pass the generated image directory.');
const output=path.resolve(__dirname,'../assets/images/objects');
const art=[
 ['spring','exec-11138576-d866-4e50-8947-b114f873266b.png',104,104,['45a6c5cc79474c79dea17b6f.png','d3e87a43dc1b37b9eb010e0f.png']],
 ['tower','exec-2e4a4daf-40c1-495b-8515-3405cd9c196e.png',104,128,['871854459b9022d3e88b8d32.png']],
 ['altar','exec-f9dfbb09-1424-49ce-9fe2-7fb76fef423d.png',112,112,['abaa58222c1942d49ffdca4a.png']],
 ['farm','exec-7022ccd3-e9d5-47d0-bade-229a5048b96b.png',104,104,['64e215d2306d9b576ed938de.png']],
 ['pollution','exec-10a035b2-1f4e-40ad-a3f9-34c6a35f56f7.png',104,80,['429c10f3ab04bab003a026ef.png']],
 ['shop','exec-5c0b0cc7-4abe-4b33-9916-40c4191029e6.png',112,112,['0f3f73c7eacc9bc0462dd26c.png','4caca1ab09eaae181d731288.png']],
 ['fruit','exec-74bc0287-bf45-4aba-b578-b2a2003b5f9d.png',104,104,['b761e80de08461db1fdad0ab.png']],
 ['emblem','exec-5aa9cb43-bd72-432b-8809-1d36319c5c22.png',144,144,['title-nature-emblem.png']]
];
async function prepare(file,w,h){
 const input=path.join(source,file),{data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=0,bottom=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>12){
  left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
 }
 // Crop transparent margins only. Fit, rather than stretch; align the foot to the same baseline.
 const trimmed=await sharp(input).extract({left,top,width:right-left+1,height:bottom-top+1})
  .resize(w*2-8,h*2-8,{fit:'inside'}).png().toBuffer();
 const size=await sharp(trimmed).metadata();
 return sharp({create:{width:w*2,height:h*2,channels:4,background:'#00000000'}})
  .composite([{input:trimmed,left:Math.floor((w*2-size.width)/2),top:h*2-size.height-4}]).png().toBuffer();
}
(async()=>{
 for(const [name,file,w,h,targets] of art){
  const png=await prepare(file,w,h);
  for(const target of targets)await fs.writeFile(path.join(output,target),png);
  // Keep the existing activated altar's two-frame contract and identical footing.
  if(name==='altar')await sharp({create:{width:w*4,height:h*2,channels:4,background:'#00000000'}})
   .composite([{input:png,left:0,top:0},{input:png,left:w*2,top:0}])
   .png().toFile(path.join(output,'3961c72fb97081e4fa7870f1.png'));
  console.log(name+': '+targets.join(', '));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
