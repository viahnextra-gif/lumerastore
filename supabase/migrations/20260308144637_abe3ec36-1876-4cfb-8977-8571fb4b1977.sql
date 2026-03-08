
DROP POLICY IF EXISTS "Anyone can create leads via chatbot" ON public.leads;

CREATE POLICY "Anyone can create leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  source IN ('chatbot', 'website', 'landing-moda', 'landing-atacado')
);
