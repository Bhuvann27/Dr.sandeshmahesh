/* =========================================================
   Patient Insights — public, read-only data access for Dr. Sandesh.
   Reads only published rows that belong to this doctor (doctor_id).
   Fails soft: if the backend is unreachable the page still renders.
   ========================================================= */
window.PatientInsightsDB = (function(){
  "use strict";

  let client = null;
  function getClient(){
    if(client) return client;
    if(!window.isSupabaseConfigured || !window.isSupabaseConfigured()) return null;
    if(!window.supabase || !window.supabase.createClient) return null;
    client = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
    return client;
  }

  function toStoryShape(row){
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      intro: row.intro,
      topic: row.topic || "",
      dialogue: row.dialogue || [],
      relateIntro: row.relate_intro,
      relatePoints: row.relate_points || [],
      relateClose: row.relate_close,
      actionPoints: row.action_points || [],
      urgent: row.urgent,
      isDemo: !!row.is_demo,
      status: row.status,
      publishedAt: row.published_at,
    };
  }

  const PREFERRED_ORDER = [
    "demo-1-pcos-and-irregular-periods",
    "demo-2-first-pregnancy-antenatal-care",
    "demo-3-menopause-symptoms",
  ];

  async function fetchPublished(){
    const c = getClient();
    if(!c) return [];
    try{
      const cfg = window.SUPABASE_CONFIG;
      const { data, error } = await c
        .from("patient_insights")
        .select("*")
        .eq("doctor_id", cfg.doctorId)
        .eq("status", "published")
        .order("published_at", { ascending: true });
      if(error || !data) return [];
      return data.map(toStoryShape).sort((a,b) => {
        const ai = PREFERRED_ORDER.indexOf(a.slug), bi = PREFERRED_ORDER.indexOf(b.slug);
        if(ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        return String(a.publishedAt || "").localeCompare(String(b.publishedAt || ""));
      });
    }catch(e){ return []; }
  }

  return { fetchPublished };
})();
