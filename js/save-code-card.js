/* One small, text-only personal card shared by the student and teacher screens. */
(function(root){
  'use strict';
  function valid(code){return /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(code||'')&&/[A-Z]/.test(code)&&/[2-9]/.test(code);}
  function card(name,code){
    if(!valid(code))return null;
    var el=document.createElement('section');el.className='eco-save-code-card';el.setAttribute('aria-label','개인 저장코드 카드');
    [['h3','Eco Chronicle · 환경 원정대'],['p',(String(name||'나의 캐릭터')).slice(0,40)],['strong',code],
      ['p','다른 기기에서 이 코드로 이어해요.'],['p','친구에게 알려주지 말고 안전하게 보관해요. 잃어버리면 선생님께 물어보세요.']].forEach(function(item){var n=document.createElement(item[0]);n.textContent=item[1];el.appendChild(n);});
    return el;
  }
  function print(name,code){
    var el=card(name,code);if(!el)return false;
    var old=document.getElementById('ecoCodePrint');if(old)old.remove();
    el.id='ecoCodePrint';el.classList.add('eco-code-print');document.body.appendChild(el);
    function clean(){el.remove();root.removeEventListener('afterprint',clean);}
    root.addEventListener('afterprint',clean,{once:true});
    try{root.print();return true;}catch(_){clean();return false;}
  }
  root.EcoSaveCodeCard=Object.freeze({card:card,print:print,valid:valid});
})(window);
