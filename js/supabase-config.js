window.SUPABASE_CONFIG = {
  url: "YOUR_SANDESH_SUPABASE_URL",
  anonKey: "YOUR_SANDESH_SUPABASE_PUBLISHABLE_KEY"
};
window.isSupabaseConfigured = function(){
  const c = window.SUPABASE_CONFIG || {};
  return !!(c.url && c.anonKey && !c.url.startsWith('YOUR_') && !c.anonKey.startsWith('YOUR_'));
};
