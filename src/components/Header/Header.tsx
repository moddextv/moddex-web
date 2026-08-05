import { auth } from '@/auth';
import { Navigation } from '@/components/Header/Navigation';
import { ProfileDropdown } from '@/components/Header/ProfileDropdown';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { config } from '@/config';
import Link from 'next/link';

export const Header = async () => {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-primary-700 bg-primary-900/85 backdrop-blur-md">
      <Container className="flex items-center h-16 gap-8">
        {/* the lockup: mark + 12px gap + wordmark, per public/logo/README.md */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 text-primary-100 pressable"
          aria-label={`${config.brand.name} home`}
        >
          <Mark size={22} />
          <span className="font-cairo text-xl leading-none tracking-tight">
            {config.brand.name}
          </span>
        </Link>

        <Navigation />

        <div className="ml-auto flex items-center">
          <ProfileDropdown session={session} />
        </div>
      </Container>
    </header>
  );
};
