import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import CatalogPage from "./pages/CatalogPage.tsx";
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
import NotFound from "./pages/NotFound.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/products/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/quotes" element={<ProtectedRoute><AdminQuotes /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
