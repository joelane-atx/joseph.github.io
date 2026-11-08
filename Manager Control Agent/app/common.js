// Shared logic for every prototype. Reads window.MCA_DATA (live.js or sample.js) and window.MCA_INITIATIVES.
window.MCA = (function(){
  const D = window.MCA_DATA; if(!D) return null;
  const today = D.today, W = D.week, LW = D.lastWeek, dayMs = 86400000;
  const toDate = s => s ? new Date(s.slice(0,10)+'T00:00:00Z') : null;
  const daysAgo = s => { const d=toDate(s); return d? Math.round((toDate(today)-d)/dayMs) : null; };
  const inRange = (s,a,b) => !!s && s.slice(0,10)>=a && s.slice(0,10)<=b;
  const chf = n => n==null? '' : 'CHF '+(Math.abs(n)>=1e6? (n/1e6).toFixed(2)+'M' : Math.abs(n)>=1000? (n/1000).toFixed(Math.abs(n)>=100000?0:1)+'k' : Math.round(n));
  const fmtD = s => { const d=toDate(s); if(!d) return ''; return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}); };
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const by = (a,k) => (a||[]).filter(x=>x.owner===k);
  const sum = a => a.reduce((s,x)=>s+(x||0),0);
  const pl = (n,w) => n+' '+w+(n===1?'':'s');
  const pct = (a,b) => b? Math.round(100*a/b) : 0;
  const repById = Object.fromEntries(D.reps.map(r=>[r.id,r]));
  const cap = r => r.team==='BDM'?20:10;
  const cnt = (obj,k) => (obj&&obj[k])||{n:0,amt:0};
  const isDemo = m => /demo/i.test(m.type||'') || /demo/i.test(m.title||'');
  const settings = Object.assign({callsTarget:10, emailsTarget:40, prospectsTarget:2, staleDays:30}, JSON.parse(localStorage.getItem('mca.settings')||'{}'));
  const saveSettings = s => { Object.assign(settings,s); localStorage.setItem('mca.settings',JSON.stringify(settings)); };

  // Every account the person owns that is on one of Sue's lists: Target Account (stand-in for the new "Priority account" property),
  // Strategic Prospects, or John Top 25 (HubSpot option "Strategic Direct (John Top 50)").
  function accountsOf(repId){
    const list = D.accounts.filter(a=>a.owner===repId && (a.target || /Top|Strategic Prospects/.test(a.list||'')));
    list.forEach(a=>{ const d=daysAgo(a.lastActivity); a.days=d; a.status = a.openDeals>0?'buying':(d!=null&&d<=30?'intouch':'needswork'); a.workedThisWeek = inRange(a.lastActivity,W.start,W.end); a.isProspect=/Strategic Prospects/.test(a.list||''); a.isJohn=/Top/.test(a.list||''); });
    return list;
  }
  // Top 20 per BDM (10 per SAM and CSM): Target Accounts, Tier 1 first, then by lifetime revenue. Prospects and John Top 25 are their own workstreams.
  const tierRank = a => /tier 1/i.test(a.tier||'')?0:/tier 2/i.test(a.tier||'')?1:/tier 3/i.test(a.tier||'')?2:3;
  function priority(repId){ return accountsOf(repId).filter(a=>a.target).sort((x,y)=>tierRank(x)-tierRank(y)||(y.revenue||0)-(x.revenue||0)); }
  function meetings(repId, range){ return by(D.meetings,repId).filter(m=>inRange(m.start,range.start,range.end)).sort((a,b)=>a.start<b.start?-1:1); }
  function meetingGaps(ms){
    const past = ms.filter(m=>m.start.slice(0,10)<=today);
    return { past, noType: ms.filter(m=>!m.type), noOutcome: past.filter(m=>!m.outcome||m.outcome==='SCHEDULED'), noRecording: past.filter(m=>!m.recording&&m.outcome!=='CANCELED'), demos: ms.filter(isDemo) };
  }
  function tasks(repId, which){ return by(D.tasks[which],repId); }
  function taskSplit(list){ return { done:list.filter(t=>t.status==='COMPLETED'), missed:list.filter(t=>t.status!=='COMPLETED'&&t.due<today), open:list.filter(t=>t.status!=='COMPLETED'&&t.due>=today) }; }
  function repSummary(r){
    const acc = accountsOf(r.id), pa = acc.filter(a=>a.target).sort((x,y)=>tierRank(x)-tierRank(y)||(y.revenue||0)-(x.revenue||0)), ms = meetings(r.id,W), lm = meetings(r.id,LW), g = meetingGaps(ms.concat(lm));
    const tc = D.taskCounts.thisWeek[r.id]||{completed:0,notStarted:0}, tl = taskSplit(tasks(r.id,'thisWeek'));
    const calls = D.activity.calls[r.id]||{thisWeek:0,lastWeek:0}, emails = D.activity.emails[r.id]||{thisWeek:0,lastWeek:0};
    const won = by(D.deals.won,r.id), lost = by(D.deals.lost,r.id);
    const due = by(D.deals.due,r.id).filter(d=>d.close>=today), past = by(D.deals.past,r.id), stale = by(D.deals.stale,r.id);
    const inbound = tl.missed.filter(t=>/^New Lead in/i.test(t.subject));
    const prospects = acc.filter(a=>a.isProspect), john = acc.filter(a=>a.isJohn);
    const fc=(D.forecast&&D.forecast.byOwner[r.id])||null, c90=(D.closed90&&D.closed90.byOwner[r.id])||{};
    return { r, acc, fc, c90, pa, paWorked:pa.filter(a=>a.workedThisWeek).length, paNeeds:pa.filter(a=>a.status==='needswork').length, prospects, prospectsWorked:prospects.filter(a=>a.workedThisWeek).length, john, johnWorked:john.filter(a=>a.workedThisWeek).length,
      ms, lm, g, tc, tl, calls, emails, won, lost, wonWk:won.filter(d=>inRange(d.close,W.start,W.end)), lostWk:lost.filter(d=>inRange(d.close,W.start,W.end)), lostNoReason:lost.filter(d=>!d.lostReason),
      dueList:due, pastList:past, staleList:stale, noNext:due.concat(past,stale).filter(d=>!d.nextActivity), inbound,
      due:cnt(D.dealCounts.due,r.id), past:cnt(D.dealCounts.past,r.id), stale:cnt(D.dealCounts.stale,r.id), open:cnt(D.dealCounts.open,r.id), wonAmt:sum(won.map(d=>d.amount)) };
  }
  // Initiative scoring: value vs target per rep. state: ok | warn | bad | na
  function score(init, s){
    const T = settings; let v=0,t=0,label='',state='na',note='';
    const st = (v,t,higherIsBetter=true) => { if(t===0&&!higherIsBetter) return v===0?'ok':(v<=2?'warn':'bad'); if(!t) return 'na'; const p=v/t; return higherIsBetter? (p>=1?'ok':p>=0.5?'warn':'bad') : (p<=0.2?'ok':p<=0.6?'warn':'bad'); };
    switch(init.compute){
      case 'priority_worked': v=s.paWorked; t=Math.min(cap(s.r),s.pa.length||cap(s.r)); label=v+' of '+t+' worked'; state=s.pa.length?st(v,t):'na'; if(!s.pa.length) note='no list in HubSpot yet'; break;
      case 'strategic_prospects': v=s.prospectsWorked; t=T.prospectsTarget; label=v+' of '+t+' touched'; state=s.prospects.length?st(v,Math.min(t,s.prospects.length)):'na'; if(!s.prospects.length) note='no strategic prospects named'; break;
      case 'john_top25': v=s.johnWorked; t=s.john.length; label=v+' of '+t+' worked'; state=t?st(v,Math.max(1,Math.round(t*0.3))):'na'; if(!t) note='none assigned'; break;
      case 'calls': v=s.calls.thisWeek; t=T.callsTarget; label=v+' of '+t+' calls'; state=st(v,t); break;
      case 'emails': v=s.emails.thisWeek; t=T.emailsTarget; label=v+' of '+t+' emails'; state=st(v,t); break;
      case 'meeting_type': v=s.g.noType.length; t=0; label=v+' missing'; state=st(v,0,false); break;
      case 'meeting_outcome': v=s.g.noOutcome.length; t=0; label=v+' missing'; state=st(v,0,false); break;
      case 'recording': v=s.g.noRecording.length; t=0; label=v+' without'; state=s.g.past.length?st(v,0,false):'na'; break;
      case 'demo_feedback': v=s.g.demos.length; t=0; label=pl(v,'demo')+' this fortnight'; state=v?'warn':'na'; note='red or green needs a HubSpot field'; break;
      case 'lost_reason': v=s.lostNoReason.length; t=0; label=v+' without reason'; state=s.lost.length?st(v,0,false):'na'; break;
      case 'past_close': v=s.past.n; t=0; label=v+' deals'; state=v===0?'ok':v<=5?'warn':'bad'; break;
      case 'stale': v=s.stale.n; t=0; label=v+' deals'; state=v===0?'ok':v<=3?'warn':'bad'; break;
      case 'next_task': v=s.noNext.length; t=0; label=v+' deals with no next task'; state=v===0?'ok':v<=5?'warn':'bad'; break;
      case 'inbound': v=s.inbound.length; t=0; label=v+' overdue'; state=v===0?'ok':v<=2?'warn':'bad'; break;
      case 'tasks': v=s.tc.completed; t=s.tc.completed+s.tc.notStarted; label=v+' of '+t+' done'; state=t?st(v,Math.ceil(t*0.5)):'na'; break;
      case 'forecast': v=s.due.amt; t=0; label=chf(v)+' due by 31 Dec'; state=s.due.n?'warn':'na'; note='needs a monthly target per rep'; break;
      case 'q4': v=s.wonAmt; label=chf(v)+' won since 5 Oct'; state=v?'ok':'na'; break;
      case 'media_hub': v=s.won.filter(d=>/media hub/i.test(d.name)).length; label=pl(v,'won deal')+' naming Media Hub'; state='na'; note='proxy until a HubSpot field exists'; break;
      default: state='na'; label='not tracked yet';
    }
    return {value:v,target:t,label,state,note};
  }
  return { D, today, W, LW, toDate, daysAgo, inRange, chf, fmtD, esc, by, sum, pl, pct, repById, cap, cnt, isDemo, settings, saveSettings, priority, accountsOf, tierRank, meetings, meetingGaps, tasks, taskSplit, repSummary, score, inits: window.MCA_INITIATIVES||[] };
})();
