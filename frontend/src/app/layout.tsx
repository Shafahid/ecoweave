import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoWeave - AI-Driven Textile Compliance Platform",
  description: "Make pollution financially irrational. Predict high-risk discharge periods and protect profits with forensic risk scoring for Bangladesh textile factories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased relative">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(58%_42%_at_8%_0%,rgba(16,185,129,0.18)_0%,rgba(16,185,129,0)_72%),radial-gradient(45%_34%_at_92%_12%,rgba(52,211,153,0.16)_0%,rgba(52,211,153,0)_74%),radial-gradient(50%_35%_at_45%_78%,rgba(20,184,166,0.12)_0%,rgba(20,184,166,0)_76%),radial-gradient(34%_26%_at_72%_94%,rgba(22,163,74,0.1)_0%,rgba(22,163,74,0)_80%)]"
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
