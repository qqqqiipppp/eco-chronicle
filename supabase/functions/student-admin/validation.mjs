import '../../../js/student-state.js';
import catalog from './catalog.mjs';
import {STUDENT_FIELDS,MAX_SAVE_BYTES} from '../student-save/handler.mjs';
export const VERSION=globalThis.EcoStudentState.version;
export const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
export const uint=v=>Number.isSafeInteger(v)&&v>=0;
export function stable(v){return Array.isArray(v)?'['+v.map(stable).join(',')+']':object(v)?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);}
function tree(v,depth=0){
  if(depth>24)return false;
  if(typeof v==='number')return Number.isFinite(v);
  if(Array.isArray(v))return v.every(x=>tree(x,depth+1));
  if(object(v))return Object.keys(v).every(k=>!['__proto__','constructor','prototype'].includes(k)&&tree(v[k],depth+1));
  return v===null||['string','boolean'].includes(typeof v);
}
export function initialStudent(name,petKey,random=crypto){
  const s=globalThis.EcoStudentState.create();delete s.scene;delete s.modal;
  s.name=name;s.petKey=petKey;
  s.code='EC'+String(random.getRandomValues(new Uint32Array(1))[0]%10000).padStart(4,'0');return s;
}
export function validateStudent(s,base=null){
  if(!object(s)||!tree(s))return 'INVALID_SAVE_DATA';
  if(new TextEncoder().encode(JSON.stringify(s)).length>MAX_SAVE_BYTES)return 'SAVE_TOO_LARGE';
  if(s.saveVersion!==VERSION||s.v!==VERSION)return 'UNSUPPORTED_SAVE_VERSION';
  for(const k of Object.keys(s))if(!STUDENT_FIELDS.has(k)&&(!base||stable(s[k])!==stable(base[k])))return 'INVALID_STUDENT_FIELD';
  const defaults=globalThis.EcoStudentState.create();delete defaults.scene;delete defaults.modal;
  for(const [k,v] of Object.entries(defaults)){
    if(!(k in s))return 'INVALID_SAVE_DATA';
    if(v!==null&&(Array.isArray(v)?!Array.isArray(s[k]):object(v)?!object(s[k]):typeof s[k]!==typeof v))return 'INVALID_SAVE_DATA';
  }
  if(typeof s.name!=='string'||!s.name.trim()||s.name.length>8||!/^EC\d{4}$/.test(s.code)||(base&&s.code!==base.code))return 'INVALID_STUDENT_FIELD';
  if(!uint(s.lv)||s.lv<1||s.lv>catalog.maxLevel||!uint(s.exp)||!uint(s.gold)||!catalog.themes.includes(s.themeId))return 'INVALID_STUDENT_FIELD';
  if(![4,5,6].includes(s.grade)||![null,'earth','water','fire'].includes(s.petKey)||![0,1,2].includes(s.petStage))return 'INVALID_STUDENT_FIELD';
  if(!Number.isFinite(s.gauge)||s.gauge<0||s.gauge>100||!uint(s.canLv)||s.canLv>=catalog.canLevels)return 'INVALID_STUDENT_FIELD';
  for(const k of ['day','water','wellDay','potions','tickets','monIdx','defeatStreak','quizIdx','quizCorrect','advIdx'])if(!uint(s[k]))return 'INVALID_STUDENT_FIELD';
  const ids=(arr,allowed,old=[])=>Array.isArray(arr)&&arr.every(v=>typeof v==='string'&&v.length<=80&&(allowed.includes(v)||(Array.isArray(old)&&old.includes(v))));
  const gearIds=Object.values(catalog.gear).flat();
  if(!ids(s.owned,gearIds,base?.owned)||!ids(s.cleared,catalog.themes,base?.cleared)||!ids(s.ecoTechUnlocked,catalog.ecoTech,base?.ecoTechUnlocked))return 'INVALID_STUDENT_FIELD';
  for(const [slot,allowed] of Object.entries(catalog.gear)){
    const id=s.gear[slot],old=base?.gear?.[slot];
    if(id!==null&&(typeof id!=='string'||(!allowed.includes(id)&&id!==old)||(!s.owned.includes(id)&&!(id===old&&!base?.owned?.includes(id)))))return 'INVALID_STUDENT_FIELD';
  }
  for(const k of Object.keys(s.gear))if(!catalog.gear[k]&&stable(s.gear[k])!==stable(base?.gear?.[k]))return 'INVALID_STUDENT_FIELD';
  for(const [k,allowed] of Object.entries(catalog.looks))if(!allowed.includes(s[k])&&s[k]!==base?.[k])return 'INVALID_STUDENT_FIELD';
  if(!object(s.tower)||!uint(s.tower.best)||!uint(s.tower.bestTime)||!uint(s.tower.runs)||!Array.isArray(s.tower.history))return 'INVALID_STUDENT_FIELD';
  const towerChanged=!base||s.tower.best!==base.tower?.best||s.tower.bestTime!==base.tower?.bestTime;
  if(towerChanged&&((s.tower.best===0&&s.tower.bestTime!==0)||(s.tower.best>0&&s.tower.bestTime<1)))return 'INVALID_TOWER_RECORD';
  if(s.farm!==null){
    if(!object(s.farm)||!Array.isArray(s.farm.plots)||s.farm.plots.length!==catalog.plots||!Array.isArray(s.farm.pens)||s.farm.pens.length!==catalog.pens)return 'INVALID_STUDENT_FIELD';
    for(let i=0;i<s.farm.plots.length;i++){
      const p=s.farm.plots[i],old=base?.farm?.plots?.[i];
      if(!object(p)||!uint(p.stage)||p.stage>3||typeof p.wet!=='boolean'||(p.seed!==null&&!catalog.flowers.includes(p.seed)&&p.seed!==old?.seed))return 'INVALID_STUDENT_FIELD';
    }
    for(let i=0;i<s.farm.pens.length;i++){
      const a=s.farm.pens[i],old=base?.farm?.pens?.[i];if(a===null)continue;
      if(!object(a)||(!catalog.animals.includes(a.kind)&&a.kind!==old?.kind)||!uint(a.age)||!uint(a.tick)||typeof a.adult!=='boolean'||typeof a.fed!=='boolean')return 'INVALID_STUDENT_FIELD';
    }
  }
  for(const [id,p] of Object.entries(s.progress)){
    if(!catalog.themes.includes(id)){if(stable(p)!==stable(base?.progress?.[id]))return 'INVALID_STUDENT_FIELD';continue;}
    if(!object(p)||!Number.isFinite(p.gauge)||p.gauge<0||p.gauge>100)return 'INVALID_STUDENT_FIELD';
    for(const k of Object.keys(p)){
      if(!catalog.regionFields.includes(k)&&!['quizContentVersion'].includes(k)&&stable(p[k])!==stable(base?.progress?.[id]?.[k]))return 'INVALID_STUDENT_FIELD';
      if(typeof defaults[k]==='boolean'&&typeof p[k]!=='boolean')return 'INVALID_STUDENT_FIELD';
    }
  }
  if(s.learning!=null&&(!object(s.learning)||s.learning.version!==1||!object(s.learning.regions)))return 'INVALID_STUDENT_FIELD';
  return null;
}
