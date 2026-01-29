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
    verde: '#3d5c3d',
    champagne: '#f7e7ce',
    vermelho: '#dc143c',
    amarelo: '#ffd700',
    laranja: '#ff8c00',
    roxo: '#9370db',
    marrom: '#8b4513',
  };
  return colorMap[colorName.toLowerCase()] || '#cccccc';
};

const transformProduct = (dbProduct: DBProduct): Product => {
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
  };
};

export function useProducts(categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from('products')
          .select(`
            *,
            categories (
              slug,
              name
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (categorySlug) {
          // Need to filter by category slug via a join
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

          if (categoryData) {
            query = query.eq('category_id', categoryData.id);
          }
        }

        const { data, error } = await query;

        if (error) throw error;

        const transformedProducts = (data as DBProduct[] || []).map(transformProduct);
        setProducts(transformedProducts);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  return { products, isLoading, error };
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
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

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

        setCategories(categoriesWithCounts);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading };
}

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              slug,
              name
            )
          `)
          .eq('id', productId)
          .single();

        if (error) throw error;

        if (data) {
          setProduct(transformProduct(data as DBProduct));
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  return { product, isLoading, error };
}
