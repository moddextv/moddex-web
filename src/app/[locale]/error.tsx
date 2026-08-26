'use client';

import { useI18n } from '@/i18n/context';
import { Container } from '@/components/UI/Container';
import { ReloadIcon } from '@/components/Icons';
import { config } from '@/config';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { t, rich } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <section className="enter pt-16 pb-10 max-w-2xl">
          <h1 className="text-h1 mb-4">{t('misc.errorHeading')}</h1>
          <p className="text-lead text-primary-300 max-w-prose mb-8">{t('errors.renderFailed')}</p>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn" onClick={() => reset()}>
              <ReloadIcon size={15} />
              {t('errors.retry')}
            </button>
            <LocaleLink href="/" className="btn btn-soft">
              {t('pages.home')}
            </LocaleLink>
          </div>

          <p className="text-ui text-primary-400 mt-8 max-w-prose">
            {rich(
              'errors.keepsHappening',
              {
                status: (chunk) => (
                  <a
                    href={config.brand.statusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-200 font-semibold hover:underline"
                  >
                    {chunk}
                  </a>
                )
              },
              { host: config.brand.statusUrl.replace('https://', '') }
            )}
          </p>
        </section>
      </Container>
    </main>
  );
}
