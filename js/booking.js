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

  async function loadSlots(){
    slots.innerHTML='<span class="booking-loading">Checking available times…</span>';show('');
    if(!configured()){
      slots.innerHTML='<span class="booking-loading">Booking is being connected. Please use WhatsApp for now.</span>';
      return;
    }
    try{
      const c=getClient();
      const {data,error}=await c.rpc('get_available_consultation_slots',{
        p_date:date.value,
        p_doctor_slug:window.SUPABASE_CONFIG.doctorSlug
      });
      if(error)throw error;
      const times=(data||[]).map(x=>String(x.start_time).slice(0,5));
      if(!times.length){
        slots.innerHTML='<span class="booking-loading">No slots are available on this date.</span>';
        return;
      }
      slots.innerHTML=times.map(t=>`<label class="slot"><input type="radio" name="start_time" value="${t}"><span>${t}</span></label>`).join('');
    }catch(e){
      slots.innerHTML='<span class="booking-loading">Unable to load slots right now.</span>';
      show('Please use WhatsApp to enquire while booking is being connected.');
    }
  }

  date.addEventListener('change',loadSlots);
  if(date.value)loadSlots();

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!configured()){show('Booking system is not connected yet. Please use WhatsApp to enquire.');return}
    const fd=new FormData(form),time=fd.get('start_time');
    if(!time){show('Please choose a consultation time.');return}
    submit.disabled=true;submit.textContent='SENDING…';
    try{
      const c=getClient();
      const {error}=await c.rpc('request_appointment',{
        p_doctor_slug:window.SUPABASE_CONFIG.doctorSlug,
        p_patient_name:String(fd.get('patient_name')||'').trim(),
        p_patient_phone:String(fd.get('patient_phone')||'').trim(),
        p_patient_email:String(fd.get('patient_email')||'').trim()||null,
        p_appointment_date:date.value,
        p_start_time:time
      });
      if(error)throw error;
      form.reset();
      slots.innerHTML='<span class="booking-loading">Select another date to view available times.</span>';
      show('Request received. The clinic can confirm your appointment from the admin portal.',true);
    }catch(e){
      show(e?.message?.includes('just taken')?'That time was just taken. Please choose another slot.':'We could not submit the request. Please try again or use WhatsApp.');
    }finally{
      submit.disabled=false;
      submit.textContent='REQUEST APPOINTMENT';
    }
  });
})();
