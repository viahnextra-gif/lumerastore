
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT
  WITH CHECK (source IS NOT NULL AND (source LIKE 'city-%' OR source = ANY (ARRAY['chatbot'::text, 'website'::text, 'landing-moda'::text, 'landing-atacado'::text])));
