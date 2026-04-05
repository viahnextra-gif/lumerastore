import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notification {
  id: string;
  order_id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  old_status: string | null;
  new_status: string;
  notification_type: string;
  sent: boolean;
  created_at: string;
}

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('order_notifications' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setNotifications((data as any) || []);
      setIsLoading(false);
    };
    load();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t('admin.notifications') || 'Notificações'}</h1>
        <p className="text-muted-foreground">{t('admin.notificationsSubtitle') || 'Histórico de notificações de mudança de status dos pedidos'}</p>
      </div>

      <Card>
        <CardHeader />
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação registrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p>{n.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{n.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {n.old_status && <Badge className={statusColorMap[n.old_status] || ''}>{n.old_status}</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColorMap[n.new_status] || ''}>{n.new_status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(n.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
