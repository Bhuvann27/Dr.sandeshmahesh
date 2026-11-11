/* Gentle check-in v2 (demo) — a calm, step-by-step questionnaire.
   1) where are you  2) anything urgent right now  3) name + phone  4) a short set of questions for that path  -> summary.
   Danger signs are always answered with urgent advice BEFORE any details are asked for.
   The phone number is saved after step 3 (so a person who leaves still reaches the clinic);
   the answers and result are added to the same record at the end. */
(function(){
  "use strict";
  const root = document.getElementById("checkinApp");
  const D = window.CHECKIN_DATA;
  if(!root || !D) return;

  const PHONE = "7406886226";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fresh = () => ({ step: 1, stage: "", danger: [], noDanger: false, nowNote: "", name: "", phone: "", window: "any", consent: false,
                         answers: {}, qi: 0, lead: null, saving: false, error: "", urgentShown: false });
  const state = fresh();

  const client = (() => {
    if(window.getPublicSupabase) return window.getPublicSupabase();
    if(!window.isSupabaseConfigured || !window.isSupabaseConfigured() || !window.supabase) return null;
    return window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  })();

  const dangerFor = () => D.danger.filter((d) => d.stages.includes(state.stage));
  const questions = () => D.answerable(state.stage, state.answers);
  const toggle = (arr, key) => { const i = arr.indexOf(key); if(i === -1) arr.push(key); else arr.splice(i, 1); };
  const evaluation = () => D.evaluate(state.stage, state.danger, state.answers);

  function bar(label, pct){
    return `<div class="ci-progress" role="img" aria-label="${esc(label)}"><span>${esc(label)}</span><i><b style="width:${Math.max(4, Math.min(100, pct))}%"></b></i></div>`;
  }
  function opt(key, label, on, hint){
    return `<button type="button" class="ci-opt${on ? " is-on" : ""}" data-key="${esc(key)}" aria-pressed="${on ? "true" : "false"}"><span class="ci-tick" aria-hidden="true"></span><span class="ci-opt-text">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ""}</span></button>`;
  }
  function nav(back, nextLabel, nextDisabled, skip){
    return `<div class="ci-nav">${back ? `<button type="button" class="ci-back" data-act="back">← Back</button>` : "<span></span>"}<span class="ci-nav-right">${skip ? `<button type="button" class="ci-skip" data-act="skip">Skip</button>` : ""}<button type="button" class="ci-next" data-act="next"${nextDisabled ? " disabled" : ""}>${nextLabel}</button></span></div>`;
  }

  function urgentCard(full){
    return `<div class="ci-result ci-urgent" role="alert">
      <span class="ci-result-kicker">PLEASE DON'T WAIT ON THIS ONE</span>
      <h3>Go to the nearest hospital, or call your doctor now.</h3>
      <p>What you've picked needs attention without delay. Tell them what you've shared here. This guide can't replace being seen in person.</p>
      <div class="ci-actions"><a class="ci-btn ci-btn-solid" href="tel:+91${PHONE}">Call the clinic</a>${full ? "" : `<button type="button" class="ci-btn ci-btn-ghost" data-act="continue">I'd also like the team to call me</button>`}</div>
      ${full ? `<p class="ci-small">If you left your number, Dr. Sandesh's team will also try to reach you between 5 and 8 PM, Monday to Saturday.</p>` : ""}
    </div>`;
  }

  function summary(){
    const ev = evaluation();
    if(ev.level === "urgent") return urgentCard(true);
    const interval = D.intervals[state.stage] || "";
    const visit = state.answers.lastvisit;
    const overdue = visit === "visit_older" || visit === "visit_none";
    const contact = `<p class="ci-contact">If you'd like to talk, Dr. Sandesh's number is <a href="tel:+91${PHONE}">${PHONE}</a>. Video consultations are on Monday to Saturday, between 5 and 8 PM, at a time that suits you.</p>`;
    if(ev.level === "talk_soon"){
      return `<div class="ci-result ci-soon"><span class="ci-result-kicker">THANK YOU FOR SHARING, ${esc(state.name.toUpperCase())}</span>
        <h3>A few things you shared are worth a chat with the doctor.</h3>
        <p>Nothing to panic about. These are the kind of things a doctor likes to hear about, so you can understand what is going on and feel at ease.</p>
        <div class="ci-pace"><b>A good check-in rhythm for you</b><span>${esc(interval)}</span></div>
        ${overdue ? `<p class="ci-note">You mentioned your last check-up was a while ago, so a visit soon would be a good idea.</p>` : ""}
        <div class="ci-actions"><a class="ci-btn ci-btn-solid" href="#consult">Choose a time that suits you</a></div>
        ${contact}
        <p class="ci-small">The team may call you between 5 and 8 PM to help you pick a time. No pressure at all.</p></div>`;
    }
    return `<div class="ci-result ci-common"><span class="ci-result-kicker">THANK YOU FOR SHARING, ${esc(state.name.toUpperCase())}</span>
      <h3>You're moving at a normal pace. There's no need to worry.</h3>
      <p>What you've shared is common, and nothing here needs a rush. A general check-in at regular intervals is the best way to keep it that way.</p>
      <div class="ci-pace"><b>A good check-in rhythm for you</b><span>${esc(interval)}</span></div>
      ${overdue ? `<p class="ci-note">Your last check-up was a while ago, so it would be nice to fit one in when you can.</p>` : ""}
      ${contact}
      <a class="ci-soft" href="#consult">Or choose a time to talk whenever you're free →</a>
      <p class="ci-small">The team may call you between 5 and 8 PM, Monday to Saturday, just to say hello. No pressure at all.</p></div>`;
  }

  function questionScreen(){
    const qs = questions();
    const q = qs[state.qi];
    const v = state.answers[q.id];
    let body = "";
    if(q.type === "text"){
      body = `<label class="ci-other ci-other-big"><span class="ci-sr">${esc(q.title)}</span><textarea id="ciText" rows="4" maxlength="400" placeholder="Type here, in your own words">${esc(v || "")}</textarea></label>`;
    } else {
      const sel = Array.isArray(v) ? v : (v ? [v] : []);
      body = `<div class="ci-grid ci-grid-${q.options.length > 6 ? "many" : "few"}">${q.options.map((o) => opt(o.key, o.label, sel.includes(o.key))).join("")}</div>`;
    }
    const answered = q.type === "text" ? true : (Array.isArray(v) ? v.length > 0 : !!v);
    const last = state.qi === qs.length - 1;
    const needs = !q.optional && !answered;
    return bar(`Question ${state.qi + 1} of ${qs.length}`, ((state.qi + 1) / qs.length) * 100) +
      `<h3 class="ci-q">${esc(q.title)}</h3>${q.sub ? `<p class="ci-sub">${esc(q.sub)}</p>` : `<p class="ci-sub ci-sub-empty"></p>`}${body}
       ${state.error ? `<p class="ci-error" role="alert">${esc(state.error)}</p>` : ""}
       ${nav(true, state.saving ? "Saving…" : (last ? "See my summary →" : "Next →"), state.saving || needs, q.optional && !answered && q.type !== "text")}`;
  }

  function render(){
    let html = "";
    if(state.step === 1){
      html = bar("Getting started", 10) + `<h3 class="ci-q">What brings you here today?</h3><p class="ci-sub">Pick the one that fits best. There are no wrong answers.</p>
        <div class="ci-grid">${D.stages.map((s) => opt(s.key, s.label, state.stage === s.key, s.hint)).join("")}</div>${nav(false, "Continue →", !state.stage)}`;
    } else if(state.step === 2){
      if(state.urgentShown){ html = urgentCard(false); }
      else {
        html = bar("A quick safety check", 20) + `<h3 class="ci-q">Is any of this happening right now?</h3><p class="ci-sub">Most of the time the answer is "none of these", and that is perfectly fine. Tick anything that applies.</p>
          <div class="ci-grid">${dangerFor().map((d) => opt(d.key, d.label, state.danger.includes(d.key))).join("")}${opt("__none", "None of these. I'm just checking in", state.noDanger && !state.danger.length)}</div>
          <label class="ci-other"><span>Something else going on right now? <em>(optional)</em></span><textarea id="ciNowNote" rows="2" maxlength="250" placeholder="Type here, in your own words">${esc(state.nowNote)}</textarea></label>
          ${nav(true, "Continue →", false)}`;
      }
    } else if(state.step === 3){
      html = bar("Almost there", 30) + `<h3 class="ci-q">Where can Dr. Sandesh's team reach you?</h3>
        <p class="ci-sub">A gentle call, at a time you choose. You're never obliged to book anything.</p>
        <div class="ci-form">
          <label>First name<input id="ciName" type="text" autocomplete="given-name" maxlength="60" value="${esc(state.name)}" placeholder="Your first name"></label>
          <label>Phone number<input id="ciPhone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="${esc(state.phone)}" placeholder="10-digit mobile number"></label>
          <div class="ci-field"><span>Best time for a call</span><div class="ci-chips">${D.windows.map((w) => `<button type="button" class="ci-chip${state.window === w.key ? " is-on" : ""}" data-window="${w.key}" aria-pressed="${state.window === w.key}">${w.label}</button>`).join("")}</div></div>
          <label class="ci-consent"><input id="ciConsent" type="checkbox"${state.consent ? " checked" : ""}><span>I'm happy for the clinic to call me about my answers. Calls are made Monday to Saturday, 5 PM to 8 PM.</span></label>
        </div>
        ${state.error ? `<p class="ci-error" role="alert">${esc(state.error)}</p><a class="ci-soft" target="_blank" rel="noopener" href="https://wa.me/91${PHONE}?text=${encodeURIComponent("Hello Dr. Sandesh, I'm " + state.name.trim() + ". Please call me on " + state.phone.trim() + " (best time: " + state.window + ").")}">Or send my details on WhatsApp instead →</a>` : ""}
        ${nav(true, state.saving ? "Saving…" : "Continue →", state.saving)}`;
    } else if(state.step === 4){
      html = questionScreen();
    } else {
      html = summary() + `<p class="ci-disclaimer">This is a gentle guide, not a diagnosis.</p><button type="button" class="ci-restart" data-act="restart">Start again</button>`;
    }
    root.innerHTML = html;
    bind();
  }

  async function startLead(){
    if(!client){ state.error = "We couldn't save this right now. Please call " + PHONE + "."; return false; }
    const { data, error } = await client.rpc("checkin_start", {
      p_doctor_slug: window.SUPABASE_CONFIG.doctorSlug, p_first_name: state.name.trim(), p_phone: state.phone.trim(),
      p_call_window: state.window, p_consent: true, p_stage: state.stage, p_danger_flags: state.danger
    });
    if(error || !data){ console.error("[check-in] could not save", error); state.error = /too many/i.test(error?.message || "") ? "That number has been used a few times today. Please try again tomorrow, or call " + PHONE + "." : "Something went wrong. Please try again, or call " + PHONE + "."; return false; }
    state.lead = data; return true;
  }
  async function finishLead(){
    if(!state.lead || !client) return true; /* never trap the reader: they still see their summary */
    const ev = evaluation();
    const a = state.answers;
    const asArray = (v) => Array.isArray(v) ? v : (v ? [v] : []);
    const symptoms = asArray(a.noticing).concat(asArray(a.concern), asArray(a.reason));
    const doneArr = asArray(a.done).concat(asArray(a.lastvisit), a.purpose ? ["purpose_" + a.purpose] : []);
    const note = [state.nowNote.trim() ? "Right now: " + state.nowNote.trim() : "", (a.note || "").trim() ? "Other: " + a.note.trim() : ""].filter(Boolean).join(" | ");
    const answers = Object.assign({}, a, { _reasons: ev.reasons.slice(0, 12) });
    if(state.nowNote.trim()) answers._now = state.nowNote.trim();
    const { error } = await client.rpc("checkin_complete", { p_id: state.lead.id, p_secret: state.lead.secret, p_symptoms: symptoms, p_done: doneArr, p_result: ev.level, p_note: note || null, p_answers: answers });
    if(error) console.error("[check-in] could not save answers", error);
    return !error;
  }

  function bind(){
    root.querySelectorAll(".ci-opt").forEach((b) => b.addEventListener("click", () => {
      const key = b.dataset.key;
      if(state.step === 1){ state.stage = key; state.danger = []; state.noDanger = false; state.answers = {}; state.qi = 0; render(); return; }
      if(state.step === 2){
        if(key === "__none"){ state.danger = []; state.noDanger = true; } else { toggle(state.danger, key); state.noDanger = false; }
        render(); return;
      }
      if(state.step === 4){
        const q = questions()[state.qi];
        if(q.type === "single"){ state.answers[q.id] = key; }
        else {
          const cur = Array.isArray(state.answers[q.id]) ? state.answers[q.id].slice() : [];
          const o = q.options.find((x) => x.key === key);
          if(cur.includes(key)) cur.splice(cur.indexOf(key), 1);
          else if(o && o.exclusive){ cur.length = 0; cur.push(key); }
          else { cur.push(key); q.options.filter((x) => x.exclusive).forEach((x) => { const i = cur.indexOf(x.key); if(i > -1) cur.splice(i, 1); }); }
          state.answers[q.id] = cur;
        }
        render();
      }
    }));
    root.querySelectorAll("[data-window]").forEach((b) => b.addEventListener("click", () => { state.window = b.dataset.window; root.querySelectorAll("[data-window]").forEach((x) => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on); }); }));
    const name = root.querySelector("#ciName"), phone = root.querySelector("#ciPhone"), consent = root.querySelector("#ciConsent");
    const nowNote = root.querySelector("#ciNowNote"), text = root.querySelector("#ciText");
    if(name) name.addEventListener("input", () => { state.name = name.value; });
    if(phone) phone.addEventListener("input", () => { state.phone = phone.value; });
    if(consent) consent.addEventListener("change", () => { state.consent = consent.checked; });
    if(nowNote) nowNote.addEventListener("input", () => { state.nowNote = nowNote.value; });
    if(text) text.addEventListener("input", () => { const q = questions()[state.qi]; state.answers[q.id] = text.value; });
    root.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => act(b.dataset.act)));
  }

  async function advance(){
    const qs = questions();
    if(state.qi < qs.length - 1){ state.qi += 1; render(); scrollTop(); return; }
    state.saving = true; render(); await finishLead(); state.saving = false;
    state.step = 5; render(); scrollTop();
  }

  async function act(a){
    state.error = "";
    if(a === "restart"){ Object.assign(state, fresh()); render(); scrollTop(); return; }
    if(a === "continue"){ state.urgentShown = false; state.step = 3; render(); return; }
    if(a === "back"){
      if(state.step === 4 && state.qi > 0){ state.qi -= 1; render(); return; }
      if(state.step === 4){ state.step = 3; render(); return; }
      state.step = Math.max(1, state.step - 1); render(); return;
    }
    if(a === "skip"){ await advance(); return; }
    if(a === "next"){
      if(state.step === 1){ state.step = 2; render(); scrollTop(); }
      else if(state.step === 2){
        if(state.danger.length){ state.urgentShown = true; render(); scrollTop(); } else { state.step = 3; render(); scrollTop(); }
      }
      else if(state.step === 3){
        const digits = state.phone.replace(/\D/g, "");
        if(!state.name.trim()){ state.error = "Please add your first name."; render(); return; }
        if(digits.length < 10){ state.error = "Please enter a valid phone number."; render(); return; }
        if(!state.consent){ state.error = "Please tick the box so the clinic can call you."; render(); return; }
        state.saving = true; render();
        const ok = await startLead(); state.saving = false;
        if(!ok){ render(); return; }
        state.step = 4; state.qi = 0; render(); scrollTop();
      }
      else if(state.step === 4){ await advance(); }
    }
  }
  function scrollTop(){ const t = document.getElementById("checkin"); if(t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }

  /* Other sections (stage cards, due date calculator) can start the check-in at a chosen stage. */
  window.CheckinSelectStage = function(stage){
    if(!D.stages.some((s) => s.key === stage)) return;
    Object.assign(state, fresh()); state.stage = stage; state.step = 2; render(); scrollTop();
  };

  render();
})();
