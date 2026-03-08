
-- Fix categories: drop restrictive SELECT policy, create permissive one
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix products: drop restrictive SELECT policy, create permissive one
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
