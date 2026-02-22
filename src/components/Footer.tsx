"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-ink-800 border-t border-ink-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo & Brand */}
          <div className="flex flex-col gap-1">
            <div>
              <span className="font-heading text-lg font-bold text-cream-100 tracking-tight">
                Patompong
              </span>
              <span className="font-code text-[10px] text-gold-400 ml-2 tracking-[0.15em] uppercase">
                Tech Consultant
              </span>
            </div>
            <p className="text-sm text-ink-400 mt-1">083-687-0393 | LINE: lazialepoppy</p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center md:justify-center gap-6 text-sm text-ink-300">
            <a href="#home" className="hover:text-gold-400 transition-colors">หน้าแรก</a>
            <a href="#services" className="hover:text-gold-400 transition-colors">บริการ</a>
            <a href="#portfolio" className="hover:text-gold-400 transition-colors">ผลงาน</a>
            <a href="#experience" className="hover:text-gold-400 transition-colors">ประสบการณ์</a>
            <a href="#contact" className="hover:text-gold-400 transition-colors">ติดต่อ</a>
          </div>

          {/* Copyright */}
          <div className="text-left md:text-right text-sm text-ink-400">
            <p>&copy; {currentYear} Patompong Tech Consultant</p>
            <p className="font-code text-xs mt-1 text-ink-500">นครสวรรค์ &middot; All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
