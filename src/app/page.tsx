import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import FloatingAction from "@/components/FloatingAction";
import SideDotNav from "@/components/SideDotNav";
import CinematicGalleryWrapper from "@/components/CinematicGalleryWrapper";

// Lazy-load below-fold heavy sections → reduces initial JS bundle & TBT
const ServicesSection = dynamic(() => import("@/components/ServicesSection"), { ssr: true });
const QuoteSection = dynamic(() => import("@/components/QuoteSection"), { ssr: true });
const WorkProcessSection = dynamic(() => import("@/components/WorkProcessSection"), { ssr: true });
const PortfolioSection = dynamic(() => import("@/components/PortfolioSection"), { ssr: true });
const TimelineSection = dynamic(() => import("@/components/TimelineSection"), { ssr: true });
const CCTVDetailSection = dynamic(() => import("@/components/CCTVDetailSection"), { ssr: true });
const EducationSection = dynamic(() => import("@/components/EducationSection"), { ssr: true });
const TestimonialSection = dynamic(() => import("@/components/TestimonialSection"), { ssr: true });
const FAQSection = dynamic(() => import("@/components/FAQSection"), { ssr: true });
const ContactSection = dynamic(() => import("@/components/ContactSection"), { ssr: true });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });

import { getSavedPhotos } from "@/actions/galleryDb";
import type { GalleryImage, CategoryType } from "@/types/gallery";

export default async function Home() {
  const dbPhotos = await getSavedPhotos();
  const featured = dbPhotos
    .filter(p => !p.isHidden)
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      url: p.url,
      category: p.category as CategoryType,
      width: 1920, // approximated for carousel styling
      height: 1920,
      description: p.description || undefined
    }));


  return (
    <>
      <Navbar />
      <SideDotNav />
      <main>
        {/* Above the fold – load immediately */}
        <HeroSection featuredPhotos={featured} />
        <StatsBar />

        {/* Below the fold – deferred JS chunks */}
        <div id="portfolio">
          <CinematicGalleryWrapper />
        </div>
        <ServicesSection />
        <QuoteSection />
        <WorkProcessSection />
        <PortfolioSection />
        <TimelineSection />
        <CCTVDetailSection />
        <EducationSection />
        <TestimonialSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingAction />
    </>
  );
}
