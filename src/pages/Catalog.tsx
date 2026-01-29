import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Grid3X3, LayoutGrid, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import { useProducts, useCategories } from '@/hooks/useProducts';

const sortOptions = [
  { value: 'newest', label: 'Más Nuevos' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'popular', label: 'Más Populares' },
];

const sizeOptions = ['P', 'M', 'G', 'GG', '36', '38', '40', '42'];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);

  // Fetch from database
  const { products, isLoading: productsLoading } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Filter by size
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s.label) && s.available)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      default:
        // Already sorted by newest from DB
        break;
    }

    return result;
  }, [products, selectedCategories, selectedSizes, sortBy]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
  };

  const isLoading = productsLoading || categoriesLoading;
  const currentCategoryName = categoryParam
    ? categories.find((c) => c.slug === categoryParam)?.name || 'Catálogo'
    : 'Catálogo Completo';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-soft py-16">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            {currentCategoryName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-lg mx-auto"
          >
            Explora nuestra colección de moda femenina con las últimas tendencias
          </motion.p>
        </div>
      </section>

      <div className="container py-12">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filtros
              </h2>
              <CatalogFilters
                categories={categories}
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                sizeOptions={sizeOptions}
                onToggleCategory={toggleCategory}
                onToggleSize={toggleSize}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <CatalogFilters
                      categories={categories}
                      selectedCategories={selectedCategories}
                      selectedSizes={selectedSizes}
                      sizeOptions={sizeOptions}
                      onToggleCategory={toggleCategory}
                      onToggleSize={toggleSize}
                      onClearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground hidden sm:block">
                {filteredProducts.length} productos
              </p>

              <div className="flex items-center gap-4">
                {/* Grid Toggle */}
                <div className="hidden md:flex items-center gap-1 border border-border rounded-lg p-1">
                  <button
                    onClick={() => setGridCols(2)}
                    className={`p-1.5 rounded ${gridCols === 2 ? 'bg-muted' : ''}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridCols(3)}
                    className={`p-1.5 rounded ${gridCols === 3 ? 'bg-muted' : ''}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridCols(4)}
                    className={`p-1.5 rounded ${gridCols === 4 ? 'bg-muted' : ''}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  gridCols === 2
                    ? 'grid-cols-2'
                    : gridCols === 3
                    ? 'grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No se encontraron productos con los filtros seleccionados.
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
