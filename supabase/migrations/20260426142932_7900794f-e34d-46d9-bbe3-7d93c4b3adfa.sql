-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;

-- Remove previous schedule if it exists (idempotent)
DO $$
DECLARE
  jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'ping-search-engines-daily';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
END $$;

-- Schedule daily ping at 08:00 UTC
SELECT cron.schedule(
  'ping-search-engines-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://znzymdtglijihxsomtqp.supabase.co/functions/v1/ping-search-engines',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuenltZHRnbGlqaWh4c29tdHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjExMjQsImV4cCI6MjA5MTYzNzEyNH0.V5wVicHoCZE-zOSCCPkBGff7P0PULoCF0G5ddiu883M'
    ),
    body := jsonb_build_object('source', 'pg_cron')
  );
  $$
);