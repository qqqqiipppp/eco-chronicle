/* Optional rooms in the existing world. Only ecoTechSites opens an entrance. */
var ECO_EXPLORATION={
  soil:{kind:'soil',hint:'훼손된 토양의 상태를 몰라 샛길의 진입 위치를 정하기 어려워요. 흙의 상태를 조사할 방법이 필요해 보여요.',result:'토양 상태를 확인했어요. 복원 위치를 살펴볼 샛길을 표시했어요.'},
  water:{kind:'water',hint:'탁한 물가에는 조사 제한 표시가 있어요. 물의 상태를 비교해 조사할 경로를 정해야 해요.',result:'물의 상태를 비교했어요. 수변 관찰 통로의 조사 경로를 표시했어요.'},
  sorbent:{kind:'oil',hint:'기름막이 해안 샛길에 퍼져 있어 들어갈 수 없어요. 기름을 모아 회수할 도구가 필요해요.',result:'유흡착재로 기름을 모으고 사용한 흡착재도 회수했어요. 막혀 있던 해안 길이 열렸어요.'},
  generator:{kind:'door',hint:'환경 조사실의 전원이 끊겨 문이 열리지 않아요. 잠시 전기를 공급할 방법이 필요해요.',result:'손잡이를 돌려 전기를 공급했어요. 환경 조사실의 전원이 들어오고 문이 열렸어요.'},
  dust:{kind:'wind',hint:'스모그 때문에 조사 방향을 정하기 어려워요. 여러 방향의 공기 상태를 비교할 방법이 필요해요.',result:'공기 상태를 측정했어요. 상대적으로 미세먼지가 적은 바람길을 표시했어요.'},
  solar:{kind:'power',hint:'관측장비에 전원이 없어 출입 장치가 작동하지 않아요. 주변 햇빛을 활용할 방법이 필요해요.',result:'햇빛으로 만든 전기를 공급했어요. 관측장비와 출입 장치가 작동하기 시작했어요.'},
  filter:{kind:'spring',hint:'오염된 샘에는 조사 제한 표시가 있어요. 조사에 필요한 소량의 물을 처리할 도구가 필요해요.',result:'조사에 필요한 만큼의 물을 처리했어요. 게임 속 샘 주변 조사 구역의 출입을 허용했어요.'},
  thermal:{kind:'inspection',hint:'시설의 점검 출입구 위치를 찾기 어려워요. 표면 온도의 차이를 살펴볼 방법이 필요해요.',result:'표면 온도가 다른 점검부를 발견했어요. 기존 점검문을 열어 안쪽 통로를 이용할 수 있어요.'}
};

