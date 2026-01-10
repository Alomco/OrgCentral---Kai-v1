import { Suspense } from 'react';

import FeatureHighlightsSection from "@/components/landing/sections/FeatureHighlightsSection";
import HeroSection from "@/components/landing/sections/HeroSection";
import LandingNav from "@/components/landing/sections/LandingNav";
import GetStartedSection from "@/components/landing/sections/GetStartedSection";
import CtaSection from "@/components/landing/sections/CtaSection";
import Footer from "@/components/landing/sections/Footer";
import { SessionRedirect } from '@/components/auth/SessionRedirect';

export default function Home() {
  // Show landing page - SessionRedirect handles auth check in Suspense
  return (
    <div className="bg-background text-foreground transition-colors duration-300">
      <Suspense fallback={null}>
        <SessionRedirect />
      </Suspense>
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
