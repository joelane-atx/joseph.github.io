// Refresh and Live for every page. The page reads data/live.js (a read-only HubSpot snapshot).
// Refresh re-reads that file; if a newer snapshot is there, the page reloads with it. Live checks every 60 seconds.
// Put <span id="refreshSlot"></span> where the widget should sit; without it, it floats bottom left.
(function(){
  const D=(window.MCA&&window.MCA.D)||window.MCA_DATA||{}; const cur=D.generated||'';
  const fmt=g=>{ if(!g||g==='sample') return 'sample data'; const d=new Date(g.replace(' UTC','Z').replace(' ','T')); return isNaN(d)?g:d.toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}); };
  const slot=document.getElementById('refreshSlot'); const w=document.createElement('span'); w.className='rfw'+(slot?'':' float');
  let live=false; try{ live=localStorage.getItem('mca.live')==='1'; }catch(e){}
  w.innerHTML='<span title="When this HubSpot snapshot was read">HubSpot · <span class="rf-msg" id="rf-at">'+fmt(cur)+'</span></span><button id="rf-btn" title="Check for a newer snapshot">↻ Refresh</button><button class="lv'+(live?' on':'')+'" id="rf-live" title="Check for new data every minute"><i></i>Live</button>';
  (slot||document.body).appendChild(w);
  const at=w.querySelector('#rf-at'), btn=w.querySelector('#rf-btn'), lv=w.querySelector('#rf-live');
  function check(manual){
    const prev=window.MCA_DATA; const s=document.createElement('script'); s.src='data/live.js?t='+Date.now();
    s.onload=()=>{ const g=(window.MCA_DATA||{}).generated||''; window.MCA_DATA=prev; s.remove();
      if(g&&g!==cur){ at.textContent='new data '+fmt(g)+', loading…'; setTimeout(()=>location.reload(),600); }
      else if(manual){ at.textContent='up to date · '+fmt(cur); setTimeout(()=>{at.textContent=fmt(cur);},2500); } };
    s.onerror=()=>{ window.MCA_DATA=prev; s.remove(); if(manual){ at.textContent='no live file here · '+fmt(cur); } };
    document.head.appendChild(s);
  }
  btn.onclick=()=>check(true);
  let timer=null; const setLive=v=>{ live=v; lv.classList.toggle('on',v); try{localStorage.setItem('mca.live',v?'1':'0')}catch(e){} clearInterval(timer); if(v){ timer=setInterval(()=>check(false),60000); check(false);} };
  lv.onclick=()=>setLive(!live); if(live) setLive(true);
})();
