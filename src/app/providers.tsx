'use client';

import { HeroUIProvider } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <SessionProvider>
      <HeroUIProvider navigate={router.push} className="flex-1 flex flex-col">
        {/*
          forcedTheme rather than defaultTheme + enableSystem: with enableSystem
          a light-mode OS resolved to `light`, and heroui's light palette on a
          hardcoded `bg-primary-900` body gave white dropdowns and inputs on a
          near-black page. the theme switch was removed from the ui, so there is
          nothing for next-themes to vary.
        */}
        <ThemeProvider attribute="class" forcedTheme="dark">
          {children}
        </ThemeProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}
