import { Suspense, lazy } from "react";
import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import BentoCategories from "@/components/home/BentoCategories";
import TechnologiesShowcase from "@/components/home/TechnologiesShowcase";

// Heavier lower-page sections stay code-split, while the first scrollable
// content is loaded with the page so its images can start fetching immediately.
const TrustedBrands = lazy(() => import("@/components/home/TrustedBrands"));
const RetailSection = lazy(() => import("@/components/home/RetailSection"));

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BentoCategories />
      <TechnologiesShowcase />
      <Suspense fallback={<div className="min-h-[40svh]" />}>
        <TrustedBrands />
        <RetailSection />
      </Suspense>
    </Layout>
  );
};

export default Index;
