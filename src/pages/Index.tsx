import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import BentoCategories from "@/components/home/BentoCategories";
import ValueCards from "@/components/home/ValueCards";
import CtaSection from "@/components/home/CtaSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BentoCategories />
      <ValueCards />
      <CtaSection />
    </Layout>
  );
};

export default Index;
