
-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to call automation-webhook on new marketplace orders
CREATE OR REPLACE FUNCTION public.notify_automation_on_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get the Supabase URL and anon key from environment
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  -- Use pg_net to call the edge function asynchronously
  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/automation-webhook',
    body := jsonb_build_object(
      'event_type', 'order.created',
      'tenant_id', NEW.tenant_id,
      'payload', jsonb_build_object(
        'order_id', NEW.id,
        'marketplace', NEW.marketplace,
        'external_order_id', NEW.external_order_id,
        'total', NEW.total,
        'customer_name', NEW.customer_name,
        'status', NEW.status
      )
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block the insert if the webhook call fails
  RAISE WARNING 'automation webhook call failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger on marketplace_orders
CREATE TRIGGER trg_marketplace_order_automation
  AFTER INSERT ON public.marketplace_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_automation_on_new_order();
