import { auth } from '@/auth';
import { NavSearch } from '@/components/Header/NavSearch';
import { ProfileDropdown } from '@/components/Header/ProfileDropdown';
import { ThemeToggle } from '@/components/Header/ThemeToggle';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { config } from '@/config';
import Link from 'next/link';

export const Header = async () => {
  const session = await auth();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="nav">
        <Container className="nav-inner">
          <Link
            href="/"
            className="brand text-primary-100"
            aria-label={`${config.brand.name} home`}
          >
            <Mark size={24} split />
            <span className="hidden sm:inline text-h3 font-extrabold">{config.brand.name}</span>
          </Link>

          <NavSearch />

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link href="/donate" className="hidden md:inline-flex btn btn-ghost">
              Donate
            </Link>
            <ThemeToggle />
            <ProfileDropdown session={session} />
          </div>
        </Container>
      </header>
    </>
  );
};
