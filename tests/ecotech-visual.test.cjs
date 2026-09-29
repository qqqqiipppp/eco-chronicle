// Guard a visual-only rework against changes to gameplay or saved educational data.
// The baseline was captured before the new artwork or presentation code was applied.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const vm=require('node:vm'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f));
const baseline=JSON.parse(read('tests/fixtures/ecotech-visual-baseline.json'));
const json=v=>JSON.parse(JSON.stringify(v));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');

for(const [file,expected] of Object.entries(baseline.protectedFiles))
  assert.equal(sha(read(file)),expected,'visual work must not change '+file);

const c={console,SPRITES:{},SPR_SIZE:{},SPR_FRAMES:{},esc:s=>String(s)};c.window=c;vm.createContext(c);
for(const file of ['sprites','sprite-meta','visuals','gear-data','equipment-ui','ecotech-exploration','ecotech'])
  vm.runInContext(read('js/'+file+'.js').toString(),c,{filename:file+'.js'});
assert.deepEqual(json(c.GEAR_ALL),baseline.gear,'complete normal equipment data');
assert.deepEqual(json(c.LEGEND_GEAR),baseline.legend,'complete legendary effects and probabilities');
assert.deepEqual(json(c.ECO_TECH),baseline.ecoTech,'all quest text, NPC links and educational content');
assert.deepEqual(json(c.ECO_EXPLORATION),baseline.exploration,'all exploration educational context');
for(const [name,expected] of Object.entries(baseline.protectedFunctions)){
  assert.equal(typeof c[name],'function','protected logic exists: '+name);
  assert.equal(sha(c[name].toString()),expected,'unchanged quest/placement/collision/use logic: '+name);
}

