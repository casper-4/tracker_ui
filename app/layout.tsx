import type { Metadata } from "next";
import { Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

// Geist Mono = --font-body per design system (monospace, used everywhere)
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Tracker UI",
  description: "UI playground — no data logic",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${orbitron.variable} dark`}
    >
      <body
        className="antialiased min-h-screen flex overflow-hidden selection:bg-[#00FF9F] selection:text-black"
        suppressHydrationWarning
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
