'use client';

import { Container } from '@/components/UI/Container';
import { ReloadIcon } from '@/components/Icons';
import { config } from '@/config';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <section className="enter pt-16 pb-10 max-w-2xl">
          <h1 className="text-h1 mb-4">That page didn&apos;t finish loading</h1>
          <p className="text-lead text-primary-300 max-w-prose mb-8">
            Something broke while the page was rendering, and we&apos;ve logged it. Retrying
            rebuilds just this part of the page, which usually works if it was a slow response and
            not a real bug.
          </p>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn" onClick={() => reset()}>
              <ReloadIcon size={15} />
              Retry this page
            </button>
            <Link href="/" className="btn btn-soft">
              Home
            </Link>
          </div>

          <p className="text-ui text-primary-400 mt-8 max-w-prose">
            If it keeps happening,{' '}
            <a
              href={config.brand.statusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 font-semibold hover:underline"
            >
              {config.brand.statusUrl.replace('https://', '')}
            </a>{' '}
            shows whether the api is up. It runs on separate infrastructure, so it stays up when
            this doesn&apos;t.
          </p>
        </section>
      </Container>
    </main>
  );
}
