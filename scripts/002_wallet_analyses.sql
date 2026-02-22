-- ScamTrace - Wallet Analyses & Usage Tracking Tables
-- Run AFTER 001_create_tables.sql

-- =============================================
-- WALLET ANALYSES (stores forensic analysis results)
-- =============================================
create table if not exists public.wallet_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  input_address text not null,
  chain text not null,
  date_from timestamptz,
  date_to timestamptz,
  graph_data jsonb not null default '{}',
  metrics jsonb not null default '{}',
  scam_correlation jsonb not null default '{}',
  risk_grade text check (risk_grade in ('low', 'moderate', 'high', 'critical')),
  total_value_moved numeric default 0,
  total_wallets integer default 0,
  created_at timestamptz default now()
);

alter table public.wallet_analyses enable row level security;

create policy "wallet_analyses_select_own"
  on public.wallet_analyses for select
  using (auth.uid() = user_id);

create policy "wallet_analyses_insert_own"
  on public.wallet_analyses for insert
  with check (auth.uid() = user_id);

create policy "wallet_analyses_update_own"
  on public.wallet_analyses for update
  using (auth.uid() = user_id);

create policy "wallet_analyses_delete_own"
  on public.wallet_analyses for delete
  using (auth.uid() = user_id);

-- =============================================
-- USAGE TRACKING (daily feature usage per user for plan limits)
-- =============================================
create table if not exists public.usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  count integer default 0,
  period_start date not null default current_date,
  unique(user_id, feature, period_start)
);

alter table public.usage_tracking enable row level security;

create policy "usage_tracking_select_own"
  on public.usage_tracking for select
  using (auth.uid() = user_id);

create policy "usage_tracking_insert_own"
  on public.usage_tracking for insert
  with check (auth.uid() = user_id);

create policy "usage_tracking_update_own"
  on public.usage_tracking for update
  using (auth.uid() = user_id);
