import { motion } from 'framer-motion';
import { Sparkles, Heart, ShieldCheck, Truck, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { organizationSchema, breadcrumbSchema } from '@/components/seo/schemas';

const BASE_URL = 'https://lumerastore.lovable.app';

const differentials = [
  {
    icon: Sparkles,
    title: 'Curadoria de marcas',
    desc: 'Trabalhamos apenas com marcas reconhecidas no mercado de cosméticos e perfumaria, garantindo originalidade em cada produto.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra 100% segura',
    desc: 'Pagamentos protegidos, dados criptografados e atendimento humano para acompanhar cada etapa do seu pedido.',
  },
  {
    icon: Truck,
    title: 'Envio para todo o Brasil',
    desc: 'Logística rápida e confiável, com rastreio em tempo real e frete grátis em compras acima do valor mínimo.',
  },
  {
    icon: Heart,
    title: 'Beleza para todas as idades',
    desc: 'Linhas femininas, masculinas e infantis em maquiagem, skincare, perfumaria e cuidados capilares.',
  },
  {
    icon: Award,
    title: 'Preços de fábrica',
    desc: 'Negociação direta com distribuidores oficiais para oferecer o melhor custo-benefício do mercado.',
  },
  {
    icon: Users,
    title: 'Programa atacadista',
    desc: 'Condições exclusivas para revendedores, com kits, packs e suporte comercial dedicado.',
  },
];

const milestones = [
  { year: '2023', text: 'Nasce a Lumera Store com o propósito de democratizar o acesso a cosméticos premium.' },
  { year: '2024', text: 'Expansão do catálogo para mais de 200 produtos e parcerias com grandes marcas.' },
  { year: '2025', text: 'Lançamento do programa atacadista e da assistente de beleza com IA.' },
  { year: '2026', text: 'Mais de 50 mil clientes atendidos em todo o Brasil.' },
];

export default function Sobre() {
  const jsonLd = [
    organizationSchema(),
    breadcrumbSchema([
      { name: 'Início', url: '/' },
      { name: 'Sobre', url: '/sobre' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Sobre a Lumera Store',
      url: `${BASE_URL}/sobre`,
      description:
        'Conheça a Lumera Store: história, missão e diferenciais de uma das maiores lojas de cosméticos online do Brasil.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Sobre a Lumera Store | Cosméticos com curadoria"
        description="Conheça a história e os diferenciais da Lumera Store: cosméticos, maquiagem, skincare e perfumaria das melhores marcas, com envio para todo o Brasil."
        canonical={`${BASE_URL}/sobre`}
        keywords="sobre lumera store, loja de cosméticos brasil, maquiagem online, skincare, perfumaria"
        jsonLd={jsonLd}
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-28">
          <div className="container relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                ✨ Nossa história
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Beleza com <span className="text-primary">propósito</span>,<br />
                cosméticos com <span className="text-primary">verdade</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                A Lumera Store nasceu para tornar o cuidado pessoal acessível, transparente e
                sofisticado. Mais que uma loja, somos um destino de beleza para todas as pessoas.
              </p>
            </motion.div>
          </div>
        </section>

        {/* História */}
        <section className="py-20">
          <div className="container max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Nossa missão
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Acreditamos que cuidar da própria beleza é um ato de autoestima. Por isso,
                  reunimos as melhores marcas de cosméticos em um só lugar, com preços justos,
                  curadoria especializada e atendimento próximo.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Da maquiagem ao skincare, da perfumaria ao cuidado capilar — para mulheres,
                  homens e crianças — entregamos beleza com responsabilidade e confiança.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {milestones.map((m) => (
                  <div
                    key={m.year}
                    className="flex gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
                  >
                    <div className="font-display text-2xl font-bold text-primary shrink-0 w-16">
                      {m.year}
                    </div>
                    <p className="text-sm text-muted-foreground">{m.text}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Por que escolher a Lumera Store?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cada detalhe foi pensado para transformar a forma como você compra cosméticos
                online.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {differentials.map((d, i) => (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <d.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pronto para descobrir sua nova rotina de beleza?
            </h2>
            <p className="text-muted-foreground mb-8">
              Explore nosso catálogo completo ou fale com nossa assistente de beleza com IA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalogo">
                <Button size="lg" className="w-full sm:w-auto">
                  Ver catálogo
                </Button>
              </Link>
              <Link to="/atacado">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white text-black hover:bg-white/90">
                  Programa atacadista
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
