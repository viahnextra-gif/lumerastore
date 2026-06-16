import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { organizationSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { getCitiesByCountry } from '@/data/cities';
import { Input } from '@/components/ui/input';

const BASE_URL = 'https://lojalumera.lovable.app';

export default function ModaFemenina() {
  const [search, setSearch] = useState('');
  const brCities = getCitiesByCountry('BR');

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const query = normalize(search);

  const filteredBr = useMemo(() => brCities.filter(c => normalize(c.name).includes(query) || normalize(c.department).includes(query)), [query]);

  const brByState = filteredBr.reduce<Record<string, typeof brCities>>((acc, city) => {
    if (!acc[city.department]) acc[city.department] = [];
    acc[city.department].push(city);
    return acc;
  }, {});

  const jsonLd = [
    organizationSchema(),
    breadcrumbSchema([
      { name: 'Início', url: '/' },
      { name: 'Cosméticos e Beleza', url: '/moda-femenina' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Cosméticos e Beleza — Todas as Cidades',
      description: 'Encontre cosméticos e produtos de beleza na sua cidade. Maquiagem, skincare, perfumaria e mais com envio para todo o Brasil.',
      url: `${BASE_URL}/moda-femenina`,
    },
  ];

  return (
    <>
      <SEOHead
        title="Cosméticos e Beleza no Brasil | Maquiagem e Skincare | Lumera"
        description="Encontre cosméticos e produtos de beleza na sua cidade. Maquiagem, skincare, perfumaria e mais com envio para todo o Brasil."
        canonical={`${BASE_URL}/moda-femenina`}
        keywords="cosméticos brasil, maquiagem, skincare, perfumaria, beleza"
        jsonLd={jsonLd}
      />
      <Header />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
          <div className="container text-center">
            <Breadcrumbs items={[{ label: 'Cosméticos e Beleza' }]} className="justify-center mb-6" />
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Cosméticos e Beleza na sua Cidade
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Encontre maquiagem, skincare, perfumaria e mais com entrega direta. Selecione sua cidade para ver ofertas e prazo de envio.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar cidade..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🇧🇷</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Brasil</h2>
          </div>
          {Object.entries(brByState)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([state, cities]) => (
              <div key={state} className="mb-10">
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">{state}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cities.map((city) => (
                    <CityCard key={city.slug} city={city} label={`Beleza em ${city.name}`} />
                  ))}
                </div>
              </div>
            ))}
          {filteredBr.length === 0 && <p className="text-muted-foreground">Nenhuma cidade encontrada.</p>}
        </section>

        <section className="bg-primary/5 py-12">
          <div className="container text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">Não encontrou sua cidade?</h2>
            <p className="text-muted-foreground mb-6">Enviamos para todo o Brasil. Explore nosso catálogo completo.</p>
            <Link to="/catalogo" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
              Ver Catálogo Completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function CityCard({ city, label }: { city: { slug: string; name: string; population: string; department: string }; label: string }) {
  return (
    <Link to={`/moda-femenina/${city.slug}`} className="group flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all">
      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="font-medium text-foreground group-hover:text-primary transition-colors block">{label}</span>
        <span className="text-sm text-muted-foreground">{city.department} · {city.population} hab.</span>
      </div>
    </Link>
  );
}
