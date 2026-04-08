-- ============================================================
-- SplitEase Saved Trips Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TABLE public.saved_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id text NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, trip_id)
);

CREATE INDEX idx_saved_trips_user_id ON public.saved_trips(user_id);
CREATE INDEX idx_saved_trips_trip_id ON public.saved_trips(trip_id);

ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved trips" ON public.saved_trips
  FOR ALL USING (user_id = auth.uid());
