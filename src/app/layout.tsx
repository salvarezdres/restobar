import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restobar FE",
  description: "Frontend deployado en Firebase Hosting y conectado a Firestore.",
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
