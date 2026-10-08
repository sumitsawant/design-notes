'use strict';
(() => {
  const section=document.getElementById('flow');
  if(!section)return;
  const steps=[...section.querySelectorAll('[data-flow-step]')];
  const nodes=[...section.querySelectorAll('[data-flow-node]')];
  const edges=[...section.querySelectorAll('[data-flow-edge]')];
  const counter=document.getElementById('flow-counter');
  const label=document.getElementById('flow-active-label');
  const note=document.getElementById('flow-active-note');
  const states=[
    {nodes:['customer','api'],edges:['request'],label:'The customer sends an order.',note:'The request includes a stable request ID.'},
    {nodes:['api','database'],edges:['store'],label:'The API stores the operation.',note:'The request ID and payment key are saved together.'},
    {nodes:['api','payment'],edges:['charge'],label:'The API sends the payment key.',note:'The payment service uses the key to identify the charge.'},
    {nodes:['payment','api'],edges:['result'],label:'The charge succeeds. The API stops.',note:'The result is lost. The saved operation remains pending.',failure:true},
    {nodes:['customer','api','database'],edges:['request','lookup'],label:'The customer retries.',note:'The API reads the original payment key.'},
    {nodes:['api','payment','database'],edges:['charge','result','store'],label:'The API recovers the result.',note:'The same key returns the existing payment result.'}
  ];
  let active=-1,scheduled=false;
  function activate(index){
    if(index===active)return;active=index;const state=states[index];
    section.dataset.activeStep=String(index);
    counter.textContent=String(index+1).padStart(2,'0')+' / 06';
    label.textContent=state.label;note.textContent=state.note;
    steps.forEach((el,i)=>{el.classList.toggle('is-active',i===index);if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    nodes.forEach(el=>el.classList.toggle('is-active',state.nodes.includes(el.dataset.flowNode)));
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
  addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate,{passive:true});
  activate(0);requestUpdate();
})();
