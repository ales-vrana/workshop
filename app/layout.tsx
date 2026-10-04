import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MetaPixel } from "@/components/MetaPixel";
import { EventSchema } from "@/components/EventSchema";
import { DevWarning } from "@/components/ui/DevWarning";
import { WORKSHOP } from "@/lib/config";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://poznej.coachville.eu/workshop";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Takhle dalších deset let ne? | Ukázková lekce koučování CoachVille",
  description:
    `${WORKSHOP.duration} online, ve kterých si koučování vyzkoušíte na vlastní kůži a zjistíte, jestli je to cesta, kterou hledáte. Vede Aleš Vrána, ICF Master Certified Coach. ${WORKSHOP.dateFull}, ${WORKSHOP.timeRange}, ${WORKSHOP.price}. První hodina na zkoušku.`,
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
    title: "Takhle dalších deset let ne? | Ukázková lekce koučování CoachVille",
    description:
      `${WORKSHOP.duration} živé praxe s držitelem ICF MCC. Bez teorie a bez skoku do prázdna. Vyzkoušejte si koučování na vlastní kůži.`,
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
    title: "Takhle dalších deset let ne? | Ukázková lekce koučování CoachVille",
    description: `${WORKSHOP.duration} živé praxe s držitelem ICF MCC. ${WORKSHOP.price}, první hodina na zkoušku.`,
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
        {/* Microsoft Clarity - vloženo přímo do <head>, projekt ykej9fbehc */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "ykej9fbehc");`,
          }}
        />
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
