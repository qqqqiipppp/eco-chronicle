/* R33 — causal reading, compare conditions, formative feedback and saved reflection. */
function learnEscape(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function lessonBook(){
  if(!S.learning||S.learning.version!==1)S.learning={version:1,regions:{}};
  const id=CUR.id;
  if(!S.learning.regions[id])S.learning.regions[id]={answers:{},cases:{},notes:{},page:0};
  return S.learning.regions[id];
}
function lessonSolved(){const b=lessonBook();return LEARNING[CUR.id].filter(p=>b.answers[p.id]===p.check.a).length;}
function lessonReady(){return lessonSolved()===LEARNING[CUR.id].length;}
function learningRedraw(keep,focus){
  const el=document.querySelector('#modalHost .sheet'),top=el?el.scrollTop:0;
  drawModal();const next=document.querySelector('#modalHost .sheet');if(next)next.scrollTop=keep?top:0;
  const target=focus&&document.getElementById(focus);if(target)target.focus({preventScroll:true});
}
function lessonGoto(n){lessonPage=Math.max(0,Math.min(LEARNING[CUR.id].length-1,Number(n)||0));lessonBook().page=lessonPage;autosave();learningRedraw(false,'learnTitle');}
function lessonCase(n){if(n!==0&&n!==1)return;const p=LEARNING[CUR.id][lessonPage];lessonBook().cases[p.id]=n;autosave();learningRedraw(true,'learnCase'+n);}
function lessonAnswer(n){const p=LEARNING[CUR.id][lessonPage];if(!Number.isInteger(n)||n<0||n>=p.check.o.length)return;lessonBook().answers[p.id]=n;autosave();learningRedraw(true,'learnAnswer'+n);}
function lessonNote(v){const p=LEARNING[CUR.id][lessonPage];lessonBook().notes[p.id]=String(v).slice(0,280);autosave();}
function lessonNextUnsolved(){const b=lessonBook(),pages=LEARNING[CUR.id];lessonGoto(pages.findIndex(p=>b.answers[p.id]!==p.check.a));}
function mInquiryLesson(){
  const pages=LEARNING[CUR.id],b=lessonBook();lessonPage=Math.max(0,Math.min(pages.length-1,lessonPage));
  const p=pages[lessonPage],choice=b.cases[p.id]===1?1:0,cs=p.cases[choice],answer=b.answers[p.id],solved=lessonSolved(),right=answer===p.check.a;
  const themeIcons={forest:'🌱',river:'💧',ocean:'🌊',city:'🏙️',air:'🌬️',climate:'🌍'};
  const terms=p.terms.map(t=>`<div><dt>${learnEscape(t[0])}</dt><dd>${learnEscape(t[1])}</dd></div>`).join('');
  const chain=cs.chain.map((n,i)=>`<li><span class="learn-step">${i+1} · ${['시작','그다음','이어서','결과'][i]}</span><strong>${learnEscape(n)}</strong>${i<3?'<span class="learn-arrow" aria-hidden="true">→</span>':''}</li>`).join('');
  const nav=pages.map((pg,i)=>`<button type="button" class="learn-tab ${i===lessonPage?'active':''}" aria-current="${i===lessonPage?'step':'false'}" onclick="lessonGoto(${i})" title="${learnEscape(pg.title)}">${i+1}${b.answers[pg.id]===pg.check.a?' ✓':''}<span>${learnEscape(pg.title)}</span></button>`).join('');
  const opts=p.check.o.map((o,i)=>`<button type="button" id="learnAnswer${i}" class="learn-option ${answer===i?(right?'correct':'retry'):''}" aria-pressed="${answer===i}" onclick="lessonAnswer(${i})"><span>${i+1}</span>${learnEscape(o)}</button>`).join('');
  const sources=p.sources.map(k=>`<a href="${learnEscape(LEARNING_SOURCES[k][1])}" target="_blank" rel="noopener noreferrer">${learnEscape(LEARNING_SOURCES[k][0])} ↗</a>`).join('');
  return `<article class="learn-book" data-theme="${CUR.id}">
    <header class="learn-header"><div><span class="learn-kicker">${themeIcons[CUR.id]} 배움의 샘 · ${learnEscape(CUR.name)} 탐구</span><h2 id="learnTitle" tabindex="-1">${learnEscape(p.title)}</h2></div><button class="learn-close" aria-label="학습을 저장하고 닫기" onclick="autosave();closeModal()">✕</button></header>
    <div class="learn-progress"><span>탐구 ${lessonPage+1} / ${pages.length}</span><span>이유 확인 ${solved} / ${pages.length}</span></div>
    <nav class="learn-tabs" aria-label="탐구 장면 선택">${nav}</nav>
    <p class="learn-hook">${learnEscape(p.hook)}</p>
    <section class="learn-explain" aria-label="원리 설명">${p.body.map((text,i)=>`<p><b>${i===0?'무슨 과정일까?':'왜 중요할까?'}</b>${learnEscape(text)}</p>`).join('')}</section>
    ${p.more?`<details class="learn-terms"><summary>더 알아보기 · 궁금하면 펼쳐요</summary>${p.more.map(t=>`<p>${learnEscape(t)}</p>`).join('')}</details>`:''}
    <details class="learn-terms"><summary>말뜻 알아보기 · ${p.terms.map(t=>learnEscape(t[0])).join(', ')}</summary><dl>${terms}</dl></details>
    <section class="learn-lab" aria-label="조건 비교 도식"><div class="learn-section-title">조건을 바꾸어 비교하기</div><p class="learn-hint">먼저 결과를 예상하고, 두 조건을 눌러 달라지는 과정을 비교해 봐.</p>
      <div class="learn-switch">${p.cases.map((v,i)=>`<button type="button" id="learnCase${i}" aria-pressed="${i===choice}" class="${i===choice?'selected':''}" onclick="lessonCase(${i})">${String.fromCharCode(65+i)} · ${learnEscape(v.label)}</button>`).join('')}</div>
      ${learningDiagram(p,choice)}<figure><figcaption>${learnEscape(cs.label)} — 원인에서 결과까지</figcaption><ol class="learn-chain">${chain}</ol></figure>
      <p class="learn-result" aria-live="polite">${learnEscape(cs.result)}</p><small>원리를 쉽게 보여 주는 그림이야. 실제 모습이나 크기와는 다를 수 있어.</small></section>
    <aside class="learn-caution"><b>헷갈리지 말자</b>${learnEscape(p.misconception)}</aside>
    <section class="learn-check"><h3>한 문제로 확인하기</h3><p>${learnEscape(p.check.q)}</p><div class="learn-options">${opts}</div>
      ${Number.isInteger(answer)?`<div class="learn-feedback ${right?'correct':'retry'}" role="status"><b>${right?'연결을 잘 찾았어.':'이 부분을 다시 살펴보자.'}</b>${learnEscape(p.check.feedback[answer])}${right?'':' 다시 선택해도 괜찮아. 점수는 깎이지 않아.'}</div>`:'<p class="learn-hint">정답뿐 아니라 선택한 이유에 대한 설명도 확인해 봐.</p>'}</section>
    <section class="learn-apply"><h3>우리 생활에 연결하기</h3><p>${learnEscape(p.action)}</p><label for="learnNote">내 말로 설명하기 <small>선택 · 자동 저장</small></label><textarea id="learnNote" rows="3" maxlength="280" placeholder="○○ 때문에 → 과정이 달라져서 → 결과가 …" onchange="lessonNote(this.value)">${learnEscape(b.notes[p.id]||'')}</textarea></section>
    <details class="learn-sources"><summary>근거 자료 · 더 알아보기</summary><p>설명은 공식 기관 자료를 참고해 쉽게 풀어 썼어. 원문은 영어이며, 링크를 열 때는 인터넷이 필요해.</p>${sources}</details>
    <footer class="learn-footer"><button class="btn sec" ${lessonPage===0?'disabled':''} onclick="lessonGoto(${lessonPage-1})">이전</button>
    ${lessonPage<pages.length-1?`<button class="btn" onclick="lessonGoto(${lessonPage+1})">다음 탐구 →</button>`:(!S.lessonDone&&!lessonReady()?`<button class="btn" onclick="lessonNextUnsolved()">남은 이유 확인하기 (${pages.length-solved})</button>`:`<button class="btn" onclick="finishLesson()">${S.lessonDone?'복습 마치기':'배움 마치고 보상 받기'}</button>`)}</footer>
    <p class="learn-hint">설명과 도식은 인터넷 없이 볼 수 있어. 중간에 나가도 확인 답과 메모는 게임 저장에 함께 남아.</p>
  </article>`;
}
