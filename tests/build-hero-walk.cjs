// Build code-native sprite sheets from the original artwork. No runtime work is added.
// The original PNGs remain untouched; every piece keeps its original palette and pixels.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp'); // Asset authoring only; shipped game has no dependency.
const { PNG } = require('pngjs');
const root = path.resolve(__dirname, '..');
const outfits = ['cloak', 'robe', 'overall', 'soccer', 'suit', 'dino'];
const directions = ['south', 'north', 'west'];
const legTop = { cloak: 73, robe: 62, overall: 59, soccer: 60, suit: 66, dino: 63 };
const legBounds = { cloak: [26,64], robe: [29,61], overall: [30,61], soccer: [29,61], suit: [28,62], dino: [29,61] };
// Each boot crosses the other boot's original position halfway through the cycle.
// One remains on the original ground row while the passing foot lifts slightly.
const aX = [0, 3, 6, 10, 13, 10, 6, 3];
const bX = aX.map(x => -x);
const armEnds = { cloak: 63, robe: 62, overall: 67, soccer: 62, suit: 65, dino: 63 };
const armInner = {
  cloak: y => y < 53 ? [34,54] : y < 59 ? [32,56] : [31,57],
  robe: y => y < 56 ? [35,53] : [33,55],
  overall: y => y < 52 ? [32,55] : [31,56],
  soccer: y => y < 51 ? [33,55] : [31,58],
  suit: y => y < 51 ? [34,54] : y < 59 ? [32,56] : [31,57],
  dino: y => y < 51 ? [33,55] : [31,57]
};
async function build() {
for (const outfit of outfits) for (const direction of directions) {
  const key = `body_${outfit}_${direction}`;
  // Read the preserved original path even after the runtime map uses the new sheet.
  const map = {
    cloak: ['50825d38d1b6d721461cae88', '686cccda4f7756b79dd5affb', 'da7c706aad5fa010d1cf9d28'],
    robe: ['4cb0d6568158435e8402c1ea', '8ffdc76add959ac9b6c26768', 'b338aea87a7f15bd60a2883e'],
    overall: ['d8017b798546d1ce4db5c40d', '10babc6c51493c20178e508f', '0f60cf61711f6f77a8234674'],
    soccer: ['6507ce293a232ea8e5ebb5f9', '65b47c688a41597d43e154d6', '553f6ac4257017972d8f608d'],
    suit: ['5f04ac93257f9028d58824ea', 'b80ce0849548c71041d4dd4d', '9f30f430d77a8b72d2f65460'],
    dino: ['f2b39838f3726bb1fc409973', '3f1d56842ade5fcb431d0f48', 'd2a4ba86d62df2f925bc0d8f']
  };
  const png = fs.readFileSync(path.join(root, 'assets/images/characters', map[outfit][directions.indexOf(direction)] + '.png'));
  const {data:pixels,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const top=legTop[outfit], [left,right]=legBounds[outfit];
  const use = frame => `<use href="#art" x="${-frame * 88}"/>`;
  const rows=Array.from({length:88-top},(_,i)=>top+i);
  const boundsAt=y=>y>=70?[24,68]:[left,direction==='west'?68:right];
  // Follow the transparent space between whole legs, rather than cutting the
  // front trouser stripe or shoe toe at the cell's center line.
  const splitAt=(y,frame)=>{
    if(y<70)return 49;
    const runs=[];let start=null;
    for(let x=24;x<=68;x++){
      const filled=x<68&&pixels[(y*info.width+frame*88+x)*4+3]>0;
      if(filled&&start===null)start=x;
      if(!filled&&start!==null){if(x-start>=3)runs.push([start,x]);start=null;}
    }
    if(runs.length>1){
      let gap=runs[1][0]-runs[0][1],split=(runs[0][1]+runs[1][0])/2;
      for(let i=2;i<runs.length;i++)if(runs[i][0]-runs[i-1][1]>gap){gap=runs[i][0]-runs[i-1][1];split=(runs[i-1][1]+runs[i][0])/2;}
      return Math.round(split);
    }
    if(runs.length===1&&runs[0][1]-runs[0][0]<18)return (runs[0][0]+runs[0][1])/2<49?runs[0][1]:runs[0][0];
    return 49;
  };
  const footRow=(side,frame)=>{
    let last=top;
    for(const y of rows){const [l,r]=boundsAt(y),split=splitAt(y,frame);
      for(let x=side==='near'?l:split;x<(side==='near'?split:r);x++)if(pixels[(y*info.width+frame*88+x)*4+3])last=y;
    }
    return last;
  };
  const drawLeg=(side,dx,dy,frame)=>rows.map(y=>{
    // Integer row offsets keep the hip fixed and bend the whole lower leg toward
    // the moving foot, so a shoe never slides away from a stationary trouser leg.
    const ratio=outfit==='cloak'?Math.min(1,(y-top)/6):y<70?Math.max(0,(y-top-3)/(70-top)*.35):Math.min(1,.35+(y-70)/10*.65);
    const liftRatio=Math.min(1,Math.max(0,(y-top)/Math.max(1,footRow(side,frame)-top)));
    return `<g transform="translate(${Math.round(dx*ratio)} ${Math.round(dy*liftRatio)})"><g clip-path="url(#${side}${frame}_${y})">${use(frame)}</g></g>`;
  }).join('');
  const armRows=Array.from({length:armEnds[outfit]-43},(_,i)=>43+i);
  const armRect=(y,side)=>{const [l,r]=armInner[outfit](y);return side==='left'?`<rect x="12" y="${y}" width="${l-12}" height="1"/>`:`<rect x="${r}" y="${y}" width="${76-r}" height="1"/>`;};
  const legRects=rows.map(y=>{const [l,r]=boundsAt(y);return `<rect x="${l}" y="${y}" width="${r-l}" height="1"/>`;}).join('');
  const defs = `<defs><image id="art" width="792" height="88" href="data:image/png;base64,${png.toString('base64')}"/>
    <clipPath id="cell"><rect x="12" width="64" height="88"/></clipPath>
    ${Array.from({length:9},(_,frame)=>rows.map(y=>{const [l,r]=boundsAt(y),split=Math.max(l,Math.min(r,splitAt(y,frame)));return `<clipPath id="near${frame}_${y}"><rect x="${l}" y="${y}" width="${split-l}" height="1"/></clipPath><clipPath id="far${frame}_${y}"><rect x="${split}" y="${y}" width="${r-split}" height="1"/></clipPath>`;}).join('')).join('')}
    <clipPath id="leftArm">${armRows.map(y=>armRect(y,'left')).join('')}</clipPath>
    <clipPath id="rightArm">${armRows.map(y=>armRect(y,'right')).join('')}</clipPath>
    <clipPath id="legs">${legRects}</clipPath>
    <mask id="upper" maskUnits="userSpaceOnUse" x="0" y="0" width="88" height="88"><rect width="88" height="88" fill="white"/><g fill="black">${legRects}</g></mask>
    <mask id="withoutArms" maskUnits="userSpaceOnUse" x="0" y="0" width="88" height="88"><rect width="88" height="88" fill="white"/><g fill="black">${armRows.filter(y=>y>=46).map(y=>armRect(y,'left')+armRect(y,'right')).join('')}</g></mask></defs>`;
  const frames = Array.from({ length: 9 }, (_, frame) => {
    let parts;
    if (!frame) parts = use(0);
    else if (direction === 'west') {
      const i = frame - 1;
      const passing=[0,0,0,-1,-2,-2,-1,0][i];
      const planted=i>=4&&i<=6?82-footRow('far',frame):0;
      parts = drawLeg('far',bX[i],planted,frame) + drawLeg('near',aX[i],passing,frame) + `<g mask="url(#upper)">${use(frame)}</g>`;
    } else {
      const swing = [0, 1, 1, 0, 0, -1, -1, 0][frame - 1];
      parts = `<g clip-path="url(#legs)">${use(frame)}</g><g mask="url(#upper)"><g mask="url(#withoutArms)">${use(0)}</g></g>` +
        `<g transform="translate(0 ${swing})"><g clip-path="url(#leftArm)">${use(0)}</g></g>` +
        `<g transform="translate(0 ${-swing})"><g clip-path="url(#rightArm)">${use(0)}</g></g>`;
    }
    return `<g transform="translate(${frame * 88} 0)"><g clip-path="url(#cell)">${parts}</g></g>`;
  }).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="792" height="88" viewBox="0 0 792 88" image-rendering="pixelated"><!-- ${key}: idle + eight walk frames, original artwork pieces -->${defs}${frames}</svg>\n`;
  // Rasterize at the original pixel grid before the game scales the image. This
  // avoids seams between row slices when an SVG image is displayed at 1.5x size.
  fs.writeFileSync(path.join(root, 'assets/images/characters', `hero-walk-${outfit}-${direction}.svg`),svg);
  const raster=PNG.sync.read(await sharp(Buffer.from(svg)).png().toBuffer());
  // Preserve the complete idle cell exactly, including the source edge alpha.
  PNG.bitblt(PNG.sync.read(png),raster,0,0,88,88,0,0);
  fs.writeFileSync(path.join(root, 'assets/images/characters', `hero-walk-${outfit}-${direction}.png`),PNG.sync.write(raster));
}
console.log('Built 18 nine-frame PNG sheets from code-native layouts; originals preserved.');
if(process.argv.includes('--apply')){
  const file=path.join(root,'js/visuals.js');let text=fs.readFileSync(file,'utf8');
  for(const outfit of outfits)for(const direction of directions){
    const key=`body_${outfit}_${direction}`;
    text=text.replace(new RegExp('("'+key+'": ")[^"]+("\\s*[,}])'),
      '$1./assets/images/characters/hero-walk-'+outfit+'-'+direction+'.png$2');
  }
  fs.writeFileSync(file,text);
  console.log('Updated only the 18 body sprite image paths.');
}
}
build().catch(error=>{console.error(error);process.exitCode=1;});
