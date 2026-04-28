
CREATE TABLE public.seo_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  message TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_alerts_unack ON public.seo_alerts (created_at DESC) WHERE acknowledged_at IS NULL;
CREATE INDEX idx_seo_alerts_type ON public.seo_alerts (alert_type, created_at DESC);

ALTER TABLE public.seo_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view seo alerts"
  ON public.seo_alerts FOR SELECT
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can insert seo alerts"
  ON public.seo_alerts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can update seo alerts"
  ON public.seo_alerts FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete seo alerts"
  ON public.seo_alerts FOR DELETE
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));
