/* Educational videos (Insights section) — Dr. Sandesh's YouTube channel.
   Order of preference: featured videos from the admin portal, then links in
   js/site-config.js, then a single glowing channel card. Exactly one
   "visit channel" action is ever shown. */
(function(){
  "use strict";
  const wrap = document.getElementById("youtubeGrid");
  if(!wrap) return;

  const cfg = window.SITE_CONFIG || {};
  const CHANNEL = cfg.youtubeChannel || "https://www.youtube.com/@Namma_DrSandesh";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const configured = () => window.isSupabaseConfigured && window.isSupabaseConfigured() && window.supabase;

  function idFrom(v){
    const s = String(v || "").trim();
    if(/^[\w-]{11}$/.test(s)) return s;
    const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : "";
  }

  function renderChannelCard(){
    wrap.innerHTML = `<a class="youtube-channel-card" href="${esc(CHANNEL)}" target="_blank" rel="noopener" aria-label="Open Dr. Sandesh's YouTube channel">
      <div class="youtube-channel-art"><span class="youtube-play-circle" aria-hidden="true">▶</span></div>
      <div class="youtube-channel-copy"><small>DR. SANDESH MAHESH · YOUTUBE</small><strong>Women's health, explained simply.</strong><p>Educational videos covering pregnancy, gynaecology and common women's health questions.</p><span>VISIT YOUTUBE CHANNEL ↗</span></div>
    </a>`;
  }

  function renderVideos(items){
    const vids = (items || []).map((v) => {
      const raw = String(v.video_id || v.id || v);
      return { id: idFrom(raw), title: v.title || "", short: !!v.short || /\/shorts\//.test(raw) };
    }).filter((v) => v.id);
    if(!vids.length){ renderChannelCard(); return; }
    if(vids.every((v) => v.short)){ renderShorts(vids); return; }
    wrap.innerHTML = vids.map((v) => `<a class="youtube-card" href="https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}" target="_blank" rel="noopener">
      <div class="youtube-thumb"><img loading="lazy" src="https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg" alt="${esc(v.title || "Dr. Sandesh educational video")}"><span class="youtube-play" aria-hidden="true">▶</span></div>
      <div class="youtube-card-copy"><small>DR. SANDESH MAHESH</small><strong>${esc(v.title || "Watch on YouTube")}</strong><span>WATCH ON YOUTUBE ↗</span></div>
    </a>`).join("") +
    `<div class="video-visit-row" style="grid-column:1/-1"><a class="yt-visit" href="${esc(CHANNEL)}" target="_blank" rel="noopener">VISIT YOUTUBE CHANNEL <span aria-hidden="true">↗</span></a></div>`;
  }

  /* YouTube Shorts: portrait cards, two per row. */
  function renderShorts(vids){
    const cards = vids.slice(0, 4).map((v, i) => `<a class="short-card" href="https://www.youtube.com/shorts/${encodeURIComponent(v.id)}" target="_blank" rel="noopener" aria-label="${esc(v.title || "Watch short " + (i + 1) + " on YouTube")}">
      <img loading="lazy" alt="" src="https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg'">
      <span class="short-badge">SHORT</span>
      <span class="short-play" aria-hidden="true">▶</span>
      <span class="short-foot"><strong>${esc(v.title || "Watch on YouTube")}</strong><em>WATCH ↗</em></span>
    </a>`).join("");
    wrap.classList.add("is-shorts");
    wrap.innerHTML = `<div class="shorts-intro">
        <small>DR. SANDESH MAHESH · YOUTUBE</small>
        <h3>Quick answers, in under a minute.</h3>
        <p>Short videos on women's health, from Dr. Sandesh's YouTube channel.</p>
        <a class="yt-visit" href="${esc(CHANNEL)}" target="_blank" rel="noopener">VISIT YOUTUBE CHANNEL <span aria-hidden="true">↗</span></a>
      </div>
      <div class="shorts-grid">${cards}</div>`;
  }

  const fromConfig = () => renderVideos((cfg.youtubeVideos || []).map((x) => ({ video_id: x })));

  if(!configured()){ fromConfig(); return; }
  const c = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
  c.from("youtube_videos")
    .select("video_id,title,description")
    .eq("doctor_id", window.SUPABASE_CONFIG.doctorId)
    .eq("status", "published").eq("visible", true).eq("featured", true)
    .order("sort_order", { ascending: true }).limit(6)
    .then(({ data, error }) => (!error && data && data.length) ? renderVideos(data) : fromConfig(), fromConfig);
})();
