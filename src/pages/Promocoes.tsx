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

// Promoção sazonal configurável
const PROMO_CONFIG = {
  title: 'Liquidação de Outono 🍂',
  subtitle: 'Até 40% de desconto em peças selecionadas',
  description: 'Renove seu guarda-roupa com as melhores ofertas da temporada. Peças exclusivas com preços imperdíveis por tempo limitado.',
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
  banners: [
    { icon: Percent, title: 'Até 40% OFF', desc: 'Em peças selecionadas' },
    { icon: Gift, title: 'Frete Grátis', desc: 'Nas compras acima de ₲500.000' },
    { icon: Tag, title: 'Cupom OUTONO10', desc: '10% extra na primeira compra' },
  ],
};

export default function Promocoes() {
  const [visibleCount, setVisibleCount] = useState(8);
  const { products, isLoading } = useProducts({ pageSize: 50, sortBy: 'popular' });

  // Simula produtos em promoção (featured ou com preço < média)
  const promoProducts = products.slice(0, visibleCount);

  return (
    <>
      <SEOHead
        title="Promoções Sazonais | MecaStore"
        description="Aproveite as melhores promoções de moda feminina. Descontos imperdíveis em vestidos, blusas, saias e muito mais."
        canonical="/promocoes"
      />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/30 to-secondary/20 py-16 sm:py-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-10"
            >
              <Badge className="bg-destructive text-destructive-foreground mb-4 text-sm px-4 py-1">
                <Flame className="h-4 w-4 mr-1" /> Oferta por Tempo Limitado
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                {PROMO_CONFIG.title}
              </h1>
              <p className="text-xl text-primary font-semibold mb-2">
                {PROMO_CONFIG.subtitle}
              </p>
              <p className="text-muted-foreground text-lg">
                {PROMO_CONFIG.description}
              </p>
            </motion.div>

            <CountdownTimer targetDate={PROMO_CONFIG.endDate} />
          </div>
        </section>

        {/* Banners de benefícios */}
        <section className="border-y border-border bg-card">
          <div className="container py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {PROMO_CONFIG.banners.map((banner, i) => (
                <motion.div
                  key={banner.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4 justify-center sm:justify-start"
                >
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

        {/* Produtos em Promoção */}
        <section className="container py-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Produtos em Destaque
            </h2>
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
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Ver mais ofertas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {products.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">Nenhuma promoção ativa no momento.</p>
                  <Link to="/catalogo">
                    <Button>Explorar Catálogo</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* CTA */}
        <section className="bg-primary/5 border-t border-border py-16">
          <div className="container text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Não perca as melhores ofertas!
            </h2>
            <p className="text-muted-foreground mb-6">
              Cadastre-se para receber as promoções exclusivas diretamente no seu WhatsApp.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Criar minha conta
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
