// Sue's task engine. The list is Sue's: she enters tasks, her standing directives only SUGGEST tasks she can accept,
// John and Team Leads add theirs. HubSpot is read only as the evidence that confirms a task on Friday.
// HubSpot's own task list is not used here. Everything Sue enters is kept in this browser for the prototype.
window.ENG = (function(){
  const M=window.MCA; if(!M) return null; const {D,esc,fmtD,chf,sum}=M;
  const LARGE = 20000, LAPSED_DAYS = 90;
  const SEED = [
    {id:'inbound',   name:'Inbound leads on the 12 day cadence', rule:'Day 1, 2, 4, 8, 12: call, email and LinkedIn message', done:'Each cadence step done and logged on the day', evidence:'A call, an email and a LinkedIn message logged on the lead today', perWeek:3, color:'#f472d0', active:true},
    {id:'pipeline',  name:'Pipeline in date', rule:'No close date in the past, next step set, contact in the last 14 days', done:'Deal updated and contact logged the same week it is flagged', evidence:'Close date moved to the future or Closed Lost with a reason; a contact logged this week', perWeek:3, color:'#ff4d6d', active:true},
    {id:'prospects', name:'Two strategic prospects worked every week', rule:'Two named companies that have never bought; one touch each per week, goal a meeting', done:'At least one logged outreach or meeting on each, next step dated', evidence:'An outreach or meeting logged on the company this week, next activity date set', perWeek:2, color:'#22e5ff', active:true},
    {id:'large',     name:'Large deals have a senior sponsor', rule:'Deals of CHF 20k and above: Sue, John or Oddmund in early', done:'Sponsor named on the deal at discovery or proposal', evidence:'Sponsor named on the deal', perWeek:2, color:'#f59e0b', active:true},
    {id:'top20',     name:'Top 20 priority accounts worked', rule:'Activity across the list every week; account plan live', done:'Logged activity against the accounts tasked that week', evidence:'An activity logged on the company this week, next activity date set', perWeek:4, color:'#8b5cf6', active:true},
    {id:'top25',     name:'Top 25 with John', rule:'Joint action agreed with John, reported at parent level', done:'Agreed actions done and logged on the parent or any entity', evidence:'An activity logged on the parent or an entity this week', perWeek:2, color:'#6d8bff', active:true},
    {id:'lapsed',    name:'Large accounts not come back', rule:'CHF 20k+ in 24 months, nothing won in 12: owner, reason, next action', done:'Activity in the last 30 days, reason recorded, dated next step', evidence:'Reason not returned filled, a contact logged, next activity date set', perWeek:2, color:'#2ef0d0', active:true},
    {id:'demo',      name:'Demo feedback within 24 hours', rule:'Structured feedback after every demo', done:'Feedback logged: what landed, objections, competitors, next step', evidence:'A feedback note on the meeting within 24 hours', perWeek:2, color:'#3dffa2', active:true},
    {id:'hygiene',   name:'Every meeting typed within 2 days', rule:'Call and meeting type and outcome on every meeting', done:'Type and outcome set', evidence:'Call and meeting type and outcome set on every meeting', perWeek:1, color:'#a9bad2', active:true},
    {id:'protected', name:'Protected new business hour', rule:'One hour a week, held, calls logged in it', done:'New business activity logged during the slot', evidence:'Calls logged inside the booked slot', perWeek:1, color:'#60a5fa', active:true},
    {id:'other',     name:'Other (set by hand)', rule:'Anything Sue, John or a Team Lead asks for', done:'As written on the task', evidence:'As written on the task', perWeek:0, color:'#c7d4e6', active:true},
  ];
  const store=(k,d)=>{try{const v=JSON.parse(localStorage.getItem('mca.'+k));return v==null?d:v;}catch(e){return d;}}; const put=(k,v)=>localStorage.setItem('mca.'+k,JSON.stringify(v));
  const directives=()=>{ const saved=store('directives',{}); return SEED.map(x=>Object.assign({},x,saved[x.id]||{})); };
  const saveDirective=(id,patch)=>{ const s=store('directives',{}); s[id]=Object.assign(s[id]||{},patch); put('directives',s); };
  const wsById=()=>Object.fromEntries(directives().map(w=>[w.id,w]));
  const day = n => { const d=M.toDate(M.W.start); d.setUTCDate(d.getUTCDate()+n); return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}); };
  const DUE = {Mon:day(0),Tue:day(1),Wed:day(2),Thu:day(3),Fri:day(4)};
  const short = s => s.length>70? s.slice(0,68)+'…' : s;
  // ---- Sue's tasks (the real list) ----
  const tasks=()=>store('suetasks',[]); const saveTasks=a=>put('suetasks',a);
  const addTask=t=>{const a=tasks();const n=Object.assign({id:'t'+Date.now()+Math.random().toString(36).slice(2,6),status:'open',created:M.today,setBy:'Sue',ws:'other',notes:[]},t);a.push(n);saveTasks(a);return n;};
  const updateTask=(id,patch)=>{const a=tasks();const i=a.findIndex(t=>t.id===id);if(i>=0){Object.assign(a[i],patch);saveTasks(a);}};
  const deleteTask=id=>saveTasks(tasks().filter(t=>t.id!==id));
  const addNote=(id,from,text)=>{const a=tasks();const t=a.find(t=>t.id===id);if(t){t.notes=t.notes||[];t.notes.push({from,text,at:M.today});saveTasks(a);}};
  const dismissed=()=>store('dismissed',{}); const dismiss=key=>{const r=dismissed();r[key]=true;put('dismissed',r);};
  // ---- messages (Teams drafts) and replies ----
  const msgs=()=>store('msgs',[]); const addMsg=m=>{const a=msgs();a.unshift(Object.assign({id:'g'+Date.now(),at:M.today,status:'queued'},m));put('msgs',a);};
  const replies=()=>store('replies',[]); const addReply=r=>{const a=replies();a.unshift(Object.assign({id:'r'+Date.now(),at:M.today},r));put('replies',a);};
  const resetAll=()=>['suetasks','dismissed','msgs','replies','directives','seeded'].forEach(k=>localStorage.removeItem('mca.'+k));

  // ---- suggestions from Sue's directives, for one rep ----
  function suggest(s){ const W=wsById(); const t=[]; const rep=s.r.id;
    const T=(ws,o)=>{ if(!W[ws]||!W[ws].active||!W[ws].perWeek) return; t.push(Object.assign({ws,rep,evidence:W[ws].evidence},o)); };
    s.inbound.slice(0,W.inbound.perWeek).forEach(x=>T('inbound',{account:x.subject.replace(/^New Lead in: /,'').replace(/\| Company: ?/,'').replace(/\| Prospect: ?/,' · '),contact:'The lead',action:'Cadence step due today: call, email and LinkedIn message',due:'Today',doneWhen:'All three logged on the lead',prio:1}));
    s.pastList.slice(0,Math.max(0,W.pipeline.perWeek-1)).forEach(d=>T('pipeline',{account:short(d.name),contact:'Deal contact',action:'Move the close date or close the deal (was due '+fmtD(d.close)+(d.amount?', '+chf(d.amount):'')+')',due:DUE.Tue,doneWhen:'Close date in the future with a next step, or Closed Lost with a reason',prio:2}));
    s.staleList.slice(0,1).forEach(d=>T('pipeline',{account:short(d.name),contact:'Deal contact',action:'Log a contact and set a dated next step (no activity since '+fmtD(d.lastActivity)+')',due:DUE.Thu,doneWhen:'Contact logged, next step dated',prio:2}));
    if(s.prospects.length) s.prospects.slice(0,2).forEach(a=>T('prospects',{account:a.name,contact:'Head of Events (confirm in HubSpot)',action:'Call or email to book a 30 minute discovery meeting on their 2027 multilingual events',due:DUE.Wed,doneWhen:'Meeting booked or reason logged, next step dated',prio:3}));
    else if(s.r.team==='BDM') T('prospects',{account:'Your two strategic prospects',contact:'You and your Team Lead',action:'Name two companies that have never bought and set Strategic Relationships = Strategic Prospects',due:DUE.Mon,doneWhen:'Two companies tagged with you as owner',prio:3});
    s.dueList.filter(d=>(d.amount||0)>=LARGE).slice(0,W.large.perWeek).forEach(d=>T('large',{account:short(d.name),contact:'Sue, John or Oddmund',action:'Name a senior sponsor on this '+chf(d.amount)+' deal',due:DUE.Wed,doneWhen:'Sponsor named on the deal',prio:4}));
    const top=s.pa.filter(a=>!a.isProspect).sort((a,b)=>(a.workedThisWeek?1:0)-(b.workedThisWeek?1:0)||(b.revenue||0)-(a.revenue||0));
    if(s.pa.length) top.slice(0,W.top20.perWeek).forEach(a=>T('top20',{account:a.name,contact:'Your main contact',action:(a.revenue?'Ask for a 2027 planning call and an introduction to another entity or team':'Re-open the conversation: one call or email with a concrete reason'),due:DUE.Fri,doneWhen:'Activity logged, next step dated',prio:5}));
    else T('top20',{account:'Your top '+M.cap(s.r)+' priority accounts',contact:'You and your Team Lead',action:'Mark your top '+M.cap(s.r)+' as Priority account in HubSpot so the agent can track them',due:DUE.Mon,doneWhen:M.cap(s.r)+' companies tagged',prio:5});
    s.john.slice().sort((a,b)=>(a.workedThisWeek?1:0)-(b.workedThisWeek?1:0)).slice(0,W.top25.perWeek).forEach(a=>T('top25',{account:a.name,contact:'John',action:'Agree this week\'s joint action with John and log it on the parent account',due:DUE.Tue,doneWhen:'Action logged on the parent or an entity',prio:6,setBy:'John'}));
    s.pa.filter(a=>(a.revenue||0)>=LARGE&&(a.days==null||a.days>LAPSED_DAYS)).slice(0,W.lapsed.perWeek).forEach(a=>T('lapsed',{account:a.name,contact:'Last event contact',action:'Record why they have not come back ('+chf(a.revenue)+' lifetime, '+(a.days!=null?a.days+' days quiet':'never touched')+') and set a next action',due:DUE.Thu,doneWhen:'Reason recorded, dated next step, contact logged',prio:7}));
    s.g.demos.filter(m=>m.start.slice(0,10)<=M.today).slice(0,W.demo.perWeek).forEach(m=>T('demo',{account:m.company||m.title,contact:'You',action:'Log demo feedback: what landed, objections, competitors, next step, where you want help',due:'Next working day',doneWhen:'Feedback note on the meeting',prio:8}));
    if(s.g.noType.length) T('hygiene',{account:s.g.noType.length+' meetings',contact:'You',action:'Set the meeting type and outcome: '+s.g.noType.slice(0,3).map(m=>m.company||m.title).join(', ')+(s.g.noType.length>3?'…':''),due:DUE.Wed,doneWhen:'Type and outcome set on every meeting',prio:9});
    T('protected',{account:'New business hour',contact:'You',action:'Hold your protected hour and log the calls made in it',due:DUE.Thu,doneWhen:'Calls logged during the slot',prio:10});
    t.forEach(x=>{x.key=rep+'|'+x.ws+'|'+x.account;}); const dm=dismissed(); const have=new Set(tasks().map(x=>x.key));
    return t.filter(x=>!dm[x.key]&&!have.has(x.key)).sort((a,b)=>a.prio-b.prio);
  }
  // ---- evidence: what HubSpot shows today for a task ----
  function evidence(s,t){ const acc=n=>s.pa.find(a=>a.name===t.account);
    switch(t.ws){
      case 'prospects': case 'top20': case 'top25': case 'lapsed': { const a=acc(); if(!a) return {ok:false,text:'account not on the HubSpot list'}; return a.workedThisWeek?{ok:true,text:'activity logged '+fmtD(a.lastActivity)}:{ok:false,text:a.lastActivity?'last activity '+fmtD(a.lastActivity)+', nothing this week':'no activity ever'}; }
      case 'pipeline': { const d=s.pastList.concat(s.staleList).find(d=>short(d.name)===t.account); return d?{ok:false,text:/was due/.test(t.action)?'close date still '+fmtD(d.close):'still no activity since '+fmtD(d.lastActivity)}:{ok:true,text:'no longer flagged in HubSpot'}; }
      case 'inbound': return s.inbound.some(x=>t.account.startsWith(x.subject.replace(/^New Lead in: /,'').replace(/\| Company: ?/,'').slice(0,10)))?{ok:false,text:'lead task still overdue'}:{ok:true,text:'lead task no longer overdue'};
      case 'hygiene': return s.g.noType.length?{ok:false,text:s.g.noType.length+' meetings still without a type'}:{ok:true,text:'all meetings typed'};
      case 'protected': return s.calls.thisWeek?{ok:true,text:s.calls.thisWeek+' calls logged this week'}:{ok:false,text:'no calls logged this week'};
      case 'large': return {ok:false,text:'needs the sponsor field'};
      case 'demo': return {ok:false,text:'needs the feedback note template'};
      default: return {ok:false,text:'checked by hand or on Friday'};
    }
  }
  // ---- the list for one rep: Sue's tasks with status and evidence ----
  function listFor(s){ const mine=tasks().filter(t=>t.rep===s.r.id).map(t=>{const e=evidence(s,t); const state=t.status==='open'&&e.ok?'done':t.status; return Object.assign({},t,{ev:e,state});});
    mine.sort((a,b)=>({open:0,blocked:1,missed:2,carried:3,done:4}[a.state]-{open:0,blocked:1,missed:2,carried:3,done:4}[b.state])||(a.prio||5)-(b.prio||5));
    mine.forEach((x,i)=>x.rank=i+1);
    return {list:mine, confirmed:mine.filter(x=>x.state==='done').length, open:mine.filter(x=>x.state==='open').length, blocked:mine.filter(x=>x.state==='blocked').length, missed:mine.filter(x=>x.state==='missed').length, suggestions:suggest(s), lapsed:s.pa.filter(a=>(a.revenue||0)>=LARGE&&(a.days==null||a.days>LAPSED_DAYS))};
  }
  // one-off demo seed: Sue accepted the top suggestions once
  function seedOnce(reps){ if(store('seeded',false)) return; reps.forEach(r=>{ const s=M.repSummary(r); suggest(s).slice(0,r.team==='BDM'?9:5).forEach(x=>addTask(Object.assign({},x,{setBy:x.setBy||'Sue (from a rule)'}))); }); put('seeded',true); }
  function forecast(s){ const m=M.today.slice(0,7); const inMonth=s.dueList.filter(d=>d.close.slice(0,7)===m);
    const commit=inMonth.filter(d=>/negotiation/i.test(d.stage)), best=inMonth.filter(d=>/quote sent/i.test(d.stage)), rest=inMonth.filter(d=>!commit.includes(d)&&!best.includes(d));
    const prob=d=>/create quote/i.test(d.stage)?0.6:/qualified/i.test(d.stage)?0.4:/needs/i.test(d.stage)?0.2:0.1;
    const won=s.won.filter(d=>d.close.slice(0,7)===m); const v=a=>sum(a.map(d=>d.amount)); const weighted=sum(rest.map(d=>(d.amount||0)*prob(d)));
    return {month:m, won:v(won), wonN:won.length, commit:v(commit), commitN:commit.length, best:v(best), bestN:best.length, pipeline:v(rest), pipelineN:rest.length, weighted, forecast:v(won)+v(commit)+0.5*v(best)+weighted, noCategory:inMonth.length, inMonthValue:v(inMonth)};
  }
  const lead = r => { const L=D.leads||{}; const id=L[r.region]||''; return id? (M.repById[id]||{}).name||'' : 'Sue'; };
  function reasons(list){ const c={}; list.forEach(d=>{const k=d.lostReason||'(no reason)';c[k]=(c[k]||0)+1;}); return Object.entries(c).sort((a,b)=>b[1]-a[1]); };
  function rollup(x){ const s=x.r?x:M.repSummary(x); const tk=listFor(s), f=forecast(s); const lostR=reasons(s.lost);
    const gaps=(s.r.team==='BDM'?(s.prospects.length?2-Math.min(2,s.prospectsWorked):2):0)+(s.g.noType.length?1:0)+(s.past.n>5?2:s.past.n?1:0)+(s.stale.n?1:0)+(tk.open+tk.blocked+tk.missed>5?1:0)+(s.paNeeds>5?1:0)+(s.lostNoReason.length?1:0);
    return {s, lead:lead(s.r), tasks:tk, f, gaps, meetingsWeek:s.ms.length, meetingsFortnight:s.ms.length+s.lm.length, newBiz:s.ms.concat(s.lm).filter(m=>/prospect|discovery|demo|qualify/i.test(m.type||'')).length, noType:s.g.noType.length,
      tasksSet:tk.list.length, tasksDone:tk.confirmed, tasksOpen:tk.open+tk.blocked+tk.missed, prospectsWorked:s.prospectsWorked, prospectsN:s.prospects.length, paActive:s.pa.filter(a=>a.status!=='needswork').length, paN:s.pa.length,
      johnDone:s.johnWorked, johnN:s.john.length, lapsedN:tk.lapsed.length, lapsedValue:sum(tk.lapsed.map(a=>a.revenue)), outOfDate:s.past.n+s.stale.n+s.noNext.length, outOfDateValue:s.past.amt+s.stale.amt,
      won:s.won.length, lost:s.lost.length, winRate:M.pct(s.won.length,s.won.length+s.lost.length), topReasons:lostR.slice(0,2), demosNoFeedback:s.g.demos.filter(m=>m.start.slice(0,10)<=M.today).length, largeNoSponsor:s.dueList.filter(d=>(d.amount||0)>=LARGE).length, activity:s.calls.thisWeek+s.emails.thisWeek };
  }
  function teamReasons(){ return reasons(D.deals.lost); }
  return {SEED, directives, saveDirective, wsById, DUE, LARGE, tasks, addTask, updateTask, deleteTask, addNote, dismiss, dismissed, suggest, evidence, listFor, seedOnce, msgs, addMsg, replies, addReply, resetAll, forecast, rollup, lead, reasons, teamReasons};
})();
