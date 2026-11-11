/* Public (visitor) Supabase client.
   The website is public, so it must always talk to the database as an anonymous visitor.
   Without this, a browser that is also signed in to the admin portal (same site address)
   would send the admin's session instead, and the booking functions would answer 403
   ("We couldn't load the available times"). This client never reads or stores a session. */
window.getPublicSupabase = function(){
  if(window.__publicSb) return window.__publicSb;
  if(!window.supabase || !window.isSupabaseConfigured || !window.isSupabaseConfigured()) return null;
  const c = window.SUPABASE_CONFIG;
  window.__publicSb = window.supabase.createClient(c.url, c.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "sandesh-public-visitor" }
  });
  return window.__publicSb;
};
