"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#home", label: "หน้าแรก", id: "home" },
  { href: "#services", label: "บริการ", id: "services" },
  { href: "#portfolio", label: "ผลงาน", id: "portfolio" },
  { href: "#experience", label: "ประสบการณ์", id: "experience" },
  { href: "#education", label: "คุณวุฒิ", id: "education" },
  { href: "#contact", label: "ติดต่อ", id: "contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + 120;
      navLinks.forEach((link) => {
        const el = document.getElementById(link.id);
        if (!el) return;
        if (scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
          setActiveSection(link.id);
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream-50/90 backdrop-blur-xl shadow-sm border-b border-cream-300/50"
          : "bg-ink-900/20 backdrop-blur-sm"
      }`}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-600 to-gold-400 origin-left"
        style={{ scaleX }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gold-500 flex items-center justify-center shrink-0 group-hover:bg-gold-400 transition-colors">
              <span className="font-heading font-bold text-white text-sm">PT</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-base font-heading font-bold tracking-tight leading-tight transition-colors ${scrolled ? "text-ink-800" : "text-cream-50"}`}>
                Patompong
              </span>
              <span className="text-[9px] font-code text-gold-400 leading-tight tracking-[0.2em] uppercase">
                Tech Consultant
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm transition-colors tracking-wide ${
                  scrolled
                    ? activeSection === link.id ? "text-gold-600 font-semibold" : "text-ink-500 hover:text-gold-500"
                    : activeSection === link.id ? "text-gold-400 font-semibold" : "text-cream-200 hover:text-gold-300"
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={`absolute bottom-0 left-3 right-3 h-[2px] ${scrolled ? "bg-gold-500" : "bg-gold-400"}`}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 hover:text-gold-400 transition-colors ${scrolled ? "text-ink-500" : "text-cream-200"}`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-cream-50/98 backdrop-blur-md border-t border-cream-300"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm transition-colors border-l-4 ${
                    activeSection === link.id
                      ? "border-gold-500 text-gold-600 bg-gold-50/50 font-semibold"
                      : "border-transparent text-ink-500 hover:text-gold-500 hover:bg-cream-200/50"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
