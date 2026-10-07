/* Optional exploration quests. No equipment, combat rewards or network payloads. */
var ECO_TECH=[
  {id:'soil',name:'토양 pH 측정기',icon:'🌱',theme:'forest',npc:'forest_h6',
    quest:'숲의 서로 다른 토양 3곳을 조사하고 버섯 박사에게 돌아오세요.',
    edu:'토양의 산성도(pH)에 따라 식물이 자라는 환경이 달라질 수 있어요.',
    surveys:[['낙엽 아래 흙','낙엽 아래 흙은 축축하고 작은 생물들이 살고 있어요. 토양의 산성도도 식물이 자라는 데 영향을 주어요.'],['숲길 가장자리 흙','사람이 많이 지나는 흙은 단단해요. 같은 숲이라도 토양의 조건이 다를 수 있어요.'],['햇빛 드는 흙','햇빛이 드는 흙은 더 빨리 마를 수 있어요. 겉모습만으로 pH를 알 수 없어 측정이 필요해요.']],
    gate:'훼손된 땅',use:'토양을 측정해 복원 후보 식생 구역을 찾을 수 있어요.',
    result:'토양 상태를 비교해 복원에 적합한 식물을 살필 구역을 찾았어요.',site:'숨은 식생 조사 구역',finding:'식물마다 잘 자라는 토양 조건이 달라요. 복원할 때는 pH뿐 아니라 물과 빛도 함께 살펴요.'},
  {id:'water',name:'수질 간이측정기',icon:'💧',theme:'river',npc:'river_h6',
    quest:'상류·중류·하류 3곳을 조사하고 수질 검사원에게 돌아오세요.',
    edu:'같은 강이라도 위치와 오염원에 따라 물의 상태가 달라질 수 있어요.',
    surveys:[['상류 조사 지점','상류의 물 상태를 기록했어요. 겉으로 맑아 보여도 여러 항목을 조사해야 해요.'],['중류 조사 지점','중류에서는 주변에서 흘러드는 물을 살펴보았어요. 주변 활동이 수질에 영향을 줄 수 있어요.'],['하류 조사 지점','하류에는 위쪽에서 흘러온 물이 모여요. 세 지점의 결과를 비교해 보세요.']],
    gate:'탁한 수로',use:'수질을 조사해 수변의 새로운 조사 통로를 찾을 수 있어요.',
    result:'측정 결과를 비교해 오염 지점을 피해 살펴볼 수변 조사 통로를 찾았어요.',site:'수변 관찰 통로',finding:'간이측정 결과만으로 물을 마셔도 되는지 판단할 수는 없어요. 물의 상태는 여러 항목을 함께 확인해요.'},
  {id:'sorbent',name:'유흡착재',icon:'🧽',theme:'ocean',npc:'ocean_h8',
    quest:'해변의 기름 오염 흔적 3곳을 조사하고 해변 청소부에게 돌아오세요.',
    edu:'물 위나 표면의 기름을 흡착해 기름 오염을 제거할 때 사용하는 재료예요.',
    surveys:[['모래 위 기름 흔적','모래 표면에 기름 흔적이 있어요. 맨손으로 만지지 않고 위치를 기록했어요.'],['바위의 기름 흔적','바위 틈에 기름이 남아 있어요. 틈새와 표면을 함께 살펴야 해요.'],['물가의 기름 흔적','물가에 얇은 기름막이 보여요. 더 퍼지기 전에 알리고 적절한 방제 도구를 준비해요.']],
    gate:'기름으로 막힌 해안 통로',use:'기름을 흡착해 해안 복원 구역으로 가는 통로를 열 수 있어요.',
    result:'유흡착재로 기름을 모으고 사용한 흡착재도 회수했어요. 해안 복원 구역으로 이어지는 통로가 열렸어요.',site:'해안 복원 조사 구역',finding:'기름을 흡착한 재료도 오염물이므로 따로 회수해 처리해요. 정화 뒤에도 생물이 돌아오는지 살펴요.'},
  {id:'generator',name:'수동 발전기',icon:'⚙️',theme:'city',npc:'city_s4',
    quest:'전원이 끊어진 장치 3곳을 조사하고 고블린 정비공에게 돌아오세요.',
    edu:'사람의 힘으로 손잡이를 회전시켜 전기를 만드는 장치예요.',
    surveys:[['멈춘 안내판','안내판에 전원이 없어요. 작은 장치도 작동하려면 에너지가 필요해요.'],['꺼진 환경센서','환경센서가 멈춰 기록이 끊겼어요. 전력 공급 방법을 찾아야 해요.'],['정전된 출입 장치','출입 장치에 전기가 공급되지 않아요. 필요한 전력과 연결 상태를 살폈어요.']],
    gate:'정전된 조사실 문',use:'일시적으로 전력을 공급해 조사 시설을 열 수 있어요.',
    result:'손잡이를 돌려 전기를 만들었어요. 출입 장치가 작동해 조사실 문을 열었어요.',site:'도시 환경 조사실',finding:'발전기는 에너지를 새로 만드는 것이 아니라 운동 에너지를 전기 에너지로 바꿔요.'},
  {id:'dust',name:'미세먼지 간이측정기',icon:'🌬️',theme:'air',npc:'air_h6',
    quest:'서로 다른 세 장소의 공기를 조사하고 미세먼지 연구원에게 돌아오세요.',
    edu:'장소와 주변 환경에 따른 미세먼지 농도 차이를 살피는 장비예요.',
    surveys:[['도로 주변 측정 지점','차가 지나는 곳의 공기를 기록했어요. 바람과 교통량에 따라 달라질 수 있어요.'],['공원 측정 지점','공원의 공기를 기록했어요. 다른 장소와 같은 방법으로 비교해요.'],['시설 주변 측정 지점','시설 주변 공기를 기록했어요. 한 번의 측정보다 여러 번 관찰하는 것이 좋아요.']],
    gate:'스모그 조사 구역',use:'오염도가 낮은 방향을 비교해 새 조사 경로를 찾을 수 있어요.',
    result:'세 장소의 측정 결과를 비교해 상대적으로 오염도가 낮은 조사 경로를 찾았어요.',site:'바람길 관찰 지점',finding:'공기 상태는 시간과 날씨에 따라 바뀌어요. 게임의 경로 발견이 실제 대기 안전 판정을 대신하지는 않아요.'},
  {id:'solar',name:'태양광 충전기',icon:'☀️',theme:'climate',npc:'climate_h6',
    quest:'햇빛 조건이 다른 3곳을 조사하고 충전하기 좋은 곳을 찾아 태양광 기사에게 돌아오세요.',
    edu:'태양광을 전기로 바꾸어 기기에 저장하거나 사용할 수 있게 해요.',
    surveys:[['그늘진 위치','그늘에서는 패널에 닿는 햇빛이 적어요. 충전 위치를 비교해 봐요.'],['부분 그늘 위치','일부만 햇빛을 받는 위치예요. 주변 물체가 만드는 그림자도 살펴요.'],['햇빛 드는 위치','패널이 햇빛을 충분히 받는 위치를 찾았어요. 햇빛의 양은 시간에 따라 달라져요.']],
    gate:'전력 없는 관측장비',use:'환경 관측장비를 충전해 새 조사 지점을 활성화해요.',
    result:'햇빛이 드는 곳에서 충전해 관측장비가 작동했어요. 새로운 관측 지점이 표시됐어요.',site:'재생에너지 관측 지점',finding:'태양광 발전량은 햇빛과 설치 조건에 따라 달라요. 저장 장치가 있으면 만들어 둔 전기를 나중에 쓸 수 있어요.'},
  {id:'filter',name:'휴대용 정수기',icon:'🚰',theme:'river',npc:'river_h9',
    quest:'정수장 기사의 설명을 떠올려 응집 → 침전 → 여과 → 소독 순서로 맞춰 보세요.',
    edu:'물속의 이물질을 줄이는 장치로, 제품과 처리 방식에 따라 제거할 수 있는 물질이 달라요.',
    surveys:[],order:['응집','침전','여과','소독'],
    gate:'오염된 샘 조사 지점',use:'샘 정화 활동을 마치고 특별 물 탐험 구역을 열 수 있어요.',
    result:'정수 과정을 확인하고 게임 속 샘을 정화했어요. 특별 물 탐험 구역이 열렸어요.',site:'샘물 생태 조사 구역',finding:'배운 네 단계는 정수장의 대표 과정이에요. 휴대용 정수기 하나가 모든 단계를 대신하거나 모든 물을 식수로 만드는 것은 아니에요.'},
  {id:'thermal',name:'열화상카메라',icon:'🌡️',theme:'climate',npc:'climate_h5',
    quest:'온도가 서로 다른 지점 3곳을 조사하고 빙하 연구원에게 돌아오세요.',
    edu:'물체에서 나오는 적외선으로 표면 온도의 차이를 눈으로 확인하는 장비예요.',
    surveys:[['차가운 표면','그늘에 있는 표면의 온도를 기록했어요. 다른 지점과 비교해 보세요.'],['햇빛 받은 표면','햇빛을 받은 표면의 온도를 기록했어요. 같은 재료도 주변 조건에 따라 달라요.'],['시설 외벽','시설 외벽의 온도 차이를 기록했어요. 온도 차이가 나는 원인을 살펴보세요.']],
    gate:'연구 시설 열 손실 지점',use:'열이 새는 지점을 찾아 숨은 점검 구역을 열 수 있어요.',
    result:'열화상으로 표면 온도 차이를 확인했어요. 열 손실을 살펴볼 점검 구역을 발견했어요.',site:'숨은 단열 점검 구역',finding:'온도 차이만 보고 원인을 단정하지 않아요. 창문 틈과 단열 상태를 함께 조사해 에너지 낭비를 줄여요.'}
];
var EcoTech={points:[],theme:null,active:null,order:[],message:''};
function ecoTechById(id){return ECO_TECH.find(t=>t.id===id);}
/* Tool art is presentation only; the quest and saved technology IDs stay intact. */
function ecoTechIcon(t){const src=`./assets/images/ecotech/${t.id}.png`;return `<img class="eco-tool-icon" src="${typeof ecoAssetUrl==='function'?ecoAssetUrl(src):src}" width="96" height="96" alt="">`;}
function ecoTechNormalize(s){
  const ids=ECO_TECH.map(t=>t.id);
  for(const key of ['ecoTechUnlocked','ecoTechSites','ecoTechFindings'])
    s[key]=Array.isArray(s[key])?[...new Set(s[key].filter(id=>ids.includes(id)))]:[];
  const old=s.ecoTechQuests&&typeof s.ecoTechQuests==='object'?s.ecoTechQuests:{};
  s.ecoTechQuests={};
  for(const t of ECO_TECH){const q=old[t.id];if(q&&q.accepted===true)s.ecoTechQuests[t.id]={accepted:true,
    surveyed:Array.isArray(q.surveyed)?[...new Set(q.surveyed.filter(i=>Number.isInteger(i)&&i>=0&&i<t.surveys.length))]:[],orderDone:q.orderDone===true};}
  s.ecoTechSites=s.ecoTechSites.filter(id=>s.ecoTechUnlocked.includes(id));
  s.ecoTechFindings=s.ecoTechFindings.filter(id=>s.ecoTechSites.includes(id));
}
function ecoTechHas(id){return (S.ecoTechUnlocked||[]).includes(id);}
function ecoTechQuestReady(t){const q=S.ecoTechQuests[t.id];return !!q&&(t.order?q.orderDone:q.surveyed.length===t.surveys.length);}
function ecoTechNPCButton(n){
  const t=ECO_TECH.find(t=>t.npc===n.id&&t.theme===S.themeId);
  return t&&npcDone(n.id)?`<button class="btn sec eco-tool-button" onclick="ecoTechOpenQuest('${t.id}')">${ecoTechIcon(t)}<span>생태기술 · ${t.name}${ecoTechHas(t.id)?' (획득)':ecoTechQuestReady(t)?' (완료 가능)':''}</span></button>`:'';
}
function ecoTechOpenQuest(id){
  const t=ecoTechById(id);if(!t||t.theme!==S.themeId||NQ.n?.id!==t.npc||!npcDone(t.npc))return;
  EcoTech.active=id;EcoTech.order=[];EcoTech.message='';openModal('ecoQuest');
}
function ecoTechQuestContext(){
  const t=ecoTechById(EcoTech.active);
  return S.modal==='ecoQuest'&&t&&t.theme===S.themeId&&NQ.n?.id===t.npc&&npcDone(t.npc)?t:null;
}
function ecoTechAccept(){
  const t=ecoTechQuestContext();if(!t||ecoTechHas(t.id)||S.ecoTechQuests[t.id])return;
  S.ecoTechQuests[t.id]={accepted:true,surveyed:[],orderDone:false};autosave();ecoTechPaint();drawModal();
}
function ecoTechChooseStep(step){
  const t=ecoTechQuestContext(),q=t&&S.ecoTechQuests[t.id];
  if(!t?.order||!q||q.orderDone||!t.order.includes(step)||EcoTech.order.includes(step))return;
  EcoTech.order.push(step);
  if(EcoTech.order.length===4){
    if(EcoTech.order.every((s,i)=>s===t.order[i])){q.orderDone=true;EcoTech.message='맞았어요! 응집으로 모으고, 침전으로 가라앉힌 뒤, 여과하고 소독해요.';autosave();}
    else{EcoTech.order=[];EcoTech.message='다시 생각해 보세요. 작은 입자를 모은 다음 가라앉히고, 걸러 낸 뒤 소독해요.';}
  }
  drawModal();
}
function ecoTechClaim(){
  const t=ecoTechQuestContext();if(!t||ecoTechHas(t.id)||!ecoTechQuestReady(t))return;
  S.ecoTechUnlocked.push(t.id);autosave();ecoTechPaint();drawModal();
}
function ecoTechWhere(p){return !p?'지도 위 조사 표지':`${p.y<H*.4?'북쪽':p.y>H*.67?'남쪽':'중앙'} ${p.x<W*.4?'서편':p.x>W*.67?'동편':'가운데'}`;}
function ecoTechSurveyList(t){
  const q=S.ecoTechQuests[t.id];
  return `<ul class="eco-sites">${t.surveys.map(([name],i)=>{
    const p=EcoTech.points.find(p=>p.tech===t.id&&p.kind==='survey'&&p.index===i);
    return `<li>${q?.surveyed.includes(i)?'✅':'◻'} ${name} · ${ecoTechWhere(p)}</li>`;
  }).join('')}</ul>`;
}
function mEcoQuest(){
  const t=ecoTechQuestContext();if(!t)return '<div class="note">NPC에게 다시 말을 걸어 주세요.</div><button class="btn" onclick="closeModal()">닫기</button>';
  const q=S.ecoTechQuests[t.id],owned=ecoTechHas(t.id);
  const next=owned?`✅ ${t.name}을 사용할 수 있어요.<p>${t.use}</p>사용 장소: ${t.gate}`
    :!q?t.quest:ecoTechQuestReady(t)?`조사를 마쳤어요. ${NQ.n.nm}에게 보고하세요.`
    :t.order?'정수 순서를 맞춰 보세요.':`${t.surveys.length}곳을 조사하세요. (${q.surveyed.length}/${t.surveys.length})`;
  return `<div class="mhead eco-tool-heading">${ecoTechIcon(t)}<span><small>생태기술</small>${t.name}</span></div>
    <div class="dialogue"><div class="who">${esc(NQ.n.nm)}</div>${NQ.n.talk}${owned?`<p>${t.edu}</p>`:''}</div>
    <div class="card eco-tech-card">${next}</div>
    ${!owned&&q?ecoTechSurveyList(t):''}
    ${!owned&&q&&t.order&&!q.orderDone?`<div class="card eco-tech-card">선택한 순서: ${EcoTech.order.join(' → ')||'아직 없어요'}</div><div class="row">${['여과','응집','소독','침전'].map(s=>`<button class="btn sec" ${EcoTech.order.includes(s)?'disabled':''} onclick="ecoTechChooseStep('${s}')">${s}</button>`).join('')}</div>`:''}
    ${EcoTech.message?`<div class="note" role="status">${EcoTech.message}</div>`:''}
    ${owned?'':!q?'<button class="btn" onclick="ecoTechAccept()">생태기술 퀘스트 받기</button>':ecoTechQuestReady(t)?'<button class="btn" onclick="ecoTechClaim()">조사 보고하고 기술 받기</button>':''}
    <button class="btn sec" onclick="S.modal='npc';drawModal()">기존 이야기로</button><button class="btn sec" onclick="closeModal()">탐험 계속하기</button>`;
}
function ecoTechBagHTML(){
  return '<div class="eco-section-title">생태기술 · 장착 없이 사용하는 탐험 도구</div>'+ECO_TECH.map(t=>{
    const got=ecoTechHas(t.id),q=S.ecoTechQuests[t.id],npc=NPC_DATA[t.theme].find(n=>n.id===t.npc);
    return `<details class="card eco-tech-card ${got?'acquired':'locked'}"><summary class="eco-tech-summary"><span class="eco-tool-slot">${ecoTechIcon(t)}</span><span class="eco-tech-copy"><strong>${t.name}</strong><small>${THEMES[t.theme].name} · 탐험 도구</small><span class="eco-tool-state ${got?'acquired':q?'researching':'locked'}">${got?'획득':q?'조사 중':'미획득'}${got&&S.ecoTechSites.includes(t.id)?' · 장소 개방':''}${S.ecoTechFindings.includes(t.id)?' · 조사 완료':''}</span></span><span class="gear-fold" aria-hidden="true">⌄</span></summary>
      <p>${t.edu}</p>${got?`<p>사용할 수 있는 기능: ${t.use}</p><p>사용 장소: ${t.gate}${S.ecoTechSites.includes(t.id)?' · 개방 완료':''}</p>`:`<p>${THEMES[t.theme].name} · ${npc.nm}의 기존 이야기를 마치고 새 퀘스트를 받아요.</p>${q?`<p>${t.quest}</p>${t.theme===S.themeId?ecoTechSurveyList(t):''}<p>${ecoTechQuestReady(t)?'조사 완료 · NPC에게 보고하세요':t.order?'정수 순서 맞추기':`${q.surveyed.length}/3곳 조사`}</p>`:''}`}</details>`;
  }).join('');
}
/* Keep the survey route; move each reward marker inside its optional room. */
function ecoTechBuildPoints(){
  ecoExplorationBuild();
  const candidates=[];
  for(let i=0;i<PATH.length;i++){
    const a=PATH[i],b=PATH[(i+1)%PATH.length];
    for(let j=1;j<32;j++){const x=Math.round(a.x+(b.x-a.x)*j/32),y=Math.round(a.y+(b.y-a.y)*j/32);
      if(x<60||y<120||x>W-60||y>H-70)continue;
      if((Wd.solid||[]).some(o=>dist(x,y,o.x,o.y)<o.r+30))continue;
      if(OBJS.some(o=>dist(x,y,o.x,o.y)<o.r+105))continue;
      if(npcSpots().some(n=>dist(x,y,n.x,n.y)<130))continue;
      candidates.push({x,y});}
  }
  const points=[],techs=ECO_TECH.filter(t=>t.theme===S.themeId);
  const anchors=[[.28,.25],[.55,.48],[.75,.77],[.3,.76],[.73,.3],[.48,.22],[.27,.52],[.52,.8],[.78,.55],[.55,.65]];
  let index=0;
  for(const t of techs){
    const specs=t.surveys.map((s,i)=>({kind:'survey',index:i,name:s[0]})).concat([{kind:'gate',name:t.gate},{kind:'discovery',name:t.site}]);
    for(const spec of specs){const a=anchors[index++%anchors.length];
      const free=candidates.filter(p=>points.every(q=>dist(p.x,p.y,q.x,q.y)>140));
      free.sort((p,q)=>dist(p.x,p.y,W*a[0],H*a[1])-dist(q.x,q.y,W*a[0],H*a[1]));
      const room=EcoTech.rooms.find(r=>r.tech===t.id);
      const pos=spec.kind==='gate'?room?.gate:spec.kind==='discovery'?room?.discovery:free[0];
      if(!pos)continue;
      points.push(Object.assign({key:t.id+'-'+spec.kind+(spec.index??''),tech:t.id},spec,pos));
    }
  }
  EcoTech.points=points;EcoTech.theme=S.themeId;ecoTechPaint();
}
function ecoTechVisible(p){return p.kind==='gate'||(p.kind==='discovery'?S.ecoTechSites.includes(p.tech):!!S.ecoTechQuests[p.tech]&&!ecoTechHas(p.tech));}
function ecoTechPaint(){
  const layer=$('ecoTechLayer');if(!layer||EcoTech.theme!==S.themeId)return;
  layer.innerHTML=ecoExplorationHTML()+EcoTech.points.filter(ecoTechVisible).map(p=>{
    const t=ecoTechById(p.tech),open=S.ecoTechSites.includes(p.tech);
    const done=p.kind==='survey'?S.ecoTechQuests[p.tech]?.surveyed.includes(p.index):p.kind==='discovery'?S.ecoTechFindings.includes(p.tech):open;
    return `<div class="eco-world-point eco-marker-${p.kind} ${done?'open':''}" id="eco-point-${p.key}" style="left:${p.x}px;top:${p.y}px;z-index:${Math.floor(p.y)}"><span class="eco-sign-shadow"></span><span class="eco-pin">${ecoTechIcon(t)}<span class="eco-sign-mark ${done?'done':''}" aria-hidden="true">${done?'✓':p.kind==='discovery'?'?':p.kind==='gate'?'↑':'•'}</span></span><span class="eco-point-name">${esc(p.name)}</span><span class="eco-sign-post"></span></div>`;
  }).join('');
}
function ecoTechNearby(){
  if(S.modal||S.scene!=='world'||EcoTech.theme!==S.themeId)return null;
  let best=null,d=85;
  for(const p of EcoTech.points){if(!ecoTechVisible(p)||p.kind==='discovery'&&!ecoExplorationInside(p.tech,Wd.px,Wd.py))continue;const n=dist(Wd.px,Wd.py,p.x,p.y);if(n<d){best=p;d=n;}}
  if(best&&(Nd.near&&dist(Wd.px,Wd.py,Nd.near.x,Nd.near.y)<d||Wd.near&&dist(Wd.px,Wd.py,Wd.near.x,Wd.near.y)<d))return null;
  return best;
}
function ecoTechNearUI(){
  const p=ecoTechNearby();
  if(EcoTech.nearKey!==p?.key){
    if(EcoTech.nearKey)$('eco-point-'+EcoTech.nearKey)?.classList.remove('near');
    if(p)$('eco-point-'+p.key)?.classList.add('near');EcoTech.nearKey=p?.key;
  }
  if(p){const b=$('actBtn');if(b){b.classList.add('on');b.textContent='조사 · '+p.name;}}
}
function ecoTechOpenPoint(){
  const p=ecoTechNearby();if(!p)return false;
  EcoTech.active=p.key;EcoTech.message='';openModal('ecoPoint');return true;
}
function ecoTechPointContext(){
  const p=EcoTech.points.find(p=>p.key===EcoTech.active);
  return S.modal==='ecoPoint'&&EcoTech.theme===S.themeId&&p&&ecoTechVisible(p)&&dist(Wd.px,Wd.py,p.x,p.y)<100&&(p.kind!=='discovery'||ecoExplorationInside(p.tech,Wd.px,Wd.py))?p:null;
}
function ecoTechPointAction(){
  const p=ecoTechPointContext();if(!p)return;
  const t=ecoTechById(p.tech);
  if(p.kind==='survey'){
    const q=S.ecoTechQuests[t.id];if(!q)return;
    if(!q.surveyed.includes(p.index))q.surveyed.push(p.index);
    EcoTech.message=t.surveys[p.index][1];
  }else if(p.kind==='gate'){
    if(!ecoTechHas(t.id))return;
    if(!S.ecoTechSites.includes(t.id)){S.ecoTechSites.push(t.id);EcoTech.openEffect=t.id;}
    ecoExplorationSync();
    EcoTech.message=''; // The opened-site card already shows the result.
  }else{
    if(!S.ecoTechSites.includes(t.id))return;
    if(!S.ecoTechFindings.includes(t.id))S.ecoTechFindings.push(t.id);
    EcoTech.message=t.finding;
  }
  autosave();ecoTechPaint();EcoTech.openEffect=null;drawModal();
}
function mEcoPoint(){
  const p=ecoTechPointContext();if(!p)return '<div class="note">조사 지점 가까이에서 다시 눌러 주세요.</div><button class="btn" onclick="closeModal()">닫기</button>';
  const t=ecoTechById(p.tech),open=S.ecoTechSites.includes(t.id),has=ecoTechHas(t.id);
  const discovered=EcoTech.points.find(q=>q.tech===t.id&&q.kind==='discovery');
  let body='';
  if(p.kind==='survey')body=`<p>${S.ecoTechQuests[t.id].surveyed.includes(p.index)?'✅ 조사 기록 완료':'이곳을 관찰하고 기록해 보세요.'}</p><button class="btn" onclick="ecoTechPointAction()">조사하고 기록하기</button>`;
  else if(p.kind==='gate'){
    const e=ECO_EXPLORATION[t.id],known=!!S.ecoTechQuests[t.id];
    body=!has?`<p>⛔ ${e.hint}</p>${known?`<p>${t.name}${J(t.name,'이','가')} 있으면 이곳을 조사하거나 해결할 수 있어요.</p>`:''}<p>${NPC_DATA[t.theme].find(n=>n.id===t.npc).nm}와 이야기해 보세요.</p>`:open?`<p>✅ ${e.result}</p><p>${t.site}의 입구가 열렸어요. 창을 닫고 ↑ 표시를 따라 안쪽으로 걸어가세요. 안쪽 조사 표지에서 조사할 수 있어요.</p>`:`<p>${e.hint}</p><p>${t.use}</p><button class="btn" onclick="ecoTechPointAction()">${t.name} 사용하기</button>`;
  }
  else body=`<p>생태기술로 발견한 ${t.site}에 도착했어요.</p><button class="btn" onclick="ecoTechPointAction()">새 탐험 지점 조사하기</button>`;
  return `<div class="mhead eco-tool-heading">${ecoTechIcon(t)}<span><small>현장 조사 · ${t.name}</small>${p.name}</span></div><div class="card eco-tech-card">${body}</div>${EcoTech.message?`<div class="dialogue" role="status">${EcoTech.message}</div>`:''}<button class="btn sec" onclick="closeModal()">탐험 계속하기</button>`;
}
