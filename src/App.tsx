import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Subcategories from "./pages/admin/Subcategories";
import Pages from "./pages/admin/Pages";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Leads from "./pages/admin/Leads";
import CrmKanban from "./pages/admin/CrmKanban";
import SocialPlanner from "./pages/admin/SocialPlanner";
import Campaigns from "./pages/admin/Campaigns";
import ApiCredentials from "./pages/admin/ApiCredentials";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import MarketplaceDashboard from "./pages/admin/marketplaces/MarketplaceDashboard";
import MarketplaceConnections from "./pages/admin/marketplaces/MarketplaceConnections";
import MarketplaceCatalog from "./pages/admin/marketplaces/MarketplaceCatalog";
import MarketplaceOrders from "./pages/admin/marketplaces/MarketplaceOrders";
import MarketplaceStock from "./pages/admin/marketplaces/MarketplaceStock";
import MarketplaceLogs from "./pages/admin/marketplaces/MarketplaceLogs";
import MarketplaceMessages from "./pages/admin/marketplaces/MarketplaceMessages";
import PostSaleAutomation from "./pages/admin/marketplaces/PostSaleAutomation";
import MarketplaceAnalytics from "./pages/admin/marketplaces/MarketplaceAnalytics";
import MarketplaceAutomations from "./pages/admin/marketplaces/MarketplaceAutomations";
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
import ScrollToTop from "./components/ScrollToTop";
import AnalyticsTracker from "./components/seo/AnalyticsTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
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
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/atacado" element={<Wholesale />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/conta" element={<Account />} />
                <Route path="/cuenta" element={<Account />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/moda" element={<BlogCategory />} />
                <Route path="/blog/tendencias" element={<BlogCategory />} />
                <Route path="/blog/guia" element={<BlogCategory />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/moda" element={<LandingModa />} />
                <Route path="/moda-femenina" element={<ModaFemenina />} />
                <Route path="/moda-femenina/:citySlug" element={<CityLanding />} />
                <Route path="/mayorista" element={<LandingAtacado />} />
                <Route path="/faq" element={<FAQ />} />
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="productos" element={<Products />} />
                  <Route path="categorias" element={<Categories />} />
                  <Route path="subcategorias" element={<Subcategories />} />
                  <Route path="paginas" element={<Pages />} />
                  <Route path="pedidos" element={<Orders />} />
                  <Route path="clientes" element={<Customers />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="crm" element={<CrmKanban />} />
                  <Route path="planner" element={<SocialPlanner />} />
                  <Route path="campanias" element={<Campaigns />} />
                  <Route path="credenciales" element={<ApiCredentials />} />
                  <Route path="reportes" element={<Reports />} />
                  <Route path="configuracion" element={<Settings />} />
                  <Route path="marketplaces" element={<MarketplaceDashboard />} />
                  <Route path="marketplaces/conexoes" element={<MarketplaceConnections />} />
                  <Route path="marketplaces/catalogo" element={<MarketplaceCatalog />} />
                  <Route path="marketplaces/pedidos" element={<MarketplaceOrders />} />
                  <Route path="marketplaces/estoque" element={<MarketplaceStock />} />
                  <Route path="marketplaces/logs" element={<MarketplaceLogs />} />
                  <Route path="marketplaces/mensagens" element={<MarketplaceMessages />} />
                  <Route path="marketplaces/automacao" element={<PostSaleAutomation />} />
                  <Route path="marketplaces/analytics" element={<MarketplaceAnalytics />} />
                  <Route path="marketplaces/automacoes" element={<MarketplaceAutomations />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Chatbot />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
