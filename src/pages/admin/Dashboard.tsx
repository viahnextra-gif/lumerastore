import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, DollarSign, ArrowUpRight, Loader2, CalendarDays, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: Array<{ id: string; order_number: string; customer_name: string; total: number; status: string; created_at: string }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  ordersByStatus: Array<{ name: string; value: number; color: string }>;
  leadsByStatus: Array<{ name: string; value: number; color: string }>;
  postsByPlatform: Array<{ platform: string; scheduled: number; published: number }>;
}

const STATUS_COLORS: Record<string, string> = { pending: '#eab308', confirmed: '#3b82f6', processing: '#a855f7', shipped: '#6366f1', delivered: '#22c55e', cancelled: '#ef4444' };
const LEAD_COLORS: Record<string, string> = { cold: '#60a5fa', warm: '#fbbf24', hot: '#f97316', converted: '#22c55e' };

export default function Dashboard() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const STATUS_LABELS: Record<string, string> = {
    pending: t('admin.statusPending'), confirmed: t('admin.statusConfirmed'), processing: t('admin.statusProcessing'),
    shipped: t('admin.statusShipped'), delivered: t('admin.statusDelivered'), cancelled: t('admin.statusCancelled'),
    cold: t('admin.statusCold'), warm: t('admin.statusWarm'), hot: t('admin.statusHot'), converted: t('admin.statusConverted'),
  };

  useEffect(() => { fetchDashboardStats(); }, []);

  const fetchDashboardStats = async () => {
    try {
      const [productsRes, ordersRes, profilesRes, recentOrdersRes, leadsRes, postsRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id, total, status, created_at'),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('id, order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('id, status'),
        supabase.from('scheduled_posts').select('id, platform, status'),
      ]);

      const orders = ordersRes.data || [];
      const leads = leadsRes.data || [];
      const posts = postsRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;

      const now = new Date();
      const revenueByDay: Array<{ date: string; revenue: number; orders: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const dayOrders = orders.filter((o) => o.created_at?.slice(0, 10) === key);
        revenueByDay.push({ date: d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }), revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0), orders: dayOrders.length });
      }

      const statusCounts: Record<string, number> = {};
      orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
      const ordersByStatus = Object.entries(statusCounts).map(([k, v]) => ({ name: STATUS_LABELS[k] || k, value: v, color: STATUS_COLORS[k] || '#94a3b8' }));

      const leadCounts: Record<string, number> = {};
      leads.forEach((l) => { const s = l.status || 'cold'; leadCounts[s] = (leadCounts[s] || 0) + 1; });
      const leadsByStatus = Object.entries(leadCounts).map(([k, v]) => ({ name: STATUS_LABELS[k] || k, value: v, color: LEAD_COLORS[k] || '#94a3b8' }));

      const platformMap: Record<string, { scheduled: number; published: number }> = {};
      posts.forEach((p) => { if (!platformMap[p.platform]) platformMap[p.platform] = { scheduled: 0, published: 0 }; if (p.status === 'published') platformMap[p.platform].published++; else platformMap[p.platform].scheduled++; });
      const postsByPlatform = Object.entries(platformMap).map(([k, v]) => ({ platform: k.charAt(0).toUpperCase() + k.slice(1), ...v }));

      setStats({ totalProducts: productsRes.count || 0, totalOrders: orders.length, totalCustomers: profilesRes.count || 0, totalRevenue, pendingOrders, recentOrders: recentOrdersRes.data || [], revenueByDay, ordersByStatus, leadsByStatus, postsByPlatform });
    } catch (error) { console.error('Error fetching dashboard stats:', error); } finally { setIsLoading(false); }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 }).format(price);

  const statusColors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t('admin.dashboard')}</h1>
        <p className="text-muted-foreground">{t('admin.dashboardSubtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('admin.totalRevenue'), value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, sub: `${stats?.totalOrders} ${t('admin.ordersLabel')}` },
          { label: t('admin.orders'), value: stats?.totalOrders, icon: ShoppingCart, sub: `${stats?.pendingOrders} ${t('admin.pendingOrders')}` },
          { label: t('admin.products'), value: stats?.totalProducts, icon: Package, sub: t('admin.activeProducts') },
          { label: t('admin.customers'), value: stats?.totalCustomers, icon: Users, sub: t('admin.registered') },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> {t('admin.salesLast7')}</CardTitle>
            <CardDescription>{t('admin.salesLast7Desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `₲${(v / 1000).toFixed(0)}k`} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(value: number, name: string) => [name === 'revenue' ? formatPrice(value) : value, name === 'revenue' ? t('admin.revenue') : t('admin.ordersLabel')]} />
                  <Legend formatter={(v) => (v === 'revenue' ? t('admin.revenue') : t('admin.ordersLabel'))} />
                  <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ r: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> {t('admin.ordersByStatus')}</CardTitle></CardHeader>
            <CardContent>
              {stats?.ordersByStatus.length === 0 ? <p className="text-center py-8 text-muted-foreground">{t('admin.noOrders')}</p> : (
                <div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats?.ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>{stats?.ordersByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> {t('admin.leadsByStatus')}</CardTitle></CardHeader>
            <CardContent>
              {stats?.leadsByStatus.length === 0 ? <p className="text-center py-8 text-muted-foreground">{t('admin.noLeads')}</p> : (
                <div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats?.leadsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>{stats?.leadsByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> {t('admin.postsByPlatform')}</CardTitle></CardHeader>
            <CardContent>
              {stats?.postsByPlatform.length === 0 ? <p className="text-center py-8 text-muted-foreground">{t('admin.noPosts')}</p> : (
                <div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats?.postsByPlatform} layout="vertical"><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} /><YAxis type="category" dataKey="platform" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} /><Tooltip /><Legend /><Bar dataKey="scheduled" name={t('admin.scheduled')} fill="#6366f1" radius={[0, 4, 4, 0]} /><Bar dataKey="published" name={t('admin.published')} fill="#22c55e" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.recentOrders')}</CardTitle>
            <CardDescription>{t('admin.recentOrdersDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders.length === 0 ? <p className="text-center text-muted-foreground py-8">{t('admin.noOrdersYet')}</p> : (
              <div className="space-y-4">
                {stats?.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{STATUS_LABELS[order.status] || order.status}</span>
                      <span className="font-semibold text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
