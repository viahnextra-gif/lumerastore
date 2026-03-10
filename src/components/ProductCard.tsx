import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const defaultSize = product.sizes.find((s) => s.available)?.label || product.sizes[0].label;
    const defaultColor = product.colors.find((c) => c.available)?.name || product.colors[0].name;
    addToCart(product, defaultSize, defaultColor);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/producto/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && <Badge className="bg-primary text-primary-foreground">{t('product.new')}</Badge>}
            {product.isBestSeller && <Badge variant="secondary" className="bg-gold text-foreground">{t('product.topSeller')}</Badge>}
            {product.originalPrice && <Badge variant="destructive">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</Badge>}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); setIsFavorite(!isFavorite); }}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all duration-300",
              isFavorite ? "bg-primary text-primary-foreground" : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }} className="absolute bottom-3 left-3 right-3 flex gap-2">
            <Button size="sm" className="flex-1 bg-background/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground" onClick={handleQuickAdd}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t('product.add')}
            </Button>
            <Button size="sm" variant="outline" className="bg-background/90 backdrop-blur-sm">
              <Eye className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</p>
          <h3 className="font-display text-lg font-medium text-foreground line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
          </div>
          <div className="flex gap-1 pt-1">
            {product.colors.slice(0, 4).map((color) => (
              <span key={color.name} className="w-4 h-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: color.hex }} title={color.name} />
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
