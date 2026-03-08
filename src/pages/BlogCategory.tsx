import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { blogPosts } from '@/data/blogPosts';

const categoryMeta: Record<string, { title: string; description: string; keywords: string; heading: string; intro: string }> = {
  moda: {
    title: 'Blog de Moda Femenina | Estilos, Outfits y Tendencias | Meca Store',
    description: 'Artículos sobre moda femenina en Paraguay: guías de estilo, outfits para cada ocasión, capsule wardrobe y más. Blog Meca Store.',
    keywords: 'moda femenina, estilo mujer, outfits, guardarropa cápsula, moda paraguay',
    heading: 'Moda Femenina',
    intro: 'Guías de estilo, outfits para cada ocasión y todo lo que necesitas saber sobre moda femenina en Paraguay.',
  },
  tendencias: {
    title: 'Tendencias de Moda 2026 | Colores, Accesorios y Estilos | Meca Store',
    description: 'Las últimas tendencias de moda femenina: colores de temporada, accesorios imprescindibles y estilos que marcan la pauta en Paraguay.',
    keywords: 'tendencias moda 2026, colores temporada, accesorios moda, moda sustentable',
    heading: 'Tendencias',
    intro: 'Las últimas tendencias de moda: colores de temporada, accesorios imprescindibles y estilos que marcan la pauta.',
  },
  guia: {
    title: 'Guías de Moda y Negocio | Tallas, Reventa y Tips | Meca Store',
    description: 'Guías prácticas: cómo encontrar tu talla, revender ropa femenina, elegir telas para el clima paraguayo y más.',
    keywords: 'guía tallas ropa, revender ropa, telas clima cálido, negocio moda femenina',
    heading: 'Guías Prácticas',
    intro: 'Guías paso a paso para encontrar tu talla perfecta, elegir las mejores telas y emprender en el mundo de la moda.',
  },
};

const categoryFilterMap: Record<string, string[]> = {
  moda: ['Moda'],
  tendencias: ['Tendencias'],
  guia: ['Guía', 'Negocio'],
};

export default function BlogCategory() {
  const { category } = useParams<{ category: string }>();
  const meta = category ? categoryMeta[category] : null;
  const filters = category ? categoryFilterMap[category] : null;

  if (!meta || !filters) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Categoría no encontrada</h1>
          <Link to="/blog" className="text-primary hover:underline">Volver al blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const posts = blogPosts.filter(p => filters.includes(p.category));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.heading,
    description: meta.description,
    url: `https://mecastorepy.lovable.app/blog/${category}`,
    isPartOf: { '@type': 'Blog', name: 'Blog Meca Store', url: 'https://mecastorepy.lovable.app/blog' },
    publisher: { '@type': 'Organization', name: 'Meca Store' },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        canonical={`https://mecastorepy.lovable.app/blog/${category}`}
        jsonLd={jsonLd}
      />
      <Header />

      <section className="py-12">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: meta.heading }]} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{meta.heading}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{meta.intro}</p>
          </motion.div>

          {/* Category navigation */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {Object.entries(categoryMeta).map(([key, val]) => (
              <Link
                key={key}
                to={`/blog/${key}`}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  key === category
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                {val.heading}
              </Link>
            ))}
            <Link to="/blog" className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              Todos
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No hay artículos en esta categoría todavía.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">{post.category}</span>
                      <h2 className="font-display text-xl font-bold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
