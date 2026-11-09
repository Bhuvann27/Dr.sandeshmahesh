/* Dr. Sandesh site — page behaviour for the glass redesign (replaces the old scroll-hero main.js).
   No scroll hijacking: the page always scrolls natively. */
(function(){
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  const yr = document.getElementById("year"); if(yr) yr.textContent = new Date().getFullYear();

  /* nav is light-on-dark while the dark hero is on screen; floating contact appears once it has passed */
  const hero = document.getElementById("hero");
  const nav = document.getElementById("siteNav"), mobileNav = document.getElementById("mobileNav");
  const floatingContact = document.getElementById("floatingContact"), assistant = document.getElementById("siteAssistant");
  function setHero(onHero){
    if(floatingContact) floatingContact.classList.toggle("show", !onHero);
    if(assistant) assistant.classList.toggle("show", !onHero);
  }
  if(hero && "IntersectionObserver" in window){
    new IntersectionObserver((es) => es.forEach((e) => setHero(e.isIntersecting && e.intersectionRatio > 0.12)), { threshold: [0, .12, .5, 1] }).observe(hero);
  } else setHero(false);

  /* active section in the nav */
  const sections = ["stories","about","care","checkin","consult","insights","faq","contact"];
  const links = $$(".site-nav .nav-links a, .mobile-nav-row a");
  function setActive(href){
    links.forEach((l) => { const on = l.getAttribute("href") === href; l.classList.toggle("active", on); if(on) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current"); });
  }
  function update(){
    const point = window.innerHeight * 0.32;
    if(hero){ const r = hero.getBoundingClientRect(); if(r.bottom > point){ setActive("index.html"); return; } }
    let best = null, bd = Infinity;
    sections.forEach((id) => {
      const s = document.getElementById(id); if(!s) return;
      const r = s.getBoundingClientRect();
      const d = (r.top <= point && r.bottom >= point) ? 0 : Math.min(Math.abs(r.top - point), Math.abs(r.bottom - point));
      if(d < bd){ bd = d; best = "#" + id; }
    });
    setActive(best || "index.html");
  }
  let q = false;
  const queue = () => { if(q) return; q = true; requestAnimationFrame(() => { q = false; update(); }); };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  update();

  /* Areas of care accordion */
  $$(".care-item-head").forEach((btn) => btn.addEventListener("click", () => {
    const item = btn.closest(".care-item"); const open = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }));

  document.addEventListener("click", (e) => {
    if(e.target.closest("#focusBookingDate")){
      const d = document.getElementById("bookDateInput");
      if(d){ d.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => d.focus(), 320); }
    }
  });

  /* reveal on scroll */
  const rev = $$(".reveal");
  if("IntersectionObserver" in window){
    const io = new IntersectionObserver((es) => es.forEach((e) => { if(e.isIntersecting){ e.target.classList.add("is-visible"); io.unobserve(e.target); } }), { threshold: 0.12 });
    rev.forEach((el) => io.observe(el));
  } else rev.forEach((el) => el.classList.add("is-visible"));

  /* hero parallax-free entrance */
  if(hero) requestAnimationFrame(() => hero.classList.add("is-ready"));

  /* Patient Insights floating CTA */
  const s = document.createElement("script"); s.src = "extra-mod/patient-insights-float.js?v=20261020-1"; document.head.appendChild(s);

  /* hero background video: respect "reduce motion" and save battery when the tab is hidden */
  const hv = document.getElementById("heroVideo");
  if(hv){
    const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(still){ hv.removeAttribute("autoplay"); hv.pause(); }
    else {
      const play = () => { const p = hv.play(); if(p && p.catch) p.catch(() => {}); };
      play();
      document.addEventListener("visibilitychange", () => { if(document.hidden) hv.pause(); else play(); });
    }
  }
})();
