/* Sandesh hero: uses the Amogh hero renderer and timeline unchanged; only identity content differs. */
(function(){
  'use strict';

  const track=document.getElementById('coatTrack');
  const progressFill=document.getElementById('progressFill');
  const scrollCue=document.getElementById('scrollCue');
  const nav=document.getElementById('siteNav');
  const mobileNav=document.getElementById('mobileNav');
  const heroNavs=[nav,mobileNav].filter(Boolean);
  const mobileMQ=window.matchMedia('(max-width: 640px)');
  const hook1=document.getElementById('hook1');
  const hook2=document.getElementById('hook2');
  const hook3=document.getElementById('hook3');
  const idName=document.getElementById('idName');
  const idQual=document.getElementById('idQual');
  const idExp=document.getElementById('idExp');
  const idHosp=document.getElementById('idHosp');
  const idPhoto=document.getElementById('identityPhoto');
  const identityBlock=document.getElementById('identityBlock');
  const coatImgWrap=document.getElementById('coatImgWrap');
  const heroCanvas=document.getElementById('heroCanvas');
  if(!track||!heroCanvas)return;

  const ROTATION_END=0.96;
  const FRAME_W=720;
  const FRAME_H=1280;
  const FRAME_COUNT=197;
  const FRAME_DIR_MOBILE='assets/hero-sequence-hires/';
  const FRAME_DIR_DESKTOP='assets/hero-sequence-desktop/';
  const heroFrames=new Array(FRAME_COUNT);
  let heroFrame=0;
  let canvasCtx=null;

  function sizeHeroCanvas(){
    if(!heroCanvas)return;
    const stage=document.getElementById('coatStage')||heroCanvas.parentElement;
    const rect=stage.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(rect.width*dpr));
    const h=Math.max(1,Math.round(rect.height*dpr));
    if(heroCanvas.width!==w||heroCanvas.height!==h){heroCanvas.width=w;heroCanvas.height=h}
    if(!canvasCtx)canvasCtx=heroCanvas.getContext('2d',{alpha:false});
    drawHeroFrame(heroFrame);
  }

  function drawHeroFrame(index){
    if(!heroCanvas||!canvasCtx)return;
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

    const cw=heroCanvas.width,ch=heroCanvas.height;
    const desktop=window.innerWidth>=881;
    const scale=desktop?Math.min(cw/FRAME_W,ch/FRAME_H):Math.max(cw/FRAME_W,ch/FRAME_H);
    const dw=FRAME_W*scale,dh=FRAME_H*scale;
    const dx=(cw-dw)*.5,dy=(ch-dh)*.5;
    canvasCtx.imageSmoothingEnabled=true;
    canvasCtx.imageSmoothingQuality='high';

    if(desktop){
      const bgScale=Math.max(cw/FRAME_W,ch/FRAME_H)*1.08;
      const bgW=FRAME_W*bgScale,bgH=FRAME_H*bgScale;
      const bgX=(cw-bgW)*.5,bgY=(ch-bgH)*.5;
      canvasCtx.save();
      canvasCtx.filter='blur(22px) brightness(.52) saturate(.78)';
      canvasCtx.drawImage(img,0,0,FRAME_W,FRAME_H,bgX,bgY,bgW,bgH);
      canvasCtx.restore();
      const shade=canvasCtx.createLinearGradient(0,0,cw,0);
      shade.addColorStop(0,'rgba(8,8,8,.34)');
      shade.addColorStop(.24,'rgba(8,8,8,.12)');
      shade.addColorStop(.5,'rgba(8,8,8,.05)');
      shade.addColorStop(.76,'rgba(8,8,8,.12)');
      shade.addColorStop(1,'rgba(8,8,8,.34)');
      canvasCtx.fillStyle=shade;
      canvasCtx.fillRect(0,0,cw,ch);
    }else{
      canvasCtx.fillStyle='#0E0E0E';
      canvasCtx.fillRect(0,0,cw,ch);
    }
    canvasCtx.drawImage(img,0,0,FRAME_W,FRAME_H,dx,dy,dw,dh);
  }

  function renderRotation(p){
    if(!heroCanvas)return;
    const t=Math.max(0,Math.min(1,p/ROTATION_END));
    drawHeroFrame(Math.round(t*(FRAME_COUNT-1)));
  }

  function loadHeroFrames(){
    if(!heroCanvas)return;
    const desktop=window.innerWidth>=881;
    const frameW=desktop?1440:720;
    const frameH=desktop?810:1280;
    const frameDir=desktop?FRAME_DIR_DESKTOP:FRAME_DIR_MOBILE;
    // Store dimensions on the canvas renderer through the same visual math,
    // while keeping the Amogh 197-frame timing exactly intact.
    void frameW; void frameH;
    for(let i=0;i<FRAME_COUNT;i++){
      const img=new Image();
      img.decoding='async';
      img.src=frameDir+`frame_${String(i+1).padStart(4,'0')}.webp`;
      img.onload=()=>{
        heroFrames[i]=img;
        if(i===0||i===heroFrame){if(i===0)sizeHeroCanvas();drawHeroFrame(heroFrame)}
      };
      img.onerror=()=>console.warn('Hero frame failed to load:',i+1);
    }
  }

  heroNavs.forEach(el=>el.classList.add('hero-cinematic'));
  loadHeroFrames();

  let lastHeroWidth=window.innerWidth;
  const handleHeroResize=()=>{
    const width=window.innerWidth;
    if(!mobileMQ.matches||Math.abs(width-lastHeroWidth)>1){
      lastHeroWidth=width;
      sizeHeroCanvas();
    }
  };
  window.addEventListener('resize',handleHeroResize,{passive:true});
  if(mobileMQ.addEventListener)mobileMQ.addEventListener('change',()=>{lastHeroWidth=window.innerWidth;sizeHeroCanvas()});

  const HOOK1_WINDOW=[0.04,0.16];
  const HOOK2_WINDOW=[0.18,0.32];
  const HOOK3_WINDOW=[0.36,0.54];
  const ID_ZONES={name:[0.64,0.69],qual:[0.67,0.72],exp:[0.70,0.75],hosp:[0.73,0.78],photo:[0.76,0.81]};

  function fadeWindow(p,start,end,fadeFrac){
    const span=end-start,fadeIn=start+span*fadeFrac,fadeOut=end-span*fadeFrac;
    if(p<start||p>end)return 0;
    if(p<fadeIn)return(p-start)/(fadeIn-start);
    if(p>fadeOut)return 1-(p-fadeOut)/(end-fadeOut);
    return 1;
  }
  function identityFade(p,start,end){if(p<start)return 0;if(p>=end)return 1;return(p-start)/(end-start)}

  function updateFallbackNav(p){
    if(!progressFill)return;
    progressFill.style.transform=`translateY(${p*114}px)`;
    if(scrollCue)scrollCue.style.opacity=p>.045?'0':'1';
  }

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    if(mobileMQ.matches)ScrollTrigger.config({ignoreMobileResize:true});
    ScrollTrigger.create({
      trigger:track,
      start:'top top',
      end:'bottom bottom',
      scrub:true,
      onUpdate:(self)=>{
        const p=self.progress;
        renderRotation(Math.min(p,ROTATION_END));
        if(hook1)hook1.style.opacity=fadeWindow(p,HOOK1_WINDOW[0],HOOK1_WINDOW[1],.28);
        if(hook2)hook2.style.opacity=fadeWindow(p,HOOK2_WINDOW[0],HOOK2_WINDOW[1],.30);
        if(hook3)hook3.style.opacity=fadeWindow(p,HOOK3_WINDOW[0],HOOK3_WINDOW[1],.30);

        const nameOp=identityFade(p,ID_ZONES.name[0],ID_ZONES.name[1]);
        const qualOp=identityFade(p,ID_ZONES.qual[0],ID_ZONES.qual[1]);
        const expOp=identityFade(p,ID_ZONES.exp[0],ID_ZONES.exp[1]);
        const hospOp=identityFade(p,ID_ZONES.hosp[0],ID_ZONES.hosp[1]);
        const photoOp=identityFade(p,ID_ZONES.photo[0],ID_ZONES.photo[1]);
        if(idName){idName.style.opacity=nameOp;idName.style.transform=`translateY(${(1-nameOp)*10}px)`}
        if(idQual){idQual.style.opacity=qualOp;idQual.style.transform=`translateY(${(1-qualOp)*10}px)`}
        if(idExp){idExp.style.opacity=expOp;idExp.style.transform=`translateY(${(1-expOp)*10}px)`}
        if(idHosp){idHosp.style.opacity=hospOp;idHosp.style.transform=`translateY(${(1-hospOp)*10}px)`}
        if(idPhoto){idPhoto.style.opacity=photoOp;idPhoto.style.transform=`scale(${.7+photoOp*.3})`}
        if(heroCanvas)heroCanvas.style.transform=mobileMQ.matches?'translateY(-1.5vh) scale(1)':'';
        if(coatImgWrap){coatImgWrap.style.opacity=1;coatImgWrap.style.transform='none'}
        const identityVisible=Math.max(nameOp,qualOp,expOp,hospOp,photoOp);
        if(identityBlock)identityBlock.style.opacity=identityVisible;
        const heroFinished=p>=.96;
        heroNavs.forEach(el=>el.classList.toggle('hero-cinematic',!heroFinished));
        if(identityBlock){const identityProgress=Math.max(0,Math.min(1,(p-.67)/.13));identityBlock.style.transform=`translateX(-50%) translateY(${(1-identityProgress)*34}px)`}
        updateFallbackNav(p);
        if(nav)nav.classList.toggle('is-on-dark',p<.96);
        if(mobileNav)mobileNav.classList.toggle('is-on-dark',p<.96);
        const floating=document.getElementById('floatingContact');
        if(floating)floating.classList.toggle('show',heroFinished);
        const assistant=document.getElementById('siteAssistant');
        if(assistant)assistant.classList.toggle('show',heroFinished);
      }
    });
  }else{
    track.classList.add('no-js');
    [idName,idQual,idExp,idHosp].forEach(el=>{if(el){el.style.opacity=1;el.style.transform='none'}});
    if(idPhoto){idPhoto.style.opacity=1;idPhoto.style.transform='scale(1)'}
    if(identityBlock){identityBlock.style.opacity=1;identityBlock.style.transform='translateX(-50%)'}
    if(scrollCue)scrollCue.style.display='none';
    heroNavs.forEach(el=>el.classList.remove('hero-cinematic'));
    sizeHeroCanvas();
  }
})();
