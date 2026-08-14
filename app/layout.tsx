import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escuela El Carmen 270",
  description: "Clon React de la portada institucional de Escuela El Carmen 270.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-[family-name:var(--font-body)] antialiased">{children}</body>
    </html>
  );
}
