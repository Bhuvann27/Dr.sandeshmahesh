(()=>{
  const wrap=document.querySelector('#youtubeGrid');
  const replaceText=(oldText,newText)=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(n=>{if(n.nodeValue.includes(oldText))n.nodeValue=n.nodeValue.split(oldText).join(newText)})};
  replaceText('Siddhartha Hospital','Siddaganga Hospital');replaceText('SIDDHARTHA HOSPITAL','SIDDAGANGA HOSPITAL');
  if(document.title.includes('Siddhartha'))document.title=document.title.replace(/Siddhartha/g,'Siddaganga');
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=meta.content.replace(/Siddhartha/g,'Siddaganga');
  if(!wrap)return;
  const configured=()=>window.isSupabaseConfigured&&window.isSupabaseConfigured()&&window.supabase;
  function esc(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function renderEmpty(){wrap.innerHTML=`<div class="youtube-channel-card"><div class="youtube-channel-mark">▶</div><div><span>DR. SANDESH MAHESH · YOUTUBE</span><strong>Health answers, explained simply.</strong><p>Educational videos on pregnancy, women's health and common gynaecological concerns. New videos will appear here when published.</p><a href="https://www.youtube.com/@Namma_DrSandesh" target="_blank" rel="noopener" class="youtube-channel-button">OPEN YOUTUBE CHANNEL <b>↗</b></a></div></div>`}
  function render(items){if(!items?.length){renderEmpty();return}wrap.innerHTML=items.map(v=>`<a class="youtube-card" href="https://www.youtube.com/watch?v=${encodeURIComponent(v.video_id)}" target="_blank" rel="noopener"><div class="youtube-thumb"><img loading="lazy" src="https://i.ytimg.com/vi/${encodeURIComponent(v.video_id)}/hqdefault.jpg" alt="${esc(v.title||'Dr. Sandesh educational video')}"><span class="youtube-play">▶</span></div><div class="youtube-card-copy"><small>DR. SANDESH MAHESH</small><strong>${esc(v.title||'Watch educational video')}</strong><span>WATCH ON YOUTUBE ↗</span></div></a>`).join('')}
  if(!configured()){renderEmpty();return}
  const c=window.supabase.createClient(window.SUPABASE_CONFIG.url,window.SUPABASE_CONFIG.anonKey);
  c.from('youtube_videos').select('video_id,title,description').eq('doctor_id',window.SUPABASE_CONFIG.doctorId).eq('status','published').eq('visible',true).eq('featured',true).order('sort_order',{ascending:true}).limit(6).then(({data,error})=>render(error?[]:(data||[])));
})();
