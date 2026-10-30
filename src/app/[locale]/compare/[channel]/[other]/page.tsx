import { asLocale, localePath } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { Metadata } from 'next';
import { CSSProperties, FC } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Container } from '@/components/UI/Container';
import { Avatar } from '@/components/UI/Avatar';
import { FilterChoice } from '@/components/UI/FilterMenu';
import { Badges } from '@/components/User/Badges';
import { ModdexApiError } from '@/utils/api/moddex/client';
import { Role, SharedRoles, getSharedRoles } from '@/utils/api/moddex/public';
import { isUsername } from '@/utils/username';

export const dynamic = 'force-dynamic';

const ROLES: { key: Role; tone: string; bar: string }[] = [
  { key: 'mods', tone: 'text-mod', bar: 'bg-mod' },
  { key: 'vips', tone: 'text-vip', bar: 'bg-vip' },
  { key: 'founders', tone: 'text-founder', bar: 'bg-founder' }
];

interface PageProps {
  params: Promise<{ locale: string; channel: string; other: string }>;
  searchParams: Promise<{ role?: string }>;
}

// every pair of channels is a page, so none of them is one a crawler should keep
export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale, channel, other } = await params;
  const t = getTranslator(asLocale(locale));

  return {
    title: t('compare.title', { channel, other }),
    robots: { index: false, follow: false }
  };
};

const Side: FC<{
  account: SharedRoles['channel'];
  locale: ReturnType<typeof asLocale>;
  align: 'left' | 'right';
}> = ({ account, locale, align }) => (
  <Link
    href={localePath(locale, `/channel/${account.login}`)}
    className={clsx(
      'compare-side flex items-center gap-4 min-w-0',
      align === 'right' && 'flex-row-reverse text-right'
    )}
  >
    <Avatar
      src={account.avatar}
      name={account.name || account.login}
      size={64}
      className="w-16 h-16 shrink-0"
    />
    <span className="min-w-0">
      <span className="block text-h2 font-bold truncate">{account.name || account.login}</span>
      <span className="block text-ui font-mono text-primary-400 truncate">@{account.login}</span>
    </span>
  </Link>
);

export default async function ComparePage({ params, searchParams }: PageProps) {
  const { locale: rawLocale, channel, other } = await params;
  const locale = asLocale(rawLocale);
  const t = getTranslator(locale);
  const picked = (await searchParams).role;
  const active = ROLES.find((role) => role.key === picked) ?? ROLES[0]!;

  let data: SharedRoles | null = null;
  let problem: 'same' | 'missing' | null = null;

  if (!isUsername(channel) || !isUsername(other)) {
    problem = 'missing';
  } else {
    try {
      data = await getSharedRoles(channel, other);
    } catch (error) {
      if (!(error instanceof ModdexApiError) || ![400, 404].includes(error.status)) throw error;
      problem = error.status === 400 ? 'same' : 'missing';
    }
  }

  if (!data) {
    return (
      <main id="main" className="flex-grow">
        <Container>
          <section className="enter pt-12 pb-10 max-w-2xl">
            <h1 className="text-h1 mb-3">{t('compare.heading')}</h1>
            <p className="text-lead text-primary-300 mb-6">
              {t(problem === 'same' ? 'compare.same' : 'compare.missing')}
            </p>
            <Link href={localePath(locale, `/channel/${channel}`)} className="btn btn-soft">
              {t('compare.back', { login: channel })}
            </Link>
          </section>
        </Container>
      </main>
    );
  }

  const counts = data.roles[active.key];
  const total = counts.only + counts.shared + counts.otherOnly;
  const share = (part: number) => (total ? `${(part / total) * 100}%` : '0%');

  return (
    <main id="main" className="flex-grow">
      <Container>
        <section className="enter pt-12 pb-8">
          <p className="text-meta text-primary-400 text-center mb-6">{t('compare.heading')}</p>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 sm:gap-8">
            <Side account={data.channel} locale={locale} align="left" />

            <div className="compare-count text-center" key={active.key}>
              <p className={clsx('text-[3rem] font-extrabold leading-none tabular', active.tone)}>
                {t.number(counts.shared)}
              </p>
              <p className="text-ui text-primary-400 mt-1">
                {t(`compare.inCommon.${active.key}`, { count: counts.shared })}
              </p>
            </div>

            <Side account={data.other} locale={locale} align="right" />
          </div>
        </section>

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <div className="flex flex-wrap gap-2 mb-5">
            {ROLES.map((role) => (
              <FilterChoice
                key={role.key}
                pressed={role.key === active.key}
                href={`/compare/${data.channel.login}/${data.other.login}?role=${role.key}`}
                count={data.roles[role.key].shared}
              >
                {t(`compare.roles.${role.key}`)}
              </FilterChoice>
            ))}
          </div>

          <div className="panel">
            <div className="compare-bar" key={active.key} aria-hidden="true">
              <span
                className={clsx(active.bar, 'opacity-35')}
                style={{ width: share(counts.only) }}
              />
              <span className={active.bar} style={{ width: share(counts.shared) }} />
              <span
                className="bg-primary-500 opacity-35"
                style={{ width: share(counts.otherOnly) }}
              />
            </div>

            <div className="flex justify-between gap-4 flex-wrap mt-3 text-ui text-primary-400">
              <span>
                {t('compare.only', { login: data.channel.login })}{' '}
                <span className="tabular text-primary-100 font-bold">{t.number(counts.only)}</span>
              </span>
              <span>
                {t('compare.both')}{' '}
                <span className={clsx('tabular font-bold', active.tone)}>
                  {t.number(counts.shared)}
                </span>
              </span>
              <span>
                {t('compare.only', { login: data.other.login })}{' '}
                <span className="tabular text-primary-100 font-bold">
                  {t.number(counts.otherOnly)}
                </span>
              </span>
            </div>
          </div>
        </section>

        <section className="enter pb-12" style={{ '--i': 2 } as CSSProperties}>
          <div className="panel-flush">
            {counts.items.length ? (
              <div className="rows">
                {counts.items.map((user) => (
                  <Link
                    key={user.id}
                    href={localePath(locale, `/user/${user.login}`)}
                    className="row"
                    style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}
                  >
                    <span className="flex items-center gap-3.5 min-w-0">
                      <Avatar
                        src={user.avatar}
                        name={user.name || user.login}
                        size={36}
                        className="w-9 h-9"
                      />
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="row-name text-base font-bold truncate">
                          {user.name || user.login}
                        </span>
                        <Badges badges={user.badges} size={18} className="shrink-0 flex-nowrap" />
                      </span>
                    </span>
                    <span className="text-ui text-primary-400 tabular text-right">
                      {t.number(user.followers || 0)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-4 pb-6 text-ui text-primary-400">
                {t(`compare.none.${active.key}`)}
              </p>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
