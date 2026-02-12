import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  Tag,
  LogOut,
  ChevronLeft,
  Menu,
  Layers,
  FileText,
  Kanban,
  CalendarDays,
  Megaphone,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Categorías', href: '/admin/categorias', icon: Tag },
  { name: 'Subcategorías', href: '/admin/subcategorias', icon: Layers },
  { name: 'Páginas', href: '/admin/paginas', icon: FileText },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'CRM Kanban', href: '/admin/crm', icon: Kanban },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Leads', href: '/admin/leads', icon: MessageSquare },
  { name: 'Planner Social', href: '/admin/planner', icon: CalendarDays },
  { name: 'Campañas', href: '/admin/campanias', icon: Megaphone },
  { name: 'Credenciales', href: '/admin/credenciales', icon: Key },
  { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
];

function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Volver a la tienda</span>
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-primary">MECA Admin</h1>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/admin' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />
      
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, isLoading, isAdmin, isAdminOrModerator } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdminOrModerator)) {
      navigate('/auth');
    }
  }, [user, isLoading, isAdminOrModerator, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdminOrModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-background border-b">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="font-display text-xl font-bold text-primary">MECA Admin</h1>
        <div className="w-10" />
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 h-screen sticky top-0 bg-background border-r">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
