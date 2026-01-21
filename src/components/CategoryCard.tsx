import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types/product';

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link
        to={`/catalogo?category=${category.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
      >
        {/* Background Image */}
        <img
          src={category.image}
          alt={category.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-primary-foreground mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-primary-foreground/80">
                {category.productCount} productos
              </p>
            </div>
            <motion.div
              className="p-2 rounded-full bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground"
              whileHover={{ scale: 1.1, x: 5 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
