/* =========================================================
   Consultation booking — data access for Dr. Sandesh Mahesh.
   Same public interface the booking widget (booking-widget.js)
   already expects, but talking to this site's own backend contract:
   Supabase RPCs scoped by doctor slug (see supabase/schema.sql).
   Nothing here touches any other doctor's data.
   ========================================================= */
window.BookingDB = (function(){
  "use strict";

  const SLOT_MINUTES = 15;
  const FEE_INR = 500;

  let client = null;
  function getClient(){
    if(client) return client;
    if(!window.isSupabaseConfigured || !window.isSupabaseConfigured()) return null;
    if(!window.supabase || !window.supabase.createClient) return null;
    client = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
    return client;
  }

  function toMinutes(hhmm){ const [h,m] = hhmm.split(":").map(Number); return h*60+m; }

  // All booking-date comparisons use India Standard Time.
  function indiaNowParts(){
    const parts = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
    return Object.fromEntries(parts.filter(p=>p.type!=="literal").map(p=>[p.type,p.value]));
  }
  function indiaTodayISO(){ const p = indiaNowParts(); return `${p.year}-${p.month}-${p.day}`; }
  function isBookingDateInWindow(dateISO){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return false;
    const today = indiaTodayISO();
    const limit = new Date(today + "T00:00:00Z");
    limit.setUTCDate(limit.getUTCDate() + 90);
    return dateISO >= today && new Date(dateISO + "T00:00:00Z") <= limit;
  }

  // Returns an array of "HH:MM" strings the patient can pick for dateISO.
  // Availability is calculated server-side; today's already-passed times are
  // filtered out here using IST.
  async function getAvailableSlots(dateISO){
    if(!isBookingDateInWindow(dateISO)) return [];
    const c = getClient();
    if(!c) throw new Error("Booking is not connected.");

    const { data, error } = await c.rpc("get_available_consultation_slots", {
      p_date: dateISO,
      p_doctor_slug: window.SUPABASE_CONFIG.doctorSlug,
    });
    if(error) throw error;

    const slots = (data || []).map((row) => String(row.start_time).slice(0,5));
    const now = indiaNowParts();
    if(indiaTodayISO() !== dateISO) return slots;
    const nowMins = Number(now.hour) * 60 + Number(now.minute);
    return slots.filter((hhmm) => toMinutes(hhmm) > nowMins);
  }

  // Throws { slotTaken: true } if the slot was taken between loading and submitting.
  async function requestAppointment({ name, phone, email, dateISO, startTime }){
    const c = getClient();
    if(!c) throw new Error("Booking is not connected.");
    if(!isBookingDateInWindow(dateISO)){
      throw Object.assign(new Error("Booking date is outside the allowed window."), { invalidDate: true });
    }
    const currentSlots = await getAvailableSlots(dateISO);
    if(!currentSlots.includes(startTime)){
      throw Object.assign(new Error("That slot is no longer available."), { slotTaken: true });
    }
    const { error } = await c.rpc("request_appointment", {
      p_doctor_slug: window.SUPABASE_CONFIG.doctorSlug,
      p_patient_name: name,
      p_patient_phone: phone,
      p_patient_email: email || null,
      p_appointment_date: dateISO,
      p_start_time: startTime,
    });
    if(error){
      if(error.code === "23505" || /just taken/i.test(error.message || "")){
        throw Object.assign(new Error("That slot was just taken."), { slotTaken: true });
      }
      throw error;
    }
    return { patient_name: name, appointment_date: dateISO, start_time: startTime };
  }

  return { FEE_INR, SLOT_MINUTES, getAvailableSlots, requestAppointment };
})();
