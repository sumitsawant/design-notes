'use strict';
(() => {
  const section=document.getElementById('flow');
  if(!section || typeof flows === 'undefined')return;
  const visual=section.querySelector('.flow-visual');
  const stepList=section.querySelector('.flow-steps');
  const counter=document.getElementById('flow-counter');
  const label=document.getElementById('flow-active-label');
  const note=document.getElementById('flow-active-note');
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let flow,steps=[],nodes=[],edges=[...section.querySelectorAll('[data-flow-edge]')],active=-1,scheduled=false,current='';
  const slots=['ENTRY','CONTROL','EFFECT','MEMORY'];
  function render(key){
    if(key===current)return;
    flow=flows[key];current=key;active=-1;
    document.getElementById('flow-heading').innerHTML=escapeHTML(flow.title[0])+'<br><em>'+escapeHTML(flow.title[1])+'</em>';
    document.getElementById('flow-intro').textContent=flow.intro;
    section.querySelectorAll('[data-flow-choice]').forEach(link=>{
      if(link.dataset.flowChoice===key)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    visual.querySelectorAll('.flow-component').forEach(el=>el.remove());
    visual.insertAdjacentHTML('beforeend',flow.nodes.map(([name,description],i)=>`<div class="flow-component" data-flow-slot="${i}"><span class="component-index">${String(i+1).padStart(2,'0')} / ${slots[i]}</span><strong>${escapeHTML(name)}</strong><small>${escapeHTML(description)}</small></div>`).join(''));
    nodes=[...visual.querySelectorAll('[data-flow-slot]')];
    stepList.innerHTML=flow.steps.map((step,i)=>`<li class="flow-step" data-flow-step="${i}"><span class="flow-step-number">${String(i+1).padStart(2,'0')} / ${escapeHTML(step.tag)}</span><h3>${escapeHTML(step.title)}</h3><p>${escapeHTML(step.body)}</p>${step.caveat?`<p class="flow-caveat">${escapeHTML(step.caveat)}</p>`:''}${i===flow.steps.length-1?`<a href="#${key}" class="flow-deep-link">Read the full design and tradeoffs ↗</a>`:''}</li>`).join('');
    steps=[...stepList.querySelectorAll('[data-flow-step]')];
    activate(0);requestUpdate();
  }
  function activate(index){
    if(index===active)return;active=index;const state=flow.steps[index];
    section.dataset.activeStep=String(index);
    counter.textContent=String(index+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0');
    label.textContent=state.label;note.textContent=state.note;
    steps.forEach((el,i)=>{el.classList.toggle('is-active',i===index);if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    nodes.forEach((el,i)=>el.classList.toggle('is-active',state.nodes.includes(i)));
    edges.forEach(el=>el.classList.toggle('is-active',state.edges.includes(el.dataset.flowEdge)));
    section.classList.toggle('is-failure',!!state.failure);
  }
  function update(){
    scheduled=false;
    if(document.body.classList.contains('reading'))return;
    const bounds=section.getBoundingClientRect();
    if(bounds.bottom<0||bounds.top>innerHeight)return;
    const focus=innerHeight*0.53;
    let closest=0,distance=Infinity;
    steps.forEach((el,i)=>{const r=el.getBoundingClientRect();const d=Math.abs((r.top+r.bottom)/2-focus);if(d<distance){distance=d;closest=i;}});
    activate(closest);
  }
  function requestUpdate(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
  function routeFlow(){
    const hash=location.hash.slice(1);
    if(hash==='flow'||hash.startsWith('flow-'))render(Object.hasOwn(flows,hash.slice(5))?hash.slice(5):'payment');
  }
  addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate,{passive:true});
  addEventListener('hashchange',routeFlow);
  render('payment');routeFlow();
})();
