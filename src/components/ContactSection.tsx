"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Mail, MapPin, Clock, Send, Loader2 } from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    lineId: "",
    service: "ติดตั้งกล้องวงจรปิด (CCTV)",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // Form is handled via mailto link for static export
    const subject = encodeURIComponent(`ขอใบเสนอราคา: ${formData.service}`);
    const body = encodeURIComponent(
      `ชื่อ-นามสกุล: ${formData.name}\n` +
      `เบอร์โทรศัพท์: ${formData.phone}\n` +
      `LINE ID: ${formData.lineId || "-"}\n` +
      `บริการที่สนใจ: ${formData.service}\n\n` +
      `รายละเอียดเพิ่มเติม:\n${formData.message || "-"}`
    );
    
    window.location.href = `mailto:poppatompong@gmail.com?subject=${subject}&body=${body}`;
    
    setIsSubmitting(false);
    setSubmitStatus({ type: "success", message: "เปิดแอปพลิเคชันอีเมลของคุณแล้ว กรุณากดส่งอีเมล" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-ink-900">
      {/* Decorative lines */}
      <div className="absolute top-0 left-8 lg:left-16 w-px h-full bg-ink-700/60" />
      <div className="absolute top-0 right-8 lg:right-16 w-px h-full bg-ink-700/60" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-code text-xs text-gold-400 tracking-[0.15em] uppercase">
            ติดต่อเรา (Contact Us)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50">
            พร้อมให้คำปรึกษา
          </h2>
          <h3 className="font-heading text-2xl sm:text-3xl text-gold-400 italic mt-2">ประเมินราคาฟรี!</h3>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-300 text-lg max-w-2xl mx-auto">
            กรอกแบบฟอร์มด้านล่าง หรือติดต่อผ่านช่องทางที่คุณสะดวก เพื่อรับคำปรึกษาและประเมินราคาเบื้องต้นได้ทันที
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Form Card (Takes up 3 columns on large screens) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 bg-ink-800 border border-ink-700 rounded-sm p-6 sm:p-8 lg:p-10 relative overflow-hidden"
          >
            {/* Subtle glow behind form */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="font-heading text-2xl font-bold text-cream-100 mb-6 relative z-10">
              แบบฟอร์มขอใบเสนอราคา
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-cream-200">
                    ชื่อ-นามสกุล <span className="text-gold-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-ink-900/50 border border-ink-600 rounded-sm px-4 py-3 text-cream-50 placeholder-ink-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                    placeholder="คุณลูกค้า..."
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-cream-200">
                    เบอร์โทรศัพท์ <span className="text-gold-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-ink-900/50 border border-ink-600 rounded-sm px-4 py-3 text-cream-50 placeholder-ink-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="lineId" className="block text-sm font-medium text-cream-200">
                    LINE ID (เพื่อส่งรูปหน้างาน)
                  </label>
                  <input
                    type="text"
                    id="lineId"
                    name="lineId"
                    value={formData.lineId}
                    onChange={handleChange}
                    className="w-full bg-ink-900/50 border border-ink-600 rounded-sm px-4 py-3 text-cream-50 placeholder-ink-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                    placeholder="ไอดีไลน์ของคุณ"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service" className="block text-sm font-medium text-cream-200">
                    บริการที่สนใจ <span className="text-gold-500">*</span>
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full bg-ink-900/50 border border-ink-600 rounded-sm px-4 py-3 text-cream-50 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors appearance-none"
                  >
                    <option value="ติดตั้งกล้องวงจรปิด (CCTV)">ติดตั้งกล้องวงจรปิด (CCTV)</option>
                    <option value="ระบบเครือข่าย/สายแลน (Network)">ระบบเครือข่าย/สายแลน (Network)</option>
                    <option value="พัฒนาโปรแกรม/เว็บ (Software)">พัฒนาโปรแกรม/เว็บ (Software)</option>
                    <option value="ระบบสมาร์ทโฮม (Smart Home)">ระบบสมาร์ทโฮม/ประหยัดพลังงาน</option>
                    <option value="อื่นๆ (ระบุในข้อความ)">อื่นๆ (โปรดระบุในข้อความ)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-cream-200">
                  รายละเอียดเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-ink-900/50 border border-ink-600 rounded-sm px-4 py-3 text-cream-50 placeholder-ink-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors resize-none"
                  placeholder="เช่น ขนาดพื้นที่, จำนวนกล้องที่ต้องการ, ปัญหาที่พบ..."
                ></textarea>
              </div>

              {submitStatus.message && (
                <div className={`p-4 rounded-sm border ${submitStatus.type === "success" ? "bg-green-900/20 border-green-500/50 text-green-400" : "bg-red-900/20 border-red-500/50 text-red-400"}`}>
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-gold-500 hover:bg-gold-400 text-ink-900 font-bold rounded-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    ส่งข้อมูลขอราคา <Send className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Info (Takes up 2 columns) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-ink-800 border border-ink-700 rounded-sm p-6 sm:p-8">
              <h3 className="font-heading text-xl font-bold text-cream-100 mb-6">ติดต่อด่วน</h3>
              
              <div className="space-y-4">
                {/* LINE Button */}
                <a
                  href="https://line.me/ti/p/~lazialepoppy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 bg-ink-900/50 border border-ink-600 hover:border-green-600/50 rounded-sm border-l-4 border-l-green-600 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-green-600 flex items-center justify-center shrink-0 rounded-sm">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm">LINE: lazialepoppy</h4>
                    <p className="text-ink-400 text-xs mt-0.5">ตอบไว ส่งรูปหน้างานได้เลย</p>
                  </div>
                </a>

                {/* Call Button */}
                <a
                  href="tel:+66836870393"
                  className="group flex items-center gap-4 p-4 bg-ink-900/50 border border-ink-600 hover:border-gold-500/50 rounded-sm border-l-4 border-l-gold-400 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-ink-700 flex items-center justify-center shrink-0 rounded-sm">
                    <Phone className="w-5 h-5 text-cream-50" />
                  </div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm">083-687-0393</h4>
                    <p className="text-ink-400 text-xs mt-0.5">โทรสอบถามได้ทันที</p>
                  </div>
                </a>

                {/* Facebook Button */}
                <a
                  href="https://www.facebook.com/patompong.poppy.lamahasak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 bg-ink-900/50 border border-ink-600 hover:border-blue-500/50 rounded-sm border-l-4 border-l-blue-500 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-[#1877F2] flex items-center justify-center shrink-0 rounded-sm">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm">Patompong FB</h4>
                    <p className="text-ink-400 text-xs mt-0.5">ติดตามผลงาน / Inbox</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-ink-800 border border-ink-700 rounded-sm p-6 sm:p-8">
              <h3 className="font-heading text-xl font-bold text-cream-100 mb-5">ข้อมูลการทำงาน</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-cream-200 text-sm font-medium">พื้นที่ให้บริการ</p>
                    <p className="text-ink-400 text-xs mt-1">นครสวรรค์, พิษณุโลก และจังหวัดใกล้เคียง</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-cream-200 text-sm font-medium">เวลาทำการ</p>
                    <p className="text-ink-400 text-xs mt-1">จันทร์ - เสาร์: 08:00 - 20:00 น.<br/>อาทิตย์: นัดหมายล่วงหน้า</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
