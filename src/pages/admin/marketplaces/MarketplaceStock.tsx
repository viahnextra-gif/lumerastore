import { useState, useEffect } from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

export default function MarketplaceStock() {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estoque Marketplace</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Produtos Sincronizados</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{mappedProducts.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Estoque Baixo (&lt;5)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-orange-500">{products.filter((p) => (p.stock || 0) < 5).length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sem Estoque</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-500">{products.filter((p) => (p.stock || 0) === 0).length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Estoque Local</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 50).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.stock ?? 0}</TableCell>
                  <TableCell>
                    {(p.stock || 0) === 0 ? (
                      <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Sem estoque</Badge>
                    ) : (p.stock || 0) < 5 ? (
                      <Badge variant="secondary" className="text-xs text-orange-600">Baixo</Badge>
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
