-- Wallet Scans table for tracking blockchain lookups per user
CREATE TABLE IF NOT EXISTS public.wallet_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  chain TEXT NOT NULL CHECK (chain IN ('eth', 'btc')),
  scan_type TEXT NOT NULL DEFAULT 'address' CHECK (scan_type IN ('address', 'tx')),
  result JSONB DEFAULT '{}',
  risk_indicators JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallet_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_scans_select_own" ON public.wallet_scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallet_scans_insert_own" ON public.wallet_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallet_scans_delete_own" ON public.wallet_scans
  FOR DELETE USING (auth.uid() = user_id);

-- Index for efficient monthly scan counting
CREATE INDEX IF NOT EXISTS idx_wallet_scans_user_month
  ON public.wallet_scans (user_id, created_at DESC);
