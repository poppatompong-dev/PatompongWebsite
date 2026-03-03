import { PrismaClient } from "@prisma/client";
import TimelineClient from "./TimelineClient";

export default async function TimelineSection() {
  const prisma = new PrismaClient();
  const events = await prisma.timelineEvent.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <section id="experience" className="relative py-24 lg:py-32 bg-cream-100 bg-noise">
      <div className="absolute top-0 right-8 lg:right-16 w-px h-full bg-cream-300/60" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-24">
          <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
            รายงานผลการปฏิบัติงาน (Timeline)
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50">
            ประสบการณ์และการเข้าร่วมกิจกรรม
          </h2>
          <div className="divider-gold mx-auto mt-4" />
          <p className="mt-6 text-ink-300 text-lg max-w-2xl mx-auto">
            บันทึกการเข้ารับการอบรม การพัฒนาระบบ และกิจกรรมสำคัญต่างๆ
            ที่เสริมสร้างศักยภาพเพื่อการทำงานและต่อยอดองค์ความรู้
          </p>
        </div>

        <TimelineClient events={events} />
      </div>
    </section>
  );
}
