
DROP TABLE IF EXISTS public.scheduled_posts CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.social_accounts CASCADE;

DO $$ BEGIN
  CREATE TYPE public.lead_temperature AS ENUM ('FRIO', 'MORNO', 'QUENTE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lead_temperature public.lead_temperature NOT NULL DEFAULT 'FRIO',
  ADD COLUMN IF NOT EXISTS device          text,
  ADD COLUMN IF NOT EXISTS utm_source      text,
  ADD COLUMN IF NOT EXISTS utm_medium      text,
  ADD COLUMN IF NOT EXISTS utm_campaign    text;

CREATE OR REPLACE FUNCTION public.compute_lead_temperature()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF COALESCE(NEW.score, 0) >= 71 THEN
    NEW.lead_temperature := 'QUENTE';
  ELSIF COALESCE(NEW.score, 0) >= 31 THEN
    NEW.lead_temperature := 'MORNO';
  ELSE
    NEW.lead_temperature := 'FRIO';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_compute_temperature ON public.leads;
CREATE TRIGGER trg_leads_compute_temperature
  BEFORE INSERT OR UPDATE OF score ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.compute_lead_temperature();

UPDATE public.leads SET score = score;

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  priority     text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  due_at       timestamptz NOT NULL,
  completed_at timestamptz,
  assigned_to  uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_lead     ON public.crm_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_open ON public.crm_tasks(due_at) WHERE completed_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_tasks TO authenticated;
GRANT ALL ON public.crm_tasks TO service_role;

ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage crm tasks" ON public.crm_tasks;
CREATE POLICY "Admins manage crm tasks"
  ON public.crm_tasks
  FOR ALL
  USING (public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (public.is_admin_or_moderator(auth.uid()));

DROP TRIGGER IF EXISTS update_crm_tasks_updated_at ON public.crm_tasks;
CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON public.crm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.create_task_for_lead_temperature()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_title text; v_desc text; v_prio text; v_due timestamptz;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.lead_temperature = NEW.lead_temperature THEN
    RETURN NEW;
  END IF;
  IF NEW.lead_temperature = 'QUENTE' THEN
    v_title := 'Prioridade Máxima';
    v_desc  := 'Lead quente — contato imediato.';
    v_prio  := 'urgent'; v_due := now();
  ELSIF NEW.lead_temperature = 'MORNO' THEN
    v_title := 'Contato Comercial';
    v_desc  := 'Lead morno — entrar em contato em até 24h.';
    v_prio  := 'high'; v_due := now() + interval '24 hours';
  ELSE
    v_title := 'Nutrir Lead';
    v_desc  := 'Lead frio — enviar conteúdo de nutrição em até 3 dias.';
    v_prio  := 'normal'; v_due := now() + interval '3 days';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.crm_tasks
    WHERE lead_id = NEW.id AND title = v_title AND completed_at IS NULL
  ) THEN
    INSERT INTO public.crm_tasks (lead_id, title, description, priority, due_at)
    VALUES (NEW.id, v_title, v_desc, v_prio, v_due);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_auto_task ON public.leads;
CREATE TRIGGER trg_leads_auto_task
  AFTER INSERT OR UPDATE OF lead_temperature ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.create_task_for_lead_temperature();
