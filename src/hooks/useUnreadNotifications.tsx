import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const { count: total } = await supabase
      .from('order_notifications' as any)
      .select('*', { count: 'exact', head: true })
      .eq('sent', false);
    setCount(total || 0);
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { count, refresh: fetchCount };
}
