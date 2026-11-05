// Task engine built from Sue's written brief (2 Nov 2026): nine workstreams, each with a weekly rule and "counts as done".
window.ENG = (function(){
  const M=window.MCA; if(!M) return null; const {D,esc,fmtD,chf,by,sum,daysAgo}=M;
  const LARGE = 20000, LAPSED_DAYS = 90;
  const WS = [
    {id:'inbound',   name:'Inbound leads',            rule:'12 day cadence: day 1, 2, 4, 8, 12',                              done:'Each cadence step done and logged on the day', color:'#f472d0'},
    {id:'pipeline',  name:'Pipeline in date',         rule:'Close date not in the past, next step set, contact in the last 14 days', done:'Deal updated and contact logged the same week it is flagged', color:'#ff4d6d'},
    {id:'prospects', name:'Strategic prospects',      rule:'2 named companies that have never bought, worked every week',     done:'At least one logged outreach or meeting on each, with a next step dated', color:'#22e5ff'},
    {id:'large',     name:'Large deals (CHF 20k+)',   rule:'Senior sponsor (Sue, John or Oddmund) in early',                   done:'Sponsor named on the deal at discovery or proposal', color:'#f59e0b'},
    {id:'top20',     name:'Top 20 priority accounts', rule:'Activity visible across the list, account plan live',             done:'Logged activity against the accounts tasked that week', color:'#8b5cf6'},
    {id:'top25',     name:'Top 25 with John',         rule:'Joint activity agreed with John, at parent level',                 done:'Agreed actions done and logged on the parent or any entity', color:'#6d8bff'},
    {id:'lapsed',    name:'Large accounts not come back', rule:'CHF 20k+ in 24 months, nothing won in 12',                   done:'Activity in the last 30 days, a reason recorded, a dated next step', color:'#2ef0d0'},
    {id:'demo',      name:'Demo feedback',            rule:'Feedback captured within 24 hours of every demo',                 done:'Structured feedback logged', color:'#3dffa2'},
    {id:'hygiene',   name:'Meeting type and outcome', rule:'Every meeting typed within 2 working days',                       done:'Type and outcome set in HubSpot', color:'#a9bad2'},
    {id:'protected', name:'Protected new business time', rule:'Weekly power hour, held every week',                          done:'New business activity logged during the slot', color:'#60a5fa'},
  ];
  const wsById = Object.fromEntries(WS.map(w=>[w.id,w]));
  const day = n => { const d=M.toDate(M.W.start); d.setUTCDate(d.getUTCDate()+n); return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}); };
  const DUE = {Mon:day(0),Tue:day(1),Wed:day(2),Thu:day(3),Fri:day(4)};
  let seq=0; const T=(ws,o)=>Object.assign({id:'k'+(++seq),ws,setBy:'Rule',status:'open',confirmed:false},o);
  const EVID={inbound:'A call, an email and a LinkedIn message logged on the lead today',pipeline:'Close date moved to the future, or stage Closed Lost with a reason; a contact logged this week',prospects:'An outreach or meeting logged on the company this week, next activity date set',large:'Sponsor named on the deal',top20:'An activity logged on the company this week, next activity date set',top25:'An activity logged on the parent or an entity this week',lapsed:'Reason not returned filled, a contact logged, next activity date set',demo:'A feedback note on the meeting within 24 hours',hygiene:'Call and meeting type and outcome set on every meeting',protected:'Calls logged inside the booked slot'};
  // Tasks Sue, John or a Team Lead add by hand (kept in this browser for the demo)
  const manual=()=>JSON.parse(localStorage.getItem('mca.suetasks')||'[]');
  const addManual=t=>{const a=manual();a.push(Object.assign({id:'m'+Date.now(),status:'open',confirmed:false},t));localStorage.setItem('mca.suetasks',JSON.stringify(a));};
  const removeManual=id=>localStorage.setItem('mca.suetasks',JSON.stringify(manual().filter(t=>t.id!==id)));
  const short = s => s.length>70? s.slice(0,68)+'…' : s;

  function buildTasks(s){ seq=0; const t=[];
    s.inbound.slice(0,3).forEach(x=>t.push(T('inbound',{account:x.subject.replace(/^New Lead in: /,'').replace(/\| Company: ?/,'').replace(/\| Prospect: ?/,' · '),contact:'The lead',action:'Cadence step due: call, email and LinkedIn message today',due:'Today',doneWhen:'All three logged on the lead',prio:1})));
    s.pastList.slice(0,3).forEach(d=>t.push(T('pipeline',{account:short(d.name),contact:'Deal contact',action:'Move the close date or close the deal (was due '+fmtD(d.close)+(d.amount?', '+chf(d.amount):'')+')',due:DUE.Tue,doneWhen:'Close date in the future with a next step, or Closed Lost with a reason',prio:2})));
    s.staleList.slice(0,2).forEach(d=>t.push(T('pipeline',{account:short(d.name),contact:'Deal contact',action:'Log a contact and set a dated next step (no activity since '+fmtD(d.lastActivity)+')',due:DUE.Thu,doneWhen:'Contact logged, next step dated',prio:2})));
    if(s.prospects.length){ s.prospects.filter(a=>!a.workedThisWeek).slice(0,2).forEach(a=>t.push(T('prospects',{account:a.name,contact:'Head of Events (confirm in HubSpot)',action:'Call or email to book a 30 minute discovery meeting on their 2027 multilingual events',due:DUE.Wed,doneWhen:'Meeting booked or reason logged, next step dated',prio:3}))); }
    else t.push(T('prospects',{account:'Your two strategic prospects',contact:'You and your Team Lead',action:'Name two companies that have never bought and set Strategic Relationships = Strategic Prospects',due:DUE.Mon,doneWhen:'Two companies tagged with you as owner',setBy:'Sue',prio:3}));
    s.dueList.filter(d=>(d.amount||0)>=LARGE).slice(0,2).forEach(d=>t.push(T('large',{account:short(d.name),contact:'Sue, John or Oddmund',action:'Name a senior sponsor on this '+chf(d.amount)+' deal',due:DUE.Wed,doneWhen:'Sponsor named on the deal',prio:4})));
    const need=s.pa.filter(a=>a.status==='needswork'&&!a.isProspect).sort((a,b)=>(b.revenue||0)-(a.revenue||0));
    if(s.pa.length) need.slice(0,4).forEach(a=>t.push(T('top20',{account:a.name,contact:'Your main contact',action:(a.revenue?'Ask for a 2027 planning call and an introduction to another entity or team':'Re-open the conversation: one call or email with a concrete reason'),due:DUE.Fri,doneWhen:'Activity logged, next step dated',prio:5})));
    else t.push(T('top20',{account:'Your top '+M.cap(s.r)+' priority accounts',contact:'You and your Team Lead',action:'Mark your top '+M.cap(s.r)+' as Priority account in HubSpot so the agent can track them',due:DUE.Mon,doneWhen:M.cap(s.r)+' companies tagged',setBy:'Sue',prio:5}));
    s.john.filter(a=>!a.workedThisWeek).slice(0,2).forEach(a=>t.push(T('top25',{account:a.name,contact:'John',action:'Agree this week\'s joint action with John and log it on the parent account',due:DUE.Tue,doneWhen:'Action logged on the parent or an entity',setBy:'John',prio:6})));
    const lapsed=s.pa.filter(a=>(a.revenue||0)>=LARGE&&(a.days==null||a.days>LAPSED_DAYS)).slice(0,2);
    lapsed.forEach(a=>t.push(T('lapsed',{account:a.name,contact:'Last event contact',action:'Record why they have not come back ('+chf(a.revenue)+' lifetime, '+(a.days!=null?a.days+' days quiet':'never touched')+') and set a next action',due:DUE.Thu,doneWhen:'Reason recorded, dated next step, contact logged',prio:7})));
    s.g.demos.filter(m=>m.start.slice(0,10)<=M.today).slice(0,2).forEach(m=>t.push(T('demo',{account:m.company||m.title,contact:'You',action:'Log demo feedback: what landed, objections, competitors, next step, where you want help',due:'Next working day',doneWhen:'Feedback note on the meeting',prio:8})));
    if(s.g.noType.length) t.push(T('hygiene',{account:s.g.noType.length+' meetings',contact:'You',action:'Set the meeting type (and outcome where missing): '+s.g.noType.slice(0,3).map(m=>m.company||m.title).join(', ')+(s.g.noType.length>3?'…':''),due:DUE.Wed,doneWhen:'Type and outcome set on every meeting',prio:9}));
    t.push(T('protected',{account:'New business hour',contact:'You',action:'Hold your protected hour and log the calls made in it',due:DUE.Thu,doneWhen:'Calls logged during the slot',prio:10}));
    t.forEach(x=>{x.evidence=EVID[x.ws]||'';});
    t.sort((a,b)=>a.prio-b.prio);
    const mine=manual().filter(m=>m.rep===s.r.id).map(m=>Object.assign({ws:m.ws||'top20',prio:0,evidence:m.evidence||'What Sue asked for, logged in HubSpot',confirmed:false},m));
    const all=mine.concat(t); const list=all.slice(0,15); list.forEach((x,i)=>x.rank=i+1); return {list, held:all.length-list.length, lapsed, manualCount:mine.length};
  }
  // forecast lines from stage, as a stand in for the forecast category field (empty in HubSpot today)
  function forecast(s){ const m=M.today.slice(0,7); const inMonth=s.dueList.filter(d=>d.close.slice(0,7)===m);
    const commit=inMonth.filter(d=>/negotiation/i.test(d.stage)), best=inMonth.filter(d=>/quote sent/i.test(d.stage)), rest=inMonth.filter(d=>!commit.includes(d)&&!best.includes(d));
    const prob=d=>/create quote/i.test(d.stage)?0.6:/qualified/i.test(d.stage)?0.4:/needs/i.test(d.stage)?0.2:0.1;
    const won=s.won.filter(d=>d.close.slice(0,7)===m); const v=a=>sum(a.map(d=>d.amount));
    const weighted=sum(rest.map(d=>(d.amount||0)*prob(d)));
    return {month:m, won:v(won), wonN:won.length, commit:v(commit), commitN:commit.length, best:v(best), bestN:best.length, pipeline:v(rest), pipelineN:rest.length, weighted, forecast:v(won)+v(commit)+0.5*v(best)+weighted, noCategory:inMonth.length, inMonthValue:v(inMonth)};
  }
  const lead = r => { const L=D.leads||{}; const id=L[r.region]||''; return id? (M.repById[id]||{}).name||'' : (r.team==='SAM'?'Sue':'Sue'); };
  function reasons(list){ const c={}; list.forEach(d=>{const k=d.lostReason||'(no reason)';c[k]=(c[k]||0)+1;}); return Object.entries(c).sort((a,b)=>b[1]-a[1]); };
  function rollup(x){ const s=x.r?x:M.repSummary(x); const tk=buildTasks(s), f=forecast(s); const lostR=reasons(s.lost);
    const gaps=(s.prospects.length?2-Math.min(2,s.prospectsWorked):2)+(s.g.noType.length?1:0)+(s.past.n>5?2:s.past.n?1:0)+(s.stale.n?1:0)+(s.tl.missed.length?1:0)+(s.paNeeds>5?1:0)+(s.lostNoReason.length?1:0);
    return {s, lead:lead(s.r), tasks:tk, f, gaps, meetingsWeek:s.ms.length, meetingsFortnight:s.ms.length+s.lm.length, newBiz:s.ms.concat(s.lm).filter(m=>/prospect|discovery|demo|qualify/i.test(m.type||'')).length, noType:s.g.noType.length,
      tasksSet:tk.list.length, tasksDone:tk.list.filter(t=>t.confirmed).length, tasksMissed:0, tasksOpen:tk.list.filter(t=>!t.confirmed).length, prospectsWorked:s.prospectsWorked, prospectsN:s.prospects.length, paActive:s.pa.filter(a=>a.status!=='needswork').length, paN:s.pa.length,
      johnDone:s.johnWorked, johnN:s.john.length, lapsedN:tk.lapsed.length, lapsedActive:0, lapsedValue:sum(tk.lapsed.map(a=>a.revenue)), outOfDate:s.past.n+s.stale.n+s.noNext.length, outOfDateValue:s.past.amt+s.stale.amt,
      won:s.won.length, lost:s.lost.length, winRate:M.pct(s.won.length,s.won.length+s.lost.length), topReasons:lostR.slice(0,2), demosNoFeedback:s.g.demos.filter(m=>m.start.slice(0,10)<=M.today).length, largeNoSponsor:s.dueList.filter(d=>(d.amount||0)>=LARGE).length };
  }
  function teamReasons(){ return reasons(D.deals.lost); }
  return {WS, wsById, DUE, LARGE, EVID, buildTasks, forecast, rollup, lead, reasons, teamReasons, manual, addManual, removeManual};
})();
