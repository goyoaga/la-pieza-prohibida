import './style.css';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
const W=1000,H=800,MAGNET_X=500,MAGNET_Y=210,BELT_Y=555,FIELD=125;let phase='ready',audioOn=false,audio,state,streak=0;
const rand=(a,b)=>a+Math.random()*(b-a);
function newRound(){
 const speed=rand(135,170),forbidden=rand(-110,-25),gapL=rand(155,225),gapR=rand(155,230);
 state={last:performance.now(),speed,activatedAt:0,settleAt:0,pieces:[
  {x:forbidden-gapL,type:'nut',bad:false,y:BELT_Y,pull:0,caught:false},
  {x:forbidden,type:'forbidden',bad:true,y:BELT_Y,pull:0,caught:false},
  {x:forbidden+gapR,type:'bolt',bad:false,y:BELT_Y,pull:0,caught:false},
  {x:forbidden+gapR+rand(165,220),type:'washer',bad:false,y:BELT_Y,pull:0,caught:false}
 ]};
 phase='ready';$('ready').hidden=false;$('result').hidden=true;$('action').disabled=false;$('scene-label').textContent='ESPERA EL MOMENTO · ATRAPA SOLO LA ROJA';$('streak').textContent='RACHA · '+streak;
}
function tone(f=320,d=.1){if(!audioOn)return;try{audio??=new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+d+.01)}catch{}}
function activate(){
 if(phase!=='ready')return;phase='pull';state.activatedAt=performance.now();$('action').disabled=true;$('scene-label').textContent='IMÁN ACTIVADO · AHORA SOLO MIRA…';tone(220,.08);
 for(const p of state.pieces){const dx=Math.abs(p.x-MAGNET_X);if(dx<=FIELD){p.caught=true;p.pull=1}}
 setTimeout(resolve,720);
}
function resolve(){
 if(phase!=='pull')return;phase='result';const caught=state.pieces.filter(p=>p.caught),bad=caught.some(p=>p.bad),extra=caught.some(p=>!p.bad);
 let verdict,detail,success=false;
 if(bad&&!extra){verdict='¡Perfecto!';detail='Atrapaste la pieza prohibida y ninguna más.';success=true;streak++;confetti()}
 else if(bad&&extra){verdict='Demasiado pronto.';detail='La roja cayó, pero te llevaste otra pieza.';streak=0}
 else {const bx=state.pieces.find(p=>p.bad).x;verdict=bx>MAGNET_X?'Demasiado tarde.':'Todavía no.';detail=bx>MAGNET_X?'La pieza prohibida ya había pasado.':'La pieza prohibida aún estaba fuera del campo.';streak=0}
 $('verdict').textContent=verdict;$('detail').textContent=detail;$('streak').textContent='RACHA · '+streak;$('ready').hidden=true;$('result').hidden=false;$('scene-label').textContent=success?'PIEZA PROHIBIDA CAPTURADA · PERFECTO':verdict.toUpperCase();tone(success?720:130,.2);
 try{window.goatcounter?.count?.({path:'pieza-prohibida-completada',title:'Pieza prohibida completada',event:true,no_session:true})}catch{}
}
function confetti(){const host=$('scene');for(let i=0;i<24;i++){const e=document.createElement('i');e.style.cssText='position:absolute;width:7px;height:11px;background:'+(i%2?'#f2b544':'#b54e43')+';left:'+(44+Math.random()*12)+'%;top:24%;z-index:4;pointer-events:none;transition:transform 1s ease-out,opacity 1s';host.appendChild(e);requestAnimationFrame(()=>{e.style.transform='translate('+((Math.random()-.5)*330)+'px,'+(160+Math.random()*260)+'px) rotate(500deg)';e.style.opacity='0'});setTimeout(()=>e.remove(),1100)}}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function drawMagnet(active){
 ctx.save();ctx.translate(MAGNET_X,MAGNET_Y);ctx.lineWidth=38;ctx.lineCap='round';ctx.strokeStyle=active?'#c44d43':'#b54e43';ctx.beginPath();ctx.arc(0,0,78,Math.PI,0,true);ctx.stroke();ctx.strokeStyle='#e9e5da';ctx.beginPath();ctx.moveTo(-78,0);ctx.lineTo(-78,42);ctx.moveTo(78,0);ctx.lineTo(78,42);ctx.stroke();ctx.fillStyle='#333';ctx.font='700 15px DM Sans';ctx.textAlign='center';ctx.fillText(active?'ACTIVO':'IMÁN',0,-18);ctx.restore();
 if(active){ctx.save();ctx.strokeStyle='rgba(181,78,67,.28)';ctx.lineWidth=3;ctx.setLineDash([9,12]);ctx.beginPath();ctx.arc(MAGNET_X,BELT_Y,FIELD,Math.PI,0);ctx.stroke();ctx.restore()}
}
function piece(p){
 ctx.save();ctx.translate(p.x,p.y);if(p.bad){roundRect(-33,-33,66,66,12,'#b54e43','#78362f');ctx.fillStyle='#fff4e8';ctx.font='700 36px DM Sans';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('×',0,1)}
 else{ctx.fillStyle='#929792';ctx.strokeStyle='#555b57';ctx.lineWidth=4;if(p.type==='nut'){ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.lineTo(Math.cos(a)*31,Math.sin(a)*31)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#dedbd1';ctx.beginPath();ctx.arc(0,0,12,0,7);ctx.fill()}else if(p.type==='bolt'){roundRect(-31,-14,62,28,8,'#929792','#555b57');ctx.fillStyle='#666';ctx.fillRect(15,-24,18,48)}else{ctx.beginPath();ctx.arc(0,0,28,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#dedbd1';ctx.beginPath();ctx.arc(0,0,13,0,7);ctx.fill()}}ctx.restore();
}
function draw(now){
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#e6e2d8';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#d2cec3';ctx.fillRect(0,390,W,315);ctx.fillStyle='#424844';ctx.fillRect(0,470,W,175);
 for(let x=-80;x<W+100;x+=115){ctx.fillStyle='#666b67';roundRect(x,485,88,145,18,'#666b67');ctx.strokeStyle='#303532';ctx.lineWidth=3;ctx.stroke()}
 ctx.fillStyle='#262b28';ctx.fillRect(0,635,W,20);for(let x=35;x<W;x+=115){ctx.fillStyle='#232825';ctx.beginPath();ctx.arc(x,655,23,0,7);ctx.fill()}
 ctx.fillStyle='#f2b544';ctx.fillRect(0,455,W,15);drawMagnet(phase==='pull'||phase==='result');
 const dt=Math.min(.032,(now-state.last)/1000);state.last=now;
 if(phase==='ready'||phase==='pull'){for(const p of state.pieces){if(!p.caught)p.x+=state.speed*dt;else{p.x+=(MAGNET_X-p.x)*Math.min(1,dt*8);p.y+=(MAGNET_Y+65-p.y)*Math.min(1,dt*8)}}}
 for(const p of state.pieces)piece(p);
 ctx.fillStyle='#6e746e';ctx.font='700 12px DM Sans';ctx.letterSpacing='2px';ctx.textAlign='left';ctx.fillText('LÍNEA 01  →',35,430);
 requestAnimationFrame(draw)
}
$('action').onclick=e=>{e.stopPropagation();activate()};$('scene').onclick=activate;$('again').onclick=newRound;document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat){e.preventDefault();activate()}});
$('sound').onclick=()=>{audioOn=!audioOn;$('sound').setAttribute('aria-pressed',String(audioOn));$('sound-label').textContent=audioOn?'ON':'OFF';$('sound-icon').textContent=audioOn?'◖))':'◖̸'};
$('bookmark').onclick=()=>{$('bookmark-text').textContent=/iPhone|iPad/i.test(navigator.userAgent)?'En Safari, pulsa Compartir y elige «Añadir a favoritos».':'Pulsa Ctrl+D (Windows/Linux), ⌘+D (Mac) o usa el menú del navegador para guardar el juego.';$('bookmark-dialog').showModal()};
newRound();requestAnimationFrame(draw);