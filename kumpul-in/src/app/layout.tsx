import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Kumpul.in — Reservasi Ruang Komunitas",
  description: "Platform untuk mencari dan memesan ruang komunitas lokal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg">Kumpul.in</Link>
            <nav className="text-sm flex gap-4 text-gray-600">
              <Link className="hover:text-black" href="/">Beranda</Link>
              <Link className="hover:text-black" href="/tentang">Tentang</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
            © {new Date().getFullYear()} Kumpul.in · Platform Reservasi Ruang Komunitas
          </div>
        </footer>
      </body>
    </html>
  );
}
