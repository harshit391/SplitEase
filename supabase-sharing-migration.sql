-- ============================================================
-- SplitEase Sharing Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Trip Shares table
CREATE TABLE public.trip_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id text NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  shared_with_email text,
  share_type text NOT NULL CHECK (share_type IN ('private', 'public')),
  share_code text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_shares_trip_id ON public.trip_shares(trip_id);
CREATE INDEX idx_trip_shares_email ON public.trip_shares(shared_with_email);
CREATE INDEX idx_trip_shares_code ON public.trip_shares(share_code);

ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;

-- Owner can manage their trip's shares
CREATE POLICY "Owners can manage trip shares" ON public.trip_shares
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_shares.trip_id AND trips.user_id = auth.uid()
  ));

-- Users can see shares where they are the recipient
CREATE POLICY "Users can view shares for their email" ON public.trip_shares
  FOR SELECT USING (
    shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ============================================================
-- Update trips SELECT policy to include viewers
-- ============================================================

DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;

CREATE POLICY "Users can view accessible trips" ON public.trips
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.trip_shares
      WHERE trip_shares.trip_id = trips.id
      AND trip_shares.share_type = 'private'
      AND trip_shares.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.trip_shares
      WHERE trip_shares.trip_id = trips.id
      AND trip_shares.share_type = 'public'
    )
  );

-- ============================================================
-- Update expense_groups SELECT policy to include viewers
-- ============================================================

DROP POLICY IF EXISTS "Users can view own expense groups" ON public.expense_groups;

CREATE POLICY "Users can view accessible expense groups" ON public.expense_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expense_groups.trip_id
      AND (
        trips.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.trip_shares
          WHERE trip_shares.trip_id = trips.id
          AND trip_shares.share_type = 'private'
          AND trip_shares.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.trip_shares
          WHERE trip_shares.trip_id = trips.id
          AND trip_shares.share_type = 'public'
        )
      )
    )
  );

-- ============================================================
-- Update items SELECT policy to include viewers
-- ============================================================

DROP POLICY IF EXISTS "Users can view own items" ON public.items;

CREATE POLICY "Users can view accessible items" ON public.items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = items.trip_id
      AND (
        trips.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.trip_shares
          WHERE trip_shares.trip_id = trips.id
          AND trip_shares.share_type = 'private'
          AND trip_shares.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.trip_shares
          WHERE trip_shares.trip_id = trips.id
          AND trip_shares.share_type = 'public'
        )
      )
    )
  );
