import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "ScamTrace - Crypto Scam Monitoring & Documentation",
  description:
    "AI-powered crypto fraud protection & investigation platform. Transaction monitoring, forensic documentation, and evidence building for blockchain users. No blockchain expertise required.",
  openGraph: {
    title: "ScamTrace - Trace Every Coin. Expose Every Scam.",
    description:
      "Transaction monitoring and forensic documentation for blockchain users. No blockchain expertise required.",
    type: "website",
    siteName: "ScamTrace",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScamTrace - Trace Every Coin. Expose Every Scam.",
    description:
      "AI-powered crypto fraud protection with real-time fund monitoring.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} ${jetbrainsMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
