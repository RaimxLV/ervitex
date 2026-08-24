import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import BentoCategories from "@/components/home/BentoCategories";
import TrustedBrands from "@/components/home/TrustedBrands";
import TechnologiesShowcase from "@/components/home/TechnologiesShowcase";
import CtaSection from "@/components/home/CtaSection";
import RetailSection from "@/components/home/RetailSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BentoCategories />
      <TrustedBrands />
      <TechnologiesShowcase />
      <CtaSection />
      <RetailSection />
    </Layout>
  );
};

export default Index;
