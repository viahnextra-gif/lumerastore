
-- Automation flows table for persisting user-created automations
CREATE TABLE public.automation_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'n8n',
  webhook_url TEXT DEFAULT '',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own automation flows"
  ON public.automation_flows FOR ALL
  TO authenticated
  USING ((auth.uid() = tenant_id) OR is_admin_or_moderator(auth.uid()))
  WITH CHECK ((auth.uid() = tenant_id) OR is_admin_or_moderator(auth.uid()));

-- Automation execution logs
CREATE TABLE public.automation_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID REFERENCES public.automation_flows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  trigger_event TEXT,
  trigger_payload JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own automation executions"
  ON public.automation_executions FOR ALL
  TO authenticated
  USING ((auth.uid() = tenant_id) OR is_admin_or_moderator(auth.uid()))
  WITH CHECK ((auth.uid() = tenant_id) OR is_admin_or_moderator(auth.uid()));

-- Enable realtime for automation executions
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_executions;
