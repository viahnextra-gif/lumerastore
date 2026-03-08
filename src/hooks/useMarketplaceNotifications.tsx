import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useMarketplaceNotifications() {
  const { user, isAdminOrModerator } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!user || !isAdminOrModerator || initialized.current) return;
    initialized.current = true;

    const channel = supabase
      .channel('admin-marketplace-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'marketplace_orders' },
        (payload) => {
          const order = payload.new as any;
          toast.info(`🛒 Novo pedido ${order.marketplace}: ${order.external_order_id || 'N/A'}`, {
            description: `Cliente: ${order.customer_name || 'Desconhecido'} • ₲ ${Number(order.total || 0).toLocaleString()}`,
            duration: 8000,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'marketplace_messages' },
        (payload) => {
          const msg = payload.new as any;
          toast.info(`💬 Nova mensagem ${msg.marketplace}`, {
            description: `${msg.customer_name || 'Cliente'}: ${(msg.subject || msg.content || '').slice(0, 60)}`,
            duration: 8000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      initialized.current = false;
    };
  }, [user, isAdminOrModerator]);
}
