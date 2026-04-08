-- ============================================================
-- SplitEase Complete Supabase Schema (Run Fresh)
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop existing tables if any (clean slate)
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.expense_groups CASCADE;
DROP TABLE IF EXISTS public.trip_shares CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (auto-created on auth signup via trigger)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Trips
CREATE TABLE public.trips (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  friends text[] NOT NULL DEFAULT '{}',
  google_sheet_url text,
  default_payer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Expense Groups
CREATE TABLE public.expense_groups (
  id text PRIMARY KEY,
  trip_id text NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name text NOT NULL,
  tax_percent numeric NOT NULL DEFAULT 0,
  tax_mode text NOT NULL DEFAULT 'percentage' CHECK (tax_mode IN ('percentage', 'value')),
  tax_value numeric NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  discount_value numeric NOT NULL DEFAULT 0,
  discount_mode text NOT NULL DEFAULT 'percentage' CHECK (discount_mode IN ('percentage', 'value')),
  tax_discount_level text NOT NULL DEFAULT 'group' CHECK (tax_discount_level IN ('group', 'item')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Items
CREATE TABLE public.items (
  id text PRIMARY KEY,
  expense_group_id text NOT NULL REFERENCES public.expense_groups(id) ON DELETE CASCADE,
  trip_id text NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  paid_by text NOT NULL,
  split_among text[] NOT NULL DEFAULT '{}',
  tax_percent numeric NOT NULL DEFAULT 0,
  tax_value numeric NOT NULL DEFAULT 0,
  tax_mode text NOT NULL DEFAULT 'percentage' CHECK (tax_mode IN ('percentage', 'value')),
  discount_percent numeric NOT NULL DEFAULT 0,
  discount_value numeric NOT NULL DEFAULT 0,
  discount_mode text NOT NULL DEFAULT 'percentage' CHECK (discount_mode IN ('percentage', 'value')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trip Shares (for sharing trips with viewers)
CREATE TABLE public.trip_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id text NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email text,
  share_type text NOT NULL CHECK (share_type IN ('private', 'public')),
  share_code text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Saved Trips (users bookmarking shared trips)
CREATE TABLE public.saved_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id text NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, trip_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_created_at ON public.trips(created_at DESC);
CREATE INDEX idx_expense_groups_trip_id ON public.expense_groups(trip_id);
CREATE INDEX idx_items_expense_group_id ON public.items(expense_group_id);
CREATE INDEX idx_items_trip_id ON public.items(trip_id);
CREATE INDEX idx_trip_shares_trip_id ON public.trip_shares(trip_id);
CREATE INDEX idx_trip_shares_email ON public.trip_shares(shared_with_email);
CREATE INDEX idx_trip_shares_code ON public.trip_shares(share_code);
CREATE INDEX idx_trip_shares_user_id ON public.trip_shares(user_id);
CREATE INDEX idx_saved_trips_user_id ON public.saved_trips(user_id);
CREATE INDEX idx_saved_trips_trip_id ON public.saved_trips(trip_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trip Shares (no recursion — uses user_id directly, never queries trips)
CREATE POLICY "Owners can select trip shares" ON public.trip_shares
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Owners can insert trip shares" ON public.trip_shares
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners can delete trip shares" ON public.trip_shares
  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Recipients can view their shares" ON public.trip_shares
  FOR SELECT USING (
    shared_with_email = (auth.jwt() ->> 'email')
  );
CREATE POLICY "Anyone can view public shares by code" ON public.trip_shares
  FOR SELECT USING (
    share_type = 'public' AND share_code IS NOT NULL
  );

-- Saved Trips
CREATE POLICY "Users can manage own saved trips" ON public.saved_trips
  FOR ALL USING (user_id = auth.uid());

-- Trips (owner + viewers via trip_shares)
CREATE POLICY "Users can view accessible trips" ON public.trips
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.trip_shares
      WHERE trip_shares.trip_id = trips.id
      AND trip_shares.share_type = 'private'
      AND trip_shares.shared_with_email = (auth.jwt() ->> 'email')
    )
    OR EXISTS (
      SELECT 1 FROM public.trip_shares
      WHERE trip_shares.trip_id = trips.id
      AND trip_shares.share_type = 'public'
    )
  );
CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- Expense Groups (access via trip — inherits viewer access)
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
          AND trip_shares.shared_with_email = (auth.jwt() ->> 'email')
        )
        OR EXISTS (
          SELECT 1 FROM public.trip_shares
          WHERE trip_shares.trip_id = trips.id
          AND trip_shares.share_type = 'public'
        )
      )
    )
  );
CREATE POLICY "Users can insert own expense groups" ON public.expense_groups
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = expense_groups.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own expense groups" ON public.expense_groups
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = expense_groups.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own expense groups" ON public.expense_groups
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = expense_groups.trip_id AND trips.user_id = auth.uid()
  ));

-- Items (access via trip — inherits viewer access)
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
          AND trip_shares.shared_with_email = (auth.jwt() ->> 'email')
        )
        OR EXISTS (
          SELECT 1 FROM public.trip_shares
          WHERE trip_shares.trip_id = trips.id
          AND trip_shares.share_type = 'public'
        )
      )
    )
  );
CREATE POLICY "Users can insert own items" ON public.items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = items.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own items" ON public.items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = items.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own items" ON public.items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = items.trip_id AND trips.user_id = auth.uid()
  ));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_trips_updated BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_expense_groups_updated BEFORE UPDATE ON public.expense_groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_items_updated BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
