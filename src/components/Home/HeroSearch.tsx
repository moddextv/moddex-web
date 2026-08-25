'use client';

import { FC } from 'react';
import { useT } from '@/i18n/context';
import { LocaleLink } from '@/components/UI/LocaleLink';

import { SearchBox } from '@/components/Search/SearchBox';

const EXAMPLES = ['forsen', 'nymn', 'nightbot'];

export const HeroSearch: FC = () => {
  const t = useT();

  return (
    <div>
      {/* channel view, because a profile carries both directions as tabs and this
        one is the small list — /user/nightbot is 590k rows to land on by typo */}
      <SearchBox
        scope="channel"
        placeholder={t('home.searchPlaceholder')}
        label={t('misc.heroSearch')}
      />

      <p className="mt-4 hidden sm:flex items-center gap-2.5 flex-wrap text-ui text-primary-400">
        <span>{t('home.try')}</span>
        {EXAMPLES.map((login) => (
          <LocaleLink key={login} href={`/channel/${login}`} className="chip font-mono">
            {login}
          </LocaleLink>
        ))}
      </p>
    </div>
  );
};
