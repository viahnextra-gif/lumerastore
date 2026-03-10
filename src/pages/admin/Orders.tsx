import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Loader2, ShoppingCart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Order {
  id: string; order_number: string; customer_name: string; customer_email: string;
  customer_phone: string | null; shipping_address: string; shipping_city: string;
  status: string; subtotal: number; shipping_cost: number; total: number;
  payment_method: string | null; payment_status: string | null;
  tracking_number: string | null; notes: string | null; created_at: string;
}

interface OrderItem {
  id: string; product_name: string; product_image: string | null;
  size: string | null; color: string | null; quantity: number;
  unit_price: number; total_price: number;
}

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const { toast } = useToast();

  const statusLabels: Record<string, string> = {
    pending: t('admin.statusPending'), confirmed: t('admin.statusConfirmed'), processing: t('admin.statusProcessing'),
    shipped: t('admin.statusShipped'), delivered: t('admin.statusDelivered'), cancelled: t('admin.statusCancelled'),
  };

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) { console.error('Error fetching orders:', error); } finally { setIsLoading(false); }
  };

  const fetchOrderItems = async (orderId: string) => {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) { console.error('Error fetching order items:', error); } finally { setLoadingItems(false); }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus as any }).eq('id', orderId);
      if (error) throw error;
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      toast({ title: t('admin.statusUpdated') });
    } catch (error) {
      toast({ title: 'Error', description: t('admin.couldNotUpdate'), variant: 'destructive' });
    }
  };

  const handleAddTracking = async () => {
    if (!selectedOrder || !trackingNumber) return;
    try {
      const { error } = await supabase.from('orders').update({ tracking_number: trackingNumber, status: 'shipped' }).eq('id', selectedOrder.id);
      if (error) throw error;
      setOrders(orders.map((o) => o.id === selectedOrder.id ? { ...o, tracking_number: trackingNumber, status: 'shipped' } : o));
      setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber, status: 'shipped' });
      toast({ title: t('admin.trackingAdded') });
    } catch (error) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 }).format(price);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(search.toLowerCase()) || order.customer_name.toLowerCase().includes(search.toLowerCase()) || order.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t('admin.ordersTitle')}</h1>
        <p className="text-muted-foreground">{t('admin.ordersSubtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('admin.searchOrders')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('admin.filterByStatus')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.all')}</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('admin.noOrders')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.order')}</TableHead>
                  <TableHead>{t('admin.client')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead>{t('admin.total')}</TableHead>
                  <TableHead>{t('admin.date')}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div><p>{order.customer_name}</p><p className="text-sm text-muted-foreground">{order.customer_email}</p></div>
                    </TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(value: string) => handleStatusChange(order.id, value)}>
                        <SelectTrigger className="w-[140px]"><Badge className={statusColorMap[order.status]}>{statusLabels[order.status]}</Badge></SelectTrigger>
                        <SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedOrder(order); setTrackingNumber(order.tracking_number || ''); fetchOrderItems(order.id); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('admin.order')} {selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">{t('admin.customerInfo')}</h4>
                  <p>{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>}
                </div>
                <div>
                  <h4 className="font-medium mb-2">{t('admin.shippingAddress')}</h4>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_city}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">{t('admin.tracking')}</h4>
                </div>
                <div className="flex gap-2">
                  <Input placeholder={t('admin.trackingNumber')} value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                  <Button onClick={handleAddTracking} disabled={!trackingNumber}>{t('admin.save')}</Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">{t('admin.orderProducts')}</h4>
                {loadingItems ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                        {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded" />}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">{item.color} • {t('admin.size')} {item.size} • x{item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('admin.subtotal')}</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('admin.shipping')}</span><span>{formatPrice(selectedOrder.shipping_cost)}</span></div>
                <div className="flex justify-between font-semibold text-lg"><span>{t('admin.total')}</span><span className="text-primary">{formatPrice(selectedOrder.total)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
