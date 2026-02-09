import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { RootProviders } from "./_components/root-providers";
import motionStyles from "@/styles/motion/view-transitions.module.css";
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
  title: {
    default: "OrgCentral",
    template: "%s | OrgCentral",
  },
  description: "Unified organization management for HR, operations, and compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${motionStyles.motionRoot}`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <RootProviders>{children}</RootProviders>
        </Suspense>
      </body>
    </html>
  );
}

