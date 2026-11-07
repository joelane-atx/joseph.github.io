// Sue's flags and comments on accounts. Saved in this browser only. A flag can be queued as a HubSpot note;
// nothing is written to HubSpot from here (the folder rule is read only). The queue is what an agent would post after a yes.
window.FLAGS = (function(){
  const KEY='mca.flags';
  const TYPES=[['push','Push this week','warn'],['risk','At risk','bad'],['good','Good news','ok'],['ask','Ask for update','cy']];
  const label=t=>(TYPES.find(x=>x[0]===t)||TYPES[0])[1], cls=t=>(TYPES.find(x=>x[0]===t)||TYPES[0])[2];
  const all=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
  const put=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
  const today=()=>new Date().toISOString().slice(0,10);
  function save(acc,rep,f){ const o=all(); const prev=o[acc.id]||{replies:[]}; o[acc.id]=Object.assign(prev,{acc:acc.id,accName:acc.name,rep,flag:f.flag,text:f.text,by:'Sue Yardley',at:today(),hub:!!f.hub,status:f.hub?(prev.status==='added by hand'?prev.status:'queued'):'not for HubSpot'}); put(o); return o[acc.id]; }
  function reply(id,by,text){ const o=all(); if(!o[id]) return; o[id].replies=(o[id].replies||[]).concat([{by,text,at:today()}]); put(o); }
  function remove(id){ const o=all(); delete o[id]; put(o); }
  function setStatus(id,s){ const o=all(); if(o[id]){o[id].status=s; put(o);} }
  const forRep=rep=>Object.values(all()).filter(e=>e.rep===rep);
  const queue=()=>Object.values(all()).filter(e=>e.hub&&e.status==='queued');
  const noteBody=e=>'Manager note from '+e.by+' ('+e.at+') · '+label(e.flag)+': '+e.text+(e.replies&&e.replies.length?'\nReplies: '+e.replies.map(r=>r.by+': '+r.text).join(' | '):'');
  return {TYPES,label,cls,all,save,reply,remove,setStatus,forRep,queue,noteBody};
})();
