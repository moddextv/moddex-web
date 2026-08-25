import { getTranslator, Locale, localePath } from '@/i18n';
import { auth } from '@/auth';
import { NavLinks } from '@/components/Header/NavLinks';
import { NavMenu } from '@/components/Header/NavMenu';
import { SignInButton } from '@/components/Header/SignInButton';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { config } from '@/config';
import Link from 'next/link';

export const Header = async ({ locale }: { locale: Locale }) => {
  const session = await auth();
  const t = getTranslator(locale);

  return (
    <>
      <a href="#main" className="skip-link">
        {t('nav.skipToContent')}
      </a>

      <header className="nav">
        <Container className="nav-inner">
          <Link
            href={localePath(locale, '/')}
            className="brand text-primary-100"
            aria-label={`${config.brand.name} ${t('nav.home')}`}
          >
            <Mark size={24} split />
            <span className="hidden sm:inline text-h3 font-extrabold">{config.brand.name}</span>
          </Link>

          <NavLinks />

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {!session?.user && <SignInButton />}
            <NavMenu session={session} />
          </div>
        </Container>
      </header>
    </>
  );
};
