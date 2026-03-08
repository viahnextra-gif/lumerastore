export interface CityData {
  slug: string;
  name: string;
  department: string;
  population: string;
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  localInfo: string;
  shippingNote: string;
  testimonial: { name: string; text: string; stars: number };
  nearbyAreas: string[];
  localLandmarks: string;
}

export const cities: CityData[] = [
  {
    slug: 'asuncion',
    name: 'Asunción',
    department: 'Capital',
    population: '525.000',
    heroTitle: 'Moda Femenina en Asunción',
    heroSubtitle: 'La mejor selección de vestidos, conjuntos y blusas con entrega rápida en la capital paraguaya.',
    metaTitle: 'Moda Femenina en Asunción | Vestidos y Conjuntos | Meca Store',
    metaDescription: 'Compra moda femenina en Asunción, Paraguay. Vestidos, conjuntos, blusas y más con envío express en la capital. Precios desde ₲ 89.000. ¡Compra ahora!',
    keywords: ['moda femenina asunción', 'ropa mujer asunción', 'vestidos asunción paraguay', 'tienda ropa asunción', 'comprar ropa online asunción'],
    localInfo: 'Asunción, la capital de Paraguay, es el centro de la moda y las tendencias del país. En Meca Store ofrecemos entrega express en toda la ciudad y alrededores, incluyendo Lambaré, Fernando de la Mora y San Lorenzo.',
    shippingNote: 'Entrega en 1-2 días hábiles en Asunción y Gran Asunción',
    testimonial: { name: 'María G.', text: 'Pedí un vestido y llegó al día siguiente a mi casa en Asunción. La calidad es increíble y el precio muy accesible.', stars: 5 },
    nearbyAreas: ['Lambaré', 'Fernando de la Mora', 'San Lorenzo', 'Luque', 'Mariano Roque Alonso'],
    localLandmarks: 'Desde el centro histórico hasta el Shopping del Sol, viste con estilo en cada rincón de Asunción.',
  },
  {
    slug: 'ciudad-del-este',
    name: 'Ciudad del Este',
    department: 'Alto Paraná',
    population: '387.000',
    heroTitle: 'Moda Femenina en Ciudad del Este',
    heroSubtitle: 'Vestidos, conjuntos y blusas con los mejores precios. Envíos rápidos a CDE y todo Alto Paraná.',
    metaTitle: 'Moda Femenina en Ciudad del Este | Ropa de Mujer | Meca Store',
    metaDescription: 'Tienda de moda femenina en Ciudad del Este, Paraguay. Vestidos, blusas, conjuntos con envío rápido a CDE y Alto Paraná. Calidad premium.',
    keywords: ['moda femenina ciudad del este', 'ropa mujer cde', 'vestidos ciudad del este', 'tienda ropa alto parana', 'comprar ropa online cde'],
    localInfo: 'Ciudad del Este, la segunda ciudad más grande de Paraguay y capital comercial del Alto Paraná. Meca Store ofrece envíos directos a CDE con precios competitivos que rivalizan con las mejores ofertas de la zona.',
    shippingNote: 'Entrega en 2-3 días hábiles en Ciudad del Este y Alto Paraná',
    testimonial: { name: 'Ana P.', text: 'Soy de CDE y compro siempre en Meca Store. Los precios son mejores que en las tiendas locales y la calidad es superior.', stars: 5 },
    nearbyAreas: ['Hernandarias', 'Presidente Franco', 'Minga Guazú', 'Santa Rita'],
    localLandmarks: 'Desde el microcentro comercial hasta los barrios residenciales, llevamos la moda hasta tu puerta.',
  },
  {
    slug: 'encarnacion',
    name: 'Encarnación',
    department: 'Itapúa',
    population: '130.000',
    heroTitle: 'Moda Femenina en Encarnación',
    heroSubtitle: 'Descubre la colección perfecta para el clima de Encarnación. Envíos a toda la Perla del Sur.',
    metaTitle: 'Moda Femenina en Encarnación | Vestidos y Blusas | Meca Store',
    metaDescription: 'Compra moda femenina en Encarnación, Itapúa. Vestidos frescos, conjuntos elegantes y blusas con envío rápido. La Perla del Sur merece estilo.',
    keywords: ['moda femenina encarnación', 'ropa mujer encarnación', 'vestidos encarnación paraguay', 'tienda ropa itapúa', 'comprar ropa encarnación'],
    localInfo: 'Encarnación, la Perla del Sur, es conocida por su costanera, su carnaval y su clima cálido. Nuestra colección incluye prendas ideales para el estilo de vida encarnaceno.',
    shippingNote: 'Entrega en 2-4 días hábiles en Encarnación e Itapúa',
    testimonial: { name: 'Lucía R.', text: 'Los vestidos de Meca Store son perfectos para el clima de Encarnación. Frescos, elegantes y a buen precio.', stars: 5 },
    nearbyAreas: ['Cambyretá', 'San Juan del Paraná', 'Capitán Miranda', 'Hohenau'],
    localLandmarks: 'De la costanera al centro, con Meca Store siempre vas a la moda en Encarnación.',
  },
  {
    slug: 'san-lorenzo',
    name: 'San Lorenzo',
    department: 'Central',
    population: '272.000',
    heroTitle: 'Moda Femenina en San Lorenzo',
    heroSubtitle: 'Ropa de mujer con entrega rápida en San Lorenzo. Vestidos, conjuntos y más al mejor precio.',
    metaTitle: 'Moda Femenina en San Lorenzo | Ropa de Mujer | Meca Store',
    metaDescription: 'Tienda de moda femenina con envío a San Lorenzo, Central. Vestidos, blusas, conjuntos y más. Entrega rápida y precios accesibles.',
    keywords: ['moda femenina san lorenzo', 'ropa mujer san lorenzo', 'vestidos san lorenzo paraguay', 'tienda ropa central'],
    localInfo: 'San Lorenzo, parte del Gran Asunción, es una de las ciudades más pobladas de Paraguay. Aprovecha nuestros envíos express desde la capital para recibir tu pedido en tiempo récord.',
    shippingNote: 'Entrega en 1-2 días hábiles desde Asunción',
    testimonial: { name: 'Carolina M.', text: 'Vivo en San Lorenzo y recibí mi pedido al día siguiente. Las blusas son hermosas y muy cómodas.', stars: 5 },
    nearbyAreas: ['Capiatá', 'Ñemby', 'Luque', 'Asunción'],
    localLandmarks: 'Desde la Universidad Nacional hasta los centros comerciales, viste con estilo en San Lorenzo.',
  },
  {
    slug: 'luque',
    name: 'Luque',
    department: 'Central',
    population: '320.000',
    heroTitle: 'Moda Femenina en Luque',
    heroSubtitle: 'Estilo y elegancia con envío rápido a Luque. La mejor moda femenina a tu alcance.',
    metaTitle: 'Moda Femenina en Luque | Vestidos y Conjuntos | Meca Store',
    metaDescription: 'Compra moda femenina en Luque, Paraguay. Vestidos, conjuntos y blusas con envío express. Calidad premium y precios accesibles.',
    keywords: ['moda femenina luque', 'ropa mujer luque', 'vestidos luque paraguay', 'tienda ropa luque'],
    localInfo: 'Luque, sede de la CONMEBOL y parte del Gran Asunción, combina tradición con modernidad. Meca Store lleva las últimas tendencias hasta tu puerta con envío express.',
    shippingNote: 'Entrega en 1-2 días hábiles desde Asunción',
    testimonial: { name: 'Valentina S.', text: 'Increíble servicio. Pedí desde Luque y llegó rapidísimo. Los conjuntos son preciosos.', stars: 5 },
    nearbyAreas: ['Asunción', 'San Lorenzo', 'Mariano Roque Alonso', 'Limpio'],
    localLandmarks: 'De Rakiura al centro de Luque, siempre con el mejor estilo de Meca Store.',
  },
  {
    slug: 'caaguazu',
    name: 'Caaguazú',
    department: 'Caaguazú',
    population: '120.000',
    heroTitle: 'Moda Femenina en Caaguazú',
    heroSubtitle: 'Vestidos, blusas y conjuntos con envío directo a Caaguazú. Moda de calidad sin salir de casa.',
    metaTitle: 'Moda Femenina en Caaguazú | Ropa de Mujer Online | Meca Store',
    metaDescription: 'Tienda de moda femenina con envío a Caaguazú. Vestidos, conjuntos y blusas al mejor precio. Compra online y recibe en tu casa.',
    keywords: ['moda femenina caaguazú', 'ropa mujer caaguazú', 'vestidos caaguazú paraguay', 'comprar ropa online caaguazú'],
    localInfo: 'Caaguazú, corazón del Paraguay, ahora tiene acceso a la mejor moda femenina sin necesidad de viajar a la capital. Meca Store envía directamente a tu domicilio.',
    shippingNote: 'Entrega en 3-4 días hábiles',
    testimonial: { name: 'Gabriela F.', text: 'Antes tenía que ir hasta Asunción para conseguir ropa bonita. Ahora compro en Meca Store y me llega a Caaguazú.', stars: 5 },
    nearbyAreas: ['Coronel Oviedo', 'Villarrica', 'Carayaó'],
    localLandmarks: 'En Caaguazú también se viste con estilo gracias a Meca Store.',
  },
  {
    slug: 'pedro-juan-caballero',
    name: 'Pedro Juan Caballero',
    department: 'Amambay',
    population: '130.000',
    heroTitle: 'Moda Femenina en Pedro Juan Caballero',
    heroSubtitle: 'Las últimas tendencias en moda femenina con envío a Pedro Juan Caballero y Amambay.',
    metaTitle: 'Moda Femenina en Pedro Juan Caballero | Meca Store',
    metaDescription: 'Compra moda femenina en Pedro Juan Caballero. Vestidos, conjuntos y blusas con envío a Amambay. Precios accesibles y calidad premium.',
    keywords: ['moda femenina pedro juan caballero', 'ropa mujer amambay', 'vestidos pedro juan caballero', 'tienda ropa pjc'],
    localInfo: 'Pedro Juan Caballero, capital de Amambay y frontera con Brasil, merece moda de calidad. Meca Store ofrece envíos directos con las mejores tendencias.',
    shippingNote: 'Entrega en 3-5 días hábiles',
    testimonial: { name: 'Daniela A.', text: 'Soy de PJC y la ropa llegó en perfecto estado. La calidad supera a muchas marcas brasileñas.', stars: 5 },
    nearbyAreas: ['Capitán Bado', 'Bella Vista Norte'],
    localLandmarks: 'Desde el centro comercial hasta la frontera, Meca Store viste a la mujer de Amambay.',
  },
  {
    slug: 'coronel-oviedo',
    name: 'Coronel Oviedo',
    department: 'Caaguazú',
    population: '110.000',
    heroTitle: 'Moda Femenina en Coronel Oviedo',
    heroSubtitle: 'Ropa de mujer con envío directo a Coronel Oviedo. Vestidos, blusas y conjuntos al mejor precio.',
    metaTitle: 'Moda Femenina en Coronel Oviedo | Meca Store',
    metaDescription: 'Tienda de moda femenina con envío a Coronel Oviedo. Vestidos, conjuntos, blusas de calidad. Compra online fácil y segura.',
    keywords: ['moda femenina coronel oviedo', 'ropa mujer coronel oviedo', 'vestidos coronel oviedo', 'tienda ropa caaguazú'],
    localInfo: 'Coronel Oviedo, cruce estratégico de rutas en Paraguay, ahora conectada con la mejor moda femenina del país a través de Meca Store.',
    shippingNote: 'Entrega en 2-3 días hábiles',
    testimonial: { name: 'Sandra L.', text: 'Excelente experiencia comprando desde Coronel Oviedo. La ropa es hermosa y el servicio impecable.', stars: 5 },
    nearbyAreas: ['Caaguazú', 'Villarrica', 'San José de los Arroyos'],
    localLandmarks: 'En el corazón de Paraguay, Meca Store lleva la moda hasta tu puerta.',
  },
];

export function getCityBySlug(slug: string): CityData | undefined {
  return cities.find(c => c.slug === slug);
}
