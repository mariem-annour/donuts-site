import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// استدعاء خط Inter اللي كيعطي لمسة عصرية واحترافية
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Donuts Factory | Happiness Engineered",
  description: "Our donuts are happy to see you. Premium handcrafted donuts factory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} antialiased bg-[#0d010d] text-white min-h-screen`}
      >
        {/* هاد children هو اللي كيجيب الكود اللي حطينا فـ page.tsx */}
        {children}
      </body>
    </html>
  );
}