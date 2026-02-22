import type { Metadata } from "next";
import { Playfair_Display, Noto_Sans_Thai, JetBrains_Mono, Prompt } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Patompong Tech Consultant | ทีมช่างและที่ปรึกษาระบบไอทีครบวงจร นครสวรรค์",
  description: "บริการติดตั้งกล้องวงจรปิด ระบบเครือข่าย Network และพัฒนาซอฟต์แวร์ระดับองค์กรในนครสวรรค์และพิษณุโลก โดยทีมงานผู้เชี่ยวชาญ ประสบการณ์กว่า 13 ปี ดูแลงานอย่างรับผิดชอบ ไม่ทิ้งงาน",
  keywords: ["ติดตั้งกล้องวงจรปิด นครสวรรค์", "ระบบ Network", "CCTV", "เดินสายแลน", "พัฒนาโปรแกรม", "ทีมช่างคอมพิวเตอร์", "ที่ปรึกษาไอที นครสวรรค์", "พิษณุโลก"],
  authors: [{ name: "Patompong Team" }],
  openGraph: {
    title: "Patompong Tech Consultant | ทีมผู้เชี่ยวชาญระบบไอทีและกล้องวงจรปิด นครสวรรค์",
    description: "บริการติดตั้งกล้องวงจรปิด ระบบเครือข่าย Network และพัฒนาซอฟต์แวร์ระดับองค์กร บริการโดยทีมงานคุณภาพ ไม่ทิ้งงาน พื้นที่นครสวรรค์-พิษณุโลก",
    url: "https://patompong.dev",
    siteName: "Patompong Tech Consultant",
    locale: "th_TH",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${notoSansThai.variable} ${prompt.variable} ${jetbrainsMono.variable} font-sans antialiased bg-cream-100 text-ink-700`}
      >
        {children}
      </body>
    </html>
  );
}
