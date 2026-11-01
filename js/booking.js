(()=>{
  'use strict';
  const form=document.getElementById('bookingForm');
  if(!form)return;
  const date=document.getElementById('bookingDate'),slots=document.getElementById('bookingSlots'),message=document.getElementById('bookingMessage');
  const next=document.getElementById('bookingNext'),back=document.getElementById('bookingBack'),submit=document.getElementById('bookingSubmit');
  const stepLabel=document.getElementById('bookingStepLabel'),review=document.getElementById('bookingReview');
  const detailFields=[...form.querySelectorAll('.booking-detail-field')];
  const configured=()=>window.isSupabaseConfigured&&window.isSupabaseConfigured()&&window.supabase;
  let client=null,step=1,selectedSlot='';
  const getClient=()=>client||(client=window.supabase.createClient(window.SUPABASE_CONFIG.url,window.SUPABASE_CONFIG.anonKey));
  const pad=n=>String(n).padStart(2,'0');
  const indiaToday=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o={};p.forEach(x=>{if(x.type!=='literal')o[x.type]=x.value});return `${o.year}-${o.month}-${o.day}`};
  const addDays=(iso,n)=>{const d=new Date(iso+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
  const humanDate=iso=>new Date(iso+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  const humanTime=hhmm=>{const [h,m]=hhmm.split(':').map(Number),ampm=h>=12?'PM':'AM',h12=h%12||12;return `${h12}:${pad(m)} ${ampm}`};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  date.min=indiaToday();date.max=addDays(date.min,90);
  const show=(text,ok=false)=>{message.textContent=text||'';message.className='booking-message'+(ok?' ok':'')};

  function render(){
    const labels=['STEP 1 · CHOOSE A DATE','STEP 2 · CHOOSE A TIME','STEP 3 · YOUR DETAILS','STEP 4 · REVIEW YOUR REQUEST'];
    stepLabel.textContent=labels[step-1];
    detailFields.forEach(el=>el.style.display=step>=3?'flex':'none');
    document.querySelector('.booking-date-field').style.display=step===1?'flex':'none';
    document.querySelector('.booking-slots-wrap').style.display=step>=2&&step<=3?'block':'none';
    review.hidden=step!==4;
    if(step!==4)review.innerHTML='';
    back.hidden=step<=1;
    next.hidden=step>=4;
    submit.hidden=step!==4;
    if(step===2||step===3)next.textContent=step===2?'CONTINUE TO YOUR DETAILS →':'REVIEW REQUEST →';
    if(step===1)next.textContent='CONTINUE TO AVAILABLE TIMES →';
    if(step===4)buildReview();
  }
  function buildReview(){
    const fd=new FormData(form);const name=String(fd.get('patient_name')||'').trim(),phone=String(fd.get('patient_phone')||'').trim(),email=String(fd.get('patient_email')||'').trim();
    review.innerHTML=`<div class="booking-review-section"><span class="booking-review-label">CONSULTATION</span><div class="booking-review-line"><span>Date</span><strong>${esc(humanDate(date.value))}</strong></div><div class="booking-review-line"><span>Time</span><strong>${esc(humanTime(selectedSlot))}</strong></div><div class="booking-review-line"><span>Duration</span><strong>15 minutes</strong></div><div class="booking-review-line"><span>Fee</span><strong>₹500</strong></div></div><div class="booking-review-section"><span class="booking-review-label">YOUR DETAILS</span><div class="booking-review-line"><span>Name</span><strong>${esc(name)||'Not provided'}</strong></div><div class="booking-review-line"><span>Phone</span><strong>${esc(phone)||'Not provided'}</strong></div>${email?`<div class="booking-review-line"><span>Email</span><strong>${esc(email)}</strong></div>`:''}</div>`;
  }
  async function loadSlots(){
    slots.innerHTML='<span class="booking-loading">Checking available times…</span>';show('');
    if(!configured()){slots.innerHTML='<span class="booking-loading">Booking is not connected right now. Please use WhatsApp to enquire.</span>';return false}
    try{const c=getClient();const {data,error}=await c.rpc('get_available_consultation_slots',{p_date:date.value,p_doctor_slug:window.SUPABASE_CONFIG.doctorSlug});if(error)throw error;const times=(data||[]).map(x=>String(x.start_time).slice(0,5));if(!times.length){slots.innerHTML='<span class="booking-loading">No consultation times are available on this date. Choose another date.</span>';return false}slots.innerHTML=times.map(t=>`<label class="slot"><input type="radio" name="start_time" value="${esc(t)}"><span>${esc(humanTime(t))}</span></label>`).join('');slots.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{selectedSlot=input.value;show('')}));return true}catch(e){console.error(e);slots.innerHTML='<span class="booking-loading">Unable to load available times right now.</span>';show('Please try another date or use WhatsApp to enquire.');return false}
  }
  date.addEventListener('change',async()=>{selectedSlot='';step=1;render();if(date.value){next.disabled=true;next.textContent='CHECKING…';const ok=await loadSlots();next.disabled=false;next.textContent=ok?'CONTINUE TO AVAILABLE TIMES →':'CONTINUE TO AVAILABLE TIMES →';if(ok)step=2,render()}});
  next.addEventListener('click',()=>{
    if(step===1){if(!date.value){show('Please choose a date first.');return}if(!slots.querySelector('input')){loadSlots();return}step=2;render();return}
    if(step===2){if(!selectedSlot){show('Please choose an available time.');return}step=3;render();return}
    if(step===3){const fd=new FormData(form),name=String(fd.get('patient_name')||'').trim(),phone=String(fd.get('patient_phone')||'').replace(/\D/g,'');if(!name||phone.length!==10){show('Please enter your name and a valid 10-digit mobile number.');return}form.querySelector('[name="patient_phone"]').value=phone;step=4;show('');render()}
  });
  back.addEventListener('click',()=>{step=Math.max(1,step-1);show('');render()});
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(step!==4)return;if(!configured()){show('Booking system is not connected yet. Please use WhatsApp to enquire.');return}
    const fd=new FormData(form),name=String(fd.get('patient_name')||'').trim(),phone=String(fd.get('patient_phone')||'').replace(/\D/g,''),email=String(fd.get('patient_email')||'').trim();
    if(!date.value||!selectedSlot||!name||phone.length!==10){show('Please review the date, time, name and mobile number.');return}
    submit.disabled=true;submit.textContent='SENDING…';show('');
    try{const c=getClient();const {error}=await c.rpc('request_appointment',{p_doctor_slug:window.SUPABASE_CONFIG.doctorSlug,p_patient_name:name,p_patient_phone:phone,p_patient_email:email||null,p_appointment_date:date.value,p_start_time:selectedSlot});if(error)throw error;form.querySelectorAll('input').forEach(i=>i.disabled=true);form.querySelector('.booking-grid').style.display='none';form.querySelector('.booking-slots-wrap').style.display='none';review.hidden=false;review.innerHTML='<div class="booking-success"><strong>Your consultation request has been submitted.</strong><p>The clinic can review it from the admin portal and confirm the appointment with you.</p><a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/917406886226?text=Hello%20Dr.%20Sandesh%20Mahesh%2C%20I%20have%20submitted%20a%20consultation%20request.">CONTINUE ON WHATSAPP ↗</a></div>';stepLabel.textContent='REQUEST RECEIVED';next.hidden=true;back.hidden=true;submit.hidden=true;show('Request received.',true)}catch(err){console.error(err);show(err?.message?.includes('just taken')?'That time was just taken. Please choose another slot.':'We could not submit the request. Please try again or use WhatsApp.')}finally{submit.disabled=false;if(!form.querySelector('input:disabled'))submit.textContent='REQUEST CONSULTATION'}
  });
  render();
})();
