import { useEffect, useState } from 'react';
import { Store, ShoppingCart, Package, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MarketplaceDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ connections: 0, mappedProducts: 0, orders: 0, errors: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [c, p, o, e] = await Promise.all([
        supabase.from('marketplace_connections').select('id', { count: 'exact', head: true }).eq('status', 'connected'),
        supabase.from('marketplace_product_map').select('id', { count: 'exact', head: true }),
        supabase.from('marketplace_orders').select('id', { count: 'exact', head: true }),
        supabase.from('marketplace_sync_logs').select('id', { count: 'exact', head: true }).eq('status', 'fail'),
      ]);
      setStats({ connections: c.count || 0, mappedProducts: p.count || 0, orders: o.count || 0, errors: e.count || 0 });
    };
    load();
  }, [user]);

  const cards = [
    { title: t('mk.connections.active'), value: stats.connections, icon: Store, color: 'text-green-500' },
    { title: t('mk.mapped'), value: stats.mappedProducts, icon: Package, color: 'text-blue-500' },
    { title: t('mk.imported'), value: stats.orders, icon: ShoppingCart, color: 'text-purple-500' },
    { title: t('mk.syncErrors'), value: stats.errors, icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('mk.dashboard')}</h1>
        <p className="text-muted-foreground text-sm">{t('mk.dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> {t('mk.recentSync')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('mk.noRecentSync')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {t('mk.status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Mercado Livre', 'Shopee', 'Amazon', 'Magalu'].map((m) => (
                <div key={m} className="flex items-center justify-between py-1">
                  <span className="text-sm">{m}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t('mk.disconnected')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
