"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "home",       label: "หน้าแรก" },
  { id: "services",   label: "บริการ" },
  { id: "process",    label: "ขั้นตอน" },
  { id: "why-us",     label: "ทำไมต้องเรา" },
  { id: "portfolio",  label: "ผลงาน" },
  { id: "experience", label: "ประสบการณ์" },
  { id: "education",  label: "คุณวุฒิ" },
  { id: "contact",    label: "ติดต่อ" },
];

export default function SideDotNav() {
  const [active, setActive] = useState("home");
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setVisible(scrollY > 300);

      const offset = window.innerHeight * 0.35;
      let current = "home";

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        if (scrollY + offset >= el.offsetTop) {
          current = section.id;
        }
      }
      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 items-center hidden lg:flex"
          aria-label="Section navigation"
        >
          {sections.map((section) => {
            const isActive = active === section.id;
            const isHovered = hovered === section.id;

            return (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                onMouseEnter={() => setHovered(section.id)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`ไปที่ ${section.label}`}
                className="relative flex items-center justify-end gap-2 group"
              >
                {/* Label tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: 8, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="font-sans text-xs font-medium text-cream-50 bg-ink-800/90 backdrop-blur-sm px-2.5 py-1 rounded-sm whitespace-nowrap border border-ink-600 pointer-events-none"
                    >
                      {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Dot */}
                <motion.div
                  animate={{
                    width: isActive ? 20 : 8,
                    height: isActive ? 8 : 8,
                    backgroundColor: isActive ? "#B45309" : isHovered ? "#D97706" : "rgba(160,174,192,0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="rounded-full"
                />
              </button>
            );
          })}

          {/* Vertical line connecting dots */}
          <div className="absolute right-[14px] top-0 bottom-0 w-px bg-ink-600/30 -z-10 pointer-events-none" />
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
