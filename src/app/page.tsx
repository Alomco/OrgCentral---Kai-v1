import FeatureHighlightsSection from "@/components/landing/sections/FeatureHighlightsSection";
import HeroSection from "@/components/landing/sections/HeroSection";
import LandingNav from "@/components/landing/sections/LandingNav";
import GetStartedSection from "@/components/landing/sections/GetStartedSection";
import CtaSection from "@/components/landing/sections/CtaSection";
import Footer from "@/components/landing/sections/Footer";

export default function Home() {
  return (
    <div className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <LandingNav />
      <main>
        <HeroSection />
        <FeatureHighlightsSection />
        <GetStartedSection />
        <CtaSection />
        <Footer />
      </main>
    </div>
  );
}
