import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import FeaturedScholarships from "@/components/landing/FeaturedScholarships";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("scholarhub_splash_seen");
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("scholarhub_splash_seen", "1");
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <div className="min-h-screen">
        <Navbar />
        <HeroSection />
        <StatsBar />
        <FeaturedScholarships />
        <HowItWorks />
        <Footer />
      </div>
    </>
  );
};

export default Index;
