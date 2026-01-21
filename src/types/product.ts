export interface ProductSize {
  label: string;
  available: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  isNew?: boolean;
  isBestSeller?: boolean;
  wholesalePrice?: number;
  minWholesaleQty?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}
