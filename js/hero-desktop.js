/* Sandesh hero renderer. Desktop uses the proven Amogh frame-sequence geometry; mobile keeps the same timing language over the doctor photo. */
(function(){
  'use strict';
  const track=document.getElementById('coatTrack');
  const stage=document.getElementById('coatStage');
  const canvas=document.getElementById('heroCanvas');
  if(!track||!stage||!canvas)return;

  const FRAME_W=1440,FRAME_H=810,FRAME_COUNT=197,FRAME_DIR='assets/hero-sequence-desktop/';
  const ROTATION_END=.96,frames=new Array(FRAME_COUNT),ctx=canvas.getContext('2d',{alpha:false});
  let current=0,raf=0;

  function fade(p,a,b,f){
    if(p<a||p>b)return 0;
    const span=b-a,fi=a+span*f,fo=b-span*f;
    if(p<fi)return(p-a)/(fi-a);
    if(p>fo)return 1-(p-fo)/(b-fo);
    return 1;
  }
  function progress(){
    const max=Math.max(1,track.offsetHeight-window.innerHeight);
    return Math.max(0,Math.min(1,-track.getBoundingClientRect().top/max));
  }
  function size(){
    if(window.innerWidth<881)return;
    const r=canvas.parentElement.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(r.width*dpr));
    canvas.height=Math.max(1,Math.round(r.height*dpr));
    draw(current);
  }
  function draw(index){
    if(window.innerWidth<881)return;
    const img=frames[index];if(!img||!img.complete)return;
    current=Math.max(0,Math.min(FRAME_COUNT-1,index));
    const cw=canvas.width,ch=canvas.height,scale=Math.max(cw/FRAME_W,ch/FRAME_H),dw=FRAME_W*scale,dh=FRAME_H*scale,dx=(cw-dw)*.5,dy=(ch-dh)*.5;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.fillStyle='#0E0E0E';ctx.fillRect(0,0,cw,ch);ctx.drawImage(img,0,0,FRAME_W,FRAME_H,dx,dy,dw,dh);
  }
  function setIdentity(p){
    const ids=[['identityPhoto',.54,.67],['idName',.60,.74],['idQual',.66,.79],['idExp',.72,.84],['idHosp',.77,.90]];
    ids.forEach(([id,a,b])=>{
      const el=document.getElementById(id);if(!el)return;
      const v=fade(p,a,b,.25);el.style.opacity=v;
      el.style.transform=id==='identityPhoto'?`scale(${.7+.3*v})`:`translateY(${10*(1-v)}px)`;
    });
  }
  function setCopy(p){
    const h1=document.getElementById('hook1'),h2=document.getElementById('hook2'),h3=document.getElementById('hook3');
    if(h1)h1.style.opacity=fade(p,.04,.18,.28);
    if(h2)h2.style.opacity=fade(p,.18,.36,.28);
    if(h3){h3.style.opacity=fade(p,.34,.60,.24);h3.style.transform='translateX(-50%)'}
    const progressBar=document.getElementById('progressFill');if(progressBar)progressBar.style.transform=`translateY(${p*114}px)`;
    const cue=document.getElementById('scrollCue');if(cue)cue.style.opacity=p>.045?'0':'1';
  }
  function update(){
    const p=progress();
    setCopy(p);
    if(window.innerWidth>=881){
      const t=Math.min(1,p/ROTATION_END);draw(Math.round(t*(FRAME_COUNT-1)));setIdentity(p);
    }else{
      setIdentity(Math.min(1,p/.82));
    }
  }
  function addAmbient(){
    if(window.innerWidth<881||stage.querySelector('.hero-ambient-desktop'))return;
    const ambient=document.createElement('div');ambient.className='hero-ambient-desktop';
    ambient.innerHTML='<span class="ambient-mark ambient-cross">+</span><span class="ambient-mark ambient-ring"></span><span class="ambient-mark ambient-ecg">⌁</span><span class="ambient-mark ambient-dot"></span>';
    stage.appendChild(ambient);
    stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;ambient.querySelectorAll('.ambient-mark').forEach((el,i)=>{const depth=(i+1)*4;el.style.marginLeft=`${x*depth}px`;el.style.marginTop=`${y*depth}px`})},{passive:true});
  }
  if(window.innerWidth>=881){
    for(let i=0;i<FRAME_COUNT;i++){
      const img=new Image();img.decoding='async';img.src=FRAME_DIR+`frame_${String(i+1).padStart(4,'0')}.webp`;
      img.onload=()=>{frames[i]=img;if(i===0||i===current)draw(current)};
    }
    addAmbient();size();
  }
  window.addEventListener('resize',()=>{if(window.innerWidth>=881){addAmbient();size()}update()},{passive:true});
  window.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update()})},{passive:true});
  update();
})();
