import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, RefreshCcw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { products, categories } from '@/data/products';

import heroImage from '@/assets/hero-main.jpg';

const features = [
  {
    icon: Truck,
    title: 'Envío Express',
    description: 'Entrega rápida a todo Paraguay',
  },
  {
    icon: Shield,
    title: 'Pago Seguro',
    description: 'Transacciones 100% protegidas',
  },
  {
    icon: RefreshCcw,
    title: 'Cambios Fáciles',
    description: '30 días para cambiar tu producto',
  },
  {
    icon: MessageCircle,
    title: 'Soporte 24/7',
    description: 'Atención vía WhatsApp',
  },
];

export default function Index() {
  const featuredProducts = products.filter((p) => p.isBestSeller || p.isNew).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-50" />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
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
                ✨ Nueva Colección Verano 2025
              </motion.span>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
              >
                Elegancia que
                <span className="text-gradient-primary block">define tu estilo</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8"
              >
                Descubre la última tendencia en moda femenina. Piezas únicas para cada momento de tu vida.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/catalogo">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-rose-dark group">
                    Ver Colección
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/atacado">
                  <Button size="lg" variant="outline" className="border-2">
                    Comprar al Mayor
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[3/4] max-w-lg mx-auto">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-gold/20 rounded-3xl blur-2xl" />
                <img
                  src={heroImage}
                  alt="Moda Femenina Meca Store"
                  className="relative rounded-3xl object-cover w-full h-full shadow-lg"
                />
                
                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-card"
                >
                  <p className="text-sm text-muted-foreground">Desde</p>
                  <p className="font-display text-2xl font-bold text-primary">₲ 99.000</p>
                </motion.div>

                {/* Floating Stats */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-4 -right-4 bg-card p-4 rounded-2xl shadow-card"
                >
                  <p className="text-2xl font-bold text-foreground">5000+</p>
                  <p className="text-sm text-muted-foreground">Clientas felices</p>
                </motion.div>
              </div>
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

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Explora por Categoría
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Encuentra exactamente lo que buscas en nuestras categorías cuidadosamente seleccionadas
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
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
              <h2 className="font-display text-4xl font-bold text-foreground mb-2">
                Productos Destacados
              </h2>
              <p className="text-muted-foreground">
                Los favoritos de nuestras clientas
              </p>
            </div>
            <Link to="/catalogo">
              <Button variant="outline" className="group">
                Ver Todo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* B2B CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-16"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-4 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-4">
                🏪 Para Revendedoras
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Únete a Nuestra Red Mayorista
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Accede a precios exclusivos, packs especiales desde 3 piezas, y material de apoyo para impulsar tu negocio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/atacado">
                  <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90">
                    Solicitar Acceso Mayorista
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10">
                  Ver Catálogo B2B
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
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Nuevas Llegadas
            </h2>
            <p className="text-muted-foreground">
              Las últimas piezas de nuestra colección
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/catalogo">
              <Button size="lg" variant="outline" className="group">
                Ver Catálogo Completo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
