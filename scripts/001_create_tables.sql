-- ScamTrace Database Schema
-- Cases, Evidence, Timeline Events, Narratives, Reports, Demo Requests

-- =============================================
-- PROFILES (auto-created on signup via trigger)
-- =============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  organization text,
  role text default 'user',
  plan text default 'free',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =============================================
-- CASES
-- =============================================
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  scam_type text,
  total_loss numeric,
  currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cases enable row level security;
create policy "cases_select_own" on public.cases for select using (auth.uid() = user_id);
create policy "cases_insert_own" on public.cases for insert with check (auth.uid() = user_id);
create policy "cases_update_own" on public.cases for update using (auth.uid() = user_id);
create policy "cases_delete_own" on public.cases for delete using (auth.uid() = user_id);

-- =============================================
-- EVIDENCE
-- =============================================
create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('transaction', 'wallet', 'screenshot', 'chat_log', 'domain', 'phone', 'note', 'other')),
  label text not null,
  value text,
  metadata jsonb default '{}',
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table public.evidence enable row level security;
create policy "evidence_select_own" on public.evidence for select using (auth.uid() = user_id);
create policy "evidence_insert_own" on public.evidence for insert with check (auth.uid() = user_id);
create policy "evidence_update_own" on public.evidence for update using (auth.uid() = user_id);
create policy "evidence_delete_own" on public.evidence for delete using (auth.uid() = user_id);

-- =============================================
-- TIMELINE EVENTS
-- =============================================
create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  evidence_id uuid references public.evidence(id) on delete set null,
  label text not null,
  description text,
  event_time timestamptz not null default now(),
  event_type text default 'general',
  created_at timestamptz default now()
);

alter table public.timeline_events enable row level security;
create policy "timeline_select_own" on public.timeline_events for select using (auth.uid() = user_id);
create policy "timeline_insert_own" on public.timeline_events for insert with check (auth.uid() = user_id);
create policy "timeline_update_own" on public.timeline_events for update using (auth.uid() = user_id);
create policy "timeline_delete_own" on public.timeline_events for delete using (auth.uid() = user_id);

-- =============================================
-- NARRATIVES
-- =============================================
create table if not exists public.narratives (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  generated_at timestamptz default now()
);

alter table public.narratives enable row level security;
create policy "narratives_select_own" on public.narratives for select using (auth.uid() = user_id);
create policy "narratives_insert_own" on public.narratives for insert with check (auth.uid() = user_id);
create policy "narratives_update_own" on public.narratives for update using (auth.uid() = user_id);
create policy "narratives_delete_own" on public.narratives for delete using (auth.uid() = user_id);

-- =============================================
-- REPORTS
-- =============================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  format text not null check (format in ('pdf', 'csv')),
  filename text not null,
  created_at timestamptz default now()
);

alter table public.reports enable row level security;
create policy "reports_select_own" on public.reports for select using (auth.uid() = user_id);
create policy "reports_insert_own" on public.reports for insert with check (auth.uid() = user_id);

-- =============================================
-- DEMO REQUESTS (public insert, only admins read)
-- =============================================
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organization text,
  use_case text,
  created_at timestamptz default now()
);

alter table public.demo_requests enable row level security;
-- Anyone can insert a demo request (no auth required)
create policy "demo_requests_insert_anon" on public.demo_requests for insert with check (true);
