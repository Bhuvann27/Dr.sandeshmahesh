window.SUPABASE_CONFIG = {
  url: "https://fihukvazoelknudqfnvc.supabase.co",
  anonKey: "sb_publishable_mXfhHBX-QzH8w-tAyPQP2g_R7qMQRyp",
  doctorSlug: "sandesh-mahesh",
  doctorId: "22222222-2222-4222-8222-222222222222"
};
window.isSupabaseConfigured = function(){
  const c = window.SUPABASE_CONFIG || {};
  return !!(c.url && c.anonKey && c.doctorSlug && c.doctorId && !c.anonKey.startsWith('YOUR_'));
};
