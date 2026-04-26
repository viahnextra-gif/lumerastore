/**
 * Mirror estático das meta tags renderizadas em produção para cada rota pública.
 * Mantenha sincronizado com `<SEOHead />` chamadas nas páginas correspondentes.
 */
const BASE_URL = 'https://lojawakai.lovable.app';
const DEFAULT_OG = `${BASE_URL}/lumera-logo.png`;

export interface RouteMetaPreview {
  path: string;
  label: string;
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  jsonLdTypes: string[];
}

export function buildPublicRoutePreviews(): RouteMetaPreview[] {
  return [
    {
      path: '/',
      label: 'Home — Lumera Store',
      title: 'Lumera Store | Cosméticos e Beleza no Brasil',
      description:
        'Descubra cosméticos, perfumaria e cuidados para a pele na Lumera Store. Frete grátis acima de R$ 350.',
      canonical: `${BASE_URL}/`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['Organization', 'WebSite'],
    },
    {
      path: '/sobre',
      label: 'Sobre a Lumera Store',
      title: 'Sobre a Lumera Store | Nossa História e Diferenciais',
      description:
        'Conheça a história da Lumera Store, nossos valores, diferenciais e o compromisso com beleza acessível.',
      canonical: `${BASE_URL}/sobre`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['Organization', 'AboutPage', 'BreadcrumbList'],
    },
    {
      path: '/promocoes',
      label: 'Promoções e ofertas',
      title: 'Promoções de Cosméticos | Lumera Store',
      description:
        'Aproveite ofertas exclusivas em maquiagem, perfumes e skincare na Lumera Store. Atualizado diariamente.',
      canonical: `${BASE_URL}/promocoes`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['ItemList', 'BreadcrumbList'],
    },
    {
      path: '/atacado',
      label: 'Atacado para revendedores',
      title: 'Atacado de Cosméticos | Lumera Store',
      description:
        'Compre no atacado na Lumera Store: preços especiais para revendedores a partir de 10 unidades.',
      canonical: `${BASE_URL}/atacado`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['Organization', 'BreadcrumbList'],
    },
    {
      path: '/catalogo',
      label: 'Catálogo completo',
      title: 'Catálogo de Cosméticos | Lumera Store',
      description:
        'Explore todo o catálogo da Lumera Store: maquiagem, perfumaria, cuidado facial, capilar e corporal.',
      canonical: `${BASE_URL}/catalogo`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['CollectionPage', 'BreadcrumbList'],
    },
    {
      path: '/catalogo?category=maquillaje',
      label: 'Catálogo — Maquiagem',
      title: 'Maquiagem | Lumera Store',
      description:
        'Bases, batons, paletas e mais. Maquiagem de qualidade na Lumera Store com envio para todo o Brasil.',
      canonical: `${BASE_URL}/catalogo?category=maquillaje`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['CollectionPage', 'BreadcrumbList'],
    },
    {
      path: '/catalogo?category=perfumeria',
      label: 'Catálogo — Perfumaria',
      title: 'Perfumaria | Lumera Store',
      description:
        'Perfumes nacionais e importados na Lumera Store. As melhores fragrâncias com preços imbatíveis.',
      canonical: `${BASE_URL}/catalogo?category=perfumeria`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['CollectionPage', 'BreadcrumbList'],
    },
    {
      path: '/blog',
      label: 'Blog Lumera Store',
      title: 'Blog Lumera Store | Dicas de Beleza e Cosméticos',
      description:
        'Tendências, tutoriais e guias de beleza no blog da Lumera Store. Conteúdo atualizado semanalmente.',
      canonical: `${BASE_URL}/blog`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['Blog', 'BreadcrumbList'],
    },
    {
      path: '/faq',
      label: 'Perguntas frequentes',
      title: 'FAQ | Lumera Store',
      description:
        'Respostas para as dúvidas mais frequentes sobre pedidos, envios, pagamentos e devoluções na Lumera Store.',
      canonical: `${BASE_URL}/faq`,
      ogImage: DEFAULT_OG,
      jsonLdTypes: ['FAQPage'],
    },
  ];
}
