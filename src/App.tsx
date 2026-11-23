import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { DemoBanner } from "@/components/DemoBanner";
import { RequireAuth } from "@/components/RequireAuth";
import { Spinner } from "@/components/ui";
import { trackPageView } from "@/lib/analytics";
import HomePage from "@/pages/HomePage";

// Остальные страницы грузятся по требованию — главная открывается быстрее
const DollsPage = lazy(() => import("@/pages/DollsPage"));
const ClothesPage = lazy(() => import("@/pages/ClothesPage"));
const AccessoriesPage = lazy(() => import("@/pages/AccessoriesPage"));
const DiyPage = lazy(() => import("@/pages/DiyPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BuilderPage = lazy(() => import("@/pages/BuilderPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const AdminPage = lazy(() => import("@/pages/admin/AdminPage"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));

function useTracking() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(pathname);
  }, [pathname]);
  useEffect(() => {
    const onConsent = () => trackPageView(location.pathname);
    window.addEventListener("consent-change", onConsent);
    return () => window.removeEventListener("consent-change", onConsent);
  }, []);
}

export default function App() {
  useTracking();
  return (
    <div className="min-h-screen bg-background font-['Jost'] flex flex-col">
      <DemoBanner />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dolls" element={<DollsPage />} />
            <Route path="/clothes" element={<ClothesPage />} />
            <Route path="/clothes/:type" element={<ClothesPage />} />
            <Route path="/accessories" element={<AccessoriesPage />} />
            <Route path="/diy" element={<DiyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/builder" element={<BuilderPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth admin><AdminPage /></RequireAuth>}>
              <Route index element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="products" element={<AdminProducts />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
