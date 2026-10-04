import type { Metadata, Viewport } from "next";
import { Cormorant, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Studio — We build companies",
  description: "A venture studio that builds companies with founders: brand, product, software and the team to run it.",
};

export const viewport: Viewport = {
  themeColor: "#0E1014",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${hanken.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
