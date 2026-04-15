import { Product, Category } from '@/types/product';

// Fallback static data - the app primarily loads from the database
export const categories: Category[] = [
  { id: '1', name: 'Maquillaje', slug: 'maquillaje', image: '/placeholder.svg', productCount: 50 },
  { id: '2', name: 'Cuidado Facial', slug: 'cuidado-facial', image: '/placeholder.svg', productCount: 40 },
  { id: '3', name: 'Cuidado Capilar', slug: 'cuidado-capilar', image: '/placeholder.svg', productCount: 35 },
  { id: '4', name: 'Perfumería', slug: 'perfumeria', image: '/placeholder.svg', productCount: 30 },
  { id: '5', name: 'Cuidado Corporal', slug: 'cuidado-corporal', image: '/placeholder.svg', productCount: 25 },
  { id: '6', name: 'Uñas', slug: 'unas', image: '/placeholder.svg', productCount: 20 },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Labial MAC Ruby Woo',
    description: 'Labial matte icónico en tono rojo intenso. Acabado mate de larga duración.',
    price: 189000,
    originalPrice: 249000,
    images: ['/placeholder.svg'],
    category: 'maquillaje',
    sizes: [
      { label: 'Estándar', available: true },
    ],
    colors: [
      { name: 'Ruby Woo', hex: '#c41e3a', available: true },
      { name: 'Velvet Teddy', hex: '#b5704e', available: true },
    ],
    isNew: true,
    isBestSeller: true,
    wholesalePrice: 145000,
    minWholesaleQty: 6,
  },
  {
    id: '2',
    name: 'Sérum CeraVe Vitamina C',
    description: 'Sérum antioxidante con 10% de vitamina C pura para iluminar y unificar el tono de la piel.',
    price: 259000,
    images: ['/placeholder.svg'],
    category: 'cuidado-facial',
    sizes: [
      { label: '30ml', available: true },
    ],
    colors: [
      { name: 'Estándar', hex: '#f5f5dc', available: true },
    ],
    isBestSeller: true,
    wholesalePrice: 199000,
    minWholesaleQty: 3,
  },
  {
    id: '3',
    name: 'Perfume Dior Sauvage EDT',
    description: 'Fragancia masculina fresca y especiada con notas de pimienta y bergamota.',
    price: 890000,
    images: ['/placeholder.svg'],
    category: 'perfumeria',
    sizes: [
      { label: '60ml', available: true },
      { label: '100ml', available: true },
      { label: '200ml', available: true },
    ],
    colors: [
      { name: 'Estándar', hex: '#1a3a5c', available: true },
    ],
    isNew: true,
    wholesalePrice: 690000,
    minWholesaleQty: 3,
  },
  {
    id: '4',
    name: 'Base Maybelline Fit Me',
    description: 'Base líquida de cobertura natural con acabado mate. Ideal para piel mixta a grasa.',
    price: 129000,
    originalPrice: 159000,
    images: ['/placeholder.svg'],
    category: 'maquillaje',
    sizes: [
      { label: '30ml', available: true },
    ],
    colors: [
      { name: 'Natural Beige', hex: '#d4a574', available: true },
      { name: 'Classic Ivory', hex: '#f5e6d3', available: true },
      { name: 'Sun Beige', hex: '#c49a6c', available: true },
    ],
    wholesalePrice: 99000,
    minWholesaleQty: 6,
  },
  {
    id: '5',
    name: 'Crema Hidratante Nivea',
    description: 'Crema hidratante corporal de absorción rápida con vitamina E.',
    price: 89000,
    images: ['/placeholder.svg'],
    category: 'cuidado-corporal',
    sizes: [
      { label: '200ml', available: true },
      { label: '400ml', available: true },
    ],
    colors: [
      { name: 'Estándar', hex: '#003d7a', available: true },
    ],
    isNew: false,
    isBestSeller: true,
    wholesalePrice: 69000,
    minWholesaleQty: 12,
  },
  {
    id: '6',
    name: 'Shampoo L\'Oréal Elvive',
    description: 'Shampoo reparador para cabello dañado con aceite de coco y ceramidas.',
    price: 79000,
    images: ['/placeholder.svg'],
    category: 'cuidado-capilar',
    sizes: [
      { label: '370ml', available: true },
      { label: '680ml', available: true },
    ],
    colors: [
      { name: 'Estándar', hex: '#8b0000', available: true },
    ],
    wholesalePrice: 59000,
    minWholesaleQty: 6,
  },
  {
    id: '7',
    name: 'Esmalte OPI Infinite Shine',
    description: 'Esmalte de uñas de larga duración con acabado gel, sin necesidad de lámpara UV.',
    price: 99000,
    images: ['/placeholder.svg'],
    category: 'unas',
    sizes: [
      { label: '15ml', available: true },
    ],
    colors: [
      { name: 'Big Apple Red', hex: '#b91c1c', available: true },
      { name: 'Bubble Bath', hex: '#f5e1e1', available: true },
    ],
    wholesalePrice: 79000,
    minWholesaleQty: 12,
  },
];
