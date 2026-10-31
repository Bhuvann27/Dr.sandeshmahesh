(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  const applyPhoto=(src)=>{
    if(!src)return;
    $$('[data-doctor-photo]').forEach(img=>{
      img.onload=()=>{
        img.classList.add('photo-ready');
        img.closest('.identity-photo')?.classList.add('photo-ready');
      };
      img.onerror=()=>img.classList.remove('photo-ready');
      img.src=src;
    });
  };

  const source=$('#doctorPhotoSource');
  if(source){
    fetch('assets/doctor-sandesh.b64',{cache:'force-cache'})
      .then(r=>{if(!r.ok)throw new Error('photo source unavailable');return r.text()})
      .then(b64=>{
        const clean=b64.trim();
        if(!clean)throw new Error('empty photo source');
        applyPhoto(`data:image/webp;base64,${clean}`);
      })
      .catch(()=>{
        applyPhoto('assets/doctor-sandesh.webp');
      });
  }

  const year=$('#year');
  if(year)year.textContent=new Date().getFullYear();

  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}
  }),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  $$('.reveal').forEach(el=>revealObserver.observe(el));

  $$('.care-list button,.care-accordion button').forEach(btn=>btn.addEventListener('click',()=>{
    const item=btn.closest('.care-item,article');
    if(!item)return;
    const open=item.classList.toggle('open');
    btn.setAttribute('aria-expanded',String(open));
  }));

  const nav=$('#siteNav');
  const sections=$$('main section[id]:not(#home)');
  const links=$$('.nav-links a,.mobile-nav-row a');
  const homeLinks=$$('a[href="#home"]');
  const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    links.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`));
  }),{rootMargin:'-45% 0px -45% 0px'});
  sections.forEach(section=>navObserver.observe(section));

  const hero=$('#coatTrack');
  const updateNav=()=>{
    if(!nav||!hero)return;
    const bottom=hero.getBoundingClientRect().bottom;
    const dark=bottom>0&&bottom<window.innerHeight*1.02;
    nav.classList.toggle('is-on-dark',dark);
    const mobile=$('#mobileNav');
    mobile?.classList.toggle('is-on-dark',dark);
  };
  addEventListener('scroll',updateNav,{passive:true});
  updateNav();

  homeLinks.forEach(link=>link.addEventListener('click',()=>links.forEach(l=>l.classList.remove('active'))));

  function initAssistant(){
    if(document.querySelector('.site-assistant'))return;
    const style=document.createElement('style');
    style.textContent=`
      .site-assistant{position:fixed;right:max(28px,env(safe-area-inset-right,0px));bottom:162px;z-index:910;font-family:Inter,system-ui,sans-serif}
      .assistant-toggle{width:56px;height:56px;border:1px solid rgba(255,255,255,.22);border-radius:50%;padding:0;background:#202020;box-shadow:0 12px 35px rgba(0,0,0,.25);cursor:pointer;display:grid;place-items:center;transition:transform .25s ease,box-shadow .25s ease}
      .assistant-toggle:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(0,0,0,.3)}
      .assistant-toggle img{width:30px;height:30px;border-radius:8px}
      .assistant-panel{position:absolute;right:0;bottom:66px;width:min(360px,calc(100vw - 32px));height:min(520px,70vh);background:#fbf9f4;border:1px solid rgba(23,19,15,.12);border-radius:20px;box-shadow:0 25px 70px rgba(0,0,0,.22);overflow:hidden;display:none;flex-direction:column}
      .site-assistant.open .assistant-panel{display:flex}
      .assistant-head{padding:16px 17px;background:#202020;color:#fbf9f4;display:flex;align-items:center;justify-content:space-between}
      .assistant-head strong{display:block;font-size:.92rem}.assistant-head span{display:block;margin-top:3px;font-size:.68rem;color:#c8c1b7}
      .assistant-close{border:0;background:transparent;color:#fff;font-size:20px;cursor:pointer;padding:4px}
      .assistant-messages{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
      .assistant-msg{max-width:86%;padding:11px 13px;border-radius:14px;font-size:.83rem;line-height:1.5;white-space:pre-wrap}.assistant-msg.bot{align-self:flex-start;background:#eee9df;color:#201b17;border-bottom-left-radius:5px}.assistant-msg.user{align-self:flex-end;background:#f2540c;color:#fff;border-bottom-right-radius:5px}
      .assistant-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(23,19,15,.1);background:#fff}.assistant-form input{min-width:0;flex:1;border:1px solid rgba(23,19,15,.14);border-radius:999px;padding:11px 13px;font:inherit;font-size:.82rem;outline:none}.assistant-form input:focus{border-color:#f2540c}.assistant-form button{border:0;border-radius:999px;background:#f2540c;color:#fff;padding:0 15px;font-weight:800;cursor:pointer}.assistant-form button:disabled{opacity:.5;cursor:wait}
      @media(max-width:880px){.site-assistant{right:14px;bottom:132px}.assistant-panel{bottom:62px;width:calc(100vw - 28px);height:min(520px,68vh)}}
    `;
    document.head.appendChild(style);
    const root=document.createElement('div');root.className='site-assistant';
    root.innerHTML=`<div class="assistant-panel" role="dialog" aria-label="Website assistant"><div class="assistant-head"><div><strong>Website Assistant</strong><span>Questions about Dr. Sandesh &amp; women's health</span></div><button class="assistant-close" aria-label="Close assistant">×</button></div><div class="assistant-messages" aria-live="polite"></div><form class="assistant-form"><input maxlength="600" placeholder="Ask a question…" autocomplete="off"><button type="submit">Send</button></form></div><button class="assistant-toggle" aria-label="Open website assistant"><img src="assets/chatbot/anise-assistant.svg" alt=""></button>`;
    document.body.appendChild(root);
    const messages=$('.assistant-messages',root),form=$('.assistant-form',root),input=$('input',form),send=$('button',form),toggle=$('.assistant-toggle',root),close=$('.assistant-close',root),history=[];
    const add=(text,role)=>{const el=document.createElement('div');el.className=`assistant-msg ${role}`;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el};
    add("Hi. I can help with Dr. Sandesh's website information and general women's health questions. I can't diagnose or prescribe through chat.",'bot');
    toggle.addEventListener('click',()=>{root.classList.toggle('open');if(root.classList.contains('open'))setTimeout(()=>input.focus(),50)});
    close.addEventListener('click',()=>root.classList.remove('open'));
    form.addEventListener('submit',async e=>{
      e.preventDefault();const message=input.value.trim();if(!message||send.disabled)return;input.value='';add(message,'user');send.disabled=true;const typing=add('Thinking…','bot');
      try{const response=await fetch(`${window.SUPABASE_CONFIG.url}/functions/v1/site-assistant`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({doctor_slug:window.SUPABASE_CONFIG.doctorSlug||'sandesh-mahesh',message,history})});const data=await response.json();typing.remove();if(!response.ok)throw new Error(data?.error||'Assistant unavailable');add(data.answer||'I could not generate an answer right now.','bot');history.push({role:'user',text:message},{role:'model',text:data.answer||''});if(history.length>6)history.splice(0,history.length-6)}catch(err){typing.textContent='The assistant is unavailable right now. Please use the phone or WhatsApp options below.';console.error(err)}finally{send.disabled=false;input.focus()}
    });
  }
  if(window.SUPABASE_CONFIG?.url)initAssistant();
})();
