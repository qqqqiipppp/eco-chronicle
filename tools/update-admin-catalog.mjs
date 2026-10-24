// Optional maintenance only. Derive the validation catalog from the live game definitions.
import fs from 'node:fs';
import {game,root,plain} from '../tests/helpers/cloud-save-runtime.mjs';
const {c}=game();
const catalog={version:c.CURRENT_SAVE_VERSION,maxLevel:c.MAX_LV,themes:c.THEME_ORDER,
  gear:Object.fromEntries(Object.keys(c.GEAR_ALL).map(slot=>[slot,[...c.GEAR_ALL[slot],...c.LEGEND_GEAR.filter(g=>g.slot===slot)].map(g=>g.id)])),
  ecoTech:c.ECO_TECH.map(t=>t.id),flowers:Object.keys(c.FLOWERS),animals:Object.keys(c.LIVESTOCK),plots:c.PLOTS,pens:c.PENS,
  canLevels:c.CANS.length,regionFields:c.THEME_FIELDS,looks:Object.fromEntries(Object.keys(c.LOOKS).map(k=>[k,c.LOOKS[k].map(v=>v[0])]))};
fs.mkdirSync(root+'/supabase/functions/student-admin',{recursive:true});
fs.writeFileSync(root+'/supabase/functions/student-admin/catalog.mjs','// Generated from the live game by tools/update-admin-catalog.mjs; checked by tests.\nexport default '+JSON.stringify(plain(catalog),null,2)+';\n');
console.log('Admin validation catalog derived from current game.');
