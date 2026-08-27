import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { QuoteCartProvider } from "@/hooks/useQuoteCart";

import QuoteCartButton from "@/components/quote/QuoteCartButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";

// Everything except the landing page is code-split so the first visit only
// downloads the home-page bundle instead of the whole app.
const RequestPage = lazy(() => import("./pages/RequestPage.tsx"));
const CatalogPage = lazy(() => import("./pages/CatalogPage.tsx"));
const CatalogItemPage = lazy(() => import("./pages/CatalogItemPage.tsx"));
const StanleyStellaPage = lazy(() => import("./pages/StanleyStellaPage.tsx"));
const NwgPage = lazy(() => import("./pages/NwgPage.tsx"));
const PfConceptPage = lazy(() => import("./pages/PfConceptPage.tsx"));
const BeechfieldBrandsPage = lazy(() => import("./pages/BeechfieldBrandsPage.tsx"));
const MalfiniPage = lazy(() => import("./pages/MalfiniPage.tsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const TechnologyPage = lazy(() => import("./pages/TechnologyPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.tsx"));
const OfferPage = lazy(() => import("./pages/OfferPage.tsx"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage.tsx"));
const TermsPage = lazy(() => import("./pages/TermsPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminQuotes = lazy(() => import("./pages/admin/AdminQuotes.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.tsx"));
const AdminMegaMenu = lazy(() => import("./pages/admin/AdminMegaMenu.tsx"));
const AdminPriceAudit = lazy(() => import("./pages/admin/AdminPriceAudit.tsx"));
const AdminOffers = lazy(() => import("./pages/admin/AdminOffers.tsx"));
const AdminOfferEdit = lazy(() => import("./pages/admin/AdminOfferEdit.tsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.tsx"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm.tsx"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories.tsx"));


const queryClient = new QueryClient();
const routerBase = import.meta.env.BASE_URL;

const RouteFallback = () => <div className="min-h-[60svh]" />;

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
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/item/:source/:id" element={<CatalogItemPage />} />
              <Route path="/stanley-stella" element={<StanleyStellaPage />} />
              <Route path="/nwg" element={<NwgPage />} />
              <Route path="/pf-concept" element={<PfConceptPage />} />
              <Route path="/beechfield-brands" element={<BeechfieldBrandsPage />} />
              <Route path="/malfini" element={<MalfiniPage />} />
              <Route path="/request" element={<RequestPage />} />
              <Route path="/services" element={<Navigate to="/#tehnologijas" replace />} />
              <Route path="/tehnologijas/:slug" element={<TechnologyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/piedavajums/:token" element={<OfferPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/offers" element={<ProtectedRoute><AdminOffers /></ProtectedRoute>} />
              <Route path="/admin/offers/:id" element={<ProtectedRoute><AdminOfferEdit /></ProtectedRoute>} />


              <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/products/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/quotes" element={<ProtectedRoute><AdminQuotes /></ProtectedRoute>} />

              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/price-audit" element={<ProtectedRoute><AdminPriceAudit /></ProtectedRoute>} />
              <Route path="/admin/mega-menu" element={<ProtectedRoute><AdminMegaMenu /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            <QuoteCartButton />
            
          </BrowserRouter>
          </QuoteCartProvider>
        </AuthProvider>

      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
