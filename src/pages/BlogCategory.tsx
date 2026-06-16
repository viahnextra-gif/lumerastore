import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { blogPosts } from '@/data/blogPosts';

const categoryMeta: Record<string, { title: string; description: string; keywords: string; heading: string; intro: string }> = {
  beleza: {
    title: 'Blog de Beleza | Skincare, Maquiagem e Cuidados | Lumera Store',
    description: 'Artigos sobre beleza no Brasil: guias de skincare, tendências de maquiagem, rotinas de cuidado e muito mais. Blog Lumera Store.',
    keywords: 'beleza, skincare, maquiagem, cuidados, blog beleza brasil',
    heading: 'Beleza',
    intro: 'Guias de skincare, tendências de maquiagem e tudo sobre cuidados de beleza no Brasil.',
  },
  tendencias: {
    title: 'Tendências de Beleza 2026 | Maquiagem, Cores e Cuidados | Lumera Store',
    description: 'As últimas tendências de beleza: cores da temporada, lançamentos de maquiagem e cuidados de skincare que dominam o Brasil.',
    keywords: 'tendências beleza 2026, cores temporada, maquiagem 2026, skincare',
    heading: 'Tendências',
    intro: 'As últimas tendências de beleza: cores da temporada, lançamentos e estilos em alta.',
  },
  guia: {
    title: 'Guias de Beleza e Negócio | Skincare, Revenda e Dicas | Lumera Store',
    description: 'Guias práticos: como montar sua rotina de skincare, revender cosméticos no Brasil, escolher perfume ideal e mais.',
    keywords: 'guia skincare, revender cosméticos, perfume ideal, negócio beleza brasil',
    heading: 'Guias Práticos',
    intro: 'Guias passo a passo para montar sua rotina ideal, escolher os melhores produtos e empreender no mundo da beleza.',
  },
};

const categoryFilterMap: Record<string, string[]> = {
  beleza: ['Beleza', 'Guia'],
  tendencias: ['Tendências'],
  guia: ['Guia', 'Negócio'],
};

export default function BlogCategory() {
  const location = useLocation();
  const category = location.pathname.split('/').pop() || '';
  const meta = categoryMeta[category] || null;
  const filters = categoryFilterMap[category] || null;

  if (!meta || !filters) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Categoria não encontrada</h1>
          <Link to="/blog" className="text-primary hover:underline">Voltar ao blog</Link>
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
    url: `https://lojalumera.lovable.app/blog/${category}`,
    isPartOf: { '@type': 'Blog', name: 'Blog Lumera Store', url: 'https://lojalumera.lovable.app/blog' },
    publisher: { '@type': 'Organization', name: 'Lumera Store' },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        canonical={`https://lojalumera.lovable.app/blog/${category}`}
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
            <p className="text-center text-muted-foreground py-12">Nenhum artigo nesta categoria ainda.</p>
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
