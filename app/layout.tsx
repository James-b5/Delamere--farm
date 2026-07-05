import type { Metadata, Viewport } from "next";
import "./globals.css";
import HeaderFooter from "@/components/HeaderFooter";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import WhatsAppChat from "@/components/WhatsAppChat";
import { Toaster } from "react-hot-toast";
import ConfirmProvider from '@/components/ConfirmProvider';
// Using CSS @font-face in globals.css instead of next/font/local

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://delamerefarm.co.ke"),
  title: {
    default: "Delamere Farm | Premium Dairy & Pedigree Livestock in Nakuru, Kenya",
    template: "%s | Delamere Farm",
  },
  description: "Delamere Farm - Fresh dairy products and pedigree cattle in Nakuru, Kenya. Trusted by farmers across Kenya. Fresh milk, artisan butter, yoghurt, and healthy pedigree cattle.",
  keywords: [
    "dairy farm",
    "pedigree cattle",
    "livestock Kenya",
    "fresh milk",
    "Delamere Farm",
    "Nakuru",
    "Kenyan farmers",
    "cattle sales",
    "dairy products",
    "goat farming",
    "poultry farming",
    "veterinary services",
  ],
  authors: [{ name: "Delamere Farm" }],
  creator: "Delamere Farm",
  publisher: "Delamere Farm",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://delamerefarm.co.ke",
    siteName: "Delamere Farm",
    title: "Delamere Farm | Premium Dairy & Pedigree Livestock",
    description: "Fresh dairy products and pedigree cattle from Nakuru, Kenya. Trusted by farmers across Kenya.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Delamere Farm - Premium Dairy & Pedigree Livestock in Nakuru, Kenya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delamere Farm | Premium Dairy & Pedigree Livestock",
    description: "Fresh dairy products and pedigree cattle from Nakuru, Kenya. Trusted by farmers across Kenya.",
    images: ["/images/og-image.jpg"],
    creator: "@delamerefarm",
    site: "@delamerefarm",
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "business",
  classification: "Dairy Farm & Livestock",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preferred color scheme */}
        <meta name="color-scheme" content="light" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DairyFarm",
              "name": "Delamere Farm",
              "description": "Premium Dairy & Pedigree Livestock Farm in Nakuru, Kenya",
              "url": "https://delamerefarm.co.ke",
"telephone": "+25475141445",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Nakuru",
                "addressRegion": "Nakuru County",
                "addressCountry": "KE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-0.4193",
                "longitude": "36.061"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  "opens": "08:00",
                  "closes": "17:00"
                }
              ],
              "priceRange": "KES",
              "servesCuisine": "Dairy Products",
              "paymentAccepted": "Cash, M-Pesa, Bank Transfer",
              "areaServed": {
                "@type": "Country",
                "name": "Kenya"
              },
              "offeredBy": {
                "@type": "Organization",
                "name": "Delamere Farm",
                "url": "https://delamerefarm.co.ke"
              }
            })
          }}
        />
      </head>
      <body className={`antialiased`}>
        <AuthProvider>
          <CartProvider>
            <ConfirmProvider>
              <HeaderFooter>
                {children}
              </HeaderFooter>
              <WhatsAppChat />
              <Toaster position="top-center" />
            </ConfirmProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
