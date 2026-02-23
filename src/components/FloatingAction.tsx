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
            href="https://line.me/ti/p/~poppatompong"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ติดต่อด่วนผ่าน LINE"
            className="group relative flex items-center justify-center w-14 h-14 bg-[#00B900] text-white rounded-full shadow-lg hover:bg-[#00A000] hover:shadow-[#00B900]/40 hover:scale-110 transition-all duration-300"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute right-full mr-3 whitespace-nowrap bg-ink-900 text-cream-50 text-sm font-medium px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              สอบถาม/ประเมินราคาฟรี
            </span>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          </a>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            aria-label="กลับขึ้นบน"
            className="flex items-center justify-center w-12 h-12 bg-ink-800/90 text-gold-400 rounded-full shadow-lg border border-ink-600 hover:bg-ink-700 hover:border-gold-500 hover:text-gold-300 hover:scale-110 transition-all duration-300 ml-1"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
