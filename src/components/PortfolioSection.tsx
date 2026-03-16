import { getProjects } from "@/lib/queries";
import PortfolioSectionClient from "./PortfolioSectionClient";

export default async function PortfolioSection() {
    let projects: any[] = [];
    try {
        projects = await getProjects();
    } catch { }

    if (projects.length === 0) return null;

    return (
        <section id="portfolio-links" className="relative py-24 lg:py-32 bg-ink-900 border-t border-ink-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 lg:mb-24">
                    <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
                        ผลงานที่ผ่านมา (Our Work)
                    </span>
                    <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50">
                        ระบบและซอฟต์แวร์
                    </h2>
                    <div className="divider-gold mx-auto mt-4" />
                    <p className="mt-6 text-cream-200/80 text-lg max-w-2xl mx-auto">
                        รวบรวมผลงานการพัฒนาระบบ ซอฟต์แวร์ และแอปพลิเคชันที่นำไปใช้งานจริงในหน่วยงานและองค์กร
                    </p>
                </div>

                <PortfolioSectionClient projects={projects} />
            </div>
        </section>
    );
}
