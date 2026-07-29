import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MetaPixel } from "@adkit/meta-pixel-next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meta Pixel Next.js Playground",
  description: "Testing @adkit/meta-pixel-next",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MetaPixel
          pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID || "1234567890"}
          debug={true}
          enableLocalhost={true}
        >
          {children}
        </MetaPixel>
      </body>
    </html>
  );
}
