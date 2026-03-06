import { useState, useEffect } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function MarketplaceCatalog() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const [{ data: prods }, { data: maps }] = await Promise.all([
        supabase.from('products').select('id, name, slug, price, stock, images').eq('is_active', true),
        supabase.from('marketplace_product_map').select('*'),
      ]);
      setProducts(prods || []);
      setMappings(maps || []);
    };
    load();
  }, []);

  const getMappingStatus = (productId: string, marketplace: string) =>
    mappings.find((m) => m.product_id === productId && m.marketplace === marketplace);

  const handleSync = async () => {
    toast.info(t('mk.syncAll') + '...');
    const res = await supabase.functions.invoke('marketplace-sync', {
      body: { operation: 'catalog', tenant_id: (await supabase.auth.getUser()).data.user?.id, marketplace: 'all', product_ids: products.map((p) => p.id) },
    });
    if (res.error) toast.error(t('mk.error'));
    else toast.success(t('mk.success'));
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('mk.catalog')}</h1>
        <Button onClick={handleSync}><RefreshCw className="h-4 w-4 mr-2" /> {t('mk.syncAll')}</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('mk.searchProduct')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('mk.product')}</TableHead>
                <TableHead>{t('mk.price')}</TableHead>
                <TableHead>{t('mk.stockCol')}</TableHead>
                <TableHead>ML</TableHead>
                <TableHead>Shopee</TableHead>
                <TableHead>Amazon</TableHead>
                <TableHead>Magalu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.price?.toLocaleString('es-PY')}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  {['mercadolivre', 'shopee', 'amazon', 'magalu'].map((mk) => {
                    const m = getMappingStatus(p.id, mk);
                    return (
                      <TableCell key={mk}>
                        <Badge variant={m?.sync_status === 'synced' ? 'default' : 'secondary'} className="text-xs">
                          {m ? m.sync_status : '—'}
                        </Badge>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
