import type { Metadata } from 'next';
import React from 'react';
import '../../public/css/main.css';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
    title: 'modchecker',
    description: 'lookup mods stuff'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <head>
            <meta name="author" content="maersux"/>
            <link rel="icon" sizes="64x64" href="/img/favicon.ico"/>
        </head>
        <body>
        <Header/>
        <main className="wrapper">
            {children}
        </main>
        <Footer/>
        </body>
        </html>
    );
}
