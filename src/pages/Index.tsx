import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, RefreshCcw, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import InlineAIAssistant from '@/components/home/InlineAIAssistant';
import FAQSection from '@/components/home/FAQSection';
import VideoReelsGallery from '@/components/home/VideoReelsGallery';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { organizationSchema, localBusinessSchema, webSiteSchema, faqSchema } from '@/components/seo/schemas';

import heroImage from '@/assets/hero-main.jpg';

export default function Index() {
  const { products, isLoading: productsLoading } = useProducts({});
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { t } = useLanguage();

  // Hero carousel with featured products (up to 10)
  const featuredProducts = products.filter((p) => p.isBestSeller).slice(0, 10);
  const heroProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 10);
  const [heroIndex, setHeroIndex] = useState(0);
  const currentHeroProduct = heroProducts[heroIndex];

  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const isLoading = productsLoading || categoriesLoading;

  const features = [
    { icon: Truck, title: t('features.shipping'), description: t('features.shippingDesc') },
    { icon: Shield, title: t('features.security'), description: t('features.securityDesc') },
    { icon: RefreshCcw, title: t('features.returns'), description: t('features.returnsDesc') },
    { icon: MessageCircle, title: t('features.support'), description: t('features.supportDesc') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-50" />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6"
              >
                {t('hero.badge')}
              </motion.span>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
              >
                {t('hero.title1')}
                <span className="text-gradient-primary block">{t('hero.title2')}</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8"
              >
                {t('hero.subtitle')}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/catalogo">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-rose-dark group">
                    {t('hero.cta.catalog')}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                {currentHeroProduct && (
                  <Link to={`/producto/${currentHeroProduct.id}`}>
                    <Button size="lg" variant="outline" className="border-2">
                      {t('hero.cta.viewProduct')}
                    </Button>
                  </Link>
                )}
              </motion.div>
            </motion.div>

            {/* Hero Image - rotates through products */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[3/4] max-w-lg mx-auto">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-gold/20 rounded-3xl blur-2xl" />
                <img
                  src={currentHeroProduct?.images?.[0] || heroImage}
                  alt={currentHeroProduct?.name || 'Meca Store'}
                  className="relative rounded-3xl object-cover w-full h-full shadow-lg transition-all duration-700"
                  key={heroIndex}
                />
                
                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-card"
                >
                  <p className="text-sm text-muted-foreground">{t('hero.from')}</p>
                  <p className="font-display text-2xl font-bold text-primary">₲ 99.000</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-4 -right-4 bg-card p-4 rounded-2xl shadow-card"
                >
                  <p className="text-2xl font-bold text-foreground">5000+</p>
                  <p className="text-sm text-muted-foreground">{t('hero.happyClients')}</p>
                </motion.div>
              </div>

              {/* Product indicators */}
              {heroProducts.length > 1 && (
                <div className="flex gap-1.5 justify-center mt-8">
                  {heroProducts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === heroIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 bg-muted/50 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline AI Assistant */}
      <InlineAIAssistant />

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">{t('categories.title')}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">{t('categories.subtitle')}</p>
          </motion.div>

          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-soft">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12"
          >
            <div>
              <h2 className="font-display text-4xl font-bold text-foreground mb-2">{t('featured.title')}</h2>
              <p className="text-muted-foreground">{t('featured.subtitle')}</p>
            </div>
            <Link to="/catalogo">
              <Button variant="outline" className="group">
                {t('featured.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">{t('featured.empty')}</p>
          )}
        </div>
      </section>

      {/* Video Reels Gallery */}
      <VideoReelsGallery />

      {/* B2B CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-16"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-4 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-4">
                {t('b2b.badge')}
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                {t('b2b.title')}
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8">{t('b2b.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/atacado">
                  <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90">
                    {t('b2b.cta')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10">
                  {t('b2b.catalog')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Products Grid */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">{t('arrivals.title')}</h2>
            <p className="text-muted-foreground">{t('arrivals.subtitle')}</p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">{t('arrivals.empty')}</p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/catalogo">
              <Button size="lg" variant="outline" className="group">
                {t('arrivals.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      <Footer />
    </div>
  );
}
