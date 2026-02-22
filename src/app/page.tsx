import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import ServicesSection from "@/components/ServicesSection";
import WorkProcessSection from "@/components/WorkProcessSection";
import CCTVDetailSection from "@/components/CCTVDetailSection";
import SmartGallery from "@/components/SmartGallery";
import TimelineSection from "@/components/TimelineSection";
import EducationSection from "@/components/EducationSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingAction from "@/components/FloatingAction";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <ServicesSection />
        <WorkProcessSection />
        <CCTVDetailSection />
        <SmartGallery />
        <TimelineSection />
        <EducationSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingAction />
    </>
  );
}
