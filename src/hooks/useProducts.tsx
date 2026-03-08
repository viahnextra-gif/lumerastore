import { useState, useEffect } from 'react';
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

// Helper to parse color strings like "Rosa:#f5c4c4" or just "Rosa"
const parseColor = (colorStr: string): ProductColor => {
  const parts = colorStr.split(':');
  const name = parts[0].trim();
  const hex = parts[1]?.trim() || generateColorHex(name);
  return { name, hex, available: true };
};

// Generate a color hex based on common color names
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

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { 
    categorySlug, 
    searchQuery, 
    page = 1, 
    pageSize = 12, 
    sortBy = 'newest',
    minPrice,
    maxPrice 
  } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Calculate pagination range
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('products')
          .select(`
            *,
            categories (
              slug,
              name
            )
          `, { count: 'exact' })
          .eq('is_active', true);

        // Apply price filters
        if (minPrice !== undefined) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice !== undefined) {
          query = query.lte('price', maxPrice);
        }

        // Filter by search query
        if (searchQuery && searchQuery.trim()) {
          query = query.ilike('name', `%${searchQuery.trim()}%`);
        }

        // Filter by category
        if (categorySlug) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .maybeSingle();

          if (categoryData) {
            query = query.eq('category_id', categoryData.id);
          }
        }

        // Apply sorting
        switch (sortBy) {
          case 'price-asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price-desc':
            query = query.order('price', { ascending: false });
            break;
          case 'popular':
            query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
            break;
          default: // newest
            query = query.order('created_at', { ascending: false });
        }

        query = query.range(from, to);

        const { data, error: queryError, count } = await query;

        if (cancelled) return;

        if (queryError) throw queryError;

        const transformedProducts = (data as DBProduct[] || []).map(transformProduct);
        setProducts(transformedProducts);
        setTotalCount(count || 0);
      } catch (err) {
        if (cancelled) return;
        setError(err as Error);
        console.error('Error fetching products:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => { cancelled = true; };
  }, [categorySlug, searchQuery, page, pageSize, sortBy, minPrice, maxPrice]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return { products, isLoading, error, totalCount, totalPages };
}

export function useCategories() {
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    productCount: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (cancelled) return;
        if (error) throw error;

        // Get product counts for each category
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

        if (!cancelled) {
          setCategories(categoriesWithCounts);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching categories:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => { cancelled = true; };
  }, []);

  return { categories, isLoading };
}

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const { data, error: queryError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              slug,
              name
            )
          `)
          .eq('id', productId)
          .maybeSingle();

        if (cancelled) return;
        if (queryError) throw queryError;

        if (data) {
          setProduct(transformProduct(data as DBProduct));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          console.error('Error fetching product:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (productId) {
      fetchProduct();
    }

    return () => { cancelled = true; };
  }, [productId]);

  return { product, isLoading, error };
}
