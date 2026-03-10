import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, MapPin, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkoutSchema = z.object({
    customerName: z.string().min(2, t('checkout.nameRequired')),
    customerEmail: z.string().email(t('checkout.invalidEmail')),
    customerPhone: z.string().min(8, t('checkout.phoneRequired')),
    shippingAddress: z.string().min(5, t('checkout.addressRequired')),
    shippingCity: z.string().min(2, t('checkout.cityRequired')),
    notes: z.string().optional(),
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: user?.email || '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = totalPrice >= 500000 ? 0 : 25000;
  const total = totalPrice + shippingCost;




  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        order_number: `MEC-${Date.now()}`,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        shipping_address: formData.shippingAddress,
        shipping_city: formData.shippingCity,
        notes: formData.notes || null,
        payment_method: paymentMethod,
        subtotal: totalPrice,
        shipping_cost: shippingCost,
        total: total,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0] || null,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      supabase.functions.invoke('notify-whatsapp', {
        body: {
          order: {
            order_number: order.order_number,
            customer_name: formData.customerName,
            customer_email: formData.customerEmail,
            customer_phone: formData.customerPhone,
            total: total / 100,
            shipping_city: formData.shippingCity,
          },
        },
      }).catch((err) => console.error('WhatsApp notification failed:', err));

      clearCart();
      setOrderNumber(order.order_number);
      setOrderCreated(true);

      toast({
        title: t('checkout.orderCreated'),
        description: `${t('checkout.orderCreatedDesc')} ${order.order_number}`,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: error.message || t('checkout.error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderCreated) {
    navigate('/carrinho');
    return null;
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
              <Check className="h-10 w-10 text-accent-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              {t('checkout.orderConfirmed')}
            </h1>
            <p className="text-muted-foreground mb-2">
              {t('checkout.orderNumberLabel')}
            </p>
            <p className="font-mono text-2xl font-bold text-primary mb-6">{orderNumber}</p>
            
            {paymentMethod === 'transfer' && (
              <Card className="mb-6 text-left">
                <CardHeader>
                  <CardTitle className="text-lg">{t('checkout.transferDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>{t('checkout.bank')}:</strong> Banco Continental</p>
                  <p><strong>{t('checkout.holder')}:</strong> Meca Store S.A.</p>
                  <p><strong>{t('checkout.accountNumber')}:</strong> 1234567890</p>
                  <p><strong>{t('checkout.amount')}:</strong> {formatPrice(total)}</p>
                  <p className="text-muted-foreground mt-4">
                    {t('checkout.sendReceipt')}
                  </p>
                </CardContent>
              </Card>
            )}
            
            <div className="flex gap-4 justify-center">
              <Link to="/catalogo">
                <Button variant="outline">{t('checkout.continueShopping')}</Button>
              </Link>
              {user && (
                <Link to="/cuenta">
                  <Button>{t('checkout.viewOrders')}</Button>
                </Link>
              )}
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <Link
          to="/carrinho"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('checkout.backToCart')}
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-foreground mb-8"
        >
          {t('checkout.title')}
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {t('checkout.contactInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">{t('checkout.fullName')}</Label>
                        <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} placeholder={t('checkout.namePlaceholder')} />
                        {errors.customerName && <p className="text-sm text-destructive">{errors.customerName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">{t('checkout.phone')}</Label>
                        <Input id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="+595 XXX XXX XXX" />
                        {errors.customerPhone && <p className="text-sm text-destructive">{errors.customerPhone}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">{t('checkout.email')}</Label>
                      <Input id="customerEmail" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleChange} placeholder="tu@email.com" />
                      {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail}</p>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shipping */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      {t('checkout.shippingTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress">{t('checkout.fullAddress')}</Label>
                      <Input id="shippingAddress" name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} placeholder={t('checkout.addressPlaceholder')} />
                      {errors.shippingAddress && <p className="text-sm text-destructive">{errors.shippingAddress}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingCity">{t('checkout.city')}</Label>
                      <Input id="shippingCity" name="shippingCity" value={formData.shippingCity} onChange={handleChange} placeholder={t('checkout.cityPlaceholder')} />
                      {errors.shippingCity && <p className="text-sm text-destructive">{errors.shippingCity}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t('checkout.notes')}</Label>
                      <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder={t('checkout.notesPlaceholder')} rows={2} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      {t('checkout.paymentMethod')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                          <p className="font-medium">{t('checkout.bankTransfer')}</p>
                          <p className="text-sm text-muted-foreground">{t('checkout.bankTransferDesc')}</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                          <p className="font-medium">{t('checkout.cashOnDelivery')}</p>
                          <p className="text-sm text-muted-foreground">{t('checkout.cashOnDeliveryDesc')}</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-muted/30 opacity-60">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="flex-1">
                          <p className="font-medium">{t('checkout.cardPayment')}</p>
                          <p className="text-sm text-muted-foreground">{t('checkout.cardComingSoon')}</p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-24 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle>{t('checkout.orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-20 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.selectedColor} • {item.selectedSize} • x{item.quantity}</p>
                          <p className="text-sm font-medium text-primary">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('checkout.subtotal')}</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('checkout.shipping')}</span>
                      <span>{shippingCost === 0 ? t('checkout.shippingFree') : formatPrice(shippingCost)}</span>
                    </div>
                    {shippingCost === 0 && (
                      <p className="text-xs text-primary">{t('checkout.freeShippingNote')}</p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t('checkout.total')}</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('checkout.processing')}</>
                    ) : (
                      t('checkout.placeOrder')
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">{t('checkout.dataProtected')}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
