import { Locale, localePath } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { Avatar } from '@/components/UI/Avatar';
import type { Account, RoleScale } from '@/misc/account';
import Link from 'next/link';
import { FC } from 'react';

interface YourPlaceProps {
  you: Account;
  scale: RoleScale;
  tone: string;
  locale: Locale;
}

// a rank counts every account, so it is never printed as a place on this board
export const YourPlace: FC<YourPlaceProps> = ({ you, scale, tone, locale }) => {
  const t = getTranslator(locale);

  return (
    <Link
      href={localePath(locale, `/user/${you.login}`)}
      className="row your-place mx-2 mb-3"
      style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}
    >
      <span className="flex items-center gap-3.5 min-w-0">
        <span className="chip text-meta font-bold shrink-0">{t('leaderboard.you')}</span>
        <Avatar src={you.avatar} name={you.name || you.login} size={36} className="w-9 h-9" />
        <span className="min-w-0">
          <span className="block row-name text-base font-bold truncate">
            {you.name || you.login}
          </span>
          <span className="block text-micro text-primary-400">
            {scale.rank
              ? t('leaderboard.yourRank', {
                  rank: t.number(scale.rank),
                  of: t.number(scale.of ?? scale.rank)
                })
              : t('leaderboard.notRanked')}
          </span>
        </span>
      </span>

      <span className={`text-ui tabular text-right ${tone}`}>{t.number(scale.count)}</span>
    </Link>
  );
};
