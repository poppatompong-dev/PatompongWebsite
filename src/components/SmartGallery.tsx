import { fetchAndClassifyPhotos } from "@/actions/gallery";
import SmartGalleryClient from "./SmartGalleryClient";

const TOPICS = [
  { icon: "📷", label: "CCTV & Security", sub: "กล้องวงจรปิด / ห้อง Monitor" },
  { icon: "🖥", label: "Network & Server", sub: "Server Room / อุปกรณ์เครือข่าย" },
  { icon: "📡", label: "Wireless & Antenna", sub: "เสาอากาศ / Point-to-Point" },
  { icon: "🔆", label: "Fiber Optic", sub: "Splice / วางสาย / OTDR" },
  { icon: "🎙", label: "Broadcasting & AV", sub: "Event / ระบบเสียง / Livestream" },
  { icon: "🔧", label: "Field Operations", sub: "งานภาคสนาม / High-Reach" },
  { icon: "🚁", label: "Drone Survey", sub: "DJI Drone / สำรวจพื้นที่" },
];

export default async function SmartGallery() {
  const photos = await fetchAndClassifyPhotos();

  return (
    <section id="portfolio" className="relative py-24 lg:py-32 bg-cream-200/40 bg-noise">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
            ผลงานจริงระดับมืออาชีพ (Our Portfolio)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-800">
            ผลงานของทีมงาน
          </h2>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-400 text-base max-w-2xl mx-auto leading-relaxed">
            รวมภาพผลงานจากการลงพื้นที่ทำงานของทีมช่างและผู้เชี่ยวชาญ
            <br className="hidden sm:block" />
            ผ่านประสบการณ์ตรงกว่า 13 ปี ในการออกแบบและติดตั้งระบบองค์กร
          </p>

          <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500/5 border border-gold-500/20 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            <p className="font-code text-[11px] text-gold-600/80 uppercase tracking-widest leading-none">
              Note: ภาพที่แสดงเป็นเพียง <span className="font-bold text-gold-700">~5%</span> ของผลงานจริงทั้งหมด เพื่อรักษาความเป็นส่วนตัวของลูกค้า
            </p>
          </div>
        </div>

        {/* Portfolio Topic Badges */}
        <div className="mb-12">
          <p className="text-center font-code text-[11px] text-ink-400 uppercase tracking-widest mb-5">
            หัวข้อผลงานที่ครอบคลุม — {photos.length} ภาพ จาก {TOPICS.length} หมวดงาน
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {TOPICS.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-cream-300 shadow-sm hover:border-gold-400 hover:shadow-md transition-all duration-200 group"
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <div className="text-left">
                  <p className="font-heading text-sm font-semibold text-ink-700 group-hover:text-gold-600 transition-colors leading-tight">
                    {t.label}
                  </p>
                  <p className="font-code text-[10px] text-ink-400 mt-0.5 leading-tight">
                    {t.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SmartGalleryClient initialPhotos={photos} />
      </div>
    </section>
  );
}
