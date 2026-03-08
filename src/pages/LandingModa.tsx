import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { trackEvent } from '@/components/seo/AnalyticsTracker';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const testimonials = [
  { name: 'María G.', city: 'Asunción', text: 'La mejor tienda de moda femenina. Calidad increíble y envío rápido.', stars: 5 },
  { name: 'Ana P.', city: 'Ciudad del Este', text: 'Compré al por mayor y los precios son imbatibles. ¡Recomendadísimo!', stars: 5 },
  { name: 'Lucía R.', city: 'Encarnación', text: 'Vestidos hermosos, tela de calidad. Ya soy clienta fija.', stars: 5 },
];

const benefits = [
  'Envíos a todo Paraguay',
  'Precios de mayorista desde 6 prendas',
  'Calidad garantizada',
  'Más de 5,000 clientas satisfechas',
  'Devolución gratis en 7 días',
  'Atención personalizada vía WhatsApp',
];

export default function LandingModa() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Por favor, completa tu nombre y teléfono.');
      return;
    }
    setLoading(true);
    try {
      await supabase.from('leads').insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        source: 'landing-moda',
        status: 'cold',
      });
      trackEvent('generate_lead', { source: 'landing-moda', method: 'form' });
      toast.success('¡Gracias! Te contactaremos pronto.');
      setName(''); setPhone(''); setEmail('');
    } catch {
      toast.error('Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'landing-moda' });
    window.open('https://wa.me/595981000000?text=Hola!%20Vi%20su%20tienda%20y%20quiero%20más%20información', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Moda Femenina en Paraguay | Meca Store"
        description="Descubre vestidos, conjuntos y blusas de alta calidad. Envíos a todo Paraguay. Precios de mayorista desde 6 prendas. ¡Compra ahora!"
        keywords="moda femenina paraguay, ropa mujer asunción, vestidos paraguay, tienda ropa online, mayorista ropa"
        canonical="https://mecastorepy.lovable.app/moda-femenina"
        noindex
      />

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-hero">
        <div className="container relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6"
          >
            Tu Estilo, Tu Poder ✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8"
          >
            La moda femenina que te hace brillar. Vestidos, conjuntos y blusas con calidad premium y precios accesibles.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 text-lg px-8" onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Quiero Saber Más <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 text-lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">¿Por qué elegir Meca Store?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 bg-card p-4 rounded-xl shadow-sm">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">Lo que dicen nuestras clientas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="h-5 w-5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />)}
                </div>
                <p className="text-foreground mb-4 italic">"{t.text}"</p>
                <p className="text-sm text-muted-foreground font-medium">{t.name} — {t.city}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="lead-form" className="py-20 bg-muted/50">
        <div className="container max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card p-8 md:p-10 rounded-3xl shadow-md border border-border">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-2">¡Recibe ofertas exclusivas!</h2>
            <p className="text-muted-foreground text-center mb-8">Déjanos tus datos y te contactaremos con los mejores precios.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Tu nombre *" value={name} onChange={e => setName(e.target.value)} required />
              <Input placeholder="Tu teléfono / WhatsApp *" value={phone} onChange={e => setPhone(e.target.value)} required />
              <Input placeholder="Tu email (opcional)" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                {loading ? 'Enviando...' : 'Quiero Recibir Ofertas'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">No compartimos tus datos. Política de privacidad.</p>
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10 border-t border-border">
        <div className="container flex flex-wrap justify-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2"><Truck className="h-5 w-5" /> Envíos a todo PY</div>
          <div className="flex items-center gap-2"><Shield className="h-5 w-5" /> Compra segura</div>
          <div className="flex items-center gap-2"><Star className="h-5 w-5" /> +5000 clientas</div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[var(--gradient-hero)]">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">¿Lista para renovar tu estilo?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogo">
              <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 text-lg px-8">
                Ver Catálogo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 text-lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="mr-2 h-5 w-5" /> Hablar por WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
