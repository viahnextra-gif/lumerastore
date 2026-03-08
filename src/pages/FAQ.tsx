import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { faqSchema, organizationSchema, breadcrumbSchema } from '@/components/seo/schemas';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, CreditCard, Ruler, RefreshCw, Shield } from 'lucide-react';

const FAQ_ICONS = [Truck, RefreshCw, Ruler, CreditCard, ShoppingBag, Shield];

export default function FAQ() {
  const { t } = useLanguage();

  const faqs = Array.from({ length: 6 }, (_, i) => ({
    question: t(`faq.q${i + 1}`),
    answer: t(`faq.a${i + 1}`),
    icon: FAQ_ICONS[i],
  }));

  const breadcrumbItems = [{ label: 'FAQ' }];
  const breadcrumbSchemaItems = [
    { name: 'Inicio', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ];

  return (
    <>
      <SEOHead
        title="Preguntas Frecuentes | Meca Store – Moda Femenina Paraguay"
        description="Resuelve tus dudas sobre envíos, tallas, pagos, cambios y compras al por mayor en Meca Store. Atención rápida para toda Paraguay."
        canonical="https://mecastorepy.lovable.app/faq"
        keywords="preguntas frecuentes meca store, envíos paraguay, política de cambios, tallas ropa, pago seguro, compras mayoreo"
        jsonLd={[
          faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
          organizationSchema(),
          breadcrumbSchema(breadcrumbSchemaItems),
        ]}
      />
      <Header />
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/5 to-background pt-28 pb-16">
          <div className="container">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t('faq.title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('faq.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => {
                const Icon = faq.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <AccordionItem
                      value={`faq-${i}`}
                      className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-lg transition-shadow"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5 gap-3">
                        <span className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary shrink-0" />
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 pl-8">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-center bg-card border border-border rounded-xl p-8"
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                ¿Necesitas más ayuda?
              </h2>
              <p className="text-muted-foreground mb-4">
                Nuestro equipo está listo para ayudarte por WhatsApp o a través de nuestro chat.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Ver Catálogo
                </Link>
                <Link
                  to="/atacado"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition"
                >
                  Compras Mayoreo
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
