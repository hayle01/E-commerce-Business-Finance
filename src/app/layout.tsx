import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Commerce & Finance",
  description: "Personal commerce and finance manager",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Commerce & Finance",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

import { Providers } from "@/components/providers";
import { SwRegister } from "@/components/sw-register";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <Providers>{children}</Providers>
        <SwRegister />
      </body>
    </html>
  );
}
