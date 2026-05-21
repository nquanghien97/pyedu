import Header from "@/components/ui/homepage/Header";
import HeroSection from "@/components/ui/homepage/sections/HeroSection";
import FeaturesSection from "@/components/ui/homepage/sections/FeaturesSection";
import HowItWorksSection from "@/components/ui/homepage/sections/HowItWorksSection";
import ForWhoSection from "@/components/ui/homepage/sections/ForWhoSectiton";
import AiPoweredSection from "@/components/ui/homepage/sections/AiPoweredSection";
import StatisticsSection from "@/components/ui/homepage/sections/StatisticsSection";
import CtaSection from "@/components/ui/homepage/sections/CtaSection";
import Footer from "@/components/ui/homepage/Footer";

/* ──────────────────── Animated Counter ──────────────────── */


/* ──────────────────── Feature Card ──────────────────── */


/* ──────────────────── Step Card ──────────────────── */


/* ══════════════════════════════════════════════════════════ */
/*                      LANDING PAGE                         */
/* ══════════════════════════════════════════════════════════ */

export default function Home() {


  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── HEADER ─── */}
      <Header />

      {/* ─── HERO SECTION ─── */}
      <HeroSection />

      {/* ─── FEATURES SECTION ─── */}
      <FeaturesSection bgColor="bg-muted" />

      {/* ─── HOW IT WORKS SECTION ─── */}
      <HowItWorksSection />

      {/* ─── FOR WHO SECTION ─── */}
      <ForWhoSection bgColor="bg-muted" />

      {/* ─── AI-POWERED SECTION ─── */}
      <AiPoweredSection />

      {/* ─── STATISTICS SECTION ─── */}
      <StatisticsSection bgColor="bg-muted" />

      {/* ─── CTA SECTION ─── */}
      <CtaSection />

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
