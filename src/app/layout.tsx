import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary fonts
});

export const metadata: Metadata = {
  title: {
    default: "After 2AM Stories – Midnight Whispers & Late Night Confessions",
    template: "%s | After 2AM Stories",
  },
  description:
    "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.",
  keywords: [
    "after 2am",
    "stories",
    "horror",
    "confessions",
    "late night",
    "midnight tales",
    "storytelling",
    "nighttime stories",
  ],
  authors: [{ name: "After 2AM Stories" }],
  creator: "After 2AM Stories",
  openGraph: {
    title: "After 2AM Stories – Midnight Whispers & Late Night Confessions",
    description:
      "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.",
    type: "website",
    siteName: "After 2AM Stories",
  },
  twitter: {
    card: "summary_large_image",
    title: "After 2AM Stories – Midnight Whispers & Late Night Confessions",
    description:
      "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.",
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
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#020617" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "After 2AM Stories",
  description:
    "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.",
  url: "https://after2am.stories", // Update with your actual domain
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://after2am.stories/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
