import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wholesale from "./pages/Wholesale";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import AdminLayout from "./pages/admin/AdminLayout";
import Chatbot from "./components/Chatbot";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogCategory from "./pages/BlogCategory";
import LandingModa from "./pages/LandingModa";
import LandingAtacado from "./pages/LandingAtacado";
import FAQ from "./pages/FAQ";
import CityLanding from "./pages/CityLanding";
import ModaFemenina from "./pages/ModaFemenina";
import Promocoes from "./pages/Promocoes";
import Sobre from "./pages/Sobre";
import ScrollToTop from "./components/ScrollToTop";
import AnalyticsTracker from "./components/seo/AnalyticsTracker";

// Code-split admin routes for performance
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const ProductImportExport = lazy(() => import("./pages/admin/ProductImportExport"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Subcategories = lazy(() => import("./pages/admin/Subcategories"));
const Pages = lazy(() => import("./pages/admin/Pages"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Notifications = lazy(() => import("./pages/admin/Notifications"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const Leads = lazy(() => import("./pages/admin/Leads"));
const CrmKanban = lazy(() => import("./pages/admin/CrmKanban"));
const ApiCredentials = lazy(() => import("./pages/admin/ApiCredentials"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const SeoTools = lazy(() => import("./pages/admin/SeoTools"));
const Cupons = lazy(() => import("./pages/admin/Cupons"));
const MarketplaceDashboard = lazy(() => import("./pages/admin/marketplaces/MarketplaceDashboard"));
const MarketplaceConnections = lazy(() => import("./pages/admin/marketplaces/MarketplaceConnections"));
const MarketplaceCatalog = lazy(() => import("./pages/admin/marketplaces/MarketplaceCatalog"));
const MarketplaceOrders = lazy(() => import("./pages/admin/marketplaces/MarketplaceOrders"));
const MarketplaceStock = lazy(() => import("./pages/admin/marketplaces/MarketplaceStock"));
const MarketplaceLogs = lazy(() => import("./pages/admin/marketplaces/MarketplaceLogs"));
const MarketplaceMessages = lazy(() => import("./pages/admin/marketplaces/MarketplaceMessages"));
const PostSaleAutomation = lazy(() => import("./pages/admin/marketplaces/PostSaleAutomation"));
const MarketplaceAnalytics = lazy(() => import("./pages/admin/marketplaces/MarketplaceAnalytics"));
const MarketplaceAutomations = lazy(() => import("./pages/admin/marketplaces/MarketplaceAutomations"));

const queryClient = new QueryClient();

// Legacy /producto/:id → /produto/:slug-or-id (301-style client redirect)
function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/produto/${id}`} replace />;
}

const AdminFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AnalyticsTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/catalogo" element={<Catalog />} />
                {/* Canonical product route (slug-based, falls back to id) */}
                <Route path="/produto/:slug" element={<ProductDetail />} />
                {/* Legacy redirects (ES → pt-BR) */}
                <Route path="/producto/:id" element={<LegacyProductRedirect />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/atacado" element={<Wholesale />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/conta" element={<Account />} />
                <Route path="/cuenta" element={<Navigate to="/conta" replace />} />
                <Route path="/mayorista" element={<Navigate to="/atacado" replace />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/moda" element={<BlogCategory />} />
                <Route path="/blog/tendencias" element={<BlogCategory />} />
                <Route path="/blog/guia" element={<BlogCategory />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/moda" element={<LandingModa />} />
                <Route path="/moda-femenina" element={<ModaFemenina />} />
                <Route path="/moda-femenina/:citySlug" element={<CityLanding />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/promocoes" element={<Promocoes />} />
                <Route path="/sobre" element={<Sobre />} />
                {/* Admin Routes (lazy) */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>} />
                  <Route path="produtos" element={<Suspense fallback={<AdminFallback />}><Products /></Suspense>} />
                  <Route path="categorias" element={<Suspense fallback={<AdminFallback />}><Categories /></Suspense>} />
                  <Route path="subcategorias" element={<Suspense fallback={<AdminFallback />}><Subcategories /></Suspense>} />
                  <Route path="paginas" element={<Suspense fallback={<AdminFallback />}><Pages /></Suspense>} />
                  <Route path="pedidos" element={<Suspense fallback={<AdminFallback />}><Orders /></Suspense>} />
                  <Route path="notificacoes" element={<Suspense fallback={<AdminFallback />}><Notifications /></Suspense>} />
                  <Route path="clientes" element={<Suspense fallback={<AdminFallback />}><Customers /></Suspense>} />
                  <Route path="cupons" element={<Suspense fallback={<AdminFallback />}><Cupons /></Suspense>} />
                  <Route path="seo" element={<Suspense fallback={<AdminFallback />}><SeoTools /></Suspense>} />
                  <Route path="leads" element={<Suspense fallback={<AdminFallback />}><Leads /></Suspense>} />
                  <Route path="crm" element={<Suspense fallback={<AdminFallback />}><CrmKanban /></Suspense>} />
                  <Route path="credenciales" element={<Suspense fallback={<AdminFallback />}><ApiCredentials /></Suspense>} />
                  <Route path="reportes" element={<Suspense fallback={<AdminFallback />}><Reports /></Suspense>} />
                  <Route path="configuracion" element={<Suspense fallback={<AdminFallback />}><Settings /></Suspense>} />
                  <Route path="marketplaces" element={<Suspense fallback={<AdminFallback />}><MarketplaceDashboard /></Suspense>} />
                  <Route path="marketplaces/conexoes" element={<Suspense fallback={<AdminFallback />}><MarketplaceConnections /></Suspense>} />
                  <Route path="marketplaces/catalogo" element={<Suspense fallback={<AdminFallback />}><MarketplaceCatalog /></Suspense>} />
                  <Route path="marketplaces/pedidos" element={<Suspense fallback={<AdminFallback />}><MarketplaceOrders /></Suspense>} />
                  <Route path="marketplaces/estoque" element={<Suspense fallback={<AdminFallback />}><MarketplaceStock /></Suspense>} />
                  <Route path="marketplaces/logs" element={<Suspense fallback={<AdminFallback />}><MarketplaceLogs /></Suspense>} />
                  <Route path="marketplaces/mensagens" element={<Suspense fallback={<AdminFallback />}><MarketplaceMessages /></Suspense>} />
                  <Route path="marketplaces/automacao" element={<Suspense fallback={<AdminFallback />}><PostSaleAutomation /></Suspense>} />
                  <Route path="marketplaces/analytics" element={<Suspense fallback={<AdminFallback />}><MarketplaceAnalytics /></Suspense>} />
                  <Route path="marketplaces/automacoes" element={<Suspense fallback={<AdminFallback />}><MarketplaceAutomations /></Suspense>} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Chatbot />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
