(()=>{
'use strict';
if(window.__sandeshFinalFix)return;window.__sandeshFinalFix=true;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

/* Correct the remaining stale hospital text everywhere on the page. */
const replaceText=(a,b)=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(n=>{if(n.nodeValue.includes(a))n.nodeValue=n.nodeValue.split(a).join(b)})};
replaceText('Siddhartha Hospital','Siddaganga Hospital');replaceText('SIDDHARTHA HOSPITAL','SIDDAGANGA HOSPITAL');
if(document.title.includes('Siddhartha'))document.title=document.title.replace(/Siddhartha/g,'Siddaganga');
const meta=$('meta[name="description"]');if(meta)meta.content=meta.content.replace(/Siddhartha/g,'Siddaganga');

/* Mobile hero: supplied portrait, no black canvas, no 260vh dead zone. */
function mountMobileHero(){
  const wrap=$('#coatImgWrap');if(!wrap||$('.mobile-hero-photo',wrap))return;
  const box=document.createElement('div');box.className='mobile-hero-photo';
  const img=document.createElement('img');img.alt='Dr. Sandesh Mahesh';
  box.appendChild(img);wrap.appendChild(box);
  const apply=src=>{if(src)img.src=src};
  const source=$('#doctorPhotoSource');
  const existing=$('[data-doctor-photo]');
  if(existing?.src)apply(existing.src);
  else if(source?.src)apply(source.src);
  else fetch('assets/doctor-sandesh.b64',{cache:'no-store'}).then(r=>r.ok?r.text():Promise.reject()).then(v=>apply(`data:image/webp;base64,${v.trim().replace(/\s+/g,'')}`)).catch(()=>{});
}
mountMobileHero();

/* Give the standalone doctor portrait section the actual supplied image too. */
function hydratePhotos(){
  const imgs=$$('.photo-frame img,[data-doctor-photo]');
  const b64='assets/doctor-sandesh.b64';
  const use=src=>imgs.forEach(img=>{if(!img.src||img.src.endsWith('/'))img.src=src});
  const loaded=imgs.some(i=>i.complete&&i.naturalWidth>0&&i.src);
  if(loaded){const src=imgs.find(i=>i.complete&&i.naturalWidth>0)?.src;if(src)use(src);return}
  fetch(b64,{cache:'no-store'}).then(r=>r.ok?r.text():Promise.reject()).then(v=>use(`data:image/webp;base64,${v.trim().replace(/\s+/g,'')}`)).catch(()=>{});
}
hydratePhotos();

/* Clean booking widget. Backend calls are the existing secure RPCs. */
function mountBooking(){
  const panel=$('#consult .booking-panel');if(!panel)return;
  panel.innerHTML='<div class="booking-parity-wrap"><div class="booking-parity-card"><div id="bookingWidget" class="booking-widget"></div></div><div class="booking-parity-summary"><span style="display:block;font-size:.7rem;font-weight:800;letter-spacing:.12em;color:#F2540C">CONSULTATION</span><strong>Choose a date first.</strong><p>Available consultation times appear after you select a date. Your details are requested only after you choose a time.</p><p class="mini-note">This is a consultation request, not emergency care. For sudden or severe symptoms, seek immediate medical attention.</p></div></div>';
  const root=$('#bookingWidget');if(!root)return;
  const cfg=()=>window.SUPABASE_CONFIG||{};
  let state={step:'date',date:'',time:'',name:'',phone:'',email:'',slots:[],loading:false,error:''};
  const client=()=>window.supabase?.createClient?window.supabase.createClient(cfg().url,cfg().anonKey):null;
  const indiaParts=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return Object.fromEntries(p.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]))};
  const today=()=>{const p=indiaParts();return `${p.year}-${p.month}-${p.day}`};
  const maxDate=()=>{const d=new Date(today()+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+90);return d.toISOString().slice(0,10)};
  const humanDate=x=>new Date(x+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  const humanTime=x=>{const [h,m]=String(x).slice(0,5).split(':').map(Number),ap=h>=12?'PM':'AM',hh=h%12||12;return `${hh}:${String(m).padStart(2,'0')} ${ap}`};
  const valid=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&x>=today()&&x<=maxDate();
  const summary=()=>state.date&&state.time?`<div class="booking-selection"><span class="booking-selection-label">YOUR APPOINTMENT</span><strong>${esc(humanDate(state.date))}</strong><span>${esc(humanTime(state.time))}</span></div>`:'';
  const progress=n=>`<div class="booking-progress"><span class="is-done">1</span><i></i><span class="${n>=2?'is-done':''} ${n===2?'is-active':''}">2</span><i></i><span class="${n>=3?'is-done':''} ${n===3?'is-active':''}">3</span><i></i><span class="${n===4?'is-active':''}">4</span></div>`;
  const render=()=>{
    if(state.step==='date')root.innerHTML=`<div class="booking-step"><div class="booking-step-label">STEP 1 · CHOOSE A DATE</div><label class="date-picker-field" for="sandeshBookDate"><span class="date-picker-text">${state.date?esc(humanDate(state.date)):'Click here to choose a date'}</span><input id="sandeshBookDate" type="date" min="${today()}" max="${maxDate()}" value="${esc(state.date)}"></label><p class="date-picker-hint">Select a date to see available consultation times.</p></div>`;
    if(state.step==='slot')root.innerHTML=`<div class="booking-step"><div class="booking-step-label">STEP 2 · CHOOSE A TIME</div><div class="booking-step-context">${esc(humanDate(state.date))}</div>${progress(2)}${state.loading?'<p>Checking available times…</p>':state.error?`<p class="booking-error-text">${esc(state.error)}</p><div class="booking-step-actions"><button class="btn-ghost-sm" id="retry">Try again</button></div>`:state.slots.length?`<div class="slot-grid">${state.slots.map(t=>`<button type="button" class="slot-chip" data-time="${esc(t)}">${esc(humanTime(t))}</button>`).join('')}</div>`:'<p>No consultation times are available on this date. Please choose another date.</p>'}<div class="booking-step-actions"><button type="button" class="btn-ghost-sm" id="backDate">← Change date</button></div></div>`;
    if(state.step==='details')root.innerHTML=`<div class="booking-step"><div class="booking-step-label">STEP 3 · YOUR DETAILS</div>${summary()}${progress(3)}<div class="field-group"><label for="bookName">Name</label><input class="field-input" id="bookName" value="${esc(state.name)}" placeholder="Your name" autocomplete="name"></div><div class="field-group"><label for="bookPhone">Phone</label><div class="phone-input-wrap"><span class="phone-prefix">+91</span><input class="field-input" id="bookPhone" value="${esc(state.phone)}" placeholder="10-digit mobile number" inputmode="numeric" maxlength="10"></div></div><div class="field-group"><label for="bookEmail">Email <span style="font-weight:400">(optional)</span></label><input class="field-input" id="bookEmail" type="email" value="${esc(state.email)}" placeholder="you@example.com" autocomplete="email"></div>${state.error?`<p class="booking-error-text">${esc(state.error)}</p>`:''}<div class="booking-step-actions"><button type="button" class="btn-ghost-sm" id="backSlot">← Back</button><button type="button" class="btn btn-primary" id="review">Review request</button></div></div>`;
    if(state.step==='review')root.innerHTML=`<div class="booking-step"><div class="booking-step-label">STEP 4 · REVIEW YOUR REQUEST</div>${progress(4)}<div class="review-card"><div class="review-card-section"><span class="review-card-label">CONSULTATION</span><div class="review-line"><span>Date</span><strong>${esc(humanDate(state.date))}</strong></div><div class="review-line"><span>Time</span><strong>${esc(humanTime(state.time))}</strong></div></div><div class="review-card-section"><span class="review-card-label">YOUR DETAILS</span><div class="review-line"><span>Name</span><strong>${esc(state.name)}</strong></div><div class="review-line"><span>Phone</span><strong>${esc(state.phone)}</strong></div>${state.email?`<div class="review-line"><span>Email</span><strong>${esc(state.email)}</strong></div>`:''}</div></div><div class="review-note"><strong>What happens next?</strong><p>Your request will be sent to the clinic. The clinic can confirm the appointment from the private admin portal.</p></div>${state.error?`<p class="booking-error-text">${esc(state.error)}</p>`:''}<div class="booking-step-actions"><button type="button" class="btn-ghost-sm" id="backDetails">← Back</button><button type="button" class="btn btn-primary" id="submitBooking">Request a consultation</button></div></div>`;
    if(state.step==='success')root.innerHTML='<div class="booking-step"><div class="booking-success-icon">✓</div><p style="font-weight:800;font-size:1.2rem;margin-bottom:10px">Your consultation request has been submitted.</p><p style="color:#6B6259;margin-bottom:20px">The clinic can confirm your appointment from the admin portal. You can also continue on WhatsApp.</p><a class="btn btn-primary" href="https://wa.me/917406886226?text=Hello%20Dr.%20Sandesh%20Mahesh%2C%20I%20have%20submitted%20a%20consultation%20request." target="_blank" rel="noopener">Continue on WhatsApp</a><div style="margin-top:16px"><button type="button" class="btn-ghost-sm" id="again">Request another time</button></div></div>';
    bind();
  };
  async function loadSlots(){
    state.loading=true;state.error='';render();
    try{const c=client();if(!c)throw new Error('Booking unavailable');const {data,error}=await c.rpc('get_available_consultation_slots',{p_date:state.date,p_doctor_slug:cfg().doctorSlug});if(error)throw error;state.slots=(data||[]).map(x=>String(x.start_time).slice(0,5));state.loading=false;state.step='slot';render();}
    catch(e){state.loading=false;state.error='We could not load the available times. Please try again.';state.step='slot';render();console.error(e)}
  }
  function bind(){
    const date=$('#sandeshBookDate');if(date){const field=$('.date-picker-field');field?.addEventListener('click',e=>{if(e.target!==date){e.preventDefault();try{date.showPicker?.()}catch(_){date.focus()}}});date.addEventListener('change',()=>{if(!valid(date.value)){state.error='Please choose a valid future date.';render();return}state.date=date.value;state.time='';loadSlots()})}
    $('#backDate')?.addEventListener('click',()=>{state.step='date';render()});$('#retry')?.addEventListener('click',loadSlots);
    $$('.slot-chip',root).forEach(b=>b.addEventListener('click',()=>{state.time=b.dataset.time;state.step='details';state.error='';render()}));
    $('#backSlot')?.addEventListener('click',()=>{state.step='slot';render()});
    $('#bookName')?.addEventListener('input',e=>state.name=e.target.value);$('#bookPhone')?.addEventListener('input',e=>{state.phone=e.target.value.replace(/\D/g,'').slice(0,10);e.target.value=state.phone});$('#bookEmail')?.addEventListener('input',e=>state.email=e.target.value);
    $('#review')?.addEventListener('click',()=>{if(!state.name.trim()||state.phone.length!==10){state.error='Please enter your name and 10-digit mobile number.';render();return}state.error='';state.step='review';render()});
    $('#backDetails')?.addEventListener('click',()=>{state.step='details';render()});
    $('#submitBooking')?.addEventListener('click',async()=>{const btn=$('#submitBooking');btn.disabled=true;btn.textContent='SENDING…';state.error='';try{const c=client();if(!c)throw new Error('Booking unavailable');const {error}=await c.rpc('request_appointment',{p_doctor_slug:cfg().doctorSlug,p_patient_name:state.name.trim(),p_patient_phone:'+91 '+state.phone,p_patient_email:state.email.trim()||null,p_appointment_date:state.date,p_start_time:state.time});if(error)throw error;state.step='success';render()}catch(e){state.error=e?.message?.includes('just taken')?'That time was just taken. Please choose another slot.':'We could not submit the request. Please try again or use WhatsApp.';state.step='review';render();console.error(e)}});
    $('#again')?.addEventListener('click',()=>{state={step:'date',date:'',time:'',name:'',phone:'',email:'',slots:[],loading:false,error:''};render()});
  }
  render();
}

mountBooking();

/* Keep the hero's scroll system stable after the final layer changes dimensions. */
window.setTimeout(()=>{if(window.ScrollTrigger)window.ScrollTrigger.refresh();window.dispatchEvent(new Event('resize'))},350);
})();
