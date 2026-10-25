import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {read} from './helpers/cloud-save-runtime.mjs';
function fixture(){
  class Element{
    constructor(tag){this.tagName=tag;this.children=[];this.textContent='';this.className='';this.classList={add:n=>this.className+=' '+n};}
    setAttribute(k,v){this[k]=v;}
    appendChild(n){n.parent=this;this.children.push(n);return n;}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}
  }
  const body=new Element('body'),events=new Map(),document={body,createElement:t=>new Element(t),getElementById:id=>body.children.find(n=>n.id===id)};
  const c={document,addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n),print(){}};c.window=c;
  vm.createContext(c);vm.runInContext(read('js/save-code-card.js'),c);return {c,body,events};
}
test('shared student/admin card includes only nickname, game, code and safety instructions as text',()=>{
  const {c}=fixture(),card=c.EcoSaveCodeCard.card('<img src=x onerror=bad>','K7M4P2');
  assert.equal(card.children.length,5);assert.equal(card.children[1].textContent,'<img src=x onerror=bad>');
  assert.equal(card.children[2].textContent,'K7M4P2');assert.equal(card.children[2].tagName,'strong');
  assert.ok(card.children[4].textContent.includes('선생님'));assert.ok(!card.children.some(n=>n.tagName==='img'));
  for(const code of ['EC-7K4P-2Q9M','ABCDEF','234567','K7M0P2'])assert.equal(c.EcoSaveCodeCard.card('TEST',code),null);
});
test('print uses one disposable card; afterprint and failed print remove secrets without changing original UI',()=>{
  const {c,body,events}=fixture(),ui=c.document.createElement('main');body.appendChild(ui);
  let calls=0;c.print=()=>{calls++;assert.equal(body.children.length,2);assert.equal(body.children[1].id,'ecoCodePrint');events.get('afterprint')();};
  assert.equal(c.EcoSaveCodeCard.print('TEST','K7M4P2'),true);assert.equal(calls,1);assert.equal(body.children.length,1);assert.equal(body.children[0],ui);
  c.print=()=>{throw Error('cancelled');};assert.equal(c.EcoSaveCodeCard.print('TEST','K7M4P2'),false);assert.equal(body.children.length,1);
  assert.equal(c.EcoSaveCodeCard.print('TEST','invalid'),false);
  const css=read('css/save-code-card.css');assert.match(css,/@media print/);assert.match(css,/body>\*:not\(#ecoCodePrint\)/);assert.match(css,/break-inside:avoid/);
});
