import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SocialImpactSection from "@/components/SocialImpactSection";
import HygieneSection from "@/components/HygieneSection";
import EducationalSection from "@/components/EducationalSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <SocialImpactSection />
        <HygieneSection />
        <EducationalSection />
        <FeaturedProducts />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
