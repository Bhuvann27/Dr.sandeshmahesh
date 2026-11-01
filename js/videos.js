/* Educational videos (Insights section) — Dr. Sandesh's YouTube channel.
   Shows featured videos stored for this doctor; falls back to a channel card. */
(function(){
  "use strict";
  const wrap = document.getElementById("youtubeGrid");
  if(!wrap) return;

  const CHANNEL = "https://www.youtube.com/@Namma_DrSandesh";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const configured = () => window.isSupabaseConfigured && window.isSupabaseConfigured() && window.supabase;

  function renderChannelCard(){
    wrap.innerHTML = `<a class="youtube-channel-card" href="${CHANNEL}" target="_blank" rel="noopener">
      <div class="youtube-channel-art"><span class="youtube-play-circle" aria-hidden="true">▶</span></div>
      <div class="youtube-channel-copy"><small>DR. SANDESH MAHESH · YOUTUBE</small><strong>Women's health, explained simply.</strong><p>Educational videos covering pregnancy, gynaecology and common women's health questions.</p><span>VISIT YOUTUBE CHANNEL ↗</span></div>
    </a>`;
  }

  function renderVideos(items){
    if(!items || !items.length){ renderChannelCard(); return; }
    wrap.innerHTML = items.map((v) => `<a class="youtube-card" href="https://www.youtube.com/watch?v=${encodeURIComponent(v.video_id)}" target="_blank" rel="noopener">
      <div class="youtube-thumb"><img loading="lazy" src="https://i.ytimg.com/vi/${encodeURIComponent(v.video_id)}/hqdefault.jpg" alt="${esc(v.title || "Dr. Sandesh educational video")}"><span class="youtube-play" aria-hidden="true">▶</span></div>
      <div class="youtube-card-copy"><small>DR. SANDESH MAHESH</small><strong>${esc(v.title || "Watch educational video")}</strong><span>WATCH ON YOUTUBE ↗</span></div>
    </a>`).join("");
  }

  if(!configured()){ renderChannelCard(); return; }
  const c = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
  c.from("youtube_videos")
    .select("video_id,title,description")
    .eq("doctor_id", window.SUPABASE_CONFIG.doctorId)
    .eq("status", "published").eq("visible", true).eq("featured", true)
    .order("sort_order", { ascending: true }).limit(6)
    .then(({ data, error }) => renderVideos(error ? [] : data), () => renderChannelCard());
})();
