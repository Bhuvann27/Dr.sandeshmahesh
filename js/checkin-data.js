/* Gentle check-in — questions, wording and rules (DEMO VERSION).
   Every item below is a placeholder for Dr. Sandesh to review and correct.
   Keys are stored in the database; labels are what people see. Levels:
   "urgent"  = shown the "please don't wait" message,
   "soon"    = worth a conversation with the doctor. */
window.CHECKIN_DATA = (function(){
  const stages = [
    { key: "planning",     label: "Planning a baby" },
    { key: "trimester1",   label: "Pregnant, first trimester", hint: "up to about 12 weeks" },
    { key: "trimester2",   label: "Pregnant, second trimester", hint: "about 13 to 27 weeks" },
    { key: "trimester3",   label: "Pregnant, third trimester", hint: "about 28 weeks onwards" },
    { key: "after_birth",  label: "Recently had a baby" },
    { key: "periods_other",label: "Periods or other concerns" }
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
        { key: "spoke_doctor",    label: "Already spoken to a doctor about it" }
      ]
    },
    trimester1: {
      noticing: [
        { key: "nausea",          label: "Nausea or morning sickness" },
        { key: "tired",           label: "Feeling very tired" },
        { key: "mild_cramps",     label: "Mild cramps" },
        { key: "light_spotting",  label: "Light spotting", level: "soon" },
        { key: "cant_keep_food",  label: "Cannot keep food or water down", level: "soon" },
        { key: "breast_tender",   label: "Breast tenderness" },
        { key: "mood_swings",     label: "Mood swings" },
        { key: "headaches",       label: "Headaches" }
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
        { key: "back_ache",      label: "Back ache" },
        { key: "leg_cramps",     label: "Leg cramps" },
        { key: "swollen_feet",   label: "Swollen feet" },
        { key: "heartburn",      label: "Heartburn or indigestion" },
        { key: "feel_movement",  label: "I can feel my baby moving" },
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
        { key: "resting",        label: "Getting some rest" }
      ]
    },
    periods_other: {
      noticing: [
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
        { key: "spoke_doctor",    label: "Already spoken to a doctor about it" }
      ]
    }
  };

  const windows = [
    { key: "5-6pm", label: "5 to 6 PM" },
    { key: "6-7pm", label: "6 to 7 PM" },
    { key: "7-8pm", label: "7 to 8 PM" },
    { key: "any",   label: "Anytime 5 to 8 PM" }
  ];

  /* Result rules (fixed rules, not AI). */
  function result(dangerFlags, symptomKeys, stage){
    if(dangerFlags.length) return "urgent";
    const items = (lists[stage] || { noticing: [] }).noticing.filter((i) => symptomKeys.includes(i.key));
    if(items.some((i) => i.level === "urgent")) return "urgent";
    if(items.some((i) => i.level === "soon") || items.length >= 4) return "talk_soon";
    return "common";
  }

  /* key -> label for the admin portal */
  const labels = {};
  stages.forEach((s) => { labels[s.key] = s.label; });
  danger.forEach((d) => { labels[d.key] = d.label; });
  Object.values(lists).forEach((l) => l.noticing.concat(l.done).forEach((i) => { labels[i.key] = i.label; }));

  return { stages, danger, lists, windows, result, labels };
})();
