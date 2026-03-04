import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    shop: [
      { name: t('nav.dresses'), href: '/catalogo?category=vestidos' },
      { name: t('nav.sets'), href: '/catalogo?category=conjuntos' },
      { name: 'Blusas', href: '/catalogo?category=blusas' },
      { name: 'Calças', href: '/catalogo?category=calcas' },
    ],
    company: [
      { name: t('footer.about'), href: '/sobre' },
      { name: t('nav.wholesale'), href: '/atacado' },
      { name: t('footer.blog'), href: '/blog' },
      { name: t('footer.contact'), href: '/contato' },
    ],
    help: [
      { name: t('footer.faq'), href: '/faq' },
      { name: t('footer.shipping'), href: '/envios' },
      { name: t('footer.returns'), href: '/devoluciones' },
      { name: t('footer.sizeGuide'), href: '/tallas' },
    ],
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold mb-2">{t('footer.newsletter.title')}</h3>
              <p className="text-primary-foreground/70">{t('footer.newsletter.subtitle')}</p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                {t('footer.newsletter.button')}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-2xl font-bold">
                Meca<span className="text-primary">Store</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-xs">{t('footer.brand.desc')}</p>
            <div className="flex gap-4">
              <a href="https://instagram.com/meca_store.py" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/mecastore" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://wa.me/595xxx" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer.shop')}</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-primary-foreground/70 hover:text-primary transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-primary-foreground/70 hover:text-primary transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer.help')}</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-primary-foreground/70 hover:text-primary transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-6">
            <Link to="/privacidad" className="hover:text-primary-foreground">{t('footer.privacy')}</Link>
            <Link to="/terminos" className="hover:text-primary-foreground">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
