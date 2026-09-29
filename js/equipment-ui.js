/* Presentation only: original price remains the duplicate-reward basis. */
// The legacy visual pack also assigns gr_* keys; apply tool artwork after it.
for(const it of Object.values(GEAR_ALL).flat().concat(LEGEND_GEAR))
  SPRITES[it.ico]='./assets/images/gear/'+it.id+'.png';
var gearNotice=null;
function gearShopPrice(it){ return it&&Number.isFinite(it.shopPrice)?it.shopPrice:it?.price; }
function gearVisualIcon(it){
  return it&&SPRITES[it.ico]?`<img class="gear-icon" src="${SPRITES[it.ico]}" width="96" height="96" alt="">`:'';
}
function gearEducation(it,showIcon=true){
  if(!it)return '';
  const stat=it.atk?`공격 +${it.atk}`:it.def?`방어 +${it.def}`:`기력 +${it.sp}`;
  return `<div class="gear-education ${isLegend(it.id)?'legend':''}">${showIcon?`<div class="gear-portrait">${gearVisualIcon(it)}</div>`:''}<div class="gear-copy">
    <div class="gear-stat"><b>게임 효과:</b> ${stat}</div>
    ${it.desc?`<div class="gear-special"><b>특수 효과:</b> ${esc(it.desc)}</div>`:''}
    <div class="gear-use"><b>실제 쓰임:</b> ${esc(it.eduDesc||'')}</div></div></div>`;
}
function gearResultCard(it,title){
  return it?`<div class="card gear-info ${isLegend(it.id)?'legend':''}"><div class="gear-card-head"><span class="gear-portrait">${gearVisualIcon(it)}</span><span><small class="gear-card-kicker">${esc(title||'장비 정보')}</small><b>${esc(it.name)}</b></span></div>${gearEducation(it,false)}</div>`:'';
}
function gearNoticeHTML(){
  return gearNotice?gearResultCard(gearFind(gearNotice.slot,gearNotice.id),gearNotice.title):'';
}
function gearBagHTML(){
  const rows=Object.keys(GEAR_ALL).flatMap(slot=>gearList(slot).filter(it=>S.owned.includes(it.id)).map(it=>{
    const on=S.gear[slot]===it.id;
    return `<details class="card gear-info ${isLegend(it.id)?'legend':''}"><summary class="gear-card-head"><span class="gear-portrait">${gearVisualIcon(it)}</span><span class="gear-card-copy"><small class="gear-card-kicker">${isLegend(it.id)?'전설 · ':''}${esc(GEAR_LABEL[slot])}</small><strong>${esc(it.name)}</strong><span class="gear-status ${on?'equipped':''}">${on?'장착 중':'보유'}</span></span><span class="gear-fold" aria-hidden="true">⌄</span></summary>
      ${gearEducation(it,false)}<button class="btn sec" ${on?'disabled':''} onclick="equip('${slot}','${it.id}')">${on?'장착 중':'장착하기'}</button></details>`;
  })).join('');
  return `<div class="eco-section-title">보유 장비 · 눌러서 쓰임 확인</div>${gearNoticeHTML()}${rows||'<div class="note">아직 보유한 장비가 없어요.</div>'}`;
}
