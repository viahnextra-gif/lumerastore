import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MarketplaceOrders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      let q = supabase.from('marketplace_orders').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') q = q.eq('marketplace', filter);
      const { data } = await q;
      setOrders(data || []);
    };
    load();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('mk.orders')}</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('mk.all')}</SelectItem>
            <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
            <SelectItem value="shopee">Shopee</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="magalu">Magalu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('mk.noOrders')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('mk.externalId')}</TableHead>
                  <TableHead>{t('mk.marketplace')}</TableHead>
                  <TableHead>{t('mk.customer')}</TableHead>
                  <TableHead>{t('mk.total')}</TableHead>
                  <TableHead>{t('mk.statusCol')}</TableHead>
                  <TableHead>{t('mk.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.external_order_id || '—'}</TableCell>
                    <TableCell className="capitalize">{o.marketplace}</TableCell>
                    <TableCell>{o.customer_name || '—'}</TableCell>
                    <TableCell>{o.total?.toLocaleString('es-PY')}</TableCell>
                    <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
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
