(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  const source=$("#doctorPhotoSource");
  if(source){
    fetch('assets/doctor-sandesh.b64').then(r=>r.text()).then(b=>{
      source.src='data:image/webp;base64,'+b.trim();
      $$('[data-doctor-photo]').forEach(img=>img.src=source.src);
    }).catch(()=>{});
  }

  const year=$("#year");
  if(year) year.textContent=new Date().getFullYear();

  const observer=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}
  }),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  $$('.reveal').forEach(el=>observer.observe(el));

  $$('.care-list button').forEach(btn=>btn.addEventListener('click',()=>{
    const a=btn.closest('article');
    const open=a.classList.toggle('open');
    btn.setAttribute('aria-expanded',String(open));
  }));

  const nav=$("#siteNav"),hero=$("#heroTrack"),progress=$("#heroProgress"),hooks=$$('.hero-hook');
  const canvas=$("#heroCanvas");
  const desktop=()=>window.innerWidth>=881;
  let frames=[],current=0,heroReady=false;
  const FRAME_COUNT=197,FW=1440,FH=810;
  const localFrame=i=>`assets/hero-sequence-desktop/frame_${String(i+1).padStart(4,'0')}.webp`;
  const referenceFrame=i=>`https://raw.githubusercontent.com/Bhuvann27/Dr.amogh/main/assets/hero-sequence-desktop/frame_${String(i+1).padStart(4,'0')}.webp`;

  function fade(p,a,b,f=.28){
    if(p<a||p>b)return 0;
    const span=b-a,fi=a+span*f,fo=b-span*f;
    if(p<fi)return (p-a)/(fi-a);
    if(p>fo)return 1-(p-fo)/(b-fo);
    return 1;
  }

  function updateHero(){
    if(!hero)return;
    const max=Math.max(1,hero.offsetHeight-innerHeight);
    const p=Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/max));
    if(progress)progress.style.transform=`translateY(${p*118}px)`;
    if(hooks[0])hooks[0].style.opacity=fade(p,.04,.20,.28);
    if(hooks[1])hooks[1].style.opacity=fade(p,.24,.50,.28);
    if(nav)nav.classList.toggle('dark',p>.12&&p<.88);
    if(desktop()&&heroReady)draw(Math.round(Math.min(1,p/.96)*(FRAME_COUNT-1)));
  }

  function sizeCanvas(){
    if(!canvas||!desktop())return;
    const r=canvas.parentElement.getBoundingClientRect();
    const d=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(r.width*d));
    canvas.height=Math.max(1,Math.round(r.height*d));
    draw(current);
  }

  function draw(i){
    if(!canvas||!desktop())return;
    const img=frames[i];
    if(!img||!img.complete)return;
    current=Math.max(0,Math.min(FRAME_COUNT-1,i));
    const ctx=canvas.getContext('2d',{alpha:false});
    const scale=Math.max(canvas.width/FW,canvas.height/FH);
    const dw=FW*scale,dh=FH*scale,dx=(canvas.width-dw)/2,dy=(canvas.height-dh)/2;
    ctx.fillStyle='#0E0E0E';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,0,0,FW,FH,dx,dy,dw,dh);
  }

  function addAmbient(){
    const stage=hero?.querySelector('.hero-stage');
    if(!stage||stage.querySelector('.hero-ambient'))return;
    const ambient=document.createElement('div');
    ambient.className='hero-ambient';
    ambient.innerHTML='<span class="ambient-cross">+</span><span class="ambient-ring"></span><span class="ambient-ecg">⌁</span><span class="ambient-dot"></span>';
    stage.appendChild(ambient);
    stage.addEventListener('pointermove',e=>{
      if(!desktop())return;
      const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      $$('.hero-ambient > *',stage).forEach((el,i)=>{const d=(i+1)*4;el.style.marginLeft=`${x*d}px`;el.style.marginTop=`${y*d}px`});
    },{passive:true});
  }

  function loadHero(){
    if(!canvas||!desktop())return;
    frames=new Array(FRAME_COUNT);
    for(let i=0;i<FRAME_COUNT;i++){
      const img=new Image();
      img.decoding='async';
      img.src=localFrame(i);
      img.onerror=()=>{ if(img.src!==referenceFrame(i)) img.src=referenceFrame(i); };
      img.onload=()=>{frames[i]=img;heroReady=true;if(i===0||i===current)draw(current);};
    }
    addAmbient();sizeCanvas();
  }

  let lastWidth=innerWidth;
  addEventListener('scroll',()=>requestAnimationFrame(updateHero),{passive:true});
  addEventListener('resize',()=>{if(Math.abs(innerWidth-lastWidth)>1){lastWidth=innerWidth;sizeCanvas();loadHero();}},{passive:true});
  updateHero();loadHero();

  const links=$$('.nav-links a,.mobile-nav a'),sections=$$('main section[id]');
  const nio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')===`#${e.target.id}`));
  }),{rootMargin:'-45% 0px -45% 0px'});
  sections.forEach(s=>nio.observe(s));
})();