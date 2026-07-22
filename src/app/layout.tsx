import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Morning Mama – Cafe Banda Aceh | Kopi & Makanan Lezat",
  description: "Morning Mama Cafe di Banda Aceh. Nikmati kopi artisan, matcha, cheesecake, dan menu lezat lainnya. Tersedia delivery via GrabFood & GoFood. Buka setiap hari 08.30 - 23.30.",
  keywords: ["cafe banda aceh", "kopi banda aceh", "morning mama", "cafe lamlagang", "kopi artisan", "matcha banda aceh", "grabfood banda aceh", "gofood banda aceh"],
  authors: [{ name: "Morning Mama" }],
  creator: "Morning Mama",
  publisher: "Morning Mama",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://morningmama.vercel.app"),
  openGraph: {
    title: "Morning Mama – Cafe Banda Aceh",
    description: "Nikmati kopi terbaik dan sajian lezat di Morning Mama, cafe di Banda Aceh.",
    url: "https://morningmama.vercel.app",
    siteName: "Morning Mama",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/wallpapermoma.jpeg",
        width: 1200,
        height: 630,
        alt: "Morning Mama Cafe Interior",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Morning Mama – Cafe Banda Aceh",
    description: "Nikmati kopi terbaik dan sajian lezat di Morning Mama, cafe di Banda Aceh.",
    images: ["/images/wallpapermoma.jpeg"],
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
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Morning Mama",
    description: "Morning Mama Cafe di Banda Aceh. Nikmati kopi artisan, matcha, cheesecake, dan menu lezat lainnya.",
    url: "https://morningmama.vercel.app",
    telephone: "",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Sultan Malikul Saleh No.47AB, Lam Lagang, Kec. Banda Raya",
      addressLocality: "Banda Aceh",
      addressRegion: "Aceh",
      postalCode: "23239",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "5.5478",
      longitude: "95.3175",
    },
    openingHoursSpecification: {
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
      opens: "08:30",
      closes: "23:30",
    },
    priceRange: "Rp 32.000 - Rp 45.000",
    servesCuisine: ["Kopi", "Matcha", "Cheesecake", "Makanan Asia"],
    image: "https://morningmama.vercel.app/images/wallpapermoma.jpeg",
    sameAs: [
      "https://instagram.com/hellomorningmama",
      "https://www.tiktok.com/@hellomorningmama",
    ],
  };

  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
