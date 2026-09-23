/* R34: deterministic scientific schematics, not measured forecasts. */
var LEARN_DIAGRAM_STEPS={};
var LEARN_DIAGRAMS={
 'forest-2':{title:'빗물이 흙을 옮기는 길',captions:[['식물이 적은 비탈에 비가 내려. 빗방울이 드러난 흙에 직접 닿아.','떨어져 나온 흙 알갱이가 땅 위로 흐르는 물에 실려 이동할 수 있어.','하천으로 들어온 흙은 물을 탁하게 만들 수 있어. 이 변화가 항상 같은 크기로 나타나는 것은 아니야.'],['잎과 낙엽층은 빗방울이 흙에 닿는 충격을 줄여.','뿌리가 흙을 붙잡고 물 일부가 틈으로 스며들어 흙의 이동을 줄여.','같은 비에서 하천으로 들어가는 흙을 줄이는 데 도움이 돼. 비의 세기·경사도 함께 영향을 줘.']]},
 'river-2':{title:'영양물질에서 산소 부족까지',captions:[['질소·인이 필요한 양을 넘어서 많이 들어오는 상황을 생각해 봐.','조류가 과도하게 늘었다가 죽으면, 이를 분해하는 미생물의 활동도 늘 수 있어.','분해 때 쓰이는 산소가 공급보다 많아지면 물속에 녹은 산소가 부족해질 수 있어.'],['비료·하수 관리로 과도한 영양물질 유입을 줄여.','조류가 너무 많이 자람를 억제하면, 뒤에 분해해야 할 양도 줄일 수 있어.','산소 부족 위험을 줄이는 데 도움이 돼. 즉시 모든 산소가 회복된다는 뜻은 아니야.']]},
 'ocean-3':{title:'산호와 조류가 주고받는 것',captions:[['산호 몸 안의 작은 조류는 양분을 제공해. 높은 수온이 오래 이어지면 이 관계가 스트레스를 받아.','스트레스를 받은 산호에서 조류가 빠져나갈 수 있어. 그림의 작은 초록 원이 조류야.','조류가 줄어든 산호는 하얗게 보이고 양분 공급도 줄어들어. 하얗다고 곧바로 죽은 것은 아니야.'],['수온 등 스트레스 조건이 나아지는 상황이야.','조류가 다시 돌아와 함께 살 가능성이 생겨. 회복 여부는 상태와 기간에 따라 달라.','공생과 양분 공급이 회복될 여지가 있어. 모든 산호가 반드시 회복되는 것은 아니야.']]},
 'city-4':{title:'도시가 열을 저장하고 내보내는 과정',captions:[['낮에 포장과 건물이 햇빛 에너지를 받아.','표면에 저장된 에너지는 해가 진 뒤에도 열로 나올 수 있어.','그늘·식생이 적은 환경에서는 주변보다 더 따뜻해질 수 있어.'],['나무가 햇빛 일부를 가려 그늘을 만들어.','식물의 물이 수증기로 나오는 증산은 주변 냉각에 도움을 줘.','그늘과 증산이 더위 부담을 줄일 수 있어. 실제 온도는 바람·표면·수분 등에도 달려 있어.']]},
 'air-2':{title:'배출·이동·섞임과 농도의 관계',captions:[['주변 배출원에서 오염물질이 공기로 나오는 상황이야.','공기의 이동과 섞임이 약하면 물질이 근처에 머무르기 쉬워.','한 지점의 농도가 높아질 수 있어. 배출량과 날씨를 함께 보아야 해.'],['A와 같은 배출을 생각하되, 공기가 더 잘 이동하고 섞이는 조건이야.','같은 물질이 더 넓은 범위로 이동해 퍼질 수 있어.','한 지점의 농도는 낮아질 수 있지만 물질이 모두 사라진 것은 아니야. 다른 곳으로의 이동도 살펴야 해.']]},
 'climate-1':{title:'들어오는 햇빛과 나가는 적외선',captions:[['노란 화살표는 지표로 들어오는 햇빛 에너지야.','따뜻해진 지표는 적외선을 내보내. 온실가스는 일부를 흡수하고 여러 방향으로 다시 내보내.','온실가스가 더 늘면 우주로의 열 손실이 줄어드는 방향으로 작용해. 에너지가 전혀 못 나가는 것은 아니야.'],['배출을 줄여도 햇빛은 계속 들어와. 이미 존재하는 온실가스도 바로 없어지지 않아.','연료 사용 등 새 배출을 줄여 온실가스가 더 늘어나는 것을 억제하려는 상황이야.','추가 온난화의 압력을 줄이는 데 기여해. 지구가 즉시 원래 온도로 돌아오는 모습을 뜻하지 않아.']]}
};
// R39 short captions: same causal steps as the lesson.
Object.keys(LEARN_DIAGRAMS).forEach(id=>{
 const p=LEARNING[id.split('-')[0]].find(p=>p.id===id);
 LEARN_DIAGRAMS[id].title=p.title;
 LEARN_DIAGRAMS[id].captions=p.cases.map(c=>[c.label+' — '+c.chain[0]+'.',c.chain[1]+'. '+c.chain[2]+'.',c.chain[3]+'. '+p.misconception]);
});
function lessonDiagramStep(n){if(!Number.isInteger(n)||n<0||n>2)return;const p=LEARNING[CUR.id][lessonPage];LEARN_DIAGRAM_STEPS[p.id]=n;learningRedraw(true,'learnVisualStep'+n);}
function learningDiagramSVG(id,choice,step){
 const A=choice===0,ink='#29473f';
 const text=(x,y,t,anchor='middle',fill=ink)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="16" font-family="system-ui, sans-serif">${learnEscape(t)}</text>`;
 const line=(x,y,X,Y,color='#357dae',width=4)=>`<path d="M${x} ${y} L${X} ${Y}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
 const arrow=(x,y,X,Y,color='#357dae')=>{const a=Math.atan2(Y-y,X-x),len=10;return line(x,y,X,Y,color)+`<path d="M${X-len*Math.cos(a-.5)} ${Y-len*Math.sin(a-.5)} L${X} ${Y} L${X-len*Math.cos(a+.5)} ${Y-len*Math.sin(a+.5)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;};
 const circle=(x,y,r,c,stroke='none')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${stroke}" stroke-width="2"/>`;
 const tree=(x,y)=>`<path d="M${x} ${y}v-54" stroke="#8f633e" stroke-width="9"/>${circle(x-15,y-59,22,'#639f61')}${circle(x+17,y-60,23,'#79b76d')}${circle(x,y-80,22,'#84b871')}`;
 const fish=(x,y)=>`<path d="M${x+18} ${y}l18 -12v24z" fill="#f6b95d" stroke="#885d2b"/> <ellipse cx="${x}" cy="${y}" rx="22" ry="12" fill="#ffd082" stroke="#986830" stroke-width="2"/>${circle(x-10,y-2,2.5,'#344d54')}`;
 const sun=(x,y)=>circle(x,y,19,'#f8c54d')+Array.from({length:8},(_,i)=>{let a=i*Math.PI/4;return line(x+25*Math.cos(a),y+25*Math.sin(a),x+32*Math.cos(a),y+32*Math.sin(a),'#eab740',3);}).join('');
 let art='';
 if(id==='forest-2'){
  art=`<path d="M0 112L300 168L310 220H0Z" fill="#c1a074"/><path d="M0 112L300 168" fill="none" stroke="${A?'#8b6846':'#689451'}" stroke-width="10"/><path d="M302 170H480V220H302Z" fill="${step===2&&A?'#9aafac':'#9ed8e3'}"/>`;
  if(!A)art+=tree(75,127)+tree(185,148)+`<path d="M75 127l-15 29m15-29 24 37m86-16-20 29m20-29 22 34" stroke="#8b6846" stroke-width="4" fill="none"/>`;
  else art+=`<path d="M73 113v-19h16v22m94 20v-19h16v22" stroke="#825d39" stroke-width="5" fill="#b18b5c"/>`;
  art+=[40,130,232].map(x=>arrow(x,18,x-12,67)).join('')+text(334,40,'같은 비');
  if(step>=1){art+=arrow(90,112,264,146,A?'#9b6238':'#4c8b73');if(A)for(let i=0;i<7;i++)art+=circle(110+i*24,114+i*5,4,'#926238');else art+=arrow(137,150,137,195);}
  if(step===2&&A){art+=arrow(278,151,337,186,'#9b6238');for(let i=0;i<5;i++)art+=circle(333+i*21,198+(i%2)*8,3,'#926238');}
  art+=text(95,244,A?'드러난 흙':'뿌리와 낙엽')+text(363,244,step===2?(A?'흙이 더 들어올 수 있음':'들어오는 흙을 줄임'):'하천');
 }else if(id==='river-2'){
  art=`<rect x="15" y="89" width="450" height="133" rx="20" fill="#acdce6"/><path d="M20 91Q90 75 155 91T300 91T460 91" stroke="#54a6bb" stroke-width="4" fill="none"/>`;
  art+=text(110,34,A?'비료가 너무 많이 들어옴':'비료가 들어오는 양 줄이기')+arrow(110,43,150,78,A?'#c48040':'#477f62');
  const count=step>=1?(A?11:4):3;for(let i=0;i<count;i++)art+=circle(50+i*34,104+(i%2)*7,8,'#5b9753');
  if(step>=1)art+=text(321,62,A?'조류가 너무 많이 자람':'너무 늘지 않게 도움');
  if(step===2){art+=arrow(192,123,206,166,'#74825d')+text(164,195,'분해');for(let i=0;i<(A?2:6);i++)art+=circle(288+(i%3)*24,148+Math.floor(i/3)*30,7,'#ecfcff','#4c90b1');art+=text(240,245,A?'죽은 조류 분해 → 산소 사용 → 산소 부족':'너무 많은 산소 사용을 줄임');}else {for(let i=0;i<6;i++)art+=circle(288+(i%3)*24,148+Math.floor(i/3)*30,7,'#ecfcff','#4c90b1');art+=text(240,245,'파란 테두리 원 = 물속에 녹은 산소');}
  art+=fish(403,182);
 }else if(id==='ocean-3'){
  art=`<rect x="14" y="13" width="452" height="211" rx="20" fill="#c7e8ed"/>`;
  const bleached=A&&step>=1||!A&&step===0,col=bleached?'#fffdf1':'#e9958e';
  art+=`<path d="M225 216V118m0 58-47-39v-27m47 39 45-32V80m-45 69-2-74m-43 64-28-11m116-6 26-12" stroke="#846571" stroke-width="23" stroke-linecap="round" fill="none"/><path d="M225 216V118m0 58-47-39v-27m47 39 45-32V80m-45 69-2-74m-43 64-28-11m116-6 26-12" stroke="${col}" stroke-width="17" stroke-linecap="round" fill="none"/>`;
  if(!bleached){[[221,117],[179,135],[268,100],[224,175]].forEach(v=>art+=circle(v[0],v[1],5,'#487652'));}
  if(step>=1){art+=A?arrow(287,130,365,82,'#638a58'):arrow(365,82,282,131,'#638a58');art+=circle(367,76,7,'#5d945a')+circle(395,95,6,'#5d945a');}
  art+=text(236,40,A?'높은 수온이 오래 지속':'스트레스 조건 완화')+text(80,198,'산호')+text(372,143,'조류')+text(240,247,step===2?(A?'양분 공급 감소 · 백화':'공생·양분 공급 회복 가능'):'조류와 함께 사는 산호');
 }else if(id==='city-4'){
  art=`<rect x="15" y="188" width="450" height="35" rx="8" fill="${A?'#939b9f':'#98b581'}"/>`;
  if(A){art+=`<rect x="63" y="106" width="89" height="82" fill="#8198ad"/><rect x="315" y="75" width="83" height="113" fill="#9bb0bc"/>`;for(let i=0;i<6;i++)art+=`<rect x="${75+i%3*24}" y="${120+Math.floor(i/3)*30}" width="13" height="17" fill="#dfe9cc"/>`;}
  else art+=tree(102,188)+tree(350,188)+`<ellipse cx="125" cy="195" rx="70" ry="12" fill="#587e5966"/>`;
  if(A&&step>=1)art+=circle(240,39,21,'#dee8ed')+circle(249,30,20,'#f5faf8');else art+=sun(240,43);
  if(step===0)art+=arrow(239,82,231,A?175:130,'#dcac38');
  else if(A)art+=arrow(187,185,187,99,'#c87449')+arrow(265,185,265,99,'#c87449');
  else art+=arrow(126,116,155,59,'#4f93ad')+arrow(338,116,309,59,'#4f93ad')+text(234,121,'증산');
  art+=text(240,247,step===2?(A?'저장한 열이 밤에도 나옴':'그늘·증산 → 냉각에 도움'):(A?'포장·건물이 많은 공간':'그늘·식생이 있는 공간'));
 }else if(id==='air-2'){
  art=`<rect x="30" y="150" width="81" height="70" fill="#a7adb2"/><rect x="67" y="98" width="24" height="61" fill="#8d969c"/><path d="M13 222H468" stroke="#96ac86" stroke-width="8"/>`;
  const dots=Array.from({length:12},(_,i)=>A||step===0?[92+(i%4)*16,74+Math.floor(i/4)*20]:[104+i*27,65+(i%3)*24]);
  for(const [x,y] of dots)art+=circle(x,y,5,'#796e86');
  if(step>=1)art+=A?text(296,88,'약한 이동·섞임'):arrow(113,30,434,30,'#4b97ad');
  art+=`<rect x="120" y="50" width="80" height="86" fill="none" stroke="#b2753d" stroke-width="2" stroke-dasharray="6 4"/>`+text(165,158,'관찰 구역');
  if(step===2&&!A)art+=arrow(405,121,459,121,'#796e86')+text(341,187,'다른 곳으로 이동 가능');
  art+=text(240,246,step===2?(A?'한곳에 많이 모일 수 있음':'퍼져도 모두 없어진 것은 아님'):'점의 전체 개수는 같게 표시한 모형');
 }else if(id==='climate-1'){
  art=`<path d="M0 190Q240 148 480 190V224H0Z" fill="#91b79a"/><rect x="19" y="64" width="443" height="65" rx="27" fill="#dbe3eb"/>`+text(393,112,'공기')+text(409,211,'땅');
  art+=sun(60,28)+arrow(78,59,166,172,'#d6a52b');
  for(let i=0;i<7;i++)art+=circle(110+i*38,88+(i%2)*14,6,'#bd8b7e');
  if(step>=1)art+=arrow(250,176,250,108,'#b56d51')+arrow(250,106,208,48,'#b56d51')+arrow(253,108,311,169,'#b56d51');
  if(step===2&&A)art+=circle(321,91,6,'#bd8b7e')+circle(349,85,6,'#bd8b7e')+text(376,150,'받고 다시 내보냄');
  if(step===2&&!A)art+=text(376,150,'새 배출 줄이기');
  art+=text(240,247,step===2?(A?'열이 덜 나감 → 더 따뜻해질 수 있음':'더워짐을 줄이는 데 도움 · 바로 식지는 않음'):'노랑 = 햇빛 / 붉은색 = 땅이 내보내는 열');
 }
 const caption=LEARN_DIAGRAMS[id].captions[choice][step];
 return `<svg class="learn-science-svg" viewBox="0 0 480 266" role="img" aria-label="${learnEscape(caption)}" xmlns="http://www.w3.org/2000/svg"><title>${learnEscape(LEARN_DIAGRAMS[id].title)}</title><desc>${learnEscape(caption)}</desc><rect width="480" height="266" rx="15" fill="#f5faf8"/>${art}</svg>`;
}
function learningDiagram(p,choice){
 const cfg=LEARN_DIAGRAMS[p.id];if(!cfg)return '';
 const step=LEARN_DIAGRAM_STEPS[p.id]||0;
 return `<section class="learn-visual" aria-label="단계별 학습 그림"><h3>${learnEscape(cfg.title)}</h3><div class="learn-visual-steps">${['조건 보기','변화 과정','결과 확인'].map((name,i)=>`<button type="button" id="learnVisualStep${i}" class="${i===step?'selected':''}" aria-pressed="${i===step}" onclick="lessonDiagramStep(${i})">${i+1}. ${name}</button>`).join('')}</div>${learningDiagramSVG(p.id,choice,step)}<p class="learn-visual-caption" role="status">${learnEscape(cfg.captions[choice][step])}</p><small>그림의 크기·점 개수·화살표 두께는 실제 측정값이 아니야. 원리를 비교하는 모형이야.</small></section>`;
}
