"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar, GraduationCap } from "lucide-react";

const timeline = [
  {
    period: "ปัจจุบัน",
    title: "นักวิชาการคอมพิวเตอร์ / หัวหน้าทีมผู้เชี่ยวชาญ",
    subtitle: "Computer Technical Officer & Team Lead",
    organization: "เทศบาลเมืองอุทัยธานี",
    location: "อุทัยธานี",
    description:
      "ให้คำปรึกษาและออกแบบระบบเน็ตเวิร์ค กล้องวงจรปิด และระบบสารสนเทศ พร้อมพัฒนาระบบอัตโนมัติเพื่อเพิ่มประสิทธิภาพการทำงาน",
    current: true,
    icon: Briefcase,
  },
  {
    period: "2564 – 2567",
    title: "นักวิชาการคอมพิวเตอร์ / หัวหน้าทีมผู้เชี่ยวชาญ",
    subtitle: "Computer Technical Officer & Team Lead",
    organization: "เทศบาลตำบลบ้านคลอง",
    location: "พิษณุโลก",
    description:
      "ดูแลและวางระบบโครงสร้างพื้นฐานด้านไอทีทั้งหมด รวมถึงเครือข่ายและศูนย์ข้อมูล เพื่อให้บริการประชาชนและเพิ่มศักยภาพการทำงานของเจ้าหน้าที่",
    current: false,
    icon: Briefcase,
  },
  {
    period: "อดีต",
    title: "พนักงานเทคนิคไอที",
    subtitle: "IT Support Technician",
    organization: "เทศบาลนครนครสวรรค์",
    location: "นครสวรรค์",
    description:
      "สนับสนุนงานด้านเทคนิคไอที ซ่อมบำรุงคอมพิวเตอร์ และดูแลระบบเครือข่ายเบื้องต้นภายในหน่วยงาน",
    current: false,
    icon: Briefcase,
  },
  {
    period: "การศึกษา",
    title: "ปริญญาโท Information Science (KMITL)",
    subtitle: "Master's Degree Program",
    organization: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง (KMITL)",
    location: "กรุงเทพมหานคร",
    description: "เรียนจบคอร์สเวิร์ก แต่ไม่ได้รับปริญญา",
    current: false,
    icon: GraduationCap,
  },
  {
    period: "การศึกษา",
    title: "ระดับปริญญาตรี วิทยาการคอมพิวเตอร์",
    subtitle: "Bachelor of Science in Computer Science",
    organization: "มหาวิทยาลัยราชภัฏนครสวรรค์",
    location: "นครสวรรค์",
    description: "สำเร็จการศึกษา ปี พ.ศ. 2547",
    current: false,
    icon: GraduationCap,
  }
];

export default function TimelineSection() {
  return (
    <section id="experience" className="relative py-24 lg:py-32 bg-cream-100 bg-noise">
      {/* Decorative side line */}
      <div className="absolute top-0 right-8 lg:right-16 w-px h-full bg-cream-300/60" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
            ประสบการณ์การทำงานและการศึกษา (Experience & Education)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50">
            ประวัติการทำงาน
          </h2>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-300 text-lg max-w-2xl mx-auto">
            กว่า 13 ปีในการดูแลระบบเทคโนโลยีสารสนเทศขององค์กรภาครัฐ
            เป็นหลักประกันถึงความมั่นคงและมาตรฐานการทำงานของทีมเรา
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-400/60 via-cream-300 to-transparent lg:-translate-x-px" />

          <div className="space-y-12">
            {timeline.map((item, index) => {
              const Icon = item.icon || Briefcase;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col lg:flex-row items-start gap-8 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-8 lg:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-cream-100 border-2 border-gold-400 z-10 mt-6 lg:mt-8 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-gold-500" />
                    {item.current && (
                      <div className="absolute inset-[-6px] rounded-full border border-gold-400/30 animate-ping" />
                    )}
                  </div>

                  {/* Content Card */}
                  <div className={`ml-16 lg:ml-0 lg:w-[calc(50%-2rem)] ${index % 2 === 0 ? "lg:pr-8" : "lg:pl-8"}`}>
                    <div className={`card-retro rounded-sm p-6 lg:p-8 transition-all duration-300 ${
                      item.current ? "border-gold-400 bg-white/60" : "bg-white/40 hover:bg-white/60"
                    }`}>
                      {/* Period Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-4 h-4 text-gold-500" />
                        <span className="font-code text-sm text-gold-600 font-bold">{item.period}</span>
                        {item.current && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] font-code bg-gold-400/10 text-gold-600 border border-gold-400/30 uppercase tracking-wider rounded-sm">
                            Present
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading text-xl font-bold text-ink-800 mb-1">{item.title}</h3>
                      <p className="text-gold-600/80 text-sm font-code tracking-wide uppercase mb-4">{item.subtitle}</p>

                      <div className="flex flex-col gap-2 text-sm text-ink-500 mb-5 font-medium">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-ink-400" />
                          <span>{item.organization}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-ink-400" />
                          <span>{item.location}</span>
                        </div>
                      </div>

                      <p className="text-ink-600 leading-relaxed text-sm">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
