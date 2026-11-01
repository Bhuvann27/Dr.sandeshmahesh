/* Sandesh hero renderer: direct local Amogh frame sequence, desktop + mobile. */
(function(){
  'use strict';
  const track=document.getElementById('coatTrack');
  const stage=document.getElementById('coatStage');
  const canvas=document.getElementById('heroCanvas');
  if(!track||!stage||!canvas)return;

  const FRAME_COUNT=197, FRAME_DIR='assets/hero-sequence-desktop/', ROTATION_END=.96;
  const frames=new Array(FRAME_COUNT),ctx=canvas.getContext('2d',{alpha:false});
  let current=0,started=false;
  const progressFill=document.getElementById('progressFill'),scrollCue=document.getElementById('scrollCue');
  const nav=document.getElementById('siteNav'),mobileNav=document.getElementById('mobileNav');
  const heroNavs=[nav,mobileNav].filter(Boolean);
  const hook1=document.getElementById('hook1'),hook2=document.getElementById('hook2'),hook3=document.getElementById('hook3');
  const idName=document.getElementById('idName'),idQual=document.getElementById('idQual'),idExp=document.getElementById('idExp'),idHosp=document.getElementById('idHosp'),idPhoto=document.getElementById('identityPhoto'),identityBlock=document.getElementById('identityBlock');
  const fallback=document.createElement('img');
  fallback.className='hero-fallback-frame';fallback.alt='';fallback.setAttribute('aria-hidden','true');fallback.src=FRAME_DIR+'frame_0001.webp';
  document.getElementById('coatImgWrap')?.prepend(fallback);

  function size(){const r=stage.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));draw(current)}
  function draw(index){const img=frames[index]||frames[current];if(!img||!img.complete||!img.naturalWidth)return;current=Math.max(0,Math.min(FRAME_COUNT-1,index));const cw=canvas.width,ch=canvas.height,sw=img.naturalWidth,sh=img.naturalHeight,scale=Math.max(cw/sw,ch/sh),dw=sw*scale,dh=sh*scale,dx=(cw-dw)/2,dy=(ch-dh)/2;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0E0E0E';ctx.fillRect(0,0,cw,ch);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,sw,sh,dx,dy,dw,dh);if(!started){started=true;canvas.classList.add('is-ready');fallback.classList.add('is-hidden')}}
  function render(p){draw(Math.round(Math.max(0,Math.min(1,p/ROTATION_END))*(FRAME_COUNT-1)))}
  function loadFrames(){for(let i=0;i<FRAME_COUNT;i++){const img=new Image();img.decoding='async';img.src=FRAME_DIR+`frame_${String(i+1).padStart(4,'0')}.webp`;img.onload=()=>{frames[i]=img;if(i===0||i===current){size();draw(current)}}}}
  heroNavs.forEach(el=>el.classList.add('hero-cinematic'));
  size();loadFrames();
  function fade(p,s,e,f){const span=e-s,fi=s+span*f,fo=e-span*f;if(p<s||p>e)return 0;if(p<fi)return(p-s)/(fi-s);if(p>fo)return 1-(p-fo)/(e-fo);return 1}
  function idFade(p,s,e){if(p<s)return 0;if(p>=e)return 1;return(p-s)/(e-s)}
  function update(p){render(p);if(hook1)hook1.style.opacity=fade(p,.04,.16,.28);if(hook2)hook2.style.opacity=fade(p,.18,.32,.30);if(hook3)hook3.style.opacity=fade(p,.36,.54,.30);const n=idFade(p,.64,.69),q=idFade(p,.67,.72),e=idFade(p,.70,.75),h=idFade(p,.73,.78),ph=idFade(p,.76,.81);if(idName){idName.style.opacity=n;idName.style.transform=`translateY(${(1-n)*10}px)`}if(idQual){idQual.style.opacity=q;idQual.style.transform=`translateY(${(1-q)*10}px)`}if(idExp){idExp.style.opacity=e;idExp.style.transform=`translateY(${(1-e)*10}px)`}if(idHosp){idHosp.style.opacity=h;idHosp.style.transform=`translateY(${(1-h)*10}px)`}if(idPhoto){idPhoto.style.opacity=ph;idPhoto.style.transform=`scale(${.7+ph*.3})`}if(identityBlock){identityBlock.style.opacity=Math.max(n,q,e,h,ph);const ip=Math.max(0,Math.min(1,(p-.67)/.13));identityBlock.style.transform=`translateX(-50%) translateY(${(1-ip)*34}px)`}if(progressFill)progressFill.style.transform=`translateY(${p*114}px)`;if(scrollCue)scrollCue.style.opacity=p>.045?'0':'1';const finished=p>=.96;heroNavs.forEach(el=>el.classList.toggle('hero-cinematic',!finished));if(nav)nav.classList.toggle('is-on-dark',!finished);if(mobileNav)mobileNav.classList.toggle('is-on-dark',!finished);document.getElementById('floatingContact')?.classList.toggle('show',finished);document.getElementById('siteAssistant')?.classList.toggle('show',finished)}
  function initScroll(){if(!window.gsap||!window.ScrollTrigger){track.classList.add('no-js');return}gsap.registerPlugin(ScrollTrigger);if(window.innerWidth<881)ScrollTrigger.config({ignoreMobileResize:true});ScrollTrigger.create({trigger:track,start:'top top',end:'bottom bottom',scrub:true,onUpdate:self=>update(self.progress)});size()}
  initScroll();window.addEventListener('resize',()=>{size();if(window.ScrollTrigger)window.ScrollTrigger.refresh()},{passive:true});
})();
