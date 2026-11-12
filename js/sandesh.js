/* Dr. Sandesh site — small page-level behaviours that sit on top of the
   shared (Amogh-derived) design system. Kept separate so main.js / hero
   scripts stay identical to the reference and are easy to diff. */
(function(){
  "use strict";

  /* 1. Doctor photo: if the portrait file is missing or fails to load,
        show a refined monogram instead of a broken-image icon. */
  function monogram(img){
    if(img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = "1";
    const mark = document.createElement("span");
    mark.className = "doctor-monogram";
    mark.setAttribute("role", "img");
    mark.setAttribute("aria-label", img.alt || "Dr. Sandesh Mahesh");
    mark.innerHTML = "<span>SM</span>";
    img.replaceWith(mark);
  }
  document.querySelectorAll("img[data-doctor-photo]").forEach((img) => {
    if(img.complete && img.naturalWidth === 0) monogram(img);
    else img.addEventListener("error", () => monogram(img), { once: true });
  });

  /* 2a. Mark long story titles so the large Amogh quote type scales down. */
  function markLongQuotes(root){
    (root || document).querySelectorAll(".story-card .quote, .other-story-card .quote").forEach((q) => {
      if(q.textContent.trim().length > 46) q.classList.add("is-long");
    });
  }
  markLongQuotes();
  new MutationObserver(() => markLongQuotes()).observe(document.body, { childList: true, subtree: true });

  /* 2b. Home page story cards: use the doctor's published stories when
        available; otherwise the static cards in the HTML stay. */
  const cards = document.getElementById("homeStoryCards");
  if(cards && window.PatientInsightsDB){
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const clean = (s) => String(s || "").replace(/[“”"]/g, "").trim();
    Promise.race([window.PatientInsightsDB.fetchPublished(), new Promise((r) => setTimeout(() => r([]), 2500))])
      .then((stories) => {
        if(!stories || !stories.length) return;
        const pick = stories.slice(0, 2);
        cards.innerHTML = pick.map((s, i) => `<a class="story-card ${i ? "story-card-secondary" : "story-card-primary"}" href="stories.html?story=${encodeURIComponent(s.slug)}" aria-label="Read conversation: ${esc(clean(s.title))}">
          <span class="story-kicker">CONVERSATION ${String(i + 1).padStart(2, "0")}</span>
          <p class="quote">&ldquo;${esc(clean(s.title))}&rdquo;</p>
          <p class="desc">${esc(s.subtitle || s.intro || "")}</p>
          <span class="story-cta">READ STORY <span class="arrow">↗</span></span></a>`).join("");
        const note = document.getElementById("homeStoriesNote");
        if(note){
          note.textContent = "Each conversation opens separately, so you can read at your own pace.";
        }
      }).catch(() => {});
  }

  /* 3. Instagram card — shown only when a handle is set in js/site-config.js */
  const ig = document.getElementById("instagramCard");
  const handle = String((window.SITE_CONFIG && window.SITE_CONFIG.instagram) || "").replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "").trim();
  if(ig && /^[A-Za-z0-9._]{1,30}$/.test(handle)){
    ig.href = "https://www.instagram.com/" + handle + "/";
    const t = document.getElementById("instagramHandleText"); if(t) t.textContent = "@" + handle;
    ig.hidden = false;
  }

  /* 4. "Meet the doctor" video: shows only when js/site-config.js has a welcomeVideo */
  const mv = document.getElementById("meetVideo");
  const raw = String((window.SITE_CONFIG && window.SITE_CONFIG.welcomeVideo) || "").trim();
  const vid = /^[\w-]{11}$/.test(raw) ? raw : ((raw.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1] || "");
  if(mv && vid){
    mv.hidden = false;
    mv.innerHTML = `<button type="button" class="note-play" aria-label="Play a short welcome video from Dr. Sandesh"><img alt="" loading="lazy" src="https://i.ytimg.com/vi/${vid}/hqdefault.jpg"><span aria-hidden="true">&#9654;</span></button><small>A short hello from Dr. Sandesh</small>`;
    mv.querySelector("button").addEventListener("click", () => {
      mv.innerHTML = `<div class="note-frame"><iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0" title="Welcome video from Dr. Sandesh" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    });
  }
})();
