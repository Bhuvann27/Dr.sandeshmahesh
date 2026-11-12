-- Applied to the "Doctor-websites" Supabase project on 2026-11-02 (Dr. Sandesh only: doctor_id 2222...).
-- 1) Consultation hours: Monday-Saturday 5 PM - 8 PM, Sunday closed.
update public.availability_weekly set start_time='17:00', end_time='20:00'
 where doctor_id='22222222-2222-4222-8222-222222222222' and day_of_week between 1 and 6;
update public.availability_weekly set is_open=false
 where doctor_id='22222222-2222-4222-8222-222222222222' and day_of_week=0;

-- 2) Gentle check-in (demo): table, RLS, and the two public functions.
create table if not exists public.checkin_leads (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null check (char_length(first_name) between 1 and 60),
  phone text not null check (phone ~ '^[0-9+ ()-]{7,20}$'),
  call_window text not null default 'any' check (call_window in ('5-6pm','6-7pm','7-8pm','any')),
  consent boolean not null default false check (consent = true),
  stage text not null check (stage in ('planning','trimester1','trimester2','trimester3','after_birth','periods_other')),
  danger_flags text[] not null default '{}',
  symptoms text[] not null default '{}',
  done_so_far text[] not null default '{}',
  result_level text check (result_level in ('urgent','talk_soon','common')),
  completed boolean not null default false,
  secret uuid not null default gen_random_uuid(),
  status text not null default 'new' check (status in ('new','called','booked','not_interested')),
  staff_note text check (staff_note is null or char_length(staff_note) <= 500)
);
create index if not exists checkin_leads_doctor_created_idx on public.checkin_leads (doctor_id, created_at desc);
create index if not exists checkin_leads_phone_idx on public.checkin_leads (doctor_id, phone, created_at desc);
alter table public.checkin_leads enable row level security;
create policy checkin_leads_admin_manage_assigned on public.checkin_leads for all to authenticated
  using ((select private.is_doctor_admin(checkin_leads.doctor_id)))
  with check ((select private.is_doctor_admin(checkin_leads.doctor_id)));
-- Functions public.checkin_start(...) and public.checkin_complete(...) are SECURITY DEFINER with
-- search_path='' and EXECUTE granted to anon/authenticated only; see the live project for their bodies.

-- 3) 2026-11-02: free-text note. checkin_complete now takes an optional p_note (max 500 chars).
alter table public.checkin_leads add column if not exists other_note text check (other_note is null or char_length(other_note) <= 500);
-- (old checkin_complete(uuid,uuid,text[],text[],text) was dropped and replaced by the 6-argument version in the live project)

-- 4) 2026-11-08: check-in v2. Structured answers (jsonb), two new paths (menopause, general).
alter table public.checkin_leads add column if not exists answers jsonb;
alter table public.checkin_leads add constraint checkin_leads_answers_size check (answers is null or pg_column_size(answers) <= 12000);
alter table public.checkin_leads drop constraint if exists checkin_leads_stage_check;
alter table public.checkin_leads add constraint checkin_leads_stage_check
  check (stage = any (array['planning','trimester1','trimester2','trimester3','after_birth','periods_other','menopause','general']));
-- checkin_complete now has the signature (uuid, uuid, text[], text[], text, text, jsonb); the previous overload was dropped.

-- 5) 2026-11-10: booking functions must also work for a browser that is signed in to the admin portal.
grant execute on function public.get_available_consultation_slots(date, text) to authenticated;
grant execute on function public.request_appointment(text, text, text, text, date, time) to authenticated;

-- 6. 2026-11-11: the three conversations were saved as normal (non-demo) rows with final slugs:
--    irregular-periods-and-pcos-worries, first-pregnancy-and-antenatal-care, menopause-symptoms.
