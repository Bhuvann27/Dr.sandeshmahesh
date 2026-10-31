create extension if not exists pgcrypto;

create table if not exists patient_insights (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null default '',
  subtitle text not null default '',
  intro text not null default '',
  topic text not null default '',
  dialogue jsonb not null default '[]'::jsonb,
  relate_intro text not null default '',
  relate_points jsonb not null default '[]'::jsonb,
  relate_close text not null default '',
  action_points jsonb not null default '[]'::jsonb,
  urgent text not null default '',
  urgent_reviewed boolean not null default false,
  consent_confirmed boolean not null default false,
  anonymous_confirmed boolean not null default false,
  identifiers_removed boolean not null default false,
  privacy_reviewed boolean not null default false,
  no_identifying_details boolean not null default false,
  medical_reviewed boolean not null default false,
  final_reviewed boolean not null default false,
  final_reviewed_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create or replace function patient_insights_set_timestamps() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status = 'published' and old.status <> 'published' then new.published_at = coalesce(old.published_at, now()); end if;
  if new.final_reviewed = true and old.final_reviewed = false then new.final_reviewed_at = now(); end if;
  return new;
end; $$;

drop trigger if exists trg_patient_insights_timestamps on patient_insights;
create trigger trg_patient_insights_timestamps before update on patient_insights for each row execute function patient_insights_set_timestamps();

create table if not exists availability_weekly (
  day_of_week int primary key check (day_of_week between 0 and 6),
  is_open boolean not null default false,
  start_time time not null default '15:00',
  end_time time not null default '20:00',
  updated_at timestamptz not null default now()
);

insert into availability_weekly(day_of_week,is_open,start_time,end_time) values
(0,false,'15:00','20:00'),(1,true,'15:00','20:00'),(2,true,'15:00','20:00'),(3,true,'15:00','20:00'),(4,true,'15:00','20:00'),(5,true,'15:00','20:00'),(6,true,'15:00','20:00')
on conflict(day_of_week) do nothing;

create table if not exists availability_blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  start_time time,
  end_time time,
  reason text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_availability_blocks_date on availability_blocks(block_date);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  patient_phone text not null,
  patient_email text,
  appointment_date date not null,
  start_time time not null,
  duration_minutes int not null default 15,
  fee_inr int,
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  payment_status text not null default 'not_required' check (payment_status in ('not_required','pending','paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uq_appointments_slot on appointments(appointment_date,start_time) where status <> 'cancelled';

create or replace function appointments_set_updated_at() returns trigger language plpgsql set search_path=public as $$
begin new.updated_at=now(); return new; end; $$;
drop trigger if exists trg_appointments_updated_at on appointments;
create trigger trg_appointments_updated_at before update on appointments for each row execute function appointments_set_updated_at();

create table if not exists youtube_videos (
  id uuid primary key default gen_random_uuid(),
  video_id text unique not null,
  title text not null default '',
  description text not null default '',
  featured boolean not null default true,
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_youtube_videos_public on youtube_videos(status,featured,sort_order);

alter table patient_insights enable row level security;
alter table availability_weekly enable row level security;
alter table availability_blocks enable row level security;
alter table appointments enable row level security;
alter table youtube_videos enable row level security;

drop policy if exists "public read published stories" on patient_insights;
create policy "public read published stories" on patient_insights for select to anon,authenticated using(status='published');
drop policy if exists "authenticated manage stories" on patient_insights;
create policy "authenticated manage stories" on patient_insights for all to authenticated using(auth.role()='authenticated') with check(auth.role()='authenticated');

drop policy if exists "public read weekly availability" on availability_weekly;
create policy "public read weekly availability" on availability_weekly for select to anon,authenticated using(true);
drop policy if exists "authenticated manage weekly availability" on availability_weekly;
create policy "authenticated manage weekly availability" on availability_weekly for all to authenticated using(auth.role()='authenticated') with check(auth.role()='authenticated');

drop policy if exists "public read availability blocks" on availability_blocks;
create policy "public read availability blocks" on availability_blocks for select to anon,authenticated using(true);
drop policy if exists "authenticated manage availability blocks" on availability_blocks;
create policy "authenticated manage availability blocks" on availability_blocks for all to authenticated using(auth.role()='authenticated') with check(auth.role()='authenticated');

drop policy if exists "anyone can request appointment" on appointments;
create policy "anyone can request appointment" on appointments for insert to anon,authenticated with check(true);
drop policy if exists "authenticated manage appointments" on appointments;
create policy "authenticated manage appointments" on appointments for all to authenticated using(auth.role()='authenticated') with check(auth.role()='authenticated');

drop policy if exists "public read published videos" on youtube_videos;
create policy "public read published videos" on youtube_videos for select to anon,authenticated using(status='published');
drop policy if exists "authenticated manage videos" on youtube_videos;
create policy "authenticated manage videos" on youtube_videos for all to authenticated using(auth.role()='authenticated') with check(auth.role()='authenticated');

create or replace view taken_slots as select appointment_date,start_time from appointments where status <> 'cancelled';
alter view taken_slots set (security_invoker=true);
grant select on taken_slots to anon,authenticated;
