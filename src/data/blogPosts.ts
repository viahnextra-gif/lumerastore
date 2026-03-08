export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  dateISO: string;
  readTime: string;
  keywords: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'guia-completa-moda-femenina-paraguay',
    title: 'Guía Completa de Moda Femenina en Paraguay 2025',
    excerpt: 'Descubre las tendencias, estilos y tips más importantes para vestir con estilo en Paraguay. Guía definitiva.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    category: 'Moda',
    date: '08 Mar 2026',
    dateISO: '2026-03-08',
    readTime: '8 min',
    keywords: ['moda femenina paraguay', 'tendencias moda', 'estilo mujer', 'ropa paraguay'],
    content: `
      <h2>Las Tendencias que Dominan en Paraguay</h2>
      <p>La moda femenina en Paraguay ha evolucionado enormemente. Las mujeres paraguayas buscan prendas que combinen estilo, comodidad y calidad a precios accesibles.</p>
      <h3>1. Vestidos Florales</h3>
      <p>Los estampados florales continúan siendo los favoritos. Ideales para el clima cálido paraguayo, estos vestidos van desde casuales hasta elegantes para eventos.</p>
      <h3>2. Conjuntos Coordinados</h3>
      <p>Los conjuntos de dos piezas (top + pantalón o top + falda) son la opción perfecta para un look profesional y moderno sin esfuerzo.</p>
      <h3>3. Blusas de Cetim</h3>
      <p>Las blusas de tela satinada aportan elegancia instantánea. Perfectas para combinar con jeans para un look casual-chic o con pantalones de vestir para la oficina.</p>
      <h2>Cómo Elegir la Talla Correcta</h2>
      <p>En Meca Store ofrecemos una guía de tallas detallada. Mide tu busto, cintura y cadera y compara con nuestra tabla para encontrar tu talla perfecta.</p>
      <h2>Dónde Comprar Moda Femenina en Paraguay</h2>
      <p>Meca Store ofrece la mayor variedad de moda femenina con envíos a todo Paraguay. Desde Asunción hasta Ciudad del Este, entregamos tu pedido en la puerta de tu casa.</p>
    `,
  },
  {
    slug: 'como-revender-ropa-femenina-paraguay',
    title: 'Cómo Revender Ropa Femenina en Paraguay: Guía Paso a Paso',
    excerpt: 'Aprende a iniciar tu negocio de reventa de moda femenina. Tips, márgenes y estrategias para ganar dinero.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    category: 'Negocio',
    date: '05 Mar 2026',
    dateISO: '2026-03-05',
    readTime: '10 min',
    keywords: ['revender ropa paraguay', 'negocio moda femenina', 'mayorista ropa', 'ganar dinero revendiendo'],
    content: `
      <h2>¿Por qué revender moda femenina?</h2>
      <p>El mercado de moda femenina en Paraguay es uno de los más dinámicos de Sudamérica. Con un margen promedio del 40%, es un negocio rentable y escalable.</p>
      <h3>Paso 1: Elige tu proveedor</h3>
      <p>Busca proveedores confiables que ofrezcan precios mayoristas competitivos, variedad de productos y facilidades de pago. En Meca Store, ofrecemos precios especiales desde 6 prendas.</p>
      <h3>Paso 2: Define tu público</h3>
      <p>¿Venderás a jóvenes universitarias? ¿Mujeres profesionales? ¿Madres? Definir tu nicho te ayudará a elegir las prendas correctas.</p>
      <h3>Paso 3: Crea tu presencia digital</h3>
      <p>Instagram y WhatsApp son tus mejores aliados. Publica fotos atractivas de las prendas, crea historias mostrando combinaciones y responde rápido a las consultas.</p>
      <h2>Márgenes y Precios</h2>
      <p>Comprando al por mayor en Meca Store, puedes obtener márgenes del 30% al 50% dependiendo de la categoría de producto.</p>
      <h2>Tips para el Éxito</h2>
      <p>Ofrece servicio personalizado, acepta múltiples medios de pago, y mantén tu inventario actualizado con las últimas tendencias.</p>
    `,
  },
  {
    slug: 'tendencias-vestidos-2026',
    title: 'Tendencias de Vestidos 2026: Los Estilos que Debes Tener',
    excerpt: 'Los vestidos que marcan tendencia este año. Desde midi hasta maxi, descubre cuáles no pueden faltar en tu armario.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    category: 'Moda',
    date: '01 Mar 2026',
    dateISO: '2026-03-01',
    readTime: '6 min',
    keywords: ['tendencias vestidos 2026', 'vestidos moda', 'estilos vestidos', 'moda verano'],
    content: `
      <h2>Los Vestidos que Dominarán 2026</h2>
      <p>Este año los vestidos se reinventan con nuevos cortes, colores y texturas que se adaptan a todo tipo de ocasión.</p>
      <h3>Vestido Midi Plisado</h3>
      <p>El vestido midi plisado es versátil y favorecedor para todo tipo de cuerpo. Ideal para la oficina y para salidas casuales.</p>
      <h3>Maxi Vestido Floral</h3>
      <p>Perfecto para el verano paraguayo. Los estampados florales en telas livianas son la elección favorita para días calurosos.</p>
      <h3>Vestido Camisero</h3>
      <p>Un clásico que nunca pasa de moda. El vestido camisero es la definición de elegancia casual.</p>
      <h2>Cómo Combinarlos</h2>
      <p>Cada estilo de vestido tiene sus accesorios ideales. Te mostramos las combinaciones perfectas para cada ocasión.</p>
    `,
  },
  {
    slug: 'guia-tallas-ropa-femenina',
    title: 'Guía de Tallas para Ropa Femenina: Cómo Encontrar tu Talla Perfecta',
    excerpt: 'Aprende a tomar tus medidas correctamente y encuentra tu talla ideal. Tabla de conversión incluida.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    category: 'Guía',
    date: '25 Feb 2026',
    dateISO: '2026-02-25',
    readTime: '5 min',
    keywords: ['guía tallas ropa', 'tabla tallas mujer', 'cómo medir talla', 'tallas ropa femenina'],
    content: `
      <h2>¿Cómo tomar tus medidas?</h2>
      <p>Para encontrar tu talla perfecta, necesitas medir tres puntos clave: busto, cintura y cadera.</p>
      <h3>Busto</h3>
      <p>Mide alrededor de la parte más ancha de tu busto, manteniendo la cinta métrica horizontal.</p>
      <h3>Cintura</h3>
      <p>Mide tu cintura natural, el punto más estrecho de tu torso, generalmente por encima del ombligo.</p>
      <h3>Cadera</h3>
      <p>Mide la parte más ancha de tus caderas, aproximadamente 20 cm debajo de la cintura.</p>
      <h2>Tabla de Conversión</h2>
      <p>En Meca Store trabajamos con tallas S, M, L y XL. Consulta nuestra tabla de conversión para encontrar la equivalencia con tallas numéricas.</p>
    `,
  },
  {
    slug: 'moda-sustentable-paraguay',
    title: 'Moda Sustentable en Paraguay: Cómo Vestir con Conciencia',
    excerpt: 'Descubre cómo elegir ropa de calidad que dure más y reduce tu impacto ambiental sin sacrificar estilo.',
    image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=80',
    category: 'Tendencias',
    date: '20 Feb 2026',
    dateISO: '2026-02-20',
    readTime: '7 min',
    keywords: ['moda sustentable', 'ropa ecológica paraguay', 'moda consciente', 'slow fashion'],
    content: `
      <h2>¿Qué es la Moda Sustentable?</h2>
      <p>La moda sustentable busca reducir el impacto ambiental de la industria textil a través de prácticas responsables de producción, distribución y consumo.</p>
      <h3>Calidad sobre Cantidad</h3>
      <p>Invertir en prendas de buena calidad que duren más temporadas es más sustentable y económico a largo plazo que comprar ropa barata que se deteriora rápido.</p>
      <h3>Prendas Versátiles</h3>
      <p>Elige prendas que puedas combinar de múltiples formas. Un buen conjunto coordinado te da varios looks diferentes.</p>
      <h2>Tips Prácticos</h2>
      <p>Cuida tus prendas siguiendo las instrucciones de lavado, repara en vez de desechar, y dona la ropa que ya no uses.</p>
    `,
  },
  {
    slug: 'outfit-perfecto-cada-ocasion',
    title: 'El Outfit Perfecto para Cada Ocasión: De la Oficina a la Fiesta',
    excerpt: 'Guía práctica para armar looks ideales para trabajo, casual, citas y eventos especiales.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    category: 'Moda',
    date: '15 Feb 2026',
    dateISO: '2026-02-15',
    readTime: '6 min',
    keywords: ['outfit oficina', 'look casual', 'ropa para fiesta', 'combinaciones ropa mujer'],
    content: `
      <h2>Para la Oficina</h2>
      <p>Un pantalón de vestir con una blusa de cetim es la combinación perfecta. Agrega unos zapatos de tacón bajo y estarás lista.</p>
      <h3>Look Casual de Fin de Semana</h3>
      <p>Un vestido midi con zapatillas blancas es el look más cómodo y estiloso. Agrega una cartera cruzada y lentes de sol.</p>
      <h3>Cita Romántica</h3>
      <p>Un vestido con escote y tacones elegantes. Complementa con joyería delicada y un clutch pequeño.</p>
      <h2>Evento Formal</h2>
      <p>Un vestido largo o un conjunto elegante con accesorios statement. Recuerda: menos es más en los eventos formales.</p>
    `,
  },
];
