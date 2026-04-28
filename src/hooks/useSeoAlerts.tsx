import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SeoAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details: Record<string, unknown>;
  acknowledged_at: string | null;
  created_at: string;
}

export function useSeoAlerts(pollMs = 60_000) {
  const [alerts, setAlerts] = useState<SeoAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    const { data, error } = await supabase
      .from('seo_alerts' as never)
      .select('*')
      .is('acknowledged_at', null)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) {
      setAlerts(data as unknown as SeoAlert[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchAlerts();
    const id = window.setInterval(() => {
      if (!cancelled) void fetchAlerts();
    }, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [fetchAlerts, pollMs]);

  const acknowledge = useCallback(
    async (id: string) => {
      await supabase
        .from('seo_alerts' as never)
        .update({ acknowledged_at: new Date().toISOString() } as never)
        .eq('id', id);
      await fetchAlerts();
    },
    [fetchAlerts],
  );

  const acknowledgeAll = useCallback(async () => {
    const ids = alerts.map((a) => a.id);
    if (ids.length === 0) return;
    await supabase
      .from('seo_alerts' as never)
      .update({ acknowledged_at: new Date().toISOString() } as never)
      .in('id', ids);
    await fetchAlerts();
  }, [alerts, fetchAlerts]);

  /**
   * Insert a new alert. Idempotent within a 30-min window for a given
   * (alert_type + message) — prevents alert spam from the auditor.
   */
  const recordAlert = useCallback(
    async (alert: Omit<SeoAlert, 'id' | 'created_at' | 'acknowledged_at' | 'acknowledged_by'>) => {
      const since = new Date(Date.now() - 30 * 60_000).toISOString();
      const { data: existing } = await supabase
        .from('seo_alerts' as never)
        .select('id')
        .eq('alert_type', alert.alert_type)
        .eq('message', alert.message)
        .gte('created_at', since)
        .is('acknowledged_at', null)
        .maybeSingle();
      if (existing) return;
      await supabase.from('seo_alerts' as never).insert(alert as never);
      await fetchAlerts();
    },
    [fetchAlerts],
  );

  return { alerts, loading, acknowledge, acknowledgeAll, recordAlert, refresh: fetchAlerts };
}
