import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WaferCNN Dashboard",
  description: "Wafer-map defect classification dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background font-sans text-foreground selection:bg-primary/30">
        <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -top-[20vw] -right-[20vw] w-[60vw] h-[60vw] rounded-full border-[1px] border-primary/20 bg-primary/5 blur-3xl"></div>
          <div className="absolute top-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full border-[1px] border-primary/10"></div>
          <div className="absolute top-[12%] right-[7%] w-[36vw] h-[36vw] rounded-full border border-dashed border-primary/20"></div>
        </div>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 border-b flex items-center gap-2 px-4 md:px-6 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
              <MobileNav />
              <h1 className="font-semibold text-sm md:text-base uppercase tracking-widest text-primary">
                Wafer Defect Dashboard
              </h1>
            </header>
            <main className="flex-1 p-4 md:p-8">{children}</main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
