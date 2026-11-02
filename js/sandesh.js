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
        available; otherwise the static preview cards in the HTML stay. */
  const cards = document.getElementById("homeStoryCards");
  if(cards && window.PatientInsightsDB){
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const clean = (s) => String(s || "").replace(/[“”"]/g, "").trim();
    Promise.race([window.PatientInsightsDB.fetchPublished(), new Promise((r) => setTimeout(() => r([]), 2500))])
      .then((stories) => {
        if(!stories || !stories.length) return;
        const pick = stories.slice(0, 2);
        cards.innerHTML = pick.map((s, i) => `<a class="story-card ${i ? "story-card-secondary" : "story-card-primary"}" href="stories.html?story=${encodeURIComponent(s.slug)}" aria-label="Read patient story: ${esc(clean(s.title))}">
          <span class="story-kicker">PATIENT STORY ${String(i + 1).padStart(2, "0")}</span>${s.isDemo ? '<span class="story-tag">FICTIONAL PREVIEW</span>' : ""}
          <p class="quote">&ldquo;${esc(clean(s.title))}&rdquo;</p>
          <p class="desc">${esc(s.subtitle || s.intro || "")}</p>
          <span class="story-cta">READ STORY <span class="arrow">↗</span></span></a>`).join("");
        const note = document.getElementById("homeStoriesNote");
        if(note){
          note.textContent = pick.some((s) => s.isDemo)
            ? "These are fictional preview stories for demonstration. Real stories will replace them only after approval and consent."
            : "Stories are shared anonymously with consent and open separately so you can read at your own pace.";
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
})();
