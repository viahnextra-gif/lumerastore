const BASE_URL = 'https://lojawakai.lovable.app';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lumera Store',
    url: BASE_URL,
    logo: `${BASE_URL}/lumera-logo.png`,
    description: 'Sua loja de cosméticos online no Brasil. Maquiagem, skincare, perfumaria e mais das melhores marcas.',
    address: { '@type': 'PostalAddress', addressCountry: 'BR' },
    sameAs: [],
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['pt-BR'] },
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Lumera Store',
    url: BASE_URL,
    description: 'Seu destino de cosméticos no Brasil. Qualidade, variedade e os melhores preços.',
    address: { '@type': 'PostalAddress', addressCountry: 'BR' },
    priceRange: 'R$R$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:00',
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function productSchema(product: {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  url: string;
  inStock?: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    category: product.category,
    url: `${BASE_URL}${product.url}`,
    brand: { '@type': 'Brand', name: 'Lumera Store' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.price,
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Lumera Store' },
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lumera Store',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/catalogo?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function itemListSchema(products: { name: string; url: string; image: string; price: number }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}${p.url}`,
      name: p.name,
      image: p.image,
    })),
  };
}
