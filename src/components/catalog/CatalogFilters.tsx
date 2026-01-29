import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
  onToggleCategory: (slug: string) => void;
  onToggleSize: (size: string) => void;
  onClearFilters: () => void;
}

export default function CatalogFilters({
  categories,
  selectedCategories,
  selectedSizes,
  sizeOptions,
  onToggleCategory,
  onToggleSize,
  onClearFilters,
}: CatalogFiltersProps) {
  const hasFilters = selectedCategories.length > 0 || selectedSizes.length > 0;

  return (
    <div className="space-y-8">
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
