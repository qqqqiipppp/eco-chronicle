// Asset preparation only. Game code does not load this file.
// Crop the approved small generated families and retain their original alpha.
const fs = require('node:fs/promises');
const path = require('node:path');
let sharp;
try { sharp = require('sharp'); }
catch {
  sharp = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
}
const root = path.resolve(__dirname, '..');
const arg = name => {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1];
};
const sourceDir = arg('--source-dir') || path.join(process.env.USERPROFILE,
  '.codex/generated_images/01a0cdcd-d956-7802-8a19-58ad2a99a8f3');
const previewPath = arg('--preview');
const metadataPath = arg('--metadata');
const families = [
  { file: 'exec-b1bf90ed-5f30-432f-a74d-9b8f5e9e368b.png', cols: 3, rows: 2, ids: ['w1','w2','w3','w4','w5','w6'] },
  { file: 'exec-27e650c2-626e-43b0-a628-1e4899ef83c3.png', cols: 3, rows: 2, ids: ['a1','a2','a3','a4','a5'] },
  { file: 'exec-19ccd34a-eba1-4e20-988f-31449e615803.png', cols: 2, rows: 2, ids: ['h1','h2','h3','h4'] },
  { file: 'exec-9fb5e0e2-633a-45f1-8d9b-c402238d4821.png', cols: 2, rows: 2, ids: ['s1','s2','s3','s4'] },
  // The revised legend family uses verified transparent gutters instead of equal cells.
  { file: 'exec-866d8f30-cf5f-4474-8fee-2875edb042b3.png', cols: 3, rows: 2,
    columnEdges: [0,536,1074,1536], rowEdges: [0,540,1024],
    ids: ['L1','L2','L3','L4','L5','L6'] },
  { file: 'exec-a6f9caef-3311-4a58-9106-6f7bf92e57ee.png', cols: 2, rows: 2,
    directory: 'ecotech', ids: ['soil','water','sorbent','generator'] },
  { file: 'exec-7662a8b8-3aa5-442a-b6e5-cea05666b3b0.png', cols: 2, rows: 2,
    directory: 'ecotech', ids: ['dust','solar','filter','thermal'] }
];
async function prepare() {
  const records = [], previews = [];
  for (const family of families) {
    const outputDir = path.join(root, 'assets/images', family.directory || 'gear');
    await fs.mkdir(outputDir, { recursive: true });
    const source = path.join(sourceDir, family.file);
    const { data, info } = await sharp(source).raw().toBuffer({ resolveWithObject: true });
    if (info.channels !== 4) throw new Error(`${family.file}: transparent RGBA source required`);
    for (let index = 0; index < family.ids.length; index++) {
      const id = family.ids[index];
      const col = index % family.cols, row = Math.floor(index / family.cols);
      const left = family.columnEdges?.[col] ?? Math.floor(col * info.width / family.cols);
      const top = family.rowEdges?.[row] ?? Math.floor(row * info.height / family.rows);
      const right = family.columnEdges?.[col+1] ?? Math.floor((col + 1) * info.width / family.cols);
      const bottom = family.rowEdges?.[row+1] ?? Math.floor((row + 1) * info.height / family.rows);
      let minX = right, minY = bottom, maxX = left - 1, maxY = top - 1;
      // The threshold only selects a crop. No pixel alpha or color is changed.
      for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
        if (data[(y * info.width + x) * 4 + 3] <= 16) continue;
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
      if (maxX < minX || maxY < minY) throw new Error(`${id}: empty cell`);
      // Small source-space padding keeps the existing antialiased outline intact.
      minX = Math.max(left, minX - 6); minY = Math.max(top, minY - 6);
      maxX = Math.min(right - 1, maxX + 6); maxY = Math.min(bottom - 1, maxY + 6);
      const crop = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
      const image = await sharp(source).extract(crop)
        .resize(88, 88, { fit: 'contain', kernel: sharp.kernel.lanczos3,
          background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({ top: 4, bottom: 4, left: 4, right: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 }).toBuffer();
      const destination = path.join(outputDir, `${id}.png`);
      await fs.writeFile(destination, image);
      records.push({ id, directory: family.directory || 'gear', source: family.file, crop, bytes: image.length });
      previews.push({ image, id });
    }
  }
  if (previewPath) {
    const cols = 6, cell = 128, rows = Math.ceil(previews.length / cols);
    await fs.mkdir(path.dirname(previewPath), { recursive: true });
    const labels = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cols*cell}" height="${rows*cell}">${previews.map((r,index)=>
      `<text x="${index%cols*cell+cell/2}" y="${Math.floor(index/cols)*cell+119}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#264137">${r.id}</text>`).join('')}</svg>`);
    await sharp({ create: { width: cols * cell, height: rows * cell, channels: 4,
      background: { r: 231, g: 223, b: 192, alpha: 1 } } })
      .composite([...previews.map((r, index) => ({ input: r.image,
        left: (index % cols) * cell + 16, top: Math.floor(index / cols) * cell + 8 })),
        { input: labels, left: 0, top: 0 }])
      .png().toFile(previewPath);
  }
  const metadata = { count: records.length,
    totalBytes: records.reduce((sum, r) => sum + r.bytes, 0), records };
  if (metadataPath) {
    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }
  console.log(JSON.stringify(metadata, null, 2));
}
prepare().catch(error => { console.error(error); process.exitCode = 1; });
