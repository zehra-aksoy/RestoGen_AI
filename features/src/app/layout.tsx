import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "RestoGen AI",
  description:
    "Mutfak israfını azaltmaya yardımcı asistan — görsel envanter, zero-waste tarif, tabak artığı geri bildirimi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-cream text-ink antialiased h-[100dvh] overflow-hidden`}>
        <div className="flex h-full w-full">
          {/* Mobil menu toggle could be added later, currently Sidebar is hidden on very small screens or overlapping */}
          <div className="hidden lg:block lg:flex-shrink-0">
            <Sidebar />
          </div>
          
          <main className="flex-1 overflow-y-auto w-full">
            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
