import { fetchAndClassifyPhotos } from "@/actions/gallery";
import SmartGalleryClient from "./SmartGalleryClient";

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
          <h3 className="font-heading text-xl sm:text-2xl text-gold-500 italic mt-1">
            CCTV · Network · Software · On-site
          </h3>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-400 text-base max-w-2xl mx-auto leading-relaxed">
            รวมภาพผลงานจริงจากการลงพื้นที่ทำงานของทีมช่างและผู้เชี่ยวชาญ
            <br className="hidden sm:block" />
            ผ่านประสบการณ์ตรงกว่า 13 ปี ในการออกแบบและติดตั้งระบบองค์กร
          </p>
        </div>

        <SmartGalleryClient initialPhotos={photos} />
      </div>
    </section>
  );
}
