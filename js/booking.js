(()=>{
  const $=s=>document.querySelector(s);
  const form=$('#bookingForm'),date=$('#bookingDate'),slots=$('#bookingSlots'),message=$('#bookingMessage'),submit=$('#bookingSubmit');
  if(!form||!date||!slots)return;
  const configured=()=>window.isSupabaseConfigured&&window.isSupabaseConfigured()&&window.supabase;
  let client=null;
  const getClient=()=>client||(client=window.supabase.createClient(window.SUPABASE_CONFIG.url,window.SUPABASE_CONFIG.anonKey));
  const pad=n=>String(n).padStart(2,'0');
  const isoDate=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  date.min=isoDate(new Date());
  const show=(t,ok=false)=>{if(message){message.textContent=t;message.className='booking-message '+(ok?'ok':'error')}};
  const grid=form.querySelector('.booking-grid');
  const labels=[...form.querySelectorAll('.booking-grid label')];
  const nameLabel=labels.find(x=>x.querySelector('[name="patient_name"]'));
  const phoneLabel=labels.find(x=>x.querySelector('[name="patient_phone"]'));
  const emailLabel=labels.find(x=>x.querySelector('[name="patient_email"]'));
  const dateLabel=labels.find(x=>x.querySelector('#bookingDate'));
  const slotsWrap=form.querySelector('.booking-slots-wrap');
  let stage=1;
  let continueBtn=document.createElement('button');continueBtn.type='button';continueBtn.className='booking-next';continueBtn.textContent='CONTINUE TO AVAILABLE TIMES →';
  let detailsBtn=document.createElement('button');detailsBtn.type='button';detailsBtn.className='booking-next';detailsBtn.textContent='CONTINUE TO YOUR DETAILS →';
  let backBtn=document.createElement('button');backBtn.type='button';backBtn.className='booking-back';backBtn.textContent='← BACK';
  const insertAfter=(el,node)=>el?.parentNode?.insertBefore(node,el.nextSibling);
  insertAfter(dateLabel,continueBtn);
  insertAfter(slotsWrap,detailsBtn);
  insertAfter(detailsBtn,backBtn);
  detailsBtn.style.display='none';backBtn.style.display='none';
  if(nameLabel)nameLabel.classList.add('booking-detail-field');
  if(phoneLabel)phoneLabel.classList.add('booking-detail-field');
  if(emailLabel)emailLabel.classList.add('booking-detail-field');
  const setStage=n=>{
    stage=n;
    if(grid)grid.classList.toggle('booking-details-open',n>=3);
    if(dateLabel)dateLabel.classList.toggle('booking-date-only',n===1);
    if(continueBtn)continueBtn.style.display=n===1?'inline-flex':'none';
    if(detailsBtn)detailsBtn.style.display=n===2?'inline-flex':'none';
    if(backBtn)backBtn.style.display=n>1?'inline-flex':'none';
    if(slotsWrap)slotsWrap.style.display=n>=2?'block':'none';
    [nameLabel,phoneLabel,emailLabel].forEach(el=>{if(el)el.style.display=n>=3?'block':'none'});
    if(submit)submit.style.display=n>=3?'inline-flex':'none';
  };
  setStage(1);

  async function loadSlots(){
    slots.innerHTML='<span class="booking-loading">Checking available times…</span>';show('');
    if(!configured()){
      slots.innerHTML='<span class="booking-loading">Booking is not connected right now. Please use WhatsApp to enquire.</span>';
      return false;
    }
    try{
      const c=getClient();
      const {data,error}=await c.rpc('get_available_consultation_slots',{p_date:date.value,p_doctor_slug:window.SUPABASE_CONFIG.doctorSlug});
      if(error)throw error;
      const times=(data||[]).map(x=>String(x.start_time).slice(0,5));
      if(!times.length){slots.innerHTML='<span class="booking-loading">No slots are available on this date. Choose another date.</span>';return false;}
      slots.innerHTML=times.map(t=>`<label class="slot"><input type="radio" name="start_time" value="${t}"><span>${t}</span></label>`).join('');
      return true;
    }catch(e){
      slots.innerHTML='<span class="booking-loading">Unable to load slots right now.</span>';
      show('Please try another date or use WhatsApp to enquire.');
      return false;
    }
  }

  continueBtn.addEventListener('click',async()=>{
    if(!date.value){show('Please choose a date first.');return}
    continueBtn.disabled=true;continueBtn.textContent='CHECKING…';
    const ok=await loadSlots();
    continueBtn.disabled=false;continueBtn.textContent='CONTINUE TO AVAILABLE TIMES →';
    if(ok)setStage(2);
  });
  detailsBtn.addEventListener('click',()=>{
    const selected=form.querySelector('input[name="start_time"]:checked');
    if(!selected){show('Please choose an available time.');return}
    setStage(3);show('');
  });
  backBtn.addEventListener('click',()=>setStage(Math.max(1,stage-1)));
  date.addEventListener('change',()=>{setStage(1);show('')});

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!configured()){show('Booking system is not connected yet. Please use WhatsApp to enquire.');return}
    const fd=new FormData(form),time=fd.get('start_time');
    if(!date.value){setStage(1);show('Please choose a date.');return}
    if(!time){setStage(2);show('Please choose a consultation time.');return}
    if(!String(fd.get('patient_name')||'').trim()||!String(fd.get('patient_phone')||'').trim()){show('Please enter your name and mobile number.');return}
    submit.disabled=true;submit.textContent='SENDING…';
    try{
      const c=getClient();
      const {error}=await c.rpc('request_appointment',{p_doctor_slug:window.SUPABASE_CONFIG.doctorSlug,p_patient_name:String(fd.get('patient_name')||'').trim(),p_patient_phone:String(fd.get('patient_phone')||'').trim(),p_patient_email:String(fd.get('patient_email')||'').trim()||null,p_appointment_date:date.value,p_start_time:time});
      if(error)throw error;
      form.reset();slots.innerHTML='<span class="booking-loading">Choose a date to see available times.</span>';show('Request received. The clinic can confirm your appointment from the admin portal.',true);setStage(1);
    }catch(e){show(e?.message?.includes('just taken')?'That time was just taken. Please choose another slot.':'We could not submit the request. Please try again or use WhatsApp.');}
    finally{submit.disabled=false;submit.textContent='REQUEST APPOINTMENT'}
  });
})();
