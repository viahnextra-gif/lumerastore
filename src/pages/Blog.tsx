import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { blogPosts } from '@/data/blogPosts';

export default function Blog() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Lumera',
    description: 'Guías, tendencias y consejos de belleza y cosméticos en Paraguay.',
    url: 'https://lojalumera.lovable.app/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Lumera',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Blog de Belleza y Cosméticos | Guías y Tendencias | Lumera"
        description="Descubre guías de belleza, tendencias de cosméticos, tips de skincare y más. Blog de Lumera Paraguay."
        keywords="blog belleza, tendencias cosméticos paraguay, guía skincare, tips maquillaje"
        canonical="https://lojalumera.lovable.app/blog"
        jsonLd={jsonLd}
      />
      <Header />

      <section className="py-12">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Blog' }]} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Blog Lumera Store</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Guías de estilo, tendencias, tips de negocio y todo sobre moda femenina en Paraguay.
            </p>
          </motion.div>
          {/* Category navigation */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            <Link to="/blog/moda" className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors">Moda</Link>
            <Link to="/blog/tendencias" className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors">Tendencias</Link>
            <Link to="/blog/guia" className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors">Guías</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
