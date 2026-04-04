import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import BentoCategories from "@/components/home/BentoCategories";
import TrustedBrands from "@/components/home/TrustedBrands";
import ValueCards from "@/components/home/ValueCards";
import CtaSection from "@/components/home/CtaSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BentoCategories />
      <TrustedBrands />
      <ValueCards />
      <CtaSection />
    </Layout>
  );
};

export default Index;
