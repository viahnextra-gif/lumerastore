import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3, MessageSquare,
  Tag, LogOut, ChevronLeft, ChevronDown, Menu, Layers, FileText, Kanban,
  CalendarDays, Megaphone, Key, Store, Bell, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMarketplaceNotifications } from '@/hooks/useMarketplaceNotifications';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import CurrencySelector from '@/components/CurrencySelector';
import SeoAlertBanner from '@/components/admin/SeoAlertBanner';

function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mkOpen, setMkOpen] = useState(location.pathname.startsWith('/admin/marketplaces'));
  const { count: unreadCount } = useUnreadNotifications();

  const navigation = [
    { name: t('admin.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('admin.products'), href: '/admin/produtos', icon: Package },
    { name: t('admin.categories'), href: '/admin/categorias', icon: Tag },
    { name: t('admin.subcategories'), href: '/admin/subcategorias', icon: Layers },
    { name: t('admin.pages'), href: '/admin/paginas', icon: FileText },
    { name: t('admin.orders'), href: '/admin/pedidos', icon: ShoppingCart },
    { name: t('admin.notifications') || 'Notificações', href: '/admin/notificacoes', icon: Bell },
    { name: t('admin.crmKanban'), href: '/admin/crm', icon: Kanban },
    { name: t('admin.customers'), href: '/admin/clientes', icon: Users },
    { name: t('admin.leads'), href: '/admin/leads', icon: MessageSquare },
    { name: t('admin.socialPlanner'), href: '/admin/planner', icon: CalendarDays },
    { name: t('admin.campaigns'), href: '/admin/campanias', icon: Megaphone },
    { name: t('admin.credentials'), href: '/admin/credenciales', icon: Key },
    { name: t('admin.reports'), href: '/admin/reportes', icon: BarChart3 },
    { name: t('admin.settings'), href: '/admin/configuracion', icon: Settings },
    { name: 'SEO & Sitemap', href: '/admin/seo', icon: Search },
  ];

  const marketplaceNav = [
    { name: t('admin.dashboard'), href: '/admin/marketplaces' },
    { name: t('admin.mkConnections'), href: '/admin/marketplaces/conexoes' },
    { name: t('admin.mkCatalog'), href: '/admin/marketplaces/catalogo' },
    { name: t('admin.mkOrders'), href: '/admin/marketplaces/pedidos' },
    { name: t('admin.mkStock'), href: '/admin/marketplaces/estoque' },
    { name: t('admin.mkMessages'), href: '/admin/marketplaces/mensagens' },
    { name: t('admin.mkPostSale'), href: '/admin/marketplaces/automacao' },
    { name: t('admin.mkAnalytics'), href: '/admin/marketplaces/analytics' },
    { name: t('admin.mkAutomations'), href: '/admin/marketplaces/automacoes' },
    { name: t('admin.mkLogs'), href: '/admin/marketplaces/logs' },
  ];

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">{t('admin.backToStore')}</span>
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-primary">Lumera Admin</h1>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
            const isNotif = item.href === '/admin/notificacoes';
            return (
              <Link key={item.href} to={item.href}
                className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                <item.icon className="h-5 w-5" />
                {item.name}
                {isNotif && unreadCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold min-w-[20px] h-5 px-1.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div>
            <button onClick={() => setMkOpen(!mkOpen)}
              className={cn('flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors', location.pathname.startsWith('/admin/marketplaces') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <span className="flex items-center gap-3"><Store className="h-5 w-5" /> {t('admin.marketplaces')}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', mkOpen && 'rotate-180')} />
            </button>
            {mkOpen && (
              <div className="ml-6 mt-1 space-y-0.5">
                {marketplaceNav.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.href} to={item.href}
                      className={cn('block px-3 py-1.5 rounded-md text-xs font-medium transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </ScrollArea>

      <Separator />
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> {t('admin.signOut')}
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, isLoading, isAdmin, isAdminOrModerator } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useMarketplaceNotifications();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdminOrModerator) {
        navigate('/');
      }
    }
  }, [user, isLoading, isAdminOrModerator, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!user || !isAdminOrModerator) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-background border-b">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="p-0 w-72"><Sidebar /></SheetContent>
        </Sheet>
        <h1 className="font-display text-xl font-bold text-primary">Lumera Admin</h1>
        <CurrencySelector />
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 h-screen sticky top-0 bg-background border-r"><Sidebar /></aside>
        <main className="flex-1 p-6 lg:p-8">
          <SeoAlertBanner />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
