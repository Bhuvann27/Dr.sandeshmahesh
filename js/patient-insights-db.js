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
    if(window.getPublicSupabase){ client = window.getPublicSupabase(); return client; }
    if(!window.isSupabaseConfigured || !window.isSupabaseConfigured()) return null;
    if(!window.supabase || !window.supabase.createClient) return null;
    client = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
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

  const demoBySlug = () => {
    const m = {};
    (window.SANDESH_DEMO_STORIES || []).forEach((d) => { m[d.slug] = d; });
    return m;
  };
  const sortStories = (list) => list.sort((a,b) => {
    const ai = PREFERRED_ORDER.indexOf(a.slug), bi = PREFERRED_ORDER.indexOf(b.slug);
    if(ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return String(a.publishedAt || "").localeCompare(String(b.publishedAt || ""));
  });

  async function fetchPublished(){
    const c = getClient();
    if(!c) return sortStories((window.SANDESH_DEMO_STORIES || []).slice());
    try{
      const cfg = window.SUPABASE_CONFIG;
      const { data, error } = await c
        .from("patient_insights")
        .select("*")
        .eq("doctor_id", cfg.doctorId)
        .eq("status", "published")
        .order("published_at", { ascending: true });
      if(error || !data) return sortStories((window.SANDESH_DEMO_STORIES || []).slice());
      const demos = demoBySlug();
      /* Demo rows get the short fictional content above; real stories pass through untouched. */
      const demoList = window.SANDESH_DEMO_STORIES || [];
      let nextDemo = 0;
      return sortStories(data.map(toStoryShape).map((row) => {
        if(!row.isDemo) return row;
        /* match by slug; if a demo row has a different slug, fall back to position, keeping the row's own slug */
        const src = demos[row.slug] || demoList[nextDemo];
        nextDemo += 1;
        return src ? Object.assign({}, row, src, { id: row.id, slug: row.slug }) : row;
      }));
    }catch(e){ return sortStories((window.SANDESH_DEMO_STORIES || []).slice()); }
  }

  return { fetchPublished };
})();
