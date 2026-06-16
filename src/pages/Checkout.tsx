import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, MapPin, Loader2, Check, QrCode, Barcode } from 'lucide-react';
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
import { maskCpf, maskCep, maskPhone, isValidCpf, isValidCep } from '@/lib/br/validators';
import { lookupCep, quoteShipping, type ShippingOption } from '@/lib/shipping/melhorEnvio';

const FREE_SHIPPING_THRESHOLD_BRL = 299;
const DEFAULT_SHIPPING_BRL = 24.9;

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkoutSchema = z.object({
    customerName: z.string().trim().min(2, 'Nome obrigatório').max(120),
    customerEmail: z.string().trim().email('Email inválido').max(255),
    customerPhone: z.string().trim().min(10, 'Telefone obrigatório').max(20),
    customerCpf: z.string().trim().refine(isValidCpf, 'CPF inválido'),
    shippingCep: z.string().trim().refine(isValidCep, 'CEP inválido (00000-000)'),
    shippingStreet: z.string().trim().min(2, 'Rua obrigatória').max(160),
    shippingNumber: z.string().trim().min(1, 'Número obrigatório').max(10),
    shippingComplement: z.string().trim().max(80).optional(),
    shippingNeighborhood: z.string().trim().min(2, 'Bairro obrigatório').max(80),
    shippingCity: z.string().trim().min(2, 'Cidade obrigatória').max(80),
    shippingState: z.string().trim().length(2, 'UF deve ter 2 letras'),
    notes: z.string().max(500).optional(),
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto' | 'transfer'>('pix');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: user?.email || '',
    customerPhone: '',
    customerCpf: '',
    shippingCep: '',
    shippingStreet: '',
    shippingNumber: '',
    shippingComplement: '',
    shippingNeighborhood: '',
    shippingCity: '',
    shippingState: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD_BRL
    ? 0
    : (selectedShipping?.price ?? DEFAULT_SHIPPING_BRL);
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
      const fullAddress = [
        `${formData.shippingStreet}, ${formData.shippingNumber}`,
        formData.shippingComplement,
        formData.shippingNeighborhood,
        `CEP ${formData.shippingCep}`,
        `${formData.shippingCity}/${formData.shippingState}`,
        `CPF: ${formData.customerCpf}`,
      ].filter(Boolean).join(' · ');

      const orderData = {
        order_number: `LUM-${Date.now()}`,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        shipping_address: fullAddress,
        shipping_city: `${formData.shippingCity}/${formData.shippingState}`,
        notes: formData.notes || null,
        payment_method: paymentMethod,
        subtotal: totalPrice,
        shipping_cost: shippingCost,
        total: total,
        user_id: user?.id || null,
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

  useEffect(() => {
    if (items.length === 0 && !orderCreated) {
      navigate('/carrinho');
    }
  }, [items.length, orderCreated, navigate]);

  if (items.length === 0 && !orderCreated) {
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
                  <p><strong>{t('checkout.holder')}:</strong> Lumera Store S.A.</p>
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
                        <Label htmlFor="customerPhone">Telefone *</Label>
                        <Input id="customerPhone" name="customerPhone" value={formData.customerPhone}
                          onChange={(e) => setFormData({ ...formData, customerPhone: maskPhone(e.target.value) })}
                          placeholder="(11) 91234-5678" inputMode="tel" />
                        {errors.customerPhone && <p className="text-sm text-destructive">{errors.customerPhone}</p>}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email *</Label>
                        <Input id="customerEmail" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleChange} placeholder="voce@email.com" />
                        {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerCpf">CPF *</Label>
                        <Input id="customerCpf" name="customerCpf" value={formData.customerCpf}
                          onChange={(e) => setFormData({ ...formData, customerCpf: maskCpf(e.target.value) })}
                          placeholder="000.000.000-00" inputMode="numeric" />
                        {errors.customerCpf && <p className="text-sm text-destructive">{errors.customerCpf}</p>}
                      </div>
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
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingCep">CEP *</Label>
                        <div className="relative">
                          <Input id="shippingCep" name="shippingCep" value={formData.shippingCep}
                            onChange={async (e) => {
                              const v = maskCep(e.target.value);
                              setFormData((prev) => ({ ...prev, shippingCep: v }));
                              if (isValidCep(v)) {
                                setLoadingCep(true);
                                const addr = await lookupCep(v);
                                if (addr) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    shippingStreet: prev.shippingStreet || addr.logradouro,
                                    shippingNeighborhood: prev.shippingNeighborhood || addr.bairro,
                                    shippingCity: addr.localidade,
                                    shippingState: addr.uf,
                                  }));
                                  const quotes = await quoteShipping({
                                    from_postal_code: '01001-000',
                                    to_postal_code: v,
                                    packages: [{ weight: 0.5, height: 10, width: 15, length: 20 }],
                                  });
                                  setShippingOptions(quotes);
                                  setSelectedShipping(quotes[0] ?? null);
                                }
                                setLoadingCep(false);
                              }
                            }}
                            placeholder="00000-000" inputMode="numeric" />
                          {loadingCep && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                        {errors.shippingCep && <p className="text-sm text-destructive">{errors.shippingCep}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingNumber">Número *</Label>
                        <Input id="shippingNumber" name="shippingNumber" value={formData.shippingNumber} onChange={handleChange} placeholder="123" />
                        {errors.shippingNumber && <p className="text-sm text-destructive">{errors.shippingNumber}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingStreet">Rua / Logradouro *</Label>
                      <Input id="shippingStreet" name="shippingStreet" value={formData.shippingStreet} onChange={handleChange} placeholder="Av. Paulista" />
                      {errors.shippingStreet && <p className="text-sm text-destructive">{errors.shippingStreet}</p>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingComplement">Complemento</Label>
                        <Input id="shippingComplement" name="shippingComplement" value={formData.shippingComplement} onChange={handleChange} placeholder="Apto 42, bloco B" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingNeighborhood">Bairro *</Label>
                        <Input id="shippingNeighborhood" name="shippingNeighborhood" value={formData.shippingNeighborhood} onChange={handleChange} />
                        {errors.shippingNeighborhood && <p className="text-sm text-destructive">{errors.shippingNeighborhood}</p>}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="shippingCity">Cidade *</Label>
                        <Input id="shippingCity" name="shippingCity" value={formData.shippingCity} onChange={handleChange} />
                        {errors.shippingCity && <p className="text-sm text-destructive">{errors.shippingCity}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingState">UF *</Label>
                        <Input id="shippingState" name="shippingState" value={formData.shippingState} maxLength={2}
                          onChange={(e) => setFormData({ ...formData, shippingState: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                          placeholder="SP" />
                        {errors.shippingState && <p className="text-sm text-destructive">{errors.shippingState}</p>}
                      </div>
                    </div>

                    {shippingOptions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Modalidade de envio</Label>
                        <div className="grid gap-2">
                          {shippingOptions.map((opt) => (
                            <label key={opt.carrier} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedShipping?.carrier === opt.carrier ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                              <div className="flex items-center gap-3">
                                <input type="radio" name="ship" checked={selectedShipping?.carrier === opt.carrier} onChange={() => setSelectedShipping(opt)} />
                                <div>
                                  <p className="text-sm font-medium">{opt.service_name}</p>
                                  <p className="text-xs text-muted-foreground">Entrega em até {opt.delivery_days} dias úteis</p>
                                </div>
                              </div>
                              <span className="text-sm font-semibold">{totalPrice >= FREE_SHIPPING_THRESHOLD_BRL ? 'Grátis' : formatPrice(opt.price)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Instruções de entrega..." rows={2} />
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
                      Forma de pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex-1 cursor-pointer flex items-center gap-3">
                          <QrCode className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-muted-foreground">Aprovação imediata via Mercado Pago</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Cartão de crédito</p>
                            <p className="text-sm text-muted-foreground">Até 12x via Mercado Pago</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="boleto" id="boleto" />
                        <Label htmlFor="boleto" className="flex-1 cursor-pointer flex items-center gap-3">
                          <Barcode className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Boleto bancário</p>
                            <p className="text-sm text-muted-foreground">Compensação em 1-2 dias úteis</p>
                          </div>
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
