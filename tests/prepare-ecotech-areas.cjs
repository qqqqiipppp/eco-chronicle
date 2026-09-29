// Art preparation only. The game never loads this helper.
// Preserve approved RGBA artwork: crop shared state bounds, resize, compress.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require(path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')); }
const root = path.resolve(__dirname, '..');
const arg = name => {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1];
};
const sourceDir = arg('--source-dir') || path.join(process.env.USERPROFILE,
  '.codex/generated_images/01a0cdcd-d956-7802-8a19-58ad2a99a8f3');
const outputDir = path.join(root, 'assets/images/ecotech/areas');
const previewPath = arg('--preview');
const reportPath = arg('--report');
const selected = arg('--only')?.split(',');
const families = [
  { id: 'soil', file: 'exec-cc43f2b5-344a-47e8-b7de-903688100b9d.png' },
  { id: 'water', file: 'exec-07de4ae8-d37f-4c7e-9344-de4d3b9e3dfc.png' },
  { id: 'sorbent', file: 'exec-e4b6a855-d09b-410d-bf29-12ff02df1223.png' },
  { id: 'generator', file: 'exec-6ca2545f-fd03-4143-9d63-a199cec7ba1a.png' },
  { id: 'dust', file: 'exec-4e9f1bae-331f-4132-a3ee-cdb8db13a81f.png' },
  { id: 'solar', file: 'exec-0e5e6979-71c4-4fc2-a5b9-a8a2cb9f2118.png' },
  { id: 'filter', file: 'exec-04041278-44e7-4bde-8004-95a36df608ec.png' },
  { id: 'thermal', file: 'exec-06c2150e-b0da-40f1-b213-5bbaa9b72615.png' }
];
async function prepare() {
  await fs.mkdir(outputDir, { recursive: true });
  const records = [], previews = [], hashes = new Set();
  for (const family of families.filter(f => !selected || selected.includes(f.id))) {
    const source = path.join(sourceDir, family.file);
    const { data, info } = await sharp(source).raw().toBuffer({ resolveWithObject: true });
    if (info.channels !== 4 || info.width < 2)
      throw new Error(`${family.file}: an RGBA pair is required`);
    const half = Math.floor(info.width / 2);
    const columnLeft = [0, half], columnWidth = [half, info.width - half];
    // Bounds use coordinates relative to either exact half, then take their union.
    // The threshold decides the crop only; original alpha and RGB are not edited.
    const bounds = { left: half, top: info.height, right: -1, bottom: -1 };
    const cells = [];
    for (let column = 0; column < 2; column++) {
      const cell = { left: half, top: info.height, right: -1, bottom: -1 };
      for (let y = 0; y < info.height; y++) for (let x = 0; x < columnWidth[column]; x++) {
        if (data[(y * info.width + columnLeft[column] + x) * 4 + 3] <= 16) continue;
        cell.left = Math.min(cell.left, x); cell.top = Math.min(cell.top, y);
        cell.right = Math.max(cell.right, x); cell.bottom = Math.max(cell.bottom, y);
      }
      if (cell.right < cell.left || cell.bottom < cell.top)
        throw new Error(`${family.id}: empty state ${column}`);
      bounds.left = Math.min(bounds.left, cell.left);
      bounds.top = Math.min(bounds.top, cell.top);
      bounds.right = Math.max(bounds.right, cell.right);
      bounds.bottom = Math.max(bounds.bottom, cell.bottom);
      cells.push(cell);
    }
    // Retain a small amount of the source's existing soft edge where space allows.
    bounds.left = Math.max(0, bounds.left - 3);
    bounds.top = Math.max(0, bounds.top - 3);
    bounds.right = Math.min(half - 1, bounds.right + 3);
    bounds.bottom = Math.min(info.height - 1, bounds.bottom + 3);
    for (let column = 0; column < 2; column++) {
      const state = column ? 'open' : 'locked';
      const crop = { left: bounds.left + columnLeft[column], top: bounds.top,
        width: bounds.right - bounds.left + 1, height: bounds.bottom - bounds.top + 1 };
      const output = await sharp(source).extract(crop)
        .resize(288, 288, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
        .png({ compressionLevel: 9 }).toBuffer();
      const hash = crypto.createHash('sha256').update(output).digest('hex');
      if (hashes.has(hash)) throw new Error(`${family.id}-${state}: duplicate artwork bytes`);
      hashes.add(hash);
      const { data: pixels, info: finalInfo } = await sharp(output).raw()
        .toBuffer({ resolveWithObject: true });
      if (finalInfo.channels !== 4 || finalInfo.width !== 288 || finalInfo.height !== 288)
        throw new Error(`${family.id}-${state}: invalid output size or alpha`);
      let transparent = 0, visible = 0, partial = 0;
      const footprint = { left: 288, top: 288, right: -1, bottom: -1 };
      for (let offset = 3; offset < pixels.length; offset += 4) {
        const alpha = pixels[offset];
        if (alpha === 0) transparent++;
        else if (alpha === 255) visible++;
        else partial++;
        if (alpha > 16) {
          const position = (offset - 3) / 4, x = position % 288, y = Math.floor(position / 288);
          footprint.left = Math.min(footprint.left, x); footprint.top = Math.min(footprint.top, y);
          footprint.right = Math.max(footprint.right, x); footprint.bottom = Math.max(footprint.bottom, y);
        }
      }
      if (!transparent || !visible) throw new Error(`${family.id}-${state}: invalid alpha coverage`);
      const file = `${family.id}-${state}.png`;
      await fs.writeFile(path.join(outputDir, file), output);
      records.push({ id: family.id, state, file, source: family.file, crop,
        sourceSize: { width: info.width, height: info.height },
        cellBounds: cells[column], bytes: output.length, hash, footprint,
        alpha: { transparent, opaque: visible, partial } });
      previews.push(output);
    }
  }
  if (previewPath) {
    await fs.mkdir(path.dirname(previewPath), { recursive: true });
    await sharp({ create: { width: 576, height: 288 * (previews.length / 2),
      channels: 4, background: { r: 219, g: 224, b: 190, alpha: 1 } } })
      .composite(previews.map((input, index) => ({ input,
        left: index % 2 * 288, top: Math.floor(index / 2) * 288 })))
      .png().toFile(previewPath);
  }
  const report = { count: records.length,
    totalBytes: records.reduce((sum, item) => sum + item.bytes, 0),
    uniqueHashes: hashes.size, width: 288, height: 288, records };
  if (reportPath) {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  }
  console.log(JSON.stringify(report, null, 2));
}
prepare().catch(error => { console.error(error); process.exitCode = 1; });
