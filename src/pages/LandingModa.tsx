import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { trackEvent } from '@/components/seo/AnalyticsTracker';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingModa() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const testimonials = [
    { name: 'María G.', city: 'Asunción', text: t('landing.testimonial1'), stars: 5 },
    { name: 'Ana P.', city: 'Ciudad del Este', text: t('landing.testimonial2'), stars: 5 },
    { name: 'Lucía R.', city: 'Encarnación', text: t('landing.testimonial3'), stars: 5 },
  ];

  const benefits = [
    t('landing.benefit1'), t('landing.benefit2'), t('landing.benefit3'),
    t('landing.benefit4'), t('landing.benefit5'), t('landing.benefit6'),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error(t('landing.formValidation'));
      return;
    }
    setLoading(true);
    try {
      await supabase.from('leads').insert({ name: name.trim(), phone: phone.trim(), email: email.trim() || null, source: 'landing-moda', status: 'cold' });
      trackEvent('generate_lead', { source: 'landing-moda', method: 'form' });
      toast.success(t('landing.formSuccess'));
      setName(''); setPhone(''); setEmail('');
    } catch {
      toast.error(t('landing.formError'));
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
        title="Cosméticos y Belleza en Paraguay | Lumera"
        description="Descubre maquillaje, skincare y perfumería de alta calidad. Envíos a todo Paraguay."
        keywords="cosméticos paraguay, maquillaje, skincare, belleza, lumera"
        canonical="https://lojalumera.lovable.app/moda"
        noindex
      />

      <Header />

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-hero">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            {t('landing.heroTitle')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            {t('landing.heroSubtitle')}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 text-lg px-8" onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('landing.wantToKnow')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" className="bg-[#25D366] text-white hover:bg-[#1da851] text-lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">{t('landing.whyChoose')}</h2>
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
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">{t('landing.testimonials')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tm, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: tm.stars }).map((_, j) => <Star key={j} className="h-5 w-5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />)}
                </div>
                <p className="text-foreground mb-4 italic">"{tm.text}"</p>
                <p className="text-sm text-muted-foreground font-medium">{tm.name} — {tm.city}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="lead-form" className="py-20 bg-muted/50">
        <div className="container max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card p-8 md:p-10 rounded-3xl shadow-md border border-border">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-2">{t('landing.formTitle')}</h2>
            <p className="text-muted-foreground text-center mb-8">{t('landing.formSubtitle')}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder={t('landing.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} required />
              <Input placeholder={t('landing.phonePlaceholder')} value={phone} onChange={e => setPhone(e.target.value)} required />
              <Input placeholder={t('landing.emailPlaceholder')} type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                {loading ? t('landing.sending') : t('landing.wantOffers')}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">{t('landing.privacyNote')}</p>
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10 border-t border-border">
        <div className="container flex flex-wrap justify-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2"><Truck className="h-5 w-5" /> {t('landing.shippingAll')}</div>
          <div className="flex items-center gap-2"><Shield className="h-5 w-5" /> {t('landing.securePurchase')}</div>
          <div className="flex items-center gap-2"><Star className="h-5 w-5" /> {t('landing.clients5000')}</div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-hero">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">{t('landing.readyTitle')}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogo">
              <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 text-lg px-8">
                {t('landing.viewCatalog')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" className="bg-[#25D366] text-white hover:bg-[#1da851] text-lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="mr-2 h-5 w-5" /> {t('landing.talkWhatsApp')}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
