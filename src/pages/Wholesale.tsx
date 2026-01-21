import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Package, Percent, Users, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';

const benefits = [
  {
    icon: Percent,
    title: 'Precios Exclusivos',
    description: 'Hasta 40% de descuento en precios mayoristas',
  },
  {
    icon: Package,
    title: 'Packs Flexibles',
    description: 'Desde 3 piezas por modelo, mezcla colores y tallas',
  },
  {
    icon: Users,
    title: 'Capacitación',
    description: 'Acceso a material de ventas y tips de negocio',
  },
  {
    icon: MessageCircle,
    title: 'Soporte VIP',
    description: 'Atención prioritaria vía WhatsApp',
  },
];

const wholesaleProducts = products.filter((p) => p.wholesalePrice).slice(0, 4);

export default function Wholesale() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTJoLTJ2Mmgyem0tNiA2di00aC0ydjRoMnptMC02di0yaC0ydjJoMnptLTYgNnYtNGgtMnY0aDJ6bTAtNnYtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
              🏪 Programa Mayorista
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Haz crecer tu negocio con Meca Store
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Únete a nuestra red de revendedoras y accede a precios exclusivos, 
              packs flexibles y todo el apoyo que necesitas para triunfar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90">
                Solicitar Acceso
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10">
                Ver Catálogo B2B
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-soft">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Beneficios Exclusivos
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Todo lo que necesitas para impulsar tu negocio de moda
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-lift bg-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-display text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Niveles de Precio
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Mientras más compres, más ahorras
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Pack Inicial', qty: '3-5 piezas', discount: '20%', color: 'border-border' },
              { name: 'Pack Negocio', qty: '6-11 piezas', discount: '30%', color: 'border-primary', featured: true },
              { name: 'Pack Pro', qty: '12+ piezas', discount: '40%', color: 'border-gold' },
            ].map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl border-2 ${tier.color} ${tier.featured ? 'bg-primary/5' : 'bg-card'}`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Más Popular
                  </span>
                )}
                <div className="text-center">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">{tier.qty}</p>
                  <p className="text-4xl font-bold text-primary mb-2">-{tier.discount}</p>
                  <p className="text-sm text-muted-foreground">sobre precio retail</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12"
          >
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                Productos Disponibles
              </h2>
              <p className="text-muted-foreground">
                Vista previa de nuestro catálogo mayorista
              </p>
            </div>
            <Button variant="outline">
              Ver Catálogo Completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {wholesaleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Solicita tu Acceso Mayorista
              </h2>
              <p className="text-muted-foreground">
                Completa el formulario y nos pondremos en contacto contigo
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6 p-8 rounded-2xl bg-card border border-border"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business">Nombre del Negocio</Label>
                  <Input id="business" placeholder="Tu tienda o marca" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp</Label>
                <Input id="phone" type="tel" placeholder="+595 xxx xxx xxx" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" placeholder="Tu ciudad" />
              </div>

              <div className="space-y-2">
                <Label>¿Cómo vendes actualmente?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Instagram', 'Facebook', 'Tienda física', 'WhatsApp'].map((channel) => (
                    <label
                      key={channel}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors"
                    >
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground">
                Enviar Solicitud
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Responderemos en un máximo de 24 horas hábiles
              </p>
            </motion.form>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">
              Preguntas Frecuentes
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: '¿Cuál es el pedido mínimo?',
                  a: 'El pedido mínimo es de 3 piezas del mismo modelo, pudiendo mezclar colores y tallas.',
                },
                {
                  q: '¿Cómo realizo el pago?',
                  a: 'Aceptamos transferencias bancarias, pagos con tarjeta y pagos en efectivo en nuestro local.',
                },
                {
                  q: '¿Cuánto tarda el envío?',
                  a: 'Envíos a Asunción en 2-3 días hábiles. Interior del país 5-7 días hábiles.',
                },
              ].map((faq, index) => (
                <div key={index} className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                      <p className="text-muted-foreground">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
