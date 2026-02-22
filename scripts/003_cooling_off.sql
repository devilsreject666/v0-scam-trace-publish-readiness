-- Cooling-off transactions for pre-send protection
CREATE TABLE IF NOT EXISTS public.cooling_off_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  blockchain TEXT NOT NULL CHECK (blockchain IN ('eth', 'btc')),
  delay_minutes INTEGER NOT NULL DEFAULT 30 CHECK (delay_minutes BETWEEN 15 AND 60),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled', 'expired')),
  risk_reassessment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.cooling_off_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cooling_off_select_own" ON public.cooling_off_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cooling_off_insert_own" ON public.cooling_off_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cooling_off_update_own" ON public.cooling_off_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for status lookups
CREATE INDEX IF NOT EXISTS idx_cooling_off_user_status
  ON public.cooling_off_transactions (user_id, status);
