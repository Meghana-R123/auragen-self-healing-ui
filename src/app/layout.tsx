
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import Link from "next/link";

import Sidebar from "@/components/Sidebar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraGen | Adaptive Intelligence",
  description:
    "An intelligent interface that adapts to user interaction patterns and cognitive load.",
};

const mobileNavigation = [
  { label: "Overview", href: "/" },
  { label: "Application", href: "/application" },
  { label: "Adaptive UI", href: "/adaptive-ui" },
  { label: "Monitor", href: "/interaction-monitor" },
  { label: "Settings", href: "/settings" },
];

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#080d1b] text-white">
        <div className="flex min-h-screen">
          {/* Desktop sidebar */}
          <div className="sticky top-0 hidden h-screen shrink-0 md:block">
            <Sidebar />
          </div>

          {/* Main application area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile navigation */}
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c1426]/95 px-4 py-3 backdrop-blur md:hidden">
              <div className="mb-3 flex items-center justify-between">
                <Link
                  href="/"
                  className="text-xl font-bold text-indigo-400"
                >
                  AuraGen
                </Link>

                <span className="text-xs text-slate-400">
                  Adaptive Intelligence
                </span>
              </div>

              <nav className="flex gap-2 overflow-x-auto pb-1">
                {mobileNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-indigo-500 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>

            <main className="min-w-0 flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
