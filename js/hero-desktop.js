/* Sandesh hero: uses the exact 197-frame desktop sequence already present in Dr. Amogh. */
(function(){
  "use strict";
  const track=document.getElementById("coatTrack"),stage=document.getElementById("coatStage"),canvas=document.getElementById("heroCanvas");
  if(!track||!stage||!canvas)return;

  const FRAME_W=1440,FRAME_H=810,FRAME_COUNT=197,FRAME_DIR="assets/hero-sequence-desktop/",ROTATION_END=.96;
  const frames=new Array(FRAME_COUNT),ctx=canvas.getContext("2d",{alpha:false});
  let current=0,raf=0,lastWidth=window.innerWidth;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const controlsStyle=document.createElement("style");controlsStyle.textContent=`
    .floating-contact a{font-size:0!important}
    .floating-contact a:first-child{display:none!important}
    .floating-contact a::before{content:"";display:block;width:23px;height:23px;background-repeat:no-repeat;background-position:center;background-size:contain}
    .floating-contact a[aria-label="WhatsApp"]::before,.floating-contact a[aria-label="Message on WhatsApp"]::before{background-image:url("assets/icons/whatsapp.svg")}
    .floating-contact a[aria-label="Call"]::before,.floating-contact a[aria-label*="Call"]::before{background-image:url("assets/icons/phone.svg")}
    .floating-contact .whatsapp,.floating-contact .fc-whatsapp{background:#2FAE60;color:#fff}
    .floating-contact .phone,.floating-contact .fc-call{background:#17130F;color:#fff}
    .floating-contact a::before{filter:brightness(0) invert(1)}
    .site-assistant{bottom:calc(max(18px,env(safe-area-inset-bottom,0px)) + 138px)!important}
    #consult.section-stone{background:var(--ink);color:var(--paper)}
    #consult .section-head h2{color:var(--paper)}
    #consult .section-head>p{color:rgba(251,249,244,.72)}
    #consult .section-head .eyebrow{color:#FF7A3D}
    #consult .booking-panel{grid-template-columns:minmax(0,1.15fr) minmax(260px,.85fr);gap:28px;padding:0;border:0;background:transparent;align-items:start}
    #consult .booking-form{background:var(--paper);border:1px solid rgba(251,249,244,.18);border-top:4px solid var(--orange);border-radius:20px;padding:clamp(24px,4vw,36px);box-shadow:0 22px 55px rgba(0,0,0,.28)}
    #consult .booking-side{background:var(--paper);color:var(--ink);border:1px solid var(--line);border-radius:18px;padding:28px;position:sticky;top:90px;box-shadow:0 14px 40px rgba(0,0,0,.12)}
    #consult .booking-side>span{color:var(--orange)}
    #insights.section-dark{background:var(--paper);color:var(--ink)}
    #insights .section-head h2{color:var(--ink)}
    #insights .section-head>p{color:var(--text-dim)}
    #insights .section-head .eyebrow{color:var(--orange)}
    #insights .youtube-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
    #insights .youtube-card{background:var(--paper);border:1px solid var(--line);border-radius:16px}
    .section-stories-focus .story-cards-focus{grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr);gap:20px}
    .section-stories-focus .story-card{min-height:390px;border-radius:24px}
    .section-stories-focus .story-card-primary{background:var(--ink)!important;color:var(--paper)!important;border-color:var(--ink)!important;padding:clamp(30px,5vw,52px)}
    .section-stories-focus .story-card-secondary{background:var(--paper)!important;color:var(--ink)!important;border:1px solid rgba(23,19,15,.14)!important;padding:clamp(28px,4vw,40px)}
    .section-stories-focus .story-card-secondary .quote,.section-stories-focus .story-card-secondary .desc,.section-stories-focus .story-card-secondary .story-cta{color:var(--ink)!important}
    .section-stories-focus .story-card-primary .quote{font-size:clamp(1.8rem,4vw,3rem);max-width:12ch}
    .section-stories-focus .story-card-secondary .quote{font-size:clamp(1.35rem,3vw,1.8rem)}
    @media(max-width:880px){#insights .youtube-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:780px){#consult .booking-panel{display:flex;flex-direction:column;gap:16px}#consult .booking-form{border-top-width:3px;border-radius:18px;padding:22px 18px 24px}#consult .booking-side{position:static;width:100%;background:rgba(251,249,244,.07);color:var(--paper);border-color:rgba(251,249,244,.14);box-shadow:none}#consult .booking-side p{color:rgba(251,249,244,.72)}#consult .booking-side .btn-secondary{color:var(--paper);border-color:rgba(251,249,244,.25)}.section-stories-focus .story-cards-focus{grid-template-columns:1fr}.section-stories-focus .story-card{min-height:290px}}
    @media(max-width:640px){.site-assistant{bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + 114px)!important}.floating-contact a{width:50px;height:50px}.floating-contact{gap:10px}#insights .youtube-grid{grid-template-columns:1fr}.section-stories-focus .story-card-primary,.section-stories-focus .story-card-secondary{min-height:0;padding:26px 22px}}
  `;document.head.appendChild(controlsStyle);

  function setPostHeroVisibility(onHero){
    const floating=document.getElementById("floatingContact")||document.querySelector(".floating-contact");
    const assistant=document.querySelector(".site-assistant");
    floating?.classList.toggle("show",!onHero);
    assistant?.classList.toggle("show",!onHero);
  }

  function size(){
    const r=canvas.parentElement.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));draw(current);
  }

  function draw(index){
    const img=frames[index]||frames[current];
    if(!img||!img.complete)return;
    current=Math.max(0,Math.min(FRAME_COUNT-1,index));
    const cw=canvas.width,ch=canvas.height,desktop=window.innerWidth>=881;
    const scale=desktop?Math.min(cw/FRAME_W,ch/FRAME_H):Math.max(cw/FRAME_W,ch/FRAME_H);
    const dw=FRAME_W*scale,dh=FRAME_H*scale,dx=(cw-dw)*.5,dy=(ch-dh)*.5;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
    if(desktop){
      const bgScale=Math.max(cw/FRAME_W,ch/FRAME_H)*1.08,bgW=FRAME_W*bgScale,bgH=FRAME_H*bgScale,bgX=(cw-bgW)*.5,bgY=(ch-bgH)*.5;
      ctx.save();ctx.filter="blur(22px) brightness(.52) saturate(.78)";ctx.drawImage(img,0,0,FRAME_W,FRAME_H,bgX,bgY,bgW,bgH);ctx.restore();
      const shade=ctx.createLinearGradient(0,0,cw,0);shade.addColorStop(0,"rgba(8,8,8,.34)");shade.addColorStop(.24,"rgba(8,8,8,.12)");shade.addColorStop(.5,"rgba(8,8,8,.05)");shade.addColorStop(.76,"rgba(8,8,8,.12)");shade.addColorStop(1,"rgba(8,8,8,.34)");ctx.fillStyle=shade;ctx.fillRect(0,0,cw,ch);
    }else{ctx.fillStyle="#0E0E0E";ctx.fillRect(0,0,cw,ch)}
    ctx.drawImage(img,0,0,FRAME_W,FRAME_H,dx,dy,dw,dh);
  }

  function nearestDecoded(index){
    if(frames[index]?.complete)return frames[index];
    for(let d=1;d<FRAME_COUNT;d++){const a=index-d,b=index+d;if(a>=0&&frames[a]?.complete)return frames[a];if(b<FRAME_COUNT&&frames[b]?.complete)return frames[b]}
    return null;
  }

  function fade(p,a,b,f){if(p<a||p>b)return 0;const span=b-a,fi=a+span*f,fo=b-span*f;if(p<fi)return(p-a)/(fi-a);if(p>fo)return 1-(p-fo)/(b-fo);return 1}
  function identityFade(p,start,end){if(p<start)return 0;if(p>=end)return 1;return(p-start)/(end-start)}

  function render(p){
    const progress=Math.max(0,Math.min(1,p)),t=Math.min(1,progress/ROTATION_END);
    if(!reduced)draw(Math.round(t*(FRAME_COUNT-1)));else draw(0);
    const h1=document.getElementById("hook1"),h2=document.getElementById("hook2"),h3=document.getElementById("hook3");
    if(h1)h1.style.opacity=fade(progress,.04,.18,.28);
    if(h2)h2.style.opacity=fade(progress,.18,.36,.30);
    if(h3){h3.style.opacity=fade(progress,.34,.60,.30);h3.style.transform="translateX(-50%)"}
    const idMap=[["idName",.64,.69],["idQual",.67,.72],["idExp",.70,.75],["idHosp",.73,.78],["identityPhoto",.76,.81]];
    idMap.forEach(([id,a,b])=>{const el=document.getElementById(id);if(!el)return;const v=identityFade(progress,a,b);el.style.opacity=v;el.style.transform=id==="identityPhoto"?`scale(${.7+.3*v})`:`translateY(${10-10*v}px)`});
    const progressFill=document.getElementById("progressFill");if(progressFill)progressFill.style.transform=`translateY(${progress*114}px)`;
    const cue=document.getElementById("scrollCue");if(cue)cue.style.opacity=progress>.045?"0":"1";
    const navs=[document.getElementById("siteNav"),document.getElementById("mobileNav")].filter(Boolean),onHero=progress<.96;
    navs.forEach(el=>el.classList.toggle("is-on-dark",onHero));setPostHeroVisibility(onHero);
  }

  for(let i=0;i<FRAME_COUNT;i++){
    const img=new Image();img.decoding="async";img.src=FRAME_DIR+`frame_${String(i+1).padStart(4,"0")}.webp`;
    img.onload=()=>{frames[i]=img;if(i===0||i===current)draw(current)};
  }

  stage.addEventListener("pointermove",e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;stage.querySelectorAll(".ambient-mark").forEach((el,i)=>{const depth=(i+1)*4;el.style.marginLeft=`${x*depth}px`;el.style.marginTop=`${y*depth}px`})},{passive:true});

  const ambient=document.createElement("div");ambient.className="hero-ambient-desktop";ambient.innerHTML='<span class="ambient-mark ambient-cross">+</span><span class="ambient-mark ambient-ring"></span><span class="ambient-mark ambient-ecg">⌁</span><span class="ambient-mark ambient-dot"></span>';stage.appendChild(ambient);
  const ambientStyle=document.createElement("style");ambientStyle.textContent='@media(min-width:881px){.hero-ambient-desktop{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden;opacity:.72}.ambient-mark{position:absolute;display:block;color:rgba(224,162,78,.42);text-shadow:0 0 22px rgba(224,162,78,.16);will-change:transform;transition:transform .18s ease-out}.ambient-cross{left:15%;top:29%;font:500 18px/1 Inter,sans-serif}.ambient-ring{right:14%;top:23%;width:28px;height:28px;border:1px solid rgba(252,248,244,.18);border-radius:50%}.ambient-ecg{right:20%;bottom:26%;font:400 38px/1 Inter,sans-serif;opacity:.24}.ambient-dot{left:22%;bottom:25%;width:5px;height:5px;border-radius:50%;background:rgba(252,248,244,.3);box-shadow:0 0 18px rgba(252,248,244,.18)}}';document.head.appendChild(ambientStyle);

  function onScroll(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const max=Math.max(1,track.offsetHeight-window.innerHeight),p=Math.max(0,Math.min(1,-track.getBoundingClientRect().top/max));render(p)})}
  size();window.addEventListener("resize",()=>{if(Math.abs(window.innerWidth-lastWidth)>1){lastWidth=window.innerWidth;size()}},{passive:true});window.addEventListener("scroll",onScroll,{passive:true});render(0);
})();
