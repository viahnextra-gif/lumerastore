-- 1) Add SEO columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 2) Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  min_purchase NUMERIC(12,2),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Grants for Data API
GRANT SELECT ON public.coupons TO authenticated;
GRANT ALL    ON public.coupons TO service_role;

-- 4) RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read ACTIVE coupons (to validate at checkout).
CREATE POLICY "Authenticated can read active coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins/moderators can do everything.
CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (public.is_admin_or_moderator(auth.uid()));

-- 5) updated_at trigger
DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Helpful index
CREATE INDEX IF NOT EXISTS coupons_code_active_idx ON public.coupons (code) WHERE is_active = true;