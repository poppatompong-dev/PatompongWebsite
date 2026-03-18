"use client";

import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-ink-800 border-t border-ink-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo & Brand */}
          <div className="flex flex-col gap-3">
            <div className="relative w-40 h-12">
              <Image src="/logo-new.png" alt="Patompong Tech Consultant Logo" fill className="object-contain object-left drop-shadow-sm" sizes="160px" />
            </div>
            <p className="text-sm text-ink-400">083-687-0393 | LINE: lazialepoppy</p>
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
            <p><a href="/admin/login" className="cursor-default" title="Admin Login">&copy;</a> {currentYear} Patompong Tech Consultant</p>
            <p className="font-code text-xs mt-1 text-ink-500">นครสวรรค์ &middot; All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
