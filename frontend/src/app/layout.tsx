import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Katha (කතා) — Sri Lankan Relationship Discovery Platform",
  description: "Discover compatible people based on personality, intentions, lifestyle, and shared values. Engineered for Sri Lanka.",
  keywords: ["Dating Sri Lanka", "Colombo Dating", "Katha dating app", "Mingle.lk", "Sri Lanka relationships"],
  authors: [{ name: "Katha Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#090D16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
        <Toaster richColors position="top-center" theme="dark" closeButton />
        {children}
      </body>
    </html>
  );
}
