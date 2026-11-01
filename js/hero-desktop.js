/* Sandesh hero renderer: Amogh's proven sticky-scroll architecture, with exact sticky geometry for release timing. */
(function(){
  'use strict';
  const track=document.getElementById('coatTrack');
  const stage=document.getElementById('coatStage');
  const canvas=document.getElementById('heroCanvas');
  if(!track||!stage||!canvas)return;

  const FRAME_W=1440,FRAME_H=810,FRAME_COUNT=197;
  const FRAME_DIR='assets/hero-sequence-desktop/';
  const ROTATION_END=0.96;
  const frames=new Array(FRAME_COUNT);
  const ctx=canvas.getContext('2d',{alpha:false});
  let current=0,raf=0,ready=false;

  const progressFill=document.getElementById('progressFill');
  const scrollCue=document.getElementById('scrollCue');
  const nav=document.getElementById('siteNav');
  const mobileNav=document.getElementById('mobileNav');
  const heroNavs=[nav,mobileNav].filter(Boolean);
  const hook1=document.getElementById('hook1'),hook2=document.getElementById('hook2'),hook3=document.getElementById('hook3');
  const idName=document.getElementById('idName'),idQual=document.getElementById('idQual'),idExp=document.getElementById('idExp'),idHosp=document.getElementById('idHosp'),idPhoto=document.getElementById('identityPhoto'),identityBlock=document.getElementById('identityBlock');
  const fallback=document.querySelector('.hero-fallback-frame');

  function size(){
    const r=canvas.parentElement.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(r.width*dpr));
    canvas.height=Math.max(1,Math.round(r.height*dpr));
    draw(current);
  }

  function draw(index){
    const safe=Math.max(0,Math.min(FRAME_COUNT-1,index));
    const img=frames[safe];
    if(!img||!img.complete||!img.naturalWidth)return;
    current=safe;
    const cw=canvas.width,ch=canvas.height;
    const scale=Math.max(cw/FRAME_W,ch/FRAME_H);
    const dw=FRAME_W*scale,dh=FRAME_H*scale;
    const dx=(cw-dw)*.5,dy=(ch-dh)*.5;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.fillStyle='#0E0E0E';
    ctx.fillRect(0,0,cw,ch);
    ctx.drawImage(img,0,0,FRAME_W,FRAME_H,dx,dy,dw,dh);
    if(!ready){
      ready=true;
      canvas.classList.add('is-ready');
      if(fallback)fallback.classList.add('is-hidden');
    }
  }

  function fade(p,a,b,f){
    if(p<a||p>b)return 0;
    const span=b-a,fi=a+span*f,fo=b-span*f;
    if(p<fi)return(p-a)/(fi-a);
    if(p>fo)return 1-(p-fo)/(b-fo);
    return 1;
  }

  function update(){
    /* Use the real sticky stage height, not window.innerHeight. This keeps the
       animation and the moment the sticky hero releases on exactly the same
       geometry, including mobile browser viewport changes. */
    const stageHeight=Math.max(1,stage.getBoundingClientRect().height);
    const max=Math.max(1,track.offsetHeight-stageHeight);
    const raw=Math.max(0,Math.min(1,-track.getBoundingClientRect().top/max));
    const p=raw;
    const t=Math.min(1,p/ROTATION_END);
    draw(Math.round(t*(FRAME_COUNT-1)));

    if(hook1)hook1.style.opacity=fade(p,.04,.18,.28);
    if(hook2)hook2.style.opacity=fade(p,.18,.36,.28);
    if(hook3){hook3.style.opacity=fade(p,.34,.60,.24);hook3.style.transform='translateX(-50%)'}

    const n=p<.64?0:p>=.69?1:(p-.64)/.05;
    const q=p<.67?0:p>=.72?1:(p-.67)/.05;
    const e=p<.70?0:p>=.75?1:(p-.70)/.05;
    const h=p<.73?0:p>=.78?1:(p-.73)/.05;
    const ph=p<.76?0:p>=.81?1:(p-.76)/.05;
    if(idName){idName.style.opacity=n;idName.style.transform=`translateY(${(1-n)*10}px)`}
    if(idQual){idQual.style.opacity=q;idQual.style.transform=`translateY(${(1-q)*10}px)`}
    if(idExp){idExp.style.opacity=e;idExp.style.transform=`translateY(${(1-e)*10}px)`}
    if(idHosp){idHosp.style.opacity=h;idHosp.style.transform=`translateY(${(1-h)*10}px)`}
    if(idPhoto){idPhoto.style.opacity=ph;idPhoto.style.transform=`scale(${.7+ph*.3})`}
    if(identityBlock){
      identityBlock.style.opacity=Math.max(n,q,e,h,ph);
      const ip=Math.max(0,Math.min(1,(p-.67)/.13));
      identityBlock.style.transform=`translateX(-50%) translateY(${(1-ip)*34}px)`;
    }
    if(progressFill)progressFill.style.transform=`translateY(${p*114}px)`;
    if(scrollCue)scrollCue.style.opacity=p>.045?'0':'1';

    /* Contact controls appear only when the sticky hero has actually reached
       its release point, never while the final frame is still being shown. */
    const finished=p>=.999;
    heroNavs.forEach(el=>el.classList.toggle('hero-cinematic',!finished));
    if(nav)nav.classList.toggle('is-on-dark',!finished);
    if(mobileNav)mobileNav.classList.toggle('is-on-dark',!finished);
    document.getElementById('floatingContact')?.classList.toggle('show',finished);
    document.getElementById('siteAssistant')?.classList.toggle('show',finished);
  }

  for(let i=0;i<FRAME_COUNT;i++){
    const img=new Image();
    img.decoding='async';
    img.src=FRAME_DIR+`frame_${String(i+1).padStart(4,'0')}.webp`;
    img.onload=()=>{
      frames[i]=img;
      if(i===0||i===current)draw(current);
    };
  }

  size();
  update();
  window.addEventListener('scroll',()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;update()});
  },{passive:true});
  window.addEventListener('resize',()=>{
    size();
    update();
  },{passive:true});
})();
