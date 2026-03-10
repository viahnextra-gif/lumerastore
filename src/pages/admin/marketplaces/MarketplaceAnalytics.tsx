import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2, 220 70% 50%))', 'hsl(var(--chart-3, 30 80% 55%))', 'hsl(var(--chart-4, 280 65% 60%))'];

const chartConfig = {
  mercadolivre: { label: 'Mercado Livre', color: 'hsl(48 96% 53%)' },
  shopee: { label: 'Shopee', color: 'hsl(24 95% 53%)' },
  amazon: { label: 'Amazon', color: 'hsl(213 94% 50%)' },
  magalu: { label: 'Magalu', color: 'hsl(271 76% 53%)' },
};

export default function MarketplaceAnalytics() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [period, setPeriod] = useState('7d');
  const [ordersByMarketplace, setOrdersByMarketplace] = useState<{ name: string; value: number; total: number }[]>([]);
  const [dailySales, setDailySales] = useState<{ date: string; total: number; orders: number }[]>([]);
  const [syncStats, setSyncStats] = useState<{ name: string; success: number; fail: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const daysAgo = period === '30d' ? 30 : period === '7d' ? 7 : 1;
      const since = new Date(Date.now() - daysAgo * 86400000).toISOString();

      const [ordersRes, logsRes] = await Promise.all([
        supabase.from('marketplace_orders').select('*').gte('created_at', since),
        supabase.from('marketplace_sync_logs').select('*').gte('created_at', since),
      ]);

      const orders = ordersRes.data || [];
      const logs = logsRes.data || [];

      // Orders by marketplace
      const byMk: Record<string, { count: number; total: number }> = {};
      orders.forEach((o) => {
        if (!byMk[o.marketplace]) byMk[o.marketplace] = { count: 0, total: 0 };
        byMk[o.marketplace].count++;
        byMk[o.marketplace].total += Number(o.total) || 0;
      });
      setOrdersByMarketplace(
        Object.entries(byMk).map(([name, v]) => ({ name, value: v.count, total: v.total }))
      );

      // Daily sales
      const byDay: Record<string, { total: number; orders: number }> = {};
      orders.forEach((o) => {
        const day = o.created_at.slice(0, 10);
        if (!byDay[day]) byDay[day] = { total: 0, orders: 0 };
        byDay[day].total += Number(o.total) || 0;
        byDay[day].orders++;
      });
      setDailySales(
        Object.entries(byDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, v]) => ({ date: date.slice(5), ...v }))
      );

      // Sync stats by marketplace
      const bySync: Record<string, { success: number; fail: number }> = {};
      logs.forEach((l) => {
        if (!bySync[l.marketplace]) bySync[l.marketplace] = { success: 0, fail: 0 };
        if (l.status === 'success') bySync[l.marketplace].success++;
        else if (l.status === 'fail') bySync[l.marketplace].fail++;
      });
      setSyncStats(Object.entries(bySync).map(([name, v]) => ({ name, ...v })));
    };
    load();
  }, [user, period]);

  const totalRevenue = ordersByMarketplace.reduce((s, o) => s + o.total, 0);
  const totalOrders = ordersByMarketplace.reduce((s, o) => s + o.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('mk.analytics')}</h1>
          <p className="text-sm text-muted-foreground">{t('mk.analytics.subtitle')}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">{t('mk.today')}</SelectItem>
            <SelectItem value="7d">7 {t('mk.days')}</SelectItem>
            <SelectItem value="30d">30 {t('mk.days')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('mk.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('mk.totalOrdersMk')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('mk.avgTicket')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrders > 0 ? formatPrice(Math.round(totalRevenue / totalOrders)) : formatPrice(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('mk.channels')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ordersByMarketplace.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('mk.salesTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySales.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">{t('mk.noData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Orders by Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('mk.ordersByChannel')}</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByMarketplace.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <Pie data={ordersByMarketplace} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {ordersByMarketplace.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">{t('mk.noData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Sync Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{t('mk.syncPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            {syncStats.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={syncStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="success" fill="hsl(142 71% 45%)" name={t('mk.success')} />
                  <Bar dataKey="fail" fill="hsl(0 84% 60%)" name={t('mk.fail')} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">{t('mk.noData')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
