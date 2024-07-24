'use client';

import { NextUIProvider } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <SessionProvider>
      <NextUIProvider navigate={router.push} className="flex-1 flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </NextUIProvider>
    </SessionProvider>
  );
}
