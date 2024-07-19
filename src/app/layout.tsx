import '@/styles/globals.css';
import { Header } from '@/components/Header/Header';
import { cn } from '@/utils/utils';
import { Cairo, Lato } from 'next/font/google'; // Outfit ??
import React from 'react';
import { Providers } from './providers';

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  preload: true,
  variable: '--font-lato'
});

const cairo = Cairo({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-cairo'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(cairo.variable, lato.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          <main className="container mx-auto max-w-5xl pt-16 px-6 flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
