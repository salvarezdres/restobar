import type { Metadata } from 'next';
import './globals.css';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-orbitron',
});

export const metadata: Metadata = {
  title: 'Frost Cube Arcade',
  description: 'Retro neon platformer with an ice cube and sloped terrain',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={orbitron.variable}>{children}</body>
    </html>
  );
}
