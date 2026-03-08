import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, CheckCircle, MessageCircle, MapPin, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getCityBySlug, cities, getCitiesByCountry } from '@/data/cities';
import { breadcrumbSchema, localBusinessSchema } from '@/components/seo/schemas';
import { trackEvent } from '@/components/seo/AnalyticsTracker';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const benefits = [
  { icon: Truck, text: 'Envío directo a tu ciudad' },
  { icon: Package, text: 'Precios de mayorista desde 6 prendas' },
  { icon: Shield, text: 'Calidad garantizada' },
  { icon: CheckCircle, text: '+5,000 clientas satisfechas' },
  { icon: Clock, text: 'Devolución gratis en 7 días' },
  { icon: MessageCircle, text: 'Atención vía WhatsApp' },
];

const categories = [
  { name: 'Vestidos', slug: 'vestidos', emoji: '👗' },
  { name: 'Conjuntos', slug: 'conjuntos', emoji: '✨' },
  { name: 'Blusas', slug: 'blusas', emoji: '👚' },
  { name: 'Pantalones', slug: 'calcas', emoji: '👖' },
  { name: 'Faldas', slug: 'saias', emoji: '💃' },
  { name: 'Shorts', slug: 'shorts', emoji: '🩳' },
];

export default function CityLanding() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const city = getCityBySlug(citySlug || '');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!city) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Ciudad no encontrada</h1>
          <Link to="/"><Button variant="outline">Volver al inicio</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

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
        source: `city-${city.slug}`,
        status: 'cold',
      });
      trackEvent('generate_lead', { source: `city-${city.slug}`, city: city.name });
      toast.success('¡Gracias! Te contactaremos pronto.');
      setName(''); setPhone(''); setEmail('');
    } catch {
      toast.error('Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: `city-${city.slug}`, city: city.name });
    window.open(`https://wa.me/595981000000?text=Hola!%20Soy%20de%20${encodeURIComponent(city.name)}%20y%20quiero%20más%20información`, '_blank');
  };

  const pageUrl = `/moda-femenina/${city.slug}`;
  const canonicalUrl = `https://mecastorepy.lovable.app${pageUrl}`;

  const citySchema = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: `Meca Store – Moda Femenina en ${city.name}`,
    url: canonicalUrl,
    description: city.metaDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.department,
      addressCountry: city.country,
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
    },
    priceRange: city.country === 'PY' ? '₲₲' : 'R$R$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:00',
    },
  };

  const breadcrumbItems = [
    { name: 'Inicio', url: '/' },
    { name: 'Moda Femenina', url: '/moda-femenina' },
    { name: city.name, url: pageUrl },
  ];

  const otherCities = getCitiesByCountry(city.country).filter(c => c.slug !== city.slug).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={city.metaTitle}
        description={city.metaDescription}
        keywords={city.keywords.join(', ')}
        canonical={canonicalUrl}
        jsonLd={[citySchema, breadcrumbSchema(breadcrumbItems)]}
      />
      <Header />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-hero">
        <div className="container text-center">
          <Breadcrumbs
            items={[
              { label: 'Moda Femenina', href: '/moda-femenina' },
              { label: city.name },
            ]}
            className="justify-center mb-6 text-primary-foreground/70"
          />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-1.5 mb-6">
              <MapPin className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">{city.name}, {city.department}</span>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6"
          >
            {city.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-4"
          >
            {city.heroSubtitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-primary-foreground/70 mb-8"
          >
            📦 {city.shippingNote}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 text-lg px-8" asChild>
              <Link to="/catalogo">Ver Catálogo <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 text-lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Local info */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Moda Femenina con Envío a {city.name}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">{city.localInfo}</p>
            <p className="text-muted-foreground italic">{city.localLandmarks}</p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">
            Categorías Populares en {city.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/catalogo?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">
            ¿Por qué comprar en Meca Store desde {city.name}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 bg-card p-5 rounded-xl border border-border"
              >
                <b.icon className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{b.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center"
          >
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: city.testimonial.stars }).map((_, j) => (
                <Star key={j} className="h-5 w-5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
              ))}
            </div>
            <p className="text-lg text-foreground italic mb-4">"{city.testimonial.text}"</p>
            <p className="text-sm text-muted-foreground font-medium">{city.testimonial.name} — {city.name}</p>
          </motion.div>
        </div>
      </section>

      {/* Nearby areas */}
      <section className="py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            También enviamos a zonas cercanas
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {city.nearbyAreas.map(area => (
              <span key={area} className="px-4 py-2 bg-muted rounded-full text-sm text-foreground font-medium">
                📍 {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="lead-form" className="py-20 bg-muted/50">
        <div className="container max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card p-8 md:p-10 rounded-3xl shadow-md border border-border">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-2">
              ¡Ofertas exclusivas para {city.name}!
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Déjanos tus datos y te contactaremos con los mejores precios y promociones.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Tu nombre *" value={name} onChange={e => setName(e.target.value)} required />
              <Input placeholder="Tu teléfono / WhatsApp *" value={phone} onChange={e => setPhone(e.target.value)} required />
              <Input placeholder="Tu email (opcional)" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                {loading ? 'Enviando...' : 'Quiero Recibir Ofertas' }
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">No compartimos tus datos. Política de privacidad.</p>
          </motion.div>
        </div>
      </section>

      {/* Other cities */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            {city.country === 'PY' ? 'Moda Femenina en otras ciudades de Paraguay' : 'Moda Feminina em outras cidades do Brasil'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {otherCities.map(c => (
              <Link
                key={c.slug}
                to={`/moda-femenina/${c.slug}`}
                className="flex items-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
              >
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-foreground group-hover:text-primary transition-colors font-medium text-sm">
                  Moda en {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-hero">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            ¿Lista para renovar tu estilo en {city.name}?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 text-lg px-8" asChild>
              <Link to="/catalogo">Ver Catálogo <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 text-lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="mr-2 h-5 w-5" /> Hablar por WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
