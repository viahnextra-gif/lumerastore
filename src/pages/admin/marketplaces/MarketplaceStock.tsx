import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MarketplaceStock() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: prods }, { data: maps }] = await Promise.all([
        supabase.from('products').select('id, name, stock').eq('is_active', true),
        supabase.from('marketplace_product_map').select('*'),
      ]);
      setProducts(prods || []);
      setMappings(maps || []);
    };
    load();
  }, []);

  const mappedProducts = products.filter((p) => mappings.some((m) => m.product_id === p.id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('mk.stock')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('mk.syncedProducts')}</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{mappedProducts.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('mk.lowStock')} (&lt;5)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-orange-500">{products.filter((p) => (p.stock || 0) < 5).length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('mk.noStock')}</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-500">{products.filter((p) => (p.stock || 0) === 0).length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('mk.product')}</TableHead>
                <TableHead>{t('mk.localStock')}</TableHead>
                <TableHead>{t('mk.statusCol')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 50).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.stock ?? 0}</TableCell>
                  <TableCell>
                    {(p.stock || 0) === 0 ? (
                      <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />{t('mk.noStock')}</Badge>
                    ) : (p.stock || 0) < 5 ? (
                      <Badge variant="secondary" className="text-xs text-orange-600">{t('mk.lowStock')}</Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
