/* Gentle check-in v2 — questions, wording and rules.
   Flow: where are you -> anything urgent right now -> name + phone -> a short set of
   questions for that path -> a calm summary. Levels on options:
   "urgent" = "please don't wait" message, "soon" = worth a conversation with the doctor. */
window.CHECKIN_DATA = (function(){
  const stages = [
    { key: "planning",     label: "Planning a baby", hint: "or trying to conceive" },
    { key: "trimester1",   label: "Pregnant, first trimester", hint: "up to about 12 weeks" },
    { key: "trimester2",   label: "Pregnant, second trimester", hint: "about 13 to 27 weeks" },
    { key: "trimester3",   label: "Pregnant, third trimester", hint: "about 28 weeks onwards" },
    { key: "after_birth",  label: "I recently had a baby" },
    { key: "periods_other",label: "Periods or a gynaecology concern" },
    { key: "menopause",    label: "Menopause or changes in midlife" },
    { key: "general",      label: "A general check-up or a second opinion" }
  ];
  const PREG = ["trimester1","trimester2","trimester3"];
  const isPreg = (s) => PREG.includes(s);

  /* Urgent: shown first, before any details are asked for. */
  const danger = [
    { key: "heavy_bleeding", label: "Heavy bleeding that soaks through pads", stages: ["trimester1","trimester2","trimester3","after_birth","periods_other","planning","general"] },
    { key: "severe_pain",    label: "Severe tummy or pelvic pain", stages: ["trimester1","trimester2","trimester3","after_birth","periods_other","planning","general","menopause"] },
    { key: "fluid_leaking",  label: "Water or fluid leaking", stages: ["trimester2","trimester3"] },
    { key: "less_movement",  label: "Baby moving much less than usual", stages: ["trimester2","trimester3"] },
    { key: "severe_headache",label: "Severe headache with blurred vision", stages: ["trimester2","trimester3","after_birth"] },
    { key: "fits",           label: "A fit or seizure", stages: ["trimester2","trimester3","after_birth"] },
    { key: "faint_breath",   label: "Fainting, chest pain or trouble breathing", stages: ["trimester1","trimester2","trimester3","after_birth","periods_other","planning","general","menopause"] },
    { key: "post_meno_bleed",label: "Bleeding after my periods had stopped for a year or more", stages: ["menopause","general"] }
  ];

  /* ---- shared option sets ---- */
  const conditionsOpts = [
    { key: "bp",      label: "High blood pressure", pregLevel: "soon" },
    { key: "sugar",   label: "Diabetes or high sugar", pregLevel: "soon" },
    { key: "thyroid", label: "Thyroid problem" },
    { key: "anaemia", label: "Low haemoglobin (anaemia)" },
    { key: "asthma",  label: "Asthma" },
    { key: "heart",   label: "A heart problem", pregLevel: "soon" },
    { key: "none",    label: "None that I know of", exclusive: true },
    { key: "unsure",  label: "I'm not sure", exclusive: true }
  ];
  const lastVisit = [
    { key: "visit_recent", label: "In the last month" },
    { key: "visit_1_3m",   label: "1 to 3 months ago" },
    { key: "visit_older",  label: "More than 3 months ago" },
    { key: "visit_none",   label: "I haven't had one yet" }
  ];
  const note = { id: "note", type: "text", title: "Anything else you'd like the doctor to know?", sub: "Optional. Type in your own words, or skip.", optional: true };

  const Q = {
    conditions: (preg) => ({ id: "conditions", type: "multi", optional: true,
      title: "Do you have any long-term health condition?", sub: "Optional. It helps the doctor prepare for your call.",
      options: conditionsOpts.map((o) => Object.assign({}, o, preg && o.pregLevel ? { level: o.pregLevel } : {})) }),
    lastvisit: (label) => ({ id: "lastvisit", type: "single", title: label || "When was your last check-up?", options: lastVisit }),
    purpose: (opts) => ({ id: "purpose", type: "single", title: "What would help you most from a conversation?", sub: "This helps the team know how to help.", options: opts })
  };

  /* ---- per-stage tick-lists ---- */
  const noticing = {
    planning: [
      { key: "feeling_well", label: "I feel well. I'm just planning ahead" },
      { key: "irregular_periods", label: "My periods are irregular" },
      { key: "painful_periods", label: "My periods are very painful", level: "soon" },
      { key: "heavy_periods", label: "My periods are very heavy", level: "soon" },
      { key: "weight_skin", label: "Weight or skin changes" },
      { key: "worried_planning", label: "I feel unsure or anxious about planning" }
    ],
    trimester1: [
      { key: "feeling_well", label: "I feel well and things feel normal" },
      { key: "nausea", label: "Nausea or morning sickness" },
      { key: "tired", label: "Feeling very tired" },
      { key: "mild_cramps", label: "Mild cramps" },
      { key: "light_spotting", label: "Light spotting", level: "soon" },
      { key: "cant_keep_food", label: "Cannot keep food or water down", level: "soon" },
      { key: "breast_tender", label: "Breast tenderness" },
      { key: "mood_swings", label: "Mood swings" }
    ],
    trimester2: [
      { key: "feeling_well", label: "I feel well and things feel normal" },
      { key: "feel_movement", label: "I can feel my baby moving" },
      { key: "back_ache", label: "Back ache" },
      { key: "leg_cramps", label: "Leg cramps" },
      { key: "swollen_feet", label: "Swollen feet" },
      { key: "heartburn", label: "Heartburn or indigestion" },
      { key: "itching", label: "Itching on palms or soles", level: "soon" },
      { key: "swollen_face", label: "Swelling of face or hands", level: "soon" },
      { key: "low_mood", label: "Feeling low or worried", level: "soon" }
    ],
    trimester3: [
      { key: "feeling_well", label: "I feel well and things feel normal" },
      { key: "feel_movement", label: "My baby is moving as usual" },
      { key: "less_movement_tick", label: "My baby is moving less than usual", level: "urgent" },
      { key: "swollen_face", label: "Swelling of face or hands", level: "soon" },
      { key: "itching", label: "Itching on palms or soles", level: "soon" },
      { key: "tightenings", label: "Tightening in my tummy now and then" },
      { key: "back_pain", label: "Strong back pain" },
      { key: "breathless", label: "Feeling breathless" },
      { key: "poor_sleep", label: "Trouble sleeping" }
    ],
    after_birth: [
      { key: "feeling_well", label: "I'm recovering well" },
      { key: "tired", label: "Very tired" },
      { key: "fever", label: "Fever or chills", level: "soon" },
      { key: "stitch_pain", label: "Pain at my stitches or scar", level: "soon" },
      { key: "breast_pain", label: "Painful or hard breasts", level: "soon" },
      { key: "feeding_trouble", label: "Trouble feeding my baby", level: "soon" },
      { key: "heavy_lochia", label: "Bleeding that is still heavy", level: "soon" },
      { key: "poor_sleep", label: "Not getting any sleep" }
    ],
    periods_other: [
      { key: "regular_periods", label: "My periods are otherwise regular" },
      { key: "irregular_periods", label: "Irregular periods" },
      { key: "painful_periods", label: "Painful periods", level: "soon" },
      { key: "heavy_periods", label: "Very heavy periods", level: "soon" },
      { key: "spotting_between", label: "Bleeding between periods", level: "soon" },
      { key: "discharge_change", label: "A change in discharge", level: "soon" },
      { key: "pelvic_pain", label: "Ongoing pelvic pain", level: "soon" },
      { key: "weight_skin", label: "Weight, hair or skin changes" }
    ],
    menopause: [
      { key: "hot_flushes", label: "Hot flushes" },
      { key: "night_sweats", label: "Night sweats" },
      { key: "poor_sleep", label: "Trouble sleeping" },
      { key: "mood_changes", label: "Mood changes or low mood" },
      { key: "dryness", label: "Vaginal dryness or discomfort" },
      { key: "joint_pain", label: "Aches in joints or bones" },
      { key: "heavy_irregular", label: "Heavy or very irregular bleeding", level: "soon" },
      { key: "urinary", label: "Urine leaking or burning", level: "soon" }
    ],
    general: [
      { key: "nothing_special", label: "Nothing in particular. It's a routine check" },
      { key: "irregular_periods", label: "Irregular periods" },
      { key: "pelvic_pain", label: "Pelvic pain", level: "soon" },
      { key: "discharge_change", label: "A change in discharge", level: "soon" },
      { key: "weight_skin", label: "Weight, hair or skin changes" },
      { key: "worried", label: "I'm worried about something and want to ask" }
    ]
  };
  const done = {
    planning: [
      { key: "health_checkup", label: "A general health check-up recently" },
      { key: "tracked_periods", label: "Tracking my periods" },
      { key: "folic_acid", label: "Started folic acid" },
      { key: "partner_checked", label: "My partner has been checked too" },
      { key: "spoke_doctor", label: "Already spoken to a doctor about it" }
    ],
    trimester1: [
      { key: "preg_test", label: "Confirmed with a pregnancy test" },
      { key: "first_scan", label: "My first scan" },
      { key: "vitamins", label: "Started pregnancy vitamins" },
      { key: "blood_tests", label: "My first blood tests" }
    ],
    trimester2: [
      { key: "anomaly_scan", label: "My anomaly scan" },
      { key: "blood_tests", label: "Routine blood tests" },
      { key: "sugar_test", label: "A sugar (glucose) test" },
      { key: "iron_calcium", label: "Taking iron or calcium as advised" },
      { key: "vaccines", label: "Pregnancy vaccines" }
    ],
    trimester3: [
      { key: "growth_scan", label: "A growth scan" },
      { key: "birth_plan", label: "Talked about where and how I'll deliver" },
      { key: "hospital_bag", label: "Packed my hospital bag" },
      { key: "recent_visit", label: "A check-up in the last two weeks" }
    ],
    after_birth: [
      { key: "postnatal_visit", label: "My own post-birth check-up" },
      { key: "baby_checkup", label: "Baby's check-ups are on track" },
      { key: "help_at_home", label: "I have help at home" },
      { key: "resting", label: "Getting some rest" }
    ],
    periods_other: [
      { key: "ultrasound_done", label: "An ultrasound" },
      { key: "blood_tests", label: "Blood tests" },
      { key: "pap_screen", label: "A cervical screening test" },
      { key: "treated_before", label: "Treatment for this before" }
    ],
    menopause: [
      { key: "blood_tests", label: "Blood tests" },
      { key: "bone_test", label: "A bone density test" },
      { key: "pap_screen", label: "A cervical screening test" },
      { key: "spoke_doctor", label: "Already spoken to a doctor about it" }
    ],
    general: [
      { key: "pap_screen", label: "A cervical screening test" },
      { key: "ultrasound_done", label: "An ultrasound" },
      { key: "blood_tests", label: "Blood tests" },
      { key: "has_report", label: "I have a report I'd like explained" }
    ]
  };

  const purposeCommon = [
    { key: "reassure", label: "Reassurance. Is this normal?" },
    { key: "reports", label: "Understanding my scans or reports" },
    { key: "plan", label: "Planning my check-ups or next steps" },
    { key: "specific", label: "Something specific is bothering me", level: "soon" },
    { key: "talk", label: "I'm not sure yet. I'd just like to talk" }
  ];

  /* ---- the question sequence for each path ---- */
  function build(stage){
    const preg = isPreg(stage);
    const noticingQ = { id: "noticing", type: "multi", title: stage === "general" ? "Is anything on your mind?" : "What are you noticing?", sub: "Tick whatever applies, including the everyday things. Skip anything you like.", options: noticing[stage] };
    const doneQ = { id: "done", type: "multi", optional: true, title: stage === "after_birth" ? "What has been looked after so far?" : "What has been done so far?", sub: "Optional.", options: done[stage] };
    const qs = [];
    if(preg){
      qs.push({ id: "first", type: "single", title: "Is this your first pregnancy?", options: [{ key: "first", label: "Yes, it's my first" }, { key: "before", label: "No, I've been pregnant before" }] });
      qs.push({ id: "past", type: "multi", optional: true, showIf: (a) => a.first === "before", title: "Anything from a past pregnancy the doctor should know?", sub: "Optional.", options: [
        { key: "miscarriage", label: "I had a miscarriage", level: "soon" },
        { key: "caesarean", label: "I had a caesarean" },
        { key: "early_birth", label: "My baby was born early", level: "soon" },
        { key: "bp_preg", label: "High BP or sugar during a pregnancy", level: "soon" },
        { key: "none", label: "None of these", exclusive: true }] });
      qs.push(Q.conditions(true), noticingQ, doneQ, Q.lastvisit("When was your last antenatal check-up?"), Q.purpose(purposeCommon), note);
    } else if(stage === "planning"){
      qs.push({ id: "trying", type: "single", title: "How long have you been trying?", options: [
        { key: "not_started", label: "We haven't started yet" },
        { key: "under6", label: "Less than 6 months" },
        { key: "m6_12", label: "6 to 12 months", level: "soon" },
        { key: "over12", label: "More than a year", level: "soon" }] });
      qs.push({ id: "before", type: "single", title: "Have you been pregnant before?", options: [
        { key: "no", label: "No" }, { key: "child", label: "Yes, and I have a child" }, { key: "loss", label: "Yes, I had a miscarriage", level: "soon" }] });
      qs.push(Q.conditions(false), noticingQ, doneQ, Q.lastvisit(), Q.purpose(purposeCommon), note);
    } else if(stage === "after_birth"){
      qs.push({ id: "delivery", type: "single", title: "How was your delivery?", options: [
        { key: "normal", label: "Normal delivery" }, { key: "caesarean", label: "Caesarean" }, { key: "unsure", label: "I'd rather not say" }] });
      qs.push({ id: "when", type: "single", title: "How long ago was it?", options: [
        { key: "w2", label: "Within the last 2 weeks" }, { key: "w6", label: "2 to 6 weeks ago" }, { key: "m3", label: "6 weeks to 3 months ago" }, { key: "over3", label: "More than 3 months ago" }] });
      qs.push({ id: "mood", type: "single", title: "Have you been feeling low or tearful?", sub: "Many mothers do, and it helps to talk about it.", options: [
        { key: "no", label: "Not really" }, { key: "sometimes", label: "Sometimes" }, { key: "most", label: "Most days", level: "soon" }] });
      qs.push(noticingQ, doneQ, Q.lastvisit("When was your own last check-up?"), Q.purpose(purposeCommon), note);
    } else if(stage === "periods_other"){
      qs.push({ id: "concern", type: "single", title: "What is the main thing bothering you?", options: [
        { key: "late", label: "A late or missed period" }, { key: "irregular", label: "Irregular periods" }, { key: "painful", label: "Painful periods", level: "soon" },
        { key: "heavy", label: "Very heavy periods", level: "soon" }, { key: "between", label: "Bleeding between periods", level: "soon" },
        { key: "discharge", label: "Discharge or itching", level: "soon" }, { key: "pelvic", label: "Pelvic pain", level: "soon" }, { key: "other", label: "Something else" }] });
      qs.push({ id: "howlong", type: "single", title: "How long has it been going on?", options: [
        { key: "days", label: "A few days" }, { key: "weeks", label: "A few weeks" }, { key: "months", label: "A few months", level: "soon" }, { key: "long", label: "More than 6 months", level: "soon" }] });
      qs.push({ id: "pregnant", type: "single", title: "Is there any chance you could be pregnant?", sub: "It helps the doctor know what to check first.", options: [
        { key: "no", label: "No" }, { key: "unsure", label: "I'm not sure" }, { key: "yes", label: "Yes", level: "soon" }] });
      qs.push(noticingQ, doneQ, Q.conditions(false), Q.lastvisit(), Q.purpose(purposeCommon), note);
    } else if(stage === "menopause"){
      qs.push({ id: "age", type: "single", title: "Which age group are you in?", options: [
        { key: "u40", label: "Under 40", level: "soon" }, { key: "a40", label: "40 to 44" }, { key: "a45", label: "45 to 49" }, { key: "a50", label: "50 to 54" }, { key: "a55", label: "55 or older" }] });
      qs.push({ id: "periods", type: "single", title: "Where are your periods right now?", options: [
        { key: "regular", label: "Still regular" }, { key: "irregular", label: "Irregular" }, { key: "under1y", label: "Stopped less than a year ago" }, { key: "over1y", label: "Stopped more than a year ago" }] });
      qs.push(noticingQ, { id: "hrt", type: "single", optional: true, title: "Are you taking anything for these symptoms?", options: [
        { key: "no", label: "No" }, { key: "hormone", label: "Yes, hormone therapy" }, { key: "other", label: "Yes, other medicines or remedies" }] },
        doneQ, Q.conditions(false), Q.lastvisit(), Q.purpose(purposeCommon), note);
    } else {
      qs.push({ id: "reason", type: "single", title: "What would you like from this check-in?", options: [
        { key: "routine", label: "A routine women's health check-up" }, { key: "second", label: "A second opinion on advice I was given" },
        { key: "contraception", label: "Advice on contraception or family planning" }, { key: "screening", label: "Screening, such as a cervical test" }, { key: "other", label: "Something else" }] });
      qs.push(noticingQ, doneQ, Q.conditions(false), Q.lastvisit(), Q.purpose(purposeCommon), note);
    }
    return qs;
  }

  const windows = [
    { key: "5-6pm", label: "5 to 6 PM" }, { key: "6-7pm", label: "6 to 7 PM" },
    { key: "7-8pm", label: "7 to 8 PM" }, { key: "any", label: "Anytime 5 to 8 PM" }
  ];

  const intervals = {
    planning:      "A check-up before you start trying is a good idea, and then whenever something changes. If it has been a while without luck, it is worth a conversation.",
    trimester1:    "A first antenatal visit once the pregnancy is confirmed, and then usually about once a month.",
    trimester2:    "Usually about once a month, with an anomaly scan around the middle of this stage.",
    trimester3:    "Usually every two weeks from about 28 weeks, and weekly in the last month. Your doctor will set the exact pattern for you.",
    after_birth:   "A check-up for you and your baby in the first week or so, and again at around six weeks.",
    periods_other: "A general women's health check-up about once a year, and sooner if your cycle changes for two to three months in a row.",
    menopause:     "A yearly check-up is a good habit through this stage, and sooner if symptoms bother your sleep or daily life.",
    general:       "A general women's health check-up about once a year, and screening as your doctor advises for your age."
  };

  /* All the options of one question that were selected. */
  function chosen(q, a){
    const v = a[q.id];
    const keys = Array.isArray(v) ? v : (v ? [v] : []);
    return (q.options || []).filter((o) => keys.includes(o.key));
  }
  function answerable(stage, answers){ return build(stage).filter((q) => !q.showIf || q.showIf(answers)); }

  /* Result rules: fixed rules, not AI. Returns { level, reasons[] } */
  function evaluate(stage, dangerFlags, answers){
    const reasons = [];
    if(dangerFlags.length){ return { level: "urgent", reasons: dangerFlags.map((k) => "Danger sign: " + (labels[k] || k)) }; }
    let level = "common";
    answerable(stage, answers).forEach((q) => {
      chosen(q, answers).forEach((o) => {
        if(o.level === "urgent"){ level = "urgent"; reasons.push(q.title + " " + o.label); }
        else if(o.level === "soon" && level !== "urgent"){ level = "talk_soon"; reasons.push(o.label); }
      });
    });
    if(isPreg(stage) && (answers.lastvisit === "visit_none" || answers.lastvisit === "visit_older") && level === "common"){ level = "talk_soon"; reasons.push("No recent antenatal check-up"); }
    return { level, reasons };
  }

  /* key -> label, and a readable summary for the admin portal */
  const labels = {};
  stages.forEach((s) => { labels[s.key] = s.label; });
  danger.forEach((d) => { labels[d.key] = d.label; });
  lastVisit.forEach((o) => { labels[o.key] = o.label; });
  [noticing, done].forEach((g) => Object.values(g).forEach((l) => l.forEach((i) => { labels[i.key] = labels[i.key] || i.label; })));
  purposeCommon.forEach((o) => { labels["purpose_" + o.key] = o.label; });

  function describe(stage, answers){
    if(!answers) return [];
    const out = [];
    answerable(stage, answers).forEach((q) => {
      const v = answers[q.id];
      if(v === undefined || v === "" || (Array.isArray(v) && !v.length)) return;
      let text;
      if(q.type === "text") text = String(v);
      else text = chosen(q, answers).map((o) => o.label).join(", ");
      if(text) out.push({ q: q.title, a: text });
    });
    return out;
  }

  return { stages, danger, build, answerable, evaluate, describe, windows, intervals, labels, isPreg, lastVisit };
})();
