import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feel Internal Video",
  description: "Private restaurant operations video library.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        notoSans.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
