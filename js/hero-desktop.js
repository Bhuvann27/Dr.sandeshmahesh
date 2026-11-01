/* Sandesh hero renderer. Geometry/timing follows the working Amogh hero. */
(function(){
  'use strict';
  const track=document.getElementById('coatTrack'),stage=document.getElementById('coatStage'),canvas=document.getElementById('heroCanvas');
  if(!track||!stage||!canvas)return;
  const mobile=window.matchMedia('(max-width:880px)').matches;
  const FRAME_W=1440,FRAME_H=810,FRAME_COUNT=197,FRAME_DIR='assets/hero-sequence-desktop/',ROTATION_END=.96;
  const frames=new Array(FRAME_COUNT),ctx=canvas.getContext('2d',{alpha:false});
  let current=0,loaded=0,raf=0;
  const h1=document.getElementById('hook1'),h2=document.getElementById('hook2'),h3=document.getElementById('hook3');
  const idName=document.getElementById('idName'),idQual=document.getElementById('idQual'),idExp=document.getElementById('idExp'),idHosp=document.getElementById('idHosp'),idPhoto=document.getElementById('identityPhoto'),identityBlock=document.getElementById('identityBlock');
  const progress=document.getElementById('progressFill'),cue=document.getElementById('scrollCue'),navs=[document.getElementById('siteNav'),document.getElementById('mobileNav')].filter(Boolean);

  track.style.height='260vh';stage.style.position='sticky';stage.style.top='0';stage.style.height='100vh';

  function photoSrc(){return fetch('assets/doctor-sandesh-supplied.webp.b64',{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;return r.text()}).catch(()=>fetch('assets/doctor-sandesh.b64',{cache:'no-store'}).then(r=>r.text())).then(v=>'data:image/webp;base64,'+v.trim().replace(/\\s+/g,''));}
  let portrait=null;
  if(mobile){
    photoSrc().then(src=>{portrait=new Image();portrait.onload=()=>{size();drawMobile()};portrait.src=src}).catch(()=>{});
  }else{
    for(let i=0;i<FRAME_COUNT;i++){
      const img=new Image();img.decoding='async';img.src=FRAME_DIR+`frame_${String(i+1).padStart(4,'0')}.webp`;
      img.onload=()=>{frames[i]=img;loaded++;if(i===0||i===current)drawDesktop(current)};
    }
  }

  function size(){const r=stage.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));mobile?drawMobile():drawDesktop(current)}
  function drawDesktop(index){const img=frames[index]||frames[current];if(!img||!img.complete)return;current=Math.max(0,Math.min(FRAME_COUNT-1,index));const cw=canvas.width,ch=canvas.height,scale=Math.max(cw/FRAME_W,ch/FRAME_H),dw=FRAME_W*scale,dh=FRAME_H*scale,dx=(cw-dw)/2,dy=(ch-dh)/2;ctx.fillStyle='#0E0E0E';ctx.fillRect(0,0,cw,ch);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,FRAME_W,FRAME_H,dx,dy,dw,dh)}
  function drawMobile(){if(!portrait||!portrait.complete)return;const cw=canvas.width,ch=canvas.height,iw=portrait.naturalWidth,ih=portrait.naturalHeight,scale=Math.max(cw/iw,ch/ih),dw=iw*scale,dh=ih*scale,dx=(cw-dw)/2,dy=(ch-dh)*.44;ctx.fillStyle='#17130F';ctx.fillRect(0,0,cw,ch);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(portrait,dx,dy,dw,dh);const g=ctx.createLinearGradient(0,0,0,ch);g.addColorStop(0,'rgba(14,14,14,.08)');g.addColorStop(.55,'rgba(14,14,14,.06)');g.addColorStop(1,'rgba(14,14,14,.82)');ctx.fillStyle=g;ctx.fillRect(0,0,cw,ch)}
  function fade(p,a,b,f){if(p<a||p>b)return 0;const s=b-a,fi=a+s*f,fo=b-s*f;if(p<fi)return(p-a)/(fi-a);if(p>fo)return 1-(p-fo)/(b-fo);return 1}
  function identityFade(p,a,b){if(p<a)return 0;if(p>=b)return 1;return(p-a)/(b-a)}
  function render(p){
    if(mobile){drawMobile();}
    else drawDesktop(Math.round(Math.min(1,p/ROTATION_END)*(FRAME_COUNT-1)));
    if(h1)h1.style.opacity=fade(p,.04,.18,.28);if(h2)h2.style.opacity=fade(p,.18,.36,.28);if(h3){h3.style.opacity=fade(p,.34,.60,.24);h3.style.transform='translateX(-50%)'}
    [[idName,.64,.69],[idQual,.67,.72],[idExp,.70,.75],[idHosp,.73,.78],[idPhoto,.76,.81]].forEach(([el,a,b])=>{if(!el)return;const v=identityFade(p,a,b);el.style.opacity=v;el.style.transform=el===idPhoto?`scale(${.7+v*.3})`:`translateY(${(1-v)*10}px)`});
    if(identityBlock){const v=Math.max(0,Math.min(1,(p-.67)/.13));identityBlock.style.opacity=Math.max(identityFade(p,.64,.81),0);identityBlock.style.transform=`translateX(-50%) translateY(${(1-v)*34}px)`}
    if(progress)progress.style.transform=`translateY(${p*114}px)`;if(cue)cue.style.opacity=p>.045?'0':'1';navs.forEach(el=>el.classList.toggle('is-on-dark',p<.96));
    const floating=document.querySelector('.floating-contact'),assistant=document.querySelector('.site-assistant');floating?.classList.toggle('show',p>=.96);assistant?.classList.toggle('show',p>=.96);
  }

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    if(mobile)ScrollTrigger.config({ignoreMobileResize:true});
    ScrollTrigger.create({trigger:track,start:'top top',end:'bottom bottom',scrub:true,onUpdate:self=>render(self.progress)});
  }else{
    const update=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const max=Math.max(1,track.offsetHeight-window.innerHeight);render(Math.max(0,Math.min(1,-track.getBoundingClientRect().top/max)))})};window.addEventListener('scroll',update,{passive:true});update();
  }
  size();window.addEventListener('resize',()=>{if(!mobile)size()},{passive:true});
  if(mobile){window.visualViewport?.addEventListener('resize',()=>{}, {passive:true});}
})();
