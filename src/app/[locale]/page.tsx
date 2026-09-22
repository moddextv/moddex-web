import { asLocale } from '@/i18n/locales';
import { getRich, getTranslator } from '@/i18n/dictionary';
import { pageMetadata } from '@/misc/metadata';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { OptOutEffect, OptOutReversible } from '@/components/OptOutPromise';
import { ArrowRightIcon } from '@/components/Icons';
import { BrowseRows } from '@/components/Browse/BrowseRows';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { CountUp } from '@/components/UI/CountUp';
import { CopyButton } from '@/components/UI/CopyButton';
import { config } from '@/config';
import { fetchAccounts, fetchChannels } from '@/actions/browse';
import { getIndexStats } from '@/utils/stats';
import { getStatsHistory } from '@/utils/api/moddex/public';
import { Growth } from '@/components/Home/Growth';
import { HeroSearch } from '@/components/Home/HeroSearch';
import { RoleCheck } from '@/components/Home/RoleCheck';
import { JsonLd, siteGraph } from '@/components/JsonLd';
import { Metadata } from 'next';
import { CSSProperties, FC, ReactNode } from 'react';

export const dynamic = 'force-dynamic';

// nightbot's variables; streamelements and fossabot take the same address with their own
const COMMANDS = [
  {
    name: '!mods',
    says: 'home.chat.mods',
    fetch: `$(channel) has $(urlfetch ${config.brand.apiUrl}/v1/chat/channels/$(channel)/mods) mods`
  },
  {
    name: '!modof',
    says: 'home.chat.modof',
    fetch: `$(1) moderates $(urlfetch ${config.brand.apiUrl}/v1/chat/users/$(1)/mods) channels`
  }
] as const;

const Direction: FC<{
  href: string;
  corner: string;
  tone: string;
  hover: string;
  title: string;
  example: string;
  children: string;
}> = ({ href, corner, tone, hover, title, example, children }) => (
  <LocaleLink
    href={href}
    className="panel group hover:bg-primary-700/25 transition-colors flex flex-col h-full"
  >
    <div className="flex items-center gap-3 mb-3">
      <span aria-hidden="true" className={`corner ${corner} ${tone}`} />
      <h2 className="text-h2">{title}</h2>
    </div>
    <p className="text-read text-primary-300 max-w-[42ch] mb-5">{children}</p>
    <span
      className={`mt-auto inline-flex items-center gap-2 text-ui font-mono text-primary-200 transition-colors ${hover}`}
    >
      {example}
      <ArrowRightIcon size={14} />
    </span>
  </LocaleLink>
);

const Count: FC<{
  label: string;
  corner: string;
  tone: string;
  value: number;
}> = ({ label, corner, tone, value }) => (
  <div>
    <p className="flex items-center gap-2.5 text-ui text-primary-400 mb-2">
      <span className={`corner ${corner} ${tone}`} aria-hidden="true" />
      {label}
    </p>
    <p className={`text-[clamp(1.625rem,2.4vw,2.125rem)] font-bold leading-none tabular ${tone}`}>
      <CountUp value={value} />
    </p>
  </div>
);

const Live: FC<{ title: string; href: string; link: string; children: ReactNode }> = ({
  title,
  href,
  link,
  children
}) => (
  <div className="panel-flush">
    <div className="flex items-baseline gap-3 px-4 pb-5">
      <h2 className="text-h2">{title}</h2>
      <LocaleLink
        href={href}
        className="ml-auto text-ui font-semibold text-primary-300 hover:text-primary-100 transition-colors"
      >
        {link}
      </LocaleLink>
    </div>
    {children}
  </div>
);

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);

  return {
    ...pageMetadata('/', locale)
  };
};

