"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen, CheckCircle } from "lucide-react";

const education = [
  {
    levelEn: "Bachelor's Degree",
    level: "ปริญญาตรี",
    field: "คอมพิวเตอร์ธุรกิจ / เทคโนโลยีสารสนเทศ",
    institution: "มหาวิทยาลัย",
    year: "2554",
    icon: GraduationCap,
    highlight: false,
  },
];

const certifications = [
  {
    title: "ความมั่นคงปลอดภัยไซเบอร์",
    org: "สกมช. (NCSA)",
    detail: "ผ่านการอบรมเชิงปฏิบัติการด้านความปลอดภัยไซเบอร์สำหรับหน่วยงานภาครัฐ",
    highlight: true,
    icon: Award,
  },
  {
    title: "การตรวจสอบและวิเคราะห์ภัยคุกคามไซเบอร์",
    org: "สกมช. / หน่วยงานภาครัฐ",
    detail: "Threat Intelligence, Log Analysis, Incident Response เบื้องต้น",
    highlight: false,
    icon: Award,
  },
];

const workshops = [
  {
    title: "การติดตั้งและบริหารจัดการระบบกล้องวงจรปิด (IP CCTV)",
    topics: ["เดินสายสัญญาณ PoE", "ตั้งค่า NVR/DVR", "Remote Viewing ผ่าน Mobile"],
  },
  {
    title: "ระบบเครือข่ายคอมพิวเตอร์ (Network Administration)",
    topics: ["วาง Topology", "ตั้งค่า VLAN & Switch", "Wireless LAN มาตรฐาน"],
  },
  {
    title: "ความปลอดภัยในการใช้งานอินเทอร์เน็ตและระบบ IT",
    topics: ["Phishing Awareness", "Password Policy", "Firewall เบื้องต้น"],
  },
  {
    title: "การพัฒนาระบบสารสนเทศสำหรับองค์กร",
    topics: ["Google Workspace Admin", "Google Apps Script", "ระบบฐานข้อมูล"],
  },
  {
    title: "การบริหารจัดการข้อมูลและ Cloud Computing",
    topics: ["Google Drive / SharePoint", "Backup Strategy", "Cloud Storage"],
  },
  {
    title: "พระราชบัญญัติคอมพิวเตอร์และกฎหมาย IT",
    topics: ["พ.ร.บ. คอมพิวเตอร์ 2560", "PDPA เบื้องต้น", "สิทธิ์ผู้ใช้งาน"],
  },
  {
    title: "การซ่อมบำรุงคอมพิวเตอร์และอุปกรณ์ต่อพ่วง",
    topics: ["Hardware Troubleshooting", "OS Reinstallation", "Preventive Maintenance"],
  },
  {
    title: "ระบบ Smart Office และ IoT เบื้องต้น",
    topics: ["Smart Device Integration", "Home/Office Automation", "IoT Sensors"],
  },
];

export default function EducationSection() {
  return (
    <section id="education" className="relative py-24 lg:py-32 bg-cream-200/40 bg-noise">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
            คุณวุฒิที่ผ่านการรับรอง (Team Qualifications)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-800">
            คุณวุฒิผู้ควบคุมงาน
          </h2>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-400 text-lg max-w-2xl mx-auto">
            ควบคุมดูแลงานและให้คำปรึกษาโดยผู้เชี่ยวชาญ ที่มีพื้นฐานวิชาการและการอบรมจากหน่วยงานที่เชื่อถือได้
          </p>
        </motion.div>

        {/* Education + Certs */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Degree */}
          {education.map((edu) => (
            <motion.div
              key={edu.levelEn}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-cream-300 p-6 flex gap-4 hover:border-gold-400/50 transition-colors"
            >
              <div className="w-12 h-12 border border-cream-300 flex items-center justify-center shrink-0">
                <edu.icon className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <span className="font-code text-[10px] text-gold-500 uppercase tracking-wider">{edu.levelEn}</span>
                <h3 className="font-heading font-bold text-ink-700 mt-1">{edu.level}</h3>
                <p className="text-sm text-ink-500 mt-1">{edu.field}</p>
                <p className="text-xs text-ink-400 mt-1 font-code">{edu.institution} · {edu.year}</p>
              </div>
            </motion.div>
          ))}

          {/* Main Cert — Highlighted */}
          {certifications.filter((c) => c.highlight).map((cert) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gold-500/10 border border-gold-500/40 p-6 flex gap-4"
            >
              <div className="w-12 h-12 border border-gold-400 flex items-center justify-center shrink-0">
                <cert.icon className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <span className="font-code text-[10px] text-gold-600 uppercase tracking-wider">Certificate · {cert.org}</span>
                <h3 className="font-heading font-bold text-ink-700 mt-1">{cert.title}</h3>
                <p className="text-sm text-ink-500 mt-1">{cert.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Workshops Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 text-gold-500" />
            <h3 className="font-heading text-xl font-bold text-ink-700">
              ผ่านการอบรมเชิงปฏิบัติการ
              <span className="ml-2 font-sans text-sm font-normal text-ink-400">(Practical Training)</span>
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {workshops.map((ws, i) => (
              <motion.div
                key={ws.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white border border-cream-300 p-4 hover:border-gold-400/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-ink-700 group-hover:text-ink-800 transition-colors">{ws.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {ws.topics.map((t) => (
                        <span key={t} className="font-code text-[10px] bg-cream-200/80 text-ink-500 px-2 py-0.5 rounded-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
