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
    name: 'Vestido Lastex Babado Caramelo',
    description: 'Vestido ciganinha com lastex e babados, perfeito para looks frescos e femininos.',
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
      { name: 'Caramelo', hex: '#c4a265', available: true },
      { name: 'Preto', hex: '#1a1a1a', available: true },
    ],
    isNew: true,
    isBestSeller: true,
    wholesalePrice: 145000,
    minWholesaleQty: 6,
  },
  {
    id: '2',
    name: 'Vestido Lastex Babado Preto',
    description: 'Vestido ciganinha com lastex e babados em preto elegante, versátil para qualquer ocasião.',
    price: 259000,
    images: [productConjunto1],
    category: 'vestidos',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: false },
      { label: 'GG', available: true },
    ],
    colors: [
      { name: 'Preto', hex: '#1a1a1a', available: true },
      { name: 'Caramelo', hex: '#c4a265', available: true },
    ],
    isBestSeller: true,
    wholesalePrice: 199000,
    minWholesaleQty: 3,
  },
  {
    id: '3',
    name: 'Jaqueta Couro Ecológico Bege',
    description: 'Jaqueta em couro ecológico com zíper, estilo moderno e sofisticado.',
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
      { name: 'Bege', hex: '#d4c5a5', available: true },
      { name: 'Preto', hex: '#1a1a1a', available: true },
    ],
    isNew: true,
    wholesalePrice: 99000,
    minWholesaleQty: 6,
  },
  {
    id: '4',
    name: 'Vestido Animal Print P&B',
    description: 'Vestido com estampa animal print em preto e branco, ousado e fashion.',
    price: 159000,
    originalPrice: 189000,
    images: [productCalca1],
    category: 'vestidos',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
      { label: 'GG', available: true },
    ],
    colors: [
      { name: 'Preto/Branco', hex: '#1a1a1a', available: true },
      { name: 'Marrom/Bege', hex: '#8B4513', available: true },
    ],
    wholesalePrice: 125000,
    minWholesaleQty: 6,
  },
  {
    id: '5',
    name: 'Vestido Wrap Animal Print Marrom',
    description: 'Vestido transpassado com estampa animal print, elegante e moderno.',
    price: 279000,
    images: [productMacacao1],
    category: 'vestidos',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
    ],
    colors: [
      { name: 'Marrom/Bege', hex: '#8B4513', available: true },
      { name: 'Preto/Branco', hex: '#1a1a1a', available: true },
    ],
    isNew: true,
    isBestSeller: true,
    wholesalePrice: 219000,
    minWholesaleQty: 3,
  },
  {
    id: '6',
    name: 'Vestido Rodado Animal Print',
    description: 'Vestido rodado com estampa animal print e chapéu, perfeito para looks country chic.',
    price: 139000,
    images: [productSaia1],
    category: 'vestidos',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
    ],
    colors: [
      { name: 'Marrom/Bege', hex: '#8B4513', available: true },
      { name: 'Preto', hex: '#1a1a1a', available: true },
    ],
    wholesalePrice: 109000,
    minWholesaleQty: 6,
  },
  {
    id: '7',
    name: 'Top Peplum Leopardo',
    description: 'Top peplum com estampa leopardo, perfeito para looks ousados e estilosos.',
    price: 99000,
    images: [productShort1],
    category: 'blusas',
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: false },
    ],
    colors: [
      { name: 'Leopardo', hex: '#c4913a', available: true },
      { name: 'Preto', hex: '#1a1a1a', available: true },
    ],
    wholesalePrice: 79000,
    minWholesaleQty: 12,
  },
];