export default async function Home({ params }: MetaProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const rich = getRich(locale);

  const [stats, recent, holders, history] = await Promise.all([
    getIndexStats(),
    fetchChannels('read', 5, 0),
    fetchAccounts('roles', 5, 0, true),
    getStatsHistory(30).catch(() => [])
  ]);

  return (
    <main id="main" className="flex-grow">
      <JsonLd data={siteGraph()} />
      <Container>
        <section className="enter search-host pt-14 pb-10">
          <p className="flex items-center gap-3 text-ui text-primary-400 mb-5">
            <Mark size={18} split />
            <span>
              {rich('home.kicker', {
                mod: (chunk) => <span className="text-mod font-semibold">{chunk}</span>,
                vip: (chunk) => <span className="text-vip font-semibold">{chunk}</span>
              })}
            </span>
          </p>

          <h1 className="text-display max-w-[18ch] mb-5">{t('home.heading')}</h1>

          <p className="text-lead text-primary-300 max-w-prose mb-8">
            {t('home.lead', { name: config.brand.name })}
          </p>

          <HeroSearch />
        </section>

        <section
          className="enter grid gap-5 md:grid-cols-2 pb-12"
          style={{ '--i': 1 } as CSSProperties}
        >
          <Direction
            href="/channel"
            corner="corner-tl"
            tone="text-mod"
            hover="group-hover:text-mod"
            title={t('home.channelCard.title')}
            example={`${config.brand.domain}/c/forsen`}
          >
            {t('home.channelCard.body')}
          </Direction>

          <Direction
            href="/user"
            corner="corner-br"
            tone="text-vip"
            hover="group-hover:text-vip"
            title={t('home.accountCard.title')}
            example={`${config.brand.domain}/u/nymn`}
          >
            {t('home.accountCard.body')}
          </Direction>
        </section>
        <section className="enter pb-12" style={{ '--i': 2 } as CSSProperties}>
          <RoleCheck />
        </section>

        <section
          className="enter pb-12"
          style={{ '--i': 3 } as CSSProperties}
          aria-labelledby="home-chat"
        >
          <div className="panel">
            <div className="flex items-center gap-3 mb-2">
              <span className="corner corner-bl text-founder" aria-hidden="true" />
              <h2 id="home-chat" className="text-h2">
                {t('home.chat.title')}
              </h2>
            </div>
            <p className="text-read text-primary-300 max-w-prose mb-5">{t('home.chat.body')}</p>

            <div className="flex flex-col gap-3">
              {COMMANDS.map((command) => (
                <div
                  key={command.name}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                >
                  <span className="font-mono text-base font-bold text-primary-100 sm:w-20 shrink-0">
                    {command.name}
                  </span>
                  <span className="text-ui text-primary-400 sm:w-56 shrink-0">
                    {t(command.says)}
                  </span>
                  <code className="font-mono text-ui text-primary-200 break-all flex-1">
                    {command.fetch}
                  </code>
                  <CopyButton label={t('home.chat.copy')} value={command.fetch} />
                </div>
              ))}
            </div>

            <p className="text-ui text-primary-400 mt-5">
              {rich('home.chat.docs', {
                link: (chunk) => (
                  <a
                    href={config.brand.docsUrl}
                    className="text-primary-200 font-semibold hover:underline"
                  >
                    {chunk}
                  </a>
                )
              })}
            </p>
          </div>
        </section>

        <section
          className="enter pb-14"
          style={{ '--i': 3 } as CSSProperties}
          aria-label={t('home.stats.label')}
        >
          <div className="flex flex-wrap items-end gap-x-12 gap-y-7">
            <Count
              label={t('home.stats.mods')}
              corner="corner-tl"
              tone="text-mod"
              value={stats.mods}
            />
            <Count
              label={t('home.stats.vips')}
              corner="corner-br"
              tone="text-vip"
              value={stats.vips}
            />

            {stats.founders && (
              <Count
                label={t('home.stats.founders')}
                corner="corner-bl"
                tone="text-founder"
                value={stats.founders}
              />
            )}

            <p className="text-read text-primary-400 max-w-[30ch] leading-relaxed">
              {rich(
                'home.stats.across',
                {
                  channels: (chunk) => (
                    <span className="text-primary-100 font-bold tabular">{chunk}</span>
                  ),
                  accounts: (chunk) => (
                    <span className="text-primary-100 font-bold tabular">{chunk}</span>
                  )
                },
                {
                  channels: t.number(stats.channels),
                  accounts: t.number(stats.users)
                }
              )}
            </p>
          </div>
        </section>

        <section className="enter pb-12" style={{ '--i': 4 } as CSSProperties}>
          <Growth points={history} locale={locale} />
        </section>

        {(recent.items.length > 0 || holders.items.length > 0) && (
          <section
            className="enter grid items-start gap-6 lg:grid-cols-2 pb-12"
            style={{ '--i': 5 } as CSSProperties}
          >
            {recent.items.length > 0 && (
              <Live title={t('home.recent.title')} href="/channel" link={t('home.recent.link')}>
                <BrowseRows kind="channel" items={recent.items} locale={locale} />
              </Live>
            )}

            {holders.items.length > 0 && (
              <Live
                title={t('home.holders.title')}
                href="/leaderboard"
                link={t('home.holders.link')}
              >
                <BrowseRows kind="account" items={holders.items} locale={locale} />
              </Live>
            )}
          </section>
        )}

        <section
          className="enter grid gap-6 md:grid-cols-2 pb-4"
          style={{ '--i': 6 } as CSSProperties}
        >
          <div className="panel flex flex-col h-full">
            <h2 className="text-h2 mb-3">{t('home.fills.title')}</h2>
            <p className="text-read text-primary-300 max-w-[46ch] mb-5">{t('home.fills.body')}</p>
            <LocaleLink href="/channel" className="mt-auto self-start btn btn-soft">
              {t('home.fills.action')}
            </LocaleLink>
          </div>

          <div className="panel flex flex-col h-full">
            <h2 className="text-h2 mb-3">{t('home.optOut.title')}</h2>
            <p className="text-read text-primary-300 max-w-[46ch] mb-5">
              {t('home.optOut.body')} <OptOutEffect /> <OptOutReversible />
            </p>
            <LocaleLink href="/settings" className="mt-auto self-start btn btn-soft">
              {t('home.optOut.action')}
            </LocaleLink>
          </div>
        </section>
      </Container>
    </main>
  );
}
