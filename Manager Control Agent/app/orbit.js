// Spinning 3D org graph on a canvas. No libraries. People are hubs; their accounts, deals and meetings orbit them.
window.ORBIT = (function(){
  let raf=null, state=null;
  function build(data){ // data: {hubs:[{id,label,group,size}], items:[{hub,kind,label,value}]}
    const nodes=[], edges=[]; const H=data.hubs.length; const R=1;
    data.hubs.forEach((h,i)=>{ const phi=Math.acos(1-2*(i+0.5)/H), th=Math.PI*(1+Math.sqrt(5))*i; const p=[R*0.55*Math.cos(th)*Math.sin(phi), R*0.55*Math.cos(phi), R*0.55*Math.sin(th)*Math.sin(phi)]; nodes.push({x:p[0],y:p[1],z:p[2],r:5+Math.min(6,h.size/3),hub:true,label:h.label,id:h.id,color:h.color||'#22e5ff'}); h._i=nodes.length-1; });
    data.items.forEach((it,k)=>{ const h=data.hubs.find(x=>x.id===it.hub); if(!h) return; const hn=nodes[h._i]; const a=Math.random()*Math.PI*2, b=(Math.random()-0.5)*Math.PI; const d=0.18+Math.random()*0.32; const dir=[hn.x,hn.y,hn.z]; const len=Math.hypot(...dir)||1; const n=[dir[0]/len,dir[1]/len,dir[2]/len];
      const x=hn.x+n[0]*d*0.6+Math.cos(a)*Math.cos(b)*d, y=hn.y+n[1]*d*0.6+Math.sin(b)*d, z=hn.z+n[2]*d*0.6+Math.sin(a)*Math.cos(b)*d;
      nodes.push({x,y,z,r:1.6+Math.min(3,(it.value||0)/20000),hub:false,label:it.label,kind:it.kind,color:it.color,hubIdx:h._i}); edges.push([h._i,nodes.length-1]); });
    return {nodes,edges,pulses:Array.from({length:Math.min(40,edges.length)},()=>({e:Math.floor(Math.random()*edges.length),t:Math.random(),v:0.004+Math.random()*0.008}))};
  }
  function mount(canvas, data, opts={}){ stop(); const g=build(data); const ctx=canvas.getContext('2d'); let angle=0, tilt=-0.35, drag=null, hover=null, speed=opts.speed||0.0035; const dark=opts.theme!=='light';
    const fit=()=>{ const dpr=window.devicePixelRatio||1; const w=canvas.clientWidth, h=canvas.clientHeight; canvas.width=w*dpr; canvas.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); return {w,h}; };
    let {w,h}=fit(); const proj=n=>{ const ca=Math.cos(angle), sa=Math.sin(angle), ct=Math.cos(tilt), st=Math.sin(tilt); const x1=n.x*ca-n.z*sa, z1=n.x*sa+n.z*ca; const y2=n.y*ct-z1*st, z2=n.y*st+z1*ct; const s=Math.min(w,h)*0.42; const f=1/(1.8-z2); return {X:w/2+x1*s*f*1.6, Y:h/2+y2*s*f*1.6, d:f, z:z2}; };
    function frame(){ if(!drag) angle+=speed; ({w,h}=fit()); ctx.clearRect(0,0,w,h);
      const P=g.nodes.map(proj);
      ctx.lineWidth=1; g.edges.forEach(([a,b])=>{ const pa=P[a], pb=P[b]; const al=0.08+0.22*Math.max(0,(pb.z+1)/2); ctx.strokeStyle=(dark?'rgba(140,180,255,':'rgba(30,60,120,')+al.toFixed(2)+')'; ctx.beginPath(); ctx.moveTo(pa.X,pa.Y); ctx.lineTo(pb.X,pb.Y); ctx.stroke(); });
      g.pulses.forEach(p=>{ p.t+=p.v; if(p.t>1){p.t=0;p.e=Math.floor(Math.random()*g.edges.length);} const [a,b]=g.edges[p.e]; const pa=P[a], pb=P[b]; const X=pa.X+(pb.X-pa.X)*p.t, Y=pa.Y+(pb.Y-pa.Y)*p.t; ctx.fillStyle=dark?'rgba(61,255,162,.9)':'rgba(21,128,61,.9)'; ctx.beginPath(); ctx.arc(X,Y,1.6,0,Math.PI*2); ctx.fill(); });
      const order=P.map((p,i)=>i).sort((i,j)=>P[i].z-P[j].z);
      order.forEach(i=>{ const n=g.nodes[i], p=P[i]; const r=n.r*p.d*1.2; ctx.shadowBlur=n.hub?18:6; ctx.shadowColor=n.color; ctx.fillStyle=n.color; ctx.globalAlpha=n.hub?1:0.45+0.55*Math.max(0,(p.z+1)/2); ctx.beginPath(); ctx.arc(p.X,p.Y,r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; ctx.shadowBlur=0;
        if(n.hub){ ctx.font='11px JetBrains Mono, Menlo, monospace'; ctx.fillStyle=dark?'#e6f3ff':'#0b1220'; ctx.fillText(n.label,p.X+r+5,p.Y+4); } });
      if(hover!=null){ const n=g.nodes[hover], p=P[hover]; const txt=(n.hub?n.label:(n.kind+' · '+n.label)); ctx.font='12px Inter, system-ui, sans-serif'; const tw=ctx.measureText(txt).width+14; ctx.fillStyle=dark?'rgba(3,5,12,.92)':'rgba(255,255,255,.95)'; ctx.strokeStyle=n.color; ctx.beginPath(); ctx.roundRect(p.X+10,p.Y-26,tw,22,6); ctx.fill(); ctx.stroke(); ctx.fillStyle=dark?'#e6f3ff':'#0b1220'; ctx.fillText(txt,p.X+17,p.Y-11); }
      state.P=P; raf=requestAnimationFrame(frame); }
    canvas.onmousemove=e=>{ const rect=canvas.getBoundingClientRect(); const mx=e.clientX-rect.left, my=e.clientY-rect.top; if(drag){ angle=drag.a+(mx-drag.x)*0.008; tilt=Math.max(-1.2,Math.min(1.2,drag.t+(my-drag.y)*0.006)); return; } let best=null,bd=14; (state.P||[]).forEach((p,i)=>{ const d=Math.hypot(p.X-mx,p.Y-my); if(d<bd){bd=d;best=i;} }); hover=best; canvas.style.cursor=best!=null?'pointer':'grab'; };
    canvas.onmousedown=e=>{ const rect=canvas.getBoundingClientRect(); drag={x:e.clientX-rect.left,y:e.clientY-rect.top,a:angle,t:tilt}; }; canvas.onmouseup=canvas.onmouseleave=()=>{drag=null;hover=null;};
    state={canvas,g}; frame(); return {stop};
  }
  function stop(){ if(raf) cancelAnimationFrame(raf); raf=null; if(state&&state.canvas){ state.canvas.onmousemove=state.canvas.onmousedown=state.canvas.onmouseup=state.canvas.onmouseleave=null; } state=null; }
  return {mount, stop};
})();
