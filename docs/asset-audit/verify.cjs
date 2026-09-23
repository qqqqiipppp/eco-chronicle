// Read-only audit: node docs/asset-audit/verify.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p));
const json = p => JSON.parse(read(p));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const receipt = json('docs/asset-audit/quarantine-manifest.json');
const baseline = json('docs/asset-audit/baseline.json');
const moved = new Map(receipt.files.map(r => [r.path, r]));
const errors = [];
for (const row of baseline.files) {
  const target = moved.get(row.path)?.destination || row.path;
  try {
    if (hash(read(target)) !== row.sha256) errors.push('Changed bytes: ' + target);
  } catch { errors.push('Missing file: ' + target); }
}
const context = vm.createContext({});
for (const name of ['sprites', 'sprite-meta', 'player-tint', 'visuals']) {
  vm.runInContext(read('js/' + name + '.js').toString('utf8'), context, {timeout: 5000});
}
const active = new Set();
function collect(value) {
  if (typeof value === 'string' && value.startsWith('./assets/')) active.add(value.slice(2));
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
Object.values(context).forEach(collect);
for (const p of active) {
  if (!fs.existsSync(path.join(root, p))) errors.push('Missing active mapping: ' + p);
  if (moved.has(p)) errors.push('Quarantined active mapping: ' + p);
}
for (const row of receipt.files) {
  if (fs.existsSync(path.join(root, row.path))) errors.push('Original path reappeared: ' + row.path);
  for (const d of row.assignments) {
    if (context.SPRITES[d.key] === './' + row.path) errors.push('Not overwritten: ' + row.path);
  }
}
for (const row of baseline.files.filter(r => r.path.endsWith('.js'))) {
  try { new vm.Script(read(row.path).toString('utf8'), {filename: row.path}); }
  catch (e) { errors.push(e.message); }
}
console.log(JSON.stringify({originalFilesVerified: baseline.files.length, activePaths: active.size,
  quarantinedFiles: receipt.files.length, errors}, null, 2));
process.exitCode = errors.length ? 1 : 0;