// Decode the actual shipped PNGs rather than relying on their file suffixes.
// Non-interlaced 8-bit RGBA/RGB/gray/indexed images are supported without packages.
const crcTable=Array.from({length:256},(_,i)=>{
  let n=i;for(let b=0;b<8;b++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;
});
function crc32(buf){let n=0xffffffff;for(const b of buf)n=crcTable[(n^b)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
function png(file){
  assert.ok(fs.readdirSync(path.dirname(path.join(root,file))).includes(path.basename(file)),
    'exact filename case works on GitHub Pages: '+file);
  const bytes=read(file),signature=Buffer.from([137,80,78,71,13,10,26,10]);
  assert.ok(bytes.subarray(0,8).equals(signature),'PNG signature: '+file);
  let ihdr,palette,alpha,end=false;const idat=[];
  for(let pos=8;pos<bytes.length;){
    const len=bytes.readUInt32BE(pos),type=bytes.toString('ascii',pos+4,pos+8),stop=pos+12+len;
    assert.ok(stop<=bytes.length,'complete PNG chunk: '+file);
    const data=bytes.subarray(pos+8,pos+8+len);
    assert.equal(crc32(bytes.subarray(pos+4,pos+8+len)),bytes.readUInt32BE(pos+8+len),'PNG checksum: '+file);
    if(type==='IHDR')ihdr=data;
    if(type==='PLTE')palette=data;
    if(type==='tRNS')alpha=data;
    if(type==='IDAT')idat.push(data);
    if(type==='IEND'){end=true;break;}
    pos=stop;
  }
  assert.ok(end&&ihdr&&idat.length,'complete readable PNG: '+file);
  const width=ihdr.readUInt32BE(0),height=ihdr.readUInt32BE(4),depth=ihdr[8],type=ihdr[9];
  assert.equal(depth,8,'8-bit image: '+file);assert.equal(ihdr[12],0,'non-interlaced image: '+file);
  const bpp={0:1,2:3,3:1,4:2,6:4}[type];assert.ok(bpp,'supported PNG type: '+file);
  const scan=zlib.inflateSync(Buffer.concat(idat)),stride=width*bpp;
  assert.equal(scan.length,(stride+1)*height,'complete PNG raster: '+file);
  const pixels=Buffer.alloc(stride*height),rgba=Buffer.alloc(width*height*4),colors=new Set();let transparent=0,visible=0;
  const paeth=(a,b,d)=>{const p=a+b-d,pa=Math.abs(p-a),pb=Math.abs(p-b),pd=Math.abs(p-d);return pa<=pb&&pa<=pd?a:pb<=pd?b:d;};
  for(let y=0;y<height;y++){
    const filter=scan[y*(stride+1)];assert.ok(filter<=4,'valid PNG row filter: '+file);
    for(let x=0;x<stride;x++){
      const a=x>=bpp?pixels[y*stride+x-bpp]:0,b=y?pixels[(y-1)*stride+x]:0,d=y&&x>=bpp?pixels[(y-1)*stride+x-bpp]:0;
      const add=[0,a,b,Math.floor((a+b)/2),paeth(a,b,d)][filter];
      pixels[y*stride+x]=(scan[y*(stride+1)+1+x]+add)&255;
    }
    for(let x=0;x<width;x++){
      const i=y*stride+x*bpp;let r,g,b,a=255;
      if(type===6){r=pixels[i];g=pixels[i+1];b=pixels[i+2];a=pixels[i+3];}
      else if(type===2){r=pixels[i];g=pixels[i+1];b=pixels[i+2];if(alpha?.length===6&&r===alpha.readUInt16BE(0)&&g===alpha.readUInt16BE(2)&&b===alpha.readUInt16BE(4))a=0;}
      else if(type===3){const n=pixels[i];r=palette[n*3];g=palette[n*3+1];b=palette[n*3+2];a=alpha?.[n]??255;}
      else{r=g=b=pixels[i];if(type===4)a=pixels[i+1];else if(alpha?.length===2&&r===alpha.readUInt16BE(0))a=0;}
      const target=(y*width+x)*4;rgba[target]=r;rgba[target+1]=g;rgba[target+2]=b;rgba[target+3]=a;
      if(a===0)transparent++;
      if(a>64){visible++;colors.add((r<<16)|(g<<8)|b);}
    }
  }
  assert.ok(transparent>width*height*.01,'real transparent background: '+file);
  assert.ok(visible>width*height*.04,'image is not empty: '+file);
  assert.ok(colors.size>=16,'image has shading/detail beyond a flat pictogram: '+file);
  return{file,width,height,bytes:bytes.length,colors:colors.size,transparent,hash:sha(bytes),rasterHash:sha(rgba)};
}
const files=[],gear=Object.values(c.GEAR_ALL).flat().concat(c.LEGEND_GEAR);
assert.equal(gear.length,25);assert.equal(c.ECO_TECH.length,8);
for(const it of gear){
  const file='assets/images/gear/'+it.id+'.png',img=png(file);
  assert.equal(img.width,img.height,'square gear icon');assert.ok(img.width>=48&&img.width<=192,'small gear texture');
  assert.equal(c.SPRITES[it.ico],'./'+file,'all old fantasy sprite keys now map to their own actual tool: '+it.id);
  // The existing renderer's nominal sprite size can remain 32x32 even if source
  // pixels are denser: CSS background-size scales the full static square image.
  const nominal=c.SPR_SIZE[it.ico];
  assert.ok(nominal?.[0]>0&&nominal[0]===nominal[1],'gear keeps a valid square render footprint');
  assert.equal(c.SPR_FRAMES[it.ico],1,'gear uses a static texture');
  assert.ok(c.gearVisualIcon(it).includes('./'+file),'the actual card uses the new icon: '+it.id);
  files.push(img);
}
for(const t of c.ECO_TECH){
  const icon='assets/images/ecotech/'+t.id+'.png',img=png(icon);
  assert.equal(img.width,img.height,'square ecotech icon');assert.ok(img.width>=48&&img.width<=192,'small tool texture');
  assert.ok(c.ecoTechIcon(t).includes('./'+icon),'the actual tech UI uses its new icon: '+t.id);
  files.push(img);
  const states=[];
  for(const open of [false,true]){
    const file='assets/images/ecotech/areas/'+t.id+'-'+(open?'open':'locked')+'.png',area=png(file);
    assert.ok(area.width<=512&&area.height<=512,'bounded static room texture');
    c.EcoTech.rooms=[{tech:t.id,x:100,y:100,w:240,h:220,open}];
    const html=c.ecoExplorationHTML();
    assert.ok(html.includes('./'+file),'the actual room renderer selects its state-specific art: '+file);
    assert.ok(!/<svg\b/i.test(html),'room artwork is not the old test SVG');
    states.push(area);files.push(area);
  }
  assert.equal(states[0].width,states[1].width,'same room footprint across use');
  assert.equal(states[0].height,states[1].height,'same room footprint across use');
  assert.notEqual(states[0].rasterHash,states[1].rasterHash,'visibly distinct locked/open artwork: '+t.id);
}
assert.equal(files.length,49,'25 equipment, 8 tools, 16 room states');
assert.equal(new Set(files.map(f=>f.rasterHash)).size,files.length,'no duplicate images disguised as unique items');
const bytes=files.reduce((sum,f)=>sum+f.bytes,0);
assert.ok(bytes<5*1024*1024,'small static texture budget for classroom tablets');
console.log('PASS: 25 complete equipment identities/effects, 8 quest data records, 14 unchanged systems, 26 unchanged logic functions; 33 real unique transparent icons and 16 distinct room-state PNGs; runtime artwork mapping. Texture bytes:',bytes);
