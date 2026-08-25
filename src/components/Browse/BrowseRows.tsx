import { Badges } from '@/components/User/Badges';
import { Avatar } from '@/components/UI/Avatar';
import { BrowseEntry } from '@/misc/browse';
import { getTranslator } from '@/i18n/dictionary';
import { Locale, localePath } from '@/i18n/locales';
import { Translator } from '@/i18n/translate';
import Link from 'next/link';
import { FC } from 'react';
import clsx from 'clsx';

type BrowseKind = 'channel' | 'account';

// rendered from both a server page and a client list, so it takes the locale
// rather than reaching for either half of the pair
const HEADS: Record<BrowseKind, [string, string, string, string?]> = {
  channel: ['browse.heads.channel', 'browse.heads.mods', 'browse.heads.vips', 'browse.heads.read'],
  account: ['browse.heads.account', 'browse.heads.modding', 'browse.heads.viping']
};

const Count: FC<{ value: number; tone: string; t: Translator }> = ({ value, tone, t }) => (
  <span className={clsx('text-ui tabular text-right', value > 0 ? tone : 'text-primary-400')}>
    {t.number(value)}
  </span>
);

export const BrowseRows: FC<{ kind: BrowseKind; items: BrowseEntry[]; locale: Locale }> = ({
  kind,
  items,
  locale
}) => {
  const t = getTranslator(locale);
  const cols = kind === 'channel' ? 'cols-channels' : 'cols-holders';
  const [first, second, third, fourth] = HEADS[kind];

  return (
    <div className="rows">
      <div className={`row-head ${cols}`}>
        <span>{t(first)}</span>
        <span className="text-right">{t(second)}</span>
        <span className="text-right">{t(third)}</span>
        {fourth && <span className="text-right">{t(fourth)}</span>}
      </div>

      {items.map((entry) => (
        <Link
          key={entry.id}
          href={localePath(locale, `/${kind === 'channel' ? 'channel' : 'user'}/${entry.login}`)}
          className={`row ${cols}`}
        >
          <span className="flex items-center gap-3.5 min-w-0">
            <Avatar
              src={entry.avatar}
              name={entry.name || entry.login}
              size={36}
              className="w-9 h-9"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2 min-w-0">
                <span className="row-name text-base font-bold truncate">
                  {entry.name || entry.login}
                </span>
                <Badges badges={entry.badges} size={18} />
              </span>
              <span className="block text-micro text-primary-400">
                {t.number(entry.followers || 0)}{' '}
                {t('misc.follower', { count: entry.followers || 0 })}
              </span>
            </span>
          </span>

          <Count value={entry.counts.mod} tone="text-mod" t={t} />
          <Count value={entry.counts.vip} tone="text-vip" t={t} />

          {kind === 'channel' && (
            <time
              dateTime={entry.updatedAt ? new Date(entry.updatedAt).toISOString() : undefined}
              suppressHydrationWarning
              className="text-ui text-primary-400 text-right"
            >
              {t.since(entry.updatedAt) || t('misc.notYet')}
            </time>
          )}
        </Link>
      ))}
    </div>
  );
};
