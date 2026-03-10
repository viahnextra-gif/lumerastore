import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Heart, Share2, Truck, Shield, RefreshCcw,
  Minus, Plus, ShoppingBag, Check, Loader2, Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { productSchema, breadcrumbSchema } from '@/components/seo/schemas';

export default function ProductDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  
  const { product, isLoading, error } = useProduct(id || '');
  const { products: relatedProductsData } = useProducts({ categorySlug: product?.category });
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-[3/4] rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('product.notFound')}</h1>
          <Link to="/catalogo">
            <Button>{t('product.backToCatalog')}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({ title: t('product.selectSizeAlert'), description: t('product.selectSizeDesc'), variant: 'destructive' });
      return;
    }
    if (!selectedColor) {
      toast({ title: t('product.selectColorAlert'), description: t('product.selectColorDesc'), variant: 'destructive' });
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    toast({ title: t('product.addedToCart'), description: `${product.name} x${quantity} ${t('product.addedDesc')}` });
  };

  const relatedProducts = relatedProductsData.filter((p) => p.id !== product.id).slice(0, 4);

  const breadcrumbItems = [
    { name: t('nav.home'), url: '/' },
    { name: t('nav.catalog'), url: '/catalogo' },
    { name: product.category, url: `/catalogo?category=${product.category}` },
    { name: product.name, url: `/producto/${product.id}` },
  ];

  const jsonLd = [
    productSchema({ name: product.name, description: product.description, price: product.price, images: product.images, category: product.category, url: `/producto/${product.id}` }),
    breadcrumbSchema(breadcrumbItems),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${product.name} - Meca Store`}
        description={`${product.description?.slice(0, 150) || product.name}`}
        ogImage={product.images?.[0]}
        ogType="product"
        keywords={`${product.name}, ${product.category}, moda feminina, paraguay, meca store`}
        jsonLd={jsonLd}
      />
      <Header />

      <div className="container py-4">
        <Link to="/catalogo" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('product.backToCatalog')}
        </Link>
      </div>

      <main className="container pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge className="bg-primary text-primary-foreground">{t('product.new')}</Badge>}
                {product.originalPrice && (
                  <Badge variant="destructive">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</Badge>
                )}
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={() => setIsFavorite(!isFavorite)} className={cn("p-3 rounded-full transition-all", isFavorite ? "bg-primary text-primary-foreground" : "bg-background/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground")}>
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                </button>
                <button className="p-3 rounded-full bg-background/90 backdrop-blur-sm text-foreground hover:bg-muted">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button key={idx} className="w-20 h-24 rounded-lg overflow-hidden border-2 border-primary">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {(product as any).video_url && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl overflow-hidden bg-muted">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-primary/20">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{t('product.videoTitle')}</span>
                </div>
                <video src={(product as any).video_url} controls autoPlay muted loop playsInline className="w-full aspect-video object-cover" />
              </motion.div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
            </div>

            {product.wholesalePrice && (
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('product.wholesalePrice')} ({t('product.minPieces')} {product.minWholesaleQty} {t('product.pieces')})
                </p>
                <p className="text-xl font-bold text-foreground">{formatPrice(product.wholesalePrice)} {t('product.perUnit')}</p>
              </div>
            )}

            {/* Colors */}
            <div>
              <p className="font-medium text-foreground mb-3">
                {t('product.color')}: <span className="text-muted-foreground">{selectedColor || t('product.selectLabel')}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button key={color.name} onClick={() => color.available && setSelectedColor(color.name)} disabled={!color.available}
                    className={cn("relative w-10 h-10 rounded-full border-2 transition-all", selectedColor === color.name ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:border-primary", !color.available && "opacity-50 cursor-not-allowed")}
                    style={{ backgroundColor: color.hex }} title={color.name}>
                    {selectedColor === color.name && <Check className="absolute inset-0 m-auto h-4 w-4 text-foreground mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="font-medium text-foreground mb-3">
                {t('product.size')}: <span className="text-muted-foreground">{selectedSize || t('product.selectLabel')}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button key={size.label} onClick={() => size.available && setSelectedSize(size.label)} disabled={!size.available}
                    className={cn("px-5 py-2.5 rounded-lg border-2 font-medium transition-all", selectedSize === size.label ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary", !size.available && "opacity-50 cursor-not-allowed line-through")}>
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-medium text-foreground mb-3">{t('product.quantity')}</p>
              <div className="inline-flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-muted transition-colors"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-muted transition-colors"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1 bg-primary text-primary-foreground hover:bg-rose-dark" onClick={handleAddToCart}>
                <ShoppingBag className="h-5 w-5 mr-2" />
                {t('product.addToCart')}
              </Button>
              <Button size="lg" variant="outline">{t('product.buyNow')}</Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2"><Truck className="h-5 w-5 text-primary" /></div>
                <p className="text-xs text-muted-foreground">{t('product.expressShipping')}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2"><Shield className="h-5 w-5 text-primary" /></div>
                <p className="text-xs text-muted-foreground">{t('product.securePayment')}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2"><RefreshCcw className="h-5 w-5 text-primary" /></div>
                <p className="text-xs text-muted-foreground">{t('product.returnsPolicy')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-20">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent h-auto p-0 rounded-none">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">{t('product.description')}</TabsTrigger>
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">{t('product.details')}</TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">{t('product.shippingTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <p className="text-muted-foreground max-w-2xl">
                {product.description} {t('product.descriptionText')}
              </p>
            </TabsContent>
            <TabsContent value="details" className="pt-6">
              <ul className="space-y-2 text-muted-foreground max-w-2xl">
                <li>• {t('product.material')}</li>
                <li>• {t('product.cut')}</li>
                <li>• {t('product.care')}</li>
                <li>• {t('product.origin')}</li>
              </ul>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6">
              <div className="space-y-4 text-muted-foreground max-w-2xl">
                <p><strong className="text-foreground">{t('product.expressDetail')}</strong></p>
                <p><strong className="text-foreground">{t('product.regularShipping')}</strong></p>
                <p><strong className="text-foreground">{t('product.freeShipping')}</strong></p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">{t('product.related')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
