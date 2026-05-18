import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MetaPixel } from "@/components/MetaPixel";
import { EventSchema } from "@/components/EventSchema";
import { DevWarning } from "@/components/ui/DevWarning";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://workshop.coachville.eu";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Zažij koučování a začni koučovat už teď | Aleš Vrána MCC | 22. 5. 2026",
  description:
    "2,5hodinový online workshop + Q&A pro lidi, kteří chtějí koučování zažít v praxi. Živá praxe v roli kouče i klienta s držitelem nejvyšší ICF certifikace MCC. 22. 5. 2026, 17:30–20:00, 1 000 Kč. Garance vrácení peněz.",
  keywords: [
    "koučování",
    "workshop koučování",
    "ICF MCC",
    "CoachVille",
    "Aleš Vrána",
    "koučovací výcvik",
    "začít koučovat",
  ],
  authors: [{ name: "Aleš Vrána" }],
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    title: "Zažij koučování a začni koučovat už teď | 22. 5. 2026",
    description:
      "2,5 hodiny živé praxe + Q&A s držitelem ICF MCC. Bez teorie. Bez závazku. Vyzkoušej si koučovat na vlastní kůži.",
    siteName: "CoachVille Europe",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Workshop koučování s Alešem Vránou, MCC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zažij koučování a začni koučovat už teď | 22. 5. 2026",
    description: "2,5 hodiny živé praxe + Q&A s držitelem ICF MCC. Cena 1 000 Kč. Garance vrácení peněz.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#394A82",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={montserrat.variable}>
      <head>
        <EventSchema />
      </head>
      <body className="bg-white text-dark antialiased">
        <MetaPixel />
        {children}
        <DevWarning />
        <Analytics />
      </body>
    </html>
  );
}
