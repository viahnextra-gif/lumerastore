import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductSize, ProductColor } from '@/types/product';

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  wholesale_price: number | null;
  min_wholesale_qty: number | null;
  category_id: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  stock: number | null;
  sizes: string[] | null;
  colors: string[] | null;
  images: string[] | null;
  video_url?: string | null;
  categories?: {
    slug: string;
    name: string;
  } | null;
}

const parseColor = (colorStr: string): ProductColor => {
  const parts = colorStr.split(':');
  const name = parts[0].trim();
  const hex = parts[1]?.trim() || generateColorHex(name);
  return { name, hex, available: true };
};

const generateColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    rosa: '#f5c4c4',
    rosê: '#d4a5a5',
    branco: '#ffffff',
    preto: '#1a1a1a',
    terracota: '#c95a3c',
    creme: '#f5f5dc',
    bege: '#f5f5dc',
    azul: '#87ceeb',
    'azul serenity': '#92a8d1',
    verde: '#3d5c3d',
    'verde musgo': '#4a5240',
    champagne: '#f7e7ce',
    vermelho: '#dc143c',
    amarelo: '#ffd700',
    laranja: '#ff8c00',
    roxo: '#9370db',
    marrom: '#8b4513',
    nude: '#e8c9a0',
    caramelo: '#c68642',
    lilás: '#c8a2c8',
  };
  return colorMap[colorName.toLowerCase()] || '#cccccc';
};

const transformProduct = (dbProduct: DBProduct): Product & { video_url?: string | null } => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    images: dbProduct.images || [],
    category: dbProduct.categories?.slug || '',
    sizes: (dbProduct.sizes || []).map((s) => ({ label: s, available: true })),
    colors: (dbProduct.colors || []).map(parseColor),
    isNew: false,
    isBestSeller: dbProduct.is_featured || false,
    wholesalePrice: dbProduct.wholesale_price || undefined,
    minWholesaleQty: dbProduct.min_wholesale_qty || undefined,
    video_url: dbProduct.video_url || null,
  };
};

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';

interface UseProductsOptions {
  categorySlug?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  sortBy?: SortOption;
  minPrice?: number;
  maxPrice?: number;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  totalPages: number;
}

async function fetchProducts(options: UseProductsOptions) {
  const {
    categorySlug,
    searchQuery,
    page = 1,
    pageSize = 12,
    sortBy = 'newest',
    minPrice,
    maxPrice,
  } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(`*, categories (slug, name)`, { count: 'exact' })
    .eq('is_active', true);

  if (minPrice !== undefined) query = query.gte('price', minPrice);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);
  if (searchQuery?.trim()) query = query.ilike('name', `%${searchQuery.trim()}%`);

  if (categorySlug) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (categoryData) query = query.eq('category_id', categoryData.id);
  }

  switch (sortBy) {
    case 'price-asc': query = query.order('price', { ascending: true }); break;
    case 'price-desc': query = query.order('price', { ascending: false }); break;
    case 'popular': query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    products: (data as DBProduct[] || []).map(transformProduct),
    totalCount: count || 0,
    pageSize,
  };
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { categorySlug, searchQuery, page = 1, pageSize = 12, sortBy = 'newest', minPrice, maxPrice } = options;

  const queryKey = ['products', categorySlug, searchQuery, page, pageSize, sortBy, minPrice, maxPrice];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchProducts(options),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    staleTime: 30000,
  });

  return {
    products: data?.products || [],
    isLoading,
    error: error as Error | null,
    totalCount: data?.totalCount || 0,
    totalPages: Math.ceil((data?.totalCount || 0) / pageSize),
  };
}

async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;

  const categoriesWithCounts = await Promise.all(
    (data || []).map(async (cat) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('is_active', true);

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image_url || '/placeholder.svg',
        productCount: count || 0,
      };
    })
  );

  return categoriesWithCounts;
}

export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    staleTime: 60000,
  });

  return { categories: data || [], isLoading };
}

export function useProduct(productId: string) {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, categories (slug, name)`)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data ? transformProduct(data as DBProduct) : null;
    },
    enabled: !!productId,
    retry: 3,
    staleTime: 30000,
  });

  return { product: product || null, isLoading, error: error as Error | null };
}
