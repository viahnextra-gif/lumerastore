import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, User, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySelector from '@/components/CurrencySelector';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { totalItems } = useCart();
  const { t } = useLanguage();

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.catalog'), href: '/catalogo' },
    { name: t('nav.fashion'), href: '/moda' },
    { name: t('nav.promo'), href: '/promocoes' },
    { name: t('nav.wholesale'), href: '/atacado' },
    { name: t('nav.blog'), href: '/blog' },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!data);
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkAuth());
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-foreground">
            Meca<span className="text-primary">Store</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" className="hidden sm:flex"><Search className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex"><Heart className="h-5 w-5" /></Button>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="hidden sm:flex text-primary"><Shield className="h-5 w-5" /></Button>
            </Link>
          )}
          <Link to={isLoggedIn ? "/conta" : "/auth"}>
            <Button variant="ghost" size="icon" className="hidden sm:flex"><User className="h-5 w-5" /></Button>
          </Link>
          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </motion.span>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-border overflow-hidden">
            <nav className="container py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-primary">
                      <Shield className="h-4 w-4 mr-2" />
                      {t('nav.admin')}
                    </Button>
                  </Link>
                )}
                <Link to={isLoggedIn ? "/conta" : "/auth"} onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    {isLoggedIn ? t('nav.account') : t('nav.login')}
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
