(()=>{
  const wrap=document.querySelector('#youtubeGrid');
  if(!wrap) return;
  const configured=()=>window.isSupabaseConfigured&&window.isSupabaseConfigured()&&window.supabase;
  function esc(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function loadFixes(){
    if(!window.__sandeshHeroFix){const h=document.createElement('script');h.src='js/amogh-hero-fix.js';h.defer=true;document.body.appendChild(h)}
    if(!window.__sandeshAmoghParity){const s=document.createElement('script');s.src='js/amogh-parity.js';s.defer=true;document.body.appendChild(s)}
  }
  function render(items){
    if(!items?.length){wrap.innerHTML='<div class="video-empty"><span>EDUCATIONAL VIDEOS</span><strong>New videos will appear here.</strong><p>Dr. Sandesh’s published YouTube videos can be added from the admin portal. Until then, the channel remains available below.</p></div>';loadFixes();return;}
    wrap.innerHTML=items.map(v=>`<a class="youtube-card" href="https://www.youtube.com/watch?v=${encodeURIComponent(v.video_id)}" target="_blank" rel="noopener"><div class="youtube-thumb"><img loading="lazy" src="https://i.ytimg.com/vi/${encodeURIComponent(v.video_id)}/hqdefault.jpg" alt="${esc(v.title||'Dr. Sandesh educational video')}"><span class="youtube-play">▶</span></div><div class="youtube-card-copy"><small>DR. SANDESH MAHESH</small><strong>${esc(v.title||'Watch educational video')}</strong><span>WATCH ON YOUTUBE ↗</span></div></a>`).join('');loadFixes();
  }
  if(!configured()){render([]);return;}
  const c=window.supabase.createClient(window.SUPABASE_CONFIG.url,window.SUPABASE_CONFIG.anonKey);
  c.from('youtube_videos').select('video_id,title,description').eq('doctor_id',window.SUPABASE_CONFIG.doctorId).eq('status','published').eq('visible',true).eq('featured',true).order('sort_order',{ascending:true}).limit(6).then(({data,error})=>render(error?[]:(data||[])));
})();
