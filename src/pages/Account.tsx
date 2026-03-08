import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import AccountProfile from '@/components/account/AccountProfile';
import AccountOrders from '@/components/account/AccountOrders';
import AccountAddresses from '@/components/account/AccountAddresses';

export default function Account() {
  const { user, isLoading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: t('account.signOutToast'), description: t('account.signOutDesc') });
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">{t('account.title')}</h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline">
                    {t('account.adminPanel')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('account.signOut')}
              </Button>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('account.profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t('account.orders')}</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">{t('account.addresses')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile"><AccountProfile /></TabsContent>
          <TabsContent value="orders"><AccountOrders /></TabsContent>
          <TabsContent value="addresses"><AccountAddresses /></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
