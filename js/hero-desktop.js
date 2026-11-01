(function(){
  "use strict";

  const track=document.getElementById("coatTrack");
  const progressFill=document.getElementById("progressFill");
  const scrollCue=document.getElementById("scrollCue");
  const nav=document.getElementById("siteNav");
  const mobileNav=document.getElementById("mobileNav");
  const heroNavs=[nav,mobileNav].filter(Boolean);
  const mobileMQ=window.matchMedia("(max-width:640px)");
  const hook1=document.getElementById("hook1");
  const hook2=document.getElementById("hook2");
  const hook3=document.getElementById("hook3");
  const idName=document.getElementById("idName");
  const idQual=document.getElementById("idQual");
  const idExp=document.getElementById("idExp");
  const idHosp=document.getElementById("idHosp");
  const idPhoto=document.getElementById("identityPhoto");
  const identityBlock=document.getElementById("identityBlock");
  const heroCanvas=document.getElementById("heroCanvas");
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if(!track||!heroCanvas)return;

  const ROTATION_END=.96,FRAME_W=720,FRAME_H=1280,FRAME_COUNT=197,FRAME_DIR="assets/hero-sequence-desktop/";
  const heroFrames=new Array(FRAME_COUNT);let heroFrame=0,canvasCtx=null;

  function sizeHeroCanvas(){
    const stage=document.getElementById("coatStage")||heroCanvas.parentElement;
    const rect=stage.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    heroCanvas.width=Math.max(1,Math.round(rect.width*dpr));heroCanvas.height=Math.max(1,Math.round(rect.height*dpr));
    if(!canvasCtx)canvasCtx=heroCanvas.getContext("2d",{alpha:false});
    drawHeroFrame(heroFrame);
  }

  function drawHeroFrame(index){
    if(!canvasCtx)return;
    heroFrame=Math.max(0,Math.min(FRAME_COUNT-1,index));
    let img=heroFrames[heroFrame];
    if(!img||!img.complete){for(let d=1;d<FRAME_COUNT;d++){const a=heroFrame-d,b=heroFrame+d;if(a>=0&&heroFrames[a]?.complete){img=heroFrames[a];break}if(b<FRAME_COUNT&&heroFrames[b]?.complete){img=heroFrames[b];break}}}
    if(!img||!img.complete)return;
    const cw=heroCanvas.width,ch=heroCanvas.height,desktop=window.innerWidth>=881;
    const scale=desktop?Math.min(cw/FRAME_W,ch/FRAME_H):Math.max(cw/FRAME_W,ch/FRAME_H),dw=FRAME_W*scale,dh=FRAME_H*scale,dx=(cw-dw)*.5,dy=(ch-dh)*.5;
    canvasCtx.imageSmoothingEnabled=true;canvasCtx.imageSmoothingQuality="high";
    canvasCtx.fillStyle="#0E0E0E";canvasCtx.fillRect(0,0,cw,ch);
    if(desktop){
      const bgScale=Math.max(cw/FRAME_W,ch/FRAME_H)*1.08,bgW=FRAME_W*bgScale,bgH=FRAME_H*bgScale,bgX=(cw-bgW)*.5,bgY=(ch-bgH)*.5;
      canvasCtx.save();canvasCtx.filter="blur(22px) brightness(.52) saturate(.78)";canvasCtx.drawImage(img,0,0,FRAME_W,FRAME_H,bgX,bgY,bgW,bgH);canvasCtx.restore();
      const shade=canvasCtx.createLinearGradient(0,0,cw,0);shade.addColorStop(0,"rgba(8,8,8,.34)");shade.addColorStop(.24,"rgba(8,8,8,.12)");shade.addColorStop(.5,"rgba(8,8,8,.05)");shade.addColorStop(.76,"rgba(8,8,8,.12)");shade.addColorStop(1,"rgba(8,8,8,.34)");canvasCtx.fillStyle=shade;canvasCtx.fillRect(0,0,cw,ch);
    }
    canvasCtx.drawImage(img,0,0,FRAME_W,FRAME_H,dx,dy,dw,dh);
  }

  function fadeWindow(p,start,end,fadeFrac){const span=end-start,fadeIn=start+span*fadeFrac,fadeOut=end-span*fadeFrac;if(p<start||p>end)return 0;if(p<fadeIn)return(p-start)/(fadeIn-start);if(p>fadeOut)return 1-(p-fadeOut)/(end-fadeOut);return 1}
  function identityFade(p,start,end){if(p<start)return 0;if(p>=end)return 1;return(p-start)/(end-start)}
  function setPostHeroVisibility(onHero){
    document.getElementById("floatingContact")?.classList.toggle("show",!onHero);
    document.querySelector(".site-assistant")?.classList.toggle("show",!onHero);
  }
  function updateTimeline(p){
    if(hook1)hook1.style.opacity=fadeWindow(p,.04,.16,.28);
    if(hook2)hook2.style.opacity=fadeWindow(p,.18,.32,.30);
    if(hook3)hook3.style.opacity=fadeWindow(p,.36,.54,.30);
    const zones=[ [idName,.64,.69], [idQual,.67,.72], [idExp,.70,.75], [idHosp,.73,.78], [idPhoto,.76,.81] ];
    zones.forEach(([el,a,b])=>{if(!el)return;const v=identityFade(p,a,b);el.style.opacity=v;el.style.transform=el===idPhoto?`scale(${.7+v*.3})`:`translateY(${(1-v)*10}px)`});
    if(identityBlock){const v=Math.max(0,Math.min(1,(p-.67)/.13));identityBlock.style.opacity=Math.max(...zones.filter(z=>z[0]).map(z=>identityFade(p,z[1],z[2])));identityBlock.style.transform=`translateX(-50%) translateY(${(1-v)*34}px)`}
    if(progressFill)progressFill.style.transform=`translateY(${p*114}px)`;
    if(scrollCue)scrollCue.style.opacity=p>.045?0:1;
    const onHero=p<.96;heroNavs.forEach(el=>el.classList.toggle("is-on-dark",onHero));setPostHeroVisibility(onHero);
  }
  function renderRotation(p){if(reduced)return;drawHeroFrame(Math.round(Math.max(0,Math.min(1,p/ROTATION_END))*(FRAME_COUNT-1)))}
  function loadHeroFrames(){for(let i=0;i<FRAME_COUNT;i++){const img=new Image();img.decoding="async";img.src=FRAME_DIR+`frame_${String(i+1).padStart(4,"0")}.webp`;img.onload=()=>{heroFrames[i]=img;if(i===0||i===heroFrame){if(i===0)sizeHeroCanvas();drawHeroFrame(heroFrame)}};}}

  heroNavs.forEach(el=>el.classList.add("hero-cinematic"));loadHeroFrames();

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    if(mobileMQ.matches)ScrollTrigger.config({ignoreMobileResize:true});
    ScrollTrigger.create({trigger:track,start:"top top",end:"bottom bottom",scrub:true,onUpdate:self=>{const p=self.progress;renderRotation(Math.min(p,ROTATION_END));updateTimeline(p);const finished=p>=.96;heroNavs.forEach(el=>el.classList.toggle("hero-cinematic",!finished));}});
  }else{
    track.classList.add("no-js");
    [idName,idQual,idExp,idHosp].forEach(el=>{if(el){el.style.opacity=1;el.style.transform="none"}});if(idPhoto){idPhoto.style.opacity=1;idPhoto.style.transform="scale(1)"}if(scrollCue)scrollCue.style.display="none";heroNavs.forEach(el=>el.classList.remove("hero-cinematic"));setPostHeroVisibility(false);
  }

  let lastHeroWidth=window.innerWidth;
  const handleHeroResize=()=>{const width=window.innerWidth;if(!mobileMQ.matches||Math.abs(width-lastHeroWidth)>1){lastHeroWidth=width;sizeHeroCanvas();if(window.ScrollTrigger)ScrollTrigger.refresh()}};
  window.addEventListener("resize",handleHeroResize,{passive:true});
  if(mobileMQ.addEventListener)mobileMQ.addEventListener("change",()=>{lastHeroWidth=window.innerWidth;sizeHeroCanvas();if(window.ScrollTrigger)ScrollTrigger.refresh()});
  let raf=0;
  window.addEventListener("scroll",()=>{if(window.gsap&&window.ScrollTrigger)return;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const max=Math.max(1,track.offsetHeight-window.innerHeight),p=Math.max(0,Math.min(1,-track.getBoundingClientRect().top/max));renderRotation(p);updateTimeline(p)})},{passive:true});
  sizeHeroCanvas();updateTimeline(0);
})();