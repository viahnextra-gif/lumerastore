import { Product, Category } from '@/types/product';

import productDress1 from '@/assets/product-dress-1.jpg';
import productConjunto1 from '@/assets/product-conjunto-1.jpg';
import productBlusa1 from '@/assets/product-blusa-1.jpg';
import productCalca1 from '@/assets/product-calca-1.jpg';
import productMacacao1 from '@/assets/product-macacao-1.jpg';
import productSaia1 from '@/assets/product-saia-1.jpg';
import productShort1 from '@/assets/product-short-1.jpg';
import categoryVestidos from '@/assets/category-vestidos.jpg';
import categoryConjuntos from '@/assets/category-conjuntos.jpg';

export const categories: Category[] = [
  { id: '1', name: 'Vestidos', slug: 'vestidos', image: categoryVestidos, productCount: 48 },
  { id: '2', name: 'Conjuntos', slug: 'conjuntos', image: categoryConjuntos, productCount: 36 },
  { id: '3', name: 'Blusas', slug: 'blusas', image: productBlusa1, productCount: 62 },
  { id: '4', name: 'Calças', slug: 'calcas', image: productCalca1, productCount: 28 },
  { id: '5', name: 'Macacões', slug: 'macacoes', image: productMacacao1, productCount: 18 },
  { id: '6', name: 'Saias', slug: 'saias', image: productSaia1, productCount: 24 },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Vestido Floral Rosa',
    description: 'Vestido longo com estampa floral delicada, perfeito para ocasiões especiais.',
    price: 189000,
    originalPrice: 249000,
    images: [productDress1],
    category: 'vestidos',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
      { label: 'GG', available: false },
    ],
    colors: [
      { name: 'Rosa', hex: '#f5c4c4', available: true },
      { name: 'Branco', hex: '#ffffff', available: true },
    ],
    isNew: true,
    isBestSeller: true,
    wholesalePrice: 145000,
    minWholesaleQty: 6,
  },
  {
    id: '2',
    name: 'Conjunto Elegante Terracota',
    description: 'Conjunto de blusa e calça pantalona, ideal para o dia a dia com elegância.',
    price: 259000,
    images: [productConjunto1],
    category: 'conjuntos',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: false },
      { label: 'GG', available: true },
    ],
    colors: [
      { name: 'Terracota', hex: '#c95a3c', available: true },
      { name: 'Preto', hex: '#1a1a1a', available: true },
    ],
    isBestSeller: true,
    wholesalePrice: 199000,
    minWholesaleQty: 3,
  },
  {
    id: '3',
    name: 'Blusa Cetim Rosê',
    description: 'Blusa em tecido acetinado com acabamento premium.',
    price: 129000,
    images: [productBlusa1],
    category: 'blusas',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
      { label: 'GG', available: true },
    ],
    colors: [
      { name: 'Rosê', hex: '#d4a5a5', available: true },
      { name: 'Champagne', hex: '#f7e7ce', available: true },
    ],
    isNew: true,
    wholesalePrice: 99000,
    minWholesaleQty: 6,
  },
  {
    id: '4',
    name: 'Calça Pantalona Creme',
    description: 'Calça pantalona de cintura alta com caimento impecável.',
    price: 159000,
    originalPrice: 189000,
    images: [productCalca1],
    category: 'calcas',
    sizes: [
      { label: '36', available: true },
      { label: '38', available: true },
      { label: '40', available: true },
      { label: '42', available: true },
    ],
    colors: [
      { name: 'Creme', hex: '#f5f5dc', available: true },
      { name: 'Preto', hex: '#1a1a1a', available: true },
    ],
    wholesalePrice: 125000,
    minWholesaleQty: 6,
  },
  {
    id: '5',
    name: 'Macacão Terracota',
    description: 'Macacão longo com amarração na cintura, elegante e confortável.',
    price: 279000,
    images: [productMacacao1],
    category: 'macacoes',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
    ],
    colors: [
      { name: 'Terracota', hex: '#e65c00', available: true },
      { name: 'Verde', hex: '#3d5c3d', available: true },
    ],
    isNew: true,
    isBestSeller: true,
    wholesalePrice: 219000,
    minWholesaleQty: 3,
  },
  {
    id: '6',
    name: 'Saia Plissada Rosa',
    description: 'Saia midi plissada em tecido fluído, perfeita para looks românticos.',
    price: 139000,
    images: [productSaia1],
    category: 'saias',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
    ],
    colors: [
      { name: 'Rosa', hex: '#f4a7b9', available: true },
      { name: 'Azul', hex: '#87ceeb', available: true },
    ],
    wholesalePrice: 109000,
    minWholesaleQty: 6,
  },
  {
    id: '7',
    name: 'Short Alfaiataria Bege',
    description: 'Short de alfaiataria com pregas, sofisticação para o verão.',
    price: 99000,
    images: [productShort1],
    category: 'shorts',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: false },
    ],
    colors: [
      { name: 'Bege', hex: '#f5f5dc', available: true },
      { name: 'Branco', hex: '#ffffff', available: true },
    ],
    wholesalePrice: 79000,
    minWholesaleQty: 12,
  },
];
