import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { blogPosts } from '@/data/blogPosts';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Artículo no encontrado</h1>
          <Link to="/blog"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al blog</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    author: { '@type': 'Organization', name: 'Meca Store' },
    publisher: {
      '@type': 'Organization',
      name: 'Meca Store',
      logo: { '@type': 'ImageObject', url: 'https://mecastorepy.lovable.app/favicon.ico' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://mecastorepy.lovable.app/blog/${post.slug}` },
    wordCount: post.content.split(' ').length,
    articleSection: post.category,
    keywords: post.keywords.join(', '),
  };

  const relatedPosts = blogPosts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${post.title} | Blog Meca Store`}
        description={post.excerpt}
        keywords={post.keywords.join(', ')}
        canonical={`https://mecastorepy.lovable.app/blog/${post.slug}`}
        ogImage={post.image}
        ogType="article"
        jsonLd={blogPostingSchema}
      />
      <Header />

      <article className="py-12">
        <div className="container max-w-3xl">
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{post.category}</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime}</span>
            </div>
          </motion.div>

          <div className="aspect-video rounded-2xl overflow-hidden mb-10">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <ContentWithRouterLinks html={post.content} />

          {/* Share */}
          <div className="mt-10 pt-6 border-t border-border flex items-center gap-3">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Compartir:</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">WhatsApp</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Facebook</a>
          </div>

          {/* Related */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Artículos Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(rp => (
                  <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group block bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{rp.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
}
