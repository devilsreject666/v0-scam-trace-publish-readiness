-- ScamTrace Additional Tables: Scam Reports, Address Risk Cache, Evidence Files
-- Run AFTER 001_create_tables.sql

-- =============================================
-- SCAM REPORTS (user-submitted scam reports)
-- =============================================
create table if not exists public.scam_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  scam_type text not null,
  url text,
  domain text,
  description text not null,
  timeline text,
  loss_amount numeric default 0,
  loss_currency text default 'USD',
  wallet_addresses text[] default '{}',
  phone_numbers text[] default '{}',
  emails text[] default '{}',
  usernames text[] default '{}',
  ip_addresses text[] default '{}',
  platform text,
  country text,
  status text default 'pending' check (status in ('pending', 'verified', 'dismissed', 'investigating')),
  severity text default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  case_id uuid references public.cases(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.scam_reports enable row level security;

-- Authenticated users can insert reports
create policy "scam_reports_insert_auth" on public.scam_reports
  for insert with check (auth.uid() is not null);

-- Users can see their own reports
create policy "scam_reports_select_own" on public.scam_reports
  for select using (auth.uid() = user_id);

-- Also allow anon inserts for public reporting
create policy "scam_reports_insert_anon" on public.scam_reports
  for insert with check (true);

-- Allow service role to read all (for aggregation APIs)
-- Note: service_role bypasses RLS by default, so stats API will use service role

-- Indexes for fast aggregation queries
create index if not exists idx_scam_reports_scam_type on public.scam_reports(scam_type);
create index if not exists idx_scam_reports_domain on public.scam_reports(domain);
create index if not exists idx_scam_reports_created_at on public.scam_reports(created_at);
create index if not exists idx_scam_reports_status on public.scam_reports(status);
create index if not exists idx_scam_reports_wallet_addresses on public.scam_reports using gin(wallet_addresses);
create index if not exists idx_scam_reports_phone_numbers on public.scam_reports using gin(phone_numbers);
create index if not exists idx_scam_reports_ip_addresses on public.scam_reports using gin(ip_addresses);

-- =============================================
-- ADDRESS RISK CACHE (blockchain lookups cache)
-- =============================================
create table if not exists public.address_risk_cache (
  address text primary key,
  chain text not null default 'ETH',
  risk_score integer default 0,
  flags text[] default '{}',
  labels text[] default '{}',
  first_seen timestamptz,
  last_seen timestamptz,
  tx_count integer default 0,
  total_received numeric default 0,
  total_sent numeric default 0,
  balance numeric default 0,
  connected_addresses text[] default '{}',
  exchange_interactions text[] default '{}',
  mixer_interactions text[] default '{}',
  trace_data jsonb default '{}',
  our_reports_count integer default 0,
  fetched_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '1 hour')
);

-- No RLS needed - this is a server-side cache table
-- Service role only access

-- =============================================
-- SCAM REPORT FILES (evidence uploads for reports)
-- =============================================
create table if not exists public.scam_report_files (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.scam_reports(id) on delete cascade,
  file_name text not null,
  file_type text,
  file_size integer,
  storage_path text not null,
  created_at timestamptz default now()
);

alter table public.scam_report_files enable row level security;

create policy "report_files_insert_auth" on public.scam_report_files
  for insert with check (true);

create policy "report_files_select_own" on public.scam_report_files
  for select using (
    exists (
      select 1 from public.scam_reports sr
      where sr.id = report_id and sr.user_id = auth.uid()
    )
  );

-- =============================================
-- BROWSER ANALYSIS CACHE (No-Trace Browser results)
-- =============================================
create table if not exists public.browser_analysis_cache (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  domain text,
  title text,
  scripts_found integer default 0,
  links_found integer default 0,
  risk_score integer default 0,
  flags text[] default '{}',
  malware_detected boolean default false,
  analysis_data jsonb default '{}',
  fetched_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 minutes')
);

create index if not exists idx_browser_cache_url on public.browser_analysis_cache(url);
create index if not exists idx_browser_cache_domain on public.browser_analysis_cache(domain);

-- =============================================
-- Seed some known scammer addresses for risk detection
-- =============================================
create table if not exists public.known_addresses (
  address text primary key,
  chain text not null default 'ETH',
  label text not null,
  category text not null check (category in ('mixer', 'bridge', 'exchange', 'scammer', 'sanctioned', 'drainer')),
  source text,
  added_at timestamptz default now()
);

-- Insert well-known mixer/bridge/exchange deposit addresses
insert into public.known_addresses (address, chain, label, category, source) values
  -- Tornado Cash contracts (ETH)
  ('0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', 'ETH', 'Tornado Cash 0.1 ETH', 'mixer', 'OFAC'),
  ('0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', 'ETH', 'Tornado Cash 1 ETH', 'mixer', 'OFAC'),
  ('0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936', 'ETH', 'Tornado Cash 10 ETH', 'mixer', 'OFAC'),
  ('0xa160cdab225685da1d56aa342ad8841c3b53f291', 'ETH', 'Tornado Cash 100 ETH', 'mixer', 'OFAC'),
  -- Known exchange hot wallets
  ('0x28c6c06298d514db089934071355e5743bf21d60', 'ETH', 'Binance Hot Wallet', 'exchange', 'public'),
  ('0x21a31ee1afc51d94c2efccaa2092ad1028285549', 'ETH', 'Binance Hot Wallet 2', 'exchange', 'public'),
  ('0xdfd5293d8e347dfe59e90efd55b2956a1343963d', 'ETH', 'Coinbase Hot Wallet', 'exchange', 'public'),
  ('0xa090e606e30bd747d4e6245a1517ebe430f0057e', 'ETH', 'Coinbase Commerce', 'exchange', 'public'),
  ('0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4', 'ETH', 'Kraken Hot Wallet', 'exchange', 'public'),
  -- Known bridge contracts
  ('0x3ee18b2214aff97000d974cf647e7c347e8fa585', 'ETH', 'Wormhole Bridge', 'bridge', 'public'),
  ('0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf', 'ETH', 'Polygon Bridge', 'bridge', 'public'),
  ('0x99c9fc46f92e8a1c0dec1b1747d010903e884be1', 'ETH', 'Optimism Bridge', 'bridge', 'public')
on conflict (address) do nothing;
