(function(root){
'use strict';
const finite=(x,n)=>{if(!Number.isFinite(x))throw Error(`${n}: informe um número finito.`);};
function validate(p){
 for(const k of ['S','K','T','r','q','sigma'])finite(p[k],k);
 if(p.S<0||p.K<=0||p.T<0||p.sigma<0)throw Error('Spot ≥ 0, strike > 0, prazo e volatilidade ≥ 0.');
 if(!['call','put'].includes(p.type))throw Error('Tipo de opção inválido.');
 if(p.T>30||Math.abs(p.r)>2||Math.abs(p.q)>2||p.sigma>5||p.S>1e9||p.K>1e9)throw Error('Entrada fora do domínio didático (30 anos, taxas ±200%, vol 500%).');
}
const pdf=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
function cdf(x){const a=Math.abs(x),t=1/(1+0.2316419*a);const n=1-pdf(a)*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x>=0?n:1-n;}
const intrinsic=(S,K,type)=>Math.max(type==='call'?S-K:K-S,0);
function bounds(p){validate(p);const s=p.S*Math.exp(-p.q*p.T),k=p.K*Math.exp(-p.r*p.T);return p.type==='call'?{lower:Math.max(s-k,0),upper:s}:{lower:Math.max(k-s,0),upper:k};}
function bsm(p){
 validate(p);const {S,K,T,r,q,sigma,type}=p,z=type==='call'?1:-1;
 if(T===0||sigma===0||S===0){
  const s=S*Math.exp(-q*T),k=K*Math.exp(-r*T),diff=z*(s-k),price=Math.max(diff,0);
  const delta=diff>0?z*Math.exp(-q*T):diff<0?0:z*0.5*Math.exp(-q*T);
  return {price,delta,gamma:0,theta:diff>0?z*(q*s-r*k):0,thetaDay:diff>0?z*(q*s-r*k)/365:0,vega:0,rho:diff>0?z*k*T/100:0,vanna:0,volga:0,charm:diff>0?q*delta:0,boundary:true};
 }
 const st=sigma*Math.sqrt(T),d1=(Math.log(S/K)+(r-q+sigma*sigma/2)*T)/st,d2=d1-st,eq=Math.exp(-q*T),er=Math.exp(-r*T);
 const price=z*(S*eq*cdf(z*d1)-K*er*cdf(z*d2)),delta=z*eq*cdf(z*d1),gamma=eq*pdf(d1)/(S*st);
 const theta=-S*eq*pdf(d1)*sigma/(2*Math.sqrt(T))-z*r*K*er*cdf(z*d2)+z*q*S*eq*cdf(z*d1);
 const vegaRaw=S*eq*pdf(d1)*Math.sqrt(T);
 const charm=q*delta-eq*pdf(d1)*(2*(r-q)*T-d2*st)/(2*T*st);
 return {price,delta,gamma,theta,thetaDay:theta/365,vega:vegaRaw/100,rho:z*K*T*er*cdf(z*d2)/100,vanna:-eq*pdf(d1)*d2/sigma,volga:vegaRaw*d1*d2/sigma,charm,d1,d2,boundary:false};
}
function binomial(p,steps=300,american=false){
 validate(p);if(!Number.isInteger(steps)||steps<1||steps>1500)throw Error('Árvore: use 1 a 1500 passos inteiros.');
 const {S,K,T,r,q,sigma,type}=p;if(T===0)return intrinsic(S,K,type);
 if(sigma===0||S===0){let best=0;for(let i=american?0:steps;i<=steps;i++){const t=T*i/steps;best=Math.max(best,Math.exp(-r*t)*intrinsic(S*Math.exp((r-q)*t),K,type));}return best;}
 const dt=T/steps,u=Math.exp(sigma*Math.sqrt(dt)),d=1/u,prob=(Math.exp((r-q)*dt)-d)/(u-d),disc=Math.exp(-r*dt);
 if(prob<0||prob>1)throw Error('Probabilidade CRR fora de [0,1]. Aumente os passos ou use BSM para vol muito baixa.');
 const v=new Float64Array(steps+1);for(let j=0;j<=steps;j++)v[j]=intrinsic(S*Math.exp((2*j-steps)*Math.log(u)),K,type);
 for(let i=steps-1;i>=0;i--)for(let j=0;j<=i;j++){v[j]=disc*(prob*v[j+1]+(1-prob)*v[j]);if(american)v[j]=Math.max(v[j],intrinsic(S*Math.exp((2*j-i)*Math.log(u)),K,type));}
 return v[0];
}
function implied(p,target){
 finite(target,'Prêmio');const b=bounds(p);if(p.T<=0||p.S<=0)throw Error('IV exige prazo e spot positivos.');
 if(target<b.lower-1e-8||target>=b.upper)throw Error(`Prêmio deve estar entre ${b.lower.toFixed(6)} (inclusive) e ${b.upper.toFixed(6)} (exclusive).`);
 if(Math.abs(target-b.lower)<1e-8)return 0;
 let lo=0,hi=5;if(bsm({...p,sigma:hi}).price<target)throw Error('IV superior ao limite didático de 500%.');
 for(let i=0;i<100;i++){const mid=(lo+hi)/2,v=bsm({...p,sigma:mid}).price;if(Math.abs(v-target)<1e-9)return mid;if(v<target)lo=mid;else hi=mid;}return (lo+hi)/2;
}
function legValidate(l){
 if(!['stock','call','put'].includes(l.type))throw Error('Perna inválida.');
 for(const k of ['qty','mult','premium','K','T'])finite(l[k],k);
 if(l.qty===0||l.mult<=0||l.premium<0||l.T<0||(l.type!=='stock'&&l.K<=0))throw Error('Quantidade ≠ 0; multiplicador > 0; prêmio e prazo ≥ 0; strike > 0.');
}
function strategy(legs,S,market,horizon=0){
 finite(S,'Spot');finite(horizon,'Horizonte');if(S<0||horizon<0)throw Error('Spot e horizonte não podem ser negativos.');
 if(!legs.length)throw Error('Adicione uma perna.');
 return legs.reduce((a,l)=>{legValidate(l);if(l.type!=='stock'&&horizon>l.T+1e-9)throw Error('Horizonte posterior a uma expiração: liquidação passada exige um caminho. Use até o primeiro vencimento.');
 const v=l.type==='stock'?S:bsm({...market,S,K:l.K,T:Math.max(0,l.T-horizon),type:l.type}).price;
 return a+l.qty*l.mult*(v-l.premium);},0);
}
function payoff(legs,S){return legs.reduce((a,l)=>{legValidate(l);return a+l.qty*l.mult*((l.type==='stock'?S:intrinsic(S,l.K,l.type))-l.premium);},0);}
function strategyLimits(legs){
 legs.forEach(legValidate);const times=[...new Set(legs.filter(l=>l.type!=='stock').map(l=>l.T))];if(times.length>1)return {mixed:true};
 const knots=[...new Set([0,...legs.filter(l=>l.type!=='stock').map(l=>l.K)])].sort((a,b)=>a-b),vals=knots.map(s=>payoff(legs,s));
 const slope=legs.reduce((a,l)=>a+(['stock','call'].includes(l.type)?l.qty*l.mult:0),0),roots=[],zeroIntervals=[];
 for(let i=0;i<knots.length-1;i++){if(Math.abs(vals[i])<1e-9)roots.push(knots[i]);if(Math.abs(vals[i])<1e-9&&Math.abs(vals[i+1])<1e-9)zeroIntervals.push([knots[i],knots[i+1]]);if(vals[i]*vals[i+1]<0)roots.push(knots[i]-vals[i]*(knots[i+1]-knots[i])/(vals[i+1]-vals[i]));}
 const last=knots.length-1;if(Math.abs(vals[last])<1e-9)roots.push(knots[last]);
 if(Math.abs(slope)>1e-10){const rt=knots[last]-vals[last]/slope;if(rt>knots[last])roots.push(rt);}else if(Math.abs(vals[last])<1e-9)zeroIntervals.push([knots[last],Infinity]);
 return {mixed:false,breakevens:[...new Set(roots)],zeroIntervals,max:slope>1e-10?Infinity:Math.max(...vals),min:slope< -1e-10?-Infinity:Math.min(...vals),slope,cost:legs.reduce((a,l)=>a+l.qty*l.mult*l.premium,0)};
}
function portfolioGreeks(legs,p){const out={delta:0,gamma:0,theta:0,thetaDay:0,vega:0,rho:0,vanna:0,volga:0,charm:0};for(const l of legs){legValidate(l);const g=l.type==='stock'?{delta:1}:bsm({...p,K:l.K,T:l.T,type:l.type});for(const k in out)out[k]+=(g[k]||0)*l.qty*l.mult;}return out;}
function stress(legs,p,ds,dvol,days){const h=days/365,base=strategy(legs,p.S,p,0),full=strategy(legs,p.S+ds,{...p,sigma:p.sigma+dvol},h)-base,g=portfolioGreeks(legs,p);return {full,approx:g.delta*ds+0.5*g.gamma*ds*ds+g.vega*dvol*100+g.theta*h};}
function rng(seed){let a=Number(seed)>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function normal(random){return Math.sqrt(-2*Math.log(Math.max(1e-15,random())))*Math.cos(2*Math.PI*random());}
function monteCarlo(p,n=20000,seed=42){validate(p);if(!Number.isInteger(n)||n<2||n>200000)throw Error('Use 2 a 200000 caminhos.');const random=rng(seed);let mean=0,m2=0;for(let i=1;i<=n;i++){const s=p.S*Math.exp((p.r-p.q-p.sigma*p.sigma/2)*p.T+p.sigma*Math.sqrt(p.T)*normal(random)),x=Math.exp(-p.r*p.T)*intrinsic(s,p.K,p.type),d=x-mean;mean+=d/i;m2+=d*(x-mean);}const se=Math.sqrt(m2/(n-1)/n);return {price:mean,se,low:mean-1.96*se,high:mean+1.96*se,n};}
function hedge(p,{seed=42,steps=90,every=5,costBps=5,realized=.25,drift=.05}={}){
 validate(p);if(p.T<=0||p.S<=0)throw Error('Hedge exige prazo e spot positivos.');
 if(!Number.isInteger(steps)||steps<2||steps>2000||!Number.isInteger(every)||every<1||every>steps)throw Error('Passos e frequência inválidos.');
 for(const [k,v] of Object.entries({costBps,realized,drift}))finite(v,k);if(costBps<0||realized<0)throw Error('Custos e vol realizada devem ser não negativos.');
 const random=rng(seed),dt=p.T/steps,premium=bsm(p).price;let S=p.S,shares=bsm(p).delta,cost=Math.abs(shares*S)*costBps/1e4,cash=premium-shares*S-cost,totalCost=cost,totalInterest=0,totalDiv=0;
 const rows=[{step:0,time:0,S,delta:shares,trade:shares,cash,interest:0,dividend:0,cost,option:premium,hedged:-cost,unhedged:0}];
 for(let i=1;i<=steps;i++){const interest=cash*Math.expm1(p.r*dt),dividend=shares*S*Math.expm1(p.q*dt);cash+=interest+dividend;totalInterest+=interest;totalDiv+=dividend;S*=Math.exp((drift-p.q-realized*realized/2)*dt+realized*Math.sqrt(dt)*normal(random));const left=Math.max(0,p.T-i*dt),g=bsm({...p,S,T:left});let trade=0;cost=0;
 if(i===steps||i%every===0){const target=i===steps?0:g.delta;trade=target-shares;cost=Math.abs(trade*S)*costBps/1e4;cash-=trade*S+cost;shares=target;totalCost+=cost;}
 rows.push({step:i,time:i*dt,S,delta:shares,trade,cash,interest,dividend,cost,option:g.price,hedged:cash+shares*S-g.price,unhedged:premium*Math.exp(p.r*i*dt)-g.price});}
 return {rows,premium,totalCost,totalInterest,totalDiv,hedged:rows.at(-1).hedged,unhedged:rows.at(-1).unhedged};
}
function barrierPath({S=100,terminal=100,steps=60,seed=42,amplitude=.15,bump=0}={}){const random=rng(seed),w=[0];for(let i=1;i<=steps;i++)w.push(w.at(-1)+normal(random)/Math.sqrt(steps));return w.map((x,i)=>{const t=i/steps;return S*Math.exp(Math.log(terminal/S)*t+amplitude*(x-t*w.at(-1))+bump*Math.sin(Math.PI*t));});}
function barrierResult(path,{K=100,barrier=120,direction='up',knock='out',type='call',rebate=0}={}){if(path.length<2||path.some(s=>!Number.isFinite(s)||s<0)||barrier<=0||K<=0||rebate<0)throw Error('Parâmetros de barreira inválidos.');const touchIndex=path.findIndex(s=>direction==='up'?s>=barrier:s<=barrier),touched=touchIndex>=0,active=knock==='in'?touched:!touched;return {touched,touchIndex,active,payoff:active?intrinsic(path.at(-1),K,type):rebate};}
const api={cdf,pdf,intrinsic,bounds,bsm,binomial,implied,strategy,payoff,strategyLimits,portfolioGreeks,stress,rng,normal,monteCarlo,hedge,barrierPath,barrierResult};
if(typeof module!=='undefined')module.exports=api;root.Finance=api;
})(typeof window==='undefined'?globalThis:window);
