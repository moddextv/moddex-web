import { CSSProperties } from 'react';
import { asLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { Container } from '@/components/UI/Container';
import { LeaderRows } from '@/components/Leaderboard/LeaderRows';
import { LeaderScale, getLeaderboard } from '@/utils/api/moddex/public';
import { Metadata } from 'next';
import { config } from '@/config';
import { pageMetadata } from '@/misc/metadata';
import clsx from 'clsx';

export const dynamic = 'force-dynamic';

// picking a role here is the same act as picking one on a profile, so it wears
// the same chip rather than a second tab pattern
const SCALES: { key: LeaderScale; corner: string | null; tone: string }[] = [
  { key: 'mod', corner: 'corner-tl', tone: 'text-mod' },
  { key: 'vip', corner: 'corner-br', tone: 'text-vip' },
  { key: 'founder', corner: 'corner-bl', tone: 'text-founder' },
  { key: 'roles', corner: null, tone: '' }
];

const isScale = (value: string): value is LeaderScale =>
  SCALES.some((scale) => scale.key === value);

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);

  return {
    ...pageMetadata('/leaderboard', locale),
    title: t('leaderboard.metaTitle'),
    description: t('leaderboard.metaDescription', { brandName: config.brand.name })
  };
};

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ scale?: string; bots?: string }>;
}

export default async function LeaderboardPage({ params: routeParams, searchParams }: PageProps) {
  const locale = asLocale((await routeParams).locale);
  const t = getTranslator(locale);
  const params = await searchParams;
  const scale = params.scale && isScale(params.scale) ? params.scale : 'mod';
  const bots = params.bots === 'exclude' ? 'exclude' : 'include';
  const activeLabel = t(`leaderboard.scales.${scale}.label`);

  const board = await getLeaderboard(scale, { limit: 50, bots });
  const href = (next: Partial<{ scale: string; bots: string }>) => {
    const query = new URLSearchParams({ scale, ...(bots === 'exclude' ? { bots } : {}), ...next });

    return `/leaderboard?${query.toString()}`;
  };

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="corner corner-tl text-mod" aria-hidden="true" />
            <h1 className="text-h1">{t('leaderboard.heading')}</h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">
            {t('leaderboard.lead', { brandName: config.brand.name })}
          </p>
        </header>

        <nav
          className="role-tabs enter"
          aria-label={t('leaderboard.tabsLabel')}
          style={{ '--i': 1 } as CSSProperties}
        >
          {SCALES.map((entry) => {
            const here = entry.key === scale;

            return (
              <LocaleLink
                key={entry.key}
                href={href({ scale: entry.key })}
                aria-current={here ? 'page' : undefined}
                className={clsx('role-tab', here && 'is-active')}
              >
                {entry.corner && (
                  <span
                    aria-hidden="true"
                    className={clsx('corner', entry.corner, here ? entry.tone : 'text-primary-600')}
                  />
                )}
                {t(`leaderboard.scales.${entry.key}.tab`)}
              </LocaleLink>
            );
          })}
        </nav>

        <section className="enter pt-2 pb-10" style={{ '--i': 2 } as CSSProperties}>
          <div className="panel-flush">
            <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
              <h2 className="text-h2">{activeLabel}</h2>
              <span className="text-lead text-primary-400 tabular">
                {board.items.length} <span className="text-ui">{t('leaderboard.ranked')}</span>
              </span>

              <span className="ml-auto flex items-center gap-2 flex-wrap">
                <LocaleLink
                  href={href({ bots: bots === 'exclude' ? 'include' : 'exclude' })}
                  className="chip"
                  aria-pressed={bots === 'exclude'}
                >
                  {t('controls.bots', {
                    state: bots === 'exclude' ? t('controls.botsHidden') : t('controls.botsShown')
                  })}
                </LocaleLink>
              </span>
            </div>

            {board.items.length ? (
              <LeaderRows scale={scale} label={activeLabel} items={board.items} locale={locale} />
            ) : (
              <p className="px-4 pb-6 text-ui text-primary-400">{t('leaderboard.empty')}</p>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