function ecoRoomContains(r,x,y,pad=0){return x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad;}
function ecoRoomDistance(r,x,y){return Math.hypot(Math.max(r.x-x,0,x-r.x-r.w),Math.max(r.y-y,0,y-r.y-r.h));}
function ecoExplorationFutureObject(){
  const existing=OBJS.find(o=>o.type==='shadow');if(existing)return existing;
  const farm=OBJS.find(o=>o.type==='farm'),tower=OBJS.find(o=>o.type==='tower');
  if(!farm||!tower)return null;
  return Object.assign({r:70},freeSpot(OBJS,W,H,[Object.assign({},farm,{r:170}),Object.assign({},tower,{r:170})]));
}
function ecoRoomPathClear(r){
  // Test the entire protected route, including its 66px visible width.
  for(const p of EcoTech.routeSamples||[]){
    const dx=Math.max(r.x-p.x,0,p.x-r.x-r.w),dy=Math.max(r.y-p.y,0,p.y-r.y-r.h);
    if(dx*dx+dy*dy<75*75)return false;
  }
  return true;
}
function ecoExplorationBuild(){
  const started=performance.now();EcoTech.routeSamples=[];
  for(let i=1;i<PATH.length;i++){
    const a=PATH[i-1],b=PATH[i],n=Math.ceil(dist(a.x,a.y,b.x,b.y)/20);
    for(let j=0;j<=n;j++)EcoTech.routeSamples.push({x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n});
  }
  const rooms=[],npcs=npcSpots(),props=Wd.solid||[],scenery=Wd.ecoScenery||[];
  const reserved=ecoExplorationFutureObject(),objects=reserved?OBJS.concat(reserved):OBJS;
  const techs=ECO_TECH.filter(t=>t.theme===S.themeId);
  const anchors={soil:[.1,.32],water:[.9,.54],sorbent:[.9,.57],generator:[.48,.13],dust:[.9,.48],solar:[.9,.48],filter:[.35,.85],thermal:[.3,.82]};
  for(const t of techs){
    const a=anchors[t.id];let candidates=[];
    // Dense facilities use a smaller pocket rather than moving existing solids.
    for(const [w,h] of [[240,220],[200,190],[180,180]]){
    for(let y=160;y<H-h-80;y+=40)for(let x=70;x<W-w-70;x+=40){
      const r={tech:t.id,x,y,w,h};
      // Leave both a walking margin around the pocket and a clear southern approach.
      const approach={x:x+w/2-60,y:y+h,w:120,h:80};
      if(ecoRoomDistance(r,SPAWN.x,SPAWN.y)<160||!ecoRoomPathClear(r))continue;
      if(objects.some(o=>ecoRoomDistance(r,o.x,o.y)<o.r+100))continue;
      if(npcs.some(n=>ecoRoomDistance(r,n.hx??n.x,n.hy??n.y)<180))continue;
      if(rooms.some(q=>ecoRoomDistance(r,q.x+q.w/2,q.y+q.h/2)<240))continue;
      if(props.some(p=>ecoRoomDistance(r,p.x,p.y)<(p.r||30)+18||ecoRoomDistance(approach,p.x,p.y)<(p.r||30)+12))continue;
      const viewApproach={x:x+w/2-50,y:y+h,w:100,h:170};
      r.decor=scenery.filter(p=>ecoRoomDistance(r,p.x,p.y)<p.r+18||ecoRoomDistance(viewApproach,p.x,p.y)<p.r+18);
      candidates.push(r);
    }
    if(candidates.length)break;
    }
    candidates.sort((p,q)=>p.decor.length*400+dist(p.x+p.w/2,p.y+p.h/2,W*a[0],H*a[1])-q.decor.length*400-dist(q.x+q.w/2,q.y+q.h/2,W*a[0],H*a[1]));
    const r=candidates[0];if(!r){console.warn('[EcoTech] no clear side pocket:',t.id);continue;}
    r.gate={x:r.x+r.w/2,y:r.y+r.h+22};r.discovery={x:r.x+Math.round(r.w*.68),y:r.y+Math.round(r.h*.5)};
    rooms.push(r);
  }
  // Clear only non-colliding decorative sprites within these small pockets.
  // The original collision objects, NPCs and main route are never removed.
  for(const p of scenery){const el=$(p.id);if(el)el.style.visibility=rooms.some(r=>r.decor.includes(p))?'hidden':'';}
  EcoTech.rooms=rooms;ecoExplorationSync();EcoTech.buildMs=performance.now()-started;
}
function ecoExplorationSync(){
  // Numeric rectangles are cached on entry/use. Nothing is searched in the DOM here.
  EcoTech.barriers=[];
  for(const r of EcoTech.rooms||[]){
    r.open=S.ecoTechSites.includes(r.tech);
    const add=(x,y,w,h)=>EcoTech.barriers.push({x,y,w,h});
    if(!r.open){add(r.x-6,r.y-6,r.w+12,r.h+12);continue;}
    add(r.x-6,r.y-6,r.w+12,20);add(r.x-6,r.y,20,r.h+6);add(r.x+r.w-14,r.y,20,r.h+6);
    const side=r.w*.3;add(r.x,r.y+r.h-14,side,20);add(r.x+r.w-side,r.y+r.h-14,side,20);
  }
}
function ecoExplorationHit(x,y,fromX,fromY){
  if(EcoTech.theme!==S.themeId)return false;
  for(const r of EcoTech.barriers||[]){
    // A pre-existing position inside a new wall can always escape it.
    if(ecoRoomContains(r,x,y)&&!ecoRoomContains(r,fromX,fromY))return true;
  }
  return false;
}
function ecoExplorationInside(id,x,y){
  const r=(EcoTech.rooms||[]).find(r=>r.tech===id);
  return !!r&&r.open&&ecoRoomContains({x:r.x+14,y:r.y+14,w:r.w-28,h:r.h-28},x,y);
}
function ecoExplorationArt(r){
  // These two painted states share a footprint; they never decide collision.
  const path='./assets/images/ecotech/areas/'+r.tech;
  const artUrl=src=>typeof ecoAssetUrl==='function'?ecoAssetUrl(src):src;
  return `<img class="eco-room-art" src="${artUrl(path+'-'+(r.open?'open':'locked')+'.png')}" alt="" aria-hidden="true" draggable="false" decoding="async">${r.open?'':`<img hidden src="${artUrl(path+'-open.png')}" alt="" aria-hidden="true" decoding="async">`}`;
}
function ecoExplorationHTML(){
  return (EcoTech.rooms||[]).map(r=>{
    const t=ecoTechById(r.tech);
    return `<div class="eco-exploration ${r.open?'is-open':'is-locked'}${EcoTech.openEffect===r.tech?' is-just-open':''}" id="eco-room-${r.tech}" data-open="${r.open}" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"><div class="eco-room-title">${esc(t.site)}</div>${ecoExplorationArt(r)}<span class="eco-room-status">${r.open?'↑ 진입 가능':'조사 제한'}</span></div>`;
  }).join('');
}
