import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const text = Instrument_Sans({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Odysseys",
  description: "We make the thing you keep thinking about. A studio that builds companies from the idea that won’t leave you alone.",
};

export const viewport: Viewport = {
  themeColor: "#0E1014",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
