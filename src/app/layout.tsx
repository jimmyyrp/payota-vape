import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";
import { APP_BUILD_VERSION } from "@/lib/build-id.generated";
import VersionGuard from "@/components/VersionGuard";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vape Store – Katalog Vape & Liquid Terlengkap",
    template: "%s | Vape Store"
  },
  description: "Katalog vape store terlengkap: pod system, mod device, liquid, dan disposable original dengan harga bersahabat. Pesan mudah via WhatsApp.",
  keywords: ["vape store", "katalog vape", "pod system", "mod device", "liquid vape", "disposable", "liquid salt nic", "vape original"],
  authors: [{ name: "Vape Store" }],
  creator: "Vape Store",
  publisher: "Vape Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon.ico" },
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Vape Store",
    title: "Vape Store – Katalog Vape & Liquid Terlengkap",
    description: "Pod system, mod device, liquid, dan disposable original dalam satu katalog. Pesan sekarang!",
    images: [
      {
        url: absoluteUrl("/opengraph-image.png"),
        width: 1200,
        height: 630,
        alt: "Vape Store – Katalog Vape & Liquid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vape Store – Katalog Vape & Liquid",
    description: "Pod system, mod device, liquid, dan disposable original dalam satu katalog.",
    images: [absoluteUrl("/opengraph-image.png")],
  },
  robots: {
    index: true,
    follow: true,
  },
} satisfies Metadata;

const buildVersionMeta = {
  name: "x-build-version",
  content: APP_BUILD_VERSION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <meta {...buildVersionMeta} />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased bg-background selection:bg-primary/20`}>
        <VersionGuard />
        {children}
      </body>
    </html>
  );
}