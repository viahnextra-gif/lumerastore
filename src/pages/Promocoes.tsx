import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Tag, Percent, Gift, Flame, ArrowRight, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CountdownTimer from '@/components/CountdownTimer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

const PROMO_END_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export default function Promocoes() {
  const [visibleCount, setVisibleCount] = useState(8);
  const { products, isLoading } = useProducts({ pageSize: 50, sortBy: 'popular' });
  const { t } = useLanguage();

  const promoProducts = products.slice(0, visibleCount);

  const banners = [
    { icon: Percent, title: t('promo.off'), desc: t('promo.offDesc') },
    { icon: Gift, title: t('promo.freeShipping'), desc: t('promo.freeShippingDesc') },
    { icon: Tag, title: t('promo.coupon'), desc: t('promo.couponDesc') },
  ];

  return (
    <>
      <SEOHead
        title={t('promo.seoTitle')}
        description={t('promo.seoDesc')}
        canonical="/promocoes"
      />
      <Header />

      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/30 to-secondary/20 py-16 sm:py-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
          </div>

          <div className="container relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-10">
              <Badge className="bg-destructive text-destructive-foreground mb-4 text-sm px-4 py-1">
                <Flame className="h-4 w-4 mr-1" /> {t('promo.limitedOffer')}
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">{t('promo.title')}</h1>
              <p className="text-xl text-primary font-semibold mb-2">{t('promo.subtitle')}</p>
              <p className="text-muted-foreground text-lg">{t('promo.description')}</p>
            </motion.div>
            <CountdownTimer targetDate={PROMO_END_DATE} />
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="container py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {banners.map((banner, i) => (
                <motion.div key={banner.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-4 justify-center sm:justify-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <banner.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{banner.title}</p>
                    <p className="text-sm text-muted-foreground">{banner.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{t('promo.featuredProducts')}</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {promoProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              {visibleCount < products.length && (
                <div className="text-center mt-10">
                  <Button size="lg" variant="outline" onClick={() => setVisibleCount((prev) => prev + 8)} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    {t('promo.viewMore')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {products.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">{t('promo.noPromos')}</p>
                  <Link to="/catalogo"><Button>{t('promo.exploreCatalog')}</Button></Link>
                </div>
              )}
            </>
          )}
        </section>

        <section className="bg-primary/5 border-t border-border py-16">
          <div className="container text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">{t('promo.ctaTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('promo.ctaSubtitle')}</p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('promo.ctaButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
