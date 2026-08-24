import { Suspense, lazy } from "react";
import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";

// Only the hero is part of the initial bundle — everything below the fold is
// code-split so the first paint is as fast as possible.
const BentoCategories = lazy(() => import("@/components/home/BentoCategories"));
const TechnologiesShowcase = lazy(() => import("@/components/home/TechnologiesShowcase"));
const TrustedBrands = lazy(() => import("@/components/home/TrustedBrands"));
const RetailSection = lazy(() => import("@/components/home/RetailSection"));

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <Suspense fallback={<div className="min-h-[40svh]" />}>
        <BentoCategories />
        <TechnologiesShowcase />
        <TrustedBrands />
        <RetailSection />
      </Suspense>
    </Layout>
  );
};

export default Index;
