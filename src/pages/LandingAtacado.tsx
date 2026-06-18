import { motion } from 'framer-motion';
import { ArrowRight, Star, Package, TrendingUp, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { trackEvent } from '@/components/seo/AnalyticsTracker';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const benefits = [
  { icon: Package, title: 'Mínimo 3 unidades', desc: 'Compre a partir de 3 unidades com preço de atacado' },
  { icon: TrendingUp, title: 'Até 40% de desconto', desc: 'Margem excelente para revenda de cosméticos' },
  { icon: Users, title: '+500 revendedoras', desc: 'Rede de revendedoras em todo o Brasil' },
];

const testimonials = [
  { name: 'Carolina M.', city: 'São Paulo', text: 'Revendo cosméticos da Lumera e minhas clientes amam a qualidade. Excelente margem.', stars: 5 },
  { name: 'Patrícia V.', city: 'Curitiba', text: 'O melhor fornecedor de cosméticos no atacado. Sempre têm novidades.', stars: 5 },
];

export default function LandingAtacado() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { toast.error('Preencha nome e telefone.'); return; }
    setLoading(true);
    try {
      await supabase.from('leads').insert({
        name: name.trim(),
        phone: phone.trim(),
        message: company.trim() ? `Empresa: ${company.trim()}` : null,
        source: 'landing-atacado',
        status: 'warm',
      });
      trackEvent('generate_lead', { source: 'landing-atacado', method: 'form' });
      toast.success('Recebido! Entraremos em contato com os preços de atacado.');
      setName(''); setPhone(''); setCompany('');
    } catch { toast.error('Erro ao enviar.'); }
    finally { setLoading(false); }
  };

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'landing-atacado' });
    window.open('https://wa.me/5511999999999?text=Ol%C3%A1!%20Quero%20informa%C3%A7%C3%B5es%20de%20pre%C3%A7os%20no%20atacado%20de%20cosm%C3%A9ticos', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Atacado de Cosméticos | Lumera Store"
        description="Compre cosméticos no atacado no Brasil. Maquiagem, skincare e perfumaria a partir de 3 unidades com até 40% de desconto. Solicite preços!"
        keywords="cosméticos atacado brasil, venda por atacado, atacado cosméticos, revendedor beleza"
        canonical="https://lumerastore.lovable.app/atacado"
        noindex
      />

      <Header />

      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-hero">
        <div className="container text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
            PROGRAMA DE ATACADO
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Ganhe Dinheiro Revendendo Cosméticos
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Preços exclusivos a partir de 3 unidades. Margem de até 40% para o seu negócio de beleza.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8" onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver Catálogo B2B <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" className="bg-[#25D366] text-white hover:bg-[#1da851] text-lg" onClick={handleWhatsAppClick}>
              <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Direto
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center bg-card p-8 rounded-2xl shadow-sm border border-border">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4"><b.icon className="h-8 w-8" /></div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">Revendedoras de Sucesso</h2>
          <div className="space-y-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex gap-1 mb-2">{Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="h-4 w-4 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />)}</div>
                <p className="text-foreground italic mb-2">"{t.text}"</p>
                <p className="text-sm text-muted-foreground">{t.name} — {t.city}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="lead-form" className="py-20">
        <div className="container max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card p-8 md:p-10 rounded-3xl shadow-md border border-border">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-2">Solicite Preços de Atacado</h2>
            <p className="text-muted-foreground text-center mb-8">Preencha o formulário e receba nossa tabela de preços de cosméticos.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Seu nome *" value={name} onChange={e => setName(e.target.value)} required />
              <Input placeholder="WhatsApp / Telefone *" value={phone} onChange={e => setPhone(e.target.value)} required />
              <Input placeholder="Nome do seu negócio (opcional)" value={company} onChange={e => setCompany(e.target.value)} />
              <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                {loading ? 'Enviando...' : 'Receber Preços de Atacado'}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-hero">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">Comece a revender hoje!</h2>
          <Button size="lg" className="bg-[#25D366] text-white hover:bg-[#1da851] text-lg px-8" onClick={handleWhatsAppClick}>
            <MessageCircle className="mr-2 h-5 w-5" /> Contatar pelo WhatsApp
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
