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

  function initAssistant(){
    if(document.querySelector('.site-assistant'))return;
    const style=document.createElement('style');
    style.textContent=`
      .site-assistant{position:fixed;right:20px;bottom:92px;z-index:50;font-family:Inter,system-ui,sans-serif}
      .assistant-toggle{width:52px;height:52px;border:1px solid rgba(255,255,255,.22);border-radius:50%;padding:0;background:#202020;box-shadow:0 12px 35px rgba(0,0,0,.25);cursor:pointer;display:grid;place-items:center;transition:transform .25s ease,box-shadow .25s ease}
      .assistant-toggle:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(0,0,0,.3)}
      .assistant-toggle img{width:29px;height:29px;border-radius:8px}
      .assistant-panel{position:absolute;right:0;bottom:64px;width:min(360px,calc(100vw - 32px));height:min(520px,70vh);background:#fbf9f4;border:1px solid rgba(23,19,15,.12);border-radius:20px;box-shadow:0 25px 70px rgba(0,0,0,.22);overflow:hidden;display:none;flex-direction:column}
      .site-assistant.open .assistant-panel{display:flex}
      .assistant-head{padding:16px 17px;background:#202020;color:#fbf9f4;display:flex;align-items:center;justify-content:space-between}
      .assistant-head strong{display:block;font-size:.92rem}.assistant-head span{display:block;margin-top:3px;font-size:.68rem;color:#c8c1b7}
      .assistant-close{border:0;background:transparent;color:#fff;font-size:20px;cursor:pointer;padding:4px}
      .assistant-messages{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
      .assistant-msg{max-width:86%;padding:11px 13px;border-radius:14px;font-size:.83rem;line-height:1.5;white-space:pre-wrap}
      .assistant-msg.bot{align-self:flex-start;background:#eee9df;color:#201b17;border-bottom-left-radius:5px}.assistant-msg.user{align-self:flex-end;background:#f2540c;color:#fff;border-bottom-right-radius:5px}
      .assistant-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(23,19,15,.1);background:#fff}
      .assistant-form input{min-width:0;flex:1;border:1px solid rgba(23,19,15,.14);border-radius:999px;padding:11px 13px;font:inherit;font-size:.82rem;outline:none}.assistant-form input:focus{border-color:#f2540c}
      .assistant-form button{border:0;border-radius:999px;background:#f2540c;color:#fff;padding:0 15px;font-weight:800;cursor:pointer}.assistant-form button:disabled{opacity:.5;cursor:wait}
      @media(max-width:620px){.site-assistant{right:14px;bottom:84px}.assistant-panel{bottom:62px;width:calc(100vw - 28px);height:min(520px,68vh)}}
    `;
    document.head.appendChild(style);

    const root=document.createElement('div');
    root.className='site-assistant';
    root.innerHTML=`<div class="assistant-panel" role="dialog" aria-label="Website assistant"><div class="assistant-head"><div><strong>Website Assistant</strong><span>Questions about Dr. Sandesh & women's health</span></div><button class="assistant-close" aria-label="Close assistant">×</button></div><div class="assistant-messages" aria-live="polite"></div><form class="assistant-form"><input maxlength="600" placeholder="Ask a question…" autocomplete="off"><button type="submit">Send</button></form></div><button class="assistant-toggle" aria-label="Open website assistant"><img src="assets/chatbot/anise-assistant.svg" alt=""></button>`;
    document.body.appendChild(root);

    const panel=$('.assistant-panel',root),messages=$('.assistant-messages',root),form=$('.assistant-form',root),input=$('input',form),send=$('button',form),toggle=$('.assistant-toggle',root),close=$('.assistant-close',root);
    const history=[];
    const add=(text,role)=>{const el=document.createElement('div');el.className=`assistant-msg ${role}`;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el};
    add("Hi. I can help with Dr. Sandesh's website information and general women's health questions. I can't diagnose or prescribe through chat.",'bot');
    toggle.addEventListener('click',()=>{root.classList.toggle('open');if(root.classList.contains('open'))setTimeout(()=>input.focus(),50)});
    close.addEventListener('click',()=>root.classList.remove('open'));
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const message=input.value.trim();if(!message||send.disabled)return;
      input.value='';add(message,'user');send.disabled=true;
      const typing=add('Thinking…','bot');
      try{
        const response=await fetch(`${window.SUPABASE_CONFIG.url}/functions/v1/site-assistant`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({doctor_slug:window.SUPABASE_CONFIG.doctorSlug||'sandesh-mahesh',message,history})});
        const data=await response.json();typing.remove();
        if(!response.ok)throw new Error(data?.error||'Assistant unavailable');
        add(data.answer||'I could not generate an answer right now.','bot');
        history.push({role:'user',text:message},{role:'model',text:data.answer||''});
        if(history.length>6)history.splice(0,history.length-6);
      }catch(err){typing.textContent='The assistant is unavailable right now. Please use the phone or WhatsApp options below.';console.error(err)}finally{send.disabled=false;input.focus()}
    });
  }

  if(window.SUPABASE_CONFIG?.url) initAssistant();
})();