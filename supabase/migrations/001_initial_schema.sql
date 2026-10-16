-- Run in Supabase SQL Editor (or link via Supabase GitHub integration)

create extension if not exists "pgcrypto";

do $$ begin
  create type submission_type as enum ('gate_pass', 'ptw_standard', 'ptw_emergency');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type submission_status as enum (
    'pending', 'approved', 'approved_with_conditions', 'rejected',
    'active', 'closed', 'suspended', 'cancelled', 'expired'
  );
exception when duplicate_object then null;
end $$;

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  gate_pass_recipients text default '',
  ptw_standard_recipients text default '',
  ptw_emergency_recipients text default '',
  admin_name text default 'EHS Officer',
  admin_signature_url text,
  weekend_days int[] default '{6,0}',
  holidays jsonb default '[]'::jsonb,
  max_permit_days int default 7,
  emergency_max_hours int default 12,
  buildings jsonb default '["Building 1","Building 2","Building 3","Building 4","Building 5","Building 6","Building 7","Building 8","Building 9","Building 10","Building 11","Building 12","Building 13","Building 14","Building 15","Outdoor / external area"]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into settings (admin_name)
select 'EHS Officer'
where not exists (select 1 from settings);

create table if not exists counters (
  type submission_type not null,
  year int not null,
  last_value int not null default 0,
  primary key (type, year)
);

create or replace function next_ref_no(p_type submission_type)
returns text language plpgsql as $$
declare
  y int := extract(year from (now() at time zone 'Asia/Dubai'))::int;
  n int;
  prefix text;
begin
  insert into counters (type, year, last_value) values (p_type, y, 1)
  on conflict (type, year) do update set last_value = counters.last_value + 1
  returning last_value into n;
  prefix := case p_type when 'gate_pass' then 'GP' when 'ptw_standard' then 'PTW' else 'EPTW' end;
  return prefix || '-' || y::text || '-' || lpad(n::text, 4, '0');
end;
$$;

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  type submission_type not null,
  ref_no text not null unique,
  status submission_status not null default 'pending',
  company_name text,
  contact_email text,
  building text,
  start_at timestamptz,
  end_at timestamptz,
  max_workers int,
  linked_ref_no text,
  data jsonb not null default '{}'::jsonb,
  signature_url text,
  pdf_url text,
  approved_pdf_url text,
  verify_token text unique,
  decision_note text,
  approved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists submissions_type_status_idx on submissions (type, status);

create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions (id) on delete cascade,
  full_name text not null,
  trade text not null,
  emirates_id text not null,
  eid_expiry date not null,
  mobile text not null,
  induction_done boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions (id) on delete cascade,
  vehicle_type text, plate_no text, emirate text,
  driver_name text, license_no text, license_expiry date,
  created_at timestamptz not null default now()
);

create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions (id) on delete cascade,
  description text, quantity text, serial_id text,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions (id) on delete cascade,
  doc_type text not null,
  file_url text not null,
  file_name text,
  created_at timestamptz not null default now()
);

create table if not exists revalidations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions (id) on delete cascade,
  date date not null,
  workers_on_site int,
  remarks text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists gate_logs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions (id) on delete cascade,
  date date not null,
  time_in time, workers_in int,
  time_out time, workers_out int,
  guard_name text,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions (id) on delete set null,
  action text not null,
  note text,
  actor text,
  created_at timestamptz not null default now()
);

alter table submissions enable row level security;
alter table workers enable row level security;
alter table settings enable row level security;
