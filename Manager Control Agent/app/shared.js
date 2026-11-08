// Shared state for the private link. The pages keep their state in localStorage under "mca.*" keys; on the claude.ai link
// this file mirrors the operational keys (Sue's tasks, flags, Teams asks, replies, her rules, tool setup, announcements)
// to the link's shared database, one document per key, so everyone who opens the link sees the same live state.
// The shared copy always wins over what a browser had before. Opened as a plain file, nothing changes: state stays in the browser.
(function(){
  const KEYS=['suetasks','dismissed','msgs','replies','directives','flags','setup','ack','init','focus','demos'];
  let ls=null; try{ ls=window.localStorage; }catch(e){}
  if(!ls) return;
  const proto=Storage.prototype, rawSet=proto.setItem, rawRemove=proto.removeItem;
  const S={mode:'local',ready:{},docs:{},timers:{},writing:{},again:{},db:null,canWrite:true};
  window.MCA_SHARED=S;
  const isShared=k=>typeof k==='string'&&k.slice(0,4)==='mca.'&&KEYS.indexOf(k.slice(4))>=0;
  proto.setItem=function(k,v){ rawSet.call(this,k,v); if(this===ls&&S.mode==='shared'&&S.canWrite&&isShared(k)&&S.ready[k]) queue(k); };
  function queue(k){ clearTimeout(S.timers[k]); S.timers[k]=setTimeout(()=>push(k),350); }
  async function push(k){
    if(S.writing[k]){ S.again[k]=true; return; }
    const v=ls.getItem(k); if(v===S.docs[k]) return;
    S.writing[k]=true;
    try{ await S.db.doc('state/'+k.slice(4)).set({v:v==null?'':v,at:new Date().toISOString()}); S.docs[k]=v; badge('saved'); }
    catch(e){ if(e&&e.code==='invalid_argument'){ S.canWrite=false; badge('readonly'); } else if(e&&e.code==='unavailable'){ setTimeout(()=>{S.writing[k]=false; push(k);},800+Math.random()*800); return; } else badge('error'); }
    S.writing[k]=false; if(S.again[k]){ S.again[k]=false; push(k); }
  }
  let rr=null, waitBlur=false;
  function rerender(){ clearTimeout(rr); rr=setTimeout(()=>{ const a=document.activeElement; if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&!waitBlur){ waitBlur=true; a.addEventListener('blur',()=>{waitBlur=false; rerender();},{once:true}); return; } if(typeof window.__mcaRerender==='function') window.__mcaRerender(); },150); }
  let el=null, settle=null;
  const TXT={local:['This browser only','Changes stay in this browser'],shared:['● Shared live','Tasks, flags and replies are shared with everyone on this link'],saved:['✓ Saved for everyone','Saved to the shared link'],readonly:['View only','You can see the shared state but not change it'],slow:['Shared data not reachable yet','Showing what this browser had; it updates when the link answers'],error:['Not saved, try again','The change is kept in this browser']};
  function badge(s){
    if(!el){ el=document.createElement('span'); el.className='shb'; const host=document.querySelector('.rfw'); if(host) host.appendChild(el); else { el.classList.add('float'); document.body.appendChild(el); } }
    el.dataset.s=s; el.textContent=TXT[s][0]; el.title=TXT[s][1];
    clearTimeout(settle); if(s==='saved') settle=setTimeout(()=>badge(S.canWrite?'shared':'readonly'),2000);
  }
  async function start(){
    if(!(window.claude&&typeof window.claude.use==='function')){ badge('local'); return; }
    let db=null; try{ db=await window.claude.use('db'); }catch(e){}
    if(!db){ badge('local'); return; }
    S.db=db; S.mode='shared'; rawSet.call(ls,'mca.seeded','true');
    try{ const u=await window.claude.use('user'); if(u&&typeof u.can==='function'){ const c=await u.can('data.write'); if(c===false) S.canWrite=false; } }catch(e){}
    const slow=setTimeout(()=>badge('slow'),10000); let confirmed=false;
    KEYS.forEach(k=>{ const K='mca.'+k;
      db.doc('state/'+k).onSnapshot(snap=>{
        if(snap.metadata&&!snap.metadata.fromCache&&!confirmed){ confirmed=true; clearTimeout(slow); badge(S.canWrite?'shared':'readonly'); }
        if(snap.metadata&&snap.metadata.hasPendingWrites) return;
        const d=snap.exists?snap.data():null; const v=d&&typeof d.v==='string'&&d.v!==''?d.v:null;
        S.docs[K]=v; S.ready[K]=true; const cur=ls.getItem(K);
        if(v==null){ if(cur!=null){ rawRemove.call(ls,K); rerender(); } }
        else if(v!==cur){ rawSet.call(ls,K,v); rerender(); }
      }, err=>{ clearTimeout(slow); badge('error'); });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else setTimeout(start,0);
})();
