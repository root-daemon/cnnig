import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wafer Map Classification System",
  description: "Academic visualization dashboard for CNN-based wafer defect classification.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-secondary/20">
            <header className="h-14 border-b bg-background flex items-center gap-2 px-4 md:px-6 sticky top-0 z-10">
              <MobileNav />
              <h1 className="font-semibold text-sm md:text-base text-foreground">
                Wafer Map Classification System
              </h1>
            </header>
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
