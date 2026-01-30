import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SocialImpactSection from "@/components/SocialImpactSection";
import HygieneSection from "@/components/HygieneSection";
import EducationalSection from "@/components/EducationalSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const { isAdmin, isOperador, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAdmin) {
        navigate("/admin");
      } else if (isOperador) {
        navigate("/operaciones");
      }
    }
  }, [isAdmin, isOperador, isLoading, navigate]);

  if (isLoading || isAdmin || isOperador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
