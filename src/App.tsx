import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { QuoteCartProvider } from "@/hooks/useQuoteCart";
import QuoteCartButton from "@/components/quote/QuoteCartButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import RequestPage from "./pages/RequestPage.tsx";
import Index from "./pages/Index.tsx";
import CatalogPage from "./pages/CatalogPage.tsx";
import CatalogItemPage from "./pages/CatalogItemPage.tsx";
import StanleyStellaPage from "./pages/StanleyStellaPage.tsx";
import NwgPage from "./pages/NwgPage.tsx";
import PfConceptPage from "./pages/PfConceptPage.tsx";
import BeechfieldBrandsPage from "./pages/BeechfieldBrandsPage.tsx";
import MalfiniPage from "./pages/MalfiniPage.tsx";
import AdminBeechfieldImport from "./pages/admin/AdminBeechfieldImport.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";
import ServicesPage from "./pages/ServicesPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminProductForm from "./pages/admin/AdminProductForm.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminQuotes from "./pages/admin/AdminQuotes.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminTranslate from "./pages/admin/AdminTranslate.tsx";
import AdminMegaMenu from "./pages/admin/AdminMegaMenu.tsx";
import AdminPriceAudit from "./pages/admin/AdminPriceAudit.tsx";
import AdminOffers from "./pages/admin/AdminOffers.tsx";
import AdminOfferEdit from "./pages/admin/AdminOfferEdit.tsx";
import OfferPage from "./pages/OfferPage.tsx";

import NotFound from "./pages/NotFound.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";

const queryClient = new QueryClient();
const routerBase = import.meta.env.BASE_URL;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <QuoteCartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={routerBase}>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/item/:source/:id" element={<CatalogItemPage />} />
              <Route path="/stanley-stella" element={<StanleyStellaPage />} />
              <Route path="/nwg" element={<NwgPage />} />
              <Route path="/pf-concept" element={<PfConceptPage />} />
              <Route path="/beechfield-brands" element={<BeechfieldBrandsPage />} />
              <Route path="/malfini" element={<MalfiniPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/request" element={<RequestPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/products/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/quotes" element={<ProtectedRoute><AdminQuotes /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/translate" element={<ProtectedRoute><AdminTranslate /></ProtectedRoute>} />
              <Route path="/admin/beechfield-import" element={<ProtectedRoute><AdminBeechfieldImport /></ProtectedRoute>} />
              <Route path="/admin/price-audit" element={<ProtectedRoute><AdminPriceAudit /></ProtectedRoute>} />
              <Route path="/admin/mega-menu" element={<ProtectedRoute><AdminMegaMenu /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <QuoteCartButton />
          </BrowserRouter>
          </QuoteCartProvider>
        </AuthProvider>

      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
