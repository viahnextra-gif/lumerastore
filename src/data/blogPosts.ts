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
    slug: 'guia-completa-skincare-brasil',
    title: 'Guia Completo de Skincare no Brasil 2026',
    excerpt: 'Descubra a rotina ideal de skincare para o clima brasileiro: limpeza, hidratação e proteção solar diária.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    category: 'Guia',
    date: '08 Mar 2026',
    dateISO: '2026-03-08',
    readTime: '8 min',
    keywords: ['skincare brasil', 'rotina de cuidados', 'pele oleosa', 'protetor solar'],
    content: `
      <h2>Por que o skincare é essencial no clima brasileiro</h2>
      <p>O clima quente e úmido do Brasil exige uma rotina de skincare específica. A oleosidade aumenta, os poros dilatam e a proteção solar deixa de ser opcional para se tornar obrigatória.</p>
      <h3>1. Limpeza diária</h3>
      <p>Use um gel de limpeza adequado ao seu tipo de pele de manhã e à noite. Para peles oleosas, opte por fórmulas com ácido salicílico.</p>
      <h3>2. Hidratação leve</h3>
      <p>Mesmo peles oleosas precisam de hidratação. Prefira séruns com ácido hialurônico e cremes oil-free.</p>
      <h3>3. Protetor solar FPS 50+</h3>
      <p>Reaplique a cada 3 horas. É o passo mais importante para prevenir manchas e envelhecimento precoce.</p>
      <h2>Produtos recomendados pela Lumera Store</h2>
      <p>Conheça nossa <a href="/catalogo?category=cuidado-facial">linha completa de cuidado facial</a> com entrega para todo o Brasil.</p>
    `,
  },
  {
    slug: 'tendencias-maquiagem-2026',
    title: 'Tendências de Maquiagem 2026: O que Vai Bombar',
    excerpt: 'Glow natural, blush draping e batom amarronzado: confira as tendências de maquiagem que dominam 2026.',
    image: 'https://images.unsplash.com/photo-1522335789203-aaa46c0a6fc4?w=800&q=80',
    category: 'Tendências',
    date: '05 Mar 2026',
    dateISO: '2026-03-05',
    readTime: '6 min',
    keywords: ['maquiagem 2026', 'tendências beleza', 'blush', 'batom'],
    content: `
      <h2>Glow natural é a estrela do ano</h2>
      <p>A pele iluminada e saudável continua em alta. Use bases leves, iluminadores líquidos e blush em creme para um efeito natural.</p>
      <h3>Blush draping</h3>
      <p>Aplique o blush das maçãs do rosto até as têmporas para realçar a estrutura e dar movimento ao olhar.</p>
      <h3>Batom amarronzado</h3>
      <p>Tons nude amarronzados e terracota são os queridinhos. Combine com delineador marrom para um look harmônico.</p>
      <p>Explore nossa <a href="/catalogo?category=maquiagem">seção de maquiagem</a> com as melhores marcas.</p>
    `,
  },
  {
    slug: 'como-escolher-perfume-ideal',
    title: 'Como Escolher o Perfume Ideal para Você',
    excerpt: 'Aprenda a identificar famílias olfativas e descubra a fragrância perfeita para cada ocasião.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    category: 'Guia',
    date: '01 Mar 2026',
    dateISO: '2026-03-01',
    readTime: '7 min',
    keywords: ['perfumes', 'fragrâncias', 'perfumaria brasil'],
    content: `
      <h2>Conheça as famílias olfativas</h2>
      <p>Florais, amadeirados, cítricos e orientais — cada família carrega uma personalidade. Identifique a sua antes de comprar.</p>
      <h2>Teste sempre na pele</h2>
      <p>O perfume reage de forma única em cada pessoa. Aplique no pulso e espere 15 minutos para sentir o fundo.</p>
      <p>Veja nossa <a href="/catalogo?category=perfumaria">perfumaria completa</a> com opções nacionais e importadas.</p>
    `,
  },
  {
    slug: 'rotina-de-cabelos-cacheados',
    title: 'Rotina Perfeita para Cabelos Cacheados',
    excerpt: 'Hidratação, nutrição e reconstrução: monte um cronograma capilar para realçar seus cachos.',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80',
    category: 'Guia',
    date: '25 Fev 2026',
    dateISO: '2026-02-25',
    readTime: '9 min',
    keywords: ['cabelo cacheado', 'cronograma capilar', 'hidratação'],
    content: `
      <h2>O que é o cronograma capilar</h2>
      <p>É a alternância entre hidratação, nutrição e reconstrução para manter os fios saudáveis.</p>
      <h3>Hidratação</h3>
      <p>Devolve a água perdida nos fios. Use 2x por semana com máscaras à base de aloe vera ou ácido hialurônico.</p>
      <h3>Nutrição</h3>
      <p>Repõe lipídios. Aposte em óleos de coco, abacate e manteigas vegetais.</p>
      <h3>Reconstrução</h3>
      <p>Repõe proteínas. Use queratina ou colágeno 1x por semana.</p>
      <p>Confira nossa <a href="/catalogo?category=cabelos">linha de cabelos</a>.</p>
    `,
  },
  {
    slug: 'protetor-solar-facial-melhores',
    title: 'Melhores Protetores Solares Faciais para 2026',
    excerpt: 'Comparativo dos protetores solares faciais com melhor custo-benefício para diferentes tipos de pele.',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
    category: 'Tendências',
    date: '20 Fev 2026',
    dateISO: '2026-02-20',
    readTime: '5 min',
    keywords: ['protetor solar', 'fps', 'cuidado facial'],
    content: `
      <h2>FPS mínimo recomendado: 30</h2>
      <p>Para o sol forte do Brasil, prefira FPS 50 ou superior, sempre com proteção UVA.</p>
      <h2>Toque seco para peles oleosas</h2>
      <p>Fórmulas com sílica e ácido hialurônico evitam o brilho excessivo.</p>
      <p>Veja todos os <a href="/catalogo?category=cuidado-facial">protetores solares disponíveis</a> na Lumera Store.</p>
    `,
  },
  {
    slug: 'como-revender-cosmeticos-brasil',
    title: 'Como Revender Cosméticos no Brasil: Guia Passo a Passo',
    excerpt: 'Inicie seu negócio de revenda de cosméticos com margens atrativas e estratégias práticas.',
    image: 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800&q=80',
    category: 'Negócio',
    date: '15 Fev 2026',
    dateISO: '2026-02-15',
    readTime: '10 min',
    keywords: ['revender cosméticos', 'atacado beleza', 'negócio brasil'],
    content: `
      <h2>Por que revender cosméticos é um bom negócio</h2>
      <p>O mercado brasileiro de beleza é um dos maiores do mundo. Com margens entre 30% e 60%, é altamente escalável.</p>
      <h2>Passo a passo</h2>
      <ol>
        <li>Defina seu nicho (maquiagem, skincare, perfumaria).</li>
        <li>Compre no <a href="/atacado">atacado da Lumera Store</a> a partir de 3 unidades.</li>
        <li>Crie suas redes sociais e fotografe os produtos.</li>
        <li>Ofereça pronta-entrega e atendimento via WhatsApp.</li>
      </ol>
      <p>Acesse nossa <a href="/atacado">página de atacado</a> e solicite condições especiais.</p>
    `,
  },
];
