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
  title: "Mingle.lk — Sri Lankan Relationship Discovery Platform",
  description: "Discover compatible people based on personality, intentions, lifestyle, and shared values. Engineered for Sri Lanka.",
  keywords: ["Dating Sri Lanka", "Colombo Dating", "Mingle.lk dating app", "Mingle.lk", "Sri Lanka relationships"],
  manifest: "/manifest.json",
  icons: { icon: "/mingle-icon.svg", apple: "/icon-192.png" },
  authors: [{ name: "Mingle.lk Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#FCFAF7] text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
        <Toaster richColors position="top-center" theme="light" closeButton />
        {children}
      </body>
    </html>
  );
}
