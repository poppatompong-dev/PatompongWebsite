"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUp, MessageCircle } from "lucide-react";

export default function FloatingAction() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsVisible(latest > 400);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-6 right-5 lg:bottom-10 lg:right-8 z-50 flex flex-col gap-3"
        >
          {/* LINE Quick Contact */}
          <a
            href="#contact"
            aria-label="ติดต่อด่วน"
            className="group relative flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-500 hover:shadow-green-600/30 hover:scale-110 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute right-full mr-3 whitespace-nowrap bg-ink-900 text-cream-50 text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ติดต่อด่วน
            </span>
          </a>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            aria-label="กลับขึ้นบน"
            className="flex items-center justify-center w-12 h-12 bg-ink-800/90 text-gold-400 rounded-full shadow-lg border border-ink-600 hover:bg-ink-700 hover:border-gold-500 hover:text-gold-300 hover:scale-110 transition-all duration-300"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
