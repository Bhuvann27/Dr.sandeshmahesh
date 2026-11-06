/* Life-stage cards, pregnancy journey carousel, due date calculator, heartbeat dividers. */
(function(){
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* heartbeat dividers draw themselves when they scroll into view */
  const hb = $$(".heartbeat");
  if("IntersectionObserver" in window){
    const io = new IntersectionObserver((es) => es.forEach((e) => { if(e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: .4 });
    hb.forEach((h) => io.observe(h));
  } else hb.forEach((h) => h.classList.add("is-in"));

  /* life-stage cards open the check-in at that stage */
  function openCheckin(stage){
    if(stage && stage !== "pregnancy" && window.CheckinSelectStage){ window.CheckinSelectStage(stage); return; }
    const t = document.getElementById("checkin"); if(t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $$(".lifestage-card").forEach((c) => c.addEventListener("click", () => openCheckin(c.dataset.stage)));

  /* pregnancy journey carousel */
  const track = $("#journeyTrack"), dots = $("#journeyDots");
  if(track && dots){
    const cards = $$(".journey-card", track);
    dots.innerHTML = cards.map(() => "<i></i>").join("");
    const ds = $$("i", dots);
    const idx = () => { const w = cards[0].getBoundingClientRect().width + 18; return Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / w))); };
    const mark = () => { const i = idx(); ds.forEach((d, k) => d.classList.toggle("is-on", k === i)); };
    track.addEventListener("scroll", () => window.requestAnimationFrame(mark), { passive: true });
    const go = (d) => { const w = cards[0].getBoundingClientRect().width + 18; track.scrollTo({ left: track.scrollLeft + d * w, behavior: "smooth" }); };
    const prev = $(".journey-prev"), next = $(".journey-next");
    if(prev) prev.addEventListener("click", () => go(-1));
    if(next) next.addEventListener("click", () => go(1));
    track.addEventListener("keydown", (e) => { if(e.key === "ArrowRight") go(1); if(e.key === "ArrowLeft") go(-1); });
    mark();
  }

  /* due date calculator (Naegele's rule, adjusted for cycle length) */
  const form = $("#duedateForm"), out = $("#ddResult"), lmp = $("#ddLmp");
  if(form && out && lmp){
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const iso = (d) => d.toISOString().slice(0, 10);
    lmp.max = iso(today);
    const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if(!lmp.value){ out.innerHTML = `<p class="dd-msg">Please choose the first day of your last period.</p>`; return; }
      const start = new Date(lmp.value + "T12:00:00");
      const days = Math.round((today - start) / 86400000);
      if(days < 0){ out.innerHTML = `<p class="dd-msg">That date is in the future. Please check it and try again.</p>`; return; }
      if(days > 300){ out.innerHTML = `<p class="dd-msg">That date is quite a while ago. Please check it, or ask the doctor to work it out with you.</p>`; return; }
      const cycle = Number($("#ddCycle").value) || 28;
      const due = new Date(start.getTime() + (280 + (cycle - 28)) * 86400000);
      const w = Math.floor(days / 7), d = days % 7;
      const stage = w < 14 ? "trimester1" : (w < 28 ? "trimester2" : "trimester3");
      const names = { trimester1: "first trimester", trimester2: "second trimester", trimester3: "third trimester" };
      out.innerHTML = `<div class="dd-out"><small>YOUR ESTIMATED DUE DATE</small><strong>${fmt(due)}</strong>
        <p>Today you'd be about <b>${w} weeks${d ? " and " + d + " day" + (d > 1 ? "s" : "") : ""}</b> along, in your ${names[stage]}. Only about 1 in 20 babies arrives exactly on the due date, so think of it as a window, not a deadline. A scan will confirm your dates.</p>
        <button type="button" class="dd-link" data-stage="${stage}">Take a gentle check-in for this stage →</button></div>`;
      const btn = $(".dd-link", out); if(btn) btn.addEventListener("click", () => openCheckin(stage));
    });
  }
})();
