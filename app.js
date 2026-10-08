'use strict';
const panel = document.getElementById('lesson-panel');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = items => '<ul>' + items.map(x => '<li>' + escapeHTML(x) + '</li>').join('') + '</ul>';
function transcript(sequence) {
  return '<ol>' + sequence.steps.map(([from, to, message]) => `<li><strong>${escapeHTML(sequence.actors[from])}${from === to ? '' : ' → ' + escapeHTML(sequence.actors[to])}:</strong> ${escapeHTML(message)}.</li>`).join('') + '</ol>';
}
function diagram(topic, kind, title, description) {
  return `<figure class="design-figure"><div class="diagram-scroll" role="region" tabindex="0" aria-label="${escapeHTML(title)}. Scroll horizontally on small screens."><img class="design-diagram" src="diagrams/${topic}-${kind}.svg" alt="${escapeHTML(description)}" width="900" loading="eager"></div><figcaption>${escapeHTML(title)} <a href="diagrams/${topic}-${kind}.svg" target="_blank" rel="noopener">Open full diagram ↗</a></figcaption></figure>`;
}
function render(topic, updateHash = false) {
  if (!Object.hasOwn(lessons, topic)) topic = 'cache';
  const l = lessons[topic];
  document.querySelectorAll('[data-topic]').forEach(b => {
    const selected = b.dataset.topic === topic;
    b.setAttribute('aria-selected', String(selected));
    b.tabIndex = selected ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', 'tab-' + topic);
  const architectureDescription = l.architecture.edges.map(([from,to,label]) => `${l.architecture.nodes[from][0]} to ${l.architecture.nodes[to][0]}: ${label}.`).join(' ');
  panel.innerHTML = `
    <div class="lesson-head"><div><p class="eyebrow">${escapeHTML(l.label)} · DESIGN GUIDE</p><h2>${escapeHTML(l.title)}</h2></div><p>${escapeHTML(l.intro)}</p></div>
    <div class="lesson-grid">
      <section class="lesson-box"><h3>01 / Problem</h3><p>${escapeHTML(l.problem)}</p><dl class="terms">${l.terms.map(([term,definition])=>`<dt>${escapeHTML(term)}</dt><dd>${escapeHTML(definition)}</dd>`).join('')}</dl></section>
      <section class="lesson-box"><h3>Requirements</h3>${list(l.requirements)}</section>
      <section class="lesson-box wide"><h3>02 / System diagram</h3><p>Read the labels on the arrows. Each arrow shows a request or a data transfer.</p>${diagram(topic,'system',l.name+' / System diagram',architectureDescription)}</section>
      <section class="lesson-box wide"><h3>03 / Request sequence</h3><p>Read from top to bottom. The numbered arrows show the order of operations.</p>${diagram(topic,'sequence',l.sequence.title,'Request sequence for '+l.name+'. The text version below lists each operation.')}<details class="transcript"><summary>Read the sequence as text</summary>${transcript(l.sequence)}</details></section>
      <section class="lesson-box wide"><h3>04 / Failures and recovery</h3><div class="scenario-controls" aria-label="Failure scenarios">${l.scenarios.map((s,i)=>`<button data-scenario="${i}" aria-pressed="${i===0}">${escapeHTML(s[0])}</button>`).join('')}</div><div class="scenario-result" aria-live="polite">${escapeHTML(l.scenarios[0][1])}</div><p class="recovery-label">Recovery example</p>${diagram(topic,'recovery',l.recovery.title,'Failure and recovery sequence for '+l.name+'. The text version below lists each operation.')}<p>${escapeHTML(l.recoveryNote)}</p><details class="transcript"><summary>Read the recovery as text</summary>${transcript(l.recovery)}</details></section>
      <section class="lesson-box wide"><h3>05 / Design choices</h3><div class="table-scroll" role="region" tabindex="0" aria-label="Design choices"><table class="choice-table"><caption>Compare the choices for ${escapeHTML(l.name.toLowerCase())}.</caption><thead><tr><th scope="col">Choice</th><th scope="col">Result</th><th scope="col">Cost or limit</th></tr></thead><tbody>${l.choices.map(row=>'<tr>'+row.map((v,i)=>i===0?`<th scope="row">${escapeHTML(v)}</th>`:`<td>${escapeHTML(v)}</td>`).join('')+'</tr>').join('')}</tbody></table></div></section>
      <section class="lesson-box wide"><h3>06 / Practice</h3><p>${escapeHTML(l.drill)}</p><details class="practice-answer"><summary>Read the example answer</summary><p class="answer">${escapeHTML(l.answer)}</p></details></section>
    </div><p class="sources">Technical references: ${l.sources.map(([name,url])=>`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(name)} ↗</a>`).join(' · ')}</p>`;
  panel.querySelectorAll('[data-scenario]').forEach(b => b.addEventListener('click', () => {
    panel.querySelectorAll('[data-scenario]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    panel.querySelector('.scenario-result').textContent = l.scenarios[Number(b.dataset.scenario)][1];
  }));
  if (updateHash) history.replaceState(null, '', '#' + topic);
}
document.querySelectorAll('[data-topic]').forEach(b => b.addEventListener('click', () => render(b.dataset.topic, true)));
document.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault(); render(a.dataset.open, true);
  document.getElementById('lesson').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  panel.focus({preventScroll:true});
}));
document.querySelector('.tabs').addEventListener('keydown', e => {
  if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
  e.preventDefault();
  const tabs = [...document.querySelectorAll('[data-topic]')];
  let i = tabs.indexOf(document.activeElement); if (i < 0) i = 0;
  i = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  render(tabs[i].dataset.topic, true); tabs[i].focus();
});
let printDetails = [];
window.addEventListener('beforeprint', () => {
  printDetails = [...panel.querySelectorAll('details')].map(el => [el,el.open]);
  printDetails.forEach(([el]) => { el.open = true; });
});
window.addEventListener('afterprint', () => printDetails.forEach(([el,wasOpen]) => { el.open = wasOpen; }));
document.getElementById('print').addEventListener('click', () => window.print());
window.addEventListener('hashchange', () => {
  const topic = location.hash.slice(1);
  if (Object.hasOwn(lessons, topic)) { render(topic); document.getElementById('lesson').scrollIntoView(); }
});
const initial = location.hash.slice(1);
render(initial);
if (Object.hasOwn(lessons, initial)) requestAnimationFrame(() => document.getElementById('lesson').scrollIntoView());
