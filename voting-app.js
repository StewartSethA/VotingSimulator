
'use strict';
window.addEventListener('unhandledrejection', event => {
 const boot = document.getElementById('bootStatus');
 if (boot) { boot.hidden = false; boot.className='bootError'; boot.textContent = 'Simulator error: '+(event.reason?.message || String(event.reason)); }
});
(()=>{
const $=id=>document.getElementById(id);
const SOURCES={old:'§6.D.2.f.ii–iv',proposal:'B2026-10 §ii'};
const PRESETS=[
 {id:'swing',title:'Changed minds → different nominee',desc:'Five candidates start at 45 / 30 / 15 / 7 / 3. Some A and B delegates change their minds on ballot 2. The existing smallest-group interpretation keeps C eligible; the proposed maximal cutoff does not.',candidates:'A\nB\nC\nD\nE',groups:'25: A > B > C > D > E\n20: A > B > C > D > E | r2=C\n15: B > A > C > D > E\n15: B > A > C > D > E | r2=C\n15: C > A > B > D > E\n7: D > C > A > B > E\n3: E > C > A > B > D'},
 {id:'speed',title:'Same preference, different ballot count',desc:'The current smaller qualifying group removes D and E; the amendment also removes C. With unchanged voter preferences, both paths reach the same final nominee, but on different ballots.',candidates:'A\nB\nC\nD\nE',groups:'45: A > C > B > D > E\n30: B > A > C > D > E\n15: C > A > B > D > E\n7: D > C > A > B > E\n3: E > C > A > B > D'},
 {id:'collision',title:'Four candidates → §ii / §iii collision',desc:'The unchanged §iii advances the top two immediately. The proposed §ii, applied first, instead eliminates only D. This is an explicit instruction conflict, not a resolved legal rule.',candidates:'A\nB\nC\nD',groups:'40: A > B > C > D\n30: B > A > C > D\n20: C > A > B > D\n10: D > A > B > C'},
 {id:'tie',title:'Unresolved last-place tie',desc:'The two lowest candidates are tied. Equality blocks the strict cutoff and neither bylaw specifies a deterministic tie resolution in this subsection.',candidates:'A\nB\nC\nD\nE',groups:'80: A > B > C > D > E\n60: B > A > C > D > E\n30: C > A > B > D > E\n15: D > A > B > C > E\n15: E > A > B > C > D'},
 {id:'gap',title:'Current rule has no qualifying group',desc:'No two-or-more-candidate suffix qualifies under the existing conditional language. The model flags its assumed one-candidate fallback; the amendment explicitly adds that fallback.',candidates:'A\nB\nC\nD\nE',groups:'28: A > B > C > D > E\n25: B > A > C > D > E\n20: C > A > B > D > E\n16: D > A > B > C > E\n11: E > A > B > C > D'},
 {id:'equal',title:'Strict inequality: equality is not enough',desc:'B has 30 votes and C+D+E also have 30; C and D+E both have 15. Equality does not satisfy a “less than” cutoff.',candidates:'A\nB\nC\nD\nE',groups:'40: A > B > C > D > E\n30: B > A > C > D > E\n15: C > A > B > D > E\n10: D > A > B > C > E\n5: E > A > B > C > D'},
 {id:'exact60',title:'Exactly 60% ends the contest',desc:'A candidate with exactly 60% becomes the sole convention nominee immediately under both models.',candidates:'A\nB\nC',groups:'60: A > B > C\n25: B > A > C\n15: C > B > A'},
 {id:'primary',title:'Two finalists, neither reaches 60%',desc:'Even after a two-candidate ballot, a 55%–45% result yields two primary-election nominees in both models.',candidates:'A\nB',groups:'55: A > B\n45: B > A'},
 {id:'majorityCycle',title:'Aggregate Condorcet cycle · 3×60%+ approvals',desc:'34 delegates rank A>B>C, 33 rank B>C>A, 33 rank C>A>B. Individually consistent rankings form aggregate A>B, B>C, C>A. All three candidates receive ≥60% approval; there is no sole approval nominee.',candidates:'A\nB\nC',groups:'34: A > B > C | approve=A,B\n33: B > C > A | approve=B,C\n33: C > A > B | approve=C,A'},
 {id:'personalCycle',title:'Individual cyclic head-to-head preferences',desc:'Every group declares the nontransitive pairwise loop A>B, B>C, C>A, which cannot be represented by one static rank. Each multi-candidate ballot uses its current chosen ranking or explicit round change; with only two survivors, pair choices govern.',candidates:'A\nB\nC\nD',groups:'35: A > B > C > D | pair=A>B,B>C,C>A | approve=A,C\n30: B > C > A > D | pair=A>B,B>C,C>A | approve=A,B\n25: C > A > B > D | pair=A>B,B>C,C>A | approve=B,C\n10: D > A > B > C | pair=A>B,B>C,C>A | approve=D,C'},
 {id:'context',title:'Survivor-set reversal · context-dependent votes',desc:'A 40/30/20/10 first ballot gives a direct §ii/§iii conflict. The after rule retains A/B/C while the before rule retains A/B. The same 40-person group explicitly chooses C only when all A/B/C remain, demonstrating a change that cannot be predicted by its ranking.',candidates:'A\nB\nC\nD',groups:'40: A > B > C > D | field=A+B+C:C | approve=A,C\n30: B > A > C > D | approve=B,C\n20: C > A > B > D | approve=C\n10: D > C > A > B | approve=C,D'},
 {id:'approvalConsensus',title:'Low plurality / high approval (75%)',desc:'First-choice shares are 45/30/15/7/3, but C receives 75% approval because some A, B, D, E supporters also approve C. This is a direct distinction between first-choice votes and independent approvals.',candidates:'A\nB\nC\nD\nE',groups:'25: A > B > C > D > E | approve=A\n20: A > B > C > D > E | approve=A,C\n15: B > A > C > D > E | approve=B,C\n15: B > A > C > D > E | approve=B,C\n15: C > A > B > D > E | approve=C\n7: D > C > A > B > E | approve=D,C\n3: E > C > A > B > D | approve=E,C'},
 {id:'approvalNoThreshold',title:'No approval majority · no automatic nominee',desc:'Candidate approval shares are 40/35/25, none reaching 60%. The endorsement-style result has zero qualifiers; the nomination adapter would impose a distinct top-two-to-primary rule.',candidates:'A\nB\nC',groups:'40: A > B > C | approve=A\n35: B > C > A | approve=B\n25: C > A > B | approve=C'},
 {id:'blankApproval',title:'Blank approvals and threshold denominator',desc:'Exactly 60 of 100 delegates approve A while 40 cast blank approval ballots. The count is 60/100, not 60/60 and not 60 divided by the number of all marks.',candidates:'A\nB\nC',groups:'60: A > B > C | approve=A\n40: B > C > A | approve=none'}

];
let scenario=null,state=null,stepCount=0,timer=null,activePreset='approvalConsensus';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function flag(level,title,detail){return {level,title,detail};}
function canonicalPair(a,b,candidates){const ia=candidates.indexOf(a),ib=candidates.indexOf(b);return ia<ib?a+'\u0000'+b:b+'\u0000'+a;}
function parseScenario(candText,groupsText){
 const candidates=candText.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(candidates.length<2||candidates.length>20)throw Error('Provide 2–20 candidate names, one per line.');
 if(new Set(candidates.map(x=>x.toLowerCase())).size!==candidates.length)throw Error('Candidate names must be unique (case-insensitively).');
 const names=new Map(candidates.map(x=>[x.toLowerCase(),x]));
 const find=(input,line)=>{const c=names.get(input.trim().toLowerCase());if(!c)throw Error('Group line '+line+': unknown candidate '+JSON.stringify(input.trim())+'.');return c;};
 const groups=[];let total=0;
 for(const [i,raw] of groupsText.split(/\r?\n/).entries()){
   if(!raw.trim()||raw.trim().startsWith('#'))continue;
   const m=raw.match(/^\s*(\d+)\s*:\s*(.+)$/);if(!m)throw Error('Group line '+(i+1)+': expected COUNT: A > B > C.');
   const line=i+1,weight=Number(m[1]);if(!Number.isSafeInteger(weight)||weight<1||weight>1000000)throw Error('Group line '+line+': count must be an integer from 1 to 1,000,000.');
   const parts=m[2].split('|').map(x=>x.trim());
   const order=parts[0].split('>').map(x=>x.trim()).filter(Boolean).map(x=>find(x,line));
   if(!order.length||new Set(order).size!==order.length)throw Error('Group line '+line+': ranking must have at least one unique candidate.');
   const switches={},pair={},field={};let approval=null;let hasApprove=false;
   for(const clause of parts.slice(1)){
      if(!clause)throw Error('Group line '+line+': empty | clause.');
      const kv=clause.match(/^([a-z0-9]+)\s*=\s*(.*)$/i);if(!kv)throw Error('Group line '+line+': expected approve=, r2=, pair= or field=.');
      const key=kv[1].toLowerCase(),value=kv[2].trim();
      if(key==='approve'){
        if(hasApprove)throw Error('Group line '+line+': only one approve= section permitted.');hasApprove=true;
        approval=value.toLowerCase()==='none'?[]:value.split(',').map(x=>find(x,line));
        if(new Set(approval).size!==approval.length)throw Error('Group line '+line+': duplicate approval.');
        continue;
      }
      if(/^r\d+$/.test(key)){
        const items=clause.split(',');
        for(const item of items){
          const match=item.trim().match(/^r(\d+)\s*=\s*(.+)$/i);if(!match)throw Error('Group line '+line+': round override format r2=C,r3=B.');
          const round=Number(match[1]);if(round<2||round>20||switches[round])throw Error('Group line '+line+': invalid or duplicate round override.');
          switches[round]=find(match[2],line);
        }continue;
      }
      if(key==='pair'){
        for(const entry of value.split(',')){
          const edge=entry.trim().split('>').map(x=>x.trim());if(edge.length!==2||!edge[0]||!edge[1])throw Error('Group line '+line+': pair format A>B,B>C,C>A.');
          const a=find(edge[0],line),b=find(edge[1],line);if(a===b)throw Error('Group line '+line+': a candidate cannot beat itself.');
          const k=canonicalPair(a,b,candidates);if(pair[k])throw Error('Group line '+line+': duplicate or contradictory pair '+a+' / '+b+'.');pair[k]=a;
        }continue;
      }
      if(key==='field'){
        for(const entry of value.split(';')){
          const colon=entry.lastIndexOf(':');if(colon<0)throw Error('Group line '+line+': field format A+B+C:C;A+B:A.');
          const alive=entry.slice(0,colon).split('+').map(x=>find(x,line));const chosen=find(entry.slice(colon+1),line);
          if(new Set(alive).size!==alive.length||alive.length<2||!alive.includes(chosen))throw Error('Group line '+line+': field must list unique candidates and select one of them.');
          const k=alive.slice().sort((a,b)=>candidates.indexOf(a)-candidates.indexOf(b)).join('\u0000');
          if(field[k])throw Error('Group line '+line+': duplicate field condition.');field[k]=chosen;
        }continue;
      }
      throw Error('Group line '+line+': unknown clause '+JSON.stringify(key)+'.');
   }
   total+=weight;if(total>5000000)throw Error('Total delegates cannot exceed 5,000,000.');
   groups.push({weight,order,switches,pair,field,approval});
 }
 if(!groups.length)throw Error('Provide at least one delegate group.');
 return {candidates,groups,total};
}
function groupChoice(g,s,active,round,useRound=true){
 const switched=useRound?g.switches[round]:null;
 if(switched&&active.includes(switched))return {name:switched,reason:'round'};
 const key=active.slice().sort((a,b)=>s.candidates.indexOf(a)-s.candidates.indexOf(b)).join('\u0000');
 if(g.field[key]&&active.includes(g.field[key]))return {name:g.field[key],reason:'field'};
 if(active.length===2){const x=g.pair[canonicalPair(active[0],active[1],s.candidates)];if(x&&active.includes(x))return {name:x,reason:'pair'};}
 return {name:g.order.find(x=>active.includes(x))||null,reason:'ranking'};
}
function ballot(s,active,round){
 const votes=Object.fromEntries(active.map(x=>[x,0]));let cast=0,exhausted=0,switched=0,blockedSwitch=0,contextSwitched=0,pairSwitched=0;
 for(const g of s.groups){
   const selected=groupChoice(g,s,active,round),selection=selected.name;
   if(g.switches[round]&&!active.includes(g.switches[round]))blockedSwitch+=g.weight;
   if(selected.reason==='round')switched+=g.weight;
   if(selected.reason==='field')contextSwitched+=g.weight;
   if(selected.reason==='pair')pairSwitched+=g.weight;
   if(selection){votes[selection]+=g.weight;cast+=g.weight;}else exhausted+=g.weight;
 }
 return {votes,cast,exhausted,switched,blockedSwitch,contextSwitched,pairSwitched};
}
function approvalTally(s,opts){
 const votes=Object.fromEntries(s.candidates.map(x=>[x,0]));let inferred=0,blank=0;
 for(const g of s.groups){
   const marks=g.approval===null?g.order.slice(0,opts.approvalTopN):g.approval;
   if(g.approval===null)inferred+=g.weight;
   if(!marks.length)blank+=g.weight;
   for(const c of marks)votes[c]+=g.weight;
 }
 return {votes,cast:s.total,exhausted:0,switched:0,blockedSwitch:0,inferred,blank};
}
function pairwiseReport(s){
 const names=s.candidates,results={},adj=Object.fromEntries(names.map(n=>[n,[]]));let unspecified=0,individualCycles=0;
 for(const g of s.groups){
   if(g.order.length<names.length)unspecified+=g.weight;
   const local=Object.fromEntries(names.map(c=>[c,[]]));
   for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
     const a=names[i],b=names[j],choice=groupChoice(g,s,[a,b],1,false).name;
     if(choice===a)local[a].push(b);if(choice===b)local[b].push(a);
   }
   if(detectDirectedCycle(names,local))individualCycles+=g.weight;
 }
 for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
   const a=names[i],b=names[j];let av=0,bv=0;
   for(const g of s.groups){const c=groupChoice(g,s,[a,b],1,false).name;if(c===a)av+=g.weight;else if(c===b)bv+=g.weight;}
   results[canonicalPair(a,b,names)]={[a]:av,[b]:bv};
   if(av>bv)adj[a].push(b);else if(bv>av)adj[b].push(a);
 }
 const cycle=detectDirectedCycle(names,adj);
 return {results,adj,cycle,individualCycles,unspecified};
}
function detectDirectedCycle(names,adj){
 const seen=new Set(),on=new Set(),trail=[];
 function walk(n){seen.add(n);on.add(n);trail.push(n);for(const next of adj[n]){
   if(on.has(next))return [...trail.slice(trail.indexOf(next)),next];
   if(!seen.has(next)){const p=walk(next);if(p)return p;}
 }trail.pop();on.delete(n);return null;}
 for(const n of names){if(!seen.has(n)){const cycle=walk(n);if(cycle)return cycle;}}
 return null;
}
function sortedByVotes(candidates,votes,s,tieMode){
 const index=new Map(s.candidates.map((x,i)=>[x,i]));
 return [...candidates].sort((a,b)=>votes[b]-votes[a]||(tieMode==='reverse'?index.get(b)-index.get(a):index.get(a)-index.get(b)));
}
function resolveCut(rank,k,votes,opts,flags){
 if(k<1||k>=rank.length)return null;
 if(votes[rank[k-1]]===votes[rank[k]]){
   if(opts.tieMode==='stop')return {blocked:true,detail:'Candidates tied at the proposed elimination boundary ('+rank[k-1]+' and '+rank[k]+'); the selected model pauses instead of inventing a tiebreak.'};
   flags.push(flag('amber','Hypothetical tie resolution','A tied cutoff was resolved using '+(opts.tieMode==='input'?'input order':'reverse input order')+'. This is a modeling convention, not a documented §6.D.2.f tiebreak.'));
 }
 return {keep:rank.slice(0,k),removed:rank.slice(k)};
}
function proposeElimination(rank,votes,opts,flags){
 let candidateK=null;let equality=[];
 for(let k=1;k<=rank.length-2;k++){
   const sum=rank.slice(k+1).reduce((v,x)=>v+votes[x],0);
   if(sum===votes[rank[k]])equality.push(rank[k]+' ('+sum+' = '+votes[rank[k]]+')');
   if(sum<votes[rank[k]]){candidateK=k+1;break;}
 }
 if(equality.length)flags.push(flag('amber','Strict inequality: equal totals do not qualify','Exact equality at '+equality.join('; ')+'. The bylaw requires “less than,” not “less than or equal to.”'));
 const k=candidateK===null?rank.length-1:candidateK;
 const cut=resolveCut(rank,k,votes,opts,flags);
 if(cut&&cut.blocked)return {...cut,why:'Cannot resolve elimination cutoff.'};
 return {...cut,why:candidateK===null?'New §ii fallback: remove the single lowest candidate.':'New §ii: highest qualifying cutoff, removing every candidate below '+rank[k-1]+'.'};
}
function currentElimination(rank,votes,opts,flags){
 const n=rank.length,eligible=[];
 for(let size=2;size<=n-2;size++){
   const cut=n-size;
   const sum=rank.slice(cut).reduce((v,x)=>v+votes[x],0);
   if(sum<votes[rank[cut-1]])eligible.push({size,sum,against:votes[rank[cut-1]]});
 }
 if(eligible.length>1)flags.push(flag('amber','Multiple current-rule cutoffs satisfy §ii',eligible.map(x=>x.size+' trailing candidates: '+x.sum+' < '+x.against).join('; ')+'. The bylaw does not say which valid group to remove; the selector supplies that interpretation.'));
 if(!eligible.length){
   flags.push(flag('amber','Current text leaves a fallback unspecified','No group of two or more trailing candidates satisfies the old strict inequality. This simulation assumes elimination of one lowest candidate to continue; that fallback is not expressly written in current §ii.'));
 }
 const size=eligible.length?(opts.currentMode==='min'?eligible[0]:eligible[eligible.length-1]).size:1;
 const cut=resolveCut(rank,n-size,votes,opts,flags);
 if(cut&&cut.blocked)return {...cut,why:'No unique cutoff under the selected tie handling.'};
 return {...cut,why:eligible.length?'Current §ii: '+opts.currentMode+'imum qualifying trailing group ('+size+' eliminated).':'Illustrative single-lowest fallback (not specified by existing §ii).'};
}
function topTwo(rank,votes,opts,flags){
 const cut=resolveCut(rank,2,votes,opts,flags);
 return cut&&cut.blocked?{...cut,why:'The top-two cutoff is tied.'}:{...cut,why:'Unchanged §iii: top two advance to the next ballot.'};
}
// These three editable functions ARE the decision branches executed in the single-election engine.
// The surrounding engine handles ballot collection, ranking, and round history.
const RULE_DEFAULTS={
 before:`// Existing: eliminate the smallest qualifying trailing group (configurable).
if (ballotNumber >= 2 || candidatesLeft.length < 5) return advanceTopTwo();
let groupToRemove = 1;
for (let size = 2; size <= candidatesLeft.length - 2; size++) {
  const lowerCandidates = rankedCandidates.slice(-size);
  const candidateAbove = rankedCandidates[rankedCandidates.length - size - 1];
  const lowerVotes = sumVotes(lowerCandidates);
  if (lowerVotes < voteCount(candidateAbove)) {
    groupToRemove = size;
    if (useSmallestGroup) break;
  }
}
return eliminateBottom(groupToRemove);`,
 after:`// B2026-10: eliminate the LARGEST qualifying trailing group.
if (ballotNumber >= 2 || (candidatesLeft.length < 5 && sectionIIIOverrides)) return advanceTopTwo();
let groupToRemove = 1;
for (let size = candidatesLeft.length - 2; size >= 1; size--) {
  const lowerCandidates = rankedCandidates.slice(-size);
  const candidateAbove = rankedCandidates[rankedCandidates.length - size - 1];
  const lowerVotes = sumVotes(lowerCandidates);
  if (lowerVotes < voteCount(candidateAbove)) {
    groupToRemove = size;
    break;
  }
}
return eliminateBottom(groupToRemove);`,
 approval:`// One approval per marked candidate. Highest approval counts first.
const qualified = rankedCandidates.filter(name => approvalPercent(name) >= 60);
if (endorsementOnly) return endorse(qualified);
if (qualified.length === 1) return nominate(qualified[0]);
if (qualified.length > 1) return multipleQualifiers(qualified);
return sendTopTwoToPrimary();`
};
const RULE_COMPILED={},RULE_EDITED={before:false,after:false,approval:false};
const RULE_LAST={before:[],after:[],approval:[]};
let shownRule='before',ruleEditing=false,ruleRenderKey='';
// The simulator owns phases; algorithms only receive the completed ballot data.
// Execution instrumentation is injected into the compiled copy, never into editor text.
function instrumentAlgorithm(source){
 const lines=source.split('\n');
 return lines.map((line,i)=>{
   if (/^\s*(?:if\s*\(|return\b)/.test(line)) {
     // A return on the line after a braceless control belongs to that control;
     // skip it rather than change its semantics.
     const prev=lines.slice(0,i).reverse().find(x=>x.trim()&&!x.trim().startsWith('//'))||'';
     if(/^\s*return\b/.test(line)&&/^(?:\s*if|\s*else|\s*for|\s*while)\b/.test(prev)&&!prev.includes('{'))return line;
     return '__trace('+ (i+1) +'); '+line;
   }
   return line;
 }).join('\n');
}
function compileRule(source){
 // The shared engine owns vote collection, final ballot outcomes, and rendering.
 return new Function('ctx','actions','__trace',
  `"use strict";
   const ballotNumber=ctx.round;
   const candidatesLeft=ctx.active;
   const rankedCandidates=ctx.rank;
   const voteCount=name=>ctx.votes[name];
   const sumVotes=names=>names.reduce((sum,name)=>sum+ctx.votes[name],0);
   const useSmallestGroup=ctx.opts.currentMode==='min';
   const sectionIIIOverrides=ctx.opts.precedence==='iii';
   const endorsementOnly=ctx.opts.approvalMode==='endorse';
   const approvalPercent=name=>100*ctx.votes[name]/ctx.cast;
   const {advanceTopTwo,eliminateBottom,endorse,nominate,multipleQualifiers,sendTopTwoToPrimary}=actions;
   ${instrumentAlgorithm(source)}`);
}
// Precompiled reference rules: no runtime eval is needed for normal operation.
const REFERENCE_RULES={
 before(ctx, actions, trace){
  const candidatesLeft=ctx.active, rankedCandidates=ctx.rank;
  const votes=name=>ctx.votes[name];
  const sumVotes=names=>names.reduce((total,name)=>total+ctx.votes[name],0);
  trace(2);
  if(ctx.round>=2||candidatesLeft.length<5) return actions.advanceTopTwo();
  let groupToRemove=1;
  for(let size=2;size<=candidatesLeft.length-2;size++){
   const lower=rankedCandidates.slice(-size);
   const above=rankedCandidates[rankedCandidates.length-size-1];
   trace(8);
   if(sumVotes(lower)<votes(above)){
    groupToRemove=size;
    trace(10);
    if(ctx.opts.currentMode==='min') break;
   }
  }
  trace(13);
  return actions.eliminateBottom(groupToRemove);
 },
 after(ctx, actions, trace){
  const rankedCandidates=ctx.rank, candidatesLeft=ctx.active;
  const sumVotes=names=>names.reduce((total,name)=>total+ctx.votes[name],0);
  trace(2);
  if(ctx.round>=2||(candidatesLeft.length<5&&ctx.opts.precedence==='iii')) return actions.advanceTopTwo();
  let groupToRemove=1;
  for(let size=candidatesLeft.length-2;size>=1;size--){
   const lower=rankedCandidates.slice(-size);
   const above=rankedCandidates[rankedCandidates.length-size-1];
   trace(8);
   if(sumVotes(lower)<ctx.votes[above]){
    groupToRemove=size;
    break;
   }
  }
  trace(13);
  return actions.eliminateBottom(groupToRemove);
 },
 approval(ctx, actions, trace){
  const qualified=ctx.rank.filter(name=>100*ctx.votes[name]/ctx.cast>=60);
  trace(3);
  if(ctx.opts.approvalMode==='endorse')return actions.endorse(qualified);
  trace(4);
  if(qualified.length===1)return actions.nominate(qualified[0]);
  trace(5);
  if(qualified.length>1)return actions.multipleQualifiers(qualified);
  trace(6);
  return actions.sendTopTwoToPrimary();
 }
};
function setRule(key,source){
 const compiled=source===RULE_DEFAULTS[key]?REFERENCE_RULES[key]:compileRule(source);
 RULE_COMPILED[key]={source,run:compiled};RULE_EDITED[key]=source!==RULE_DEFAULTS[key];
}

function validateRuleResult(r,active){
 if(!r||typeof r!=='object'||!r.decision)throw Error('Return a result using the provided election actions.');
 const d=r.decision;if(!d.blocked){
  if(!Array.isArray(d.keep)||!d.keep.length||new Set(d.keep).size!==d.keep.length||d.keep.some(c=>!active.includes(c)))throw Error('Result must keep distinct eligible candidates.');
  if(!Array.isArray(d.removed)||d.removed.some(c=>!active.includes(c)))throw Error('Result must remove only eligible candidates.');
  if(d.keep.some(c=>d.removed.includes(c)))throw Error('Candidate cannot be kept and removed.');
  if(!r.outcome&&(d.keep.length===active.length||d.removed.length!==active.length-d.keep.length||active.some(c=>!d.keep.includes(c)&&!d.removed.includes(c))))throw Error('An unfinished round must remove candidates and preserve the full candidate partition.');
 }
 if(r.outcome&&(!['sole','primary','approval','approval_ambiguous'].includes(r.outcome.kind)||!Array.isArray(r.outcome.candidates)||r.outcome.candidates.some(c=>!active.includes(c))))throw Error('Invalid election outcome.');
}
function runRule(key,ctx){const trace=[];let result;
 const fullKeep=()=>({keep:[...ctx.active],removed:[],why:'Threshold reached.'});
 const wrappedDecision=decision=>({decision});
 const actions={
  advanceTopTwo:()=>wrappedDecision(topTwo(ctx.rank,ctx.votes,ctx.opts,ctx.flags)),
  eliminateBottom:size=>{
    if(!Number.isSafeInteger(size)||size<1||size>ctx.rank.length-2)throw Error('Number eliminated must be 1 through the number of candidates minus 2.');
    const reference=key==='before'?currentElimination(ctx.rank,ctx.votes,ctx.opts,ctx.flags):proposeElimination(ctx.rank,ctx.votes,ctx.opts,ctx.flags);
    if(reference.removed?.length===size)return {decision:reference};
    const cutoff=resolveCut(ctx.rank,ctx.rank.length-size,ctx.votes,ctx.opts,ctx.flags);
    return {decision:cutoff.blocked?cutoff:{...cutoff,why:'Edited elimination: lowest '+size+' candidate(s).'}};
  },
  eliminateUnderExistingRule:()=>wrappedDecision(currentElimination(ctx.rank,ctx.votes,ctx.opts,ctx.flags)),
  eliminateUnderAmendment:()=>wrappedDecision(proposeElimination(ctx.rank,ctx.votes,ctx.opts,ctx.flags)),
  endorse:names=>({outcome:{kind:'approval',candidates:[...names]},decision:{...fullKeep(),why:'Approval threshold.'}}),
  nominate:name=>({outcome:{kind:'sole',candidates:[name]},decision:{...fullKeep(),why:'60% reached.'}}),
  multipleQualifiers:names=>({outcome:{kind:'approval_ambiguous',candidates:[...names]},decision:{...fullKeep(),why:'Multiple candidates reached 60%.'}}),
  sendTopTwoToPrimary:()=>{const d=topTwo(ctx.rank,ctx.votes,ctx.opts,ctx.flags);return d.blocked?{decision:d}:{outcome:{kind:'primary',candidates:[...d.keep]},decision:{...d,why:'No 60% approval; top two.'}};}
 };
 try{
  // Identical checks shared by both successive-elimination methods.
  if(!ctx.cast)result={decision:{blocked:true,why:'No valid ballots.'}};
  else if(key!=='approval'&&ctx.votes[ctx.rank[0]]*5>=3*ctx.cast)result=actions.nominate(ctx.rank[0]);
  else if(key!=='approval'&&ctx.active.length===2)result={outcome:{kind:'primary',candidates:[...ctx.rank]},decision:{...fullKeep(),why:'Two finalists; neither has 60%.'}};
  else result=RULE_COMPILED[key].run(ctx,actions,n=>trace.push(n));
  validateRuleResult(result,ctx.active);
 }catch(e){result={decision:{blocked:true,why:'Edited rule error: '+e.message}};ctx.flags?.push(flag('red','Rule execution error',e.message));}
 RULE_LAST[key]=trace;return {result,trace};
}
function prettyCode(source,activeLine){return source.split('\n').map((line,i)=>{
  const no=i+1,active=no===activeLine;let html=escapeHtml(line).replace(/(\/\/.*)$/,'<span class="comment">$1</span>');
  return '<div class="codeLine '+(active?'active':'')+'" data-ln="'+no+'"><span class="lineNo">'+no+'</span><span class="lineText">'+(html||' ')+'</span></div>';
 }).join('');}
function renderRuleCode(){if(!$('ruleCode')||ruleEditing)return;
 const source=RULE_COMPILED[shownRule]?.source||RULE_DEFAULTS[shownRule];
 const history=current?.[shownRule]?.history||[];
 const trace=history.at(-1)?.trace||[];
 const isSelected=scene.method===shownRule;
 const canShow=trace.length&&(!isSelected||['announce','finished'].includes(scene.phase));
 let activeLine=0;
 if(canShow){
   const progress=isSelected&&scene.phase==='announce'?Math.min(1,scene.phaseSecs/Math.max(.001,phaseDuration('announce',currentScenario.total))):1;
   activeLine=trace[Math.min(trace.length-1,Math.floor(progress*2.7*trace.length))]||0;
 }
 const key=shownRule+'|'+activeLine+'|'+source;
 $('rulePhase').textContent=isSelected&&['casting','transfer','counting'].includes(scene.phase)?'Waiting for complete tally':canShow?(trace.length?'Decision executed':'Shared 60% / finalist rule'):'Ready';
 $('ruleStatus').textContent=(RULE_EDITED[shownRule]?'Edited algorithm':'Reference algorithm')+(activeLine?' · line '+activeLine:'');
 if(ruleRenderKey===key)return;
 ruleRenderKey=key;$('ruleCode').innerHTML=prettyCode(source,activeLine);
 if(activeLine){const el=$('ruleCode').querySelector('.codeLine.active'),host=$('ruleCode');if(el){const y=el.offsetTop-host.offsetTop;if(y<host.scrollTop||y+el.offsetHeight>host.scrollTop+host.clientHeight)host.scrollTop=Math.max(0,y-host.clientHeight/2);}}
 document.querySelectorAll('.ruleTab').forEach(b=>{const yes=b.dataset.rule===shownRule;b.classList.toggle('active',yes);b.setAttribute('aria-selected',yes?'true':'false');});
}
function closeRuleEditor(){$('ruleEditor').classList.add('hide');$('ruleCode').classList.remove('hide');ruleEditing=false;$('editRule').textContent='Edit';ruleRenderKey='';renderRuleCode();}
function openRuleEditor(){ruleEditing=true;$('ruleText').value=RULE_COMPILED[shownRule].source;$('ruleError').textContent='';$('ruleEditor').classList.remove('hide');$('ruleCode').classList.add('hide');$('editRule').textContent='Close';}
function applyRuleSource(source){const previous=RULE_COMPILED[shownRule];
 try{setRule(shownRule,source);const sample=parseScenario($('candidates').value,$('groups').value),states=allSteps(sample,opts());if(states[shownRule].blocked&&states[shownRule].history.some(h=>h.flags.some(f=>f.title==='Rule execution error')))throw Error(states[shownRule].history.find(h=>h.flags.some(f=>f.title==='Rule execution error')).flags.find(f=>f.title==='Rule execution error').detail);
 }catch(e){RULE_COMPILED[shownRule]=previous;RULE_EDITED[shownRule]=previous.source!==RULE_DEFAULTS[shownRule];$('ruleError').textContent=e.message;return false;}
 $('ruleError').textContent='';closeRuleEditor();configureSingle();return true;
}
function initRuleEditor(){for(const key of Object.keys(RULE_DEFAULTS))setRule(key,RULE_DEFAULTS[key]);
 document.querySelectorAll('.ruleTab').forEach(b=>b.addEventListener('click',()=>{if(ruleEditing)closeRuleEditor();shownRule=b.dataset.rule;ruleRenderKey='';renderRuleCode();}));
 $('editRule').addEventListener('click',()=>ruleEditing?closeRuleEditor():openRuleEditor());
 $('cancelRule').addEventListener('click',closeRuleEditor);
 $('applyRule').addEventListener('click',()=>applyRuleSource($('ruleText').value));
 $('restoreRule').addEventListener('click',()=>{if(applyRuleSource(RULE_DEFAULTS[shownRule]))$('ruleStatus').textContent='Restored reference code';});
 renderRuleCode();
}

function methodState(type,s){return {type,round:0,active:[...s.candidates],done:false,blocked:false,outcome:null,history:[]};}
function nextBallot(st,s,opts){
 if(st.done||st.blocked)return st;
 const round=st.round+1;
 const initialActive=[...st.active];
 const tally=st.type==='approval'?approvalTally(s,opts):ballot(s,initialActive,round),votes=tally.votes;
 const ranking=sortedByVotes(initialActive,votes,s,opts.tieMode);
 const flags=[];
 let decision=null,outcome=null;
 if(tally.exhausted)flags.push(flag('amber','Some delegate groups exhausted their listed preferences',tally.exhausted+' delegate(s) had no remaining ranked choice and did not cast a vote in this model. The percentage denominator is '+tally.cast+' valid votes.'));
 if(tally.blockedSwitch)flags.push(flag('info','Round-specific switch could not be cast',tally.blockedSwitch+' delegates had a requested r'+round+' candidate who was no longer available, so their first listed eligible choice was used.'));
 if(tally.switched)flags.push(flag('amber','Round-specific changes not predicted by rankings',tally.switched+' delegates used their explicit r'+round+' choice even if it contradicted the rank fallback.'));
 if(tally.contextSwitched)flags.push(flag('amber','Field-dependent ballot changes',tally.contextSwitched+' delegates chose according to the exact eligible field. The same group can vote differently with a different list of survivors.'));
 if(tally.pairSwitched)flags.push(flag('info','Explicit head-to-head choice',tally.pairSwitched+' delegates used a pair-specific vote that may contradict their longer ordering.'));
 if(st.type==='approval'){
  if(tally.inferred)flags.push(flag('amber','Inferred approvals',tally.inferred+' delegates use top-'+opts.approvalTopN+' fallback.'));
  if(tally.blank)flags.push(flag('info','Blank approval ballots',tally.blank+' delegates approved no one.'));
  const qualifying=ranking.filter(c=>votes[c]*5>=3*tally.cast);
  if(qualifying.length>1)flags.push(flag('red','Multiple 60% qualifiers',qualifying.join(', ')+' all reached the threshold.'));
  if(!qualifying.length)flags.push(flag('amber','No approval majority','No candidate reached 60%; additional selection rules are needed.'));
 }
 if(st.type==='after'&&!RULE_EDITED.after&&ranking.length>2&&votes[ranking[0]]*5<3*tally.cast){
   const chosen=(round>=2||(initialActive.length<5&&opts.precedence==='iii'))?topTwo(ranking,votes,opts,[]):proposeElimination(ranking,votes,opts,[]);
   const other=(round>=2||initialActive.length<5)?proposeElimination(ranking,votes,opts,[]):null;
   const competing=initialActive.length<5?topTwo(ranking,votes,opts,[]):null;
   if(competing&&!competing.blocked&&other&&!other.blocked&&competing.keep&&other.keep&&competing.keep.join('|')!==other.keep.join('|'))
     flags.push(flag('red','§ii / §iii conflict','Proposed §ii retains '+other.keep.join(', ')+'; unchanged §iii advances '+competing.keep.join(', ')+'.'));
 }
 const executed=runRule(st.type,{round,active:initialActive,rank:ranking,votes,cast:tally.cast,tally,opts,flags});
 decision=executed.result.decision;
 outcome=executed.result.outcome||null;
 if(decision?.blocked){
   st.blocked=true;
   flags.push(flag('red','Unresolved cutoff or ballot',decision.detail||decision.why));
 }
 if(decision&&decision.keep&&!outcome)st.active=[...decision.keep];
 if(outcome){st.done=true;st.outcome=outcome;}
 st.round=round;
 st.history.push({round,initialActive,tally,ranking,flags,decision,outcome,trace:executed.trace,remaining:[...st.active]});
 return st;
}
function sameCandidates(a,b){return a.slice().sort().join('\u0000')===b.slice().sort().join('\u0000');}

function resetStates(s){return {before:methodState('before',s),after:methodState('after',s),approval:methodState('approval',s)};}
function allSteps(s,opts){const ss=resetStates(s);for(let x=0;x<30;x++){if([ss.before,ss.after,ss.approval].every(z=>z.done||z.blocked))break;for(const z of [ss.before,ss.after,ss.approval])nextBallot(z,s,{...opts,approvalMode:opts.approvalMode||'endorse',approvalTopN:opts.approvalTopN||2});}return ss;}

function tests(){const checks=[];const assert=(name,test)=>{if(!test)throw Error('FAILED: '+name);checks.push(name);};const opts={currentMode:'min',precedence:'ii',tieMode:'stop'};
 const sample=parseScenario(PRESETS[0].candidates,PRESETS[0].groups);
 const first=ballot(sample,sample.candidates,1);
 assert('First ballot exactly 45/30/15/7/3',[45,30,15,7,3].every((v,i)=>first.votes[sample.candidates[i]]===v));
 assert('60% integer threshold: 3/5 yes, 2/5 no',(3*5>=3*5)&&(2*5<3*5));
 const after=proposeElimination(sortedByVotes(sample.candidates,first.votes,sample,'stop'),first.votes,opts,[]);
 assert('New top-down cutoff keeps A and B',after.keep.join(',')==='A,B');
 const before=currentElimination(sortedByVotes(sample.candidates,first.votes,sample,'stop'),first.votes,opts,[]);
 assert('Old minimum cutoff keeps A, B, C',before.keep.join(',')==='A,B,C');
 const max=currentElimination(sortedByVotes(sample.candidates,first.votes,sample,'stop'),first.votes,{...opts,currentMode:'max'},[]);
 assert('Old maximum cutoff keeps A, B',max.keep.join(',')==='A,B');
 const outcome=allSteps(sample,opts);
 assert('Deliberative switch: before nominates C',outcome.before.outcome?.kind==='sole'&&outcome.before.outcome.candidates[0]==='C');
 assert('Deliberative switch: after nominates A',outcome.after.outcome?.kind==='sole'&&outcome.after.outcome.candidates[0]==='A');
 const stable=allSteps(parseScenario(PRESETS[1].candidates,PRESETS[1].groups),opts);
 assert('No-switch preset: same A nominee, fewer ballots after',stable.before.outcome?.candidates[0]==='A'&&stable.after.outcome?.candidates[0]==='A'&&stable.before.round>stable.after.round);
 const collision=allSteps(parseScenario(PRESETS[2].candidates,PRESETS[2].groups),opts);
 assert('Four-candidate conflict: before first-round top two',collision.before.history[0].remaining.length===2);
 assert('Four-candidate conflict: after first-round top three',collision.after.history[0].remaining.length===3);
 assert('Four-candidate conflict explicitly flagged',collision.after.history[0].flags.some(f=>f.title.includes('conflict')));
 const tie=allSteps(parseScenario(PRESETS[3].candidates,PRESETS[3].groups),opts);
 assert('Tied lowest candidate: both models pause',tie.before.blocked&&tie.after.blocked);
 const gap=allSteps(parseScenario(PRESETS[4].candidates,PRESETS[4].groups),opts);
 assert('Unspecified old-rule fallback is labeled',gap.before.history[0].flags.some(f=>f.title.includes('fallback')));
 const eq=allSteps(parseScenario(PRESETS[5].candidates,PRESETS[5].groups),opts);
 assert('Strict equality yields no qualifying multi-elimination group',eq.before.history[0].remaining.length===4);
 assert('Equality warning appears in new rule',eq.after.history[0].flags.some(f=>f.title.includes('inequality')));
 const exact=allSteps(parseScenario(PRESETS[6].candidates,PRESETS[6].groups),opts);
 assert('Exactly 60% immediately nominates A',exact.before.round===1&&exact.after.round===1&&exact.before.outcome.candidates[0]==='A');
 const primary=allSteps(parseScenario(PRESETS[7].candidates,PRESETS[7].groups),opts);
 assert('55%–45% finalists both go to primary',primary.before.outcome.kind==='primary'&&primary.after.outcome.kind==='primary');
 const ii=allSteps(parseScenario(PRESETS[2].candidates,PRESETS[2].groups),{...opts,precedence:'iii'});
 assert('§iii-first option uses top two for four candidates',ii.after.history[0].remaining.length===2);
 const tiebreak=allSteps(parseScenario(PRESETS[3].candidates,PRESETS[3].groups),{...opts,tieMode:'input'});
 assert('Hypothetical tie mode does not halt both methods',!tiebreak.before.blocked&&!tiebreak.after.blocked);
 let bad=false;try{parseScenario('A\nA','1: A');}catch(e){bad=true;}assert('Duplicate candidate names rejected',bad);
 bad=false;try{parseScenario('A\nB','1: A > Z');}catch(e){bad=true;}assert('Unknown candidate rejected',bad);
 // Independent approval and contextual/pairwise tests.
 const apOptions={...opts,approvalMode:'endorse',approvalTopN:2};
 const apSample=approvalTally(sample,apOptions);
 assert('Approval uses one denominator per delegate, not number of marks',apSample.cast===100&&Object.values(apSample.votes).reduce((a,b)=>a+b,0)===200);
 assert('Missing approval input is transparently counted as inferred',apSample.inferred===100);
 const explicit=parseScenario('A\nB\nC','40: A > B > C | approve=A,C\n35: B > C > A | approve=B,C\n25: C > A > B | approve=none');
 const exp=approvalTally(explicit,apOptions);
 assert('Explicit independent approvals count A40 B35 C75',exp.votes.A===40&&exp.votes.B===35&&exp.votes.C===75&&exp.blank===25&&exp.inferred===0);
 const s3=resetStates(explicit);nextBallot(s3.approval,explicit,apOptions);
 assert('Approval endorsement mode reports only C qualifying',s3.approval.outcome.kind==='approval'&&sameCandidates(s3.approval.outcome.candidates,['C']));
 const adapt=resetStates(explicit);nextBallot(adapt.approval,explicit,{...apOptions,approvalMode:'adapt'});
 assert('Single qualifying approval candidate has hypothetical adapter sole result',adapt.approval.outcome.kind==='sole'&&adapt.approval.outcome.candidates[0]==='C');
 const cycles=parseScenario('A\nB\nC','34: A > B > C | approve=A,B\n33: B > C > A | approve=B,C\n33: C > A > B | approve=C,A');
 const cyc=pairwiseReport(cycles);
 assert('Aggregated majority loop from individually transitive rankings',Boolean(cyc.cycle)&&cyc.individualCycles===0);
 const ca=approvalTally(cycles,apOptions);
 assert('Cyclic profile independently qualifies A B C at >=60%',ca.votes.A===67&&ca.votes.B===67&&ca.votes.C===66);
 const multi=resetStates(cycles);nextBallot(multi.approval,cycles,apOptions);
 assert('Approval reports multiple 60%-qualifying candidates, no forced sole nominee',multi.approval.outcome.kind==='approval'&&multi.approval.outcome.candidates.length===3&&multi.approval.history[0].flags.some(f=>f.title.includes('Multiple')));
 const nontrans=parseScenario('A\nB\nC','100: A > B > C | pair=A>B,B>C,C>A | approve=A,C');
 assert('Individual nontransitive pair cycle supported',pairwiseReport(nontrans).individualCycles===100);
 assert('Pair override chooses C over A despite fallback ranking',ballot(nontrans,['A','C'],1).votes.C===100);
 const contextual=parseScenario('A\nB\nC','100: A > B > C | field=A+B+C:C;A+B:B | approve=A,C | r2=A');
 assert('Exact-field override overrides single-choice fallback',ballot(contextual,['A','B','C'],1).votes.C===100);
 assert('Different surviving field changes single-choice ballot',ballot(contextual,['A','B'],1).votes.B===100);
 assert('Round-specific override has priority over field choice',ballot(contextual,['A','B','C'],2).votes.A===100);
 let rejected=false;try{parseScenario('A\nB\nC','1: A>B>C | pair=A>B,B>A');}catch(e){rejected=true;}assert('Conflicting explicit pair declarations are rejected',rejected);
 rejected=false;try{parseScenario('A\nB\nC','1: A>B>C | approve=A,A');}catch(e){rejected=true;}assert('Duplicate approvals are rejected',rejected);
 rejected=false;try{parseScenario('A\nB\nC','1: A>B>C | field=A+B:C');}catch(e){rejected=true;}assert('Field choices outside their field rejected',rejected);
 const oldSyntax=parseScenario('A\nB\nC','1: A>B>C | r2=C,r3=B');
 assert('Legacy comma-separated round switches retained',oldSyntax.groups[0].switches[2]==='C'&&oldSyntax.groups[0].switches[3]==='B');
 const boundary=parseScenario('A\nB\nC','40: A>B>C | approve=A\n30: B>A>C | approve=B\n30: C>B>A | approve=C');
 const out=resetStates(boundary);nextBallot(out.approval,boundary,{...apOptions,approvalMode:'adapt'});
 assert('Hypothetical approval top-two adapter stops at 2nd/3rd tie',out.approval.blocked&&out.approval.history[0].flags.some(f=>f.title.includes('Unresolved')));
 return checks;
}

// Named-case sampler: every sampled profile is checked against its case's observable condition.
const CASE_TEMPLATES = Object.create(null);
const EXACT_CASES = new Set(['tie','equal','exact60','blankApproval']);
function fastFromDetailed(id){
 const found=PRESETS.find(x=>x.id===id);if(!found)throw Error('Unknown case '+id);
 const s=parseScenario(found.candidates,found.groups),ids=new Map(s.candidates.map((c,i)=>[c,i]));
 const key=(a,b)=>Math.min(a,b)+','+Math.max(a,b);
 const groups=s.groups.map(g=>{
  const order=g.order.map(x=>ids.get(x)),pos=Array(s.candidates.length).fill(999);
  order.forEach((x,i)=>pos[x]=i);
  const fields={};for(const [name,choice] of Object.entries(g.field)){
   const chosen=ids.get(choice),members=name.split('\u0000').map(c=>ids.get(c)).sort((a,b)=>a-b);
   fields[members.join(',')]=chosen;
  }
  const pairOverrides={};for(const [name,choice] of Object.entries(g.pair)){
   const [a,b]=name.split('\u0000').map(c=>ids.get(c));pairOverrides[key(a,b)]=ids.get(choice);
  }
  return {order,pos,approved:g.approval===null?order.slice(0,2):g.approval.map(c=>ids.get(c)),weight:g.weight,cycle:null,r2:g.switches[2]===undefined?-1:ids.get(g.switches[2]),r3:g.switches[3]===undefined?-1:ids.get(g.switches[3]),ctx:null,fields,pairOverrides};
 });
 return {k:s.candidates.length,groups};
}
function buildFastProfile(base,r){
 const k=base.k,groups=base.groups,total=groups.reduce((n,g)=>n+g.weight,0),approve=Array(k).fill(0);
 for(const g of groups)for(const c of g.approved)approve[c]+=g.weight;
 const maxApproval=Math.max(...approve),leaders=approve.flatMap((v,i)=>v===maxApproval?[i]:[]),pair=Array.from({length:k},()=>new Float64Array(k)),adj=Array.from({length:k},()=>[]);
 for(let a=0;a<k;a++)for(let b=a+1;b<k;b++){
  let av=0,bv=0;for(const g of groups){if(choicePair(g,a,b)===a)av+=g.weight;else bv+=g.weight;}
  pair[a][b]=av;pair[b][a]=bv;if(av>bv)adj[a].push(b);else if(bv>av)adj[b].push(a);
 }
 const cw=Array.from({length:k},(_,i)=>i).find(c=>adj[c].length===k-1)??-1;
 const tie=Array(k),shuffle=shuffled(r,k);shuffle.forEach((c,i)=>tie[c]=i);
 return {k,groups,total,approve,leaders,pair,adj,cw,cycle:hasDirectedCycle(adj),hasShifts:groups.some(g=>g.r2>=0||g.r3>=0||Boolean(g.ctx)||Boolean(g.fields&&Object.keys(g.fields).length)),tie};
}
function initialVotes(p){const votes=new Float64Array(p.k),active=Array.from({length:p.k},(_,i)=>i);
 for(const g of p.groups){const c=choiceRound(g,active,1);if(c>=0)votes[c]+=g.weight;}
 return ranked(votes,active,p.tie).map(c=>votes[c]);}
function caseSignature(p,id){
 const votes=initialVotes(p),n=votes.length,top=votes[0],t=p.total;
 switch(id){
  case 'swing': {const a=fastElection(p,0),b=fastElection(p,1);return a.sole&&b.sole&&a.finalists[0]!==b.finalists[0];}
  case 'speed': {const a=fastElection(p,0),b=fastElection(p,1);return a.rounds!==b.rounds&&a.sole===b.sole&&a.finalists.slice().sort((x,y)=>x-y).join(',')===b.finalists.slice().sort((x,y)=>x-y).join(',');}
  case 'collision': {if(n!==4||top*5>=3*t)return false;let keep=n-1;for(let i=1;i<=n-2;i++){const sum=votes.slice(i+1).reduce((a,b)=>a+b,0);if(sum<votes[i]){keep=i+1;break;}}return keep!==2;}
  case 'tie': return top*5<3*t&&votes[n-1]===votes[n-2];
  case 'gap': {if(n<5||top*5>=3*t)return false;for(let size=2;size<=n-2;size++){const k=n-size,sum=votes.slice(k).reduce((a,b)=>a+b,0);if(sum<votes[k-1])return false;}return true;}
  case 'equal': return votes.some((v,i)=>i>=1&&i<=n-2&&v===votes.slice(i+1).reduce((a,b)=>a+b,0));
  case 'exact60': return top*5===3*t;
  case 'primary': return n===2&&top*5<3*t;
  case 'majorityCycle': return p.cycle&&p.approve.filter(x=>x*5>=3*t).length>=3;
  case 'personalCycle': return p.groups.some(g=>g.pairOverrides&&Object.keys(g.pairOverrides).length>=3);
  case 'context': return p.groups.some(g=>g.fields&&Object.keys(g.fields).length>0)&&p.hasShifts;
  case 'approvalConsensus': {const active=Array.from({length:n},(_,i)=>i),v=Array(n).fill(0);for(const g of p.groups){const c=choiceRound(g,active,1);if(c>=0)v[c]+=g.weight;}return p.approve.some((x,c)=>x*4>=3*t&&v[c]<top);}
  case 'approvalNoThreshold': return Math.max(...p.approve)*5<3*t;
  case 'blankApproval': return p.groups.some(g=>!g.approved.length)&&Math.max(...p.approve)*5===3*t;
 }
 return false;
}
function randomizedCase(r,id,variation){
 const base=CASE_TEMPLATES[id]||(CASE_TEMPLATES[id]=fastFromDetailed(id));
 if(!variation||EXACT_CASES.has(id))return {profile:buildFastProfile(base,r),locked:true};
 for(let attempt=0;attempt<12;attempt++){
  const groups=base.groups.map(g=>({...g,weight:Math.max(1,Math.round(g.weight*(1+(r()*2-1)*variation)))}));
  const test=buildFastProfile({k:base.k,groups},r);
  if(caseSignature(test,id))return {profile:test,locked:false};
 }
 return {profile:buildFastProfile(base,r),locked:true};
}
function conditionSamplesCheck(){
 const random=mulberry32(9283);let count=0;
 for(const item of PRESETS){
  const basic=randomizedCase(random,item.id,0);
  if(!caseSignature(basic.profile,item.id))throw Error('Base preset signature missing: '+item.id);
  count++;
  for(let j=0;j<15;j++){
   const trial=randomizedCase(random,item.id,.35),p=trial.profile;
   if(!caseSignature(p,item.id))throw Error('Generated case signature missing: '+item.id);
   for(let a=0;a<p.k;a++)for(let b=a+1;b<p.k;b++)if(p.pair[a][b]+p.pair[b][a]!==p.total)throw Error('Pairwise count failed: '+item.id);
   for(let m=0;m<3;m++)if(fastElection(p,m).finalists.length<1)throw Error('No finalists: '+item.id);
   count++;
  }
 }
 return count;
}

// Preserve explicit case invariants when changing the number of candidates.
// Added candidates are appended to every ranking (zero initial support); the
// broad generator, rather than a named boundary template, generates full-support entrants.
function resizeCaseProfile(base,k){
 const old=base.k;if(k===old)return base;
 const groups=base.groups.map(g=>{
  const extras=Array.from({length:Math.max(0,k-old)},(_,i)=>old+i);
  const order=g.order.filter(c=>c<k).concat(extras),pos=Array(k).fill(k);
  order.forEach((c,i)=>pos[c]=i);
  const fields={};for(const [key,val] of Object.entries(g.fields||{})){
   const indices=key.split(',').map(Number);if(val<k&&indices.every(c=>c<k))fields[key]=val;
  }
  const pairOverrides={};for(const [key,val] of Object.entries(g.pairOverrides||{})){
   const indices=key.split(',').map(Number);if(val<k&&indices.every(c=>c<k))pairOverrides[key]=val;
  }
  return {...g,order,pos,approved:g.approved.filter(c=>c<k),r2:g.r2<k?g.r2:-1,r3:g.r3<k?g.r3:-1,ctx:g.ctx&&g.ctx.absent<k&&g.ctx.choose<k?g.ctx:null,fields,pairOverrides};
 });
 return {k,groups};
}
const CASE_SIZES_CACHE=new Map();
function viableCaseSizes(id,minCand=2,maxCand=12){
 const key=id+'|'+minCand+'|'+maxCand;if(CASE_SIZES_CACHE.has(key))return CASE_SIZES_CACHE.get(key);
 const base=CASE_TEMPLATES[id]||(CASE_TEMPLATES[id]=fastFromDetailed(id)),sizes=[];
 for(let k=minCand;k<=maxCand;k++){
  const prof=buildFastProfile(resizeCaseProfile(base,k),mulberry32(312778+k));
  if(caseSignature(prof,id))sizes.push(k);
 }
 CASE_SIZES_CACHE.set(key,sizes);return sizes;
}
function randomizedSizedCase(r,id,k,variation){
 const base=CASE_TEMPLATES[id]||(CASE_TEMPLATES[id]=fastFromDetailed(id));
 const sized=resizeCaseProfile(base,k);
 if(!viableCaseSizes(id,k,k).length)throw Error('Case '+id+' does not support '+k+' candidates.');
 if(!variation||EXACT_CASES.has(id))return {profile:buildFastProfile(sized,r),locked:true};
 for(let i=0;i<16;i++){
  const groups=sized.groups.map(g=>({...g,weight:Math.max(1,Math.round(g.weight*(1+(r()*2-1)*variation)))}));
  const p=buildFastProfile({k,groups},r);
  if(caseSignature(p,id))return {profile:p,locked:false};
 }
 return {profile:buildFastProfile(sized,r),locked:true};
}
// Optional hybrid electorate: superimpose behavioral traits while keeping the
// chosen named condition true. This is not a guarantee that two named cases hold.
function overlayNamedCase(r,p,id,params){
 const k=p.k,groups=p.groups,vol=params.vol??0,cycle=params.cycle??0,breadth=params.breadth??1;
 if(vol<=0&&cycle<=0&&Math.abs(breadth-1)<.001)return null;
 for(let attempt=0;attempt<3;attempt++){
  let changes=0;
  const tweaked=groups.map(g=>{
   const out={...g,pos:g.pos,order:g.order,approved:[...g.approved]};
   if(k>=3&&r()<cycle*.5){out.cycle=g.order.slice(0,3);changes++;}
   if(k>=3&&r()<vol*.45){const alternatives=g.order.filter(c=>c!==g.order[0]);if(alternatives.length){out.r2=alternatives[Math.floor(r()*alternatives.length)];changes++;}}
   if(k>=4&&r()<vol*.18){out.ctx={absent:g.order[k-1],choose:g.order[Math.min(2,k-1)]};changes++;}
   if(breadth>1&&r()<Math.min(.8,(breadth-1)*.55)){const options=g.order.filter(c=>!out.approved.includes(c));if(options.length){out.approved.push(options[Math.floor(r()*options.length)]);changes++;}}
   if(breadth<1&&out.approved.length>1&&r()<(1-breadth)*.6){out.approved.pop();changes++;}
   return out;
  });
  if(!changes)continue;
  const candidate=buildFastProfile({k,groups:tweaked},r);
  if(caseSignature(candidate,id))return candidate;
 }
 return null;
}

// Parameter sweeps. Every setting runs all methods against exactly the same sampled profile.
let effectTask=null,effectResults=null;
const EFFECT_DEFS={
 candidates:{label:'Candidates',values:[2,3,4,5,6,8,10,12],change:(p,v)=>({...p,minCand:v,maxCand:v})},
 blocs:{label:'Voter groups',values:[6,12,20,35,60,80],change:(p,v)=>({...p,blocs:v})},
 vol:{label:'Round switching',values:[0,.15,.30,.5,.75,1],change:(p,v)=>({...p,vol:v})},
 cycle:{label:'Pairwise cycles',values:[0,.1,.25,.5,.75],change:(p,v)=>({...p,cycle:v})},
 breadth:{label:'Approval breadth',values:[.2,.6,1,1.6,2.5],change:(p,v)=>({...p,breadth:v})},
 share:{label:'Named-case share',values:[0,.25,.5,.75,1],change:(p,v)=>({...p,source:'mixed',share:v})},
 variation:{label:'Case group-size variation',values:[0,.15,.35,.6,.9],change:(p,v)=>({...p,source:p.source==='random'?'mixed':p.source,share:p.source==='random'?.5:p.share,variation:v})},
 caseWeight:{label:'Selected condition weight',values:[0,.25,1,3,10],change:(p,v)=>{const id=$('effectCase').value,weights={...p.weights,[id]:v};if(!v)delete weights[id];return {...p,source:p.source==='random'?'mixed':p.source,share:p.source==='random'?.5:p.share,weights,cases:Object.keys(weights)};}}
};
const EFFECT_METRIC={cw:'CW kept',omitted:'Approval leader excluded',removed:'Approval leader eliminated',favor:'Head-to-head support',rounds:'Mean ballots',cwExists:'CW existence',cycles:'Any majority cycle'};
function effectMetric(agg,m,metric){
 if(!agg.n)return null;
 if(metric==='cwExists')return 100*agg.cwExists/agg.n;
 if(metric==='cycles')return 100*agg.cycles/agg.n;
 return aggregateRow(agg,m)[metric]??null;
}
function showEffectResults(){if(!effectResults)return;
 const all=effectResults.data,key=$('effectParam').value,m=$('effectMetric').value,rows=all[key]||[];
 const valid=rows.filter(x=>x.n>0),first=valid[0],last=valid.at(-1),unit=m==='rounds'?'':'%';
 $('effectsSummary').innerHTML=first&&last?[0,1,2].map((i)=>{
 const start=effectMetric(first.agg,i,m),end=effectMetric(last.agg,i,m),diff=(start===null||end===null)?null:end-start;
 return '<tr><td style="color:'+COLORS[i]+';font-weight:750">'+METHODS[i]+'</td><td>'+(start===null?'—':start.toFixed(2)+unit)+'</td><td>'+(end===null?'—':end.toFixed(2)+unit)+'</td><td style="font-weight:750">'+(diff===null?'—':(diff>=0?'+':'')+diff.toFixed(2)+(m==='rounds'?' ballots':' pp'))+'</td></tr>';}).join(''):'<tr><td colspan="4">No compatible settings were sampled.</td></tr>';
 $('effectsNote').textContent=EFFECT_DEFS[key].label+' · '+fmt(effectResults.per)+' trials per setting requested · seeded model estimates. Gaps mean a condition is incompatible with that candidate count or case selection.';
 $('effectsCoverage').textContent=valid.map(x=>String(x.value)+': '+fmt(x.n)+' trials').join(' · ')||'No compatible settings.';
 $('effectOverview').innerHTML=Object.entries(EFFECT_DEFS).map(([id,d])=>{const z=(all[id]||[]).filter(x=>x.n>0),s=z[0],e=z.at(-1);const diff=i=>{if(!s||!e)return '—';const a=effectMetric(s.agg,i,m),b=effectMetric(e.agg,i,m);return a===null||b===null?'—':(b-a>=0?'+':'')+(b-a).toFixed(2)+(m==='rounds'?' ballots':' pp');};return '<tr'+(id===key?' style="background:#eef5fb"':'')+'><td>'+d.label+'</td><td>'+diff(0)+'</td><td>'+diff(1)+'</td><td>'+diff(2)+'</td></tr>';}).join('');
 drawEffectChart();
}
function drawEffectChart(){const c=$('effectsChart');if(!c||!effectResults)return;const box=c.getBoundingClientRect(),w=Math.round(box.width)||550,h=Math.round(box.height)||270,dpr=Math.min(2,window.devicePixelRatio||1);c.width=w*dpr;c.height=h*dpr;const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const k=$('effectParam').value,m=$('effectMetric').value,pts=effectResults.data[k]||[],vals=pts.flatMap(o=>o.n?[0,1,2].map(i=>effectMetric(o.agg,i,m)).filter(v=>v!==null):[]),L=55,R=15,T=18,B=47,W=w-L-R,H=h-T-B;
 if(!vals.length){ctx.fillStyle='#718193';ctx.font='13px system-ui';ctx.fillText('No compatible settings',L+35,h/2);return;}
 const mn=Math.min(...vals),mx=Math.max(...vals),pad=Math.max(m==='rounds'?.15:3,(mx-mn)*.18),lo=Math.max(0,mn-pad),hi=m==='rounds'?mx+pad:Math.min(100,mx+pad),xAt=j=>L+j*Math.max(0,W)/(Math.max(1,pts.length-1)),yAt=v=>T+(hi-v)/Math.max(.00001,hi-lo)*H;
 ctx.font='11px system-ui';ctx.fillStyle='#6b7b8c';ctx.strokeStyle='#e7edf3';ctx.lineWidth=1;
 for(let t=0;t<=4;t++){let y=T+H*t/4;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(L+W,y);ctx.stroke();ctx.textAlign='right';ctx.fillText((hi-t*(hi-lo)/4).toFixed(1)+(m==='rounds'?'':'%'),L-6,y+4);}
 ctx.textAlign='center';for(let j=0;j<pts.length;j++){ctx.fillText(String(pts[j].value),xAt(j),h-B+17);}
 ctx.fillText(EFFECT_DEFS[k].label,h>0?L+W/2:0,h-9);ctx.save();ctx.translate(12,T+H/2);ctx.rotate(-Math.PI/2);ctx.fillText(EFFECT_METRIC[m],0,0);ctx.restore();
 for(let i=0;i<3;i++){ctx.strokeStyle=COLORS[i];ctx.fillStyle=COLORS[i];ctx.lineWidth=2.5;ctx.beginPath();let prev=false;pts.forEach((p,j)=>{const y=p.n?effectMetric(p.agg,i,m):null;if(y===null){prev=false;return;}if(!prev)ctx.moveTo(xAt(j),yAt(y));else ctx.lineTo(xAt(j),yAt(y));prev=true;});ctx.stroke();for(let j=0;j<pts.length;j++){const v=pts[j].n?effectMetric(pts[j].agg,i,m):null;if(v===null)continue;ctx.beginPath();ctx.arc(xAt(j),yAt(v),3.9,0,Math.PI*2);ctx.fill();}}
}
function effectSettings(p,key,value){const out=EFFECT_DEFS[key].change(p,value);if(out.minCand>out.maxCand){out.minCand=out.maxCand;}
 if(out.source==='cases'&&!Object.keys(out.weights).length)return null;
 return out;}
function startEffects(){if(effectTask?.running||sweep?.running)return;
 let base;try{base=batchSettings();}catch(e){$('effectsStatus').textContent=e.message;return;}
 const per=+$('effectTrials').value,keys=Object.keys(EFFECT_DEFS),jobs=[];
 for(const key of keys)for(const val of EFFECT_DEFS[key].values){const p=effectSettings(base,key,val);let sampler=null,error='';if(p){try{sampler=createSampler(p,p.seed);}catch(e){error=e.message;}}else error='No active condition.';jobs.push({key,value:val,params:p,sampler,agg:emptyAggregate(),error,done:0});}
 effectResults={per,data:Object.fromEntries(keys.map(k=>[k,[]]))};effectTask={running:true,jobs,index:0,per,total:jobs.length*per,done:0,base};
 $('scanEffects').disabled=true;$('stopEffects').disabled=false;$('effectsStatus').textContent='Scanning…';effectChunk();}
function effectChunk(){if(!effectTask?.running)return;const t=effectTask,end=Date.now()+18;
 try{while(t.running&&t.index<t.jobs.length&&Date.now()<end){const job=t.jobs[t.index];if(!job.sampler){effectResults.data[job.key].push({value:job.value,agg:job.agg,n:0,error:job.error});t.done+=t.per;t.index++;continue;}
   const sampled=sampleElection(job.sampler,job.params);if(!sampled)throw Error('No sampling model for '+job.key);const p=sampled.profile,outs=[0,1,2].map(i=>fastElection(p,i));addTrial(job.agg,p,outs);job.done++;t.done++;
   if(job.done>=t.per){effectResults.data[job.key].push({value:job.value,agg:job.agg,n:job.agg.n});t.index++;}
 }}catch(e){t.error=e.message;t.running=false;console.error(e);}
 if(Date.now()- (t.updateAt||0)>300||t.index>=t.jobs.length){$('effectsStatus').textContent=fmt(t.done)+' / '+fmt(t.total)+' samples'+(t.error?' · '+t.error:'');$('effectsProgress').style.width=(100*t.done/t.total).toFixed(1)+'%';t.updateAt=Date.now();}
 if(t.running&&t.index<t.jobs.length)setTimeout(effectChunk,0);else finishEffects();}
function finishEffects(){if(!effectTask)return;effectTask.running=false;$('scanEffects').disabled=false;$('stopEffects').disabled=true;$('effectsStatus').textContent=(effectTask.error?'Error: '+effectTask.error:fmt(effectTask.done)+' scenario runs complete')+' · '+fmt(effectTask.per)+' / setting';showEffectResults();}
function initSensitivity(){
 $('effectCase').innerHTML=PRESETS.map(p=>'<option value="'+escapeHtml(p.id)+'">'+escapeHtml(p.title)+'</option>').join('');$('effectCase').value='approvalConsensus';
 $('effectParam').addEventListener('change',()=>{$('effectCaseLabel').classList.toggle('hide',$('effectParam').value!=='caseWeight');showEffectResults();});$('effectMetric').addEventListener('change',showEffectResults);$('effectCaseLabel').classList.add('hide');
 $('scanEffects').addEventListener('click',startEffects);$('stopEffects').addEventListener('click',()=>{if(effectTask){effectTask.running=false;finishEffects();}});
}

// Auditorium animation: every person leaves their own seat, casts a ballot and returns; then counting and announcement; no waiting phase.
// Time units are simulated seconds. All time coefficients are labeled assumptions.
const AUD_PHASES=['casting','transfer','counting','announce'];
let auditoriumSeats={profile:null,count:0,groups:[]};
const AUD_SPEEDS=[1,3,6,12,24,48,96,192,384,768];
let scene={phase:'ready',elapsed:0,phaseSecs:0,round:0,playing:false,method:'before',shadow:null,h:null,cast:0,counted:0,votes:{},queue:null,queueIndex:0,frameId:0,lastNow:0};
function getTiming(){return {stations:Math.max(1,Math.min(12,+$('audStations').value||3)),slot:Math.max(1,Math.min(120,+$('audSlot').value||6)),walk:Math.max(1,Math.min(240,+$('audWalk').value||16)),transfer:Math.max(0,Math.min(600,+$('audTransfer').value||35)),tellers:Math.max(1,Math.min(20,+$('audTellers').value||3)),countRate:Math.max(1,Math.min(200,+$('audRate').value||30)),setup:Math.max(0,Math.min(240,+$('audSetup').value||18)),announce:Math.max(15,Math.min(240,+$('audAnnounce').value||70))};}
function phaseDuration(phase,n){const t=getTiming();if(phase==='casting')return 2*t.walk+Math.ceil(n/t.stations)*t.slot;if(phase==='transfer')return t.transfer;if(phase==='counting')return t.setup+n*60/(t.countRate*t.tellers);if(phase==='announce')return t.announce;return 0;}
function fmtClock(v){let s=Math.round(v)||0;return String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function speedMultiplier(){return AUD_SPEEDS[Math.max(0,Math.min(9,Number($('speed').value)-1))];}
function haltScene(){scene.playing=false;scene.lastNow=0;if(scene.frameId){cancelAnimationFrame(scene.frameId);scene.frameId=0;}}
function resetAuditorium(){haltScene();scene={...scene,phase:'ready',phaseSecs:0,elapsed:0,round:0,shadow:null,h:null,cast:0,counted:0,votes:{},queue:null,queueIndex:0,frameId:0,lastNow:0};refreshAuditorium();}
function resetSceneMethod(){scene.method=$('audMethod').value;configureSingle();}
function makeSeatPlan(s){
 if(auditoriumSeats.profile===s&&auditoriumSeats.count===s.total&&auditoriumSeats.plan)return auditoriumSeats.plan;
 const n=s.total,groups=[];for(const group of s.groups)for(let i=0;i<group.weight;i++)groups.push(group);
 const seed=(n*19349663+s.candidates.length*83492791)>>>0,rng=mulberry32(seed);
 for(let i=groups.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[groups[i],groups[j]]=[groups[j],groups[i]];}
 const rows=Math.min(55,Math.max(1,Math.ceil(Math.sqrt(n*.55)))),cols=Math.ceil(n/rows),seatOrder=Array.from({length:n},(_,i)=>i);
 for(let i=n-1;i>0;i--){const j=Math.floor(rng()*(i+1));[seatOrder[i],seatOrder[j]]=[seatOrder[j],seatOrder[i]];}
 const orderIndex=new Uint16Array(n);for(let order=0;order<n;order++)orderIndex[seatOrder[order]]=order;
 const people=groups.map((group,i)=>({group,order:orderIndex[i],x:175+(Math.floor(i/rows)+.5)*750/cols,y:211+((i%rows)+.5)*185/rows}));
 const plan={people,rows,cols,seatOrder};auditoriumSeats={profile:s,count:n,plan};return plan;
}
function makePhysicalQueue(s,active,round,mode){
 const plan=makeSeatPlan(s);
 return plan.seatOrder.map(i=>{
  const g=plan.people[i].group;
  if(mode==='approval')return g.approval===null?g.order.slice(0,opts().approvalTopN):g.approval;
  const selected=groupChoice(g,s,active,round).name;return selected?[selected]:[];
 });
}
function stationCenter(i,stations){return 210+(i+.5)*680/stations;}
function walkingPosition(person,time,timing){
 const st=person.order%timing.stations,slot=Math.floor(person.order/timing.stations),leave=slot*timing.slot,
       arrival=leave+timing.walk,cast=arrival+timing.slot,home=cast+timing.walk;
 if(time<leave||time>=home)return {x:person.x,y:person.y,state:'seated',cast};
 const tx=stationCenter(st,timing.stations),ty=398,aisleX=tx,aisleY=person.y;
 const interpolate=(a,b,u)=>a+(b-a)*u;
 const track=u=>u<.32?{x:interpolate(person.x,aisleX,u/.32),y:person.y}:{x:aisleX,y:interpolate(aisleY,ty,(u-.32)/.68)};
 if(time<arrival)return {...track((time-leave)/timing.walk),state:'outbound',cast};
 if(time<cast)return {x:tx,y:ty,state:'voting',cast,voteProgress:(time-arrival)/timing.slot};
 const u=Math.min(1,(time-cast)/timing.walk),v=track(1-u);
 return {...v,state:'returning',cast};
}
function prepareRound(){if(!currentScenario||!current)return;
 const method=scene.method,st=current[method];if(st.done||st.blocked){scene.phase='finished';refreshAuditorium();return;}
 scene.shadow=null;scene.round=st.round+1;scene.h={round:scene.round,initialActive:[...st.active],ranking:[],tally:null,decision:null,outcome:null};scene.phase='casting';scene.phaseSecs=0;scene.cast=0;scene.counted=0;scene.votes=Object.fromEntries(currentScenario.candidates.map(c=>[c,0]));scene.queue=makePhysicalQueue(currentScenario,scene.h.initialActive,scene.round,method);scene.queueIndex=0;
 refreshAuditorium();
}
function syncCount(n){if(!scene.h||!currentScenario)return;const total=currentScenario.total;const finish=Math.max(0,Math.min(total,Math.floor(n)));
 if(scene.queue){for(let j=scene.queueIndex;j<finish;j++){for(const mark of scene.queue[j])scene.votes[mark]++;}scene.queueIndex=finish;}
 else{for(const c of currentScenario.candidates){const final=scene.h.tally.votes[c]||0;scene.votes[c]=Math.floor(final*finish/total);if(finish===total)scene.votes[c]=final;}}
 scene.counted=finish;
}
function phaseProgress(){if(!currentScenario)return 0;const duration=phaseDuration(scene.phase,currentScenario.total);return duration?Math.min(1,scene.phaseSecs/duration):1;}
function updatePhysicalCounts(){if(!currentScenario)return;const n=currentScenario.total,q=phaseProgress(),t=getTiming();if(scene.phase==='casting')scene.cast=Math.max(0,Math.min(n,Math.floor(Math.max(0,scene.phaseSecs-t.walk)/t.slot)*t.stations));
 else if(scene.phase!=='ready')scene.cast=n;
 if(scene.phase==='counting'){const nDone=Math.min(n,Math.floor(Math.max(0,scene.phaseSecs-t.setup)*t.tellers*t.countRate/60));syncCount(nDone);}
}
function shiftPhase(){if(!currentScenario||!current)return;const n=currentScenario.total;
 switch(scene.phase){
 case 'ready':prepareRound();return;
 case 'casting':scene.cast=n;scene.h.tally=scene.method==='approval'?approvalTally(currentScenario,opts()):ballot(currentScenario,scene.h.initialActive,scene.round);scene.phase='transfer';break;
 case 'transfer':scene.phase='counting';break;
 case 'counting':syncCount(n);scene.phase='announce';stepOnce();scene.h=current[scene.method].history.at(-1)||scene.h;break;
 case 'announce':{const st=current[scene.method];if(st.done||st.blocked)scene.phase='finished';else{prepareRound();return;}break;}
 default:return;
 }
 scene.phaseSecs=0;refreshAuditorium();
}
function advanceScene(seconds){if(!currentScenario||!current||scene.phase==='finished')return;if(scene.phase==='ready')prepareRound();let todo=Math.max(0,seconds),guard=0;
 while(todo>0&&scene.phase!=='finished'&&guard++<120){const dur=phaseDuration(scene.phase,currentScenario.total),left=Math.max(0,dur-scene.phaseSecs),step=Math.min(todo,left);scene.phaseSecs+=step;scene.elapsed+=step;todo-=step;updatePhysicalCounts();if(dur-scene.phaseSecs<.00001)shiftPhase();else break;}
 refreshAuditorium();
}
function phaseStep(){if(!currentScenario||!current)return;haltScene();if(scene.phase==='finished'){return;}if(scene.phase==='ready'){prepareRound();}else{const dur=phaseDuration(scene.phase,currentScenario.total);advanceScene(Math.max(0,dur-scene.phaseSecs)+.000001);}refreshAuditorium();}
function auditoriumPlay(){if(!current||!currentScenario||scene.playing||scene.phase==='finished')return;scene.playing=true;scene.lastNow=0;scene.frameId=requestAnimationFrame(sceneTick);refreshAuditorium();}
function auditoriumPause(){haltScene();refreshAuditorium();}
function sceneTick(now){if(!scene.playing)return;if(!scene.lastNow){scene.lastNow=now;scene.frameId=requestAnimationFrame(sceneTick);return;}const dt=Math.max(0,Math.min(.24,(now-scene.lastNow)/1000));scene.lastNow=now;advanceScene(dt*speedMultiplier());if(scene.phase==='finished'){haltScene();refreshAuditorium();return;}scene.frameId=requestAnimationFrame(sceneTick);}
function estimateTimings(){if(!currentScenario)return [];
 const all=allSteps(currentScenario,opts()),n=currentScenario.total,t=getTiming(),one={cast:phaseDuration('casting',n),transfer:phaseDuration('transfer',n),count:phaseDuration('counting',n),announce:t.announce};
 return [['before','Existing'],['after','B2026-10'],['approval','Approval']].map(([key,label])=>{const st=all[key],rounds=st.history.length,cast=rounds*one.cast,count=rounds*one.count,transfer=rounds*one.transfer,announce=rounds*one.announce,total=cast+count+transfer+announce;
 return {key,label,rounds,cast,count,transfer,announce,total,blocked:st.blocked};});
}
function renderTimingRows(){const list=estimateTimings();if(!list.length){$('audComparison').innerHTML='';return;}
 const max=Math.max(...list.map(x=>x.total),1);
 $('audComparison').innerHTML=list.map(x=>'<div class="timeRow"><div class="timeTitle"><strong>'+escapeHtml(x.label)+'</strong><span>'+x.rounds+' ballot'+(x.rounds===1?'':'s')+' · '+fmtClock(x.total)+(x.blocked?' · unresolved':'')+'</span></div><div class="timeTrack"><span style="width:'+(100*x.cast/max).toFixed(2)+'%;background:#528bb8" title="Casting"></span><span style="width:'+(100*x.transfer/max).toFixed(2)+'%;background:#a1a8b0" title="Transfer"></span><span style="width:'+(100*x.count/max).toFixed(2)+'%;background:#af755c" title="Counting"></span><span style="width:'+(100*x.announce/max).toFixed(2)+'%;background:#65a78b" title="Announcing"></span></div></div>').join('');
 const selected=list.find(x=>x.key===scene.method),base=list.find(x=>x.key==='before');$('audTimeDifference').textContent=selected?'Modeled total '+fmtClock(selected.total)+(base&&base.key!==selected.key?' · '+(selected.total-base.total<0?'saves ':'adds ')+fmtClock(Math.abs(selected.total-base.total))+' versus existing':''):'';
}
function candidateColor(name){
 const i=Math.max(0,currentScenario?.candidates.indexOf(name)??0);
 return 'hsl('+Math.round((210+i*137.508)%360)+' 72% 61%)';
}
function viewFlags(){return {voters:$('audVoterColors').checked,ballots:$('audBallotColors').checked,room:$('audShowScene').checked};}
function stageDepartures(){
 const h=scene.h;if(!h)return {names:[],label:''};
 const removed=h.decision?.removed||[];
 if(removed.length)return {names:removed,label:'Eliminated'};
 if(h.outcome?.kind==='sole'||h.outcome?.kind==='primary'){
   const remaining=new Set(h.outcome.candidates);
   const nonadvancing=h.initialActive.filter(c=>!remaining.has(c));
   if(nonadvancing.length)return {names:nonadvancing,label:'Not advancing'};
 }
 return {names:[],label:''};
}
function currentAudienceChoice(g){
 if(!currentScenario)return null;
 if(scene.method==='approval'){
   // On an approval ballot the visible preference is still the ranked fallback;
   // the approval ballot may mark multiple (or no) candidate names.
   return g.order.find(c=>currentScenario.candidates.includes(c))||null;
 }
 const active=scene.h?.initialActive||currentScenario.candidates;
 const round=Math.max(1,scene.round);
 return groupChoice(g,currentScenario,active,round).name;
}
function currentBallotMarks(g){
 if(!currentScenario)return [];
 if(scene.method==='approval')return g.approval===null?g.order.slice(0,opts().approvalTopN):g.approval;
 const active=scene.h?.initialActive||currentScenario.candidates;
 return [groupChoice(g,currentScenario,active,Math.max(1,scene.round)).name].filter(Boolean);
}
function refreshCandidateLegend(){
 const out=$('audCandidateLegend');if(!out)return;
 const mode=viewFlags();out.hidden=!mode.room||(!mode.voters&&!mode.ballots)||!currentScenario;
 if(out.hidden)return;
 out.innerHTML=currentScenario.candidates.map(c=>'<span class="candidateKey"><i style="background:'+candidateColor(c)+'"></i>'+escapeHtml(c)+'</span>').join('') + (scene.method==='approval'&&mode.ballots?'<small>Striped ballots = several approvals.</small>':'');
}
function renderRoundResult(){
 const el=$('audRoundResults'),h=scene.h;
 if(!el)return;
 const visible=h?.tally && ['announce','finished'].includes(scene.phase);
 el.classList.toggle('hide',!visible);
 if(!visible)return;
 const cast=h.tally.cast||currentScenario.total;
 const dep=stageDepartures(),eliminated=new Set(dep.names);
 const reveal=scene.phase==='finished'||scene.phaseSecs>=phaseDuration('announce',currentScenario.total)*.25;
 const names=(h.ranking?.length?h.ranking:h.initialActive).filter(c=>h.initialActive.includes(c));
 const candidates=names.map(c=>{
   const votes=h.tally.votes[c]||0,elim=eliminated.has(c),qualified=h.outcome?.kind==='approval'&&h.outcome.candidates.includes(c);
   const status=reveal?(scene.method==='approval'?(qualified?'QUALIFIED':'BELOW 60%'):elim?dep.label.toUpperCase():h.decision?.blocked?'UNRESOLVED':h.outcome?.kind==='sole'?resultVocabulary().short:'ADVANCES'):'';
   return '<div class="roundCandidate '+(reveal&&elim?'eliminated':'')+'" style="--candidate:'+candidateColor(c)+'"><span class="roundName">'+escapeHtml(c)+'</span><strong>'+fmt(votes)+'</strong><small>'+(cast?(100*votes/cast).toFixed(1):'0.0')+'%</small>'+(status?'<span class="roundDisposition '+(elim?'':'safe')+'">'+status+'</span>':'')+'</div>';
 }).join('');
 const line=!reveal?'Final tally':eliminated.size?dep.label+': '+[...eliminated].join(', '):h.outcome?.kind==='sole'?soleResultLabel(h.outcome.candidates):h.outcome?.kind==='primary'?'Advanced: '+h.outcome.candidates.join(', '):h.decision?.blocked?'Unresolved elimination':h.decision?.why||'Round complete';
 const html='<div class="roundResultTop"><b>Ballot '+h.round+' · '+fmt(cast)+' cast</b><span>Final count</span></div><div class="roundResultCards">'+candidates+'</div><div class="roundDecision '+(reveal&&eliminated.size?'red':'')+'">'+escapeHtml(line)+'</div>';
 if(el.innerHTML!==html)el.innerHTML=html;
}
function refreshWinnerCard(){
 const el=$('audWinnerCard');if(!el)return;
 const final=scene.phase==='finished'&&current?.[scene.method];
 el.classList.toggle('hide',!final);
 if(!final){el.innerHTML='';return;}
 el.classList.toggle('roomOff',!viewFlags().room);
 const st=current[scene.method],result=st.outcome,kind=result?.kind||'',names=result?.candidates||[];
 let headline='',detail='',eyebrow='',simple=false;
 if(st.blocked){headline='No result declared';detail='The procedure stopped without a resolved result.';eyebrow='Unresolved ballot';simple=true;}
 else if(kind==='sole'&&names.length===1){const wording=resultVocabulary();headline=names[0]+' '+wording.verb;detail='Sole '+wording.noun;eyebrow='Election result';}
 else if(kind==='primary'){headline=names.join(' & ')+' advance';detail='Primary election required — no sole '+resultVocabulary().noun+' selected.';eyebrow='Convention result';simple=true;}
 else if(kind==='approval'||kind==='approval_ambiguous'){
   headline=names.length===1?names[0]+' '+resultVocabulary().verb:names.length?'Multiple candidates qualify':'No candidate qualifies';
   detail=names.length>1?names.join(' · ')+' received qualifying approvals.':names.length===1?'At least 60% of ballots approved this candidate.':'No candidate reached the approval threshold.';
   eyebrow='Approval result';simple=names.length!==1;
 }else{headline='No result declared';detail='No resolved '+resultVocabulary().noun+'.';eyebrow='Result';simple=true;}
 el.classList.toggle('undecided',simple);
 const swatch=names.length===1?'<span class="winSwatch" style="background:'+candidateColor(names[0])+'"></span>':'';
 const html='<div class="winEyebrow">'+escapeHtml(eyebrow)+'</div><div class="winTitle">'+swatch+escapeHtml(headline)+'</div><div class="winDetail">'+escapeHtml(detail)+'</div>';
 if(el.innerHTML!==html)el.innerHTML=html;
}
function phaseName(p){return ({ready:'Room seated · ready',casting:'Voters approaching ballot boxes',transfer:'All ballots cast · transferring sealed ballots',counting:'Counting at the front table',announce:'Results · candidates departing stage',finished:'Convention procedure finished'})[p]||p;}
function refreshAuditorium(){if(!$('audCanvas'))return;
 const n=currentScenario?.total||0,valid=!!currentScenario;$('audMethodName').textContent=scene.method==='before'?'Existing':scene.method==='after'?'B2026-10':'Approval';
 $('audPhase').textContent=phaseName(scene.phase);$('audClock').textContent=fmtClock(scene.elapsed);$('audRound').textContent=scene.round?'Ballot '+scene.round:'Ready';$('audCast').textContent=fmt(scene.cast)+' / '+fmt(n);$('audCount').textContent=fmt(scene.counted)+' / '+fmt(n);$('audElapsed').textContent=fmtClock(scene.elapsed);$('audPhaseProgress').style.width=(100*phaseProgress()).toFixed(2)+'%';$('audRule').textContent=valid?fmt(n)+' delegates · '+(scene.phase==='casting'||scene.phase==='transfer'?'COUNTING LOCKED until all '+fmt(n)+' ballots are cast and transferred.':'Counting opens only after all ballots have been cast and transferred.'):'Set a valid electorate to animate.';
 $('step').disabled=!valid||scene.phase==='finished';$('play').disabled=!valid||scene.playing||scene.phase==='finished';$('pause').disabled=!scene.playing;
 $('speedValue').textContent=speedMultiplier()+'×';$('audTopClock').textContent=fmtClock(scene.elapsed);
 const room=viewFlags().room;$('audVisual').hidden=!room;refreshCandidateLegend();renderRoundResult();refreshWinnerCard();document.querySelectorAll('.method[role=button]').forEach(el=>{const key=el.id==='cardBefore'?'before':el.id==='cardAfter'?'after':'approval';const yes=key===scene.method;el.classList.toggle('selectedMethod',yes);el.setAttribute('aria-pressed',String(yes));});if(room)drawAuditorium();renderRuleCode();}
function drawAuditorium(){
 const canvas=$('audCanvas');if(!canvas)return;
 const dpr=Math.min(2,window.devicePixelRatio||1),W=1100,H=550;
 if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);}
 const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
 const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
 const roundRect=(x,y,w,h,r,color)=>{g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();};
 const text=(msg,x,y,size=13,color='#e5e9eb',align='left',weight='500')=>{g.fillStyle=color;g.font=weight+' '+size+'px system-ui,sans-serif';g.textAlign=align;g.fillText(String(msg),x,y);};
 const person=(x,y,sz,color,walking=false,phase=0)=>{
   if(sz<=2.8){g.fillStyle='#d6baa4';g.fillRect(x-.7,y-.9,1.5,1.5);g.fillStyle=color;g.fillRect(x-sz*.6,y+.7,sz*1.2,Math.max(1.3,sz*1.05));return;}
   g.fillStyle='#ceb397';g.beginPath();g.arc(x,y,sz*.46,0,Math.PI*2);g.fill();
   g.fillStyle=color;g.beginPath();g.ellipse(x,y+sz*1.18,sz*.85,sz*.68,0,0,Math.PI*2);g.fill();
   if(walking){g.strokeStyle='#bcab9d';g.lineWidth=Math.max(1,sz*.15);g.beginPath();g.moveTo(x-sz*.24,y+sz*1.6);g.lineTo(x-sz*.29+Math.sin(phase)*sz*.5,y+sz*2.5);g.moveTo(x+sz*.24,y+sz*1.6);g.lineTo(x+sz*.29-Math.sin(phase)*sz*.5,y+sz*2.5);g.stroke();}
 };
 const flags=viewFlags(),n=currentScenario?.total||0,active=scene.h?.initialActive||currentScenario?.candidates||[],timing=getTiming();
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#121b28');bg.addColorStop(.65,'#26384a');bg.addColorStop(1,'#554434');rect(0,0,W,H,bg);
 // Fixed architecture. Nothing in the audience is created or removed as the clock moves.
 for(let side=0;side<2;side++){g.fillStyle=side?'#293442':'#293543';g.beginPath();if(!side){g.moveTo(0,65);g.lineTo(142,130);g.lineTo(179,412);g.lineTo(0,445);}else{g.moveTo(W,65);g.lineTo(W-142,130);g.lineTo(W-179,412);g.lineTo(W,445);}g.fill();}
 for(let i=0;i<9;i++)rect(i*W/8,89,5,300,'rgba(157,115,68,.14)');
 roundRect(151,94,798,84,7,'#3f342c');rect(151,169,798,8,'#c3925c');
 text('CANDIDATES',42,148,13,'#d6b998','left','750');
 // Candidates remain stationary onstage with a subtle head/breath sway; walking only begins upon elimination.
 const candidates=currentScenario?.candidates||[],depart=stageDepartures();
 const stageSet=new Set(scene.phase==='ready'?candidates:scene.phase==='finished'?(scene.h?.outcome?.candidates?.length?scene.h.outcome.candidates:scene.h?.remaining||candidates):active);
 const depProgress=scene.phase==='announce'?Math.max(0,Math.min(1,(scene.phaseSecs/Math.max(.001,phaseDuration('announce',n))-.39)/.58)):scene.phase==='finished'?1:0;
 const nStage=Math.max(1,candidates.length),stepX=790/nStage;
 candidates.forEach((c,i)=>{
   if(!stageSet.has(c))return;
   const departing=depart.names.includes(c),u=departing?depProgress*depProgress*(3-2*depProgress):0;
   const bx=155+(i+.5)*stepX,x=bx+(departing?(i<nStage/2?-1:1)*(305+stepX)*u:0);
   const alpha=departing?1-Math.max(0,(u-.72)/.28):1;
   if(x<151||x>949||alpha<=0)return;
   const sz=Math.max(5,Math.min(11,stepX*.23)),breath=departing?0:Math.sin(scene.elapsed*.7+i)*.5;
   g.save();g.globalAlpha=alpha;person(x,120+breath,sz,flags.voters?candidateColor(c):'#83909f',departing,scene.elapsed*2+i);
   g.fillStyle='#f8f3e6';g.font='650 '+Math.max(9,Math.min(12,stepX*.26))+'px system-ui,sans-serif';g.textAlign='center';
   const label=c.length>Math.floor(stepX/7)?c.slice(0,Math.max(2,Math.floor(stepX/7)-1))+'…':c;
   g.fillText(label,x,164,Math.max(12,stepX-3));g.restore();
 });
 // The 2–5000 physical delegates are distinct permanent identities, one identity per seat.
 const plan=currentScenario?makeSeatPlan(currentScenario):null;
 const crowd=plan?plan.people:[],walkers=[];
 const gapX=plan?750/plan.cols:20,gapY=plan?185/plan.rows:20;
 const size=Math.max(1.7,Math.min(6.3,gapX*.31,gapY*.36));
 const seatedColor='#87919e';
 if(plan){
  for(let r=0;r<plan.rows;r++){
   const y=211+(r+.45)*185/plan.rows;
   rect(169,y+Math.min(6,gapY*.55),762,Math.max(.75,Math.min(2.5,gapY*.22)),'rgba(13,18,25,.44)');
  }
  for(const voter of crowd){
    const pos=scene.phase==='casting'?walkingPosition(voter,scene.phaseSecs,timing):{x:voter.x,y:voter.y,state:'seated'};
    if(pos.state!=='seated'){walkers.push([voter,pos]);continue;}
    const color=flags.voters?candidateColor(currentAudienceChoice(voter.group)):seatedColor;
    person(voter.x,voter.y,size,color);
  }
 }
 // Aisles and the front-of-room floor. Walking people move from their own seat to a ballot box and back.
 const floor=g.createLinearGradient(0,411,0,550);floor.addColorStop(0,'#654c39');floor.addColorStop(1,'#292b31');rect(0,411,W,139,floor);rect(0,411,W,4,'#b88b60');
 for(let i=0;i<timing.stations;i++){
   const x=stationCenter(i,timing.stations);rect(x-1,188,2,217,'rgba(233,198,147,.075)');
 }
 const boxes=timing.stations,bw=Math.min(54,Math.max(18,655/boxes-5));
 for(let i=0;i<boxes;i++){
  const x=stationCenter(i,boxes),y=408;
  roundRect(x-bw/2,y,bw,40,4,'#92673e');roundRect(x-bw/2-2,y-5,bw+4,11,3,'#b98757');rect(x-10,y,20,2,'#20252c');
  if(bw>29)text('VOTE',x,y+25,8,'#ffead0','center','750');
 }
 // A walker is not simultaneously painted in their seat: no teleportation, clones, appearance or disappearance.
 for(const [voter,pos] of walkers){
   const color=flags.voters?candidateColor(currentAudienceChoice(voter.group)):seatedColor;
   const sz=Math.max(3.1,Math.min(7.2,size+1.2));
   person(pos.x,pos.y,sz,color,pos.state!=='voting',scene.elapsed*1.6+voter.order);
   if(pos.state==='outbound'||pos.state==='voting'){
    // Each delegate retains the same physical paper until the instant it is deposited.
    const marks=currentBallotMarks(voter.group),sizePaper=Math.max(6,sz*1.55);
    const handX=pos.x+sz*.72+2,handY=pos.y+sz*.68;
    const drop=pos.state==='voting'?Math.max(0,Math.min(1,(pos.voteProgress-.67)/.33)):0;
    const bx=handX+(pos.x-handX)*drop,by=handY+(408-handY)*drop;
    g.save();g.globalAlpha=1-Math.max(0,(drop-.88)/.12);
    g.strokeStyle='#e3c9a7';g.lineWidth=Math.max(1,sz*.16);g.beginPath();g.moveTo(pos.x+sz*.28,pos.y+sz*1.28);g.lineTo(bx,by+2);g.stroke();
    roundRect(bx,by,sizePaper*.84,sizePaper,1,'#fff7e7');
    g.strokeStyle='#6c6c67';g.lineWidth=.75;g.strokeRect(bx+.4,by+.4,sizePaper*.84-.8,sizePaper-.8);
    if(flags.ballots){const list=marks.length?marks:[null],max=Math.min(6,list.length);
      for(let j=0;j<max;j++)rect(bx+1.5,by+1.5+j*((sizePaper-3)/max),Math.max(3,sizePaper*.84-3),Math.max(1,(sizePaper-3)/max-.35),list[j]?candidateColor(list[j]):'#83909e');
    }
    g.restore();

   }
 }
 // Counting occurs in front of the seated audience, only after the last cast AND last return.
 roundRect(134,477,832,58,8,'#493126');rect(134,476,832,8,'#c09664');rect(158,521,20,27,'#312720');rect(923,521,20,27,'#312720');
 const tellers=Math.min(12,timing.tellers);
 for(let i=0;i<tellers;i++){
   const x=185+(i+.5)*730/tellers,moving=scene.phase==='counting'?Math.sin(scene.phaseSecs*3.5+i)*3:0;
   g.fillStyle='#d2b597';g.beginPath();g.arc(x,460,9,0,Math.PI*2);g.fill();roundRect(x-13,469,26,16,5,'#617987');
   if(scene.phase==='counting'){g.strokeStyle='#d2b597';g.lineWidth=2.5;g.beginPath();g.moveTo(x+5,474);g.lineTo(x+15,486+moving);g.stroke();}
 }
 // Candidate-specific ballot/approval-mark piles grow only when tellers physically count ballots.
 const names=scene.h?.initialActive||[];
 if(names.length){
  const width=785/names.length,baseY=503,maxPile=34;
  names.forEach((c,i)=>{
   const x=157+i*width, count=scene.votes[c]||0, cw=Math.max(8,Math.min(width-8,58));
   const sx=x+(width-cw)/2, height=count?Math.min(maxPile,2+maxPile*Math.sqrt(count/Math.max(1,n))):0;
   const layers=Math.min(24,Math.ceil(height/1.8));
   for(let j=0;j<layers;j++){
     const yy=baseY-j*1.8;
     roundRect(sx,yy,cw-1,2.7,.6,flags.ballots?candidateColor(c):'#d7c6b1');
     rect(sx+1,yy+.35,Math.max(1,cw-3),.45,'rgba(255,255,255,.52)');
   }
   text(c.length>9?c.slice(0,8)+'…':c,x+width/2,518,Math.max(6,Math.min(10,width*.21)),'#ffead0','center','700');
   text(String(count),x+width/2,532,Math.max(8,Math.min(12,width*.25)),'#fff','center','850');
  });
 }else text('COUNTING TABLE — ZERO BALLOTS TALLIED',W/2,515,13,'#f6e5cf','center','800');
 if(scene.phase==='announce'&&depProgress>0&&depart.names.length){roundRect(336,182,428,27,4,'rgba(99,44,40,.9)');text(depart.label+': '+depart.names.join(', ').slice(0,50),W/2,199,12,'#ffe6d6','center','760');}
 // Always-visible simulated clock (also independently displayed outside the room).
 roundRect(18,13,267,68,8,'rgba(8,18,31,.88)');text('ELAPSED · SIMULATED',32,34,11,'#ffd093','left','750');text(fmtClock(scene.elapsed),32,68,28,'#fff7e8','left','800');
 const cx=250,cy=46,rad=24,ang=(scene.elapsed%3600)/3600*2*Math.PI;
 g.strokeStyle='#a1adbc';g.lineWidth=2;g.beginPath();g.arc(cx,cy,rad,0,Math.PI*2);g.stroke();g.strokeStyle='#f4ae49';g.lineWidth=4;g.beginPath();g.arc(cx,cy,rad,-Math.PI/2,-Math.PI/2+ang);g.stroke();g.strokeStyle='#f1f3f7';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+rad*.78*Math.sin(ang),cy-rad*.78*Math.cos(ang));g.stroke();
 roundRect(660,13,424,68,8,'rgba(8,18,31,.87)');text(scene.round?'BALLOT '+scene.round+' · '+scene.method.toUpperCase():'ROOM READY · '+n+' DELEGATES',676,36,12,'#d1e4f3','left','750');text(phaseName(scene.phase),676,63,14,'#fff4df','left','700');
 if(scene.phase==='casting'||scene.phase==='transfer'){
  roundRect(347,430,405,27,5,'rgba(86,33,30,.93)');text('COUNT LOCKED — '+fmt(scene.cast)+' / '+fmt(n)+' CAST',W/2,449,12,'#fff0e2','center','800');
 }else if(scene.phase==='counting'){
  roundRect(375,430,350,27,5,'rgba(23,76,55,.94)');text('COUNTING '+fmt(scene.counted)+' / '+fmt(n),W/2,449,12,'#e1fceb','center','800');
 }
}
function initAuditorium(){
 $('step').textContent='Next phase';$('play').textContent='▶ Animate';$('pause').textContent='Pause';$('speed').value=6;$('speed').min=1;$('speed').max=10;
 $('audMethod').addEventListener('change',()=>{resetSceneMethod();shownRule=$('audMethod').value;ruleRenderKey='';renderRuleCode();});
 [['cardBefore','before'],['cardAfter','after'],['cardApproval','approval']].forEach(([id,key])=>{
  const el=$(id),activate=()=>{if(scene.method===key)return;$('audMethod').value=key;resetSceneMethod();shownRule=key;ruleRenderKey='';renderRuleCode();};
  el.addEventListener('click',e=>{if(e.target.closest('summary,details,button,input,select,a'))return;activate();});
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
 });
 for(const id of ['audStations','audSlot','audWalk','audTransfer','audTellers','audRate','audSetup','audAnnounce'])$(id).addEventListener('change',()=>{resetAuditorium();renderTimingRows();});

 $('audVoterCount').addEventListener('change',()=>{configureSingle();});
 for(const id of ['audShowScene','audVoterColors','audBallotColors'])$(id).addEventListener('change',refreshAuditorium);
 window.UCRPVotingLab.getScene=()=>({...scene,votes:{...scene.votes}});window.UCRPVotingLab.phaseStep=phaseStep;window.UCRPVotingLab.advanceScene=advanceScene;window.UCRPVotingLab.estimateTimings=estimateTimings;window.UCRPVotingLab.candidateColor=candidateColor;window.UCRPVotingLab.stageDepartures=stageDepartures;window.UCRPVotingLab.getSeatPlan=()=>currentScenario?makeSeatPlan(currentScenario):null;window.UCRPVotingLab.walkingPosition=walkingPosition;window.UCRPVotingLab.getTiming=getTiming;window.UCRPVotingLab.scaleElectorate=scaleElectorate;
 refreshAuditorium();renderTimingRows();
}

