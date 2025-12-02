import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuStack E-Commerce',
  description: 'E-Commerce platform with nth-order discount system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
          <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
            NeuStack E-Commerce Assignment
          </footer>
        </div>
      </body>
    </html>
  );
}
