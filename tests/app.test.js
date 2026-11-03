import test from 'node:test';
import assert from 'node:assert/strict';

// Doble DOM mínimo para probar eventos y estado sin dependencias.
class Element {
  constructor(dataset = {}) {
    this.dataset=dataset; this.value=''; this.textContent='';
    this.selectionStart=this.selectionEnd=0;
    this.children=[]; this.attributes={}; this.listeners={};
    this.classList={toggle(){}};
  }
  addEventListener(name, callback) { this.listeners[name]=callback; }
  fire(name, options={}) { this.listeners[name]?.({preventDefault(){}, ...options}); }
  setAttribute(name,value) { this.attributes[name]=value; }
  append(...elements) { this.children.push(...elements); }
  replaceChildren() { this.children=[]; }
  focus() {}
  setRangeText(text,start,end) {
    this.value=this.value.slice(0,start)+text+this.value.slice(end);
    this.selectionStart=this.selectionEnd=start+text.length;
  }
}
test('interfaz: edición, teclado, errores, Ans, modos e historial', async () => {
  const elements=Object.fromEntries(['expression','result','status','approx','deg','rad','history','empty-history','clear-history'].map(id=>[id,new Element()]));
  const buttons=[new Element({insert:'Ans'}),new Element({insert:'+'}),new Element({action:'delete'}),new Element({action:'clear'}),new Element({action:'calculate'})];
  const doc=new Element();
  doc.querySelector=selector=>elements[selector.slice(1)];
  doc.querySelectorAll=()=>buttons;
  doc.createElement=()=>new Element();
  globalThis.document=doc;
  try {
    await import('../src/app.js');
    const input=elements.expression;
    const calculate=expression=>{input.value=expression; input.fire('keydown',{key:'Enter'});};
    calculate('1/3');
    assert.equal(elements.result.textContent,'0,333');
    assert.equal(elements.approx.textContent,'≈');
    calculate('Ans*3');
    assert.equal(elements.result.textContent,'1');
    calculate('1/0');
    assert.equal(elements.result.textContent,'—');
    assert.equal(input.attributes['aria-invalid'],'true');
    elements.history.children[0].children[0].fire('click');
    assert.equal(input.value,'Ans*3');
    buttons[4].fire('click');
    assert.equal(elements.result.textContent,'1');
    elements.rad.fire('click'); calculate('sin(pi/2)');
    assert.equal(elements.result.textContent,'1');
    elements.deg.fire('click'); calculate('sin(30)');
    assert.equal(elements.result.textContent,'0,5');
    assert.equal(elements.deg.attributes['aria-pressed'],'true');
    input.value='123'; input.selectionStart=1; input.selectionEnd=2;
    buttons[1].fire('click'); assert.equal(input.value,'1+3');
    buttons[2].fire('click'); assert.equal(input.value,'13');
    doc.fire('keydown',{key:'Escape'});
    assert.equal(input.value,''); assert.equal(elements.result.textContent,'0');
    calculate('Ans*2'); assert.equal(elements.result.textContent,'1');
    for(let i=0;i<25;i++) calculate(String(i));
    assert.equal(elements.history.children.length,20);
    elements['clear-history'].fire('click');
    assert.equal(elements.history.children.length,0);
    assert.equal(elements['empty-history'].hidden,false);
  } finally { delete globalThis.document; }
});
