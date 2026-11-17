'use client';

import { localeFlag, Locale, swapLocale } from '@/i18n/locales';
import { useI18n } from '@/i18n/context';
import { preferredLocale, readLocaleChoice, rememberLocale } from '@/i18n/preferred';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { FC, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export interface LocaleHintCopy {
  text: string;
  switch: string;
  dismiss: string;
}

interface LocaleHintProps {
  hints: Record<Locale, LocaleHintCopy>;
}

export const LocaleHint: FC<LocaleHintProps> = ({ hints }) => {
  const { locale } = useI18n();
  const pathname = usePathname();
  const [target, setTarget] = useState<Locale | null>(null);

  // navigator and storage exist only in the browser, so this cannot render on the server
  useEffect(() => {
    if (readLocaleChoice()) return;

    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const preferred = preferredLocale(languages);

    setTarget(preferred && preferred !== locale ? preferred : null);
  }, [locale]);

  if (!target) return null;

  const copy = hints[target];

  const dismiss = () => {
    rememberLocale(locale);
    setTarget(null);
  };

  return (
    <aside className="locale-hint" lang={target} role="note">
      <Container className="locale-hint-inner">
        <Image
          src={localeFlag(target)}
          alt=""
          aria-hidden="true"
          width={20}
          height={14}
          radius="sm"
          className="locale-flag shrink-0"
        />
        <span className="text-ui text-primary-200">{copy.text}</span>
        <Link
          href={swapLocale(`${pathname}${window.location.search}`, target)}
          hrefLang={target}
          onClick={() => rememberLocale(target)}
          className="text-ui font-semibold text-mod hover:underline"
        >
          {copy.switch}
        </Link>
        <button type="button" onClick={dismiss} className="locale-hint-dismiss text-ui">
          {copy.dismiss}
        </button>
      </Container>
    </aside>
  );
};
