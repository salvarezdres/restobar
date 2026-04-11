import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import Providers from "@/components/providers";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Carta Studio",
  description: "Panel para gestionar la carta digital de tu restaurante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${sans.variable} ${display.variable}`} lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
