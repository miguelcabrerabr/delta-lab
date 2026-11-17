(function(root){
'use strict';const KEY='delta-lab.progress.v1';
const empty=()=>({version:1,read:[],attempts:[],reviews:{},lastLesson:null});
function validate(s){if(!s||s.version!==1||!Array.isArray(s.read)||!s.read.every(x=>typeof x==='string')||!Array.isArray(s.attempts)||s.attempts.length>20000||!s.reviews||typeof s.reviews!=='object'||Array.isArray(s.reviews))throw Error('Backup inválido ou versão incompatível.');
 for(const a of s.attempts){if(!a||typeof a.id!=='string'||typeof a.lessonId!=='string'||!Number.isFinite(a.time)||!['choice','number','open'].includes(a.type)||!['boolean','object'].includes(typeof a.correct)||(typeof a.correct==='object'&&a.correct!==null))throw Error('Histórico de tentativas inválido.');}
 for(const [k,v] of Object.entries(s.reviews)){if(!v||!Number.isFinite(v.due)||!Number.isInteger(v.streak)||v.streak<0||k==='__proto__')throw Error('Revisões inválidas.');}
 if(s.lastLesson!==null&&typeof s.lastLesson!=='string')throw Error('Última aula inválida.');
 if(s.draft!=null){
  const d=s.draft;
  if(typeof d.key!=='string'||!/^quiz\/[a-z]+(?:\/[a-z0-9-]+)?$/.test(d.key)||!Number.isSafeInteger(d.seed)||!Array.isArray(d.ids)||d.ids.length>200||!d.ids.every(id=>typeof id==='string')||!d.answers||Array.isArray(d.answers)||typeof d.answers!=='object'||!Object.entries(d.answers).every(([k,v])=>d.ids.includes(k)&&typeof v==='string'&&v.length<=8000))throw Error('Avaliação em andamento inválida.');
 }
 return s;
}
function create(storage){let state=empty(),warning='';try{const raw=storage.getItem(KEY);if(raw)state=validate(JSON.parse(raw));}catch(e){warning='Não foi possível recuperar o progresso local. Exporte backups regularmente.';}
 function save(){try{storage.setItem(KEY,JSON.stringify(state));warning='';return true;}catch(e){warning='O navegador não permitiu salvar. Exporte um backup antes de fechar.';return false;}}
 return {get state(){return state;},get warning(){return warning;},read(id){if(!state.read.includes(id))state.read.push(id);state.lastLesson=id;save();},last(id){if(state.lastLesson!==id){state.lastLesson=id;save();}},draft(d){state.draft=d;save();},record(a,persist=true){state.attempts.push(a);if(a.correct!==null){const prev=state.reviews[a.id]||{streak:0},streak=a.correct?prev.streak+1:0;state.reviews[a.id]={streak,due:a.time+([1,3,7,14,30][Math.min(streak,4)])*86400000};}if(persist)save();},export(){return JSON.stringify(state,null,2);},import(raw){if(raw.length>8e6)throw Error('Backup muito grande.');const candidate=validate(JSON.parse(raw));state=JSON.parse(JSON.stringify(candidate));save();return state;},save};
}
function grade(q,value){if(q.type==='open')return null;if(value===undefined||value===null||String(value).trim()==='')return false;const n=Number(String(value).replace(',','.'));if(!Number.isFinite(n))return false;return q.type==='choice'?n===q.answer:Math.abs(n-q.answer)<=q.tolerance;}
function mastery(state,questions,lessonId){const qs=questions.filter(q=>q.lessonId===lessonId&&q.type!=='open');const latest=new Map();for(const a of state.attempts)if(a.lessonId===lessonId&&a.type!=='open')latest.set(a.id,a);const correct=qs.filter(q=>latest.get(q.id)?.correct).length;return {correct,total:qs.length,percent:qs.length?Math.round(100*correct/qs.length):0,demonstrated:qs.length>0&&correct/qs.length>=.8};}
function variant(q,seed){if(!q.generator)return {...q};const r=(()=>{let a=seed>>>0;return()=>{a=(1664525*a+1013904223)>>>0;return a/4294967296;};})(),S=80+5*Math.floor(r()*9),K=90+5*Math.floor(r()*5),premium=2+Math.floor(r()*7),qty=1+Math.floor(r()*5),T=.5,rate=.08;
 const o={...q,tolerance:.02,variantSeed:seed};
 if(q.generator==='callProfit')Object.assign(o,{prompt:`Uma call comprada tem strike ${K}, prêmio ${premium} por unidade e quantidade ${qty} (multiplicador 1). Spot final ${S}. Qual o P&L total, sem custos?`,answer:qty*(Math.max(S-K,0)-premium),explanation:`P&L = ${qty} × [max(${S} − ${K}, 0) − ${premium}] = ${(qty*(Math.max(S-K,0)-premium)).toFixed(2)}.`});
 if(q.generator==='putPayoff')Object.assign(o,{prompt:`Put comprada: strike ${K}, spot final ${S}, quantidade ${qty}, multiplicador 1. Qual o payoff total, antes do prêmio?`,answer:qty*Math.max(K-S,0),explanation:`Payoff = ${qty} × max(${K} − ${S}, 0).`});
 if(q.generator==='forward')Object.assign(o,{prompt:`Spot ${S}, taxa contínua 8% a.a., sem dividendos, prazo 0,5 ano. Qual o preço a termo justo?`,answer:S*Math.exp(rate*T),explanation:`F = ${S} × exp(0,08 × 0,5) = ${(S*Math.exp(rate*T)).toFixed(4)}.`});
 if(q.generator==='parity')Object.assign(o,{prompt:`Call europeia ${premium}, spot ${S}, strike ${K}, T=0,5 ano, taxa contínua 8% a.a., q=0. Pela paridade, qual P = C − S + K exp(−rT)?`,answer:premium-S+K*Math.exp(-rate*T),explanation:`P = ${premium} − ${S} + ${K} × exp(−0,04). Se resultar negativo, o preço dado da call viola limites de arbitragem; o valor algébrico evidencia a inconsistência.`});return o;
}
const api={KEY,empty,validate,create,grade,mastery,variant};if(typeof module!=='undefined')module.exports=api;root.Progress=api;
})(typeof window==='undefined'?globalThis:window);
