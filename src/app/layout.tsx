import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CatalogProvider } from "@/components/payota/catalog-context";
import { CartProvider } from "@/components/payota/cart-context";
import { Navbar } from "@/components/payota/Navbar";
import { Footer } from "@/components/payota/Footer";
import { AgeGate } from "@/components/payota/AgeGate";
import { CONTACT } from "@/lib/contact";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  OG_IMAGE,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  LOGO_IMAGE,
} from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE} · Solok, Sumatera Barat`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: "shopping",
  classification: "Toko Online — Kelengkapan Lifestyle Premium",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon.ico" },
    ],
    apple: [{ url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/favicon_io/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  verification: {
    google: "9ebfa35b4f681d04",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE} · Solok, Sumatera Barat`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
      {
        url: LOGO_IMAGE,
        width: 512,
        height: 512,
        alt: `Logo ${SITE_NAME}`,
      },
    ],
    countryName: "Indonesia",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_IMAGE,
  image: OG_IMAGE,
  description: SITE_DESCRIPTION,
  foundingLocation: "Solok, Sumatera Barat, Indonesia",
  areaServed: { "@type": "Country", name: "Indonesia" },
  sameAs: [CONTACT.instagramUrl, CONTACT.whatsappUrl],
};

const storeLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE_URL}/#store`,
  name: `${SITE_NAME} — ${SITE_TAGLINE}`,
  url: SITE_URL,
  logo: LOGO_IMAGE,
  image: OG_IMAGE,
  description: SITE_DESCRIPTION,
  priceRange: "Rp 50.000 - Rp 1.500.000",
  currenciesAccepted: "IDR",
  paymentAccepted: "Cash, Transfer Bank, E-Wallet",
  parentOrganization: { "@id": `${SITE_URL}/#organization` },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Solok",
    addressRegion: "Sumatera Barat",
    addressCountry: "ID",
  },
  areaServed: "ID",
  hasMap: CONTACT.mapsUrl,
  telephone: `+${CONTACT.whatsappNumber}`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+${CONTACT.whatsappNumber}`,
    contactType: "customer service",
    areaServed: "ID",
    availableLanguage: "id",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "11:00",
      closes: "23:00",
    },
  ],
  sameAs: [CONTACT.instagramUrl, CONTACT.whatsappUrl],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: `${SITE_NAME} — ${SITE_TAGLINE}`,
  url: SITE_URL,
  inLanguage: "id-ID",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} ${jakarta.variable} bg-background text-foreground antialiased`}>
        <CatalogProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <AgeGate />
          </CartProvider>
        </CatalogProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [organizationLd, storeLd, websiteLd] }) }}
        />
      </body>
    </html>
  );
}