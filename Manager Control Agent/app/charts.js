// Small SVG chart kit. No libraries, works from a file:// page. Colors follow the validated palette in app/charts.js header.
window.CH = (function(){
  const PAL = {
    light:{ s1:'#2a78d6', s2:'#eb6834', s3:'#1baf7a', s4:'#eda100', good:'#0ca30c', warn:'#fab219', serious:'#ec835a', crit:'#d03b3b', ink:'#0b0b0b', ink2:'#52514e', muted:'#898781', grid:'#e1e0d9', axis:'#c3c2b7', surface:'#fcfcfb', track:'#ebeae6', na:'#e6e4df', seq:['#cde2fb','#9ec5f4','#6da7ec','#3987e5','#2a78d6','#1c5cab','#0d366b'] },
    dark:{ s1:'#3987e5', s2:'#d95926', s3:'#199e70', s4:'#c98500', good:'#0ca30c', warn:'#fab219', serious:'#ec835a', crit:'#d03b3b', ink:'#f0efec', ink2:'#c3c2b7', muted:'#898781', grid:'#2c2c2a', axis:'#383835', surface:'#1a1a19', track:'#2c2c2a', na:'#2c2c2a', seq:['#9ec5f4','#6da7ec','#5598e7','#3987e5','#2a78d6','#1c5cab','#184f95'] } };
  const initial = (document.documentElement.dataset.theme) || (document.body && document.body.dataset.chartTheme) || 'light';
  const C = Object.assign({}, PAL[initial==='dark'?'dark':'light']);
  const setTheme = m => { Object.assign(C, PAL[m==='dark'?'dark':'light']); };
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fmtN = n => n==null?'':Math.abs(n)>=1e6?(n/1e6).toFixed(1)+'M':Math.abs(n)>=1e4?Math.round(n/1e3)+'K':Math.abs(n)>=1e3?(n/1e3).toFixed(1)+'K':String(Math.round(n));
  const fmtCHF = n => 'CHF '+fmtN(n);
  // tooltip
  let tip; function tipEl(){ if(!tip){ tip=document.createElement('div'); tip.style.cssText='position:fixed;pointer-events:none;background:#0b0b0b;color:#fff;font:12px/1.35 system-ui,sans-serif;padding:6px 9px;border-radius:7px;z-index:99;display:none;max-width:280px;box-shadow:0 4px 14px rgba(0,0,0,.2)'; document.body.appendChild(tip);} return tip; }
  function hover(svg){ svg.addEventListener('mousemove',e=>{ const t=e.target.closest('[data-tip]'); const el=tipEl(); if(!t){el.style.display='none';return;} el.innerHTML=t.dataset.tip; el.style.display='block'; el.style.left=(e.clientX+12)+'px'; el.style.top=(e.clientY+12)+'px'; }); svg.addEventListener('mouseleave',()=>{tipEl().style.display='none';}); }
  function mount(el, html){ const d=typeof el==='string'?document.querySelector(el):el; d.innerHTML=html; d.querySelectorAll('svg').forEach(hover); return d; }
  const legend = items => '<div class="ch-legend">'+items.map(i=>'<span><i style="background:'+i.color+'"></i>'+esc(i.label)+'</span>').join('')+'</div>';
  const nice = m => { if(m<=0) return 1; const p=Math.pow(10,Math.floor(Math.log10(m))); const r=m/p; const s=r<=1?1:r<=2?2:r<=2.5?2.5:r<=5?5:10; return s*p; };

  // Horizontal bars: rows [{label,value,color?,tip?}]
  function hbar(rows, o={}){
    const w=o.width||420, bh=Math.min(22,o.barH||18), gap=o.gap||8, lw=o.labelW||130, vw=70, max=o.max||nice(Math.max(1,...rows.map(r=>r.value||0)));
    const h=rows.length*(bh+gap)+4; const iw=w-lw-vw;
    let s='<svg viewBox="0 0 '+w+' '+h+'" width="100%" style="display:block;overflow:visible;max-width:'+(o.maxW||640)+'px">';
    rows.forEach((r,i)=>{ const y=i*(bh+gap)+2, bw=Math.max(0,iw*(r.value||0)/max); const col=r.color||C.s1;
      s+='<text x="'+(lw-8)+'" y="'+(y+bh/2+4)+'" text-anchor="end" font-size="12" fill="'+C.ink2+'">'+esc(r.label)+'</text>';
      s+='<rect x="'+lw+'" y="'+y+'" width="'+Math.max(bw,r.value?4:0)+'" height="'+bh+'" rx="4" fill="'+col+'" data-tip="'+esc(r.tip||(r.label+': '+(o.fmt||fmtN)(r.value)))+'"/>';
      s+='<text x="'+(lw+bw+6)+'" y="'+(y+bh/2+4)+'" font-size="12" fill="'+C.ink+'" font-variant-numeric="tabular-nums">'+esc((o.fmt||fmtN)(r.value))+'</text>'; });
    return s+'</svg>';
  }
  // Grouped columns: cats [labels], series [{label,color,values[]}]
  function columns(cats, series, o={}){
    const w=o.width||520, h=o.height||200, pl=40, pr=10, pt=14, pb=28; const iw=w-pl-pr, ih=h-pt-pb;
    const max=o.max||nice(Math.max(1,...series.flatMap(s=>s.values))); const n=cats.length, bw=iw/n, k=series.length, cw=Math.min(24,(bw-10)/k);
    let s='<svg viewBox="0 0 '+w+' '+h+'" width="100%" style="display:block;overflow:visible">';
    for(let g=0; g<=4; g++){ const v=max*g/4, y=pt+ih-ih*g/4; s+='<line x1="'+pl+'" x2="'+(w-pr)+'" y1="'+y+'" y2="'+y+'" stroke="'+C.grid+'"/><text x="'+(pl-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="10" fill="'+C.muted+'">'+esc(fmtN(v))+'</text>'; }
    cats.forEach((c,i)=>{ const x0=pl+i*bw+(bw-cw*k-2*(k-1))/2;
      series.forEach((sr,j)=>{ const v=sr.values[i]||0, bh=ih*v/max, x=x0+j*(cw+2), y=pt+ih-bh; s+='<rect x="'+x+'" y="'+y+'" width="'+cw+'" height="'+bh+'" rx="4" fill="'+sr.color+'" data-tip="'+esc(c+' · '+sr.label+': '+(o.fmt||fmtN)(v))+'"/>'; if(o.labels) s+='<text x="'+(x+cw/2)+'" y="'+(y-4)+'" text-anchor="middle" font-size="10" fill="'+C.ink2+'">'+esc(fmtN(v))+'</text>'; });
      s+='<text x="'+(pl+i*bw+bw/2)+'" y="'+(h-8)+'" text-anchor="middle" font-size="11" fill="'+C.ink2+'">'+esc(String(c).length>12?String(c).slice(0,11)+'…':c)+'</text>'; });
    s+='<line x1="'+pl+'" x2="'+(w-pr)+'" y1="'+(pt+ih)+'" y2="'+(pt+ih)+'" stroke="'+C.axis+'"/></svg>';
    return s+(k>1?legend(series):'');
  }
  // Segmented (stacked) horizontal bar: parts [{label,value,color}], one whole
  function segbar(parts, o={}){
    const h=o.height||10, total=parts.reduce((a,p)=>a+(p.value||0),0)||1; let x=0, s='<svg viewBox="0 0 100 '+h+'" width="100%" height="'+h+'" preserveAspectRatio="none" style="display:block">';
    parts.forEach((p,i)=>{ const w=100*(p.value||0)/total; if(w>0){ s+='<rect x="'+(x+(i?0.6:0))+'" y="0" width="'+Math.max(0,w-(i?0.6:0))+'" height="'+h+'" fill="'+p.color+'" data-tip="'+esc(p.label+': '+p.value+' ('+Math.round(100*p.value/total)+'%)')+'"/>'; } x+=w; });
    return s+'</svg>'+(o.legend===false?'':legend(parts));
  }
  // Donut: parts [{label,value,color}], center text
  function donut(parts, o={}){
    const r=o.r||54, sw=o.stroke||16, cx=r+sw, cy=r+sw, total=parts.reduce((a,p)=>a+(p.value||0),0)||1; let a=-Math.PI/2, s='<svg viewBox="0 0 '+(2*(r+sw))+' '+(2*(r+sw))+'" width="'+(o.size||150)+'" style="display:block;overflow:visible">';
    parts.forEach(p=>{ const f=(p.value||0)/total; if(f<=0) return; const a2=a+f*2*Math.PI-0.03; const x1=cx+r*Math.cos(a), y1=cy+r*Math.sin(a), x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2); s+='<path d="M'+x1+' '+y1+' A'+r+' '+r+' 0 '+(f>0.5?1:0)+' 1 '+x2+' '+y2+'" fill="none" stroke="'+p.color+'" stroke-width="'+sw+'" stroke-linecap="butt" data-tip="'+esc(p.label+': '+p.value+' ('+Math.round(100*f)+'%)')+'"/>'; a=a2+0.03; });
    s+='<text x="'+cx+'" y="'+(cy+2)+'" text-anchor="middle" font-size="20" font-weight="700" fill="'+C.ink+'">'+esc(o.center||'')+'</text><text x="'+cx+'" y="'+(cy+18)+'" text-anchor="middle" font-size="10" fill="'+C.muted+'">'+esc(o.sub||'')+'</text></svg>';
    return '<div class="ch-row">'+s+legend(parts)+'</div>';
  }
  // Ordinal bars (funnel like): rows [{label,value}] using the sequential ramp
  function ordinal(rows, o={}){ const n=rows.length; return hbar(rows.map((r,i)=>({...r,color:C.seq[Math.min(6,1+Math.floor(5*i/Math.max(1,n-1)))]})),o); }
  // Progress ring
  function ring(v, max, o={}){ const r=o.r||22, sw=o.stroke||6, size=2*(r+sw), f=max?Math.min(1,v/max):0, circ=2*Math.PI*r, col=o.color||C.s1; return '<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" style="display:block"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+C.track+'" stroke-width="'+sw+'"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+(circ*f)+' '+(circ*(1-f))+'" transform="rotate(-90 '+size/2+' '+size/2+')"/><text x="50%" y="50%" dy="4" text-anchor="middle" font-size="12" font-weight="700" fill="'+C.ink+'">'+esc(o.text||Math.round(100*f)+'%')+'</text></svg>'; }
  // Meter
  function meter(v, max, o={}){ const f=max?Math.min(1,v/max):0; const col=o.color||(f>=1?C.good:f>=0.5?C.warn:C.crit); return '<div class="ch-meter" title="'+esc(v+' of '+max)+'"><i style="width:'+Math.round(100*f)+'%;background:'+col+'"></i></div>'; }
  // Sparkline
  function spark(vals, o={}){ const w=o.width||90,h=o.height||26,max=Math.max(1,...vals),min=0; const pts=vals.map((v,i)=>[(i/(vals.length-1||1))*(w-4)+2, h-2-(h-4)*(v-min)/(max-min||1)]); const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' '); const last=pts[pts.length-1]; return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" style="display:block;overflow:visible"><path d="'+d+'" fill="none" stroke="'+(o.color||C.s1)+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="4" fill="'+(o.color||C.s1)+'" stroke="'+C.surface+'" stroke-width="2"/></svg>'; }
  // Heatmap of states: rows [{label, cells:[{state,tip}]}], cols [labels]
  function heat(rows, cols, o={}){
    const colr={ok:C.good,warn:C.warn,bad:C.crit,na:C.na}, sym={ok:'✓',warn:'◐',bad:'✗',na:''};
    let s='<div class="ch-heat" style="grid-template-columns:'+(o.labelW||150)+'px repeat('+cols.length+',minmax(26px,1fr))">';
    s+='<div></div>'+cols.map(c=>'<div class="ch-hc" title="'+esc(c)+'"><span>'+esc(c)+'</span></div>').join('');
    rows.forEach(r=>{ s+='<div class="ch-hl"'+(r.attr||'')+'>'+esc(r.label)+'</div>'+r.cells.map(c=>'<div class="ch-cell" style="background:'+colr[c.state]+';color:'+(c.state==='warn'?'#0b0b0b':c.state==='na'?'#999':'#fff')+'" title="'+esc(c.tip||'')+'">'+sym[c.state]+'</div>').join(''); });
    return s+'</div>'+legend([{label:'on track',color:C.good},{label:'partly',color:C.warn},{label:'behind',color:C.crit},{label:'nothing to measure',color:C.na}]);
  }
  const css = '.ch-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--ch-legend,#52514e);margin-top:6px}.ch-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}.ch-row{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.ch-meter{height:8px;background:var(--ch-track,#ebeae6);border-radius:4px;overflow:hidden}.ch-meter i{display:block;height:100%;border-radius:4px}.ch-heat{display:grid;gap:3px;align-items:center;font-size:12px}.ch-hc{height:96px;position:relative}.ch-hc span{position:absolute;bottom:0;left:50%;transform:rotate(-55deg) translate(2px,-4px);transform-origin:left bottom;white-space:nowrap;font-size:10px;color:var(--ch-legend,#52514e)}.ch-hl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:6px;color:var(--ch-ink,#0b0b0b);font-weight:600}.ch-cell{height:24px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}';
  const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);
  return { C, setTheme, esc, fmtN, fmtCHF, mount, hover, legend, hbar, columns, segbar, donut, ordinal, ring, meter, spark, heat };
})();
