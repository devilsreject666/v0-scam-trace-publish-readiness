-- Cooling-off transactions for pre-send protection
CREATE TABLE IF NOT EXISTS public.cooling_off_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  blockchain TEXT NOT NULL DEFAULT 'eth',
  delay_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  risk_reassessment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.cooling_off_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cooling_off_select_own" ON public.cooling_off_transactions;
CREATE POLICY "cooling_off_select_own" ON public.cooling_off_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cooling_off_insert_own" ON public.cooling_off_transactions;
CREATE POLICY "cooling_off_insert_own" ON public.cooling_off_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cooling_off_update_own" ON public.cooling_off_transactions;
CREATE POLICY "cooling_off_update_own" ON public.cooling_off_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cooling_off_user_status
  ON public.cooling_off_transactions (user_id, status);
