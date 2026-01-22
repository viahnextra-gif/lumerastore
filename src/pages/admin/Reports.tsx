import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{ product_name: string; total_qty: number; total_revenue: number }>;
  ordersByStatus: Record<string, number>;
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [ordersRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('id, total, status'),
        supabase.from('order_items').select('product_name, quantity, total_price'),
      ]);

      const orders = ordersRes.data || [];
      const items = itemsRes.data || [];

      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group by status
      const ordersByStatus: Record<string, number> = {};
      orders.forEach((o) => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      });

      // Top products
      const productStats: Record<string, { qty: number; revenue: number }> = {};
      items.forEach((item) => {
        if (!productStats[item.product_name]) {
          productStats[item.product_name] = { qty: 0, revenue: 0 };
        }
        productStats[item.product_name].qty += item.quantity;
        productStats[item.product_name].revenue += Number(item.total_price);
      });

      const topProducts = Object.entries(productStats)
        .map(([name, stats]) => ({
          product_name: name,
          total_qty: stats.qty,
          total_revenue: stats.revenue,
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);

      setData({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        ordersByStatus,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground">Análisis de ventas y rendimiento</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data?.totalRevenue || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pedidos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data?.averageOrderValue || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 productos por ingresos</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <p>Sin datos de ventas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.topProducts.map((product, index) => (
                  <div key={product.product_name} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.total_qty} unidades
                      </p>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatPrice(product.total_revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Estado</CardTitle>
            <CardDescription>Distribución actual de pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(data?.ordersByStatus || {}).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                <p>Sin pedidos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(data?.ordersByStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {statusLabels[status] || status}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
