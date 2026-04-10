import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menu Creator",
  description: "Editor de cartas elegantes con login de Google y persistencia en Firestore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
