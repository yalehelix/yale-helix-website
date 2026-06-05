import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yale Helix",
  description:
    "Yale's undergraduate-run healthcare and biotech startup incubator, pairing student talent with rising founders.",
  keywords: ["Yale Helix", "biotech incubator", "startup", "Yale", "healthcare"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-bg text-text font-body antialiased">{children}</body>
    </html>
  );
}
