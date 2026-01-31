import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface CatalogFiltersProps {
  categories: Category[];
  selectedCategories: string[];
  selectedSizes: string[];
  sizeOptions: string[];
  priceRange: [number, number];
  maxPriceLimit: number;
  onToggleCategory: (slug: string) => void;
  onToggleSize: (size: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CatalogFilters({
  categories,
  selectedCategories,
  selectedSizes,
  sizeOptions,
  priceRange,
  maxPriceLimit,
  onToggleCategory,
  onToggleSize,
  onPriceChange,
  onClearFilters,
}: CatalogFiltersProps) {
  const hasFilters = selectedCategories.length > 0 || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPriceLimit;

  return (
    <div className="space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Precio</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceChange(value as [number, number])}
            max={maxPriceLimit}
            min={0}
            step={10000}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Categorías</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3">
              <Checkbox
                id={`cat-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => onToggleCategory(category.slug)}
              />
              <Label
                htmlFor={`cat-${category.slug}`}
                className="text-sm cursor-pointer flex-1 flex justify-between"
              >
                <span>{category.name}</span>
                <span className="text-muted-foreground">({category.productCount})</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Tallas</h3>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => onToggleSize(size)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" className="w-full" onClick={onClearFilters}>
          Limpiar Filtros
        </Button>
      )}
    </div>
  );
}
