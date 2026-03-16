import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import FloatingAction from "@/components/FloatingAction";
import SideDotNav from "@/components/SideDotNav";
import CinematicGalleryWrapper from "@/components/CinematicGalleryWrapper";

// SSR-rendered below-fold sections (SEO-critical content)
const ServicesSection = dynamic(() => import("@/components/ServicesSection"));
const QuoteSection = dynamic(() => import("@/components/QuoteSection"));
const WorkProcessSection = dynamic(() => import("@/components/WorkProcessSection"));
const PortfolioSection = dynamic(() => import("@/components/PortfolioSection"));
const TimelineSection = dynamic(() => import("@/components/TimelineSection"));
const CCTVDetailSection = dynamic(() => import("@/components/CCTVDetailSection"));
const EducationSection = dynamic(() => import("@/components/EducationSection"));
const TestimonialSection = dynamic(() => import("@/components/TestimonialSection"));
const ContactSection = dynamic(() => import("@/components/ContactSection"));
const Footer = dynamic(() => import("@/components/Footer"));

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
        <ContactSection />
      </main>
      <Footer />
      <FloatingAction />
    </>
  );
}
