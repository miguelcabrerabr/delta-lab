(function(root){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(x,d=2)=>Number.isFinite(x)?x.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}):x===Infinity?'Ilimitado':x===-Infinity?'−Ilimitado':'—';
const money=x=>'R$ '+num(x);
const range=(a,b,n=81)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
const colors=['#216f59','#c16835','#477eaa','#9b6281'];
function chart(series,{xLabel='Preço do ativo (R$)',yLabel='P&L (R$)',title='Gráfico de cenários',height=280,zero=true,levels=[]}={}){
 const all=series.flatMap(s=>s.points).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));if(!all.length)return '<p>Sem pontos para exibir.</p>';
 const W=720,H=height,L=64,R=20,T=22,B=46;let xmin=Math.min(...all.map(p=>p[0])),xmax=Math.max(...all.map(p=>p[0])),ymin=Math.min(...all.map(p=>p[1]),...levels.map(l=>l.value)),ymax=Math.max(...all.map(p=>p[1]),...levels.map(l=>l.value));
 if(zero){ymin=Math.min(ymin,0);ymax=Math.max(ymax,0);}if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;const pad=(ymax-ymin)*.1;ymin-=pad;ymax+=pad;
 const X=x=>L+(x-xmin)/(xmax-xmin)*(W-L-R),Y=y=>H-B-(y-ymin)/(ymax-ymin)*(H-T-B),tick=x=>Math.abs(x)>=10000?num(x/1000,1)+'k':num(x,Math.abs(x)<2?2:0);
 let svg=`<svg class="chart" role="img" aria-label="${esc(title)}" viewBox="0 0 ${W} ${H}"><title>${esc(title)}</title><desc>${esc(series.map(s=>s.name).join(', '))}. ${esc(xLabel)}; ${esc(yLabel)}. Valores detalhados na tabela.</desc>`;
 for(let i=0;i<5;i++){const y=ymin+(ymax-ymin)*i/4;svg+=`<line x1="${L}" y1="${Y(y)}" x2="${W-R}" y2="${Y(y)}" stroke="#dbe2d8" stroke-dasharray="3 4"/><text x="${L-10}" y="${Y(y)+4}" text-anchor="end">${tick(y)}</text>`;}
 for(let i=0;i<6;i++){const x=xmin+(xmax-xmin)*i/5;svg+=`<text x="${X(x)}" y="${H-B+22}" text-anchor="middle">${tick(x)}</text>`;}
 if(ymin<=0&&ymax>=0)svg+=`<line x1="${L}" x2="${W-R}" y1="${Y(0)}" y2="${Y(0)}" stroke="#a7b5aa"/>`;
 for(const l of levels)svg+=`<line x1="${L}" x2="${W-R}" y1="${Y(l.value)}" y2="${Y(l.value)}" stroke="#ad3441" stroke-dasharray="6 4"/><text x="${W-R}" y="${Y(l.value)-7}" text-anchor="end">${esc(l.label)}</text>`;
 series.forEach((s,i)=>{svg+=`<path d="${s.points.filter(p=>p.every(Number.isFinite)).map((p,j)=>(j?'L':'M')+X(p[0]).toFixed(2)+' '+Y(p[1]).toFixed(2)).join(' ')}" stroke="${s.color||colors[i%4]}" stroke-width="2.7" fill="none" ${s.dash?'stroke-dasharray="6 4"':''}/>`;});
 svg+=`<text x="${L}" y="12">${esc(yLabel)}</text><text x="${(W+L-R)/2}" y="${H-4}" text-anchor="middle">${esc(xLabel)}</text></svg><div class="chart-legend">${series.map((s,i)=>`<span><i class="legend-line" style="background:${s.color||colors[i%4]}"></i>${esc(s.name)}</span>`).join('')}</div>`;
 return svg;
}
function chartTable(series,xName='Spot',every=10){const points=series[0]?.points||[];return `<details><summary>Consultar valores do gráfico</summary><div class="table-scroll"><table><caption class="sr-only">Dados numéricos do gráfico</caption><thead><tr><th>${esc(xName)}</th>${series.map(s=>`<th>${esc(s.name)}</th>`).join('')}</tr></thead><tbody>${points.filter((_,i)=>i%every===0||i===points.length-1).map(p=>{const i=points.indexOf(p);return `<tr><td>${num(p[0])}</td>${series.map(s=>`<td>${num(s.points[i]?.[1],4)}</td>`).join('')}</tr>`;}).join('')}</tbody></table></div></details>`;}
function field(name,label,value,{min,max,step='any',hint='',type='number',options}={}){return `<label class="field"><span>${esc(label)}</span>${options?`<select name="${name}">${options.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return `<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(l)}</option>`;}).join('')}</select>`:`<input name="${name}" type="${type}" value="${esc(value)}" ${min!==undefined?`min="${min}"`:''} ${max!==undefined?`max="${max}"`:''} step="${step}" required>`}${hint?`<small>${esc(hint)}</small>`:''}</label>`;}
const metric=(label,value,sub='')=>`<div class="metric"><span>${esc(label)}</span><strong>${esc(value)}</strong>${sub?`<span>${esc(sub)}</span>`:''}</div>`;
function download(name,content,type='application/json'){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function toast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),6000);}
root.UI={esc,num,money,range,chart,chartTable,field,metric,download,toast,colors};
})(window);
