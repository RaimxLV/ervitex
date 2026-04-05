import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import BentoCategories from "@/components/home/BentoCategories";
import TrustedBrands from "@/components/home/TrustedBrands";
import ValueCards from "@/components/home/ValueCards";
import CtaSection from "@/components/home/CtaSection";
import RetailSection from "@/components/home/RetailSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BentoCategories />
      <TrustedBrands />
      <ValueCards />
      <CtaSection />
      <RetailSection />
    </Layout>
  );
};

export default Index;
