/* Gentle check-in (demo) — a calm, step-by-step questionnaire.
   1) where are you  2) anything happening right now  3) name + phone  4) tick-list + a few more questions -> summary.
   Danger signs are always answered with urgent advice BEFORE any details are asked for.
   The phone number is saved after step 3 (so a person who leaves still reaches the clinic);
   the tick-list, notes and result are added to the same record at the end. */
(function(){
  "use strict";
  const root = document.getElementById("checkinApp");
  const D = window.CHECKIN_DATA;
  if(!root || !D) return;

  const PHONE = "7406886226";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fresh = () => ({ step: 1, stage: "", danger: [], noDanger: false, nowNote: "", name: "", phone: "", window: "any", consent: false,
                         symptoms: [], done: [], moodKey: "", visitKey: "", note: "", lead: null, saving: false, error: "", urgentShown: false });
  const state = fresh();

  const client = (() => {
    if(!window.isSupabaseConfigured || !window.isSupabaseConfigured() || !window.supabase) return null;
    return window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
  })();

  const dangerFor = () => D.danger.filter((d) => d.stages.includes(state.stage));
  const toggle = (arr, key) => { const i = arr.indexOf(key); if(i === -1) arr.push(key); else arr.splice(i, 1); };
  const allSymptoms = () => state.symptoms.concat(state.moodKey ? [state.moodKey] : []);
  const allDone = () => state.done.concat(state.visitKey ? [state.visitKey] : []);

  function progress(n){
    return `<div class="ci-progress" role="img" aria-label="Step ${n} of 4"><span>Step ${n} of 4</span><i><b style="width:${n * 25}%"></b></i></div>`;
  }
  function opt(key, label, on, hint){
    return `<button type="button" class="ci-opt${on ? " is-on" : ""}" data-key="${esc(key)}" aria-pressed="${on ? "true" : "false"}"><span class="ci-tick" aria-hidden="true"></span><span class="ci-opt-text">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ""}</span></button>`;
  }
  function chips(group, items, current){
    return `<div class="ci-chips">${items.map((i) => `<button type="button" class="ci-chip${current === i.key ? " is-on" : ""}" data-single="${group}" data-key="${i.key}" aria-pressed="${current === i.key}">${esc(i.label)}</button>`).join("")}</div>`;
  }
  function nav(back, nextLabel, nextDisabled){
    return `<div class="ci-nav">${back ? `<button type="button" class="ci-back" data-act="back">← Back</button>` : "<span></span>"}<button type="button" class="ci-next" data-act="next"${nextDisabled ? " disabled" : ""}>${nextLabel}</button></div>`;
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
    const level = D.result(state.danger, allSymptoms(), state.stage);
    if(level === "urgent") return urgentCard(true);
    const interval = D.intervals[state.stage] || "";
    const overdue = state.visitKey === "visit_older" || state.visitKey === "visit_none";
    const contact = `<p class="ci-contact">If you'd like to talk, Dr. Sandesh's number is <a href="tel:+91${PHONE}">${PHONE}</a>. You can reach the clinic between 5 and 8 PM, Monday to Saturday, and a video call can be scheduled for a time that suits you.</p>`;
    const gentle = `<a class="ci-soft" href="#consult">Or choose a time to talk whenever you're free →</a>`;
    if(level === "talk_soon"){
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
      <p>What you've shared is common at this stage, and nothing here needs a rush. A general check-in at regular intervals is the best way to keep it that way.</p>
      <div class="ci-pace"><b>A good check-in rhythm for you</b><span>${esc(interval)}</span></div>
      ${overdue ? `<p class="ci-note">Your last check-up was a while ago, so it would be nice to fit one in when you can.</p>` : ""}
      ${contact}
      ${gentle}
      <p class="ci-small">The team may call you between 5 and 8 PM, Monday to Saturday, just to say hello. No pressure at all.</p></div>`;
  }

  function render(){
    let html = "";
    if(state.step === 1){
      html = progress(1) + `<h3 class="ci-q">Where are you right now?</h3><p class="ci-sub">Pick the one that fits best. There are no wrong answers.</p>
        <div class="ci-grid">${D.stages.map((s) => opt(s.key, s.label, state.stage === s.key, s.hint)).join("")}</div>${nav(false, "Continue →", !state.stage)}`;
    } else if(state.step === 2){
      if(state.urgentShown){
        html = urgentCard(false);
      } else {
        html = progress(2) + `<h3 class="ci-q">Is any of this happening right now?</h3><p class="ci-sub">Most of the time, the answer is "none of these", and that is perfectly fine. Tick anything that applies.</p>
          <div class="ci-grid">${dangerFor().map((d) => opt(d.key, d.label, state.danger.includes(d.key))).join("")}${opt("__none", "None of these. I'm just checking in", state.noDanger && !state.danger.length)}</div>
          <label class="ci-other"><span>Something else going on right now? <em>(optional)</em></span><textarea id="ciNowNote" rows="2" maxlength="250" placeholder="Type here, in your own words">${esc(state.nowNote)}</textarea></label>
          ${nav(true, "Continue →", false)}`;
      }
    } else if(state.step === 3){
      html = progress(3) + `<h3 class="ci-q">Where can Dr. Sandesh's team reach you?</h3>
        <p class="ci-sub">A gentle call, at a time you choose. You're never obliged to book anything.</p>
        <div class="ci-form">
          <label>First name<input id="ciName" type="text" autocomplete="given-name" maxlength="60" value="${esc(state.name)}" placeholder="Your first name"></label>
          <label>Phone number<input id="ciPhone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="${esc(state.phone)}" placeholder="10-digit mobile number"></label>
          <div class="ci-field"><span>Best time for a call</span><div class="ci-chips">${D.windows.map((w) => `<button type="button" class="ci-chip${state.window === w.key ? " is-on" : ""}" data-window="${w.key}" aria-pressed="${state.window === w.key}">${w.label}</button>`).join("")}</div></div>
          <label class="ci-consent"><input id="ciConsent" type="checkbox"${state.consent ? " checked" : ""}><span>I'm happy for the clinic to call me about my answers. Calls are made Monday to Saturday, 5 PM to 8 PM.</span></label>
        </div>
        ${state.error ? `<p class="ci-error" role="alert">${esc(state.error)}</p>` : ""}
        ${nav(true, state.saving ? "Saving…" : "Continue →", state.saving)}`;
    } else if(state.step === 4){
      const l = D.lists[state.stage];
      html = progress(4) + `<h3 class="ci-q">What are you noticing?</h3><p class="ci-sub">Tick whatever applies, including the everyday things. Skip anything you like.</p>
        <div class="ci-grid">${l.noticing.map((i) => opt(i.key, i.label, state.symptoms.includes(i.key))).join("")}</div>
        <h3 class="ci-q ci-q2">And what has been done so far?</h3>
        <div class="ci-grid">${l.done.map((i) => opt(i.key, i.label, state.done.includes(i.key))).join("")}</div>
        <h3 class="ci-q ci-q2">How are you feeling overall?</h3>${chips("mood", D.mood, state.moodKey)}
        <h3 class="ci-q ci-q2">When was your last check-up?</h3>${chips("visit", D.lastVisit, state.visitKey)}
        <label class="ci-other ci-other-big"><span>Anything else you'd like us to know? <em>(optional)</em></span><textarea id="ciNote" rows="3" maxlength="400" placeholder="Type anything else here, in your own words">${esc(state.note)}</textarea></label>
        ${state.error ? `<p class="ci-error" role="alert">${esc(state.error)}</p>` : ""}
        ${nav(true, state.saving ? "Saving…" : "See my summary →", state.saving)}`;
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
    if(error || !data){ state.error = /too many/i.test(error?.message || "") ? "That number has been used a few times today. Please try again tomorrow, or call " + PHONE + "." : "Something went wrong. Please try again, or call " + PHONE + "."; return false; }
    state.lead = data; return true;
  }
  async function finishLead(){
    if(!state.lead || !client) return true; /* never trap the reader: they still see their summary */
    const level = D.result(state.danger, allSymptoms(), state.stage);
    const note = [state.nowNote.trim() ? "Right now: " + state.nowNote.trim() : "", state.note.trim() ? "Other: " + state.note.trim() : ""].filter(Boolean).join(" | ");
    const { error } = await client.rpc("checkin_complete", { p_id: state.lead.id, p_secret: state.lead.secret, p_symptoms: allSymptoms(), p_done: allDone(), p_result: level, p_note: note || null });
    return !error;
  }

  function bind(){
    root.querySelectorAll(".ci-opt").forEach((b) => b.addEventListener("click", () => {
      const key = b.dataset.key;
      if(state.step === 1){ state.stage = key; state.danger = []; state.symptoms = []; state.done = []; state.noDanger = false; state.moodKey = ""; state.visitKey = ""; render(); return; }
      if(state.step === 2){
        if(key === "__none"){ state.danger = []; state.noDanger = true; }
        else { toggle(state.danger, key); state.noDanger = false; }
        render(); return;
      }
      if(state.step === 4){
        const l = D.lists[state.stage];
        if(l.noticing.some((i) => i.key === key)){
          if(key === "feeling_well" && !state.symptoms.includes(key)){ /* "I feel well" does not clear the rest */ }
          toggle(state.symptoms, key);
        } else toggle(state.done, key);
        const on = b.getAttribute("aria-pressed") !== "true";
        b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
      }
    }));
    root.querySelectorAll("[data-single]").forEach((b) => b.addEventListener("click", () => {
      const g = b.dataset.single, k = b.dataset.key;
      if(g === "mood") state.moodKey = state.moodKey === k ? "" : k; else state.visitKey = state.visitKey === k ? "" : k;
      root.querySelectorAll(`[data-single="${g}"]`).forEach((x) => { const on = (g === "mood" ? state.moodKey : state.visitKey) === x.dataset.key; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on); });
    }));
    root.querySelectorAll("[data-window]").forEach((b) => b.addEventListener("click", () => { state.window = b.dataset.window; root.querySelectorAll("[data-window]").forEach((x) => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on); }); }));
    const name = root.querySelector("#ciName"), phone = root.querySelector("#ciPhone"), consent = root.querySelector("#ciConsent");
    const nowNote = root.querySelector("#ciNowNote"), note = root.querySelector("#ciNote");
    if(name) name.addEventListener("input", () => { state.name = name.value; });
    if(phone) phone.addEventListener("input", () => { state.phone = phone.value; });
    if(consent) consent.addEventListener("change", () => { state.consent = consent.checked; });
    if(nowNote) nowNote.addEventListener("input", () => { state.nowNote = nowNote.value; });
    if(note) note.addEventListener("input", () => { state.note = note.value; });
    root.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => act(b.dataset.act)));
  }

  async function act(a){
    state.error = "";
    if(a === "restart"){ Object.assign(state, fresh()); render(); scrollTop(); return; }
    if(a === "continue"){ state.urgentShown = false; state.step = 3; render(); return; }
    if(a === "back"){ state.step = Math.max(1, state.step - 1); render(); return; }
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
        state.step = 4; render(); scrollTop();
      }
      else if(state.step === 4){
        state.saving = true; render(); await finishLead(); state.saving = false;
        state.step = 5; render(); scrollTop();
      }
    }
  }
  function scrollTop(){ const t = document.getElementById("checkin"); if(t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }

  /* Other sections (life-stage cards, due date calculator) can start the check-in at a chosen stage. */
  window.CheckinSelectStage = function(stage){
    if(!D.stages.some((s) => s.key === stage)) return;
    Object.assign(state, fresh()); state.stage = stage; state.step = 2; render(); scrollTop();
  };

  render();
})();
