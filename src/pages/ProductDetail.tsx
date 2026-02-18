import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCcw,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Loader2,
  Play,
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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const { product, isLoading, error } = useProduct(id || '');
  const { products: relatedProductsData } = useProducts({ categorySlug: product?.category });
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Loading state
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

  // Not found state
  if (!product || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Link to="/catalogo">
            <Button>Volver al Catálogo</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Selecciona una talla',
        description: 'Por favor elige una talla antes de agregar al carrito.',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedColor) {
      toast({
        title: 'Selecciona un color',
        description: 'Por favor elige un color antes de agregar al carrito.',
        variant: 'destructive',
      });
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    toast({
      title: '¡Agregado al carrito!',
      description: `${product.name} x${quantity} ha sido agregado.`,
    });
  };

  const relatedProducts = relatedProductsData
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container py-4">
        <Link
          to="/catalogo"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver al Catálogo
        </Link>
      </div>

      <main className="container pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <Badge className="bg-primary text-primary-foreground">Nuevo</Badge>
                )}
                {product.originalPrice && (
                  <Badge variant="destructive">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={cn(
                    "p-3 rounded-full transition-all",
                    isFavorite
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                </button>
                <button className="p-3 rounded-full bg-background/90 backdrop-blur-sm text-foreground hover:bg-muted">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    className="w-20 h-24 rounded-lg overflow-hidden border-2 border-primary"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Video */}
            {(product as any).video_url && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl overflow-hidden bg-muted"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-primary/20">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Vídeo do Produto</span>
                </div>
                <video
                  src={(product as any).video_url}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full aspect-video object-cover"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Wholesale Price */}
            {product.wholesalePrice && (
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                <p className="text-sm text-muted-foreground mb-1">
                  Precio Mayorista (mín. {product.minWholesaleQty} piezas)
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatPrice(product.wholesalePrice)} c/u
                </p>
              </div>
            )}

            {/* Colors */}
            <div>
              <p className="font-medium text-foreground mb-3">
                Color: <span className="text-muted-foreground">{selectedColor || 'Selecciona'}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => color.available && setSelectedColor(color.name)}
                    disabled={!color.available}
                    className={cn(
                      "relative w-10 h-10 rounded-full border-2 transition-all",
                      selectedColor === color.name
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary",
                      !color.available && "opacity-50 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-foreground mix-blend-difference" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="font-medium text-foreground mb-3">
                Talla: <span className="text-muted-foreground">{selectedSize || 'Selecciona'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => size.available && setSelectedSize(size.label)}
                    disabled={!size.available}
                    className={cn(
                      "px-5 py-2.5 rounded-lg border-2 font-medium transition-all",
                      selectedSize === size.label
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary",
                      !size.available && "opacity-50 cursor-not-allowed line-through"
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-medium text-foreground mb-3">Cantidad</p>
              <div className="inline-flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-primary text-primary-foreground hover:bg-rose-dark"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Agregar al Carrito
              </Button>
              <Button size="lg" variant="outline">
                Comprar Ahora
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Envío Express</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Pago Seguro</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                  <RefreshCcw className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">30 días cambio</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-20">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent h-auto p-0 rounded-none">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Descripción
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Detalles
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Envío
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <p className="text-muted-foreground max-w-2xl">
                {product.description} Esta prenda está confeccionada con materiales de alta calidad,
                diseñada para brindarte comodidad y estilo en cualquier ocasión. Perfecta para
                combinar con tus accesorios favoritos y crear looks únicos.
              </p>
            </TabsContent>
            <TabsContent value="details" className="pt-6">
              <ul className="space-y-2 text-muted-foreground max-w-2xl">
                <li>• Material: Poliéster de alta calidad</li>
                <li>• Corte: Regular fit</li>
                <li>• Cuidado: Lavar a máquina en frío</li>
                <li>• Origen: Importado</li>
              </ul>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6">
              <div className="space-y-4 text-muted-foreground max-w-2xl">
                <p>
                  <strong className="text-foreground">Envío Express:</strong> 2-3 días hábiles para
                  Asunción y Gran Asunción.
                </p>
                <p>
                  <strong className="text-foreground">Envío Regular:</strong> 5-7 días hábiles para
                  el interior del país.
                </p>
                <p>
                  <strong className="text-foreground">Envío Gratis:</strong> En compras superiores a
                  ₲ 500.000.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Productos Relacionados
            </h2>
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
