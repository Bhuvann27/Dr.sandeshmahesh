/* Sandesh hero: Amogh's cinematic hero architecture, with Sandesh identity content. */
(function(){
  'use strict';
  const track=document.getElementById('coatTrack');
  const progressFill=document.getElementById('progressFill');
  const scrollCue=document.getElementById('scrollCue');
  const nav=document.getElementById('siteNav');
  const mobileNav=document.getElementById('mobileNav');
  const heroNavs=[nav,mobileNav].filter(Boolean);
  const mobileMQ=window.matchMedia('(max-width: 640px)');
  const hook1=document.getElementById('hook1'),hook2=document.getElementById('hook2'),hook3=document.getElementById('hook3');
  const idName=document.getElementById('idName'),idQual=document.getElementById('idQual'),idExp=document.getElementById('idExp'),idHosp=document.getElementById('idHosp'),idPhoto=document.getElementById('identityPhoto'),identityBlock=document.getElementById('identityBlock');
  const coatImgWrap=document.getElementById('coatImgWrap'),heroCanvas=document.getElementById('heroCanvas');
  if(!track||!heroCanvas)return;

  const ROTATION_END=.96,FRAME_W=720,FRAME_H=1280,FRAME_COUNT=197,FRAME_DIR='assets/hero-sequence-hires/';
  const heroFrames=new Array(FRAME_COUNT);let heroFrame=0,canvasCtx=null;

  function sizeHeroCanvas(){
    const stage=document.getElementById('coatStage')||heroCanvas.parentElement;
    const rect=stage.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
    if(heroCanvas.width!==w||heroCanvas.height!==h){heroCanvas.width=w;heroCanvas.height=h}
    if(!canvasCtx)canvasCtx=heroCanvas.getContext('2d',{alpha:false});
    drawHeroFrame(heroFrame);
  }

  function drawHeroFrame(index){
    if(!canvasCtx)return;
    heroFrame=Math.max(0,Math.min(FRAME_COUNT-1,index));
    let img=heroFrames[heroFrame];
    if(!img||!img.complete){
      for(let d=1;d<FRAME_COUNT;d++){
        const a=heroFrame-d,b=heroFrame+d;
        if(a>=0&&heroFrames[a]?.complete){img=heroFrames[a];break}
        if(b<FRAME_COUNT&&heroFrames[b]?.complete){img=heroFrames[b];break}
      }
    }
    if(!img||!img.complete)return;
    const cw=heroCanvas.width,ch=heroCanvas.height,desktop=window.innerWidth>=881;
    const scale=desktop?Math.min(cw/FRAME_W,ch/FRAME_H):Math.max(cw/FRAME_W,ch/FRAME_H);
    const dw=FRAME_W*scale,dh=FRAME_H*scale,dx=(cw-dw)*.5,dy=(ch-dh)*.5;
    canvasCtx.imageSmoothingEnabled=true;canvasCtx.imageSmoothingQuality='high';
    if(desktop){
      const bgScale=Math.max(cw/FRAME_W,ch/FRAME_H)*1.08,bgW=FRAME_W*bgScale,bgH=FRAME_H*bgScale,bgX=(cw-bgW)*.5,bgY=(ch-bgH)*.5;
      canvasCtx.save();canvasCtx.filter='blur(22px) brightness(.52) saturate(.78)';canvasCtx.drawImage(img,0,0,FRAME_W,FRAME_H,bgX,bgY,bgW,bgH);canvasCtx.restore();
      const shade=canvasCtx.createLinearGradient(0,0,cw,0);
      shade.addColorStop(0,'rgba(8,8,8,.34)');shade.addColorStop(.24,'rgba(8,8,8,.12)');shade.addColorStop(.5,'rgba(8,8,8,.05)');shade.addColorStop(.76,'rgba(8,8,8,.12)');shade.addColorStop(1,'rgba(8,8,8,.34)');
      canvasCtx.fillStyle=shade;canvasCtx.fillRect(0,0,cw,ch);
    }else{canvasCtx.fillStyle='#0E0E0E';canvasCtx.fillRect(0,0,cw,ch)}
    canvasCtx.drawImage(img,0,0,FRAME_W,FRAME_H,dx,dy,dw,dh);
  }

  function renderRotation(p){drawHeroFrame(Math.round(Math.max(0,Math.min(1,p/ROTATION_END))*(FRAME_COUNT-1)))}
  function loadHeroFrames(){
    for(let i=0;i<FRAME_COUNT;i++){
      const img=new Image();img.decoding='async';img.src=FRAME_DIR+`frame_${String(i+1).padStart(4,'0')}.webp`;
      img.onload=()=>{heroFrames[i]=img;if(i===0||i===heroFrame){if(i===0)sizeHeroCanvas();drawHeroFrame(heroFrame)}};
      img.onerror=()=>console.warn('Hero frame failed to load:',i+1);
    }
  }

  heroNavs.forEach(el=>el.classList.add('hero-cinematic'));loadHeroFrames();
  let lastHeroWidth=window.innerWidth;
  window.addEventListener('resize',()=>{const width=window.innerWidth;if(!mobileMQ.matches||Math.abs(width-lastHeroWidth)>1){lastHeroWidth=width;sizeHeroCanvas()}},{passive:true});
  if(mobileMQ.addEventListener)mobileMQ.addEventListener('change',()=>{lastHeroWidth=window.innerWidth;sizeHeroCanvas()});

  const H1=[.04,.16],H2=[.18,.32],H3=[.36,.54],ID={name:[.64,.69],qual:[.67,.72],exp:[.70,.75],hosp:[.73,.78],photo:[.76,.81]};
  function fade(p,s,e,f){const span=e-s,fi=s+span*f,fo=e-span*f;if(p<s||p>e)return 0;if(p<fi)return(p-s)/(fi-s);if(p>fo)return 1-(p-fo)/(e-fo);return 1}
  function idFade(p,s,e){if(p<s)return 0;if(p>=e)return 1;return(p-s)/(e-s)}

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);if(mobileMQ.matches)ScrollTrigger.config({ignoreMobileResize:true});
    ScrollTrigger.create({trigger:track,start:'top top',end:'bottom bottom',scrub:true,onUpdate:self=>{
      const p=self.progress;renderRotation(Math.min(p,ROTATION_END));
      if(hook1)hook1.style.opacity=fade(p,H1[0],H1[1],.28);if(hook2)hook2.style.opacity=fade(p,H2[0],H2[1],.30);if(hook3)hook3.style.opacity=fade(p,H3[0],H3[1],.30);
      const n=idFade(p,ID.name[0],ID.name[1]),q=idFade(p,ID.qual[0],ID.qual[1]),e=idFade(p,ID.exp[0],ID.exp[1]),h=idFade(p,ID.hosp[0],ID.hosp[1]),ph=idFade(p,ID.photo[0],ID.photo[1]);
      if(idName){idName.style.opacity=n;idName.style.transform=`translateY(${(1-n)*10}px)`}if(idQual){idQual.style.opacity=q;idQual.style.transform=`translateY(${(1-q)*10}px)`}if(idExp){idExp.style.opacity=e;idExp.style.transform=`translateY(${(1-e)*10}px)`}if(idHosp){idHosp.style.opacity=h;idHosp.style.transform=`translateY(${(1-h)*10}px)`}if(idPhoto){idPhoto.style.opacity=ph;idPhoto.style.transform=`scale(${.7+ph*.3})`}
      if(heroCanvas)heroCanvas.style.transform=mobileMQ.matches?'translateY(-1.5vh) scale(1)':'';
      if(coatImgWrap){coatImgWrap.style.opacity=1;coatImgWrap.style.transform='none'}
      if(identityBlock){identityBlock.style.opacity=Math.max(n,q,e,h,ph);const ip=Math.max(0,Math.min(1,(p-.67)/.13));identityBlock.style.transform=`translateX(-50%) translateY(${(1-ip)*34}px)`}
      if(progressFill)progressFill.style.transform=`translateY(${p*114}px)`;if(scrollCue)scrollCue.style.opacity=p>.045?'0':'1';
      const finished=p>=.96;heroNavs.forEach(el=>el.classList.toggle('hero-cinematic',!finished));if(nav)nav.classList.toggle('is-on-dark',!finished);if(mobileNav)mobileNav.classList.toggle('is-on-dark',!finished);
      const floating=document.getElementById('floatingContact');if(floating)floating.classList.toggle('show',finished);const assistant=document.getElementById('siteAssistant');if(assistant)assistant.classList.toggle('show',finished);
    }});
  }else{
    track.classList.add('no-js');[idName,idQual,idExp,idHosp].forEach(el=>{if(el){el.style.opacity=1;el.style.transform='none'}});if(idPhoto){idPhoto.style.opacity=1;idPhoto.style.transform='scale(1)'}if(identityBlock){identityBlock.style.opacity=1;identityBlock.style.transform='translateX(-50%)'}if(scrollCue)scrollCue.style.display='none';heroNavs.forEach(el=>el.classList.remove('hero-cinematic'));sizeHeroCanvas();
  }
})();
