/* Gentle check-in — questions, wording and rules (DEMO VERSION).
   Every item below is a placeholder for Dr. Sandesh to review and correct.
   Keys are stored in the database; labels are what people see.
   Levels: "urgent" = "please don't wait" message, "soon" = worth a chat with the doctor,
   no level = ordinary / normal. */
window.CHECKIN_DATA = (function(){
  const stages = [
    { key: "planning",     label: "Planning a baby" },
    { key: "trimester1",   label: "Pregnant, first trimester", hint: "up to about 12 weeks" },
    { key: "trimester2",   label: "Pregnant, second trimester", hint: "about 13 to 27 weeks" },
    { key: "trimester3",   label: "Pregnant, third trimester", hint: "about 28 weeks onwards" },
    { key: "after_birth",  label: "Recently had a baby" },
    { key: "periods_other",label: "Periods, menopause or other concerns" }
  ];

  /* Question 2: things that need attention without delay. Stage-aware. */
  const danger = [
    { key: "heavy_bleeding", label: "Heavy bleeding that soaks through pads", stages: ["trimester1","trimester2","trimester3","after_birth","periods_other"] },
    { key: "severe_pain",    label: "Severe tummy or pelvic pain", stages: ["trimester1","trimester2","trimester3","after_birth","periods_other"] },
    { key: "fluid_leaking",  label: "Water or fluid leaking", stages: ["trimester2","trimester3"] },
    { key: "less_movement",  label: "Baby moving much less than usual", stages: ["trimester2","trimester3"] },
    { key: "severe_headache",label: "Severe headache with blurred vision", stages: ["trimester2","trimester3","after_birth"] },
    { key: "fits",           label: "A fit or seizure", stages: ["trimester2","trimester3","after_birth"] },
    { key: "faint_breath",   label: "Fainting, chest pain or trouble breathing", stages: ["trimester1","trimester2","trimester3","after_birth","periods_other"] }
  ];

  /* Tick-lists, per stage. noticing = what are you feeling; done = what has been done so far. */
  const lists = {
    planning: {
      noticing: [
        { key: "feeling_well",      label: "I feel well. I'm just planning ahead" },
        { key: "regular_periods",   label: "My periods come regularly" },
        { key: "irregular_periods", label: "My periods are irregular" },
        { key: "painful_periods",   label: "My periods are very painful", level: "soon" },
        { key: "heavy_periods",     label: "My periods are very heavy", level: "soon" },
        { key: "trying_long",       label: "We've been trying for a while without luck", level: "soon" },
        { key: "weight_skin",       label: "Weight or skin changes" },
        { key: "worried_planning",  label: "I feel unsure or anxious about planning" }
      ],
      done: [
        { key: "health_checkup",  label: "Had a general health check-up recently" },
        { key: "tracked_periods", label: "Been tracking my periods" },
        { key: "folic_acid",      label: "Started folic acid" },
        { key: "healthy_habits",  label: "Eating well and staying active" },
        { key: "spoke_doctor",    label: "Already spoken to a doctor about it" }
      ]
    },
    trimester1: {
      noticing: [
        { key: "feeling_well",    label: "I feel well and things feel normal" },
        { key: "nausea",          label: "Nausea or morning sickness" },
        { key: "tired",           label: "Feeling very tired" },
        { key: "mild_cramps",     label: "Mild cramps" },
        { key: "light_spotting",  label: "Light spotting", level: "soon" },
        { key: "cant_keep_food",  label: "Cannot keep food or water down", level: "soon" },
        { key: "breast_tender",   label: "Breast tenderness" },
        { key: "mood_swings",     label: "Mood swings" },
        { key: "headaches",       label: "Headaches" },
        { key: "food_dislikes",   label: "Strong food likes or dislikes" }
      ],
      done: [
        { key: "preg_test",   label: "Confirmed with a pregnancy test" },
        { key: "first_scan",  label: "Had my first scan" },
        { key: "vitamins",    label: "Started pregnancy vitamins" },
        { key: "blood_tests", label: "Had my first blood tests" },
        { key: "booked_checkup", label: "Booked regular check-ups" }
      ]
    },
    trimester2: {
      noticing: [
        { key: "feeling_well",   label: "I feel well and things feel normal" },
        { key: "feel_movement",  label: "I can feel my baby moving" },
        { key: "energy_better",  label: "I have more energy than before" },
        { key: "back_ache",      label: "Back ache" },
        { key: "leg_cramps",     label: "Leg cramps" },
        { key: "swollen_feet",   label: "Swollen feet" },
        { key: "heartburn",      label: "Heartburn or indigestion" },
        { key: "itching",        label: "Itching on palms or soles", level: "soon" },
        { key: "swollen_face",   label: "Swelling of face or hands", level: "soon" },
        { key: "low_mood",       label: "Feeling low or worried", level: "soon" }
      ],
      done: [
        { key: "anomaly_scan",   label: "Had my anomaly scan" },
        { key: "blood_tests",    label: "Had my routine blood tests" },
        { key: "iron_calcium",   label: "Taking iron or calcium as advised" },
        { key: "vaccines",       label: "Had my pregnancy vaccines" },
        { key: "regular_visits", label: "Going for regular check-ups" }
      ]
    },
    trimester3: {
      noticing: [
        { key: "feeling_well",   label: "I feel well and things feel normal" },
        { key: "feel_movement",  label: "My baby is moving as usual" },
        { key: "less_movement_tick", label: "My baby is moving less than usual", level: "urgent" },
        { key: "swollen_face",   label: "Swelling of face or hands", level: "soon" },
        { key: "itching",        label: "Itching on palms or soles", level: "soon" },
        { key: "tightenings",    label: "Tightening in my tummy now and then" },
        { key: "back_pain",      label: "Strong back pain" },
        { key: "breathless",     label: "Feeling breathless" },
        { key: "poor_sleep",     label: "Trouble sleeping" },
        { key: "anxious_birth",  label: "Worried about the birth" }
      ],
      done: [
        { key: "growth_scan",    label: "Had a growth scan" },
        { key: "birth_plan",     label: "Talked about where and how I'll deliver" },
        { key: "hospital_bag",   label: "Packed my hospital bag" },
        { key: "recent_visit",   label: "Had a check-up in the last two weeks" }
      ]
    },
    after_birth: {
      noticing: [
        { key: "feeling_well",   label: "I'm recovering well" },
        { key: "tired",          label: "Very tired" },
        { key: "fever",          label: "Fever or chills", level: "soon" },
        { key: "stitch_pain",    label: "Pain at my stitches or scar", level: "soon" },
        { key: "breast_pain",    label: "Painful or hard breasts", level: "soon" },
        { key: "low_mood",       label: "Feeling low or tearful", level: "soon" },
        { key: "feeding_trouble",label: "Trouble feeding my baby", level: "soon" },
        { key: "poor_sleep",     label: "Not getting any sleep" }
      ],
      done: [
        { key: "postnatal_visit",label: "Had my post-birth check-up" },
        { key: "help_at_home",   label: "I have help at home" },
        { key: "resting",        label: "Getting some rest" },
        { key: "baby_checkup",   label: "Baby's check-ups are on track" }
      ]
    },
    periods_other: {
      noticing: [
        { key: "feeling_well",      label: "I feel well. This is a routine check" },
        { key: "regular_periods",   label: "My periods are regular" },
        { key: "irregular_periods", label: "Irregular periods" },
        { key: "painful_periods",   label: "Painful periods", level: "soon" },
        { key: "heavy_periods",     label: "Very heavy periods", level: "soon" },
        { key: "spotting_between",  label: "Bleeding between periods", level: "soon" },
        { key: "discharge_change",  label: "A change in discharge", level: "soon" },
        { key: "pelvic_pain",       label: "Ongoing pelvic pain", level: "soon" },
        { key: "hot_flushes",       label: "Hot flushes or night sweats" },
        { key: "weight_skin",       label: "Weight or skin changes" }
      ],
      done: [
        { key: "ultrasound_done", label: "Had an ultrasound" },
        { key: "blood_tests",     label: "Had blood tests" },
        { key: "pap_screen",      label: "Had a cervical screening test" },
        { key: "spoke_doctor",    label: "Already spoken to a doctor about it" }
      ]
    }
  };

  /* Two extra single-choice questions asked at the end of the tick-list. */
  const mood = [
    { key: "mood_good",          label: "Doing well" },
    { key: "mood_bit_worried",   label: "A little worried" },
    { key: "mood_quite_worried", label: "Quite worried", level: "soon" }
  ];
  const lastVisit = [
    { key: "visit_recent", label: "In the last month" },
    { key: "visit_1_3m",   label: "1 to 3 months ago" },
    { key: "visit_older",  label: "More than 3 months ago" },
    { key: "visit_none",   label: "Not yet" }
  ];

  const windows = [
    { key: "5-6pm", label: "5 to 6 PM" },
    { key: "6-7pm", label: "6 to 7 PM" },
    { key: "7-8pm", label: "7 to 8 PM" },
    { key: "any",   label: "Anytime 5 to 8 PM" }
  ];

  /* How often a general check-in is usually a good idea (a usual pattern, not a rule). */
  const intervals = {
    planning:      "A check-up before you start trying is a good idea, and then whenever something changes. If it has been a while without luck, it is worth a conversation.",
    trimester1:    "A first antenatal visit once the pregnancy is confirmed, and then usually about once a month.",
    trimester2:    "Usually about once a month, with an anomaly scan around the middle of this stage.",
    trimester3:    "Usually every two weeks from about 28 weeks, and weekly in the last month. Your doctor will set the exact pattern for you.",
    after_birth:   "A check-up for you and your baby in the first week or so, and again at around six weeks.",
    periods_other: "A general women's health check-up about once a year, and sooner if your cycle changes for two to three months in a row."
  };

  /* Result rules (fixed rules, not AI). */
  function result(dangerFlags, symptomKeys, stage){
    if(dangerFlags.length) return "urgent";
    const l = lists[stage] || { noticing: [] };
    const items = l.noticing.filter((i) => symptomKeys.includes(i.key));
    if(items.some((i) => i.level === "urgent")) return "urgent";
    if(symptomKeys.includes("mood_quite_worried")) return "talk_soon";
    const problems = items.filter((i) => i.level === "soon").length;
    const ordinary = items.filter((i) => i.key !== "feeling_well" && !i.level && i.key !== "feel_movement" && i.key !== "regular_periods" && i.key !== "energy_better").length;
    if(problems > 0 || problems + ordinary >= 5) return "talk_soon";
    return "common";
  }

  /* key -> label for the admin portal */
  const labels = { all_normal: "Nothing urgent, just checking in" };
  stages.forEach((s) => { labels[s.key] = s.label; });
  danger.forEach((d) => { labels[d.key] = d.label; });
  Object.values(lists).forEach((l) => l.noticing.concat(l.done).forEach((i) => { labels[i.key] = i.label; }));
  mood.concat(lastVisit).forEach((i) => { labels[i.key] = i.label; });

  return { stages, danger, lists, mood, lastVisit, windows, intervals, result, labels };
})();
