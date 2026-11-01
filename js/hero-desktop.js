/* Sandesh hero: same interaction geometry as the proven Amogh hero. */
(function(){
  "use strict";
  const track=document.getElementById("coatTrack"),stage=document.getElementById("coatStage"),canvas=document.getElementById("heroCanvas");
  if(!track||!stage)return;
  const controlsStyle=document.createElement("style");controlsStyle.textContent=`
    .floating-contact a{font-size:0!important}
    .floating-contact a::before{content:"";display:block;width:23px;height:23px;background-repeat:no-repeat;background-position:center;background-size:contain}
    .floating-contact a[aria-label="Email"]::before{background-image:url("assets/icons/email.svg")}
    .floating-contact a[aria-label="WhatsApp"]::before{background-image:url("assets/icons/whatsapp.svg")}
    .floating-contact a[aria-label="Call"]::before{background-image:url("assets/icons/phone.svg")}
    .floating-contact .whatsapp{background:#25D366;color:#fff}
    .floating-contact .phone{background:#F2540C;color:#fff}
    .floating-contact .whatsapp::before,.floating-contact .phone::before{filter:brightness(0) invert(1)}
    .floating-contact a:first-child{background:#FBF9F4;color:#17130F}
  `;document.head.appendChild(controlsStyle);
  function setPostHeroVisibility(onHero){
    const floating=document.getElementById("floatingContact")||document.querySelector(".floating-contact");
    const assistant=document.querySelector(".site-assistant");
    floating?.classList.toggle("show",!onHero);
    assistant?.classList.toggle("show",!onHero);
  }
  function mobileSync(){
    const max=Math.max(1,track.offsetHeight-window.innerHeight),p=Math.max(0,Math.min(1,-track.getBoundingClientRect().top/max));
    const navs=[document.getElementById("siteNav"),document.getElementById("mobileNav")].filter(Boolean),onHero=p<.96;
    navs.forEach(el=>el.classList.toggle("is-on-dark",onHero));setPostHeroVisibility(onHero);
  }
  if(window.innerWidth<881){mobileSync();window.addEventListener("scroll",mobileSync,{passive:true});window.addEventListener("resize",mobileSync,{passive:true});return;}
  if(!canvas)return;
  const FRAME_W=1440,FRAME_H=810,FRAME_COUNT=197,FRAME_DIR="assets/hero-sequence-desktop/",ROTATION_END=.96;
  const frames=new Array(FRAME_COUNT),ctx=canvas.getContext("2d",{alpha:false});let current=0,raf=0;
  const style=document.createElement("style");style.textContent="@media (min-width:881px){.coat-imgwrap::before,.coat-imgwrap::after{display:none!important}.hero-frame-canvas{position:relative!important;z-index:1!important}}";document.head.appendChild(style);
  const ambient=document.createElement("div");ambient.className="hero-ambient-desktop";ambient.innerHTML='<span class="ambient-mark ambient-cross">+</span><span class="ambient-mark ambient-ring"></span><span class="ambient-mark ambient-ecg">⌁</span><span class="ambient-mark ambient-dot"></span>';stage.appendChild(ambient);
  const ambientStyle=document.createElement("style");ambientStyle.textContent=`@media (min-width:881px){.hero-ambient-desktop{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden;opacity:.72}.ambient-mark{position:absolute;display:block;color:rgba(224,162,78,.42);text-shadow:0 0 22px rgba(224,162,78,.16);will-change:transform;transition:transform .18s ease-out}.ambient-cross{left:15%;top:29%;font:500 18px/1 Inter,sans-serif;animation:heroFloatA 7s ease-in-out infinite}.ambient-ring{right:14%;top:23%;width:28px;height:28px;border:1px solid rgba(252,248,244,.18);border-radius:50%;animation:heroFloatB 9s ease-in-out infinite}.ambient-ecg{right:20%;bottom:26%;font:400 38px/1 Inter,sans-serif;opacity:.24;animation:heroFloatA 11s ease-in-out infinite reverse}.ambient-dot{left:22%;bottom:25%;width:5px;height:5px;border-radius:50%;background:rgba(252,248,244,.3);box-shadow:0 0 18px rgba(252,248,244,.18);animation:heroFloatB 8s ease-in-out infinite reverse}@keyframes heroFloatA{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(9px,-13px,0)}}@keyframes heroFloatB{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-10px,10px,0)}}@media(prefers-reduced-motion:reduce){.ambient-mark{animation:none!important}}}`;document.head.appendChild(ambientStyle);
  function size(){const r=canvas.parentElement.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));draw(current)}
  function draw(index){const img=frames[index];if(!img||!img.complete)return;current=Math.max(0,Math.min(FRAME_COUNT-1,index));const cw=canvas.width,ch=canvas.height,scale=Math.max(cw/FRAME_W,ch/FRAME_H),dw=FRAME_W*scale,dh=FRAME_H*scale,dx=(cw-dw)*.5,dy=(ch-dh)*.5;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.fillStyle="#0E0E0E";ctx.fillRect(0,0,cw,ch);ctx.drawImage(img,0,0,FRAME_W,FRAME_H,dx,dy,dw,dh)}
  function fade(p,a,b,f){if(p<a||p>b)return 0;const span=b-a,fi=a+span*f,fo=b-span*f;if(p<fi)return(p-a)/(fi-a);if(p>fo)return 1-(p-fo)/(b-fo);return 1}
  function update(){const max=Math.max(1,track.offsetHeight-window.innerHeight),p=Math.max(0,Math.min(1,-track.getBoundingClientRect().top/max)),t=Math.min(1,p/ROTATION_END);draw(Math.round(t*(FRAME_COUNT-1)));const h1=document.getElementById("hook1"),h2=document.getElementById("hook2"),h3=document.getElementById("hook3");if(h1)h1.style.opacity=fade(p,.04,.18,.28);if(h2)h2.style.opacity=fade(p,.18,.36,.28);if(h3){h3.style.opacity=fade(p,.34,.60,.24);h3.style.transform="translateX(-50%)"}const progress=document.getElementById("progressFill");if(progress)progress.style.transform=`translateY(${p*114}px)`;const cue=document.getElementById("scrollCue");if(cue)cue.style.opacity=p>.045?"0":"1";const navs=[document.getElementById("siteNav"),document.getElementById("mobileNav")].filter(Boolean),onHero=p<.96;navs.forEach(el=>el.classList.toggle("is-on-dark",onHero));setPostHeroVisibility(onHero)}
  for(let i=0;i<FRAME_COUNT;i++){const img=new Image();img.decoding="async";img.src=FRAME_DIR+`frame_${String(i+1).padStart(4,"0")}.webp`;img.onload=()=>{frames[i]=img;if(i===0||i===current)draw(current)}}
  stage.addEventListener("pointermove",e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;ambient.querySelectorAll(".ambient-mark").forEach((el,i)=>{const depth=(i+1)*4;el.style.marginLeft=`${x*depth}px`;el.style.marginTop=`${y*depth}px`})},{passive:true});
  size();window.addEventListener("resize",size,{passive:true});window.addEventListener("scroll",()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update()})},{passive:true});update();
})();
