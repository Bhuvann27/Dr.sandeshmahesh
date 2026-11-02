(function(){
  "use strict";

  const toggle = document.getElementById("assistantToggle");
  const panel = document.getElementById("assistantPanel");
  const close = document.getElementById("assistantClose");
  const form = document.getElementById("assistantForm");
  const input = document.getElementById("assistantInput");
  const messages = document.getElementById("assistantMessages");
  const suggestions = document.getElementById("assistantSuggestions");
  const root = document.getElementById("siteAssistant");

  if(!toggle || !panel || !form || !input || !messages) return;

  /* Keep the assistant self-contained so this refinement does not disturb the
     site's existing mobile layout, hero, booking flow, or other sections. */
  const style = document.createElement("style");
  style.textContent = `
    .site-assistant .assistant-panel{
      position:fixed!important;
      display:flex!important;
      flex-direction:column!important;
      right:max(12px,env(safe-area-inset-right,0px))!important;
      bottom:auto!important;
      top:calc(env(safe-area-inset-top,0px) + 78px)!important;
      width:min(400px,calc(100vw - 24px))!important;
      height:min(680px,calc(100dvh - 100px))!important;
      max-height:calc(100dvh - 100px)!important;
      overflow:hidden!important;
      border-radius:20px!important;
      z-index:10000!important;
      transform:none!important;
    }
    .site-assistant .assistant-head{
      flex:0 0 auto!important;
      min-height:62px!important;
    }
    .site-assistant .assistant-messages{
      flex:1 1 auto!important;
      min-height:0!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      overscroll-behavior:contain;
      -webkit-overflow-scrolling:touch;
      padding:18px!important;
      scroll-behavior:smooth;
    }
    .site-assistant .assistant-suggestions{
      flex:0 0 auto!important;
      display:flex!important;
      flex-wrap:nowrap!important;
      gap:8px!important;
      max-width:100%!important;
      overflow-x:auto!important;
      overflow-y:hidden!important;
      padding:8px 14px 10px!important;
      margin:0!important;
      scrollbar-width:none;
      -webkit-overflow-scrolling:touch;
      border-top:1px solid rgba(23,19,15,.08);
    }
    .site-assistant .assistant-suggestions::-webkit-scrollbar{display:none;}
    .site-assistant .assistant-suggestions button{
      flex:0 0 auto!important;
      white-space:nowrap!important;
      min-height:38px!important;
      padding:8px 13px!important;
      border-radius:999px!important;
      font-size:.78rem!important;
      line-height:1.15!important;
    }
    .site-assistant.has-conversation .assistant-suggestions{
      display:none!important;
    }
    .site-assistant .assistant-form{
      flex:0 0 auto!important;
      min-width:0!important;
    }
    .site-assistant .assistant-form input{
      min-width:0!important;
    }
    .site-assistant .assistant-action-wrap{
      background:transparent!important;
      padding:0!important;
      margin:8px 0 2px!important;
      border:0!important;
    }
    .site-assistant .assistant-action{
      max-width:100%;
      padding:9px 13px;
      border:1px solid rgba(242,84,12,.3);
      border-radius:999px;
      background:rgba(242,84,12,.06);
      color:var(--orange-deep);
      font:inherit;
      font-size:.78rem;
      font-weight:700;
      line-height:1.2;
      cursor:pointer;
    }

    /* Desktop: the closed assistant stays above WhatsApp. Once chat opens,
       the assistant button moves down to the exact call-button position and
       the panel follows it, opening upward from that fixed control point. */
    @media(min-width:881px){
      .site-assistant{
        right:max(28px,env(safe-area-inset-right,0px))!important;
        bottom:160px!important;
        z-index:120!important;
        transition:bottom .2s ease!important;
      }
      .site-assistant.chat-open{
        bottom:28px!important;
      }
      .site-assistant .assistant-toggle{
        width:56px!important;
        height:56px!important;
      }
      .site-assistant .assistant-panel{
        position:absolute!important;
        right:0!important;
        top:auto!important;
        bottom:calc(100% + 10px)!important;
        width:min(390px,calc(100vw - 48px))!important;
        height:min(540px,calc(100dvh - 250px))!important;
        max-height:calc(100dvh - 250px)!important;
        transform-origin:bottom right!important;
      }
    }

    @media(max-width:640px){
      .site-assistant{
        position:fixed!important;
        right:0!important;
        bottom:0!important;
        width:100%!important;
        height:0!important;
        z-index:10000!important;
        pointer-events:none!important;
      }
      /* Match the two contact buttons exactly: same right edge, same 50px
         diameter, and a 10px gap. This places the assistant as the third
         button in one evenly spaced vertical stack. */
      .site-assistant .assistant-toggle{
        position:fixed!important;
        right:max(18px,env(safe-area-inset-right,0px))!important;
        bottom:calc(max(18px,env(safe-area-inset-bottom,0px)) + 120px)!important;
        width:50px!important;
        height:50px!important;
        margin:0!important;
        z-index:10002!important;
        pointer-events:auto!important;
      }
      .site-assistant .assistant-panel{
        position:fixed!important;
        left:14px!important;
        right:14px!important;
        top:auto!important;
        bottom:calc(env(safe-area-inset-bottom,0px) + 204px)!important;
        width:auto!important;
        height:min(620px,60dvh)!important;
        max-height:calc(100dvh - 260px)!important;
        min-height:430px!important;
        border-radius:22px!important;
        transform:none!important;
        z-index:10001!important;
        margin:0!important;
      }
      .site-assistant .assistant-head{
        min-height:60px!important;
        padding:14px 18px!important;
      }
      .site-assistant .assistant-messages{
        padding:14px!important;
      }
      .site-assistant .assistant-form{
        padding-bottom:max(10px,env(safe-area-inset-bottom,0px))!important;
      }
    }
  `;
  document.head.appendChild(style);

  /* Dr. Sandesh's assistant answers locally from approved website content.
     It must never call another doctor's assistant service. When a dedicated,
     server-side assistant for this site exists, set its URL here. */
  const endpoint = "";

  const history = [];

  const add = (text, who) => {
    const el = document.createElement("div");
    el.className = "assistant-msg " + who;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  };

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if(!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeAssistant();
  };

  const addAction = (label, target) => {
    const wrap = document.createElement("div");
    wrap.className = "assistant-msg bot assistant-action-wrap";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "assistant-action";
    button.textContent = label;
    button.addEventListener("click", () => scrollToSection(target));
    wrap.appendChild(button);
    messages.appendChild(wrap);
  };

  const localAnswer = (q) => {
    const x = q.toLowerCase();
    if(/book|appointment|consult|online|video|call/.test(x)){
      return "You can talk to Dr. Sandesh over a video call. Open the Online Consultation section, choose a date and an available time, and review your request before sending it. It is listed as a 15-minute consultation for ₹500, Monday to Saturday, 3 PM to 8 PM, and the clinic confirms the appointment with you. If your concern needs an in-person examination, the doctor will advise you.";
    }
    if(/where|location|hospital|address|tumakuru|tumkur|timing|time|open|hours/.test(x)){
      return "Dr. Sandesh Mahesh is listed at Siddaganga Hospital, Tumakuru. Consultation hours are Monday to Saturday, 3 PM to 8 PM. The Visit section has the phone number and a directions link.";
    }
    if(/bleed|leak|fluid|baby.*(move|kick)|movement|fits|seizure|severe (pain|headache)|faint|breath/.test(x)){
      return "Heavy vaginal bleeding, severe abdominal pain, fluid leaking, reduced baby movements in pregnancy, a severe headache with vision changes, fits, fainting or difficulty breathing need urgent in-person medical care. Please go to the nearest hospital or call the clinic straight away rather than waiting for a reply here.";
    }
    if(/pregnan|antenatal|delivery|labour|labor|postnatal|baby|trimester/.test(x)){
      return "The website lists pregnancy and antenatal care, high-risk pregnancy, and labour, delivery and postnatal care among Dr. Sandesh's areas of care. I can't assess your own pregnancy from a chat, so questions about symptoms, scans or medicines are best discussed with the doctor. If anything feels sudden or severe, seek urgent in-person care.";
    }
    if(/period|menstru|pcos|pcod|fertil|hormon|irregular|pelvic|gynae|gynec/.test(x)){
      return "Menstrual concerns, pelvic symptoms, PCOS and fertility-related concerns are listed among the areas of care on this website. The cause of a symptom can't be worked out safely from a chat, so it is worth discussing with a doctor. You can read the PCOS-related patient story or request a consultation from the website.";
    }
    if(/menopaus|hot flush|hot flash/.test(x)){
      return "Menopause and women's wellness are listed among the areas of care. Symptoms and their management differ from person to person, so an individual assessment is the right way to decide what suits you.";
    }
    if(/treat|care|condition|disease|special|service|procedure/.test(x)){
      return "The website lists care in six areas: pregnancy and antenatal care; high-risk pregnancy; labour, delivery and postnatal care; gynaecological health; PCOS, fertility and reproductive health; and menopause and women's wellness. This is a high-level view, not a complete list of services or procedures.";
    }
    if(/about|qualification|degree|experience|doctor|who/.test(x)){
      return "Dr. Sandesh Mahesh holds MBBS, MS, FRM and FMAS qualifications. He completed his MBBS and MS at Mandya Institute of Medical Sciences and is listed with 4+ years of experience in Obstetrics & Gynaecology at Siddaganga Hospital, Tumakuru.";
    }
    if(/video|youtube|channel/.test(x)){
      return "Dr. Sandesh shares educational videos on his YouTube channel, @Namma_DrSandesh. You can open it from the Insights section of this website.";
    }
    if(/story|stories|insight|article/.test(x)){
      return "The Patient Stories section presents simple, anonymous conversations about common women's health concerns, which you can read at your own pace. The stories currently shown are fictional previews; real stories will be added only with consent.";
    }
    if(/symptom|diagnos|medicine|tablet|drug|dose|treatment|pain|scan|test/.test(x)){
      return "I can give general information and explain what the website covers, but I can't diagnose you or choose a personal medicine, dose or test from a chat. For anything about your own health, please speak with the doctor.";
    }
    return "I can help with Dr. Sandesh's qualifications, areas of care, consultations, hospital information and patient stories. Ask me a specific question and I'll answer it directly.";
  };

  const actionForQuestion = (q) => {
    const x = q.toLowerCase();
    if(/book|appointment|consult/.test(x)) return ["Talk to the doctor online", "consult"];
    if(/where|location|hospital|address|tumakuru|tumkur|timing|time|open|hours/.test(x)) return ["Open clinic information", "visit"];
    if(/pregnan|antenatal|delivery|labour|labor|postnatal|period|menstru|pcos|pcod|fertil|menopaus|treat|care|condition|special|service|procedure/.test(x)) return ["See areas of care", "care"];
    if(/about|qualification|degree|experience|doctor|who/.test(x)) return ["Learn about Dr. Sandesh", "about"];
    if(/video|youtube|channel/.test(x)) return ["Open educational videos", "insights"];
    if(/story|stories|insight|article/.test(x)) return ["Read patient stories", "stories"];
    return null;
  };

  async function answer(q){
    root?.classList.add("has-conversation");
    add(q, "user");
    input.value = "";

    const loading = add("Thinking…", "bot");
    loading.setAttribute("aria-live", "polite");

    try {
      if(!endpoint) throw new Error("local");
      const previousHistory = history.slice(-6);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history: previousHistory }),
      });

      const data = await response.json().catch(() => ({}));
      if(!response.ok) throw new Error(data.error || "Assistant unavailable.");

      loading.textContent = data.answer || localAnswer(q);
      history.push({ role: "user", text: q });
      history.push({ role: "model", text: loading.textContent });
    } catch(e){
      loading.textContent = localAnswer(q);
    }

    const action = actionForQuestion(q);
    if(action) addAction(action[0], action[1]);
    messages.scrollTop = messages.scrollHeight;
  }

  let closeTimer = null;

  function openAssistant(){
    clearTimeout(closeTimer);
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      root?.classList.add("is-open", "chat-open");
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    });
  }

  function closeAssistant(){
    root?.classList.remove("is-open", "chat-open");
    toggle.setAttribute("aria-expanded", "false");
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { panel.hidden = true; }, 240);
  }

  toggle.addEventListener("click", () => {
    if(panel.hidden) openAssistant();
    else closeAssistant();
  });

  close.addEventListener("click", closeAssistant);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if(q) answer(q);
  });

  if(suggestions){
    suggestions.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if(!button) return;
      const action = button.dataset.action;
      if(action === "question"){
        input.focus();
        return;
      }
      const questionMap = {
        consult: "How do I talk to the doctor online?",
        care: "What does Dr. Sandesh treat?",
        visit: "Where is the hospital and what are the clinic timings?",
        stories: "Show me the patient stories.",
        about: "Tell me about Dr. Sandesh."
      };
      if(action && questionMap[action]) answer(questionMap[action]);
    });
  }
})();
