import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Grid3X3, LayoutGrid, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import { useProducts, useCategories } from '@/hooks/useProducts';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { breadcrumbSchema, itemListSchema } from '@/components/seo/schemas';

const sortOptions = [
  { value: 'newest', label: 'Más Nuevos' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'popular', label: 'Más Populares' },
];

const sizeOptions = ['P', 'M', 'G', 'GG', '36', '38', '40', '42'];
const colorOptions = ['Rosa', 'Rosê', 'Branco', 'Preto', 'Terracota', 'Creme', 'Bege', 'Azul', 'Verde', 'Champagne'];

const ITEMS_PER_PAGE = 12;

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const pageParam = searchParams.get('page');
  const searchParam = searchParams.get('q');
  const sortParam = searchParams.get('sort');
  const sizesParam = searchParams.get('sizes');
  const colorsParam = searchParams.get('colors');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  
  const MAX_PRICE = 500000;
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    sizesParam ? sizesParam.split(',') : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    colorsParam ? colorsParam.split(',') : []
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>(
    (sortParam as any) || 'newest'
  );
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam || '');
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const initMin = minPriceParam ? parseInt(minPriceParam) : 0;
  const initMax = maxPriceParam ? parseInt(maxPriceParam) : MAX_PRICE;
  const [priceRange, setPriceRange] = useState<[number, number]>([initMin, initMax]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([initMin, initMax]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce price range
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (debouncedPriceRange[0] > 0) params.set('minPrice', debouncedPriceRange[0].toString());
    if (debouncedPriceRange[1] < MAX_PRICE) params.set('maxPrice', debouncedPriceRange[1].toString());
    setSearchParams(params, { replace: true });
  }, [selectedCategories, currentPage, debouncedSearch, sortBy, selectedSizes, selectedColors, debouncedPriceRange, setSearchParams]);

  // Fetch from database with pagination, search, sorting, and price filter
  const { products, isLoading: productsLoading, totalCount, totalPages } = useProducts({
    searchQuery: debouncedSearch,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    sortBy,
    minPrice: debouncedPriceRange[0] > 0 ? debouncedPriceRange[0] : undefined,
    maxPrice: debouncedPriceRange[1] < MAX_PRICE ? debouncedPriceRange[1] : undefined,
  });
  const { categories, isLoading: categoriesLoading } = useCategories();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s.label) && s.available)
      );
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => selectedColors.includes(c.name) && c.available)
      );
    }

    return result;
  }, [products, selectedCategories, selectedSizes, selectedColors]);

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

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, MAX_PRICE]);
  };

  const isLoading = productsLoading || categoriesLoading;
  const currentCategoryName = categoryParam
    ? categories.find((c) => c.slug === categoryParam)?.name || 'Catálogo'
    : 'Catálogo Completo';

  const seoTitle = categoryParam
    ? `${currentCategoryName} - Moda Femenina | Meca Store`
    : 'Catálogo Moda Femenina | Meca Store Paraguay';
  const seoDesc = categoryParam
    ? `Compra ${currentCategoryName.toLowerCase()} de moda femenina en Meca Store. Envíos a todo Paraguay.`
    : 'Explora nuestra colección completa de moda femenina. Vestidos, conjuntos, blusas y más. Envíos a todo Paraguay.';
  const breadcrumbItems = categoryParam
    ? [{ name: 'Inicio', url: '/' }, { name: 'Catálogo', url: '/catalogo' }, { name: currentCategoryName, url: `/catalogo?category=${categoryParam}` }]
    : [{ name: 'Inicio', url: '/' }, { name: 'Catálogo', url: '/catalogo' }];

  const productListItems = filteredProducts.slice(0, 12).map(p => ({
    name: p.name, url: `/producto/${p.id}`, image: p.images?.[0] || '', price: p.price,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        keywords={`moda femenina, ${currentCategoryName.toLowerCase()}, ropa mujer, paraguay, meca store`}
        jsonLd={[breadcrumbSchema(breadcrumbItems), itemListSchema(productListItems)]}
      />
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-soft py-16">
        <div className="container text-center">
          <Breadcrumbs
            items={categoryParam
              ? [{ label: 'Catálogo', href: '/catalogo' }, { label: currentCategoryName }]
              : [{ label: 'Catálogo' }]
            }
            className="justify-center mb-6"
          />
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
                selectedColors={selectedColors}
                sizeOptions={sizeOptions}
                colorOptions={colorOptions}
                priceRange={priceRange}
                maxPriceLimit={MAX_PRICE}
                onToggleCategory={toggleCategory}
                onToggleSize={toggleSize}
                onToggleColor={toggleColor}
                onPriceChange={handlePriceChange}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

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
                      selectedColors={selectedColors}
                      sizeOptions={sizeOptions}
                      colorOptions={colorOptions}
                      priceRange={priceRange}
                      maxPriceLimit={MAX_PRICE}
                      onToggleCategory={toggleCategory}
                      onToggleSize={toggleSize}
                      onToggleColor={toggleColor}
                      onPriceChange={handlePriceChange}
                      onClearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground hidden sm:block">
                {totalCount} productos
                {debouncedSearch && ` para "${debouncedSearch}"`}
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
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
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
                  No se encontraron productos{debouncedSearch ? ` para "${debouncedSearch}"` : ' con los filtros seleccionados'}.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => { clearFilters(); setSearchQuery(''); }}>
                  Limpiar Filtros
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(totalPages)}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