// ---------- Simplified single-election view; exact existing logic retained above ----------
let presetId='approvalConsensus', current=null, currentScenario=null, ticker=null,steps=0;
const opts=()=>({currentMode:$('currentMode').value,precedence:$('precedence').value,tieMode:$('tieMode').value,approvalMode:$('approvalMode').value,approvalTopN:+$('approvalTopN').value});
function escapeHtml(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const fmt=n=>Number(n).toLocaleString();
const per=(v,n)=>n?100*v/n:0;
function stopLive(){if(ticker){clearInterval(ticker);ticker=null;} $('pause').disabled=true;}
// New elections draw a new, label-symmetric population. Presets stay fixed for replication.
// Random choices determine the electorate; the election methods determine the outcome.
let lastRandomSeed=null;
function newRandomElection(){
 const count=Number($('liveCandidates').value);
 if(!Number.isSafeInteger(count)||count<2||count>20){$('formError').textContent='Choose 2–20 candidates.';return;}
 let names=$('candidates').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(names.length!==count||new Set(names.map(x=>x.toLowerCase())).size!==count)names=Array.from({length:count},(_,i)=>String.fromCharCode(65+i));
 // Crypto randomness is optional: file:// pages and browsers can fall back to Math.random.
 const seed=(globalThis.crypto?.getRandomValues?globalThis.crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*4294967296))>>>0;
 const r=mulberry32(seed);
 const total=auditoriumPopulation();
 const blocs=Math.min(total,Math.max(12,Math.min(65,Math.round(Math.sqrt(total)*2.5))));
 const regime=randint(r,0,REGIMES.length-1);
 const profile=generateElection(r,{minCand:count,maxCand:count,blocs,cycle:.23,vol:.24,breadth:1.1},regime);
 // Hamilton apportionment: assigned integer delegates sum to the displayed population.
 const allocated=profile.groups.map(g=>Math.floor(g.weight*total/profile.total));
 let remaining=total-allocated.reduce((a,b)=>a+b,0);
 const rest=profile.groups.map((g,i)=>({i,fraction:g.weight*total/profile.total-allocated[i],shuffle:r()}))
   .sort((a,b)=>b.fraction-a.fraction||a.shuffle-b.shuffle);
 for(let i=0;i<remaining;i++)allocated[rest[i].i]++;
 const lines=['# Random seed: '+seed+' · '+REGIMES[regime]+' electorate'];
 profile.groups.forEach((g,i)=>{
  if(!allocated[i])return;
  const name=j=>names[j];
  let line=allocated[i]+': '+g.order.map(name).join(' > ');
  line+=' | approve='+(g.approved.length?g.approved.map(name).join(','):'none');
  if(g.cycle){const [a,b,c]=g.cycle;line+=' | pair='+name(a)+'>'+name(b)+','+name(b)+'>'+name(c)+','+name(c)+'>'+name(a);}
  if(g.r2>=0)line+=' | r2='+name(g.r2);
  if(g.r3>=0)line+=' | r3='+name(g.r3);
  if(g.ctx&&g.ctx.choose!==g.ctx.absent){
   const members=g.order.filter(j=>j!==g.ctx.absent);
   if(members.length>=2)line+=' | field='+members.map(name).join('+')+':'+name(g.ctx.choose);
  }
  lines.push(line);
 });
 const candidateText=names.join('\n'),groupText=lines.join('\n');
 // Validate before installing to keep a valid previous election in case of a bug.
 const checked=parseScenario(candidateText,groupText);
 if(checked.total!==total)throw Error('Random population mismatch: '+checked.total+' / '+total);
 lastRandomSeed=seed;
 presetId='random';$('preset').value='random';$('candidates').value=candidateText;$('groups').value=groupText;
 $('presetDesc').textContent='Fresh randomized delegate preferences · seed '+seed+'. Same electorate is used by all three methods.';
 $('newRandom').title='Seed '+seed+' · '+REGIMES[regime]+' electorate. Click for another.';
 configureSingle();
}
function loadPresetCompact(id){if(id==='random'){newRandomElection();return;}const p=PRESETS.find(a=>a.id===id);if(!p)return;$('liveCandidates').value=p.candidates.split(/\r?\n/).filter(x=>x.trim()).length;presetId=id;$('preset').value=id;$('candidates').value=p.candidates;$('groups').value=p.groups;$('presetDesc').textContent=p.desc;configureSingle();}
function auditoriumPopulation(){
 const el=$('audVoterCount'),v=Number(el.value);
 if(!Number.isSafeInteger(v)||v<2||v>5000)throw Error('Auditorium delegates must be an integer between 2 and 5,000.');
 return v;
}
function scaleElectorate(profile,target){
 if(profile.total===target)return profile;
 const units=profile.groups.map((g,i)=>({i,exact:g.weight*target/profile.total}));
 const allocated=units.map(x=>Math.floor(x.exact));let left=target-allocated.reduce((a,b)=>a+b,0);
 units.sort((a,b)=>(b.exact-Math.floor(b.exact))-(a.exact-Math.floor(a.exact))||a.i-b.i);
 for(let k=0;k<left;k++)allocated[units[k].i]++;
 return {...profile,total:target,groups:profile.groups.flatMap((g,i)=>allocated[i]?[{...g,weight:allocated[i]}]:[])};
}
function configureSingle(){stopLive();try{currentScenario=scaleElectorate(parseScenario($('candidates').value,$('groups').value),auditoriumPopulation());current={before:methodState('before',currentScenario),after:methodState('after',currentScenario),approval:methodState('approval',currentScenario)};steps=0;$('formError').innerHTML='';}catch(e){currentScenario=null;current=null;steps=0;$('formError').innerHTML='<div class="error">'+escapeHtml(e.message)+'</div>';}renderSingle();resetAuditorium();renderTimingRows();}
// Result vocabulary affects announcements only, never vote arithmetic.
function resultVocabulary(){
 const kind=$('outcomeTerm')?.value||'winner';
 const custom=$('customOutcomeTerm')?.value.trim()||'selected candidate';
 const terms={winner:{noun:'winner',verb:'wins!',short:'WINNER'},nominee:{noun:'nominee',verb:'is nominated!',short:'NOMINEE'},endorsed:{noun:'endorsed candidate',verb:'is endorsed!',short:'ENDORSED'},selected:{noun:'selected candidate',verb:'is selected!',short:'SELECTED'}};
 return terms[kind]||{noun:custom,verb:'is '+custom+'!',short:custom.toUpperCase()};
}
function soleResultLabel(names){return 'Sole '+resultVocabulary().noun+': '+names.join(', ');}
function formatSimpleOutcome(st){if(st.blocked)return 'Unresolved cutoff / tie';if(st.done){const o=st.outcome;if(o.kind==='sole')return soleResultLabel(o.candidates);if(o.kind==='primary')return 'To primary: '+o.candidates.join(', ');if(o.kind==='approval_ambiguous')return 'Multiple 60% approvals: '+o.candidates.join(', ');return o.candidates.length?'≥60% approval: '+o.candidates.join(', '):'No 60% approval';}return st.round?'Still in: '+st.active.join(', '):'Cast first ballot to begin';}
function renderSingleMethod(id,st){const panel=$('view'+id),badge=$('status'+id);badge.textContent=st.blocked?'Unresolved':st.done?'Finished':st.round?'Round '+st.round:'Ready';badge.className='pill '+(st.blocked?'err':st.done?'ok':'');const last=st.history.at(-1);let html='<div class="outcome">'+escapeHtml(formatSimpleOutcome(st))+'</div>';
 if(last){const denominator=last.tally.cast||currentScenario.total;html+='<details class="methodVotes"><summary>'+last.ranking.slice(0,3).map(c=>escapeHtml(c)+': '+fmt(last.tally.votes[c]||0)).join(' · ')+(last.ranking.length>3?' …':'')+' · details</summary>';for(const c of last.ranking){const n=last.tally.votes[c]||0;const gone=last.decision?.removed?.includes(c);html+='<div class="barrow"><div class="barlabel"><span class="barname '+(gone?'elim':'')+'">'+escapeHtml(c)+'</span><span class="barval">'+fmt(n)+' · '+per(n,denominator).toFixed(1)+'%</span></div><div class="track"><i class="'+(gone?'dropped':'')+'" style="width:'+Math.min(100,per(n,denominator))+'%"></i></div></div>';}
 html+='</details><div class="summaryline"><span>Ballot '+last.round+'</span><span>'+fmt(denominator)+' cast</span>'+(last.decision?.removed?.length?'<span style="color:#a93240">Removed: '+last.decision.removed.map(escapeHtml).join(', ')+'</span>':'')+'</div>';}
 else html+='<p class="small muted">Candidate votes appear here.</p>';
 panel.innerHTML=html;
}
function renderPairBrief(){if(!currentScenario)return;const p=pairwiseReport(currentScenario),n=currentScenario.candidates;let html='<div class="tableScroll"><table class="miniTable"><thead><tr><th>Row vs.</th>'+n.map(c=>'<th>'+escapeHtml(c)+'</th>').join('')+'</tr></thead><tbody>';
 for(const a of n){html+='<tr><td><b>'+escapeHtml(a)+'</b></td>';for(const b of n){if(a===b){html+='<td>—</td>';continue;}const v=p.results[canonicalPair(a,b,n)],x=v[a],y=v[b];html+='<td class="'+(x>y?'pos':x<y?'neg':'tie')+'">'+x+'–'+y+'</td>';}html+='</tr>';}
 html+='</tbody></table></div>';const cw=n.filter(c=>n.every(d=>d===c||p.adj[c].includes(d)));
 html+='<p class="small">'+(cw.length?'Condorcet winner: <b>'+escapeHtml(cw[0])+'</b>':'No unique Condorcet winner')+(p.cycle?' · <b style="color:#ad3840">Cycle: '+p.cycle.map(escapeHtml).join(' → ')+'</b>':'')+'</p>';
 if(p.individualCycles)html+='<p class="small" style="color:#9b6b18">'+fmt(p.individualCycles)+' delegates declare nontransitive pairwise choices.</p>';
 $('pairs').innerHTML=html;
}
function renderSingle(){let valid=!!current,finished=!valid||Object.values(current).every(s=>s.done||s.blocked);$('step').disabled=!valid||scene.phase==='finished';$('play').disabled=!valid||scene.playing||scene.phase==='finished';$('pause').disabled=!scene.playing;
 if(!valid){for(const id of ['Before','After','Approval']){$('view'+id).innerHTML='<p class="small muted">Edit the inputs to continue.</p>';}return;}
 for(const [name,key] of [['Before','before'],['After','after'],['Approval','approval']])renderSingleMethod(name,current[key]);$('stepLabel').textContent='Ballot step '+steps;
 const p=pairwiseReport(currentScenario),cw=currentScenario.candidates.find(c=>currentScenario.candidates.every(d=>c===d||p.adj[c].includes(d)));
 const approval=approvalTally(currentScenario,opts()).votes,most=Math.max(...Object.values(approval)),leaders=currentScenario.candidates.filter(c=>approval[c]===most);$('breadthNote').textContent='Highest approval: '+leaders.join(' / ')+' ('+per(most,currentScenario.total).toFixed(1)+'%)'+(cw?' · CW: '+cw:' · no CW');
 const flags=[];for(const [label,st] of [['Existing',current.before],['B2026-10',current.after],['Approval',current.approval]])for(const h of st.history)for(const f of h.flags)if(f.level==='red'||f.level==='amber')flags.push({...f,label,round:h.round});
 for(const [label,st] of [['Existing',current.before],['B2026-10',current.after]]){const removed=st.history.flatMap(h=>h.decision?.removed||[]);if(removed.some(c=>leaders.includes(c)))flags.push({level:'red',label,round:st.round,title:'Highest-approval candidate eliminated',detail:leaders.filter(c=>removed.includes(c)).join(', ')+' has the most independent approval marks in this scenario, yet is removed before the final ballot.'});if(cw&&removed.includes(cw))flags.push({level:'red',label,round:st.round,title:'Condorcet winner eliminated',detail:cw+' defeats every rival head-to-head in this snapshot but does not survive the elimination sequence.'});}
 if(current.before.done&&current.after.done){const a=current.before.outcome,b=current.after.outcome;if(a.kind!==b.kind||a.candidates.slice().sort().join('|')!==b.candidates.slice().sort().join('|'))flags.unshift({level:'red',label:'Comparison',round:steps,title:'Different final results',detail:'Existing: '+formatSimpleOutcome(current.before)+' · B2026-10: '+formatSimpleOutcome(current.after)});}
 $('findCount').textContent='('+flags.length+')';$('findings').innerHTML=flags.length?flags.slice(0,14).map(f=>'<div class="flag '+(f.level==='red'?'':'warn')+'"><b>'+escapeHtml(f.title)+' · '+escapeHtml(f.label)+' / '+f.round+'</b>'+escapeHtml(f.detail)+'</div>').join('')+(flags.length>14?'<p class="small muted">+'+(flags.length-14)+' additional findings</p>':''):'<span class="small muted">'+(steps?'No flagged exceptions under this configuration.':'Press Step ballot or Play to compare outcomes.')+'</span>';
 renderPairBrief();
}
function stepOnce(){if(!current)return;let changed=false;for(const s of Object.values(current))if(!s.done&&!s.blocked){nextBallot(s,currentScenario,opts());changed=true;}if(changed)steps++;renderSingle();if(Object.values(current).every(s=>s.done||s.blocked))stopLive();}
function playLive(){auditoriumPlay();}
function selectTab(which){const single=which==='live';if(!single)auditoriumPause();$('singleView').classList.toggle('hide',!single);$('batchView').classList.toggle('hide',single);for(const [id,active] of [['tabLive',single],['tabBatch',!single]]){$(id).classList.toggle('active',active);$(id).setAttribute('aria-selected',active?'true':'false');}if(!single&&document.body.classList.contains('advanced-mode'))drawPlot();}
// ---------- Seeded, weighted Monte Carlo with dynamic choices and pairwise cycles ----------
const COLORS=['#567da5','#9564ac','#148776'];
const METHODS=['Existing','B2026-10','Approval adapter'];
const REGIMES=['Consensus','Fragmented','Polarized','Volatile','Pair cycles','Mixed'];
function mulberry32(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function gaussian(r){return (r()+r()+r()+r()+r()+r()-3)*1.41421356;}
function randint(r,min,max){return min+Math.floor(r()*(max-min+1));}
function shuffled(r,n){const a=Array.from({length:n},(_,i)=>i);for(let j=n-1;j>0;j--){const k=Math.floor(r()*(j+1));[a[k],a[j]]=[a[j],a[k]];}return a;}
function generateElection(r,params,regime){const k=randint(r,params.minCand,params.maxCand),basePos=Array.from({length:k},()=>[gaussian(r),gaussian(r)]),quality=Array.from({length:k},()=>gaussian(r)*.5), groups=[];
 const scattered=regime===1?1.5:regime===0?.58:1, noisiness=regime===1?1.8:regime===0?.48:regime===2?.7:1.05;
 const cycleRate=(regime===4?Math.max(.08,params.cycle):regime===0?params.cycle*.13:params.cycle*.43),vol=(regime===3?params.vol:regime===0?params.vol*.08:regime===4?params.vol*.45:params.vol*.35);
 let total=0,hasShifts=false;
 for(let g=0;g<params.blocs;g++){
  const cluster=regime===2?(r()<.5?-1:1):0;
  const ix=cluster*1.6+gaussian(r)*scattered,iy=gaussian(r)*scattered;
  const score=basePos.map(([x,y],c)=>quality[c]*.75-(x-ix)**2*.42-(y-iy)**2*.42+gaussian(r)*noisiness*.75);
  const order=Array.from({length:k},(_,j)=>j).sort((a,b)=>score[b]-score[a]||a-b), pos=Array(k);for(let i=0;i<k;i++)pos[order[i]]=i;
  const tolerance=(regime===0?1.75:regime===1?.75:regime===2?1.0:1.25)*(.68+.8*r());
  const approved=order.filter(c=>score[order[0]]-score[c]<=tolerance*(params.breadth??1));
  let cycle=null;if(k>=3&&r()<cycleRate){const q=order.slice(0,3);if(r()<.5)[q[1],q[2]]=[q[2],q[1]];cycle=q;}
  const r2=r()<vol?order[randint(r,1,Math.min(k-1,3))]:-1;
  const r3=r()<vol?order[randint(r,1,Math.min(k-1,3))]:-1;
  const ctx=r()<vol*.6&&k>=4?{absent:order[k-1],choose:order[Math.min(2,k-1)]}:null;
  if(r2>=0||r3>=0||ctx)hasShifts=true;
  const weight=randint(r,1,16);total+=weight;
  groups.push({order,pos,approved,weight,cycle,r2,r3,ctx});
 }
 const orderTie=shuffled(r,k),tie=Array(k);orderTie.forEach((c,i)=>tie[c]=i);
 const approve=Array(k).fill(0);for(const g of groups)for(const c of g.approved)approve[c]+=g.weight;
 const maxApproval=Math.max(...approve),leaders=approve.map((v,i)=>v===maxApproval?i:-1).filter(i=>i>=0);
 const pair=Array.from({length:k},()=>new Float64Array(k)),adj=Array.from({length:k},()=>[]);
 for(let a=0;a<k;a++)for(let b=a+1;b<k;b++){
  let va=0,vb=0;for(const g of groups){const chosen=choicePair(g,a,b);if(chosen===a)va+=g.weight;else vb+=g.weight;}
  pair[a][b]=va;pair[b][a]=vb;if(va>vb)adj[a].push(b);else if(vb>va)adj[b].push(a);
 }
 const cw=Array.from({length:k},(_,i)=>i).find(c=>adj[c].length===k-1)??-1;
 const cyc=hasDirectedCycle(adj);
 return {k,groups,total,approve,leaders,pair,adj,cw,cycle:cyc,hasShifts,tie};
}
function choicePair(g,a,b){
 if(g.pairOverrides){const v=g.pairOverrides[Math.min(a,b)+','+Math.max(a,b)];if(v!==undefined)return v;}
 if(g.cycle){const [x,y,z]=g.cycle;const at=(c)=>c===x||c===y||c===z;
 if(at(a)&&at(b)){const win=(a===x&&b===y)||(a===y&&b===z)||(a===z&&b===x);return win?a:b;}}
 return g.pos[a]<g.pos[b]?a:b;
}
function hasDirectedCycle(adj){const vis=new Uint8Array(adj.length);function walk(v){vis[v]=1;for(const u of adj[v]){if(vis[u]===1)return true;if(vis[u]===0&&walk(u))return true;}vis[v]=2;return false;}for(let i=0;i<adj.length;i++)if(vis[i]===0&&walk(i))return true;return false;}
function choiceRound(g,active,round){const sw=round===2?g.r2:round>=3?g.r3:-1;if(sw>=0&&active.includes(sw))return sw;
 if(g.fields){const key=active.slice().sort((a,b)=>a-b).join(',');const ch=g.fields[key];if(ch!==undefined&&active.includes(ch))return ch;}
 if(g.ctx&&!active.includes(g.ctx.absent)&&active.includes(g.ctx.choose))return g.ctx.choose;
 if(active.length===2)return choicePair(g,active[0],active[1]);
 for(const c of g.order)if(active.includes(c))return c;
 return -1;}
function ranked(votes,active,tie){return active.slice().sort((a,b)=>votes[b]-votes[a]||tie[a]-tie[b]);}
function fastElection(p,method){const {k,groups,total,approve,tie}=p,leaders=p.leaders;let active=Array.from({length:k},(_,i)=>i),rounds=0,eliminated=Array(k).fill(false),finalists=[],sole=false;
 if(method===2){const sorted=ranked(approve,active,tie),qual=sorted.filter(c=>approve[c]*5>=3*total);sole=qual.length===1;finalists=sole?qual:sorted.slice(0,2);rounds=1;}
 else{for(let round=1;round<=5;round++){
   rounds=round;const votes=new Float64Array(k);for(const g of groups){const pick=choiceRound(g,active,round);if(pick>=0)votes[pick]+=g.weight;}
   const sorted=ranked(votes,active,tie);
   if(votes[sorted[0]]*5>=3*total){finalists=[sorted[0]];sole=true;break;}
   if(active.length===2){finalists=sorted;break;}
   let keep;
   if(round>=2||(method===0&&active.length<5)){keep=sorted.slice(0,2);}
   else if(method===0){let remove=1;for(let size=2;size<=active.length-2;size++){
     let sum=0;for(let m=sorted.length-size;m<sorted.length;m++)sum+=votes[sorted[m]];
     if(sum<votes[sorted[sorted.length-size-1]]){remove=size;break;}}
     keep=sorted.slice(0,sorted.length-remove);
   }else{let keepCount=sorted.length-1;for(let i=1;i<=sorted.length-2;i++){
     let sum=0;for(let j=i+1;j<sorted.length;j++)sum+=votes[sorted[j]];
     if(sum<votes[sorted[i]]){keepCount=i+1;break;}}
     keep=sorted.slice(0,keepCount);
   }
   const set=new Set(keep);for(const c of active)if(!set.has(c))eliminated[c]=true;active=keep;
 }}
 let favorTotal=0,favorPairs=0;for(const c of finalists)for(let d=0;d<k;d++)if(c!==d){favorTotal+=p.pair[c][d]/total;favorPairs++;}
 const pairFavor=100*favorTotal/favorPairs;
 const retained=(c)=>c>=0&&finalists.includes(c),leaderOmitted=leaders.every(c=>!retained(c)),leaderRemoved=leaders.some(c=>eliminated[c]);
 return {finalists,sole,rounds,pairFavor,cwKeep:retained(p.cw),cwRemoved:p.cw>=0&&eliminated[p.cw],leaderOmitted,leaderRemoved};
}
function emptyAggregate(){return {n:0,cwExists:0,cycles:0,shifts:0,sums:Array.from({length:3},()=>({cwKept:0,cwRemoved:0,omitted:0,removed:0,rounds:0,sole:0,favor:0}))};}
function addTrial(agg,p,outs){agg.n++;if(p.cw>=0)agg.cwExists++;if(p.cycle)agg.cycles++;if(p.hasShifts)agg.shifts++;
 for(let m=0;m<3;m++){const a=agg.sums[m],o=outs[m];if(p.cw>=0){if(o.cwKeep)a.cwKept++;if(o.cwRemoved)a.cwRemoved++;}if(o.leaderOmitted)a.omitted++;if(o.leaderRemoved)a.removed++;a.rounds+=o.rounds;a.favor+=o.pairFavor;if(o.sole)a.sole++;}}
let sweep=null,plotHits=[],sweepSequence=0;
function selectedCaseIds(){return [...document.querySelectorAll('#conditionList input[type=checkbox]:checked')].map(x=>x.value);}
function selectedCaseWeights(){const v={};document.querySelectorAll('#conditionList label').forEach(row=>{
 const check=row.querySelector('input[type=checkbox]'),number=row.querySelector('input.caseWeight');
 if(check.checked){const weight=Number(number.value);if(Number.isFinite(weight)&&weight>0)v[check.value]=weight;}
});return v;}
function samplePool(params){
 const broad=REGIMES.map((label,i)=>({label:'Random · '+label,type:'random',value:i,weight:1,sizes:Array.from({length:params.maxCand-params.minCand+1},(_,j)=>params.minCand+j)}));
 const named=params.cases.map(id=>({label:'Case · '+PRESETS.find(p=>p.id===id).title,type:'case',value:id,weight:params.weights[id]||0,sizes:viableCaseSizes(id,params.minCand,params.maxCand)})).filter(x=>x.weight>0&&x.sizes.length);
 return params.source==='random'?broad:params.source==='cases'?named:[...broad,...named];
}
function batchSettings(){let minCand=+$('minCand').value,maxCand=+$('maxCand').value,blocs=+$('numBlocs').value,vol=+$('volatility').value/100,cycle=+$('cycles').value/100,breadth=+$('breadth').value/100,seed=+$('seed').value;
 if(!Number.isInteger(seed)||seed<=0||seed>4294967295)throw Error('Seed must be between 1 and 4294967295.');
 if(!Number.isInteger(minCand)||!Number.isInteger(maxCand)||minCand<2||maxCand>12||minCand>maxCand)throw Error('Candidate range must be within 2–12, min ≤ max.');
 if(!Number.isInteger(blocs)||blocs<6||blocs>80)throw Error('Voter groups must be 6–80.');
 const source=$('population').value,weights=selectedCaseWeights(),cases=Object.keys(weights),variation=+$('caseVariation').value/100,share=+$('caseShare').value/100;
 if(source!=='random'&&!cases.length)throw Error('Select at least one positive-weight named condition.');
 return {minCand,maxCand,blocs,vol,cycle,breadth,seed,source,cases,weights,variation,share,overlay:$('overlayNamed').checked};}
function weightedPick(r,items){const total=items.reduce((sum,x)=>sum+x.weight,0);let q=r()*total;for(const x of items){q-=x.weight;if(q<0)return x;}return items[items.length-1];}
function createSampler(params,seed){
 const pool=samplePool(params),random=pool.filter(x=>x.type==='random'),named=pool.filter(x=>x.type==='case');
 const wantsCases=params.source==='cases'||(params.source==='mixed'&&params.share>0);
 if(wantsCases&&!named.length)throw Error('No selected condition supports the requested candidate count. Adjust the candidate range or condition weights.');
 if(!pool.length)throw Error('No compatible models in the requested candidate range.');
 return {pool,random,named,rng:mulberry32(seed)};
}
function sampleElection(model,params){
 const r=model.rng;
 const named=model.named.length&&(params.source==='cases'||(params.source==='mixed'&&(model.random.length===0||r()<params.share)));
 const items=named?model.named:model.random;if(!items.length)return null;
 const item=weightedPick(r,items),k=item.sizes[randint(r,0,item.sizes.length-1)];
 if(item.type==='case'){
  const sample=randomizedSizedCase(r,item.value,k,params.variation);
  const overlaid=params.overlay?overlayNamedCase(r,sample.profile,item.value,params):null;
  if(overlaid)sample.profile=overlaid;sample.overlay=Boolean(overlaid);
  if(!caseSignature(sample.profile,item.value))throw Error('Condition verification failed for '+item.value+' with '+k+' candidates.');
  return {profile:sample.profile,item,locked:sample.locked,overlay:sample.overlay};
 }
 return {profile:generateElection(r,{...params,minCand:k,maxCand:k},item.value),item,locked:false};
}
function batchMessage(message){
 const el=$('batchError');
 if(!el)return;
 el.textContent=message||'';
 el.classList.toggle('hide',!message);
}
function startBatch(){if(sweep?.running||effectTask?.running)return;let params,model;
 try{params=batchSettings();model=createSampler(params,params.seed);}catch(e){$('batchStatus').textContent='Cannot start';batchMessage(e.message);return;}
 batchMessage('');
 const pool=model.pool,target=+$('trials').value;
 sweep={running:true,token:++sweepSequence,rng:model.rng,model,params,target,pool,labels:pool.map(x=>x.label),total:emptyAggregate(),byRegime:pool.map(emptyAggregate),byBin:pool.map(()=>Array.from({length:13},emptyAggregate)),byK:Array.from({length:13},emptyAggregate),lastRender:0,lockedCases:0,caseDraws:0,overlayDraws:0};
 $('runBatch').disabled=true;$('stopBatch').disabled=false;$('exportCSV').disabled=true;$('batchStatus').textContent='Starting…';setTimeout(()=>batchChunk(sweep.token),16);}
function batchChunk(token){if(!sweep?.running||sweep.token!==token)return;const until=performance.now()+5;
 try{while(sweep.running&&(sweep.target===0||sweep.total.n<sweep.target)&&performance.now()<until){
  const sampled=sampleElection(sweep.model,sweep.params);if(!sampled)continue;
  const p=sampled.profile,index=sweep.pool.indexOf(sampled.item),outs=[fastElection(p,0),fastElection(p,1),fastElection(p,2)];
  if(sampled.item.type==='case'){sweep.caseDraws++;if(sampled.locked)sweep.lockedCases++;if(sampled.overlay)sweep.overlayDraws++;}
  addTrial(sweep.total,p,outs);addTrial(sweep.byRegime[index],p,outs);addTrial(sweep.byBin[index][p.k],p,outs);addTrial(sweep.byK[p.k],p,outs);
 }}catch(e){sweep.error='Simulation error: '+e.message;console.error(e);finishBatch();return;}
 try{
  if(Date.now()-sweep.lastRender>500||!sweep.running||(sweep.target>0&&sweep.total.n>=sweep.target)){
   updateBatchUI();sweep.lastRender=Date.now();
  }
 }catch(e){sweep.error='Display error: '+e.message;console.error(e);finishBatch();return;}
 if(sweep.running&&(sweep.target===0||sweep.total.n<sweep.target))setTimeout(()=>batchChunk(token),16);else finishBatch();}
function finishBatch(){
 if(!sweep)return;
 sweep.running=false;
 $('runBatch').disabled=false;$('stopBatch').disabled=true;
 $('exportCSV').disabled=sweep.total.n===0;
 try{updateBatchUI();}catch(e){sweep.error=sweep.error||'Display error: '+e.message;}
 if(sweep.error){batchMessage(sweep.error);$('batchStatus').textContent='Stopped with error after '+fmt(sweep.total.n)+' trials';}
}
function stopBatch(){if(!sweep?.running)return;sweep.running=false;finishBatch();}
function aggregateRow(a,i){const s=a.sums[i];return {name:METHODS[i],cw:a.cwExists?100*s.cwKept/a.cwExists:null,omitted:a.n?100*s.omitted/a.n:null,removed:a.n?100*s.removed/a.n:null,rounds:a.n?s.rounds/a.n:null,favor:a.n?s.favor/a.n:null,sole:a.n?100*s.sole/a.n:null,cn:a.cwExists,n:a.n};}
function pctString(x,digits=1){return x===null||!Number.isFinite(x)?'—':x.toFixed(digits)+'%';}
function updateBatchUI(){if(!sweep)return;const a=sweep.total;$('kCount').textContent=fmt(a.n);$('kCW').textContent=pctString(per(a.cwExists,a.n));$('kCycle').textContent=pctString(per(a.cycles,a.n));$('kShift').textContent=pctString(per(a.shifts,a.n));$('kBroad').textContent=a.n?fmt(a.sums[0].omitted)+' / '+fmt(a.n):'—';
 $('batchStatus').textContent=fmt(a.n)+(sweep.target?' / '+fmt(sweep.target):' / ∞')+(sweep.precomputed?' · precomputed seed '+sweep.params.seed:sweep.running?' · running':' · stopped/completed');$('batchProgress').style.width=sweep.target?(100*a.n/sweep.target).toFixed(3)+'%':a.n?'100%':'0%';
 const rows=[0,1,2].map(i=>aggregateRow(a,i));$('batchTable').innerHTML=rows.map((r,i)=>'<tr><td style="font-weight:750;color:'+COLORS[i]+'">'+r.name+'</td><td>'+pctString(r.cw)+'</td><td>'+pctString(r.favor)+'</td><td>'+pctString(r.omitted)+'</td><td>'+pctString(r.removed)+'</td><td>'+r.rounds.toFixed(2)+'</td></tr>').join('');
 $('exportCSV').disabled=a.n===0;
 const names=sweep.labels||REGIMES;
 const covered=names.map((name,i)=>({name,n:sweep.byRegime[i]?.n||0})).filter(x=>x.n>0);
 $('caseAudit').textContent=sweep.caseDraws?`${fmt(sweep.caseDraws)} named-case trials; ${fmt(sweep.overlayDraws||0)} received one or more compatible behavior overlays; ${fmt(sweep.lockedCases)} retained original ballot weights. Every named ballot is checked against its primary condition. Selected named families are mixed across elections; compatible behavioral features may also coexist within an election.`: 'This run uses broad random voter models only; the named cases are not specifically enforced.';
 $('coveredCases').innerHTML=covered.map(x=>'<span class="coverageItem">'+escapeHtml(x.name)+': <b>'+fmt(x.n)+'</b></span>').join('');
 const byK=sweep.byK||[];
 $('byCandidate').innerHTML=byK.map((agg,k)=>({agg,k})).filter(x=>x.agg?.n).map(({agg,k})=>{
  const a=[0,1,2].map(i=>aggregateRow(agg,i));return '<tr><td>'+k+'</td><td>'+fmt(agg.n)+'</td>'+a.map(v=>'<td>'+pctString(v.cw)+'</td>').join('')+'<td>'+pctString(a[0].omitted)+'</td><td>'+pctString(a[1].omitted)+'</td></tr>';
 }).join('')||'<tr><td colspan="7">No candidate-count data from this run.</td></tr>';
 const incompat=sweep.params.source==='random'?[]:sweep.params.cases.map(id=>({id,sizes:viableCaseSizes(id,sweep.params.minCand,sweep.params.maxCand)})).filter(x=>x.sizes.length!==sweep.params.maxCand-sweep.params.minCand+1);
 $('compatibilityNote').textContent=incompat.length?incompat.map(x=>PRESETS.find(p=>p.id===x.id).title+': '+(x.sizes.length?x.sizes.join(', ')+' candidates only':'not compatible')).join(' · '):'All selected conditions are compatible with the sampled candidate counts.';
 if(document.body.classList.contains('advanced-mode'))drawPlot();}
function frontierPoints(points){const sorted=points.slice().sort((a,b)=>a.x-b.x||b.y-a.y),res=[];let high=-1;
 for(const p of sorted){if(p.y>high+1e-7){res.push(p);high=p.y;}}return res;}
function drawPlot(){if(!document.body.classList.contains('advanced-mode'))return;const c=$('frontier');if(!c||c.closest('.hide'))return;
 const box=c.getBoundingClientRect(),w=Math.round(box.width)||800,h=Math.round(box.height)||335,dpr=Math.min(2,window.devicePixelRatio||1);if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr;}const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const L=51,R=17,T=15,B=42,W=Math.max(50,w-L-R),H=Math.max(70,h-T-B),axis=$('chartAxis').value,metric=$('chartMetric').value,xmin=axis==='rounds'?1:0,hiOmit=sweep?.byBin?.flatMap(aa=>aa.flatMap(a=>a.n>=30?a.sums.map(s=>100*s.omitted/a.n):[]))||[],xmax=axis==='rounds'?3.5:Math.min(100,Math.max(10,Math.ceil((Math.max(0,...hiOmit)+3)/10)*10)),xF=x=>L+(x-xmin)/(xmax-xmin)*W,yF=y=>T+(100-y)/100*H;plotHits=[];
 ctx.font='11px system-ui';ctx.fillStyle='#647487';ctx.strokeStyle='#e6ebf0';ctx.lineWidth=1;for(let j=0;j<=4;j++){const y=j*25;ctx.beginPath();ctx.moveTo(L,yF(y));ctx.lineTo(L+W,yF(y));ctx.stroke();ctx.fillText(y+'%',L-35,yF(y)+4);}
 const ticks=axis==='rounds'?[1,1.5,2,2.5,3,3.5]:Array.from({length:5},(_,i)=>i*xmax/4);ctx.textAlign='center';for(const v of ticks){ctx.fillText(axis==='rounds'?v.toFixed(1):v.toFixed(xmax%4===0?0:1)+'%',xF(v),h-B+18);}ctx.fillText(axis==='rounds'?'Mean ballots per contest →':'Approval leader omitted (%) →',L+W/2,h-7);ctx.save();ctx.translate(12,T+H/2);ctx.rotate(-Math.PI/2);ctx.fillText(metric==='cw'?'Condorcet winner retained (%) →':'Mean head-to-head support (%) →',0,0);ctx.restore();ctx.textAlign='left';
 if(!sweep?.total.n){ctx.font='14px system-ui';ctx.fillStyle='#718193';ctx.textAlign='center';ctx.fillText('Run a randomized sweep to draw the frontiers',L+W/2,T+H/2);ctx.textAlign='left';return;}
 for(let m=0;m<3;m++){const points=sweep.byBin.flatMap((bin,g)=>bin.map((a,k)=>({g:g*20+k,regime:(sweep.labels||REGIMES)[g]+' · '+k+' candidates',...aggregateRow(a,m)}))).filter(z=>z.n>=Math.max(5,Math.floor((sweep.total.n||0)/3000))&&z.cn>=Math.max(2,Math.floor((sweep.total.n||0)/6000))).map(z=>({...z,x:axis==='rounds'?z.rounds:z.omitted,y:metric==='cw'?z.cw:z.favor}));if(!points.length)continue;
 const frontier=frontierPoints(points),keySet=new Set(frontier.map(p=>p.g)),color=COLORS[m];
 ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();frontier.forEach((p,i)=>{const x=xF(p.x),y=yF(p.y);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
 for(const p of points){const px=xF(p.x),py=yF(p.y),f=keySet.has(p.g);ctx.save();ctx.globalAlpha=f?1:0.52;ctx.beginPath();ctx.arc(px,py,f?5:3.6,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.fillStyle=f?color:'#fff';ctx.fill();ctx.stroke();ctx.restore();plotHits.push({x:px,y:py,method:METHODS[m],regime:p.regime,n:p.n,cw:p.cw,omitted:p.omitted,rounds:p.rounds,frontier:f,favor:p.favor});}
 }
}
function exportRegimeCSV(){if(!sweep?.total.n)return;
 const csvCell=v=>{const str=String(v??'');return /[",\n\r]/.test(str)?'"'+str.replace(/"/g,'""')+'"':str;};
 const lines=[['condition_or_regime','method','elections','condorcet_winners','condorcet_retained_pct','pairwise_support_pct','approval_leader_omitted_pct','approval_leader_eliminated_pct','mean_ballots','sole_nomination_pct'].map(csvCell).join(',')];
 for(let i=0;i<sweep.byRegime.length;i++)for(let m=0;m<3;m++){
  const z=aggregateRow(sweep.byRegime[i],m);
  lines.push([(sweep.labels||REGIMES)[i],METHODS[m],z.n,z.cn,z.cw??'',z.favor??'',z.omitted??'',z.removed??'',z.rounds??'',z.sole??''].map(csvCell).join(','));
 }
 const blob=new Blob([lines.join('\n')+'\n'],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ucrp-voting-conditions-'+sweep.params.seed+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function extraTests(){let n=0;function check(name,truth){if(!truth)throw Error(name);n++;}
 const a=mulberry32(145),b=mulberry32(145);check('seed deterministic',Array.from({length:20},()=>a()).every(x=>x===b()));
 const r=mulberry32(2026),settings={minCand:3,maxCand:7,blocs:16,vol:.5,cycle:.35};let cycles=0,volatiles=0,cc=0;
 for(let i=0;i<220;i++){const p=generateElection(r,settings,i%6);check('approval leader nonempty and equal to max',p.leaders.length>0&&p.leaders.every(c=>p.approve[c]===Math.max(...p.approve)));
 check('all group weights sum to denominator',p.groups.reduce((v,g)=>v+g.weight,0)===p.total);
 const outs=[0,1,2].map(m=>fastElection(p,m));for(const out of outs)check('nominee count 1 or 2',out.finalists.length===(out.sole?1:2));
 check('approval adapter retains top approval candidate',p.leaders.some(c=>outs[2].finalists.includes(c)));for(const out of outs)check('pairwise favorability in [0,100]',out.pairFavor>=0&&out.pairFavor<=100);
 for(let x=0;x<p.k;x++)for(let y=x+1;y<p.k;y++)check('pairwise totals sum to all voters',p.pair[x][y]+p.pair[y][x]===p.total);
 if(p.cw>=0){cc++;check('Condorcet wins every other pair',p.adj[p.cw].length===p.k-1);}
 if(p.cycle)cycles++;if(p.hasShifts)volatiles++;
 }
 check('cycle-generating process created cycles',cycles>0);check('round changes generated',volatiles>0);check('Condorcet cases generated',cc>0);
 const p=generateElection(mulberry32(111),settings,4);const set1=fastElection(p,0),set2=fastElection(p,0);check('same election produces same outcome',set1.finalists.join(',')===set2.finalists.join(',')&&set1.rounds===set2.rounds);
 const f=frontierPoints([{g:0,x:0,y:40},{g:1,x:10,y:30},{g:2,x:20,y:90},{g:3,x:30,y:89}]);check('Pareto envelope excludes dominated points',f.length===2&&f[0].g===0&&f[1].g===2);
 return n;
}
function showTests(){try{const a=tests().length,b=extraTests(),c=conditionSamplesCheck();$('testsStatus').textContent='PASS · '+a+' original checks + '+b+' Monte Carlo invariants + '+c+' conditioned cases';}catch(e){$('testsStatus').textContent='FAILED · '+e.message;$('testsStatus').style.color='#b12e3d';console.error(e);}}
function initCompact(){
 // Keep the accessible basic simulator and stress results visible by default.
 const advancedButton=$('advancedToggle');
 advancedButton.addEventListener('click',()=>{
  const on=document.body.classList.toggle('advanced-mode');
  advancedButton.setAttribute('aria-pressed',String(on));
  $('advancedToggleMark').textContent=on?'On':'Off';
  if(on && !$('batchView').classList.contains('hide')){requestAnimationFrame(()=>{drawPlot();drawEffectChart();});}
 });
 initRuleEditor();document.querySelectorAll('#mobileViews button').forEach(b=>b.addEventListener('click',()=>{const pane=b.dataset.pane;$('singleView').dataset.mobilePane=pane;document.querySelectorAll('#mobileViews button').forEach(x=>x.classList.toggle('selected',x===b));if(pane==='code'){ruleRenderKey='';renderRuleCode();}}));$('preset').innerHTML='<option value="random">🎲 Random election</option>'+PRESETS.map(p=>'<option value="'+escapeHtml(p.id)+'">'+escapeHtml(p.title)+'</option>').join('');$('preset').addEventListener('change',e=>loadPresetCompact(e.target.value));$('newRandom').addEventListener('click',newRandomElection);$('liveCandidates').addEventListener('change',newRandomElection);
 $('step').addEventListener('click',phaseStep);$('play').addEventListener('click',auditoriumPlay);$('pause').addEventListener('click',auditoriumPause);$('reset').addEventListener('click',configureSingle);$('applyCustom').addEventListener('click',()=>{presetId='custom';$('presetDesc').textContent='Custom electorate — explicit round shifts, approval sets and pairwise overrides apply.';configureSingle();});
 for(const id of ['currentMode','precedence','tieMode','approvalMode','approvalTopN'])$(id).addEventListener('change',configureSingle);
 $('speed').addEventListener('input',refreshAuditorium);
 $('tabLive').addEventListener('click',()=>selectTab('live'));$('tabBatch').addEventListener('click',()=>selectTab('batch'));
 $('conditionList').innerHTML=PRESETS.map(p=>'<label><input type="checkbox" value="'+escapeHtml(p.id)+'" checked><span>'+escapeHtml(p.title)+(EXACT_CASES.has(p.id)?' <small>(exact boundary)</small>':'')+'</span><input class="caseWeight" type="number" min="0" max="1000" step="0.5" value="1" aria-label="Relative weight for '+escapeHtml(p.title)+'" title="Relative sampling weight"></label>').join('');
 const caseStatus=()=>{const n=Object.keys(selectedCaseWeights()).length,ws=Object.values(selectedCaseWeights()),total=ws.reduce((a,b)=>a+b,0);$('conditionSummary').textContent=n+' of '+PRESETS.length+' active · '+total.toFixed(1)+' total weight';};
 $('conditionList').addEventListener('change',caseStatus);
 $('chooseAll').addEventListener('click',()=>{$('conditionList').querySelectorAll('input[type=checkbox]').forEach(x=>x.checked=true);caseStatus();});
 $('chooseNone').addEventListener('click',()=>{$('conditionList').querySelectorAll('input[type=checkbox]').forEach(x=>x.checked=false);caseStatus();});
 $('population').addEventListener('change',()=>{$('caseDetails').classList.toggle('hide',$('population').value==='random');$('caseShareLabel').classList.toggle('hide',$('population').value!=='mixed');});
 $('caseVariation').addEventListener('input',()=>{$('variationLabel').textContent=$('caseVariation').value+'%';});
 $('caseShare').addEventListener('input',()=>{$('shareLabel').textContent=$('caseShare').value+'%';});
 caseStatus();initSensitivity();
 $('runBatch').addEventListener('click',startBatch);$('stopBatch').addEventListener('click',stopBatch);$('chartAxis').addEventListener('change',drawPlot);$('chartMetric').addEventListener('change',drawPlot);$('exportCSV').addEventListener('click',exportRegimeCSV);$('testButton').addEventListener('click',showTests);
 for(const [input,label] of [['volatility','volLabel'],['cycles','cycleLabel'],['breadth','breadthLabel']])$(input).addEventListener('input',()=>{$(label).textContent=$(input).value+'%';});
 $('frontier').addEventListener('mousemove',e=>{const box=$('frontier').getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;let found=null,d=18*18;for(const hit of plotHits){const dist=(hit.x-x)**2+(hit.y-y)**2;if(dist<d){found=hit;d=dist;}}
 $('chartTip').textContent=found?found.method+' · '+found.regime+' · '+fmt(found.n)+' trials · CW kept '+pctString(found.cw)+' · approval leader omitted '+pctString(found.omitted)+' · '+found.rounds.toFixed(2)+' ballots'+(found.frontier?' · on frontier':''):'Hover over a dot to inspect its scenario regime.';});
 window.addEventListener('resize',()=>{if(!$('batchView').classList.contains('hide')){drawPlot();drawEffectChart();}});
 $('outcomeTerm').addEventListener('change',()=>{$('customOutcomeTerm').classList.toggle('hide',$('outcomeTerm').value!=='custom');renderSingle();refreshAuditorium();});
 $('customOutcomeTerm').addEventListener('input',()=>{renderSingle();refreshAuditorium();});
 window.UCRPVotingLab={newRandomElection,getRandomSeed:()=>lastRandomSeed,parseScenario,ballot,approvalTally,pairwiseReport,currentElimination,proposeElimination,nextBallot,generateElection,fastElection,randomizedCase,caseSignature,conditionSamplesCheck,tests,extraTests,step:stepOnce,loadPreset:loadPresetCompact,getState:()=>current,getSweep:()=>sweep,getEffects:()=>effectResults,viableCaseSizes,randomizedSizedCase,resizeCaseProfile};
 newRandomElection();
 // Results are not preloaded: user-adjusted candidate counts and condition weights must be honored.

}
try {
 initCompact();
 initAuditorium();
 const boot = document.getElementById('bootStatus');
 if (boot) boot.hidden = true;
 document.documentElement.dataset.simulatorReady = 'true';
} catch (error) {
 const boot = document.getElementById('bootStatus');
 if (boot) {
  boot.hidden = false;
  boot.textContent = 'Simulator startup failed: ' + (error?.message || String(error));
  boot.className = 'bootError';
 }
 console.error('Voting simulator startup failure:', error);
}

})();