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
import Chatbot from "./components/Chatbot";
import NotFound from "./pages/NotFound";

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
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/atacado" element={<Wholesale />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/cuenta" element={<Account />} />
                
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
